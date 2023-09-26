const ApiError = require("../utils/apiError");

const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  const sendErrorForDev = (error, response) =>
    response.status(error.statusCode).json({
      status: error.status,
      error: error,
      message: error.message,
      stack: error.stack,
    });

  const sendErrorForProduction = (error, response) =>
    response.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });

  const handleJwtInvlidSignature = () =>
    new ApiError("Invalid token please login again", 401);

  const handleJwtExpiredToken = () =>
    new ApiError("Expired token please login again", 401);

  //! final condition
  if (process.env.NODE_ENV === "development") {
    sendErrorForDev(err, res);
  } else {
    if (err.name === "JsonWebTokenError") {
      err = handleJwtInvlidSignature();
    } else if (err.name === "TokenExpiredError") {
      err = handleJwtExpiredToken();
    }
    sendErrorForProduction(err, res);
  }
};

module.exports = globalError;
