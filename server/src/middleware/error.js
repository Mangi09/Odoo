const pgStatusByCode = {
  '22P02': 400,
  '23502': 400,
  '23503': 400,
  '23505': 409,
  '23514': 400
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || pgStatusByCode[err.code] || 500;

  res.status(statusCode).json({
    error: err.message || 'Something went wrong',
    code: err.code
  });
};

module.exports = { errorHandler, notFoundHandler };
