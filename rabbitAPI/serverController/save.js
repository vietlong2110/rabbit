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

			async.each(keywordSet, function(word, cb1) {
				Keyword.findOne({word: word.keyword}).exec(function(err, keyword) {
					if (err) {
						console.log(err);
						cb();
					}
					else if (keyword === null) {
						var newKeyword = new Keyword({
							word: word.keyword,
							df: 1,
							articleIDs: word.articles
						});

						newKeyword.save(function(err) {
							if (err) 
								console.log(err);

							cb();
						});
					}
					else {
						keyword.df = keyword.df + 1;
						for (i in word.articles)
							if (keyword.articleIDs.indexOf(word.articles[i]) === -1)
								keyword.articleIDs.push(word.articles[i]);

						keyword.save(function(err) {
							if (err)
								console.log(err);

							cb();
						});
					}
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
	var keywords = [], originkeywords = [], articleIDs = [];

	async.each(articles, function(article, cb) {
		var Extract = require('./extract.js');

		Extract.extractContent(article.title, article.url,
		function(originKeywordSet, keywordSet, tf, titleKeywordSet, tfTitle) {
			var query = {url: article.url};
			var update = {
				$set: {
					title: article.title,
					thumbnail: article.thumbnail,
					publishedDate: article.publishedDate,
					titleKeywords: titleKeywordSet,
					tfTitle: tfTitle,
					keywords: keywordSet,
					tf: tf,
					media: false
				}
			};
			var options = {
				upsert: true,
				new: true
			};

			Article.findOneAndUpdate(query, update, options).exec(function(err, item) {
				if (err && err.code !== 11000 && err.code !== 11001) //process error case later
					console.log(err);
				
				articleIDs.push(item._id);
				cb();
			});
			for (i in titleKeywordSet)
				keywords.push({
					keyword: titleKeywordSet[i],
					articles: articleIDs
				});
			for (i in keywordSet)
				keywords.push({
					keyword: keywordSet[i],
					articles: articleIDs
				});
			originkeywords = originkeywords.concat(originKeywordSet);
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

		Extract.extractKeyword(null, article.title, function(originKeywordSet, keywordSet, tf) {
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
			keywords = keywords.concat(keywordSet);
			originkeywords = originkeywords.concat(originKeywordSet);
		});
	}, function(err) {
		if (err) //process error case later
			console.log(err);
		
		callback();
	});
};
module.exports.saveMediaArticle = saveMediaArticle;