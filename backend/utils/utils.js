const crypto = require('crypto');

const generateSixDigitCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateCryptoToken = () => {
  const TOKEN_BYTES = 32; // 256 bits of entropy

  return crypto.randomBytes(TOKEN_BYTES).toString('hex')
}

const capitalizedString = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const titleCaseString = (str) => {
   return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

module.exports = { 
  generateSixDigitCode, 
  generateCryptoToken,
  capitalizedString,
  titleCaseString
};