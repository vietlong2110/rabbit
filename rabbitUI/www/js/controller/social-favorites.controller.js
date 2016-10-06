//Social Media Favorites Controller
angular.module('socialfavorites.controller', [])
.controller('SocialFavoritesController', 
function($rootScope, $scope, $state, $ionicPopup, $ionicScrollDelegate, apiServices, LOAD_SIZE) {
    $scope.onSearch = function() {
        $state.go('suggest');
    };

    $scope.scrollTop = function() {
        $ionicScrollDelegate.scrollTop(true);
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
                apiServices.updateMediaFavorite(item.id, function() {
                    apiServices.getMediaFavorite($rootScope.favoriteMedia.length - LOAD_SIZE, function() {
                        $rootScope.currentSocialReadingState = $rootScope.favoriteMedia[0];
                    });
                    $state.go('tabs.socialfavorites');
                });    
            }
        });
    };

    $scope.loadMore = function() {
        apiServices.getMediaFavorite($rootScope.favoriteMedia.length - LOAD_SIZE, function() {
            $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };

    $scope.assignCurrentReading = function(item) {
        $rootScope.currentSocialReadingState = item;
    };
});