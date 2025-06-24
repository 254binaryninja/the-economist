//api/workspace/[id]/route.ts

export const maxDuration = 60;

import { generateText, streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { serverContainer } from "@/src/config/inversify.config";
import { TYPES } from "@/src/config/types";
import { WorkspaceMessagesController } from "@/src/controllers/WorkspaceMesssagesController";
import { WorkspaceController } from "@/src/controllers/WorkspaceController";
import { RedisContextController } from "@/src/controllers/RedisContextController";
import { chartTool } from "@/lib/tools/chartGenerator";
import { economicIndicatorTool } from "@/lib/tools/economicIndicator";
import { economicNewsTool } from "@/lib/tools/economicNews";
import { auth } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from "uuid";
import { classicalPrompt } from "@/lib/prompts/classical.prompt";
import { keynesianPrompt } from "@/lib/prompts/keynesian.prompt";
import { marxistPrompt } from "@/lib/prompts/marxist.prompt";
import { neoclassicalPrompt } from "@/lib/prompts/neoclassical.prompt";
import { systemPrompt } from "@/lib/prompts/normal.prompt";

interface Message {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
  experimental_attachments?: Array<{
    name?: string;
    contentType?: string;
    url?: string;
    content?: string;
  }>;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Auth check
    const { getToken } = await auth();
    const token = await getToken();
    if (!token) return new Response("Unauthorized", { status: 401 });

    const { id: workspaceId } = await params;
    if (!workspaceId)
      return new Response("Workspace ID is required", { status: 400 });

    const { messages, system, temperature } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response("Invalid messages payload", { status: 400 });
    }

    // Get controllers
    const wsCtrl = serverContainer.get<WorkspaceMessagesController>(
      TYPES.WorkspaceMessagesController,
    );
    const workspaceCtrl = serverContainer.get<WorkspaceController>(
      TYPES.WorkspaceController,
    );
    const ctxCtrl = serverContainer.get<RedisContextController>(
      TYPES.RedisContextController,
    );

    // Get last user message
    const lastUser = messages.filter((m: Message) => m.role === "user").pop();
    if (!lastUser)
      return new Response("No user message found", { status: 400 });

    // System prompt selection
    const selectedSystemPrompt =
      {
        normal: systemPrompt,
        classical: classicalPrompt,
        keynesian: keynesianPrompt,
        marxist: marxistPrompt,
        neoclassical: neoclassicalPrompt,
      }[system as string] ?? systemPrompt;

    // API setup
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey)
      return new Response("Service configuration error", { status: 500 });

    const modelId = "gemini-2.5-flash";

    // Phase 1: Grounding
    const groundingModel = createGoogleGenerativeAI({ apiKey })(modelId, {
      useSearchGrounding: true,
    });
    const ground = await generateText({
      model: groundingModel,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        experimental_attachments: msg.experimental_attachments,
      })),
      system: selectedSystemPrompt,
      temperature: parseFloat(temperature) || 0.7,
    });

    // Extract grounding context
    const groundedContext = ground.providerMetadata?.google?.groundingMetadata;
    let searchQueries: string[] = [];

    if (groundedContext && typeof groundedContext === "object") {
      if (
        "searchQueries" in groundedContext &&
        Array.isArray(groundedContext.searchQueries)
      ) {
        searchQueries = groundedContext.searchQueries
          .filter((q: any) => typeof q === "string")
          .map((q: any) => q as string);
      } else if (
        "sources" in groundedContext &&
        Array.isArray(groundedContext.sources)
      ) {
        searchQueries = groundedContext.sources
          .map((source: any) => source.searchQuery)
          .filter((query: any) => typeof query === "string" && query.trim());
      }
    }

    const groundText =
      searchQueries.length > 0
        ? `Grounding Context:\nSearch queries used: ${searchQueries.join(", ")}\n\n`
        : ""; // Phase 2: Streaming with tools
    const streamModel = createGoogleGenerativeAI({ apiKey })(modelId, {
      useSearchGrounding: false,
    });
    const augmentMessages = groundText
      ? [{ role: "system" as const, content: groundText }, ...messages]
      : messages;

    // Prepare user message data for later persistence
    const userMessageId = uuidv4();
    const attachments = lastUser.experimental_attachments || [];
    const userMessageContent =
      lastUser.content +
      (attachments.length > 0
        ? `\n\n[Attachments: ${attachments.map((a: any) => a.name).join(", ")}]`
        : "");

    // Generate streaming response
    const result = streamText({
      model: streamModel,
      messages: augmentMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        experimental_attachments: msg.experimental_attachments,
      })),
      system: selectedSystemPrompt,
      tools: {
        chartTool,
        economicIndicatorTool,
        economicNewsTool,
      },
      maxSteps: 5,
      temperature: parseFloat(temperature) || 0.7,
      maxTokens: 2000,
      abortSignal: req.signal,
      onError: ({ error }) => {
        console.error("Stream error:", error);
        // Don't persist user message if streaming fails
      },
      onFinish: async ({ text }) => {
        try {
          // First persist the user message now that we have a successful response
          await wsCtrl.insertMessageToWorkspace(
            {
              id: userMessageId,
              workspace_id: workspaceId,
              role: "user",
              content: userMessageContent,
              created_at: new Date().toISOString(),
            },
            token,
          );

          // Update Redis context with user message
          try {
            await ctxCtrl.pushMessage(workspaceId, {
              role: "user",
              content: lastUser.content,
              timestamp: new Date().toISOString(),
            });
          } catch (error) {
            console.error("Failed to update Redis with user message:", error);
          }

          // Process grounding metadata for storage
          let groundingChunks: any = undefined;
          let persistSearchQueries = searchQueries;

          if (
            groundedContext &&
            typeof groundedContext === "object" &&
            groundedContext !== null &&
            "sources" in groundedContext &&
            Array.isArray((groundedContext as any).sources)
          ) {
            groundingChunks = (groundedContext as any).sources
              .filter((source: any) => source.chunk?.web)
              .map((source: any) => ({
                web: {
                  uri: source.chunk.web.uri,
                  title:
                    source.chunk.web.title ||
                    new URL(source.chunk.web.uri).hostname,
                },
              }));
          }

          const meta =
            groundingChunks?.length > 0 || persistSearchQueries.length > 0
              ? JSON.stringify({
                  grounding: {
                    groundingChunks,
                    searchQueries: persistSearchQueries,
                  },
                })
              : null; // Persist assistant message
          const assistantMessageId = uuidv4();
          await wsCtrl.insertMessageToWorkspace(
            {
              id: assistantMessageId,
              workspace_id: workspaceId,
              role: "assistant",
              content: text,
              created_at: new Date().toISOString(),
              metadata: meta,
            },
            token,
          );

          // Update Redis context with assistant response
          try {
            await ctxCtrl.pushMessage(workspaceId, {
              role: "assistant",
              content: text,
              timestamp: new Date().toISOString(),
              ...(meta
                ? {
                    grounding: {
                      groundingChunks,
                      searchQueries: persistSearchQueries,
                    },
                  }
                : {}),
            } as any);
          } catch (error) {
            console.error(
              "Failed to update Redis with assistant message:",
              error,
            );
          }
        } catch (error) {
          console.error("Error persisting messages:", error);
        }
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in workspace chat handler:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
