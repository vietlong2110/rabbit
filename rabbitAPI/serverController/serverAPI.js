var express = require('express');
var app = express();
var router = express.Router();
var urlencode = require('urlencode');

var mongoose = require('mongoose');
var Article = require('../models/articles.js');

router.post('/rss', function(req, res) { //test global function
	// var url = 'http://feeds.feedburner.com/TechCrunch/fundings-exits';
	var url = req.body.url;
	var RSS = require('../serverProcess/rss.js');
	RSS.feedParse(urlencode(url), function(data) {
		res.json(data);
	});
});

router.post('/extract/content', function(req, res) { //test the extracting content function
	// var url = 'http://feedproxy.google.com/~r/techcrunch/fundings-exits/~3/EZwKNEY9vEE/';
	var url = req.body.url;
	var Extract = require('../serverProcess/extract.js');
 	Extract.extractContent(url, function(content) {
 		res.json({KeywordSet: content});
 	});
});

router.post('/extract/keywords', function(req, res) { //test the extracting keyword function
	var content = req.body.content;
	var Extract = require('../serverProcess/extract.js');
	Extract.extractKeyword(content, function(keywords) {
		res.json({Keywords: keywords});
	});
});

router.post('/extract/image', function(req, res){
	// var url = 'http://feedproxy.google.com/~r/techcrunch/fundings-exits/~3/EZwKNEY9vEE/';
});

module.exports = router;