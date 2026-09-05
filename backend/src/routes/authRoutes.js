const express = require('express');
const passport = require('passport');
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  getMe,
  generateToken,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

const router = express.Router();
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' })
);

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err || !user) {
      const code = info?.code || 'error';
      const message = info?.message || err?.message || 'Google sign-in failed. Please try again.';

      console.error('Google OAuth callback failure:', { code, message, err: err?.message || null, info });

      const params = new URLSearchParams({
        google: code,
        message,
      });
      return res.redirect(`${frontendUrl}/login?${params.toString()}`);
    }

    const token = generateToken(user._id);
    return res.redirect(`${frontendUrl}/auth/success?token=${encodeURIComponent(token)}`);
  })(req, res, next);
});

module.exports = router;