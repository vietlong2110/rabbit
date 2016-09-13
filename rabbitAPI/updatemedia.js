console.log('Update Media is running!');

var async = require('async');
var database = require('./database.js');
var Entities = require('html-entities').AllHtmlEntities;
var entities = new Entities();

var RSS = require('./serverController/rss.js');
var Article = require('./models/articles.js');
var Extract = require('./serverController/extract.js');
var Save = require('./serverController/save.js');
var cache = [], instaCache = [], saved = true;
	// instagram: function(callback) {
			// 	var FollowKeyword = require('./models/followkeywords.js');

			// 	if (instaCache.length === 0) {
			// 		FollowKeyword.find({}).exec(function(err, queries) {
			// 			if (err) {
			// 				console.log(err);
			// 				callback();
			// 			}
			// 			else {
			// 				instaCache = queries;
			// 				var limitQueries = Math.min(instaCache.length, 8);
			// 				var queryList = instaCache.slice(0, limitQueries);

			// 				async.each(queryList, function(keyword, cb) {
			// 					var Feed = require('./clientController/feed.js');

			// 					Feed.searchInstaFeed(keyword.query, function(mediaResult) {
			// 						media = media.concat(mediaResult);
			// 						instaCache.shift();
			// 						cb();
			// 					});
			// 				}, function(err) {
			// 					if (err)
			// 						console.log(err);

			// 					callback();
			// 				});
			// 			}
			// 		});
			// 	}
			// 	else {
			// 		var limitQueries = Math.min(instaCache.length, 8);
			// 		var queryList = instaCache.slice(0, limitQueries);

			// 		async.each(queryList, function(keyword, cb) {
			// 			var Feed = require('./clientController/feed.js');

			// 			Feed.searchInstaFeed(keyword.query, function(mediaResult) {
			// 				media = media.concat(mediaResult);
			// 				instaCache.shift();
			// 				cb();
			// 			});
			// 		}, function(err) {
			// 			if (err)
			// 				console.log(err);

			// 			callback();
			// 		});
			// 	}
	// }
	
setInterval(function() {
	if (saved) {
		saved = false;
		var media = [];
		var feed_link = require('./seed/feed_link.js');
		var feedList = feed_link.ninegag;

		async.each(feedList, function(feed, cb1) {
			console.log('Start loading ' + feed);
			RSS.feedParse(feed, function(links) {
				console.log('End loading ' + feed);
				cache = cache.concat(links);
				cb1();
			});
		}, function(err) {
			if (err) {
				console.log(err);
				// callback(cache);
			}
			console.log(cache.length);
			var maxComingArticle = cache.length;
			var i = 0;

			async.whilst(function() { return i < maxComingArticle; },
			function(cb) {
				Article.findOne({title: entities.decode(cache[0].title)}).exec(function(err, article) {
					if (article === null) {
						var icon = require('./seed/icon_link.js');
						var avatar = icon.ninegag;
						console.log('Start extracting ' + cache[0].link);
						Extract.extractImage(cache[0].link, function(image) {
							if (image === null) {
								console.log('NULL DETECTED!');
								cache.shift();
								i++;
								cb();
							}
							else {
								if (image.substr(image.length-4, 4) === ".gif")
									image = image.replace("a.gif", ".jpg");
								Extract.extractKeyword(null, entities.decode(cache[0].title),
								function(originKeywordSet, keywordSet, tf) {
									console.log('End extracting ' + cache[0].link);
									console.log(i);
									media.push({
										url: cache[0].link,
										source: "9gag",
										avatar: avatar,
										title: entities.decode(cache[0].title),
										thumbnail: image,
										publishedDate: cache[0].publishedDate,
										keywords: keywordSet,
										originkeywords: originKeywordSet,
										tf: tf
									});
									cache.shift();
									i++;
									cb();
								});
							}
						});
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
				Save.saveMediaArticle(media, function() {
					saved = true;
					console.log('All news articles are saved!');
				});
			});
		});
	}
	else console.log(cache.length);
}, 60 * 1000);