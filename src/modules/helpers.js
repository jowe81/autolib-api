/**
 * Return an integer >= 0
 * @param {any} id
 * @returns {integer}
 */
const sanitizeId = (id) => {
  const sanitizedId = parseInt(id) > 0 ? parseInt(id) : 0;
  return sanitizedId;
};

module.exports = {
  sanitizeId
}