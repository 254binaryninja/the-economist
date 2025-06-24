import { injectable } from "inversify";
import { IWorkspaceMessagesRepository } from "../repository/IWorkspaceMessagesRepository";
import { WorkspaceMessage, WorkspaceMessageInsert, WorkspaceMessageUpdate } from "../repository/IWorkspaceMessagesRepository";
import { supabaseManager } from "@/lib/supabase";
import { SupabaseClient } from "@supabase/supabase-js";



@injectable()
export class WorkspaceMessagesService implements IWorkspaceMessagesRepository {
    private token: string | null = null;

    private getSupabaseClient(): SupabaseClient {
        return supabaseManager.getClient(this.token || undefined);
    }

    async setToken(token: string): Promise<void> {
        this.token = token;
    }

    async getMessagesByWorkspaceId(workspaceId: string): Promise<WorkspaceMessage[]> {
        const supabaseWithAuth = this.getSupabaseClient();
        const { data, error } = await supabaseWithAuth
            .from('workspace_messages')
            .select('*')
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: true })
            ;

        if (error) {
            console.error("Error fetching messages by workspace ID:", error);
            return [];
        }

        return data as WorkspaceMessage[] || [];
    }

    async insertMessageToWorkspace(workspaceMessage: WorkspaceMessageInsert): Promise<WorkspaceMessage> {
        const supabaseWithAuth = this.getSupabaseClient();
        const { data, error } = await supabaseWithAuth
            .from('workspace_messages')
            .insert(workspaceMessage)
            .single();

        if (error) {
            console.error("Error inserting message to workspace:", error);
            throw new Error("Failed to insert message");
        }

        return data as WorkspaceMessage;
    }

    async updateMessageInWorkspace(id: string, workspaceMessage: WorkspaceMessageUpdate): Promise<WorkspaceMessage | null> {
        const supabaseWithAuth = this.getSupabaseClient();
        const { data, error } = await supabaseWithAuth
            .from('workspace_messages')
            .update(workspaceMessage)
            .eq('id', id)
            .single();

        if (error) {
            console.error("Error updating message in workspace:", error);
            return null;
        }

        return data as WorkspaceMessage;
    }
}