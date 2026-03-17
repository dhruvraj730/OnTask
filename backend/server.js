const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const cors = require('cors');
const passport = require('passport');
require('./config/passport.js');  

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('etag', false); // Disable ETag to prevent 304 Not Modified
app.use(cors({
    origin: '*', // Allow all origins for demo
    credentials: true
}));

// Request Logger Middleware
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log('[BODY]', JSON.stringify(req.body, null, 2));
    }
    next();
});

// Connect to Database
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

// Only connect if mongo uri is present
if (process.env.MONGO_URI) {
    connectDB();
} else {
    console.log('No MONGO_URI found in .env');
}

// Routes
app.use(passport.initialize());
app.use('/api/auth', require('./routes/authRoutes.js'));
app.use('/api/jobs', require('./routes/jobRoutes.js'));
app.use('/api/search', require('./routes/searchRoutes.js'));
app.use('/api/messages', require('./routes/messageRoutes.js'));
app.use('/api/payment', require('./routes/paymentRoutes.js'));
app.use('/api/work', require('./routes/workRoutes.js'));
app.use('/api/applications', require('./routes/applicationRoutes.js'));
app.use('/api/wallet', require('./routes/walletRoutes.js'));
app.use('/api/users', require('./routes/userRoutes.js'));

app.get('/', (req, res) => res.send('OnTask Backend is running'));

app.listen(port, () => console.log(`Server started on port ${port}`));
