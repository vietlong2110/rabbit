/********************************************************************
*		This library include all functions relating to search		*
*********************************************************************/

var async = require('async');
var Keyword = require('../models/keywords.js');
var Article = require('../models/articles.js');

//Calculate vector tf-idf score of a document
var docVector = function(query, article, j, callback) { //calculate document weight vector
	var vector = [];

	Article.count({}, function(err, n) { //n documents
		if (err) {
			console.log(err);
			callback(vector);
		}
		Keyword.find({ word: {"$in": query} }).exec(function(err, keywords) {
			console.log(j);
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
			console.log(vector);
			callback(vector);
		});
	});
};
module.exports.docVector = docVector;

//Calculate vector tf-idf score of a query
var queryVector = function(query, callback) {
	var vector = [];

	async.each(query, function(q, cb) {
		vector.push(Math.log(1 + q.num)); //tf-idf score
		cb();
	}, function(err) {
		if (err) //process error case later
			console.log(err);

		callback(vector);
	});
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
