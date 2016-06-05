angular.module('starter.controller', [])

// Newsfeed Controller
.controller('NewsController', function($rootScope, $scope, apiServices, $state, $http) {
    $rootScope.moreData = false;
    apiServices.getFeed(0, function(data) {
        $rootScope.news = data.news; // newsfeed
        $rootScope.currentNewsState = $rootScope.news[0];
        $rootScope.moreData = data.moreData;
    });

    $scope.onSearch = function() { // enter search part
        $state.go('suggest');
    };

    $scope.doRefresh = function() {
        $http.get('http://localhost:8080/clientapi/getfeed', {
            params: {
                size: 0
            }
        }).success(function(data) {
            $rootScope.news = data.news; // newsfeed
            $rootScope.currentNewsState = $rootScope.news[0];
            $rootScope.moreData = data.moreData;
        }).finally(function() {
            $scope.$broadcast('scroll.refreshComplete');
        });
    };

    $scope.toggleStar = function(e, item) { // add to favorite list
        //prevent overlap effect
        e.preventDefault(); 
        e.stopPropagation();

        apiServices.updateFavorite(item.id, function() {
            item.star = !item.star;
        });
    };

    $scope.loadMore = function() {
        apiServices.getFeed($rootScope.news.length, function(data) {
            $rootScope.news = data.news; // newsfeed
            $rootScope.moreData = data.moreData;
        });
    };

    $scope.assignCurrentNews = function(item) { // save the last link that we read
        $rootScope.currentNewsState = item;
    };
})

// Suggestion/Pre-search Controller
.controller('SuggestController', 
function($rootScope, $scope, apiServices, $state, $ionicHistory, $ionicViewSwitcher) {
    $rootScope.showSearchBar = true;

    $scope.search = function(value) { // search a keyword/hashtag
        $rootScope.value = value; //save the value in order to show when is navigated back
        apiServices.search(value, 0, function(data) {
            $rootScope.searchResult = data.searchResult;
            $rootScope.moreDataSearch = data.moreData;
            $rootScope.keywordSearch = data.keywordSearch;
            $rootScope.queryTitle = data.queryTitle;
            $state.go('search');
        });
    };

    $scope.back = function(value) {
        $rootScope.value = value; //save the value in order to show when is navigated back
        $ionicViewSwitcher.nextDirection('back'); //animation effect
        if ($rootScope.currentNewsfeedState === 'News')
            $state.go('tabs.news');
        else if ($rootScope.currentNewsfeedState === 'Favorites')
            $state.go('tabs.favorites');
        else if ($rootScope.currentNewsfeedState === 'Following')
            $state.go('tabs.followinglist');
        else $state.go('tabs.news');
    };
})

//Search Controller
.controller('SearchController', 
function($rootScope, $scope, $state, apiServices, $ionicHistory, $ionicPopup, $ionicViewSwitcher) {
    var found = false;
    
    for (i in $rootScope.keywords)
        if ($rootScope.keywords[i].keyword === $rootScope.keywordSearch) {
            found = true;
            break;
        }
    $rootScope.followed = found;

    $scope.assignCurrentNews = function(item) {
        $rootScope.currentNewsState = item;
    };

    $scope.back = function() {
        $ionicHistory.backView().go();
    };

    $scope.backHome = function() {
        $ionicViewSwitcher.nextDirection('forward');
        if ($rootScope.currentNewsfeedState === 'News')
            $state.go('tabs.news');
        else if ($rootScope.currentNewsfeedState === 'Favorites')
            $state.go('tabs.favorites');
        else if ($rootScope.currentNewsfeedState === 'Following')
            $state.go('tabs.followinglist');
        else $state.go('tabs.news');
    };

    $scope.loadMore = function() {
        apiServices.search($rootScope.keywordSearch, $rootScope.searchResult.length, function(data) {
            $rootScope.searchResult = data.searchResult;
            $rootScope.moreDataSearch = data.moreData;
        });
    };

    $scope.follow = function() {
        if (!$rootScope.followed) {
            $rootScope.keywords.push({
                keyword: $rootScope.keywordSearch,
                isChecked: true
            });
            $rootScope.listCount++;
            apiServices.follow($rootScope.keywordSearch, $rootScope.queryTitle, function(data) {
                $rootScope.followed = true;
                $rootScope.keywords = data.keywords;        
                $rootScope.listCount = data.keywords.length;
                $rootScope.news = data.news;
            });
        }
    };

    $scope.unfollow = function() {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Are you sure you want to unfollow everything relating to "' 
            + $rootScope.queryTitle + '"?',
            scope: $scope,
            okText: 'Unfollow'
        });

        confirmPopup.then(function(res) {
            if (res) {
                apiServices.unfollow($rootScope.keywordSearch, function(data) {
                    $rootScope.followed = false;
                    $rootScope.keywords = data.keywords;        
                    $rootScope.listCount = data.keywords.length;
                    $rootScope.news = data.news;
                })
            }
        });
    };
})

//Reading iframe Controller
.controller('ReadingController', function($rootScope, $scope, $sce) {
	$scope.url = $rootScope.currentNewsState.url;
	$scope.highlight = $rootScope.currentNewsState.star;

	$scope.trustSrc = function(src) {
		return $sce.trustAsResourceUrl(src);
	};

	$scope.toggleStar = function() {
		
	};
})

//Favorite links Controller
.controller('FavoritesController', function($rootScope, $scope, $state, $ionicPopup, apiServices) {
    $scope.onSearch = function() {
        $state.go('suggest');
    };

	$scope.deleteItem = function(e, item) {
        e.preventDefault();
        e.stopPropagation();
        var confirmPopup = $ionicPopup.confirm({
            title: 'Are you sure you want to remove this link from your favorite list?',
            scope: $scope,
            okText: 'Remove'
        });

        confirmPopup.then(function(res) {
            if (res) {
                apiServices.updateFavorite(item.id, function() {
                    apiServices.getFavorite($rootScope.favoriteNews.length, function(data) {
                        $rootScope.favoriteNews = data.favoriteNews;
                        $rootScope.moreDataFavorite = data.moreData;
                    });
                    $state.go('tabs.favorites');
                });    
            }
        });
	};

    $scope.loadMore = function() {
        apiServices.getFavorite($rootScope.favoriteNews.length, function(data) {
            $rootScope.favoriteNews = data.favoriteNews;
            $rootScope.moreDataFavorite = data.moreData;
        });
    };

	$scope.assignCurrentNews = function(item) {
    	$rootScope.currentNewsState = item;
    };
})

.controller('FollowingListController', function($rootScope, $scope, $state, $http, apiServices) {
    $scope.onSearch = function() { // enter search part
        $state.go('suggest');
    };

    $scope.toggleStar = function(e, item) { // add to favorite list
        //prevent overlap effect
        e.preventDefault(); 
        e.stopPropagation();

        apiServices.updateFavorite(item.id, function() {
            item.star = !item.star;
        });
    };

    $scope.doRefresh = function() {
        $http.get('http://localhost:8080/clientapi/getfeedbykeyword', {
            params: {
                q: $rootScope.followingKeyword,
                size: 0
            }
        }).success(function(data) {
            $rootScope.followingNews = data.news; // newsfeed
            $rootScope.moreDataFollowing = data.moreData;
        }).finally(function() {
            $scope.$broadcast('scroll.refreshComplete');
        });
    };

    $scope.loadMore = function() {
        console.log('In here!');
        apiServices.getFeedByKeyword(
        $rootScope.followingKeyword, $rootScope.followingNews.length, function(data) {
            $rootScope.followingNews = data.news; // newsfeed
            $rootScope.moreDataFollowing = data.moreData;
        });
    };

    $scope.assignCurrentNews = function(item) { // save the last link that we read
        $rootScope.currentNewsState = item;
    };
})

//Menu side Controller
.controller('AppController', function($rootScope, $scope, $ionicModal, $state, $ionicSideMenuDelegate, 
$ionicPopup, apiServices, $ionicHistory) {
    apiServices.getList(function(data) {
        $rootScope.keywords = data.keywords;
        $rootScope.listCount = data.keywords.length;
        $scope.allListChecked = true;
        $scope.showList = false;

        $ionicModal.fromTemplateUrl('templates/home-settings.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });

        $scope.openSetting = function(e) {
            e.preventDefault(); 
            e.stopPropagation();
            $scope.modal.show();

            $scope.unfollow = function(item) {
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Are you sure you want to unfollow everything relating to "' 
                    + item.keyword + '"?',
                    scope: $scope,
                    okText: 'Unfollow'
                });

                confirmPopup.then(function(res) {
                    if (res) {
                        apiServices.unfollow(item.keyword, function(data) {
                            $rootScope.keywords = data.keywords;        
                            $rootScope.listCount = data.keywords.length;
                            $rootScope.news = data.news;
                        })
                    }
                });
            };

            $scope.deleteItem = function(item) {
                for (i = 0; i < $rootScope.keywords.length; i++)
                    if ($rootScope.keywords[i].keyword === item.keyword) {
                        $rootScope.keywords.splice(i, 1);
                        break;
                    }
            };

            $scope.toggleCheckbox = function() {
                $scope.allListChecked = !$scope.allListChecked;
                for (i = 0; i < $rootScope.keywords.length; i++)
                    $rootScope.keywords[i].isChecked = $scope.allListChecked;
            };
        };

        $scope.chooseItem = function(item) {
            $scope.onFavorite = false;
            for (i in $rootScope.keywords)
                    $rootScope.keywords[i].star = false;
            if (item === 'Newsfeed') {
                apiServices.getFeed(0, function(data) {
                    $rootScope.news = data.news; // newsfeed
                    $rootScope.currentNewsState = $rootScope.news[0];
                    $rootScope.moreData = data.moreData;
                    $rootScope.currentNewsfeedState = 'News';
                });
            }
            else if (item === 'Favorites') {
                $scope.onFavorite = true;
                apiServices.getFavorite(0, function(data) {
                    $rootScope.favoriteNews = data.favoriteNews;
                    $rootScope.moreDataFavorite = data.moreData;
                    $rootScope.currentNewsfeedState = 'Favorites';
                });
            }
            else {
                $rootScope.keywords[$rootScope.keywords.indexOf(item)].star = true;
                apiServices.getFeedByKeyword(item.keyword, 0, function(data) {
                    $rootScope.followingNews = data.news;
                    $rootScope.followingKeyword = item.keyword;
                    $rootScope.titleNews = data.titleNews;
                    $rootScope.moreDataFollowing = data.moreData;
                    $rootScope.currentNewsfeedState = 'Following';
                });
            }
        };

        $scope.closeSetting = function() {
            $scope.modal.hide();
        };

        $scope.save = function() {
            $scope.onFavorite = false;
            for (i in $rootScope.keywords)
                $rootScope.keywords[i].star = false;
            $ionicSideMenuDelegate.toggleLeft();
            $scope.modal.hide();

            apiServices.updateList($rootScope.keywords, function(data) {
                $rootScope.news = data.news;
                $rootScope.currentNewsState = $rootScope.news[0];
                $rootScope.currentNewsfeedState = 'News';
                $rootScope.moreData = data.moreData;
            });
            $state.go('tabs.news');
        };

        $scope.toggleList = function() {
            $scope.showList = !$scope.showList;
        };
    });
});