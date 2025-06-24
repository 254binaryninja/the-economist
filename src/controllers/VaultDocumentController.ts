import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import type {
  IVaultDocumentRepository,
  VaultDocumentInsert,
  VaultDocumentUpdate,
} from "../domain/repository/IVaultDocumentRepository";

@injectable()
export class VaultDocumentController {
  constructor(
    @inject(TYPES.IVaultDocumentRepository)
    private vaultDocumentRepository: IVaultDocumentRepository,
  ) {}

  async getByVaultId(vaultId: string, token: string) {
    await this.vaultDocumentRepository.setToken(token);
    return this.vaultDocumentRepository.getByVaultId(vaultId);
  }

  async findById(id: string, token: string) {
    await this.vaultDocumentRepository.setToken(token);
    return this.vaultDocumentRepository.findById(id);
  }

  async create(vaultDocument: VaultDocumentInsert, token: string) {
    await this.vaultDocumentRepository.setToken(token);
    return this.vaultDocumentRepository.create(vaultDocument);
  }

  async update(id: string, vaultDocument: VaultDocumentUpdate, token: string) {
    await this.vaultDocumentRepository.setToken(token);
    return this.vaultDocumentRepository.update(id, vaultDocument);
  }

  async delete(id: string, token: string) {
    await this.vaultDocumentRepository.setToken(token);
    return this.vaultDocumentRepository.delete(id);
  }
}
