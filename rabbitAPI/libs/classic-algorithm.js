var binarySearchRange = function (keyword, keywordsArr, callback) {
	var l = 0, r = keywordsArr.length-1;
	var lowerBound, upperBound;

	while (l <= r) {
		var m = l + ((r - l) >> 1);

		if (keywordsArr[m].word >= keyword)
			r = m - 1;
		else l = m + 1;
	}
	if (keyword.length <= keywordsArr[r + 1].word.length && 
	keyword === keywordsArr[r + 1].word.substring(0, keyword.length)) {
		lowerBound = r + 1;
		l = 0; r = keywordsArr.length-1;
		while (l <= r) {
			var m = l + Math.floor((r - l) / 2);

			if (keywordsArr[m].word <= keyword || (keyword.length <= keywordsArr[m].word.length && 
			keyword === keywordsArr[m].word.substring(0, keyword.length)))
				l = m + 1;
			else r = m - 1;
		}
		upperBound = l - 1;
		callback(null, lowerBound, upperBound);
	}
	else callback(true, null, null);
};
module.exports.binarySearchRange = binarySearchRange;

var initializeSegmentTree = function(array) {
	var segmentTree = [];
	for (i = 0; i < array.length * 5; i++)
		segmentTree[i] = {
			weight: 0, 
			index: 0
		};

	function initialize(index, l, r) {
		if (l === r)
			return segmentTree[index] = {
				weight: array[l].weight,
				index: l
			};

		var mid = (l + r) >> 1;
		var left = initialize(index * 2, l, mid);
		var right = initialize(index * 2 + 1, mid + 1, r);

		if (left.weight > right.weight)
			return segmentTree[index] = left;
		else return segmentTree[index] = right;
	}

	initialize(1, 0, array.length-1);
	return segmentTree;
};
module.exports.initializeSegmentTree = initializeSegmentTree;

var segmentTreeQuery = function(segmentTree, keywords, lowerBound, upperBound, callback) {
	function queryMax(indexTree, l, r) {
		if (l > upperBound || r < lowerBound)
			return {weight: -1};
		if (l >= lowerBound && r <= upperBound)
			return segmentTree[indexTree];

		var m = (l + r) >> 1;
		var left = queryMax(indexTree * 2, l, m);
		var right = queryMax(indexTree * 2 + 1, m + 1, r);

		if (left.weight > right.weight)
			return left;
		else return right;
	}

	var maxNode = queryMax(1, 0, keywords.length-1);
	callback(maxNode.index);
};
module.exports.segmentTreeQuery = segmentTreeQuery;

var mergeArray = function(a, b) {
	var i = 0, j = 0;
	var result = [];

	while (i < a.length && j < b.length) {
		if (a[i].publishedDate < b[j].publishedDate) {
			result.push(a[i]);
			i++;
		}
		else {
			result.push(b[j]);
			j++;
		}
	}
	if (i === a.length)
		result = result.concat(b.slice(j, b.length));
	else result = result.concat(a.slice(i, a.length));
	return result;
};
module.exports.mergeArray = mergeArray;