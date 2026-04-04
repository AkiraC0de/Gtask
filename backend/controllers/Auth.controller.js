const User = require('../models/User');
const jwt = require('jsonwebtoken');

const { 
    generateAccessToken, 
    generateRefreshToken 
} = require('../utils/tokenJWT');

const {
    registerUser, 
    loginUser, 
    verifyUserEmail, 
    verifyUserEmailResend,
    resetUserPassword,
    requestResetUserPassword,
} = require('../services/Auth.services');

const {
  validateRequiredFields,
  validateEmail
} = require('../utils/validation');

const MissingFieldError = require('../errors/MissingFieldError');
const GenericError = require('../errors/GenericError');
const ERROR_CODES = require('../errors/errorCodes');


const signUp = async (req, res, next) => {
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
    const requiredFieldValidation = validateRequiredFields(REQUIRED_FIELDS, userData);
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
    const requiredFieldValidation = validateRequiredFields(REQUIRED_FIELDS, userData);
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

// const logIn = async (req, res) => {
//     try {
//         const result = await loginUser(req.body)
        
//         res.status(200).cookie('gtask', result.refreshToken, { 
//             httpOnly: true,
//             maxAge: 15 * 24 * 60 * 60 * 1000 // 15 days
//         }).json({
//             success: true, 
//             message: 'Success Login', 
//             user: result.user,
//             token: result.accessToken
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

// const logout = async (req, res) => {
//     try {
//         res.clearCookie('gtask');
//         res.status(200).json({success: true, message: `Logout`});
//     } catch (error) {
//         res.status(500).json({success: false, message: `Server Error`});
//         console.log(error.message) // Should have an error handler
//     }
// }

// const refresh = (req, res) => {
//     const cookie = req.cookies.gtask;
//     if(!cookie) return res.status(401).json({success: false, message: 'Unathorized'}); 

//     jwt.verify(cookie, process.env.JWT_ACCESSTOKEN, async (err, decoded) => {
//         if(err) return res.status(401).json({success: false, message: 'Unathorized'});
        
//         const user = await User.findById(decoded._id);
//         if(!user) return res.status(401).json({success: false, message: 'Unathorized'});

//         res.status(200).cookie('gtask', generateRefreshToken(user), {
//             httpOnly: true,
//             maxAge: 30 * 24 * 60 * 60 * 1000 // 15 days
//         }).json({
//             success: true, 
//             message: 'Success Login', 
//             data: {
//                 name: user.name,
//                 email: user.email,
//                 profileImage: user.profileImage
//             },
//             token: generateAccessToken(user)
//         });
//     });
// }



// const verifyEmailResend = async (req, res) => {
//     try {
//         const result = await verifyUserEmailResend(req.user, req.token);

//         res.status(200).json({
//             message: result.message,
//             token: result.token
//         })
//     } catch (error) {
//         res.status(error.status || 500).json({
//             success: false, 
//             field: error.field || 'server',
//             message: error.message || 'Server Error'
//         });
//         console.log(error.message) // Should have an error handler
//     }
// }

// const requestResetPassword = async (req, res) => {
//     try {
//         const result = await requestResetUserPassword(req.body?.email);

//         res.status(200).json({
//             success: true, 
//             message: result.message
//         })
//     } catch (error) {
//         res.status(error.status || 500).json({
//             success: false, 
//             field: error.field || 'server',
//             message: error.message || 'Server Error'
//         });
//         console.log(error.message) // Should have an error handler
//     }
// }

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
    // logIn,
    // logout,
    // refresh,
    // verifyEmail,
    // verifyEmailResend,
    // requestResetPassword,
    // verifyTokenController,
    // resetPassword
}