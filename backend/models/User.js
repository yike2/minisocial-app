const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema Definition
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long'],
        maxlength: [20, 'Username cannot exceed 20 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    profileInfo: {
        firstName: {
            type: String,
            trim: true,
            maxlength: [50, 'First name cannot exceed 50 characters']
        },
        lastName: {
            type: String,
            trim: true,
            maxlength: [50, 'Last name cannot exceed 50 characters']
        },
        bio: {
            type: String,
            maxlength: [500, 'Bio cannot exceed 500 characters']
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
    // Only hash password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    try {
        // Hash password with cost factor of 12
        const saltRounds = 12;
        this.password = await bcrypt.hash(this.password, saltRounds);
        next();
    } catch (error) {
        next(error);
    }
});

// Instance method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Instance method to get public profile (without sensitive info)
userSchema.methods.getPublicProfile = function () {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

// Static method to find user by email or username
userSchema.statics.findByCredentials = async function (identifier) {
    const user = await this.findOne({
        $or: [
            { email: identifier },
            { username: identifier }
        ]
    });
    return user;
};

// Create and export the model
const User = mongoose.model('User', userSchema);

module.exports = User;