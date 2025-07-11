import { WorkspaceMessage } from "@/src/domain/repository/IWorkspaceMessagesRepository";
import { supabaseManager } from "../supabase";

export async function fetchLastMessagesFromDB(
  workspaceId: string,
  limit: number,
  token: string,
): Promise<WorkspaceMessage[]> {
  if (!workspaceId || !limit || limit <= 0) {
    console.error("Invalid parameters for fetching messages");
    return [];
  }
  const supabaseWithAuth = supabaseManager.getClient(token);
  const { data, error } = await supabaseWithAuth
    .from("workspace_messages")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching last messages:", error);
    return [];
  }

  return (data as WorkspaceMessage[]) || [];
}

export async function saveMessageToDB(
  workspace_id: string,
  message: WorkspaceMessage,
  token: string,
): Promise<WorkspaceMessage | null> {
  const supabaseWithAuth = supabaseManager.getClient(token);
  const { data, error } = await supabaseWithAuth
    .from("workspace_messages")
    .insert({ ...message, workspace_id })
    .select("*")
    .single();

  if (error) {
    console.error("Error saving message:", error);
    return null;
  }

  return data as WorkspaceMessage | null;
}
