import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserData {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  loginStatus: string;
  lastLoginAt: string;
}

interface UserStore {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      
      setUser: (user) => {
        set({ user });
      },
      
      logout: async () => {
        set({ isLoading: true });
        try {
          const response = await fetch('/api/logout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            set({ user: null, isLoading: false });
            window.location.href = '/';
          }
        } catch (error) {
          console.error('Logout error:', error);
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'user-storage',
    }
  )
);