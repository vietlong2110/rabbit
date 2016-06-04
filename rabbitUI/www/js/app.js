// Rabbit App
angular.module('starter', ['ionic', 'starter.controller', 'starter.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.directive('focus', function($timeout) {
    return {
        scope : {
            trigger : '@focus'
        },
        link : function(scope, element) {
            scope.$watch('trigger', function(value) {
                if (value === "true") {
                    $timeout(function() {
                        element[0].focus();
                    });
                }
            });
        }
    }
})  

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    $ionicConfigProvider.tabs.position('bottom');
    $ionicConfigProvider.navBar.alignTitle('center');
    $stateProvider
    .state('suggest', {
        cache: false,
        url: '/suggest',
        templateUrl: 'templates/suggestion.html',
        controller: 'SuggestController'
    })
    .state('search', {
        cache: false,
        url: '/search',
        templateUrl: 'templates/search.html',
        controller: 'SearchController'
    })
    .state('tabs', {
        url: '/tabs',
        abstract: true,
        templateUrl: 'templates/tabs.html'
    })
    .state('tabs.news', {
        url: '/news',
        views: {
            'newsContent': {
                templateUrl: 'templates/news.html',
                controller: 'NewsController'
            }
        }
    })
    .state('tabs.followinglist', {
        url: '/followinglist/:followinglistId',
        views: {
            'newsContent': {
                templateUrl: 'templates/followinglist.html',
                controller: 'FollowingListController'
            }
        }
    })
    .state('tabs.favorites', {
        url: '/favorites',
        views: {
            'newsContent': {
                templateUrl: 'templates/highlight.html',
                controller: 'FavoritesController'
            }
        }
    })
    .state('tabs.reading', {
        url: '/news/:newsId',
        views: {
            'newsContent': {
                templateUrl: 'templates/reading.html',
                controller: 'ReadingController'
            }
        }
    })
    .state('tabs.social', {
        url: '/social',
        views: {
            'socialmediaContent': {
                templateUrl: 'templates/socialmedia.html'
            }
        }
    });
    $urlRouterProvider.otherwise('/tabs/news');
});