//Social Media Controller
angular.module('socialmedia.controller', [])
.controller('SocialMediaController',
function($rootScope, $scope, apiServices, $state, $http, $ionicScrollDelegate,
$ionicViewSwitcher, LOAD_SIZE) {
    $rootScope.moreDataMedia = false;

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
                sizenews: $rootScope.news.length - LOAD_SIZE,
                sizemedia: 0
            }
        }).success(function(data) {
            $rootScope.media = data.media; // newsfeed
            $rootScope.moreDataMedia = data.moreDataMedia;
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
        apiServices.getFeed($rootScope.news.length - LOAD_SIZE, $rootScope.media.length, function() {});
        $scope.$broadcast('scroll.infiniteScrollComplete');
    };

    $scope.assignCurrentReading = function(item) { // save the last link that we read
        $rootScope.currentSocialReadingState = item;
    };
});