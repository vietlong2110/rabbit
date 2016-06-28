// Social Media Following list controller
angular.module('socialfollowinglist.controller', [])
.controller('SocialFollowingListController', 
function($rootScope, $scope, $state, $http, $ionicScrollDelegate, apiServices, LOAD_SIZE) {
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

        apiServices.updateFavorite(item.id, function() {
            item.star = !item.star;
        });
    };

    $scope.doRefresh = function() {
        $http.get('http://localhost:8080/clientapi/getfeedbykeyword', {
            params: {
                q: $rootScope.followingKeyword,
                sizenews: $rootScope.followingNews.length - LOAD_SIZE,
                sizemedia: 0
            }
        }).success(function(data) {
            $rootScope.followingMedia = data.media; // newsfeed
            $rootScope.moreDataFollowingMedia = data.moreDataMedia;
        }).finally(function() {
            $scope.$broadcast('scroll.refreshComplete');
        });
    };

    $scope.loadMore = function() {
        apiServices.getFeedByKeyword($rootScope.followingKeyword, 
        $rootScope.followingNews.length - LOAD_SIZE, $rootScope.followingMedia.length, function() {});
        $scope.$broadcast('scroll.infiniteScrollComplete');
    };

    $scope.assignCurrentReading = function(item) { // save the last link that we read
        $rootScope.currentSocialReadingState = item;
    };
});