// auth-service/src/utils/validation.js
const validateCheckEmail = (req, res, next) => {
  if (!req.body || !req.body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
    return res.status(400).json({
      success: false,
      error: "Invalid email format",
      errorCode: "INVALID_EMAIL"
    });
  }
  next();
};

module.exports = { validateCheckEmail };