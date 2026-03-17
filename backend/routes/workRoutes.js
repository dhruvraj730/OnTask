const express = require('express');
const router = express.Router();
const { hireTasker, addProgress, approveProgress, rejectProgress, completeJob, releasePayment, withdrawFunds } = require('../controllers/workController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:jobId/hire/:userId', protect, hireTasker);
router.post('/:jobId/progress', protect, addProgress);
router.put('/:jobId/progress/:updateId/approve', protect, approveProgress);
router.put('/:jobId/progress/:updateId/reject', protect, rejectProgress);
router.post('/:jobId/complete', protect, completeJob);
router.post('/:jobId/pay', protect, releasePayment);
router.post('/withdraw', protect, withdrawFunds);

module.exports = router;
