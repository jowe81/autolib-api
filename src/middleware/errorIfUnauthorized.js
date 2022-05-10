const errorIfUnauthorized = (req, res, next) => {
  if (!(req.session && req.session.user)) {
    res.status(401).end("Not authorized - must be logged in.");
  } else {
    next();
  }
};

module.exports = errorIfUnauthorized;