/************************************************************************
*		This controller includes all functions relating to extraction	*
************************************************************************/

var Boilerpipe = require('boilerpipe');
var request = require('request');
var bcrypt = require('bcrypt');

var extractContent = function(title, url, callback) { //extract content of an article url
	request(url, {timeout: 5000}, function(err, res, html) {
		if (!err && res.statusCode === 200) {
			var boilerpipe = new Boilerpipe({
				extractor: Boilerpipe.Extractor.Article,
				html: html
		 	});

		 	boilerpipe.getText(function(err, content) {
		 		if (err)
		 			return callback(err);
		 		
				extractKeyword(title, content,
				function(originKeywordSet, keywordSet, tf, titleKeywordSet, tfTitle) {
		 			callback(null, originKeywordSet, keywordSet, tf, titleKeywordSet, tfTitle);
		 		});
		 	});
		}
		else callback(err);
	});
};
module.exports.extractContent = extractContent;

var extractKeyword = function(title, content, callback) { //extract keyword from a content
	var stringFuncs = require('../libs/stringfunctions.js');
	var keywordSet = [], originKeywordSet = [], titleKeywordSet = [];
	var tf = [], tfTitle = [];

	if (title)
		stringFuncs.contentToKeywords(title, function(titleKeywords, originKeywords) {
			for (i in titleKeywords)
				if (titleKeywordSet.indexOf(titleKeywords[i]) === -1) {
					titleKeywordSet.push(titleKeywords[i]);
					tfTitle.push(1);
				}
				else tfTitle[titleKeywordSet.indexOf(titleKeywords[i])]++;

			for (i in originKeywords)
					if (originKeywordSet.indexOf(originKeywords[i]) === -1)
						originKeywordSet.push(originKeywords[i]);

			//convert content to a list of keyword
			stringFuncs.contentToKeywords(content, function(keywords, originKeywords) {
				for (i in keywords)
					if (keywordSet.indexOf(keywords[i]) === -1) {
						keywordSet.push(keywords[i]);
						tf.push(1);
					}
					else tf[keywordSet.indexOf(keywords[i])]++;

				for (i in originKeywords)
					if (originKeywordSet.indexOf(originKeywords[i]) === -1)
						originKeywordSet.push(originKeywords[i]);
				callback(originKeywordSet, keywordSet, tf, titleKeywordSet, tfTitle);
			});
		});
	else stringFuncs.contentToKeywords(content, function(keywords, originKeywords) {
		for (i in keywords)
			if (keywordSet.indexOf(keywords[i]) === -1) {
				keywordSet.push(keywords[i]);
				tf.push(1);
			}
			else tf[keywordSet.indexOf(keywords[i])]++;

		for (i in originKeywords)
			if (originKeywordSet.indexOf(originKeywords[i]) === -1)
				originKeywordSet.push(originKeywords[i]);
		callback(originKeywordSet, keywordSet, tf, titleKeywordSet, tfTitle);
	});
};
module.exports.extractKeyword = extractKeyword;

var extractImage = function(url, callback) { //extract thumbnail of an article url
	request(url, {timeout: 5000}, function(err, res, html) {
		if (!err && res.statusCode === 200) {
		// 	var boilerpipe = new Boilerpipe({
		// 		extractor: Boilerpipe.Extractor.Article,
		// 		html: html
		//  	});
		// 	boilerpipe.getImages(function(err, images) {
		// 		if (err)
		// 			return callback(err);
		// 		if (images.length > 0)
		// 			callback(images[0].src);
				callback(extractImageFromContent(html));
		// 	});
		}
		else callback(null);
	});
};
module.exports.extractImage = extractImage;

var extractImageFromContent = function(content) {
	// console.log(content);
	var regex = /<meta(?=\s|>)(?=(?:[^>=]|='[^']*'|="[^"]*"|=[^'"][^\s>]*)*?\sproperty=(?:'og:image|"og:image"|og:image))(?=(?:[^>=]|='[^']*'|="[^"]*"|=[^'"][^\s>]*)*?\scontent=('[^']*'|"[^"]*"|[^'"][^\s>]*))(?:[^'">=]*|='[^']*'|="[^"]*"|=[^'"][^\s>]*)*>/g;
	// console.log(regex.exec(content));
	var reg = regex.exec(content);
	if (reg === null || typeof(reg[1]) === undefined)
		return null;
	var image = reg[1].substring(1, reg[1].length-1);
	return image;
};
module.exports.extractImageFromContent = extractImageFromContent;