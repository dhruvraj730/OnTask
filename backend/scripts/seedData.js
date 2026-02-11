const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Job = require('../models/Job');
const Message = require('../models/Message');

dotenv.config({ path: path.join(__dirname, '../.env') });
// This will look for .env in the current working directory (backend)

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ontask');
        console.log('MongoDB Connected...');

        // Clear existing data
        await User.deleteMany();
        await Job.deleteMany();
        await Message.deleteMany();
        console.log('Existing data cleared...');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // Create Organizers
        const organizer1 = await User.create({
            name: 'Global Events Corp',
            email: 'organizer@example.com',
            password: hashedPassword,
            role: 'employer',
            companyName: 'Global Events Corp',
            industry: 'Event Management',
            bio: 'Leading event management company specializing in large-scale corporate summits.',
            subscription: {
                plan: 'pro',
                status: 'active',
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
        });

        const demoEmployer = await User.create({
            name: 'Demo Employer',
            email: 'employer@demo.com',
            password: hashedPassword,
            role: 'employer',
            companyName: 'OnTask Demo',
            industry: 'Technology',
            bio: 'Official demo account for testing employer features on OnTask.',
            subscription: {
                plan: 'pro',
                status: 'active',
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
        });

        // Create Taskers
        const demoTasker = await User.create({
            name: 'Demo Applicant',
            email: 'demo@example.com',
            password: hashedPassword,
            role: 'job_seeker',
            professionalTitle: 'Event Specialist & Photographer',
            bio: 'I am a demo applicant for testing the application flow. I have 5 years of experience in event photography and coordination.',
            skills: ['Coordination', 'Photography', 'Hosting', 'Adobe Lightroom'],
            hourlyRate: 25,
            rating: 5.0,
            jobsCompleted: 12,
            hoursWorked: 156,
            totalEarnings: 3900,
            successRate: 100,
            portfolio: [
                { title: "Wedding Photography", description: "Captured 50+ weddings across India.", rating: 5.0 },
                { title: "Corporate Event Hosting", description: "Hosted 12 corporate award ceremonies.", rating: 4.9 }
            ]
        });

        const tasker1 = await User.create({
            name: 'John Smith',
            email: 'tasker1@example.com',
            password: hashedPassword,
            role: 'job_seeker',
            professionalTitle: 'Event Coordinator',
            bio: 'Experienced event coordinator with a focus on logistics and attendee management.',
            skills: ['Event Planning', 'Logistics', 'Customer Service'],
            hourlyRate: 35,
            rating: 4.9,
            jobsCompleted: 42,
            hoursWorked: 320,
            totalEarnings: 18500,
            successRate: 98,
            portfolio: [
                { title: "Product Launch", description: "Managed a multi-city product launch event.", rating: 4.9 }
            ]
        });

        // Create Jobs
        const job1 = await Job.create({
            employer: organizer1._id,
            title: 'Tech Summit 2026 - AV Support',
            company: 'Global Events Corp',
            location: 'Mumbai, India',
            description: 'We need technical support specialists to manage AV equipment for our annual Tech Summit.',
            salary: '₹2,500',
            jobStatus: 'open',
            applications: [
                {
                    applicant: demoTasker._id,
                    proposal: "Hi, I'm the demo applicant! I have experience with AV setups and event coordination.",
                    assessmentScore: 98,
                    status: 'applied'
                },
                {
                    applicant: tasker1._id,
                    proposal: "I have extensive experience in coordinating logistics for tech summits.",
                    assessmentScore: 92,
                    interviewStatus: 'scheduled',
                    interviewLink: 'https://zoom.us/j/123456789',
                    interviewDate: new Date(Date.now() + 86400000),
                    status: 'interviewing'
                }
            ]
        });

        const job2 = await Job.create({
            employer: demoEmployer._id,
            title: 'Conference Photography',
            company: 'OnTask Demo',
            location: 'Bangalore, India',
            description: 'Looking for a photographer for a 2-day tech conference.',
            salary: '₹8,000',
            jobStatus: 'in_progress',
            hiredTasker: demoTasker._id,
            progressUpdates: [
                { description: "Gear prepped and ready for Day 1.", date: new Date(Date.now() - 86400000) },
                { description: "Completed Day 1 photography. Editing samples now.", date: new Date() }
            ]
        });

        // Create initial message
        await Message.create({
            sender: organizer1._id,
            recipient: demoTasker._id,
            content: "Welcome to OnTask! Ready to discuss the AV support role?"
        });

        console.log('Dummy data seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
