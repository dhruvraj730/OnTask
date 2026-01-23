const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { recipientId, content } = req.body;

        if (!recipientId || !content) {
            return res.status(400).json({ message: 'Recipient and content are required' });
        }

        const message = await Message.create({
            sender: req.user.id,
            recipient: recipientId,
            content
        });

        const fullMessage = await Message.findOne({ _id: message._id })
            .populate('sender', 'name email')
            .populate('recipient', 'name email');

        res.status(201).json(fullMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all conversations (users messaged with)
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find all messages where user is sender OR recipient
        const messages = await Message.find({
            $or: [{ sender: userId }, { recipient: userId }]
        }).sort({ createdAt: -1 });

        // Extract unique user IDs involved
        const uniqueUserIds = new Set();
        messages.forEach(msg => {
            const otherUser = msg.sender.toString() === userId ? msg.recipient.toString() : msg.sender.toString();
            uniqueUserIds.add(otherUser);
        });

        // Get user details
        const conversations = await User.find({
            _id: { $in: Array.from(uniqueUserIds) }
        }).select('name role bio profileImage'); // Add profileImage if available

        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get messages with a specific user
// @route   GET /api/messages/:userId
// @access  Private
const getMessagesWithUser = async (req, res) => {
    try {
        const myId = req.user.id;
        const otherId = req.params.userId;

        const messages = await Message.find({
            $or: [
                { sender: myId, recipient: otherId },
                { sender: otherId, recipient: myId }
            ]
        })
            .sort({ createdAt: 1 })
            .populate('sender', 'name')
            .populate('recipient', 'name');

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    sendMessage,
    getConversations,
    getMessagesWithUser
};
