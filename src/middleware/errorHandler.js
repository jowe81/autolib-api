const helpers = require("../modules/helpers");

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.clientMessage = err.message || err.detail;
  res.status(err.statusCode).send(err);
};

module.exports = errorHandler;