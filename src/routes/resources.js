const router = require("express").Router();
const errorIfUnauthorized = require("../middleware/errorIfUnauthorized");
const helpers = require("../modules/helpers");

module.exports = (db) => {

  const resources = require("../modules/resources")(db);

  router.get("/resources/mine", (req, res, next) => {
    resources.getByOwner(req.session.user.id)
      .then(resources => {
        helpers.lg(`${resources.length} resources are owned by ${req.session.user.email}`);
        res.json(resources);
      })
      .catch(next);
  });

  router.get("/resources/random", (req, res, next) => {
    resources.getRandom(req.query.limit, true)
      .then(resources => {
        helpers.lg(`Picked ${resources.length} random resources.`);
        res.json(resources);
      })
      .catch(err => {
        helpers.lg(`Error: could not select random resources.`);
        next(err);
      });
  });

  router.get("/resources", (req, res, next) => {
    const withStatus = req.query.withStatus !== undefined;
    resources.getAll(req.query, withStatus)
      .then(resources => {
        helpers.lg(`Returning ${resources.length} resources.`);
        res.json(resources);
      })
      .catch(next);
  });

  router.get("/resources/:id", (req, res, next) => {
    const id = helpers.sanitizeId(req.params.id);
    resources.getOne(id)
      .then(resource => {
        res.json(resource);
      })
      .catch(next);
  });

  router.post("/resources", errorIfUnauthorized, (req, res, next) => {
    const currentUserId = req.session.user.id;
    resources.createNew(req.body, currentUserId)
      .then(result => {
        res.json(result);
      })
      .catch(next);
  });

  return router;
};
