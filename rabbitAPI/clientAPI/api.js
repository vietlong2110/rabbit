var express = require('express');
var app = express();
var router = express.Router();

var async = require('async');
var mongoose = require('mongoose');

var userId = '573e9637bb62788646415796'; //replace after creating login part

router.get('/search', function(req, res) {
	var Feed = require('../clientController/feed.js');
	var Query = require('../libs/filter.js');
	var query = Query.querySanitize(req.query.q);
	Feed.searchFeed(query, function(searchResult) {
		var feedResult = [];
		var hashtag = Query.keywordToHashtag(query);
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
	var Query = require('../libs/filter.js');
	var query = Query.querySanitize(req.body.q);
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
	var Follow = require('../clientController/follow.js');
	Follow.getList(userId, function(wordList, checkList) {
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

module.exports = router;