const Job = require('../models/Job');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find().populate('employer', 'name company');
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private (Employer only)
const createJob = async (req, res) => {
    console.log('[DEBUG] createJob received body:', JSON.stringify(req.body, null, 2));
    try {
        if (req.user.role !== 'employer') {
            return res.status(403).json({ message: 'Not authorized as an employer' });
        }

        const {
            title, company, location, description, salary, budget, startDate, duration,
            screeningQuestions, endDate, startTime, endTime, venue, uniformRequirements
        } = req.body;

        if (!title) return res.status(400).json({ message: 'Please add a job title' });
        if (!description) return res.status(400).json({ message: 'Please add a description' });
        if (!company) return res.status(400).json({ message: 'Please add a company name' });
        if (!location) return res.status(400).json({ message: 'Please add a location' });
        if (!salary) return res.status(400).json({ message: 'Please add a salary/rate' });
        if (!startDate) return res.status(400).json({ message: 'Please add a starting date' });
        if (!duration || !duration.value || !duration.unit) return res.status(400).json({ message: 'Please add a work duration' });

        // Extract numeric budget from salary if not provided
        let jobBudget = Number(budget);
        if (!jobBudget && salary) {
            const numericMatch = salary.replace(/,/g, '').match(/\d+/);
            if (numericMatch) {
                jobBudget = Number(numericMatch[0]);
            }
        }

        console.log('[DEBUG] Attempting to create job with payload:', JSON.stringify({
            employer: req.user.id,
            title,
            company,
            location,
            description,
            salary,
            budget: jobBudget || 0,
            startDate,
            duration,
            screeningQuestions: screeningQuestions || [],
            endDate,
            startTime,
            endTime,
            venue,
            uniformRequirements
        }, null, 2));

        const job = await Job.create({
            employer: req.user.id,
            title,
            company,
            location,
            description,
            salary,
            budget: jobBudget || 0,
            startDate,
            duration,
            screeningQuestions: screeningQuestions || [],
            endDate,
            startTime,
            endTime,
            venue,
            uniformRequirements
        });

        console.log('[DEBUG] Job created in DB:', JSON.stringify(job, null, 2));

        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Release payment to freelancer
// @route   PUT /api/jobs/:id/pay
// @access  Private (Employer only)
const releasePayment = async (req, res) => {
    try {
        const { type } = req.body; // 'partial' or 'full'
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.employer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only the employer can release payments' });
        }

        if (!job.hiredTasker) {
            return res.status(400).json({ message: 'No freelancer hired for this job' });
        }

        const budget = job.budget || 0;
        const alreadyPaid = job.paidAmount || 0;
        const progress = job.progress || 0;

        let amountToPay = 0;

        if (type === 'partial') {
            const totalOwedForProgress = Math.round((progress / 100) * budget);
            amountToPay = totalOwedForProgress - alreadyPaid;
        } else if (type === 'full') {
            amountToPay = budget - alreadyPaid;
        } else {
            return res.status(400).json({ message: 'Invalid payment type. Use partial or full.' });
        }

        if (amountToPay <= 0) {
            return res.status(400).json({ message: 'No pending payment amount for the current progress.' });
        }

        // Update payment fields
        job.paidAmount += amountToPay;
        job.paymentHistory.push({
            amount: amountToPay,
            type: type,
            date: new Date()
        });

        // Update job status
        if (job.paidAmount >= budget) {
            job.jobStatus = 'paid';
        } else {
            job.jobStatus = 'partially_paid';
        }

        await job.save();

        res.status(200).json({
            message: `Payment of ₹${amountToPay} released successfully`,
            job
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Get my jobs
// @route   GET /api/jobs/my-jobs
// @access  Private (Employer only)
const getMyJobs = async (req, res) => {
    try {
        if (req.user.role !== 'employer') {
            return res.status(403).json({ message: 'Not authorized as an employer' });
        }

        const jobs = await Job.find({ employer: req.user.id })
            .populate('hiredTasker', 'name email skills hourlyRate')
            .populate('applications.applicant', 'name email skills hourlyRate');

        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Private
const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('employer', 'name email company')
            .populate('applications.applicant', 'name email skills hourlyRate bio assessmentScore rating completedProjects totalEarnings experience');

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Schedule an interview
// @route   PUT /api/jobs/:id/interview
// @access  Private (Employer only)
const scheduleInterview = async (req, res) => {
    try {
        const { applicantId, interviewLink, interviewDate } = req.body;
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.employer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const application = job.applications.find(app => app.applicant.toString() === applicantId);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        application.interviewLink = interviewLink;
        application.interviewDate = interviewDate;
        application.interviewStatus = 'scheduled';
        application.status = 'interviewing';

        await job.save();
        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Hire an applicant
// @route   PUT /api/jobs/:id/hire
// @access  Private (Employer only)
const hireApplicant = async (req, res) => {
    try {
        const { applicantId } = req.body;
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.employer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const application = job.applications.find(app => app.applicant.toString() === applicantId);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Use negotiated budget if it was accepted
        if (application.offeredBudgetStatus === 'accepted' && application.offeredBudget) {
            console.log(`[Hire] Using negotiated budget: ₹${application.offeredBudget}`);
            job.budget = application.offeredBudget;
        }

        application.status = 'hired';
        job.hiredTasker = applicantId;
        job.jobStatus = 'in_progress'; // Status is now in_progress when someone is hired

        await job.save();
        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Reject an applicant
// @route   PUT /api/jobs/:id/reject
// @access  Private (Employer only)
const rejectApplicant = async (req, res) => {
    try {
        const { applicantId } = req.body;
        console.log(`[Reject] Attempting to reject applicant ${applicantId} for job ${req.params.id}`);

        const job = await Job.findById(req.params.id);

        if (!job) {
            console.log("[Reject] Job not found");
            return res.status(404).json({ message: 'Job not found' });
        }

        console.log(`[Reject] Job Employer: ${job.employer}, User: ${req.user.id}`);
        if (job.employer.toString() !== req.user.id) {
            console.log("[Reject] Not authorized");
            return res.status(403).json({ message: 'Not authorized' });
        }

        const application = job.applications.find(app => app.applicant.equals(applicantId));
        if (!application) {
            console.log("[Reject] Application not found");
            return res.status(404).json({ message: 'Application not found' });
        }

        application.status = 'rejected';

        await job.save();
        console.log("[Reject] Application rejected successfully");
        res.status(200).json(job);
    } catch (error) {
        console.log("[Reject] Error:", error.message);
        res.status(500).json({ message: error.message });
    }
}

// @desc    Add progress update to a job
// @route   POST /api/jobs/:id/update
// @access  Private (Hired Tasker only)
const addJobUpdate = async (req, res) => {
    try {
        const { description, imageUrl, progress } = req.body;
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (!job.hiredTasker || job.hiredTasker.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only the hired tasker can post updates' });
        }

        const newUpdate = {
            description,
            imageUrl: imageUrl || '',
            date: new Date(),
            status: 'pending'
        };

        if (progress !== undefined) {
            newUpdate.proposedProgress = Number(progress);
        }

        job.progressUpdates.push(newUpdate);

        await job.save();
        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Verify a progress update
// @route   PUT /api/jobs/:id/update/:updateId/verify
// @access  Private (Employer only)
const verifyJobUpdate = async (req, res) => {
    try {
        const { action, overrideProgress, rejectionReason } = req.body; // 'approve' or 'reject'
        console.log(`Verifying update: action=${action}, overrideProgress=${overrideProgress}`);
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.employer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only the employer can verify updates' });
        }

        const update = job.progressUpdates.id(req.params.updateId);

        if (!update) {
            return res.status(404).json({ message: 'Update not found' });
        }

        if (action === 'approve') {
            update.status = 'approved';

            // Priority: overrideProgress > update.proposedProgress > job.progress
            let finalProgress = job.progress || 0;
            if (overrideProgress !== undefined) {
                finalProgress = Number(overrideProgress);
            } else if (update.proposedProgress !== undefined) {
                finalProgress = update.proposedProgress;
            }

            // Explicitly set verifiedProgress on the subdoc
            update.verifiedProgress = finalProgress;

            // Sync main job progress
            job.progress = finalProgress;

            if (job.progress >= 100) {
                job.jobStatus = 'completed';
            }
            console.log(`Step: Approval - Final Progress set to ${finalProgress}, update.verifiedProgress: ${update.verifiedProgress}`);
        } else if (action === 'reject') {
            update.status = 'rejected';
            if (rejectionReason) {
                update.rejectionReason = rejectionReason;
            }
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

        job.markModified('progressUpdates');
        await job.save();
        console.log('Job saved successfully after verification');
        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
// @access  Private (Job Seeker only)
const applyForJob = async (req, res) => {
    console.log(`[ApplyForJob] Request received for Job ID: ${req.params.id}`);
    console.log(`[ApplyForJob] User ID: ${req.user?._id}, Role: ${req.user?.role}`);

    try {
        const { proposal, answers } = req.body;
        const job = await Job.findById(req.params.id);

        if (!job) {
            console.log('[ApplyForJob] Job not found');
            return res.status(404).json({ message: 'Job not found' });
        }

        if (req.user.role !== 'job_seeker') {
            console.log(`[ApplyForJob] User is not a job seeker: ${req.user.role}`);
            return res.status(403).json({ message: 'Only job seekers can apply' });
        }

        if (!job.applications) {
            job.applications = [];
        }

        // Check if already applied
        const alreadyApplied = job.applications.find(
            app => app.applicant.toString() === req.user.id
        );

        if (alreadyApplied) {
            console.log('[ApplyForJob] User already applied');
            return res.status(400).json({ message: 'You have already applied for this job' });
        }

        // Check if job is open
        if (job.jobStatus !== 'open') {
            console.log(`[ApplyForJob] Job status is not open: ${job.jobStatus}`);
            return res.status(400).json({ message: 'This job is no longer accepting applications' });
        }

        const application = {
            applicant: req.user.id,
            proposal: proposal || '',
            answers: answers || [], // Save answers
            appliedAt: Date.now(),
            status: 'applied'
        };

        job.applications.push(application);
        await job.save();

        console.log('[ApplyForJob] Application submitted successfully');
        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Propose a revised budget to an applicant
// @route   POST /api/jobs/:id/negotiate
// @access  Private (Employer only)
const proposeNegotiation = async (req, res) => {
    try {
        const { applicantId, amount } = req.body;
        const job = await Job.findById(req.params.id);

        if (!job) return res.status(404).json({ message: 'Job not found' });
        if (job.employer.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

        const application = job.applications.find(app => app.applicant.toString() === applicantId);
        if (!application) return res.status(404).json({ message: 'Application not found' });

        application.offeredBudget = Number(amount);
        application.offeredBudgetStatus = 'pending';

        await job.save();
        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Freelancer responds to a revised budget offer
// @route   PUT /api/jobs/:id/negotiate/respond
// @access  Private (Applicant only)
const respondToNegotiation = async (req, res) => {
    try {
        const { action } = req.body; // 'accept' or 'reject'
        const job = await Job.findById(req.params.id);

        if (!job) return res.status(404).json({ message: 'Job not found' });

        const application = job.applications.find(app => app.applicant.toString() === req.user.id);
        if (!application) return res.status(404).json({ message: 'Application not found' });

        if (application.offeredBudgetStatus !== 'pending') {
            return res.status(400).json({ message: 'No pending negotiation offer' });
        }

        application.offeredBudgetStatus = action === 'accept' ? 'accepted' : 'rejected';

        await job.save();
        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    getJobs,
    createJob,
    getMyJobs,
    getJobById,
    scheduleInterview,
    hireApplicant,
    rejectApplicant,
    addJobUpdate,
    verifyJobUpdate,
    applyForJob,
    releasePayment,
    proposeNegotiation,
    respondToNegotiation
}

