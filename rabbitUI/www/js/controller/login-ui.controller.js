//Login UI Controller
angular.module('login-ui.controller', [])
.controller('LoginUIController',
function($rootScope, $scope, $ionicPopup, $state, $ionicHistory, $ionicViewSwitcher, AuthService, apiServices) {
	$scope.user = {
        email: '',
        password: ''
    };

    $scope.back = function() {
        $ionicHistory.goBack();
    };

    $scope.login = function() {
        AuthService.login($scope.user).then(function(message) {
            apiServices.getList();
            apiServices.getNewsFeed(0, function() {
                $rootScope.currentReadingState = $rootScope.news[0]
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
            })
        });
    };
});