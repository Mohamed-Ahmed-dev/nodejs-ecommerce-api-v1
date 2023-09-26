const jwt = require("jsonwebtoken");
// ? genrate Token

const genrateToken = (payLoad) =>
  jwt.sign({ userId: payLoad }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });

module.exports = genrateToken;
