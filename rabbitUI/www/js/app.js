// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'starter.controller'])

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

.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/keywords.html',
        controller: 'KeywordsController'
    })
    .state('app.newsfeed', {
        url: '/newsfeed',
        views: {
            'newsfeedContent': {
                templateUrl: 'templates/newsfeed.html',
                controller: 'NewsfeedController'
            }
        }
    })
    .state('app.reading', {
        url: '/newsfeed/:newsfeedId',
        views: {
            'newsfeedContent': {
                templateUrl: 'templates/reading.html',
                controller: 'ReadingController'
            }
        }
    })
    .state('app.search', {
        url: '/search/:q',
        views: {
            'newsfeedContent': {
                templateUrl: 'templates/search.html',
                controller: 'SearchController'
            }
        }
    })
    .state('app.highlight', {
        url: '/highlight',
        views: {
            'newsfeedContent': {
                templateUrl: 'templates/highlight.html',
                controller: 'HighlightController'
            }
        }
    });
    $urlRouterProvider.otherwise('/app/newsfeed');
});
