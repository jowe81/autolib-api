const router = require("express").Router();
const errorIfUnauthorized = require("../middleware/errorIfUnauthorized");
const helpers = require("../modules/helpers");

module.exports = (db) => {

  const openLibrary = require("../modules/openLibrary");

  router.get("/openlibrary/by_isbn/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    openLibrary.getAutolibRecord(isbn)
      .then(autolibRecord => {
        res.json(autolibRecord);
      })
      .catch(err => {
        res.status(500).end("Unable to retrieve record from OpenLibrary");
      });
  });

  return router;
};

