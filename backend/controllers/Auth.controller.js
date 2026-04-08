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
} = require('../services/Auth.services');

const {
  validateRequiredFields,
  validateEmail,
  sanitizeUserData
} = require('../utils/validation');

const MissingFieldError = require('../errors/MissingFieldError');
const GenericError = require('../errors/GenericError');
const ERROR_CODES = require('../errors/errorCodes');
const { COOKIE_MAX_AGE } = require('../utils/cookie.js');
const UnathorizeError = require('../errors/UnuthorizeError');


const signUp = async (req, res) => {
    if(!req.body) {
        throw new GenericError(400, 'Request body cannot be empty.', ERROR_CODES.MISSING_FIELD);
    }

    // check required fields
    const REQUIRED_FIELDS = [ 
        { field : 'firstName', label: 'First name'}, 
        { field : 'lastName', label: 'Last name'}, 
        { field : 'email', label: 'Email'},
        { field : 'password', label: 'Password'}
    ];
    const requiredFieldValidation = validateRequiredFields(REQUIRED_FIELDS, req.body);
    if (!requiredFieldValidation.isValid) {
        throw new MissingFieldError(requiredFieldValidation.message, requiredFieldValidation.errors);
    }

    const result = await registerUser(req.body);

    res.status(201).json({
        success: true,
        message: result.message,
        token: result.token,
        user: result.user
    });
}

const verifyEmail = async (req, res) => {
    if(!req.body) {
        throw new GenericError(400, 'Request body cannot be empty.', ERROR_CODES.MISSING_FIELD);
    }

    // checks the required OTP
    const REQUIRED_FIELDS = [ 
        { field : 'otp', label: 'OTP'}, 
    ];
    const requiredFieldValidation = validateRequiredFields(REQUIRED_FIELDS, req.body);
    if (!requiredFieldValidation.isValid) {
        throw new MissingFieldError(requiredFieldValidation.message, requiredFieldValidation.errors);
    }

    await verifyUserEmail(req.body.otp, req.token);

    res.status(200).json({
        success : true, 
        message: `Success! ${req.user.firstName}, your email is now verified. Start organizing your group tasks and boosting your productivity today.`,
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
     // checks the required email and password
    const REQUIRED_FIELDS = [ 
        { field : 'email', label: 'Email'}, 
        { field : 'password', label: 'Password'}, 
    ];
    const requiredFieldValidation = validateRequiredFields(REQUIRED_FIELDS, req.body);
    if (!requiredFieldValidation.isValid) {
        throw new MissingFieldError(requiredFieldValidation.message, requiredFieldValidation.errors);
    }

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
    const refreshToken = req.cookies.gtrt;

    if (!refreshToken) {
        throw new GenericError(400, 'No active session found.', ERROR_CODES.INVALID_SESSION)
    }

    res.clearCookie('gtrt');
    res.status(200).json({
        success: true, 
        message: `Signed out`
    });
}

const refresh = async (req, res) => {
    const refreshToken = req.cookies.gtrt;

    if(!refreshToken) {
        throw new GenericError(400, 'No active session found.', ERROR_CODES.INVALID_SESSION);
    }

    const result = await rotateRefreshToken(refreshToken);

    res.status(200).cookie('gtrt', result.refreshToken, {
        httpOnly: true,
        maxAge: COOKIE_MAX_AGE
    }).json({
        success: true, 
        message: 'You have recieved a new refresh token.', 
        user: result.user,
        accessToken: result.accessToken
    });
}



const requestResetPassword = async (req, res) => {
    if(!req.body) {
        throw new GenericError(400, 'Request body cannot be empty.', ERROR_CODES.MISSING_FIELD);
    }

    // checks the required email
    const REQUIRED_FIELDS = [ 
        { field : 'email', label: 'Email'}, 
    ];
    const requiredFieldValidation = validateRequiredFields(REQUIRED_FIELDS, req.body);
    if (!requiredFieldValidation.isValid) {
        throw new MissingFieldError(requiredFieldValidation.message, requiredFieldValidation.errors);
    }

    const result = await requestResetUserPassword(req.body);

    res.status(200).json({
        success: true, 
        message: result.message
    })
}

// const verifyTokenController = (req, res) => {
//   return res.status(200).json({
//     success: true,
//     message: 'Token is valid',
//     user: {
//         _id: req.user._id,
//         email: req.user.email
//     }
//   });
// };

// const resetPassword = async (req, res) => {
//     try {
//         const result = await resetUserPassword(req.user, req.token, req.body?.password);

//         res.status(200).json({
//             success: true, 
//             message: result.message
//         });
//     } catch (error) {
//         res.status(error.status || 500).json({
//             success: false, 
//             field: error.field || 'server',
//             message: error.message || 'Server Error'
//         });
//         console.log(error.message) // Should have an error handler
//     }
// }

module.exports = {
    signUp,
    verifyEmail,
    verifyEmailResend,
    signIn,
    signOut,
    refresh,
    requestResetPassword,
    // requestResetPassword,
    // verifyTokenController,
    // resetPassword
}