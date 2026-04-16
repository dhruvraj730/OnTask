const User = require('../models/User');
const Job = require('../models/Job');

// @desc    Search Taskers
// @route   GET /api/search/taskers
// @access  Public
const searchTaskers = async (req, res) => {
    try {
        const { minRating, minEarnings, minExperience, skill, sortBy } = req.query;

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
            // Using a case-insensitive regex search for skill tags
            query.skills = { $in: [new RegExp(skill, 'i')] };
        }

        let sortOption = { createdAt: -1 }; // Default: Newest first
        if (sortBy === 'rating') sortOption = { rating: -1 };
        else if (sortBy === 'experience') sortOption = { experience: -1 };
        else if (sortBy === 'newest') sortOption = { createdAt: -1 };

        const taskers = await User.find(query)
            .select('-password')
            .sort(sortOption);
            
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
        const { minSalary, location, title, sortBy } = req.query;

        let query = {};

        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }
        if (title) {
            query.title = { $regex: title, $options: 'i' };
        }
        
        // Handle numeric budget filter if minSalary is provided
        if (minSalary) {
            query.budget = { $gte: Number(minSalary) };
        }

        // Default to open jobs
        if (!query.jobStatus) {
            query.jobStatus = 'open';
        }

        let sortOption = { createdAt: -1 }; // Default
        if (sortBy === 'salary') sortOption = { budget: -1 };
        else if (sortBy === 'newest') sortOption = { createdAt: -1 };

        const jobs = await Job.find(query)
            .populate('employer', 'name company rating')
            .sort(sortOption);
            
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    searchTaskers,
    searchJobs
};
