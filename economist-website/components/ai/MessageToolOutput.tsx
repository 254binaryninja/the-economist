"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AgentChart } from "@/components/chart/AgentChart";
import { BarChart3, Wrench } from "lucide-react";

interface ToolInvocation {
  toolName: string;
  result?: any;
  output?: any;
  args?: any;
  [key: string]: any;
}

interface MessageToolOutputProps {
  toolInvocations?: ToolInvocation[];
  messageContent?: string; // Add support for parsing chart data from message content
  messageMetadata?: any; // Add support for metadata that might contain tool results
}

export function MessageToolOutput({
  toolInvocations,
  messageContent,
  messageMetadata,
}: MessageToolOutputProps) {
  const [detectedCharts, setDetectedCharts] = React.useState<any[]>([]);

  // Function to extract chart data from JSON blocks in message content
  const extractChartsFromContent = React.useCallback((content: string) => {
    if (!content) return [];

    const charts: any[] = [];

    // Look for JSON blocks that might contain chart data
    const jsonBlockRegex = /```json\s*(\{[\s\S]*?\})\s*```/g;
    let match;

    while ((match = jsonBlockRegex.exec(content)) !== null) {
      try {
        const parsed = JSON.parse(match[1]);

        // Check if this looks like chart data
        if (
          parsed.data &&
          Array.isArray(parsed.data) &&
          (parsed.xKey || parsed.x) &&
          (parsed.yKey || parsed.y) &&
          (parsed.type || parsed.chartType)
        ) {
          // Normalize the chart data structure
          const chart = {
            data: parsed.data,
            xKey: parsed.xKey || parsed.x || "x",
            yKey: parsed.yKey || parsed.y || "y",
            type: parsed.type || parsed.chartType || "bar",
          };

          charts.push(chart);
        }
      } catch (error) {
        // Silently ignore JSON parsing errors
      }
    }

    return charts;
  }, []);

  // Function to extract charts from metadata (stored tool results)
  const extractChartsFromMetadata = React.useCallback((metadata: any) => {
    if (!metadata) return [];

    const charts: any[] = [];

    try {
      // Parse metadata if it's a string
      const parsedMetadata =
        typeof metadata === "string" ? JSON.parse(metadata) : metadata;

      // Look for tool results in metadata
      if (
        parsedMetadata.toolResults &&
        Array.isArray(parsedMetadata.toolResults)
      ) {
        parsedMetadata.toolResults.forEach((result: any) => {
          if (
            result.toolName &&
            result.toolName.toLowerCase().includes("chart")
          ) {
            const chartData = result.result || result.output || result.args;

            if (
              chartData &&
              chartData.data &&
              Array.isArray(chartData.data) &&
              chartData.xKey &&
              chartData.yKey &&
              chartData.type
            ) {
              charts.push(chartData);
            }
          }
        });
      }
    } catch (error) {
      // Silently ignore metadata parsing errors
    }

    return charts;
  }, []);

  // Detect charts from content and metadata on mount and when props change
  React.useEffect(() => {
    const contentCharts = extractChartsFromContent(messageContent || "");
    const metadataCharts = extractChartsFromMetadata(messageMetadata);

    const allDetectedCharts = [...contentCharts, ...metadataCharts];
    setDetectedCharts(allDetectedCharts);

    if (allDetectedCharts.length > 0) {
      console.log("Detected charts from message:", allDetectedCharts);
    }
  }, [
    messageContent,
    messageMetadata,
    extractChartsFromContent,
    extractChartsFromMetadata,
  ]);

  // Debug: Log tool invocations to help with troubleshooting
  React.useEffect(() => {
    if (toolInvocations && toolInvocations.length > 0) {
      console.log("Tool invocations received:", toolInvocations);
      toolInvocations.forEach((invocation, index) => {
        console.log(`Tool ${index}:`, {
          toolName: invocation.toolName,
          result: invocation.result,
          output: invocation.output,
          args: invocation.args,
        });
      });
    }
  }, [toolInvocations]);

  // Render detected charts from content/metadata
  const renderDetectedChart = (chart: any, index: number) => {
    return (
      <Card
        key={`detected-${index}`}
        className="border-primary/20 bg-primary/5"
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">
              Chart from Message
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {chart.type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <AgentChart chart={chart} />
        </CardContent>
      </Card>
    );
  };
  React.useEffect(() => {
    if (toolInvocations && toolInvocations.length > 0) {
      console.log("Tool invocations received:", toolInvocations);
      toolInvocations.forEach((invocation, index) => {
        console.log(`Tool ${index}:`, {
          toolName: invocation.toolName,
          result: invocation.result,
          output: invocation.output,
          args: invocation.args,
        });
      });
    }
  }, [toolInvocations]);

  const renderToolOutput = (invocation: ToolInvocation, index: number) => {
    const { toolName } = invocation;

    // Handle chart generation tool - check for various chart tool names
    if (
      toolName === "chartTool" ||
      toolName === "chart" ||
      toolName === "generateChart" ||
      toolName.toLowerCase().includes("chart")
    ) {
      let chart = null;

      // Try different response structures - updated to handle the new format
      if (
        invocation?.result &&
        invocation.result.data &&
        Array.isArray(invocation.result.data)
      ) {
        // Direct result with array data (most likely case now)
        chart = {
          data: invocation.result.data,
          xKey: invocation.result.xKey,
          yKey: invocation.result.yKey,
          type: invocation.result.type || invocation.result.chartType || "bar",
        };
      } else if (invocation?.result?.chart) {
        // If there's a nested chart object
        chart = invocation.result.chart;
      } else if (
        invocation?.output?.data &&
        Array.isArray(invocation.output.data)
      ) {
        // If output.data is the chart data structure
        chart = {
          data: invocation.output.data,
          xKey: invocation.output.xKey,
          yKey: invocation.output.yKey,
          type: invocation.output.type || invocation.output.chartType || "bar",
        };
      } else if (
        invocation?.args &&
        invocation.args.data &&
        Array.isArray(invocation.args.data)
      ) {
        // Chart data in args (fallback)
        chart = {
          data: invocation.args.data,
          xKey: invocation.args.xKey,
          yKey: invocation.args.yKey,
          type: invocation.args.type || invocation.args.chartType || "bar",
        };
      }

      // Debug logging for chart detection
      console.log("Chart detection for tool:", toolName, {
        invocation,
        detectedChart: chart,
        hasRequiredFields:
          chart && chart.data && chart.xKey && chart.yKey && chart.type,
      });

      // Validate that we have the required chart properties
      if (
        chart &&
        chart.data &&
        Array.isArray(chart.data) &&
        chart.xKey &&
        chart.yKey &&
        chart.type
      ) {
        return (
          <Card key={index} className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-medium">
                  Generated Chart
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {chart.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <AgentChart chart={chart} />
            </CardContent>
          </Card>
        );
      } else {
        // Show debug info if chart detection fails
        console.warn("Chart tool called but chart data is invalid:", {
          toolName,
          invocation,
          chart,
        });

        return (
          <Card key={index} className="border-destructive/20 bg-destructive/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-destructive" />
                <CardTitle className="text-sm font-medium">
                  Chart Tool Error
                </CardTitle>
                <Badge variant="destructive" className="text-xs">
                  Invalid Data
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Chart data is missing or invalid. Expected: data array, xKey,
                yKey, and type.
              </p>
              <details className="mt-2">
                <summary className="text-xs cursor-pointer">Debug Info</summary>
                <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                  {JSON.stringify(invocation, null, 2)}
                </pre>
              </details>
            </CardContent>
          </Card>
        );
      }
    }

    // Handle other tool outputs generically
    const result = invocation?.result || invocation?.output;

    if (result) {
      return (
        <Card key={index} className="border-muted">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium capitalize">
                {toolName.replace(/_/g, " ")}
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                Tool Output
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-3">
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap overflow-auto">
                {typeof result === "string"
                  ? result
                  : JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      );
    }

    return null;
  };
  if (!toolInvocations?.length && !detectedCharts?.length) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Render charts detected from message content/metadata */}
      {detectedCharts.map(renderDetectedChart)}

      {/* Render tool invocations */}
      {toolInvocations?.map(renderToolOutput)}
    </div>
  );
}
