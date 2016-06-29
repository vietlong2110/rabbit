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

router.post('/9gag', function(req, res) {
	var url = req.body.url;
	var nineGag = require('../serverController/9gag.js');
	nineGag.feedParse(urlencode(url), function(data) {
		res.json(data);
	});
});

router.get('/compute', function(req, res) {
	var Compute = require('../serverController/compute.js');
	Compute.computeKeywordsWeight(function() {
		res.json({updated: true});
	})
});

module.exports = router;