angular.module('starter.controller', [])

//Newsfeed Controller
.controller('NewsfeedController', 
function($rootScope, $scope, $http, $state, $ionicViewSwitcher) {
    $http.get('http://localhost:8080/clientapi/getfeed').success(function(data) {
        $rootScope.news = data.news; //newsfeed
        $rootScope.highlightNews = []; //favorite links
        $rootScope.searchResult = []; //search results
        if ($rootScope.currentNewsState === undefined)
            $rootScope.currentNewsState = '';
        // $rootScope.firstBlood = false;

        $scope.onSearch = function() {
            $ionicViewSwitcher.nextDirection('enter');
            $state.go('app.suggest');
        };

        $scope.toggleStar = function(item) { //add to favorite list
            item.star = !item.star;
            if (item.star)
            	$rootScope.highlightNews.push(item);
            else $rootScope.highlightNews.splice($rootScope.highlightNews.indexOf(item), 1);
        };

        $scope.assignCurrentNews = function(item) { //save the last link that we read
            // $rootScope.firstBlood = true;
        	$rootScope.currentNewsState = item;
        };
    });
})

.controller('SuggestController', function($rootScope, $scope, $http, $state, $ionicHistory) {
    $rootScope.showSearchBar = true;
    $scope.search = function(value) { //search a keyword/hashtag
        $rootScope.value = value;
        $http.get('http://localhost:8080/clientapi/search', {
            params: {
                q: value
            }
        }).success(function(data) {
            $rootScope.searchResult = data.searchResult;
            $rootScope.keywordSearch = data.keywordSearch;
            $rootScope.queryTitle = data.queryTitle;
            $state.go('app.search');
        });
    };

    $scope.back = function(value) {
        $rootScope.value = value;
        $ionicHistory.backView().go();
    };
})

//Search Controller
.controller('SearchController', 
function($rootScope, $scope, $state, $http, $ionicHistory) {
    var found = false;
    for (i in $rootScope.keywords)
        if ($rootScope.keywords[i].keyword === $rootScope.keywordSearch) {
            found = true;
            break;
        }
    if (found)
        $rootScope.followed = true;
    else $rootScope.followed = false;

    $scope.assignCurrentNews = function(item) {
        $rootScope.currentNewsState = item;
    };

    $scope.back = function() {
        $ionicHistory.backView().go();
    };

    $scope.follow = function() { 
        if (!$rootScope.followed) {
            $rootScope.followed = true;
            $rootScope.keywords.push({
                keyword: $rootScope.keywordSearch,
                isChecked: true
            });
            $rootScope.listCount++;
            $http.post('http://localhost:8080/clientapi/follow', {
                q: $rootScope.keywordSearch
            }).success(function(data) {
                $rootScope.news = data.news;
            });
        }
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
		$scope.highlight = !$scope.highlight;
		var item = $rootScope.currentNewsState;
		if ($scope.highlight)
			$rootScope.highlightNews.push(item);
		else $rootScope.highlightNews.splice($rootScope.highlightNews.indexOf(item), 1);
		for (i = 0; i < $rootScope.news.length; i++)
			if ($rootScope.news[i] === item) {
				$rootScope.news[i].star = $scope.highlight;
				break;
			}
	};
})

//Favorite links Controller
.controller('HighlightController', function($rootScope, $scope, $state) {
	$scope.deleteItem = function(item) {
		$rootScope.highlightNews.splice($rootScope.highlightNews.indexOf(item), 1);
		$state.go('app.highlight', {});
	};
	$scope.assignCurrentNews = function(item) {
    	$rootScope.currentNewsState = item;
    };
})

//Menu side Controller
.controller('KeywordsController',
function($rootScope, $scope, $http, $ionicModal, $state, $ionicSideMenuDelegate, $ionicPopup, $timeout) {
    $ionicModal.fromTemplateUrl('templates/home-settings.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });

    $http.get('http://localhost:8080/clientapi/getlist').success(function(data) {
        $rootScope.keywords = data.keywords;
        $rootScope.listCount = data.keywords.length;
        $scope.allListChecked = true;
        $scope.onHighlight = false;

        $scope.openSetting = function() {
            $scope.modal.show();
            $http.get('http://localhost:8080/clientapi/getlist').success(function(data) {
                $rootScope.keywords = data.keywords;
                $rootScope.listCount = data.keywords.length;

                $scope.unfollow = function(item) {
                    var confirmPopup = $ionicPopup.confirm({
                        title: 'Are you sure you want to unfollow everything relating to "' 
                        + item.keyword + '"?',
                        scope: $scope,
                        okText: 'Unfollow'
                    });

                    confirmPopup.then(function(res) {
                        if (res) {
                            $http.post('http://localhost:8080/clientapi/unfollow', {
                                keyword: item.keyword
                            }).success(function(data) {
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
            });
        };

        $scope.closeSetting = function() {
            $scope.modal.hide();
            $http.post('http://localhost:8080/clientapi/updatelist', {
                keywords: $rootScope.keywords
            }).success(function(data) {
                $rootScope.news = data.news;
            });
        };

        $scope.save = function() {
            $ionicSideMenuDelegate.toggleLeft();
            $scope.modal.hide();
            $http.post('http://localhost:8080/clientapi/updatelist', {
                keywords: $rootScope.keywords
            }).success(function(data) {
                $rootScope.news = data.news;
            });
        };

        $scope.toggleHighlight = function() {
        	$scope.onHighlight = !$scope.onHighlight;
        	if (!$scope.onHighlight) {
        		for (i = 0; i < $rootScope.news.length; i++)
        			if ($rootScope.news[i].star) {
        				var ok = false;
        				for (j = 0; j < $rootScope.highlightNews.length; j++)
        					if ($rootScope.highlightNews[j] === $rootScope.news[i]) {
        						ok = true;
        						break;
        					}
        				if (!ok)
        					$rootScope.news[i].star = false;
        			}
        	}
        };
    });
});