/************************************************************************
*		This controller includes all functions relating to extraction	*
************************************************************************/

var Boilerpipe = require('boilerpipe');
var request = require('request');

var extractContent = function(url, callback) { //extract content of an article url
	request(url, function(err, res, html) {
		if (!err && res.statusCode === 200) {
			var boilerpipe = new Boilerpipe({
				extractor: Boilerpipe.Extractor.Article,
				html: html
		 	});

		 	boilerpipe.getText(function(err, content) {
		 		if (err)
		 			callback(err);
		 		extractKeyword(content, function(originKeywordSet, keywordSet, tf) {
		 			callback(originKeywordSet, keywordSet, tf);
		 		});
		 	});
		}
	});
};
module.exports.extractContent = extractContent;

var extractKeyword = function(content, callback) { //extract keyword from a content
	var stringFuncs = require('../libs/stringfunctions.js');

	//convert content to a list of keyword
	stringFuncs.contentToKeywords(content, function(keywords, originKeywords) {
		var keywordSet = []; //filter repeating keyword list to a set of keyword(non-repeat)
		var originKeywordSet = [];
		var tf = [];

		for (i in keywords)
			if (keywordSet.indexOf(keywords[i]) === -1) {
				keywordSet.push(keywords[i]);
				tf.push(1);
			}
			else tf[keywordSet.indexOf(keywords[i])]++;

		for (i in originKeywords)
			if (originKeywordSet.indexOf(originKeywords) === -1)
				originKeywordSet.push(originKeywords[i]);
		callback(originKeywordSet, keywordSet, tf);
	});
};
module.exports.extractKeyword = extractKeyword;

var extractImage = function(url, callback) { //extract thumbnail of an article url
	request(url, function(err, res, html) {
		if (!err && res.statusCode === 200) {
			var boilerpipe = new Boilerpipe({
				extractor: Boilerpipe.Extractor.Article,
				html: html
		 	});
			boilerpipe.getImages(function(err, images) {
				if (images.length > 0)
					callback(images[0].src);
				else callback(extractImageFromContent(html));
			});
		}
	});
};
module.exports.extractImage = extractImage;

var extractImageFromContent = function(content) {
	// console.log(content);
	var regex = /<img[^>]+src\s*=\s*['"]([^'"]+)['"][^>]*>/g;
	var image = regex.exec(content)[1];
	return image;
};
module.exports.extractImageFromContent = extractImageFromContent;