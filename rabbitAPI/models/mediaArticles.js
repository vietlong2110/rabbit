var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var mediaArticle = new Schema({
	url: String,
	title: String,
	image: String,
	publishedDate: {
		type: Date, 
		default: Date.now()
	},
	keywords: [String],
	tf: [Number] //term frequency corresponding to keyword
});

module.exports = mongoose.model('mediaarticles', mediaArticle);