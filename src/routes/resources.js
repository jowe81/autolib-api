const router = require("express").Router();
const errorIfUnauthorized = require("../middleware/errorIfUnauthorized");
const helpers = require("../modules/helpers");

module.exports = (db) => {

  const resources = require("../modules/resources")(db);

  router.get("/resources/mine", (req, res) => {
    resources.getByOwner(req.session.user.id)
      .then(resources => {
        helpers.lg(`${resources.length} resources are owned by ${req.session.user.email}`);
        res.json(resources);
      })
      .catch(err => {
        res.status(500).send(err);
      });
  });

  router.get("/resources/random", (req, res) => {
    resources.getRandom(req.query.limit)
      .then(resources => {
        helpers.lg(`Picked ${resources.length} random resources.`);
        res.json(resources);
      })
      .catch(err => {
        helpers.lg(`Error: could not select random resources.`);
        res.status(500).end(err);
      });
  });

  router.get("/resources", (req, res) => {
    const withStatus = req.query.withStatus !== undefined;
    console.log(req.query.withStatus, withStatus);
    resources.getAll(req.query, withStatus)
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
