var mongoose = require('mongoose');

var keyword_weight = function(originkeyword, callback) {
	var Vector = require('./searchfunctions.js');
	var StringFuncs = require('./stringfunctions.js');
	var query = [];
	query.push({
		word: StringFuncs.stem(originkeyword.word),
		num: 1
	});

	Vector.queryVector(query, function(vector) {
		var weight = vector[0];
		callback(weight + originKeyword.df + originKeyword.searchers * 1.5 + originKeyword.followers * 2);
	});
};
module.exports.keyword_weight = keyword_weight;