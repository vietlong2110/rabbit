/********************************************************************************
*		This controller include all functions relating to following list		*
*********************************************************************************/

var mongoose = require('mongoose');
var User = require('../models/users.js');

//Get following list controller
var getList = function(userId, callback) {
	User.findById(userId).exec(function(err, user) {
		if (err) {
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