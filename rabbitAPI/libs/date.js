var Today = function(publishedDate) {
	var today = new Date();
	if (publishedDate.getDate() === today.getDate() 
	&& publishedDate.getMonth() === today.getMonth()
	&& publishedDate.getFullYear() === today.getFullYear())
		return true;
	else return false;
};
module.exports.Today = Today;

var Yesterday = function(publishedDate) {
	var today = new Date();
	today.setDate(today.getDate() - 1);
	var yesterday = new Date(today);
	if (publishedDate.getDate() === yesterday.getDate() && publishedDate.getMonth() === yesterday.getMonth()
	&& publishedDate.getFullYear() === yesterday.getFullYear())
		return true;
	else return false;
};
module.exports.Yesterday = Yesterday;

var dateAbbr = function(publishedDate) {
	var today = new Date();
	var year = today.getFullYear();
	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	if (year === publishedDate.getFullYear())
		return months[publishedDate.getMonth()] + ' ' + publishedDate.getDate();
	else return months[publishedDate.getMonth()] + ' ' + publishedDate.getDate() + ',' 
	+ publishedDate.getFullYear();
};
module.exports.dateAbbr = dateAbbr;