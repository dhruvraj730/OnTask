const User = require('../models/User');

// @desc    Subscribe to a plan (Mock)
// @route   POST /api/payment/subscribe
// @access  Private
const subscribeUser = async (req, res) => {
    try {
        const { plan } = req.body; // 'starter', 'pro', 'elite'

        const user = await User.findById(req.user.id);

        if (user) {
            user.subscription.plan = plan;
            user.subscription.status = 'active';
            // Set expiry to 30 days from now
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + 30);
            user.subscription.expiresAt = expiry;

            await user.save();

            res.json({
                message: `Successfully subscribed to ${plan}`,
                subscription: user.subscription
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { subscribeUser };
