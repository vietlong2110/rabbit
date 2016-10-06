angular.module('starter.services', [])
 
.service('AuthService', function($q, $http, $rootScope, $cordovaOauth, API_ENDPOINT, FB) {
	var LOCAL_TOKEN_KEY = 'yourTokenKey';
	var isAuthenticated = false;
	var authToken;
	var intervalUpdate;

	function update() {
		intervalUpdate = setInterval(function() {
	        $http.post(API_ENDPOINT.api + '/updatefeed').success(function(data) {
	            console.log(data.success);
	        });
	    }, 60 * 15 * 1000);
	}

	function stopUpdate() {
		clearInterval(intervalUpdate);
	}

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
		fblogin: function() {
			return $q(function(resolve, reject) {
				$cordovaOauth.facebook(FB.AppID, ['email', 'public_profile'], 
				{redirect_uri: 'http://localhost/callback'}).then(function(result) {
					if (result.access_token) {
						$http.post(API_ENDPOINT.url + '/fblogin', {token: result.access_token})
						.then(function(res) {
							if (res.data.success) {
								storeUserCredentials(res.data.token);
								resolve(res.data.message);
								// resolve(result.access_token);
							}
							else reject(res.data.message);
						});
					}
					else reject('Facebook Login Error!');
				}, function(err) {
					console.log(err);
				});
			});
		},
		login: function(user) {
			return $q(function(resolve, reject) {
				$http.post(API_ENDPOINT.url + '/login', user).then(function(result) {
					if (result.data.success) {
						storeUserCredentials(result.data.token);
						update();
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
		logout: function(callback) {
			stopUpdate();
			destroyUserCredentials();
			callback();
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

.factory('apiServices', function($http, $ionicLoading, $ionicPopup, $timeout, $rootScope, API_ENDPOINT) {
	var getNewsFeedAPI = API_ENDPOINT.api + '/getnewsfeed';

	var getMediaFeedAPI = API_ENDPOINT.api + '/getmediafeed';

	var searchAPI = API_ENDPOINT.api + '/search';

	var suggestAPI = API_ENDPOINT.api + '/suggest';

	var followAPI = API_ENDPOINT.api + '/follow';

	var getListAPI = API_ENDPOINT.api + '/getlist';

	var unfollowAPI = API_ENDPOINT.api + '/unfollow';

	var updateListAPI = API_ENDPOINT.api + '/updatelist';

	var getNewsByKeywordAPI = API_ENDPOINT.api + '/getnewsbykeyword';

	var getMediaByKeywordAPI = API_ENDPOINT.api + '/getmediabykeyword';

	var updateNewsFavoriteAPI = API_ENDPOINT.api + '/updatenewsfavorite';

	var getNewsFavoriteAPI = API_ENDPOINT.api + '/getnewsfavorite';

	var updateMediaFavoriteAPI = API_ENDPOINT.api + '/updatemediafavorite';

	var getMediaFavoriteAPI = API_ENDPOINT.api + '/getmediafavorite';

	var getSuggestionAPI = API_ENDPOINT.api + '/getsuggestion';

	return {
		getNewsFeed: function(size, callback) {
			$http.get(getNewsFeedAPI, {
				params: {
					size: size
				}
			}).success(function(data) {
				$rootScope.news = data.news; // newsfeed
                $rootScope.moreDataNews = data.moreDataNews;
                callback();
			});
		},
		getMediaFeed: function(size, callback) {
			$http.get(getMediaFeedAPI, {
				params: {
					size: size
				}
			}).success(function(data) {
				$rootScope.media = data.media; // newsfeed
                $rootScope.moreDataMedia = data.moreDataMedia;
                callback();
			});
		},
		getNewsByKeyword: function(value, size, callback) {
			$http.get(getNewsByKeywordAPI, {
				params: {
					q: value,
					size: size
				}
			}).success(function(data) {
				$rootScope.titleNews = data.titleNews;

				$rootScope.followingNews = data.news;
                $rootScope.moreDataFollowing = data.moreDataNews;

                callback();
			});
		},
		getMediaByKeyword: function(value, size, callback) {
			$http.get(getMediaByKeywordAPI, {
				params: {
					q: value,
					size: size
				}
			}).success(function(data) {
				$rootScope.titleNews = data.titleNews;

                $rootScope.followingMedia = data.media;
                $rootScope.moreDataFollowingMedia = data.moreDataMedia;

                callback();
			});
		},
		getSuggestion: function() {
			$http.get(getSuggestionAPI).success(function(data) {
				$rootScope.suggestKeywords = data.likes;
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
		search: function(value, sizenews, sizemedia, callback) {
			$http.get(searchAPI, {
	            params: {
	                q: value,
	                sizenews: sizenews,
	                sizemedia: sizemedia
	            }
	        }).success(function(data) {
	        	// $ionicLoading.hide();
	        	$rootScope.keywordSearch = data.keywordSearch;
	            $rootScope.queryTitle = data.queryTitle;

	        	$rootScope.searchResult = data.newsFeedResult;
	            $rootScope.moreDataSearch = data.moreDataNews;

	            $rootScope.searchMediaResult = data.mediaFeedResult;
	            $rootScope.moreDataMediaSearch = data.moreDataMedia;
	            callback();
	        });
		},
		suggest: function(value) {
			$http.get(suggestAPI, {
				params: {
					q: value
				}
			}).success(function(data) {
				$rootScope.suggestList = data.suggestList;
			})
		},
		follow: function(value, keyword) {
			$ionicLoading.show({
				templateUrl: 'templates/spinner/unfollowspinner.html'
			});
			$http.post(followAPI, {
                q: value
            }).success(function(data) {
            	// if (data.success) {
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
	            // }
            });
		},
		unfollow: function(value) {
			$ionicLoading.show({
				templateUrl: 'templates/spinner/unfollowspinner.html'
			});
			$http.post(unfollowAPI, {
                q: value
            }).success(function(data) {
            	// if (data.success) {
            		$ionicLoading.hide();
            		$rootScope.keywords = data.keywords;        
	                $rootScope.listCount = data.keywords.length;

	                $rootScope.news = data.news;
	                $rootScope.moreDataNews = data.moreDataNews;

	                $rootScope.media = data.media;
	                $rootScope.moreDataMedia = data.moreDataMedia;
            	// }
            });
		},
		updateNewsFavorite: function(id, callback) {
			$http.post(updateNewsFavoriteAPI, {
				id: id
			}).success(function(data) {
				if (data.updated)
					callback();
			});
		},
		getNewsFavorite: function(size, callback) {
			$http.get(getNewsFavoriteAPI, {
				params: {
					size: size
				}
			}).success(function(data) {
				$rootScope.favoriteNews = data.news;
                $rootScope.moreDataFavorite = data.moreDataNews;

                callback();		
			})
		},
		updateMediaFavorite: function(id, callback) {
			$http.post(updateMediaFavoriteAPI, {
				id: id
			}).success(function(data) {
				if (data.updated)
					callback();
			});
		},
		getMediaFavorite: function(size, callback) {
			$http.get(getMediaFavoriteAPI, {
				params: {
					size: size
				}
			}).success(function(data) {
                $rootScope.favoriteMedia = data.media;
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
	        else if ($rootScope.currentNewsfeedState === 'Discover') 
	        	$state.go('tabs.discover');
	        else { 
	            if ($rootScope.currentTab === 'News')
	                $state.go('tabs.news');
	            else $state.go('tabs.social');
	        }
		}
	};
});