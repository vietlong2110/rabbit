// News Controller
angular.module('news.controller', [])
.controller('NewsController', 
function($rootScope, $scope, apiServices, $state, $http, $ionicScrollDelegate,
$ionicViewSwitcher, $cordovaSocialSharing, API_ENDPOINT, LOAD_SIZE) {
    $rootScope.moreDataNews = false;

    $scope.onSearch = function() { // enter search part
        $ionicViewSwitcher.nextDirection('enter');
        $state.go('suggest');
    };

    $scope.scrollTop = function() {
        $ionicScrollDelegate.scrollTop(true);
    };

    $scope.doRefresh = function() {
        $http.get(API_ENDPOINT.api + '/getnewsfeed', {
            params: {
                size: 0
            }
        }).success(function(data) {
            $rootScope.news = data.news; // newsfeed
            $rootScope.currentReadingState = $rootScope.news[0];
            $rootScope.moreDataNews = data.moreDataNews;
        }).finally(function() {
            $scope.$broadcast('scroll.refreshComplete');
        });
    };

    $scope.toggleStar = function(e, item) { // add to favorite list
        //prevent overlap effect
        e.preventDefault(); 
        e.stopPropagation();

        apiServices.updateNewsFavorite(item.id, function() {
            item.star = !item.star;
        });
    };

    $scope.share = function(e, item) {
        e.preventDefault();
        e.stopPropagation();
        var message = '';
        var image = item.thumbnail;
        var link = item.url;

        // window.plugins.socialsharing.share(null, message, image, link);
        
        $cordovaSocialSharing.shareViaFacebook(message, image, link).then(function(result) {
            var alertPopup = $ionicPopup.alert({
                title: 'This link has shared on your newsfeed!',
                template: result
            });
        }, function(err) {
            var alertPopup = $ionicPopup.alert({
                title: 'Failed to share!',
                template: err
            });
        });
    };

    $scope.loadMore = function() {
        apiServices.getNewsFeed($rootScope.news.length, function() {
            $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };

    $scope.assignCurrentReading = function(item) { // save the last link that we read
        $rootScope.currentReadingState = item;
    };
});