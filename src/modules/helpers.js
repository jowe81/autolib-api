const ENV = require("../environment");

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

const day = 1000 * 60 * 60 * 24;

/**
 * Return the number of full days between two dates
 * @param {Date} date1
 * @param {Date} date2
 * @returns a positive integer representing the full days between the two dates
 */
const daysBetween = (date1, date2) => {
  const difference = Math.abs(date1.getTime() - date2.getTime());
  const daysBetween = Math.floor(difference / day);
  return daysBetween;
};

/**
 * Return the date that is a given number of days away from the reference date
 * @param {Date} date reference date
 * @param {integer} days number of days
 * @returns Date
 */
const addDays = (date, days) => {
  return new Date(date.getTime() + days * day);
};

/**
 * Log to the console if in development mode
 * @param {*} msg
 */
const lg = (msg) => {
  if (ENV === "development") {
    console.log(msg);
  }
};

module.exports = {
  sanitizeId,
  lowerAndEscape,
  daysBetween,
  addDays,
  lg,
};