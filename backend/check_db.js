const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const checkJobs = async () => {
    let output = '';
    const log = (msg) => {
        output += msg + '\n';
        console.log(msg);
    };

    try {
        await mongoose.connect(process.env.MONGO_URI);
        log('Connected to MongoDB');

        const Job = require('./models/Job');

        const latestJobs = await Job.find().sort({ createdAt: -1 }).limit(5);
        log(`Found ${latestJobs.length} latest jobs`);

        latestJobs.forEach((job, i) => {
            log(`\n--- Job ${i + 1} ---`);
            log(`Title: ${job.title}`);
            log(`ID: ${job._id}`);
            log(`Company: ${job.company}`);
            log(`StartDate: ${job.startDate}`);
            log(`Duration: ${JSON.stringify(job.duration)}`);
            log(`EndDate: ${job.endDate}`);
            log(`CreatedAt: ${job.createdAt}`);
            log(`timeBasedProgress (virtual): ${job.timeBasedProgress}`);
        });

        fs.writeFileSync('db_results.json', JSON.stringify(latestJobs, null, 2));
        fs.writeFileSync('db_results.txt', output);
        log('\nResults saved to db_results.json and db_results.txt');

        process.exit(0);
    } catch (err) {
        console.error('ERROR:', err.message);
        process.exit(1);
    }
};

checkJobs();
