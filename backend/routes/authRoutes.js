const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateUserProfile, forgotPassword, verifyOtp, changePassword } = require('../controllers/authController.js');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware.js');
const passport = require('passport');



router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp/:email', verifyOtp);
router.post('/change-password/:email', changePassword);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
    try{
        const token = jwt.sign({ id: req.user.id, email:req.user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // Successful authentication, redirect to client
    res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${token}`);
    }
    catch(error){
        console.error('Google login error:',error);
        res.redirect(`${process.env.CLIENT_URL}/login?error=google_failed`);
    }
});

module.exports = router;
