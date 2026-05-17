const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      status: 'failed',
      message: error.details.map((d) => d.message).join(', '),
    });
  }
  req.body = value;
  next();
};

const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      status: 'failed',
      message: error.details.map((d) => d.message).join(', '),
    });
  }
  req.query = value;
  next();
};

module.exports = { validateBody, validateQuery };
