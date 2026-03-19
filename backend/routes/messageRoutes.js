const express = require('express');
const router = express.Router();
const { sendMessage, getConversations, getMessagesWithUser, getUnreadCount, markMessagesAsRead } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/unread-count', protect, getUnreadCount);
router.post('/', protect, sendMessage);
router.get('/conversations', protect, getConversations);
router.put('/:userId/read', protect, markMessagesAsRead);
router.get('/:userId', protect, getMessagesWithUser);

module.exports = router;
