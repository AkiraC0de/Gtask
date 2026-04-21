const ERROR_CODES = require('../constants/errorCodes');
const GenericError = require('../errors/GenericError');
const MissingFieldError = require('../errors/MissingFieldError');
const ValidationError = require('../errors/ValidationError');
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

const USER_DATA_SANITIZER = {
  email: (val) => val.toLowerCase().trim(),
  firstName: (val) => titleCaseString(val.toLowerCase().trim()),
  lastName: (val) => titleCaseString(val.toLowerCase().trim()),
  middleName: (val) => titleCaseString(val.toLowerCase().trim()),
  password: (val) => val.trim(),
}

const sanitizeUserData = (userData = {}) => {
  let fieldsToSanitize = Object.keys(userData)

  return fieldsToSanitize.reduce((acc, field) => {
    const value = userData[field];
    const sanitizer = USER_DATA_SANITIZER[field];

    // If a sanitizer exists for this field, use it; 
    // otherwise, return the original value (or skip it).
    acc[field] = sanitizer ? sanitizer(value) : value;

    return acc;
  }, {});
}

const USER_DATA_VALIDATORS = {
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
    .map(field => USER_DATA_VALIDATORS[field]?.(userData[field])) 
    .filter(error => error !== null && error !== undefined);       

  return errors.length > 0 
    ? { isValid: false, message: 'User data failed validation.', errors }
    : { isValid: true };
};

const checkRequiredFields = (requiredFields, obj) => { 
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

  if(errors.length > 0){
    const missingFieldsString = errors.map(field => field.field).join(", ");
    const messageVerb = errors.length > 1 ? 'are' : 'is';
    const message = `${missingFieldsString} ${messageVerb} required and cannot be empty.`;

    throw new MissingFieldError(message, errors);
  }
}

const checkRequestBody = (body) => {
  if(!body) {
      throw new GenericError(400, 'Request body cannot be empty.', ERROR_CODES.MISSING_FIELD);
  }
}

const GROUP_DATA_VALIDATORS = {
  name: (val) => {
    if (!val || val.trim().length === 0) {
      return { field: 'name', message: 'Group name is required', code: ERROR_CODES.MISSING_FIELD };
    }
    if (val.length > 200) {
      return { field: 'name', message: 'Group name cannot exceed 200 characters', code: ERROR_CODES.FIELD_TOO_LONG };
    }
    return null;
  },

  description: (val) => {
    if (val && val.length > 1000) {
      return { field: 'description', message: 'Description cannot exceed 1000 characters', code: ERROR_CODES.FIELD_TOO_LONG };
    }
    return null;
  },

  maxMembers: (val) => {
    const num = Number(val);
    if (isNaN(num) || num < 2 || num > 50) {
      return { 
        field: 'maxMembers', 
        message: 'Max members must be a number between 2 and 50', 
        code: ERROR_CODES.INVALID_RANGE 
      };
    }
    return null;
  },

  status: (val) => {
    const validStatuses = ['active', 'inactive', 'archived', 'disbanded'];
    if (val && !validStatuses.includes(val)) {
      return { field: 'status', message: 'Invalid group status', code: ERROR_CODES.INVALID_ENUM_VALUE };
    }
    return null;
  }
};

const validateGroupData = (groupData) => {
  const fieldsToValidate = Object.keys(groupData);

  const errors = fieldsToValidate
    .map(key => GROUP_DATA_VALIDATORS[key] ? GROUP_DATA_VALIDATORS[key](groupData[key]) : null)
    .filter(error => error !== null && error !== undefined);

  if (errors.length > 0) {
    throw new ValidationError('Group data failed validation.', errors);
  }
};

module.exports = { 
  checkRequiredFields,
  validateUserData,
  sanitizeUserData,
  validatePassword,
  checkRequestBody,
  validateGroupData
};