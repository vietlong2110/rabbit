angular.module('starter.services', [])

.factory('apiServices', function($http, $ionicLoading, $ionicPopup, $timeout) {
	var domain = 'http://localhost:8080/clientapi';

	var getFeedAPI = domain + '/getfeed';

	var searchAPI = domain + '/search';

	var followAPI = domain + '/follow';

	var getListAPI = domain + '/getlist';

	var unfollowAPI = domain + '/unfollow';

	var updateListAPI = domain + '/updatelist';

	var getFeedByKeywordAPI = domain + '/getfeedbykeyword';

	var updateFavoriteAPI = domain + '/updatefavorite';

	var getFavoriteAPI = domain + '/getfavorite';

	return {
		getFeed: function(value, callback) {
			$ionicLoading.show({
				templateUrl: 'templates/loadingspinner.html',
				noBackdrop: true
			});
			$timeout(function() {
				$ionicLoading.hide();
			}, 5000);
			$http.get(getFeedAPI, {
				params: {
					size: value
				}
			}).success(function(data) {
				$ionicLoading.hide();
				callback(data);
			});
		},
		getFeedByKeyword: function(value, size, callback) {
			$ionicLoading.show({
				templateUrl: 'templates/loadingspinner.html',
				noBackdrop: true
			});
			$timeout(function() {
				$ionicLoading.hide();
			}, 5000);
			$http.get(getFeedByKeywordAPI, {
				params: {
					q: value,
					size: size
				}
			}).success(function(data) {
				$ionicLoading.hide();
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
			$ionicLoading.show({
				templateUrl: 'templates/loadingspinner.html',
				noBackdrop: true
			});
			$timeout(function() {
				$ionicLoading.hide();
			}, 5000);
			$http.get(searchAPI, {
	            params: {
	                q: value
	            }
	        }).success(function(data) {
	        	$ionicLoading.hide();
	        	callback(data);
	        });
		},
		follow: function(value, keyword, callback) {
			$ionicLoading.show({
				templateUrl: 'templates/unfollowspinner.html'
			});
			$http.post(followAPI, {
                q: value
            }).success(function(data) {
            	$ionicLoading.hide();
            	var popup = $ionicPopup.alert({
            		title: 'You have followed "' + keyword + '"',
            		buttons: []
            	});
            	$timeout(function() {
            		popup.close();
            	}, 2000);
            	callback(data);
            });
		},
		unfollow: function(value, callback) {
			$ionicLoading.show({
				templateUrl: 'templates/unfollowspinner.html'
			});
			$http.post(unfollowAPI, {
                keyword: value
            }).success(function(data) {
            	$ionicLoading.hide();
            	callback(data);
            });
		},
		updateFavorite: function(id, callback) {
			$http.post(updateFavoriteAPI, {
				id: id
			}).success(function(data) {
				if (data.updated)
					callback();
			});
		},
		getFavorite: function(callback) {
			$http.get(getFavoriteAPI).success(function(data) {
				callback(data);
			})
		}
	};
});