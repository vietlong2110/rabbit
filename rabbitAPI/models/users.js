/********************************************************
*		This model stores anything related to user		*
********************************************************/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bcrypt = require('bcrypt');

var User = new Schema({
	email: {
		type: String,
		unique: true,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	access_token: String,
	name: String,
	profile_picture: String,
	cover: String,
	age_range: {
		max: Number,
		min: Number
	},
	wordList: [String],
	checkList: [Boolean],
	articles: [Schema.Types.ObjectId], //id of all articles that relate to whatever user follow
	articleKeywords: [{ 
		keywords: [String] //corresponding list keywords
	}],
	stars: [Boolean]
});

User.pre('save', function(callback) {
	var user = this;

	if (this.isModified('password') || this.isNew) {
		bcrypt.genSalt(10, function(err, salt) {
			if (err)
				return callback(err);

			bcrypt.hash(user.password, salt, function (err, hash) {
				if (err)
					return callback(err);

				user.password = hash;
				callback();
			});
		});
	}
	else callback();
});

User.methods.comparePassword = function(password, callback) {
	bcrypt.compare(password, this.password, function(err, isMatch) {
		if (err)
			return callback(err);

		callback(null, isMatch);
	});
};

module.exports = mongoose.model('users', User);