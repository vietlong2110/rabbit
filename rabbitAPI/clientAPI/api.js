/*****************************************************************************
*				This file includes all api calls from client side			 *
*****************************************************************************/

var express = require('express');
var app = express();
var router = express.Router();

var async = require('async');

var Extract = require('../clientController/extract.js');
var UserController = require('../clientController/user.js');
var Pagination = require('../libs/pagination.js');

module.exports = function(passport) {
	router.get('/suggest', function(req, res) {
		var Suggest = require('../clientController/suggest.js');

		Suggest.searchSuggestion(req.query.q, function(suggestResults) {
			res.json({suggestList: suggestResults});
		});
	});

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
						source: searchResult[i].source,
						avatar: searchResult[i].avatar,
						thumbnail: searchResult[i].thumbnail,
						publishedDate: searchResult[i].publishedDate,
						hashtag: hashtag
					});
				else newsFeedResult.push({
					id: searchResult[i].id,
					url: searchResult[i].url,
					title: searchResult[i].title,
					source: searchResult[i].source,
					thumbnail: searchResult[i].thumbnail,
					publishedDate: searchResult[i].publishedDate,
					hashtag: hashtag
				});

			var FollowKeyword = require('../models/followkeywords.js');

			FollowKeyword.findOne({query: req.query.q}).exec(function(err, keyword) {
				if (err)
					console.log(err);
				else if (keyword === null) {
					//will replace by searchMediaFeed later...
					Feed.searchInstaFeed(req.query.q, function(media) {
						var Algo = require('../libs/classic-algorithm.js');

						mediaFeedResult = Algo.mergeArray(media, mediaFeedResult);
						
						Pagination.paginate(newsFeedResult, parseInt(req.query.sizenews),
						function(newsFeedResult, moreDataNews) {
							Pagination.paginate(mediaFeedResult, parseInt(req.query.sizemedia),
							function(mediaFeedResult, moreDataMedia) {
								var queryTitle = Filter.niceTitle(query); 

								res.json({
									newsFeedResult: newsFeedResult, //search results
									mediaFeedResult: mediaFeedResult,
									keywordSearch: req.query.q, 
									queryTitle: queryTitle, //title for search view
									moreDataNews: moreDataNews,
									moreDataMedia: moreDataMedia
								});
							});
						});
					});
				}
				else {
					Pagination.paginate(newsFeedResult, parseInt(req.query.sizenews),
					function(newsFeedResult, moreDataNews) {
						Pagination.paginate(mediaFeedResult, parseInt(req.query.sizemedia),
						function(mediaFeedResult, moreDataMedia) {
							var queryTitle = Filter.niceTitle(query); 

							res.json({
								newsFeedResult: newsFeedResult, //search results
								mediaFeedResult: mediaFeedResult,
								keywordSearch: req.query.q, 
								queryTitle: queryTitle, //title for search view
								moreDataNews: moreDataNews,
								moreDataMedia: moreDataMedia
							});
						});
					});
				}
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
									source: result.source,
									avatar: result.avatar,
									thumbnail: result.thumbnail,
									publishedDate: result.publishedDate,
									hashtag: hashtag,
									star: star
								});
							else newsFeedResult.push({
								id: result.id,
								url: result.url,
								title: result.title,
								source: result.source,
								avatar: result.avatar,
								thumbnail: result.thumbnail,
								publishedDate: result.publishedDate,
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

						Pagination.paginate(newsFeedResult, parseInt(req.query.sizenews),
						function(newsFeedResult, moreDataNews) {
							Pagination.paginate(mediaFeedResult, parseInt(req.query.sizemedia),
							function(mediaFeedResult, moreDataMedia) {
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
					Pagination.paginate(favoriteNewsList, parseInt(req.query.sizenews),
					function(favoriteNewsList, moreDataNews) {
						Pagination.paginate(favoriteMediaList, parseInt(req.query.sizemedia),
						function(favoriteMediaList, moreDataMedia) {
							res.json({
								favoriteNews: favoriteNewsList,
								favoriteMedia: favoriteMediaList,
								moreDataNews: moreDataNews,
								moreDataMedia: moreDataMedia
							});
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

	return router;
};