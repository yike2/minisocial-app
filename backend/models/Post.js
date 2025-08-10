const mongoose = require('mongoose');

// Post Schema Definition
const postSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Post content is required'],
        trim: true,
        maxlength: [500, 'Post content cannot exceed 500 characters'],
        minlength: [1, 'Post content cannot be empty']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Post author is required']
    },
    likeCount: {
        type: Number,
        default: 0,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

// Indexes for performance
postSchema.index({ author: 1, createdAt: -1 }); // For user's posts sorted by date
postSchema.index({ createdAt: -1 }); // For timeline sorted by date
postSchema.index({ author: 1, isActive: 1 }); // For active posts by user

// Instance method to increment like count
postSchema.methods.incrementLikes = async function () {
    this.likeCount += 1;
    return await this.save();
};

// Instance method to decrement like count
postSchema.methods.decrementLikes = async function () {
    if (this.likeCount > 0) {
        this.likeCount -= 1;
        return await this.save();
    }
    return this;
};

// Static method to get posts with author information
postSchema.statics.getPostsWithAuthor = async function (filter = {}, options = {}) {
    const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = -1
    } = options;

    const skip = (page - 1) * limit;

    return await this.find({ isActive: true, ...filter })
        .populate('author', 'username profileInfo.firstName profileInfo.lastName')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(); // Returns plain objects for better performance
};

// Static method to get user's posts
postSchema.statics.getUserPosts = async function (userId, options = {}) {
    return await this.getPostsWithAuthor(
        { author: userId },
        options
    );
};

// Static method to get timeline posts (all posts)
postSchema.statics.getTimelinePosts = async function (options = {}) {
    return await this.getPostsWithAuthor({}, options);
};

// Static method to get posts count
postSchema.statics.getPostsCount = async function (filter = {}) {
    return await this.countDocuments({ isActive: true, ...filter });
};

// Virtual for formatted creation date
postSchema.virtual('formattedDate').get(function () {
    return this.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
});

// Ensure virtual fields are serialized
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

// Create and export the model
const Post = mongoose.model('Post', postSchema);

module.exports = Post;