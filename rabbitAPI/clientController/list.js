/********************************************************************************
*		This controller include all functions relating to following list		*
********************************************************************************/

var mongoose = require('mongoose');
var User = require('../models/users.js');

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
		
		callback(user.wordList, user.checkList);
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