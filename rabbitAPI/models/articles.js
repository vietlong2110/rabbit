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
	title: {
		type: String,
		unique: true
	},
	thumbnail: String,
	avatar: String,
	source: String,
	publishedDate: {
		type: Date, 
		default: Date.now()
	},
	titleKeywords: [String],
	tfTitle: [Number],
	keywords: [String],
	tf: [Number], //term frequency corresponding to keyword
	media: Boolean
});

module.exports = mongoose.model('articles', Article);