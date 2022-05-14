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
        if (res.status === 200) {
          resolve(res.data);
        } else {
          reject(`Error: Record not found for ISBN ${isbn}`);
        }
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
const getAutolibRecord = (isbn, verifyCoverImage = true) => {
  return new Promise((resolve, reject) => {
    if (isbn) {
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
              if (verifyCoverImage && autolibRecord.cover_image) {
                helpers.lg(`Attempting to verify cover ${autolibRecord.cover_image}`);
                axios.get(autolibRecord.cover_image)
                  .then(res => {
                    const validTypes = ['image/jpeg', 'image/jpg'];
                    if (validTypes.includes(res.headers['content-type'].toLocaleLowerCase())) {
                      helpers.lg(`Successfully constructed autolib data from OL records for "${autolibRecord.title}". Verfied cover URL.`);
                      resolve(autolibRecord);
                    } else {
                      helpers.lg(`Constructed autolib data from OL records for "${autolibRecord.title}". Could not verify cover - discarded URL.`);
                      reject(`Unable to verify cover URL for "${autolibRecord.title}"`);
                    }
                  }).catch(err => {
                    helpers.lg(`Failed to retrieve cover from ${autolibRecord.cover_image} for "${book.title}", ISBN ${isbn}. Discarding URL.`);
                    delete autolibRecord.cover_image;
                    resolve(autolibRecord);
                  });
              } else {
                helpers.lg(`Successfully constructed autolib data from OL records for "${autolibRecord.title}". No cover URL.`);
                resolve(autolibRecord);
              }
            })
            .catch(err => {
              helpers.lg(`Failed to retrieve Author data for "${book.title}", ISBN ${isbn}.`);
              reject(err);
            });
        })
        .catch(err => {
          helpers.lg(`Failed to retrieve OL data for ISBN ${isbn}.`);
          reject(err);
        });
    } else {
      reject(`Error: empty ISBN`);
    }
  });
};

module.exports = {
  getAutolibRecord,
};