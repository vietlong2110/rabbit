var express = require('express');
var app = express();
var router = express.Router();

var async = require('async');
var mongoose = require('mongoose');

router.get('/search', function(req, res) {
	var Feed = require('../clientController/feed.js');
	Feed.searchFeed(req.query.q, function(searchResult) {
		var feedResult = [];
		var hashtag = '#' + req.query.q;
		for (i in searchResult)
			feedResult.push({
				id: i,
				url: searchResult[i].url,
				title: searchResult[i].title,
				thumbnail: searchResult[i].thumbnail,
				hashtag: hashtag
			});
		res.json({
			searchResult: feedResult, 
			keyword: req.query.q
		});
	});
});

module.exports = router;