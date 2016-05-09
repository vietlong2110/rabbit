# Rabbit Version 0.2.1
Type keyword, follow news with hashtag

## What's in rabbit
* Complete mobile UI for rabbit
* Some new features below

## Testing server
* A local server API for testing any server-side functionalities (rabbitAPI/serverController/serverAPI.js)

## v0.2.1 new features
* serverapi/rss for retrieving RSS feed and storing to mongodb
* Extract content from feed and store into database
* Extract keyword from the content and store its information for search purpose

## Next minor
* Apply tf-idf algorithm for searching
* Build the first client api for searching keyword

## Requirement installation
* npm
* cordova

## Run UI
* cd rabbitUI
* ionic serve (ionic serve -l)

## Run API
* cd rabbitAPI
* node app.js