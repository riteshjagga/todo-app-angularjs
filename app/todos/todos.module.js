'use strict';

angular
    .module('todoApp.todos', ['ngRoute'])
    .config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state({
                name: 'todos',
                url: '/todos',
                abstract: true,
                template: '<ui-view></ui-view>'
            })
            .state({
                name: 'todos.list',
                url: '/list?filterBy',
                templateUrl: 'todos/list/list-todos.html',
                controller: 'ListTodosController',
                controllerAs: 'vm',
                params: { filterBy: 'active'}
            })
        /*$stateProvider
            .when('/todos-list', {
                templateUrl: 'todos/list/list-todos.html',
                controller: 'ListTodosController'
            })*/
            /*.when('/todos/list', {
                templateUrl: 'todos/list/list-todos.html',
                controller: 'ListTodosController'
            })*/;
    }]);
