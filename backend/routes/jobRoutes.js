const express = require('express');
const router = express.Router();
const { getJobs, createJob, getMyJobs, getJobById, scheduleInterview, hireApplicant, rejectApplicant, addJobUpdate, verifyJobUpdate, applyForJob, releasePayment, proposeNegotiation, respondToNegotiation } = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const { checkSubscription } = require('../middleware/subscriptionMiddleware');

console.log('[DEBUG] jobRoutes.js - protect:', typeof protect);
console.log('[DEBUG] jobRoutes.js - checkSubscription:', typeof checkSubscription);
console.log('[DEBUG] jobRoutes.js - createJob:', typeof createJob);

router.get('/', getJobs);
router.post('/', protect, checkSubscription, createJob);
router.get('/my-jobs', protect, getMyJobs);
router.get('/:id', protect, getJobById);
router.put('/:id/pay', protect, releasePayment);
router.put('/:id/interview', protect, scheduleInterview);
router.put('/:id/hire', protect, hireApplicant);
router.put('/:id/reject', protect, rejectApplicant);
router.post('/:id/negotiate', protect, proposeNegotiation);
router.put('/:id/negotiate/respond', protect, respondToNegotiation);
router.post('/:id/update', protect, addJobUpdate);
router.put('/:id/update/:updateId/verify', protect, verifyJobUpdate);
router.post('/:id/apply', protect, applyForJob);

module.exports = router;
