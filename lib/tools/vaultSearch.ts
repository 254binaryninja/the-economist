// lib/tools/vaultSearch.ts

import { tool } from 'ai';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/toolResponse';

export const vaultSearchTool = tool({
  description: 'Search through documents in a vault using semantic similarity. Helps find relevant information from uploaded documents.',
  parameters: z.object({
    vaultId: z.string().describe('The ID of the vault to search in'),
    query: z.string().describe('The search query to find relevant documents'),
    topK: z.number().optional().default(5).describe('Number of results to return (default: 5)'),
    scoreThreshold: z.number().optional().default(0.75).describe('Minimum similarity score threshold (default: 0.75)'),
    documentType: z.string().optional().describe('Filter by document type (pdf, docx, txt, etc.)'),
  }),
  execute: async ({ vaultId, query, topK, scoreThreshold, documentType }) => {
    try {
      // In a real implementation, this would call the vault search API
      // For now, return a structured response that matches our API
      
      if (!vaultId || !query) {
        return createErrorResponse(
          'Vault ID and search query are required',
          'VALIDATION_ERROR',
          'Both vaultId and query parameters must be provided.',
          'Please provide both a vault ID and a search query.'
        );
      }

      // This would typically make an API call to /api/vault/[id]/search
      // For demonstration, returning a structured success response
      return createSuccessResponse({
        message: `Searching vault ${vaultId} for: "${query}"`,
        searchParams: {
          query,
          topK,
          scoreThreshold,
          documentType: documentType || 'all types'
        },
        instruction: 'This tool should be integrated with the vault search API endpoint to provide actual search results.'
      });

    } catch (error) {
      console.error('Vault search tool error:', error);
      return createErrorResponse(
        'Vault search failed',
        'UNKNOWN_ERROR',
        error instanceof Error ? error.message : 'An unexpected error occurred',
        'Please try again or check if the vault exists and is accessible.'
      );
    }
  },
});

export const vaultDocumentTool = tool({
  description: 'Get information about documents in a vault, including metadata and summaries.',
  parameters: z.object({
    vaultId: z.string().describe('The ID of the vault to get documents from'),
    documentId: z.string().optional().describe('Specific document ID to get details for'),
  }),
  execute: async ({ vaultId, documentId }) => {
    try {
      if (!vaultId) {
        return createErrorResponse(
          'Vault ID is required',
          'VALIDATION_ERROR',
          'A vault ID must be provided to fetch documents.',
          'Please provide a valid vault ID.'
        );
      }

      if (documentId) {
        return createSuccessResponse({
          message: `Getting details for document ${documentId} in vault ${vaultId}`,
          action: 'get_single_document',
          instruction: 'This tool should be integrated with GET /api/vault/[id]/documents/[documentId] endpoint.'
        });
      } else {
        return createSuccessResponse({
          message: `Getting all documents in vault ${vaultId}`,
          action: 'get_all_documents',
          instruction: 'This tool should be integrated with GET /api/vault/[id]/documents endpoint.'
        });
      }

    } catch (error) {
      console.error('Vault document tool error:', error);
      return createErrorResponse(
        'Failed to get vault documents',
        'UNKNOWN_ERROR',
        error instanceof Error ? error.message : 'An unexpected error occurred',
        'Please try again or check if the vault exists and is accessible.'
      );
    }
  },
});
