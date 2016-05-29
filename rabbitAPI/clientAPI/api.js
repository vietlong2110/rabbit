/*****************************************************************************
*				This file includes all api calls from client side			 *
*****************************************************************************/

var express = require('express');
var app = express();
var router = express.Router();

var Extract = require('../clientController/extract.js');
var userId = '5746fe228460ac23fc41a78d'; //replace after creating login part

//API router for searching a keyword/hashtag
router.get('/search', function(req, res) { 
	var Feed = require('../clientController/feed.js');
	var Filter = require('../libs/filter.js');
	var query = Filter.querySanitize(req.query.q); //sanitize query before processing

	Feed.searchFeed(query, function(searchResult) { 
		var feedResult = [];
		var hashtag = Filter.keywordToHashtag(query); //convert keyword to hashtag before sending JSON

		for (i in searchResult)
			feedResult.push({
				id: i,
				url: searchResult[i].url,
				title: searchResult[i].title,
				thumbnail: searchResult[i].thumbnail,
				hashtag: hashtag
			});

		var queryTitle = Filter.niceTitle(query); //capitalize query to have a nice title

		res.json({
			searchResult: feedResult, //search results
			keywordSearch: req.query.q, //return whatever users typed in to compare with their following list
			queryTitle: queryTitle //title for search view
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
					Extract.getFeed(userId, function(feed) {
						res.json({news: feed});
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
		Extract.getFeed(userId, function(feed) {
			res.json({news: feed});
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
					Extract.getFeed(userId, function(feed) {
						Extract.getList(userId, function(list) {
							res.json({
								news: feed,
								keywords: list
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
	Extract.getFeed(userId, function(feed) {
		res.json({news: feed});
	});
});

//API router for loading the following list
router.get('/getlist', function(req, res) {
	Extract.getList(userId, function(list) {
		res.json({keywords: list});
	});
});

router.get('/getfeedbykeyword', function(req, res) {
	
});

module.exports = router;