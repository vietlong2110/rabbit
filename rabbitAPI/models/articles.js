var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Article = new Schema({
	url: String,
	title: String,
	publishedDate: {type: Date, default: Date.now()},
	keywords: [{word: String, num: Number}]
});

module.exports = mongoose.model('articles', Article);