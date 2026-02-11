const User = require('../models/User');

// @desc    Get wallet data
// @route   GET /api/wallet
// @access  Private
const getWalletData = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('walletBalance totalEarnings totalWithdrawn transactions');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Request withdrawal
// @route   POST /api/wallet/withdraw
// @access  Private
const withdrawFunds = async (req, res) => {
    try {
        const { amount } = req.body;
        const widthdrawAmount = Number(amount);

        if (!widthdrawAmount || widthdrawAmount <= 0) {
            return res.status(400).json({ message: 'Please enter a valid amount' });
        }

        const user = await User.findById(req.user.id);

        if (!user.bankDetails || !user.bankDetails.accountNumber) {
            return res.status(400).json({ message: 'Please add bank details to your profile to withdraw funds' });
        }

        if (user.walletBalance < widthdrawAmount) {
            return res.status(400).json({ message: 'Insufficient funds' });
        }

        user.walletBalance -= widthdrawAmount;
        user.totalWithdrawn += widthdrawAmount;

        user.transactions.push({
            type: 'withdrawal',
            amount: widthdrawAmount,
            description: 'Withdrawal to Bank Account',
            status: 'completed'
        });

        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getWalletData,
    withdrawFunds
};
