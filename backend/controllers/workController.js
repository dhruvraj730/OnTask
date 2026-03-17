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

        job.hiredTasker = req.params.userId;
        job.jobStatus = 'hired';

        // Mock Escrow: Set amount based on salary string (simplified parsing)
        // In real app, this comes from payment gateway
        const salaryNum = parseInt(job.salary.replace(/\D/g, '')) || 0;
        job.escrowAmount = salaryNum > 0 ? salaryNum : 100; // Default or parsed

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
        if (job.hiredTasker.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Enforce strictly forward progress
        if (proposedProgress <= job.verifiedProgress) {
            return res.status(400).json({ message: `Progress must be greater than current verified progress (${job.verifiedProgress}%)` });
        }

        job.progressUpdates.push({ imageUrl, description, proposedProgress });
        job.jobStatus = 'in_progress';
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

        const update = job.progressUpdates.id(req.params.updateId);
        if (!update) return res.status(404).json({ message: 'Progress update not found' });

        update.status = 'approved';
        // Only update job.verifiedProgress if proposedProgress is greater or equal to current value
        if (update.proposedProgress >= job.verifiedProgress) {
            job.verifiedProgress = update.proposedProgress;
        }
        update.verifiedProgress = job.verifiedProgress;
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

        const update = job.progressUpdates.id(req.params.updateId);
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

        job.jobStatus = 'completed';
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
        const job = await Job.findById(req.params.jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (job.employer.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (job.jobStatus === 'paid') {
            return res.status(400).json({ message: 'Already paid' });
        }

        // Transfer funds
        const tasker = await User.findById(job.hiredTasker);
        if (tasker) {
            tasker.walletBalance += job.escrowAmount;
            tasker.totalEarnings += job.escrowAmount;
            tasker.completedProjects += 1;
            await tasker.save();
        }

        job.jobStatus = 'paid';
        job.escrowAmount = 0; // Released
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
