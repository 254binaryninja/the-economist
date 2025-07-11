import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import type {
  IWorkspaceRepository,
  WorkspaceInsert,
  WorkspaceUpdate,
} from "../domain/repository/IWorkspaceRepository";

@injectable()
export class WorkspaceController {
  constructor(
    @inject(TYPES.IWorkspaceRepository)
    private workspaceRepository: IWorkspaceRepository,
  ) {}

  async getByUserId(userId: string, token: string) {
    await this.workspaceRepository.setToken(token);
    return this.workspaceRepository.getByUserId(userId);
  }

  async findById(id: string, token: string) {
    await this.workspaceRepository.setToken(token);
    return this.workspaceRepository.findById(id);
  }

  async create(workspace: WorkspaceInsert, token: string) {
    await this.workspaceRepository.setToken(token);
    return this.workspaceRepository.create(workspace);
  }

  async update(id: string, workspace: WorkspaceUpdate, token: string) {
    await this.workspaceRepository.setToken(token);
    return this.workspaceRepository.update(id, workspace);
  }

  async delete(id: string, token: string) {
    await this.workspaceRepository.setToken(token);
    return this.workspaceRepository.delete(id);
  }
}
