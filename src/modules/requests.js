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

  /**
   * Create a new request record (does not run any database consistency checks)
   * @param {integer} resourceId the id for which to create the request
   * @param {integer} requesterId the requesting user's id
   * @returns a promise to a new request record
   */
  const createNew = (resourceId, requesterId) => {
    return new Promise((resolve, reject) => {
      const query = {
        text: `INSERT INTO requests (resource_id, requester_id) VALUES ($1, $2) RETURNING *`,
        values: [resourceId, requesterId],
      };
      db.query(query)
        .then(res => {
          const requestRecord = res.rows[0];
          helpers.lg(`Generated request record for resource ID ${resourceId}, requested by user with ID ${requesterId}.`);
          resolve(requestRecord);
        })
        .catch(err => {
          helpers.lg(`Could not create request. ${err.detail}`);
          reject(err);
        });
    });
  };

  /**
   * Update a request record to mark it completed
   * @param {integer} requestId
   * @returns a promise to the updated request record
   */
  const markCompleted = (requestId) => {
    return new Promise((resolve, reject) => {
      const query = {
        text: `UPDATE requests SET completed_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
        values: [requestId],
      };
      db.query(query)
        .then(res => {
          const requestRecord = res.rows[0];
          helpers.lg(`Updated request record (marked completed) for resource ID ${requestId}, requested by user with ID ${requestId}.`);
          resolve(requestRecord);
        })
        .catch(err => {
          helpers.lg(`Could not update request. ${err.detail}`);
          reject(err);
        });
    });
  };
  
  
  return {
    getAll,
    getOne,
    createNew,
    markCompleted,
  };
  
};