module.exports = (db) => {

  /**
   * Get the names of the authors for a resource
   * @param {integer} resourceId
   * @returns an array of author's names
   */
  const getAuthors = (resourceId) => {
    return new Promise((resolve, reject) => {
      const query = {
        text: `SELECT name FROM authors JOIN authors_resources ON authors.id = authors_resources.author_id WHERE resource_id = $1`,
        values: [ resourceId ]
      };

      db.query(query)
        .then(({ rows: records }) => {
          const authors = [];
          records.forEach(record => {
            authors.push(record.name);
          });
          resolve(authors);
        });
    });
  };

  /**
   * Get the genres for a resource
   * @param {integer} resourceId
   * @returns an array of genre names
   */
  const getGenres = (resourceId) => {
    return new Promise((resolve, reject) => {
      const query = {
        text: `SELECT name FROM genres JOIN genres_resources ON genres.id = genres_resources.genre_id WHERE resource_id = $1`,
        values: [ resourceId ]
      };

      db.query(query)
        .then(({ rows: records }) => {
          const genres = [];
          records.forEach(record => {
            genres.push(record.name);
          });
          resolve(genres);
        });
    });
  };

  /**
   * Get an object with all information on the resource, including author- and genre-arrays
   * @param {integer} resourceId
   * @returns an object with resource information
   */
  const getResourceObject = (resourceId) => {
    return new Promise((resolve) => {
      db.query(`SELECT * FROM resources WHERE id = $1::integer`, [ resourceId ])
        .then(({ rows: records }) => {
          if (records.length > 0) {
            const record = records[0];
            Promise.all([getAuthors(resourceId), getGenres(resourceId)]).then(([authors, genres]) => {
              record.authors = authors;
              record.genres = genres;
              resolve(record);
            });
          } else {
            resolve({});
          }
        });
    });
  };

  /**
   * Get data for all resources; order by title or most recent additions
   * @param {object} object containing orderby and limit properties
   * @returns an array with resource information objects
   */
  const getAll = ({orderby, limit}) => {
    return new Promise((resolve, reject) => {
      let _order = "";
      switch (orderby) {
      case "created_at":
        //Recent additions first
        _order = "ORDER BY created_at DESC";
        break;
      case "title":
        _order = "ORDER BY title";
        break;
      }
      const _limit = limit && limit > 0 ? `LIMIT ${limit}` : ``;

      const query = {
        text: `SELECT id,title,created_at FROM resources ${_order} ${_limit}`,
      };
      console.log(query.text);

      db.query(query)
        .then(({ rows: resources }) => {
          const promises = [];
          resources.forEach(resource => {
            promises.push(getResourceObject(resource.id));
          });
          Promise.all(promises).then(resources => {
            resolve(resources);
          });
        });

    });
  };

  return {
    getAll,
    getOne: getResourceObject,
  };
  
};