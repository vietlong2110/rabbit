/********************************************************************************************
*		This controller include all functions relating to saving data to server database	*
********************************************************************************************/

var async = require('async');
var mongoose = require('mongoose');
var Keyword = require('../models/keywords.js');
var OriginKeyword = require('../models/originkeywords.js');
var Article = require('../models/articles.js');
var Media = require('../models/media.js');
var stringFuncs = require('../libs/stringfunctions.js');

var saveKeyword = function(keywordSet, articleIDs, originKeywordSet, dfOriginKeywords, media, callback) {
	async.parallel([
		function(cb) {
			//For calculating inverted document frequency
			if (!media) {
				async.forEachOfSeries(keywordSet, function(word, i, cb1) {
					Keyword.findOne({word: word}).exec(function(err, keyword) {
						if (err)
							return cb1(err);				
						if (keyword === null) {
							var newKeyword = new Keyword({
								word: word,
								df: 1,
								articleIDs: articleIDs[i]
							});

							newKeyword.save(function(err) {
								if (err) 
									return cb1(err);
								cb1();
							});
						}
						else {
							if (keyword.articleIDs.indexOf(articleIDs[i]) === -1) {
								keyword.articleIDs.push(articleIDs[i]);
								keyword.df = keyword.df + 1;
							}

							keyword.save(function(err) {
								if (err)
									return cb1(err);
								cb1();
							});
						}
					});
				}, function(err) {
					if (err)
						return cb(err);
					cb();
				});
			}
			else {
				async.forEachOfSeries(keywordSet, function(word, i, cb1) {
					Keyword.findOne({word: word}).exec(function(err, keyword) {
						if (err)
							return cb1(err);				
						if (keyword === null) {
							var newKeyword = new Keyword({
								word: word,
								df: 1,
								mediaIDs: articleIDs[i]
							});

							newKeyword.save(function(err) {
								if (err) 
									return cb1(err);
								cb1();
							});
						}
						else {
							if (keyword.mediaIDs.indexOf(articleIDs[i]) === -1) {
								keyword.mediaIDs.push(articleIDs[i]);
								keyword.df = keyword.df + 1;
							}

							keyword.save(function(err) {
								if (err)
									return cb1(err);
								cb1();
							});
						}
					});
				}, function(err) {
					if (err)
						return cb(err);
					cb();
				});
			}
		},
		function(cb) {
			stringFuncs.lemma(originKeywordSet, function(lemmaKeywordSet) {
				async.forEachOfSeries(lemmaKeywordSet, function(word, i, cb2) {
					OriginKeyword.findOne({word: word}).exec(function(err, keyword) {
						if (err)
							return cb(err);
						if (keyword === null) {
							var newKeyword = new OriginKeyword({
								word: word,
								df: dfOriginKeywords[i]
							});

							newKeyword.save(function(err) {
								if (err) 
									return cb2(err);

								cb2();
							});
						}
						else {
							keyword.df = keyword.df + dfOriginKeywords[i];
							cb2();
						}
					});
				}, function(err) {
					if (err) //process error case later
						return cb(err);

					cb();
				});
			});
		}
	], function(err) {
		if (err)
			return callback(err);	
		callback();
	});
};
module.exports.saveKeyword = saveKeyword;

//Save information of an article to database
var saveArticle = function(articles, callback) {
	var keywords = [], articleIDs = [], originkeywords = [], dfOriginKeywords = [];

	async.each(articles, function(article, cb) {
		var query = {url: article.url};
		if (article.publishedDate === null)
			article.publishedDate = new Date();
		var update = {
			$set: {
				title: article.title,
				thumbnail: article.thumbnail,
				source: article.source,
				publishedDate: article.publishedDate,
				titleKeywords: article.titleKeywords,
				tfTitle: article.tfTitle,
				keywords: article.keywords,
				tf: article.tf
			}
		};
		var options = {
			upsert: true,
			new: true
		};

		Article.findOneAndUpdate(query, update, options).exec(function(err, doc) {
			if (err && err.code !== 11000 && err.code !== 11001) //process error case later
				return cb(err);
			if (doc) {
				for (i in article.titleKeywords) {
					var pos = keywords.indexOf(article.titleKeywords[i]);

					if (pos === -1 || articleIDs[pos] !== doc._id) {
						keywords.push(article.titleKeywords[i]);
						articleIDs.push(doc._id);
					}
				}
				for (i in article.keywords) {
					var pos = keywords.indexOf(article.keywords[i]);
					
					if (pos === -1 || articleIDs[pos] !== doc._id) {
						keywords.push(article.keywords[i]);
						articleIDs.push(doc._id);
					}
				}
				for (i in article.originkeywords) {
					var pos = originkeywords.indexOf(article.originkeywords[i]);
					
					if (pos === -1) {
						originkeywords.push(article.originkeywords[i]);
						dfOriginKeywords.push(1);
					}
					else dfOriginKeywords[pos]++;
				}
			}
			cb();
		});
	}, function(err) {
		if (err) //process error case later
			console.log(err);
			
		saveKeyword(keywords, articleIDs, originkeywords, dfOriginKeywords, false, function(err) {
			if (err)
				return callback(err);
			callback();
		});
	});
};
module.exports.saveArticle = saveArticle;

var saveMediaArticle = function(articles, callback) {
	var keywords = [], originkeywords = [], articleIDs = [], dfOriginKeywords = [];

	async.each(articles, function(article, cb) {
		var query = {url: article.url};
		if (article.publishedDate === null)
			article.publishedDate = new Date();
		var update = {
			$set: {
				url: article.url,
				title: article.title,
				social_access: article.social_access,
				source: article.source,
				websource: article.websource,
				video: article.video,
				iframe: article.iframe,
				avatar: article.avatar,
				thumbnail: article.thumbnail,
				publishedDate: article.publishedDate,
				keywords: article.keywords,
				tf: article.tf
			}
		};
		var options = {
			upsert: true,
			new: true
		};

		Media.findOneAndUpdate(query, update, options).exec(function(err, doc) {
			if (err && err.code !== 11000 && err.code !== 11001) //process error case later
				console.log(err);
			else if (doc) {
				for (i in article.keywords) {
					var pos = keywords.indexOf(article.keywords[i]);
					
					if (pos === -1 || articleIDs[pos] !== doc._id) {
						keywords.push(article.keywords[i]);
						articleIDs.push(doc._id);
					}
				}
				for (i in article.originkeywords) {
					var pos = originkeywords.indexOf(article.originkeywords[i]);
					
					if (pos === -1) {
						originkeywords.push(article.originkeywords[i]);
						dfOriginKeywords.push(1);
					}
					else dfOriginKeywords[pos]++;
				}
			}
			cb();
		});
	}, function(err) {
		if (err) //process error case later
			console.log(err);
		
		saveKeyword(keywords, articleIDs, originkeywords, dfOriginKeywords, true, function() {
			callback();
		});
	});
};
module.exports.saveMediaArticle = saveMediaArticle;