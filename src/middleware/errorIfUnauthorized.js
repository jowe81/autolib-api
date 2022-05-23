const errorIfUnauthorized = (req, res, next) => {
  if (!(req.session && req.session.user)) {
    const err = new Error(`Unauthorized request (must be logged in).`);
    err.statusCode = 401;
    next(err);
  } else {
    next();
  }
};

module.exports = errorIfUnauthorized;