const router = require("express").Router();
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

  router.get("/logout", (req, res) => {
    const firstName = req.session.user.first_name;
    res.end(`Goodbye, ${firstName}!`);
    req.session = null;
  });

  router.get("/me", (req, res) => {
    res.json(req.session.user);
  });

  router.post("/register", (req, res) => {
    res.end("POST /register route");
  });


  return router;
};
