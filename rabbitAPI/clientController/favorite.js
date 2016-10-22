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
			var todayArr = [];
			todayArr.push(hubs[i].favoriteDate.getDate());
			todayArr.push(hubs[i].favoriteDate.getMonth());
			todayArr.push(hubs[i].favoriteDate.getFullYear());
			dayScore = todayArr[0] + todayArr[1]*50 + todayArr[2]*100;
			newsfeed.push({
				id: hubs[i].articleId,
				url: hubs[i].url,
				title: hubs[i].title,
				thumbnail: hubs[i].thumbnail,
				source: hubs[i].source,
				publishedDate: hubs[i].favoriteDate,
				dayScore: dayScore,
				hashtag: hashtag,
				star: hubs[i].star,
				timeline: false
			});
		}
		var D = require('../libs/date.js');
		if (newsfeed.length > 0) {
			if (D.Today(newsfeed[0].publishedDate))
				newsfeed[0].timeline = 'Today';
			else if (D.Yesterday(newsfeed[0].publishedDate))
				newsfeed[0].timeline = 'Yesterday';
			else newsfeed[0].timeline = D.dateAbbr(newsfeed[0].publishedDate);
			
			for (i = 1; i < newsfeed.length; i++)
				if (newsfeed[i].dayScore != newsfeed[i-1].dayScore) {
					if (D.Today(newsfeed[i].publishedDate))
						newsfeed[i].timeline = 'Today';
					else if (D.Yesterday(newsfeed[i].publishedDate))
						newsfeed[i].timeline = 'Yesterday';
					else newsfeed[i].timeline = D.dateAbbr(newsfeed[i].publishedDate);
				}
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
			var todayArr = [];
			todayArr.push(hubs[i].favoriteDate.getDate());
			todayArr.push(hubs[i].favoriteDate.getMonth());
			todayArr.push(hubs[i].favoriteDate.getFullYear());
			dayScore = todayArr[0] + todayArr[1]*50 + todayArr[2]*100;
			mediafeed.push({
				id: hubs[i].articleId,
				url: hubs[i].url,
				title: hubs[i].title,
				thumbnail: hubs[i].thumbnail,
				source: hubs[i].source,
				avatar: hubs[i].avatar,
				publishedDate: hubs[i].favoriteDate,
				dayScore: dayScore,
				hashtag: hashtag,
				star: hubs[i].star,
				timeline: false
			});
		}
		var D = require('../libs/date.js');
		if (mediafeed.length > 0) {
			if (D.Today(mediafeed[0].publishedDate))
				mediafeed[0].timeline = 'Today';
			else if (D.Yesterday(mediafeed[0].publishedDate))
				mediafeed[0].timeline = 'Yesterday';
			else mediafeed[0].timeline = D.dateAbbr(mediafeed[0].publishedDate);
			
			for (i = 1; i < mediafeed.length; i++)
				if (mediafeed[i].dayScore != mediafeed[i-1].dayScore) {
					if (D.Today(mediafeed[i].publishedDate))
						mediafeed[i].timeline = 'Today';
					else if (D.Yesterday(mediafeed[i].publishedDate))
						mediafeed[i].timeline = 'Yesterday';
					else mediafeed[i].timeline = D.dateAbbr(mediafeed[i].publishedDate);
				}
		}
		Pagination.paginate(mediafeed, size, function(mediaFeedResult, moreDataMedia) {
			callback(null, mediaFeedResult, moreDataMedia);
		});
	});
};
module.exports.getMediaFavorite = getMediaFavorite;