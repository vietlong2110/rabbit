var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Facebook = new Schema({
	userId: Schema.Types.ObjectId,
	access_token: String,
	url: {
		type: String,
		unique: true,
	},
	title: String,
	thumbnail: String,
	source: String,
	publishedDate: {
		type: Date,
		default: Date.now()
	}
});

module.exports = mongoose.model('facebooks', Facebook);