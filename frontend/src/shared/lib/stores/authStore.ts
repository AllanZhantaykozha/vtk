import { getMe } from "@/src/entities/User/api/";
import { User } from "@/src/entities/User/types";
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  fetchMe: () => Promise<void>; // Инициализация: загружает user из API
  login: (credentials: { login: string; password: string }) => Promise<void>; // Пример другого action
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    // Авто-сохранение state в localStorage
    devtools(
      // Для отладки в браузере
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,

        // Async action: fetchMe — вызывает getMe() и обновляет state
        fetchMe: async () => {
          const { isLoading } = get(); // Получаем текущий state
          if (isLoading) return; // Избегаем дублирующих запросов

          set({ isLoading: true }); // Обновляем UI (spinner)

          try {
            const userOrError = await getMe(); // Вызов API
            if (typeof userOrError === "string") {
              // Обработка ошибки
              console.error("Auth fetch error:", userOrError);
              set({ user: null, isAuthenticated: false });
            } else {
              set({ user: userOrError, isAuthenticated: true });
            }
          } catch (error) {
            console.error("Unexpected error in fetchMe:", error);
            set({ user: null, isAuthenticated: false });
          } finally {
            set({ isLoading: false }); // Всегда сбрасываем loading
          }
        },

        // Пример: login — аналогично, но с POST /login
        // login: async (credentials) => {
        //   set({ isLoading: true });
        //   try {
        //     // Предполагаем API-функцию login из features/auth/api
        //     // const { user, token } = await loginApi(credentials);
        //     // localStorage.setItem('token', token);  // Если нужен токен
        //     await get.fetchMe(); // После login перезагружаем user
        //   } catch (error) {
        //     console.error("Login error:", error);
        //   } finally {
        //     set({ isLoading: false });
        //   }
        // },

        // Sync action: logout
        logout: () => {
          set({ user: null, isAuthenticated: false });
          document.cookie =
            "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          window.location.href = "/login";
        },
      }),
      {
        name: "auth-store", // Имя в DevTools
      }
    ),
    {
      name: "auth-storage", // Ключ в localStorage
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }), // Сохраняем только user (не actions)
    }
  )
);
