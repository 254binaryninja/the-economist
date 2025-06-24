import { User } from "lucide-react";

export const TYPES = {
  //Interfaces
  IUserRepository: Symbol.for("IUserRepository"),
  IVaultRepository: Symbol.for("IVaultRepository"),
  IVaultDocumentRepository: Symbol.for("IVaultDocumentRepository"),
  IVaultWorkflowRepository: Symbol.for("IVaultWorkflowRepository"),
  IVaultDocumentChunkRepository: Symbol.for("IVaultDocumentChunkRepository"),
  IWorkspaceRepository: Symbol.for("IWorkspaceRepository"),
  IWorkspaceMessagesRepository: Symbol.for("IWorkspaceMessagesRepository"),
  IVaultMessagesRepository: Symbol.for("IVaultMessagesRepository"),
  IRedisContextRepository: Symbol.for("IRedisContextRepository"),
  IPineconeVaultRepository: Symbol.for("IPineconeVaultRepository"),
  ITextEmbeddingRepository: Symbol.for("ITextEmbeddingRepository"),
  IEconomicsNewsFeedRepository: Symbol.for("IEconomicsNewsFeedRepository"),

  //Controllers
  UserController: Symbol.for("UserController"),
  VaultController: Symbol.for("VaultController"),
  VaultDocumentController: Symbol.for("VaultDocumentController"),
  VaultWorkflowController: Symbol.for("VaultWorkflowController"),
  VaultDocumentChunkController: Symbol.for("VaultDocumentChunkController"),
  WorkspaceController: Symbol.for("WorkspaceController"),
  WorkspaceMessagesController: Symbol.for("WorkspaceMessagesController"),
  VaultMessagesController: Symbol.for("VaultMessagesController"),
  RedisContextController: Symbol.for("RedisContextController"),
  PineconeVaultController: Symbol.for("PineconeVaultController"),
  TextEmbeddingController: Symbol.for("TextEmbeddingController"),
  EconomicsNewsFeedController: Symbol.for("EconomicsNewsFeedController"),
};
