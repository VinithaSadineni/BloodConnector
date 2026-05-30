import axiosInstance from '../lib/axios';

export const searchService = {
  searchDonors: async (params = {}) => {
    const response = await axiosInstance.get('/search/donors', { params });
    return response.data;
  },

  searchHospitals: async (params = {}) => {
    const response = await axiosInstance.get('/search/hospitals', { params });
    return response.data;
  },

  searchBloodStock: async (params = {}) => {
    const response = await axiosInstance.get('/search/blood-stock', { params });
    return response.data;
  },

  getActiveRequests: async () => {
    const response = await axiosInstance.get('/search/requests');
    return response.data;
  }
};

export default searchService;
