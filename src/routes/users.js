const router = require("express").Router();
const errorIfUnauthorized = require("../middleware/errorIfUnauthorized");
const helpers = require("../modules/helpers");

module.exports = (db) => {

  const users = require("../modules/users")(db);

  router.get("/users", errorIfUnauthorized, (req, res) => {
    users.getAll()
      .then(users => {
        res.json(users);
      })
      .catch(err => {
        res.status(500).send(err);
      });
  });

  router.get("/users/:id", errorIfUnauthorized, (req, res) => {
    const id = helpers.sanitizeId(req.params.id);
    users.getOne(id)
      .then(users => {
        res.json(users);
      })
      .catch(err => {
        res.status(500).send(err);
      });
  });

  router.post("/users", (req, res) => {
    users.createNew(req.body)
      .then(result => {
        res.json(result);
      })
      .catch(err => {
        res.status(500).send(err);
      });
  });

  return router;
};
