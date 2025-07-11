declare module 'rss-parser' {
  interface Item {
    title?: string;
    link?: string;
    pubDate?: string;
    author?: string;
    content?: string;
    contentSnippet?: string;
    guid?: string;
    categories?: string[];
    isoDate?: string;
    'content:encoded'?: string;
    'content:encodedSnippet'?: string;
    [key: string]: any;
  }

  interface Output<T> {
    title?: string;
    description?: string;
    link?: string;
    language?: string;
    copyright?: string;
    lastBuildDate?: string;
    items: T[];
    [key: string]: any;
  }

  interface ParserOptions {
    timeout?: number;
    xml2js?: any;
    requestOptions?: any;
    defaultRSS?: number;
    maxRedirects?: number;
    customFields?: {
      feed?: string[];
      item?: string[] | string[][];
    };
  }

  class Parser<T = Item> {
    constructor(options?: ParserOptions);
    parseURL(url: string): Promise<Output<T>>;
    parseString(xml: string): Promise<Output<T>>;
  }

  export = Parser;
}
