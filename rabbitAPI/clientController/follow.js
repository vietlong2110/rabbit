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
			calback(0);
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

var addArticle = function(articles, userId, callback) {
	User.findById(userId).exec(function(err, user) {
		if (err) {
			console.log(err);
			callback();
		}
		// user.articles.push(articleId)
	});
};
module.exports.addArticle = addArticle;