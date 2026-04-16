const express = require('express');
const router = express.Router();
const { subscribeUser, createOrder, verifyPayment, createTipOrder, verifyTipPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/subscribe', protect, subscribeUser);
router.post('/order', protect, createOrder);
router.post('/verify', protect, verifyPayment);

router.post('/tip/order', protect, createTipOrder);
router.post('/tip/verify', protect, verifyTipPayment);

module.exports = router;
