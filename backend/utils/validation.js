const ERROR_CODES = require('../errors/errorCodes');

const isEmailFormatValid = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
}

const validatePassword = (password) => {
  let errorMessage = [];

  // Checks for UpperCase, LowerCase, and Digit.
  if(password.length < 8) errorMessage.push('8 characters or more');
  if(!/[a-z]/.test(password)) errorMessage.push('one lowercase');
  if(!/[A-Z]/.test(password)) errorMessage.push('one uppercase');
  if(!/\d/.test(password)) errorMessage.push('one digit');  

  if(errorMessage.length > 0){
    const errorMessageString = errorMessage.join(', ');
    const message = `Password must have atleat ${errorMessageString}.`;

    return {
      isValid: false,
      error: {
        field: 'password',
        message,
        code: ERROR_CODES.INVALID_PASSWORD
      }
    };
  };

  return { isValid : true };
}

const validateUserData = (userData) => {
  let errors = [];

  if(!isEmailFormatValid(userData?.email)){
    errors.push({
      field : 'email',
      message: 'Invalid email',
      code: ERROR_CODES.INVALID_EMAIL_FORMAT
    })
  }      

  const passwordValidation = validatePassword(userData?.password);
  if(!passwordValidation.isValid){
    errors.push(passwordValidation.error);
  }

  if(errors.length > 0){
    return {
      isValid : false,
      message: 'User data failed validation.',
      errors
    }
  }

  return { isValid : true };
}

const validateRequiredFields = (requiredFields, obj) => {
  let errors = [];

  for (const field of requiredFields) {
    const value = obj[field.field];

    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "")
    ) {
      errors.push({
        field : field.field,
        message: `${field.field} is required.`,
        code: field.code
      });
    }
  }

  const missingFieldsString = errors.map(field => field.field).join(", ");
  const messageVerb = errors.length > 1 ? 'are' : 'is';
  const message = `${missingFieldsString} ${messageVerb} required and cannot be empty.`;

  if(errors.length > 0) {
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
  validateUserData
};