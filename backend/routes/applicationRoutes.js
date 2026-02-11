const express = require('express');
const router = express.Router();
const { getMyApplications, getActiveContracts, getCompletedJobs } = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/my-applications', protect, getMyApplications);
router.get('/active-contracts', protect, getActiveContracts);
router.get('/completed', protect, getCompletedJobs);

module.exports = router;
