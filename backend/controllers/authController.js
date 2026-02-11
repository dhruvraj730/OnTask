const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// ... (Existing registerUser and loginUser) ...

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

// ... (keep loginUser and generateToken) ...

// @desc    Update User Profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;

            // Optional Logic: if password is sent, hash it (omitted for brevity unless requested)
            if (req.body.bio) user.bio = req.body.bio;

            // Tasker Fields
            if (req.body.skills) user.skills = req.body.skills;
            if (req.body.hourlyRate) user.hourlyRate = req.body.hourlyRate;
            if (req.body.experience) user.experience = req.body.experience;
            if (req.body.professionalTitle) user.professionalTitle = req.body.professionalTitle;
            if (req.body.bankDetails) user.bankDetails = req.body.bankDetails;

            // Organizer Fields
            if (req.body.companyName) user.companyName = req.body.companyName;
            if (req.body.industry) user.industry = req.body.industry;
            if (req.body.website) user.website = req.body.website;
            if (req.body.hiringNeeds) user.hiringNeeds = req.body.hiringNeeds;

            if (req.body.businessAddress) {
                user.businessAddress = {
                    ...user.businessAddress,
                    ...req.body.businessAddress
                };
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
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
                token: generateToken(updatedUser._id) // Optional: refresh token
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

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

module.exports = {
    registerUser,
    loginUser,
    updateUserProfile
};
