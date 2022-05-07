const router = require("express").Router();
const helpers = require("../modules/helpers");

module.exports = (db, updateAppointment) => {

  const resources = require("../modules/resources")(db);

  router.get("/resources", (req, res) => {
    resources.getAll(req.query)
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

  router.post("/resources", (req, res) => {
    resources.post(req.body)
      .then(result => {
        console.log("post result", result);
        res.json(result);
      });
    
  });

  return router;
};
