var mongoose = require('mongoose');
var async = require('async');

var computeKeywordsWeight = function(callback) {
	var Rank = require('../libs/ranking.js');
	var OriginKeyword = require('../models/originkeywords.js');

	OriginKeyword.find({}).exec(function(err, originkeywords) {
		if (err) {
			console.log(err);
			callback();
		}

		async.each(originkeywords, function(originkeyword, cb) {
			var keyword = originkeyword.word;

			Rank.keyword_weight(keyword, function(weight) {
				// console.log(keyword, weight);
				var query = {word: keyword};
				var update = {
					$set: {weight: weight}
				};
				var options = {upsert: true};

				OriginKeyword.findOneAndUpdate(query, update, options, function(err, item) {
					if (err) 
						console.log(err);
					
					cb();
				});
			});
		}, function(err) {
			if (err)
				console.log(err);

			callback();
		});
	})
};
module.exports.computeKeywordsWeight = computeKeywordsWeight;