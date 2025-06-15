import { supabaseManager } from "@/lib/supabase";
import { injectable } from "inversify";
import { SupabaseClient } from "@supabase/supabase-js";
import { IWorkspaceRepository, Workspace, WorkspaceInsert, WorkspaceUpdate } from "../repository/IWorkspaceRepository";


@injectable()
export class WorkspaceService implements IWorkspaceRepository {
    private token: string | null = null;

    private getSupabaseClient ():SupabaseClient {
        return supabaseManager.getClient(this.token || undefined);
    }

    async setToken(token: string): Promise<void> {
        this.token = token;
    }

    async getByUserId(userId: string): Promise<Workspace[]> {
        const supabaseWithAuth = this.getSupabaseClient();
        const { data, error } = await supabaseWithAuth
            .from('workspaces')
            .select('*')
            .eq('user_id', userId);

    if (error) {
        console.error("Error fetching workspaces by user ID:", error);
        return [];    
    }
    
        return data as Workspace[] || [];
}

    async findById(id: string): Promise<Workspace | null> {
        const supabaseWithAuth = this.getSupabaseClient();
        const { data, error } = await supabaseWithAuth
            .from('workspaces')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error("Error fetching workspace by ID:", error);
            return null;
        }

        return data as Workspace | null;
    }

    async findByName(name: string): Promise<Workspace | null> {
        const supabaseWithAuth = this.getSupabaseClient();
        const { data, error } = await supabaseWithAuth
            .from('workspaces')
            .select('*')
            .eq('name', name)
            .single();

        if (error) {
            console.error("Error fetching workspace by name:", error);
            return null;
        }

        return data as Workspace | null;
    }

    async create(workspace: WorkspaceInsert): Promise<Workspace> {
        const supabaseWithAuth = this.getSupabaseClient();
        const { data, error } = await supabaseWithAuth
            .from('workspaces')
            .insert(workspace)
            .select('*')
            .single();

        if (error) {
            console.error("Error creating workspace:", error);
            throw new Error("Workspace creation failed");
        }

        return data as Workspace;
    }

    async update(id: string, workspace: WorkspaceUpdate): Promise<Workspace | null> {
        const supabaseWithAuth = this.getSupabaseClient();
        const { data, error } = await supabaseWithAuth
            .from('workspaces')
            .update(workspace)
            .eq('id', id)
            .select('*')
            .single();

        if (error) {
            console.error("Error updating workspace:", error);
            return null;
        }   
        return data as Workspace | null;    
    }
    
    async delete(id: string): Promise<void> {
        const supabaseWithAuth = this.getSupabaseClient();
        const { error } = await supabaseWithAuth
            .from('workspaces')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting workspace:", error);
            throw new Error("Workspace deletion failed");
        }
    }
}