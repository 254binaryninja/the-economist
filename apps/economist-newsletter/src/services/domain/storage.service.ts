import { inject, injectable } from "inversify";
import type { IStorageService, ISupabaseService } from "../repository/interfaces";
import { TYPES } from "../config/types";
import { NewsArticle, DailyNewsContent, RssFeedItem } from "../../schemas/validation.schemas";

@injectable()
export class StorageService implements IStorageService {
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

    return data.map((item: NewsArticle) => this.mapToNewsArticle(item));
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

  async saveDailyNewsContent(content: DailyNewsContent, date?: Date): Promise<string> {
    const client = this.supabaseService.getClient();
    const newsDate = date || new Date();

    const { data, error } = await client
      .from('daily_news_content')
      .insert({
        date: newsDate.toISOString().split('T')[0], // YYYY-MM-DD format
        title: content.title,
        summary: content.summary,
        top_stories: content.topStories,
        market_highlights: content.marketHighlights,
        economic_indicators: content.economicIndicators,
        generated_at: content.generatedAt
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to save daily news content: ${error.message}`);
    }

    return data.id;
  }

  async getDailyNewsContent(date?: Date): Promise<DailyNewsContent | null> {
    const client = this.supabaseService.getClient();
    const queryDate = date || new Date();
    const dateStr = queryDate.toISOString().split('T')[0];

    const { data, error } = await client
      .from('daily_news_content')
      .select('*')
      .eq('date', dateStr)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to get daily news content: ${error.message}`);
    }

    return {
      title: data.title,
      summary: data.summary,
      topStories: data.top_stories,
      marketHighlights: data.market_highlights,
      economicIndicators: data.economic_indicators,
      generatedAt: data.generated_at
    };
  }

  async savePublicNewsletterSignup(email: string): Promise<{ id: string; confirmationToken: string }> {
    const client = this.supabaseService.getClient();
    const confirmationToken = this.generateConfirmationToken();

    const { data, error } = await client
      .from('public_newsletter_signups')
      .insert({
        email,
        confirmation_token: confirmationToken,
        status: 'pending'
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to save newsletter signup: ${error.message}`);
    }

    return {
      id: data.id,
      confirmationToken
    };
  }

  async confirmNewsletterSignup(token: string): Promise<boolean> {
    const client = this.supabaseService.getClient();

    const { error } = await client
      .from('public_newsletter_signups')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString()
      })
      .eq('confirmation_token', token);

    return !error;
  }

  async unsubscribeFromNewsletter(email: string): Promise<boolean> {
    const client = this.supabaseService.getClient();

    const { error } = await client
      .from('public_newsletter_signups')
      .update({ status: 'unsubscribed' })
      .eq('email', email);

    return !error;
  }

  async getConfirmedSubscribers(): Promise<Array<{ id: string; email: string }>> {
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('public_newsletter_signups')
      .select('id, email')
      .eq('status', 'confirmed');

    if (error) {
      throw new Error(`Failed to get confirmed subscribers: ${error.message}`);
    }

    return data;
  }

  async recordEmailDelivery(deliveryData: { email: string; trackingId: string; content?: string }): Promise<string> {
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('email_deliveries')
      .insert({
        email: deliveryData.email,
        tracking_id: deliveryData.trackingId,
        content_reference: deliveryData.content,
        status: 'sent'
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to record email delivery: ${error.message}`);
    }

    return data.id;
  }

  async updateEmailDeliveryStatus(trackingId: string, status: 'sent' | 'delivered' | 'failed'): Promise<void> {
    const client = this.supabaseService.getClient();

    const updateData: any = { status };
    if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }

    const { error } = await client
      .from('email_deliveries')
      .update(updateData)
      .eq('tracking_id', trackingId);

    if (error) {
      throw new Error(`Failed to update email delivery status: ${error.message}`);
    }
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

  private generateConfirmationToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}
