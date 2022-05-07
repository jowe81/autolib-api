/**
 * Return an integer >= 0
 * @param {any} id
 * @returns {integer}
 */
const sanitizeId = (id) => {
  const sanitizedId = parseInt(id) > 0 ? parseInt(id) : 0;
  return sanitizedId;
};

/**
 * Return a string in lower case with single quotes doubled for Postgresql
 * @param {string} s
 * @returns a lower case string safe to insert into database
 */
const lowerAndEscape = s => {
  return s.replaceAll(`'`, `''`).toLowerCase();
};

module.exports = {
  sanitizeId,
  lowerAndEscape,
};