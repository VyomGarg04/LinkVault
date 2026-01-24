import axios from 'axios';

// Use same-origin /api path - Next.js rewrites will proxy to backend
const getBaseUrl = () => {
    // In browser, use relative path (same origin, no CORS)
    if (typeof window !== 'undefined') {
        return '/api';
    }
    // On server, use the full backend URL
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl) {
        return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
    }
    return 'http://localhost:3001/api';
};

const api = axios.create({
    baseURL: getBaseUrl(),
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access (e.g., redirect to login if not already there)
            // We can also trigger a global event here
        }
        return Promise.reject(error);
    }
);

export default api;
