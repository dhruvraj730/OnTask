const Job = require('../models/Job');
const User = require('../models/User');

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
        const { imageUrl, description, proposedProgress } = req.body;
        const job = await Job.findById(req.params.jobId);

        if (!job) return res.status(404).json({ message: 'Job not found' });

        const hire = job.hires.find(h => h.freelancer.toString() === req.user.id);
        if (!hire) {
            return res.status(401).json({ message: 'Not hired for this job' });
        }

        if (proposedProgress <= (hire.verifiedProgress || 0)) {
            return res.status(400).json({ message: `Progress must be greater than current verified progress (${hire.verifiedProgress || 0}%)` });
        }

        hire.progressUpdates.push({ imageUrl, description, proposedProgress, status: 'pending' });

        await job.save();
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

        update.status = 'rejected';
        update.rejectionReason = rejectionReason || 'No reason provided';
        await job.save();

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
