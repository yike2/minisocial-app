import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, authAPI, RegisterData, LoginData } from '../services/api';

// Auth state interface
interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

// Auth actions
type AuthAction =
    | { type: 'AUTH_START' }
    | { type: 'AUTH_SUCCESS'; payload: User }
    | { type: 'AUTH_FAILURE'; payload: string }
    | { type: 'AUTH_LOGOUT' }
    | { type: 'CLEAR_ERROR' };

// Auth context interface
interface AuthContextType {
    state: AuthState;
    login: (credentials: LoginData) => Promise<void>;
    register: (userData: RegisterData) => Promise<void>;
    logout: () => void;
    clearError: () => void;
}

// Initial state
const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'AUTH_START':
            return {
                ...state,
                isLoading: true,
                error: null,
            };
        case 'AUTH_SUCCESS':
            return {
                ...state,
                user: action.payload,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            };
        case 'AUTH_FAILURE':
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: action.payload,
            };
        case 'AUTH_LOGOUT':
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            };
        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null,
            };
        default:
            return state;
    }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Check for existing auth on mount
    useEffect(() => {
        const checkAuth = async () => {
            if (authAPI.isAuthenticated()) {
                const currentUser = authAPI.getCurrentUser();
                if (currentUser) {
                    dispatch({ type: 'AUTH_SUCCESS', payload: currentUser });
                } else {
                    // Token exists but no user data, try to fetch profile
                    try {
                        const response = await authAPI.getProfile();
                        dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
                    } catch (error) {
                        // Token invalid, clear auth
                        authAPI.logout();
                        dispatch({ type: 'AUTH_LOGOUT' });
                    }
                }
            }
        };

        checkAuth();
    }, []);

    // Login function
    const login = async (credentials: LoginData): Promise<void> => {
        try {
            dispatch({ type: 'AUTH_START' });
            const response = await authAPI.login(credentials);
            dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
        } catch (error: any) {
            const errorMessage = error.message || 'Login failed';
            dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
            throw error;
        }
    };

    // Register function
    const register = async (userData: RegisterData): Promise<void> => {
        try {
            dispatch({ type: 'AUTH_START' });
            const response = await authAPI.register(userData);
            dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
        } catch (error: any) {
            const errorMessage = error.message || 'Registration failed';
            dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
            throw error;
        }
    };

    // Logout function
    const logout = (): void => {
        authAPI.logout();
        dispatch({ type: 'AUTH_LOGOUT' });
    };

    // Clear error function
    const clearError = (): void => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    const value: AuthContextType = {
        state,
        login,
        register,
        logout,
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;