'use strict';

// Declare app level module which depends on views, and core components
angular.module('todoApp', [
    'ngAnimate',
    'ngMessages',
    'ui.router',
    'ui.bootstrap',
    'toastr',
    'todoApp.main',
    'todoApp.core',
    'todoApp.todos',
    'todoApp.tags',
    'todoApp.version'
])
    .config([
        '$locationProvider',
        '$urlRouterProvider',
        'toastrConfig',
        function ($locationProvider,
                  $urlRouterProvider,
                  toastrConfig) {

            $locationProvider.hashPrefix('!');
            $urlRouterProvider.otherwise('/todos/list');

            angular.extend(toastrConfig, {
                positionClass: 'toast-bottom-left'
            });
        }]);
