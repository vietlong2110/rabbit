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

	var Keyword = require('../models/keywords.js');
	var searchResult = [];
	var articles = [];

	async.each(query, function(queryWord, cb) {
		Keyword.findOne({word: queryWord}).exec(function(err, word) {
			if (err) { //process error case later
				console.log(err);
				return callback();
			}
			if (word !== null) {
				for (i = 0; i < word.articleIDs.length; i++)
					articles.push(word.articleIDs[i].toString());
				cb();
			}
			else cb();
		});
	}, function(err) {
		if (err) {
			console.log(err);
			return callback();
		}
		// console.log(articles);
		var Filter = require('../libs/filter.js');
		var searchFuncs = require('../libs/searchfunctions');
		var queryArr = Filter.queryArr(query);

		//calculate query vector score
		searchFuncs.queryVector(queryArr, function(vector2) {
			async.each(articles, function(articleID, cb2) { //with each article
				//calculate its vector score
				searchFuncs.docVector(query, articleID, function(vector1) {
					var evalScore = searchFuncs.cosEval(vector1, vector2);
					// console.log(articles.length);

					if (evalScore > 0) { //add only relating article
						var Article = require('../models/articles.js');

						Article.findById(articleID).exec(function(err, article) {
							console.log('In here!');
							if (article === null)
								return cb2();
							else {
								// console.log(article);
								var todayArr = [];
								todayArr.push(article.publishedDate.getDate());
								todayArr.push(article.publishedDate.getMonth());
								todayArr.push(article.publishedDate.getFullYear());
								
								searchResult.push({
									evalScore: evalScore,
									today: todayArr,
									id: articleID,
									url: article.url,
									title: article.title,
									source: article.source,
									avatar: article.avatar,
									thumbnail: article.thumbnail,
									publishedDate: article.publishedDate,
									media: article.media
								});
								cb2();
							}
						});
					}
					else cb2();
				});
			}, function(err) {
				if (err) { //process error case later
					console.log(err);
					callback();
				}
				console.log(searchResult);
				callback(searchResult);
			});
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

	var Keyword = require('../models/keywords.js');
	var searchResult = [];
	var articles = [];

	async.each(query, function(queryWord, cb) {
		Keyword.findOne({word: queryWord}).exec(function(err, word) {
			if (err) { //process error case later
				console.log(err);
				callback();
			}
			else if (word !== null) {
				var tmp = [];
				for (i = 0; i < word.articleIDs.length; i++)
					tmp.push(word.articleIDs[i].toString());
				for (i = 0; i < tmp.length; i++)
					if (articles.indexOf(tmp[i]) === -1)
						articles.push(tmp[i]);
				cb();
			}
			else cb();
		});
	}, function(err) {
		if (err) {
			console.log(err);
			callback();
		}
		
		callback(articles);
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

	var Filter = require('../libs/filter.js');
	var queryArr = Filter.queryArr(query);

	//calculate query vector score
	searchFuncs.queryVector(queryArr, function(vector2) {
		async.each(articleIds, function(articleId, cb) { //with each article's ID

			//calculate its vector score
			searchFuncs.docVector(query, articleId, function(vector1) {
				var evalScore = searchFuncs.cosEval(vector1, vector2);

				if (evalScore > 0) { //consider only relating articles
					var Article = require('../models/articles.js');

					Article.findById(articleId).exec(function(err, article) {
						if (err) { //process error case later
							console.log(err);
							cb();
						}

						var todayArr = [];
						todayArr.push(article.publishedDate.getDate());
						todayArr.push(article.publishedDate.getMonth());
						todayArr.push(article.publishedDate.getFullYear());

						searchResult.push({ //article's properties
							evalScore: evalScore,
							today: todayArr,
							id: article._id,
							url: article.url,
							title: article.title,
							source: article.source,
							avatar: article.avatar,
							thumbnail: article.thumbnail,
							publishedDate: article.publishedDate,
							media: article.media
						});
						Ids.push(articleId); //article's ID

						cb();
					});
				}
				else cb();
			});
		}, function(err) {
			if (err) { //process error case later
				console.log(err);
				callback();
			}
			callback(searchResult, Ids);
		});
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
				var Follow = require('../clientController/follow.js');

				Follow.addArticle(user.wordList[i], userId, function(addarticle) {
					if (addarticle) {
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

				var hashtagResult = [], starResult = [];

				for (i in tmpIds) {
					//use u.articles' ID to extract keyword list corresponding to each article
					hashtagResult.push(u.articleKeywords[u.articles.indexOf(tmpIds[i])].keywords);
					starResult.push(u.stars[u.articles.indexOf(tmpIds[i])]);
				}
			
				callback(feedResult, hashtagResult, starResult);
			});
		});	
	});
};
module.exports.getFeed = getFeed;

var updateFavorite = function(userId, articleId, callback) {
	var User = require('../models/users.js');

	User.findById(userId).exec(function(err, user) {
		if (err) {
			console.log(err);
			callback(false);
		}

		if (user === null) {
			console.log('User not found!');
			callback(false);
		}

		var tmp = [];
		for (i = 0; i < user.stars.length; i++)
			tmp.push(user.stars[i]);

		var index = user.articles.indexOf(articleId);
		tmp[index] = !tmp[index];
		user.stars = tmp;

		user.save(function(err) {
			if (err) {
				console.log(err);
				callback(false);
			}

			callback(true);
		});
	});
};
module.exports.updateFavorite = updateFavorite;

var getFavorite = function(userId, callback) {
	var User = require('../models/users.js');

	User.findById(userId).exec(function(err, user) {
		if (err) {
			console.log(err);
			callback([]);
		}

		if (user === null) {
			console.log('User not found!');
			callback([]);
		}

		var favoriteNewsList = [], favoriteMediaList = [];
		var Article = require('../models/articles.js');

		async.forEachOfSeries(user.stars, function(star, i, cb) {
			if (star)
				Article.findById(user.articles[i]).exec(function(err, article) {
					if (err) { //process error case later
						console.log(err);
						cb();
					}

					if (article.media)
						favoriteMediaList.push({ //article's properties
							id: article._id,
							url: article.url,
							title: article.title,
							source: article.source,
							avatar: article.avatar,
							thumbnail: article.thumbnail,
							publishedDate: article.publishedDate,
							star: true
						});
					else favoriteNewsList.push({
						id: article._id,
						url: article.url,
						title: article.title,
						source: article.source,
						thumbnail: article.thumbnail,
						publishedDate: article.publishedDate,
						star: true
					});
					cb();
				});
			else cb();
		}, function(err) {
			if (err) {
				console.log(err);
				callback([]);
			}

			callback(favoriteNewsList, favoriteMediaList);
		});
	});
};
module.exports.getFavorite = getFavorite;

var searchInstaFeed = function(q, callback) {
	var Insta = require('../serverController/instagram.js');

	// Insta.searchUser(q, function(data) {
		Insta.searchMediaTags(q, function(images) {
			// images = images.concat(data);
			callback(images);
		});
	// });
};
module.exports.searchInstaFeed = searchInstaFeed;