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
                $ionicViewSwitcher.nextDirection('swap');
                if ($rootScope.news.length === 0 && $rootScope.media.length === 0) {
                    apiServices.getSuggestion();
                    $state.go('discover');
                }
                else {
                    $rootScope.currentReadingState = $rootScope.news[0];
                    $rootScope.currentNewsfeedState = 'Newsfeed';
                    $rootScope.currentTab = 'News';
                    $state.go('tabs.news');
                }
            });
            apiServices.getMediaFeed(0, function() {
                $rootScope.currentSocialReadingState = $rootScope.media[0];
            });
        }, function(errMessage) {
            var alertPopup = $ionicPopup.alert({
                title: 'Login failed!',
                template: errMessage
            });
        });
    };
});