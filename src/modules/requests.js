const helpers = require("../modules/helpers");

module.exports = (db) => {
  
  /**
   * Get an object with the request record
   * @param {integer} requestId
   * @returns a promise to an object with the request record
   */
  const getOne = (requestId) => {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM requests WHERE id = $1::integer`, [ helpers.sanitizeId(requestId) ])
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
   * Get all request records
   * @returns a promise to an array with request records
   */
  const getAll = () => {
    return new Promise((resolve, reject) => {
      const queryString = `SELECT * FROM requests;`;
      db.query(queryString)
        .then(({ rows: requests }) => {
          resolve(requests);
        })
        .catch(err => {
          helpers.lg(err);
        });
    });
  };

  const createNew = (resourceId, requesterId) => {
    return new Promise((resolve, reject) => {
      const query = {
        text: `INSERT INTO requests (resource_id, requester_id) VALUES ($1, $2) RETURNING *`,
        values: [resourceId, requesterId],
      };
      db.query(query)
        .then(requestRecord => {
          helpers.lg(`Generated request record for resource ID ${resourceId}, requested by user with ID ${requesterId}.`);
          resolve(requestRecord);
        })
        .catch(err => {
          helpers.lg(`Could not create request. ${err.detail}`);
          reject(err);
        });
    });
  };

  const update = () => {

  };
  
  
  return {
    getAll,
    getOne,
    createNew,
    update,
  };
  
};