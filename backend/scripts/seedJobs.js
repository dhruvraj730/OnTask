const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Job = require('../models/Job');
const bcrypt = require('bcryptjs');

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

const seedData = async () => {
    await connectDB();

    try {
        await User.deleteMany();
        await Job.deleteMany();

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // 1. Create Employer
        const employer = await User.create({
            name: 'Tech Solutions Inc.',
            email: 'employer@example.com',
            password: hashedPassword,
            role: 'employer',
            companyName: 'Tech Solutions Inc.',
            company: 'Tech Solutions Inc.', // Some parts of code might use 'company'
            description: 'Leading tech company.',
            walletBalance: 10000
        });

        // 2. Create Job Seeker (Demo User)
        const jobSeeker = await User.create({
            name: 'John Doe',
            email: 'demo@example.com', // LOGIN WITH THIS
            password: hashedPassword,
            role: 'job_seeker',
            skills: ['React', 'Node.js', 'MongoDB'],
            hourlyRate: 50,
            walletBalance: 1500, // Pre-loaded for withdrawal test
            totalEarnings: 2500,
            bankDetails: {
                accountName: 'John Doe',
                accountNumber: '1234567890',
                ifscCode: 'HDFC0001234',
                bankName: 'HDFC Bank'
            }
        });

        console.log('Users Created');

        // 3. Create Jobs

        // Job 1: Open Job (For "Matching Jobs" & "Apply" test)
        await Job.create({
            employer: employer._id,
            title: 'Senior React Developer',
            company: 'Tech Solutions Inc.',
            location: 'Remote',
            description: 'We are looking for an experienced React developer to join our team. Must have 5+ years of experience.',
            salary: '₹80k - ₹100k',
            jobStatus: 'open',
            skills: ['React', 'Redux', 'TypeScript'],
            startDate: new Date(Date.now() + 86400000 * 7),
            duration: { value: 3, unit: 'months' }
        });

        await Job.create({
            employer: employer._id,
            title: 'Backend Node.js Engineer',
            company: 'Tech Solutions Inc.',
            location: 'Remote',
            description: 'Need a backend expert to handle high traffic API.',
            salary: '₹70k - ₹90k',
            jobStatus: 'open',
            skills: ['Node.js', 'MongoDB', 'Express'],
            startDate: new Date(Date.now() + 86400000 * 14),
            duration: { value: 6, unit: 'months' }
        });

        await Job.create({
            employer: employer._id,
            title: 'UI/UX Designer',
            company: 'Creative Studio',
            location: 'New York',
            description: 'Design beautiful interfaces for our mobile apps.',
            salary: '₹60k - ₹80k',
            jobStatus: 'open',
            skills: ['Figma', 'Adobe XD'],
            startDate: new Date(Date.now() + 86400000 * 3),
            duration: { value: 2, unit: 'weeks' }
        });


        // Job 2: Active Contract (For "Active Jobs" & "History" test)
        const activeJob = await Job.create({
            employer: employer._id,
            title: 'E-commerce Website',
            company: 'Tech Solutions Inc.',
            location: 'Remote',
            description: 'Build a full-stack e-commerce site.',
            salary: '₹5000',
            jobStatus: 'in_progress',
            hiredTasker: jobSeeker._id,
            applications: [{
                applicant: jobSeeker._id,
                status: 'hired',
                appliedAt: new Date()
            }],
            startDate: new Date(Date.now() - 86400000 * 5),
            duration: { value: 1, unit: 'months' },
            progressUpdates: [
                { description: 'Initial setup completed', date: new Date(Date.now() - 86400000 * 2) },
                { description: 'Database schema designed', date: new Date(Date.now() - 86400000) }
            ]
        });

        // Job 3: Completed Job (For "Completed" tab test)
        await Job.create({
            employer: employer._id,
            title: 'Logo Design',
            company: 'Tech Solutions Inc.',
            location: 'Remote',
            description: 'Design a modern logo.',
            salary: '₹500',
            jobStatus: 'paid', // Completed & Paid
            hiredTasker: jobSeeker._id,
            applications: [{
                applicant: jobSeeker._id,
                status: 'hired',
                appliedAt: new Date(Date.now() - 86400000 * 10)
            }],
            startDate: new Date(Date.now() - 86400000 * 20),
            duration: { value: 2, unit: 'days' }
        });

        console.log('Jobs Created');
        console.log('Database Seeded Successfully');
        process.exit();

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();
