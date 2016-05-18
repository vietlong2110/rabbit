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
		var hashtag = '#' + query;
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
	
});

module.exports = router;