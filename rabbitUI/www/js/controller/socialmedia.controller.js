//Social Media Controller
angular.module('socialmedia.controller', [])
.controller('SocialMediaController',
function($rootScope, $scope, apiServices, $state, $http, $ionicScrollDelegate,
$ionicViewSwitcher, LOAD_SIZE, API_ENDPOINT) {
    $rootScope.moreDataMedia = false;

    $scope.onSearch = function() { // enter search part
        $ionicViewSwitcher.nextDirection('enter');
        $state.go('suggest');
    };

    $scope.scrollTop = function() {
        $ionicScrollDelegate.scrollTop(true);
    };

    $scope.doRefresh = function() {
        $http.get(API_ENDPOINT.api + '/getmediafeed', {
            params: {
                size: 0
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

        apiServices.updateMediaFavorite(item.id, function() {
            item.star = !item.star;
        });
    };

    $scope.loadMore = function() {
        apiServices.getMediaFeed($rootScope.media.length, function() {});
        $scope.$broadcast('scroll.infiniteScrollComplete');
    };

    $scope.assignCurrentReading = function(item) { // save the last link that we read
        $rootScope.currentSocialReadingState = item;
    };
});