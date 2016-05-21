var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
	name: String,
	wordList: [String],
	checkList: [Boolean],
	articles: [Schema.Types.ObjectId],
	articleKeywords: [{
		keywords: [String]
	}]
});

module.exports = mongoose.model('users', User);