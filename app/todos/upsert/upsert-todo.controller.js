'use strict';

angular.module('todoApp.todos')
    .controller('UpsertTodoController', [
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
            vm.errorMessage = '';
            vm.loading = true;
            vm.inActionLoading = false;
            vm.checkboxesTouched = false;
            vm.isNew = ($stateParams.id === '');
            vm.todo = null;
            vm.tags = [];

            vm.someTagsSelected = someTagsSelected;
            vm.upsertTodo = upsertTodo;

            init();

            function init() {
                vm.loading = true;
                $q.all([getTodo(), getTags()])
                    .then(function (responses) {
                        vm.todo = responses[0].data;
                        vm.tags = mapTags(responses[1].data.tags);
                        vm.loading = false;
                    })
                    .catch(function (error) {
                        console.log('Error loading tags/todo');
                        vm.loading = false;
                    });
            }

            function getTags() {
                return $http.get(ConfigService.getBaseUrl() + '/tags')
            }

            function getTodo() {
                var defer = $q.defer();

                if (vm.isNew) {
                    defer.resolve({data: {title: '', tag_ids: []}});
                } else {
                    return $http.get(ConfigService.getBaseUrl() + '/todos/' + $stateParams.id);
                }

                return defer.promise;
            }

            function mapTags(tags) {
                return tags.map(function (tag) {
                    var index = vm.todo.tag_ids.findIndex(function (tagId) {
                        return tagId.$oid === tag._id.$oid;
                    });

                    tag.selected = (index >= 0);
                    return tag;
                });
            }

            function upsertTodo() {
                vm.errorMessage = '';
                vm.inActionLoading = true;

                var selectedTags = vm.tags.filter(function (tag) {
                    return tag.selected;
                });

                var tagIds = selectedTags.map(function (tag) {
                    return tag._id.$oid;
                });

                var data = {
                    todo: {
                        title: vm.todo.title,
                        tag_ids: tagIds
                    }
                };

                var request = null;

                if (vm.isNew) {
                    request = $http.post(ConfigService.getBaseUrl() + '/todos', data);
                } else {
                    request = $http.put(ConfigService.getBaseUrl() + '/todos/' + $stateParams.id, data);
                }

                request.then(function (response) {
                    vm.inActionLoading = false;
                    $state.go('main.todos.list');
                })
                    .catch(function (error) {
                        vm.errorMessage = error;
                        vm.inActionLoading = false;
                    });
            }

            function getSelectedTags() {
                return vm.tags.filter(function (tag) {
                    return tag.selected;
                });
            }

            function someTagsSelected() {
                return getSelectedTags().length > 0;
            }

        }
    ]);