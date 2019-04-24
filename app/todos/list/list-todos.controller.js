'use strict';

angular.module('todoApp.todos')
    .controller('ListTodosController', [
        '$scope',
        '$state',
        '$stateParams',
        '$http',
        'toastr',
        'TodoStatus',
        'TodoFilter',
        'ConfigService',
        function ($scope,
                  $state,
                  $stateParams,
                  $http,
                  toastr,
                  TodoStatus,
                  TodoFilter,
                  ConfigService) {

            var vm = this;
            vm.errorMessage = '';
            vm.loading = false;

            vm.filters = TodoFilter.toArray();
            vm.selectedFilter = null;

            vm.searchText = '';

            /*
             * For the first time let's load first page having 10 items per page
             * And assume that total pages is 1
             * It is when first request to load todos is received, total pages can be correctly calculated.
             * <total pages> = Math.ceil(<total todos>/<items per page>)
             */
            vm.page = 1;
            vm.itemsPerPage = 10;
            vm.totalPages = 1;
            vm.todos = [];
            vm.totalTodos = 0;

            vm.firstPage = firstPage;
            vm.lastPage = lastPage;
            vm.fromItems = fromItems;
            vm.toItems = toItems;
            vm.getIndexForDisplay = getIndexForDisplay;
            vm.getNextPage = getNextPage;
            vm.getPreviousPage = getPreviousPage;
            vm.getTodos = getTodos;
            vm.searchTodos = searchTodos;
            vm.clearSearchText = clearSearchText;
            vm.searchByTag = searchByTag;
            vm.statuses = statuses;
            vm.updateTodoStatus = updateTodoStatus;
            vm.deleteRestoreTodo = deleteRestoreTodo;
            vm.gotoAddTodo = gotoAddTodo;

            init();

            function init() {
                setFilter();
                getTodos();
            }

            function setFilter() {
                vm.selectedFilter = ($stateParams.filterBy === TodoFilter.DELETED.key) ? vm.filters[1] : vm.filters[0];
            }

            function searchByTag(tag) {
                vm.searchText = 'tag: ' + tag.name;
                getTodos();
            }

            function getTodos() {
                vm.errorMessage = '';
                vm.loading = true;

                var url = ConfigService.getBaseUrl() + '/todos';
                var queryParams = {
                    page: vm.page,
                    items_per_page: vm.itemsPerPage
                };

                if(vm.selectedFilter.key === TodoFilter.DELETED.key) {
                    queryParams.deleted = true;
                }

                /* Check if search text contains tag: keyword
                 * If yes, then search todos from a different url
                 * If no, then check if search test is no empty and search by todo's title
                 */
                var index = vm.searchText.search(/tag:/);
                if(index > -1) {
                    var tagName = vm.searchText.substring((index + 4)).trim();
                    url = ConfigService.getBaseUrl() + '/tags/' + tagName + '/todos';
                } else if(vm.searchText !== '') {
                    queryParams.title = vm.searchText;
                }

                $http.get(url, { params: queryParams })
                    .then(function (response) {
                        vm.totalTodos = response.data.count;
                        vm.totalPages = Math.ceil(vm.totalTodos / vm.itemsPerPage);

                        vm.todos = mapTodos(response.data.todos);

                        vm.loading = false;
                    })
                    .catch(function (error) {
                        vm.errorMessage = error;
                        vm.loading = false;
                    });
            }

            function mapTodos(todos) {
                return todos.map(function (todo) {
                    todo.actionLoading = false;
                    if (todo._status === TodoStatus.NOT_STARTED.key) {
                        todo.status = TodoStatus.NOT_STARTED;
                    } else if (todo._status === TodoStatus.STARTED.key) {
                        todo.status = TodoStatus.STARTED;
                    } else if (todo._status === TodoStatus.FINISHED.key) {
                        todo.status = TodoStatus.FINISHED;
                    }

                    return todo;
                });
            }

            function searchTodos() {
                vm.page = 1;
                getTodos();
            }

            function clearSearchText() {
                vm.searchText = '';
                vm.page = 1;
                getTodos();
            }

            function getNextPage() {
                vm.page++;
                setPageWithinBounds();
                getTodos();
            }

            function getPreviousPage() {
                vm.page--;
                setPageWithinBounds();
                getTodos();
            }

            function firstPage() {
                return (vm.page === 1);
            }

            function lastPage() {
                return (vm.page === vm.totalPages);
            }

            function fromItems() {
                return (vm.totalPages === 0) ? 0 : (((vm.page - 1) * vm.itemsPerPage) + 1);
            }

            function toItems() {
                var to = vm.page * vm.itemsPerPage;
                if (to > vm.totalTodos) {
                    to = vm.totalTodos;
                }

                return to;
            }

            function getIndexForDisplay(index) {
                return ((vm.page - 1) * vm.itemsPerPage) + index + 1;
            }

            function setPageWithinBounds() {
                if (vm.page < 1) {
                    vm.page = 1;
                } else if (vm.page > vm.totalPages) {
                    vm.page = vm.totalPages;
                }
            }

            function statuses() {
                return TodoStatus.toArray();
            }

            function updateTodoStatus(todo) {
                vm.errorMessage = '';
                todo.actionLoading = true;
                var todoId = todo._id.$oid;
                var oldStatus = todo._status;
                var newStatus = todo.status.key;

                $http.patch(ConfigService.getBaseUrl() + '/todos/' + todoId + '/update_status', {
                    'status': newStatus
                })
                    .then(function (response) {
                        todo.actionLoading = false;
                        todo._status = newStatus;
                        toastr.success('Todo status updated');
                    })
                    .catch(function (error) {
                        todo.actionLoading = false;
                        // Reset to old selected status object
                        todo.status = TodoStatus.findByKey(oldStatus);
                        vm.errorMessage = error;
                        toastr.error('Error updating todo status');
                    });
            }

            function deleteRestoreTodo(todo) {
                vm.errorMessage = '';
                todo.actionLoading = true;
                var todoId = todo._id.$oid;

                if(vm.selectedFilter.key === TodoFilter.ACTIVE.key) {
                    $http.delete(ConfigService.getBaseUrl() + '/todos/' + todoId)
                        .then(function (response) {
                            todo.actionLoading = false;
                            toastr.success('Todo deleted');
                            getTodos();
                        })
                        .catch(function (error) {
                            todo.actionLoading = false;
                            vm.errorMessage = error;
                            toastr.error('Error deleting todo');
                        });
                } else {
                    $http.patch(ConfigService.getBaseUrl() + '/todos/' + todoId + '/undo_delete')
                        .then(function (response) {
                            todo.actionLoading = false;
                            toastr.success('Todo restored');
                            getTodos();
                        })
                        .catch(function (error) {
                            todo.actionLoading = false;
                            vm.errorMessage = error;
                            toastr.error('Error restoring todo');
                        });
                }
            }

            function gotoAddTodo() {
                $state.go('main.todos.upsert');
            }

        }]);
