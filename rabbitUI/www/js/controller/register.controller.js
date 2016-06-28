//Register Controller
angular.module('register.controller', [])
.controller('RegisterController', function($scope, $ionicPopup, $state, AuthService) {
    $scope.user = {
        email: '',
        password: '',
        passwordConfirm: ''
    };

    $scope.signup = function() {
        AuthService.register($scope.user).then(function(message) {
            $state.go('login');
            var alertPopup = $ionicPopup.alert({
                title: 'Register success!',
                template: message
            });
        }, function(errMessage) {
            var alertPopup = $ionicPopup.alert({
                title: 'Register failed!',
                template: errMessage
            });
        });
    };
});