const asyncHandler = require('express-async-handler');
const AppFeedback = require('../models/AppFeedback');

// @desc    Submit application feedback
// @route   POST /api/app-feedback
// @access  Private
const submitAppFeedback = asyncHandler(async (req, res) => {
    const { rating, feedback } = req.body;

    if (!rating || !feedback) {
        res.status(400);
        throw new Error('Please provide rating and feedback');
    }

    const appFeedback = await AppFeedback.create({
        user: req.user.id,
        role: req.user.role,
        rating: Number(rating),
        feedback
    });

    res.status(201).json(appFeedback);
});

module.exports = {
    submitAppFeedback
};
