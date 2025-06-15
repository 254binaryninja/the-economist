import { injectable } from "inversify"
import { supabaseManager } from "@/lib/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { IVaultDocumentRepository, VaultDocument, VaultDocumentInsert, VaultDocumentUpdate } from "../repository/IVaultDocumentRepository";


@injectable()
export class IVaultDocumentService implements IVaultDocumentRepository {
    private token: string | null = null;

    private getSupabaseClient(): SupabaseClient {
        return supabaseManager.getClient(this.token || undefined);
    }

    async setToken(token: string): Promise<void> {
        this.token = token;
    }
    async getByVaultId(vaultId: string): Promise<VaultDocument[]> {
        const supabaseWithAuth = this.getSupabaseClient();
        const { data, error } = await supabaseWithAuth
            .from('vault_documents')
            .select('*')
            .eq('vault_id', vaultId);

        if (error) {
            console.error("Error fetching documents by vault ID:", error);
            return [];
        }       

        return data as VaultDocument[] || [];
    }
    async findById(id: string): Promise<VaultDocument | null> {
        const supabaseWithAuth = this.getSupabaseClient();
        const { data, error } = await supabaseWithAuth
            .from('vault_documents')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error("Error fetching document by ID:", error);
            return null;
        }

        return data as VaultDocument;
    }
    async create(vaultDocument: VaultDocumentInsert): Promise<VaultDocument> {
        const supabaseWithAuth = this.getSupabaseClient();
        const { data, error } = await supabaseWithAuth
            .from('vault_documents')
            .insert(vaultDocument)
            .single();

        if (error) {
            console.error("Error creating document:", error);
            throw new Error("Failed to create document");
        }

        return data as VaultDocument;
    }
    async update(id: string, vaultDocument: VaultDocumentUpdate): Promise<VaultDocument | null> {
        const supabaseWithAuth = this.getSupabaseClient();
        const { data, error } = await supabaseWithAuth
            .from('vault_documents')
            .update(vaultDocument)
            .eq('id', id)
            .single();

        if (error) {
            console.error("Error updating document:", error);
            return null;
        }

        return data as VaultDocument;
    }
    async delete(id: string): Promise<void> {
        const supabaseWithAuth = this.getSupabaseClient();
        const { error } = await supabaseWithAuth
            .from('vault_documents')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting document:", error);
            throw new Error("Failed to delete document");
        }
    }
}