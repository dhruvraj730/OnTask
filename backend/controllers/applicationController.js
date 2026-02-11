const Job = require('../models/Job');

// @desc    Get my applications (Frealncer)
// @route   GET /api/applications/my-applications
// @access  Private
const getMyApplications = async (req, res) => {
    try {
        const jobs = await Job.find({
            'applications.applicant': req.user.id
        }).populate('employer', 'name email').sort('-createdAt');

        const applications = jobs.map(job => {
            const application = job.applications.find(
                app => app.applicant.toString() === req.user.id
            );
            return {
                jobId: job._id,
                jobTitle: job.title,
                company: job.company,
                salary: job.salary,
                status: application.status,
                appliedAt: application.appliedAt,
                proposal: application.proposal,
                interviewStatus: application.interviewStatus,
                interviewLink: application.interviewLink,
                interviewDate: application.interviewDate
            };
        });

        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get active contracts (Freelancer)
// @route   GET /api/applications/active-contracts
// @access  Private
const getActiveContracts = async (req, res) => {
    try {
        const jobs = await Job.find({
            hiredTasker: req.user.id,
            jobStatus: { $in: ['hired', 'in_progress'] }
        }).populate('employer', 'name email');

        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get completed jobs (Freelancer)
// @route   GET /api/applications/completed
// @access  Private
const getCompletedJobs = async (req, res) => {
    try {
        const jobs = await Job.find({
            hiredTasker: req.user.id,
            jobStatus: { $in: ['completed', 'paid'] }
        }).populate('employer', 'name email');

        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMyApplications,
    getActiveContracts,
    getCompletedJobs
};
