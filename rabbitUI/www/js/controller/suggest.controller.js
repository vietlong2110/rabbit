// Suggestion/Pre-search Controller
angular.module('suggest.controller', [])
.controller('SuggestController',
function($rootScope, $scope, apiServices, $state, $ionicViewSwitcher, navServices) {
    $rootScope.showSearchBar = true;

    // $scope.suggest = function(value) {
    //     if (value !== '') {
    //         apiServices.suggest(value);
    //         $scope.empty = true;
    //     }
    //     else $scope.empty = false;
    // };

    $scope.search = function(value) { // search a keyword/hashtag
        $rootScope.value = value; //save the value in order to show when is navigated back
        apiServices.search(value, 0, 0, function() {
            if ($rootScope.currentTab === 'News')
                $rootScope.currentReadingState = $rootScope.searchResult[0];
            else $rootScope.currentReadingState = $rootScope.searchMediaResult[0];
            var found = false;
    
            for (i in $rootScope.keywords)
                if ($rootScope.keywords[i].keyword.toLowerCase() === value.toLowerCase()) {
                    found = true;
                    break;
                }
            $rootScope.followed = found;

            $rootScope.onDiscover = false;
            $ionicViewSwitcher.nextDirection('forward');
            if ($rootScope.currentTab === 'News')
                $state.go('tabs.search');
            else $state.go('tabs.socialsearch');
        });
    };

    $scope.back = function(value) {
        $rootScope.value = value; //save the value in order to show when is navigated back
        $ionicViewSwitcher.nextDirection('back'); //animation effect
        navServices.nav();
    };
});