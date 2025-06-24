import { supabaseManager } from "@/lib/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { injectable } from "inversify";
import {
  IVaultMessagesRepository,
  VaultMessage,
  VaultMessageInsert,
  VaultMessageUpdate,
} from "../repository/IVaultMessagesRepository";

@injectable()
export class VaultMessagesService implements IVaultMessagesRepository {
  private token: string | null = null;

  private getSupabaseClient(): SupabaseClient {
    return supabaseManager.getClient(this.token || undefined);
  }

  async setToken(token: string): Promise<void> {
    this.token = token;
  }

  async getMessagesByVaultId(vaultId: string): Promise<VaultMessage[]> {
    const supabaseWithAuth = this.getSupabaseClient();
    const { data, error } = await supabaseWithAuth
      .from("vault_messages")
      .select("*")
      .eq("vault_id", vaultId);

    if (error) {
      console.error("Error getting messages from vault", error);
      throw Error("Error getting messages from vault");
    }

    return data;
  }

  async insertMessageToVault(
    vaultMessage: VaultMessageInsert,
  ): Promise<VaultMessage> {
    const supabaseWithAuth = this.getSupabaseClient();
    const { data, error } = await supabaseWithAuth
      .from("vault_messages")
      .insert(vaultMessage)
      .single();

    if (error) {
      console.error("Error inserting message to vault:", error);
      throw new Error("Failed to insert message");
    }

    return data as VaultMessage;
  }
  async updateMessageInVault(
    id: string,
    vaultMessage: VaultMessageUpdate,
  ): Promise<VaultMessage | null> {
    const supabaseWithAuth = this.getSupabaseClient();
    const { data, error } = await supabaseWithAuth
      .from("vault_messages")
      .update(vaultMessage)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error updating message in vault:", error);
      return null;
    }

    return data as VaultMessage;
  }
}
