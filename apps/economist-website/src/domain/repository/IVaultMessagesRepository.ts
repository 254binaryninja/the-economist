import { Tables, TablesInsert, TablesUpdate } from "@/types/database";

export type VaultMessage = Tables<"vault_messages">;
export type VaultMessageInsert = TablesInsert<"vault_messages">;
export type VaultMessageUpdate = TablesUpdate<"vault_messages">;

/**This interface handles DB , */
export interface IVaultMessagesRepository {
  setToken(token: string): Promise<void>;
  getMessagesByVaultId(vaultId: string): Promise<VaultMessage[]>;
  insertMessageToVault(vaultMessage: VaultMessageInsert): Promise<VaultMessage>;
  updateMessageInVault(
    id: string,
    vaultMessage: VaultMessageUpdate,
  ): Promise<VaultMessage | null>;
}
