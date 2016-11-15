/****************************************************************************************************
*		This file include all the calls to test every functions needed in loading data to server	*
****************************************************************************************************/

var express = require('express');
var app = express();
var router = express.Router();
var urlencode = require('urlencode');

var mongoose = require('mongoose');
var async = require('async');
var Entities = require('html-entities').AllHtmlEntities;
var entities = new Entities();
var fs = require('fs');
var RSS = require('../serverController/rss.js');
var Article = require('../models/articles.js');
var Extract = require('../serverController/extract.js');
var Save = require('../serverController/save.js');

router.get('/extractimg', function(req, res) {
	var url = 'http://vnexpress.net/tin-tuc/the-gioi/bau-cu-tong-thong-my-2016/dieu-gi-xay-ra-neu-clinton-va-trump-khong-dat-qua-ban-phieu-dai-cu-tri-3494495.html';
	Extract.extractImage(url, function(img) {
		res.json({img: img});
	});
});

router.post('/rss', function(req, res) { //test rss reader
	// var url = 'http://feeds.feedburner.com/TechCrunch/fundings-exits';
	var url = req.body.url;
	var RSS = require('../serverController/rss.js');
	RSS.feedParse(urlencode(url), function(data) {
		res.json(data);
	});
});

router.get('/searchimagesinsta', function(req, res) {
	var Insta = require('../serverController/instagram.js');
	Insta.searchUser(req.query.q, function(data) {
		// Insta.searchMediaTags(req.query.q, function(images) {
		// 	images = images.concat(data);
			res.json({images: data});
		// });
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

router.get('/lemma', function(req, res) {
	var stringFuncs = require('../libs/stringfunctions.js');

	stringFuncs.lemma(req.query.q, function(results) {
		res.json({lemma: results});
	})
});

router.get('/getpagefeed', function(req, res) {
	var FB = require('../clientController/fb.js');
	var token = 'EAAM98EFnHGMBAAVus7AeE1KN6NDSeZCMTbS9QYPOGsTPpiC03JI3ipVVS2uf8WjJSA3AmWdRa6oJ8XrbjMNgZAZAsio85sWdTaIDEbNxWOap3xBlI362MJSuV68QXqnqHLxG6s8LB0rDBCR9RcbduF7do7M2PMZD';

	FB.getUserLikes(token, function(err, likes) {
		if (err)
			res.json({error: err});
		var a = [];
		a.push(likes[5]);
		FB.pageFeed(token, a, function(err, data) {
			if (err)
				res.json({error: err});
			res.json({data: data});
		});
	});
});

router.get('/extract', function(req, res) {
	var link = 'http://vnexpress.net/tin-tuc/the-gioi/bau-cu-tong-thong-my-2016/dieu-gi-xay-ra-neu-clinton-va-trump-khong-dat-qua-ban-phieu-dai-cu-tri-3494495.html';
	Extract.extractContent(null, link, 
	function(err, originKeywordSet, keywordSet, tf, titleKeywordSet, tfTitle) {
		if (err)
			res.json({error : err});
		else res.json({
			originKeywordSet: originKeywordSet,
			keywordSet: keywordSet,
			tf: tf,
			titleKeywordSet: titleKeywordSet,
			tfTitle: tfTitle
		});
	});
});

module.exports = router;