var async = require('async');
var mongoose = require('mongoose');

var searchFeed = function(q, callback) {
	var stringFuncs = require('../libs/stringfunctions.js');
	var query = stringFuncs.preProcess(q);
	query = stringFuncs.wordTokenize(query);
	query = stringFuncs.stemArr(query);
	var Article = require('../models/articles.js');
	var searchResult = [];
	Article.find({}).exec(function(err, articles) {
		if (err) {
			console.log(err);
			callback();
		}
		var searchFuncs = require('../libs/searchfunctions');
		async.each(articles, function(article, cb) {
			searchFuncs.docVector(query, article._id, function(vector1) {
				var Filter = require('../libs/filter.js');
				var queryArr = Filter.queryFilter(query);
				searchFuncs.queryVector(queryArr, function(vector2) {
					var evalScore = searchFuncs.cosEval(vector1, vector2);
					if (evalScore > 0) {
						searchResult.push({
							evalScore: evalScore,
							url: article.url,
							title: article.title,
							thumbnail: article.thumbnail,
							publishedDate: article.publishedDate
						});
					}
					cb();
				});
			});
		}, function(err) {
			if (err) {
				console.log(err);
				callback();
			}
			searchResult.sort(function(a,b) {
				if (b.evalScore - a.evalScore === 0)
					return b.publishedDate - a.publishedDate;
				else return b.evalScore - a.evalScore;
			});
			callback(searchResult);
		});
	});
};
module.exports.searchFeed = searchFeed;

var getFeedId = function(keyword, callback) {
	var stringFuncs = require('../libs/stringfunctions.js');
	var query = stringFuncs.wordTokenize(keyword);
	query = stringFuncs.stemArr(query);
	var Article = require('../models/articles.js');
	var searchResult = [];
	Article.find({}).exec(function(err, articles) {
		if (err) {
			console.log(err);
			callback();
		}
		var searchFuncs = require('../libs/searchfunctions');
		async.each(articles, function(article, cb) {
			searchFuncs.docVector(query, article._id, function(vector1) {
				var Filter = require('../libs/filter.js');
				var queryArr = Filter.queryFilter(query);
				searchFuncs.queryVector(queryArr, function(vector2) {
					var evalScore = searchFuncs.cosEval(vector1, vector2);
					if (evalScore > 0)
						searchResult.push(article._id);
					cb();
				});
			});
		}, function(err) {
			if (err) {
				console.log(err);
				callback();
			}
			callback(searchResult);
		});
	});
};
module.exports.getFeedId = getFeedId;

var getFeedUser = function(keyword, articleIds, callback) {
	// console.log(articleIds);
	var stringFuncs = require('../libs/stringfunctions.js');
	var query = stringFuncs.preProcess(keyword);
	query = stringFuncs.wordTokenize(query);
	query = stringFuncs.stemArr(query);
	var searchFuncs = require('../libs/searchfunctions');
	var searchResult = [];
	var Ids = [];
	async.each(articleIds, function(articleId, cb) {
		searchFuncs.docVector(query, articleId, function(vector1) {
			var Filter = require('../libs/filter.js');
			var queryArr = Filter.queryFilter(query);
			searchFuncs.queryVector(queryArr, function(vector2) {
				var evalScore = searchFuncs.cosEval(vector1, vector2);
				if (evalScore > 0) {
					var Article = require('../models/articles.js');
					Article.findById(articleId).exec(function(err, article){
						if (err) {
							console.log(err);
							cb();
						}
						var today = article.publishedDate.getDate();
						searchResult.push({
							evalScore: evalScore,
							today: today,
							url: article.url,
							title: article.title,
							thumbnail: article.thumbnail,
							publishedDate: article.publishedDate
						});
						Ids.push(articleId);
						cb();
					});
				}
				else cb();
			});
		});
	}, function(err) {
		if (err) {
			console.log(err);
			callback();
		}
		callback(searchResult, Ids);
	});
};
module.exports.getFeedUser = getFeedUser;

var getFeed = function(userId, callback) {
	var User = require('../models/users.js');
	User.findById(userId).exec(function(err, user) {
		if (err) {
			console.log(err);
			callback([], []);
		}
		var feedResult = [], tmpIds = [];
		var articleIds = user.articles;
		async.forEachOfSeries(user.checkList, function(check, i, cb) {
			if (check) {
				getFeedUser(user.wordList[i], articleIds, function(results, Ids) {
					for (j in results) {
						feedResult.push(results[j]);
						tmpIds.push(Ids[j]);
						//eliminate added result here
						articleIds.splice(articleIds.indexOf(Ids[j]), 1);
					}
					cb();
				});
			}
		}, function(err) {
			if (err) {
				console.log(err);
				callback([], []);
			}
			User.findById(userId).exec(function(err, u) {
				if (err) {
					console.log(err);
					callback([], []);
				}
				var hashtagResult = [];
				for (i in tmpIds)
					hashtagResult.push(u.articleKeywords[u.articles.indexOf(tmpIds[i])].keywords);
				callback(feedResult, hashtagResult);
			});
		});	
	});
};
module.exports.getFeed = getFeed;