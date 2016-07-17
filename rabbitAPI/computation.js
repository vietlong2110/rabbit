console.log('Computation is running!');

var async = require('async');
var database = require('./database.js');
var myCache = require('./models/caches.js');

async.forever(function(callback) {
	var Compute = require('./serverController/compute.js');
						
	Compute.computeKeywordsWeight(function(keywords) {
		console.log('Evaluated weight of all keywords!');

		var query = {key: 'keywordArray'};
		var update = {$set: {value: keywords}};
		var options = {upsert: true};
		myCache.findOneAndUpdate(query, update, options).exec(function(err, doc) {
			if (err) {
				console.log(err);
				callback();
			}
			else {
				var Algo = require('./libs/classic-algorithm.js');
				var segmentTree = Algo.initializeSegmentTree(keywords);
				var query = {key: 'keywordTree'};
				var update = {$set: {value: segmentTree}};
				var options = {upsert: true};

				myCache.findOneAndUpdate(query, update, options).exec(function(err, doc) {
					if (err) {
						console.log(err);
						callback();
					}
					else {
						console.log('Tree is set!');
						setTimeout(function() {
							callback();
						}, 1000 * 60 * 15);
					}
				});
			}
		});
	});
});

// setInterval(compute, 1000 * 60 * 15);