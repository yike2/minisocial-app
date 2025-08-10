import axios from 'axios';

// API base URL - points to our backend server
const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid, remove from storage
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            // Optionally redirect to login page
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Type definitions
export interface User {
    _id: string;
    username: string;
    email: string;
    profileInfo: {
        firstName: string;
        lastName: string;
        bio?: string;
    };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    message: string;
    token: string;
    user: User;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

export interface LoginData {
    identifier: string; // email or username
    password: string;
}

export interface ApiError {
    error: string;
    message: string;
}

// Authentication API functions
export const authAPI = {
    // Register new user
    register: async (userData: RegisterData): Promise<AuthResponse> => {
        try {
            const response = await apiClient.post('/auth/register', userData);
            const { token, user } = response.data;

            // Store token and user data in localStorage
            localStorage.setItem('authToken', token);
            localStorage.setItem('user', JSON.stringify(user));

            return response.data;
        } catch (error: any) {
            throw error.response?.data || { error: 'Network Error', message: 'Failed to register' };
        }
    },

    // Login user
    login: async (credentials: LoginData): Promise<AuthResponse> => {
        try {
            const response = await apiClient.post('/auth/login', credentials);
            const { token, user } = response.data;

            // Store token and user data in localStorage
            localStorage.setItem('authToken', token);
            localStorage.setItem('user', JSON.stringify(user));

            return response.data;
        } catch (error: any) {
            throw error.response?.data || { error: 'Network Error', message: 'Failed to login' };
        }
    },

    // Get current user profile
    getProfile: async (): Promise<{ user: User }> => {
        try {
            const response = await apiClient.get('/auth/profile');
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { error: 'Network Error', message: 'Failed to get profile' };
        }
    },

    // Logout user (client-side)
    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },

    // Check if user is authenticated
    isAuthenticated: (): boolean => {
        const token = localStorage.getItem('authToken');
        return !!token;
    },

    // Get current user from localStorage
    getCurrentUser: (): User | null => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
};

export default apiClient;