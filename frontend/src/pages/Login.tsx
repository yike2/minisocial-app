import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const Login: React.FC = () => {
    const [formData, setFormData] = useState({
        identifier: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);

    const { state, login, clearError } = useAuth();
    const navigate = useNavigate();

    // Redirect if already authenticated
    useEffect(() => {
        if (state.isAuthenticated) {
            navigate('/dashboard');
        }
    }, [state.isAuthenticated, navigate]);

    // Clear errors when component mounts
    useEffect(() => {
        clearError();
    }, [clearError]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.identifier || !formData.password) {
            return;
        }

        try {
            await login(formData);
            // Navigation will happen automatically via useEffect
        } catch (error) {
            // Error is already handled by AuthContext
            console.error('Login failed:', error);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>MiniSocial</h1>
                    <h2>Welcome Back</h2>
                    <p>Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="identifier">Email or Username</label>
                        <input
                            type="text"
                            id="identifier"
                            name="identifier"
                            value={formData.identifier}
                            onChange={handleInputChange}
                            placeholder="Enter your email or username"
                            required
                            disabled={state.isLoading}
                            className={state.error ? 'error' : ''}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-input-container">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Enter your password"
                                required
                                disabled={state.isLoading}
                                className={state.error ? 'error' : ''}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={state.isLoading}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    {state.error && (
                        <div className="error-message">
                            {state.error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={state.isLoading || !formData.identifier || !formData.password}
                    >
                        {state.isLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account?{' '}
                        <Link to="/register" className="auth-link">
                            Sign up here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;