/************************************************************************
*		This model stores all articles from rss, social media API...	*
************************************************************************/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Article = new Schema({
	url: {
		type: String,
		unique: true
	},
	title: String,
	thumbnail: String,
	avatar: String,
	source: String,
	content: {
		type: String,
		unique: true
	},
	publishedDate: {
		type: Date, 
		default: Date.now()
	},
	keywords: [String],
	tf: [Number], //term frequency corresponding to keyword
	media: Boolean
});

module.exports = mongoose.model('articles', Article);