import { inject, injectable } from "inversify";
import type { IStorageService } from "../../repository/interfaces";
import { TYPES } from "../../config/types";
import { NewsArticle, DailyNewsContent, RssFeedItem } from "../../../schemas/validation.schemas";
import { ArticleStorageService } from "./article-storage.service";
import { NewsletterStorageService } from "./newsletter-storage.service";
import { DailyNewsStorageService } from "./daily-news-storage.service";

@injectable()
export class StorageService implements IStorageService {
  constructor(
    @inject(TYPES.ArticleStorageService) private articleStorage: ArticleStorageService,
    @inject(TYPES.NewsletterStorageService) private newsletterStorage: NewsletterStorageService,
    @inject(TYPES.DailyNewsStorageService) private dailyNewsStorage: DailyNewsStorageService
  ) {}

  // Article-related methods - delegated to ArticleStorageService
  async saveNewsArticle(article: NewsArticle): Promise<string> {
    return this.articleStorage.saveNewsArticle(article);
  }

  async getNewsArticle(id: string): Promise<NewsArticle | null> {
    return this.articleStorage.getNewsArticle(id);
  }

  async getLatestNews(limit: number, offset?: number): Promise<NewsArticle[]> {
    return this.articleStorage.getLatestNews(limit, offset);
  }

  async searchArticles(query: string, options?: { limit?: number; offset?: number }): Promise<{ articles: NewsArticle[]; total: number }> {
    return this.articleStorage.searchArticles(query, options);
  }

  async saveNewsItems(items: RssFeedItem[]): Promise<void> {
    return this.articleStorage.saveNewsItems(items);
  }

  async cleanupOldData(olderThanDays: number): Promise<number> {
    return this.articleStorage.cleanupOldData(olderThanDays);
  }

  // Daily news-related methods - delegated to DailyNewsStorageService
  async saveDailyNewsContent(content: DailyNewsContent, date?: Date): Promise<string> {
    return this.dailyNewsStorage.saveDailyNewsContent(content, date);
  }

  async getDailyNewsContent(date?: Date): Promise<DailyNewsContent | null> {
    return this.dailyNewsStorage.getDailyNewsContent(date);
  }

  // Newsletter-related methods - delegated to NewsletterStorageService
  async savePublicNewsletterSignup(email: string): Promise<{ id: string; confirmationToken: string }> {
    return this.newsletterStorage.savePublicNewsletterSignup(email);
  }

  async confirmNewsletterSignup(token: string): Promise<boolean> {
    return this.newsletterStorage.confirmNewsletterSignup(token);
  }

  async unsubscribeFromNewsletter(email: string): Promise<boolean> {
    return this.newsletterStorage.unsubscribeFromNewsletter(email);
  }

  async getConfirmedSubscribers(): Promise<Array<{ id: string; email: string }>> {
    return this.newsletterStorage.getConfirmedSubscribers();
  }

  async recordEmailDelivery(deliveryData: { email: string; trackingId: string; content?: string }): Promise<string> {
    return this.newsletterStorage.recordEmailDelivery(deliveryData);
  }

  async updateEmailDeliveryStatus(trackingId: string, status: 'sent' | 'delivered' | 'failed'): Promise<void> {
    return this.newsletterStorage.updateEmailDeliveryStatus(trackingId, status);
  }
}
