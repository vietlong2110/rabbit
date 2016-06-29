var mongoose = require('mongoose');

var keyword_weight = function(keyword, callback) {
	var Vector = require('./searchfunctions.js');
	var StringFuncs = require('./stringfunctions.js');
	var query = [];
	query.push({
		word: StringFuncs.stem(keyword),
		num: 1
	});

	Vector.queryVector(query, function(vector) {
		var weight = vector[0];
		var OriginKeyword = require('../models/originkeywords.js');

		OriginKeyword.findOne({word: keyword}).exec(function(err, originKeyword) {
			if (originKeyword === null)
				callback(1);
			else callback(weight + originKeyword.df + originKeyword.searchers.length * 1.5 
			+ originKeyword.followers.length * 2);
		});
	});
};
module.exports.keyword_weight = keyword_weight;