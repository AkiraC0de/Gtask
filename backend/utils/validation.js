const ERROR_CODES = require('../errors/errorCodes');
const { capitalizedString, titleCaseString } = require('./utils');

const isEmailFormatValid = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
}

const validatePassword = (password) => {
  let errorMessage = [];

  // Checks for UpperCase, LowerCase, and Digit.
  if(password.length < 8) errorMessage.push('8 characters or more');
  if(password.length > 128) errorMessage.push('Password must be 128 characters or less');
  if(!/[a-z]/.test(password)) errorMessage.push('one lowercase');
  if(!/[A-Z]/.test(password)) errorMessage.push('one uppercase');
  if(!/\d/.test(password)) errorMessage.push('one digit');  

  if(errorMessage.length > 0){
    const errorMessageString = errorMessage.join(', ');
    const message = `Password must include: ${errorMessageString}.`;

    return {
      isValid: false,
      errors: [{
        field: 'password',
        message,
        code: ERROR_CODES.INVALID_PASSWORD
      }]
    };
  };

  return { isValid : true };
}

const sanitizeUserData = (userData) => {
  let sanitizedUserData = {}

  if(userData.email){
    sanitizedUserData = { ...sanitizedUserData, 
      email : userData.email.toLowerCase().trim()
    }
  }

  if(userData.firstName){
    sanitizedUserData = { ...sanitizedUserData, 
      firstName : titleCaseString(userData.firstName.toLowerCase().trim())
    }
  }

  if(userData.lastName){
    sanitizedUserData = { ...sanitizedUserData, 
      lastName : titleCaseString(userData.lastName.toLowerCase().trim())
    }
  }

  if(userData.middleName){
    sanitizedUserData = { ...sanitizedUserData, 
      middleName: titleCaseString(userData.middleName.toLowerCase().trim()) 
    }
  }

  if(userData.password){
    sanitizedUserData = { ...sanitizedUserData, 
      password : userData.password.trim()
    }
  }

  return sanitizedUserData;
}

const VALIDATORS = {
  email: (val) => !isEmailFormatValid(val) ? {
    field: 'email',
    message: 'Invalid email',
    code: ERROR_CODES.INVALID_EMAIL_FORMAT
  } : null,

  password: (val) => {
    const res = validatePassword(val);
    return !res.isValid ? res.errors[0] : null;
  }
};

const validateUserData = (userData = {}) => {
  const fieldsToValidate = Object.keys(userData);

  const errors = fieldsToValidate
    .map(field => VALIDATORS[field]?.(userData[field])) 
    .filter(error => error !== null && error !== undefined);                  

  return errors.length > 0 
    ? { isValid: false, message: 'User data failed validation.', errors }
    : { isValid: true };
};
const validateRequiredFields = (requiredFields, obj) => { 
  let errors = [];

  for (const requiredField  of requiredFields) {
    const value = obj[requiredField.field];

    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "")
    ) {
      const label = requiredField.label || requiredField.field;

      errors.push({
        field : requiredField .field,
        message: `${label} is required.`,
      });
    }
  }

  if(errors.length > 0) {
    const missingFieldsString = errors.map(field => field.field).join(", ");
    const messageVerb = errors.length > 1 ? 'are' : 'is';
    const message = `${missingFieldsString} ${messageVerb} required and cannot be empty.`;

    return { 
      isValid : false,
      message,
      errors
    };
  }

  return { isValid : true };
}

module.exports = { 
  validateRequiredFields,
  validateUserData,
  sanitizeUserData
};