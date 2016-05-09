var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Keyword = new Schema({
	word: String,
	docNum: Number
});

module.exports = mongoose.model('keywords', Keyword);