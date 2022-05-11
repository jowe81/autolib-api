const router = require("express").Router();
const errorIfUnauthorized = require("../middleware/errorIfUnauthorized");
const helpers = require("../modules/helpers");

module.exports = (db) => {

  const requests = require("../modules/requests")(db);

  router.get("/requests", (req, res) => {
    requests.getAll(req.query)
      .then(requests => {
        res.json(requests);
      })
      .catch(err => {
        res.status(500).send(err);
      });
  });

  router.post("/requests", errorIfUnauthorized, (req, res) => {
    const userId = req.session.user.id;
    const resourceId = req.body.resourceId;
    if (resourceId) {
      requests.createNew(resourceId, userId)
        .then(requestRecord => {
          res.json(requestRecord);
        })
        .catch(err => {
          res.status(500).end(err);
        });
    }
  });

  router.put("/requests/:id", errorIfUnauthorized, (req, res) => {
    const id = helpers.sanitizeId(req.params.id);
  });

  return router;
};
