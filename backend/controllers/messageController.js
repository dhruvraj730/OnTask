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

        if (recipientId === req.user.id) {
            return res.status(400).json({ message: 'You cannot send a message to yourself' });
        }

        // Safety Check: Restricted Keywords
        const restrictedKeywords = ['email', 'phone', '@', 'pay', 'whatsapp', 'call me', 'contact me'];
        const contentLower = content.toLowerCase();
        const foundKeyword = restrictedKeywords.find(keyword => contentLower.includes(keyword));

        if (foundKeyword) {
            return res.status(400).json({
                message: `Message blocked: Contains restricted keyword "${foundKeyword}". Please keep communication within OnTask for your safety.`
            });
        }

        const message = await Message.create({
            sender: req.user.id,
            recipient: recipientId,
            content
        });

        const fullMessage = await Message.findOne({ _id: message._id })
            .populate('sender', 'name email')
            .populate('recipient', 'name email');

        // Emit socket event to recipient if they are connected
        const io = req.app.get('io');
        const userSockets = req.app.get('userSockets');
        if (io && userSockets) {
            const recipientSocketId = userSockets.get(recipientId.toString());
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('newMessage', fullMessage);
            }
        }

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

        // Find all messages involving the user
        const messages = await Message.find({
            $or: [{ sender: userId }, { recipient: userId }]
        }).sort({ createdAt: -1 });

        // Map to store latest message and unread count per contact
        const contactStats = new Map();
        const currentUserIdStr = userId.toString();

        messages.forEach(msg => {
            const senderId = msg.sender.toString();
            const recipientId = msg.recipient.toString();
            const otherUserId = senderId === currentUserIdStr ? recipientId : senderId;

            if (!contactStats.has(otherUserId)) {
                contactStats.set(otherUserId, {
                    lastMessageAt: msg.createdAt,
                    unreadCount: 0
                });
            }

            // If I am the recipient and it is unread
            if (recipientId === currentUserIdStr && !msg.read) {
                contactStats.get(otherUserId).unreadCount += 1;
            }
        });

        const sortedUserIds = Array.from(contactStats.keys());

        // Get user details
        const users = await User.find({
            _id: { $in: sortedUserIds }
        }).select('name role bio profileImage').lean();

        // Merge stats and sort
        const conversations = users.map(user => ({
            ...user,
            ...contactStats.get(user._id.toString())
        })).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

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

// @desc    Get unread message count
// @route   GET /api/messages/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
    try {
        const count = await Message.countDocuments({
            recipient: req.user.id,
            read: false
        });
        res.json({ unreadCount: count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/:userId/read
// @access  Private
const markMessagesAsRead = async (req, res) => {
    try {
        const senderId = req.params.userId;
        const myId = req.user.id;

        await Message.updateMany(
            { sender: senderId, recipient: myId, read: false },
            { $set: { read: true } }
        );

        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    sendMessage,
    getConversations,
    getMessagesWithUser,
    getUnreadCount,
    markMessagesAsRead
};
