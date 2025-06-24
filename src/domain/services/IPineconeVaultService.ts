import { injectable } from "inversify";
import {
  IPineconeVaultRepository,
  QueryResult,
  VectorMetadata,
} from "../repository/IPineconeVaultRepository";
import { Pinecone, Index } from "@pinecone-database/pinecone";
import { v4 as uuidv4 } from "uuid";

@injectable()
export class IPineconeVaultService implements IPineconeVaultRepository {
  private indexName = "documents";
  private pc: Pinecone;
  private index: Index;

  constructor() {
    this.pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY || "",
    });
    this.index = this.pc.index(this.indexName);
  }

  async upsertChunks(
    namespace: string,
    chunks: Array<{ embedding: number[]; metadata: VectorMetadata }>,
  ): Promise<string[]> {
    try {
      const vectors = chunks.map((chunk) => ({
        id: uuidv4(),
        values: chunk.embedding,
        metadata: chunk.metadata,
      }));

      await this.index.namespace(namespace).upsert(vectors);

      return vectors.map((vector) => vector.id);
    } catch (error) {
      console.error("Error upserting chunks to Pinecone:", error);
      throw new Error("Failed to upsert chunks to Pinecone");
    }
  }

  async query(
    namespace: string,
    embedding: number[],
    topK: number = 10,
    filter?: Record<string, any>,
  ): Promise<QueryResult[]> {
    try {
      const queryRequest = {
        vector: embedding,
        topK,
        includeMetadata: true,
        includeValues: false,
        ...(filter && { filter }),
      };

      const queryResponse = await this.index
        .namespace(namespace)
        .query(queryRequest);

      return (
        queryResponse.matches?.map((match) => ({
          id: match.id,
          score: match.score,
          metadata: match.metadata as VectorMetadata,
        })) || []
      );
    } catch (error) {
      console.error("Error querying Pinecone:", error);
      throw new Error("Failed to query Pinecone");
    }
  }

  async deleteByIds(namespace: string, ids: string[]): Promise<void> {
    try {
      await this.index.namespace(namespace).deleteMany(ids);
    } catch (error) {
      console.error("Error deleting vectors by IDs from Pinecone:", error);
      throw new Error("Failed to delete vectors by IDs from Pinecone");
    }
  }

  async deleteByFilter(
    namespace: string,
    filter: Record<string, any>,
  ): Promise<void> {
    try {
      await this.index.namespace(namespace).deleteMany({ filter });
    } catch (error) {
      console.error("Error deleting vectors by filter from Pinecone:", error);
      throw new Error("Failed to delete vectors by filter from Pinecone");
    }
  }
}
