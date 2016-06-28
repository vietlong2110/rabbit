//Following list controller
angular.module('followinglist.controller', [])
.controller('FollowingListController', 
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
                sizenews: 0,
                sizemedia: $rootScope.followingMedia.length - LOAD_SIZE
            }
        }).success(function(data) {
            $rootScope.followingNews = data.news; // newsfeed
            $rootScope.moreDataFollowing = data.moreDataNews;
        }).finally(function() {
            $scope.$broadcast('scroll.refreshComplete');
        });
    };

    $scope.loadMore = function() {
        apiServices.getFeedByKeyword($rootScope.followingKeyword, 
        $rootScope.followingNews.length, $rootScope.followingMedia.length - LOAD_SIZE, function() {});
        $scope.$broadcast('scroll.infiniteScrollComplete');
    };

    $scope.assignCurrentReading = function(item) { // save the last link that we read
        $rootScope.currentReadingState = item;
    };
});