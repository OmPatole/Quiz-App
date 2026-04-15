import axios from 'axios';

const normalizeApiUrl = (value) => {
    const trimmed = value.trim().replace(/\/+$/, '');

    if (!trimmed || trimmed === '/api') {
        return '/api';
    }

    if (trimmed.startsWith('/')) {
        return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
    }

    try {
        const parsed = new URL(trimmed);
        const pathname = parsed.pathname.replace(/\/+$/, '');

        if (!pathname || pathname === '/') {
            return `${parsed.origin}/api`;
        }

        return pathname.endsWith('/api')
            ? `${parsed.origin}${pathname}`
            : `${parsed.origin}${pathname}/api`;
    } catch {
        return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
    }
};

// Automatically detect the API URL based on the frontend's hostname
const getApiUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;

    // If env URL is explicitly set and not empty, use it.
    // Accept either an API origin or an /api base path and normalize it.
    if (envUrl && envUrl.trim()) {
        if (envUrl.includes(',')) {
            return normalizeApiUrl(envUrl.split(',')[0]);
        }

        return normalizeApiUrl(envUrl);
    }

    // Default to same-origin API path to avoid CORS issues.
    // In Vite dev, this works with server.proxy. In production, use reverse proxy (/api -> backend).
    if (typeof window !== 'undefined' && window.location?.origin) {
        return `${window.location.origin}/api`;
    }

    return '/api';
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

// Handle response errors with controlled fallback
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const isDev = import.meta.env.DEV;

        // Prevent infinite retry loops
        if (originalRequest._retry) {
            // If already retried, handle auth errors
            if (error.response?.status === 401 && !originalRequest.url.includes('/signin')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }

        // If network error or timeout, try fallback URL only in development.
        if ((error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.response) && isDev) {
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

        if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.response) {
            console.log(`⚠️ Connection failed to ${api.defaults.baseURL}`);
        }

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest.url.includes('/signin')) {
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

export const getServerOrigin = () => {
    const apiUrl = getCurrentApiUrl().replace(/\/+$/, '');
    return apiUrl.replace(/\/api$/, '');
};

export const buildServerUrl = (path) => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${getServerOrigin()}${normalizedPath}`;
};

// Export function to refresh/re-detect API URL
export const refreshApiUrl = () => {
    const newUrl = getApiUrl();
    api.defaults.baseURL = newUrl;
    console.log(`🔄 API URL refreshed to: ${newUrl}`);
    return newUrl;
};

export default api;
