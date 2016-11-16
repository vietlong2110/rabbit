var mongoose = require('mongoose');
var database = require('./database.js');
var Media = require('./models/media.js');

Media.find({"websource": "facebook"}).exec(function(err, medias) {
	if (err) {
		console.log(err);
		return;
	}
	async.eachSeries(medias, function(media, callback) {
		media.source = media.source.toLowerCase();
		media.save(function(err) {
			if (err) {
				console.log(err);
				return callback(err);
			}
			callback();
		});
	}, function(err) {
		if (err)
			console.log(err);
	});
})