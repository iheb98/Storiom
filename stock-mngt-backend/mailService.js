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
 * @param {object} options - Optional settings (cc, bcc, etc.)
 */
async function sendMail(to, subject, html, options = {}) {
  try {
    const mailOptions = {
      from: 'noreply@storiom.com',
      to,
      subject,
      html
    };

    // Add CC if provided
    if (options.cc) {
      mailOptions.cc = options.cc;
    }

    // Add BCC if provided
    if (options.bcc) {
      mailOptions.bcc = options.bcc;
    }

    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

module.exports = sendMail;
