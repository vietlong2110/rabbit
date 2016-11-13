// Rabbit App
angular.module('starter', ['ionic', 'ngCordovaOauth', 'ngCordova', 'starter.services', 'app.controller', 
'login.controller', 'register.controller', 'news.controller', 'socialmedia.controller',
'suggest.controller', 'search.controller', 'socialsearch.controller', 'reading.controller',
'socialreading.controller', 'favorites.controller', 'socialfavorites.controller',
'followinglist.controller', 'socialfollowinglist.controller', 'login-ui.controller',
'discover.controller'])

.constant('AUTH_EVENTS', {
    notAuthenticated: 'auth-not-authenticated'
})

.constant('API_ENDPOINT', {
    url: 'http://54.159.29.138:8080/auth',
    api: 'http://54.159.29.138:8080/clientapi'
    // url: 'http://localhost:8080/auth',
    // api: 'http://localhost:8080/clientapi'
})

.constant('FB', {
    AppID: '912527028853859'
})

.constant('LOAD_SIZE', 5)

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

// .run(function ($rootScope, $state, AuthService, AUTH_EVENTS) {
//     $rootScope.$on('$stateChangeStart', function (event, next, nextParams, fromState) {
//         if (!AuthService.isAuthenticated()) {
//             // console.log(next.name);
//             if (next.name !== 'login' && next.name !== 'register') {
//                 event.preventDefault();
//                 $state.go('login');
//             }
//         }
//     });
// })

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
    .state('login-ui', {
        url: '/loginui',
        templateUrl: 'templates/login-ui.html',
        controller: 'LoginUIController'
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
    .state('tabs.discover', {
        url: '/discover',
        views: {
            'discoverContent': {
                templateUrl: 'templates/discover.html',
                controller: 'DiscoverController'
            }
        }
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
    .state('tabs.social', {
        url: '/social',
        views: {
            'socialmediaContent': {
                templateUrl: 'templates/socialmedia.html',
                controller: 'SocialMediaController'
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
    .state('tabs.socialsearch', {
        cache: false,
        url: '/socialsearch',
        views: {
            'socialmediaContent': {
                templateUrl: 'templates/social-search.html',
                controller: 'SocialSearchController'
            }
        }
    })
    .state('tabs.followinglist', {
        url: '/followinglist',
        views: {
            'newsContent': {
                templateUrl: 'templates/followinglist.html',
                controller: 'FollowingListController'
            }
        }
    })
    .state('tabs.socialfollowinglist', {
        url: '/socialfollowinglist',
        views: {
            'socialmediaContent': {
                templateUrl: 'templates/social-followinglist.html',
                controller: 'SocialFollowingListController'
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
    .state('tabs.socialfavorites', {
        url: '/socialfavorites',
        views: {
            'socialmediaContent': {
                templateUrl: 'templates/social-favorites.html',
                controller: 'SocialFavoritesController'
            }
        }
    })
    .state('tabs.reading', {
        url: '/reading',
        views: {
            'newsContent': {
                templateUrl: 'templates/reading.html',
                controller: 'ReadingController'
            },
        }
    })
    .state('tabs.socialreading', {
        url: '/socialreading',
        views: {
            'socialmediaContent': {
                templateUrl: 'templates/social-reading.html',
                controller: 'SocialReadingController'
            },
        }
    });

    $urlRouterProvider.otherwise('/login');
});