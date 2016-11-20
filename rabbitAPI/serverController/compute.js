var mongoose = require('mongoose');
var async = require('async');

var computeKeywordsWeight = function(callback) {
	var OriginKeyword = require('../models/originkeywords.js');

	OriginKeyword.find({}, null, {sort: {word: 1}}).exec(function(err, originkeywords) {
		if (err)
			return callback(err);
		var results = [];
		for (i = 0; i < originkeywords.length; i++) {
			var originKeyword = originkeywords[i];
			// var query = {word: originKeyword};
			var weight = originKeyword.df + originKeyword.searchers * 1.5 + originKeyword.followers * 2;
			// var update = { $set: {weight: weight} };
			results.push({
				word: originKeyword,
				weight: weight
			});

			// OriginKeyword.findOneAndUpdate(query, update, function(err, item) {
			// 	if (err)
			// 		console.log(err);
			// });
		}
		callback(null, results);
	})
};
module.exports.computeKeywordsWeight = computeKeywordsWeight;