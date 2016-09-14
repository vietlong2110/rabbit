/*****************************************************************************
*		This controller include all functions relating to newsfeed			 *
*****************************************************************************/

var async = require('async');
var mongoose = require('mongoose');
var Article = require('../models/articles.js');
var Keyword = require('../models/keywords.js');
var User = require('../models/users.js');
var stringFuncs = require('../libs/stringfunctions.js');
var Filter = require('../libs/filter.js');
var searchFuncs = require('../libs/searchfunctions');

//Search feed controller
var searchFeed = function(q, callback) {
	//preprocess query
	var query = stringFuncs.preProcess(q);
	query = stringFuncs.wordTokenize(query);
	query = stringFuncs.stemArr(query);

	var searchResult = [];
	searchFuncs.Search(query, function(articles, evalScore) {
		for (i = 0; i < Math.min(40, articles.length); i++) {
			var todayArr = [];
			todayArr.push(articles[i].publishedDate.getDate());
			todayArr.push(articles[i].publishedDate.getMonth());
			todayArr.push(articles[i].publishedDate.getFullYear());
			searchResult.push({
				evalScore: evalScore[i],
				today: todayArr,
				id: articles[i]._id,
				url: articles[i].url,
				title: articles[i].title,
				source: articles[i].source,
				avatar: articles[i].avatar,
				thumbnail: articles[i].thumbnail,
				publishedDate: articles[i].publishedDate,
				media: articles[i].media
			});
		}
		callback(searchResult);
	});
};
module.exports.searchFeed = searchFeed;

//Find feed's ID in Article database
var getFeedId = function(keyword, callback) {
	//preprocess query
	var query = stringFuncs.preProcess(keyword);
	query = stringFuncs.wordTokenize(query);
	query = stringFuncs.stemArr(query);

	var searchResult = [];
	var articles = [];

	Keyword.find({ word: {"$in": query} }).exec(function(err, keywords) {
		async.eachSeries(keywords, function(keyword, cb1) {
			Article.find({
				_id: {"$in": keyword.articleIDs} 
			}).exec(function(err, fullArticles) {
				console.log(fullArticles.length);
				async.eachSeries(fullArticles, function(article, cb2) {
					if (articles.indexOf(article) === -1)
						articles.push(article);
					cb2();
				}, function(err) {
					if (err)
						return cb1(err);
					cb1();
				});
			});
		}, function(err) {
			if (err)
				return callback(err);
			callback(articles);
		});
	});
};
module.exports.getFeedId = getFeedId;

//Find feed from a specific set of user article
var getFeedUser = function(keyword, articleIds, callback) {
	//preprocess query
	var query = stringFuncs.preProcess(keyword);
	query = stringFuncs.wordTokenize(query);
	query = stringFuncs.stemArr(query);

	var searchResult = [];
	var Ids = [];

	searchFuncs.Search(query, articleIds, function(articles, evalScore) {
		for (i = 0; i < Math.min(40, articles.length); i++) {
			var todayArr = [];
			todayArr.push(articles[i].publishedDate.getDate());
			todayArr.push(articles[i].publishedDate.getMonth());
			todayArr.push(articles[i].publishedDate.getFullYear());
			searchResult.push({
				evalScore: evalScore[i],
				today: todayArr,
				id: articles[i]._id,
				url: articles[i].url,
				title: articles[i].title,
				source: articles[i].source,
				avatar: articles[i].avatar,
				thumbnail: articles[i].thumbnail,
				publishedDate: articles[i].publishedDate,
				media: articles[i].media
			});
			Ids.push(articles[i]._id);
		}
		callback(searchResult, Ids);
	});
};
module.exports.getFeedUser = getFeedUser;

//Find feed corresponding to user's settings
var getFeed = function(userId, callback) {
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
