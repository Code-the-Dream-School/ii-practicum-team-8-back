const nodemailer = require("nodemailer");

class EmailError extends Error {
  constructor(message, type, details = null) {
    super(message);
    this.name = 'EmailError';
    this.type = type;
    this.details = details;
  }
}

/**
 * Validates email configuration and input parameters
 * @throws {EmailError} If configuration or parameters are invalid
 */
const validateEmailConfig = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new EmailError(
      'Email configuration is missing',
      'CONFIG_ERROR',
      'EMAIL_USER and EMAIL_PASS environment variables are required'
    );
  }
};

/**
 * Validates email parameters
 * @throws {EmailError} If parameters are invalid
 */
const validateEmailParams = (to, subject, html) => {
  if (!to) {
    throw new EmailError(
      'Recipient email is required',
      'VALIDATION_ERROR',
      'The "to" parameter cannot be empty'
    );
  }

  if (typeof to !== 'string' || !to.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    throw new EmailError(
      'Invalid recipient email format',
      'VALIDATION_ERROR',
      'The "to" parameter must be a valid email address'
    );
  }

  if (!subject) {
    throw new EmailError(
      'Email subject is required',
      'VALIDATION_ERROR',
      'The "subject" parameter cannot be empty'
    );
  }

  if (!html) {
    throw new EmailError(
      'Email content is required',
      'VALIDATION_ERROR',
      'The "html" parameter cannot be empty'
    );
  }
};

/**
 * Creates and verifies an email transporter
 * @throws {EmailError} If transporter creation or verification fails
 */
const createTransporter = async () => {
  try {
    const transporter = nodemailer.createTransport({
     service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER, // gmail address
        pass: process.env.EMAIL_PASS // gmail app password
      }
    });

    console.log("transporter created")
    // Verify transporter configuration
    await transporter.verify();
    return transporter;
  } catch (error) {
    console.log("transporter error")
    throw new EmailError(
      'Failed to create email transporter',
      'TRANSPORT_ERROR',
      error.message
    );
  }
};

/**
 * Sends an email using the provided parameters
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - Email content in HTML format
 * @returns {Promise<Object>} Object containing messageId and previewUrl
 * @throws {EmailError} If email sending fails
 */
const sendEmail = async (to, subject, html) => {
  try {
    // Validate configuration and parameters
    validateEmailConfig();
    validateEmailParams(to, subject, html);

    // Create and verify transporter
    const transporter = await createTransporter();

    // Attempt to send email
    const info = await transporter.sendMail({
      from: 'stephya166@gmail.com', // Using Gmail email address
      to,
      subject,
      html,
    });

    return {
      success: true,
      messageId: info.messageId
    };

  } catch (error) {
    console.log("Email sending failed")
    // Handle known EmailError instances
    if (error instanceof EmailError) {
      throw error;
    }

    // Handle unknown errors
    throw new EmailError(
      'Failed to send email',
      'SEND_ERROR',
      error.message
    );
  }
};

module.exports = sendEmail;

