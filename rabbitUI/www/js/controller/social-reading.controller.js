//Reading iframe Controller
angular.module('socialreading.controller', [])
.controller('SocialReadingController',
function($rootScope, $scope, $sce, $ionicSideMenuDelegate, $ionicPopup, apiServices, LOAD_SIZE) {
    $scope.title = $rootScope.currentSocialReadingState.title;
    $scope.image = $rootScope.currentSocialReadingState.thumbnail;
    $scope.favorite = $rootScope.currentSocialReadingState.star;

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

    $scope.toggleStar = function() {
        if ($scope.favorite) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Are you sure you want to remove this link from your favorite list?',
                scope: $scope,
                okText: 'Remove'
            });

            confirmPopup.then(function(res) {
                if (res) {
                    apiServices.updateMediaFavorite($rootScope.currentSocialReadingState.id, function() {
                        apiServices.getMediaFavorite($rootScope.favoriteMedia.length - LOAD_SIZE, 
                        function() {
                            $scope.favorite = false;
                        });
                    });    
                }
            });
        }
        else $scope.favorite = true;
    };
});