angular.module('starter.services', [])
 
.service('AuthService', function($q, $http, $rootScope, API_ENDPOINT) {
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

		$rootScope.news = undefined;
		$rootScope.keywords = undefined;

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

.factory('apiServices', function($http, $ionicLoading, $ionicPopup, $timeout, $rootScope) {
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
		getFeed: function(sizenews, sizemedia, callback) {
			$ionicLoading.show({
				templateUrl: 'templates/spinner/loadingspinner.html',
				noBackdrop: true
			});
			$timeout(function() {
				$ionicLoading.hide();
			}, 5000);

			$http.get(getFeedAPI, {
				params: {
					sizenews: sizenews,
					sizemedia: sizemedia
				}
			}).success(function(data) {
				$ionicLoading.hide();

				$rootScope.news = data.news; // newsfeed
                $rootScope.moreDataNews = data.moreDataNews;

                $rootScope.media = data.media;
                $rootScope.moreDataMedia = data.moreDataMedia;

                callback();
			});
		},
		getFeedByKeyword: function(value, sizenews, sizemedia, callback) {
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
					sizenews: sizenews,
					sizemedia: sizemedia
				}
			}).success(function(data) {
				$ionicLoading.hide();

				$rootScope.titleNews = data.titleNews;

				$rootScope.followingNews = data.news;
                $rootScope.moreDataFollowing = data.moreDataNews;

                $rootScope.followingMedia = data.media;
                $rootScope.moreDataFollowingMedia = data.moreDataMedia;

                callback();
			});
		},
		getList: function() {
			$http.get(getListAPI).success(function(data) {
            	$rootScope.keywords = data.keywords;
        		$rootScope.listCount = data.keywords.length;
			});
		},
		updateList: function(value, callback) {
			$http.post(updateListAPI, {
                keywords: value
            }).success(function(data) {
            	$rootScope.news = data.news;
	            $rootScope.moreDataNews = data.moreDataNews;

	            $rootScope.media = data.media;
                $rootScope.moreDataMedia = data.moreDataMedia;

	            callback();
            });
		},
		search: function(value, sizenews, sizemedia) {
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
	                sizenews: sizenews,
	                sizemedia: sizemedia
	            }
	        }).success(function(data) {
	        	$ionicLoading.hide();
	        	$rootScope.keywordSearch = data.keywordSearch;
	            $rootScope.queryTitle = data.queryTitle;

	        	$rootScope.searchResult = data.newsFeedResult;
	            $rootScope.moreDataSearch = data.moreDataNews;

	            $rootScope.searchMediaResult = data.mediaFeedResult;
	            $rootScope.moreDataMediaSearch = data.moreDataMedia;
	        });
		},
		follow: function(value, keyword) {
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

                $rootScope.keywords = data.keywords;        
                $rootScope.listCount = data.keywords.length;

                $rootScope.news = data.news;
                $rootScope.moreDataNews = data.moreDataNews;

                $rootScope.media = data.media;
                $rootScope.moreDataMedia = data.moreDataMedia;
            });
		},
		unfollow: function(value) {
			$ionicLoading.show({
				templateUrl: 'templates/spinner/unfollowspinner.html'
			});
			$http.post(unfollowAPI, {
                keyword: value
            }).success(function(data) {
            	$ionicLoading.hide();

            	$rootScope.keywords = data.keywords;        
                $rootScope.listCount = data.keywords.length;

                $rootScope.news = data.news;
                $rootScope.moreDataNews = data.moreDataNews;

                $rootScope.media = data.media;
                $rootScope.moreDataMedia = data.moreDataMedia;
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
		getFavorite: function(sizenews, sizemedia, callback) {
			$http.get(getFavoriteAPI, {
				params: {
					sizenews: sizenews,
					sizemedia: sizemedia
				}
			}).success(function(data) {
				$rootScope.favoriteNews = data.favoriteNews;
                $rootScope.moreDataFavorite = data.moreDataNews;

                $rootScope.favoriteMedia = data.favoriteMedia;
                $rootScope.moreDataMediaFavorite = data.moreDataMedia;

                callback();		
			})
		}
	};
})

.factory('navServices', function($rootScope, $state) {
	return {
		nav: function() {
			if ($rootScope.currentNewsfeedState === 'Newsfeed') {
	            if ($rootScope.currentTab === 'News')
	                $state.go('tabs.news');
	            else $state.go('tabs.social');
	        }
	        else if ($rootScope.currentNewsfeedState === 'Favorites') {
	            if ($rootScope.currentTab === 'News')
	                $state.go('tabs.favorites');
	            else $state.go('tabs.socialfavorites');
	        }
	        else if ($rootScope.currentNewsfeedState === 'Following') {
	            if ($rootScope.currentTab === 'News')
	                $state.go('tabs.followinglist');
	            else $state.go('tabs.socialfollowinglist');
	        }
	        else { 
	            if ($rootScope.currentTab === 'News')
	                $state.go('tabs.news');
	            else $state.go('tabs.social');
	        }
		}
	};
});