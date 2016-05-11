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