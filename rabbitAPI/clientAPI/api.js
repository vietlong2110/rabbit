/*****************************************************************************
*				This file includes all api calls from client side			 *
*****************************************************************************/

var express = require('express');
var app = express();
var router = express.Router();

var async = require('async');
var mongoose = require('mongoose');

var userId = '574042c521541890eca796fd'; //replace after creating login part

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

	Follow.addList(query, userId, function(followed1) { //add keyword/hashtag to following list
		if (followed1 >= 1) { //added keyword/hashtag successfully to database
			
			//add article to their newsfeed corresponding to whatever keyword/hashtag they followed
			Follow.addArticle(query, userId, function(followed2) {
				res.json({followed: followed2}); //added successfully or not (true/false)
			})
		}
		else res.json({followed: false});
	});
});

//API router for loading the following list
router.get('/getlist', function(req, res) {
	var List = require('../clientController/list.js');

	List.getList(userId, function(wordList, checkList) {
		var followingList = [];

		for (i in wordList)
			followingList.push({
				keyword: wordList[i],
				isChecked: checkList[i]
			});

		res.json({
			keywords: followingList
		});
	});
});

//API router for loading the newsfeed
router.get('/getfeed', function(req, res) {
	var Feed = require('../clientController/feed.js');

	// get all feeds with their keywords list corresponding to 
	// the settings from following list
	Feed.getFeed(userId, function(articleResult, hashtagResult) {
		var feed = [];
		var Filter = require('../libs/filter.js');

		for (i in articleResult) { //add keyword to a list of hashtag for an article
			var hashtag = '', hashtagLine = hashtagResult[i];
			for (j in hashtagLine)
				hashtag = hashtag + ' ' + Filter.keywordToHashtag(hashtagLine[j]);
			articleResult[i].hashtag = hashtag;
		}

		articleResult.sort(function(a,b) {
			if (b.today - a.today === 0) { //if 2 articles are on the same day
				if (b.evalScore - a.evalScore === 0)  //if 2 articles have the same score
					return b.publishedDate - a.publishedDate; //sort by published date
				else return b.evalScore - a.evalScore; //otherwise sort by ranking score
			}
			else return b.today - a.today; //otherwise sort by day first
		});

		for (i in articleResult)
			feed.push({
				id: i,
				url: articleResult[i].url,
				title: articleResult[i].title,
				thumbnail: articleResult[i].thumbnail,
				hashtag: articleResult[i].hashtag
			});
		
		res.json({news: feed});
	});
});

module.exports = router;