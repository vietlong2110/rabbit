var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Cache = new Schema({
	key: String,
	value: [Schema.Types.Mixed]
});

module.exports = mongoose.model('caches', Cache);