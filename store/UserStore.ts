import { create } from "zustand";
import { clientContainer } from "@/src/config/client.inversify.config";
import { TYPES } from "@/src/config/types";
import { UserController } from "@/src/controllers/UserController";
import {
  User,
  UserInsert,
  UserUpdate,
} from "@/src/domain/repository/IUserRepository";

// Get controller from DI container
const userController = clientContainer.get<UserController>(
  TYPES.UserController,
);

// Create store types
interface UserStore extends User {
  isLoading: boolean;
  error: string | null;
  fetchUserData: (token: string, user_id: string) => Promise<void>;
  updateUserData: (data: UserUpdate, token: string) => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  id: "",
  user_id: "",
  name: "",
  email: "",
  student: false,
  verbosity: "",
  style: "",
  occupation: "",
  created_at: "",
  isLoading: false,
  error: null,
  fetchUserData: async (token: string, user_id: string) => {
    set({ isLoading: true });
    try {
      const userData = await userController.findByUserId(user_id, token);
      if (!userData) return;
      set({
        id: userData.id,
        user_id: userData.user_id,
        name: userData.name,
        email: userData.email,
        student: userData.student,
        verbosity: userData.verbosity,
        style: userData.style,
        occupation: userData.occupation,
        created_at: userData.created_at,
      });
    } catch (e) {
      console.log("Error fetching user data:", e);
      set({
        error: "Error fetching user data: " + (e as Error).message,
        isLoading: false,
      });
    } finally {
      set({ isLoading: false });
    }
  },
  updateUserData: async (userData: UserUpdate, token: string) => {
    set({ isLoading: true });
    const id = get().id;
    try {
      await userController.update(id, userData, token);
    } catch (e) {
      console.log("Error updating user data:", e);
      set({
        error: "Error updating user data: " + (e as Error).message,
        isLoading: false,
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));
