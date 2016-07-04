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

router.get('/checkduplicatekeyword', function(req, res) {
	var OriginKeyword = require('../models/keywords.js');

	OriginKeyword.find({}).exec(function(err, originkeywords) {
		for (i = 0; i < originkeywords.length; i++)
			for (j = i+1; j < originkeywords.length; j++)
				if (originkeywords[i].word === originkeywords[j].word)
					res.json({duplicate: true});
		res.json({duplicate: false});
	});
});

router.get('/anyzero', function(req, res) {
	var OriginKeyword = require('../models/originkeywords.js');

	OriginKeyword.find({}).exec(function(err, originkeywords) {
		for (i = 0; i < originkeywords.length; i++)
			if (originkeywords[i].weight === 0)
				res.json({haveZero: true});
		res.json({haveZero: false});
	});
});

module.exports = router;