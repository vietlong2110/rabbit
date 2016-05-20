var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var database = require('./database.js');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', "*");
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
});

var port = process.env.PORT || 8080;

var serverapi = require('./serverAPI/api.js');
app.use('/serverapi', serverapi);

var clientapi = require('./clientAPI/api.js');
app.use('/clientapi', clientapi);

app.listen(port, function() {
	console.log('App is running on port ' + port);
});	