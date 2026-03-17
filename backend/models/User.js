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
    required: function() { return !this.googleId; }
    },
    googleId: {
        type: String
    },
    avatar: {
        type: String
    },
    token: {
        type: String,
        default: ''
    },
    otp: {
        type: String,
        default: ''
    },
    otpExpiry: {
        type: Date,
        default: ''
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
    totalWithdrawn: {
        type: Number,
        default: 0
    },
    transactions: [{
        type: { type: String, enum: ['deposit', 'withdrawal', 'payment'], required: true },
        amount: { type: Number, required: true },
        description: { type: String, required: true },
        status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
        date: { type: Date, default: Date.now }
    }],
    // Subscription
    subscription: {
        plan: {
            type: String,
            enum: ['none', 'starter', 'pro', 'elite'],
            default: 'starter'
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
    website: {
        type: String,
        default: ''
    },
    hiringNeeds: {
        type: [String],
        default: []
    },
    businessAddress: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        zip: { type: String, default: '' },
        taxId: { type: String, default: '' }
    },
    role: {
        type: String,
        enum: ['job_seeker', 'employer'],
        default: 'job_seeker'
    },
    // Enhanced Tasker Profile
    professionalTitle: {
        type: String,
        default: ''
    },
    bankDetails: {
        accountHolderName: { type: String, default: '' },
        bankName: { type: String, default: '' },
        accountNumber: { type: String, default: '' },
        routingNumber: { type: String, default: '' }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
