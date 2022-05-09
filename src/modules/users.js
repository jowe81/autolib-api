const req = require("express/lib/request");
const helpers = require("../modules/helpers");

module.exports = (db) => {

  
  /**
   * Get an object with the user record
   * @param {integer} userId
   * @returns an object with the user record
   */
  const getOne = (userId) => {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM users WHERE id = $1::integer`, [ helpers.sanitizeId(userId) ])
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

  const findByEmail = (email) => {
    return new Promise((resolve, reject) => {
      const query = {
        text: `SELECT * FROM users WHERE email = $1`,
        values: [ email ]
      };
      db.query(query)
        .then(({ rows: records }) => {
          if (records.length > 0) {
            const record = records[0];
            resolve(record);
          } else {
            reject(`Couldn't find a user with email ${email}`);
          }
        })
        .catch(err => reject(err));
    });
  };

  /**
   * Get all user records
   * @returns an array with user records
   */
  const getAll = (query) => {
    return new Promise((resolve) => {
      const queryString = `SELECT * FROM users;`;
      db.query(queryString)
        .then(({ rows: resources }) => {
          resolve(resources);
        });
    });
  };
  
  /**
   * Take data from post request and create new user record
   * @param {object} reqBody
   * @returns a promise to the new user id
   */
  const createNew = (reqBody) => {
    return new Promise((resolve, reject) => {
      const query = {
        text: `
          INSERT INTO users (first_name, last_name, email, street_address, zip_code, city, province, country)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
        `,
        values: [
          reqBody.first_name,
          reqBody.last_name,
          reqBody.email,
          reqBody.street_address,
          reqBody.zip_code,
          reqBody.city,
          reqBody.province,
          reqBody.country
        ]
      };
      db.query(query)
        .then(res => {
          const newRecord = res.rows[0];
          resolve(newRecord);
          helpers.lg(`Inserted new user ${newRecord.first_name} ${newRecord.last_name} with ID ${newRecord.id} successfully.`);
        })
        .catch(err => {
          reject(err);
          helpers.lg(err);
        });
    });
  };

  return {
    getAll,
    getOne,
    findByEmail,
    createNew,
  };
  
};