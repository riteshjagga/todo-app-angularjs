'use strict';

angular.module('todoApp.tags')
    .controller('UpsertTagController', [
        '$scope',
        '$state',
        '$stateParams',
        '$http',
        '$q',
        function ($scope,
                  $state,
                  $stateParams,
                  $http,
                  $q) {

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
                    defer.resolve({data: {title: '', tag_ids: []}});
                } else {
                    return $http.get('http://localhost:3000/tags/' + $stateParams.id);
                }

                return defer.promise;
            }

            /*function mapTags(tags) {
                return tags.map(function (tag) {
                    var index = vm.todo.tag_ids.findIndex(function (tagId) {
                        return tagId.$oid === tag._id.$oid;
                    });

                    tag.selected = (index >= 0);
                    return tag;
                });
            }*/

            function upsertTag() {
                vm.loading = true;

                var data = {
                    tag: {
                        name: vm.tag.name
                    }
                };

                var request = null;

                if (vm.isNew) {
                    request = $http.post('http://localhost:3000/tags', data);
                } else {
                    request = $http.put('http://localhost:3000/tags/' + $stateParams.id, data);
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