const Job = require('../models/Job');

// @desc    Get my applications (Frealncer)
// @route   GET /api/applications/my-applications
// @access  Private
const getMyApplications = async (req, res) => {
    try {
        // DEBUG: Return mock data to test connectivity
        const mockApplications = [
            {
                jobId: "123",
                jobTitle: "Debug Job Title",
                company: "Debug Company",
                salary: "₹100k",
                status: "applied",
                appliedAt: new Date(),
                proposal: "Debug proposal",
                interviewStatus: "none"
            }
        ];

        return res.status(200).json(mockApplications);

        /*
        const jobs = await Job.find({
            'applications.applicant': req.user.id
        })
            .populate('employer', 'name email')
            .lean(); // Use lean for better performance and POJO

        const fifteenDaysAgo = new Date();
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

        const applications = jobs.reduce((acc, job) => {
            if (!job.applications || !Array.isArray(job.applications)) return acc;

            // Find the specific application for this user
            const application = job.applications.find(
                app => app.applicant && app.applicant.toString() === req.user.id
            );

            if (!application) return acc;

            const appliedAtDate = application.appliedAt ? new Date(application.appliedAt) : new Date();

            // Filter for last 15 days
            if (appliedAtDate >= fifteenDaysAgo) {
                acc.push({
                    jobId: job._id,
                    jobTitle: job.title,
                    company: job.company || 'Unknown Company',
                    salary: job.salary || 'N/A',
                    status: application.status || 'applied',
                    appliedAt: appliedAtDate,
                    proposal: application.proposal || '',
                    interviewStatus: application.interviewStatus || 'none',
                    interviewLink: application.interviewLink || '',
                    interviewDate: application.interviewDate
                });
            }
            return acc;
        }, []);

        // Sort by appliedAt descending
        applications.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

        res.status(200).json(applications);
        */
    } catch (error) {
        console.error("Error in getMyApplications:", error);
        res.status(500).json({ message: "Failed to fetch applications" });
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
