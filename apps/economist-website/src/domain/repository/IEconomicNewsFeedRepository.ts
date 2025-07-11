export interface Article {
  title: string;
  description?: string;
  url: string;
  date: string; // ISO string
  source: string; // e.g. domain or provider name
  imageUrl?: string; // optional image URL
  sentiment?: number; // Marketaux provides sentiment
}

export interface DualNewsResponse {
  marketaux: Article[];
  finnhub: Article[];
}

export interface NewsFetchParams {
  entity?: string;
  minSentiment?: number;
  category?: string;
}

export interface IEconomicNewsFeedRepository {
  /**
   * Fetch combined news from Marketaux and Finnhub.
   * Maps and normalizes external data into our `Article` DTO.
   *
   * @param params Optional filter parameters for entity, sentiment, category
   * @returns `DualNewsResponse` with both API feeds
   */
  fetchNews(params?: NewsFetchParams): Promise<DualNewsResponse>;
}
