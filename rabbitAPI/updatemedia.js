console.log('Update News is running!');

var async = require('async');
var database = require('./database.js');
var Entities = require('html-entities').AllHtmlEntities;
var entities = new Entities();

var Article = require('./models/articles.js');
var Extract = require('./serverController/extract.js');
var Save = require('./serverController/save.js');
var j = 0, cache = [];

async.forever(function(next) {
	var media = [];
	var updated = false;

	if (cache.length === 0) {
		async.parallel({
			ninegag: function(callback) {
				var feed_link = require('./seed/feed_link.js');
				var feedList = feed_link.ninegag;
				var RSS = require('./serverController/rss.js');

				async.each(feedList, function(feed, cb) {
					console.log('Start loading ' + feed);
					RSS.feedParse(feed, function(links) {
						console.log('End loading ' + feed);
						cache = cache.concat(links);
						cb();
					});
				}, function(err) {
					if (err)
						console.log(err);

					callback();
				});
			}/*,
			instagram: function(callback) {
				callback();
			}*/
		},function() {
			var maxComingArticle = Math.min(cache.length, 20);
			var i = 0;

			async.whilst(function() { return i < maxComingArticle; },
			function(cb) {
				if (cache[0].link === "" || cache[0].title === "") {
					cache.shift();
					i++;
					cb();
				}
				else Article.findOne({title: entities.decode(cache[0].title)}).exec(function(err, article) {
					if (article === null) {
						var icon = require('./seed/icon_link.js');
						var avatar = icon.ninegag;
						updated = true;
						console.log('Extracting ' + cache[0].link);
						var image = Extract.extractImageFromContent(cache[0].content);
						if (image.substr(image.length-4, 4) === ".gif")
							image = image.replace("a.gif", ".jpg");
						media.push({
							url: cache[0].link,
							source: "9gag",
							avatar: avatar,
							title: entities.decode(cache[0].title),
							thumbnail: image,
							publishedDate: cache[0].publishedDate
						});
						cache.shift();
						i++;
						cb();
					}
					else {
						console.log('This article was saved');
						cache.shift();
						i++;
						cb();
					}
				});
			}, function() {
				console.log(cache.length);
				Save.saveMediaArticle(media, function(keywordSet, articleIDs, originKeywordSet) {
					Save.saveKeyword(keywordSet, articleIDs, originKeywordSet, function() {
						console.log('All news articles are saved!');
						next();
					});
				});
			});
		});
	}
	else {
		var maxComingArticle = Math.min(cache.length, 20);
		var i = 0;

		async.whilst(function() { return i < maxComingArticle; },
		function(cb) {
			if (cache[0].link === "" || cache[0].title === "") {
				cache.shift();
				i++;
				cb();
			}
			else Article.findOne({title: entities.decode(cache[0].title)}).exec(function(err, article) {
				if (article === null) {
					var icon = require('./seed/icon_link.js');
					var avatar = icon.ninegag;
					updated = true;
					console.log('Start extracting ' + cache[0].link);
					var image = Extract.extractImageFromContent(cache[0].content);
					if (image.substr(image.length-4, 4) === ".gif")
						image = image.replace("a.gif", ".jpg");
					media.push({
						url: cache[0].link,
						source: "9gag",
						avatar: avatar,
						title: entities.decode(cache[0].title),
						thumbnail: image,
						publishedDate: cache[0].publishedDate
					});
					cache.shift();
					i++;
					cb();
				}
				else {
					console.log('This article was saved');
					cache.shift();
					i++;
					cb();
				}
			});
		}, function() {
			console.log(cache.length);
			Save.saveMediaArticle(media, function(keywordSet, articleIDs, originKeywordSet) {
				Save.saveKeyword(keywordSet, articleIDs, originKeywordSet, function() {
					console.log('All news articles are saved!');
					next();
				});
			});
		});
	}
});