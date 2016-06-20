// Rabbit App
angular.module('starter', ['ionic', 'starter.controller', 'starter.services'])

.constant('AUTH_EVENTS', {
    notAuthenticated: 'auth-not-authenticated'
})

.constant('API_ENDPOINT', {
    url: 'http://localhost:8080/auth'
})

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

.run(function ($rootScope, $state, AuthService, AUTH_EVENTS) {
    $rootScope.$on('$stateChangeStart', function (event, next, nextParams, fromState) {
        if (!AuthService.isAuthenticated()) {
            // console.log(next.name);
            if (next.name !== 'login' && next.name !== 'register') {
                event.preventDefault();
                $state.go('login');
            }
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

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $httpProvider) {
    $ionicConfigProvider.tabs.position('bottom');
    $ionicConfigProvider.navBar.alignTitle('center');

    $httpProvider.interceptors.push('AuthInterceptor');

    $stateProvider
    .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginController'
    })
    .state('register', {
        url: '/register',
        templateUrl: 'templates/register.html',
        controller: 'RegisterController'
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
    .state('suggest', {
        cache: false,
        url: '/suggest',
        templateUrl: 'templates/suggestion.html',
        controller: 'SuggestController'
    })
    .state('tabs.search', {
        cache: false,
        url: '/search',
        views: {
            'newsContent': {
                templateUrl: 'templates/search.html',
                controller: 'SearchController'
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
                templateUrl: 'templates/favorites.html',
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

    $urlRouterProvider.otherwise('/login');
});