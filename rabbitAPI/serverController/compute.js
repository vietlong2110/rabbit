var mongoose = require('mongoose');
var async = require('async');

var computeKeywordsWeight = function(callback) {
	var Rank = require('../libs/ranking.js');
	var OriginKeyword = require('../models/originkeywords.js');

	OriginKeyword.find({}, null, {sort: {word: 1}}).exec(function(err, originkeywords) {
		if (err)
			return callback(err);
		async.each(originkeywords, function(originkeyword, cb) {
			Rank.keyword_weight(originkeyword, function(weight) {
				var query = {word: keyword};
				var update = { $set: {weight: weight} };

				OriginKeyword.findOneAndUpdate(query, update, function(err, item) {
					if (err) 
						return cb(err);
					cb();
				});
			});
		}, function(err) {
			if (err)
				return callback(err);

			callback(null, originkeywords);
		});
	})
};
module.exports.computeKeywordsWeight = computeKeywordsWeight;