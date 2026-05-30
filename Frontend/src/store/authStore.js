import { create } from 'zustand';
import axiosInstance from '../lib/axios';

export const useAuthStore = create((set, get) => {
  // Rehydrate initial state from localStorage safely
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  // Listen for the custom logout event triggered by the axios interceptor (401 handler)
  if (typeof window !== 'undefined') {
    window.addEventListener('auth-logout', () => {
      set({ token: null, user: null, isAuthenticated: false, isLoading: false });
      window.dispatchEvent(new Event('socket-disconnect'));
    });
  }

  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken || null,
    isAuthenticated: !!storedToken,
    isLoading: false,

    login: async (email, password) => {
      set({ isLoading: true });
      try {
        const response = await axiosInstance.post('/auth/login', { email, password });
        const token = response.data.token;
        const user = response.data.data || response.data.user || response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false
        });

        // Immediately fetch the complete user profile and sub-profiles
        const fullUser = await get().fetchMe();
        return fullUser || user;
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },

    register: async (registerData) => {
      set({ isLoading: true });
      try {
        const response = await axiosInstance.post('/auth/register', registerData);
        const token = response.data.token;
        const user = response.data.data || response.data.user || response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false
        });
        
        // Fetch detailed profile immediately
        const fullUser = await get().fetchMe();
        return fullUser || user;
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },

    fetchMe: async () => {
      try {
        const response = await axiosInstance.get('/auth/me');
        const data = response.data.data;
        
        if (data && data.user) {
          // Flat-merge user details and profile details for consistent data binding
          const mergedUser = {
            ...data.user,
            ...data.profile,
            _id: data.user._id,
            id: data.user._id
          };
          localStorage.setItem('user', JSON.stringify(mergedUser));
          set({ user: mergedUser, isAuthenticated: true });
          return mergedUser;
        } else {
          const user = response.data.user || response.data.data || response.data;
          localStorage.setItem('user', JSON.stringify(user));
          set({ user, isAuthenticated: true });
          return user;
        }
      } catch (error) {
        throw error;
      }
    },

    updateProfile: async (profileData) => {
      set({ isLoading: true });
      try {
        const response = await axiosInstance.put('/users/profile', profileData);
        const data = response.data.data || response.data || {};
        const updatedUser = data.user || data;
        const profile = data.profile || {};
        const mergedUser = {
          ...updatedUser,
          ...profile
        };
        localStorage.setItem('user', JSON.stringify(mergedUser));
        set({ user: mergedUser, isLoading: false });
        return mergedUser;
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },

    logout: async () => {
      try {
        await axiosInstance.post('/auth/logout').catch(() => {});
      } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
        // Dispatch socket disconnection event
        window.dispatchEvent(new Event('socket-disconnect'));
      }
    },

    setUser: (user) => {
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
    }
  };
});
