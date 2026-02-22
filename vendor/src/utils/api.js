import axios from 'axios';

// API URL - same as admin panel approach
const apiUrl = import.meta.env.VITE_API_URL || 'https://zuba-api.onrender.com';

// ============================================
// UPLOAD FUNCTIONS - Matching Admin Panel exactly
// ============================================

/**
 * Upload images - EXACT same approach as admin panel
 * Uses direct axios.post with full URL, no default Content-Type header
 */
export const uploadImages = async (url, formData) => {
  try {
    const params = {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        // DO NOT set Content-Type for FormData - axios will set it automatically with boundary
      },
    };
    const res = await axios.post(apiUrl + url, formData, params);
    return res.data;
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: true,
      message: error.response?.data?.message || error.message || 'Upload failed',
      details: error.response?.data?.details
    };
  }
};

/**
 * Fetch data from API - same as admin
 */
export const fetchDataFromApi = async (url) => {
  try {
    const params = {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
      },
    };
    const { data } = await axios.get(apiUrl + url, params);
    return data;
  } catch (error) {
    console.log(error);
    return error;
  }
};

/**
 * Post data to API - same as admin
 */
export const postData = async (url, formData) => {
  try {
    const response = await fetch(apiUrl + url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const errorData = await response.json();
      return errorData;
    }
  } catch (error) {
    console.error('Error:', error);
    return { error: true, message: error.message };
  }
};

/**
 * Edit/Put data to API - same as admin
 */
export const editData = async (url, updatedData) => {
  const params = {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'Content-Type': 'application/json',
    },
  };
  const res = await axios.put(apiUrl + url, updatedData, params);
  return res.data;
};

/**
 * Delete data from API
 */
export const deleteData = async (url) => {
  const params = {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'Content-Type': 'application/json',
    },
  };
  const res = await axios.delete(apiUrl + url, params);
  return res.data;
};

// ============================================
// AXIOS INSTANCE FOR OTHER REQUESTS
// ============================================

const api = axios.create({
  baseURL: `${apiUrl}/api`,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Delete Content-Type for FormData - let axios set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('vendorId');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// VENDOR API FUNCTIONS
// ============================================

export const vendorApi = {
  // Dashboard
  getDashboard: () => api.get('/vendor/dashboard'),
  getProfile: () => api.get('/vendor/me'),
  updateProfile: (data) => api.put('/vendor/me', data),

  // Products
  getProducts: (params) => api.get('/vendor/products', { params }),
  getProduct: (id) => api.get(`/vendor/products/${id}`),
  createProduct: (data) => api.post('/vendor/products', data),
  updateProduct: (id, data) => api.put(`/vendor/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/vendor/products/${id}`),

  // Orders
  getOrders: (params) => api.get('/vendor/orders', { params }),
  getOrder: (id) => api.get(`/vendor/orders/${id}`),
  updateOrderStatus: (id, data) => api.put(`/vendor/orders/${id}/status`, data),

  // Finance
  getFinanceSummary: () => api.get('/vendor/finance/summary'),
  getPayouts: (params) => api.get('/vendor/payouts', { params }),
  requestPayout: (data) => api.post('/vendor/payouts/request', data),
  getPayoutDetails: (id) => api.get(`/vendor/payouts/${id}`),
  updatePayoutSettings: (data) => api.put('/vendor/me/payout-settings', data),

  // Coupons
  getCoupons: (params) => api.get('/vendor/coupons', { params }),
  getCoupon: (id) => api.get(`/vendor/coupons/${id}`),
  createCoupon: (data) => api.post('/vendor/coupons', data),
  updateCoupon: (id, data) => api.put(`/vendor/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/vendor/coupons/${id}`),
  toggleCoupon: (id) => api.put(`/vendor/coupons/${id}/toggle`),
  getCouponStats: () => api.get('/vendor/coupons/stats'),
};

// Categories API
export const categoryApi = {
  getCategories: () => api.get('/category'),
};

// Upload API - uses the direct axios approach like admin
export const uploadApi = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return uploadImages('/api/upload/image', formData);
  },
  // Upload product images - uses EXACT same endpoint and method as admin
  uploadProductImages: async (files) => {
    const formData = new FormData();
    if (Array.isArray(files)) {
      files.forEach(file => formData.append('images', file));
    } else {
      formData.append('images', files);
    }
    // Use the same approach as admin - direct axios call with full URL
    return uploadImages('/api/product/uploadImages', formData);
  },
};

export default api;
