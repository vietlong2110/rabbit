var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Media = new Schema({
	url: {
		type: String,
		unique: true
	},
	title: {
		type: String,
		unique: true
	},
	thumbnail: String,
	avatar: String,
	source: String,
	publishedDate: {
		type: Date, 
		default: Date.now()
	},
	keywords: [String],
	tf: [Number],
	user: [Schema.Types.ObjectId],
	userKeywords: [{
		keywords: [String]
	}],
	userStar: [Boolean]
});

module.exports = mongoose.model('medias', Media);