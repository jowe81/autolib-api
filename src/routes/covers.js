const router = require("express").Router();
const helpers = require("../modules/helpers");
const covers = require("../modules/covers");

module.exports = (db) => {

  router.get("/covers/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    console.log(isbn);
    covers.retrieve(isbn)
      .then(imgData => {
        helpers.lg(`Got cover image data`,imgData);
        res.writeHead(200,{'Content-type':'image/jpg'});
        res.end(imgData);
      })
      .catch(err => res.status(500).end(err));
  });

  return router;
};
