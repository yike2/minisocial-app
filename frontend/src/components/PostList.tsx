import React, { useState, useEffect } from 'react';
import { Post, postsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PostItem from './PostItem';
import './PostList.css';

interface PostListProps {
    refreshTrigger?: number;
}

const PostList: React.FC<PostListProps> = ({ refreshTrigger = 0 }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);

    const { state } = useAuth();
    const postsPerPage = 10;

    // Load posts function
    const loadPosts = async (page: number = 1, append: boolean = false) => {
        try {
            if (page === 1) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }
            setError(null);

            const response = await postsAPI.getTimelinePosts(page, postsPerPage);

            if (append) {
                setPosts(prevPosts => [...prevPosts, ...response.posts]);
            } else {
                setPosts(response.posts);
            }

            setTotalPages(response.pagination.totalPages);
            setCurrentPage(page);
        } catch (error: any) {
            setError(error.message || 'Failed to load posts');
            console.error('Error loading posts:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Load posts on component mount and when refreshTrigger changes
    useEffect(() => {
        loadPosts(1);
    }, [refreshTrigger]);

    // Handle load more posts
    const handleLoadMore = () => {
        if (currentPage < totalPages && !loadingMore) {
            loadPosts(currentPage + 1, true);
        }
    };

    // Handle post deletion
    const handlePostDeleted = (deletedPostId: string) => {
        setPosts(prevPosts => prevPosts.filter(post => post._id !== deletedPostId));
    };

    // Handle post like update
    const handlePostLikeUpdate = (postId: string, newLikeCount: number, hasLiked: boolean) => {
        setPosts(prevPosts =>
            prevPosts.map(post =>
                post._id === postId
                    ? { ...post, likeCount: newLikeCount, hasLiked }
                    : post
            )
        );
    };

    // Retry loading posts
    const handleRetry = () => {
        loadPosts(1);
    };

    // Loading state
    if (loading) {
        return (
            <div className="post-list-loading">
                <div className="loading-spinner"></div>
                <p>Loading posts...</p>
            </div>
        );
    }

    // Error state
    if (error && posts.length === 0) {
        return (
            <div className="post-list-error">
                <h3>Unable to load posts</h3>
                <p>{error}</p>
                <button onClick={handleRetry} className="retry-button">
                    Try Again
                </button>
            </div>
        );
    }

    // Empty state
    if (posts.length === 0) {
        return (
            <div className="post-list-empty">
                <h3>No posts yet</h3>
                <p>Be the first to share something with the community!</p>
            </div>
        );
    }

    return (
        <div className="post-list-container">
            <div className="post-list-header">
                <h3>Recent Posts</h3>
                <span className="post-count">
                    {posts.length} of {totalPages * postsPerPage} posts
                </span>
            </div>

            {error && (
                <div className="error-banner">
                    <p>Error: {error}</p>
                    <button onClick={handleRetry} className="retry-button-small">
                        Retry
                    </button>
                </div>
            )}

            <div className="post-list">
                {posts.map((post) => (
                    <PostItem
                        key={post._id}
                        post={post}
                        currentUserId={state.user?._id || ''}
                        onPostDeleted={handlePostDeleted}
                        onPostLikeUpdate={handlePostLikeUpdate}
                    />
                ))}
            </div>

            {currentPage < totalPages && (
                <div className="load-more-container">
                    <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="load-more-button"
                    >
                        {loadingMore ? (
                            <>
                                <div className="small-spinner"></div>
                                Loading more...
                            </>
                        ) : (
                            `Load More Posts (${totalPages - currentPage} pages remaining)`
                        )}
                    </button>
                </div>
            )}

            {currentPage >= totalPages && posts.length > 0 && (
                <div className="end-of-posts">
                    <p>You've seen all posts!</p>
                </div>
            )}
        </div>
    );
};

export default PostList;