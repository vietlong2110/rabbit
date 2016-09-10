var async = require('async');
var mongoose = require('mongoose');
var FB = require('fb');
var fb = new FB.Facebook({version: 'v2.7'});

var userInfo = function(token, callback) {
	fb.api('me', {fields: ['name', 'email', 'cover', 'age_range'], access_token: token}, function (res) {
        if (!res || res.error)
            return callback(res.error);
        else {
        	var info = {
				email: res.email,
				name: res.name,
				picture: '',
				cover: res.cover.source,
				age_range: res.age_range
        	};

        	fb.api('me/picture?redirect=0', {access_token: token}, function(response) {
        		// console.log(response);
        		info.picture = response.data.url;
        		callback(info);
        	});
    	}
    });
};
module.exports.userInfo = userInfo;