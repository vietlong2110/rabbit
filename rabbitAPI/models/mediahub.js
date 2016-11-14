var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MediaHub = new Schema({
	userId: Schema.Types.ObjectId,
	articleId: Schema.Types.ObjectId,
	url: String,
	title: String,
	thumbnail: String,
	websource: String,
	iframe: {
		type: Boolean,
		default: true
	},
	video: {
		type: Boolean,
		default: false
	}
	source: String,
	avatar: String,
	userKeywordList: [String],
	evalScoreList: [Number],
	evalScore: Number,
	publishedDate: Date,
	dayScore: Number,
	star: Boolean,
	favoriteDate: Date
});

module.exports = mongoose.model('mediahubs', MediaHub);