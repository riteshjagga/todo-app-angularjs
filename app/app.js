'use strict';

// Declare app level module which depends on views, and core components
angular.module('todoApp', [
  'ngMessages',
  'ui.router',
  'ui.bootstrap',
  'todoApp.core',
  'todoApp.todos',
  'todoApp.version'
]).
config([
  '$locationProvider',
  '$urlRouterProvider',
  function($locationProvider,
           $urlRouterProvider) {

  $locationProvider.hashPrefix('!');
  $urlRouterProvider.otherwise('/todos/list');

}]);
