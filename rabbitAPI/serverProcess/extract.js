var Boilerpipe = require('boilerpipe');

var extractContent = function(url, callback) { //extract content of an article url
	var boilerpipe = new Boilerpipe({
		extractor: Boilerpipe.Extractor.Article,
		url: url
 	});
 	boilerpipe.getText(function(err, content) {
 		if (err)
 			callback(err);
 		extractKeyword(content, function(keywordSet) {
 			callback(keywordSet);
 		});
 	});
};
module.exports.extractContent = extractContent;

var extractKeyword = function(content, callback) { //extract keyword from a content
	var stringFuncs = require('../libs/stringfunctions.js');
	stringFuncs.contentToKeywords(content, function(keywords) { //convert content to a list of keyword
		var keywordSet = []; //filter repeating keyword list to a set of keyword(non-repeat)
		for (i in keywords) {
			var found = false;
			for (j in keywordSet) 
				if (keywordSet[j].word === keywords[i]) {
					keywordSet[j].num++;
					found = true;
					break;
				}
			if (!found)
				keywordSet.push({
					word: keywords[i], 
					num: 1
				});
		}
		callback(keywordSet);
	});
};
module.exports.extractKeyword = extractKeyword;

// var extractImage = function(url, callback) {

// };
// module.exports.extractImage = extractImage;