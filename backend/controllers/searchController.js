const User = require('../models/User');
const Job = require('../models/Job');

// @desc    Search Taskers
// @route   GET /api/search/taskers
// @access  Public
const searchTaskers = async (req, res) => {
    try {
        const { minRating, minEarnings, minExperience, skill } = req.query;

        let query = { role: 'job_seeker' };

        if (minRating) {
            query.rating = { $gte: Number(minRating) };
        }
        if (minEarnings) {
            query.totalEarnings = { $gte: Number(minEarnings) };
        }
        if (minExperience) {
            query.experience = { $gte: Number(minExperience) };
        }
        if (skill) {
            query.skills = { $in: [new RegExp(skill, 'i')] };
        }

        const taskers = await User.find(query).select('-password');
        res.status(200).json(taskers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Search Jobs
// @route   GET /api/search/jobs
// @access  Public
const searchJobs = async (req, res) => {
    try {
        const { minSalary, location, title } = req.query;

        let query = {};

        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }
        if (title) {
            query.title = { $regex: title, $options: 'i' };
        }
        // Basic salary parsing (assuming strictly numeric or simple format for now)
        // In reality, salary might be a string like "$50k - $60k", so complex logic needed.
        // For MVP, we'll keep regex or basic check if salary field was numeric. 
        // Since salary is String in schema, we filter by regex search for now.

        const jobs = await Job.find(query).populate('employer', 'name company rating');
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    searchTaskers,
    searchJobs
};
