/********************************************************************************************
*		This controller include common functions relating to extract data from server		*
********************************************************************************************/

var mongoose = require('mongoose');

//get current keyword/hashtag list controller
var getList = function(userId, callback) {
	var List = require('./list.js');

	List.getList(userId, function(wordList, checkList) {
		var followingList = [];
		var Filter = require('../libs/filter.js');

		for (i in wordList) {
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
var getFeed = function(userId, callback) {
	var Feed = require('./feed.js');

	// get all feeds with their keywords list corresponding to 
	// the settings from following list
	Feed.getFeed(userId, function(articleResult, hashtagResult) {
		var feed = [];
		var Filter = require('../libs/filter.js');

		for (i in articleResult) { //add keyword to a list of hashtag for an article
			var hashtag = '', hashtagLine = hashtagResult[i];
			for (j in hashtagLine)
				hashtag = hashtag + ' ' + Filter.keywordToHashtag(hashtagLine[j]);
			articleResult[i].hashtag = hashtag;
		}

		articleResult.sort(function(a,b) {
			var bToday = b.today[0] + b.today[1]*10 + b.today[2]*100;
			var aToday = a.today[0] + a.today[1]*10 + a.today[2]*100;

			if (bToday - aToday === 0) { //if 2 articles are on the same day
				if (b.evalScore - a.evalScore === 0)  //if 2 articles have the same score
					return b.publishedDate - a.publishedDate; //sort by published date
				else return b.evalScore - a.evalScore; //otherwise sort by ranking score
			}
			else return bToday - aToday; //otherwise sort by day first
		});

		for (i in articleResult) {
			// console.log(articleResult[i].today);
			feed.push({
				id: i,
				eval: articleResult[i].evalScore,
				date: articleResult[i].publishedDate,
				today: articleResult[i].today,
				url: articleResult[i].url,
				title: articleResult[i].title,
				thumbnail: articleResult[i].thumbnail,
				hashtag: articleResult[i].hashtag,
				star: false //will change later
			});
		}
		
		callback(feed);
	});
};
module.exports.getFeed = getFeed;