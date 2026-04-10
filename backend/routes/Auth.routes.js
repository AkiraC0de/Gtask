const express = require('express');

const authRoute = express.Router();

const { 
  signUp, 
  signIn, 
  signOut, 
  refresh, 
  verifyEmail, 
  verifyEmailResend, 
  requestResetPassword,
  verifiedSessionToken,
  resetPassword
} = require('../controllers/Auth.controller')
const verifyAuth = require('../middlewares/verifyAuth');
const verifySessionToken = require('../middlewares/verifySessionToken');
const verifyRefreshToken = require('../middlewares/verifyRefreshToken')
const errorHandler = require('../middlewares/errorHandler')

// Sign Up Route
authRoute.post('/sign-up', signUp);

// Email Verification (OTP via email) Route
authRoute.post('/verify-email', verifySessionToken, verifyEmail);

// // Email Verificaton Resend (OTP) Route
authRoute.get('/verify-email-resend', verifySessionToken, verifyEmailResend);

// Sign In Route
authRoute.post('/sign-in', signIn);

// Sign out Route
authRoute.get('/sign-out', verifyRefreshToken, signOut);

// Refresh Route
authRoute.get('/refresh', verifyRefreshToken, refresh);

// request reset password Route 
authRoute.post('/request-reset-password', requestResetPassword);

// request reset password Route
authRoute.post('/reset-password', verifySessionToken, resetPassword);

// Verify the users Token Route
authRoute.get('/verify-session-token', verifySessionToken, verifiedSessionToken);

// Middleware error handler
authRoute.use(errorHandler);

module.exports = authRoute;