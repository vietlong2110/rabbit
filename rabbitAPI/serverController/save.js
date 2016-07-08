/********************************************************************************************
*		This controller include all functions relating to saving data to server database	*
********************************************************************************************/

var async = require('async');
var mongoose = require('mongoose');

var saveKeyword = function(keywordSet, articleIDs, originKeywordSet, callback) {
	async.parallel([
		function(cb) {
			//For calculating inverted document frequency
			var Keyword = require('../models/keywords.js');

			async.forEachOfSeries(keywordSet, function(word, i, cb1) {
				Keyword.findOne({word: word}).exec(function(err, keyword) {
					if (err) {
						console.log(err);
						cb();
					}
					else if (keyword === null) {
						var newKeyword = new Keyword({
							word: keyword,
							df: 1,
							articleIDs: articleIDs[i]
						});

						newKeyword.save(function(err) {
							if (err) 
								console.log(err);

							cb1();
						});
					}
					else {
						keyword.df = keyword.df + 1;
						if (keyword.articleIDs.indexOf(articleIDs[i]) === -1)
							keyword.articleIDs.push(articleIDs[i]);

						keyword.save(function(err) {
							if (err)
								console.log(err);

							cb1();
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

				for (i in titleKeywordSet) {
					keywords.push(titleKeywordSet[i]);
					articleIDs.push(item._id);
				}
				for (i in keywordSet)
					if (keywords.indexOf(keywordSet[i]) === -1) {
						keywords.push(keywordSet[i]);
						articleIDs.push(item._id);
					}
				cb();
			});
			originkeywords = originkeywords.concat(originKeywordSet);
		});
	}, function(err) {
		if (err) //process error case later
			console.log(err);
			
		callback(keywords, articleIDs, originkeywords);
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