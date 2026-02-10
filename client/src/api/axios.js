import axios from 'axios';

// Automatically detect the API URL based on the frontend's hostname
const getApiUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;

    // If env URL is explicitly set and not empty, use it
    if (envUrl && envUrl.trim()) {
        // Support multiple URLs (comma-separated)
        if (envUrl.includes(',')) {
            return envUrl.split(',')[0].trim();
        }
        return envUrl;
    }

    // Auto-detect based on current hostname
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = 5000; // Backend port

    // If accessing via localhost, use localhost for API
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return `http://localhost:${port}/api`;
    }

    // If accessing via network IP, use the same IP for API
    // This works for any IP address (192.168.x.x, 172.16.x.x, 10.x.x.x, etc.)
    return `${protocol}//${hostname}:${port}/api`;
};

const API_URL = getApiUrl();

console.log(`🔗 API URL auto-detected: ${API_URL}`);

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

// Add token to requests if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle response errors with intelligent fallback
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Prevent infinite retry loops
        if (originalRequest._retry) {
            // If already retried, handle auth errors
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }

        // If network error or timeout, try fallback URL
        if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.response) {
            originalRequest._retry = true;

            const currentUrl = api.defaults.baseURL;
            const hostname = window.location.hostname;

            // Try alternative URL
            let fallbackUrl;
            if (currentUrl.includes('localhost')) {
                // If localhost failed, try network IP
                fallbackUrl = `http://${hostname}:5000/api`;
            } else {
                // If network IP failed, try localhost
                fallbackUrl = 'http://localhost:5000/api';
            }

            console.log(`⚠️ Connection failed to ${currentUrl}`);
            console.log(`🔄 Trying fallback URL: ${fallbackUrl}`);

            // Update the base URL
            api.defaults.baseURL = fallbackUrl;
            originalRequest.baseURL = fallbackUrl;

            // Retry the request with new URL
            return api.request(originalRequest);
        }

        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

// Export function to test API connectivity
export const testApiConnection = async () => {
    try {
        const response = await api.get('/health');
        return {
            success: true,
            url: api.defaults.baseURL,
            message: 'API connection successful'
        };
    } catch (error) {
        return {
            success: false,
            url: api.defaults.baseURL,
            error: error.message
        };
    }
};

// Export function to manually switch API URL
export const switchApiUrl = (url) => {
    api.defaults.baseURL = url;
    console.log(`🔗 API URL manually switched to: ${url}`);
};

// Export function to get current API URL
export const getCurrentApiUrl = () => {
    return api.defaults.baseURL;
};

// Export function to refresh/re-detect API URL
export const refreshApiUrl = () => {
    const newUrl = getApiUrl();
    api.defaults.baseURL = newUrl;
    console.log(`🔄 API URL refreshed to: ${newUrl}`);
    return newUrl;
};

export default api;
