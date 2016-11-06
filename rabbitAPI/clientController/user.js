var jwt = require('jwt-simple');
var config = require('../clientController/auth/config.js');
var User = require('../models/users.js');

var getToken = function(headers) {
	if (headers && headers.authorization) {
		var parted = headers.authorization.split(' ');
		if (parted.length === 2)
			return parted[1]; 
		else return null;
	} 
	else return null;
};

var getUserId = function(headers, callback) {
	var token = getToken(headers);
	if (token) {
		var decoded = jwt.decode(token, config.secret);

		User.findOne({email: decoded}).exec(function(err, user) {
			if (!user || err)
				return callback(null);

			callback(user._id);
		});
	}
	else callback(null);
};
module.exports.getUserId = getUserId;

var getUser = function(headers, callback) {
	var token = getToken(headers);
	if (token) {
		var decoded = jwt.decode(token, config.secret);

		User.findOne({email: decoded}).exec(function(err, user) {
			if (!user || err)
				return callback(null);

			callback(user);
		});
	}
	else callback(null);
};
module.exports.getUser = getUser;