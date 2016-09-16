/****************************************************************************************
*		This controller include all functions relating to follow/unfoloow a thing		*
****************************************************************************************/

var async = require('async');

var mongoose = require('mongoose');
var stringFuncs = require('../libs/stringfunctions.js');
var User = require('../models/users.js');
var Keyword = require('../models/keywords.js');
var Article = require('../models/articles.js');
var Media = require('../models/media.js');

//Add a new keyword/hashtag to database
var addList = function(keyword, userId, callback) {
	User.findById(userId).exec(function(err, user) {
		if (err)
			return callback(false);

		if (user.wordList.indexOf(keyword) === -1) { //add keyword and its default setting is checked
			user.wordList.push(keyword);
			user.checkList.push(true);
			user.save(function(err) {
				if (err)
					return callback(false);
				callback(true);
			});
		}
		else callback(true); //already followed
	});
};
module.exports.addList = addList;

//Add a list of articles from Article database to users database correspoding to their following list
var addToArticle = function(keyword, userId, callback) {
	var query = stringFuncs.preProcess(keyword);
	query = stringFuncs.wordTokenize(query);
	query = stringFuncs.stemArr(query);

	Keyword.find({ word: {"$in": query} }).exec(function(err, keywords) {
		if (err)
			return cb(err);
		async.parallel([
			function(cb) {
				var articleIDs = [];
				for (i = 0; i < keywords.length; i++)
					articleIDs = articleIDs.concat(keywords[i].articleIDs);
				Article.find({ _id: {"$in": articleIDs} }).exec(function(err, articles) {
					if (err)
						return cb(err);
					async.each(articles, function(article, cb2) {
						var Index = article.user.indexOf(userId);

						if (Index === -1) {
							article.user.push(userId);
							article.userStar.push(false);
							article.userKeywords.push({
								keywords: []
							});
							article.userKeywords[article.user.indexOf(userId)].keywords.push(keyword);
						}
						else {
							var keywordIndex = article.userKeywords[Index].keywords.indexOf(keyword);
							if (keywordIndex === -1)
								article.userKeywords[Index].keywords.push(keyword);
						}

						article.save();
						cb2();
					}, function(err) {
						if (err)
							return cb(err);
						cb();
					});
				});
			}, function(cb) {
				var mediaIDs = [];
				for (i = 0; i < keywords.length; i++)
					mediaIDs = mediaIDs.concat(keywords[i].mediaIDs);
				Media.find({ _id: {"$in": mediaIDs} }).exec(function(err, articles) {
					if (err) 
						return cb(err);
					async.each(articles, function(article, cb2) {
						var Index = article.user.indexOf(userId);

						if (Index === -1) {
							article.user.push(userId);
							article.userStar.push(false);
							article.userKeywords.push({
								keywords: []
							});
							article.userKeywords[article.user.indexOf(userId)].keywords.push(keyword);
						}
						else {
							var keywordIndex = article.userKeywords[Index].keywords.indexOf(keyword);
							if (keywordIndex === -1)
								article.userKeywords[Index].keywords.push(keyword);
						}

						article.save();
						cb2();
					}, function(err) {
						if (err)
							return cb(err);
						cb();
					});
				});
			}
		], function(err) {
			if (err)
				return callback(false);
			callback(true);
		});
	});
};
module.exports.addToArticle = addToArticle;

//Delete an unfollow keyword from following list
var deleteList = function(keyword, userId, callback) {
	User.findById(userId).exec(function(err, user) {
		if (err)
			return callback(false);
		var index = user.wordList.indexOf(keyword);

		if (index !== -1) { //delete from both wordlist and checklist
			user.wordList.splice(index, 1);
			user.checkList.splice(index, 1);
			user.save(function(err) {
				if (err)
					return callback(false);
				callback(true);
			});
		}
		else callback(true);
	});
};
module.exports.deleteList = deleteList;

//Delete all articles that only relate to an unfollow keyword
var deleteArticle = function(keyword, userId, callback) {
	var query = stringFuncs.preProcess(keyword);
	query = stringFuncs.wordTokenize(query);
	query = stringFuncs.stemArr(query);

	Keyword.find({ word: {"$in": query} }).exec(function(err, keywords) {
		if (err)
			return cb(err);
		async.parallel([
			function(cb) {
				var articleIDs = [];
				for (i = 0; i < keywords.length; i++)
					articleIDs = articleIDs.concat(keywords[i].articleIDs);
				Article.find({ _id: {"$in": articleIDs} }).exec(function(err, articles) {
					if (err)
						return cb(err);
					async.each(articles, function(article, cb2) {
						var Index = article.user.indexOf(userId);

						if (Index !== -1) {
							if (article.userKeywords[Index].keywords.length === 1) {
								article.user.splice(Index, 1);
								article.userStar.splice(Index, 1);
								article.userKeywords.splice(Index, 1);
							}
							else article.userKeywords[Index].keywords.splice(article.userKeywords[Index].keywords.indexOf(keyword));
							article.save();
							cb2();
						}
						else cb2();
					}, function(err) {
						if (err)
							return cb(err);
						cb();
					});
				});
			}, function(cb) {
				var mediaIDs = [];
				for (i = 0; i < keywords.length; i++)
					mediaIDs = mediaIDs.concat(keywords[i].mediaIDs);
				Media.find({ _id: {"$in": mediaIDs} }).exec(function(err, articles) {
					if (err) 
						return cb(err);
					async.each(articles, function(article, cb2) {
						var Index = article.user.indexOf(userId);

						if (Index !== -1) {
							if (article.userKeywords[Index].keywords.length === 1) {
								article.user.splice(Index, 1);
								article.userStar.splice(Index, 1);
								article.userKeywords.splice(Index, 1);
							}
							else article.userKeywords[Index].keywords.splice(article.userKeywords[Index].keywords.indexOf(keyword));
							article.save();
							cb2();
						}
						else cb2();
					}, function(err) {
						if (err)
							return cb(err);
						cb();
					});
				});
			}
		], function(err) {
			if (err)
				return callback(false);
			callback(true);
		});
	});
};
module.exports.deleteArticle = deleteArticle;