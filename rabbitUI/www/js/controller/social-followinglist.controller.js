// Social Media Following list controller
angular.module('socialfollowinglist.controller', [])
.controller('SocialFollowingListController', 
function($rootScope, $scope, $state, $http, $ionicScrollDelegate, apiServices, LOAD_SIZE, API_ENDPOINT) {
    $scope.onSearch = function() { // enter search part
        $state.go('suggest');
    };

    $scope.scrollTop = function() {
        $ionicScrollDelegate.scrollTop(true);
    };

    $scope.toggleStar = function(e, item) { // add to favorite list
        //prevent overlap effect
        e.preventDefault(); 
        e.stopPropagation();

        apiServices.updateMediaFavorite(item.id, function() {
            item.star = !item.star;
        });
    };

    $scope.doRefresh = function() {
        $http.get(API_ENDPOINT.api + '/getmediabykeyword', {
            params: {
                q: $rootScope.followingKeyword,
                size: 0
            }
        }).success(function(data) {
            $rootScope.followingMedia = data.media; // newsfeed
            $rootScope.moreDataFollowingMedia = data.moreDataMedia;
        }).finally(function() {
            $scope.$broadcast('scroll.refreshComplete');
        });
    };

    $scope.loadMore = function() {
        apiServices.getMediaByKeyword($rootScope.followingKeyword, 
        $rootScope.followingMedia.length, function() {});
        $scope.$broadcast('scroll.infiniteScrollComplete');
    };

    $scope.assignCurrentReading = function(item) { // save the last link that we read
        $rootScope.currentSocialReadingState = item;
    };
});