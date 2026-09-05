const User = require('../models/User');
const Cart = require('../models/Cart');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

exports.generateToken = generateToken;

// @desc    Register user
// controllers/authController.js
const { sendVerificationOTP, sendResetOTP, sendWelcomeEmail } = require('../utils/email');

// Helper to generate a 6‑digit numeric OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const otp = generateOTP();
    const otpExpire = Date.now() + 10 * 60 * 2000; // 10 minutes

    const user = await User.create({
      name,
      email,
      password,
      phone,
      address,
      isVerified: false,
      verificationOTP: otp,
      verificationOTPExpire: otpExpire,
    });

    await Cart.create({ user: user._id, items: [] });

    // Send OTP email (fire and forget)
    try {
      await sendVerificationOTP(user, otp);
    } catch (err) {
      console.error('OTP email error:', err);
      // still return success, but log the error
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for the OTP to verify your account.',
      opt: otp, // For testing purposes; remove in production
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify email using OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    // Check OTP and expiry
    const normalizedOTP = normalizeOTP(otp);
    if (user.verificationOTP !== normalizedOTP) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (Date.now() > user.verificationOTPExpire) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // Mark as verified
    user.isVerified = true;
    user.verificationOTP = undefined;
    user.verificationOTPExpire = undefined;
    await user.save();

    // Send welcome email only after OTP verification succeeds
    try {
      await sendWelcomeEmail(user);
    } catch (emailError) {
      console.error('Welcome email error:', emailError);
    }

    // Generate JWT and log them in automatically (optional)
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, otp: req.body.otp }); // For testing purposes; remove in production
  }
};

// @desc    Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const emailAddress = req.body.email?.trim().toLowerCase();
    const user = await User.findOne({ email: emailAddress });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    const newOTP = generateOTP();
    user.verificationOTP = newOTP;
    user.verificationOTPExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    try {
      await sendVerificationOTP(user, newOTP);
    } catch (err) {
      console.error('Resend OTP error:', err);
    }

    res.status(200).json({ success: true, message: 'New OTP sent to your email.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with that email. Please create an account or check your details.'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please try again.'
      });
    }

    // Add this check:
    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your email first.' });
    }

    const token = generateToken(user._id);
    res.status(200).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper: generate 6‑digit OTP (same as registration)
const generateResetOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper: normalize OTP input to string
const normalizeOTP = (otp) => {
  if (otp === undefined || otp === null) return '';
  return String(otp).trim();
};

// @desc    Request password reset OTP
exports.forgotPassword = async (req, res) => {
  try {
    const emailAddress = req.body.email?.trim().toLowerCase();
    const user = await User.findOne({ email: emailAddress });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate OTP and expiry (10 minutes)
    const otp = generateResetOTP();
    const otpExpire = Date.now() + 10 * 60 * 1000;

    // Save to user
    user.resetOTP = otp;
    user.resetOTPExpire = otpExpire;
    await user.save({ validateBeforeSave: false });

    // Send OTP email
    try {
      await sendResetOTP(user, otp);
    } catch (err) {
      // Clear OTP if email fails
      user.resetOTP = undefined;
      user.resetOTPExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }

    res.status(200).json({
      success: true,
      message: 'Reset OTP sent to your email',
      ...(process.env.NODE_ENV === 'development' ? { otp } : {}),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify OTP and reset password
exports.resetPassword = async (req, res) => {
  try {
    const { otp, newPassword, confirmPassword } = req.body;
    const emailAddress = req.body.email?.trim().toLowerCase();
    const normalizedOTP = normalizeOTP(otp);

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    // Find user by email and valid OTP
    const user = await User.findOne({
      email: emailAddress,
      resetOTP: normalizedOTP,
      resetOTPExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' }); // For testing purposes; remove in production
    }

    // Update password and clear OTP fields
    user.password = newPassword;
    user.resetOTP = undefined;
    user.resetOTPExpire = undefined;
    await user.save();

    // Optionally generate a new JWT and log the user in
    // const token = generateToken(user._id);
    // res.status(200).json({ success: true, message: 'Password updated', token });

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


