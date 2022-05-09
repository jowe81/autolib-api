DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS requests CASCADE;
DROP TABLE IF EXISTS resources CASCADE;

DROP TYPE IF EXISTS resource_status;
CREATE TYPE resource_status AS ENUM ('available', 'requested', 'in use', 'retired');

CREATE TABLE users (
  id SERIAL PRIMARY KEY NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  street_address VARCHAR(255) 
  zip_code VARCHAR(255) 
  city VARCHAR(255)
  province VARCHAR(255) 
  country VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE resources (
  id SERIAL PRIMARY KEY NOT NULL,
  isbn VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  authors VARCHAR(255) NOT NULL,
  genres VARCHAR(255),
  description TEXT,
  cover_image VARCHAR(255),  
  current_possessor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status resource_status DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE requests (
  id SERIAL PRIMARY KEY NOT NULL,
  resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
  requester_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  current_possessor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);