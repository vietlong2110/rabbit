var mongoose = require('mongoose')
require('mongoose-double')(mongoose);

var Schema = mongoose.Schema;

var OriginKeyword = new Schema({
	word: String,
	df: Number, //document frequency of corresponding word
	followers: [Schema.Types.ObjectId],
	searchers: [Schema.Types.ObjectId],
	recentlyUpdated: {
		type: Date, 
		default: Date.now()
	},
	weight: Schema.Types.Double
});

module.exports = mongoose.model('originkeywords', OriginKeyword);