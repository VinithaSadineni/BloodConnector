import axiosInstance from '../lib/axios';

export const authService = {
  login: async (email, password) => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (registerData) => {
    const response = await axiosInstance.post('/auth/register', registerData);
    return response.data;
  },

  getMe: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },

  changePassword: async (oldPassword, newPassword) => {
    const response = await axiosInstance.put('/auth/change-password', { oldPassword, newPassword });
    return response.data;
  },
  
  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  }
};

export default authService;
