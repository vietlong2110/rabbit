/*****************************************************************************
*				This file includes all api calls from client side			 *
*****************************************************************************/

var express = require('express');
var app = express();
var router = express.Router();

var async = require('async');

var Feed = require('../clientController/feed.js');
var Filter = require('../libs/filter.js');
var Extract = require('../clientController/extract.js');
var UserController = require('../clientController/user.js');
var Pagination = require('../libs/pagination.js');
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
		var querySanitized = Filter.querySanitize(req.query.q); //sanitize query before processing
		var query = stringFuncs.preProcess(querySanitized);
		query = stringFuncs.wordTokenize(query);
		query = stringFuncs.stemArr(query);

		Feed.searchFeed(query, function(err, newsFeedResult, mediaFeedResult) {
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
	});

	//API router for following a keyword/hashtag
	router.post('/follow', function(req, res) {
		UserController.getUserId(req.headers, function(userId) {
			if (userId) {
				var query = Filter.querySanitize(req.body.q);
				var Follow = require('../clientController/follow.js');

				Follow.addList(query, userId, function(addedlist) { //add keyword/hashtag to following list
					if (addedlist) //added keyword/hashtag successfully to database
						Follow.addToArticle(query, userId, function(addedarticle) {
							if (addedarticle) //added article successfully to database
								res.json({success: true});
							else res.json({
								success: false,
								error: 'Error occured!'
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
		UserController.getUserId(req.headers, function(userId) {
			if (userId) {
				var Follow = require('../clientController/follow.js');
				var query = Filter.querySanitize(req.body.q);

				Follow.deleteList(query, userId, function(deletedList) {
					if (deletedList) //deleted keyword/hashtag successfully from database
						Follow.deleteArticle(query, userId, function(deletedArticle) {
							if (deletedArticle) //deleted article successfully from database
								res.json({success: true});
							else res.json({
								success: false,
								error: 'Error occured!'
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
							success: true,
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
				function(err, newsfeed, mediafeed, moreDataNews, moreDataMedia) {
					if (err)
						res.json({
							success: false,
							error: err
						});
					else res.json({
						success: true,
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

	router.get('/getfeedbykeyword', function(req, res) {
		UserController.getUserId(req.headers, function(userId) {
			if (userId) {
				var querySanitized = Filter.querySanitize(req.query.q);
				Extract.getFeedByKeyword(userId, querySanitized, parseInt(req.query.sizenews),
				parseInt(req.query.sizemedia), function(err, newsfeed, mediafeed, moreDataNews, moreDataMedia) {
					if (err)
						res.json({
							success: false,
							error: err
						});
					else res.json({
						success: true,
						news: newsfeed,
						media: mediafeed,
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

	router.post('/updatefavorite', function(req, res) {
		UserController.getUserId(req.headers, function(userId) {
			if (userId) {
				Feed.updateFavorite(userId, req.body.id, function(updated) {
					if (updated)
						res.json({success: true});
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

	router.get('/getfavorite', function(req, res) {
		UserController.getUserId(req.headers, function(userId) {
			if (userId) {
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