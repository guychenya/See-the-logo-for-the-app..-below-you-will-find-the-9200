import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: false,
  
  initializeAuth: () => {
    // Simulate auth check - replace with actual auth service
    const savedUser = localStorage.getItem('orchestraai_user');
    if (savedUser) {
      set({ user: JSON.parse(savedUser) });
    }
  },
  
  login: async (email, password) => {
    set({ loading: true });
    try {
      // Simulate login - replace with actual auth service
      const user = {
        id: '1',
        email,
        name: 'John Doe',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
      };
      localStorage.setItem('orchestraai_user', JSON.stringify(user));
      set({ user, loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, error: error.message };
    }
  },
  
  logout: () => {
    localStorage.removeItem('orchestraai_user');
    set({ user: null });
  }
}));