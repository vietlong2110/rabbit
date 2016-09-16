/********************************************************************************************
*		This controller include common functions relating to extract data from server		*
********************************************************************************************/

var mongoose = require('mongoose');
var stringFuncs = require('../libs/stringfunctions.js');
var Pagination = require('../libs/pagination.js');
var Filter = require('../libs/filter.js');
var Feed = require('./feed.js');
var User = require('../models/users.js');

//get current keyword/hashtag list controller
var getList = function(userId, callback) {
	var List = require('./list.js');

	List.getList(userId, function(wordList, checkList) {
		var followingList = [];
		var Filter = require('../libs/filter.js');

		for (i = 0; i < wordList.length; i++) {
			var niceKeyword = Filter.niceTitle(wordList[i]); //render a nice keyword

			followingList.push({
				niceKeyword: niceKeyword,
				keyword: wordList[i],
				isChecked: checkList[i]
			});
		}
		callback(followingList);
	});
};
module.exports.getList = getList;

//get current newsfeed controller
var getFeed = function(userId, querySizeNews, querySizeMedia, callback) {
	Feed.getFeed(userId, function(err, newsfeed, mediafeed) {
		if (err)
			return callback(err);

		newsfeed.sort(function(a,b) {
			var bToday = b.today[0] + b.today[1]*100 + b.today[2]*10;
			var aToday = a.today[0] + a.today[1]*100 + a.today[2]*10;

			if (bToday - aToday === 0) { //if 2 articles are on the same day
				if (b.evalScore - a.evalScore === 0)  //if 2 articles have the same score
					return b.publishedDate - a.publishedDate; //sort by published date
				else return b.evalScore - a.evalScore; //otherwise sort by ranking score
			}
			else return bToday - aToday; //otherwise sort by day first
		});
		mediafeed.sort(function(a,b) {
			var bToday = b.today[0] + b.today[1]*100 + b.today[2]*10;
			var aToday = a.today[0] + a.today[1]*100 + a.today[2]*10;

			if (bToday - aToday === 0) { //if 2 articles are on the same day
				if (b.evalScore - a.evalScore === 0)  //if 2 articles have the same score
					return b.publishedDate - a.publishedDate; //sort by published date
				else return b.evalScore - a.evalScore; //otherwise sort by ranking score
			}
			else return bToday - aToday; //otherwise sort by day first
		});
		Pagination.paginate(newsfeed, querySizeNews, function(newsfeed, moreDataNews) {
			Pagination.paginate(mediafeed, querySizeMedia, function(mediafeed, moreDataMedia) {
				callback(null, newsfeed, mediafeed, moreDataNews, moreDataMedia);
			});
		});
	});
};
module.exports.getFeed = getFeed;

var getFeedByKeyword = function(userId, keyword, querySizeNews, querySizeMedia, callback) {
	User.findById(userId).exec(function(err, user) {
		if (err)
			return callback(err);
		if (user.wordList.indexOf(keyword) === -1)
			return callback('You have not followed "' + keyword + '" yet!');
		Feed.getFeedByKeyword(userId, keyword, function(err, newsfeed, mediafeed) {
			if (err)
				return callback(err);

			newsfeed.sort(function(a,b) {
				var bToday = b.today[0] + b.today[1]*100 + b.today[2]*10;
				var aToday = a.today[0] + a.today[1]*100 + a.today[2]*10;

				if (bToday - aToday === 0) { //if 2 articles are on the same day
					if (b.evalScore - a.evalScore === 0)  //if 2 articles have the same score
						return b.publishedDate - a.publishedDate; //sort by published date
					else return b.evalScore - a.evalScore; //otherwise sort by ranking score
				}
				else return bToday - aToday; //otherwise sort by day first
			});
			mediafeed.sort(function(a,b) {
				var bToday = b.today[0] + b.today[1]*100 + b.today[2]*10;
				var aToday = a.today[0] + a.today[1]*100 + a.today[2]*10;

				if (bToday - aToday === 0) { //if 2 articles are on the same day
					if (b.evalScore - a.evalScore === 0)  //if 2 articles have the same score
						return b.publishedDate - a.publishedDate; //sort by published date
					else return b.evalScore - a.evalScore; //otherwise sort by ranking score
				}
				else return bToday - aToday; //otherwise sort by day first
			});
			Pagination.paginate(newsfeed, querySizeNews, function(newsfeed, moreDataNews) {
				Pagination.paginate(mediafeed, querySizeMedia, function(mediafeed, moreDataMedia) {
					callback(null, newsfeed, mediafeed, moreDataNews, moreDataMedia);
				});
			});
		});
	});
};
module.exports.getFeedByKeyword = getFeedByKeyword;