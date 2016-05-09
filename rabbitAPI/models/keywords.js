var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Keyword = new Schema({
	word: String,
	df: Number
});

module.exports = mongoose.model('keywords', Keyword);