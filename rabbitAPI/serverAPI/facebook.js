var async = require('async');
var mongoose = require('mongoose');
var FB = require('fb');
var fb = new FB.Facebook({version: 'v2.8'});

var pageFeed = function(token, pageList, callback) {
    var resultData = [];

    async.eachSeries(pageList, function(page, cb) {
        console.log('Start extracting ' + page.name);
        fb.api(page.id + '/feed', {fields: ['full_picture', 'link', 'message', 'story', 'created_time'], 
        access_token: token}, function(res) {
            if (!res || res.error)
                return callback(res.error);
            var data = res.data;

            for (i = 0; i < data.length; i++) {
                if (data[i].link === undefined || data[i].link === null)
                    continue;
                var regex = /facebook.com/g;
                var url = data[i].link;
                var reg = regex.exec(url);
                if (reg !== null)
                    url = 'https://www.facebook.com/plugins/post.php?href=' + encodeURIComponent(url) + '&show_text=true&appId=912527028853859';
                //console.log(url);
                var title = '';
                if (data[i].message)
                    title = data[i].message;
                else if (data[i].story)
                    title = data[i].story;
                else continue;
                if (title.length > 100)
                    title = title.substring(0, 100);
                resultData.push({
                    url: url,
                    title: title,
                    thumbnail: data[i].full_picture,
                    social_access: true,
                    video: false,
                    iframe: true,
                    source: page.name.toLowerCase(),
                    websource: "facebook",
                    avatar: page.avatar,
                    publishedDate: new Date(data[i].created_time)
                });
            }
            console.log('End extracting ' + page.name);
            cb();
        });
    }, function(err) {
        if (err)
            return callback(err);
        callback(null, resultData);
    });
};
module.exports.pageFeed = pageFeed;