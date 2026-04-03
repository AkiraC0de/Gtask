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



module.exports = { 
  generateSixDigitCode, 
  isAuthorizedForNewToken,
  generateCryptoToken,
};