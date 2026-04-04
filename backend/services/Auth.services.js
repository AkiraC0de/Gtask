
const User = require('../models/User');
const Token = require('../models/Token');
const bcryptjs = require('bcryptjs');
const crypto = require('crypto');

const {
  generateAccessToken,
  generateRefreshToken
} = require('../utils/tokenJWT');

const {
  generateSixDigitCode,
  isAuthorizedForNewToken,
  generateCryptoToken,
} = require('../utils/utils');

const {
  validateRequiredFields,
  validateUserData
} = require('../utils/validation');

const {
  generateCodeVerificationHTML,
  generateResendCodeHTML,
  generateForgotPasswordEmailHTML
} = require('../utils/emailHtml');

const GenericError = require('../errors/GenericError');
const MissingFieldError = require('../errors/MissingFieldError');

const { sendEmail } = require('../utils/mailer');
const ERROR_CODES = require('../errors/errorCodes');
const ValidationError = require('../errors/ValidationError');

const registerUser = async (userData) => {
  // check required fields
  const REQUIRED_FIELDS = [ 
      { field : "firstName", code : ERROR_CODES.MISSING_FIRSTNAME }, 
      { field : "lastName", code : ERROR_CODES.MISSING_LASTNAME }, 
      { field : "email", code : ERROR_CODES.MISSING_EMAIL },
      { field : "password", code : ERROR_CODES.MISSING_PASSWORD }
  ];
  const requiredFieldValidation = validateRequiredFields(REQUIRED_FIELDS, userData);

  if (!requiredFieldValidation.isValid) {
    throw new MissingFieldError(requiredFieldValidation.message, requiredFieldValidation.errors);
  }

  const userDataValidation = validateUserData(userData);
  if(!userDataValidation.isValid) {
    console.log(userDataValidation);
    throw new ValidationError(userDataValidation.message, userDataValidation.errors);
  }

  const { firstName, lastName, middleName, email, password } = userData;

  const existingUser = await User.findOne({email});

  if(existingUser?.isEmailVerified){
    throw new GenericError(400, "Email already registered", ERROR_CODES.EMAIL_ALREADY_EXISTS);
  }

  // // NEEDS REFACTORING
  // if (existingUser && !existingUser.isVerified) {
  //   await Promise.all([
  //     Token.deleteOne({ user: existingUser._id }),
  //     existingUser.deleteOne()
  //   ]);
  // }

  // const user = await User.create({
  //   firstName, 
  //   lastName, 
  //   email, 
  //   password, 
  // });

  // const otp = generateSixDigitCode();
  // const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

  // const rawToken = generateCryptoToken();
  // const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  // await Token.create({
  //     user: user._id,
  //     token: hashedToken,
  //     otp: hashedOtp,
  //     type: 'email_verify'
  // });

  // const emailHtml = generateCodeVerificationHTML(
  //   otp,
  //   firstName,
  //   lastName
  // );

  // await sendEmail(email, "Email Verification Code", emailHtml);

  return {
      message: `The account (${email}) have successfully registered`,
      token : 'test',
      user: {
          email: "user.email"
      }
  };
}


const loginUser = async ({ email, password }) => {
  if (!email.trim() || !password.trim()) {
    throw { status: 400, message: 'Missing data' };
  }

  const user = await User.findOne({email}).select('+password');
  const isPasswordMatched = await user.comparePassword(password);

  if(!user || !user.isVerified) {
    throw { status: 401, field: 'email', message: 'Email is not registered' };
  }

  if(!isPasswordMatched){
    throw { status: 401, field: 'password', message: 'Incorrect Password' };
  }

  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    }
  };
}


const verifyUserEmail = async (user, otp, token) => {
  if (!token || !otp.trim() || !user) {
    throw { status: 400, message: 'Missing data' };
  }

  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
  
  if(token.otp !== hashedOtp){
    throw { status: 400, field: 'otp', message: 'Incorrect Code' };
  }

  await Promise.all([
    User.findByIdAndUpdate(user._id, { isVerified: true }),
    token.deleteOne()
  ])
}


const verifyUserEmailResend = async (user, token) => {
  if (!token || !user) {
    throw { status: 400, message: 'Missing data' };
  }

  // This checks if the previous Token was in the DB for more than the COOLDOWN time (2 mins)
  if(!isAuthorizedForNewToken(token.createdAt)){
    throw { status: 400, message: 'Please wait a few moments before requesting a new token' };
  }

  await token.deleteOne();

  const newOtp = generateSixDigitCode();
  const hashedOtp = crypto.createHash('sha256').update(newOtp).digest('hex');

  const newToken = generateCryptoToken();
  const hashedToken = crypto.createHash('sha256').update(newToken).digest('hex');

  await Token.create({
    user: user._id,
    token: hashedToken,                     
    otp: hashedOtp
  });

  const emailHtml = generateResendCodeHTML(newOtp);

  await sendEmail(user.email, "New email Verification Code", emailHtml);

  return {
    token: newToken,
    message: `New Code has been sent to your email (${user.email})`
  }
}


const requestResetUserPassword = async (email) => {
  if(!email.trim()){
    throw { status: 400, message: 'Missing data' };
  }

  const user = await User.findOne({email});
  if(!user){
    return { message: 'If the email is registered, the reset link has been sent.' };
  }

  const token = generateCryptoToken();
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  await Token.create({
      user,
      token : hashedToken,
      type: 'password_reset'
  });

  const resetPasswordURL = `${process.env.FRONTEND_ORIGIN_URL}/reset-password/${token}`
  const emailHtml = generateForgotPasswordEmailHTML(resetPasswordURL, user.firstName);

  await sendEmail(user.email, 'Reset Password Verification', emailHtml);

  return {
    message: 'If the email is registered, the reset link has been sent.'
  }
}


const resetUserPassword = async (user, token, newPassword) => {
  if (!token.trim() || !user.trim() || !newPassword.trim()) {
    throw { status: 400, message: 'Missing data' };
  }

  const userData = await User.findById(user._id);

  if(!userData){
    throw { status: 400, message: 'Cannot find the user' };
  }

  userData.password = newPassword; 

  await Promise.all([
      userData.save(),
      token.deleteOne()
  ]);

  return {
    message: `New password has been set to your account`
  }
}

module.exports = {
  registerUser,
  loginUser,
  verifyUserEmail,
  verifyUserEmailResend,
  resetUserPassword,
  requestResetUserPassword
}