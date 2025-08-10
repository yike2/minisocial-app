import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    const { state, register, clearError } = useAuth();
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

        // Clear validation errors when user starts typing
        if (validationErrors.length > 0) {
            setValidationErrors([]);
        }
    };

    const validateForm = (): boolean => {
        const errors: string[] = [];

        if (formData.username.length < 3) {
            errors.push('Username must be at least 3 characters long');
        }

        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.push('Please enter a valid email address');
        }

        if (formData.password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }

        if (formData.password !== formData.confirmPassword) {
            errors.push('Passwords do not match');
        }

        setValidationErrors(errors);
        return errors.length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const { confirmPassword, ...registerData } = formData;

        try {
            await register(registerData);
            // Navigation will happen automatically via useEffect
        } catch (error) {
            // Error is already handled by AuthContext
            console.error('Registration failed:', error);
        }
    };

    const isFormValid = formData.username && formData.email && formData.password &&
        formData.confirmPassword && validationErrors.length === 0;

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>MiniSocial</h1>
                    <h2>Create Account</h2>
                    <p>Join our community today</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="firstName">First Name</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                placeholder="First name (optional)"
                                disabled={state.isLoading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="lastName">Last Name</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                placeholder="Last name (optional)"
                                disabled={state.isLoading}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="username">Username *</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            placeholder="Choose a username"
                            required
                            disabled={state.isLoading}
                            className={validationErrors.length > 0 ? 'error' : ''}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email"
                            required
                            disabled={state.isLoading}
                            className={validationErrors.length > 0 ? 'error' : ''}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password *</label>
                        <div className="password-input-container">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Create a password (min 6 characters)"
                                required
                                disabled={state.isLoading}
                                className={validationErrors.length > 0 ? 'error' : ''}
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

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password *</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Confirm your password"
                            required
                            disabled={state.isLoading}
                            className={validationErrors.length > 0 ? 'error' : ''}
                        />
                    </div>

                    {validationErrors.length > 0 && (
                        <div className="error-message">
                            <ul>
                                {validationErrors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {state.error && (
                        <div className="error-message">
                            {state.error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={state.isLoading || !isFormValid}
                    >
                        {state.isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account?{' '}
                        <Link to="/login" className="auth-link">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;