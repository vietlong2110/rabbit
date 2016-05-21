/********************************************************************************
*		This controller include all functions relating to follow a thing		*
********************************************************************************/

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
			callback(0);
		}

		if (user.wordList.indexOf(keyword) === -1) { //add keyword and its default setting is checked
			user.wordList.push(keyword);
			user.checkList.push(true);
			user.save(function(err) {
				if (err) { //process error case later
					console.log(err);
					callback();
				}
				callback(1); //just followed!
			});
		}
		else callback(2); //already followed
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
			callback(0);
		}

		var Feed = require('./feed.js');

		Feed.getFeedId(keyword, function(articleIds) {

			//Design a model of database in such a genius way!
			for (i in articleIds) {
				if (user.articles.indexOf(articleIds[i]) === -1) {
					//contain article's ID
					user.articles.push(articleIds[i]);
					//contain article's corresponding relating keywords from user following list
					user.articleKeywords.push({keywords: []}); 
				}
				if (user.articleKeywords[user.articles.indexOf(articleIds[i])]
				.keywords.indexOf(keyword) === -1)
					user.articleKeywords[user.articles.indexOf(articleIds[i])].keywords.push(keyword);
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