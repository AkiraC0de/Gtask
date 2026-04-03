const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if(!emailRegex.test(email)) return {
    success: false,
    message: 'Invalid email format.',
  }

  return { success : true }
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
  validateEmail
};