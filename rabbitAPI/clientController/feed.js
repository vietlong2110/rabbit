/*****************************************************************************
*		This controller include all functions relating to newsfeed			 *
*****************************************************************************/

var async = require('async');
var mongoose = require('mongoose');

//Search feed controller
var searchFeed = function(q, callback) {
	var stringFuncs = require('../libs/stringfunctions.js');

	//preprocess query
	var query = stringFuncs.preProcess(q);
	query = stringFuncs.wordTokenize(query);
	query = stringFuncs.stemArr(query);

	var Article = require('../models/articles.js');
	var searchResult = [];

	Article.find({}).exec(function(err, articles) { //find feeds in Article database
		if (err) { //process error case later
			console.log(err);
			callback();
		}

		var searchFuncs = require('../libs/searchfunctions');

		async.each(articles, function(article, cb) { //with each article

			//calculate its vector score
			searchFuncs.docVector(query, article._id, function(vector1) {
				var Filter = require('../libs/filter.js');
				var queryArr = Filter.queryArr(query);

				//calculate query vector score
				searchFuncs.queryVector(queryArr, function(vector2) {
					var evalScore = searchFuncs.cosEval(vector1, vector2);

					if (evalScore > 0) { //add only relating article
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
			if (err) { //process error case later
				console.log(err);
				callback();
			}

			searchResult.sort(function(a,b) { 
				if (b.evalScore - a.evalScore === 0) //if 2 articles have the same score
					return b.publishedDate - a.publishedDate; //sort by published date
				else return b.evalScore - a.evalScore; //otherwise sort by ranking score
			});
			callback(searchResult);
		});
	});
};
module.exports.searchFeed = searchFeed;

//Find feed's ID in Article database
var getFeedId = function(keyword, callback) {
	var stringFuncs = require('../libs/stringfunctions.js');

	//preprocess query
	var query = stringFuncs.preProcess(keyword);
	query = stringFuncs.wordTokenize(query);
	query = stringFuncs.stemArr(query);

	var Article = require('../models/articles.js');
	var searchResult = [];
	Article.find({}).exec(function(err, articles) { //find feeds in Article database
		if (err) { //process error case later
			console.log(err);
			callback();
		}

		var searchFuncs = require('../libs/searchfunctions');

		async.each(articles, function(article, cb) { //with each article

			//calculate its vector score
			searchFuncs.docVector(query, article._id, function(vector1) {
				var Filter = require('../libs/filter.js');
				var queryArr = Filter.queryArr(query);

				//calculate query vector score
				searchFuncs.queryVector(queryArr, function(vector2) {
					var evalScore = searchFuncs.cosEval(vector1, vector2);

					if (evalScore > 0) //add only relating article id
						searchResult.push(article._id);
					cb();
				});
			});
		}, function(err) {
			if (err) { //process error case later
				console.log(err);
				callback();
			}
			callback(searchResult);
		});
	});
};
module.exports.getFeedId = getFeedId;

//Find feed from a specific set of user article
var getFeedUser = function(keyword, articleIds, callback) {
	var stringFuncs = require('../libs/stringfunctions.js');

	//preprocess query
	var query = stringFuncs.preProcess(keyword);
	query = stringFuncs.wordTokenize(query);
	query = stringFuncs.stemArr(query);

	var searchFuncs = require('../libs/searchfunctions');
	var searchResult = [];
	var Ids = [];

	async.each(articleIds, function(articleId, cb) { //with each article's ID

		//calculate its vector score
		searchFuncs.docVector(query, articleId, function(vector1) {
			var Filter = require('../libs/filter.js');
			var queryArr = Filter.queryArr(query);

			//calculate query vector score
			searchFuncs.queryVector(queryArr, function(vector2) {
				var evalScore = searchFuncs.cosEval(vector1, vector2);

				if (evalScore > 0) { //consider only relating articles
					var Article = require('../models/articles.js');

					Article.findById(articleId).exec(function(err, article) {
						if (err) { //process error case later
							console.log(err);
							cb();
						}

						var today = article.publishedDate.getDate();

						searchResult.push({ //article's properties
							evalScore: evalScore,
							today: today,
							url: article.url,
							title: article.title,
							thumbnail: article.thumbnail,
							publishedDate: article.publishedDate
						});
						Ids.push(articleId); //article's ID

						cb();
					});
				}
				else cb();
			});
		});
	}, function(err) {
		if (err) { //process error case later
			console.log(err);
			callback();
		}
		callback(searchResult, Ids);
	});
};
module.exports.getFeedUser = getFeedUser;

//Find feed corresponding to user's settings
var getFeed = function(userId, callback) {
	var User = require('../models/users.js');

	User.findById(userId).exec(function(err, user) {
		if (err) { //process error case later
			console.log(err);
			callback([], []);
		}

		if (user === null) { //there is no user has this id in database
			console.log('User not found!');
			callback(0);
		}

		var feedResult = [], tmpIds = [];
		var articleIds = user.articles;

		async.forEachOfSeries(user.checkList, function(check, i, cb) { //with each checked keyword
			if (check) {

				//get a list of articles
				getFeedUser(user.wordList[i], articleIds, function(results, Ids) {
					for (j in results) {
						feedResult.push(results[j]);

						//save results' ID for later purpose due to the effect of deleting items
						//from user.articles
						tmpIds.push(Ids[j]);
						
						//eliminate added result here
						articleIds.splice(articleIds.indexOf(Ids[j]), 1);
					}
					cb();
				});
			}
			else cb();
		}, function(err) {
			if (err) { //process error case later
				console.log(err);
				callback([], []);
			}

			User.findById(userId).exec(function(err, u) {
				if (err) { //process error case later
					console.log(err);
					callback([], []);
				}

				var hashtagResult = [];

				for (i in tmpIds)
					//use u.articles' ID to extract keyword list corresponding to each article
					hashtagResult.push(u.articleKeywords[u.articles.indexOf(tmpIds[i])].keywords);

				callback(feedResult, hashtagResult);
			});
		});	
	});
};
module.exports.getFeed = getFeed;