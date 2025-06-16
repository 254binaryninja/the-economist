import { container } from "@/src/config/inversify.config"
import { TYPES } from "@/src/config/types" 
import { EconomicNewsFeedController } from "@/src/controllers/EconomicNewsFeedController"
import { tool } from 'ai'
import { z } from "zod"

// Schema for economic news tool inputs
const economicNewsSchema = z.object({
  entity: z.string().min(1).max(50).optional().describe("Stock symbol or company name to filter news (e.g., AAPL, Tesla)"),
  minSentiment: z.number().min(-1).max(1).optional().describe("Minimum sentiment score (-1 to 1, where -1 is very negative, 1 is very positive)"),
  category: z.enum(["general", "forex", "crypto", "merger"]).optional().describe("News category to filter by")
});

export const economicNewsTool = tool({
  description: "Fetch the latest economic and financial news articles from multiple sources (Marketaux and Finnhub). Returns comprehensive news data with sentiment analysis, perfect for market research and analysis.",
  parameters: economicNewsSchema,
  execute: async (input) => {
    try {
      const { entity, minSentiment, category } = economicNewsSchema.parse(input);
      const controller = container.get<EconomicNewsFeedController>(TYPES.EconomicsNewsFeedController);
      
      const result = await controller.fetchNews({ entity, minSentiment, category });
      
      // Add metadata about the results
      const totalArticles = result.marketaux.length + result.finnhub.length;
      
      return {
        success: true,
        data: {
          ...result,
          metadata: {
            totalArticles,
            marketauxCount: result.marketaux.length,
            finnhubCount: result.finnhub.length,
            filters: {
              entity: entity || "all",
              minSentiment: minSentiment || "any",
              category: category || "general"
            }
          }
        },
        error: null
      };
    } catch (error) {
      console.error("Error in economic news tool:", error);
      
      // Return error as data instead of throwing
      return {
        success: false,
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          type: 'FETCH_ERROR',
          details: 'Failed to fetch economic news from APIs. This could be due to network issues, API rate limits, or invalid parameters.',
          fallback: 'Please try again with different parameters or check your internet connection.'
        }
      };
    }
  }
});
