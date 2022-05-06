INSERT INTO users (first_name, last_name, email, street_address, zip_code, city, province, country)
VALUES ('Stephanie', 'Smith', 'stephanie@gmail.com', '356 10th Avenue Bikeway', 'V5Y 1S3', 'Vancouver', 'BC', 'Canada');

INSERT INTO users (first_name, last_name, email, street_address, zip_code, city, province, country)
VALUES ('Mark', 'Spencer', 'mark@gmail.com', '2812 Alberta St', 'V5Y 1T8', 'Vancouver', 'BC', 'Canada');

INSERT INTO users (first_name, last_name, email, street_address, zip_code, city, province, country)
VALUES ('Tanya', 'Shoemaker', 'tanya@gmail.com', '106 E 18th Ave', 'V5V 1E3', 'Vancouver', 'BC', 'Canada');

INSERT INTO users (first_name, last_name, email, street_address, zip_code, city, province, country)
VALUES ('Ryan', 'Sayson', 'ryan@gmail.com', '3616 W 3rd Ave', 'V6R 1L9', 'Vancouver', 'BC', 'Canada');

INSERT INTO users (first_name, last_name, email, street_address, zip_code, city, province, country)
VALUES ('John', 'Chung', 'john@gmail.com', '2005 W 43rd Ave', 'V6M 2C8', 'Vancouver', 'BC', 'Canada');

INSERT INTO users (first_name, last_name, email, street_address, zip_code, city, province, country)
VALUES ('Lyndon', 'Mariner', 'lyndon@gmail.com', '4888 Selkirk St', 'V6H 3A3', 'Vancouver', 'BC', 'Canada');

INSERT INTO users (first_name, last_name, email, street_address, zip_code, city, province, country)
VALUES ('Mariah', 'MacLeod', 'mariah@gmail.com', '1225 Nanton Ave', 'V6H 2C7', 'Vancouver', 'BC', 'Canada');

INSERT INTO users (first_name, last_name, email, street_address, zip_code, city, province, country)
VALUES ('Carolin', 'McDonald', 'carolin@gmail.com', '1255 Devonshire Crescent', 'V6H 2G2', 'Vancouver', 'BC', 'Canada');




INSERT INTO resources (isbn, title, description, cover_image, current_possessor_id, owner_id, status)
VALUES ('9780261102439','The Lord of the Rings','The most influential fantasy novel ever written.','https://covers.openlibrary.org/b/isbn/9780261102439-M.jpg',1,2,'in use');

INSERT INTO resources (isbn, title, description, cover_image, current_possessor_id, owner_id, status)
VALUES ('9780596517748','Javascript: The Good Parts','JavaScript, having been developed and released in a hurry before it could be refined, has more than its share of the bad parts. This book scrapes away these bad features to reveal a JavaScript subset that is more reliable, readable, and maintainable than the language as a whole-a subset you can use to create extensible and efficient code.','https://covers.openlibrary.org/b/isbn/9780596517748-M.jpg',4,1,'available');



INSERT INTO authors (name) VALUES ('J.R.R. Tolkien');
INSERT INTO authors (name) VALUES ('Ian Holm');
INSERT INTO authors (name) VALUES ('John Le Mesurier');
INSERT INTO authors (name) VALUES ('Michael Hordern');
INSERT INTO authors (name) VALUES ('Peter Woodthorpe');
INSERT INTO authors (name) VALUES ('Robert Stephens');
INSERT INTO authors (name) VALUES ('Douglas Crockford');

INSERT INTO authors_resources (resource_id, author_id) VALUES (1,1);
INSERT INTO authors_resources (resource_id, author_id) VALUES (1,2);
INSERT INTO authors_resources (resource_id, author_id) VALUES (1,3);
INSERT INTO authors_resources (resource_id, author_id) VALUES (1,4);
INSERT INTO authors_resources (resource_id, author_id) VALUES (1,5);
INSERT INTO authors_resources (resource_id, author_id) VALUES (1,6);
INSERT INTO authors_resources (resource_id, author_id) VALUES (2,7);

INSERT INTO genres (name) VALUES ('Fantasy');
INSERT INTO genres (name) VALUES ('Thriller');
INSERT INTO genres (name) VALUES ('Science-Fiction');
INSERT INTO genres (name) VALUES ('Non-fiction');
INSERT INTO genres (name) VALUES ('Biography');
INSERT INTO genres (name) VALUES ('Romance');
INSERT INTO genres (name) VALUES ('Programming');
INSERT INTO genres (name) VALUES ('JavaScript');

INSERT INTO genres_resources (resource_id, genre_id) VALUES (2,7);
INSERT INTO genres_resources (resource_id, genre_id) VALUES (2,8);


