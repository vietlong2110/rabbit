// News Controller
angular.module('news.controller', [])
.controller('NewsController', 
function($rootScope, $scope, apiServices, $state, $http, $ionicScrollDelegate,
$ionicViewSwitcher, API_ENDPOINT, LOAD_SIZE) {
    $rootScope.moreDataNews = false;

    $scope.onSearch = function() { // enter search part
        $ionicViewSwitcher.nextDirection('enter');
        $state.go('suggest');
    };

    $scope.scrollTop = function() {
        $ionicScrollDelegate.scrollTop(true);
    };

    $scope.doRefresh = function() {
        $http.get(API_ENDPOINT.api + '/getnewsfeed', {
            params: {
                size: 0
            }
        }).success(function(data) {
            $rootScope.news = data.news; // newsfeed
            $rootScope.currentReadingState = $rootScope.news[0];
            $rootScope.moreDataNews = data.moreDataNews;
        }).finally(function() {
            $scope.$broadcast('scroll.refreshComplete');
        });
    };

    $scope.toggleStar = function(e, item) { // add to favorite list
        //prevent overlap effect
        e.preventDefault(); 
        e.stopPropagation();

        apiServices.updateNewsFavorite(item.id, function() {
            item.star = !item.star;
        });
    };

    $scope.loadMore = function() {
        apiServices.getNewsFeed($rootScope.news.length, function() {});
        $scope.$broadcast('scroll.infiniteScrollComplete');
    };

    $scope.assignCurrentReading = function(item) { // save the last link that we read
        $rootScope.currentReadingState = item;
    };
});