import { supabaseManager } from "@/lib/supabase";
import { injectable } from "inversify";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  IVaultRepository,
  Vault,
  VaultInsert,
  VaultUpdate,
} from "../repository/IVaultRepository";

@injectable()
export class VaultService implements IVaultRepository {
  private token: string | null = null;

  private getSupabaseClient(): SupabaseClient {
    return supabaseManager.getClient(this.token || undefined);
  }

  async setToken(token: string): Promise<void> {
    this.token = token;
  }

  async getByUserId(userId: string): Promise<Vault[]> {
    const supabaseWithAuth = this.getSupabaseClient();
    const { data, error } = await supabaseWithAuth
      .from("vault")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching vaults by user ID:", error);
      return [];
    }

    return (data as Vault[]) || [];
  }

  async findById(id: string): Promise<Vault | null> {
    const supabaseWithAuth = this.getSupabaseClient();
    const { data, error } = await supabaseWithAuth
      .from("vault")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching vault by ID:", error);
      return null;
    }

    return data as Vault | null;
  }

  async create(vault: VaultInsert): Promise<Vault> {
    const supabaseWithAuth = this.getSupabaseClient();
    const { data, error } = await supabaseWithAuth
      .from("vault")
      .insert(vault)
      .select("*")
      .single();

    if (error) {
      console.error("Error creating vault:", error);
      throw new Error("Vault creation failed");
    }

    return data as Vault;
  }

  async update(id: string, vault: VaultUpdate): Promise<Vault | null> {
    const supabaseWithAuth = this.getSupabaseClient();
    const { data, error } = await supabaseWithAuth
      .from("vault")
      .update(vault)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Error updating vault:", error);
      return null;
    }

    return data as Vault | null;
  }

  async delete(id: string): Promise<void> {
    const supabaseWithAuth = this.getSupabaseClient();
    const { error } = await supabaseWithAuth
      .from("vault")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting vault:", error);
      throw new Error("Vault deletion failed");
    }
  }
}
