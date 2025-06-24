import { Tables, TablesInsert, TablesUpdate } from "@/types/database";

export type VaultDocumentInsert = TablesInsert<"vault_documents">;
export type VaultDocument = Tables<"vault_documents">;
export type VaultDocumentUpdate = TablesUpdate<"vault_documents">;

export interface IVaultDocumentRepository {
  setToken(token: string): Promise<void>;
  getByVaultId(vaultId: string): Promise<VaultDocument[]>;
  findById(id: string): Promise<VaultDocument | null>;
  create(vaultDocument: VaultDocumentInsert): Promise<VaultDocument>;
  update(
    id: string,
    vaultDocument: VaultDocumentUpdate,
  ): Promise<VaultDocument | null>;
  delete(id: string): Promise<void>;
}
