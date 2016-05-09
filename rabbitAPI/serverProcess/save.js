var async = require('async');

var mongoose = require('mongoose');

var saveKeyword = function(keywordSet) { //for calculating inverted document frequency
	var Keyword = require('../models/keywords.js');
	async.each(keywordSet, function(keyword, callback) {
		var query = {word: keyword};
		var update = {$inc: {df: 1}};
		var options = {upsert: true};
		Keyword.findOneAndUpdate(query, update, options, function(err, item) {
			if (err) {
				console.log(err);
				callback();
			}
		});
	}, function(err) {
		if (err)
			console.log(err);
	});
};
module.exports.saveKeyword = saveKeyword;

var saveArticle = function(articles, callback) { //save information of an article to database
	var Article = require('../models/articles.js');
	async.each(articles, function(article, cb) {
		Article.findOne({url: article.url})
		.exec(function(err, item) {
			if (err)
				res.json({Error: err});
			else if (item === null) {
				var Extract = require('./extract.js');
				Extract.extractContent(article.url, function(keywordSet, tf) {
					var a = new Article({
						url: article.url,
						title: article.title,
						thumbnail: article.thumbnail,
						publishedDate: article.publishedDate,
						keywords: keywordSet,
						tf: tf
					});
					a.save(function(err) {
						if (err) {
							console.log(err);
							cb();
						}
						saveKeyword(keywordSet);		
						cb();
					});
				});
			}
			else cb();
		});
	}, function(err) {
		if (err) {
			console.log(err);
			callback();
		}
		callback();
	});
};
module.exports.saveArticle = saveArticle;