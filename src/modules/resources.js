const helpers = require("../modules/helpers");

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
        })
        .catch(err => reject(err));
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
        })
        .catch(err => reject(err));
    });
  };

  /**
   * Get an object with all information on the resource, including author- and genre-arrays
   * @param {integer} resourceId
   * @returns an object with resource information
   */
  const getResourceObject = (resourceId) => {
    return new Promise((resolve, reject) => {
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
        })
        .catch(err => reject(err));
    });
  };

  /**
   * Build a search query based on req.query options
   * @param {object} query the req.query object
   * @returns SQL string
   */
  const buildResourceSearchQuery = query => {

    //Assemble WHERE clause
    let where = ``;
    if (query.title) {
      where += ` AND LOWER(resources.title) LIKE '%${helpers.lowerAndEscape(query.title)}%'`;
    }
    if (query.author) {
      where += ` AND LOWER(authors.name) LIKE '%${helpers.lowerAndEscape(query.author)}%'`;
    }
    if (query.genre) {
      where += ` AND LOWER(genres.name) LIKE '%${helpers.lowerAndEscape(query.genre)}%'`;
    }
    if (query.owner_id) {
      where += ` AND resources.owner_id = ${helpers.sanitizeId(query.owner_id)}`;
    }
    if (query.current_possessor_id) {
      where += ` AND resources.current_possessor_id = ${helpers.sanitizeId(query.current_possessor_id)}`;
    }
    if (where) {
      where = `WHERE TRUE${where}`;
    }

    //Assemble ORDER BY clause
    let order = ``;
    switch (query.order_by) {
    case "created_at":
      //Recent additions first
      order = `ORDER BY created_at DESC`;
      break;
    case "title":
      order = `ORDER BY title`;
      break;
    case "id":
      order = `ORDER BY id`;
      break;
    }

    //Assemble LIMIT clause
    const limit = query.limit && query.limit > 0 ? `LIMIT ${query.limit}` : ``;

    let q = `
    SELECT DISTINCT resources.title, resources.id, resources.created_at
    FROM authors 
    JOIN authors_resources ON authors_resources.author_id = authors.id 
    JOIN resources ON authors_resources.resource_id = resources.id
    JOIN genres_resources ON genres_resources.resource_id = resources.id
    JOIN genres ON genres_resources.genre_id = genres.id
    ${where} ${order} ${limit}
    `;
    return q;
  };

  /**
   * Get data for all resources; order by title or most recent additions
   * @param {object} object containing orderby and limit properties
   * @returns an array with resource information objects
   */
  const getAll = (query) => {
    return new Promise((resolve) => {
      const queryString = buildResourceSearchQuery(query);
      db.query(queryString)
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

  /**
   * Create a resource record with given data,
   * return promise to record id
   * @param {object} data
   * @returns a promise to id of new record
   */
  const createResourceRecord = (data) => {
    return new Promise((resolve, reject) => {
      resolve();
    });
  };

  /**
   * Take data from post request and create new resource record
   * @param {object} reqBody
   * @returns a promise to the new resource id
   */
  const createNew = (reqBody) => {
    return new Promise((resolve, reject) => {
      resolve();
    });
  };

  return {
    getAll,
    getOne: getResourceObject,
    createNew,
  };
  
};