var mongoose = require('mongoose');
var async = require('async');

var computeKeywordsWeight = function(callback) {
	var Rank = require('../libs/ranking.js');
	var OriginKeyword = require('../models/originkeywords.js');

	OriginKeyword.find({}, null, {sort: {word: 1}}).exec(function(err, originkeywords) {
		if (err) {
			console.log(err);
			callback();
		}
		else {
			async.each(originkeywords, function(originkeyword, cb) {
				var keyword = originkeyword.word;

				Rank.keyword_weight(keyword, function(weight) {
					// if (keyword === 'knowledge')
						// console.log(weight);
					var query = {word: keyword};
					var update = {
						$set: {weight: weight}
					};

					OriginKeyword.findOneAndUpdate(query, update, function(err, item) {
						if (err) 
							console.log(err);
						
						cb();
					});
				});
			}, function(err) {
				if (err)
					console.log(err);

				callback(originkeywords);
			});
		}
	})
};
module.exports.computeKeywordsWeight = computeKeywordsWeight;