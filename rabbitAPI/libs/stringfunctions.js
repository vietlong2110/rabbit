/********************************************************************************
*		This library include all functions relating to string processing		*
*********************************************************************************/
var stemmer = require('porter-stemmer').stemmer;
var natural = require('natural');
var Lemmer = require('lemmer');

//Delete all redundant characters from content
var preProcess = function(content) {
	//remove newline character
    content = content.replace(/[\n\r]+/g,' ');

    //remove unnecssary character
    content = content.replace(/[\*\^\+\?\\\.\[\]\^\$\|\{\)\(\}\'\"\-~!\/@#£$%&=`´“”‘’;><:,]+/g,''); 

    //remove duplicate space
    content = content.replace(/\s\s+/g,' ');

    content = content.trim();
    return content;
};
module.exports.preProcess = preProcess;

//Tokenize words from content
var wordTokenize = function(content) {
    var tokenizer = new natural.WordTokenizer();
    var wordList = tokenizer.tokenize(content);

    for (i in wordList)
    	wordList[i] = wordList[i].toLowerCase();
    return wordList;
};
module.exports.wordTokenize = wordTokenize;

//Remove stop words from a word list
var removeStopWords = function(wordList, callback) {
	var fs = require('fs');

	//stopwords.txt is a list of common words in English that is unnecessary to process
	//due to their effect to the meaning of a context
	fs.readFile('./libs/stopwords.txt', function(err, stopwords) {
		if (err)
			throw err;

		var Words = [];

		for (i in wordList) //push only word that is not in the stopword list
			if (stopwords.indexOf(wordList[i]) === -1)
				Words.push(wordList[i]);
		callback(Words);
	});
};
module.exports.removeStopWords = removeStopWords;

//stem the word
var stem = function(word) {
    return stemmer(word);
};
module.exports.stem = stem;

//stem an array of words
var stemArr = function(keywords) {
    for (i in keywords)
        keywords[i] = stem(keywords[i]);
    return keywords;
};
module.exports.stemArr = stemArr;

var lemma = function(word, callback) {
	Lemmer.lemmatize(word, function(err, result) {
		callback(result);
	});	
};
module.exports.lemma = lemma;

//convert content to keyword that is usable
var contentToKeywords = function(content, callback) {
	content = preProcess(content);
	var keywords = wordTokenize(content);
	// removeStopWords(content, function(keywords) {
	var originKeywords = [];
	for (i = 0; i < keywords.length; i++)
		originKeywords.push(keywords[i]);
	keywords = stemArr(keywords);
	callback(keywords, originKeywords);
	// });
};
module.exports.contentToKeywords = contentToKeywords;

var detectLanguage = function(st) {
	st = preProcess(st);
	return /^[a-zA-Z ]+$/.test(st);
};
module.exports.detectLanguage = detectLanguage;