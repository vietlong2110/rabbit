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
					var token = jwt.encode(user.email, config.secret);
					console.log('Login Token: ' + token);

					res.json({
						success: true,
						token: 'JWT ' + token,
						email: user.email,
						name: user.name,
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
	var FB = require('../clientController/fb.js');

	FB.userInfo(accesstoken, function(data) {
		FB.getUserLikes(accesstoken, function(likes) {
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
	    				profile_picture: data.picture,
	    				age_range: data.age_range,
	    				password: require('generate-password').generate({
	                        length: 32,
	                        number: true
	                    }),
	                    access_token: accesstoken,
	                    suggest: likes
	    			});

	    			newUser.save(function(err) {
	    				if (err)
	    					res.json({
	    						success: false,
	    						message: err
	    					});
	    				var token = jwt.encode(user.email, config.secret);
	    				console.log('FB Token: ' + accesstoken);
	    				console.log('Login Token: ' + token);

						res.json({
							success: true,
							token: 'JWT ' + token,
							email: data.email,
							name: data.name,
							message: 'Logging in'
						});
	    			});
	    		}
	    		else {
	    			user.access_token = accesstoken;
	    			// console.log('FB Token: ' + accesstoken);
	    			user.save(function(err) {
	    				if (err)
	    					res.json({
	    						success: false,
	    						message: err
	    					});
	    			});
	    			var token = jwt.encode(user.email, config.secret);
					// console.log('Login Token: ' + token);

					res.json({
						success: true,
						token: 'JWT ' + token,
						email: user.email,
						name: user.name,
						message: 'Logging in'
					});
	    		}
	    	});
		});
	});
});

router.get('/getlikes', function(req, res) {
	var FB = require('../clientController/fb.js');
	var token = 'EAAM98EFnHGMBAFII80uPzg8jVEULxGaGGZCPOFMds77fRV8gjc4Ul58zbySAoIL6bpxfI1dCcAZCBskAs4lrMsEt5J7P2i9AsW1tAV0UikOoMMZBRYa3zZCJ9gPM5oEZBQR1itHeyKnCczhPZCSgHS4NQg0XSrDHUZD';

	FB.getUserLikes(token, function(data) {
		res.json({data: data});
	});
});

module.exports = router;