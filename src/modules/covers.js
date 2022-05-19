const openLibrary = require("./openLibrary");
const helpers = require("./helpers");



const fs = require('fs');
const client = require('https');

const dataDir = `${global.__basedir}/../data/`;


/* This function copied from: https://scrapingant.com/blog/download-image-javascript */
const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    client.get(url, (res) => {
      if (res.statusCode === 200) {
        const gotImage = res.rawHeaders.includes(`image/jpeg`);
        if (gotImage) {
          helpers.lg(`Downloading from ${url}`);
          res.pipe(fs.createWriteStream(filepath))
            .on('error', reject)
            .once('close', () => resolve(filepath));
        } else {
          helpers.lg(`No image present at ${url}`);
          reject(`No image present at ${url}`);
        }
      } else {
        // Consume response data to free up memory
        res.resume();
        helpers.lg(`Error: unable to download from ${url}`);
        reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
      }
    });
  });
};

const verifyDirectory = dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return fs.existsSync(dir);
};

const getPathInfo = isbn => {
  const dir = `${dataDir}covers/`;
  if (verifyDirectory(dir)) {
    const pathInfo = openLibrary.getCoverURL({ isbn }, "L", true);
    pathInfo["localPath"] = `${dir}${pathInfo.filename}`;
    return pathInfo;
  } else {
    helpers.lg(`Error: unable to verify directory: ${dir}`);
    return {};
  }
};

const getFromFile = localPath => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(localPath)) {
      fs.readFile(localPath, function(err, data) {
        if (err) throw err;
        err ? reject(err) : resolve(data);
      });
    } else {
      helpers.lg(`File does not exist...`);
      reject(`File ${localPath} doesn't exist.`);
    }
  });
};

const createPlaceholder = localPath => {
  const stockImg = `${dataDir}stock/no_image.jpg`;
  if (fs.existsSync(stockImg)) {
    fs.copyFileSync(stockImg, localPath);
    helpers.lg(`Got stock image ${stockImg}, copying to placeholder ${localPath}`);
    return true;
  }
  return false;
};

const retrieve = isbn => {
  const pathInfo = getPathInfo(isbn);
  return new Promise((resolve, reject) => {
    getFromFile(pathInfo.localPath)
      .then(imgdata => {
        helpers.lg(`Retrieved from disk: ${pathInfo.filename}`);
        resolve(imgdata);
      })
      .catch(err => {
        downloadImage(pathInfo.coverURL, pathInfo.localPath)
          .then(res => {
            getFromFile(pathInfo.localPath)
              .then(imgdata => {
                resolve(imgdata);
              });
          })
          .catch(err => {
            helpers.lg(`Unable to download image from ${pathInfo.coverURL}`);
            const makePlaceholder = createPlaceholder(pathInfo.localPath);
            helpers.lg(`Placeholder created: ${makePlaceholder}`);
            if (createPlaceholder(pathInfo.localPath)) {
              getFromFile(pathInfo.localPath)
                .then(imgdata => {
                  helpers.lg(`Serving stock placeholder image`);
                  resolve(imgdata);
                })
                .catch(err => {
                  helpers.lg(`Unable to serve placeholder image`);
                  reject(err);
                });
            } else {
              reject(`Unable to serve image or placeholder. ${err}`);
            }
          });
      });
  });

};

module.exports = {
  retrieve,
};