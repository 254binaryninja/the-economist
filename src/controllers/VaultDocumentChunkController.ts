import { inject, injectable } from 'inversify';
import { TYPES } from '../config/types';
import type { IVaultDocumentChunkRepository, VaultDocumentChunkInsert, VaultDocumentChunkUpdate } from '../domain/repository/IVaultDocumentChunkRepository';

@injectable()
export class VaultDocumentChunkController {
    constructor(
        @inject(TYPES.IVaultDocumentChunkRepository) private vaultDocumentChunkRepository: IVaultDocumentChunkRepository
    ) {}

    async getByVaultDocumentId(vaultDocumentId: string, token: string) {
        await this.vaultDocumentChunkRepository.setToken(token);
        return this.vaultDocumentChunkRepository.getByVaultDocumentId(vaultDocumentId);
    }

    async findById(id: string, token: string) {
        await this.vaultDocumentChunkRepository.setToken(token);
        return this.vaultDocumentChunkRepository.findById(id);
    }

    async create(vaultDocumentChunk: VaultDocumentChunkInsert, token: string) {
        await this.vaultDocumentChunkRepository.setToken(token);
        return this.vaultDocumentChunkRepository.create(vaultDocumentChunk);
    }

    async update(id: string, vaultDocumentChunk: VaultDocumentChunkUpdate, token: string) {
        await this.vaultDocumentChunkRepository.setToken(token);
        return this.vaultDocumentChunkRepository.update(id, vaultDocumentChunk);
    }

    async delete(id: string, token: string) {
        await this.vaultDocumentChunkRepository.setToken(token);
        return this.vaultDocumentChunkRepository.delete(id);
    }
}
