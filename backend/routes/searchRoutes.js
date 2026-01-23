const express = require('express');
const router = express.Router();
const { searchTaskers, searchJobs } = require('../controllers/searchController');

router.get('/taskers', searchTaskers);
router.get('/jobs', searchJobs);

module.exports = router;
