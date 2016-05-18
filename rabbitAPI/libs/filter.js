var queryFilter = function(query) {
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
			wordList.push({word: query[i], num: 1});
	}
	return wordList;
};
module.exports.queryFilter = queryFilter;

var querySanitize = function(query) {
	var stringFuncs = require('./stringfunctions.js');
	query = stringFuncs.preProcess(query);
	if (query.length > 1000) //max length
		query = query.substring(0, 999);
	return query;
};
module.exports.querySanitize = querySanitize;