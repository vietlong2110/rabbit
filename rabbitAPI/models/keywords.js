/***************************************************************************************************
*		This model stores all keywords and their properties from all articles database a...	 	   *
***************************************************************************************************/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Keyword = new Schema({
	word: String,
	df: Number //document frequency of corresponding word
});

module.exports = mongoose.model('keywords', Keyword);