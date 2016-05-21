var async = require('async');

var mongoose = require('mongoose');
var User = require('../models/users.js');

var addList = function(keyword, userId, callback) {
	User.findById(userId).exec(function(err, user) {
		if (err) {
			console.log(err);
			callback(0);
		}
		if (user === null) {
			console.log('User not found!');
			callback(0);
		}
		if (user.wordList.indexOf(keyword) === -1) {
			user.wordList.push(keyword);
			user.checkList.push(true);
			user.save(function(err) {
				if (err) {
					console.log(err);
					callback();
				}
				callback(1);
			});
		}
		else callback(2);
	});
};
module.exports.addList = addList;

var addArticle = function(keyword, userId, callback) {
	User.findById(userId).exec(function(err, user) {
		if (err) {
			console.log(err);
			callback(false);
		}
		var Feed = require('./feed.js');
		Feed.getFeedId(keyword, function(articleIds) {
			for (i in articleIds) {
				if (user.articles.indexOf(articleIds[i]) === -1) { //such a genius way!
					user.articles.push(articleIds[i]);
					user.articleKeywords.push({keywords: []});
				}
				if (user.articleKeywords[user.articles.indexOf(articleIds[i])]
				.keywords.indexOf(keyword) === -1)
					user.articleKeywords[user.articles.indexOf(articleIds[i])].keywords.push(keyword);
			}
			user.save(function(err) {
				if (err) {
					console.log(err);
					callback(false);
				}
				callback(true);
			});
		});
	});
};
module.exports.addArticle = addArticle;