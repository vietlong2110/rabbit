/****************************************************************************************************
*		This file include all the calls to test every functions needed in loading data to server	*
****************************************************************************************************/

var express = require('express');
var app = express();
var router = express.Router();
var urlencode = require('urlencode');

var mongoose = require('mongoose');

router.post('/rss', function(req, res) { //test rss reader
	// var url = 'http://feeds.feedburner.com/TechCrunch/fundings-exits';
	var url = req.body.url;
	var RSS = require('../serverController/rss.js');
	RSS.feedParse(urlencode(url), function(data) {
		res.json(data);
	});
});

router.post('/extract/content', function(req, res) { //test the extracting content function
	var url = 'http://feedproxy.google.com/~r/techcrunch/fundings-exits/~3/EZwKNEY9vEE/';
	var url = req.body.url;
	var Extract = require('../serverController/extract.js');
 	Extract.extractContent(url, function(keywordSet, tf) {
 		res.json({KeywordSet: keywordSet});
 	});
});

router.post('/extract/keywords', function(req, res) { //test the extracting keyword function
	var content = req.body.content;
	var Extract = require('../serverController/extract.js');
	Extract.extractKeyword(content, function(keywords) {
		res.json({Keywords: keywords});
	});
});

router.post('/extract/image', function(req, res){ //test the extracting thumbnail function
	// var url = 'http://feedproxy.google.com/~r/techcrunch/fundings-exits/~3/EZwKNEY9vEE/';
	var url = req.body.url;
	var Extract = require('../serverController/extract.js');
 	Extract.extractImage(url, function(image) {
 		res.json({imageURL: image});
 	});
});

module.exports = router;