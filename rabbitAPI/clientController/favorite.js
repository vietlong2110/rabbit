var mongoose = require('mongoose');
var NewsHub = require('../models/newshub.js');
var MediaHub = require('../models/mediahub.js');
var Pagination = require('../libs/pagination.js');
var Filter = require('../libs/filter.js');

var updateNewsFavorite = function(userId, articleId, callback) {
	NewsHub.findOne({
		userId: userId,
		articleId: articleId
	}).exec(function(err, hub) {
		if (err || hub === null)
			return callback(false);
		hub.star = !hub.star;
		if (hub.star)
			hub.favoriteDate = new Date();
		hub.save(function(err) {
			if (err)
				return callback(false);
			callback(true);
		});
	});
};
module.exports.updateNewsFavorite = updateNewsFavorite;

var getNewsFavorite = function(userId, size, callback) {
	NewsHub.find({
		userId: userId,
		star: true
	}).sort({favoriteDate: -1})
	.exec(function(err, hubs) {
		if (err)
			return callback(err);
		var newsfeed = [];
		for (i = 0; i < hubs.length; i++) {
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
};
module.exports.getNewsFavorite = getNewsFavorite;

var updateMediaFavorite = function(userId, articleId, callback) {
	MediaHub.findOne({
		userId: userId,
		articleId: articleId
	}).exec(function(err, hub) {
		if (err || hub === null)
			return callback(false);
		if (hub.star)
			hub.favoriteDate = new Date();
		hub.star = !hub.star;
		hub.save(function(err) {
			if (err)
				return callback(false);
			callback(true);
		});
	});
};
module.exports.updateMediaFavorite = updateMediaFavorite;

var getMediaFavorite = function(userId, size, callback) {
	MediaHub.find({
		userId: userId,
		star: true
	}).sort({favoriteDate: -1})
	.exec(function(err, hubs) {
		if (err)
			return callback(err);
		var mediafeed = [];
		for (i = 0; i < hubs.length; i++) {
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
};
module.exports.getMediaFavorite = getMediaFavorite;