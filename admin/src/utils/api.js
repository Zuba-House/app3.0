import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    
    failedQueue = [];
};

// Axios interceptor to handle token refresh
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and message is "Token expired", try to refresh
        if (error.response?.status === 401 && 
            (error.response?.data?.message === "Token expired" || 
             error.response?.data?.message === "Invalid token")) {
            
            // If we're already refreshing, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        return axios(originalRequest);
                    })
                    .catch(err => {
                        return Promise.reject(err);
                    });
            }

            isRefreshing = true;
            const refreshToken = localStorage.getItem('refreshToken');

            if (!refreshToken) {
                // No refresh token, redirect to login
                processQueue(error, null);
                isRefreshing = false;
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                // Call refresh token endpoint
                const response = await axios.post(
                    apiUrl + '/api/user/refresh-token',
                    {},
                    {
                        headers: {
                            'Authorization': `Bearer ${refreshToken}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (response.data?.error === false && response.data?.data?.accessToken) {
                    const newAccessToken = response.data.data.accessToken;
                    localStorage.setItem('accessToken', newAccessToken);
                    
                    // Update the original request with new token
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    
                    // Process queued requests
                    processQueue(null, newAccessToken);
                    isRefreshing = false;
                    
                    // Retry the original request
                    return axios(originalRequest);
                } else {
                    throw new Error('Failed to refresh token');
                }
            } catch (refreshError) {
                // Refresh failed, redirect to login
                processQueue(refreshError, null);
                isRefreshing = false;
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const postData = async (url, formData) => {
    try {
        
        const response = await fetch(apiUrl + url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
                'Content-Type': 'application/json', // Adjust the content type as needed
              },

            body: JSON.stringify(formData)
        });


        if (response.ok) {
            const data = await response.json();
            //console.log(data)
            return data;
        } else {
            const errorData = await response.json();
            return errorData;
        }

    } catch (error) {
        console.error('Error:', error);
    }

}



export const fetchDataFromApi = async (url) => {
    try {
        const params={
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
                'Content-Type': 'application/json', // Adjust the content type as needed
              },
        
        } 

        const { data } = await axios.get(apiUrl + url,params)
        return data;
    } catch (error) {
        console.log(error);
        return error;
    }
}


export const uploadImage = async (url, updatedData ) => {
    try {
        const params={
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
                // DO NOT set Content-Type for FormData - axios will set it automatically with boundary
              },
        
        } 
        const res = await axios.put(apiUrl + url, updatedData, params);
        return res.data;
    } catch (error) {
        console.error('Upload error:', error);
        // Return error in the same format as success response
        return {
            success: false,
            error: true,
            message: error.response?.data?.message || error.message || 'Upload failed',
            details: error.response?.data?.details
        };
    }
}


export const uploadImages = async (url, formData ) => {
    try {
        const params={
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
                // DO NOT set Content-Type for FormData - axios will set it automatically with boundary
              },
        
        } 
        const res = await axios.post(apiUrl + url, formData, params);
        return res.data;
    } catch (error) {
        console.error('Upload error:', error);
        // Return error in the same format as success response
        return {
            success: false,
            error: true,
            message: error.response?.data?.message || error.message || 'Upload failed',
            details: error.response?.data?.details
        };
    }
}



export const editData = async (url, updatedData ) => {
    const params={
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
            'Content-Type': 'application/json', // Adjust the content type as needed
          },
    
    } 
    const res = await axios.put(apiUrl + url, updatedData, params);
    return res.data;
   
}

// Alias used by components
export const putData = async (url, updatedData) => {
    return await editData(url, updatedData);
}





export const deleteImages = async (url,image ) => {
    const params={
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
            'Content-Type': 'application/json', // Adjust the content type as needed
          },
    
    } 
    const res = await axios.delete(apiUrl + url, params);
    return res.data;
}


export const deleteData = async (url ) => {
    const params={
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
            'Content-Type': 'application/json', // Adjust the content type as needed
          },
    
    } 
    const res = await axios.delete(apiUrl + url, params);
    return res.data;
}

export const deleteMultipleData = async (url,data ) => {
    const params={
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
            'Content-Type': 'application/json', // Adjust the content type as needed
          },
    
    } 
    // Axios delete with payload: put data under `data` in config
    const res = await axios.delete(apiUrl + url, { data, ...params });
    return res.data;
}