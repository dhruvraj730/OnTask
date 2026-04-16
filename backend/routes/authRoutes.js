const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateUserProfile, updateSettings, changePasswordAuthenticated, forgotPassword, verifyOtp, changePassword, generate2FA, enable2FA, disable2FA, verifyLogin2FA, addPortfolioItem, removePortfolioItem, deactivateAccount, reactivateAccount } = require('../controllers/authController.js');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware.js');
const upload = require('../config/multer.js');
const passport = require('passport');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/login/verify-2fa', verifyLogin2FA);
router.post('/forgot-password', forgotPassword);
router.post('/reactivate', reactivateAccount);
router.post('/verify-otp/:email', verifyOtp);
router.post('/change-password/:email', changePassword);
router.get('/2fa/generate', protect, generate2FA);
router.post('/2fa/enable', protect, enable2FA);
router.post('/2fa/disable', protect, disable2FA);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, upload.single('avatar'), updateUserProfile);
router.put('/settings', protect, updateSettings);
router.put('/deactivate', protect, deactivateAccount);
router.put('/change-password-auth', protect, changePasswordAuthenticated);
router.post('/portfolio', protect, upload.single('portfolio_image'), addPortfolioItem);
router.delete('/portfolio/:itemId', protect, removePortfolioItem);
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
