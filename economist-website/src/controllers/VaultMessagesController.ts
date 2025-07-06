import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import type {
  IVaultMessagesRepository,
  VaultMessageInsert,
  VaultMessageUpdate,
} from "../domain/repository/IVaultMessagesRepository";

@injectable()
export class VaultMessagesController {
  constructor(
    @inject(TYPES.IVaultMessagesRepository)
    private vaultMessagesRepository: IVaultMessagesRepository,
  ) {}

  async getMessagesByVaultId(vaultId: string, token: string) {
    await this.vaultMessagesRepository.setToken(token);
    return this.vaultMessagesRepository.getMessagesByVaultId(vaultId);
  }

  async insertMessageToVault(vaultMessage: VaultMessageInsert, token: string) {
    await this.vaultMessagesRepository.setToken(token);
    return this.vaultMessagesRepository.insertMessageToVault(vaultMessage);
  }

  async updateMessageInVault(
    id: string,
    vaultMessage: VaultMessageUpdate,
    token: string,
  ) {
    await this.vaultMessagesRepository.setToken(token);
    return this.vaultMessagesRepository.updateMessageInVault(id, vaultMessage);
  }
}
