/***************************************************************************************************
*		This model stores all keywords and their properties from all articles database a...	 	   *
***************************************************************************************************/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Keyword = new Schema({
	word: {
		type: String,
		unique: true
	},
	df: Number, //document frequency of corresponding word
	articleIDs: [Schema.Types.ObjectId],
	mediaIDs: [Schema.Types.ObjectId]
});

module.exports = mongoose.model('keywords', Keyword);