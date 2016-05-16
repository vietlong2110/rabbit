angular.module('starter.controller', [])

.controller('NewsfeedController', ['$rootScope', '$scope', '$http', '$state',
function($rootScope, $scope, $http, $state) {
    $http.get('js/data.json').success(function(data) {
        $rootScope.news = data.news;
        $rootScope.highlightNews = [];
        $scope.showSearchResult = false;
        $scope.searchResult = [];
        $rootScope.firstBlood = false;

        $scope.toggleStar = function(item) {
            item.star = !item.star;
            if (item.star)
            	$rootScope.highlightNews.push(item);
            else $rootScope.highlightNews.splice($rootScope.highlightNews.indexOf(item), 1);
        };
        $scope.assignCurrentNews = function(item) {
            $rootScope.firstBlood = true;
        	$rootScope.currentNewsState = item;
        };
        $scope.search = function(value) {
            $http.get('http://localhost:8080/clientapi/search', {
                params: {
                    q: value
                }
            }).success(function(data) {
                $rootScope.searchResult = data.searchResult;
                $rootScope.keyword = data.keyword;
                $state.go('app.search', {});
            });
        };
    });
}])

.controller('SearchController', ['$rootScope', '$scope', '$state', '$http',
function($rootScope, $scope, $state, $http) {
    $scope.assignCurrentNews = function(item) {
        $rootScope.currentNewsState = item;
    };
    $scope.search = function(value) {
        $http.get('http://localhost:8080/clientapi/search', {
            params: {
                q: value
            }
        }).success(function(data) {
            $rootScope.searchResult = data.searchResult;
            $rootScope.keyword = data.keyword;
            $state.go('app.search', {});
        });
    };
    $scope.follow = function() {
        // $scope.followed = true;
    };
}])

.controller('ReadingController', ['$rootScope', '$scope', '$sce', function($rootScope, $scope, $sce) {
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
}])

.controller('HighlightController', ['$rootScope', '$scope', '$state', function($rootScope, $scope, $state) {
	$scope.deleteItem = function(item) {
		$rootScope.highlightNews.splice($rootScope.highlightNews.indexOf(item), 1);
		$state.go('app.highlight', {});
	};
	$scope.assignCurrentNews = function(item) {
    	$rootScope.currentNewsState = item;
    };
}])

.controller('KeywordsController',['$rootScope', '$scope', '$http', function($rootScope, $scope, $http) {
	$http.get('js/data.json').success(function(data) {
		$rootScope.keywords = data.keywords;
		$scope.allListChecked = true;
		$scope.shouldShowDelete = false;
		$scope.onHighlight = false;

		$scope.deleteItem = function(item) {
            for (i = 0; i < $rootScope.keywords.length; i++)
            	if ($rootScope.keywords[i].keyword === item.keyword) {
            		$rootScope.keywords.splice(i, 1);
            		break;
            	}
        };

        $scope.toggleDelete = function() {
        	$scope.shouldShowDelete = !$scope.shouldShowDelete;
        };

        $scope.toggleCheckbox = function() {
        	$scope.allListChecked = !$scope.allListChecked;
        	for (i = 0; i < $rootScope.keywords.length; i++)
        		$rootScope.keywords[i].isChecked = $scope.allListChecked;
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
}]);