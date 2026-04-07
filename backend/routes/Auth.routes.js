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
  verifyTokenController,
  resetPassword
} = require('../controllers/Auth.controller')
const verifyAuth = require('../middlewares/verifyAuth');
const verifyToken = require('../middlewares/verifyToken');
const errorHandler = require('../middlewares/errorHandler')

// Sign Up Route
authRoute.post('/sign-up', signUp);

// Email Verification (OTP via email) Route
authRoute.post('/verify-email', verifyToken, verifyEmail);

// // Email Verificaton Resend (OTP) Route
authRoute.get('/verify-email-resend', verifyToken, verifyEmailResend);

// Sign In Route
authRoute.post('/sign-in', signIn);

// Sign out Route
authRoute.get('/sign-out', signOut);

// Refresh Route
authRoute.get('/refresh', refresh);

// // Verify the users Token Route
// authRoute.get('/verify-token', verifyToken, verifyTokenController);



// // request reset password Route 
// authRoute.post('/request-reset-password', requestResetPassword);

// // request reset password Route
// authRoute.post('/reset-password', verifyToken, resetPassword);

authRoute.use(errorHandler);

module.exports = authRoute;