import {
  createGroup,
  updateGroup,
  deleteGroup,
} from "@/src/entities/Group/api";
import {
  getAllGroups,
  getGroupById,
  GroupFilters,
} from "@/src/entities/Group/api/queries";
import { Group } from "@/src/entities/Group/types";
import { GroupFormData } from "@/src/widgets/CreatePage/CreateForm";
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

interface GroupState {
  groups: Group[] | null;
  isLoadingGroup: boolean;

  fetchGroupById: (groupId?: string) => Promise<void>;
  fetchAllGroups: (filters?: GroupFilters) => Promise<void>;
  createGroup: (groupData: GroupFormData) => Promise<void>;
  updateGroup: (id: number, GroupData: Partial<Group>) => Promise<void>;
  deleteGroup: (id: number) => Promise<void>;
}

export const useGroupStore = create<GroupState>()(
  persist(
    devtools(
      (set, get) => ({
        Groups: null,
        isLoadingGroup: false,

        fetchAllGroups: async (filters?: GroupFilters) => {
          const { isLoadingGroup } = get();
          if (isLoadingGroup) return; // Нет дубликатов

          set({ isLoadingGroup: true });

          try {
            const data = await getAllGroups(filters);
            if (typeof data === "string") {
              console.error("Group fetch error:", data);
              set({ groups: null });
            } else {
              set({ groups: data });
            }
          } catch (error) {
            console.error("Error in fetchGroup:", error);
            set({ groups: null });
          } finally {
            set({ isLoadingGroup: false });
          }
        },

        fetchGroupById: async (groupId: string) => {
          const { isLoadingGroup } = get();
          if (isLoadingGroup) return; // Нет дубликатов

          set({ isLoadingGroup: true });

          try {
            const data = await getGroupById(groupId);
            if (typeof data === "string") {
              console.error("Group fetch error:", data);
              set({ groups: null });
            } else {
              set({ groups: [data] });
            }
          } catch (error) {
            console.error("Error in fetchGroup:", error);
            set({ groups: null });
          } finally {
            set({ isLoadingGroup: false });
          }
        },

        createGroup: async (groupData: GroupFormData) => {
          const { isLoadingGroup } = get();
          if (isLoadingGroup) return;

          set({ isLoadingGroup: true });

          try {
            const result = await createGroup(groupData);
            if (typeof result === "string") {
              console.error("Create group error:", result);
              return;
            }
            await get().fetchAllGroups();
          } catch (error) {
            console.error("Error in createGroup:", error);
          } finally {
            set({ isLoadingGroup: false });
          }
        },

        updateGroup: async (id: number, GroupData: Partial<GroupFormData>) => {
          const { isLoadingGroup } = get();
          if (isLoadingGroup) return;

          set({ isLoadingGroup: true });

          try {
            const result = await updateGroup(id, GroupData);
            if (typeof result === "string") {
              console.error("Update Group error:", result);
              return;
            }
            await get().fetchAllGroups();
          } catch (error) {
            console.error("Error in update group:", error);
          } finally {
            set({ isLoadingGroup: false });
          }
        },

        deleteGroup: async (id: number) => {
          const { isLoadingGroup } = get();
          if (isLoadingGroup) return;

          set({ isLoadingGroup: true });

          try {
            const result = await deleteGroup(id);
            if (typeof result === "string") {
              console.error("Delete Group error:", result);
              return;
            }
            await get().fetchAllGroups();
          } catch (error) {
            console.error("Error in delete group:", error);
          } finally {
            set({ isLoadingGroup: false });
          }
        },
      }),
      { name: "group-store" }
    ),
    {
      name: "group-storage",
      partialize: (state) => ({ Groups: state.groups }),
    }
  )
);
