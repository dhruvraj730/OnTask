const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Job = require('../models/Job');
const User = require('../models/User');
const { createJob } = require('../controllers/jobController');

const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const testDuplicateJob = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // Find an employer
        const employer = await User.findOne({ role: 'employer' });
        if (!employer) {
            console.log('No employer found in DB. Please create one first.');
            process.exit(1);
        }

        console.log(`Using employer: ${employer.email}`);

        // Mock req and res
        const jobData = {
            title: 'Test Duplicate Job ' + Date.now(),
            company: 'Test Company',
            location: 'Remote',
            description: 'This is a test job to verify duplicate prevention.',
            salary: '₹10,000',
            budget: 10000,
            startDate: new Date(),
            duration: { value: 1, unit: 'days' },
            positionsRequired: 1
        };

        const req = {
            user: { id: employer._id.toString(), role: 'employer', name: employer.name, _id: employer._id },
            body: jobData
        };

        const res = {
            status: function(code) {
                this.statusCode = code;
                return this;
            },
            json: function(data) {
                this.data = data;
                return this;
            }
        };

        // 1. Create the job for the first time
        console.log('Posting job for the first time...');
        await createJob(req, res);
        
        if (res.statusCode === 201) {
            console.log('First job posted successfully.');
            const firstJobId = res.data._id;
        } else {
            console.error('Failed to post first job:', res.data);
            process.exit(1);
        }

        // 2. Attempt to post the same job again
        console.log('Attempting to post the same job again...');
        // Reset res
        res.statusCode = null;
        res.data = null;

        await createJob(req, res);

        if (res.statusCode === 400 && res.data.message.includes('already posted this job')) {
            console.log('SUCCESS: Duplicate job posting was prevented.');
        } else {
            console.error('FAILED: Duplicate job posting was NOT prevented.', {
                statusCode: res.statusCode,
                data: res.data
            });
        }

        // Cleanup: remove the test job created
        // await Job.deleteOne({ _id: firstJobId });
        // console.log('Cleanup: Test job removed.');

        process.exit(0);
    } catch (error) {
        console.error('Test error:', error);
        process.exit(1);
    }
};

testDuplicateJob();
