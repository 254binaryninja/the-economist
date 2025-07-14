import { inject, injectable } from "inversify";
import type { ISupabaseService } from "../../repository/interfaces";
import { TYPES } from "../../config/types";
import { NewsArticle, RssFeedItem } from "../../../schemas/validation.schemas";

@injectable()
export class ArticleStorageService {
  constructor(
    @inject(TYPES.SupabaseService) private supabaseService: ISupabaseService
  ) {}

  async saveNewsArticle(article: NewsArticle): Promise<string> {
    const client = this.supabaseService.getClient();
    
    const { data, error } = await client
      .from('articles')
      .insert({
        title: article.title,
        content: article.content,
        summary: article.summary,
        published_at: article.publishDate,
        status: 'published'
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to save article: ${error.message}`);
    }

    return data.id;
  }

  async getNewsArticle(id: string): Promise<NewsArticle | null> {
    const client = this.supabaseService.getClient();
    
    const { data, error } = await client
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to get article: ${error.message}`);
    }

    return this.mapToNewsArticle(data);
  }

  async getLatestNews(limit: number, offset?: number): Promise<NewsArticle[]> {
    const client = this.supabaseService.getClient();
    
    let query = client
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (offset) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get latest news: ${error.message}`);
    }

    return data.map((item: any) => this.mapToNewsArticle(item));
  }

  async searchArticles(query: string, options?: { limit?: number; offset?: number }): Promise<{ articles: NewsArticle[]; total: number }> {
    const client = this.supabaseService.getClient();
    const limit = options?.limit || 20;
    const offset = options?.offset || 0;

    // Use the PostgreSQL function for full-text search
    const { data, error } = await client
      .rpc('search_articles_mvp', {
        search_query: query,
        limit_count: limit,
        offset_count: offset
      });

    if (error) {
      throw new Error(`Failed to search articles: ${error.message}`);
    }

    // Get total count for pagination
    const { count } = await client
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .textSearch('search_vector', query);

    return {
      articles: data.map((item: any) => this.mapToNewsArticle(item)),
      total: count || 0
    };
  }

  async saveNewsItems(items: RssFeedItem[]): Promise<void> {
    const client = this.supabaseService.getClient();

    const articles = items.map(item => ({
      title: item.title,
      content: item.content || item.description || '',
      source_url: item.link,
      published_at: item.pubDate,
      status: 'published'
    }));

    const { error } = await client
      .from('articles')
      .insert(articles);

    if (error) {
      throw new Error(`Failed to save news items: ${error.message}`);
    }
  }

  async cleanupOldData(olderThanDays: number): Promise<number> {
    const client = this.supabaseService.getClient();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const { data, error } = await client
      .from('articles')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
      .select('id');

    if (error) {
      throw new Error(`Failed to cleanup old data: ${error.message}`);
    }

    return data?.length || 0;
  }

  private mapToNewsArticle(data: any): NewsArticle {
    return {
      title: data.title,
      content: data.content,
      summary: data.summary,
      type: 'weekly_preview', // Default type since it's required in schema
      publishDate: data.published_at ? new Date(data.published_at) : new Date(),
      sources: [] // Default empty array since it's required in schema
    };
  }
}
