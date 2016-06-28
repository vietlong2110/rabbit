angular.module('app.controller', [])

//Menu side Controller
.controller('AppController', function($rootScope, $scope, $ionicModal, $state, $ionicSideMenuDelegate, 
$ionicPopup, $ionicScrollDelegate, $ionicViewSwitcher, AuthService, apiServices, navServices, AUTH_EVENTS) {
    $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
        AuthService.logout();
        $state.go('login');
        var alertPopup = $ionicPopup.alert({
            title: 'Session Lost!',
            template: 'Sorry, You have to login again.'
        });
    });

    apiServices.getList();
    
    $scope.allListChecked = true;
    $scope.showList = false;

    if ($rootScope.currentNewsfeedState === 'Favorites')
        $scope.onFavorite = true;

    $ionicModal.fromTemplateUrl('templates/home-settings.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });

    $scope.openSetting = function(e) {
        e.preventDefault(); 
        e.stopPropagation();
        $scope.modal.show();

        $scope.unfollow = function(item) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Are you sure you want to unfollow everything relating to "' 
                + item.keyword + '"?',
                scope: $scope,
                okText: 'Unfollow'
            });

            confirmPopup.then(function(res) {
                if (res)
                    apiServices.unfollow(item.keyword);
            });
        };

        $scope.deleteItem = function(item) {
            for (i = 0; i < $rootScope.keywords.length; i++)
                if ($rootScope.keywords[i].keyword === item.keyword) {
                    $rootScope.keywords.splice(i, 1);
                    break;
                }
        };

        $scope.toggleCheckbox = function() {
            $scope.allListChecked = !$scope.allListChecked;
            for (i = 0; i < $rootScope.keywords.length; i++)
                $rootScope.keywords[i].isChecked = $scope.allListChecked;
        };
    };

    $scope.selectTab = function(item) {
        $rootScope.currentTab = item;

        if ($rootScope.onSearch) {
            if ($rootScope.currentTab === 'News')
                $state.go('tabs.search');
            else $state.go('tabs.socialsearch');
        }
        else navServices.nav();
    };

    $scope.chooseItem = function(item) {
        $scope.onFavorite = false;
        $ionicScrollDelegate.scrollTop();
        for (i in $rootScope.keywords)
                $rootScope.keywords[i].star = false;
        if (item === 'Newsfeed') {
            apiServices.getFeed(0, 0, function() {
                $rootScope.currentReadingState = $rootScope.news[0];
                $rootScope.currentSocialReadingState = $rootScope.media[0];
            });

            if ($rootScope.currentTab === 'News')
                $state.go('tabs.news');
            else $state.go('tabs.social');

            $rootScope.currentNewsfeedState = 'Newsfeed';
        }
        else if (item === 'Favorites') {
            $scope.onFavorite = true;
            apiServices.getFavorite(0, 0, function() {
                $rootScope.currentReadingState = $rootScope.favoriteNews[0];
                $rootScope.currentSocialReadingState = $rootScope.favoriteMedia[0];
            });

            if ($rootScope.currentTab === 'News')
                $state.go('tabs.favorites');
            else $state.go('tabs.socialfavorites');

            $rootScope.currentNewsfeedState = 'Favorites';
        }
        else if (item === 'Logout') {
            AuthService.logout();
            $ionicViewSwitcher.nextDirection('swap');
            $state.go('login');
        }
        else {
            $rootScope.keywords[$rootScope.keywords.indexOf(item)].star = true;
            $rootScope.followingKeyword = item.keyword;

            apiServices.getFeedByKeyword(item.keyword, 0, 0, function() {
                $rootScope.currentReadingState = $rootScope.followingNews[0];
                $rootScope.currentSocialReadingState = $rootScope.followingMedia[0];
            });

            if ($rootScope.currentTab === 'News')
                $state.go('tabs.followinglist');
            else $state.go('tabs.socialfollowinglist');

            $rootScope.currentNewsfeedState = 'Following';
        }
    };

    $scope.closeSetting = function() {
        $scope.modal.hide();
    };

    $scope.save = function() {
        $scope.onFavorite = false;
        for (i in $rootScope.keywords)
            $rootScope.keywords[i].star = false;
        $ionicSideMenuDelegate.toggleLeft();
        $scope.modal.hide();

        apiServices.updateList($rootScope.keywords, function() {
            $rootScope.currentReadingState = $rootScope.news[0];
            $rootScope.currentSocialReadingState = $rootScope.media[0];
        });
        $rootScope.currentNewsfeedState = 'Newsfeed';
        if ($rootScope.currentTab === 'News')
            $state.go('tabs.news');
        else $state.go('tabs.social');
    };

    $scope.toggleList = function() {
        $scope.showList = !$scope.showList;
    };
});