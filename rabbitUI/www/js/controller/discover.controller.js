angular.module('discover.controller', [])
.controller('DiscoverController', function($rootScope, $scope, $state, $ionicViewSwitcher, apiServices) {
	$rootScope.onDiscover = true;
    
    $scope.follow = function(e, item) {
        e.preventDefault(); 
        e.stopPropagation();

            $rootScope.keywords.push({
                keyword: item.name,
                isChecked: true
            });
            apiServices.follow(item.name, item.name);
            item.followed = true;
            $rootScope.listCount++;
    };

    $scope.unfollow = function(e, item) {
        e.preventDefault(); 
        e.stopPropagation();

        var confirmPopup = $ionicPopup.confirm({
            title: 'Are you sure you want to unfollow everything relating to "' 
            + item.name + '"?',
            scope: $scope,
            okText: 'Unfollow'
        });

        confirmPopup.then(function(res) {
            if (res) {
                apiServices.unfollow(item.name);
                item.followed = false;
            }
        });
    };

    $scope.search = function(value) {
        $rootScope.value = value; //save the value in order to show when is navigated back
        apiServices.search(value, 0, 0, function() {
            if ($rootScope.currentTab === 'News')
                $rootScope.currentReadingState = $rootScope.searchResult[0];
            else $rootScope.currentReadingState = $rootScope.searchMediaResult[0];
        });
        var found = false;
    
        for (i in $rootScope.keywords)
            if ($rootScope.keywords[i].keyword === value) {
                found = true;
                break;
            }
        $rootScope.followed = found;

        $rootScope.onDiscover = false;
        $ionicViewSwitcher.nextDirection('forward');
        if ($rootScope.currentTab === 'News')
            $state.go('tabs.search');
        else $state.go('tabs.socialsearch');
    };

    $scope.onSearch = function() { // enter search part
        $ionicViewSwitcher.nextDirection('enter');
        $state.go('suggest');
    };
});