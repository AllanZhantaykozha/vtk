import { getAllUsers } from "@/src/entities/User/api";
import {
  createUser,
  deleteUser,
  updateUser,
} from "@/src/entities/User/api/mutations";
import { User } from "@/src/entities/User/types";
import { UserFormData } from "@/src/widgets/CreatePage/CreateForm";
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

interface UsersState {
  users: User[] | null;
  isLoading: boolean;

  fetchUsers: () => Promise<void>;
  createUser: (userData: UserFormData) => Promise<void>;
  updateUser: (id: number, userData: Partial<User>) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
}

export const useUsersStore = create<UsersState>()(
  persist(
    devtools(
      (set, get) => ({
        users: null,
        isLoading: false,

        fetchUsers: async () => {
          const { isLoading } = get();
          if (isLoading) return;

          set({ isLoading: true });

          try {
            const data = await getAllUsers();
            if (typeof data === "string") {
              console.error("Users fetch error:", data);
              set({ users: null });
            } else {
              set({ users: data });
            }
          } catch (error) {
            console.error("Error in fetchUsers:", error);
            set({ users: null });
          } finally {
            set({ isLoading: false });
          }
        },

        createUser: async (userData: UserFormData) => {
          const { isLoading } = get();
          if (isLoading) return;

          set({ isLoading: true });

          try {
            const result = await createUser(userData);
            if (typeof result === "string") {
              console.error("Create user error:", result);
              return;
            }
            await get().fetchUsers();
          } catch (error) {
            console.error("Error in createUser:", error);
          } finally {
            set({ isLoading: false });
          }
        },

        updateUser: async (id: number, userData: Partial<UserFormData>) => {
          const { isLoading } = get();
          if (isLoading) return;

          set({ isLoading: true });

          try {
            const result = await updateUser(id, userData);
            if (typeof result === "string") {
              console.error("Update user error:", result);
              return;
            }
            await get().fetchUsers();
          } catch (error) {
            console.error("Error in updateUser:", error);
          } finally {
            set({ isLoading: false });
          }
        },

        deleteUser: async (id: number) => {
          const { isLoading } = get();
          if (isLoading) return;

          set({ isLoading: true });

          try {
            const result = await deleteUser(id);
            if (typeof result === "string") {
              console.error("Delete user error:", result);
              return;
            }
            await get().fetchUsers();
          } catch (error) {
            console.error("Error in deleteUser:", error);
          } finally {
            set({ isLoading: false });
          }
        },
      }),
      { name: "users-store" }
    ),
    {
      name: "users-storage",
      partialize: (state) => ({ users: state.users }),
    }
  )
);
