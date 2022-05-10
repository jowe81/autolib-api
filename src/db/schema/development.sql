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




INSERT INTO resources (isbn, title, authors, genres, description, cover_image, current_possessor_id, owner_id, status)
VALUES ('9780261102439','The Lord of the Rings', 'J.R.R. Tolkien, Ian Holm, John Le Mesurier', 'Fantasy', 'The most influential fantasy novel ever written.','https://covers.openlibrary.org/b/isbn/9780261102439-M.jpg',1,2,'in use');

INSERT INTO resources (isbn, title, authors, genres, description, cover_image, current_possessor_id, owner_id, status)
VALUES ('9780596517748','Javascript: The Good Parts','Douglas Crockford', 'Programming, Javascript', 'JavaScript, having been developed and released in a hurry before it could be refined, has more than its share of the bad parts. This book scrapes away these bad features to reveal a JavaScript subset that is more reliable, readable, and maintainable than the language as a whole-a subset you can use to create extensible and efficient code.','https://covers.openlibrary.org/b/isbn/9780596517748-M.jpg',4,1,'available');

INSERT INTO resources (isbn, title, authors, genres, description, cover_image, current_possessor_id, owner_id, status)
VALUES ('9781449399023','JavaScript & jQuery: The Missing Manual','David Sawyer McFarland', 'Programming, Javascript, Jquery', 'Javascript lets you supercharge your HTML with animation, interactivity, and visual effects. You will soon be building web pages that feel and act like desktop programs, without a lot of programming.','https://covers.openlibrary.org/b/isbn/9781449399023-M.jpg',3,3,'available');

INSERT INTO resources (isbn, title, authors, genres, description, cover_image, current_possessor_id, owner_id, status)
VALUES ('9781449302399','HTML5: The Missing Manual','Matthew MacDonald', 'Programming, HTML5', 'HTML5 is more than a markup language. It is the future of the Web, and this book will get you there.','https://covers.openlibrary.org/b/isbn/9781449302399-M.jpg',2,3,'requested');


INSERT INTO requests (resource_id, requester_id) VALUES (1, 1);
INSERT INTO requests (resource_id, requester_id) VALUES (2, 1);
INSERT INTO requests (resource_id, requester_id) VALUES (3, 2);
INSERT INTO requests (resource_id, requester_id) VALUES (4, 2);