const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password']
    },
    country: {
        type: String,
        default: ''
    },
    // Tasker Specific
    skills: {
        type: [String],
        default: []
    },
    bio: {
        type: String,
        default: ''
    },
    hourlyRate: {
        type: Number,
        default: 0
    },
    walletBalance: {
        type: Number,
        default: 0
    },
    // Reputation System
    experience: {
        type: Number, // Years of experience
        default: 0
    },
    completedProjects: {
        type: Number,
        default: 0
    },
    totalEarnings: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0 // 0 to 5
    },
    reviews: [{
        rating: Number,
        comment: String,
        reviewerName: String,
        date: { type: Date, default: Date.now }
    }],
    // Subscription
    subscription: {
        plan: {
            type: String,
            enum: ['none', 'starter', 'pro', 'elite'],
            default: 'none'
        },
        status: {
            type: String,
            enum: ['active', 'expired', 'cancelled'],
            default: 'active' // Default active for now to let existing users work, or 'none'
        },
        expiresAt: {
            type: Date
        }
    },
    // Organizer Specific
    companyName: {
        type: String,
        default: ''
    },
    industry: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['job_seeker', 'employer'],
        default: 'job_seeker'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
