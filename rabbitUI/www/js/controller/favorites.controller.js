//Favorite links Controller
angular.module('favorites.controller', [])
.controller('FavoritesController', 
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
                apiServices.updateNewsFavorite(item.id, function() {
                    apiServices.getNewsFavorite($rootScope.favoriteNews.length - LOAD_SIZE, function() {
                        $rootScope.currentReadingState = $rootScope.favoriteNews[0];
                    });
                    $state.go('tabs.favorites');
                });
            }
        });
	};

    $scope.loadMore = function() {
        apiServices.getNewsFavorite($rootScope.favoriteNews.length, function() {
            $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };

	$scope.assignCurrentReading = function(item) {
    	$rootScope.currentReadingState = item;
    };
});