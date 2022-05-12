const router = require("express").Router();
const errorIfUnauthorized = require("../middleware/errorIfUnauthorized");
const helpers = require("../modules/helpers");

module.exports = (db) => {

  const requests = require("../modules/requests")(db);
  const resources = require("../modules/resources")(db);

  router.put("/requests/:id/complete", errorIfUnauthorized, (req, res) => {
    const id = helpers.sanitizeId(req.params.id);
    requests.getOne(id)
      .then(requestRecord => {
        if (requestRecord.requester_id === req.session.user.id) {
          requests.markCompleted(id)
            .then(requestRecord => {
              helpers.lg(`Marked request ${id} as completed.`);
              res.json(requestRecord);
            })
            .catch(err => {
              res.status(500).end(err);
            });
        } else {
          if (requestRecord.id) {
            helpers.lg(`User ${req.session.user.id} tried to update a request they do not own.`);
            res.status(500).end(`You cannot update a request you do not own.`);
          } else {
            helpers.lg(`A request with ID ${id} does not exist.`);
            res.status(500).end(`Attempt to update a request record that does not exist.`);
          }
        }
      })
      .catch(err => {
        helpers.lg(`Unable to retrieve request with ID ${id}.`);
        res.status(500).end(err);
      });
  });

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


  return router;
};
