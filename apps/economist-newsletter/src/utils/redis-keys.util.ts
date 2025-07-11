/**
 * Redis Key Utility
 * Centralized management of Redis keys to ensure consistency and avoid key conflicts
 */

export class RedisKeys {
    // Base prefixes for different data types
    private static readonly NEWS_PREFIX = 'news';
    private static readonly AI_PREFIX = 'ai';
    private static readonly CACHE_PREFIX = 'cache';
    
    // Date format for consistent key generation
    private static getDateString(date?: Date): string {
        return (date || new Date()).toISOString().split('T')[0]; // YYYY-MM-DD
    }

    // Hash function for content-based keys
    private static hashContent(content: string, length: number = 10): string {
        return Buffer.from(content).toString('base64').slice(0, length).replace(/[+/=]/g, '');
    }

    // Generate URL-based hash for news items
    private static hashUrl(url: string): string {
        return Buffer.from(url).toString('base64').replace(/[+/=]/g, '');
    }

    // ===== NEWS AGGREGATION KEYS =====
    
    /**
     * Key for individual news items
     */
    static newsItem(url: string): string {
        return `${this.NEWS_PREFIX}:item:${this.hashUrl(url)}`;
    }

    /**
     * Key for daily news list (URLs only)
     */
    static dailyNews(date?: Date): string {
        return `${this.NEWS_PREFIX}:daily:${this.getDateString(date)}`;
    }

    /**
     * Key for daily news statistics
     */
    static newsStats(date?: Date): string {
        return `${this.NEWS_PREFIX}:stats:${this.getDateString(date)}`;
    }

    /**
     * Key for processed/filtered news by type
     */
    static processedNews(type: 'filtered' | 'deduplicated' | 'categorized', date?: Date): string {
        return `${this.NEWS_PREFIX}:${type}:${this.getDateString(date)}`;
    }

    /**
     * Check if daily news exists
     */
    static dailyNewsExists(): string {
        return `${this.NEWS_PREFIX}:exists:${this.getDateString()}`;
    }

    // ===== AI CONTENT KEYS =====

    /**
     * Key for newsletter content cache
     */
    static newsletter(type: 'weekly_preview' | 'weekly_review', date?: Date): string {
        return `${this.AI_PREFIX}:newsletter:${type}:${this.getDateString(date)}`;
    }

    /**
     * Key for article summaries
     */
    static summary(articles: Array<{url: string}>): string {
        const articleHashes = articles.map(a => this.hashContent(a.url, 6)).join('');
        const combinedHash = this.hashContent(articleHashes, 12);
        return `${this.AI_PREFIX}:summary:${combinedHash}`;
    }

    /**
     * Key for generated articles
     */
    static generatedArticle(articles: Array<{url: string}>): string {
        const articleHashes = articles.map(a => this.hashContent(a.url, 6)).join('');
        const combinedHash = this.hashContent(articleHashes, 12);
        return `${this.AI_PREFIX}:article:${combinedHash}`;
    }

    /**
     * Key for generated headlines
     */
    static headlines(content: string): string {
        const contentHash = this.hashContent(content.slice(0, 200), 12);
        return `${this.AI_PREFIX}:headlines:${contentHash}`;
    }

    /**
     * Key for content moderation results
     */
    static moderation(content: string): string {
        const contentHash = this.hashContent(content, 16);
        return `${this.AI_PREFIX}:moderation:${contentHash}`;
    }

    /**
     * Key for daily news digest
     */
    static dailyDigest(date?: Date): string {
        return `${this.AI_PREFIX}:digest:${this.getDateString(date)}`;
    }

    // ===== CACHE MANAGEMENT KEYS =====

    /**
     * Key for tracking cached content types
     */
    static cacheIndex(type: 'news' | 'ai' | 'newsletter'): string {
        return `${this.CACHE_PREFIX}:index:${type}`;
    }

    /**
     * Key for cache metadata (TTL, creation time, etc.)
     */
    static cacheMetadata(key: string): string {
        return `${this.CACHE_PREFIX}:meta:${this.hashContent(key, 8)}`;
    }

    // ===== UTILITY METHODS =====

    /**
     * Get all news-related keys for a specific date
     */
    static getAllNewsKeys(date?: Date): string[] {
        return [
            this.dailyNews(date),
            this.newsStats(date),
            this.processedNews('filtered', date),
            this.processedNews('deduplicated', date),
            this.processedNews('categorized', date),
        ];
    }

    /**
     * Get cache TTL values for different content types
     */
    static getTTL(keyType: string): number {
        const ttlMap: Record<string, number> = {
            // News keys
            'news:item': 86400 * 7,        // 7 days
            'news:daily': 86400 * 3,       // 3 days
            'news:stats': 86400 * 7,       // 7 days
            'news:processed': 86400 * 2,   // 2 days
            'news:exists': 3600,           // 1 hour
            
            // AI content keys
            'ai:newsletter': 21600,        // 6 hours
            'ai:summary': 86400,           // 24 hours
            'ai:article': 86400,           // 24 hours
            'ai:headlines': 43200,         // 12 hours
            'ai:moderation': 3600,         // 1 hour
            'ai:digest': 28800,            // 8 hours
            
            // Default
            'default': 3600                // 1 hour
        };

        // Find matching TTL based on key prefix
        for (const [prefix, ttl] of Object.entries(ttlMap)) {
            if (keyType.startsWith(prefix)) {
                return ttl;
            }
        }
        
        return ttlMap.default;
    }

    /**
     * Check if a key pattern exists before attempting operations
     */
    static async keyExists(redis: any, keyPattern: string): Promise<boolean> {
        try {
            const result = await redis.exists(keyPattern);
            return result === 1;
        } catch (error) {
            console.error('Error checking key existence:', error);
            return false;
        }
    }

    /**
     * Get multiple keys with existence check
     */
    static async getMultipleKeys(redis: any, keys: string[]): Promise<Record<string, string | null>> {
        try {
            const pipeline = redis.pipeline();
            keys.forEach(key => pipeline.get(key));
            
            const results = await pipeline.exec();
            const resultMap: Record<string, string | null> = {};
            
            keys.forEach((key, index) => {
                resultMap[key] = results?.[index]?.[1] || null;
            });
            
            return resultMap;
        } catch (error) {
            console.error('Error getting multiple keys:', error);
            return {};
        }
    }

    /**
     * Set key with automatic TTL based on key type
     */
    static async setWithTTL(redis: any, key: string, value: string, customTTL?: number): Promise<void> {
        try {
            const ttl = customTTL || this.getTTL(key);
            await redis.setex(key, ttl, value);
        } catch (error) {
            console.error('Error setting key with TTL:', error);
            throw error;
        }
    }

    /**
     * Batch set multiple keys with their appropriate TTLs
     */
    static async batchSet(redis: any, keyValuePairs: Array<{key: string, value: string, ttl?: number}>): Promise<void> {
        try {
            const pipeline = redis.pipeline();
            
            keyValuePairs.forEach(({key, value, ttl}) => {
                const finalTTL = ttl || this.getTTL(key);
                pipeline.setex(key, finalTTL, value);
            });
            
            await pipeline.exec();
        } catch (error) {
            console.error('Error batch setting keys:', error);
            throw error;
        }
    }

    /**
     * Clean up expired or old keys for a specific prefix
     */
    static async cleanupKeys(redis: any, prefix: string, olderThanDays: number = 7): Promise<number> {
        try {
            const keys = await redis.keys(`${prefix}:*`);
            let deletedCount = 0;
            
            for (const key of keys) {
                try {
                    const ttl = await redis.ttl(key);
                    if (ttl === -1 || ttl === -2) { // Key has no TTL or doesn't exist
                        await redis.del(key);
                        deletedCount++;
                    }
                } catch (error) {
                    console.error(`Error processing key ${key}:`, error);
                }
            }
            
            return deletedCount;
        } catch (error) {
            console.error('Error cleaning up keys:', error);
            return 0;
        }
    }
}
