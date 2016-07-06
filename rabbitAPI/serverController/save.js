/********************************************************************************************
*		This controller include all functions relating to saving data to server database	*
********************************************************************************************/

var async = require('async');
var mongoose = require('mongoose');

var saveKeyword = function(keywordSet, originKeywordSet, callback) {
	async.parallel([
		function(cb) {
			//For calculating inverted document frequency
			var Keyword = require('../models/keywords.js');

			async.each(keywordSet, function(keyword, cb1) {
				var query = {word: keyword};
				var update = {$inc: {df: 1}}; //increase document frequency to one
				var options = {upsert: true};

				Keyword.findOneAndUpdate(query, update, options, function(err, item) {
					if (err) //process error case later
						console.log(err);
				
					cb1();
				});
			}, function(err) {
				if (err) //process error case later
					console.log(err);

				cb();
			});
		},
		function(cb) {
			//For produce search suggestions
			var OriginKeyword = require('../models/originkeywords.js');

			async.each(originKeywordSet, function(keyword, cb2) {
				var query = {word: keyword};
				var update = {
					$inc: {df: 1},
					$currentDate: {recentlyUpdated: true}
				}; //increase document frequency to one
				var options = {upsert: true};

				OriginKeyword.findOneAndUpdate(query, update, options, function(err, item) {
					if (err) //process error case later
						console.log(err);
				
					cb2();
				});
			}, function(err) {
				if (err) //process error case later
					console.log(err);

				cb();
			});
		}
	], function() {
		callback();
	});
};
module.exports.saveKeyword = saveKeyword;

//Save information of an article to database
var saveArticle = function(articles, callback) {
	var Article = require('../models/articles.js');
	var keywords = [], originkeywords = [];

	async.each(articles, function(article, cb) {
		var Extract = require('./extract.js');

		Extract.extractContent(article.url, function(content, originKeywordSet, keywordSet, tf) {
			var query = {url: article.url};
			var update = {
				$set: {
					title: article.title,
					thumbnail: article.thumbnail,
					content: content,
					publishedDate: article.publishedDate,
					keywords: keywordSet,
					tf: tf,
					media: false
				}
			};
			var options = {upsert: true};

			Article.findOneAndUpdate(query, update, options).exec(function(err, item) {
				if (err) //process error case later
					console.log(err);
				
				cb();
			});
			keywords.concat(keywordSet);
			originkeywords.concat(originKeywordSet);
		});
	}, function(err) {
		if (err) //process error case later
			console.log(err);
			
		callback(keywords, originkeywords);
	});
};
module.exports.saveArticle = saveArticle;

var saveMediaArticle = function(articles, callback) {
	var Article = require('../models/articles.js');
	var keywords = [], originkeywords = [];

	async.each(articles, function(article, cb) {
		var Extract = require('./extract.js');

		Extract.extractKeyword(article.title, function(content, originKeywordSet, keywordSet, tf) {
			var query = {url: article.url};
			var update = {
				$set: {
					title: article.title,
					source: article.source,
					avatar: article.avatar,
					thumbnail: article.thumbnail,
					publishedDate: article.publishedDate,
					keywords: keywordSet,
					tf: tf,
					media: true
				}
			};
			var options = {upsert: true};

			Article.findOneAndUpdate(query, update, options).exec(function(err, item) {
				if (err) //process error case later
					console.log(err);
				
				cb();
			});
			keywords.concat(keywordSet);
			originkeywords.concat(originKeywordSet);
		});
	}, function(err) {
		if (err) //process error case later
			console.log(err);
		
		callback();
	});
};
module.exports.saveMediaArticle = saveMediaArticle;