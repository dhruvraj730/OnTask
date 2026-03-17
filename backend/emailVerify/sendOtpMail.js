const nodemailer = require('nodemailer');
require('dotenv').config();

const sendOtpMail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: email,
        subject: 'Password Reset OTP',
        text: `Your OTP for password reset is: ${otp}. This OTP is valid for 10 minutes.`
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendOtpMail;