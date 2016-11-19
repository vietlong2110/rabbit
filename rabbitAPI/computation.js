console.log('Computation is running!');

var database = require('./database.js');
var myCache = require('./models/caches.js');
var saved = true;

// setInterval(function() {
	if (saved) {
		saved = false;
		var Compute = require('./serverController/compute.js');
							
		Compute.computeKeywordsWeight(function(keywords) {
			console.log('Evaluated weight of all keywords!');
			var Algo = require('./libs/classic-algorithm.js');
			var segmentTree = Algo.initializeSegmentTree(keywords);
			console.log('Initialized successfully!')
			var query = {key: 'keywordTree'};
			var update = {$set: {value: segmentTree}};
			var options = {upsert: true};

			myCache.findOneAndUpdate(query, update, options).exec(function(err, doc) {
				if (err)
					console.log(err);
				saved = true;
			});
		});
	}
// }, 60 * 20 * 1000);

// setInterval(compute, 1000 * 60 * 15);