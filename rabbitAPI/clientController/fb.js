var async = require('async');
var mongoose = require('mongoose');
var FB = require('fb');
var fb = new FB.Facebook({version: 'v2.8'});

var userInfo = function(token, callback) {
	fb.api('me', {fields: ['name', 'email', 'cover', 'age_range'], access_token: token}, function (res) {
        if (!res || res.error)
            return callback(res.error);

    	var info = {
			email: res.email,
			name: res.name,
			picture: '',
			age_range: res.age_range
    	};

    	fb.api(res.id + '/picture?redirect=0', {access_token: token}, function(response) {
    		// console.log(response);
            if (!res || res.error)
                return callback(res.error);
    		info.picture = response.data.url;
    		callback(null, info);
    	});
    });
};
module.exports.userInfo = userInfo;

var getUserLikes = function(token, callback) {
    // console.log(token);
    fb.api('me/likes', {access_token: token}, function(res) {
        if (!res || res.error)
            return callback(res.error);
        if (res.paging === undefined)
            return callback();

        var data = res.data;
        var next = res.paging.cursors.after;

        async.whilst(function() {return next !== undefined},
        function(cb) {
            fb.api('me/likes?after=' + next, {
                fields: ['name', 'category', 'created_time'], 
                access_token: token
            },
            function(response) {
                if (!res || res.error)
                    return callback(res.error);
                if (response.paging) {
                    data = data.concat(response.data);
                    next = response.paging.cursors.after;
                }
                else next = undefined;
                cb();
            });
        }, function() {
            getSuggestionList(token, data, function(err, suggestList, allLikes) {
                if (err)
                    return callback(err);
                callback(null, suggestList);
            });
        });
    });
};
module.exports.getUserLikes = getUserLikes;

var getSuggestionList = function(token, data, callback) {
    var stringFuncs = require('../libs/stringfunctions.js');
    var engData = [];

    for (i = 0; i < data.length; i++)
        if (stringFuncs.detectLanguage(data[i].name))
            engData.push(data[i]);

    engData.sort(function(a, b) {
        return b.created_time - a.created_time;
    });
    var allLikes = engData;

    engData = engData.slice(0, 25);
    // callback(engData);
    var resultData = [];

    async.each(engData, function(enData, cb) {
        fb.api(enData.id, {fields: ['fan_count', 'cover'], access_token: token}, function(res) {
            if (!res || res.error)
                return callback(res.error);
            var d = {
                id: enData.id,
                name: enData.name,
                likes: res.fan_count,
                cover: '',
                avatar: ''
            };
            if (res.cover !== undefined)
                d.cover = res.cover.source;
            resultData.push(d);
            cb();
        });
    }, function(err) {
        if (err)
            return callback(err);
        
        resultData.sort(function(a, b) {
            return b.likes - a.likes;
        });
        resultData = resultData.slice(0, 10);
        async.each(resultData, function(result, cb2) {
            fb.api(result.id + '/picture?redirect=0', {access_token: token}, function(res) {
                if (!res || res.error)
                    return callback(res.error);
                result.avatar = res.data.url;
                cb2();
            });
        }, function(err) {
            if (err)
                return callback(err);
            callback(null, resultData, allLikes);
        });
    });
};
module.exports.getSuggestionList = getSuggestionList;

var refreshSuggestion = function() {

};
module.exports.refreshSuggestion = refreshSuggestion;

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
                    url = 'https://www.facebook.com/plugins/post.php?href=' + encodeURIComponent(url) + '&show_text=true&appId=492416160797294';
                var title = '';
                if (data[i].message)
                    title = data[i].message;
                else if (data[i].story)
                    title = data[i].story;
                else continue;
                if (title.length > 100)
                    title = title.substring(0, 100);
                resultData.push({
                    url: data[i].link,
                    title: title,
                    thumbnail: data[i].full_picture,
                    social_access: true,
                    video: false,
                    iframe: true,
                    source: page.name,
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