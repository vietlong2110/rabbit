var request = require('request');

var feedParse = function(url, callback) { //rss reader
	var google_api_url = "https://ajax.googleapis.com/ajax/services/feed/load?v=2.0&q=" + url + "&num=30";
	request(google_api_url, function(err, res, body) {
		if (!err && res.statusCode === 200) {
			if (JSON.parse(body).responseData !== null && JSON.parse(body).responseData.feed !== null) {
				var entries = JSON.parse(body).responseData.feed.entries;
				var articles = [];
				for (i = 0; i < entries.length; i++) {
					articles.push({url: entries[i].link, 
									title: entries[i].title,
									publishedDate: entries[i].publishedDate});
				}
				var Save = require('./save.js');
				Save.saveArticle(articles, function() {
					callback(articles);
				});
			}
		}
		else callback(err);
	});
};
module.exports.feedParse = feedParse;