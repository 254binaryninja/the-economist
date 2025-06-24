import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import type {
  IVaultWorkflowRepository,
  VaultWorkflowInsert,
  VaultWorkflowUpdate,
} from "../domain/repository/IVaultWorkflowRepository";

@injectable()
export class VaultWorkflowController {
  constructor(
    @inject(TYPES.IVaultWorkflowRepository)
    private vaultWorkflowRepository: IVaultWorkflowRepository,
  ) {}

  async getByVaultId(vaultId: string, token: string) {
    await this.vaultWorkflowRepository.setToken(token);
    return this.vaultWorkflowRepository.getByVaultId(vaultId);
  }

  async findById(id: string, token: string) {
    await this.vaultWorkflowRepository.setToken(token);
    return this.vaultWorkflowRepository.findById(id);
  }

  async create(vaultWorkflow: VaultWorkflowInsert, token: string) {
    await this.vaultWorkflowRepository.setToken(token);
    return this.vaultWorkflowRepository.create(vaultWorkflow);
  }

  async update(id: string, vaultWorkflow: VaultWorkflowUpdate, token: string) {
    await this.vaultWorkflowRepository.setToken(token);
    return this.vaultWorkflowRepository.update(id, vaultWorkflow);
  }

  async delete(id: string, token: string) {
    await this.vaultWorkflowRepository.setToken(token);
    return this.vaultWorkflowRepository.delete(id);
  }
}
