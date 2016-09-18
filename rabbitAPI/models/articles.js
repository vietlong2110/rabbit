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
	source: String,
	publishedDate: {
		type: Date, 
		default: Date.now()
	},
	titleKeywords: [String],
	tfTitle: [Number],
	keywords: [String],
	tf: [Number]
});

module.exports = mongoose.model('articles', Article);