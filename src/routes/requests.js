const router = require("express").Router();
const errorIfUnauthorized = require("../middleware/errorIfUnauthorized");
const helpers = require("../modules/helpers");

module.exports = (db) => {

  const requests = require("../modules/requests")(db);
  const resources = require("../modules/resources")(db);

  router.post("/requests", errorIfUnauthorized, (req, res) => {
    const userId = req.session.user.id;
    const resourceId = req.body.resourceId;
    resources.getOne(resourceId)
      .then(resource => {
        if (resource.status && resource.status.available) {
          requests.createNew(resourceId, userId)
            .then(requestRecord => {
              res.json(requestRecord);
            })
            .catch(err => {
              res.status(500).end(err);
            });
        } else {
          helpers.lg(`Cannot create request - resource is unavailable.`);
          res.json({ "error": "resource unavailable"});
        }
      })
      .catch(err => {
        res.status(500).end(err);
      });
  });

  router.put("/requests/:id", errorIfUnauthorized, (req, res) => {
    const id = helpers.sanitizeId(req.params.id);
    //update request
  });

  return router;
};
