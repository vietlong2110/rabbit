# Rabbit Version 0.8.5
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

### v0.7
* Comment everything
* Redesign menu side, following list to popup setting
* Call post api from UI to check/uncheck a keyword and reload corresponding newfeed
* Call post api from UI to unfollow a keyword

### v0.8
* Redesign search UI (both in settings and newsfeed)
* Create following list view and favorites view
* Put all client API to services
* Create loading effect (all necessary action)
* Redesign follow/unfollow button
* Add announcement popups in all necessary action

### v0.9
* Reconstruct the whole UI from only side-menu design to tabs-side-menu design
* Call get api from UI to get only articles relating to a keyword but display them to newsfeed
* Call post api from UI to update favorite articles/ update newsfeed
* Store newsfeed current state in order to navigate back

## Next minor(v0.10)
* Create infinite scroll, pull-refresh UI feature
* Redesign get api to get feed with pagination
* Redesign reading UI