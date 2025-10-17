import { getGroups } from "@/src/entities/Group/api";
import { Group } from "@/src/entities/Group/types";
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

interface GroupState {
  groups: Group[] | null;
  isLoadingGroup: boolean;

  fetchGroup: (groupId?: string) => Promise<void>; // Async action с опциональным groupId
}

export const useGroupStore = create<GroupState>()(
  persist(
    devtools(
      (set, get) => ({
        Groups: null,
        isLoadingGroup: false,

        fetchGroup: async (groupId?: string) => {
          const { isLoadingGroup } = get();
          if (isLoadingGroup) return; // Нет дубликатов

          set({ isLoadingGroup: true });

          try {
            const data = await getGroups(groupId); // Передаём groupId (или undefined)
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
      }),
      { name: "Group-store" }
    ),
    {
      name: "Group-storage",
      partialize: (state) => ({ Groups: state.groups }),
    }
  )
);
