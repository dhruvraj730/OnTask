const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead, saveFcmToken } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getNotifications);
router.route('/fcm-token').put(protect, saveFcmToken);
router.route('/read-all').put(protect, markAllAsRead);
router.route('/:id/read').put(protect, markAsRead);

module.exports = router;
