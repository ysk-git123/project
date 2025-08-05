const generateTokens = require("./generateTokens");
const verifyAccessToken = require("./verifyAccessToken");
const refreshTokenController = require("./refreshTokenController");
console.log(generateTokens, verifyAccessToken, refreshTokenController);

module.exports = {
  generateTokens,
  verifyAccessToken,
  refreshTokenController,
};
