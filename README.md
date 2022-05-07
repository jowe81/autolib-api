# API Backend for AutoLib
Currently in development.

To run:
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
---
## Dev Updates:
May 7
- GET /api/resources now supporting more filtering (parameters as described below)

May 6
- Created some seed data 
- GET /api/debug/reset now functional
- GET /api/resources now functional, with parameters as described below
- GET /api/resouces/:id now functional

---
---

# API Documentation
## Resources

### GET /api/resources
#### Retrieve/Search Catalogue of Resources
```
GET /api/resources                     #Get all
GET /api/resources?limit=n             #Limit result set

GET /api/resources?order_by=title      #Order by title
GET /api/resources?order_by=created_at #Order by most recently added

GET /api/resources?title=rings              #Search for title
GET /api/resources?author=Tolkien           #Search by author
GET /api/resources?genre=fantasy            #Search by genre
GET /api/resources?owner_id=1               #Search by owner ID
GET /api/resources?current_possessor_id=1   #Search by current possessor
```

### POST /api/resources 
#### Create resource record

##### Expects object of this format:
```
{
  isbn: "9780261102439",
  title: "The Lord of the Rings",
  description: "The most influential fantasy novel ever written.",
  authors: [
    "J.R.R. Tolkien",
    "Ian Holm",
    "John Le Mesurier",
    "Michael Hordern",
    "Peter Woodthorpe",
    "Robert Stephens"
  ],
  genres: [ 
    "Fiction",
    "Fantasy"
  ]
}

```
Optional fields:
- owner_id (will default to current user)
- current_possessor_id (will default to current user)
- status (will default to 'available')

##### Returns ID of newly created resource