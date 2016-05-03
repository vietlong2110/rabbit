var request = require('request');
var async = require('async');

var mongoose = require('mongoose');
var Article = require('../models/articles.js');

var feedParse = function(url, callback) {
	// console.log('In feedParse!');
	var google_api_url = "https://ajax.googleapis.com/ajax/services/feed/load?v=2.0&q=" + url + "&num=30";
	request(google_api_url, function(err, res, body) {
		if (!err && res.statusCode == 200) {
			if (JSON.parse(body).responseData !== null && JSON.parse(body).responseData.feed !== null) {
				var entries = JSON.parse(body).responseData.feed.entries;
				var articles = [];
				for (i = 0; i < entries.length; i++) {
					articles.push({url: entries[i].link, 
									title: entries[i].title,
									publishedDate: entries[i].publishedDate});
				}
				async.each(articles, function(article, cb) {
					var a = new Article();
					a.url = article.url; 
					a.title = article.url; 
					a.publishedDate = article.publishedDate;
					// Article.findOne(article).exec(
					a.save(function(err, article) {
						if (err)
							cb(err);
						cb();
					});
				}, function(err) {
					if (err)
						callback(err);
				});
				callback(articles);
			}
		}
		else callback(err);
	});
};
module.exports.feedParse = feedParse;