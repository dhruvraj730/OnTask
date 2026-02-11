const User = require('../models/User');

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('name bio professionalTitle skills rating jobsCompleted totalEarnings successRate portfolio hourlyRate');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUserProfile
};
