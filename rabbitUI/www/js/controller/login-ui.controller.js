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
            apiServices.getInfo();
            apiServices.getNewsFeed(0, function() {
                $ionicViewSwitcher.nextDirection('swap');
                // if ($rootScope.news.length === 0) {
                //     apiServices.getSuggestion();
                //     $rootScope.currentNewsfeedState = 'Discover';
                //     $rootScope.onDiscover = true;
                //     $state.go('tabs.discover');
                // }
                // else {
                    $rootScope.currentReadingState = $rootScope.news[0];
                    $rootScope.currentNewsfeedState = 'Newsfeed';
                    $rootScope.currentTab = 'News';
                    $rootScope.onNewsfeed = true;
                    $state.go('tabs.news');
                // }
            });
            apiServices.getMediaFeed(0, function() {
                $rootScope.currentSocialReadingState = $rootScope.media[0];
            });
        }, function(errMessage) {
            var alertPopup = $ionicPopup.alert({
                title: 'Login failed!',
                template: errMessage
            })
        });
    };
});