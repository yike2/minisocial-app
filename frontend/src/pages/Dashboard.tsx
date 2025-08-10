import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    const { state, logout } = useAuth();
    const { user } = state;

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <h1>MiniSocial</h1>
                    <div className="user-menu">
                        <span className="user-greeting">
                            Welcome, {user?.profileInfo?.firstName || user?.username}!
                        </span>
                        <button onClick={handleLogout} className="logout-button">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="dashboard-main">
                <div className="dashboard-content">
                    <div className="welcome-section">
                        <h2>Welcome to MiniSocial!</h2>
                        <p>Your authentication system is working perfectly.</p>
                    </div>

                    <div className="user-info-card">
                        <h3>Your Profile</h3>
                        <div className="user-details">
                            <div className="detail-item">
                                <label>Username:</label>
                                <span>{user?.username}</span>
                            </div>
                            <div className="detail-item">
                                <label>Email:</label>
                                <span>{user?.email}</span>
                            </div>
                            {user?.profileInfo?.firstName && (
                                <div className="detail-item">
                                    <label>First Name:</label>
                                    <span>{user.profileInfo.firstName}</span>
                                </div>
                            )}
                            {user?.profileInfo?.lastName && (
                                <div className="detail-item">
                                    <label>Last Name:</label>
                                    <span>{user.profileInfo.lastName}</span>
                                </div>
                            )}
                            <div className="detail-item">
                                <label>Member Since:</label>
                                <span>{new Date(user?.createdAt || '').toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="features-section">
                        <h3>Coming Soon</h3>
                        <div className="feature-grid">
                            <div className="feature-item">
                                <h4>Create Posts</h4>
                                <p>Share your thoughts with the community</p>
                            </div>
                            <div className="feature-item">
                                <h4>Follow Users</h4>
                                <p>Connect with other members</p>
                            </div>
                            <div className="feature-item">
                                <h4>Like & Comment</h4>
                                <p>Engage with posts you love</p>
                            </div>
                            <div className="feature-item">
                                <h4>Notifications</h4>
                                <p>Stay updated with activities</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;