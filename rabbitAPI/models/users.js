var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
	name: String,
	wordList: [String],
	checkList: [Boolean],
	articles: [{
		type: Schema.ObjectId,
		ref: 'articles'
	}]
});

module.exports = mongoose.model('users', User);