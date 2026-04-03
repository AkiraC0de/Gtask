const crypto = require('crypto');

const generateSixDigitCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const isAuthorizedForNewToken = (prevTokenCreatedTime) => {
  const COOLDOWN_TIME_IN_MS = 2 * 60 * 1000; // 2 minutes

  const timeDifference = new Date() - prevTokenCreatedTime; // Result is in milliseconds

  return timeDifference > COOLDOWN_TIME_IN_MS;
}

const generateCryptoToken = () => {
  const TOKEN_BYTES = 32; // 256 bits of entropy

  return crypto.randomBytes(TOKEN_BYTES).toString('hex')
}

const validateRequiredFields = (requiredFields, obj) => {
  let errors = [];

  for (const field of requiredFields) {
    const value = obj[field];

    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "")
    ) {
      errors.push({
        field,
        message: `${field} is required.`
      });
    }
  }

  const missingFieldsString = errors.map(field => field.field).join(", ");
  const message = `${missingFieldsString} is/are required and cannot be empty.`;

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
  generateSixDigitCode, 
  isAuthorizedForNewToken,
  generateCryptoToken,
  validateRequiredFields
};