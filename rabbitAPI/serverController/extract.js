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
		 		extractKeyword(content, function(keywordSet, tf) {
		 			callback(keywordSet, tf);
		 		});
		 	});
		}
	});
};
module.exports.extractContent = extractContent;

var extractKeyword = function(content, callback) { //extract keyword from a content
	var stringFuncs = require('../libs/stringfunctions.js');
	stringFuncs.contentToKeywords(content, function(keywords) { //convert content to a list of keyword
		var keywordSet = []; //filter repeating keyword list to a set of keyword(non-repeat)
		var tf = [];
		for (i in keywords)
			if (keywordSet.indexOf(keywords[i]) === -1) {
				keywordSet.push(keywords[i]);
				tf.push(1);
			}
			else tf[keywordSet.indexOf(keywords[i])]++;
		callback(keywordSet, tf);
	});
};
module.exports.extractKeyword = extractKeyword;

var extractImage = function(url, callback) { //extract thumbnail of an article url
	request(url, function(err, res, html) {
		if (!err && res.statusCode === 200) {
			console.log(html);
			var boilerpipe = new Boilerpipe({
				extractor: Boilerpipe.Extractor.Article,
				html: html
		 	});
			boilerpipe.getImages(function(err, images) {
				// console.log(images);
				if (images.length > 0)
					callback(images[0].src);
				else callback();
			});
		}
	});
};
module.exports.extractImage = extractImage;

var extractImageFromContent = function(content, callback) {
	// console.log(content);
	var regex = /<img[^>]+src\s*=\s*['"]([^'"]+)['"][^>]*>/g;
	var image = regex.exec(content)[1];
	if (image.substr(image.length-4, 4) === ".gif")
		image = image.replace("a.gif", ".jpg");
	callback(image);
};
module.exports.extractImageFromContent = extractImageFromContent;