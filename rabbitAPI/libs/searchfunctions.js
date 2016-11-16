/********************************************************************
*		This library include all functions relating to search		*
*********************************************************************/

var async = require('async');
var Keyword = require('../models/keywords.js');
var Article = require('../models/articles.js');
var Media = require('../models/media.js');
var Filter = require('../libs/filter.js');
var User = require('../models/users.js');
var stringFuncs = require('./stringfunctions.js');

//Calculate vector tf-idf score of a document
var Search = function(user, q, callback) { //calculate document weight vector
	var newsEvals = [], newsResult = [], mediaEvals = [], mediaResult = [];
	var querySanitized = Filter.querySanitize(q); //sanitize query before processing
	var query = stringFuncs.preProcess(querySanitized);
	query = stringFuncs.wordTokenize(query);
	stringFuncs.removeStopWords(query, function(queryThreshold) {
		// console.log(queryThreshold);
		query = stringFuncs.stemArr(query);
		var queryArr = Filter.queryArr(query);

		async.parallel([
			function(cb) {
				var threshold = 4 * queryThreshold.length, eps = 1e-7;

				Article.count({}, function(err, n) { //n documents
					if (err)
						return cb(err);

					Keyword.find({ word: {"$in": query} }).exec(function(err, keywords) {
						var articleIDs = [];
						for (i = 0; i < keywords.length; i++)
							articleIDs = articleIDs.concat(keywords[i].articleIDs);
						Article.find({ _id: {"$in": articleIDs} }).exec(function(err, fullArticles) {
							async.each(fullArticles, function(article, cb2) {
								var vector1 = docVector(n, keywords, article);
								var vector2 = queryVector(queryArr);
								var eval = cosEval(vector1, vector2);
								
								if (eval - threshold >= eps) {
									newsEvals.push(eval);
									newsResult.push(article);
								}
								cb2();
							}, function(err) {
								if (err)
									return cb(err);
								cb();
							});
						});
					});
				});
			},
			function(cb) {
				Media.count({}, function(err, n) { //n documents
					if (err) {
						console.log(err);
						return callback(mediaResult, mediaEvals);
					}

					Keyword.find({ word: {"$in": query} }).exec(function(err, keywords) {
						var mediaIDs = [];
						for (i = 0; i < keywords.length; i++)
							mediaIDs = mediaIDs.concat(keywords[i].mediaIDs);
						Media.find({ _id: {"$in": mediaIDs} }).exec(function(err, fullArticles) {
							async.each(fullArticles, function(article, cb2) {
								if (article.social_access && user.suggest !== null 
								&& user.suggest !== undefined) {
									var ok = false;
									for (i = 0; i < user.suggest.length; i++)
										if (user.suggest[i].name === article.source)
											ok = true;
									if (!ok)
										return cb2();
								}
								var vector1 = mediaDocVector(n, keywords, article);
								var vector2 = queryVector(queryArr);
								mediaEvals.push(cosEval(vector1, vector2));
								mediaResult.push(article);
								cb2();
							}, function(err) {
								if (err)
									return cb(err);
								cb();
							});
						});
					});
				});
			}
		], function(err) {
			if (err)
				return callback(err);
			callback(null, newsResult, newsEvals, mediaResult, mediaEvals);
		});
	});
};
module.exports.Search = Search;

var searchMedia = function() {

};
module.exports.searchMedia = searchMedia;

var docVector = function(n, keywords, article) {
	var vector = [];

	for (i = 0; i < keywords.length; i++) {
		var idf = keywords[i].df; //idf weight
		idf = Math.log((n + 1) / idf);

		var tf = 0, tfTitle = 0; //tf weight
		if (article.titleKeywords.indexOf(keywords[i].word) !== -1) {
			tfTitle = article.tfTitle[article.titleKeywords.indexOf(keywords[i].word)];
			tfTitle = (Math.log(1 + tfTitle)) * 2;
		}
		if (article.keywords.indexOf(keywords[i].word) !== -1) {
			tf = article.tf[article.keywords.indexOf(keywords[i].word)];
			tf = Math.log(1 + tf);
		}
		vector.push((tf + tfTitle)*idf);
	}
	// console.log(vector);
	return vector;
};
module.exports.docVector = docVector;

var mediaDocVector = function(n, keywords, article) {
	var vector = [];

	for (i = 0; i < keywords.length; i++) {
		var idf = keywords[i].df; //idf weight
		idf = Math.log((n + 1) / idf);

		var tf = 0; //tf weight
		if (article.keywords.indexOf(keywords[i].word) !== -1) {
			tf = article.tf[article.keywords.indexOf(keywords[i].word)];
			tf = Math.log(1 + tf);
		}
		vector.push(tf*idf);
	}
	// console.log(vector);
	return vector;
};
module.exports.mediaDocVector = mediaDocVector;

//Calculate vector tf-idf score of a query
var queryVector = function(query) {
	var vector = [];

	for (i = 0; i < query.length; i++)
		vector.push(Math.log(1 + query[i].num));
	return vector;
};
module.exports.queryVector = queryVector;

//Calculate cos function between 2 vectors
var cosEval = function(vector1, vector2) {
	var score = 0;
	for (i in vector1)
		score += vector1[i] * vector2[i];
	return score;
};
module.exports.cosEval = cosEval;