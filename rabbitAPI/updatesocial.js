console.log('Update Social is running!');

var async = require('async');
var database = require('./database.js');

var Media = require('./models/media.js');
var User = require('./models/users.js');
var Extract = require('./serverController/extract.js');
var Save = require('./serverController/save.js');
var socialCache = [], saved = true;

setInterval(function() {
	if (saved) {
		saved = false;
		var media = [];

		async.waterfall([
			function(cb) {
				if (socialCache.length === 0) {
					User.find({}).exec(function(err, users) {
						if (err)
							return cb(err);
						async.eachSeries(users, function(user, cb1) {
							var suggestPage = user.suggest;
							if (user.suggest === null || user.suggest.length === 0)
								return cb1();
							console.log('Start extracting suggestion from ' + user.name);
							var FB = require('./clientController/fb.js');
							FB.pageFeed(user.access_token, suggestPage, function(err, fbFeed) {
								if (err)
									return cb1(err);
								socialCache = socialCache.concat(fbFeed);
								console.log('End extracting suggestion from ' + user.name);
								cb1();
							});
						}, function(err) {
							if (err)
								return cb(err);
							cb();
						});
					});
				}
				else cb();
			},
			function(cb) {
				console.log(socialCache.length);
				var maxComingArticle = Math.min(100, socialCache.length);
				var i = 0;

				async.whilst(function() { return i < maxComingArticle; },
				function(cb2) {
					Media.findOne({url: socialCache[0].url})
					.exec(function(err, article) {
						if (article === null) {
							console.log('Start extracting ' + socialCache[0].url);
							Extract.extractKeyword(null, socialCache[0].title,
							function(originKeywordSet, keywordSet, tf) {
								console.log('End extracting ' + socialCache[0].url);
								if (socialCache[0].publishedDate === null)
									socialCache[0].publishedDate = new Date();
								media.push({
									url: socialCache[0].url,
									social_access: socialCache[0].social_access,
									video: socialCache[0].video,
									iframe: socialCache[0].iframe,
									source: socialCache[0].source,
									websource: socialCache[0].websource,
									avatar: socialCache[0].avatar,
									title: socialCache[0].title,
									thumbnail: socialCache[0].image,
									publishedDate: socialCache[0].publishedDate,
									keywords: keywordSet,
									originkeywords: originKeywordSet,
									tf: tf
								});
								socialCache.shift();
								i++;
								cb2();
							});
						}
						else {
							console.log('This article was saved');
							socialCache.shift();
							i++;
							cb2();
						}
					});
				}, function() {
					console.log(socialCache.length);
					Save.saveMediaArticle(media, function() {
						saved = true;
						console.log('All news articles are saved!');
						cb();
					});
				});
			}
		]);
	}
	else console.log(socialCache.length);
}, 30 * 1000);