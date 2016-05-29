angular.module('starter.controller', [])

//Newsfeed Controller
.controller('NewsfeedController', function($rootScope, $scope, apiServices, $state, $ionicViewSwitcher) {
    // $http.get('http://localhost:8080/clientapi/getfeed').success(function(data) {
    apiServices.getFeed(function(data) {
        $rootScope.news = data.news; //newsfeed
        $rootScope.highlightNews = []; //favorite links
        $rootScope.searchResult = []; //search results
        if ($rootScope.currentNewsState === undefined)
            $rootScope.currentNewsState = $rootScope.news[0];
        // $rootScope.firstBlood = false;

        $scope.onSearch = function() {
            $ionicViewSwitcher.nextDirection('enter');
            $state.go('app.suggest');
        };

        $scope.toggleStar = function(e, item) { //add to favorite list
            e.preventDefault(); 
            e.stopPropagation();
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

.controller('SuggestController', function($rootScope, $scope, apiServices, $state, $ionicHistory) {
    $rootScope.showSearchBar = true;
    $scope.search = function(value) { //search a keyword/hashtag
        $rootScope.value = value;
        apiServices.search(value, function(data) {
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
function($rootScope, $scope, $state, apiServices, $ionicHistory) {
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

    $scope.follow = function() { 
        if (!$rootScope.followed) {
            $rootScope.keywords.push({
                keyword: $rootScope.keywordSearch,
                isChecked: true
            });
            $rootScope.listCount++;
            apiServices.follow($rootScope.keywordSearch, function(data) {
                $rootScope.followed = true;
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
.controller('HighlightController', function($rootScope, $scope, $state, $ionicPopup, $ionicViewSwitcher) {
    $scope.onSearch = function() {
        $ionicViewSwitcher.nextDirection('enter');
        $state.go('app.suggest');
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
                for (i in $rootScope.news)
                    if ($rootScope.news[i].star && $rootScope.news[i] === item)
                        $rootScope.news[i].star = false;

                $rootScope.highlightNews.splice($rootScope.highlightNews.indexOf(item), 1);
                $state.go('app.highlight', {});    
            }
        });
	};
	$scope.assignCurrentNews = function(item) {
    	$rootScope.currentNewsState = item;
    };
})

//Menu side Controller
.controller('KeywordsController',
function($rootScope, $scope, $ionicModal, $state, $ionicSideMenuDelegate, $ionicPopup, apiServices) {
    $ionicModal.fromTemplateUrl('templates/home-settings.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });

    apiServices.getList(function(data) {
        $rootScope.keywords = data.keywords;
        $rootScope.listCount = data.keywords.length;
        $scope.allListChecked = true;
        $scope.onHighlight = false;
        $scope.showList = false;

        $scope.openSetting = function(e) {
            e.preventDefault(); 
            e.stopPropagation();
            $scope.modal.show();
            apiServices.getList(function(data) {
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
            });
        };

        $scope.closeSetting = function() {
            $scope.modal.hide();
        };

        $scope.save = function() {
            $ionicSideMenuDelegate.toggleLeft();
            $scope.modal.hide();
            apiServices.updateList($rootScope.keywords, function(data) {
                $rootScope.news = data.news;
            });
        };

        $scope.toggleList = function() {
            $scope.showList = !$scope.showList;
        };
    });
});