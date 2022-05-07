const helpers = require("../modules/helpers");

module.exports = (db) => {

  
  /**
   * Get an object with all information on the resource, including author- and genre-arrays
   * @param {integer} resourceId
   * @returns an object with resource information
   */
  const getOne = (resourceId) => {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM resources WHERE id = $1::integer`, [ helpers.sanitizeId(resourceId) ])
        .then(({ rows: records }) => {
          if (records.length > 0) {
            const record = records[0];
            resolve(record);
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
      where += ` AND LOWER(resources.authors) LIKE '%${helpers.lowerAndEscape(query.author)}%'`;
    }
    if (query.genre) {
      where += ` AND LOWER(resources.genres) LIKE '%${helpers.lowerAndEscape(query.genre)}%'`;
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
      SELECT * FROM resources
      ${where} ${order} ${limit}
    `;
    return q;
  };

  /**
   * Get data for all resources; order by title or most recent additions
   * @param {object} object containing orderby and limit properties
   * @returns an array with resource objects
   */
  const getAll = (query) => {
    return new Promise((resolve) => {
      const queryString = buildResourceSearchQuery(query);
      db.query(queryString)
        .then(({ rows: resources }) => {
          resolve(resources);
        });
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
    getOne,
    createNew,
  };
  
};