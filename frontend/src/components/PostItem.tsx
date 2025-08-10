import React, { useState } from 'react';
import { Post, postsAPI } from '../services/api';
import './PostItem.css';

interface PostItemProps {
    post: Post;
    currentUserId: string;
    onPostDeleted: (postId: string) => void;
    onPostLikeUpdate: (postId: string, newLikeCount: number, hasLiked: boolean) => void;
}

const PostItem: React.FC<PostItemProps> = ({
    post,
    currentUserId,
    onPostDeleted,
    onPostLikeUpdate
}) => {
    const [isLiking, setIsLiking] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    };

    // Handle like toggle
    const handleLikeToggle = async () => {
        if (isLiking) return;

        setIsLiking(true);
        try {
            const response = await postsAPI.toggleLike(post._id);
            onPostLikeUpdate(post._id, response.post.likeCount, response.post.hasLiked);
        } catch (error: any) {
            console.error('Error toggling like:', error);
        } finally {
            setIsLiking(false);
        }
    };

    // Handle post deletion
    const handleDelete = async () => {
        if (isDeleting) return;

        setIsDeleting(true);
        try {
            await postsAPI.deletePost(post._id);
            onPostDeleted(post._id);
        } catch (error: any) {
            console.error('Error deleting post:', error);
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    // Get author display name
    const getAuthorDisplayName = () => {
        const { firstName, lastName } = post.author.profileInfo;
        if (firstName || lastName) {
            return `${firstName || ''} ${lastName || ''}`.trim();
        }
        return post.author.username;
    };

    const isOwnPost = post.author._id === currentUserId;

    return (
        <div className="post-item">
            <div className="post-header">
                <div className="author-info">
                    <div className="author-avatar">
                        {getAuthorDisplayName().charAt(0).toUpperCase()}
                    </div>
                    <div className="author-details">
                        <h4 className="author-name">{getAuthorDisplayName()}</h4>
                        <span className="author-username">@{post.author.username}</span>
                        <span className="post-date">{formatDate(post.createdAt)}</span>
                    </div>
                </div>

                {isOwnPost && (
                    <div className="post-actions">
                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="delete-button"
                                disabled={isDeleting}
                                title="Delete post"
                            >
                                ×
                            </button>
                        ) : (
                            <div className="delete-confirm">
                                <span>Delete?</span>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="confirm-delete"
                                >
                                    {isDeleting ? '...' : 'Yes'}
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={isDeleting}
                                    className="cancel-delete"
                                >
                                    No
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="post-content">
                <p>{post.content}</p>
            </div>

            <div className="post-footer">
                <button
                    onClick={handleLikeToggle}
                    disabled={isLiking}
                    className={`like-button ${post.hasLiked ? 'liked' : ''}`}
                >
                    <span className="like-icon">
                        {post.hasLiked ? '❤️' : '🤍'}
                    </span>
                    <span className="like-count">
                        {post.likeCount}
                    </span>
                </button>
            </div>
        </div>
    );
};

export default PostItem;