// Supabase client manager for Clerk integration
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { inject, injectable } from "inversify";
import fp from 'fastify-plugin';
import type { IConfigService, ISupabaseService } from "../services/repository/interfaces";
import { TYPES } from "../services/config/types";

@injectable()
export class SupabaseService implements ISupabaseService {
  private clients: Map<string, SupabaseClient> = new Map();
  private defaultClient: SupabaseClient;
  private currentToken?: string;

  constructor(@inject(TYPES.ConfigService) private configService: IConfigService) {
    this.defaultClient = createClient(
      this.configService.getSupabaseUrl(),
      this.configService.getSupabaseAnonKey(),
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
  }

  getClient(token?: string): SupabaseClient {
    const useToken = token || this.currentToken;
    
    if (!useToken) {
      return this.defaultClient;
    }

    // Reuse existing client for the same token
    if (this.clients.has(useToken)) {
      return this.clients.get(useToken)!;
    }

    // Create new client with auth token
    const client = createClient(
      this.configService.getSupabaseUrl(),
      this.configService.getSupabaseAnonKey(),
      {
        global: {
          headers: {
            Authorization: `Bearer ${useToken}`,
          },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    this.clients.set(useToken, client);
    return client;
  }

  setAuthToken(token: string): void {
    this.currentToken = token;
  }

  clearAuthToken(): void {
    if (this.currentToken) {
      this.clients.delete(this.currentToken);
      this.currentToken = undefined;
    }
  }

  isAuthenticated(): boolean {
    return !!this.currentToken;
  }

  // Cleanup method for memory management
  clearClient(token: string): void {
    this.clients.delete(token);
  }

  clearAllClients(): void {
    this.clients.clear();
    this.currentToken = undefined;
  }
}

// Fastify plugin to register Supabase service
export default fp(async (fastify, opts) => {
  // Ensure container is available
  if (!fastify.container) {
    throw new Error('DI Container is required for Supabase plugin. Make sure container plugin is loaded first.');
  }

  // Get the Supabase service from the container
  const supabaseService = fastify.container.get<ISupabaseService>(TYPES.SupabaseService);

  // Decorate fastify instance
  fastify.decorate('supabase', supabaseService);

  fastify.log.info('Supabase service registered successfully');

}, {
  name: 'supabase-plugin',
  dependencies: ['container-plugin']
});

// TypeScript declarations
declare module 'fastify' {
  export interface FastifyInstance {
    supabase: ISupabaseService;
  }
}
