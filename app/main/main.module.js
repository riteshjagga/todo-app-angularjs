'use strict';

angular
    .module('todoApp.main', [])
    .config(['$stateProvider', function ($stateProvider) {

        $stateProvider.state({
            abstract: true,
            name: 'main',
            templateUrl: 'main/main.html'
        });

    }]);