const mongoose = require('mongoose');

const appFeedbackSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    role: {
        type: String, // 'employer' or 'job_seeker'
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    feedback: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AppFeedback', appFeedbackSchema);
