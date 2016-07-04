var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var OriginKeyword = new Schema({
	word: {
		type: String,
		unique: true
	},
	df: Number, //document frequency of corresponding word
	followers: [Schema.Types.ObjectId],
	searchers: [Schema.Types.ObjectId],
	recentlyUpdated: {
		type: Date,
		default: Date.now()
	},
	weight: {
		type: Number,
		default: 0
	}
});

module.exports = mongoose.model('originkeywords', OriginKeyword);