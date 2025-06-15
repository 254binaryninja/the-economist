import { injectable } from "inversify"
import { supabaseManager } from "@/lib/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { IVaultDocumentChunkRepository, VaultDocumentChunk, VaultDocumentChunkInsert, VaultDocumentChunkUpdate } from "../repository/IVaultDocumentChunkRepository";


@injectable()
export class IVaultDocumentChunkService implements IVaultDocumentChunkRepository {
    private token: string | null = null;

    private getSupabaseClient(): SupabaseClient {
        return supabaseManager.getClient(this.token || undefined);
    }

    async setToken(token: string): Promise<void> {
        this.token = token;
    }
    async getByVaultDocumentId(vaultDocumentId: string): Promise<VaultDocumentChunk[]> {
        const supabaseWithAuth = this.getSupabaseClient();
        const { data, error } = await supabaseWithAuth
            .from('vault_document_chunks')
            .select('*')
            .eq('vault_document_id', vaultDocumentId);

        if (error) {
            console.error("Error fetching document chunks by vault document ID:", error);
            return [];
        }

        return data as VaultDocumentChunk[] || [];
    }
    async findById(id: string): Promise<VaultDocumentChunk | null> {
        const supabaseWithAuth = this.getSupabaseClient();
        const { data, error } = await supabaseWithAuth
            .from('vault_document_chunks')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error("Error fetching document chunk by ID:", error);
            return null;
        }

        return data as VaultDocumentChunk || null;
    }
    async create(vaultDocumentChunk: VaultDocumentChunkInsert): Promise<VaultDocumentChunk> {
        const supabaseWithAuth = this.getSupabaseClient();
        const { data, error } = await supabaseWithAuth
            .from('vault_document_chunks')
            .insert([vaultDocumentChunk])
            .select()
            .single();

        if (error) {
            throw new Error(`Error creating document chunk: ${error.message}`);
        }

        return data as VaultDocumentChunk;
    }
    async update(id: string, vaultDocumentChunk: VaultDocumentChunkUpdate): Promise<VaultDocumentChunk | null> {
        const supabaseWithAuth = this.getSupabaseClient();
        const { data, error } = await supabaseWithAuth
            .from('vault_document_chunks')
            .update(vaultDocumentChunk)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error("Error updating document chunk:", error);
            return null;
        }

        return data as VaultDocumentChunk || null;
    }
    async delete(id: string): Promise<void> {
        const supabaseWithAuth = this.getSupabaseClient();
        const { error } = await supabaseWithAuth
            .from('vault_document_chunks')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting document chunk:", error);
            throw new Error(`Error deleting document chunk: ${error.message}`);
        }
    }
}