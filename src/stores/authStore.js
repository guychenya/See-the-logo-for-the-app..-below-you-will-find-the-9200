import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,

      initializeAuth: () => {
        try {
          // Simulate auth check - replace with actual auth service
          const savedUser = localStorage.getItem('orchestraai_user');
          if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            set({ user: parsedUser, error: null });
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          set({ error: 'Failed to initialize authentication' });
          localStorage.removeItem('orchestraai_user');
        }
      },

      login: async (email, password) => {
        if (!email || !password) {
          set({ error: 'Email and password are required' });
          return { success: false, error: 'Email and password are required' };
        }

        set({ loading: true, error: null });
        
        try {
          // Simulate login - replace with actual auth service
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const user = {
            id: '1',
            email,
            name: 'John Doe',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
          };

          localStorage.setItem('orchestraai_user', JSON.stringify(user));
          set({ user, loading: false, error: null });
          
          return { success: true };
        } catch (error) {
          console.error('Login error:', error);
          set({ loading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      logout: () => {
        try {
          localStorage.removeItem('orchestraai_user');
          set({ user: null, error: null });
        } catch (error) {
          console.error('Logout error:', error);
          set({ error: 'Failed to logout' });
        }
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'apexsprite-auth',
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        console.log('Auth store rehydrated');
      }
    }
  )
);