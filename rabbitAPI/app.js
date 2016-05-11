var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var database = require('./database.js');
// var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost:27017/rabbit');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var serverapi = require('./serverAPI/serverAPI.js');
app.use('/serverapi', serverapi);

var clientapi = require('./clientAPI/clientAPI.js');
app.use('/clientapi', clientapi);

app.listen(port, function() {
	console.log('App is running on port ' + port);
});