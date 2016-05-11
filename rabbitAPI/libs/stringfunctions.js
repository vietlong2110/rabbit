var preProcess = function(content) {
    content = content.replace(/[\n\r]+/g,' '); //remove newline character
    content = content.replace(/[\*\^\+\?\\\.\[\]\^\$\|\{\)\(\}\'\"\-~!\/@#£$%&=`´“”‘’;><:,]+/g,''); //remove unnecssary character
    content = content.replace(/\s\s+/g,' ');
    content = content.trim();
    return content;
};
module.exports.preProcess = preProcess;

var wordTokenize = function(content) {
    var natural = require('natural');
    tokenizer = new natural.WordTokenizer();
    var wordList = tokenizer.tokenize(content);
    for (i in wordList)
    	wordList[i] = wordList[i].toLowerCase();
    return wordList;
};
module.exports.wordTokenize = wordTokenize;

var removeStopWords = function(wordList, callback) {
	var fs = require('fs');
	fs.readFile('./libs/stopwords.txt', function(err, stopwords) {
		if (err)
			throw err;
		// stopwords = stopwords.split("\n");
		var Words = [];
		for (i in wordList)
			if (stopwords.indexOf(wordList[i]) === -1)
				Words.push(wordList[i]);
		callback(Words);
	});
};
module.exports.removeStopWords = removeStopWords;

var stem = function(word) {
    var stemmer = require('porter-stemmer').stemmer;
    return stemmer(word);
};
module.exports.stem = stem;

var stemArr = function(keywords) {
    for (i in keywords)
        keywords[i] = stem(keywords[i]);
    return keywords;
};
module.exports.stemArr = stemArr;

var contentToKeywords = function(content, callback) {
	content = preProcess(content);
	content = wordTokenize(content);
	removeStopWords(content, function(keywords) {
		keywords = stemArr(keywords);
		callback(keywords);
	});
};
module.exports.contentToKeywords = contentToKeywords;