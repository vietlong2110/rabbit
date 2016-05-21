/************************************************************************************
*		This library include all functions relating to filter query, keyword...		*
*************************************************************************************/

//Create an array of word from a query
var queryArr = function(query) {
	var wordList = [];

	for (i in query) {
		var found = false;
		for (j in wordList)
			if (query[i] === wordList[j].word) {
				wordList[j].num++;
				found = true;
				break;
			}
		if (!found)
			wordList.push({
				word: query[i], 
				num: 1 //word frequency
			});
	}
	return wordList;
};
module.exports.queryArr = queryArr;

//Sanitize a query
var querySanitize = function(query) {
	var stringFuncs = require('./stringfunctions.js');

	query = stringFuncs.preProcess(query); //need to update when use for hashtag

	var maxLength = 1000;

	if (query.length > maxLength) //max length
		query = query.substring(0, 999);
	return query;
};
module.exports.querySanitize = querySanitize;

//Convert keyword to a hashtag
var keywordToHashtag = function(keyword) {
	keyword = '#' + keyword.replace(/\s/g,'');
	return keyword;
};
module.exports.keywordToHashtag = keywordToHashtag;

//Convert a string to a nice title
var niceTitle = function(string) {
	string = string.toLowerCase();
	string = string.charAt(0).toUpperCase() + string.slice(1); //Capitalize the first letter
	return string;
};
module.exports.niceTitle = niceTitle;