/************************************************************************
*		This model stores all articles from rss, social media API...	*
************************************************************************/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Article = new Schema({
	url: String,
	title: String,
	thumbnail: String,
	publishedDate: {
		type: Date, 
		default: Date.now()
	},
	originKeywords: [String],
	keywords: [String],
	tf: [Number], //term frequency corresponding to keyword
	media: Boolean
});

module.exports = mongoose.model('articles', Article);