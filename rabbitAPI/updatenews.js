console.log('Update News is running!');

var async = require('async');
var database = require('./database.js');
var Entities = require('html-entities').AllHtmlEntities;
var entities = new Entities();
var feed_link = require('./seed/feed.js');
var List = feed_link.data;

var RSS = require('./serverController/rss.js');
var Article = require('./models/articles.js');
var Extract = require('./serverController/extract.js');
var Save = require('./serverController/save.js');
var cache = [], saved = true;

setInterval(function() {
	if (saved) {
		saved = false;
		var articles = [];

		async.waterfall([
			function(cb) {
				if (cache.length === 0) {
					async.eachSeries(List, function(feedList, cb1) {
						async.eachSeries(feedList.links, function(feed, cb2) {
							console.log('Start loading ' + feed);
							RSS.feedParse(feed, function(links) {
								console.log('End loading ' + feed);
								for (i in links) {
									links[i].source = feedList.source;
									links[i].thumbnail = feedList.thumbnail;
								}
								cache = cache.concat(links);
								// console.log(cache);
								cb2();
							});
						}, function(err) {
							if (err)
								return cb(err);
							cb1();
						});
					}, function(err) {
						if (err)
							return cb(err);
						cb();
					});
				}
				else {
					var tmpCache = [];
					async.eachSeries(cache, function(c, cb1) {
						Article.findOne({title: entities.decode(c.title)})
						.exec(function(err, article) {
							if (article === null)
								tmpCache.push(c);
							cb1();
						});
					}, function(err) {
						if (err)
							return cb(err);
						cache = tmpCache;
						cb();
					});
				}
			},
			function(cb) {
				console.log(cache.length);
				var maxComingArticle = Math.min(20, cache.length);
				var i = 0;

				async.whilst(function() { return i < maxComingArticle; },
				function(cb2) {
					if (cache[0].title === null || cache[0].title === undefined) {
						cache.shift();
						i++;
						return cb2();
					}

					// Article.findOne({title: entities.decode(cache[0].title)})
					// .exec(function(err, article) {
					// 	if (article === null) {
							console.log('Start extracting ' + cache[0].link);
							if (cache[0].link.substr(cache[0].link.length-4, 4) === ".mp4") {
								cache.shift();
								i++;
								return cb2();
							}

							Extract.extractImage(cache[0].link, function(thumbnail) {
								if (thumbnail === null)
									thumbnail = cache[0].thumbnail;
								Extract.extractContent(entities.decode(cache[0].title), cache[0].link,
								function(err, originKeywordSet, keywordSet, tf, titleKeywordSet, tfTitle) {
									if (err) {
										cache.shift();
										i++;
										return cb2();
									}
									console.log('End extracting ' + cache[0].link);
									if (cache[0].publishedDate === null)
										cache[0].publishedDate = new Date();
									articles.push({
										url: cache[0].link,
										title: entities.decode(cache[0].title),
										thumbnail: thumbnail,
										source: cache[0].source,
										publishedDate: cache[0].publishedDate,
										titleKeywords: titleKeywordSet,
										tfTitle: tfTitle,
										keywords: keywordSet,
										originkeywords: originKeywordSet,
										tf: tf
									});
									cache.shift();
									i++;
									cb2();
								});
							});
					// 	}
					// 	else {
					// 		console.log('This article was saved');
					// 		cache.shift();
					// 		i++;
					// 		cb2();
					// 	}
					// });
				}, function() {
					console.log(cache.length);
					Save.saveArticle(articles, function() {
						saved = true;
						console.log('All news articles are saved!');
						cb();
					});
				});
			}
		], function(err) {
			if (err)
				console.log(err);
		});
	}
	else console.log(cache.length);
}, 60 * 1000);