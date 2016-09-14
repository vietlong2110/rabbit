/********************************************************************
*		This library include all functions relating to search		*
*********************************************************************/

var async = require('async');
var Keyword = require('../models/keywords.js');
var Article = require('../models/articles.js');
var Filter = require('../libs/filter.js');

//Calculate vector tf-idf score of a document
var Search = function(query, callback) { //calculate document weight vector
	var evals = [], Result = [];
	var queryArr = Filter.queryArr(query);

	Article.count({}, function(err, n) { //n documents
		if (err) {
			console.log(err);
			return callback(Result, evals);
		}

		Keyword.find({ word: {"$in": query} }).exec(function(err, keywords) {
			async.eachSeries(keywords, function(keyword, cb1) {
				Article.find({
					_id: {"$in": keyword.articleIDs} 
				}).exec(function(err, fullArticles) {
					console.log(fullArticles.length);
					async.eachSeries(fullArticles, function(article, cb2) {
						var vector1 = docVector(n, keywords, article);
						var vector2 = queryVector(queryArr);
						evals.push(cosEval(vector1, vector2));
						Result.push(article);
						cb2();
					}, function(err) {
						if (err)
							return cb1(err);
						cb1();
					});
				});
			}, function(err) {
				if (err)
					return callback(err);
				callback(Result, evals);
			});
		});
	});
};
module.exports.Search = Search;

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
