'use strict';

angular
    .module('todoApp.tags', [])
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state({
                name: 'main.tags',
                url: '/tags',
                abstract: true,
                template: '<ui-view></ui-view>'
            })
            .state({
                name: 'main.tags.list',
                url: '/list',
                templateUrl: 'tags/list/list-tags.html',
                controller: 'ListTagsController',
                controllerAs: 'vm'
            })
            .state({
                name: 'main.tags.upsert',
                url: '/upsert/:id',
                templateUrl: 'tags/upsert/upsert-tag.html',
                controller: 'UpsertTagController',
                controllerAs: 'vm'
            });
    }]);
