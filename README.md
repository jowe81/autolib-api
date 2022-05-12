# API Backend for AutoLib
Currently in development.

## Dev Updates:
May 11 (Johannes)
- ```GET /api/requests/from_me_for_others``` now working; returns all requests initiated by current user.
- ```GET /api/requests/from_me_for_others/pending``` now working; returns all requests initiated by the current user that are still pending.
- ```GET /api/requests/from_others_for_me``` now working. Will return all requests FOR the current user (pending or completed)
- ```GET /api/requests/from_others_for_me/pending``` now working. Get all pending requests FOR the current user.
- ```POST /api/requests``` now working! Expects a single property, ```resourceId```. Request creation will only succeed if resource is available, that is,
  - it exists
  - it does not have an open request
  - it does not have a completed request that has completed less than env.BORROWING_SPAN_DAYS days ago
  - For more detail see flow chart for dynamic status determination available at https://github.com/merwynpgithub/decentralized-library/blob/master/Requests%20and%20Resource%20Status.pdf
- ```PUT /requests/:id/complete``` now working. Request will be marked as completed
  - if the request is in fact open
  - if the client session user owns the request
- ```GET /api/resources``` now supports ```?order_by=authors```, ```?order_by=genres```

May 10 (Johannes)
- Schema adjustment! 
  - Redundant status fields have been removed from resources and requests tables
  - requests table has an added completed_at field (from which status can be inferred)
  - Make sure to run /api/debug/reset before testing!
- ```GET /resources``` and ```GET /resources/:id``` now have status object (dynamically queried) instead of string
- ```PUT /users``` now working. Expects full user object - fields missing in the user record will be deleted from database.

May 9 (Johannes)
- ```POST /login``` now working. Expects object with email address. Sets session cookie.
- ```GET /logout``` now working. Destroys session.
- ```GET /me``` will return the current user record if session is logged in.
- ```GET /api/openlibrary/by_isbn/:isbn``` now working. Takes any isbn10 or isbn13 an object of this form (or an error):
  ```
  {
    isbn: "0596516681",
    title: "Head First Servlets and JSP",
    authors: "Bert Bates, Bryan Basham",
    coverImage: "https://covers.openlibrary.org/b/isbn/9780596516680-L.jpg",
    description: "An important book about programming..."
  }
  ```

May 8 (Johannes)
- Schema: resources table now using strings for authors and genres fields (no separate tables)
- ```POST /api/resources``` now working, expecting JSON data as follows (example):
  ```
  {
    "isbn": "9780261102439",
    "title": "The Lord of the Rings",
    "authors": "J.R.R. Tolkien, Ian Holm, John Le Mesurier",
    "description": "The most influential fantasy novel ever written.",
    "genres": "Fiction, Fantasy"    
  }
  ```
  - returns the newly created record or an error
  - ```isbn```, ```title``` and ```authors``` are required
  - ```description``` and ```genres``` are optional
  - The fields ```cover_image```, ```current_possessor```, ```owner``` and ```status``` are optional at this time as well. We'll likely supply that data on the backend once we've figured out sessions.
- ```GET /api/users``` now functional (returns all users, not filterable, we probably do not need this in production at all - convenience functionality for now)
- ```GET /api/users/:id``` now functional
- ```POST /api/users``` now working, expecting JSON data as follows (example):
  ```
  {
    "first_name": "Elizabeth",
    "last_name": "Williams",
    "email": "elizabeth@gmail.com",
    "street_address": "507 E 6th Ave",
    "zip_code": "V5T 1K9",
    "province": "BC",
    "city": "Vancouver",
    "country": "Canada"
  }
  ```
  - returns the newly created record or an error

May 7 (Johannes)
- ```GET /api/resources``` now supporting more filtering (parameters as described below)

May 6 (Johannes)
- Created some seed data 
- ```GET /api/debug/reset``` now functional
- ```GET /api/resources``` now functional, with parameters as described below
- ```GET /api/resouces/:id``` now functional

---
## Installation Instructions:
1. Clone repository and change into app directory
```
  git clone https://github.com/jowe81/autolib-api && cd autolib-api
```
2. Create .env file
```
  cp .env.example .env.development
```

3. If needed, adjust ```.env.development``` to match your Postgres configuration

4. Install with dev dependencies
```
  npm install --dev
```

5. Create the database:
```
  psql
  CREATE DATABASE autolib_development;
```

6. Start the API server
```
  npm run dev
```

7. _IMPORTANT_: Visit http://localhost:8001/api/debug/reset to create the tables and seed the database

---

# API Documentation
## Debug/Reset
### Recreate and seed database
```
GET /api/debug/reset
```
## Resources

### GET /api/resources
#### Retrieve/Search Catalogue of Resources
##### Get all:
```
#Get all
GET /api/resources                     

#Limit result set
GET /api/resources?limit=n             
```
##### Filter:
```
#Search for title
GET /api/resources?title=rings

#Search by author
GET /api/resources?author=Tolkien

#Search by genre
GET /api/resources?genre=fantasy

#Search by owner ID
GET /api/resources?owner_id=1

#Search by current possessor
GET /api/resources?current_possessor_id=1
```
##### Order results:
```
#Order by title
GET /api/resources?order_by=title

#Order by most recently added
GET /api/resources?order_by=created_at 
```


### GET /api/resources/:id
#### Retrieve a single resource record with related data
##### Get the resource with id 3:
```
GET /api/resources/3
```

### POST /api/resources 
#### Create resource record

##### Expects object of this format:
```
{
  isbn: "9780261102439",
  title: "The Lord of the Rings",
  description: "The most influential fantasy novel ever written.",
  authors: "J.R.R. Tolkien, Ian Holm, John Le Mesurier",
  genres: "Fiction, Fantasy",  
}

```
Optional fields:
- owner_id (will default to current user)
- current_possessor_id (will default to current user)
- status (will default to 'available')
- cover_image (URL)

##### Returns ID of newly created resource

---
## Requests

Flow for putting in a request:

