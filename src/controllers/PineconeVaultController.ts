import { inject, injectable } from 'inversify';
import { TYPES } from '../config/types';
import type { IPineconeVaultRepository, VectorMetadata } from '../domain/repository/IPineconeVaultRepository';

@injectable()
export class PineconeVaultController {
    constructor(
        @inject(TYPES.IPineconeVaultRepository) private pineconeVaultRepository: IPineconeVaultRepository
    ) {}

    async upsertChunks(namespace: string, chunks: Array<{ embedding: number[]; metadata: VectorMetadata }>) {
        return this.pineconeVaultRepository.upsertChunks(namespace, chunks);
    }

    async query(namespace: string, embedding: number[], topK?: number, filter?: Record<string, any>) {
        return this.pineconeVaultRepository.query(namespace, embedding, topK, filter);
    }

    async deleteByIds(namespace: string, ids: string[]) {
        return this.pineconeVaultRepository.deleteByIds(namespace, ids);
    }

    async deleteByFilter(namespace: string, filter: Record<string, any>) {
        return this.pineconeVaultRepository.deleteByFilter(namespace, filter);
    }
}
