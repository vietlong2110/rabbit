var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var OriginKeyword = new Schema({
	word: {
		type: String,
		unique: true
	},
	df: Number, //document frequency of corresponding word
	followers:  {
		type: Number,
		default: 0
	},
	searchers: {
		type: Number,
		default: 0
	},
	dfDaily: [{
		df: Number,
		daily: Date
	}],
	weight: {
		type: Number,
		default: 0
	}
});

module.exports = mongoose.model('originkeywords', OriginKeyword);