import { tool } from "ai";
import { z } from "zod";
import { createSuccessResponse, createErrorResponse } from "@/lib/utils/toolResponse";

// Schema for chart tool inputs
const chartSchema = z.object({
  data: z.array(
    z.record(z.union([z.string(), z.number()]))
  ),
  xKey: z.string(),
  yKey: z.string(),
  chartType: z.enum(["bar", "line", "area", "pie"]).default("bar")
});

export const chartTool = tool({
  description: "Generate a shadcn/ui compatible chart payload (data + x/y keys + type).",
  parameters: chartSchema,
  execute: async (input) => {
    try {
      const { data, xKey, yKey, chartType } = chartSchema.parse(input);

      // Validate that the data contains the specified keys
      if (!data.every(item => item.hasOwnProperty(xKey) && item.hasOwnProperty(yKey))) {
        return createErrorResponse(
          `All data items must contain the keys: ${xKey} and ${yKey}`,
          'VALIDATION_ERROR',
          'Some data items are missing required keys for chart generation.',
          'Please ensure all data items have both xKey and yKey properties.'
        );
      }

      // Validate data is not empty
      if (data.length === 0) {
        return createErrorResponse(
          'Chart data cannot be empty',
          'VALIDATION_ERROR',
          'No data provided for chart generation.',
          'Please provide at least one data item for the chart.'
        );
      }

      // Return successful chart payload that matches AgentChart component interface
      return createSuccessResponse({
        data,
        xKey,
        yKey,
        type: chartType
      });
    } catch (error) {
      console.error("Error in chart generation tool:", error);
      
      return createErrorResponse(
        error instanceof Error ? error.message : 'Chart generation failed',
        'UNKNOWN_ERROR',
        'Failed to generate chart configuration.',
        'Please check your input data and try again.'
      );
    }
  }
});
