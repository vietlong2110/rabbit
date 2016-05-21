/********************************************************************
*		This library include all functions relating to search		*
*********************************************************************/

var async = require('async')

//Calculate vector tf-idf score of a document
var docVector = function(query, articleID, callback) { //calculate document weight vector
	var Article = require('../models/articles.js');
	var vector = [];

	Article.count({}, function(err, n) { //n documents

		Article.findById(articleID).exec(function(err, article) {

			async.each(query, function(word, cb) {
				var Keyword = require('../models/keywords.js');

				Keyword.findOne({word: word}).exec(function(err, keyword) {
					if (err) { //process error case later
						console.log(err);
						cb();
					}

					if (keyword !== null) {
						var idf = keyword.df; //idf weight
						if (n > 0)
							idf = 1 + Math.log(n / idf);

						var tf = 0; //tf weight
						if (article.keywords.indexOf(word) !== -1) {
							var tf = article.tf[article.keywords.indexOf(word)];
							tf = 1 + Math.log(tf);
						}
						vector.push(tf*idf); //tf-idf score
					}
					else vector.push(0);
					cb();
				});
			}, function(err) {
				if (err) //process error case later
					console.log(err);

				callback(vector);
			});
		});
	});
};
module.exports.docVector = docVector;

//Calculate vector tf-idf score of a query
var queryVector = function(query, callback) {
	var Article = require('../models/articles.js');
	var vector = [];
	Article.count({}, function(err, n) {

		async.each(query, function(q, cb) {
			var Keyword = require('../models/keywords.js');

			Keyword.findOne({word: q.word}).exec(function(err, keyword) {
				if (err) { //process error case later
					console.log(err);
					cb();
				}

				if (keyword !== null) {
					var idf = keyword.df //idf weight
					if (n > 0)
						idf = 1 + Math.log(n / idf);

					var tf = 1 + Math.log(q.num); //tf weight
					vector.push(tf*idf); //tf-idf score
				}
				else vector.push(0);
				cb();
			});
		}, function(err) {
			if (err) //process error case later
				console.log(err);

			callback(vector);
		});
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