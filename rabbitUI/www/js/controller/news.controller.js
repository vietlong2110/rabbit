// News Controller
angular.module('news.controller', [])
.controller('NewsController', 
function($rootScope, $scope, apiServices, $state, $http, $ionicScrollDelegate,
$ionicViewSwitcher, LOAD_SIZE) {
    $rootScope.moreDataNews = false;

    $scope.onSearch = function() { // enter search part
        $ionicViewSwitcher.nextDirection('enter');
        $state.go('suggest');
    };

    $scope.scrollTop = function() {
        $ionicScrollDelegate.scrollTop(true);
    };

    $scope.doRefresh = function() {
        $http.get('http://localhost:8080/clientapi/getfeed', {
            params: {
                sizenews: 0,
                sizemedia: $rootScope.media.length - LOAD_SIZE
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

        apiServices.updateFavorite(item.id, function() {
            item.star = !item.star;
        });
    };

    $scope.loadMore = function() {
        apiServices.getFeed($rootScope.news.length, $rootScope.media.length - LOAD_SIZE, function() {});
        $scope.$broadcast('scroll.infiniteScrollComplete');
    };

    $scope.assignCurrentReading = function(item) { // save the last link that we read
        $rootScope.currentReadingState = item;
    };
});