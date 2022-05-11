const router = require("express").Router();
const errorIfUnauthorized = require("../middleware/errorIfUnauthorized");
const helpers = require("../modules/helpers");
const resources = require("./resources");

module.exports = (db) => {

  const requests = require("../modules/requests")(db);

  router.post("/requests", errorIfUnauthorized, (req, res) => {
    const userId = req.session.user.id;
    const resourceId = req.body.resourceId;
    if (resourceId) {
      resources.getStatus(resourceId)
        .then(status => {
          if (status.available) {
            requests.createNew(resourceId, userId)
              .then(requestRecord => {
                res.json(requestRecord);
              })
              .catch(err => {
                res.status(500).end(err);
              });
          } else {
            res.json({});
          }
        })
        .catch(err => {
          res.status(500).end(err);
        });
    }
  });

  router.put("/requests/:id", errorIfUnauthorized, (req, res) => {
    const id = helpers.sanitizeId(req.params.id);
    //update request
  });

  return router;
};
