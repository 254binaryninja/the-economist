// Singleton Supabase client manager to prevent multiple instances
import { createClient, SupabaseClient } from "@supabase/supabase-js";

class SupabaseManager {
  private static instance: SupabaseManager;
  private clients: Map<string, SupabaseClient> = new Map();
  private defaultClient: SupabaseClient;

  private constructor() {
    this.defaultClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
  }

  static getInstance(): SupabaseManager {
    if (!SupabaseManager.instance) {
      SupabaseManager.instance = new SupabaseManager();
    }
    return SupabaseManager.instance;
  }

  getClient(token?: string): SupabaseClient {
    if (!token) {
      return this.defaultClient;
    }

    // Reuse existing client for the same token
    if (this.clients.has(token)) {
      return this.clients.get(token)!;
    }

    // Create new client only if token doesn't exist
    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    this.clients.set(token, client);
    return client;
  }

  clearClient(token: string) {
    this.clients.delete(token);
  }

  clearAllClients() {
    this.clients.clear();
  }
}

export const supabaseManager = SupabaseManager.getInstance();
export const supabase = supabaseManager.getClient();
export const getSupabaseClient = (token: string) =>
  supabaseManager.getClient(token);
