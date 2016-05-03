var express = require('express');
var app = express();
var router = express.Router();

var mongoose = require('mongoose');
var Article = require('../models/articles.js');

router.get('/rss/:url', function(req, res) {
	var RSS = require('../serverProcess/rss.js');
	// console.log('In router!');
	RSS.feedParse(req.params.url, function(data) {
		// console.log('Received data!');
		res.json(data);
	});
});

module.exports = router;