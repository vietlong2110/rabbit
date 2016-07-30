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
							word: word,
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
						keyword.articleIDs.push(articleIDs[i]);
						keyword.df = keyword.df + 1;

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
			var stringFuncs = require('../libs/stringfunctions.js');

			stringFuncs.lemma(originKeywordSet, function(lemmaKeywordSet) {
				var OriginKeyword = require('../models/originkeywords.js');

				async.each(lemmaKeywordSet, function(word, cb2) {
					OriginKeyword.findOne({word: word}).exec(function(err, keyword) {
						var today = new Date();
						var days = 30;

						if (err) { //process error case later
							console.log(err);
							cb();
						}
						else if (keyword === null) {
							var dfDaily = [];
							dfDaily.push({
								df: 1,
								daily: today
							});

							for (i = 1; i <= days; i++)
								dfDaily.push({
									df: 0,
									daily: today
								});

							var newKeyword = new OriginKeyword({
								word: word,
								df: 1,
								dfDaily: dfDaily
							});

							newKeyword.save(function(err) {
								if (err && err.code !== 11000 && err.code !== 11001) 
									console.log(err);

								cb2();
							});
						}
						else {
							keyword.df = keyword.df + 1;
							if (today.getDate() === keyword.dfDaily[0].daily.getDate())
								keyword.dfDaily[0].df = keyword.dfDaily[0].df + 1;
							else {
								var newDfDaily = [];
								for (i = 0; i <= days; i++)
									newDfDaily.push({
										df: 0,
										daily: today
									});
								var diff = today.getTime() - keyword.dfDaily[0].daily.getTime();
								diff = Math.min(diff / 1000 / 3600 / 24, days);

								for (i = days; i >= diff; i--)
									newDfDaily[i] = keyword.dfDaily[i-diff];
								for (i = 1; i < diff; i++)
									newDfDaily[i] = {
										df: 0,
										daily: today
									};
								newDfDaily[0] = {
									df: 1,
									daily: today
								};

								keyword.dfDaily = newDfDaily;
							}

							keyword.save(function(err) {
								if (err)
									console.log(err);

								cb2();
							});
						}
					});
				}, function(err) {
					if (err) //process error case later
						console.log(err);

					cb();
				});
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

			Article.findOneAndUpdate(query, update, options).exec(function(err, doc) {
				if (err && err.code !== 11000 && err.code !== 11001) //process error case later
					console.log(err);
				else if (doc) {
					for (i in titleKeywordSet) {
						keywords.push(titleKeywordSet[i]);
						articleIDs.push(doc._id);
					}
					for (i in keywordSet)
						if (keywords.indexOf(keywordSet[i]) === -1) {
							keywords.push(keywordSet[i]);
							articleIDs.push(doc._id);
						}
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
	var keywords = [], originkeywords = [], articleIDs = [];

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
			var options = {
				upsert: true,
				new: true
			};

			Article.findOneAndUpdate(query, update, options).exec(function(err, doc) {
				if (err && err.code !== 11000 && err.code !== 11001) //process error case later
					console.log(err);
				else if (doc) {
					for (i in keywordSet)
						if (keywords.indexOf(keywordSet[i]) === -1) {
							keywords.push(keywordSet[i]);
							articleIDs.push(doc._id);
						}
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
module.exports.saveMediaArticle = saveMediaArticle;