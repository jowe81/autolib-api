/*
  Read text file with ISBNs from command line argument,
  query OpenLibrary and add resource records to database.
*/

const isbnDir = process.argv[2]; //Directory with ISBN text files
const noUsers = process.argv[3] || 8; //Number of users for randomly assigning owners and possessors

const ENV = require("../../environment");
const dotenv = require('dotenv');
dotenv.config({path: `../../../.env.${ENV}`});

const db = require("../../db");
const resources = require("../../modules/resources")(db);
const ol = require("../../modules/openlibrary");
const fs = require('fs');
const path = require('path');
const { rejects } = require("assert");
console.log(`Attempting to read ${isbnDir}...`);


fs.readdir(isbnDir, (err, files) => {
  files.forEach(file => {
    let genre = path.basename(file,'.txt');
    genre = genre[0].toUpperCase() + genre.substring(1);
    processIsbnFile(file, genre);
  });
});

const randomInt = max => {
  return Math.ceil(Math.random() * max);
};

const processIsbnFile = (filename, genre) => {
  console.log(`Processing ${filename}, genre ${genre}...`);
  fs.readFile(isbnDir + '/' + filename, 'utf8', (err, data) => {
    if (err) {
      console.log("Error!", err);
    } else {
      const isbns = data.split(/\r?\n/);
      const promisesOL = [];
      isbns.forEach(isbn => {
        promisesOL.push(ol.getAutolibRecord(isbn));
      });
      Promise.allSettled(promisesOL)
        .then(values => {
          values.forEach((values) => {
            const status = values.status;
            const autolibRecord = values.value;
            if (status === 'fulfilled') {
              autolibRecord.genres = genre;
              autolibRecord.current_possessor_id = randomInt(noUsers);
              resources.createNew(autolibRecord, randomInt(noUsers))
                .then(record => {
                  console.log(`Added book "${record.title}" by ${record.authors}, genre ${genre}. resource ID: ${record.id}`);
                })
                .catch(err => console.log("Failed to insert record!", err));
            } else {
              console.log(`Failed to retrieve book record from OpenLibrary`);
            }
          });
        });
    }
  });
};