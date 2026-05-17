const { ClientError } = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
  if (err instanceof ClientError) {
    return res.status(err.statusCode).json({
      status: 'failed',
      message: err.message,
    });
  }

  // Validation errors from Joi
  if (err.isJoi) {
    return res.status(400).json({
      status: 'failed',
      message: err.details[0].message,
    });
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      status: 'failed',
      message: 'File size too large. Maximum 5MB allowed.',
    });
  }

  console.error('Unhandled Error:', err);
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};

module.exports = { errorHandler };
