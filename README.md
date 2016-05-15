# Rabbit Version 0.4.1
Input keywords and hashtags, follow news and social media

## What's in rabbit
* Mobile UI for rabbit
* Some new features below

## Testing server
* A local server API for testing any server-side functionalities (rabbitAPI/serverController/serverAPI.js)

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

## Next minor(0.5)
* Add follow button to each search result
* Add keyword to following list
* Ajax call to search

## Requirement installation
* npm
* cordova

## Run UI
* cd rabbitUI
* ionic serve (ionic serve -l)

## Run API
* cd rabbitAPI
* node app.js