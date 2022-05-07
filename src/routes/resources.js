const router = require("express").Router();
const helpers = require("../modules/helpers");

module.exports = (db, updateAppointment) => {

  const resources = require("../modules/resources")(db);

  router.get("/resources", (req, res) => {
    const options = {
      orderby: req.query.orderby,
      limit: req.query.limit
    };
    resources.getAll(options)
      .then(resources => {
        res.json(resources);
      });
  });

  router.get("/resources/:id", (req, res) => {
    const id = helpers.sanitizeId(req.params.id);
    resources.getOne(id)
      .then(resource => {
        res.json(resource);
      });
  });

  return router;
};
