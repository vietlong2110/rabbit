var fetch = function (url, callback) {
	var request = require('request');
	request(url, {timeout: 10000}, function (err, res, body) {
		if (!err && res.statusCode == 200) {
			var content = {body: body, rss: false};
			if (body.match(/(<rss|<feed)/))
				content.rss = true;
			callback(content);
		}
		else callback(null);
	});
};
module.exports.fetch = fetch;

var parseLinks = function (body, u, urlSets) { //parse all the links from the extracted content
	var links = [];
	var checkedURLs = [];//check dupliate link
	//regex for <a href...
	var reg = /href\s*=\s*[\\\'\"]?([+:%\/\?~=&;\\\(\),._a-zA-Z0-9-]*)(#[.a-zA-Z0-9-]*)?[\\\'\" ]?(\s*rel\s*=\s*[\'\"]?(nofollow)[\'\"]?)?/ig;
	var arr = [];
	while ((arr = reg.exec(body)) !== null) {
		if (arr[4] === undefined) { //if nofollow not exist
			var url = urlFilter(arr[1], u);
			if (urlSets.indexOf(url) === -1 && url !== '' && url.match(/(rss|feed)/) && checkedURLs[url] === undefined) {
				links.push(url);
				checkedURLs[url] = 1;
			}
		}
	}
	return links;
};
module.exports.parseLinks = parseLinks;

var parser = function (url) { //parse_url
	var u = require('url');
	return u.parse(url);
}
module.exports.parser = parser;

var urlFilter = function (url, parent_url) { //create adaptable link to crawl
	var pu = parser(url), pp = parser(parent_url);
	// console.log(url);
	/*if (pu.hostname !== null && pu.hostname != pp.hostname) { //do not follow url exceed the site
		// console.log('Diffent hostname');
		return '';
	}*/

	if (pu.query !== null) { //do not follow url with query
		// console.log('Query links');
		return '';	
	}

	if (url.match(/[\/]?mailto:|[\/]?javascript:|[\/]?news:/i)) { //eliminate email,js... link 
		// console.log('Mail links');
		return '';
	}

	var protocol = "";
	if (pu.protocol !== null)
		protocol = pu.protocol;
	if (!(protocol == 'http:' || protocol == 'https:' || protocol == '')) { //only follow http and https links
		// console.log('Not http or https');
		return '';
	}

	if (url.substr(0, 2) === "//") {
		url = pp.protocol + url;
		pu = parser(url);
		if (pu.hostname !== null && pu.hostname !== pp.hostname)
			return '';
	}
	else if (url.substr(0, 1) === "/") {
		// console.log(url);
		// console.log('Relative links /');
		url = pp.protocol + "//" + pp.hostname + url;
	}
	else if (pu.protocol === null) {
		// console.log(url);
		// console.log('Relative links');
		url = parent_url + url;
	}
	return url;
};
module.exports.urlFilter = urlFilter;