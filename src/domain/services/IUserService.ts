import { supabaseManager } from "@/lib/supabase";
import {
  IUserRepository,
  User,
  UserInsert,
  UserUpdate,
} from "../repository/IUserRepository";
import { injectable } from "inversify";
import { SupabaseClient } from "@supabase/supabase-js";

@injectable()
export class UserService implements IUserRepository {
  private token: string | null = null;

  private getSupabaseClient(): SupabaseClient {
    return supabaseManager.getClient(this.token || undefined);
  }

  async setToken(token: string): Promise<void> {
    this.token = token;
  }

  async findByUserId(user_id: string): Promise<User | null> {
    const supabaseWithAuth = this.getSupabaseClient();
    const { data, error } = await supabaseWithAuth
      .from("users")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (error) {
      console.error("Error fetching user by ID:", error);
      return null;
    }

    return data as User | null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const supabaseWithAuth = this.getSupabaseClient();
    const { data, error } = await supabaseWithAuth
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      console.error("Error fetching user by email:", error);
      return null;
    }

    return data as User | null;
  }

  async create(user: UserInsert): Promise<User> {
    const supabaseWithAuth = this.getSupabaseClient();
    const { data, error } = await supabaseWithAuth
      .from("users")
      .insert(user)
      .select("*")
      .single();

    if (error) {
      console.error("Error creating user:", error);
      throw new Error("User creation failed");
    }

    return data as User;
  }

  async update(id: string, user: UserUpdate): Promise<User | null> {
    const supabaseWithAuth = this.getSupabaseClient();
    const { data, error } = await supabaseWithAuth
      .from("users")
      .update(user)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Error updating user:", error);
      return null;
    }

    return data as User | null;
  }

  async delete(id: string): Promise<void> {
    const supabaseWithAuth = this.getSupabaseClient();
    const { error } = await supabaseWithAuth
      .from("users")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting user:", error);
      throw new Error("User deletion failed");
    }
  }
}
