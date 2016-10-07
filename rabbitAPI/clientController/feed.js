/*****************************************************************************
*		This controller include all functions relating to newsfeed			 *
*****************************************************************************/

var async = require('async');
var _ = require('lodash');
var mongoose = require('mongoose');
var Article = require('../models/articles.js');
var Media = require('../models/media.js');
var Keyword = require('../models/keywords.js');
var List = require('./list.js');
var User = require('../models/users.js');
var NewsHub = require('../models/newshub.js');
var MediaHub = require('../models/mediahub.js');
var Pagination = require('../libs/pagination.js');
var stringFuncs = require('../libs/stringfunctions.js');
var Filter = require('../libs/filter.js');
var searchFuncs = require('../libs/searchfunctions');

//Search feed controller
var searchFeed = function(query, callback) {
	//preprocess query
	var maxCache = 4000;

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
			dayScore = todayArr[0] + todayArr[1]*100 + todayArr[2]*10;
			newsSearchResult.push({
				evalScore: newsEvalScore[i],
				dayScore: dayScore,
				id: articles[i]._id,
				url: articles[i].url,
				title: articles[i].title,
				source: articles[i].source.toUpperCase(),
				thumbnail: articles[i].thumbnail,
				publishedDate: articles[i].publishedDate
			});
		}
		for (i = 0; i < Math.min(maxCache, media.length); i++) {
			var todayArr = [];
			if (articles[i].publishedDate === null)
				articles[i].publishedDate = new Date();
			todayArr.push(media[i].publishedDate.getDate());
			todayArr.push(media[i].publishedDate.getMonth());
			todayArr.push(media[i].publishedDate.getFullYear());
			dayScore = todayArr[0] + todayArr[1]*100 + todayArr[2]*10;
			mediaSearchResult.push({
				evalScore: mediaEvalScore[i],
				dayScore: dayScore,
				id: media[i]._id,
				url: media[i].url,
				title: media[i].title,
				source: media[i].source,
				avatar: media[i].avatar,
				thumbnail: media[i].thumbnail,
				publishedDate: media[i].publishedDate
			});
		}
		callback(null, newsSearchResult, mediaSearchResult);
	});
};
module.exports.searchFeed = searchFeed;

var refreshFeed = function(userId, callback) {
	async.parallel({
		newsfeed: function(cb) {
			getNewsFeed(userId, 0, function(err, newsFeedResult, moreData) {
				if (err)
					return cb(err);
				newsfeed = newsFeedResult;
				moreDataNews = moreData;
				cb(null, newsFeedResult, moreData);
			});
		}, mediafeed: function(cb) {
			getMediaFeed(userId, 0, function(err, mediaFeedResult, moreData) {
				if (err)
					return cb(err);
				mediafeed = mediaFeedResult;
				moreDataMedia = moreData;
				cb(null, mediaFeedResult, moreData);
			});
		}, list: function(cb) {
			List.getList(userId, function(list) {
				listKeywords = list;
				cb(null, list);
			});
		}
	}, function(err, results) {
		if (err)
			return callback(err);
		callback(null, results);
	});
};
module.exports.refreshFeed = refreshFeed;

var updateFeedByKeyword = function(userId, keyword, callback) {
	var updatednews = false, updatedmedia = false;
	var query = stringFuncs.preProcess(keyword);
	query = stringFuncs.wordTokenize(query);
	query = stringFuncs.stemArr(query);

	searchFeed(query, function(err, newsFeedResult, mediaFeedResult) {
		if (err)
			return callback(err);
		async.parallel([
			function(cb) {
				async.eachSeries(newsFeedResult, function(newsfeed, cb1) {
					NewsHub.findOne({
						userId: userId,
						articleId: newsfeed.id
					}).exec(function(err, hub) {
						if (err)
							return cb1(err);
						if (hub === null) {
							// console.log('In here!');
							Article.findById(newsfeed.id).exec(function(err, article) {
								var newsHub = new NewsHub({
									userId: userId,
									articleId: newsfeed.id,
									url: article.url,
									title: article.title,
									thumbnail: article.thumbnail,
									source: article.source,
									userKeywordList: [keyword],
									evalScoreList: [newsfeed.evalScore],
									evalScore: newsfeed.evalScore,
									publishedDate: newsfeed.publishedDate,
									dayScore: newsfeed.dayScore,
									star: false
								});
								newsHub.save(function(err) {
									if (err)
										return cb1(err);
									updatednews = true;
									cb1();
								});
							});
						}
						else {
							if (hub.userKeywordList.indexOf(keyword) !== -1)
								return cb1();
							hub.userKeywordList.push(keyword);
							hub.evalScoreList.push(newsfeed.evalScore);
							hub.evalScore += newsfeed.evalScore;
							hub.save(function(err) {
								if (err)
									return cb1(err);
								updatednews = true;
								cb1();
							});
						}
					});
				}, function(err) {
					if (err)
						return cb(err);
					cb();
				});
			}, function(cb) {
				async.eachSeries(mediaFeedResult, function(mediafeed, cb1) {
					MediaHub.findOne({
						userId: userId,
						articleId: mediafeed.id
					}).exec(function(err, hub) {
						if (err)
							return cb1(err);
						if (hub === null) {
							Media.findById(mediafeed.id).exec(function(err, media) {
								var mediaHub = new MediaHub({
									userId: userId,
									articleId: mediafeed.id,
									url: media.url,
									title: media.title,
									thumbnail: media.thumbnail,
									source: media.source,
									avatar: media.avatar,
									userKeywordList: [keyword],
									evalScoreList: [mediafeed.evalScore],
									evalScore: mediafeed.evalScore,
									publishedDate: mediafeed.publishedDate,
									dayScore: mediafeed.dayScore,
									star: false
								});
								mediaHub.save(function(err) {
									if (err)
										return cb1(err);
									updatedmedia = true;
									cb1();
								});
							});
						}
						else {
							if (hub.userKeywordList.indexOf(keyword) !== -1)
								return cb1();
							hub.userKeywordList.push(keyword);
							hub.evalScoreList.push(mediafeed.evalScore);
							hub.evalScore += mediafeed.evalScore;
							hub.save(function(err) {
								if (err)
									return cb1(err);
								updatedmedia = true;
								cb1();
							});
						}
					});
				}, function(err) {
					if (err)
						return cb(err);
					cb();
				});
			}
		], function(err) {
			if (err)
				return callback(err);
			refreshFeed(userId, function(err, results) {
				if (err)
					return callback(err);
				callback(null, results, updatednews, updatedmedia);
			});
		});
	});
};
module.exports.updateFeedByKeyword = updateFeedByKeyword;

var deleteFeedByKeyword = function(userId, keyword, callback) {
	var deletednews = false, deletedmedia = false;
	async.parallel([
		function(cb) {
			NewsHub.find({userId: userId}).exec(function(err, hubs) {
				if (err)
					return cb(err);
				if (hubs === null)
					return cb();
				async.each(hubs, function(hub, cb1) {
					if (hub.userKeywordList.length === 1 && hub.userKeywordList[0] === keyword)
						hub.remove(function(err) {
							if (err)
								return cb1(err);
							deletednews = true;
							cb1();
						});
					else {
						var Index = hub.userKeywordList.indexOf(keyword);
						if (Index === -1)
							return cb1();
						hub.userKeywordList.splice(Index, 1);
						hub.evalScore -= hub.evalScoreList[Index];
						hub.evalScoreList.splice(Index, 1);
						hub.save(function(err) {
							if (err)
								return cb1(err);
							deletednews = true;
							cb1();
						});
					}
				}, function(err) {
					if (err)
						return cb(err);
					cb();
				});
			});
		}, function(cb) {
			MediaHub.find({userId: userId}).exec(function(err, hubs) {
				if (err)
					return cb(err);
				if (hubs === null)
					return cb();
				async.each(hubs, function(hub, cb1) {
					if (hub.userKeywordList.length === 1 && hub.userKeywordList[0] === keyword)
						hub.remove(function(err) {
							if (err)
								return cb1(err);
							deletedmedia = true;
							cb1();
						});
					else {
						var Index = hub.userKeywordList.indexOf(keyword);
						if (Index === -1)
							return cb1();
						hub.userKeywordList.splice(Index, 1);
						hub.evalScore -= hub.evalScoreList[Index];
						hub.evalScoreList.splice(Index, 1);
						hub.save(function(err) {
							if (err)
								return cb1(err);
							deletedmedia = true;
							cb1();
						});
					}
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
		refreshFeed(userId, function(err, results) {
			if (err)
				return callback(err);
			callback(null, results);
		});
	});
};
module.exports.deleteFeedByKeyword = deleteFeedByKeyword;

var updateFeed = function(userId, callback) {
	User.findById(userId).exec(function(err, user) {
		if (err)
			return callback(err);
		var updatedNewsFeed = false, updatedMediaFeed = false;

		async.eachSeries(user.wordList, function(word, cb) {
			updateFeedByKeyword(userId, word, function(err, results, updatednews, updatedmedia) {
				if (err)
					return cb(err);
				if (updatednews)
					updatedNewsFeed = true;
				if (updatedmedia)
					updatedMediaFeed = true;
				cb();
			});
		}, function(err) {
			if (err)
				return callback(err);
			callback(null, updatedNewsFeed, updatedMediaFeed);
		});
	});
};
module.exports.updateFeed = updateFeed;

var getNewsFeed = function(userId, size, callback) {
	User.findById(userId).exec(function(err, user) {
		if (err)
			return callback(err);
		var wordList = [];
		for (i = 0; i < user.checkList.length; i++)
			if (user.checkList[i])
				wordList.push(user.wordList[i]);
		// console.log(wordList);
		NewsHub.find({userId: userId})
		.sort({dayScore: -1, evalScore: -1, publishedDate: -1})
		.exec(function(err, hubs) {
			if (err)
				return callback(err);
			var newsfeed = [];
			for (i = 0; i < hubs.length; i++) {
				var Intersection = _.intersection(wordList, hubs[i].userKeywordList);
				if (Intersection.length > 0) {
					var hashtag = '';
					for (j = 0; j < Intersection.length; j++)
						hashtag += Filter.keywordToHashtag(Intersection[j]) + ' ';
					newsfeed.push({
						id: hubs[i].articleId,
						url: hubs[i].url,
						title: hubs[i].title,
						thumbnail: hubs[i].thumbnail,
						source: hubs[i].source,
						publishedDate: hubs[i].publishedDate,
						dayScore: hubs[i].dayScore,
						hashtag: hashtag,
						star: hubs[i].star,
						timeline: false
					});
				}
			}
			if (newsfeed.length > 0) {
				newsfeed[0].timeline = true;
				for (i = 1; i < newsfeed.length; i++)
					if (newsfeed[i].dayScore != newsfeed[i-1].dayScore)
						newsfeed[i].timeline = true;
			}
			Pagination.paginate(newsfeed, size, function(newsFeedResult, moreDataNews) {
				callback(null, newsFeedResult, moreDataNews);
			});
		});
	});
};
module.exports.getNewsFeed = getNewsFeed;

var getNewsByKeyword = function(userId, keyword, size, callback) {
	NewsHub.find({userId: userId})
	.sort({dayScore: -1, evalScore: -1, publishedDate: -1})
	.exec(function(err, hubs) {
		if (err)
			return callback(err);
		var newsfeed = [];
		for (i = 0; i < hubs.length; i++)
			if (hubs[i].userKeywordList.indexOf(keyword) !== -1) {
				var hashtag = '';
				for (j = 0; j < hubs[i].userKeywordList.length; j++)
					hashtag += Filter.keywordToHashtag(hubs[i].userKeywordList[j]) + ' ';
				newsfeed.push({
					id: hubs[i].articleId,
					url: hubs[i].url,
					title: hubs[i].title,
					thumbnail: hubs[i].thumbnail,
					source: hubs[i].source,
					publishedDate: hubs[i].publishedDate,
					dayScore: hubs[i].dayScore,
					hashtag: hashtag,
					star: hubs[i].star,
					timeline: false
				});
			}
		newsfeed[0].timeline = true;
		for (i = 1; i < newsfeed.length; i++)
			if (newsfeed[i].dayScore != newsfeed[i-1].dayScore)
				newsfeed[i].timeline = true;
		Pagination.paginate(newsfeed, size, function(newsFeedResult, moreDataNews) {
			callback(null, newsFeedResult, moreDataNews);
		});
	});
};
module.exports.getNewsByKeyword = getNewsByKeyword;

var getMediaFeed = function(userId, size, callback) {
	User.findById(userId).exec(function(err, user) {
		if (err)
			return callback(err);
		var wordList = [];
		for (i = 0; i < user.checkList.length; i++)
			if (user.checkList[i])
				wordList.push(user.wordList[i]);

		MediaHub.find({userId: userId})
		.sort({dayScore: -1, evalScore: -1, publishedDate: -1})
		.exec(function(err, hubs) {
			if (err)
				return callback(err);
			var mediafeed = [];
			for (i = 0; i < hubs.length; i++)
				if (_.intersection(wordList, hubs[i].userKeywordList).length > 0) {
					mediafeed.push({
						id: hubs[i].articleId,
						url: hubs[i].url,
						title: hubs[i].title,
						thumbnail: hubs[i].thumbnail,
						source: hubs[i].source,
						avatar: hubs[i].avatar,
						publishedDate: hubs[i].publishedDate,
						dayScore: hubs[i].dayScore,
						star: hubs[i].star,
						timeline: false
					});
				}
			if (mediafeed.length > 0) {
				mediafeed[0].timeline = true;
				for (i = 1; i < mediafeed.length; i++)
					if (mediafeed[i].dayScore != mediafeed[i-1].dayScore)
						mediafeed[i].timeline = true;
			}
			Pagination.paginate(mediafeed, size, function(mediaFeedResult, moreDataMedia) {
				callback(null, mediaFeedResult, moreDataMedia);
			});
		});
	});
};
module.exports.getMediaFeed = getMediaFeed;

var getMediaByKeyword = function(userId, keyword, size, callback) {
	MediaHub.find({userId: userId})
	.sort({dayScore: -1, evalScore: -1, publishedDate: -1})
	.exec(function(err, hubs) {
		if (err)
			return callback(err);
		var mediafeed = [];
		for (i = 0; i < hubs.length; i++)
			if (hubs[i].userKeywordList.indexOf(keyword) !== -1) {
				var hashtag = '';
				for (j = 0; j < hubs[i].userKeywordList.length; j++)
					hashtag += Filter.keywordToHashtag(hubs[i].userKeywordList[j]) + ' ';
				mediafeed.push({
					id: hubs[i].articleId,
					url: hubs[i].url,
					title: hubs[i].title,
					thumbnail: hubs[i].thumbnail,
					source: hubs[i].source,
					avatar: hubs[i].avatar,
					publishedDate: hubs[i].publishedDate,
					dayScore: hubs[i].dayScore,
					hashtag: hashtag,
					star: hubs[i].star,
					timeline: false
				});
			}
		mediafeed[0].timeline = true;
		for (i = 1; i < mediafeed.length; i++)
			if (mediafeed[i].dayScore != mediafeed[i-1].dayScore)
				mediafeed[i].timeline = true;
		Pagination.paginate(mediafeed, size, function(mediaFeedResult, moreDataMedia) {
			callback(null, mediaFeedResult, moreDataMedia);
		});
	});
};
module.exports.getMediaByKeyword = getMediaByKeyword;