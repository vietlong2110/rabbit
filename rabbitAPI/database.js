//MAIN DATABASE
var mongoose = require('mongoose');

module.exports = mongoose.connect('mongodb://localhost:27017/rabbit'); //replace when uploading server