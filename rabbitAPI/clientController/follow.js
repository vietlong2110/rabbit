/****************************************************************************************
*		This controller include all functions relating to follow/unfoloow a thing		*
****************************************************************************************/

var async = require('async');

var mongoose = require('mongoose');
var User = require('../models/users.js');

//Add a new keyword/hashtag to database
var addList = function(keyword, userId, callback) {
	User.findById(userId).exec(function(err, user) {
		if (err) { //process error case later
			console.log(err);
			callback(0);
		}

		if (user === null) { //there is no user has this id in database
			console.log('User not found!');
			callback(false);
		}

		if (user.wordList.indexOf(keyword) === -1) { //add keyword and its default setting is checked
			user.wordList.push(keyword);
			user.checkList.push(true);
			user.save(function(err) {
				if (err) { //process error case later
					console.log(err);
					callback(false);
				}
				callback(true); //just followed!
			});
		}
		else callback(true); //already followed
	});
};
module.exports.addList = addList;

//Add a list of articles from Article database to users database correspoding to their following list
var addArticle = function(keyword, userId, callback) {
	User.findById(userId).exec(function(err, user) {
		if (err) { //process error case later
			console.log(err);
			callback(false);
		}

		if (user === null) { //there is no user has this id in database
			console.log('User not found!');
			callback(false);
		}

		var Feed = require('./feed.js');

		Feed.getFeedId(keyword, function(articleIds) {

			for (i in articleIds) {
				var index = user.articles.indexOf(articleIds[i]);

				if (index === -1) {
					//contain article's ID
					user.articles.push(articleIds[i]);
					user.stars.push(false);
					//contain article's corresponding relating keywords from user following list
					user.articleKeywords.push({keywords: []}); 
					user.articleKeywords[user.articleKeywords.length - 1].keywords.push(keyword);
				}
				else if (user.articleKeywords[index].keywords.indexOf(keyword) === -1)
					user.articleKeywords[index].keywords.push(keyword);
			}

			user.save(function(err) {
				if (err) { //process error case later
					console.log(err);
					callback(false);
				}
				callback(true);
			});
		});
	});
};
module.exports.addArticle = addArticle;

//Delete an unfollow keyword from following list
var deleteList = function(keyword, userId, callback) {
	User.findById(userId).exec(function(err, user) {
		if (err) { //process error case later
			console.log(err);
			callback(false);	
		}

		if (user === null) { //there is no user has this id in database
			console.log('User not found!');
			callback(false);
		}

		var index = user.wordList.indexOf(keyword);

		if (index !== -1) { //delete from both wordlist and checklist
			user.wordList.splice(index, 1);
			user.checkList.splice(index, 1);
			user.save(function(err) {
				if (err) { //process error case later
					console.log(err);
					callback(false);
				}

				callback(true);
			});
		}
		else callback(true);
	});
};
module.exports.deleteList = deleteList;

//Delete all articles that only relate to an unfollow keyword
var deleteArticle = function(keyword, userId, callback) {
	User.findById(userId).exec(function(err, user) {
		if (err) { //process error case later
			console.log(err);
			callback(false);
		}

		if (user === null) { //there is no user has this id in database
			console.log('User not found!');
			callback(false);
		}
		var remainingArticles = [], remainingArticleKeywords = [], remainingStars = [], j = 0;

		for (i in user.articleKeywords) {
			if (user.articleKeywords[i].keywords.length === 1 
			&& user.articleKeywords[i].keywords[0] === keyword) //don't save unfollowed article
				continue;
			remainingArticles.push(user.articles[i]);
			remainingStars.push(user.stars[i]);
			remainingArticleKeywords.push({keywords: user.articleKeywords[i].keywords});
			var index = remainingArticleKeywords[j].keywords.indexOf(keyword);

			if (index !== -1) //delete unfollowed keyword
				remainingArticleKeywords[j].keywords.splice(index, 1);
			j++;
		}

		//save
		user.articles = remainingArticles;
		user.articleKeywords = remainingArticleKeywords;
		user.stars = remainingStars;
		user.save(function(err) {
			if (err) {
				console.log(err);
				callback(false);
			}

			callback(true);
		});
	});
};
module.exports.deleteArticle = deleteArticle;