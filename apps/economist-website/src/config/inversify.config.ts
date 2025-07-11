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
import { RedisContextController } from "../controllers/RedisContextController";
import { PineconeVaultController } from "../controllers/PineconeVaultController";
import { TextEmbeddingController } from "../controllers/TextEmbeddingController";
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
import { IRedisContext } from "../domain/repository/IRedisContextRepository";
import { IPineconeVaultRepository } from "../domain/repository/IPineconeVaultRepository";
import { ITextEmbeddingRepository } from "../domain/repository/ITextEmbeddingRepository";
import { IEconomicNewsFeedRepository } from "../domain/repository/IEconomicNewsFeedRepository";

// Services
import { UserService } from "../domain/services/IUserService";
import { VaultService } from "../domain/services/IVaultService";
import { IVaultDocumentService } from "../domain/services/IVaultDocumentRepository";
import { IVaultWorkflowService } from "../domain/services/IVaultWorkflowService";
import { IVaultDocumentChunkService } from "../domain/services/IVaultDocumentChunkService";
import { VaultMessagesService } from "../domain/services/IVaultMessagesService";
import { WorkspaceService } from "../domain/services/IWorkspaceService";
import { WorkspaceMessagesService } from "../domain/services/IWorkspaceMessagesService";
import { RedisContextService } from "../domain/services/IRedisContextService";
import { IPineconeVaultService } from "../domain/services/IPineconeVaultService";
import { ITextEmbeddingService } from "../domain/services/ITextEmbeddingService";
import { IEconomicNewsFeedService } from "../domain/services/IEconomicNewsFeedService";

// Create client-side container (safe for browser)
const container = new Container();

// Create server-side container (Node.js only dependencies)
const serverContainer = new Container();

// ============ CLIENT-SAFE BINDINGS ============
// Service bindings (Repository implementations) - Client Safe
container
  .bind<IUserRepository>(TYPES.IUserRepository)
  .to(UserService)
  .inSingletonScope();
container
  .bind<IVaultRepository>(TYPES.IVaultRepository)
  .to(VaultService)
  .inSingletonScope();
container
  .bind<IVaultDocumentRepository>(TYPES.IVaultDocumentRepository)
  .to(IVaultDocumentService)
  .inSingletonScope();
container
  .bind<IVaultWorkflowRepository>(TYPES.IVaultWorkflowRepository)
  .to(IVaultWorkflowService)
  .inSingletonScope();
container
  .bind<IVaultDocumentChunkRepository>(TYPES.IVaultDocumentChunkRepository)
  .to(IVaultDocumentChunkService)
  .inSingletonScope();
container
  .bind<IVaultMessagesRepository>(TYPES.IVaultMessagesRepository)
  .to(VaultMessagesService)
  .inSingletonScope();
container
  .bind<IWorkspaceRepository>(TYPES.IWorkspaceRepository)
  .to(WorkspaceService)
  .inSingletonScope();
container
  .bind<IWorkspaceMessagesRepository>(TYPES.IWorkspaceMessagesRepository)
  .to(WorkspaceMessagesService)
  .inSingletonScope();
container
  .bind<ITextEmbeddingRepository>(TYPES.ITextEmbeddingRepository)
  .to(ITextEmbeddingService)
  .inSingletonScope();
container
  .bind<IEconomicNewsFeedRepository>(TYPES.IEconomicsNewsFeedRepository)
  .to(IEconomicNewsFeedService)
  .inSingletonScope();

// Controller bindings - Client Safe
container
  .bind<UserController>(TYPES.UserController)
  .to(UserController)
  .inSingletonScope();
container
  .bind<VaultController>(TYPES.VaultController)
  .to(VaultController)
  .inSingletonScope();
container
  .bind<VaultDocumentController>(TYPES.VaultDocumentController)
  .to(VaultDocumentController)
  .inSingletonScope();
container
  .bind<VaultWorkflowController>(TYPES.VaultWorkflowController)
  .to(VaultWorkflowController)
  .inSingletonScope();
container
  .bind<VaultDocumentChunkController>(TYPES.VaultDocumentChunkController)
  .to(VaultDocumentChunkController)
  .inSingletonScope();
container
  .bind<VaultMessagesController>(TYPES.VaultMessagesController)
  .to(VaultMessagesController)
  .inSingletonScope();
container
  .bind<WorkspaceController>(TYPES.WorkspaceController)
  .to(WorkspaceController)
  .inSingletonScope();
container
  .bind<WorkspaceMessagesController>(TYPES.WorkspaceMessagesController)
  .to(WorkspaceMessagesController)
  .inSingletonScope();
container
  .bind<TextEmbeddingController>(TYPES.TextEmbeddingController)
  .to(TextEmbeddingController)
  .inSingletonScope();
container
  .bind<EconomicNewsFeedController>(TYPES.EconomicsNewsFeedController)
  .to(EconomicNewsFeedController)
  .inSingletonScope();

// ============ SERVER-ONLY BINDINGS ============
// All client-safe services plus server-only dependencies
// Copy all client-safe bindings to server container
serverContainer
  .bind<IUserRepository>(TYPES.IUserRepository)
  .to(UserService)
  .inSingletonScope();
serverContainer
  .bind<IVaultRepository>(TYPES.IVaultRepository)
  .to(VaultService)
  .inSingletonScope();
serverContainer
  .bind<IVaultDocumentRepository>(TYPES.IVaultDocumentRepository)
  .to(IVaultDocumentService)
  .inSingletonScope();
serverContainer
  .bind<IVaultWorkflowRepository>(TYPES.IVaultWorkflowRepository)
  .to(IVaultWorkflowService)
  .inSingletonScope();
serverContainer
  .bind<IVaultDocumentChunkRepository>(TYPES.IVaultDocumentChunkRepository)
  .to(IVaultDocumentChunkService)
  .inSingletonScope();
serverContainer
  .bind<IVaultMessagesRepository>(TYPES.IVaultMessagesRepository)
  .to(VaultMessagesService)
  .inSingletonScope();
serverContainer
  .bind<IWorkspaceRepository>(TYPES.IWorkspaceRepository)
  .to(WorkspaceService)
  .inSingletonScope();
serverContainer
  .bind<IWorkspaceMessagesRepository>(TYPES.IWorkspaceMessagesRepository)
  .to(WorkspaceMessagesService)
  .inSingletonScope();
serverContainer
  .bind<ITextEmbeddingRepository>(TYPES.ITextEmbeddingRepository)
  .to(ITextEmbeddingService)
  .inSingletonScope();
serverContainer
  .bind<IEconomicNewsFeedRepository>(TYPES.IEconomicsNewsFeedRepository)
  .to(IEconomicNewsFeedService)
  .inSingletonScope();

// Server-only dependencies (Node.js modules like Pinecone, Redis, etc.)
serverContainer
  .bind<IRedisContext>(TYPES.IRedisContextRepository)
  .to(RedisContextService)
  .inSingletonScope();
serverContainer
  .bind<IPineconeVaultRepository>(TYPES.IPineconeVaultRepository)
  .to(IPineconeVaultService)
  .inSingletonScope();

// Server-only controllers
serverContainer
  .bind<UserController>(TYPES.UserController)
  .to(UserController)
  .inSingletonScope();
serverContainer
  .bind<VaultController>(TYPES.VaultController)
  .to(VaultController)
  .inSingletonScope();
serverContainer
  .bind<VaultDocumentController>(TYPES.VaultDocumentController)
  .to(VaultDocumentController)
  .inSingletonScope();
serverContainer
  .bind<VaultWorkflowController>(TYPES.VaultWorkflowController)
  .to(VaultWorkflowController)
  .inSingletonScope();
serverContainer
  .bind<VaultDocumentChunkController>(TYPES.VaultDocumentChunkController)
  .to(VaultDocumentChunkController)
  .inSingletonScope();
serverContainer
  .bind<VaultMessagesController>(TYPES.VaultMessagesController)
  .to(VaultMessagesController)
  .inSingletonScope();
serverContainer
  .bind<WorkspaceController>(TYPES.WorkspaceController)
  .to(WorkspaceController)
  .inSingletonScope();
serverContainer
  .bind<WorkspaceMessagesController>(TYPES.WorkspaceMessagesController)
  .to(WorkspaceMessagesController)
  .inSingletonScope();
serverContainer
  .bind<TextEmbeddingController>(TYPES.TextEmbeddingController)
  .to(TextEmbeddingController)
  .inSingletonScope();
serverContainer
  .bind<EconomicNewsFeedController>(TYPES.EconomicsNewsFeedController)
  .to(EconomicNewsFeedController)
  .inSingletonScope();
serverContainer
  .bind<RedisContextController>(TYPES.RedisContextController)
  .to(RedisContextController)
  .inSingletonScope();
serverContainer
  .bind<PineconeVaultController>(TYPES.PineconeVaultController)
  .to(PineconeVaultController)
  .inSingletonScope();

export { container, serverContainer };
