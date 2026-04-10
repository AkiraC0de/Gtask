const { 
    generateAccessToken, 
    generateRefreshToken 
} = require('../utils/tokenJWT');

const {
    registerUser, 
    signInUser, 
    verifyUserEmail, 
    resendEmailVerification,
    resetUserPassword,
    requestResetUserPassword,
    rotateRefreshToken,
    deleteUserSessionTokenByType,
} = require('../services/Auth.services');

const {
  validateRequiredFields,
  checkRequestBody,
  sanitizeUserData
} = require('../utils/validation');

const {
  VERIFY_USER_EMAIL_REQUIRED_FIELDS,
  SIGNIN_REQUIRED_FIELDS,
  REGISTER_USER_REQUIRED_FIELDS,
  REQUEST_RESET_PASSWORD_REQUIRED_FIELDS,
  RESET_PASSWORD_REQUIRED_FIELDS
} = require('../constants/requiredFields')

const MissingFieldError = require('../errors/MissingFieldError');
const GenericError = require('../errors/GenericError');
const ERROR_CODES = require('../constants/errorCodes.js');
const { COOKIE_MAX_AGE } = require('../constants/cookie.js');
const Unauthorized = require('../errors/UnuthorizeError');


const signUp = async (req, res) => {
    checkRequestBody(req.body);
    validateRequiredFields(REGISTER_USER_REQUIRED_FIELDS, req.body);
    const result = await registerUser(req.body);

    res.status(201).json({
        success: true,
        message: result.message,
        token: result.token,
        user: result.user
    });
}

const verifyEmail = async (req, res) => {
    checkRequestBody(req.body);
    validateRequiredFields(VERIFY_USER_EMAIL_REQUIRED_FIELDS, req.body);
    await verifyUserEmail(req.body.otp, req.token);

    res.status(200).json({
        success : true, 
        message: `Email verified successfully`,
        user : {email : req.user.email}
    })
}

const verifyEmailResend = async (req, res) => {
    const result = await resendEmailVerification(req.token);

    res.status(200).json({
        message: result.message,
        token: result.token
    })
}

const signIn = async (req, res) => {
    checkRequestBody(req.body);
    validateRequiredFields(SIGNIN_REQUIRED_FIELDS, req.body);
    const result = await signInUser(req.body);
    
    res.status(200).cookie('gtrt', result.refreshToken, { 
        httpOnly: true,
        maxAge: COOKIE_MAX_AGE 
    }).json({
        success: true, 
        message: 'Success Login', 
        user: result.user,
        accessToken: result.accessToken
    });
}

const signOut = async (req, res) => {
    res.clearCookie('gtrt');
    res.status(200).json({
        success: true, 
        message: `Signed out`
    });
}

const refresh = async (req, res) => {
    const result = await rotateRefreshToken(req.user._id);

    res.status(200).cookie('gtrt', result.refreshToken, {
        httpOnly: true,
        maxAge: COOKIE_MAX_AGE
    }).json({
        success: true, 
        message: 'You have received a new refresh token.', 
        user: result.user,
        accessToken: result.accessToken
    });
}

const requestResetPassword = async (req, res) => {
    checkRequestBody(req.body);    
    validateRequiredFields(REQUEST_RESET_PASSWORD_REQUIRED_FIELDS, req.body);
    const result = await requestResetUserPassword(req.body);

    res.status(200).json({
        success: true, 
        message: result.message
    })
}

const resetPassword = async (req, res) => {
    checkRequestBody(req.body);
    validateRequiredFields(RESET_PASSWORD_REQUIRED_FIELDS, req.body);
    const result = await resetUserPassword(req.user, req.body.password);

    res.status(200).json({
        success: true, 
        message: result.message
    });
}

const verifiedSessionToken = (req, res) => {
    if(!req.token) {
        throw new Unauthorized('Token has Expired or is Invalid.', ERROR_CODES.INVALID_TOKEN);
    }

    res.status(200).json({
        success: true,
        message: 'Your token is valid.'
    })
}


module.exports = {
    signUp,
    verifyEmail,
    verifyEmailResend,
    signIn,
    signOut,
    refresh,
    requestResetPassword,
    resetPassword,
    verifiedSessionToken,
}