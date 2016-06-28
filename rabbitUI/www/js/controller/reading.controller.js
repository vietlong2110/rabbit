//Reading iframe Controller
angular.module('reading.controller', [])
.controller('ReadingController',
function($rootScope, $scope, $sce, $ionicSideMenuDelegate, $ionicPopup, apiServices, LOAD_SIZE) {
    $scope.url = $rootScope.currentReadingState.url;
    $scope.favorite = $rootScope.currentReadingState.star;

    $scope.slide = function(e) {
        e.preventDefault();
        e.stopPropagation();
    };

    $scope.$on('$ionicView.enter', function() {
        $ionicSideMenuDelegate.canDragContent(false);
    });

    $scope.$on('$ionicView.leave', function() {
        $ionicSideMenuDelegate.canDragContent(true);
    });

    $scope.options = {
        loop: false,
        speed: 500
    };

    $scope.$on("$ionicSlides.sliderInitialized", function(event, data) {
        $scope.slider = data.slider;
    });

	$scope.trustSrc = function(src) {
		return $sce.trustAsResourceUrl(src);
	};

	$scope.toggleStar = function() {
		if ($scope.favorite) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Are you sure you want to remove this link from your favorite list?',
                scope: $scope,
                okText: 'Remove'
            });

            confirmPopup.then(function(res) {
                if (res) {
                    apiServices.updateFavorite($rootScope.currentReadingState.id, function() {
                        apiServices.getFavorite($rootScope.favoriteNews.length - LOAD_SIZE, 
                        $rootScope.favoriteMedia.length - LOAD_SIZE, function() {
                            $scope.favorite = false;
                        });
                    });    
                }
            });
        }
        else $scope.favorite = true;
	};
});