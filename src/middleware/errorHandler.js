const helpers = require("../modules/helpers");

const errorHandler = (err, req, res, next) => {
  const debugMessage = err.debug ? `${err.debug} -` : ``;
  helpers.lg(`ERROR: ${debugMessage} ${err.message}`);
  err.statusCode = err.statusCode || 500;
  res.status(err.statusCode).send(err);
};

module.exports = errorHandler;