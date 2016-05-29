angular.module('starter.services', [])

.factory('apiServices', function($http) {
	var domain = 'http://localhost:8080/clientapi';

	var getFeedAPI = domain + '/getfeed';

	var searchAPI = domain + '/search';

	var followAPI = domain + '/follow';

	var getListAPI = domain + '/getlist';

	var unfollowAPI = domain + '/unfollow';

	var updateListAPI = domain + '/updatelist';


	return {
		getFeed: function(callback) {
			$http.get(getFeedAPI).success(function(data) {
				callback(data);
			});
		},
		getList: function(callback) {
			$http.get(getListAPI).success(function(data) {
				callback(data);
			});
		},
		updateList: function(value, callback) {
			$http.post(updateListAPI, {
                keywords: value
            }).success(function(data) {
            	callback(data);
            });
		},
		search: function(value, callback) {
			$http.get(searchAPI, {
	            params: {
	                q: value
	            }
	        }).success(function(data) {
	        	callback(data);
	        });
		},
		follow: function(value, callback) {
			$http.post(followAPI, {
                q: value
            }).success(function(data) {
            	callback(data);
            });
		},
		unfollow: function(value, callback) {
			$http.post(unfollowAPI, {
                keyword: value
            }).success(function(data) {
            	callback(data);
            });
		}
	};
});