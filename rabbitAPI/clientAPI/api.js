/*****************************************************************************
*				This file includes all api calls from client side			 *
*****************************************************************************/

var express = require('express');
var app = express();
var router = express.Router();

var async = require('async');

var Extract = require('../clientController/extract.js');
var userId = '5751ec552c5b3f4aa587bb66'; //replace after creating login part

//API router for searching a keyword/hashtag
router.get('/search', function(req, res) { 
	var Feed = require('../clientController/feed.js');
	var Filter = require('../libs/filter.js');
	var query = Filter.querySanitize(req.query.q); //sanitize query before processing

	Feed.searchFeed(query, function(searchResult) { 
		var feedResult = [];
		var hashtag = Filter.keywordToHashtag(query); //convert keyword to hashtag before sending JSON

		searchResult.sort(function(a,b) { 
			if (b.evalScore - a.evalScore === 0) //if 2 articles have the same score
				return b.publishedDate - a.publishedDate; //sort by published date
			else return b.evalScore - a.evalScore; //otherwise sort by ranking score
		});

		var offset = (searchResult.length < 8) ? searchResult.length : 8;
		var size = 5, moreData = true;
		var querySize = parseInt(req.query.size);

		if (querySize === 0)
			searchResult = searchResult.slice(0, offset);
		else if (querySize + size < searchResult.length)
			searchResult = searchResult.slice(0, querySize + size);
		else moreData = false;

		for (i in searchResult)
			feedResult.push({
				// eval: searchResult[i].evalScore,
				// date: searchResult[i].publishedDate,
				id: i,
				url: searchResult[i].url,
				title: searchResult[i].title,
				thumbnail: searchResult[i].thumbnail,
				hashtag: hashtag,
			});

		var queryTitle = Filter.niceTitle(query); //capitalize query to have a nice title

		res.json({
			searchResult: feedResult, //search results
			keywordSearch: req.query.q, //return whatever users typed in to compare with their following list
			queryTitle: queryTitle, //title for search view
			moreData: moreData
		});
	});
});

//API router for following a keyword/hashtag
router.post('/follow', function(req, res) {
	var Filter = require('../libs/filter.js');
	var query = Filter.querySanitize(req.body.q);
	var Follow = require('../clientController/follow.js');

	Follow.addList(query, userId, function(addlist) { //add keyword/hashtag to following list
		if (addlist) //added keyword/hashtag successfully to database
			
			//add article to their newsfeed corresponding to whatever keyword/hashtag they followed
			Follow.addArticle(query, userId, function(addarticle) {
				if (addarticle) //added article successfully to database
					Extract.getFeed(userId, 0, function(feed, moreData) {
						Extract.getList(userId, function(list) {
							res.json({
								news: feed,
								keywords: list,
								moreData: moreData
							});
						});
					});
				// else 
			});
		// else
	});
});

//API router for updating the following list
router.post('/updatelist', function(req, res) {
	var List = require('../clientController/list.js');
	var checkList = [];

	for (i in req.body.keywords)
		checkList.push(req.body.keywords[i].isChecked);

	List.updateList(userId, checkList, function(updated) {
		Extract.getFeed(userId, 0, function(feed, moreData) {
			res.json({
				news: feed,
				moreData: moreData
			});
		});
	});
});

//API router for unfollowing a keyword/hashtag
router.post('/unfollow', function(req, res) {
	var Follow = require('../clientController/follow.js');

	Follow.deleteList(req.body.keyword, userId, function(deletedList) {
		if (deletedList) //deleted keyword/hashtag successfully from database

			//delete article from their newsfeed corresponding to whatever keyword/hashtag they followed
			Follow.deleteArticle(req.body.keyword, userId, function(deletedArticle) {
				if (deletedArticle) //deleted article successfully from database
					Extract.getFeed(userId, 0, function(feed, moreData) {
						Extract.getList(userId, function(list) {
							res.json({
								news: feed,
								keywords: list,
								moreData: moreData
							});
						});
					});
				//else
			});
		// else
	});
});

//API router for loading the newsfeed
router.get('/getfeed', function(req, res) {
	Extract.getFeed(userId, parseInt(req.query.size), function(feed, moreData) {
		res.json({
			news: feed,
			moreData: moreData
		});
	});
});

//API router for loading the following list
router.get('/getlist', function(req, res) {
	Extract.getList(userId, function(list) {
		res.json({keywords: list});
	});
});

router.get('/getfeedbykeyword', function(req, res) {
	var Feed = require('../clientController/feed.js');
	var Filter = require('../libs/filter.js');
	var query = Filter.querySanitize(req.query.q); //sanitize query before processing

	Feed.searchFeed(query, function(searchResult) { 
		var feedResult = [];
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
		var offset = (searchResult.length < 8) ? searchResult.length : 8;
		var size = 5, moreData = true;
		var querySize = parseInt(req.query.size);

		if (querySize === 0)
			searchResult = searchResult.slice(0, offset);
		else if (querySize + size < searchResult.length)
			searchResult = searchResult.slice(0, querySize + size);
		else moreData = false;

		async.eachSeries(searchResult, function(result, callback) {
			User.findById(userId).exec(function(err, user) {
				if (err) {
					console.log(err);
					res.json({});
				}

				var star = user.stars[user.articles.indexOf(result.id)];

				feedResult.push({
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

			var queryTitle = Filter.niceTitle(query); //capitalize query to have a nice title

			res.json({
				news: feedResult, //search results
				titleNews: queryTitle, //title for search view
				moreData: moreData
			});
		});
	});
});

router.post('/updatefavorite', function(req, res) {
	var Feed = require('../clientController/feed.js');

	Feed.updateFavorite(userId, req.body.id, function(updated) {
		if (updated)
			res.json({updated: true});
		else res.json({updated: false});
	});
});

router.get('/getfavorite', function(req, res) {
	var Feed = require('../clientController/feed.js');

	Feed.getFavorite(userId, function(favoriteList) {
		var offset = (favoriteList.length < 8) ? favoriteList.length : 8;
		var size = 5, moreData = true;
		var querySize = parseInt(req.query.size);

		if (querySize === 0)
			favoriteList = favoriteList.slice(0, offset);
		else if (querySize + size < favoriteList.length)
			favoriteList = favoriteList.slice(0, querySize + size);
		else moreData = false;

		res.json({
			favoriteNews: favoriteList,
			moreData: moreData
		});
	});
});

module.exports = router;