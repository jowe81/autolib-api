const router = require("express").Router();
const errorIfUnauthorized = require("../middleware/errorIfUnauthorized");
const helpers = require("../modules/helpers");

module.exports = (db) => {

  const requests = require("../modules/requests")(db);
  const resources = require("../modules/resources")(db);

  router.get("/requests/from_me_for_others", errorIfUnauthorized, (req, res, next) => {
    requests.getByRequestingUser(req.session.user.id)
      .then(requestRecords => {
        helpers.lg(`Got ${requestRecords.length} requests that were initiated by ${req.session.user.email} (some may be completed).`);
        res.json(requestRecords);
      })
      .catch(next);
  });

  router.get("/requests/from_me_for_others/pending", errorIfUnauthorized, (req, res, next) => {
    requests.getByRequestingUser(req.session.user.id, true)
      .then(requestRecords => {
        helpers.lg(`Got ${requestRecords.length} pending requests that were initiated by ${req.session.user.email}`);
        res.json(requestRecords);
      })
      .catch(next);
  });

  router.get("/requests/from_others_for_me", errorIfUnauthorized, (req, res, next) => {
    requests.getByRequestedUser(req.session.user.id)
      .then(requestRecords => {
        helpers.lg(`Got a total of ${requestRecords.length} requests for ${req.session.user.email} (some may be completed).`);
        res.json(requestRecords);
      })
      .catch(next);
  });

  router.get("/requests/from_others_for_me/pending", errorIfUnauthorized, (req, res, next) => {
    requests.getByRequestedUser(req.session.user.id, true)
      .then(requestRecords => {
        helpers.lg(`Got ${requestRecords.length} pending requests for ${req.session.user.email}.`);
        res.json(requestRecords);
      })
      .catch(next);
  });

  router.put("/requests/:id/complete", errorIfUnauthorized, (req, res, next) => {
    const id = helpers.sanitizeId(req.params.id);
    requests.getOne(id)
      .then(requestRecord => {
        if (requestRecord.requester_id === req.session.user.id) {
          if (!requestRecord.completed_at) {
            requests.markCompleted(id)
              .then(requestRecord => {
                helpers.lg(`Marked request ${id} as completed.`);
                res.json(requestRecord);
              })
              .catch(next);
          } else {
            helpers.lg(`Request ${id} was completed already. Doing nothing.`);
            res.json(requestRecord);
          }
        } else {
          const err = new Error(
            requestRecord.id ? `You cannot update request you do not own (${req.session.user.email}).` : `Request ${id} does not exist.`
          );
          next(err);
        }
      })
      .catch(next);
  });

  router.delete("/requests/:id", errorIfUnauthorized, (req, res, next) => {
    const id = helpers.sanitizeId(req.params.id);
    requests.getOne(id)
      .then(requestRecord => {
        if (requestRecord.requester_id === req.session.user.id) {
          requests.remove(id)
            .then(requestRecord => {
              helpers.lg(`Removed request ${id} from database.`);
              res.json(requestRecord);
            })
            .catch(next);
        } else {
          const err = new Error(`You cannot delete a request you do not own (${req.session.user.email}).`);
          next(err);
        }
      })
      .catch(next);
  });

  router.post("/requests", errorIfUnauthorized, (req, res, next) => {
    const userId = req.session.user.id;
    const resourceId = req.body.resourceId;
    resources.getOne(resourceId)
      .then(resource => {
        if (resource.status && resource.status.available) {
          requests.createNew(resourceId, userId, resource.current_possessor_id)
            .then(requestRecord => {
              res.json(requestRecord);
            })
            .catch(next);
        } else {
          const err = new Error(`Cannot create request - resource is unavailable.`);
          next(err);
        }
      })
      .catch(next);
  });


  return router;
};
