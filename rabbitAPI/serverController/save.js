/********************************************************************************************
*		This controller include all functions relating to saving data to server database	*
********************************************************************************************/

var async = require('async');
var mongoose = require('mongoose');

var saveKeyword = function(keywordSet, originKeywordSet, callback) {
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

			callback();
		});
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

				Extract.extractContent(article.url, function(originKeywordSet, keywordSet, tf) {
					var a = new Article({
						url: article.url,
						title: article.title,
						thumbnail: article.thumbnail,
						publishedDate: article.publishedDate,
						keywords: keywordSet,
						tf: tf,
						media: false
					});

					a.save(function(err) {
						if (err) { //process error case later
							console.log(err);
							cb();
						}
						
						saveKeyword(keywordSet, originKeywordSet, function() {
							cb();
						});
					});
				});
			}
			else cb();
		});
	}, function(err) {
		if (err) //process error case later
			console.log(err);
			
		callback();
	});
};
module.exports.saveArticle = saveArticle;

var saveMediaArticle = function(articles, callback) {
	var Article = require('../models/articles.js');

	async.each(articles, function(article, cb) {

		Article.findOne({url: article.url})
		.exec(function(err, item) {
			if (err) //process error case later
				res.json({Error: err});
			else if (item === null) {
				var Extract = require('./extract.js');

				//if (article.content === null)
				Extract.extractKeyword(article.title, function(originKeywordSet, keywordSet, tf) {
					var a = new Article({
						url: article.url,
						title: article.title,
						source: article.source,
						avatar: article.avatar,
						thumbnail: article.thumbnail,
						publishedDate: article.publishedDate,
						keywords: keywordSet,
						tf: tf,
						media: true
					});

					a.save(function(err) {
						if (err) { //process error case later
							console.log(err);
							cb();
						}

						saveKeyword(keywordSet, originKeywordSet, function() {
							cb();
						})
					});
				});
			}
			else cb();
		});
	}, function(err) {
		if (err) //process error case later
			console.log(err);
		
		callback();
	});
};
module.exports.saveMediaArticle = saveMediaArticle;