var Boilerpipe = require('boilerpipe');

var extractContent = function(url, callback) { //extract content of an article url
	var boilerpipe = new Boilerpipe({
		extractor: Boilerpipe.Extractor.Article,
		url: url
 	});
 	boilerpipe.getText(function(err, content) {
 		if (err)
 			callback(err);
 		extractKeyword(content, function(keywordSet, tf) {
 			callback(keywordSet, tf);
 		});
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
	var boilerpipe = new Boilerpipe({
		extractor: Boilerpipe.Extractor.Article,
		url: url
 	});
	boilerpipe.getImages(function(err, images) {
		if (images.length > 0)
			callback(images[0].src);
		else callback();
	});
};
module.exports.extractImage = extractImage;