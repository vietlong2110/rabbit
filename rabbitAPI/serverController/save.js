/********************************************************************************************
*		This controller include all functions relating to saving data to server database	*
********************************************************************************************/

var async = require('async');
var mongoose = require('mongoose');

//For calculating inverted document frequency
var saveKeyword = function(keywordSet) {
	var Keyword = require('../models/keywords.js');

	async.each(keywordSet, function(keyword, callback) {
		var query = {word: keyword};
		var update = {$inc: {df: 1}}; //increase document frequency to one
		var options = {upsert: true};

		Keyword.findOneAndUpdate(query, update, options, function(err, item) {
			if (err) { //process error case later
				console.log(err);
				callback();
			}
		});
	}, function(err) {
		if (err) //process error case later
			console.log(err);
	});
};
module.exports.saveKeyword = saveKeyword;

//Save information of an article to database
var saveArticle = function(articles, callback) {
	var Article = require('../models/articles.js');

	async.each(articles, function(article, cb) {

		Article.findOne({url: article.url})
		.exec(function(err, item) {
			if (err) //process error case later
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
						if (err) { //process error case later
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
		if (err) { //process error case later
			console.log(err);
			callback();
		}
		
		callback();
	});
};
module.exports.saveArticle = saveArticle;

var saveMediaArticle = function(articles, callback) {
	var mediaArticle = require('../models/mediaArticles.js');

	async.each(articles, function(article, cb) {

		mediaArticle.findOne({url: article.url})
		.exec(function(err, item) {
			if (err) //process error case later
				res.json({Error: err});
			else if (item === null) {
				var Extract = require('./extract.js');

				//if (article.content === null)
				Extract.extractKeyword(article.title, function(keywordSet, tf) {
					var a = new mediaArticle({
						url: article.url,
						title: article.title,
						thumbnail: article.thumbnail,
						publishedDate: article.publishedDate,
						keywords: keywordSet,
						tf: tf
					});

					a.save(function(err) {
						if (err) { //process error case later
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
		if (err) { //process error case later
			console.log(err);
			callback();
		}
		
		callback();
	});
};
module.exports.saveMediaArticle = saveMediaArticle;