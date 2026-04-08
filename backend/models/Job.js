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
    specificRole: {
        type: String
    },
    budget: {
        type: Number
    },
    minBudget: {
        type: Number
    },
    maxBudget: {
        type: Number
    },
    pricingType: {
        type: String,
        enum: ['fixed', 'range'],
        default: 'fixed'
    },
    // Event Specifics
    startDate: {
        type: Date,
        required: [true, 'Please add a start date']
    },
    duration: {
        value: {
            type: Number,
            required: [true, 'Please add a duration value']
        },
        unit: {
            type: String,
            enum: ['hours', 'days', 'weeks', 'months'],
            required: [true, 'Please add a duration unit']
        }
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
    positionsRequired: {
        type: Number,
        default: 1,
        min: 1
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
        proposal: {
            type: String
        },
        assessmentScore: {
            type: Number,
            default: 0
        },
        interviewStatus: {
            type: String,
            enum: ['none', 'pending', 'scheduled', 'completed'],
            default: 'none'
        },
        interviewLink: {
            type: String
        },
        interviewDate: {
            type: Date
        },
        status: {
            type: String,
            enum: ['applied', 'interviewing', 'hired', 'rejected'],
            default: 'applied'
        },
        offeredBudget: {
            type: Number
        },
        offeredBudgetStatus: {
            type: String,
            enum: ['none', 'pending', 'accepted', 'rejected'],
            default: 'none'
        },
        appliedAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Work Cycle & Payment
    // Overall Job State
    jobStatus: {
        type: String,
        enum: ['open', 'in_progress', 'closed', 'completed'],
        default: 'open'
    },
    // Multiple Contracts/Hires
    hires: [{
        freelancer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['hired', 'in_progress', 'completed', 'cancelled'],
            default: 'hired'
        },
        agreedBudget: {
            type: Number,
            default: 0
        },
        paidAmount: {
            type: Number,
            default: 0
        },
        escrowAmount: {
            type: Number,
            default: 0
        },
        hasBeenReviewed: {
            type: Boolean,
            default: false
        },
        review: {
            rating: Number,
            comment: String,
            date: { type: Date, default: Date.now }
        },
        paymentHistory: [{
            amount: Number,
            type: {
                type: String,
                enum: ['partial', 'full']
            },
            date: {
                type: Date,
                default: Date.now
            }
        }],
        progressUpdates: [{
            imageUrl: String,
            description: String,
            date: { type: Date, default: Date.now },
            proposedProgress: { type: Number },
            status: {
                type: String,
                enum: ['pending', 'approved', 'rejected'],
                default: 'pending'
            },
            rejectionReason: {
                type: String
            },
            verifiedProgress: {
                type: Number
            }
        }],
        progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        verifiedProgress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        hiredAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// End date calculation before saving
jobSchema.pre('save', async function () {
    if (this.startDate && this.duration) {
        // Recalculate if endDate is missing or if relevant fields changed
        if (!this.endDate || this.isModified('startDate') || this.isModified('duration')) {
            const start = new Date(this.startDate);
            const { value, unit } = this.duration;

            const end = new Date(start);
            if (unit === 'hours') end.setHours(end.getHours() + Number(value));
            else if (unit === 'days') end.setDate(end.getDate() + Number(value));
            else if (unit === 'weeks') end.setDate(end.getDate() + (Number(value) * 7));
            else if (unit === 'months') end.setMonth(end.getMonth() + Number(value));

            this.endDate = end;
        }
    }
});

// Dynamic progress calculation virtual
jobSchema.virtual('timeBasedProgress').get(function () {
    try {
        let startDateValue = this.startDate;
        let endDateValue = this.endDate;

        if (!startDateValue) return 0;

        // Fallback calculation if endDate is missing
        if (!endDateValue && this.duration && this.duration.value) {
            const start = new Date(startDateValue);
            const { value, unit } = this.duration;
            const fallbackEnd = new Date(start);
            const numValue = Number(value);

            if (unit === 'hours') fallbackEnd.setHours(fallbackEnd.getHours() + numValue);
            else if (unit === 'days') fallbackEnd.setDate(fallbackEnd.getDate() + numValue);
            else if (unit === 'weeks') fallbackEnd.setDate(fallbackEnd.getDate() + (numValue * 7));
            else if (unit === 'months') fallbackEnd.setMonth(fallbackEnd.getMonth() + numValue);

            endDateValue = fallbackEnd;
        }

        if (!endDateValue) return 0;

        const now = new Date();
        let start = new Date(startDateValue);
        const end = new Date(endDateValue);

        // Use the earlier of startDate or createdAt to ensure the timeline shows progress.
        if (this.jobStatus === 'in_progress' || this.jobStatus === 'completed' || (this.hires && this.hires.length > 0)) {
            const createdDate = new Date(this.createdAt || Date.now());
            if (createdDate < start) {
                start = createdDate;
            }
        }

        if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

        // If project hasn't started yet
        if (now < start) return 0;

        // If project is past its due date
        if (now >= end) return 100;

        const totalDuration = end.getTime() - start.getTime();
        if (totalDuration <= 0) return 100;

        const elapsed = now.getTime() - start.getTime();
        const progress = Math.round((elapsed / totalDuration) * 100);

        return Math.min(100, Math.max(0, progress));
    } catch (err) {
        console.error('Error in timeBasedProgress virtual:', err);
        return 0;
    }
});

// Configure JSON and Object output to include virtuals
jobSchema.set('toJSON', { virtuals: true });
jobSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Job', jobSchema);
