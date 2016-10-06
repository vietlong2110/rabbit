angular.module('app.controller', [])

//Menu side Controller
.controller('AppController', function($rootScope, $scope, $ionicModal, $ionicBackdrop, $state, 
$ionicSideMenuDelegate, $ionicPopup, $ionicScrollDelegate, $ionicViewSwitcher, AuthService, 
apiServices, navServices, AUTH_EVENTS) {
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

    if ($rootScope.currentNewsfeedState === 'Newsfeed')
        $rootScope.onNewsfeed = true;
    else if ($rootScope.currentNewsfeedState === 'Favorites')
        $rootScope.onFavorite = true;

    $ionicModal.fromTemplateUrl('templates/home-settings.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });

    $scope.$watch(function() {
        if ($ionicSideMenuDelegate.isOpen())
            $scope.isOpen = true;
        else $scope.isOpen = false;        
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
        $rootScope.onFavorite = false;
        $rootScope.onNewsfeed = false;
        $rootScope.onFollowing = false;
        $rootScope.onDiscover = false;
        $ionicScrollDelegate.scrollTop();
        for (i in $rootScope.keywords)
                $rootScope.keywords[i].star = false;
        if (item === 'Newsfeed') {
            $rootScope.onNewsfeed = true;
            apiServices.getNewsFeed(0, function() {
                $rootScope.currentReadingState = $rootScope.news[0];
            });
            apiServices.getMediaFeed(0, function() {
                $rootScope.currentSocialReadingState = $rootScope.media[0];
            });

            if ($rootScope.currentTab === 'News')
                $state.go('tabs.news');
            else $state.go('tabs.social');

            $rootScope.currentNewsfeedState = 'Newsfeed';
        }
        else if (item === 'Favorites') {
            $rootScope.onFavorite = true;
            apiServices.getNewsFavorite(0, function() {
                $rootScope.currentReadingState = $rootScope.favoriteNews[0];
            });
            apiServices.getMediaFavorite(0, function() {
                $rootScope.currentSocialReadingState = $rootScope.favoriteMedia[0];
            });

            if ($rootScope.currentTab === 'News')
                $state.go('tabs.favorites');
            else $state.go('tabs.socialfavorites');

            $rootScope.currentNewsfeedState = 'Favorites';
        }
        else if (item === 'Discover') {
            apiServices.getSuggestion();
            $rootScope.currentNewsfeedState = 'Discover';
            $rootScope.onDiscover = true;
            $state.go('tabs.discover');
        }
        else if (item === 'Logout') {
            AuthService.logout(function() {
                console.log(AuthService.isAuthenticated());
                $ionicViewSwitcher.nextDirection('swap');
                $state.go('login');
            });
        }
        else {
            $rootScope.onFollowing = true;
            $rootScope.keywords[$rootScope.keywords.indexOf(item)].star = true;
            $rootScope.followingKeyword = item.keyword;

            apiServices.getNewsByKeyword(item.keyword, 0, function() {
                $rootScope.currentReadingState = $rootScope.followingNews[0];
            });
            apiServices.getMediaByKeyword(item.keyword, 0, function() {
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
        $rootScope.onNewsfeed = false;
        $rootScope.onFavorite = false;
        $rootScope.onFollowing = false;
        $rootScope.onDiscover = false;
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
        $rootScope.onFavorite = false;
        $rootScope.onNewsfeed = false;
        $rootScope.onFollowing = false;
        $rootScope.onDiscover = false;
        $scope.showList = !$scope.showList;
    };
});