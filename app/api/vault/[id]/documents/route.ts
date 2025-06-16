//app/api/vault/[id]/documents/route.ts

import { NextRequest } from 'next/server';
import { container } from '@/src/config/inversify.config';
import { TYPES } from '@/src/config/types';
import { VaultDocumentController } from '@/src/controllers/VaultDocumentController';
import { VaultDocumentChunkController } from '@/src/controllers/VaultDocumentChunkController';
import { TextEmbeddingController } from '@/src/controllers/TextEmbeddingController';
import { PineconeVaultController } from '@/src/controllers/PineconeVaultController';
import { auth } from '@clerk/nextjs/server';
import { v4 as uuidv4 } from 'uuid';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/toolResponse';

interface ProcessDocumentRequest {
  documentName: string;
  documentType: 'pdf' | 'docx' | 'xlsx' | 'txt' | 'csv' | 'url';
  content?: string; // For URL or direct text input
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user
    const { getToken, userId } = await auth();
    const token = await getToken();    if (!token || !userId) {
      return Response.json(
        createErrorResponse('Authentication required', 'AUTH_ERROR'),
        { status: 401 }
      );
    }

    // Await params to get vault ID
    const { id: vaultId } = await params;
    if (!vaultId) {
      return Response.json(
        createErrorResponse('Vault ID is required', 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    // Get controllers from DI container
    const vaultDocumentController = container.get<VaultDocumentController>(TYPES.VaultDocumentController);
    const vaultDocumentChunkController = container.get<VaultDocumentChunkController>(TYPES.VaultDocumentChunkController);
    const textEmbeddingController = container.get<TextEmbeddingController>(TYPES.TextEmbeddingController);
    const pineconeVaultController = container.get<PineconeVaultController>(TYPES.PineconeVaultController);

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;
    const url = formData.get('url') as string;

    let extractedText: string;
    let documentName: string;
    let filePath: string | null = null;

    if (file) {
      // Handle file upload
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Create uploads directory
      const uploadsDir = join(process.cwd(), 'uploads', vaultId);
      await mkdir(uploadsDir, { recursive: true });
      
      // Save file temporarily
      filePath = join(uploadsDir, file.name);
      await writeFile(filePath, buffer);
      
      documentName = file.name;
      extractedText = await textEmbeddingController.extractText(filePath);
    } else if (url) {
      // Handle URL extraction
      documentName = `URL: ${new URL(url).hostname}`;
      extractedText = await textEmbeddingController.extractTextFromUrl(url);    } else {
      return Response.json(
        createErrorResponse('Either file or URL must be provided', 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return Response.json(
        createErrorResponse('No text could be extracted from the document', 'NO_DATA'),
        { status: 400 }
      );
    }

    // Generate document metadata
    const documentMetadata = await textEmbeddingController.generateDocumentMetadata({
      text: extractedText,
      type: documentType as any
    });

    // Create document record in database
    const documentId = uuidv4();
    const vaultDocument = await vaultDocumentController.create({
      id: documentId,
      vault_id: vaultId,
      document_name: documentMetadata.documentName,
      document_type: documentType,
      document_metadata: JSON.stringify(documentMetadata),
      document_size: extractedText.length.toString()
    }, token);

    // Process text into chunks and generate embeddings
    const textChunkEmbeddings = await textEmbeddingController.embedText(extractedText);

    // Prepare vectors for Pinecone with enhanced metadata
    const vectors = textChunkEmbeddings.map((chunk, index) => ({
      embedding: chunk.embedding,
      metadata: {
        vault_id: vaultId,
        document_id: documentId,
        file_name: documentMetadata.documentName,
        document_type: documentType,
        chunk_index: index,
        text: chunk.content,
        document_summary: documentMetadata.documentSummary,
        created_at: new Date().toISOString(),
        user_id: userId
      }
    }));

    // Store vectors in Pinecone using vault ID as namespace
    const vectorIds = await pineconeVaultController.upsertChunks(vaultId, vectors);

    // Create document chunk records in database
    const chunkPromises = vectorIds.map((vectorId, index) =>
      vaultDocumentChunkController.create({
        id: vectorId, // Use Pinecone vector ID
        document_id: documentId,
        user_id: userId,
        chunk_index: index
      }, token)
    );

    await Promise.all(chunkPromises);

    // Clean up temporary file if it exists
    if (filePath) {
      try {
        const { unlink } = await import('fs/promises');
        await unlink(filePath);
      } catch (error) {
        console.warn('Failed to clean up temporary file:', error);
      }
    }    return Response.json(
      createSuccessResponse({
        documentId,
        documentName: documentMetadata.documentName,
        chunkCount: textChunkEmbeddings.length,
        documentSummary: documentMetadata.documentSummary
      })
    );

  } catch (error) {
    console.error('Error processing document:', error);
    
    if (error instanceof Error) {      if (error.message.includes('authentication')) {
        return Response.json(
          createErrorResponse('Authentication failed', 'AUTH_ERROR'),
          { status: 401 }
        );
      }
      if (error.message.includes('extraction')) {
        return Response.json(
          createErrorResponse('Document text extraction failed', 'FETCH_ERROR'),
          { status: 400 }
        );
      }
    }
    
    return Response.json(
      createErrorResponse('Document processing failed', 'UNKNOWN_ERROR'),
      { status: 500 }
    );
  }
}

// GET documents for a vault
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    // Await params to get vault ID
    const { id: vaultId } = await params;
    if (!vaultId) {
      return Response.json(
        createErrorResponse('Vault ID is required', 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    const vaultDocumentController = container.get<VaultDocumentController>(TYPES.VaultDocumentController);
    const documents = await vaultDocumentController.getByVaultId(vaultId, token);

    return Response.json(
      createSuccessResponse({ documents })
    );

  } catch (error) {
    console.error('Error fetching documents:', error);
    return Response.json(
      createErrorResponse('Failed to fetch documents', 'UNKNOWN_ERROR'),
      { status: 500 }
    );
  }
}
