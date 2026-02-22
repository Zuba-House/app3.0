import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

// Helper function to check if token error and clear session
const handleAuthError = (status, data) => {
    if (status === 401 || status === 403 || 
        data?.message === "Authentication token required" ||
        data?.message === "Invalid token" ||
        data?.message === "Token expired" ||
        data?.message === "You have not login") {
        console.log('🔐 Auth error detected, token may be invalid');
        // Mark the response as an auth error so the app can handle it
        return { ...data, isAuthError: true };
    }
    return data;
};

export const postData = async (url, formData) => {
    try {
        const token = localStorage.getItem('accessToken');
        
        const response = await fetch(apiUrl + url, {
            method: 'POST',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '', // Include token only if exists
                'Content-Type': 'application/json',
              },

            body: JSON.stringify(formData)
        });


        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            const errorData = await response.json();
            return handleAuthError(response.status, errorData);
        }

    } catch (error) {
        console.error('Error:', error);
        return { error: true, message: 'Network error occurred' };
    }

}



export const fetchDataFromApi = async (url) => {
    try {
        const token = localStorage.getItem('accessToken');
        
        const params = {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '', // Include token only if exists
                'Content-Type': 'application/json',
            },
        } 

        const { data } = await axios.get(apiUrl + url, params);
        return data;
    } catch (error) {
        console.log('API Error:', error?.response?.status, error?.response?.data?.message || error.message);
        
        // Check for auth errors
        if (error?.response?.status === 401 || error?.response?.status === 403 ||
            error?.response?.data?.message === "Authentication token required" ||
            error?.response?.data?.message === "Invalid token" ||
            error?.response?.data?.message === "Token expired" ||
            error?.response?.data?.message === "You have not login") {
            
            return { 
                success: false,
                error: true, 
                isAuthError: true,
                message: error?.response?.data?.message || 'Authentication failed',
                response: error.response 
            };
        }
        
        // Return error data for other errors (including 404)
        return error?.response?.data || { 
            success: false,
            error: true, 
            message: error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Request failed' 
        };
    }
}


export const uploadImage = async (url, updatedData) => {
    try {
        const token = localStorage.getItem('accessToken');
        
        const params = {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'multipart/form-data',
            },
        };

        const response = await axios.put(apiUrl + url, updatedData, params);
        return response;
    } catch (error) {
        console.error('Upload error:', error);
        if (error?.response?.status === 401 || error?.response?.status === 403) {
            return { error: true, isAuthError: true, message: 'Authentication failed' };
        }
        return { error: true, message: error?.response?.data?.message || error.message };
    }
}


export const editData = async (url, updatedData) => {
    try {
        const token = localStorage.getItem('accessToken');
        
        const params = {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
        };

        const response = await axios.put(apiUrl + url, updatedData, params);
        return response;
    } catch (error) {
        console.error('Edit error:', error);
        if (error?.response?.status === 401 || error?.response?.status === 403) {
            return { error: true, isAuthError: true, message: 'Authentication failed' };
        }
        return { error: true, message: error?.response?.data?.message || error.message };
    }
}


export const deleteData = async (url) => {
    try {
        const token = localStorage.getItem('accessToken');
        
        const params = {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
        };
        
        const response = await axios.delete(apiUrl + url, params);
        return response?.data || response;
    } catch (error) {
        console.error('Delete error:', error);
        if (error?.response?.status === 401 || error?.response?.status === 403) {
            return { error: true, isAuthError: true, message: 'Authentication failed' };
        }
        return { error: true, message: error?.response?.data?.message || error.message };
    }
}
