const express = require('express');
const router = express.Router();
const { hireTasker, addProgress, completeJob, releasePayment, withdrawFunds } = require('../controllers/workController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:jobId/hire/:userId', protect, hireTasker);
router.post('/:jobId/progress', protect, addProgress);
router.post('/:jobId/complete', protect, completeJob);
router.post('/:jobId/pay', protect, releasePayment);
router.post('/withdraw', protect, withdrawFunds);

module.exports = router;
