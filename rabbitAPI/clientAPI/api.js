var express = require('express');
var app = express();
var router = express.Router();

var async = require('async');
var mongoose = require('mongoose');

var userId = '57401613c9b39749cdc069ee'; //replace after creating login part

router.get('/search', function(req, res) {
	var Feed = require('../clientController/feed.js');
	var Filter = require('../libs/filter.js');
	var query = Filter.querySanitize(req.query.q);
	Feed.searchFeed(query, function(searchResult) {
		var feedResult = [];
		var hashtag = Filter.keywordToHashtag(query);
		for (i in searchResult)
			feedResult.push({
				id: i,
				url: searchResult[i].url,
				title: searchResult[i].title,
				thumbnail: searchResult[i].thumbnail,
				hashtag: hashtag
			});
		var stringFuncs = require('../libs/stringfunctions.js');
		var queryTitle = stringFuncs.niceTitle(query);
		res.json({
			searchResult: feedResult,
			keywordSearch: req.query.q,
			queryTitle: queryTitle
		});
	});
});

router.post('/follow', function(req, res) {
	var Filter = require('../libs/filter.js');
	var query = Filter.querySanitize(req.body.q);
	var Follow = require('../clientController/follow.js');
	Follow.addList(query, userId, function(followed1) {
		if (followed1 >= 1) {
			Follow.addArticle(query, userId, function(followed2) {
				res.json({
					followed: followed2
				});
			})
		}
	});
});

router.get('/getlist', function(req, res) {
	var List = require('../clientController/list.js');
	List.getList(userId, function(wordList, checkList) {
		var followingList = [];
		for (i in wordList)
			followingList.push({
				keyword: wordList[i],
				isChecked: checkList[i]
			});
		res.json({
			keywords: followingList
		});
	});
});

router.get('/getfeed', function(req, res) {
	var Feed = require('../clientController/feed.js');
	Feed.getFeed(userId, function(articleResult) {
		articleResult.sort(function(a,b) {
			if (b.today - a.today === 0) {
				if (b.evalScore - a.evalScore === 0)
					return b.publishedDate - a.publishedDate;
				else return b.evalScore - a.evalScore;
			}
			else return b.today - a.today;
		});
		var feed = [];
		for (i in articleResult) {
			feed.push({
				id: i,
				url: articleResult[i].url,
				title: articleResult[i].title,
				thumbnail: articleResult[i].thumbnail,
				// hashtag: hashtag
			});
		}
		res.json({news: feed});
	});
});

module.exports = router;