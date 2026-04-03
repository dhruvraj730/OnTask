const Job = require('../models/Job');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendPushNotification } = require('../config/pushNotificationService');
const { sendEmailNotification } = require('../config/emailNotificationService');

const notifyUser = async (recipientId, title, content, link, sendEmail = false, emailSubject = '', emailBody = '') => {
    try {
        const user = await User.findById(recipientId).select('email fcmToken name');
        if (!user) return;
        if (user.fcmToken) {
            sendPushNotification(user.fcmToken, title, content, link).catch(console.error);
        }
        if (sendEmail && user.email) {
            sendEmailNotification(user.email, emailSubject || title, emailBody || content).catch(console.error);
        }
    } catch (err) {
        console.error('Error in external notifications:', err);
    }
};

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
            screeningQuestions, endDate, startTime, endTime, venue, uniformRequirements, positionsRequired
        } = req.body;

        if (!title) return res.status(400).json({ message: 'Please add a job title' });
        if (!description) return res.status(400).json({ message: 'Please add a description' });
        if (!company) return res.status(400).json({ message: 'Please add a company name' });
        if (!location) return res.status(400).json({ message: 'Please add a location' });
        if (!salary) return res.status(400).json({ message: 'Please add a salary/rate' });
        if (!startDate) return res.status(400).json({ message: 'Please add a starting date' });
        if (!duration || !duration.value || !duration.unit) return res.status(400).json({ message: 'Please add a work duration' });
        
        // Check for duplicate job
        const existingJob = await Job.findOne({
            employer: req.user.id,
            title,
            company,
            description,
            startDate,
            jobStatus: { $in: ['open', 'in_progress'] }
        });

        if (existingJob) {
            return res.status(400).json({ message: 'You have already posted this job. You cannot post the same job multiple times.' });
        }

        const job = await Job.create({
            employer: req.user.id,
            title,
            company,
            location,
            description,
            salary,
            budget,
            startDate,
            duration,
            screeningQuestions: screeningQuestions || [],
            positionsRequired: positionsRequired || 1,
            endDate,
            startTime,
            endTime,
            venue,
            uniformRequirements
        });

        console.log('[DEBUG] Job created in DB:', JSON.stringify(job, null, 2));

        // Create notification for all job seekers
        try {
            const jobSeekers = await User.find({ role: 'job_seeker' }, '_id fcmToken');
            const notifications = jobSeekers.map(js => ({
                recipient: js._id,
                sender: req.user._id,
                type: 'new_job',
                content: `New job posted: ${title}. Check it out!`,
                link: `/project/${job._id}`
            }));
            await Notification.insertMany(notifications);

            // Push notification to all
            jobSeekers.forEach(js => {
                if (js.fcmToken) {
                    sendPushNotification(js.fcmToken, 'New Job Alert', `New job posted: ${title}`, `/project/${job._id}`).catch(() => {});
                }
            });
        } catch (notifErr) {
            console.error("Failed to send job alerts:", notifErr);
        }

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
        const { type, freelancerId } = req.body; // 'partial' or 'full'
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        const employerId = (job.employer._id || job.employer).toString();
        const userId = (req.user._id || req.user.id).toString();

        if (employerId !== userId) {
            console.log(`[AUTH ERROR] User ${userId} (${req.user.email}) attempted to pay for job owned by ${employerId}`);
            return res.status(403).json({ 
                message: 'Only the employer of this job can release payments',
                debug: process.env.NODE_ENV === 'development' ? { employerId, userId } : undefined
            });
        }

        if (!freelancerId) {
            return res.status(400).json({ message: 'Freelancer ID is required to release payment' });
        }

        const hire = job.hires.find(h => h.freelancer.toString() === freelancerId);
        if (!hire) {
            return res.status(400).json({ message: 'Freelancer is not hired for this job' });
        }

        let budget = hire.agreedBudget || 0;
        
        // Ensure budget is set if 0 (can happen for early test data)
        if (budget <= 0) {
            const positionsRequired = Number(job.positionsRequired) || 1;
            const perWorkerBudget = (job.budget || 0) / positionsRequired;
            if (perWorkerBudget > 0) {
                hire.agreedBudget = perWorkerBudget;
                budget = perWorkerBudget;
            }
        }

        const alreadyPaid = hire.paidAmount || 0;
        const progress = hire.progress || 0;

        let amountToPay = 0;

        if (type === 'full') {
            amountToPay = hire.escrowAmount;
            hire.escrowAmount = 0;
        } else if (type === 'partial') {
            // Partial payment based on progress
            const totalOwedForProgress = Math.round((progress / 100) * budget);
            amountToPay = totalOwedForProgress - alreadyPaid;

            if (amountToPay <= 0) {
                return res.status(400).json({ message: 'No new progress-based payment available yet. Verify more work first.' });
            }

            if (amountToPay > hire.escrowAmount) {
                amountToPay = hire.escrowAmount;
            }
            hire.escrowAmount -= amountToPay;
        } else {
            return res.status(400).json({ message: 'Invalid payment type. Use partial or full.' });
        }

        if (amountToPay <= 0) {
            return res.status(400).json({ message: 'No funds available to release' });
        }

        // Update payment fields
        hire.paidAmount += amountToPay;
        hire.paymentHistory.push({
            amount: amountToPay,
            type,
            date: new Date()
        });

        // CRITICAL: Update Freelancer Wallet
        const freelancer = await User.findById(freelancerId);
        if (freelancer) {
            freelancer.walletBalance += amountToPay;
            freelancer.totalEarnings += amountToPay;
            
            // Add transaction record
            freelancer.transactions.push({
                type: 'payment',
                amount: amountToPay,
                description: `Payment for job: ${job.title} (${type})`,
                status: 'completed',
                date: new Date()
            });

            if (type === 'full') {
                freelancer.completedProjects += 1;
            }

            await freelancer.save();
        }

        // Check if all payments are done and job is finished
        const allCompanied = job.hires.every(h => h.status === 'completed' && h.escrowAmount === 0);
        if (allCompanied) {
            job.jobStatus = 'completed';
        }

        job.markModified('hires');
        await job.save();

        // Populate details for the frontend
        const populatedJob = await Job.findById(job._id)
            .populate('employer', 'name email company')
            .populate('hires.freelancer', 'name email skills hourlyRate avatar')
            .populate('applications.applicant', 'name email skills hourlyRate bio assessmentScore rating completedProjects totalEarnings experience');

        // Create notification for freelancer
        await Notification.create({
            recipient: freelancerId,
            sender: req.user._id,
            type: 'system',
            content: `Payment of ₹${amountToPay} has been released for ${job.title} (${type} payment).`,
            link: `/project/${job._id}`
        });
        await notifyUser(freelancerId, 'Payment Released', `Payment of ₹${amountToPay} has been released for ${job.title}.`, `/project/${job._id}`, true, 'Payment Released', `<p>Payment of <strong>₹${amountToPay}</strong> has been released for ${job.title} (${type} payment).</p>`);

        res.status(200).json({
            message: `Payment of ₹${amountToPay} released successfully to ${freelancer?.name}`,
            job: populatedJob
        });
    } catch (error) {
        console.error("Error in releasePayment:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my jobs
// @route   GET /api/jobs/my-jobs
// @access  Private (Employer only)
const getMyJobs = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'employer') {
            query = { employer: req.user.id };
        } else if (req.user.role === 'job_seeker') {
            query = { 'hires.freelancer': req.user.id };
        } else {
            return res.status(403).json({ message: 'Invalid role' });
        }

        const jobs = await Job.find(query)
            .populate('employer', 'name email company avatar')
            .populate('hires.freelancer', 'name email skills hourlyRate avatar')
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
            .populate('hires.freelancer', 'name email skills hourlyRate avatar')
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

        const employerId = (job.employer._id || job.employer).toString();
        if (employerId !== req.user.id && employerId !== (req.user._id || '').toString()) {
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

        // Create Notification
        await Notification.create({
            recipient: (application.applicant._id || application.applicant),
            sender: req.user._id,
            type: 'interview',
            content: `You have been invited to an interview for the job: ${job.title}.`,
            link: interviewLink
        });
        await notifyUser((application.applicant._id || application.applicant), 'Interview Scheduled', `You have been invited to an interview for: ${job.title}`, interviewLink, true, 'Interview Invitation', `<p>You have been invited to an interview for the job: <strong>${job.title}</strong>.</p><p>Please join via this link: <a href="${interviewLink}">${interviewLink}</a></p>`);

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

        const employerId = (job.employer._id || job.employer).toString();
        if (employerId !== req.user.id && employerId !== (req.user._id || '').toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const application = job.applications.find(app => app.applicant.toString() === applicantId);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        const positionsRequired = Number(job.positionsRequired) || 1;

        // Check if all positions have been filled already
        if (job.hires.length >= positionsRequired) {
            return res.status(400).json({ message: 'All available positions for this job have been filled' });
        }

        // Check if the applicant is already hired to prevent duplicate hires
        const existingHire = job.hires.find(h => h.freelancer.toString() === applicantId);
        if (existingHire) {
            return res.status(400).json({ message: 'This freelancer has already been hired for this job' });
        }

        let totalBudget = Number(job.budget) || 0;
        
        if (totalBudget <= 0 && job.salary && job.salary.toLowerCase() !== 'negotiable') {
            const match = job.salary.match(/\d+/);
            if (match) {
                totalBudget = Number(match[0]);
            }
        }

        let finalBudget = totalBudget / positionsRequired;

        // Use negotiated budget if it was accepted
        if (application.offeredBudgetStatus === 'accepted' && application.offeredBudget) {
            console.log(`[Hire] Using negotiated budget: ₹${application.offeredBudget}`);
            finalBudget = application.offeredBudget;
        }

        application.status = 'hired';

        // Add to hires array
        job.hires.push({
            freelancer: applicantId,
            status: 'in_progress',
            agreedBudget: finalBudget,
            paidAmount: 0,
            escrowAmount: 0,
        });

        // Automatically set status to in_progress if fully staffed
        if (job.hires.length >= positionsRequired) {
            if (job.jobStatus === 'open') {
                job.jobStatus = 'in_progress';
            }

            // Auto reject all other pending/applied/interviewing applications
            job.applications.forEach(app => {
                if (app.status !== 'hired' && app.status !== 'rejected') {
                    app.status = 'rejected';
                }
            });
            job.markModified('applications');
        }

        await job.save();

        // Create Notification
        await Notification.create({
            recipient: (application.applicant._id || application.applicant),
            sender: req.user._id,
            type: 'application_update',
            content: `Congratulations! You have been hired for the job: ${job.title}.`,
            link: `/project/${job._id}`
        });
        await notifyUser((application.applicant._id || application.applicant), 'You got the job!', `Congratulations! You have been hired for: ${job.title}`, `/project/${job._id}`, true, 'Job Offer: Hired!', `<p>Congratulations! You have been hired for the job: <strong>${job.title}</strong>.</p>`);

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
        const employerId = (job.employer._id || job.employer).toString();
        if (employerId !== req.user.id && employerId !== (req.user._id || '').toString()) {
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

        // Create Notification
        await Notification.create({
            recipient: (application.applicant._id || application.applicant),
            sender: req.user._id,
            type: 'application_update',
            content: `Your application for the job ${job.title} has been rejected.`,
            link: `/applications`
        });
        await notifyUser((application.applicant._id || application.applicant), 'Application Update', `Your application for ${job.title} was rejected.`, `/applications`, true, 'Application Status Update', `<p>We regret to inform you that your application for the job <strong>${job.title}</strong> has been rejected.</p>`);

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

        const hire = job.hires.find(h => h.freelancer.toString() === req.user.id || h.freelancer.toString() === (req.user._id || '').toString());
        if (!hire) {
            return res.status(403).json({ message: 'You are not hired for this job' });
        }

        const newUpdate = {
            description,
            imageUrl: imageUrl || '',
            date: new Date(),
            status: 'pending'
        };

        if (progress !== undefined) {
            const proposedProgress = Number(progress);
            if (proposedProgress < (hire.progress || 0)) {
                return res.status(400).json({ message: `Proposed progress (${proposedProgress}%) cannot be less than the current verified progress (${hire.progress || 0}%)` });
            }
            newUpdate.proposedProgress = proposedProgress;
        }

        hire.progressUpdates.push(newUpdate);

        await job.save();

        // Create Notification for employer
        await Notification.create({
            recipient: (job.employer._id || job.employer),
            sender: req.user._id,
            type: 'progress_submitted',
            content: `New progress update from ${req.user.name} for "${job.title}"`,
            link: `/project/${job._id}`
        });
        await notifyUser((job.employer._id || job.employer), 'Progress Update', `New progress update from ${req.user.name} for "${job.title}"`, `/project/${job._id}`, true, 'New Progress Update', `<p>${req.user.name} has submitted a new progress update for <strong>${job.title}</strong>.</p>`);

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
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        const employerId = (job.employer._id || job.employer).toString();
        if (employerId !== req.user.id && employerId !== (req.user._id || '').toString()) {
            return res.status(403).json({ message: 'Only the employer can verify updates' });
        }

        let targetHire = null;
        let update = null;

        for (const hire of job.hires) {
            update = hire.progressUpdates.id(req.params.updateId);
            if (update) {
                targetHire = hire;
                break;
            }
        }

        if (!update || !targetHire) {
            return res.status(404).json({ message: 'Update not found' });
        }

        if (action === 'approve') {
            // Priority: overrideProgress > update.proposedProgress > hire.progress
            let finalProgress = targetHire.progress || 0;
            if (overrideProgress !== undefined) {
                finalProgress = Number(overrideProgress);
            } else if (update.proposedProgress !== undefined) {
                finalProgress = update.proposedProgress;
            }

            if (finalProgress < (targetHire.progress || 0)) {
                return res.status(400).json({ message: `Verified progress (${finalProgress}%) cannot be less than the current verified progress (${targetHire.progress || 0}%)` });
            }

            update.status = 'approved';
            update.verifiedProgress = finalProgress;

            targetHire.progress = finalProgress;
            targetHire.verifiedProgress = finalProgress;

            if (targetHire.progress >= 100) {
                targetHire.status = 'completed';
            }
        } else if (action === 'reject') {
            update.status = 'rejected';
            if (rejectionReason) {
                update.rejectionReason = rejectionReason;
            }
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

        job.markModified('hires');

        // Auto-complete the entire job if all positions are filled and all hires are 100%
        const positionsRequired = Number(job.positionsRequired) || 1;
        if (job.hires.length >= positionsRequired) {
            const allFinished = job.hires.every(h => h.progress >= 100);
            if (allFinished) {
                job.jobStatus = 'completed';
            }
        }

        await job.save();

        // Populate details for the frontend
        const populatedJob = await Job.findById(job._id)
            .populate('employer', 'name email company')
            .populate('hires.freelancer', 'name email skills hourlyRate avatar')
            .populate('applications.applicant', 'name email skills hourlyRate bio assessmentScore rating completedProjects totalEarnings experience');


        // Create Notification for the freelancer
        const statusText = action === 'approve' ? 'approved' : 'rejected';
        let customContent = `Your progress update for ${job.title} has been ${statusText}`;
        
        if (action === 'approve' && update.verifiedProgress !== update.proposedProgress) {
            customContent += ` (revised to ${update.verifiedProgress}%)`;
        } else if (action === 'reject' && rejectionReason) {
            customContent += `: ${rejectionReason}`;
        }

        await Notification.create({
            recipient: (targetHire.freelancer._id || targetHire.freelancer),
            sender: req.user._id,
            type: 'progress_verified',
            content: customContent,
            link: `/project/${job._id}`
        });
        await notifyUser((targetHire.freelancer._id || targetHire.freelancer), 'Progress Update Verified', customContent, `/project/${job._id}`, true, 'Progress Verified', `<p>${customContent}</p>`);

        res.status(200).json(populatedJob);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
// @access  Private (Job Seeker only)
const applyForJob = async (req, res) => {
    try {
        const { proposal, answers } = req.body;
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (req.user.role !== 'job_seeker') {
            return res.status(403).json({ message: 'Only job seekers can apply' });
        }

        if (!job.applications) {
            job.applications = [];
        }

        // Check if already applied
        const alreadyApplied = job.applications.find(
            app => {
                const appId = (app.applicant._id || app.applicant).toString();
                return appId === req.user.id || appId === (req.user._id || '').toString();
            }
        );

        if (alreadyApplied) {
            return res.status(400).json({ message: 'You have already applied for this job' });
        }

        if (job.jobStatus === 'closed' || job.jobStatus === 'completed') {
            return res.status(400).json({ message: 'This job is no longer accepting applications' });
        }

        const positionsRequired = Number(job.positionsRequired) || 1;
        if (job.hires && job.hires.length >= positionsRequired) {
            return res.status(400).json({ message: 'All available positions for this job have already been filled' });
        }

        const application = {
            applicant: req.user.id,
            proposal: proposal || '',
            answers: answers || [],
            appliedAt: Date.now(),
            status: 'applied'
        };

        job.applications.push(application);
        await job.save();

        // Create Notification for employer
        await Notification.create({
            recipient: (job.employer._id || job.employer),
            sender: req.user._id,
            type: 'application_received',
            content: `${req.user.name} has applied for your job: ${job.title}`,
            link: `/pro/job/${job._id}/applications`
        });
        await notifyUser((job.employer._id || job.employer), 'New Application', `${req.user.name} applied for your job: ${job.title}`, `/pro/job/${job._id}/applications`, true, 'New Job Application', `<p><strong>${req.user.name}</strong> has applied for your job: <strong>${job.title}</strong>.</p>`);

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
        const employerId = (job.employer._id || job.employer).toString();
        if (employerId !== req.user.id && employerId !== (req.user._id || '').toString()) return res.status(403).json({ message: 'Not authorized' });

        const application = job.applications.find(app => app.applicant.toString() === applicantId);
        if (!application) return res.status(404).json({ message: 'Application not found' });

        application.offeredBudget = Number(amount);
        application.offeredBudgetStatus = 'pending';

        await job.save();

        // Create Notification
        await Notification.create({
            recipient: (application.applicant._id || application.applicant),
            sender: req.user._id,
            type: 'negotiation',
            content: `The organizer has proposed a revised budget of ₹${amount} for ${job.title}.`,
            link: `/applications`
        });

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

        const application = job.applications.find(app => {
            const appId = (app.applicant._id || app.applicant).toString();
            return appId === req.user.id || appId === (req.user._id || '').toString();
        });
        if (!application) return res.status(404).json({ message: 'Application not found' });

        if (application.offeredBudgetStatus !== 'pending') {
            return res.status(400).json({ message: 'No pending negotiation offer' });
        }

        application.offeredBudgetStatus = action === 'accept' ? 'accepted' : 'rejected';

        await job.save();

        // Create Notification for employer
        await Notification.create({
            recipient: (job.employer._id || job.employer),
            sender: req.user._id,
            type: 'negotiation',
            content: `A freelancer has ${action}ed the negotiated budget for ${job.title}.`,
            link: `/pro/job/${job._id}/applications`
        });

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
