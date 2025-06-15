import axios, { AxiosResponse, AxiosError } from 'axios';
import { injectable } from 'inversify';
import { Article, DualNewsResponse, IEconomicNewsFeedRepository, NewsFetchParams } from '../repository/IEconomicNewsFeedRepository';


@injectable()
export class IEconomicNewsFeedService implements IEconomicNewsFeedRepository {
  private marketauxToken = process.env.MARKETAUX_API_TOKEN!;
  private finnhubToken = process.env.FINNHUB_API_TOKEN!;
  private marketauxBase = "https://api.marketaux.com/v1/news/all";
  private finnhubBase = "https://finnhub.io/api/v1/market-news";
  
  private marketauxClient = axios.create({
    baseURL: this.marketauxBase,
    timeout: 10000,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  private finnhubClient = axios.create({
    baseURL: this.finnhubBase,
    timeout: 10000,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // Validate required environment variables
    if (!this.marketauxToken) {
      console.warn('MARKETAUX_API_TOKEN is not set - Marketaux news will be unavailable');
    }
    if (!this.finnhubToken) {
      console.warn('FINNHUB_API_TOKEN is not set - Finnhub news will be unavailable');
    }
  }

  async fetchNews(params?: NewsFetchParams): Promise<DualNewsResponse> {
    const { entity, minSentiment, category } = params ?? {};
    
    // Fetch from both sources concurrently
    const [marketauxArticles, finnhubArticles] = await Promise.allSettled([
      this.fetchMarketauxNews(entity, minSentiment),
      this.fetchFinnhubNews(category),
    ]);

    return {
      marketaux: marketauxArticles.status === 'fulfilled' ? marketauxArticles.value : [],
      finnhub: finnhubArticles.status === 'fulfilled' ? finnhubArticles.value : [],
    };
  }

  private async fetchMarketauxNews(entity?: string, minSentiment?: number): Promise<Article[]> {
    if (!this.marketauxToken) {
      console.warn('Marketaux API token not available, skipping Marketaux news fetch');
      return [];
    }

    try {
      const params = {
        api_token: this.marketauxToken,
        limit: "20",
        ...(entity && { symbols: entity }),
        ...(minSentiment != null && { sentiment_gte: minSentiment.toString() }),
      };

      const response: AxiosResponse = await this.marketauxClient.get('', { params });
      
      if (!response.data || !Array.isArray(response.data.data)) {
        console.warn('Invalid response structure from Marketaux API');
        return [];
      }

      return response.data.data.map((article: any) => this.mapMarketauxArticle(article));
    } catch (error) {
      console.error('Error fetching news from Marketaux:', this.formatError(error));
      return [];
    }
  }

  private async fetchFinnhubNews(category?: string): Promise<Article[]> {
    if (!this.finnhubToken) {
      console.warn('Finnhub API token not available, skipping Finnhub news fetch');
      return [];
    }

    try {
      const params = {
        category: category || "general",
        token: this.finnhubToken,
      };

      const response: AxiosResponse = await this.finnhubClient.get('', { params });
      
      if (!response.data || !Array.isArray(response.data)) {
        console.warn('Invalid response structure from Finnhub API');
        return [];
      }

      return response.data.map((article: any) => this.mapFinnhubArticle(article));
    } catch (error) {
      console.error('Error fetching news from Finnhub:', this.formatError(error));
      return [];
    }
  }

  private mapMarketauxArticle(article: any): Article {
    return {
      title: article.title || 'No title available',
      description: article.description || undefined,
      url: article.url || '#',
      date: article.published_at || new Date().toISOString(),
      source: article.source || 'Marketaux',
      imageUrl: article.image_url || undefined,
      sentiment: article.sentiment_score || undefined,
    };
  }

  private mapFinnhubArticle(article: any): Article {
    return {
      title: article.headline || 'No title available',
      url: article.url || '#',
      date: article.datetime 
        ? new Date(article.datetime * 1000).toISOString() 
        : new Date().toISOString(),
      source: article.source || 'Finnhub',
      imageUrl: article.image || undefined,
    };
  }

  private formatError(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response) {
        // Server responded with error status
        return `HTTP ${axiosError.response.status}: ${axiosError.response.statusText}`;
      } else if (axiosError.request) {
        // Request was made but no response received
        return `Network error: ${axiosError.message}`;
      } else {
        // Error in setting up the request
        return `Request setup error: ${axiosError.message}`;
      }
    }
    
    return error instanceof Error ? error.message : 'Unknown error occurred';
  }
}