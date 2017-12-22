'use strict';

/**
 * @ngdoc overview
 * @name arbApp
 * @description
 * # arbApp
 *
 * Main module of the application.
 */
angular
    .module('arbApp', [
        'ngCookies',
        'ngRoute',
        'ui.bootstrap',
        'ngSanitize',
        'ui.select',
        'ARB.Config',
        'ARB.ReviewConstants',
        'ARB.Directives',
        'ARB.Services',
        'ARB.RequestModule',
        'ARB.LoginModule',
        'ARB.DashboardModule',
        'ARB.DashboardPopupModule',
        'ARB.ManageUserModule'
    ])
    .config(function ($routeProvider, $httpProvider) {

        var $cookies;
 

        angular.injector(['ngCookies']).invoke(['$cookies', function (_$cookies_) {
            $cookies = _$cookies_;
        }]);

        $routeProvider

            .when('/login', {
                templateUrl: 'Views/UserLogin.html',
                controller: 'LoginController',
                controllerAs: 'loginCtrl'
            })
            .when('/request/:requestId?', {
                templateUrl: 'Views/RequestForm.html',
                controller: 'RequestController',
                controllerAs: 'requestCtrl',

            })
            .when('/workQueue', {
                templateUrl: 'Views/WorkQueue.html',
                controller: 'WorkQueueController',
                controllerAs: 'dashboardCtrl'
            })

            .otherwise({
                redirectTo: '/login'
            });

        if ($cookies.get('user') != null && $cookies.get('user') != 'undefined') {
            var user = JSON.parse($cookies.get('user'));
            if (user != null && user != 'undefined') {
                var header = 'Bearer ' + user.AccessToken;
                delete $httpProvider.defaults.headers.common['Authorization'];
                $httpProvider.defaults.headers.common['Authorization'] = header;
            }
        }
    })

    .run(function ($rootScope) {
        $rootScope.viewToolarea = true;
        $rootScope.DashboardService = "http://gateway-svc/";
        $rootScope.UserService = "http://gateway-svc/";
        $rootScope.$on('$routeChangeStart', function (angularEvent, next, current) {
            if (angular.isDefined(next.$$route)) {
                if (next.$$route.originalPath == "/login") {
                    $rootScope.viewHeader = false;
                    $rootScope.viewToolbar = false;
                } else {
                    $rootScope.viewHeader = true;
                    $rootScope.viewToolbar = true;
                }
            }
        })
    });


