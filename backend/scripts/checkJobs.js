const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Job = require('../models/Job');

dotenv.config();

const checkJobs = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const count = await Job.countDocuments();
        console.log(`Total Jobs: ${count}`);

        const openJobs = await Job.countDocuments({ jobStatus: 'open' });
        console.log(`Open Jobs: ${openJobs}`);

        const recentJobs = await Job.find().sort({ createdAt: -1 }).limit(3);
        console.log('Recent Jobs:', recentJobs.map(j => ({ title: j.title, status: j.jobStatus })));

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkJobs();
