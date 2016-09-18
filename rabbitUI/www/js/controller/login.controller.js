//Login Controller
angular.module('login.controller', [])
.controller('LoginController',
function($rootScope, $scope, $ionicPopup, $state, $ionicViewSwitcher, AuthService, apiServices) {
    $scope.token = '';

    $scope.fblogin = function() {
        AuthService.fblogin().then(function(message) {
            // $scope.token = token;
            apiServices.getList();
            apiServices.getNewsFeed(0, function() {
                $rootScope.currentReadingState = $rootScope.news[0];
            });
            apiServices.getMediaFeed(0, function() {
                $rootScope.currentSocialReadingState = $rootScope.media[0];
            });
            $rootScope.currentNewsfeedState = 'Newsfeed';
            $rootScope.currentTab = 'News';

            $ionicViewSwitcher.nextDirection('swap');
            $state.go('tabs.news');
        }, function(errMessage) {
            var alertPopup = $ionicPopup.alert({
                title: 'Login failed!',
                template: errMessage
            });
        });
    };
});