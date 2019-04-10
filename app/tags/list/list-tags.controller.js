'use strict';

angular.module('todoApp.tags')
    .controller('ListTagsController', [
        '$scope',
        '$http',
        'ConfigService',
        function ($scope,
                  $http,
                  ConfigService) {


            var vm = this;
            vm.loading = true;
            vm.searchText = '';

            /*
             * For the first time let's load first page having 10 items per page
             * And assume that total pages is 1
             * It is when first request to load tags is received, total pages can be correctly calculated.
             * <total pages> = Math.ceil(<total tags>/<items per page>)
             */
            vm.page = 1;
            vm.itemsPerPage = 10;
            vm.totalPages = 1;
            vm.tags = [];
            vm.totalTags = 0;

            vm.firstPage = firstPage;
            vm.lastPage = lastPage;
            vm.fromItems = fromItems;
            vm.toItems = toItems;
            vm.getIndexForDisplay = getIndexForDisplay;
            vm.getNextPage = getNextPage;
            vm.getPreviousPage = getPreviousPage;
            vm.getTags = getTags;
            vm.clearSearchText = clearSearchText;
            vm.gotoAddTag = gotoAddTag;

            init();

            function init() {
                getTags();
            }

            function getTags() {
                var errorMessage = '';
                vm.loading = true;

                var url = ConfigService.getBaseUrl() + '/tags';
                var queryParams = {
                    page: vm.page,
                    items_per_page: vm.itemsPerPage
                };

                if (vm.searchText !== '') {
                    queryParams.name = vm.searchText;
                }

                $http.get(url, {params: queryParams})
                    .then(function (response) {
                        vm.totalTags = response.data.count;
                        vm.totalPages = Math.ceil(vm.totalTags / vm.itemsPerPage);

                        vm.tags = mapTags(response.data.tags);

                        vm.loading = false;
                    })
                    .catch(function (error) {
                        errorMessage = error;
                        vm.loading = false;
                    });
            }

            function mapTags(tags) {
                return tags.map(function (tag) {
                    tag.totalTodos = tag.todo_ids.length;
                    return tag;
                });
            }

            function clearSearchText() {
                vm.searchText = '';
                getTags();
            }

            function getNextPage() {
                vm.page++;
                setPageWithinBounds();
                getTags();
            }

            function getPreviousPage() {
                vm.page--;
                setPageWithinBounds();
                getTags();
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
                if (to > vm.totalTags) {
                    to = vm.totalTags;
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

            function gotoAddTag() {
                $state.go('main.tags.upsert');
            }
        }]);