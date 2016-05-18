var express = require('express');
var app = express();
var router = express.Router();

var async = require('async');
var mongoose = require('mongoose');

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
	var userId = '573c48e0f1fe3a8823a2df30'; //replace after creating login part
	Follow.addList(query, userId, function(followed) {
		res.json({
			followed: followed
		});
	});
});

module.exports = router;