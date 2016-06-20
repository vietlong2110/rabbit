var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;

var User = require('../../models/users.js');
var config = require('./config.js');

module.exports = function(passport) {
	var opts = {};
	opts.secretOrKey = config.secret;
	opts.jwtFromRequest = ExtractJwt.fromAuthHeader();

	passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
		User.findOne({id: jwt_payload.sub}).exec(function(err, user) {
			if (err)
				return done(err, false);

			if (user)
				done(null, user);
			else done(null, false);
		});
	}));
};