var async = require('async');
var mongoose = require('mongoose');

var searchFeed = function(q, callback) {
	var stringFuncs = require('../libs/stringfunctions.js');
	var query = stringFuncs.wordTokenize(q);
	var Article = require('../models/articles.js');
	var searchResult = [];
	Article.find({}).exec(function(err, articles) {
		if (err) {
			console.log(err);
			callback();
		}
		var searchFuncs = require('../libs/searchfunctions');
		async.each(articles, function(article, cb) {
			searchFuncs.docVector(query, article._id, function(vector1) {
				var Filter = require('../libs/filter.js');
				var queryArr = Filter.queryFilter(query);
				searchFuncs.queryVector(queryArr, function(vector2) {
					var evalScore = searchFuncs.cosEval(vector1, vector2);
					if (evalScore > 0) {
						// var today = article.publishedDate.getDate();
						searchResult.push({
							evalScore: evalScore,
							// today: today,
							url: article.url,
							title: article.title,
							thumbnail: article.thumbnail,
							publishedDate: article.publishedDate
						});
					}
					cb();
				});
			});
		}, function(err) {
			if (err)
				res.json({Error: err});
			searchResult.sort(function(a,b) {
				// if (b.today - a.today === 0) {
					if (b.evalScore - a.evalScore === 0)
						return b.publishedDate - a.publishedDate;
					else return b.evalScore - a.evalScore;
				// }
				// else return b.today - a.today;
			});
			// res.json({Results: searchResult});
			callback(searchResult);
		});
	});
};
module.exports.searchFeed = searchFeed;