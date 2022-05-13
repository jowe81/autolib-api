/*
  Read text file with ISBNs from command line argument,
  query OpenLibrary and add resource records to database.
*/

const isbnFile = process.argv[2];

const ENV = require("../../environment");
const dotenv = require('dotenv');
dotenv.config({path: `../../../.env.${ENV}`});

const db = require("../../db");
const resources = require("../../modules/resources")(db);
const ol = require("../../modules/openlibrary");
const fs = require('fs');

console.log(`Attempting to read ${isbnFile}...`);

fs.readFile('./isbns.txt', 'utf8', (err, data) => {
  if (err) {
    console.log("Error!", err);
  } else {
    const isbns = data.split(/\r?\n/);
    const promisesOL = [];
    isbns.forEach(isbn => {
      promisesOL.push(ol.getAutolibRecord(isbn));
    });
    Promise.all(promisesOL)
      .then(autolibRecords => {
        const promisesInsert = [];
        autolibRecords.forEach(autolibRecord => {
          promisesInsert.push(resources.createNew(autolibRecord));
        });
        Promise.all(promisesInsert)
          .then(results => {
            results.forEach(record => {
              console.log(`Added book "${record.title}" by ${record.authors} - Resource ID: ${record.id}`);
            });
            console.log(`Inserted ${results.length} records into the database.`);
            console.log(`CTRL+C to exit.`);
          })
          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {
        console.log(err);
      });
  }
});
