# API Backend for AutoLib
...description to come

# API Documentation
## Resources

### GET /api/resources
#### Retrieve Catalogue of Resources
```
GET /api/resources                     #Get all
GET /api/resources?limit=n             #Get a maximum of n records
GET /api/resources?orderby=title       #Order by title
GET /api/resources?orderby=created_at  #Order by most recently added
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