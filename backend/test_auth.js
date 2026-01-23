const axios = require('axios');

const testAuth = async () => {
    const testUser = {
        name: "Test User",
        email: `test${Date.now()}@example.com`,
        password: "password123",
        role: "job_seeker",
        country: "Testland"
    };

    console.log("1. Testing Registration...");
    try {
        const regRes = await axios.post('http://localhost:5000/api/auth/register', testUser);
        console.log("✅ Registration Success:", regRes.status, regRes.data._id);

        console.log("2. Testing Login...");
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: testUser.email,
            password: testUser.password
        });
        console.log("✅ Login Success:", loginRes.status, "Token received");

    } catch (error) {
        console.error("❌ Auth Test Failed:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        } else {
            console.error(error.message);
        }
    }
};

testAuth();
