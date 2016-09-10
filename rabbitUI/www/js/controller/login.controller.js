//Login Controller
angular.module('login.controller', [])
.controller('LoginController',
function($rootScope, $scope, $ionicPopup, $state, $ionicViewSwitcher, AuthService, apiServices, 
API_ENDPOINT) {
    $scope.user = {
        email: '',
        password: ''
    };

    $scope.login = function() {
        AuthService.login($scope.user).then(function(message) {
            apiServices.getList();
            apiServices.getFeed(0, 0, function() {
                $rootScope.currentReadingState = $rootScope.news[0];
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
            })
        });
    };

    $scope.token = '';
    $scope.fblogin = function() {
        AuthService.fblogin().then(function(token) {
            $scope.token = token;
            $http.post(API_ENDPOINT.url + '/fblogin', token).then(function() {
                apiServices.getList();
                apiServices.getFeed(0, 0, function() {
                    $rootScope.currentReadingState = $rootScope.news[0];
                    $rootScope.currentSocialReadingState = $rootScope.media[0];
                });
                $rootScope.currentNewsfeedState = 'Newsfeed';
                $rootScope.currentTab = 'News';

                $ionicViewSwitcher.nextDirection('swap');
                $state.go('tabs.news');
            });
        }, function(errMessage) {
            var alertPopup = $ionicPopup.alert({
                title: 'Login failed!',
                template: errMessage
            });
        });
    };
});