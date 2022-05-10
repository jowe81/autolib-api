const router = require("express").Router();
const errorIfUnauthorized = require("../middleware/errorIfUnauthorized");
const helpers = require("../modules/helpers");

module.exports = (db) => {

  const resources = require("../modules/resources")(db);

  router.get("/resources", (req, res) => {
    resources.getAll(req.query)
      .then(resources => {
        res.json(resources);
      })
      .catch(err => {
        res.status(500).send(err);
      });
  });

  router.get("/resources/:id", (req, res) => {
    const id = helpers.sanitizeId(req.params.id);
    resources.getOne(id)
      .then(resource => {
        res.json(resource);
      })
      .catch(err => {
        res.status(500).send(err);
      });
  });

  router.post("/resources", errorIfUnauthorized, (req, res) => {
    const currentUserId = req.session.user.id;
    resources.createNew(req.body, currentUserId)
      .then(result => {
        res.json(result);
      })
      .catch(err => {
        res.status(500).send(err);
      });
  });

  return router;
};
