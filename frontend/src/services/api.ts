import axios from 'axios';

// API base URL - points to our backend server
const API_BASE_URL = 'https://minisocial-backend.onrender.com/api';

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

export interface Post {
    _id: string;
    content: string;
    author: {
        _id: string;
        username: string;
        profileInfo: {
            firstName: string;
            lastName: string;
        };
    };
    likeCount: number;
    hasLiked: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    formattedDate?: string;
}

export interface CreatePostData {
    content: string;
}

export interface PostsResponse {
    message: string;
    posts: Post[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalPosts: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
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

// Posts API functions
export const postsAPI = {
    // Create a new post
    createPost: async (postData: CreatePostData): Promise<{ message: string; post: Post }> => {
        try {
            const response = await apiClient.post('/posts', postData);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { error: 'Network Error', message: 'Failed to create post' };
        }
    },

    // Get timeline posts (all posts)
    getTimelinePosts: async (page: number = 1, limit: number = 10): Promise<PostsResponse> => {
        try {
            const response = await apiClient.get(`/posts?page=${page}&limit=${limit}`);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { error: 'Network Error', message: 'Failed to get posts' };
        }
    },

    // Get posts by a specific user
    getUserPosts: async (userId: string, page: number = 1, limit: number = 10): Promise<PostsResponse> => {
        try {
            const response = await apiClient.get(`/posts/user/${userId}?page=${page}&limit=${limit}`);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { error: 'Network Error', message: 'Failed to get user posts' };
        }
    },

    // Get single post by ID
    getPost: async (postId: string): Promise<{ message: string; post: Post }> => {
        try {
            const response = await apiClient.get(`/posts/${postId}`);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { error: 'Network Error', message: 'Failed to get post' };
        }
    },

    // Delete a post
    deletePost: async (postId: string): Promise<{ message: string }> => {
        try {
            const response = await apiClient.delete(`/posts/${postId}`);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { error: 'Network Error', message: 'Failed to delete post' };
        }
    },

    // Toggle like on a post
    toggleLike: async (postId: string): Promise<{
        message: string;
        action: string;
        liked: boolean;
        post: { _id: string; likeCount: number; hasLiked: boolean }
    }> => {
        try {
            const response = await apiClient.post(`/posts/${postId}/like`);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { error: 'Network Error', message: 'Failed to toggle like' };
        }
    }
};

export default apiClient;