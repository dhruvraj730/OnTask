const express = require('express');
const router = express.Router();
const { submitAppFeedback } = require('../controllers/appFeedbackController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, submitAppFeedback);

module.exports = router;
