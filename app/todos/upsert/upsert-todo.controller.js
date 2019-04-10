'use strict';

angular.module('todoApp.todos')
    .controller('UpsertTodoController', [
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
            vm.tagsLoading = true;
            vm.loading = false;
            vm.checkboxesTouched = false;
            vm.isNew = ($stateParams.id === '');
            vm.todo = null;
            vm.tags = [];


            vm.someTagsSelected = someTagsSelected;
            vm.upsertTodo = upsertTodo;

            init();

            function init() {
                vm.tagsLoading = true;
                $q.all([getTodo(), getTags()])
                    .then(function (responses) {
                        vm.todo = responses[0].data;
                        vm.tags = mapTags(responses[1].data.tags);
                        console.log(vm.todo);
                        vm.tagsLoading = false;
                    })
                    .catch(function (error) {
                        console.log('Error loading tags/todo');
                        vm.tagsLoading = false;
                    });
            }

            function getTags() {
                return $http.get('http://localhost:3000/tags')
            }

            function getTodo() {
                var defer = $q.defer();

                if (vm.isNew) {
                    defer.resolve({data: {title: '', tag_ids: []}});
                } else {
                    return $http.get('http://localhost:3000/todos/' + $stateParams.id);
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
                console.log('someTagsSelected: ' + someTagsSelected());
                vm.loading = true;

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
                    request = $http.post('http://localhost:3000/todos', data);
                } else {
                    request = $http.put('http://localhost:3000/todos/' + $stateParams.id, data);
                }

                request.then(function (response) {
                    console.log('Todo created');
                    vm.loading = false;
                    $state.go('todos.list');
                })
                    .catch(function (error) {
                        console.log('Error creating todo');
                        vm.loading = false;
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