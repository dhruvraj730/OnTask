const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER?.trim() || process.env.SMTP_EMAIL?.trim(),
    pass: process.env.SMTP_PASS?.trim()
  }
});

/**
 * Send an email notification
 * @param {string} toEmail - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} htmlBody - The HTML body content of the email
 */
const sendEmailNotification = async (toEmail, subject, htmlBody) => {
  if (!toEmail || (!process.env.SMTP_USER && !process.env.SMTP_EMAIL)) {
    console.warn('Skipping email notification: Missing email or SMTP configuration');
    return;
  }

  const senderEmail = process.env.SMTP_EMAIL?.trim() || process.env.SMTP_USER?.trim();

  const mailOptions = {
    from: `"OnTask" <${senderEmail}>`,
    to: toEmail,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #4CAF50; margin: 0;">OnTask</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #fcfcfc;">
          ${htmlBody}
        </div>
        <div style="font-size: 12px; color: #888; margin-top: 30px; text-align: center;">
          <p>This is an automated message from OnTask.</p>
          <p>Please do not reply to this email.</p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email notification:', error.message);
    // Don't throw so it doesn't crash the request
  }
};

module.exports = {
  sendEmailNotification
};
