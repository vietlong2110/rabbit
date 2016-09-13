console.log('Update News is running!');

var async = require('async');
var database = require('./database.js');
var Entities = require('html-entities').AllHtmlEntities;
var entities = new Entities();
var feed_link = require('./seed/feed_link.js');
var feedList = feed_link.rss;

var RSS = require('./serverController/rss.js');
var Article = require('./models/articles.js');
var Extract = require('./serverController/extract.js');
var Save = require('./serverController/save.js');
var cache = [], saved = true;

setInterval(function() {
	if (saved) {
		saved = false;
		var articles = [];

		async.each(feedList, function(feed, cb) {
			console.log('Start loading ' + feed);
			RSS.feedParse(feed, function(links) {
				console.log('End loading ' + feed);
				cache = cache.concat(links);
				cb();
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
						console.log('Start extracting ' + cache[0].link);
						Extract.extractImage(cache[0].link, function(thumbnail) {
							Extract.extractContent(entities.decode(cache[0].title), cache[0].link,
							function(originKeywordSet, keywordSet, tf, titleKeywordSet, tfTitle) {
								console.log('End extracting ' + cache[0].link);
								articles.push({
									url: cache[0].link,
									title: entities.decode(cache[0].title),
									thumbnail: thumbnail,
									publishedDate: cache[0].publishedDate,
									titleKeywords: titleKeywordSet,
									tfTitle: tfTitle,
									keywords: keywordSet,
									originkeywords: originKeywordSet,
									tf: tf
								});
								cache.shift();
								i++;
								cb();
							});
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
				Save.saveArticle(articles, function() {
					saved = true;
					console.log('All news articles are saved!');
				});
			});
		});
	}
	else console.log(cache.length);
}, 60 * 1000);