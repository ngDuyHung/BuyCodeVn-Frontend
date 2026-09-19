import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/identity';

interface AuthState {
  token: string | null;
  user: User | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  isSessionReady: boolean;
  setAuth: (token: string, user: User, expiresInSeconds?: number) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  setSessionReady: (isSessionReady: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      expiresAt: null,
      isAuthenticated: false,
      hasHydrated: false,
      isSessionReady: false,
      setAuth: (token, user, expiresInSeconds = 604800) =>
        set({
          token,
          user,
          expiresAt: Date.now() + expiresInSeconds * 1000,
          isAuthenticated: true,
          isSessionReady: true,
        }),
      setUser: (user) => set({ user, isAuthenticated: true }),
      clearAuth: () =>
        set({
          token: null,
          user: null,
          expiresAt: null,
          isAuthenticated: false,
        }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setSessionReady: (isSessionReady) => set({ isSessionReady }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        expiresAt: state.expiresAt,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
