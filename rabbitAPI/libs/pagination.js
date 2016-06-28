var paginate = function(feed, querySize, callback) {
	var offset = (feed.length < 8) ? feed.length : 8;
	var size = 5;
	var moreData = true;

	if (querySize === 0) {
		if (feed.length === offset)
			moreData = false;
		feed = feed.slice(0, offset);
	}
	else if (querySize + size < feed.length)
		feed = feed.slice(0, querySize + size);
	else if (querySize <= feed.length) {
		feed = feed.slice(0, feed.length);
		moreData = false;
	}
	else {
		feed = [];
		moreData = false;
	}
	callback(feed, moreData);
};
module.exports.paginate = paginate;