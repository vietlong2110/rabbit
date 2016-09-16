/*****************************************************************************
*		This controller include all functions relating to newsfeed			 *
*****************************************************************************/

var async = require('async');
var _ = require('lodash');
var mongoose = require('mongoose');
var Article = require('../models/articles.js');
var Media = require('../models/media.js');
var Keyword = require('../models/keywords.js');
var User = require('../models/users.js');
var stringFuncs = require('../libs/stringfunctions.js');
var Filter = require('../libs/filter.js');
var searchFuncs = require('../libs/searchfunctions');

//Search feed controller
var searchFeed = function(query, callback) {
	//preprocess query
	var maxCache = 40;

	var newsSearchResult = [], mediaSearchResult = [];

	searchFuncs.Search(query, function(err, articles, newsEvalScore, media, mediaEvalScore) {
		if (err)
			return callback(err);
		for (i = 0; i < Math.min(maxCache, articles.length); i++) {
			var todayArr = [];
			if (articles[i].publishedDate === null)
				articles[i].publishedDate = new Date();
			todayArr.push(articles[i].publishedDate.getDate());
			todayArr.push(articles[i].publishedDate.getMonth());
			todayArr.push(articles[i].publishedDate.getFullYear());
			newsSearchResult.push({
				evalScore: newsEvalScore[i],
				today: todayArr,
				id: articles[i]._id,
				url: articles[i].url,
				title: articles[i].title,
				source: articles[i].source,
				thumbnail: articles[i].thumbnail,
				publishedDate: articles[i].publishedDate,
				hashtag: '',
				star: ''
			});
		}
		for (i = 0; i < Math.min(maxCache, media.length); i++) {
			var todayArr = [];
			if (articles[i].publishedDate === null)
				articles[i].publishedDate = new Date();
			todayArr.push(media[i].publishedDate.getDate());
			todayArr.push(media[i].publishedDate.getMonth());
			todayArr.push(media[i].publishedDate.getFullYear());
			mediaSearchResult.push({
				evalScore: mediaEvalScore[i],
				today: todayArr,
				id: media[i]._id,
				url: media[i].url,
				title: media[i].title,
				source: media[i].source,
				avatar: media[i].avatar,
				thumbnail: media[i].thumbnail,
				publishedDate: media[i].publishedDate,
				star: '',
			});
		}
		callback(null, newsSearchResult, mediaSearchResult);
	});
};
module.exports.searchFeed = searchFeed;

var getFeedByKeyword = function(userId, keyword, callback) {
	var query = stringFuncs.preProcess(keyword);
	query = stringFuncs.wordTokenize(query);
	query = stringFuncs.stemArr(query);

	searchFeed(query, function(err, newsFeedResult, mediaFeedResult) {
		if (err)
			return cb(err);

		var keywords = [];
		for (i in newsFeedResult)
			keywords.push(keyword);

		getUsersArticleInfo(userId, newsFeedResult, mediaFeedResult, keywords, keywords,
		function(err, newsfeed, media) {
			if (err)
				return callback(err);
			callback(null, newsfeed, media);
		});
	});
};
module.exports.getFeedByKeyword = getFeedByKeyword;

var getFeed = function(userId, callback) {
	User.findById(userId).exec(function(err, user) {
		if (err)
			return callback(err);
		var newsfeed = [], mediafeed = [], newsKeywords = [], mediaKeywords = [];

		async.forEachOfSeries(user.checkList, function(check, i, cb) {
			if (check) {
				var query = stringFuncs.preProcess(user.wordList[i]);
				query = stringFuncs.wordTokenize(query);
				query = stringFuncs.stemArr(query);
				searchFeed(query, function(err, newsFeedResult, mediaFeedResult) {
					if (err)
						return cb(err);
					for (j in newsFeedResult) {
						var tmp = _.find(newsfeed, {id: newsFeedResult[j].id});
						if (tmp === undefined) {
							newsfeed.push(newsFeedResult[j]);
							newsKeywords.push(user.wordList[i]);
						}
					}
					for (j in mediaFeedResult) {
						var tmp = _.find(mediafeed, {id: mediaFeedResult[j].id});
						// console.log(tmp);
						if (tmp === undefined) {
							mediafeed.push(mediaFeedResult[j]);
							mediaKeywords.push(user.wordList[i]);
						}
					}
					cb();
				});
			}
			else cb();
		}, function(err) {
			if (err)
				return callback(err);
			getUsersArticleInfo(userId, newsfeed, mediafeed, newsKeywords, mediaKeywords, 
			function(err, news, media) {
				if (err)
					return callback(err);
				callback(null, news, media);
			});
		});
	});
};
module.exports.getFeed = getFeed;

var getUsersArticleInfo = function(userId, newsfeed, mediafeed, newsKeywords, mediaKeywords, callback) {
	var newsFeedIDs = [], mediaFeedIDs = [];
	for (i = 0; i < newsfeed.length; i++)
		newsFeedIDs.push(newsfeed[i].id + '');
	for (i = 0; i < mediafeed.length; i++)
		mediaFeedIDs.push(mediafeed[i].id + '');

	async.parallel([
		function(cb) {
			Article.find({ _id: {"$in": newsFeedIDs} }).exec(function(err, articles) {
				if (err)
					return cb(err);
				async.each(articles, function(article, cb1) {
					var Index = article.user.indexOf(userId);
					var ID = newsFeedIDs.indexOf(article._id + '');
					// console.log(article._id);
					// console.log(ID);

					if (Index === -1) {
						article.user.push(userId);
						article.userStar.push(false);
						article.userKeywords.push({
							keywords: []
						});
						article.userKeywords[article.user.indexOf(userId)].keywords.push(newsKeywords[ID]);
						newsfeed[ID].hashtag = article.userKeywords[article.user.indexOf(userId)].keywords[0];
						newsfeed[ID].star = false;
					}
					else {
						var keywordList = article.userKeywords[Index].keywords;
						var hashtag = '';
						for (j = 0; j < keywordList.length; j++)
							hashtag += keywordList[j] + ' ';
						if (keywordList.indexOf(newsKeywords[ID]) === -1) {
							article.userKeywords[article.user.indexOf(userId)].keywords.push(newsKeywords[ID]);
							hashtag += newsKeywords[ID];
						}
						newsfeed[ID].hashtag = hashtag;
						newsfeed[ID].star = article.userStar[Index];
					}

					article.save();
					cb1();
				}, function(err) {
					if (err)
						return cb(err);
					cb();
				});
			});
		}, function(cb) {
			Media.find({ _id: {"$in": mediaFeedIDs} }).exec(function(err, articles) {
				// console.log(articles);
				if (err)
					return cb(err);
				async.each(articles, function(article, cb2) {
					var Index = article.user.indexOf(userId);
					var ID = mediaFeedIDs.indexOf(article._id + '');

					// console.log(article._id);
					// console.log(ID);
					if (Index === -1) {
						article.user.push(userId);
						article.userStar.push(false);
						article.userKeywords.push({
							keywords: []
						});
						article.userKeywords[article.user.indexOf(userId)].keywords.push(mediaKeywords[ID]);
						mediafeed[ID].star = false;
					}
					else {
						var keywordList = article.userKeywords[Index].keywords;
						if (keywordList.indexOf(mediaKeywords[ID]) === -1)
							article.userKeywords[article.user.indexOf(userId)].keywords.push(mediaKeywords[ID]);
							
						mediafeed[ID].star = article.userStar[Index];
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
			return callback(err);
		callback(null, newsfeed, mediafeed);
	});
};
module.exports.getUsersArticleInfo = getUsersArticleInfo;

var updateFavorite = function(userId, articleId, callback) {
	Article.findById(articleId).exec(function(err, article) {
		if (err)
			return callback(false);
		var Index = article.user.indexOf(userId);
		if (Index === -1)
			return callback(false);
		var tmp = [];

		for (i in article.userStar)
			tmp.push(article.userStar[i]);
		tmp[Index] = !tmp[Index];
		article.userStar = tmp;
		article.save(function(err) {
			if (err)
				return callback(false);
			callback(true);
		});
	});
};
module.exports.updateFavorite = updateFavorite;

var getFavorite = function(userId, callback) {
	
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
