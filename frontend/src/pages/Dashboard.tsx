import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CreatePost from '../components/CreatePost';
import PostList from '../components/PostList';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    const { state, logout } = useAuth();
    const { user } = state;
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleLogout = () => {
        logout();
    };

    const handlePostCreated = () => {
        // Trigger post list refresh
        setRefreshTrigger(prev => prev + 1);
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
                    <div className="main-content">
                        <CreatePost onPostCreated={handlePostCreated} />
                        <PostList refreshTrigger={refreshTrigger} />
                    </div>

                    <aside className="sidebar">
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
                            <div className="feature-list">
                                <div className="feature-item">
                                    <h4>User Profiles</h4>
                                    <p>Visit other users' profiles</p>
                                </div>
                                <div className="feature-item">
                                    <h4>Follow System</h4>
                                    <p>Follow your favorite users</p>
                                </div>
                                <div className="feature-item">
                                    <h4>Comments</h4>
                                    <p>Comment on posts</p>
                                </div>
                                <div className="feature-item">
                                    <h4>Real-time Updates</h4>
                                    <p>Live notifications</p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;