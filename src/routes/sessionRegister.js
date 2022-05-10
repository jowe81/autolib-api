const router = require("express").Router();
const errorIfUnauthorized = require("../middleware/errorIfUnauthorized");
const helpers = require("../modules/helpers");

module.exports = (db) => {

  const users = require("../modules/users")(db);

  router.post("/login", (req, res) => {
    const email = req.body.email;
    users.findByEmail(email)
      .then(user => {
        req.session.user = user;
        res.json(user);
      })
      .catch(err => {
        res.status(500).send(err);
      });
  });

  router.get("/logout", errorIfUnauthorized, (req, res) => {
    const firstName = req.session.user.first_name;
    res.end(`Goodbye, ${firstName}!`);
    req.session = null;
  });

  router.get("/me", errorIfUnauthorized, (req, res) => {
    res.json(req.session.user);
  });

  return router;
};
