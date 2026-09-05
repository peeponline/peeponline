const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { sendProfileUpdatedEmail, sendWelcomeEmail } = require('../utils/email');

// @desc    Update logged-in user's profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name !== undefined && name !== null && String(name).trim() === '') {
      return res.status(400).json({ success: false, message: 'Please fill in your full name before saving.' });
    }

    if (email !== undefined && email !== null && String(email).trim() === '') {
      return res.status(400).json({ success: false, message: 'Please fill in your email before saving.' });
    }

    if (phone !== undefined && phone !== null && String(phone).trim() === '') {
      return res.status(400).json({ success: false, message: 'Please fill in your phone number before saving.' });
    }

    if (address && typeof address === 'object') {
      const addressFields = Object.entries(address);
      const emptyAddressField = addressFields.find(([, value]) => value !== undefined && value !== null && String(value).trim() === '');
      if (emptyAddressField) {
        return res.status(400).json({ success: false, message: 'Please fill in all address details before saving.' });
      }
    }

    if (name !== undefined && name !== null && String(name).trim()) {
      user.name = String(name).trim();
    }

    if (email !== undefined && email !== null && String(email).trim()) {
      const normalizedEmail = String(email).trim().toLowerCase();
      const emailExists = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }
      user.email = normalizedEmail;
    }

    if (phone !== undefined && phone !== null && phone !== '') {
      user.phone = String(phone).trim();
    }

    if (address && typeof address === 'object') {
      user.address = { ...(user.address || {}), ...address };
    }

    const isGoogleProfileCompletion = !!user.googleId && !user.welcomeEmailSent && user.phone && user.address && user.address.street && user.address.city && user.address.state && user.address.country && user.address.zipCode;

    await user.save();

    if (isGoogleProfileCompletion) {
      try {
        user.welcomeEmailSent = true;
        await user.save();
        await sendWelcomeEmail(user);
      } catch (emailError) {
        console.error('Google welcome email failed:', emailError);
      }
    }

    try {
      await sendProfileUpdatedEmail(user);
    } catch (emailError) {
      console.error('Profile update notification failed:', emailError);
    }

    res.status(200).json({ success: true, message: 'Profile updated successfully', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete own account (optional)
exports.deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.status(200).json({ success: true, message: 'Account deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};