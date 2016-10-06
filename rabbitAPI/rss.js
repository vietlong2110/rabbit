var fs = require('fs');
var async = require('async');
var _ = require('lodash');
var database = require('./database.js');
var Site = require('./models/sites.js');
var Crawler = require('./libs/crawler.js');

fs.readFile('./seed/rss.txt', 'utf-8', function(err, buffer) {
	var rssArray = buffer.split("\n");
	console.log(rssArray.length);
	if (err)
		throw err;
	var urlSets = [];

	async.eachSeries(rssArray, function(rssElem, cb) {
		var rss = rssElem.split(" ");
		var source = rss[0], linkRSS = rss[1];
		Site.findOne({source: source}).exec(function(err, site) {
			if (err)
				return cb(err);
			if (site !== null && site.links.length > 0) {
				console.log(site.source);
				return cb();
			}
			Crawler.fetch(linkRSS, function(content) {
				// console.log(content);
				if (content === null)
					return cb();
				if (content.rss) {
					console.log(linkRSS);
					if (site === null) {
						var newSite = new Site({
							source: source,
							links: [linkRSS]
						});
						newSite.save(function(err) {
							if (err)
								return cb(err);
							cb();
						});
					}
					else {
						site.links.push(linkRSS);
						site.save(function(err) {
							if (err)
								return cb(err);
							console.log('Saved ' + source);
							cb();
						});
					}
				}
				else {
					var urls = Crawler.parseLinks(content.body, linkRSS, urlSets);
					if (urls === null)
						return cb();
					var links = [];
					// console.log(urls.length);

					async.each(urls, function(url, cb2) {
						console.log('Validating rss link ' + url);
						Crawler.fetch(url, function(content) {
							if (content === null)
								return cb2();
							if (content.rss) {
								console.log(url + ' is rss');
								links.push(url);
							}
							cb2();
						});
					}, function(err) {
						if (err)
							return cb(err);
						if (site === null) {
							var newSite = new Site({
								source: source,
								links: links
							});
							newSite.save(function(err) {
								if (err)
									return cb(err);
								console.log('Saved ' + source);
								cb();
							});
						}
						else {
							site.links = links;
							site.save(function(err) {
								if (err)
									return cb(err);
								console.log('Saved ' + source);
								cb();
							});
						}
					});
				}
			});
		});
	}, function(err) {
		if (err)
			console.log(err);
		console.log('Done!');
	});
});