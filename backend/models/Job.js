const mongoose = require('mongoose');

const jobSchema = mongoose.Schema({
    employer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: [true, 'Please add a job title']
    },
    company: {
        type: String,
        required: [true, 'Please add a company name']
    },
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    salary: {
        type: String,
        required: [true, 'Please add a salary range']
    },
    // Event Specifics
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    startTime: {
        type: String
    },
    endTime: {
        type: String
    },
    venue: {
        type: String
    },
    uniformRequirements: {
        type: String
    },
    // Screening & Applications
    screeningQuestions: [{
        type: String
    }],
    applications: [{
        applicant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        answers: [{
            question: String,
            answer: String
        }],
        status: {
            type: String,
            enum: ['applied', 'interviewing', 'hired', 'rejected'],
            default: 'applied'
        },
        appliedAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Work Cycle & Payment
    hiredTasker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    jobStatus: {
        type: String,
        enum: ['open', 'hired', 'in_progress', 'completed', 'paid'],
        default: 'open'
    },
    escrowAmount: {
        type: Number,
        default: 0
    },
    progressUpdates: [{
        imageUrl: String,
        description: String,
        date: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);
