const express = require('express');
const router = express.Router();
const { getJobs, createJob, getMyJobs, getJobById, scheduleInterview, hireApplicant, addJobUpdate, applyForJob } = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const { checkSubscription } = require('../middleware/subscriptionMiddleware');

router.get('/', getJobs);
router.post('/', protect, checkSubscription, createJob);
router.get('/my-jobs', protect, getMyJobs);
router.get('/:id', protect, getJobById);
router.put('/:id/interview', protect, scheduleInterview);
router.put('/:id/hire', protect, hireApplicant);
router.post('/:id/update', protect, addJobUpdate);
router.post('/:id/apply', protect, applyForJob);

module.exports = router;
