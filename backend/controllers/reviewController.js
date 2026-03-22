const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Job = require('../models/Job');
const Notification = require('../models/Notification');

// @desc    Submit a review for a freelancer
// @route   POST /api/reviews
// @access  Private (Employer)
const submitReview = asyncHandler(async (req, res) => {
    const { freelancerId, jobId, rating, comment } = req.body;

    console.log('[REVIEW] Submitting review:', { freelancerId, jobId, rating, comment });

    if (!freelancerId || !jobId || !rating) {
        console.log('[REVIEW] Missing fields');
        res.status(400);
        throw new Error('Please provide freelancerId, jobId, and rating');
    }

    const job = await Job.findById(jobId);
    if (!job) {
        res.status(404);
        throw new Error('Job not found');
    }

    // Ensure the current user is the employer of the job
    if (job.employer.toString() !== req.user.id) {
        console.log('[REVIEW] Unauthorized: Job employer is', job.employer, 'but current user is', req.user.id);
        res.status(401);
        throw new Error('Not authorized to review this job');
    }

    const freelancer = await User.findById(freelancerId);
    if (!freelancer) {
        res.status(404);
        throw new Error('Freelancer not found');
    }

    // Find the actual hire record in the job
    const hireIndex = job.hires.findIndex(h => (h.freelancer._id?.toString() || h.freelancer.toString()) === freelancerId);
    if (hireIndex === -1) {
        console.log('[REVIEW] Freelancer not found in hires. Hire IDs:', job.hires.map(h => h.freelancer.toString()));
        res.status(400);
        throw new Error('Freelancer was not hired for this job');
    }

    if (job.hires[hireIndex].hasBeenReviewed) {
        res.status(400);
        throw new Error('Review already submitted for this hire');
    }

    // Create the review object
    const review = {
        rating: Number(rating),
        comment: comment || '',
        reviewerName: req.user.name || req.user.companyName,
        date: Date.now()
    };

    // Add review to freelancer
    freelancer.reviews.push(review);

    // Calculate new average rating
    const totalRating = freelancer.reviews.reduce((acc, item) => Number(item.rating || 0) + acc, 0);
    const newAverage = freelancer.reviews.length > 0 ? totalRating / freelancer.reviews.length : 0;
    freelancer.rating = Math.round(newAverage * 10) / 10; // 1 decimal place

    console.log('[REVIEW] New totals:', { totalRating, length: freelancer.reviews.length, result: freelancer.rating });

    console.log('[REVIEW] Updated freelancer rating:', freelancer.rating, 'Number of reviews:', freelancer.reviews.length);

    await freelancer.save();

    // Mark job hire as reviewed and store review in Job model
    job.hires[hireIndex].hasBeenReviewed = true;
    job.hires[hireIndex].review = {
        rating: Number(rating),
        comment: comment || '',
        date: Date.now()
    };
    await job.save();

    // Create Notification for the freelancer
    await Notification.create({
        recipient: freelancerId,
        sender: req.user._id || req.user.id,
        type: 'review',
        content: `You have received a ${rating}-star review from ${req.user.name || 'a client'} for the job: ${job.title}`,
        link: `/profile`
    });

    res.status(201).json({ message: 'Review added successfully', freelancerRating: freelancer.rating });
});

module.exports = {
    submitReview
};
