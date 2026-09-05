// utils/email.js
const nodemailer = require('nodemailer');

const isDev = process.env.NODE_ENV === 'development';
const senderAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;
const hasSmtpConfig = !!(process.env.SMTP_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS);

const transporter = isDev || !hasSmtpConfig ? null : nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an OTP for email verification.
 */
exports.sendVerificationOTP = async (user, otp) => {
  const message = `
    <h1>Email Verification</h1>
    <p>Your verification code is:</p>
    <h2 style="font-size: 32px; letter-spacing: 4px;">${otp}</h2>
    <p>This code will expire in 10 minutes.</p>
    <p>If you did not request this, please ignore this email.</p>
  `;

  if (isDev) {
    console.log('📧 VERIFICATION OTP (development):');
    console.log(`To: ${user.email}`);
    console.log(`OTP: ${otp}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: senderAddress,
      to: user.email,
      subject: 'Email Verification OTP',
      html: message,
    });
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

/**
 * Send a welcome email after verification.
 */
exports.sendWelcomeEmail = async (user) => {
  const message = `
    <h1>Welcome to Peep Online Marketplace</h1>
    <p>Hi ${user.name},</p>
    <p>Your account is now active. Welcome aboard!</p>
    <p>We are excited to have you on our platform and can’t wait to help you find the right tech for your needs.</p>
  `;

  if (isDev) {
    console.log('🎉 WELCOME EMAIL (development):');
    console.log(`To: ${user.email}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: senderAddress,
      to: user.email,
      subject: 'Welcome to Peep Online Marketplace!',
      html: message,
    });
  } catch (error) {
    console.error('Welcome email error:', error);
    throw error;
  }
};

/**
 * Send a password reset OTP.
 */
exports.sendResetOTP = async (user, otp) => {
  const message = `
    <h1>Password Reset</h1>
    <p>Your password reset code is:</p>
    <h2 style="font-size: 32px; letter-spacing: 4px;">${otp}</h2>
    <p>This code will expire in 10 minutes.</p>
    <p>If you did not request this, please ignore this email.</p>
  `;

  if (isDev) {
    console.log('🔑 PASSWORD RESET OTP (development):');
    console.log(`To: ${user.email}`);
    console.log(`OTP: ${otp}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: senderAddress,
      to: user.email,
      subject: 'Password Reset OTP',
      html: message,
    });
  } catch (error) {
    console.error('Reset OTP email error:', error);
    throw error;
  }
};

/**
 * Send a profile update confirmation email.
 */
exports.sendProfileUpdatedEmail = async (user) => {
  const message = `
    <h1>Profile Updated</h1>
    <p>Hi ${user.name},</p>
    <p>Your profile information was updated successfully.</p>
    <p>If you did not make this change, please contact support immediately.</p>
  `;

  if (isDev || !transporter) {
    console.log('📬 PROFILE UPDATE EMAIL (development):');
    console.log(`To: ${user.email}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: senderAddress,
      to: user.email,
      subject: 'Your profile was updated',
      html: message,
    });
  } catch (error) {
    console.error('Profile update email error:', error);
    throw error;
  }
};

exports.sendAbandonedCartEmail = async (user, cart, subject, customMessage) => {
  const itemList = (cart.items || [])
    .map((item) => {
      const productName = item.product?.name || 'Item';
      const quantity = item.quantity || 1;
      return `<li><strong>${productName}</strong> &nbsp; x${quantity}</li>`;
    })
    .join('');

  const emailSubject = subject || 'You left items in your cart';
  const emailBody = customMessage || `
    <p>Hi ${user.name || 'there'},</p>
    <p>We noticed you left a few items in your cart and wanted to make sure you did not forget about them.</p>
    <ul>${itemList}</ul>
    <p>You can return to your cart anytime to finish checkout.</p>
    <p>Thanks for shopping with Peep Online Marketplace.</p>
  `;

  const message = `
    <h1>${emailSubject}</h1>
    <p>Hi ${user.name || 'there'},</p>
    <p>We noticed you left a few items in your cart and wanted to make sure you did not forget about them.</p>
    <ul>${itemList || '<li>Your cart is waiting for you.</li>'}</ul>
    <p>${emailBody.replace(/<[^>]+>/g, '').trim() || 'You can return to your cart anytime to finish checkout.'}</p>
    <p>Thanks for shopping with Peep Online Marketplace.</p>
    <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/cart">View my cart</a></p>
  `;

  if (isDev) {
    console.log('📬 ABANDONED CART EMAIL (development):');
    console.log(`To: ${user.email}`);
    console.log(`Subject: ${emailSubject}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: senderAddress,
      to: user.email,
      subject: emailSubject,
      html: message,
    });
  } catch (error) {
    console.error('Abandoned cart email error:', error);
    throw error;
  }
};