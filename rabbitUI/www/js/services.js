angular.module('starter.services', [])
 
.service('AuthService', function($q, $http, API_ENDPOINT) {
	var LOCAL_TOKEN_KEY = 'yourTokenKey';
	var isAuthenticated = false;
	var authToken;

	function loadUserCredentials() {
		var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
		if (token)
			useCredentials(token);
	}

	function storeUserCredentials(token) {
		window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
		useCredentials(token);
	}

	function useCredentials(token) {
		isAuthenticated = true;
		authToken = token;

		// Set the token as header for your requests!
		$http.defaults.headers.common.Authorization = authToken;
	}

	function destroyUserCredentials() {
		authToken = undefined;
		isAuthenticated = false;
		$http.defaults.headers.common.Authorization = undefined;
		window.localStorage.removeItem(LOCAL_TOKEN_KEY);
	}

	loadUserCredentials();

	return {
		login: function(user) {
			return $q(function(resolve, reject) {
				$http.post(API_ENDPOINT.url + '/login', user).then(function(result) {
					if (result.data.success) {
						storeUserCredentials(result.data.token);
						resolve(result.data.message);
					}
					else reject(result.data.message);
				});
			});
		},
		register: function(user) {
			return $q(function(resolve, reject) {
				$http.post(API_ENDPOINT.url + '/register', user).then(function(result) {
					if (result.data.success)
						resolve(result.data.message);
					else reject(result.data.message);
				});
			});
		},
		logout: function() {
			destroyUserCredentials();
		},
		isAuthenticated: function() {
			return isAuthenticated;
		}
	};
})
 
.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
	return {
		responseError: function (response) {
			$rootScope.$broadcast({
		    	401: AUTH_EVENTS.notAuthenticated,
		  	}[response.status], response);
		  	return $q.reject(response);
		}
	};
})

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
				templateUrl: 'templates/spinner/loadingspinner.html',
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
				templateUrl: 'templates/spinner/loadingspinner.html',
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
		search: function(value, size, callback) {
			$ionicLoading.show({
				templateUrl: 'templates/spinner/loadingspinner.html',
				noBackdrop: true
			});
			$timeout(function() {
				$ionicLoading.hide();
			}, 5000);
			$http.get(searchAPI, {
	            params: {
	                q: value,
	                size: size
	            }
	        }).success(function(data) {
	        	$ionicLoading.hide();
	        	callback(data);
	        });
		},
		follow: function(value, keyword, callback) {
			$ionicLoading.show({
				templateUrl: 'templates/spinner/unfollowspinner.html'
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
				templateUrl: 'templates/spinner/unfollowspinner.html'
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
		getFavorite: function(size, callback) {
			$http.get(getFavoriteAPI, {
				params: {
					size: size
				}
			}).success(function(data) {
				callback(data);
			})
		}
	};
});