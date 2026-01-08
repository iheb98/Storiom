// mailService.js
require('dotenv').config();
const Brevo = require('@getbrevo/brevo');

// Initialize API client correctly
const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

/**
 * Sends an email using Brevo Transactional API
 * @param {string|string[]} to
 * @param {string} subject
 * @param {string} html
 * @param {object} options
 */
async function sendMail(to, subject, html, options = {}) {
  try {
    const recipients = Array.isArray(to)
      ? to.map(email => ({ email }))
      : [{ email: to }];

    await apiInstance.sendTransacEmail({
      sender: {
        email: process.env.EMAIL_FROM_ADDRESS,
        name: process.env.EMAIL_FROM_NAME,
      },
      to: recipients,
      subject,
      htmlContent: html,
      ...options
    });

    console.log('📧 Email sent via Brevo API');
  } catch (error) {
    console.error('❌ Brevo API email failed:', error.response?.body || error);
    throw error;
  }
}

module.exports = sendMail;
