import { Tables,TablesInsert,TablesUpdate } from "@/types/database";

export type VaultDocumentChunk = Tables<'vault_document_chunks'>;
export type VaultDocumentChunkInsert = TablesInsert<'vault_document_chunks'>;
export type VaultDocumentChunkUpdate = TablesUpdate<'vault_document_chunks'>;

export interface IVaultDocumentChunkRepository {
    setToken(token: string): Promise<void>;
    getByVaultDocumentId(vaultDocumentId: string): Promise<VaultDocumentChunk[]>;
    findById(id: string): Promise<VaultDocumentChunk | null>;
    create(vaultDocumentChunk: VaultDocumentChunkInsert): Promise<VaultDocumentChunk>;
    update(id: string, vaultDocumentChunk: VaultDocumentChunkUpdate): Promise<VaultDocumentChunk | null>;
    delete(id: string): Promise<void>;
}
