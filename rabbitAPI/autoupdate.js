console.log('Autoupdate is running!');

var async = require('async');
var urlencode = require('urlencode');
var Entities = require('html-entities').AllHtmlEntities;
var entities = new Entities();
var serverAPI = require('./serverAPI/api.js');
var feed_link = require('./seed/feed_link.js');
var feedList = feed_link.rss;

var RSS = require('./serverController/rss.js');
var j = 0, cache = [];

async.forever(function(callback) {
//function updateFeed() {
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
			var maxComingArticle = 20;
			var i = 0;

			async.whilst(function() { return i < maxComingArticle; },
			function(cb) {
				var Extract = require('./serverController/extract.js');
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
			}, function() {
				console.log(cache.length);
				// var Save = require('../serverController/save.js');

				// Save.saveArticle(articles, function() {
				// 	console.log('All news articles are saved!');
					// j++;
					callback();
				// });
			});
		});
	}
	else {
		var maxComingArticle = cache.length;
		var i = 0;

		async.whilst(function() { return i < maxComingArticle; },
		function(cb) {
			var Extract = require('./serverController/extract.js');
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
		}, function() {
			console.log(cache.length);
			// var Save = require('../serverController/save.js');

			// Save.saveArticle(articles, function() {
			// 	console.log('All news articles are saved!');
		//		j++;
				callback();
			// });
		});
	}
});

//updateFeed();