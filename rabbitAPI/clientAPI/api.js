/*****************************************************************************
*				This file includes all api calls from client side			 *
*****************************************************************************/

var express = require('express');
var app = express();
var router = express.Router();

var async = require('async');

var Extract = require('../clientController/extract.js');
var UserController = require('../clientController/user.js');

module.exports = function(passport) {
	//API router for searching a keyword/hashtag
	router.get('/search', function(req, res) { 
		var Feed = require('../clientController/feed.js');
		var Filter = require('../libs/filter.js');
		var query = Filter.querySanitize(req.query.q); //sanitize query before processing

		Feed.searchFeed(query, function(searchResult) { 
			var newsFeedResult = [], mediaFeedResult = [];
			var hashtag = Filter.keywordToHashtag(query); //convert keyword to hashtag before sending JSON

			searchResult.sort(function(a,b) { 
				if (b.evalScore - a.evalScore === 0) //if 2 articles have the same score
					return b.publishedDate - a.publishedDate; //sort by published date
				else return b.evalScore - a.evalScore; //otherwise sort by ranking score
			});

			for (i in searchResult)
				if (searchResult[i].media)
					mediaFeedResult.push({
						id: searchResult[i].id,
						url: searchResult[i].url,
						title: searchResult[i].title,
						thumbnail: searchResult[i].thumbnail,
						hashtag: hashtag
					});
				else newsFeedResult.push({
					id: searchResult[i].id,
					url: searchResult[i].url,
					title: searchResult[i].title,
					thumbnail: searchResult[i].thumbnail,
					hashtag: hashtag
				});

			var offset = (newsFeedResult.length < 8) ? newsFeedResult.length : 8;
			var size = 5, moreDataNews = true;
			var querySize = parseInt(req.query.sizenews);

			if (querySize === 0) {
				if (newsFeedResult.length === offset)
					moreDataNews = false;
				newsFeedResult = newsFeedResult.slice(0, offset);
			}
			else if (querySize + size < newsFeedResult.length)
				newsFeedResult = newsFeedResult.slice(0, querySize + size);
			else moreDataNews = false;

			offset = (mediaFeedResult.length < 8) ? mediaFeedResult.length : 8;
			var moreDataMedia = true;
			querySize = parseInt(req.query.sizemedia);

			if (querySize === 0) {
				if (mediaFeedResult.length === offset)
					moreDataMedia = false;
				mediaFeedResult = mediaFeedResult.slice(0, offset);
			}
			else if (querySize + size < mediaFeedResult.length)
				mediaFeedResult = mediaFeedResult.slice(0, querySize + size);
			else moreDataMedia = false;

			var queryTitle = Filter.niceTitle(query); //capitalize query to have a nice title

			res.json({
				newsFeedResult: newsFeedResult, //search results
				mediaFeedResult: mediaFeedResult,
				keywordSearch: req.query.q, //return whatever users typed in to compare with their following list
				queryTitle: queryTitle, //title for search view
				moreDataNews: moreDataNews,
				moreDataMedia: moreDataMedia
			});
		});
	});

	//API router for following a keyword/hashtag
	router.post('/follow', function(req, res) {
		UserController.getUserId(req.headers, function(userId) {
			if (userId) {
				var Filter = require('../libs/filter.js');
				var query = Filter.querySanitize(req.body.q);
				var Follow = require('../clientController/follow.js');

				Follow.addList(query, userId, function(addlist) { //add keyword/hashtag to following list
					if (addlist) //added keyword/hashtag successfully to database
						//add article to their newsfeed corresponding to whatever keyword/hashtag they followed
						Follow.addArticle(query, userId, function(addarticle) {
							if (addarticle) //added article successfully to database
								Extract.getFeed(userId, 0, 0,
								function(newsfeed, mediafeed, moreDataNews, moreDataMedia) {
									Extract.getList(userId, function(list) {
										res.json({
											news: newsfeed,
											media: mediafeed,
											keywords: list,
											moreDataNews: moreDataNews,
											moreDataMedia: moreDataMedia
										});
									});
								});
							// else 
						});
					// else
				});
			}
			else res.status(403).json({
				success: false,
				error: 'Invalid authentication!'
			});
		});
	});

	//API router for unfollowing a keyword/hashtag
	router.post('/unfollow', function(req, res) {
		UserController.getUserId(req.headers, function(userId) {
			if (userId) {
				var Follow = require('../clientController/follow.js');

				Follow.deleteList(req.body.keyword, userId, function(deletedList) {
					if (deletedList) //deleted keyword/hashtag successfully from database

						//delete article from their newsfeed corresponding to whatever keyword/hashtag they followed
						Follow.deleteArticle(req.body.keyword, userId, function(deletedArticle) {
							if (deletedArticle) //deleted article successfully from database
								Extract.getFeed(userId, 0, 0,
								function(newsfeed, mediafeed, moreDataNews, moreDataMedia) {
									Extract.getList(userId, function(list) {
										res.json({
											news: newsfeed,
											media: mediafeed,
											keywords: list,
											moreDataNews: moreDataNews,
											moreDataMedia: moreDataMedia
										});
									});
								});
							//else
						});
					// else
				});
			}
			else res.status(403).json({
				success: false,
				error: 'Invalid authentication!'
			});
		});
	});

	//API router for updating the following list
	router.post('/updatelist', function(req, res) {
		UserController.getUserId(req.headers, function(userId) {
			if (userId) {
				var List = require('../clientController/list.js');
				var checkList = [];

				for (i in req.body.keywords)
					checkList.push(req.body.keywords[i].isChecked);

				List.updateList(userId, checkList, function(updated) {
					Extract.getFeed(userId, 0, 0,
					function(newsfeed, mediafeed, moreDataNews, moreDataMedia) {
						res.json({
							news: newsfeed,
							media: mediafeed,
							moreDataNews: moreDataNews,
							moreDataMedia: moreDataMedia
						});
					});
				});
			}
			else res.status(403).json({
				success: false,
				error: 'Invalid authentication!'
			});
		});
	});

	//API router for loading the newsfeed
	router.get('/getfeed', function(req, res) {
		UserController.getUserId(req.headers, function(userId) {
			if (userId)
				Extract.getFeed(userId, parseInt(req.query.sizenews), parseInt(req.query.sizemedia),
				function(newsfeed, mediafeed, moreDataNews, moreDataMedia) {
					res.json({
						news: newsfeed,
						media: mediafeed,
						moreDataNews: moreDataNews,
						moreDataMedia: moreDataMedia
					});
				});
			else res.status(403).json({
				success: false,
				error: 'Invalid authentication!'
			});
		});
	});

	//API router for loading the following list
	router.get('/getlist', function(req, res) {
		UserController.getUserId(req.headers, function(userId) {
			if (userId)
				Extract.getList(userId, function(list) {
					res.json({keywords: list});
				});
			else res.status(403).json({
				success: false,
				error: 'Invalid authentication!'
			});
		});
	});

	router.get('/getfeedbykeyword', function(req, res) {
		UserController.getUserId(req.headers, function(userId) {
			if (userId) {
				var Feed = require('../clientController/feed.js');
				var Filter = require('../libs/filter.js');
				var query = Filter.querySanitize(req.query.q); //sanitize query before processing

				Feed.searchFeed(query, function(searchResult) { 
					var newsFeedResult = [], mediaFeedResult = [];
					var hashtag = Filter.keywordToHashtag(query); //convert keyword to hashtag before sending JSON

					searchResult.sort(function(a,b) { 
						var bToday = b.today[0] + b.today[1]*10 + b.today[2]*100;
						var aToday = a.today[0] + a.today[1]*10 + a.today[2]*100;

						if (bToday - aToday === 0) { //if 2 articles are on the same day
							if (b.evalScore - a.evalScore === 0)  //if 2 articles have the same score
								return b.publishedDate - a.publishedDate; //sort by published date
							else return b.evalScore - a.evalScore; //otherwise sort by ranking score
						}
						else return bToday - aToday; //otherwise sort by day first
					});

					var User = require('../models/users.js');

					async.eachSeries(searchResult, function(result, callback) {
						User.findById(userId).exec(function(err, user) {
							if (err) {
								console.log(err);
								res.json({});
							}

							var star = user.stars[user.articles.indexOf(result.id)];

							if (result.media)
								mediaFeedResult.push({
									id: result.id,
									url: result.url,
									title: result.title,
									thumbnail: result.thumbnail,
									hashtag: hashtag,
									star: star
								});
							else newsFeedResult.push({
								id: result.id,
								url: result.url,
								title: result.title,
								thumbnail: result.thumbnail,
								hashtag: hashtag,
								star: star
							});
							callback();
						});
					}, function(err) {
						if (err) {
							console.log(err);
							res.json({});
						}

						var offset = (newsFeedResult.length < 8) ? newsFeedResult.length : 8;
						var size = 5, moreDataNews = true;
						var querySize = parseInt(req.query.size);

						if (querySize === 0) {
							if (newsFeedResult.length === offset)
								moreDataNews = false;
							newsFeedResult = newsFeedResult.slice(0, offset);
						}
						else if (querySize + size < newsFeedResult.length)
							newsFeedResult = newsFeedResult.slice(0, querySize + size);
						else moreDataNews = false;

						offset = (mediaFeedResult.length < 8) ? mediaFeedResult.length : 8;
						var moreDataMedia = true;
						querySize = parseInt(req.query.size);

						if (querySize === 0) {
							if (mediaFeedResult.length === offset)
								moreDataMedia = false;
							mediaFeedResult = mediaFeedResult.slice(0, offset);
						}
						else if (querySize + size < mediaFeedResult.length)
							mediaFeedResult = mediaFeedResult.slice(0, querySize + size);
						else moreDataMedia = false;

						var queryTitle = Filter.niceTitle(query); //capitalize query to have a nice title

						res.json({
							news: newsFeedResult, //search results
							media: mediaFeedResult,
							titleNews: queryTitle, //title for search view
							moreDataNews: moreDataNews,
							moreDataMedia: moreDataMedia
						});
					});
				});
			}
			else res.status(403).json({
				success: false,
				error: 'Invalid authentication!'
			});
		});
	});

	router.post('/updatefavorite', function(req, res) {
		UserController.getUserId(req.headers, function(userId) {
			if (userId) {
				var Feed = require('../clientController/feed.js');

				Feed.updateFavorite(userId, req.body.id, function(updated) {
					if (updated)
						res.json({updated: true});
					else res.json({updated: false});
				});
			}
			else res.status(403).json({
				success: false,
				error: 'Invalid authentication!'
			});
		});
	});

	router.get('/getfavorite', function(req, res) {
		UserController.getUserId(req.headers, function(userId) {
			if (userId) {
				var Feed = require('../clientController/feed.js');

				Feed.getFavorite(userId, function(favoriteNewsList, favoriteMediaList) {
					var offset = (favoriteNewsList.length < 8) ? favoriteNewsList.length : 8;
					var size = 5, moreDataNews = true;
					var querySize = parseInt(req.query.sizenews);

					if (querySize === 0) {
						if (favoriteNewsList.length === offset)
							moreDataNews = false;
						favoriteNewsList = favoriteNewsList.slice(0, offset);
					}
					else if (querySize + size < favoriteNewsList.length)
						favoriteNewsList = favoriteNewsList.slice(0, querySize + size);
					else moreDataNews = false;

					offset = (favoriteMediaList.length < 8) ? favoriteMediaList.length : 8;
					var moreDataMedia = true;
					querySize = parseInt(req.query.sizemedia);

					if (querySize === 0) {
						if (favoriteMediaList.length === offset)
							moreDataMedia = false;
						favoriteMediaList = favoriteMediaList.slice(0, offset);
					}
					else if (querySize + size < favoriteMediaList.length)
						favoriteMediaList = favoriteMediaList.slice(0, querySize + size);
					else moreDataMedia = false;

					res.json({
						favoriteNews: favoriteNewsList,
						favoriteMedia: favoriteMediaList,
						moreDataNews: moreDataNews,
						moreDataMedia: moreDataMedia
					});
				});
			}
			else res.status(403).json({
				success: false,
				error: 'Invalid authentication!'
			});
		});
	});

	return router;
};