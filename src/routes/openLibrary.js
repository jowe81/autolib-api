const router = require("express").Router();

module.exports = () => {

  const openLibrary = require("../modules/openLibrary");

  router.get("/openlibrary/by_isbn/:isbn", (req, res, next) => {
    const isbn = req.params.isbn;
    openLibrary.getAutolibRecord(isbn)
      .then(autolibRecord => {
        res.json(autolibRecord);
      })
      .catch(next);
  });

  return router;
};

