import axiosInstance from '../lib/axios';

export const hospitalService = {
  getProfile: async () => {
    const response = await axiosInstance.get('/hospital/profile');
    const payload = response.data?.data || response.data || {};
    if (payload.user || payload.profile) {
      return {
        ...payload.user,
        ...(payload.profile || {})
      };
    }
    return payload;
  },

  updateProfile: async (profileData) => {
    const response = await axiosInstance.put('/hospital/profile', profileData);
    const payload = response.data?.data || response.data || {};
    if (payload.user || payload.profile) {
      return {
        ...payload.user,
        ...(payload.profile || {})
      };
    }
    return payload;
  },

  verifyRequest: async () => {
    const response = await axiosInstance.post('/hospital/verify-request');
    return response.data;
  },

  getBloodStock: async () => {
    const response = await axiosInstance.get('/hospital/blood-stock');
    return response.data;
  },

  upsertBloodStock: async (bloodGroup, units) => {
    const response = await axiosInstance.post('/hospital/blood-stock', { bloodGroup, availableUnits: units });
    return response.data;
  },

  updateBloodStock: async (bloodGroup, units) => {
    const response = await axiosInstance.put(`/hospital/blood-stock/${bloodGroup}`, { availableUnits: units });
    return response.data;
  },

  deleteBloodStock: async (bloodGroup) => {
    const response = await axiosInstance.delete(`/hospital/blood-stock/${bloodGroup}`);
    return response.data;
  },

  getIncomingRequests: async (filters = {}) => {
    const response = await axiosInstance.get('/hospital/requests', { params: filters });
    return response.data;
  },

  approveRequest: async (id) => {
    const response = await axiosInstance.post(`/hospital/requests/${id}/approve`);
    return response.data;
  },

  rejectRequest: async (id) => {
    const response = await axiosInstance.post(`/hospital/requests/${id}/reject`);
    return response.data;
  },

  getDashboard: async () => {
    const response = await axiosInstance.get('/hospital/dashboard');
    return response.data;
  }
};

export default hospitalService;
