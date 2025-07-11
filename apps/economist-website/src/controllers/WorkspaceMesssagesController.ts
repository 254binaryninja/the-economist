import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import type {
  IWorkspaceMessagesRepository,
  WorkspaceMessageInsert,
  WorkspaceMessageUpdate,
} from "../domain/repository/IWorkspaceMessagesRepository";

@injectable()
export class WorkspaceMessagesController {
  constructor(
    @inject(TYPES.IWorkspaceMessagesRepository)
    private workspaceMessagesRepository: IWorkspaceMessagesRepository,
  ) {}

  async getMessagesByWorkspaceId(workspaceId: string, token: string) {
    await this.workspaceMessagesRepository.setToken(token);
    return this.workspaceMessagesRepository.getMessagesByWorkspaceId(
      workspaceId,
    );
  }

  async insertMessageToWorkspace(
    workspaceMessage: WorkspaceMessageInsert,
    token: string,
  ) {
    await this.workspaceMessagesRepository.setToken(token);
    return this.workspaceMessagesRepository.insertMessageToWorkspace(
      workspaceMessage,
    );
  }

  async updateMessageInWorkspace(
    id: string,
    workspaceMessage: WorkspaceMessageUpdate,
    token: string,
  ) {
    await this.workspaceMessagesRepository.setToken(token);
    return this.workspaceMessagesRepository.updateMessageInWorkspace(
      id,
      workspaceMessage,
    );
  }
}
