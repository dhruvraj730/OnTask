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
    try {
        if (req.user.role !== 'employer') {
            return res.status(403).json({ message: 'Not authorized as an employer' });
        }

        const { title, company, location, description, salary } = req.body;

        if (!title || !description || !company || !location || !salary) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        const job = await Job.create({
            employer: req.user.id,
            title,
            company,
            location,
            description,
            salary
        });

        res.status(201).json(job);
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

        const jobs = await Job.find({ employer: req.user.id });
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    getJobs,
    createJob,
    getMyJobs
}
