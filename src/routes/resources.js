const router = require("express").Router();

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
    resources.getOne(req.params.id)
      .then(resource => {
        res.json(resource);
      });
  });

  return router;
};
