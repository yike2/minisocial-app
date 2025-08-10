const mongoose = require('mongoose');

// Like Schema Definition
const likeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required for like']
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: [true, 'Post is required for like']
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

// Compound index to ensure one like per user per post
likeSchema.index({ user: 1, post: 1 }, { unique: true });

// Index for performance queries
likeSchema.index({ post: 1 }); // For getting all likes of a post
likeSchema.index({ user: 1 }); // For getting all likes by a user

// Static method to toggle like (like/unlike)
likeSchema.statics.toggleLike = async function (userId, postId) {
    const Post = mongoose.model('Post');

    try {
        // Check if like already exists
        const existingLike = await this.findOne({ user: userId, post: postId });

        if (existingLike) {
            // Unlike: Remove the like
            await this.deleteOne({ user: userId, post: postId });

            // Decrement post like count
            await Post.findByIdAndUpdate(postId, { $inc: { likeCount: -1 } });

            return {
                action: 'unliked',
                liked: false,
                message: 'Post unliked successfully'
            };
        } else {
            // Like: Create new like
            const newLike = new this({ user: userId, post: postId });
            await newLike.save();

            // Increment post like count
            await Post.findByIdAndUpdate(postId, { $inc: { likeCount: 1 } });

            return {
                action: 'liked',
                liked: true,
                message: 'Post liked successfully'
            };
        }
    } catch (error) {
        if (error.code === 11000) {
            // Duplicate key error - like already exists
            throw new Error('You have already liked this post');
        }
        throw error;
    }
};

// Static method to check if user liked a post
likeSchema.statics.hasUserLiked = async function (userId, postId) {
    const like = await this.findOne({ user: userId, post: postId });
    return !!like;
};

// Static method to get users who liked a post
likeSchema.statics.getPostLikers = async function (postId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    return await this.find({ post: postId })
        .populate('user', 'username profileInfo.firstName profileInfo.lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
};

// Static method to get posts liked by a user
likeSchema.statics.getUserLikedPosts = async function (userId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    return await this.find({ user: userId })
        .populate({
            path: 'post',
            populate: {
                path: 'author',
                select: 'username profileInfo.firstName profileInfo.lastName'
            }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
};

// Static method to get like statistics
likeSchema.statics.getLikeStats = async function () {
    const totalLikes = await this.countDocuments();
    const uniqueUsers = await this.distinct('user').length;
    const uniquePosts = await this.distinct('post').length;

    return {
        totalLikes,
        uniqueUsers,
        uniquePosts,
        averageLikesPerPost: uniquePosts > 0 ? (totalLikes / uniquePosts).toFixed(2) : 0
    };
};

// Pre-remove middleware to update post like count when like is deleted
likeSchema.pre('deleteOne', { document: false, query: true }, async function () {
    const like = await this.model.findOne(this.getQuery());
    if (like) {
        const Post = mongoose.model('Post');
        await Post.findByIdAndUpdate(like.post, { $inc: { likeCount: -1 } });
    }
});

// Create and export the model
const Like = mongoose.model('Like', likeSchema);

module.exports = Like;