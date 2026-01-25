import axios from 'axios';

// Use same-origin /api path - Next.js rewrites will proxy to backend
const getBaseUrl = () => {
    // Always use the full URL from environment variables
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl) {
        return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
        // Remove the /api suffix logic if your env var already includes it, 
        // but robust handling is safer.
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
