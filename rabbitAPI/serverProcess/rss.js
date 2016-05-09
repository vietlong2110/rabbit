var request = require('request');
var async = require('async');

var feedParse = function(url, callback) { //rss reader
	var google_api_url = "https://ajax.googleapis.com/ajax/services/feed/load?v=2.0&q=" + url + "&num=30";
	request(google_api_url, function(err, res, body) {
		if (!err && res.statusCode === 200) {
			if (JSON.parse(body).responseData !== null && JSON.parse(body).responseData.feed !== null) {
				var entries = JSON.parse(body).responseData.feed.entries;
				var articles = [];
				async.each(entries, function(entry, cb) {
					var Extract = require('./extract.js');
					Extract.extractImage(entry.link, function(thumbnail) {
						articles.push({
							url: entry.link, 
							title: entry.title,
							thumbnail: thumbnail,
							publishedDate: entry.publishedDate
						});
						cb();
					});
				}, function(err) {
					if (err)
						callback(err);
					var Save = require('./save.js');
					Save.saveArticle(articles, function() {
						callback(articles);
					});
				});
			}
		}
		else callback(err);
	});
};
module.exports.feedParse = feedParse;