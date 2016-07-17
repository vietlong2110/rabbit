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
var j = 0, cache = [];

async.forever(function(callback) {
	var articles = [];

	if (cache.length === 0) {
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
				callback(cache);
			}
			console.log(cache.length);
			var maxComingArticle = Math.min(cache.length, 20);
			var i = 0;

			async.whilst(function() { return i < maxComingArticle; },
			function(cb) {
				Article.findOne({title: entities.decode(cache[0].title)}).exec(function(err, article) {
					if (article === null) {
						console.log('Start extracting ' + cache[0].link);
						Extract.extractImage(cache[0].link, function(thumbnail) {
							console.log('End extracting ' + cache[0].link);
							articles.push({
								url: cache[0].link,
								title: entities.decode(cache[0].title),
								thumbnail: thumbnail,
								publishedDate: cache[0].publishedDate
							});
							cache.shift();
							i++;
							cb();
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
				Save.saveArticle(articles, function(keywordSet, articleIDs, originKeywordSet) {
					Save.saveKeyword(keywordSet, articleIDs, originKeywordSet, function() {
						console.log('All news articles are saved!');
						callback();
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
			Article.findOne({title: entities.decode(cache[0].title)}).exec(function(err, article) {
				if (article === null) {
					console.log('Start extracting ' + cache[0].link);
					Extract.extractImage(cache[0].link, function(thumbnail) {
						console.log('End extracting ' + cache[0].link);
						articles.push({
							url: cache[0].link,
							title: entities.decode(cache[0].title),
							thumbnail: thumbnail,
							publishedDate: cache[0].publishedDate
						});
						cache.shift();
						i++;
						cb();
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
			Save.saveArticle(articles, function(keywordSet, articleIDs, originKeywordSet) {
				Save.saveKeyword(keywordSet, articleIDs, originKeywordSet, function() {
					console.log('All news articles are saved!');
					if (cache.length === 0)
						setTimeout(function() {
							callback();
						}, 1000 * 60);
					else callback();
				});
			});
		});
	}
});
