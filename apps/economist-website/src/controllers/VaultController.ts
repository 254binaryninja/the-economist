import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import type {
  IVaultRepository,
  VaultInsert,
  VaultUpdate,
} from "../domain/repository/IVaultRepository";

@injectable()
export class VaultController {
  constructor(
    @inject(TYPES.IVaultRepository) private vaultRepository: IVaultRepository,
  ) {}

  async getByUserId(userId: string, token: string) {
    await this.vaultRepository.setToken(token);
    return this.vaultRepository.getByUserId(userId);
  }

  async findById(id: string, token: string) {
    await this.vaultRepository.setToken(token);
    return this.vaultRepository.findById(id);
  }

  async create(vault: VaultInsert, token: string) {
    await this.vaultRepository.setToken(token);
    return this.vaultRepository.create(vault);
  }

  async update(id: string, vault: VaultUpdate, token: string) {
    await this.vaultRepository.setToken(token);
    return this.vaultRepository.update(id, vault);
  }

  async delete(id: string, token: string) {
    await this.vaultRepository.setToken(token);
    return this.vaultRepository.delete(id);
  }
}
