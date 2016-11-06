var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Media = new Schema({
	url: {
		type: String,
		unique: true
	},
	social_access: {
		type: Boolean,
		default: false
	},
	title: String,
	video: {
		type: Boolean,
		default: false
	},
	iframe: {
		type: Boolean,
		default: true
	},
	thumbnail: String,
	avatar: String,
	source: String,
	websource: String,
	publishedDate: {
		type: Date, 
		default: Date.now()
	},
	keywords: [String],
	tf: [Number]
});

module.exports = mongoose.model('medias', Media);