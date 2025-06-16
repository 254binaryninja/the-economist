import { tool } from 'ai'
import { z } from "zod"
import axios, { AxiosError } from 'axios'

// Schema for economic indicator tool inputs
const EconomicIndicatorInputSchema = z.object({
  indicator: z.string().min(2).max(100).describe("Economic indicator name (e.g., 'GDP', 'Inflation Rate', 'Unemployment Rate')"),
  countryCode: z.string().min(2).max(3).describe("Country code (ISO 2 or 3 letter code, e.g., 'US', 'UK', 'DE')"),
  year: z.number().min(1900).max(new Date().getFullYear()).optional().describe("Year for historical data (defaults to latest available)")
})

interface EconomicIndicatorData {
  Country: string;
  Category: string;
  DateTime: string;
  Value: number;
  Unit: string;
  Frequency: string;
  HistoricalDataSymbol: string;
  LastUpdate: string;
}

export const economicIndicatorTool = tool({
  description: "Fetch economic indicators from Trading Economics API. Returns historical data for specific economic indicators by country. Supports GDP, inflation, unemployment, interest rates, and many other economic metrics.",
  parameters: EconomicIndicatorInputSchema,
  execute: async (input) => {
    try {
      const { indicator, countryCode, year } = EconomicIndicatorInputSchema.parse(input);
      
      if (!process.env.TRADINGECONOMICS_KEY) {
        return {
          success: false,
          data: null,
          error: {
            message: "Trading Economics API key is not configured",
            type: 'CONFIG_ERROR',
            details: 'The TRADINGECONOMICS_KEY environment variable is missing or empty.',
            fallback: 'Please configure the API key in your environment variables.'
          }
        };
      }

      // Create axios client with proper configuration
      const client = axios.create({
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      // Build the API URL
      const baseUrl = `https://api.tradingeconomics.com/historical/country/${countryCode}/indicator/${indicator}`;
      const params = new URLSearchParams({
        c: process.env.TRADINGECONOMICS_KEY
      });

      // Add year filter if provided
      if (year) {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;
        params.append('d1', startDate);
        params.append('d2', endDate);
      }

      const url = `${baseUrl}?${params.toString()}`;
      
      const response = await client.get<EconomicIndicatorData[]>(url);
      
      if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
        return {
          success: false,
          data: null,
          error: {
            message: `No data found for indicator "${indicator}" in country "${countryCode}"${year ? ` for year ${year}` : ''}`,
            type: 'NO_DATA',
            details: 'The requested economic indicator data is not available for the specified parameters.',
            fallback: 'Try using a different indicator name, country code, or year. Common indicators include: GDP, Inflation Rate, Unemployment Rate.'
          }
        };
      }

      // Sort by date to get the most recent data first
      const sortedData = response.data.sort((a, b) => 
        new Date(b.DateTime).getTime() - new Date(a.DateTime).getTime()
      );

      // Return structured data with metadata
      return {
        success: true,
        data: {
          indicator: indicator,
          country: countryCode,
          year: year || "latest",
          data: sortedData.map(item => ({
            date: item.DateTime,
            value: item.Value,
            unit: item.Unit,
            category: item.Category,
            frequency: item.Frequency,
            lastUpdate: item.LastUpdate
          })),
          metadata: {
            totalRecords: sortedData.length,
            latestValue: sortedData[0]?.Value,
            latestDate: sortedData[0]?.DateTime,
            unit: sortedData[0]?.Unit,
            requestedIndicator: indicator,
            requestedCountry: countryCode,
            requestedYear: year
          }
        },
        error: null
      };
    } catch (error) {
      console.error("Error in economic indicator tool:", error);
      
      // Handle specific error types gracefully
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        if (axiosError.response?.status === 401) {
          return {
            success: false,
            data: null,
            error: {
              message: "Invalid Trading Economics API key",
              type: 'AUTH_ERROR',
              details: 'The provided API key is invalid or expired.',
              fallback: 'Please check your TRADINGECONOMICS_KEY environment variable.'
            }
          };
        } else if (axiosError.response?.status === 404) {
          return {
            success: false,
            data: null,
            error: {
              message: `Indicator "${input.indicator}" not found for country "${input.countryCode}"`,
              type: 'NOT_FOUND',
              details: 'The specified indicator or country code is not recognized by the API.',
              fallback: 'Please verify the indicator name and country code. Use standard ISO country codes (e.g., US, UK, DE).'
            }
          };
        } else if (axiosError.response?.status === 429) {
          return {
            success: false,
            data: null,
            error: {
              message: "Trading Economics API rate limit exceeded",
              type: 'RATE_LIMIT',
              details: 'Too many requests have been made to the API.',
              fallback: 'Please wait a moment before making another request.'
            }
          };
        }
      }
      
      // Generic error fallback
      return {
        success: false,
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          type: 'UNKNOWN_ERROR',
          details: 'An unexpected error occurred while fetching economic indicator data.',
          fallback: 'Please try again later or contact support if the issue persists.'
        }
      };
    }
  }
})