const express = require('express');
const router = express.Router();
const { getWalletData, withdrawFunds } = require('../controllers/walletController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getWalletData);
router.post('/withdraw', protect, withdrawFunds);

module.exports = router;
