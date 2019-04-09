'use strict';

angular.module('todoApp.todos')
    .controller('ListTodosController', [
        '$scope',
        '$state',
        '$http',
        'TodoStatus',
        'ConfigService',
        function ($scope,
                  $state,
                  $http,
                  TodoStatus,
                  ConfigService) {

            var vm = this;
            vm.loading = true;

            vm.filters = [
                {key: 'active', label: 'Active'},
                {key: 'deleted', label: 'Deleted'}
             ];
            vm.selectedFilter = vm.filters[0];

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
            vm.getTodoIndexForDisplay = getTodoIndexForDisplay;
            vm.getNextPage = getNextPage;
            vm.getPreviousPage = getPreviousPage;
            vm.getTodos = getTodos;
            vm.clearSearchText = clearSearchText;
            vm.searchByTag = searchByTag;
            vm.statuses = statuses;
            vm.updateTodoStatus = updateTodoStatus;
            vm.deleteRestoreTodo = deleteRestoreTodo;

            init();

            function init() {
                setFilter();
                getTodos();
            }

            function setFilter() {
                vm.selectedFilter = ($state.params.filterBy === 'active') ? vm.filters[0] : vm.filters[1];
            }

            function searchByTag(tag) {
                vm.searchText = 'tag: ' + tag.name;
                getTodos();
            }

            function getTodos() {
                var errorMessage = '';
                vm.loading = true;

                console.log();
                var url = ConfigService.getBaseUrl() + '/todos';
                var queryParams = {
                    page: vm.page,
                    items_per_page: vm.itemsPerPage
                };

                if(vm.selectedFilter.key === 'deleted') {
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
                        errorMessage = error;
                        vm.loading = false;
                    });
            }

            function mapTodos(todos) {
                return todos.map(function (todo) {
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

            function clearSearchText() {
                vm.searchText = '';
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

            function getTodoIndexForDisplay(index) {
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
                var todoId = todo._id.$oid;
                var oldStatus = todo._status;
                var newStatus = todo.status.key;

                $http.patch(ConfigService.getBaseUrl() + '/todos/' + todoId + '/update_status', {
                    'status': newStatus
                })
                    .then(function (response) {
                        todo._status = newStatus;
                        console.log('Todo status updated');
                    })
                    .catch(function (error) {
                        console.log('Error updating todo status');

                        // Reset to old selected status object
                        todo.status = TodoStatus.findByKey(oldStatus);
                    });
            }

            function deleteRestoreTodo(todo) {
                var todoId = todo._id.$oid;

                if(vm.selectedFilter.key === 'active') {
                    $http.delete(ConfigService.getBaseUrl() + '/todos/' + todoId)
                        .then(function (response) {
                            console.log('Deleted');
                            getTodos();
                        })
                        .catch(function (error) {
                            console.log('Error deleting todo');
                        });
                } else {
                    $http.patch(ConfigService.getBaseUrl() + '/todos/' + todoId + '/undo_delete')
                        .then(function (response) {
                            console.log('Undo Delete');
                            getTodos();
                        })
                        .catch(function (error) {
                            console.log('Error restoring todo');
                        });
                }
            }

        }]);
