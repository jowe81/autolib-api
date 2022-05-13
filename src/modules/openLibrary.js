const axios = require("axios");
const helpers = require("../modules/helpers");

/**
 * Retrieve an OpenLibrary book record by ISBN
 * @param {*} isbn An ISBN-10 or ISBN-13
 * @returns a promise to the OpenLibrary record for the given ISBN
 */
const getBookRecord = isbn => {
  return new Promise((resolve, reject) => {
    const url = `https://openlibrary.org/isbn/${isbn}`;
    helpers.lg(`Querying ${url}`);
    axios.get(url)
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        reject(err);
      });
  });
};

/**
 * Construct a string with names of the authors of a book
 * @param {object} book An OpenLibrary book record
 * @returns a promise to a comma-separated string with authors names
 */
const getAuthorsString = book => {
  return new Promise((resolve, reject) => {
    const promises = [];
    if (book.authors && book.authors.length) {
      book.authors.forEach(authorObj => {
        const url = `https://openlibrary.org${authorObj.key}.json`;
        helpers.lg(`Querying ${url}`);
        promises.push(axios.get(url));
      });
      Promise.all(promises)
        .then(results => {
          const names = [];
          results.forEach(result => {
            names.push(result.data.name);
          });
          const authorsString = names.join(', ');
          resolve(authorsString);
        })
        .catch(err => {
          reject(err);
        });
    } else {
      resolve('N/A');
    }
  });
};

/**
 * Construct an OpenLibrary cover url from an OpenLibrary book record
 * @param {object} book An OpenLibrary book record
 * @param {string} size L, M or S
 * @returns a cover URL or undefined
 */
const getCoverURL = (book, size = "L") => {
  const isbn13 = book.isbn_13 && book.isbn_13.length ? book.isbn_13[0] : undefined;
  const isbn10 = book.isbn_10 && book.isbn_10.length ? book.isbn_10[0] : undefined;
  const isbn = isbn13 || isbn10;
  const coverURL = isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-${size.toUpperCase()}.jpg` : undefined;
  return coverURL;
};

/**
 * Construct an autolib-friendly resource record from OpenLibrary data
 * @param {string} isbn the ISBN for the book requested
 * @returns a promise to an object with isbn, title, authors, description, and coverImage properties
 */
const getAutolibRecord = (isbn) => {
  return new Promise((resolve, reject) => {
    helpers.lg(`Querying OpenLibrary with ISBN ${isbn}...`);
    getBookRecord(isbn)
      .then(book => {
        getAuthorsString(book)
          .then(authorsString => {
            const autolibRecord = {};
            autolibRecord.isbn = isbn;
            autolibRecord.title = book.title;
            autolibRecord.authors = authorsString;
            autolibRecord.description = book.description ? book.description.value : undefined;
            autolibRecord.cover_image = getCoverURL(book);
            helpers.lg(`Successfully constructed autolib data from OL records.`);
            resolve(autolibRecord);
          });
      })
      .catch(err => {
        helpers.lg(`Failed to retrieve OL data for ISBN ${isbn}`);
        reject(err);
      });
  });
};

module.exports = {
  getAutolibRecord,
};