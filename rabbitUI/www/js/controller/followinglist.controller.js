//Following list controller
angular.module('followinglist.controller', [])
.controller('FollowingListController', 
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

        apiServices.updateNewsFavorite(item.id, function() {
            item.star = !item.star;
        });
    };

    $scope.doRefresh = function() {
        $http.get(API_ENDPOINT.api + '/getnewsbykeyword', {
            params: {
                q: $rootScope.followingKeyword,
                size: 0
            }
        }).success(function(data) {
            $rootScope.followingNews = data.news; // newsfeed
            $rootScope.moreDataFollowing = data.moreDataNews;
        }).finally(function() {
            $scope.$broadcast('scroll.refreshComplete');
        });
    };

    $scope.loadMore = function() {
        apiServices.getNewsByKeyword($rootScope.followingKeyword, 
        $rootScope.followingNews.length, function() {});
        $scope.$broadcast('scroll.infiniteScrollComplete');
    };

    $scope.assignCurrentReading = function(item) { // save the last link that we read
        $rootScope.currentReadingState = item;
    };
});