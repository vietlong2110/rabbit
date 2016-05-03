var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Article = new Schema({
	url: String,
	title: String,
	publishedDate: {type: Date, default: Date.now()}
});

module.exports = mongoose.model('articles', Article);