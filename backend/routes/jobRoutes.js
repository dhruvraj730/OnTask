const express = require('express');
const router = express.Router();
const { getJobs, createJob, getMyJobs } = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const { checkSubscription } = require('../middleware/subscriptionMiddleware');

router.get('/', getJobs);
router.post('/', protect, checkSubscription, createJob);
router.get('/my-jobs', protect, getMyJobs);

module.exports = router;
