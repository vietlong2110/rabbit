//Login Controller
angular.module('login.controller', [])
.controller('LoginController',
function($rootScope, $scope, $ionicPopup, $state, $ionicViewSwitcher, AuthService, apiServices) {
    $scope.token = '';

    $scope.fblogin = function() {
        AuthService.fblogin().then(function(token) {
            // $scope.token = token;
            apiServices.getList();
            apiServices.getInfo();
            apiServices.getNewsFeed(0, function() {
            //     $ionicViewSwitcher.nextDirection('swap');
                if ($rootScope.news.length === 0) {
                    apiServices.getSuggestion();
                    $rootScope.currentNewsfeedState = 'Discover';
                    $rootScope.onDiscover = true;
                    $state.go('tabs.discover');
                }
                else {
                    $rootScope.currentReadingState = $rootScope.news[0];
                    $rootScope.currentNewsfeedState = 'Newsfeed';
                    $rootScope.currentTab = 'News';
                    $rootScope.onNewsfeed = true;
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