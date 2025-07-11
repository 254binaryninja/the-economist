import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "./types";

// Controllers
import { UserController } from "../controllers/UserController";
import { VaultController } from "../controllers/VaultController";
import { VaultDocumentController } from "../controllers/VaultDocumentController";
import { VaultWorkflowController } from "../controllers/VaultWorkflowController";
import { VaultDocumentChunkController } from "../controllers/VaultDocumentChunkController";
import { VaultMessagesController } from "../controllers/VaultMessagesController";
import { WorkspaceController } from "../controllers/WorkspaceController";
import { WorkspaceMessagesController } from "../controllers/WorkspaceMesssagesController";
import { EconomicNewsFeedController } from "../controllers/EconomicNewsFeedController";

// Repository Interfaces
import { IUserRepository } from "../domain/repository/IUserRepository";
import { IVaultRepository } from "../domain/repository/IVaultRepository";
import { IVaultDocumentRepository } from "../domain/repository/IVaultDocumentRepository";
import { IVaultWorkflowRepository } from "../domain/repository/IVaultWorkflowRepository";
import { IVaultDocumentChunkRepository } from "../domain/repository/IVaultDocumentChunkRepository";
import { IVaultMessagesRepository } from "../domain/repository/IVaultMessagesRepository";
import { IWorkspaceRepository } from "../domain/repository/IWorkspaceRepository";
import { IWorkspaceMessagesRepository } from "../domain/repository/IWorkspaceMessagesRepository";
import { IEconomicNewsFeedRepository } from "../domain/repository/IEconomicNewsFeedRepository";

// Services (Client-safe only)
import { UserService } from "../domain/services/IUserService";
import { VaultService } from "../domain/services/IVaultService";
import { IVaultDocumentService } from "../domain/services/IVaultDocumentRepository";
import { IVaultWorkflowService } from "../domain/services/IVaultWorkflowService";
import { IVaultDocumentChunkService } from "../domain/services/IVaultDocumentChunkService";
import { VaultMessagesService } from "../domain/services/IVaultMessagesService";
import { WorkspaceService } from "../domain/services/IWorkspaceService";
import { WorkspaceMessagesService } from "../domain/services/IWorkspaceMessagesService";
import { IEconomicNewsFeedService } from "../domain/services/IEconomicNewsFeedService";

// Create client-side container (safe for browser)
const clientContainer = new Container();

// ============ CLIENT-SAFE BINDINGS ONLY ============
// Service bindings (Repository implementations) - Client Safe
clientContainer
  .bind<IUserRepository>(TYPES.IUserRepository)
  .to(UserService)
  .inSingletonScope();
clientContainer
  .bind<IVaultRepository>(TYPES.IVaultRepository)
  .to(VaultService)
  .inSingletonScope();
clientContainer
  .bind<IVaultDocumentRepository>(TYPES.IVaultDocumentRepository)
  .to(IVaultDocumentService)
  .inSingletonScope();
clientContainer
  .bind<IVaultWorkflowRepository>(TYPES.IVaultWorkflowRepository)
  .to(IVaultWorkflowService)
  .inSingletonScope();
clientContainer
  .bind<IVaultDocumentChunkRepository>(TYPES.IVaultDocumentChunkRepository)
  .to(IVaultDocumentChunkService)
  .inSingletonScope();
clientContainer
  .bind<IVaultMessagesRepository>(TYPES.IVaultMessagesRepository)
  .to(VaultMessagesService)
  .inSingletonScope();
clientContainer
  .bind<IWorkspaceRepository>(TYPES.IWorkspaceRepository)
  .to(WorkspaceService)
  .inSingletonScope();
clientContainer
  .bind<IWorkspaceMessagesRepository>(TYPES.IWorkspaceMessagesRepository)
  .to(WorkspaceMessagesService)
  .inSingletonScope();
clientContainer
  .bind<IEconomicNewsFeedRepository>(TYPES.IEconomicsNewsFeedRepository)
  .to(IEconomicNewsFeedService)
  .inSingletonScope();

// Controller bindings - Client Safe
clientContainer
  .bind<UserController>(TYPES.UserController)
  .to(UserController)
  .inSingletonScope();
clientContainer
  .bind<VaultController>(TYPES.VaultController)
  .to(VaultController)
  .inSingletonScope();
clientContainer
  .bind<VaultDocumentController>(TYPES.VaultDocumentController)
  .to(VaultDocumentController)
  .inSingletonScope();
clientContainer
  .bind<VaultWorkflowController>(TYPES.VaultWorkflowController)
  .to(VaultWorkflowController)
  .inSingletonScope();
clientContainer
  .bind<VaultDocumentChunkController>(TYPES.VaultDocumentChunkController)
  .to(VaultDocumentChunkController)
  .inSingletonScope();
clientContainer
  .bind<VaultMessagesController>(TYPES.VaultMessagesController)
  .to(VaultMessagesController)
  .inSingletonScope();
clientContainer
  .bind<WorkspaceController>(TYPES.WorkspaceController)
  .to(WorkspaceController)
  .inSingletonScope();
clientContainer
  .bind<WorkspaceMessagesController>(TYPES.WorkspaceMessagesController)
  .to(WorkspaceMessagesController)
  .inSingletonScope();
clientContainer
  .bind<EconomicNewsFeedController>(TYPES.EconomicsNewsFeedController)
  .to(EconomicNewsFeedController)
  .inSingletonScope();

// NOTE: NO server-side dependencies (Redis, Pinecone) are included here

export { clientContainer };
