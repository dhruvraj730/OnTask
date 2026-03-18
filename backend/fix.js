const mongoose = require('mongoose');
const Job = require('./models/Job');
mongoose.connect('mongodb+srv://dhruvrajchauhan740_db_user:Dhruvraj_101010@ontaskcluster.awi0cge.mongodb.net/ontask?retryWrites=true&w=majority').then(async () => {
    await Job.updateMany({ title: /developer/i }, { $set: { positionsRequired: 3 } });
    console.log('Updated');
    process.exit(0);
});
