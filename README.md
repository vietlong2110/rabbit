# Rabbit Version 0.4.3
Input keywords and hashtags, follow news and social media

## What's in rabbit
* Mobile UI for rabbit
* Some new features below

## Testing server
* A local server API for testing any server-side functionalities (rabbitAPI/serverController/serverAPI.js)

## Requirement installation
* npm
* cordova

## Run UI
* cd rabbitUI
* ionic serve (ionic serve -l)

## Run API
* cd rabbitAPI
* node app.js

## Features
### v0.1
* Mobile UI version (will update more)
* RSS Reader

### v0.2
* Extract content from feed and store into database
* Extract keyword from the content and store its information for search purpose

### v0.3
* Extract thumbnail
* Redesign the Article model
* Apply tf-idf algorithm for searching
* Build the first client API for searching keyword

### v0.4
* Call search API from UI

### v0.4.3
* Add follow button to each search result
* Put search to another ListView

## Next minor(0.5)
* Add keyword to following list
* Sanitize keyword from input