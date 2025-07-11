import { injectable } from "inversify";
import { supabaseManager } from "@/lib/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  IVaultWorkflowRepository,
  VaultWorkflow,
  VaultWorkflowInsert,
  VaultWorkflowUpdate,
} from "../repository/IVaultWorkflowRepository";

@injectable()
export class IVaultWorkflowService implements IVaultWorkflowRepository {
  private token: string | null = null;

  private getSupabaseClient(): SupabaseClient {
    return supabaseManager.getClient(this.token || undefined);
  }

  async setToken(token: string): Promise<void> {
    this.token = token;
  }
  async getByVaultId(vaultId: string): Promise<VaultWorkflow[]> {
    const supabaseWithAuth = this.getSupabaseClient();
    const { data, error } = await supabaseWithAuth
      .from("vault_workflows")
      .select("*")
      .eq("vault_id", vaultId);

    if (error) {
      console.error("Error fetching workflows by vault ID:", error);
      return [];
    }

    return (data as VaultWorkflow[]) || [];
  }
  async findById(id: string): Promise<VaultWorkflow | null> {
    const supabaseWithAuth = this.getSupabaseClient();
    const { data, error } = await supabaseWithAuth
      .from("vault_workflows")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching workflow by ID:", error);
      return null;
    }

    return (data as VaultWorkflow) || null;
  }
  async create(vaultWorkflow: VaultWorkflowInsert): Promise<VaultWorkflow> {
    const supabaseWithAuth = this.getSupabaseClient();
    const { data, error } = await supabaseWithAuth
      .from("vault_workflows")
      .insert([vaultWorkflow])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating workflow: ${error.message}`);
    }

    return data as VaultWorkflow;
  }
  async update(
    id: string,
    vaultWorkflow: VaultWorkflowUpdate,
  ): Promise<VaultWorkflow | null> {
    const supabaseWithAuth = this.getSupabaseClient();
    const { data, error } = await supabaseWithAuth
      .from("vault_workflows")
      .update(vaultWorkflow)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating workflow:", error);
      return null;
    }

    return (data as VaultWorkflow) || null;
  }
  async delete(id: string): Promise<void> {
    const supabaseWithAuth = this.getSupabaseClient();
    const { error } = await supabaseWithAuth
      .from("vault_workflows")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting workflow:", error);
      throw new Error(`Error deleting workflow: ${error.message}`);
    }
  }
}
