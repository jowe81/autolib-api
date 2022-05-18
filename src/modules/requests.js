const helpers = require("../modules/helpers");

module.exports = (db) => {
  
  const resources = require("./resources")(db);

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
          reject(err);
        });
    });
  };

  /**
   * Get all records where userId is or has been requesting a resource
   * @param {integer} userId
   * @param {boolean} pendingRequestsOnly set to true to only retrieve pending requests
   * @returns a promise to an array with request records
   */
  const getByRequestingUser = (userId, pendingRequestsOnly = false) => {
    const pendingOnly = pendingRequestsOnly ? `AND completed_at IS NULL` : ``;
    return new Promise((resolve, reject) => {
      const query = {
        text: `
          SELECT 
              requests.*,
              users.first_name AS requestee_first_name,
              users.last_name AS requestee_last_name,
              users.email AS requestee_email,
              resources.title AS resource_title,
              resources.cover_image AS resource_cover_image            
            FROM requests 
            JOIN users ON requests.requestee_id = users.id
            JOIN resources ON requests.resource_id = resources.id
            WHERE requester_id = $1 ${pendingOnly}
            ORDER BY completed_at DESC, created_at DESC
        `,
        values: [ userId ]
      };
      db.query(query)
        .then(({ rows: requests }) => {
          resolve(requests);
        })
        .catch(err => {
          helpers.lg(err);
          reject(err);
        });
    });
  };

  /**
   * Get requests on resources that are currently in userId's possession
   * @param {integer} userId
   * @param {boolean} pendingRequestsOnly set to true to only retrieve pending requests
   * @returns a promise to an array with request records
   */
  const getByRequestedUser = (userId, pendingRequestsOnly = false) => {
    return new Promise((resolve, reject) => {
      const pendingOnly = pendingRequestsOnly ? `AND completed_at IS NULL` : ``;
      const query = {
        text: `
          SELECT
              requests.*,
              users.first_name AS requester_first_name,
              users.last_name AS requester_last_name,
              users.email AS requester_email,
              resources.title AS resource_title,
              resources.cover_image AS resource_cover_image            
            FROM requests
            JOIN users ON requests.requester_id = users.id
            JOIN resources ON requests.resource_id = resources.id
            WHERE resources.current_possessor_id = $1 ${pendingOnly}
            ORDER BY requests.completed_at DESC, requests.created_at DESC
        `,
        values: [ userId ]
      };
      db.query(query)
        .then(({ rows: requests }) => {
          resolve(requests);
        })
        .catch(err => {
          helpers.lg(err);
          reject(err);
        });
    });
  };

  /**
   * Create a new request record (does not run any database consistency checks)
   * @param {integer} resourceId the id for which to create the request
   * @param {integer} requesterId the requesting user's id
   * @returns a promise to a new request record
   */
  const createNew = (resourceId, requesterId, requesteeId) => {
    return new Promise((resolve, reject) => {
      const query = {
        text: `INSERT INTO requests (resource_id, requester_id, requestee_id) VALUES ($1, $2, $3) RETURNING *`,
        values: [resourceId, requesterId, requesteeId],
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
      helpers.lg(`Updating request ${requestId}...`);
      db.query(query)
        .then(res => {
          const requestRecord = res.rows[0];
          helpers.lg(`Updated request record (marked completed) for resource ID ${requestId}, requested by user with ID ${requestId}.`);
          resources.transfer(requestRecord.resource_id, requestRecord.requester_id)
            .then((resourceRecord) => {
              helpers.lg(`Completed transfer - updated resource record for resource "${resourceRecord.title}" (id ${resourceRecord.id}) to new possessor ${resourceRecord.current_possessor_id}.`);
              resolve(requestRecord);
            })
            .catch(err => {
              const msg = `Failed to complete request and transfer resource ${requestRecord.resource_id}. ${err}`;
              helpers.lg(msg);
              reject(msg);
            });
        })
        .catch(err => {
          helpers.lg(`Could not update request. ${err.detail}`);
          reject(err);
        });
    });
  };
  
  /**
   * Delete request by ID
   * @param {integer} requestId
   * @returns a promise to the deletion of the request
   */
  const remove = requestId => {
    return new Promise((resolve, reject) => {
      getOne(requestId)
        .then(requestRecord => {
          if (requestRecord.completed_at === null) {
            const query = {
              text: `DELETE FROM requests WHERE id = $1 RETURNING *`,
              values: [requestId],
            };
            helpers.lg(`Removing request ${requestId}...`);
            db.query(query)
              .then(res => {
                const requestRecord = res.rows[0];
                helpers.lg(`Deleted request record with ID ${requestId}.`);
                resolve(requestRecord);
              });
          } else {
            const msg = `Cannot delete a request that's already completed.`;
            helpers.lg(msg);
            reject(msg);
          }
        });
    });
  };

  return {
    getAll,
    getByRequestingUser,
    getByRequestedUser,
    getOne,
    createNew,
    markCompleted,
    remove,
  };
  
};