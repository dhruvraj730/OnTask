const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth';

// Generate random user
const randomId = Math.floor(Math.random() * 10000);
const user = {
    name: `Test User ${randomId}`,
    email: `test${randomId}@example.com`,
    password: 'password123',
    role: 'job_seeker',
    country: 'TestLand'
};

async function testAuth() {
    console.log('--- Starting Auth Test ---');
    console.log(`Targeting: ${API_URL}`);
    console.log('Test User:', user);

    try {
        // 1. Register
        console.log('\n[1] Attempting Registration...');
        const regRes = await axios.post(`${API_URL}/register`, user);
        console.log('Registration Success:', regRes.status);
        console.log('Response Data:', regRes.data);

        // 2. Login
        console.log('\n[2] Attempting Login...');
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: user.email,
            password: user.password
        });
        console.log('Login Success:', loginRes.status);
        console.log('Response Data:', loginRes.data);

    } catch (error) {
        console.error('\n[!] Test Failed');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error('Data:', error.response.data);
        } else if (error.request) {
            console.error('No response received (Server might be down)');
        } else {
            console.error('Error:', error.message);
        }
    }
}

testAuth();
