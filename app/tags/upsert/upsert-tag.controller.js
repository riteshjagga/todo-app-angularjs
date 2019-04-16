'use strict';

angular.module('todoApp.tags')
    .controller('UpsertTagController', [
        '$scope',
        '$state',
        '$stateParams',
        '$http',
        '$q',
        'ConfigService',
        function ($scope,
                  $state,
                  $stateParams,
                  $http,
                  $q,
                  ConfigService) {

            var vm = this;
            vm.loading = true;
            vm.inActionLoading = false;
            vm.isNew = ($stateParams.id === '');
            vm.tag = null;

            vm.upsertTag = upsertTag;

            init();

            function init() {
                vm.loading = true;
                getTag()
                    .then(function (response) {
                        vm.tag = response.data;
                        vm.loading = false;
                    })
                    .catch(function (error) {
                        console.log('Error loading tag');
                        vm.loading = false;
                    });
            }

            function getTag() {
                var defer = $q.defer();

                if (vm.isNew) {
                    defer.resolve({data: {name: ''}});
                } else {
                    return $http.get(ConfigService.getBaseUrl() + '/tags/' + $stateParams.id);
                }

                return defer.promise;
            }

            function upsertTag() {
                vm.inActionLoading = true;

                var data = {
                    tag: {
                        name: vm.tag.name
                    }
                };

                var request = null;

                if (vm.isNew) {
                    request = $http.post(ConfigService.getBaseUrl() + '/tags', data);
                } else {
                    request = $http.put(ConfigService.getBaseUrl() + '/tags/' + $stateParams.id, data);
                }

                request
                    .then(function (response) {
                        console.log('Tag created/updated');
                        vm.inActionLoading = false;
                        $state.go('main.tags.list');
                    })
                    .catch(function (error) {
                        console.log('Error creating tag');
                        vm.inActionLoading = false;
                    });
            }


        }]);