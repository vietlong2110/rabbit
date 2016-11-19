var request = require('request');

var youtubeSearchAPI = function(keyword, callback) {
	var api_key = 'AIzaSyC_BWUjhlDW2oEbUTdmf1kOjsMdYPPPvEg';
	var url = 'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=' + keyword + '&key=' + api_key;
	var videoList = [];
    var youtubeava = require('../seed/icon_link.js').youtube;

	request(url, function(err, res, body) {
		if (!err && res.statusCode === 200) {
			if (JSON.parse(body).items !== null) {
				var items = JSON.parse(body).items;

				for (i in items)
					videoList.push({
						id: items[i].id.videoId,
						url: 'https://www.youtube.com/embed/' + items[i].id.videoId,
						title: items[i].snippet.title,
						thumbnail: items[i].snippet.thumbnails.high.url,
						publishedDate: new Date(items[i].snippet.publishedAt),
						source: 'youtube',
						websource: 'youtube',
						iframe: true,
						video: true,
                        avatar: youtubeava
					});
				callback(null, videoList);
			}
		}
		else callback(err);
	});
};
module.exports.youtubeSearchAPI = youtubeSearchAPI;