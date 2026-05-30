import axiosInstance from '../lib/axios';

export const seekerService = {
  createRequest: async (requestData) => {
    const response = await axiosInstance.post('/seeker/requests', requestData);
    return response.data;
  },

  getRequests: async (filters = {}) => {
    const response = await axiosInstance.get('/seeker/requests', { params: filters });
    return response.data;
  },

  getRequestById: async (id) => {
    const response = await axiosInstance.get(`/seeker/requests/${id}`);
    return response.data;
  },

  updateRequest: async (id, requestData) => {
    const response = await axiosInstance.put(`/seeker/requests/${id}`, requestData);
    return response.data;
  },

  cancelRequest: async (id) => {
    const response = await axiosInstance.delete(`/seeker/requests/${id}`);
    return response.data;
  },

  sosRequest: async (id) => {
    const response = await axiosInstance.post(`/seeker/requests/${id}/sos`);
    return response.data;
  },

  getDashboard: async () => {
    const response = await axiosInstance.get('/seeker/dashboard');
    return response.data;
  },
  getProfile: async () => {
    const response = await axiosInstance.get('/users/profile');
    const payload = response.data?.data || {};
    if (payload.user || payload.profile) {
      return {
        ...payload.user,
        ...(payload.profile || {})
      };
    }
    return payload;
  },
  updateProfile: async (profileData) => {
    const response = await axiosInstance.put('/users/profile', profileData);
    const payload = response.data?.data || {};
    if (payload.user || payload.profile) {
      return {
        ...payload.user,
        ...(payload.profile || {})
      };
    }
    return payload;
  }
};

export default seekerService;
