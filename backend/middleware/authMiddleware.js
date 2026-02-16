const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];
            console.log("[AUTH] Token found:", token.substring(0, 10) + "...");

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("[AUTH] Token decoded, User ID:", decoded.id);

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                console.log("[AUTH] User not found in DB");
                return res.status(401).json({ message: 'User not found' });
            }

            console.log("[AUTH] User authenticated:", req.user.email);
            next();
        } catch (error) {
            console.log("[AUTH] Error:", error.message);
            res.status(401).json({ message: 'Not authorized' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
