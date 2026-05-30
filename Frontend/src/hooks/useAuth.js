import { useAuthStore } from '../store/authStore';

/**
 * Custom hook to access authentication states, details, and functions easily.
 */
export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const register = useAuthStore((state) => state.register);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const setUser = useAuthStore((state) => state.setUser);
  
  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    updateProfile,
    setUser,
    role: user?.role || null,
    isVerified: user?.isVerified || false,
  };
};
export default useAuth;
