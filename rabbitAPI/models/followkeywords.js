var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var FollowKeyword = new Schema({
	query: {
		type: String,
		unique: true
	},
	followers: Number
});

module.exports = mongoose.model('followkeywords', FollowKeyword);