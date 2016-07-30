var async = require('async');
var request = require('request');

var access_token = '1455323594.ff5db3e.80068cfa236d4b9bbdefc97073abc142';

var searchMediaTags = function(tagName, callback) {
	var searchMediaTagsAPI = 'https://api.instagram.com/v1/tags/' + tagName +
	'/media/recent?access_token=' + access_token;
	var media = [];

	request(searchMediaTagsAPI, function(err, res, body) {
		if (!err && res.statusCode === 200) {
			if (JSON.parse(body).meta.code === 200) {
				var data = JSON.parse(body).data;

				for (i in data)
					media.push({
						id: data[i].id,
						url: data[i].link,
						source: data[i].user.username,
						avatar: data[i].user.profile_picture,
						title: data[i].caption.text,
						thumbnail: data[i].images.standard_resolution.url,
						publishedDate: data[i].created_time
					});
				callback(media);
			}
			else {
				console.log('Cannot extract data of this user!');
				callback(media);
			}
		}
		else {
			console.log(tagName);
			callback(media);
		}
	});
};
module.exports.searchMediaTags = searchMediaTags;

var searchUser = function(user, callback) {
	var searchUserAPI = 'https://api.instagram.com/v1/users/search?q=' + user + 
	'&access_token=' + access_token;
	var images = [];

	request(searchUserAPI, function(err, res, body) {
		if (!err && res.statusCode === 200) {
			if (JSON.parse(body).meta.code === 200) {
				if (JSON.parse(body).data.length > 0)
					userRecentMedia(JSON.parse(body).data[0].id, function(dataImages) {
						images = images.concat(dataImages);
						callback(images);
					});
				else callback(images);
			}
			else {
				console.log('Cannot extract data of this user!');
				callback();
			}
		}
		else {
			console.log(res.statusCode);
			callback();
		}
	});
};
module.exports.searchUser = searchUser;

var userRecentMedia = function(userId, callback) {
	var userRecentMediaAPI = 'https://api.instagram.com/v1/users/' + userId + 
	'/media/recent?access_token=' + access_token;
	var media = [];

	request(userRecentMediaAPI, function(err, res, body) {
		if (!err && res.statusCode === 200) {
			var data = JSON.parse(body).data;

			for (i in data)
				media.push({
					id: data[i].id,
					url: data[i].link,
					source: data[i].user.username,
					avatar: data[i].user.profile_picture,
					title: data[i].caption.text,
					thumbnail: data[i].images.standard_resolution.url,
					publishedDate: data[i].created_time
				});
			callback(media);
		}
		else {
			console.log(res.statusCode);
			callback();
		}
	});
};
module.exports.userRecentMedia = userRecentMedia;