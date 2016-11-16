/******************************************
*		MAIN APP TO RUN ALL APIS		  *
******************************************/

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');

var database = require('./database.js');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(passport.initialize());

require('./clientController/auth/auth.js')(passport);

app.use(function(req, res, next) { //prevent CORS
	res.header('Access-Control-Allow-Origin', "*");
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Origin, Authorization, X-Requested-With');
	next();
});

var test = require('./test.js');
app.use('/test', test);

var clientauth = require('./clientAPI/auth.js');
app.use('/auth', clientauth);

var clientapi = require('./clientAPI/api.js')(passport);
app.use('/clientapi', clientapi);

var port = process.env.PORT || 8080; 

app.listen(port, function() {
	console.log('App is running on port ' + port);
});	