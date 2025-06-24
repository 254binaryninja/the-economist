import { tool } from 'ai';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/toolResponse';

// Define the chart data item schema - simplified for Gemini API compatibility
const ChartDataItem = z.object({
  x: z.any().describe("X-axis value (can be string or number)"),
  y: z.any().describe("Y-axis value (can be string or number)"),
}).passthrough().describe("Individual data point for the chart");

const chartSchema = z.object({
  data: z.array(ChartDataItem).min(1).describe("Array of data points for the chart"),
  xKey: z.string().describe("Key name for x-axis values in the data"),
  yKey: z.string().describe("Key name for y-axis values in the data"),
  chartType: z.enum(['bar', 'line', 'area', 'pie']).default('bar').describe("Type of chart to generate"),
});

export const chartTool = tool({
  description: "Generate a shadcn/ui compatible chart payload with validated data structure.",
  parameters: chartSchema,
  execute: async (input) => {
    const { data, xKey, yKey, chartType } = chartSchema.parse(input);
    
    // Validate that all items have the required keys
    if (!data.every(item => xKey in item && yKey in item)) {
      return createErrorResponse(
        `Missing keys ${xKey}/${yKey}`,
        'VALIDATION_ERROR',
        'Some items missing required x/y fields.',
        'Ensure all items have both xKey and yKey.'
      );
    }
    
    // Additional validation for empty data (though schema already handles this with min(1))
    if (data.length === 0) {
      return createErrorResponse(
        'Chart data cannot be empty',
        'VALIDATION_ERROR',
        'No data provided.',
        'Provide at least one data point.'
      );
    }
    
    return createSuccessResponse({ 
      data, 
      xKey, 
      yKey, 
      type: chartType 
    });
  },
});