//Media Search Controller
angular.module('socialsearch.controller', [])
.controller('SocialSearchController', 
function($rootScope, $scope, $state, apiServices, $ionicPopup, 
$ionicViewSwitcher, $ionicScrollDelegate, navServices, LOAD_SIZE) {
    $rootScope.onSearch = true;

    $scope.assignCurrentReading = function(item) {
        $rootScope.currentSocialReadingState = item;
    };

    $scope.scrollTop = function() {
        $ionicScrollDelegate.scrollTop(true);
    };

    $scope.back = function() {
        $rootScope.onSearch = false;
        $ionicViewSwitcher.nextDirection('back');
        $state.go('suggest');
    };

    $scope.backHome = function() {
        $rootScope.onSearch = false;
        $rootScope.currentNewsfeedState = 'Newsfeed';
        $rootScope.onNewsfeed = true;
        $ionicViewSwitcher.nextDirection('back');
        navServices.nav();
    };

    $scope.loadMore = function() {
        apiServices.search($rootScope.keywordSearch, $rootScope.searchResult.length - LOAD_SIZE,
        $rootScope.searchMediaResult.length, function() {
            $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };

    $scope.follow = function() {
        if (!$rootScope.followed) {
            $rootScope.keywords.push({
                keyword: $rootScope.keywordSearch,
                isChecked: true
            });
            apiServices.follow($rootScope.keywordSearch, $rootScope.queryTitle);
            $rootScope.followed = true;
            $rootScope.listCount++;
        }
    };

    $scope.unfollow = function() {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Are you sure you want to unfollow everything relating to "' 
            + $rootScope.queryTitle + '"?',
            scope: $scope,
            okText: 'Unfollow'
        });

        confirmPopup.then(function(res) {
            if (res) {
                apiServices.unfollow($rootScope.keywordSearch);
                $rootScope.followed = false;
            }
        });
    };
});