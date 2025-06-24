import { tool } from "ai";
import { z } from "zod";
import axios, { AxiosError } from "axios";

// Input schema remains unchanged
const EconomicIndicatorInputSchema = z.object({
  indicator: z
    .string()
    .min(2)
    .max(100)
    .describe(
      "Economic indicator name (e.g., 'GDP', 'Inflation Rate', 'Unemployment Rate')",
    ),
  countryCode: z
    .string()
    .min(2)
    .max(3)
    .describe("Country code (ISO 2 or 3 letter code, e.g., 'US', 'UK', 'DE')"),
  year: z
    .number()
    .min(1900)
    .max(new Date().getFullYear())
    .optional()
    .describe("Year for historical data (defaults to latest available)"),
});

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
  description:
    "Fetch economic indicators from Trading Economics API. Returns historical data for specific economic indicators by country.",
  parameters: EconomicIndicatorInputSchema,
  execute: async (input) => {
    const { indicator, countryCode, year } =
      EconomicIndicatorInputSchema.parse(input);

    const rawKey = process.env.NEXT_PUBLIC_TRADINGECONOMICS_KEY;
    if (!rawKey) {
      return {
        success: false,
        data: null,
        error: {
          message: "Trading Economics API key is not configured",
          type: "CONFIG_ERROR",
          details:
            "Missing NEXT_PUBLIC_TRADINGECONOMICS_KEY environment variable.",
          fallback: "Please configure your API key.",
        },
      };
    }

    // Ensure prefix
    const key =
      rawKey.startsWith("guest:") || rawKey.startsWith("client:")
        ? rawKey
        : `guest:${rawKey}`;

    const client = axios.create({ timeout: 10000 });

    const params = new URLSearchParams({ f: "json" });
    if (year) {
      params.set("d1", `${year}-01-01`);
      params.set("d2", `${year}-12-31`);
    }

    const url = `https://api.tradingeconomics.com/historical/country/${countryCode}/indicator/${indicator}`;
    try {
      console.log("📡 Requesting:", url, "with params", params.toString());

      const resp = await client.get<EconomicIndicatorData[]>(url, {
        params,
        headers: { Authorization: key },
      });

      if (!Array.isArray(resp.data) || resp.data.length === 0) {
        return {
          success: false,
          data: null,
          error: {
            message: `No data found for "${indicator}" in "${countryCode}"${year ? ` (year ${year})` : ""}`,
            type: "NO_DATA",
            details: "Returned empty dataset.",
            fallback: "Try a different indicator, country, or year.",
          },
        };
      }

      const sorted = resp.data.sort(
        (a, b) =>
          new Date(b.DateTime).getTime() - new Date(a.DateTime).getTime(),
      );

      return {
        success: true,
        data: {
          indicator,
          country: countryCode,
          year: year || "latest",
          data: sorted.map((item) => ({
            date: item.DateTime,
            value: item.Value,
            unit: item.Unit,
            category: item.Category,
            frequency: item.Frequency,
            lastUpdate: item.LastUpdate,
          })),
          metadata: {
            totalRecords: sorted.length,
            latestValue: sorted[0].Value,
            latestDate: sorted[0].DateTime,
            unit: sorted[0].Unit,
            requestedIndicator: indicator,
            requestedCountry: countryCode,
            requestedYear: year,
          },
        },
        error: null,
      };
    } catch (err: any) {
      console.error(
        "Error in economicIndicatorTool:",
        err.response?.status,
        err.response?.data || err.message,
      );
      if (axios.isAxiosError(err) && err.response) {
        const status = err.response.status;
        const data = err.response.data;

        // Specific error handling
        if (status === 401) {
          return {
            success: false,
            data: null,
            error: {
              message: "Unauthorized: Invalid API key",
              type: "AUTH_ERROR",
              details: "Server returned 401 Unauthorized.",
              fallback:
                "Check or regenerate your API key and ensure proper prefix.",
            },
          };
        }
        if (status === 403) {
          return {
            success: false,
            data: null,
            error: {
              message: "Forbidden access",
              type: "FORBIDDEN",
              details: "Server returned 403 Forbidden — check permissions.",
              fallback: "Ensure your key has API access rights.",
            },
          };
        }
        if (status === 404) {
          return {
            success: false,
            data: null,
            error: {
              message: `Indicator "${indicator}" not found for country "${countryCode}"`,
              type: "NOT_FOUND",
              details: "404 Not Found.",
              fallback: "Verify indicator and country code.",
            },
          };
        }
        if (status === 409 || status === 429) {
          return {
            success: false,
            data: null,
            error: {
              message: "Rate limit exceeded",
              type: "RATE_LIMIT",
              details: `Server returned ${status}.`,
              fallback: "Slow down your requests or try again later.",
            },
          };
        }

        // Show raw server message for debugging
        return {
          success: false,
          data: null,
          error: {
            message: `Unexpected HTTP ${status}`,
            type: "UNKNOWN_ERROR",
            details: typeof data === "string" ? data : JSON.stringify(data),
            fallback: "Check logs or contact Trading Economics support.",
          },
        };
      }

      // Generic fallback
      return {
        success: false,
        data: null,
        error: {
          message: err instanceof Error ? err.message : "Unknown error",
          type: "UNKNOWN_ERROR",
          details: err.stack || String(err),
          fallback: "Try again later.",
        },
      };
    }
  },
});
