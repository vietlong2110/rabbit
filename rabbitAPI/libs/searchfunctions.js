/********************************************************************
*		This library include all functions relating to search		*
*********************************************************************/

var async = require('async');

//Calculate vector tf-idf score of a document
var docVector = function(query, articleID, callback) { //calculate document weight vector
	var Article = require('../models/articles.js');
	var vector = [];

	Article.count({}, function(err, n) { //n documents

		Article.findById(articleID).exec(function(err, article) {

			async.each(query, function(word, cb) {
				console.log(word);
				var Keyword = require('../models/keywords.js');

				Keyword.findOne({word: word}).exec(function(err, keyword) {
					if (err) { //process error case later
						console.log(err);
						return cb();
					}

					if (keyword !== null) {
						var idf = keyword.df; //idf weight
						if (n > 0)
							idf = Math.log((n + 1) / idf);

						var tf = 0, tfTitle = 0; //tf weight
						if (article.titleKeywords.indexOf(word) !== -1) {
							tfTitle = article.tfTitle[article.titleKeywords.indexOf(word)];
							tfTitle = (Math.log(1 + tfTitle)) * 2;
						}
						if (article.keywords.indexOf(word) !== -1) {
							tf = article.tf[article.keywords.indexOf(word)];
							tf = Math.log(1 + tf);
						}
						vector.push((tf + tfTitle)*idf); //tf-idf score
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