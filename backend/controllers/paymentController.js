const User = require('../models/User');
const Job = require('../models/Job');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Subscribe to a plan (Mock)
// @route   POST /api/payment/subscribe
// @access  Private
const subscribeUser = async (req, res) => {
    try {
        const { plan } = req.body; // 'starter', 'pro', 'elite'

        const user = await User.findById(req.user.id);

        if (user) {
            // Ensure subscription object exists
            if (!user.subscription) {
                user.subscription = { plan: 'none', status: 'none' };
            }

            user.subscription.plan = plan;
            user.subscription.status = 'active';
            // Set expiry to 30 days from now
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + 30);
            user.subscription.expiresAt = expiry;

            await user.save();
            console.log(`User ${user.email} upgraded to ${plan}`);

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

// @desc    Create a Razorpay order
// @route   POST /api/payment/order
// @access  Private
const createOrder = async (req, res) => {
    try {
        const { jobId, amount, hireId } = req.body;

        if (!jobId || !amount) {
            return res.status(400).json({ message: 'Job ID and amount are required' });
        }

        const options = {
            amount: Math.round(amount * 100), // amount in the smallest currency unit (paise for INR)
            currency: 'INR',
            receipt: `rcpt_${jobId.toString().slice(-14)}_${Date.now().toString().slice(-10)}`,
        };
        console.log(`[PAYMENT] Creating order with options:`, JSON.stringify(options, null, 2));
        const order = await razorpay.orders.create(options);
        
        if (!order) {
            console.error(`[PAYMENT] Razorpay returned empty order object`);
            return res.status(500).json({ message: 'Failed to create order from Razorpay' });
        }

        console.log(`[PAYMENT] Order created successfully: ${order.id}`);

        res.json(order);
    } catch (error) {
        console.error(`[PAYMENT ERROR] Order creation failed:`, error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, jobId, hireId, amount } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isSignatureValid = expectedSignature === razorpay_signature;

        if (isSignatureValid) {
            // Update the job hire status and escrow amount
            const job = await Job.findById(jobId);
            if (!job) return res.status(404).json({ message: 'Job not found' });

            const hire = job.hires.id(hireId);
            if (!hire) return res.status(404).json({ message: 'Hire record not found' });

            hire.escrowAmount += Number(amount);
            
            // Add a transaction to the provider's history
            const user = await User.findById(req.user.id);
            user.transactions.push({
                type: 'payment',
                amount: amount,
                description: `Payment for Job: ${job.title}`,
                status: 'completed'
            });

            await job.save();
            await user.save();

            res.json({ message: 'Payment verified successfully', success: true });
        } else {
            res.status(400).json({ message: 'Invalid signature', success: false });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { subscribeUser, createOrder, verifyPayment };
