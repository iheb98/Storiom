// mailService.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
    user: 'noreply@storiom.com',
    pass: 'Storiom-9897'
  }
});

/**
 * Sends an email.
 * @param {string} to - Recipient's email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of the email
 */
async function sendMail(to, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: 'noreply@storiom.com',
      to,
      subject,
      html
    });

    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

module.exports = sendMail;
