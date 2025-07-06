/**
 * Utility for creating consistent tool responses across all AI tools
 * This ensures errors are returned as data instead of thrown, preventing app crashes
 */

export interface ToolError {
  message: string;
  type:
    | "CONFIG_ERROR"
    | "AUTH_ERROR"
    | "RATE_LIMIT"
    | "NOT_FOUND"
    | "NO_DATA"
    | "FETCH_ERROR"
    | "VALIDATION_ERROR"
    | "UNKNOWN_ERROR";
  details: string;
  fallback: string;
}

export interface ToolResponse<T = any> {
  success: boolean;
  data: T | null;
  error: ToolError | null;
}

/**
 * Creates a successful tool response
 */
export function createSuccessResponse<T>(data: T): ToolResponse<T> {
  return {
    success: true,
    data,
    error: null,
  };
}

/**
 * Creates an error tool response
 */
export function createErrorResponse(
  message: string,
  type: ToolError["type"] = "UNKNOWN_ERROR",
  details: string = "An unexpected error occurred",
  fallback: string = "Please try again later",
): ToolResponse<null> {
  return {
    success: false,
    data: null,
    error: {
      message,
      type,
      details,
      fallback,
    },
  };
}

/**
 * Pre-defined error responses for common scenarios
 */
export const CommonErrors = {
  apiKeyMissing: (service: string) =>
    createErrorResponse(
      `${service} API key is not configured`,
      "CONFIG_ERROR",
      `The ${service}_API_KEY environment variable is missing or empty.`,
      "Please configure the API key in your environment variables.",
    ),

  invalidApiKey: (service: string) =>
    createErrorResponse(
      `Invalid ${service} API key`,
      "AUTH_ERROR",
      "The provided API key is invalid or expired.",
      `Please check your ${service}_API_KEY environment variable.`,
    ),

  rateLimitExceeded: (service: string) =>
    createErrorResponse(
      `${service} API rate limit exceeded`,
      "RATE_LIMIT",
      "Too many requests have been made to the API.",
      "Please wait a moment before making another request.",
    ),

  noDataFound: (resource: string, params: string) =>
    createErrorResponse(
      `No ${resource} found for ${params}`,
      "NO_DATA",
      `The requested ${resource} is not available for the specified parameters.`,
      "Try using different parameters or check if the resource exists.",
    ),

  networkError: (service: string) =>
    createErrorResponse(
      `Failed to connect to ${service}`,
      "FETCH_ERROR",
      "Network error occurred while making the API request.",
      "Please check your internet connection and try again.",
    ),
};

/**
 * Wraps a tool execution function with consistent error handling
 */
export function withToolErrorHandling<T, P>(toolFn: (params: P) => Promise<T>) {
  return async (params: P): Promise<ToolResponse<T>> => {
    try {
      const result = await toolFn(params);
      return createSuccessResponse(result);
    } catch (error) {
      console.error("Tool execution error:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        data: null,
        error: {
          message: errorMessage,
          type: "UNKNOWN_ERROR",
          details: "An unexpected error occurred during tool execution.",
          fallback:
            "Please try again later or contact support if the issue persists.",
        },
      } as ToolResponse<T>;
    }
  };
}
