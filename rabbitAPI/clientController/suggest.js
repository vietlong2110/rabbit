var mongoose = require('mongoose');
var async = require('async');

var searchSuggestion = function(query, callback) {
	var suggestResults = [];
	var kTop = 10;
	var myCache = require('../models/caches.js');

	myCache.findOne({key: 'keywordArray'}).exec(function(err, words) {
		var keywords = words.value;
		if (err)
			throw err;

		myCache.findOne({key: 'keywordTree'}).exec(function(err, tree) {
			if (err)
				throw err;

			var segmentTree = tree.value;
			var Algo = require('../libs/classic-algorithm.js');
			Algo.binarySearchRange(query, keywords, function(notFound, lowerBound, upperBound) {
				if (notFound)
					callback(suggestResults);
				else {
					var queryArr = [{
						start: lowerBound,
						end: upperBound
					}];
					var i = 0;
					var maxIndex = [];
					kTop = Math.min(upperBound - lowerBound + 1, kTop);

					async.whilst(function() { return i < kTop; },
					function(cb1) {
						var j = 0;
						var tmpMaxIndex, maxWeight = -1;

						async.whilst(function() { return j < queryArr.length; },
						function(cb2) {
							Algo.segmentTreeQuery(segmentTree, keywords, queryArr[j].start, queryArr[j].end,
							function(index) {
								maxWeight = Math.max(maxWeight, keywords[index].weight);
								if (maxWeight == keywords[index].weight)
									tmpMaxIndex = index;
								j++;
								cb2();
							});
						}, function(err) {
							suggestResults.push(keywords[tmpMaxIndex].word);
							maxIndex.push(tmpMaxIndex);
							maxIndex.sort(function(a, b) {
								return a - b;
							});
							if (lowerBound <= maxIndex[0] - 1)
								queryArr = [{
									start: lowerBound,
									end: maxIndex[0] - 1
								}];
							else queryArr = [];
							for (k = 1; k <= maxIndex.length; k++)
								if (k < maxIndex.length && maxIndex[k - 1] + 1 <= maxIndex[k] - 1)
									queryArr.push({
										start: maxIndex[k - 1] + 1, 
										end: maxIndex[k] - 1
									});
								else if (k === maxIndex.length && maxIndex[k - 1] + 1 <= upperBound)
									queryArr.push({
										start: maxIndex[k - 1] + 1,
										end: upperBound
									});
							i++;
							cb1();
						});
					}, function(err) {
						callback(suggestResults);
					});
				}
			});
		});
	});
};
module.exports.searchSuggestion = searchSuggestion;