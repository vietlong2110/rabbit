var request = require('request');

var feedParse = function(url, callback) { //rss reader
	var google_api_url = "https://ajax.googleapis.com/ajax/services/feed/load?v=2.0&q=" + url + "&num=30";
	
	request(google_api_url, {timeout: 5000}, function(err, res, body) {
		if (!err && res.statusCode === 200) {
			if (JSON.parse(body).responseData !== null && JSON.parse(body).responseData.feed !== null) {
				var entries = JSON.parse(body).responseData.feed.entries;
				callback(entries);
			}
		}
		else callback(err);
	});
};
module.exports.feedParse = feedParse;