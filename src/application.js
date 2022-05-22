const fs = require("fs");
const path = require("path");

const cookieSession = require("cookie-session");
const express = require("express");
const bodyparser = require("body-parser");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

const db = require("./db");

const read = (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(
      file,
      {
        encoding: "utf-8"
      },
      (error, data) => {
        if (error) return reject(error);
        resolve(data);
      }
    );
  });
};



const application = (ENV) => {
  
  //Enable sessions
  app.set('trust proxy', 1); // trust first proxy
  app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
  }));

  app.use(morgan('tiny'));
  app.use(cors());
  app.use(helmet());
  app.use(bodyparser.json());
  
  //Load Routes
  const users = require("./routes/users");
  const resources = require("./routes/resources");
  const requests = require("./routes/requests");
  const session = require("./routes/session");
  const openLibrary = require("./routes/openLibrary");
  app.use("/", session(db));
  app.use("/api", users(db));
  app.use("/api", resources(db));
  app.use("/api", requests(db));
  app.use("/api", openLibrary());

  const errorHandler = require("./middleware/errorHandler");
  app.use(errorHandler);

  if (ENV === "development" || ENV === "test") {
    Promise.all([
      read(path.resolve(__dirname, `db/schema/create.sql`)),
      read(path.resolve(__dirname, `db/schema/${ENV}.sql`))
    ])
      .then(([create, seed]) => {
        app.get("/api/debug/reset", (request, response) => {
          db.query(create)
            .then(() => db.query(seed))
            .then(() => {
              console.log("Database Reset");
              response.status(200).send("Database Reset");
            });
        });
      })
      .catch(error => {
        console.log(`Error setting up the reset route: ${error}`);
      });
  }

  app.close = function() {
    return db.end();
  };

  return app;
};

module.exports = application;