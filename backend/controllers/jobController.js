const Job = require('../models/Job');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendPushNotification } = require('../config/pushNotificationService');
const { sendEmailNotification } = require('../config/emailNotificationService');

const notifyUser = async (recipientId, title, content, link, sendEmail = false, emailSubject = '', emailBody = '', category = '') => {
    try {
        if (!recipientId) return;
        const user = await User.findById(recipientId).select('email fcmToken name settings');
        if (!user) {
            console.log(`[NOTIFY] User not found: ${recipientId}`);
            return;
        }

        const settings = user.settings?.notifications || {};
        const isPushEnabled = settings.push !== false; // Default to true if not set
        const isEmailEnabled = settings.email !== false;
        const isCategoryEnabled = category ? (settings[category] !== false) : true;

        if (user.fcmToken && isPushEnabled && isCategoryEnabled) {
            console.log(`[NOTIFY] Sending push to ${user.name} (Category: ${category || 'general'})`);
            sendPushNotification(user.fcmToken, title, content, link).catch(err => console.error('[NOTIFY] Push Failed:', err.message));
        }
        
        if (sendEmail && user.email && isEmailEnabled && isCategoryEnabled) {
            console.log(`[NOTIFY] Sending email to ${user.email} (Category: ${category || 'general'})`);
            sendEmailNotification(user.email, emailSubject || title, emailBody || content).catch(err => console.error('[NOTIFY] Email Failed:', err.message));
        }
    } catch (err) {
        console.error('Error in external notifications helper:', err.message);
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
            title, company, location, description, salary, budget, 
            minBudget, maxBudget, pricingType, specificRole,
            startDate, duration,
            screeningQuestions, endDate, startTime, endTime, venue, uniformRequirements, positionsRequired
        } = req.body;

        if (!title) return res.status(400).json({ message: 'Please add a job title' });
        if (!description) return res.status(400).json({ message: 'Please add a description' });
        if (!company) return res.status(400).json({ message: 'Please add a company name' });
        if (!location) return res.status(400).json({ message: 'Please add a location' });
        if (!salary) return res.status(400).json({ message: 'Please add a salary/rate' });
        if (!startDate) return res.status(400).json({ message: 'Please add a starting date' });

        // Validate startDate is not in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const jobStartDate = new Date(startDate);
        if (jobStartDate < today) {
            return res.status(400).json({ message: 'Start date cannot be in the past' });
        }

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
            minBudget,
            maxBudget,
            pricingType: pricingType || 'fixed',
            specificRole,
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
            const jobSeekers = await User.find({ role: 'job_seeker' }, '_id fcmToken settings');
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
                if (js.fcmToken && js.settings?.notifications?.push !== false && js.settings?.notifications?.jobAlerts !== false) {
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

            if (type === 'full' && hire.status !== 'completed') {
                freelancer.completedProjects += 1;
                hire.status = 'completed';
                hire.progress = 100;
                hire.verifiedProgress = 100;
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
        await notifyUser(freelancerId, 'Payment Released', `Payment of ₹${amountToPay} has been released for ${job.title}.`, `/project/${job._id}`, true, 'Payment Released', `<p>Payment of <strong>₹${amountToPay}</strong> has been released for ${job.title} (${type} payment).</p>`, 'payments');

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
        await notifyUser((application.applicant._id || application.applicant), 'Interview Scheduled', `You have been invited to an interview for: ${job.title}`, interviewLink, true, 'Interview Invitation', `<p>You have been invited to an interview for the job: <strong>${job.title}</strong>.</p><p>Please join via this link: <a href="${interviewLink}">${interviewLink}</a></p>`, 'applicationUpdates');

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
        const { applicantId, finalBudget: overrideBudget } = req.body;
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
        const currentHiresCount = job.hires?.length || 0;

        console.log(`[DEBUG] Hiring for Job: ${job.title} (${job._id})`);
        console.log(`[DEBUG] Positions Required: ${positionsRequired}, Current Hires: ${currentHiresCount}`);

        // Check if all positions have been filled already
        if (currentHiresCount >= positionsRequired) {
            return res.status(400).json({ message: `All ${positionsRequired} positions for this job have already been filled.` });
        }

        // Check if the applicant is already hired to prevent duplicate hires
        const existingHire = job.hires.find(h => h.freelancer.toString() === applicantId);
        if (existingHire) {
            return res.status(400).json({ message: 'This freelancer has already been hired for this job' });
        }

        // --- Calculate Contract Value ---
        let finalBudget = 0;

        if (overrideBudget && Number(overrideBudget) > 0) {
            console.log(`[Hire] Using explicit finalBudget from provider: ₹${overrideBudget}`);
            finalBudget = Number(overrideBudget);
        } else if ((application.offeredBudgetStatus === 'accepted' || application.offeredBudgetStatus === 'pending') && application.offeredBudget) {
            // Auto-accept a pending offer: hiring while an offer is out means the provider commits to that price.
            // This prevents the seeker from ever seeing the higher max budget once hired.
            if (application.offeredBudgetStatus === 'pending') {
                console.log(`[Hire] Auto-accepting pending offer: ₹${application.offeredBudget}`);
                application.offeredBudgetStatus = 'accepted';
            } else {
                console.log(`[Hire] Using negotiated (accepted) budget: ₹${application.offeredBudget}`);
            }
            finalBudget = application.offeredBudget;
        } else if (job.pricingType === 'range' || (job.maxBudget > 0 && job.minBudget > 0)) {
            // Default to maxBudget for range-based specialized jobs if no offer or offer was rejected
            console.log(`[Hire] No valid offer (status: ${application.offeredBudgetStatus}), defaulting to maxBudget: ₹${job.maxBudget}`);
            finalBudget = Number(job.maxBudget) || 0;
        } else {
            // Standard mass recruitment logic (fixed budget / roles)
            let totalBudget = Number(job.budget) || 0;
            if (totalBudget <= 0 && job.salary && job.salary.toLowerCase() !== 'negotiable') {
                const match = job.salary.match(/\d+/);
                if (match) {
                    totalBudget = Number(match[0]);
                }
            }
            finalBudget = totalBudget / positionsRequired;
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
        // Note: length was updated after the push above
        const updatedHiresCount = job.hires.length;
        if (updatedHiresCount >= positionsRequired) {
            console.log(`[DEBUG] Job fully staffed (${updatedHiresCount}/${positionsRequired}). Closing to new applicants.`);
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
        } else {
            console.log(`[DEBUG] Job partially staffed (${updatedHiresCount}/${positionsRequired}). Keeping status OPEN.`);
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
        await notifyUser((application.applicant._id || application.applicant), 'You got the job!', `Congratulations! You have been hired for: ${job.title}`, `/project/${job._id}`, true, 'Job Offer: Hired!', `<p>Congratulations! You have been hired for the job: <strong>${job.title}</strong>.</p>`, 'applicationUpdates');

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
        await notifyUser((application.applicant._id || application.applicant), 'Application Update', `Your application for ${job.title} was rejected.`, `/applications`, true, 'Application Status Update', `<p>We regret to inform you that your application for the job <strong>${job.title}</strong> has been rejected.</p>`, 'applicationUpdates');

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
        const { description, progress } = req.body;
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
            imageUrl: req.file ? `/uploads/work_updates/${req.file.filename}` : '',
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
        await notifyUser((job.employer._id || job.employer), 'Progress Update', `New progress update from ${req.user.name} for "${job.title}"`, `/project/${job._id}`, true, 'New Progress Update', `<p>${req.user.name} has submitted a new progress update for <strong>${job.title}</strong>.</p>`, 'workUpdates');

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

        // Ensure sequential verification: Check if this is the oldest pending update for this hire
        const pendingUpdates = targetHire.progressUpdates.filter(u => u.status === 'pending');
        if (pendingUpdates.length > 0 && pendingUpdates[0]._id.toString() !== req.params.updateId) {
            return res.status(400).json({ message: 'Please verify earlier updates first. You must verify updates in the order they were submitted.' });
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

            if (targetHire.progress >= 100 && targetHire.status !== 'completed') {
                targetHire.status = 'completed';
                
                const freelancerIdObj = targetHire.freelancer._id || targetHire.freelancer;
                const taskerToUpdate = await User.findById(freelancerIdObj);
                if (taskerToUpdate) {
                    taskerToUpdate.completedProjects = (taskerToUpdate.completedProjects || 0) + 1;
                    await taskerToUpdate.save();
                }
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
        await notifyUser((targetHire.freelancer._id || targetHire.freelancer), 'Progress Update Verified', customContent, `/project/${job._id}`, true, 'Progress Verified', `<p>${customContent}</p>`, 'workUpdates');

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
        await notifyUser((job.employer._id || job.employer), 'New Application', `${req.user.name} applied for your job: ${job.title}`, `/pro/job/${job._id}/applications`, true, 'New Job Application', `<p><strong>${req.user.name}</strong> has applied for your job: <strong>${job.title}</strong>.</p>`, 'applicationUpdates');

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

        // ESCROW LOCK: Block negotiation if the provider has already deposited money
        const existingHire = job.hires.find(h => h.freelancer.toString() === applicantId);
        if (existingHire && existingHire.escrowAmount > 0) {
            return res.status(400).json({
                message: 'Cannot renegotiate — payment has already been deposited into escrow. The agreed budget is now locked.'
            });
        }

        // SPAM GUARD: Block a new offer if one is already waiting for the seeker's response
        if (application.offeredBudgetStatus === 'pending') {
            return res.status(400).json({
                message: 'A budget offer is already pending. Please wait for the seeker to accept or reject before sending a new offer.'
            });
        }

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
        await notifyUser((application.applicant._id || application.applicant), 'Budget Offer', `The organizer has proposed a revised budget of ₹${amount} for ${job.title}.`, `/applications`, true, 'New Budget Offer', `<p>The organizer has proposed a revised budget of <strong>₹${amount}</strong> for <strong>${job.title}</strong>. Please log in to accept or reject this offer.</p>`, 'applicationUpdates');

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

        // SYNC EXISTING HIRE: Update agreedBudget based on seeker's response
        const existingHire = job.hires.find(h => {
            const hId = (h.freelancer._id || h.freelancer).toString();
            return hId === req.user.id || hId === (req.user._id || '').toString();
        });

        if (existingHire) {
            // Escrow funded = budget is immutable, cannot change either way
            if (existingHire.escrowAmount > 0) {
                return res.status(400).json({
                    message: 'The contract budget cannot be changed — payment has already been deposited into escrow.'
                });
            }

            if (action === 'accept') {
                // Lock the contract at the agreed negotiated price
                console.log(`[Negotiate] ACCEPT — Syncing hire agreedBudget ₹${existingHire.agreedBudget} → ₹${application.offeredBudget}`);
                existingHire.agreedBudget = application.offeredBudget;
            } else {
                // Seeker rejected — revert the auto-accepted price back to the job's max budget
                const fallbackBudget = job.maxBudget > 0
                    ? job.maxBudget
                    : job.budget > 0
                        ? job.budget
                        : (parseInt((job.salary || '').replace(/\D/g, '')) || 0);
                console.log(`[Negotiate] REJECT — Reverting hire agreedBudget ₹${existingHire.agreedBudget} → ₹${fallbackBudget} (max budget)`);
                existingHire.agreedBudget = fallbackBudget;
            }
            job.markModified('hires');
        }

        let isDirectHireAccepted = false;
        if (application.status === 'offered') {
            if (action === 'accept') {
                application.status = 'hired';
                isDirectHireAccepted = true;

                job.hires.push({
                    freelancer: req.user.id,
                    status: 'in_progress',
                    agreedBudget: application.offeredBudget || 0,
                    paidAmount: 0,
                    escrowAmount: 0,
                });

                const positionsRequired = Number(job.positionsRequired) || 1;
                if (job.hires.length >= positionsRequired) {
                    if (job.jobStatus === 'open') job.jobStatus = 'in_progress';
                    job.applications.forEach(app => {
                        if (app.status !== 'hired' && app.status !== 'rejected') {
                            app.status = 'rejected';
                        }
                    });
                    job.markModified('applications');
                }
            } else {
                application.status = 'rejected';
            }
        }

        await job.save();

        const actionText = action === 'accept' ? 'accepted' : 'rejected';
        if (isDirectHireAccepted) {
            await Notification.create({
                recipient: (job.employer._id || job.employer),
                sender: req.user._id,
                type: 'application_update',
                content: `A freelancer has accepted your direct hire offer for ${job.title}! The contract is now active.`,
                link: `/pro/job/${job._id}/applications`
            });
            await notifyUser((job.employer._id || job.employer), 'Direct Hire Accepted', `A freelancer accepted your offer for ${job.title}.`, `/pro/job/${job._id}/applications`, true, 'Direct Hire Accepted!', `<p>A freelancer has accepted your direct hire offer for <strong>${job.title}</strong>. The contract is now active.</p>`, 'applicationUpdates');
        } else {
            await Notification.create({
                recipient: (job.employer._id || job.employer),
                sender: req.user._id,
                type: 'negotiation',
                content: `A freelancer has ${actionText} the negotiated budget of ₹${application.offeredBudget} for ${job.title}.`,
                link: `/pro/job/${job._id}/applications`
            });
            await notifyUser((job.employer._id || job.employer), `Budget Offer ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`, `A freelancer ${actionText} the ₹${application.offeredBudget} offer for ${job.title}.`, `/pro/job/${job._id}/applications`, true, `Budget Offer ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`, `<p>A freelancer has <strong>${actionText}</strong> the negotiated budget of <strong>₹${application.offeredBudget}</strong> for <strong>${job.title}</strong>.</p>`, 'applicationUpdates');
        }

        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Initiate a Direct Hire (offer/invite) to a freelancer
// @route   POST /api/jobs/direct-hire
// @access  Private (Employer only)
const createDirectHire = async (req, res) => {
    try {
        const { mode, freelancerId, jobId, offerBudget, ...newJobFields } = req.body;

        if (req.user.role !== 'employer') {
            return res.status(403).json({ message: 'Only employers can initiate a direct hire.' });
        }

        if (!freelancerId) {
            return res.status(400).json({ message: 'Freelancer ID is required.' });
        }

        const freelancer = await User.findById(freelancerId);
        if (!freelancer || freelancer.role !== 'job_seeker') {
            return res.status(404).json({ message: 'Valid Job Seeker not found.' });
        }

        let targetJob;

        if (mode === 'existing') {
            if (!jobId) return res.status(400).json({ message: 'Job ID is required for existing job mode.' });
            targetJob = await Job.findById(jobId);
            
            if (!targetJob) return res.status(404).json({ message: 'Job not found.' });
            
            if (targetJob.employer.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized for this job.' });
            }

            const alreadyApplied = targetJob.applications.find(app => (app.applicant._id || app.applicant).toString() === freelancerId);
            if (alreadyApplied) {
                return res.status(400).json({ message: 'Freelancer is already an applicant for this job.' });
            }
        } else if (mode === 'new') {
            const { title, description, startDate } = newJobFields;
            if (!title || !description || !startDate) {
                return res.status(400).json({ message: 'Title, description, and start date are required for a new contract.' });
            }

            // Validate startDate is not in the past
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const jobStartDate = new Date(startDate);
            if (jobStartDate < today) {
                return res.status(400).json({ message: 'Start date cannot be in the past' });
            }

            targetJob = await Job.create({
                employer: req.user.id,
                title,
                description,
                startDate,
                company: newJobFields.company || req.user.companyName || 'Direct Contract',
                location: newJobFields.location || 'Remote/TBD',
                salary: newJobFields.salary || (offerBudget ? `₹${offerBudget}` : 'Negotiable'),
                budget: offerBudget || newJobFields.budget || 0,
                pricingType: 'fixed',
                positionsRequired: 1,
                duration: newJobFields.duration || { value: 1, unit: 'days' },
                jobStatus: 'open'
            });
        } else {
            return res.status(400).json({ message: 'Invalid mode. Must be "existing" or "new".' });
        }

        targetJob.applications.push({
            applicant: freelancerId,
            status: 'offered',
            offeredBudget: Number(offerBudget) || 0,
            offeredBudgetStatus: 'pending',
            appliedAt: Date.now()
        });

        await targetJob.save();

        await Notification.create({
            recipient: freelancerId,
            sender: req.user._id,
            type: 'system',
            content: `You received a direct hire offer for "${targetJob.title}" from ${req.user.name}.`,
            link: `/applications`
        });
        await notifyUser(freelancerId, 'Direct Hire Offer', `You received a direct hire offer for "${targetJob.title}"`, `/applications`, true, 'Direct Offer!', `<p>You received a direct hire offer from <strong>${req.user.name}</strong> for the job <strong>${targetJob.title}</strong>.</p>`);

        res.status(200).json(targetJob);
    } catch (error) {
        console.error("Direct Hire Critical Error:", error);
        res.status(500).json({ 
            message: error.message || 'An unexpected error occurred during direct hire creation',
            details: error.stack 
        });
    }
};

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
    respondToNegotiation,
    createDirectHire
}
