const Job = require('../models/Job');

// @desc    Get my applications (Frealncer)
// @route   GET /api/applications/my-applications
// @access  Private
const getMyApplications = async (req, res) => {
    try {
        const jobs = await Job.find({
            'applications.applicant': req.user.id
        })
            .populate('employer', 'name email');

        const applications = jobs.reduce((acc, job) => {
            if (!job.applications || !Array.isArray(job.applications)) return acc;

            // Find the specific application for this user
            const application = job.applications.find(
                app => app.applicant && app.applicant.toString() === req.user.id
            );

            if (!application) return acc;

            acc.push({
                jobId: job._id,
                jobTitle: job.title,
                company: job.company || 'Unknown Company',
                salary: job.salary || 'N/A',
                status: application.status || 'applied',
                appliedAt: application.appliedAt || new Date(),
                proposal: application.proposal || '',
                interviewStatus: application.interviewStatus || 'none',
                interviewLink: application.interviewLink || '',
                interviewDate: application.interviewDate,
                offeredBudget: application.offeredBudget,
                offeredBudgetStatus: application.offeredBudgetStatus || 'none'
            });
            return acc;
        }, []);

        // Sort by appliedAt descending
        applications.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

        res.status(200).json(applications);
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
            'hires': {
                $elemMatch: {
                    freelancer: req.user.id,
                    status: { $in: ['hired', 'in_progress'] }
                }
            }
        }).populate('employer', 'name email');

        // Transform to include progressive data at top level for frontend convenience
        const transformedJobs = jobs.map(job => {
            const hire = job.hires.find(h => h.freelancer.toString() === req.user.id);
            const jobObj = job.toObject();
            
            // Fallback for budget
            let budget = hire ? hire.agreedBudget : 0;
            if (budget <= 0) {
                if (job.budget && job.budget > 0) {
                    budget = job.budget;
                } else if (job.salary) {
                    const match = job.salary.match(/\d+/);
                    if (match) budget = Number(match[0]);
                }
            }

            return {
                ...jobObj,
                progress: hire ? hire.progress : 0,
                verifiedProgress: hire ? hire.verifiedProgress : 0,
                agreedBudget: budget,
                paidAmount: hire ? hire.paidAmount : 0
            };
        });

        res.status(200).json(transformedJobs);
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
            'hires': {
                $elemMatch: {
                    freelancer: req.user.id,
                    status: { $in: ['completed', 'cancelled'] }
                }
            }
        }).populate('employer', 'name email');

        const transformedJobs = jobs.map(job => {
            const hire = job.hires.find(h => h.freelancer.toString() === req.user.id);
            const jobObj = job.toObject();

            // Fallback for budget
            let budget = hire ? hire.agreedBudget : 0;
            if (budget <= 0) {
                if (job.budget && job.budget > 0) {
                    budget = job.budget;
                } else if (job.salary) {
                    const match = job.salary.match(/\d+/);
                    if (match) budget = Number(match[0]);
                }
            }

            return {
                ...jobObj,
                progress: hire ? hire.progress : 0,
                verifiedProgress: hire ? hire.verifiedProgress : 0,
                agreedBudget: budget,
                paidAmount: hire ? hire.paidAmount : 0
            };
        });

        res.status(200).json(transformedJobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMyApplications,
    getActiveContracts,
    getCompletedJobs
};
