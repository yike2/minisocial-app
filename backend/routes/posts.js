const express = require('express');
const jwt = require('jsonwebtoken');
const Post = require('../models/Post');
const Like = require('../models/Like');
const User = require('../models/User');

const router = express.Router();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'minisocial-development-secret-key';

// Authentication middleware
const authenticateToken = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                error: 'Access Denied',
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                error: 'Access Denied',
                message: 'Invalid token'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({
            error: 'Access Denied',
            message: 'Invalid token'
        });
    }
};

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { content } = req.body;

        // Validate content
        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Post content is required'
            });
        }

        if (content.length > 500) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Post content cannot exceed 500 characters'
            });
        }

        // Create new post
        const post = new Post({
            content: content.trim(),
            author: req.user._id
        });

        await post.save();

        // Populate author information
        await post.populate('author', 'username profileInfo.firstName profileInfo.lastName');

        res.status(201).json({
            message: 'Post created successfully',
            post: post
        });

    } catch (error) {
        console.error('Create post error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                error: 'Validation Error',
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Something went wrong while creating the post'
        });
    }
});

// @route   GET /api/posts
// @desc    Get timeline posts (all posts)
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Validate pagination parameters
        if (page < 1 || limit < 1 || limit > 50) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Invalid pagination parameters'
            });
        }

        const posts = await Post.getTimelinePosts({ page, limit });
        const totalPosts = await Post.getPostsCount();
        const totalPages = Math.ceil(totalPosts / limit);

        // Add liked status for current user
        const postsWithLikeStatus = await Promise.all(
            posts.map(async (post) => {
                const hasLiked = await Like.hasUserLiked(req.user._id, post._id);
                return {
                    ...post,
                    hasLiked
                };
            })
        );

        res.status(200).json({
            message: 'Posts retrieved successfully',
            posts: postsWithLikeStatus,
            pagination: {
                currentPage: page,
                totalPages,
                totalPosts,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.error('Get posts error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Something went wrong while retrieving posts'
        });
    }
});

// @route   GET /api/posts/user/:userId
// @desc    Get posts by specific user
// @access  Private
router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Validate user ID
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Invalid user ID'
            });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'User not found'
            });
        }

        const posts = await Post.getUserPosts(userId, { page, limit });
        const totalPosts = await Post.getPostsCount({ author: userId });
        const totalPages = Math.ceil(totalPosts / limit);

        // Add liked status for current user
        const postsWithLikeStatus = await Promise.all(
            posts.map(async (post) => {
                const hasLiked = await Like.hasUserLiked(req.user._id, post._id);
                return {
                    ...post,
                    hasLiked
                };
            })
        );

        res.status(200).json({
            message: 'User posts retrieved successfully',
            posts: postsWithLikeStatus,
            user: {
                _id: user._id,
                username: user.username,
                profileInfo: user.profileInfo
            },
            pagination: {
                currentPage: page,
                totalPages,
                totalPosts,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.error('Get user posts error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Something went wrong while retrieving user posts'
        });
    }
});

// @route   GET /api/posts/:postId
// @desc    Get single post by ID
// @access  Private
router.get('/:postId', authenticateToken, async (req, res) => {
    try {
        const { postId } = req.params;

        // Validate post ID
        if (!postId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Invalid post ID'
            });
        }

        const post = await Post.findOne({ _id: postId, isActive: true })
            .populate('author', 'username profileInfo.firstName profileInfo.lastName');

        if (!post) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Post not found'
            });
        }

        // Check if current user has liked this post
        const hasLiked = await Like.hasUserLiked(req.user._id, post._id);

        res.status(200).json({
            message: 'Post retrieved successfully',
            post: {
                ...post.toObject(),
                hasLiked
            }
        });

    } catch (error) {
        console.error('Get post error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Something went wrong while retrieving the post'
        });
    }
});

// @route   DELETE /api/posts/:postId
// @desc    Delete a post
// @access  Private (only post author)
router.delete('/:postId', authenticateToken, async (req, res) => {
    try {
        const { postId } = req.params;

        // Validate post ID
        if (!postId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Invalid post ID'
            });
        }

        const post = await Post.findOne({ _id: postId, isActive: true });

        if (!post) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Post not found'
            });
        }

        // Check if user is the author
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You can only delete your own posts'
            });
        }

        // Soft delete (mark as inactive)
        post.isActive = false;
        await post.save();

        res.status(200).json({
            message: 'Post deleted successfully'
        });

    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Something went wrong while deleting the post'
        });
    }
});

// @route   POST /api/posts/:postId/like
// @desc    Toggle like on a post
// @access  Private
router.post('/:postId/like', authenticateToken, async (req, res) => {
    try {
        const { postId } = req.params;

        // Validate post ID
        if (!postId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Invalid post ID'
            });
        }

        // Check if post exists
        const post = await Post.findOne({ _id: postId, isActive: true });
        if (!post) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Post not found'
            });
        }

        // Toggle like
        const result = await Like.toggleLike(req.user._id, postId);

        // Get updated post with new like count
        const updatedPost = await Post.findById(postId)
            .populate('author', 'username profileInfo.firstName profileInfo.lastName');

        res.status(200).json({
            message: result.message,
            action: result.action,
            liked: result.liked,
            post: {
                _id: updatedPost._id,
                likeCount: updatedPost.likeCount,
                hasLiked: result.liked
            }
        });

    } catch (error) {
        console.error('Toggle like error:', error);

        if (error.message === 'You have already liked this post') {
            return res.status(409).json({
                error: 'Conflict',
                message: error.message
            });
        }

        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Something went wrong while processing like'
        });
    }
});

module.exports = router;