declare module 'newsapi' {
  interface NewsAPISource {
    id: string;
    name: string;
    description: string;
    url: string;
    category: string;
    language: string;
    country: string;
  }

  interface NewsAPIArticle {
    source: {
      id: string | null;
      name: string;
    };
    author: string | null;
    title: string;
    description: string | null;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    content: string | null;
  }

  interface NewsAPIResponse {
    status: string;
    totalResults: number;
    articles: NewsAPIArticle[];
  }

  interface NewsAPISourcesResponse {
    status: string;
    sources: NewsAPISource[];
  }

  interface TopHeadlinesOptions {
    sources?: string;
    q?: string;
    category?: string;
    language?: string;
    country?: string;
    pageSize?: number;
    page?: number;
  }

  interface EverythingOptions {
    q?: string;
    sources?: string;
    domains?: string;
    excludeDomains?: string;
    from?: string;
    to?: string;
    language?: string;
    sortBy?: 'relevancy' | 'popularity' | 'publishedAt';
    pageSize?: number;
    page?: number;
  }

  interface SourcesOptions {
    category?: string;
    language?: string;
    country?: string;
  }

  class NewsAPI {
    constructor(apiKey: string);
    
    v2: {
      topHeadlines(options: TopHeadlinesOptions): Promise<NewsAPIResponse>;
      everything(options: EverythingOptions): Promise<NewsAPIResponse>;
      sources(options?: SourcesOptions): Promise<NewsAPISourcesResponse>;
    };
  }

  export = NewsAPI;
}
