var express = require('express');
var app = express();
var router = express.Router();
var request = require('request');

var User = require('../models/users.js');
var config = require('../clientController/auth/config.js');
var jwt = require('jwt-simple');

//API router for registering a new account
router.post('/register', function(req, res) {
	if (!req.body.email)
		res.json({
			success: false,
			message: 'Please provide your email!'
		});
	else if (!req.body.password)
		res.json({
			success: false,
			message: 'Please provide your password!'
		});
	else if (!req.body.passwordConfirm || req.body.password !== req.body.passwordConfirm)
		res.json({
			success: false,
			message: 'Please confirm your password correctly!'
		});
	else {
		var User = require('../models/users.js');

		var newUser = new User({
			email: req.body.email,
			password: req.body.password
		});

		newUser.save(function(err) {
			if (!err)
				res.json({
					success: true,
					message: 'Welcome to rabbit!'
				});
			else if (err.code === 11000 || err.code === 11001)
				res.json({
					success: false,
					message: 'This email has already been used!'
				});
			else
				res.json({
					success: false,
					message: 'Something wrong happened with creating your account. Please try again!'
				});
		});
	}
});

router.post('/login', function(req, res) {
	User.findOne({email: req.body.email}).exec(function(err, user) {
		if (err)
			res.json({
				success: false,
				message: 'Something wrong happened with logging in your account. Please try again!'
			});
		else if (!user)
			res.json({
				success: false,
				message: 'This email has not been registered!'
			});
		else {
			user.comparePassword(req.body.password, function(err, isMatch) {
				if (err)
					res.json({
						success: false,
						message: 'Something wrong happened with logging in your account. Please try again!'
					});
				
				if (isMatch) {
					var token = jwt.encode(user, config.secret);

					res.json({
						success: true,
						token: 'JWT ' + token,
						message: 'Logging in'
					});
				}
				else res.json({
					success: false,
					message: 'Wrong password!'
				});
			});
		}
	});
});

router.post('/fblogin', function(req, res) {
	var accesstoken = req.body.token;
	// var accesstoken = 'EAAM98EFnHGMBAEu3LROACIzTEmdMp4XkCZBnrba7Q6rmXFYhLazgXlZCZBl93TUgu9hZCyHPi907bNcO7SP0hZBFH5mf5sO0hKNENghHKrNT97FcWneDZAWHAHjZArMiv3j3xm9u3EjJ5p56B1GxepvJD7dv3Vc8XPu6yI7OBaxygZDZD';
	var FB = require('../clientController/fb.js');

	FB.userInfo(accesstoken, function(data) {
		var User = require('../models/users.js');

    	User.findOne({email: data.email}).exec(function(err, user) {
    		if (err)
    			res.json({
    				success: false,
    				message: err
    			});
    		else if (!user) {
    			var newUser = new User({
    				email: data.email,
    				name: data.name,
    				picture: data.picture,
    				age_range: data.age_range,
    				password: require('generate-password').generate({
                        length: 32,
                        number: true
                    }),
                    access_token: accesstoken
    			});

    			newUser.save(function(err) {
    				if (err)
    					res.json({
    						success: false,
    						message: err
    					});
    				var token = jwt.encode(user, config.secret);

					res.json({
						success: true,
						token: 'JWT ' + token,
						message: 'Logging in'
					});
    			});
    		}
    		else {
    			user.access_token = accesstoken;
    			user.save(function(err) {
    				if (err)
    					res.json({
    						success: false,
    						message: err
    					});
    				var token = jwt.encode(user, config.secret);

					res.json({
						success: true,
						token: 'JWT ' + token,
						message: 'Logging in'
					});
    			});
    		}
    	});
	});
});

router.get('/getlikes', function(req, res) {
	var FB = require('../clientController/fb.js');

	FB.getUserLikes(req.query.token, function(data) {
		res.json({data: data});
	});
});

module.exports = router;