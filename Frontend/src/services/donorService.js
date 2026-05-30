import axiosInstance from '../lib/axios';

export const donorService = {
  getProfile: async () => {
    const response = await axiosInstance.get('/donor/profile');
    const payload = response.data?.data || response.data || {};
    if (payload.user || payload.profile) {
      return {
        ...payload.user,
        ...(payload.profile || {})
      };
    }
    return payload;
  },

  updateProfile: async (donorData) => {
    const response = await axiosInstance.put('/donor/profile', donorData);
    const payload = response.data?.data || response.data || {};
    if (payload.user || payload.profile) {
      return {
        ...payload.user,
        ...(payload.profile || {})
      };
    }
    return payload;
  },

  toggleAvailability: async (isAvailable) => {
    const response = await axiosInstance.put('/donor/availability', { isAvailable });
    return response.data;
  },

  getNearbyRequests: async (params = {}) => {
    const response = await axiosInstance.get('/donor/nearby-requests', { params });
    return response.data;
  },

  getAcceptedRequests: async () => {
    const response = await axiosInstance.get('/donor/requests');
    return response.data;
  },

  acceptRequest: async (id) => {
    const response = await axiosInstance.post(`/donor/requests/${id}/accept`);
    return response.data;
  },

  rejectRequest: async (id) => {
    const response = await axiosInstance.post(`/donor/requests/${id}/reject`);
    return response.data;
  },

  completeRequest: async (id) => {
    const response = await axiosInstance.put(`/donor/requests/${id}/complete`);
    return response.data;
  },

  getHistory: async () => {
    const response = await axiosInstance.get('/donor/history');
    return response.data;
  },

  getDashboard: async () => {
    const response = await axiosInstance.get('/donor/dashboard');
    return response.data;
  }
};

export default donorService;
