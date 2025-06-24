// IPineconeService.ts

export interface VectorMetadata {
  vault_id: string;
  file_name: string;
  chunk_index: number;
  text: string;
  [key: string]: any;
}

export interface QueryResult {
  id: string;
  score?: number;
  metadata?: VectorMetadata;
}

/**
 * Service for handling embeddings lifecycle within Pinecone,
 * including upserting multiple chunk embeddings, retrieval, and deletion.
 */
export interface IPineconeVaultRepository {
  /**
   * Upserts multiple chunk embeddings within a namespace.
   * Each chunk comes with its embedding vector and associated metadata.
   *
   * @param namespace - Namespace for multi-tenant separation (e.g., user ID)
   * @param chunks - Array of chunk embeddings with content and metadata
   * @returns Array of generated vector IDs (one per chunk)
   */
  upsertChunks(
    namespace: string,
    chunks: Array<{ embedding: number[]; metadata: VectorMetadata }>,
  ): Promise<string[]>;

  /**
   * Performs similarity search within a namespace, optionally scoped via metadata filters.
   *
   * @param namespace - The namespace to search within
   * @param embedding - Query embedding vector
   * @param topK - Number of results to return
   * @param filter - Metadata-based filter (e.g., { vault_id: { $eq: "vault123" } })
   * @returns List of matching vectors with scores and metadata
   */
  query(
    namespace: string,
    embedding: number[],
    topK?: number,
    filter?: Record<string, any>,
  ): Promise<QueryResult[]>;

  /**
   * Deletes specific vectors by their IDs within a namespace.
   *
   * @param namespace - Namespace to delete from
   * @param ids - List of vector IDs to delete
   */
  deleteByIds(namespace: string, ids: string[]): Promise<void>;

  /**
   * Deletes vectors matching a metadata filter in a namespace.
   *
   * @param namespace - Namespace to delete from
   * @param filter - Filter (Mongo-style) to identify vectors to delete :contentReference[oaicite:1]{index=1}
   */
  deleteByFilter(namespace: string, filter: Record<string, any>): Promise<void>;
}
