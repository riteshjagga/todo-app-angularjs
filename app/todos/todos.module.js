'use strict';

angular
    .module('todoApp.todos', [])
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
            .state({
                name: 'todos.upsert',
                url: '/upsert/:id',
                templateUrl: 'todos/upsert/upsert-todo.html',
                controller: 'UpsertTodoController',
                controllerAs: 'vm'
            });
    }]);
