import { generateObject, generateText } from "ai";
import { google } from "@ai-sdk/google";
import type { IRedisService, IAIContentService } from "../repository/interfaces";
import { TYPES } from "../config/types";
import { injectable, inject } from "inversify";
import { RssFeedItem, NewsletterContent, NewsArticle, newsArticleSchema, newsletterContentSchema, dailyNewsContentSchema, DailyNewsContent } from "../../schemas/validation.schemas";
import { PromptFormatter } from "../../config/prompt.config";
import { RedisKeys } from "../../utils/redis-keys.util";

/****
 * AI Content Service Implementation
 * This service uses AI to generate newsletter content, summarize articles, and moderate content.
 * It integrates with Google AI for content generation and uses Redis for caching.
 * Gets the content from the Redis cache if available, otherwise uses the news service.
 */

@injectable()
export class AIContentService implements IAIContentService {
    private model: any;
    
    constructor(
        @inject(TYPES.RedisService) private redisService: IRedisService
    ) {
        // Initialize Google AI model
        try {
            this.model = google('gemini-2.0-flash',{useSearchGrounding: true});
            console.log('Google AI model initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Google AI model:', error);
            throw new Error('Failed to initialize AI model');
        }
    }

    /**
     * Generate newsletter content using either cached content or fresh news API data
     */
    async generateNewsletterContent(newsItems: RssFeedItem[], type: "weekly_preview" | "weekly_review"): Promise<NewsletterContent> {
        try {
            console.log(`🤖 Starting ${type} generation from ${newsItems.length} news items...`);
            
            // Check Redis cache first using centralized key management
            const cacheKey = RedisKeys.newsletter(type);
            const redis = await this.redisService.getClient();
            
            if (redis) {
                const cached = await redis.get(cacheKey);
                if (cached) {
                    console.log('Returning cached newsletter content');
                    return JSON.parse(cached);
                }
            }

            // Get formatted prompt for newsletter generation
            const promptTemplate = PromptFormatter.getNewsletterPrompt(newsItems, type);
            console.log('📝 Prompt template generated, calling AI model...');

            // Generate structured newsletter content
            const { object: newsletter } = await generateObject({
                model: this.model,
                system: promptTemplate.systemPrompt,
                prompt: promptTemplate.userPrompt,
                schema: newsletterContentSchema,
                temperature: promptTemplate.temperature || 0.7,
                maxTokens: promptTemplate.maxTokens || 2500,
            });

            console.log('✅ AI model generated newsletter successfully');
            console.log('📋 Newsletter structure:', {
                title: newsletter.title?.substring(0, 50) + '...',
                contentLength: newsletter.content?.length,
                sourcesCount: newsletter.sources?.length,
                type: newsletter.type
            });

            // Cache the result using centralized key management
            if (redis) {
                await RedisKeys.setWithTTL(redis, cacheKey, JSON.stringify(newsletter));
                console.log('💾 Newsletter cached successfully');
            }

            console.log(`🎉 Generated new ${type} newsletter content`);
            return newsletter;
        } catch (error) {
            console.error(`❌ Error generating ${type} newsletter content:`, error);
            console.error('Error details:', {
                name: error instanceof Error ? error.name : 'Unknown',
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
            
            // If it's a schema validation error, provide more details
            if (error instanceof Error && error.message.includes('schema')) {
                console.error('🚨 Schema validation failed. This usually means the AI response format is incorrect.');
                console.error('💡 Check that the prompt is requesting JSON format and the schema matches the expected structure.');
            }
            
            // Fallback to basic newsletter structure
            console.log('🔄 Falling back to basic newsletter structure');
            const fallbackNewsletter = this.createFallbackNewsletter(newsItems, type);
            console.log('✅ Fallback newsletter structure created successfully');
            return fallbackNewsletter;
        }
    }

    /**
     * Summarize news articles into a concise summary
     */
    async summarizeArticles(articles: RssFeedItem[]): Promise<string> {
        try {
            if (articles.length === 0) {
                return 'No articles available for summarization.';
            }

            // Check cache first using centralized key management
            const cacheKey = RedisKeys.summary(articles);
            const redis = await this.redisService.getClient();
            
            if (redis) {
                const cached = await redis.get(cacheKey);
                if (cached) {
                    console.log('Returning cached article summary');
                    return cached;
                }
            }

            // Get formatted prompt for summarization
            const promptTemplate = PromptFormatter.getSummarizationPrompt(articles);

            // Generate summary
            const { text: summary } = await generateText({
                model: this.model,
                system: promptTemplate.systemPrompt,
                prompt: promptTemplate.userPrompt,
                temperature: promptTemplate.temperature || 0.3,
                maxTokens: promptTemplate.maxTokens || 1000,
            });

            // Cache the result using centralized key management
            if (redis) {
                await RedisKeys.setWithTTL(redis, cacheKey, summary);
            }

            console.log('Generated new article summary');
            return summary;
        } catch (error) {
            console.error('Error summarizing articles:', error);
            throw new Error('Failed to summarize articles');
        }
    }

    /**
     * Generate a comprehensive news article for blog publication
     */
    async generateArticle(articles: RssFeedItem[]): Promise<NewsArticle> {
        try {
            if (articles.length === 0) {
                throw new Error('No articles provided for generation');
            }

            // Check cache first using centralized key management
            const cacheKey = RedisKeys.generatedArticle(articles);
            const redis = await this.redisService.getClient();
            
            if (redis) {
                const cached = await redis.get(cacheKey);
                if (cached) {
                    console.log('Returning cached generated article');
                    return JSON.parse(cached);
                }
            }

            // Get formatted prompt for article generation
            const promptTemplate = PromptFormatter.getArticleGenerationPrompt(articles);

            // Generate structured article
            const { object: article } = await generateObject({
                model: this.model,
                system: promptTemplate.systemPrompt,
                prompt: promptTemplate.userPrompt,
                schema: newsArticleSchema,
                temperature: promptTemplate.temperature || 0.7,
                maxTokens: promptTemplate.maxTokens || 1500,
            });

            // Cache the result using centralized key management
            if (redis) {
                await RedisKeys.setWithTTL(redis, cacheKey, JSON.stringify(article));
            }

            console.log('Generated new article');
            return article;
        } catch (error) {
            console.error('Error generating article:', error);
            throw new Error('Failed to generate article');
        }
    }

    /**
     * Generate compelling headlines for content
     */
    async generateHeadlines(content: string): Promise<string[]> {
        try {
            if (!content || content.trim().length === 0) {
                return ['Economic Update', 'Market Analysis', 'Weekly Review', 'Business Insights', 'Financial News'];
            }

            // Check cache first using centralized key management
            const cacheKey = RedisKeys.headlines(content);
            const redis = await this.redisService.getClient();
            
            if (redis) {
                const cached = await redis.get(cacheKey);
                if (cached) {
                    console.log('Returning cached headlines');
                    return JSON.parse(cached);
                }
            }

            // Get formatted prompt for headline generation
            const promptTemplate = PromptFormatter.getHeadlinePrompt(content);

            // Generate headlines
            const { text: headlinesText } = await generateText({
                model: this.model,
                system: promptTemplate.systemPrompt,
                prompt: promptTemplate.userPrompt,
                temperature: promptTemplate.temperature || 0.8,
                maxTokens: promptTemplate.maxTokens || 200,
            });

            // Parse headlines from response (expecting numbered list)
            const headlines = headlinesText
                .split('\n')
                .filter(line => line.trim().length > 0)
                .map(line => line.replace(/^\d+\.\s*/, '').trim())
                .filter(headline => headline.length > 0)
                .slice(0, 5); // Ensure we only return 5 headlines

            // Fallback if parsing fails
            if (headlines.length === 0) {
                return ['Economic Update', 'Market Analysis', 'Weekly Review', 'Business Insights', 'Financial News'];
            }

            // Cache the result using centralized key management
            if (redis) {
                await RedisKeys.setWithTTL(redis, cacheKey, JSON.stringify(headlines));
            }

            console.log('Generated new headlines');
            return headlines;
        } catch (error) {
            console.error('Error generating headlines:', error);
            // Return fallback headlines
            return ['Economic Update', 'Market Analysis', 'Weekly Review', 'Business Insights', 'Financial News'];
        }
    }

    /**
     * Moderate content for appropriateness and accuracy
     */
    async moderateContent(content: string): Promise<{ approved: boolean; reason?: string }> {
        try {
            if (!content || content.trim().length === 0) {
                return { approved: false, reason: 'Content is empty or invalid' };
            }

            // Check cache first using centralized key management
            const cacheKey = RedisKeys.moderation(content);
            const redis = await this.redisService.getClient();
            
            if (redis) {
                const cached = await redis.get(cacheKey);
                if (cached) {
                    console.log('Returning cached moderation result');
                    return JSON.parse(cached);
                }
            }

            // Get formatted prompt for content moderation
            const promptTemplate = PromptFormatter.getModerationPrompt(content);

            // Generate moderation assessment
            const { text: moderationResult } = await generateText({
                model: this.model,
                system: promptTemplate.systemPrompt,
                prompt: promptTemplate.userPrompt,
                temperature: promptTemplate.temperature || 0.1,
                maxTokens: promptTemplate.maxTokens || 300,
            });

            // Parse the moderation result
            const approved = moderationResult.toLowerCase().includes('yes') || 
                           moderationResult.toLowerCase().includes('approved');
            
            let reason: string | undefined;
            if (!approved) {
                // Extract reason from the response
                const lines = moderationResult.split('\n').filter(line => line.trim().length > 0);
                reason = lines.find(line => 
                    line.toLowerCase().includes('concern') || 
                    line.toLowerCase().includes('issue') ||
                    line.toLowerCase().includes('problem')
                ) || 'Content does not meet professional standards';
            }

            const result = { approved, reason };

            // Cache the result using centralized key management
            if (redis) {
                await RedisKeys.setWithTTL(redis, cacheKey, JSON.stringify(result));
            }

            console.log('Generated new moderation result');
            return result;
        } catch (error) {
            console.error('Error moderating content:', error);
            // Default to not approved if moderation fails
            return { approved: false, reason: 'Moderation service temporarily unavailable' };
        }
    }

    /**
     * Generate daily news content for quick consumption
     */
    async generateDailyNewsContent(newsItems: RssFeedItem[], date?: Date): Promise<DailyNewsContent> {
        try {
            console.log(`Starting daily news content generation with ${newsItems.length} news items`);
            
            if (newsItems.length === 0) {
                console.log('No news items provided, returning empty digest');
                return {
                    title: 'No News Available',
                    summary: 'No economic news items were available for today.',
                    topStories: [],
                    marketHighlights: [],
                    economicIndicators: [],
                    generatedAt: new Date().toISOString()
                };
            }

            // Check cache first using centralized key management
            const targetDate = date || new Date();
            const dateStr = targetDate.toISOString().split('T')[0];
            const cacheKey = RedisKeys.dailyDigest(targetDate);
            const redis = await this.redisService.getClient();
            
            console.log(`Cache key: ${cacheKey}, Date: ${dateStr}`);
            
            if (redis) {
                const cached = await redis.get(cacheKey);
                if (cached) {
                    console.log(`Returning cached daily news content for ${dateStr}`);
                    return JSON.parse(cached);
                }
            }

            // Get formatted prompt for daily news generation
            console.log('Getting prompt template for daily news generation...');
            const promptTemplate = PromptFormatter.getDailyNewsPrompt(newsItems, dateStr);
            console.log('Prompt template generated successfully');

            // Generate structured daily news content
            console.log('Calling AI model to generate daily content...');
            const { object: dailyContent } = await generateObject({
                model: this.model,
                system: promptTemplate.systemPrompt,
                prompt: promptTemplate.userPrompt,
                schema: dailyNewsContentSchema,
                temperature: promptTemplate.temperature || 0.7,
                maxTokens: promptTemplate.maxTokens || 2000,
            });
            console.log('AI model response received successfully');

            // Add generation timestamp
            const result = {
                ...dailyContent,
                generatedAt: new Date().toISOString()
            };

            // Cache the result using centralized key management (cache for 8 hours)
            if (redis) {
                await RedisKeys.setWithTTL(redis, cacheKey, JSON.stringify(result), 28800);
                console.log('Result cached successfully');
            }

            console.log(`Generated new daily news content for ${dateStr}`);
            return result;
        } catch (error) {
            console.error('Error generating daily news content:', error);
            console.error('Error details:', {
                name: error instanceof Error ? error.name : 'Unknown',
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
            throw new Error(`Failed to generate daily news content: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Fallback method to create a basic newsletter structure if AI generation fails
     */
    private createFallbackNewsletter(newsItems: RssFeedItem[], type: "weekly_preview" | "weekly_review"): NewsletterContent {
        const now = new Date();
        const title = type === 'weekly_preview' 
            ? `Economic Preview - Week of ${now.toLocaleDateString()}`
            : `Economic Review - Week of ${now.toLocaleDateString()}`;
            
        const sources = newsItems.slice(0, 10).map(item => ({
            title: item.title?.substring(0, 200) || 'Economic News',
            url: item.link || '#',
            publishedAt: item.pubDate || now,
            source: item.description?.substring(0, 100) || 'News Source'
        }));

        const content = type === 'weekly_preview'
            ? this.generatePreviewContent(newsItems)
            : this.generateReviewContent(newsItems);

        return {
            title,
            content,
            summary: `${type === 'weekly_preview' ? 'Preview' : 'Review'} of key economic developments and market trends.`,
            type,
            publishDate: now,
            sources
        };
    }

    private generatePreviewContent(newsItems: RssFeedItem[]): string {
        const headlines = newsItems.slice(0, 5).map(item => `• ${item.title}`).join('\n');
        
        return `# Economic Preview\n\n## Key Headlines to Watch:\n\n${headlines}\n\n## Market Outlook:\n\nBased on current news trends, markets are expected to focus on economic developments and policy changes. Key areas to monitor include inflation indicators, central bank communications, and geopolitical developments.\n\n## This Week's Focus:\n\n• Economic data releases\n• Corporate earnings reports\n• Policy announcements\n• Market trends and analysis\n\nStay informed with The Economist Newsletter for comprehensive economic insights.`;
    }

    private generateReviewContent(newsItems: RssFeedItem[]): string {
        const headlines = newsItems.slice(0, 5).map(item => `• ${item.title}`).join('\n');
        
        return `# Economic Review\n\n## This Week's Key Developments:\n\n${headlines}\n\n## Market Performance:\n\nThe week saw various economic developments affecting global markets. Key themes included monetary policy discussions, economic data releases, and corporate performance updates.\n\n## Week's Highlights:\n\n• Economic indicators and trends\n• Central bank activities\n• Market movements and analysis\n• Policy developments\n\nFor detailed economic analysis, continue following The Economist Newsletter.`;
    }

}
