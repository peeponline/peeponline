const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const Cart = require('../models/Cart');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value?.trim().toLowerCase();
        const name = profile.displayName || profile.name?.givenName || 'Google User';

        if (!email) {
          return done(new Error('Google account did not return an email address.'), null);
        }

        let user = await User.findOne({ email }).select('+password');

        if (!user) {
          user = await User.create({
            name,
            email,
            password: Math.random().toString(36).slice(-8),
            isVerified: true,
            googleId,
          });

          try {
            await Cart.create({ user: user._id, items: [] });
          } catch (cartError) {
            if (cartError.code !== 11000) {
              console.error('Google OAuth cart creation error:', cartError.message);
            }
          }

          return done(null, user);
        }

        if (user.googleId && user.googleId !== googleId) {
          return done(null, false, {
            code: 'google-account',
            message: 'This account was created with Google. Please sign in with Google.',
          });
        }

        if (!user.googleId && user.password) {
          return done(null, false, {
            code: 'email-account',
            message: 'An account with this email already exists. Please sign in with your email and password.',
          });
        }

        user.googleId = googleId;
        if (!user.isVerified) {
          user.isVerified = true;
        }
        await user.save({ validateBeforeSave: false });

        return done(null, user);
      } catch (error) {
        console.error('Google OAuth profile error:', error.message);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;