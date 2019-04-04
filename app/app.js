'use strict';

// Declare app level module which depends on views, and core components
angular.module('todoApp', [
  'ngRoute',
  'ui.router',
  'ui.bootstrap',
  'todoApp.core',
  'todoApp.todos',
  'todoApp.view1',
  'todoApp.view2',
  'todoApp.version'
]).
config([
  '$locationProvider',
  '$routeProvider',
  '$urlRouterProvider',
  '$stateProvider',
  function($locationProvider,
           $routeProvider,
           $urlRouterProvider,
           $stateProvider) {
  $locationProvider.hashPrefix('!');

  //$routeProvider.otherwise({redirectTo: '/view1'});
  //$routeProvider.otherwise({redirectTo: '/todos/list'});
  $urlRouterProvider.otherwise('/todos/list');

}]);
