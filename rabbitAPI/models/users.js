/********************************************************
*		This model stores anything related to user		*
********************************************************/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
	name: String,
	wordList: [String],
	checkList: [Boolean],
	articles: [Schema.Types.ObjectId], //id of all articles that relate to whatever user follow
	articleKeywords: [{ 
		keywords: [String] //corresponding list keywords
	}],
	stars: [Boolean]
});

module.exports = mongoose.model('users', User);