//app/api/vault/[id]/documents/[documentId]/route.ts

import { NextRequest } from 'next/server';
import { container } from '@/src/config/inversify.config';
import { TYPES } from '@/src/config/types';
import { VaultDocumentController } from '@/src/controllers/VaultDocumentController';
import { VaultDocumentChunkController } from '@/src/controllers/VaultDocumentChunkController';
import { PineconeVaultController } from '@/src/controllers/PineconeVaultController';
import { auth } from '@clerk/nextjs/server';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/toolResponse';

// DELETE a specific document from a vault
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    // Get authenticated user
    const { getToken, userId } = await auth();
    const token = await getToken();
    
    if (!token || !userId) {
      return Response.json(
        createErrorResponse('Authentication required', 'AUTH_ERROR'),
        { status: 401 }
      );
    }

    // Await params to get vault ID and document ID
    const { id: vaultId, documentId } = await params;
    
    if (!vaultId) {
      return Response.json(
        createErrorResponse('Vault ID is required', 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    if (!documentId) {
      return Response.json(
        createErrorResponse('Document ID is required', 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    // Get controllers from DI container
    const vaultDocumentController = container.get<VaultDocumentController>(TYPES.VaultDocumentController);
    const vaultDocumentChunkController = container.get<VaultDocumentChunkController>(TYPES.VaultDocumentChunkController);
    const pineconeVaultController = container.get<PineconeVaultController>(TYPES.PineconeVaultController);

    // First, verify that the document exists and belongs to the vault
    const document = await vaultDocumentController.findById(documentId, token);
    
    if (!document) {
      return Response.json(
        createErrorResponse('Document not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }

    if (document.vault_id !== vaultId) {
      return Response.json(
        createErrorResponse('Document does not belong to this vault', 'AUTH_ERROR'),
        { status: 403 }
      );
    }

    // Get all document chunks for this document
    const documentChunks = await vaultDocumentChunkController.getByVaultDocumentId(documentId, token);

    // Delete vectors from Pinecone (using vault ID as namespace)
    if (documentChunks.length > 0) {
      const vectorIds = documentChunks.map(chunk => chunk.id);
      await pineconeVaultController.deleteByIds(vaultId, vectorIds);
    }

    // Delete document chunks from database
    await Promise.all(
      documentChunks.map(chunk => 
        vaultDocumentChunkController.delete(chunk.id, token)
      )
    );

    // Finally, delete the document record from database
    await vaultDocumentController.delete(documentId, token);

    return Response.json(
      createSuccessResponse({
        message: 'Document deleted successfully',
        documentId,
        deletedChunks: documentChunks.length
      })
    );

  } catch (error) {
    console.error('Error deleting document:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('authentication')) {
        return Response.json(
          createErrorResponse('Authentication failed', 'AUTH_ERROR'),
          { status: 401 }
        );
      }
      if (error.message.includes('not found')) {
        return Response.json(
          createErrorResponse('Document not found', 'NOT_FOUND'),
          { status: 404 }
        );
      }
      if (error.message.includes('permission') || error.message.includes('forbidden')) {
        return Response.json(
          createErrorResponse('Access denied', 'AUTH_ERROR'),
          { status: 403 }
        );
      }
    }
    
    return Response.json(
      createErrorResponse('Document deletion failed', 'UNKNOWN_ERROR'),
      { status: 500 }
    );
  }
}

// GET a specific document from a vault
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    // Get authenticated user
    const { getToken } = await auth();
    const token = await getToken();
    
    if (!token) {
      return Response.json(
        createErrorResponse('Authentication required', 'AUTH_ERROR'),
        { status: 401 }
      );
    }

    // Await params to get vault ID and document ID
    const { id: vaultId, documentId } = await params;
    
    if (!vaultId) {
      return Response.json(
        createErrorResponse('Vault ID is required', 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    if (!documentId) {
      return Response.json(
        createErrorResponse('Document ID is required', 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    const vaultDocumentController = container.get<VaultDocumentController>(TYPES.VaultDocumentController);
    
    // Get the document
    const document = await vaultDocumentController.findById(documentId, token);
    
    if (!document) {
      return Response.json(
        createErrorResponse('Document not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }

    // Verify document belongs to the vault
    if (document.vault_id !== vaultId) {
      return Response.json(
        createErrorResponse('Document does not belong to this vault', 'AUTH_ERROR'),
        { status: 403 }
      );
    }

    return Response.json(
      createSuccessResponse({ document })
    );

  } catch (error) {
    console.error('Error fetching document:', error);
    return Response.json(
      createErrorResponse('Failed to fetch document', 'UNKNOWN_ERROR'),
      { status: 500 }
    );
  }
}