const User = require('../models/User');

const checkSubscription = async (req, res, next) => {
    try {
        // Fetch fresh user to check status
        const user = await User.findById(req.user.id);

        // For MVP, if plan is 'none', block. 
        // In real world, we might allow limited free actions.
        if (user.subscription.plan === 'none' || user.subscription.status !== 'active') {
            return res.status(403).json({
                message: 'Subscription Required',
                requiresSubscription: true
            });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Server Error checking subscription' });
    }
};

module.exports = { checkSubscription };
