var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Site = new Schema({
	source: {
		type: String,
		unique: true
	},
	links: [String]
});

module.exports = mongoose.model('sites', Site);