const helpers = require("../modules/helpers");

module.exports = (db) => {

  
  /**
   * Get an object with the resource record
   * @param {integer} resourceId
   * @returns an object with the resource record
   */
  const getOne = (resourceId, withStatus = true) => {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM resources WHERE id = $1::integer`, [ helpers.sanitizeId(resourceId) ])
        .then(({ rows: records }) => {
          if (records.length > 0) {
            const record = records[0];
            if (withStatus) {
              getStatus(resourceId)
                .then(status => {
                  record.status = status;
                  resolve(record);
                })
                .catch(err => reject(err));
            } else {
              resolve(record);
            }
          } else {
            resolve({});
          }
        })
        .catch(err => reject(err));
    });
  };

  /**
   * Check if a resource with given ID exists
   * @param {integer} resourceId
   * @returns promise to a boolean
   */
  const exists = (resourceId) => {
    return new Promise((resolve, reject) => {
      getOne(resourceId, false)
        .then(resourceRecord => {
          const exists = resourceRecord.id > 0 ? true : false;
          resolve(exists);
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
    case "authors":
      order = `ORDER BY authors`;
      break;
    case "genres":
      order = `ORDER BY genres`;
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
   * @param {boolean} withStatus retrieve the status for each resource
   * @returns a promise to an array with resource objects
   */
  const getAll = (query, withStatus = false) => {
    return new Promise((resolve, reject) => {
      const queryString = buildResourceSearchQuery(query);
      db.query(queryString)
        .then(({ rows: resources }) => {
          if (withStatus) {
            //This implementation is horribly inefficient; should determine status in SQL eventually!
            const promises = [];
            resources.forEach(resource => {
              promises.push(getOne(resource.id));
            });
            Promise.all(promises)
              .then(resources => {
                resolve(resources);
              })
              .catch(err => reject(err));
          } else {
            resolve(resources);
          }
        })
        .catch(err => reject(err));
    });
  };

  /**
   * Get resources belonging to user
   * @param {userId} userId
   * @returns a promise to an array of resource objects
   */
  const getByOwner = (userId) => {
    return new Promise((resolve, reject) => {
      const query = {
        text: `SELECT * FROM resources WHERE owner_id = $1 ORDER BY title`,
        values: [ userId ],
      };
      db.query(query)
        .then(({ rows: resources }) => {
          resolve(resources);
        })
        .catch(err => reject(err));
    });
  };
  
  /**
   * Take data from post request and create new resource record
   * @param {object} reqBody
   * @returns a promise to the new returning record
   */
  const createNew = (reqBody, ownerId) => {
    return new Promise((resolve, reject) => {
      const query = {
        text: `
          INSERT INTO resources (isbn, title, authors, genres, description, cover_image, current_possessor_id, owner_id, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
        `,
        values: [
          reqBody.isbn,
          reqBody.title,
          reqBody.authors,
          reqBody.genres,
          reqBody.description,
          reqBody.cover_image,
          reqBody.current_possessor_id,
          ownerId,
          reqBody.status || 'available',
        ]
      };
      db.query(query)
        .then(res => {
          const newRecord = res.rows[0];
          resolve(newRecord);
          helpers.lg(`Inserted new resource ${newRecord.title} with ID ${newRecord.id} successfully.`);
        })
        .catch(err => {
          reject(err);
          helpers.lg(err);
        });
    });
  };

  
   

  /**
   * Get requests for a resource
   * @param {integer} resourceId ID of the resource to check
   * @param {string} status filter by status: pending or completed
   * @returns a promise to an array of request records or an empty array
   */

  const getRequests = (resourceId, status) => {
    const query = {
      values: [ resourceId ]
    };
    if (status === 'pending') {
      query.text = `SELECT * FROM requests WHERE resource_id = $1 AND completed_at IS NULL`;
    } else {
      query.text = `SELECT * FROM requests WHERE resource_id = $1 AND completed_at IS NOT NULL ORDER BY completed_at DESC`;
    }
    return new Promise((resolve, reject) => {
      db.query(query)
        .then(({rows: requestRecords}) => {
          resolve(requestRecords);
        })
        .catch(err => {
          reject(err);
        });
    });
  };
  
  /**
   * Get pending requests for a resource (should never be more than one)
   * @param {integer} resourceId ID of the resource to check
   * @returns a promise to an array of request records or an empty array
   */
  const getPendingRequests = (resourceId) => getRequests(resourceId, 'pending');

  /**
   * Get completed requests for a resource in descending chronological order
   * @param {integer} resourceId ID of the resource to check
   * @returns a promise to an array of request records or an empty array
   */
  const getCompletedRequests = (resourceId) => getRequests(resourceId, 'completed');

  /**
   * Get current status of a resource
   * @param {integer} resourceId the ID of the resource to check
   * @returns an object with a text property, and, for 'in use' resources, an availableAt property with a future date
   * and a boolean available property
   */
  const getStatus = resourceId => {
    return new Promise((resolve, reject) => {
      const status = {};
      status.available = false;
      helpers.lg(`Fetching status for resource with id ${resourceId}...`);
      getPendingRequests(resourceId)
        .then(pendingRequests => {
          if (pendingRequests && pendingRequests.length) {
            helpers.lg(`  Resource has been requested (request ID: ${pendingRequests[0].id})`);
            status.text = 'requested';
            resolve(status);
          } else {
            helpers.lg("  No pending request - checking for completed ones...");
            getCompletedRequests(resourceId)
              .then(completedRequests => {
                if (completedRequests && completedRequests.length) {
                  helpers.lg(`  Resource has ${completedRequests.length} completed requests.`);
                  const mostRecentRequest = completedRequests[0];
                  const daysSince = helpers.daysBetween(mostRecentRequest.completed_at, new Date());
                  const isAvailable = daysSince > process.env.BORROWING_SPAN_DAYS;
                  helpers.lg(`  Latest completed request was completed ${daysSince} days ago (borrowing span is ${process.env.BORROWING_SPAN_DAYS}).`);
                  if (isAvailable) {
                    status.text = 'available';
                    status.available = true;
                    helpers.lg(`  Resource is available.`);
                  } else {
                    status.text = 'in use';
                    status.availableAt = helpers.addDays(mostRecentRequest.completed_at, process.env.BORROWING_SPAN_DAYS);
                    helpers.lg(`  Resource is in use, will become available at ${status.availableAt}`);
                  }
                  resolve(status);
                } else {
                  status.text = 'available';
                  status.available = true;
                  helpers.lg(`  Resource has no completed requests either and is available.`);
                  resolve(status);
                }
              })
              .catch(err => reject(err));
          }
        })
        .catch(err => reject(err));
    });
  };

  return {
    getAll,
    getByOwner,
    getOne,
    exists,
    createNew,
    getPendingRequests,
    getStatus,
  };
  
};