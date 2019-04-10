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
            vm.tagLoading = true;
            vm.loading = false;
            vm.isNew = ($stateParams.id === '');
            vm.tag = null;

            vm.upsertTag = upsertTag;

            init();

            function init() {
                vm.tagLoading = true;
                getTag()
                    .then(function (response) {
                        vm.tag = response.data;
                        console.log(vm.tag);
                        vm.tagLoading = false;
                    })
                    .catch(function (error) {
                        console.log('Error loading tag');
                        vm.tagLoading = false;
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
                vm.loading = true;

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
                        console.log('Tag created');
                        vm.loading = false;
                        $state.go('main.tags.list');
                    })
                    .catch(function (error) {
                        console.log('Error creating tag');
                        vm.loading = false;
                    });
            }


        }]);