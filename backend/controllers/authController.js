const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Job = require('../models/Job');
const sendOtpMail = require('../emailVerify/sendOtpMail.js');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

// JWT token generator
function generateToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
}

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, country, bankDetails, companyName, industry, website, hiringNeeds, businessAddress, bio } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'job_seeker',
            country: country || '',
            // Optional fields for both roles
            bio: bio || '',
            // Tasker Specific
            bankDetails: bankDetails || {},
            // Organizer Specific
            companyName: companyName || '',
            industry: industry || '',
            website: website || '',
            hiringNeeds: hiringNeeds || [],
            businessAddress: businessAddress || {}
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update User Profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            
            // Handle Avatar Upload
            if (req.file) {
                user.avatar = `/uploads/avatars/${req.file.filename}`;
            }

            // Optional Logic: if password is sent, hash it (omitted for brevity unless requested)
            if (req.body.bio) user.bio = req.body.bio;

            // Tasker Fields
            if (req.body.skills) {
                try {
                    user.skills = typeof req.body.skills === 'string' ? JSON.parse(req.body.skills) : req.body.skills;
                } catch(e) {
                    user.skills = typeof req.body.skills === 'string' ? req.body.skills.split(',').map(s => s.trim()) : req.body.skills;
                }
            }
            if (req.body.hourlyRate) user.hourlyRate = req.body.hourlyRate;
            if (req.body.experience) user.experience = req.body.experience;
            if (req.body.professionalTitle) user.professionalTitle = req.body.professionalTitle;
            if (req.body.bankDetails) {
                try {
                    user.bankDetails = typeof req.body.bankDetails === 'string' ? JSON.parse(req.body.bankDetails) : req.body.bankDetails;
                } catch(e) {
                    user.bankDetails = req.body.bankDetails;
                }
            }

            // Organizer Fields
            if (req.body.companyName) user.companyName = req.body.companyName;
            if (req.body.industry) user.industry = req.body.industry;
            if (req.body.website) user.website = req.body.website;
            if (req.body.hiringNeeds) user.hiringNeeds = req.body.hiringNeeds;

            if (req.body.businessAddress) {
                let parsedAddress = req.body.businessAddress;
                if (typeof parsedAddress === 'string') {
                    try { parsedAddress = JSON.parse(parsedAddress); } catch(e) {}
                }
                user.businessAddress = {
                    ...user.businessAddress,
                    ...parsedAddress
                };
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                avatar: updatedUser.avatar,
                bio: updatedUser.bio,
                skills: updatedUser.skills,
                hourlyRate: updatedUser.hourlyRate,
                experience: updatedUser.experience,
                professionalTitle: updatedUser.professionalTitle,
                // Return Organizer fields
                companyName: updatedUser.companyName,
                industry: updatedUser.industry,
                website: updatedUser.website,
                hiringNeeds: updatedUser.hiringNeeds,
                businessAddress: updatedUser.businessAddress,
                bankDetails: updatedUser.bankDetails,
                token: generateToken(updatedUser._id)
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            if (!user.isActive) {
                return res.json({ 
                    requiresReactivation: true, 
                    message: 'Your account is deactivated. Click to reactivate.' 
                });
            }
            if (user.isTwoFactorEnabled) {
                return res.json({
                    requires2FA: true,
                    userId: user._id,
                    message: 'Two-Factor Authentication required'
                });
            }

            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                // Return expanded profile fields
                bio: user.bio,
                skills: user.skills,
                hourlyRate: user.hourlyRate,
                experience: user.experience,
                professionalTitle: user.professionalTitle,
                bankDetails: user.bankDetails,
                token: generateToken(user._id)
            });
        } else {
            console.log(`Login failed for email: ${email}${user ? ' (Incorrect password)' : ' (User not found)'}`);
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const forgotPassword = async (req, res) => {
    try{
        const {email} = req.body;
        const user = await User.findOne({email});

        if(!user){
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000);

        user.otp = otp;
        user.otpExpiry = expiry;
        await user.save();
        await sendOtpMail(email, otp);
        res.json({ success: true, message: 'OTP sent to your email' });

    }
    catch(error){
        res.status(500).json({ success: false,  message: error.message });
    }
}

const verifyOtp = async (req, res) => {
    const {otp} = req.body;
    const email = req.params.email;

    if(!otp){
        return res.status(400).json({ success: false, message: 'OTP is required' });
    }

    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if(!user.otp || !user.otpExpiry){
            return res.status(400).json({ success: false, message: 'OTP not generated or already verified' });
        }
        if (user.otpExpiry < new Date()){
            return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        }
        if(user.otp !== otp){
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }
        user.otp = '';
        user.otpExpiry = null;
        await user.save();
        res.json({ success: true, message: 'OTP verified successfully' });
    }
    catch(error){
        res.status(500).json({ success: false, message: error.message });
    }
}

const changePassword = async (req, res) => {
    const { newPassword, confirmPassword } = req.body;
    const email = req.params.email;

    if (!newPassword || !confirmPassword) {
        return res.status(400).json({ success: false, message: 'New password and confirm password are required' });
    }
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({ success: true, message: 'Password changed successfully' });
    }
    catch(error){
        res.status(500).json({ success: false, message: error.message });

    }
}

// @desc    Get User Profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const updateSettings = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (req.body.notifications) {
            user.settings.notifications = {
                ...user.settings.notifications,
                ...req.body.notifications
            };
        }

        if (req.body.privacy) {
            user.settings.privacy = {
                ...user.settings.privacy,
                ...req.body.privacy
            };
        }

        await user.save();
        res.json(user.settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const changePasswordAuthenticated = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        console.log("Password change request for user:", req.user.id);
        const user = await User.findById(req.user.id);

        if (!user) {
            console.log("User not found for ID:", req.user.id);
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.password) {
            console.log("User has no password (likely Google user)");
            return res.status(400).json({ message: 'Account does not have a local password. Please use social login.' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            console.log("Current password mismatch");
            return res.status(400).json({ message: 'Invalid current password' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        console.log("Password updated successfully for:", user.email);
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Generate 2FA secret and QR code
// @route   GET /api/auth/2fa/generate
// @access  Private
const generate2FA = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const secret = speakeasy.generateSecret({
            name: `OnTask (${user.email})`
        });

        user.twoFactorSecret = secret.base32;
        await user.save();

        qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
            if (err) {
                return res.status(500).json({ message: 'Error generating QR code' });
            }
            res.json({
                secret: secret.base32,
                qrcode: data_url
            });
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Enable 2FA by verifying the first code
// @route   POST /api/auth/2fa/enable
// @access  Private
const enable2FA = async (req, res) => {
    try {
        const { code } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: code
        });

        if (verified) {
            user.isTwoFactorEnabled = true;
            await user.save();
            res.json({ message: 'Two-Factor Authentication enabled successfully' });
        } else {
            res.status(400).json({ message: 'Invalid 2FA code' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Disable 2FA
// @route   POST /api/auth/2fa/disable
// @access  Private
const disable2FA = async (req, res) => {
    try {
        const { code } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: code
        });

        if (verified) {
            user.isTwoFactorEnabled = false;
            user.twoFactorSecret = '';
            await user.save();
            res.json({ message: 'Two-Factor Authentication disabled successfully' });
        } else {
            res.status(400).json({ message: 'Invalid 2FA code' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify 2FA code during login
// @route   POST /api/auth/login/verify-2fa
// @access  Public
const verifyLogin2FA = async (req, res) => {
    try {
        const { userId, code } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.isTwoFactorEnabled) {
             return res.status(400).json({ message: '2FA is not enabled for this user' });
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: code,
            window: 1
        });

        if (verified) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                bio: user.bio,
                skills: user.skills,
                hourlyRate: user.hourlyRate,
                experience: user.experience,
                professionalTitle: user.professionalTitle,
                bankDetails: user.bankDetails,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid 2FA code' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add Portfolio Item
// @route   POST /api/auth/portfolio
// @access  Private
const addPortfolioItem = async (req, res) => {
    try {
        const { title, description, projectUrl, skills } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        const newItem = {
            title,
            description,
            projectUrl,
            skills: skills ? (typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : skills) : [],
            completedAt: Date.now()
        };

        // Handle File Upload
        if (req.file) {
            newItem.imageUrl = `/uploads/portfolio/${req.file.filename}`;
        }

        user.portfolio.push(newItem);

        await user.save();
        res.status(201).json(user.portfolio);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove Portfolio Item
// @route   DELETE /api/auth/portfolio/:itemId
// @access  Private
const removePortfolioItem = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.portfolio = user.portfolio.filter(item => item._id.toString() !== req.params.itemId);

        await user.save();
        res.status(200).json(user.portfolio);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Deactivate User Account
// @route   PUT /api/auth/deactivate
// @access  Private
const deactivateAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.isActive = false;
            // Clear tokens
            user.token = '';
            user.fcmToken = '';
            await user.save();

            // If an employer deactivates, close all their open jobs
            if (user.role === 'employer') {
                await Job.updateMany(
                    { employer: user._id, jobStatus: 'open' },
                    { jobStatus: 'closed' }
                );
            }

            res.json({ success: true, message: 'Account successfully deactivated' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reactivate User Account
// @route   POST /api/auth/reactivate
// @access  Public (Requires credentials)
const reactivateAccount = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            user.isActive = true;
            await user.save();

            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
                message: 'Account successfully reactivated'
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    updateSettings,
    changePasswordAuthenticated,
    forgotPassword,
    verifyOtp,
    changePassword,
    generate2FA,
    enable2FA,
    disable2FA,
    verifyLogin2FA,
    addPortfolioItem,
    removePortfolioItem,
    deactivateAccount,
    reactivateAccount
};
