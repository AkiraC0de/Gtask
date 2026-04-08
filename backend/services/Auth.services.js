
const User = require('../models/User');
const SessionToken = require('../models/SessionToken');
const Otp = require('../models/Otp');

const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const crypto = require('crypto');

const {
  generateAccessToken,
  generateRefreshToken
} = require('../utils/tokenJWT');

const {
  generateSixDigitCode,
  generateCryptoToken,
} = require('../utils/utils');

const {
  validateRequiredFields,
  validateUserData,
  sanitizeUserData
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
  const userDataValidation = validateUserData(userData);
  if(!userDataValidation.isValid) {
    throw new ValidationError(userDataValidation.message, userDataValidation.errors);
  }

  const { firstName, lastName, middleName, email, password } = sanitizeUserData(userData);

  const existingUser = await User.findOne({email});
  if(existingUser){
    if(existingUser.isEmailVerified){
      throw new GenericError(400, "Email already registered.", ERROR_CODES.EMAIL_ALREADY_EXISTS);
    }

    await Promise.all([
      SessionToken.deleteMany({ user: existingUser._id, type: 'emailVerification' }),
      Otp.deleteMany({ user: existingUser._id, type: 'emailVerification' }),
      existingUser.deleteOne()
    ]);
  } 

  const user = await User.create({
    firstName, 
    lastName, 
    email, 
    password, 
  });
  
  const [newToken, newOtp] = await Promise.all([
    createSessionToken(user._id, 'emailVerification'),
    createOtp(user._id, 'emailVerification')
  ]);

  const emailHtml = generateCodeVerificationHTML(
    newOtp,
    firstName,
    lastName
  );

  await sendEmail(email, "Email Verification Code", emailHtml);

  return {
    message: `The account (${email}) required validation. We've sent an OTP via Email.`,
    token : newToken
  };
}

const createSessionToken = async (userId, type) => {
  const rawToken = generateCryptoToken();

  const hashedToken = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex');

  await SessionToken.create({
    user: userId,
    type,
    token: hashedToken
  });

  return rawToken;
}

const createOtp = async (userId, type) => {
  const rawOtp = generateSixDigitCode();

  const hashedOtp = crypto
    .createHash('sha256')
    .update(rawOtp)
    .digest('hex');

  await Otp.create({
    user: userId,
    type,
    otp: hashedOtp
  });

  return rawOtp;
} 

const validateOtp = async (userId, otp) => {
  const validOtp = await Otp.findOne({user : userId});

  if(!validOtp){
    throw new GenericError(401, "The OTP has expired. Please request for a new one.", ERROR_CODES.EXPIRED_OTP);
  }

  const isValid = await validOtp.compareOtp(otp)
  
  if(!isValid){
    throw new ValidationError('Invalid Input', [{ field: 'otp', message: 'Invalid code input.' }]);
  }
}

const deleteUserOtpByType = async (userId, type) => {
  await Otp.deleteMany({user : userId, type})
}

const deleteUserTokenByType = async (userId, type) => {
  await SessionToken.deleteMany({user : userId, type})
}

const verifyUserEmail = async (otp, token) => {
  await validateOtp(token.user, otp);

  await Promise.all([
    User.findByIdAndUpdate(token.user, { isEmailVerified: true }),
    deleteUserOtpByType(token.user, 'emailVerification'),
    token.deleteOne()
  ])
}

const signInUser = async (userData) => {
  const {email , password} = sanitizeUserData(userData);

  const user = await User.findOne({email}).select('+password');

  let isPasswordMatched = false;
  
  if (user) {
    isPasswordMatched = await user.comparePassword(password);
  } else {
    await bcryptjs.hash(password, 10); // Fake comparison to maintain constant time
  }

  if (!user || !isPasswordMatched) {
    throw new ValidationError('Invalid email or password.');
  }

  if (!user.isEmailVerified) {
    throw new ValidationError('Please verify your email address before signing in.');
  }

  return {
    user: user.toPublicJSON(),
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
}

const resendEmailVerification = async (token) => {
  // This checks if the previous Token was in the DB for more than the COOLDOWN time (1 min)
  if(!token.isAuthorizedForNewToken( )){
    throw new GenericError(429, 'Please wait a few moments before requesting a new one.', ERROR_CODES.PLEASE_WAIT)
  }

  // delete past token and OTP in the DB.
  await Promise.all([
    token.deleteOne(),
    deleteUserOtpByType(token.user, 'emailVerification')
  ]);

  const [newToken, newOtp] = await Promise.all([
    createSessionToken(token.user, 'emailVerification'),
    createOtp(token.user, 'emailVerification')
  ]);

  // send the new otp to user via email
  const emailHtml = generateResendCodeHTML(newOtp);
  await sendEmail(token.user.email, "New email Verification Code", emailHtml);

  return {
    token: newToken,
    message: `New Code has been sent to your email (${token.user.email})`
  }
}

const rotateRefreshToken = async (refreshToken) => {
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESHTOKEN, (err, decoded) => {
    if(err) {
      throw new GenericError(400, 'Invalid Refresh Token.', ERROR_CODES.INVALID_TOKEN)
    }

    return decoded;
  }); 
  
  const user = await User.findById(decoded._id);

  if (!user) {
      throw new UnathorizeError('Unauthorized.');
  }

  return {
      user: user.toPublicJSON(),
      accessToken: generateAccessToken(user),
      refreshToken: generateRefreshToken(user)
  };
}

const requestResetUserPassword = async (userData) => {
  const { email } = sanitizeUserData(userData);

  const userDataValidation = validateUserData({email});
  if(!userDataValidation.isValid) {
    throw new ValidationError(userDataValidation.message, userDataValidation.errors);
  }

  const user = await User.findOne({email});

  const prevToken = await SessionToken.findOne({user, type: 'resetPassword'});
  if(prevToken ){
    console.log(prevToken.isAuthorizedForNewToken())
    if(!prevToken.isAuthorizedForNewToken()){
      console.log('not')
      throw new GenericError(429, 'Please wait a few moments before requesting a new one.', ERROR_CODES.PLEASE_WAIT);
    } else{
      console.log('yes')
      await prevToken.deleteOne();
    }
  }

  const genericResponse = { 
    message: 'If the email is registered, the reset link has been sent.' 
  };

  if(!user){
    return genericResponse;
  }

  const token = createSessionToken(user._id, 'resetPassword');

  const resetPasswordURL = `${process.env.FRONTEND_ORIGIN_URL}/reset-password/${token}`
  const emailHtml = generateForgotPasswordEmailHTML(resetPasswordURL, user.firstName);

  await sendEmail(user.email, 'Reset Password Verification', emailHtml);

  return genericResponse;
}



// NEEDS REFACTORING 






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
  signInUser,
  verifyUserEmail,
  resendEmailVerification,
  rotateRefreshToken,

  resetUserPassword,
  requestResetUserPassword,
  deleteUserTokenByType
}