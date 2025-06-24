import { Tables, TablesInsert, TablesUpdate } from "@/types/database";

export type WorkspaceMessage = Tables<"workspace_messages">;
export type WorkspaceMessageInsert = TablesInsert<"workspace_messages">;
export type WorkspaceMessageUpdate = TablesUpdate<"workspace_messages">;

/**This interface handles DB , */
export interface IWorkspaceMessagesRepository {
  setToken(token: string): Promise<void>;
  getMessagesByWorkspaceId(workspaceId: string): Promise<WorkspaceMessage[]>;
  insertMessageToWorkspace(
    workspaceMessage: WorkspaceMessageInsert,
  ): Promise<WorkspaceMessage>;
  updateMessageInWorkspace(
    id: string,
    workspaceMessage: WorkspaceMessageUpdate,
  ): Promise<WorkspaceMessage | null>;
}
