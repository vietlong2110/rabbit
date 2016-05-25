# Rabbit Version 0.6.4
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

## Issues
* lagging animation from plus-icon to check-icon when adding a new keyword

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

### v0.5
* Add follow button to each search result
* Put search to another ListView
* Add keyword to following list
* Sanitize keyword from input

### v0.6
* Call post api from UI to add keyword to database
* Call get api from UI to get following list from database
* Call post api from UI to add feed to database
* Call get api from UI to load feed from database
* Add hashtag to each newsfeed

### v0.6.4
* Comment everything
* Redesign menu side, following list to popup setting
* Call post api from UI to check/uncheck a keyword

## Next minor(v0.7)
* Call post api from UI to unfollow a keyword
* Redesign search UI