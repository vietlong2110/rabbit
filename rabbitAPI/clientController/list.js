/********************************************************************************
*		This controller include all functions relating to following list		*
********************************************************************************/

var mongoose = require('mongoose');
var User = require('../models/users.js');
var Filter = require('../libs/filter.js');

var addList = function(keyword, userId, callback) {
	User.findById(userId).exec(function(err, user) {
		if (err)
			return callback(false);

		if (user.wordList.indexOf(keyword) === -1) { //add keyword and its default setting is checked
			user.wordList.push(keyword);
			user.checkList.push(true);
			user.save(function(err) {
				if (err)
					return callback(false);
				callback(true);
			});
		}
		else callback(true); //already followed
	});
};
module.exports.addList = addList;

//Get following list controller
var getList = function(userId, callback) {
	User.findById(userId).exec(function(err, user) {
		if (err) { //process error case later
			console.log(err);
			callback([], []);
		}

		if (user === null) {
			console.log('User not found!');
			callback([], []);
		}
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
	});
};
module.exports.getList = getList;

//Update following list controller
var updateList = function(userId, checkList, callback) {
	User.findById(userId).exec(function(err, user) {
		if (err) { //process error case later
			console.log(err);
			callback(false);
		}

		if (user === null) {
			console.log('User not found!');
			callback(false);
		}

		user.checkList = checkList; //update item view

		user.save(function(err) {
			if (err) { //process error case later
				console.log(err);
				callback(false);
			}

			callback(true);
		});
	});
};
module.exports.updateList = updateList;

//Delete an unfollow keyword from following list
var deleteList = function(keyword, userId, callback) {
	User.findById(userId).exec(function(err, user) {
		if (err)
			return callback(false);
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
	});
};
module.exports.deleteList = deleteList;