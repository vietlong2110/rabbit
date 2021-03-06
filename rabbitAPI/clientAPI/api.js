/*****************************************************************************
*				This file includes all api calls from client side			 *
*****************************************************************************/

var express = require('express');
var app = express();
var router = express.Router();

var async = require('async');

var Feed = require('../clientController/feed.js');
var User = require('../models/users.js');
var Favorite = require('../clientController/favorite.js');
var Filter = require('../libs/filter.js');
var UserController = require('../clientController/user.js');
var Pagination = require('../libs/pagination.js');
var List = require('../clientController/list.js');
var stringFuncs = require('../libs/stringfunctions.js');

module.exports = function(passport) {
	router.get('/suggest', function(req, res) {
		var Suggest = require('../clientController/suggest.js');

		Suggest.searchSuggestion(req.query.q, function(suggestResults) {
			res.json({suggestList: suggestResults});
		});
	});

	//API router for searching a keyword/hashtag
	router.get('/search', function(req, res) { 
		UserController.getUser(req.headers, function(user) {
			if (user) {
				Feed.searchFeed(user, req.query.q, function(err, newsFeedResult, mediaFeedResult) {
					if (err)
						res.json({
							success: false,
							err: err
						});

					newsFeedResult.sort(function(a,b) { 
						if (b.evalScore - a.evalScore === 0) //if 2 articles have the same score
							return b.publishedDate - a.publishedDate; //sort by published date
						else return b.evalScore - a.evalScore; //otherwise sort by ranking score
					});

					mediaFeedResult.sort(function(a,b) { 
						if (b.evalScore - a.evalScore === 0) //if 2 articles have the same score
							return b.publishedDate - a.publishedDate; //sort by published date
						else return b.evalScore - a.evalScore; //otherwise sort by ranking score
					});

					Pagination.paginate(newsFeedResult, parseInt(req.query.sizenews),
					function(newsFeedResult, moreDataNews) {
						Pagination.paginate(mediaFeedResult, parseInt(req.query.sizemedia),
						function(mediaFeedResult, moreDataMedia) {
							var querySanitized = Filter.querySanitize(req.query.q);
							var queryTitle = Filter.niceTitle(querySanitized); 

							res.json({
								success: true,
								newsFeedResult: newsFeedResult,
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
			else res.status(403).json({
				success: false,
				error: 'Invalid authentication!'
			});
		});
	});

	//API router for following a keyword/hashtag
	router.post('/follow', function(req, res) {
		UserController.getUser(req.headers, function(user) {
			if (user) {
				var query = req.body.q;
				
				List.addList(user, query, function(addedlist) { //add keyword/hashtag to following list
					if (addedlist) //added keyword/hashtag successfully to database
						Feed.updateFeedByKeyword(user, query, 
						function(err, results, updatednews, updatedmedia) {
							if (err)
								res.json({
									success: false,
									error: 'Error occured!'
								});
							else res.json({
								success: true,
								news: results.newsfeed[0],
								moreDataNews: results.newsfeed[1],
								media: results.mediafeed[0],
								moreDataMedia: results.mediafeed[1],
								keywords: results.list
							});
						});
					else res.json({
						success: false,
						error: 'Error occured!'
					});
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
		UserController.getUser(req.headers, function(user) {
			if (user) {
				var query = req.body.q;

				List.deleteList(user, query, function(deletedList) {
					if (deletedList) //deleted keyword/hashtag successfully from database
						Feed.deleteFeedByKeyword(user, query, function(err, results) {
							if (err)
								res.json({
									success: false,
									error: err
								});
							else res.json({
								success: true,
								news: results.newsfeed[0],
								moreDataNews: results.newsfeed[1],
								media: results.mediafeed[0],
								moreDataMedia: results.mediafeed[1],
								keywords: results.list
							});
						});
					else res.json({
						success: false,
						error: 'Error occured!'
					});
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
		UserController.getUser(req.headers, function(user) {
			if (user) {
				var checkList = [];

				for (i in req.body.keywords)
					checkList.push(req.body.keywords[i].isChecked);

				List.updateList(user, checkList, function(updated) {
					if (updated)
						Feed.refreshFeed(user, function(err, results) {
							if (err)
								res.json({
									success: false,
									error: err
								});
							else res.json({
								success: true,
								news: results.newsfeed[0],
								moreDataNews: results.newsfeed[1],
								media: results.mediafeed[0],
								moreDataMedia: results.mediafeed[1]
							});
						});
					else res.json({
						success: false,
						error: err
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
	router.get('/getnewsfeed', function(req, res) {
		UserController.getUser(req.headers, function(user) {
			if (user)
				Feed.getNewsFeed(user, parseInt(req.query.size),
				function(err, newsfeed, moreDataNews) {
					if (err)
						res.json({
							success: false,
							error: err
						});
					else res.json({
						success: true,
						news: newsfeed,
						moreDataNews: moreDataNews
					});
				});
			else res.status(403).json({
				success: false,
				error: 'Invalid authentication!'
			});
		});
	});

	router.get('/getmediafeed', function(req, res) {
		UserController.getUser(req.headers, function(user) {
			if (user)
				Feed.getMediaFeed(user, parseInt(req.query.size),
				function(err, mediafeed, moreDataMedia) {
					if (err)
						res.json({
							success: false,
							error: err
						});
					else res.json({
						success: true,
						media: mediafeed,
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
		UserController.getUser(req.headers, function(user) {
			if (user)
				List.getList(user, function(list) {
					res.json({
						success: true,
						keywords: list
					});
				});
			else res.status(403).json({
				success: false,
				error: 'Invalid authentication!'
			});
		});
	});

	router.get('/getnewsbykeyword', function(req, res) {
		UserController.getUserId(req.headers, function(userId) {
			if (userId) {
				var query = Filter.querySanitize(req.query.q);
				Feed.getNewsByKeyword(userId, query, parseInt(req.query.size), 
				function(err, newsfeed, moreDataNews) {
					if (err)
						res.json({
							success: false,
							error: err
						});
					else res.json({
						success: true,
						titleNews: Filter.niceTitle(query),
						news: newsfeed,
						moreDataKeywordNews: moreDataNews
					});
				});
			}
			else res.status(403).json({
				success: false,
				error: 'Invalid authentication!'
			});
		});
	});

	router.get('/getmediabykeyword', function(req, res) {
		UserController.getUserId(req.headers, function(userId) {
			if (userId) {
				var query = Filter.querySanitize(req.query.q);
				Feed.getMediaByKeyword(userId, query, parseInt(req.query.size), 
				function(err, mediafeed, moreDataMedia) {
					if (err)
						res.json({
							success: false,
							error: err
						});
					else res.json({
						success: true,
						titleNews: Filter.niceTitle(query),
						media: mediafeed,
						moreDataKeywordMedia: moreDataMedia
					});
				});
			}
			else res.status(403).json({
				success: false,
				error: 'Invalid authentication!'
			});
		});
	});

	router.post('/updatenewsfavorite', function(req, res) {
		UserController.getUserId(req.headers, function(userId) {
			if (userId) {
				Favorite.updateNewsFavorite(userId, req.body.id, function(updated) {
					if (!updated)
						res.json({
							success: false,
							error: 'Error occured!'
						});
					else res.json({
						success: true,
						updated: updated
					});
				});
			}
			else res.status(403).json({
				success: false,
				error: 'Invalid authentication!'
			});
		});
	});

	router.post('/updatemediafavorite', function(req, res) {
		UserController.getUserId(req.headers, function(userId) {
			if (userId) {
				Favorite.updateMediaFavorite(userId, req.body.id, function(updated) {
					if (!updated)
						res.json({
							success: false,
							error: 'Error occured!'
						});
					else res.json({
						success: true,
						updated: updated
					});
				});
			}
			else res.status(403).json({
				success: false,
				error: 'Invalid authentication!'
			});
		});
	});

	router.get('/getnewsfavorite', function(req, res) {
		UserController.getUserId(req.headers, function(userId) {
			if (userId) {
				Favorite.getNewsFavorite(userId, parseInt(req.query.size),
				function(err, newsfeed, moreDataNews) {
					if (err)
						res.json({
							success: false,
							error: err
						});
					else res.json({
						success: true,
						news: newsfeed,
						moreDataNews: moreDataNews
					})
				});
			}
			else res.status(403).json({
				success: false,
				error: 'Invalid authentication!'
			});
		});
	});

	router.get('/getmediafavorite', function(req, res) {
		UserController.getUserId(req.headers, function(userId) {
			if (userId) {
				Favorite.getMediaFavorite(userId, parseInt(req.query.size),
				function(err, mediafeed, moreDataMedia) {
					if (err)
						res.json({
							success: false,
							error: err
						});
					else res.json({
						success: true,
						media: mediafeed,
						moreDataMedia: moreDataMedia
					})
				});
			}
			else res.status(403).json({
				success: false,
				error: 'Invalid authentication!'
			});
		});
	});

	router.post('/updatefeed', function(req, res) {
		UserController.getUser(req.headers, function(user) {
			if (user) {
				Feed.updateFeed(user, function(err, updatednews, updatedmedia) {
					if (err)
						res.json({
							success: false,
							error: err
						});
					else {
						// console.log('Updated!');
						res.json({
							success: true,
							news: updatednews,
							media: updatedmedia
						});
					}
				});
			}
			else res.status(403).json({
				success: false,
				error: 'Invalid authentication!'
			});
		});
	});

	router.get('/getsuggestion', function(req, res) {
		UserController.getUser(req.headers, function(user) {
			if (user) {
				res.json({
					success: true,
					likes: user.suggest
				});
			}
			else res.status(403).json({
				success: false,
				error: 'Invalid authentication!'
			});
		});
	});

	router.get('/getinfo', function(req, res) {
		UserController.getUser(req.headers, function(user) {
			if (user) {
				res.json({
					success: true,
					email: user.email,
					name: user.name,
					avatar: user.profile_picture
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