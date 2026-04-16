const User = require('../models/User');

const checkSubscription = async (req, res, next) => {
    try {
        // Fetch fresh user to check status
        const user = await User.findById(req.user.id);

        // For MVP, if plan is 'none', block. 
        // In real world, we might allow limited free actions.
        // Ensure subscription object exists
        const sub = user.subscription || { plan: 'none', status: 'expired' };

        if (sub.plan === 'none' || sub.status !== 'active') {
            return res.status(403).json({
                message: 'Subscription Required. Please upgrade to a plan to initiate direct hires.',
                requiresSubscription: true
            });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Server Error checking subscription' });
    }
};

module.exports = { checkSubscription };
