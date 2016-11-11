/********************************************************************************
*		This controller include all functions relating to following list		*
********************************************************************************/

var mongoose = require('mongoose');
var User = require('../models/users.js');
var Filter = require('../libs/filter.js');

var addList = function(user, keyword, callback) {
	if (user.wordList.indexOf(keyword) === -1) { //add keyword and its default setting is checked
		user.wordList.push(keyword);
		user.checkList.push(true);
		for (i = 0; i < user.suggest.length; i++)
			if (user.suggest[i].name === keyword) {
				user.suggest[i].followed = true;
				break;
			}
		user.save(function(err) {
			if (err)
				return callback(false);
			callback(true);
		});
	}
	else callback(true); //already followed
};
module.exports.addList = addList;

//Get following list controller
var getList = function(user, callback) {
	var followingList = [];
	for (i = 0; i < user.wordList.length; i++) {
		var niceKeyword = Filter.niceTitle(user.wordList[i]); //render a nice keyword

		followingList.push({
			niceKeyword: niceKeyword,
			keyword: user.wordList[i],
			isChecked: user.checkList[i]
		});
	}
	
	callback(followingList);
};
module.exports.getList = getList;

//Update following list controller
var updateList = function(user, checkList, callback) {
	user.checkList = checkList; //update item view

	user.save(function(err) {
		if (err) { //process error case later
			console.log(err);
			callback(false);
		}

		callback(true);
	});
};
module.exports.updateList = updateList;

//Delete an unfollow keyword from following list
var deleteList = function(user, keyword, callback) {
	var index = user.wordList.indexOf(keyword);

	if (index !== -1) { //delete from both wordlist and checklist
		user.wordList.splice(index, 1);
		user.checkList.splice(index, 1);
		user.save(function(err) {
			if (err)
				return callback(false);
			callback(true);
		});
	}
	else callback(true);
};
module.exports.deleteList = deleteList;