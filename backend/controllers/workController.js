const Job = require('../models/Job');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendPushNotification } = require('../config/pushNotificationService');
const { sendEmailNotification } = require('../config/emailNotificationService');

const notifyUser = async (recipientId, title, content, link, sendEmail = false, emailSubject = '', emailBody = '', category = '') => {
    try {
        if (!recipientId) return;
        const user = await User.findById(recipientId).select('email fcmToken name settings');
        if (!user) return;

        const settings = user.settings?.notifications || {};
        const isPushEnabled = settings.push !== false;
        const isEmailEnabled = settings.email !== false;
        const isCategoryEnabled = category ? (settings[category] !== false) : true;

        if (user.fcmToken && isPushEnabled && isCategoryEnabled) {
            sendPushNotification(user.fcmToken, title, content, link).catch(console.error);
        }
        if (sendEmail && user.email && isEmailEnabled && isCategoryEnabled) {
            sendEmailNotification(user.email, emailSubject || title, emailBody || content).catch(console.error);
        }
    } catch (err) {
        console.error('Error in external notifications:', err);
    }
};

// @desc    Hire a tasker
// @route   POST /api/work/:jobId/hire/:userId
// @access  Private (Employer)
const hireTasker = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (job.employer.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const salaryNum = parseInt(job.salary.replace(/\D/g, '')) || 0;

        const existingHire = job.hires.find(h => h.freelancer.toString() === req.params.userId);
        if (!existingHire) {
            job.hires.push({
                freelancer: req.params.userId,
                status: 'in_progress',
                agreedBudget: salaryNum > 0 ? salaryNum : 100,
                escrowAmount: salaryNum > 0 ? salaryNum : 100,
                paidAmount: 0
            });
        }

        if (job.jobStatus === 'open') {
            job.jobStatus = 'in_progress';
        }

        await job.save();

        // Create notification for freelancer
        await Notification.create({
            recipient: req.params.userId,
            sender: req.user._id,
            type: 'application_update',
            content: `Congratulations! You have been hired for the job: ${job.title}.`,
            link: `/project/${job._id}`
        });
        await notifyUser(req.params.userId, 'You got the job!', `Congratulations! You have been hired for: ${job.title}`, `/project/${job._id}`, true, 'Job Offer: Hired!', `<p>Congratulations! You have been hired for the job: <strong>${job.title}</strong>.</p>`, 'applicationUpdates');

        res.json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add progress update
// @route   POST /api/work/:jobId/progress
// @access  Private (Tasker)
const addProgress = async (req, res) => {
    try {
        const { description, proposedProgress } = req.body;
        const job = await Job.findById(req.params.jobId);

        if (!job) return res.status(404).json({ message: 'Job not found' });

        const hire = job.hires.find(h => h.freelancer.toString() === req.user.id);
        if (!hire) {
            return res.status(401).json({ message: 'Not hired for this job' });
        }

        if (proposedProgress <= (hire.verifiedProgress || 0)) {
            return res.status(400).json({ message: `Progress must be greater than current verified progress (${hire.verifiedProgress || 0}%)` });
        }

        const newUpdate = { 
            description, 
            proposedProgress, 
            status: 'pending',
            date: Date.now()
        };

        // Handle File Upload
        if (req.file) {
            newUpdate.imageUrl = `/uploads/work_updates/${req.file.filename}`;
        }

        hire.progressUpdates.push(newUpdate);

        await job.save();

        // Create notification for employer
        await Notification.create({
            recipient: (job.employer._id || job.employer),
            sender: req.user._id,
            type: 'progress_submitted',
            content: `New progress update from ${req.user.name} for "${job.title}"`,
            link: `/project/${job._id}`
        });
        await notifyUser((job.employer._id || job.employer), 'Progress Update', `New progress update from ${req.user.name} for "${job.title}"`, `/project/${job._id}`, true, 'New Progress Update', `<p>${req.user.name} has submitted a new progress update for <strong>${job.title}</strong>.</p>`, 'workUpdates');

        res.json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve progress update
// @route   PUT /api/work/:jobId/progress/:updateId/approve
// @access  Private (Employer)
const approveProgress = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (job.employer.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
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

        if (!update) return res.status(404).json({ message: 'Progress update not found' });

        // Ensure sequential verification: Check if this is the oldest pending update for this hire
        const pendingUpdates = targetHire.progressUpdates.filter(u => u.status === 'pending');
        if (pendingUpdates.length > 0 && pendingUpdates[0]._id.toString() !== req.params.updateId) {
            return res.status(400).json({ message: 'Please verify earlier updates first. You must verify updates in the order they were submitted.' });
        }

        update.status = 'approved';
        if (update.proposedProgress >= (targetHire.verifiedProgress || 0)) {
            targetHire.verifiedProgress = update.proposedProgress;
            targetHire.progress = update.proposedProgress;
        }
        update.verifiedProgress = targetHire.verifiedProgress;

        if (targetHire.progress >= 100) {
            targetHire.status = 'completed';
        }

        await job.save();

        // Create notification for freelancer
        await Notification.create({
            recipient: (targetHire.freelancer._id || targetHire.freelancer),
            sender: req.user._id,
            type: 'progress_verified',
            content: `Your progress update for ${job.title} has been approved${update.verifiedProgress !== update.proposedProgress ? ' (revised to ' + update.verifiedProgress + '%)' : ''}.`,
            link: `/project/${job._id}`
        });
        await notifyUser((targetHire.freelancer._id || targetHire.freelancer), 'Progress Update Approved', `Your progress update for ${job.title} has been approved.`, `/project/${job._id}`, true, 'Progress Approved', `<p>Your progress update for <strong>${job.title}</strong> has been approved.</p>`, 'workUpdates');

        res.json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reject progress update
// @route   PUT /api/work/:jobId/progress/:updateId/reject
// @access  Private (Employer)
const rejectProgress = async (req, res) => {
    try {
        const { rejectionReason } = req.body;
        const job = await Job.findById(req.params.jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (job.employer.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        let update = null;
        for (const hire of job.hires) {
            update = hire.progressUpdates.id(req.params.updateId);
            if (update) break;
        }

        if (!update) return res.status(404).json({ message: 'Progress update not found' });

        // Ensure sequential verification: Check if this is the oldest pending update for this hire
        const targetHire = job.hires.find(h => h.progressUpdates.id(req.params.updateId));
        const pendingUpdates = targetHire.progressUpdates.filter(u => u.status === 'pending');
        if (pendingUpdates.length > 0 && pendingUpdates[0]._id.toString() !== req.params.updateId) {
            return res.status(400).json({ message: 'Please verify earlier updates first. You must verify updates in the order they were submitted.' });
        }

        update.status = 'rejected';
        update.rejectionReason = rejectionReason || 'No reason provided';
        await job.save();

        // Create Notification for freelancer
        await Notification.create({
            recipient: (update.freelancer?._id || update.freelancer || (job.hires.find(h => h.progressUpdates.id(req.params.updateId))?.freelancer)),
            sender: req.user._id,
            type: 'progress_verified',
            content: `Your progress update for ${job.title} has been rejected: ${rejectionReason || 'No reason provided'}`,
            link: `/project/${job._id}`
        });
        await notifyUser((update.freelancer?._id || update.freelancer || (job.hires.find(h => h.progressUpdates.id(req.params.updateId))?.freelancer)), 'Progress Update Rejected', `Your progress update for ${job.title} was rejected.`, `/project/${job._id}`, true, 'Progress Rejected', `<p>Your progress update for <strong>${job.title}</strong> has been rejected: ${rejectionReason || 'No reason provided'}</p>`, 'workUpdates');

        res.json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Complete Job
// @route   POST /api/work/:jobId/complete
// @access  Private (Tasker)
const completeJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        const hire = job.hires.find(h => h.freelancer.toString() === req.user.id);
        if (!hire) return res.status(401).json({ message: 'Not authorized' });

        hire.status = 'completed';
        hire.progress = 100;
        hire.verifiedProgress = 100;

        await job.save();

        // Create notification for employer
        await Notification.create({
            recipient: (job.employer._id || job.employer),
            sender: req.user._id,
            type: 'progress_submitted',
            content: `${req.user.name} has marked the job "${job.title}" as completed. Please review and release payment.`,
            link: `/pro/job/${job._id}/applications`
        });
        await notifyUser((job.employer._id || job.employer), 'Job Completed', `${req.user.name} marked "${job.title}" as completed.`, `/pro/job/${job._id}/applications`, true, 'Job Completed!', `<p><strong>${req.user.name}</strong> has marked the job <strong>${job.title}</strong> as completed. Please review and release payment.</p>`, 'workUpdates');

        res.json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Release Payment
// @route   POST /api/work/:jobId/pay
// @access  Private (Employer)
const releasePayment = async (req, res) => {
    try {
        const { freelancerId } = req.body;
        const job = await Job.findById(req.params.jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (job.employer.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (!freelancerId) {
            return res.status(400).json({ message: 'Freelancer ID is required' });
        }

        const hire = job.hires.find(h => h.freelancer.toString() === freelancerId);
        if (!hire) return res.status(404).json({ message: 'Contract not found' });

        if (hire.status === 'completed' && hire.escrowAmount === 0) {
            return res.status(400).json({ message: 'Already paid' });
        }

        // Transfer funds
        const tasker = await User.findById(hire.freelancer);
        if (tasker) {
            tasker.walletBalance += hire.escrowAmount;
            tasker.totalEarnings += hire.escrowAmount;
            tasker.completedProjects += 1;
            await tasker.save();
        }

        hire.paidAmount += hire.escrowAmount;
        hire.escrowAmount = 0; // Released
        if (hire.progress >= 100) {
            hire.status = 'completed';
        }

        await job.save();

        // Create notification for freelancer
        await Notification.create({
            recipient: (hire.freelancer._id || hire.freelancer || freelancerId),
            sender: req.user._id,
            type: 'system',
            content: `Payment of ₹${hire.paidAmount} has been released for ${job.title}.`,
            link: `/project/${job._id}`
        });
        await notifyUser((hire.freelancer._id || hire.freelancer || freelancerId), 'Payment Released', `Payment of ₹${hire.paidAmount} has been released for ${job.title}.`, `/project/${job._id}`, true, 'Payment Released', `<p>Payment of <strong>₹${hire.paidAmount}</strong> has been released for ${job.title}.</p>`, 'payments');

        res.json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Withdraw Funds
// @route   POST /api/work/withdraw
// @access  Private
const withdrawFunds = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const amount = user.walletBalance;

        if (amount <= 0) {
            return res.status(400).json({ message: 'Insufficient funds' });
        }

        user.walletBalance = 0;
        await user.save();

        res.json({ message: `Successfully withdrew ₹${amount}`, isActive: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    hireTasker,
    addProgress,
    approveProgress,
    rejectProgress,
    completeJob,
    releasePayment,
    withdrawFunds
};
