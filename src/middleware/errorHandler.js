const helpers = require("../modules/helpers");

const errorHandler = (err, req, res, next) => {
  const debugMessage = err.debug ? `${err.debug} -` : ``;
  helpers.lg(`ERROR: ${debugMessage} ${err.message}`);
  res.status(err.statusCode || 500).send(err);
};

module.exports = errorHandler;