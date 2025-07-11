import { INewsAggregationService } from "../repository/interfaces";
import { TYPES } from "../config/types";
import { inject, injectable } from "inversify";
import type { IConfigService, IRedisService } from "../repository/interfaces";
import { RssFeedItem } from "../../schemas/validation.schemas";
import { RedisKeys } from "../../utils/redis-keys.util";
import NewsAPI from 'newsapi';
import Parser from 'rss-parser';

@injectable()
export class NewsAggregationService implements INewsAggregationService {
    private newsApi: NewsAPI;
    private rssParser: Parser;
    
    constructor(
        @inject(TYPES.ConfigService) private configService: IConfigService,
        @inject(TYPES.RedisService) private redisService: IRedisService
    ) {
        // Initialize NewsAPI with API key from config
        this.newsApi = new NewsAPI(this.configService.getNewsApiKey() || '');
        
        // Initialize RSS parser with custom fields
        this.rssParser = new Parser({
            timeout: 10000,
            customFields: {
                item: [
                    ['content:encoded', 'contentEncoded'],
                    ['dc:creator', 'creator'],
                    ['media:content', 'mediaContent']
                ]
            }
        });
    }

    async fetchRssFeeds(): Promise<RssFeedItem[]> {
        try {
            const allItems: RssFeedItem[] = [];
            
            // Fetch from NewsAPI
            const newsApiItems = await this.fetchFromNewsAPI();
            allItems.push(...newsApiItems);
            
            // Fetch from RSS feeds
            const rssItems = await this.fetchFromRSSFeeds();
            allItems.push(...rssItems);
            
            return allItems;
        } catch (error) {
            console.error('Error fetching feeds:', error);
            return [];
        }
    }

    private async fetchFromNewsAPI(): Promise<RssFeedItem[]> {
        try {
            const apiKey = this.configService.getNewsApiKey();
            
            // Skip NewsAPI if no API key is configured
            if (!apiKey || apiKey.trim() === '') {
                console.log('NewsAPI key not configured, skipping NewsAPI fetch');
                return [];
            }

            // Fetch economic news from reliable business sources
            // Using valid NewsAPI source IDs for business and financial news
            const response = await this.newsApi.v2.everything({
                q: 'economy OR finance OR market OR GDP OR inflation OR economic OR financial OR stocks OR bonds OR banking OR monetary OR fiscal',
                sources: 'bloomberg,business-insider,fortune,the-wall-street-journal,australian-financial-review,financial-post,reuters',
                language: 'en',
                sortBy: 'publishedAt',
                pageSize: 50
            });

            // Convert NewsAPI articles to RssFeedItem format
            return response.articles.map(article => ({
                url: article.url,
                title: article.title,
                description: article.description || '',
                link: article.url,
                pubDate: new Date(article.publishedAt),
                content: article.content || article.description || ''
            }));
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error fetching from NewsAPI:', error.message);
                
                // Try fallback approach if sources fail
                if (error.message.includes('sourceDoesNotExist')) {
                    console.log('Trying fallback approach with general business category...');
                    try {
                        const fallbackResponse = await this.newsApi.v2.topHeadlines({
                            category: 'business',
                            language: 'en',
                            pageSize: 30,
                            q: 'economy OR finance OR market'
                        });
                        
                        return fallbackResponse.articles.map(article => ({
                            url: article.url,
                            title: article.title,
                            description: article.description || '',
                            link: article.url,
                            pubDate: new Date(article.publishedAt),
                            content: article.content || article.description || ''
                        }));
                    } catch (fallbackError) {
                        console.error('Fallback NewsAPI request also failed:', fallbackError);
                    }
                } else if (error.message.includes('apiKeyInvalid')) {
                    console.log('Tip: Check your NewsAPI key configuration');
                } else if (error.message.includes('rateLimited')) {
                    console.log('Tip: NewsAPI rate limit reached, consider upgrading your plan');
                }
            } else {
                console.error('Unknown error fetching from NewsAPI:', error);
            }
            return [];
        }
    }

    private async fetchFromRSSFeeds(): Promise<RssFeedItem[]> {
        try { 
            const rssUrls = this.configService.getRssFeedUrls();
            if (rssUrls.length === 0) {
                console.log('No RSS feed URLs configured');
                return [];
            }

            const allItems: RssFeedItem[] = [];
            
            // Fetch from each RSS feed in parallel with timeout handling
            const fetchPromises = rssUrls.map(async (url) => {
                try {
                    console.log(`Fetching RSS feed: ${url}`);
                    const feed = await this.rssParser.parseURL(url);
                    
                    return feed.items.map(item => ({
                        url: item.link || item.guid || '',
                        title: item.title || 'Untitled',
                        description: item.contentSnippet || item.content || item.description || '',
                        link: item.link || item.guid || '',
                        pubDate: item.isoDate ? new Date(item.isoDate) : 
                                item.pubDate ? new Date(item.pubDate) : new Date(),
                        content: item['content:encoded'] || item.content || item.contentSnippet || item.description || ''
                    }));
                } catch (error) {
                    console.error(`Error fetching RSS feed ${url}:`, error);
                    return [];
                }
            });

            const results = await Promise.allSettled(fetchPromises);
            
            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    allItems.push(...result.value);
                    console.log(`Successfully fetched ${result.value.length} items from RSS feed ${rssUrls[index]}`);
                } else {
                    console.error(`Failed to fetch RSS feed ${rssUrls[index]}:`, result.reason);
                }
            });

            return allItems;
        } catch (error) {
            console.error('Error fetching RSS feeds:', error);
            return [];
        }
    }

    async filterEconomicNews(items: RssFeedItem[]): Promise<RssFeedItem[]> {
        // Filter news items that are relevant to economics
        const economicKeywords = [
            'economy', 'economic', 'finance', 'financial', 'market', 'markets',
            'GDP', 'inflation', 'recession', 'growth', 'trade', 'investment',
            'banking', 'currency', 'monetary', 'fiscal', 'stocks', 'bonds'
        ];

        return items.filter(item => {
            const text = `${item.title} ${item.description} ${item.content}`.toLowerCase();
            return economicKeywords.some(keyword => text.includes(keyword));
        });
    }

    async deduplicateNews(items: RssFeedItem[]): Promise<RssFeedItem[]> {
        // Enhanced deduplication using multiple strategies
        const uniqueItems: RssFeedItem[] = [];
        const seenUrls = new Set<string>();
        const seenTitles = new Set<string>();

        // Sort by publication date (newest first)
        const sortedItems = items.sort((a, b) => {
            const dateA = a.pubDate?.getTime() || 0;
            const dateB = b.pubDate?.getTime() || 0;
            return dateB - dateA;
        });

        for (const item of sortedItems) {
            // Skip if URL already seen
            if (seenUrls.has(item.url)) {
                continue;
            }

            // Create normalized title for similarity check
            const normalizedTitle = item.title.toLowerCase()
                .replace(/[^\w\s]/g, ' ') // Remove punctuation
                .replace(/\s+/g, ' ') // Normalize whitespace
                .trim();

            // Extract significant words (longer than 3 characters)
            const titleWords = normalizedTitle.split(' ')
                .filter(word => word.length > 3)
                .slice(0, 8); // Use first 8 significant words

            const titleKey = titleWords.join(' ');

            // Skip if similar title already seen
            let isDuplicate = false;
            for (const seenTitle of seenTitles) {
                const similarity = this.calculateSimilarity(titleKey, seenTitle);
                if (similarity > 0.8) { // 80% similarity threshold
                    isDuplicate = true;
                    break;
                }
            }

            if (!isDuplicate) {
                seenUrls.add(item.url);
                seenTitles.add(titleKey);
                uniqueItems.push(item);
            }
        }

        console.log(`Deduplicated ${items.length} items to ${uniqueItems.length} unique items`);
        return uniqueItems;
    }

    private calculateSimilarity(str1: string, str2: string): number {
        // Simple Jaccard similarity for title comparison
        const set1 = new Set(str1.split(' '));
        const set2 = new Set(str2.split(' '));
        
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        
        return intersection.size / union.size;
    }

    async categorizeNews(items: RssFeedItem[]): Promise<RssFeedItem[]> {
        // Add categories to news items
        return items.map(item => {
            const text = `${item.title} ${item.description}`.toLowerCase();
            
            let category = 'general';
            if (text.includes('market') || text.includes('stock') || text.includes('trading')) {
                category = 'markets';
            } else if (text.includes('policy') || text.includes('government') || text.includes('regulation')) {
                category = 'policy';
            } else if (text.includes('global') || text.includes('international') || text.includes('trade')) {
                category = 'global';
            } else if (text.includes('tech') || text.includes('technology') || text.includes('digital')) {
                category = 'tech';
            } else if (text.includes('crypto') || text.includes('bitcoin') || text.includes('blockchain')) {
                category = 'crypto';
            }

            return {
                ...item,
                category
            };
        });
    }

    async storeNews(items: RssFeedItem[]): Promise<void> {
        try {
            const redis = await this.redisService.getClient();
            if (!redis) {
                console.warn('Redis not available, skipping news storage');
                return;
            }

            if (items.length === 0) {
                console.log('No news items to store');
                return;
            }

            const timestamp = Date.now();
            const today = new Date();

            // Prepare batch operations
            const batchOperations: Array<{key: string, value: string, ttl?: number}> = [];

            // Store individual news items
            for (const item of items) {
                const itemKey = RedisKeys.newsItem(item.url);
                const newsData = {
                    ...item,
                    fetchedAt: timestamp,
                    fetchDate: today.toISOString().split('T')[0]
                };
                batchOperations.push({
                    key: itemKey,
                    value: JSON.stringify(newsData)
                });
            }

            // Store aggregated list by date (URLs only)
            const dailyKey = RedisKeys.dailyNews(today);
            const urlList = items.map(item => item.url);
            batchOperations.push({
                key: dailyKey,
                value: JSON.stringify(urlList)
            });

            // Store summary statistics
            const statsKey = RedisKeys.newsStats(today);
            const stats = {
                totalItems: items.length,
                sources: [...new Set(items.map(item => {
                    try {
                        return new URL(item.url).hostname;
                    } catch {
                        return 'unknown';
                    }
                }))],
                categories: [...new Set(items.map(item => (item as any).category).filter(Boolean))],
                fetchedAt: timestamp,
                date: today.toISOString().split('T')[0]
            };
            batchOperations.push({
                key: statsKey,
                value: JSON.stringify(stats)
            });

            // Store existence marker
            const existsKey = RedisKeys.dailyNewsExists();
            batchOperations.push({
                key: existsKey,
                value: 'true',
                ttl: 3600 // 1 hour
            });

            // Execute batch operations
            await RedisKeys.batchSet(redis, batchOperations);

            console.log(`Stored ${items.length} news items in Redis for date ${today.toISOString().split('T')[0]}`);
        } catch (error) {
            console.error('Error storing news:', error);
            throw error;
        }
    }

    async getCachedNews(date?: string): Promise<RssFeedItem[]> {
        try {
            const redis = await this.redisService.getClient();
            if (!redis) {
                console.warn('Redis not available');
                return [];
            }

            const targetDate = date ? new Date(date) : new Date();
            const dailyKey = RedisKeys.dailyNews(targetDate);
            
            // Check if daily news exists first
            const exists = await RedisKeys.keyExists(redis, dailyKey);
            if (!exists) {
                console.log(`No cached news found for date ${targetDate.toISOString().split('T')[0]}`);
                return [];
            }

            const urlListStr = await redis.get(dailyKey);
            if (!urlListStr) {
                console.log(`Daily news key exists but no data for date ${targetDate.toISOString().split('T')[0]}`);
                return [];
            }

            const urls: string[] = JSON.parse(urlListStr);
            if (urls.length === 0) {
                console.log(`No URLs found in daily news for date ${targetDate.toISOString().split('T')[0]}`);
                return [];
            }

            // Get multiple news items efficiently
            const itemKeys = urls.map(url => RedisKeys.newsItem(url));
            const results = await RedisKeys.getMultipleKeys(redis, itemKeys);
            
            const items: RssFeedItem[] = [];
            let successCount = 0;
            let errorCount = 0;

            Object.entries(results).forEach(([key, value]) => {
                if (value) {
                    try {
                        const newsData = JSON.parse(value);
                        items.push({
                            url: newsData.url,
                            title: newsData.title,
                            description: newsData.description,
                            link: newsData.link,
                            pubDate: new Date(newsData.pubDate),
                            content: newsData.content
                        });
                        successCount++;
                    } catch (parseError) {
                        console.error('Error parsing cached news item:', parseError);
                        errorCount++;
                    }
                } else {
                    errorCount++;
                }
            });

            console.log(`Retrieved ${successCount} cached news items for date ${targetDate.toISOString().split('T')[0]} (${errorCount} failed)`);
            return items;
        } catch (error) {
            console.error('Error retrieving cached news:', error);
            return [];
        }
    }

    async getNewsStats(date?: string): Promise<any> {
        try {
            const redis = await this.redisService.getClient();
            if (!redis) {
                console.warn('Redis not available');
                return null;
            }

            const targetDate = date ? new Date(date) : new Date();
            const statsKey = RedisKeys.newsStats(targetDate);
            
            // Check if stats exist first
            const exists = await RedisKeys.keyExists(redis, statsKey);
            if (!exists) {
                console.log(`No stats found for date ${targetDate.toISOString().split('T')[0]}`);
                return null;
            }
            
            const statsStr = await redis.get(statsKey);
            if (!statsStr) {
                console.log(`Stats key exists but no data for date ${targetDate.toISOString().split('T')[0]}`);
                return null;
            }

            const stats = JSON.parse(statsStr);
            console.log(`Retrieved stats for date ${targetDate.toISOString().split('T')[0]}: ${stats.totalItems} items`);
            return stats;
        } catch (error) {
            console.error('Error retrieving news stats:', error);
            return null;
        }
    }

    /**
     * Check if news exists for a specific date without fetching
     */
    async hasNewsForDate(date?: Date): Promise<boolean> {
        try {
            const redis = await this.redisService.getClient();
            if (!redis) {
                return false;
            }

            const existsKey = RedisKeys.dailyNewsExists();
            
            return await RedisKeys.keyExists(redis, existsKey);
        } catch (error) {
            console.error('Error checking if news exists:', error);
            return false;
        }
    }

    /**
     * Get cached processed news (filtered, deduplicated, categorized)
     */
    async getCachedProcessedNews(type: 'filtered' | 'deduplicated' | 'categorized', date?: Date): Promise<RssFeedItem[]> {
        try {
            const redis = await this.redisService.getClient();
            if (!redis) {
                return [];
            }

            const targetDate = date || new Date();
            const processedKey = RedisKeys.processedNews(type, targetDate);
            
            const exists = await RedisKeys.keyExists(redis, processedKey);
            if (!exists) {
                console.log(`No cached ${type} news found for date ${targetDate.toISOString().split('T')[0]}`);
                return [];
            }

            const processedData = await redis.get(processedKey);
            if (!processedData) {
                return [];
            }

            const items = JSON.parse(processedData);
            console.log(`Retrieved ${items.length} cached ${type} news items`);
            return items;
        } catch (error) {
            console.error(`Error retrieving cached ${type} news:`, error);
            return [];
        }
    }

    /**
     * Store processed news (filtered, deduplicated, categorized)
     */
    async storeProcessedNews(items: RssFeedItem[], type: 'filtered' | 'deduplicated' | 'categorized', date?: Date): Promise<void> {
        try {
            const redis = await this.redisService.getClient();
            if (!redis || items.length === 0) {
                return;
            }

            const targetDate = date || new Date();
            const processedKey = RedisKeys.processedNews(type, targetDate);
            
            await RedisKeys.setWithTTL(redis, processedKey, JSON.stringify(items));
            console.log(`Stored ${items.length} ${type} news items for date ${targetDate.toISOString().split('T')[0]}`);
        } catch (error) {
            console.error(`Error storing ${type} news:`, error);
        }
    }
}