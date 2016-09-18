var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NewsHub = new Schema({
	userId: Schema.Types.ObjectId,
	articleId: Schema.Types.ObjectId,
	url: String,
	title: String,
	thumbnail: String,
	source: String,
	userKeywordList: [String],
	evalScoreList: [Number],
	evalScore: Number,
	publishedDate: Date,
	dayScore: Number,
	star: Boolean,
	favoriteDate: Date
});

module.exports = mongoose.model('newshubs', NewsHub);