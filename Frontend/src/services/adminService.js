import axiosInstance from '../lib/axios';

export const adminService = {
  getDashboard: async () => {
    const response = await axiosInstance.get('/admin/dashboard');
    return response.data;
  },

  getAnalytics: async (range = '30') => {
    const response = await axiosInstance.get('/admin/analytics', { params: { range } });
    return response.data;
  },

  getUsers: async (filters = {}) => {
    const response = await axiosInstance.get('/admin/users', { params: filters });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await axiosInstance.get(`/admin/users/${id}`);
    return response.data;
  },

  removeUser: async (id) => {
    const response = await axiosInstance.delete(`/admin/users/${id}`);
    return response.data;
  },

  verifyUser: async (id) => {
    const response = await axiosInstance.put(`/admin/users/${id}/verify`);
    return response.data;
  },

  unverifyUser: async (id) => {
    const response = await axiosInstance.put(`/admin/users/${id}/unverify`);
    return response.data;
  },

  getRequests: async (filters = {}) => {
    const response = await axiosInstance.get('/admin/requests', { params: filters });
    return response.data;
  },

  cancelRequest: async (id) => {
    const response = await axiosInstance.put(`/admin/requests/${id}/cancel`);
    return response.data;
  },

  getPendingHospitals: async () => {
    const response = await axiosInstance.get('/admin/hospitals/pending');
    return response.data;
  },

  // Returns a normalized array of pending verification items for admin UI
  getPendingVerifications: async (type = 'donor') => {
    if (type === 'donor') {
      // Fetch users who are donors and not verified
      const usersRes = await axiosInstance.get('/admin/users', { params: { role: 'donor', isVerified: false } });
      const users = usersRes.data?.data || usersRes.data || [];

      // Enrich with donor profile data via admin user-by-id endpoint
      const enriched = [];
      for (const u of users) {
        try {
          const detailRes = await axiosInstance.get(`/admin/users/${u._id}`);
          const payload = detailRes.data?.data || detailRes.data || {};
          const merged = { ...payload.user, ...(payload.profile || {}) };
          enriched.push(merged);
        } catch (e) {
          // Fallback to basic user object
          enriched.push(u);
        }
      }
      return enriched;
    } else {
      // Hospitals: fetch pending hospital profiles and normalize fields
      const res = await axiosInstance.get('/admin/hospitals/pending');
      const profiles = res.data?.data || res.data || [];
      const normalized = profiles.map((p) => ({
        _id: p._id,
        name: p.institutionName || p.user?.name || p.name,
        email: p.email || p.user?.email,
        registrationNumber: p.registrationNumber,
        city: p.city,
        institutionType: p.institutionType,
        verifiedBadge: p.verifiedBadge,
        user: p.user || null
      }));
      return normalized;
    }
  },

  verifyHospital: async (id) => {
    const response = await axiosInstance.put(`/admin/hospitals/${id}/verify`);
    return response.data;
  },

  rejectHospital: async (id) => {
    const response = await axiosInstance.put(`/admin/hospitals/${id}/reject`);
    return response.data;
  },

  rejectVerification: async (id, type = 'donor') => {
    // For donors, use unverify (revoke verification)
    if (type === 'donor') {
      return adminService.unverifyUser(id);
    }
    // For hospitals, use rejectHospital
    return adminService.rejectHospital(id);
  }
};

export default adminService;
