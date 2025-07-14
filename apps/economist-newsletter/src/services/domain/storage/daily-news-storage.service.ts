import { inject, injectable } from "inversify";
import type { ISupabaseService } from "../../repository/interfaces";
import { TYPES } from "../../config/types";
import { DailyNewsContent } from "../../../schemas/validation.schemas";

@injectable()
export class DailyNewsStorageService {
  constructor(
    @inject(TYPES.SupabaseService) private supabaseService: ISupabaseService
  ) {}

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
}
