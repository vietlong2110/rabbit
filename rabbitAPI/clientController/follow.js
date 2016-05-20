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

var getList = function(userId, callback) {
	User.findById(userId).exec(function(err, user) {
		if (err) {
			console.log(err);
			callback([], []);
		}
		if (user === null) {
			console.log('User not found!');
			callback([], []);
		}
		callback(user.wordList, user.checkList);
	});
};
module.exports.getList = getList;

var addArticle = function(keyword, userId, callback) {
	User.findById(userId).exec(function(err, user) {
		if (err) {
			console.log(err);
			callback(false);
		}
		var Feed = require('./feed.js');
		Feed.getFeedId(keyword, function(articleIds) {
			async.each(articleIds, function(articleId, cb) {
				if (user.articles.indexOf(articleId) === -1) { //such a genius way!
					user.articles.push(articleId);
					user.articleKeywords.push({
						keywords: []
					});
					// user.articleKeywords[user.articles.indexOf(articleId)].keywords.push(keyword);
				}
				user.articleKeywords[user.articles.indexOf(articleId)].keywords.push(keyword);
				user.save(function(err) {
					if (err)
						console.log(err);
					cb();
				});
			}, function(err) {
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