const express = require('express');

const authRoute = express.Router();

const { 
  signUp, 
  logIn, 
  logout, 
  refresh, 
  verifyEmail, 
  verifyEmailResend, 
  requestResetPassword,
  verifyTokenController,
  resetPassword
} = require('../controllers/Auth.controller')
const verifyAuth = require('../middlewares/verifyAuth');
const verifyToken = require('../middlewares/verifyToken');

// Sign Up Route
authRoute.post('/signUp', signUp);

// // Log In Route
// authRoute.post('/login', logIn);

// // Log out Route
// authRoute.post('/logout', logout);

// // Log out Route
// authRoute.get('/refresh', refresh);

// // Verify the users Token Route
// authRoute.get('/verify-token', verifyToken, verifyTokenController);

// // Email Verification Route
// authRoute.post('/verify-email', verifyToken, verifyEmail);

// // Email Verificaton Resend Code Route
// authRoute.get('/verify-email-resend', verifyToken, verifyEmailResend);

// // request reset password Route
// authRoute.post('/request-reset-password', requestResetPassword);

// // request reset password Route
// authRoute.post('/reset-password', verifyToken, resetPassword);

module.exports = authRoute;