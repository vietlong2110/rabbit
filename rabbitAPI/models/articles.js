var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Article = new Schema({
	url: String,
	title: String,
	thumbnail: String,
	publishedDate: {type: Date, default: Date.now()},
	keywords: [String],
	tf: [Number]
});

module.exports = mongoose.model('articles', Article);