var request = require('request');
var async = require('async');
var Entities = require('html-entities').AllHtmlEntities;
var entities = new Entities();

var feedParse = function(url, callback) {
	var google_api_url = "https://ajax.googleapis.com/ajax/services/feed/load?v=2.0&q=" + url + "&num=30";

	request(google_api_url, function(err, res, body) {
		if (!err && res.statusCode === 200) {
			if (JSON.parse(body).responseData !== null && JSON.parse(body).responseData.feed !== null) {
				var entries = JSON.parse(body).responseData.feed.entries;
				var articles = [];
				var icon = require('../seed/icon_link.js');
				var avatar = icon.ninegag;

				async.each(entries, function(entry, cb) {
					var Extract = require('./extract.js');

					Extract.extractImageFromContent(entry.content, function(image) {
						if (image.substr(image.length-4, 4) === ".gif")
							image = image.replace("a.gif", ".jpg");
						articles.push({
							url: entry.link,
							source: "9gag",
							avatar: avatar,
							title: entities.decode(entry.title),
							thumbnail: image,
							publishedDate: entry.publishedDate
						});
						cb();
					});
				}, function(err) {
					if (err)
						callback(err);

					var Save = require('./save.js');
					Save.saveMediaArticle(articles, function() {
						callback(articles);
					});
				});
			}
		}
		else callback(err);
	});
};
module.exports.feedParse = feedParse;