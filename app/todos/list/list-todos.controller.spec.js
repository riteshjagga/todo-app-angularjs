'use strict';

describe('Testing ListTodosController', function () {

    var controller, $scope, $httpBackend, todos, totalTodos, searchedTodos, totalSearchedTodos, tagIds, TodoStatus, TodoFilter;

    beforeEach(module('todoApp'));
    beforeEach(module('todoApp.todos'));

    beforeEach(inject(function ($controller, $rootScope, _$httpBackend_, _TodoStatus_, _TodoFilter_) {
        var i = 0;
        $scope = $rootScope.$new();
        $httpBackend = _$httpBackend_;
        controller = $controller('ListTodosController', {$scope: $scope});
        TodoStatus = _TodoStatus_;
        TodoFilter = _TodoFilter_;

        $httpBackend.whenGET(/.html*/).respond(200, '');

        var tags = [];
        tags.push({"_id": {"$oid": "5c8a44b38b48f5253b4b7b4c"}, "name": "Flower"});
        tags.push({"_id": {"$oid": "5c9cc8328b48f55b024271ec"}, "name": "Social"});
        tagIds = tags.map(function (tag) {
            return tag._id;
        });

        totalTodos = 35;
        todos = [];
        for (i = 0; i < 10; i++) {
            todos.push({
                "_id": {"$oid": i},
                "_status": "not_started",
                "created_at": (new Date()).toISOString(),
                "is_deleted": false,
                "tags": tags,
                "tag_ids": tagIds, // Associate two tags with every todo
                "title": "Todo title" + i,
                "updated_at": (new Date()).toISOString()
            });
        }

        totalSearchedTodos = 25;
        searchedTodos = [];
        for (i = 0; i < 10; i++) {
            searchedTodos.push({
                "_id": {"$oid": i},
                "_status": "not_started",
                "created_at": (new Date()).toISOString(),
                "is_deleted": false,
                "tags": tags,
                "tag_ids": tagIds, // Associate two tags with every todo
                "title": "[Searched] Todo title" + i,
                "updated_at": (new Date()).toISOString()
            });
        }
    }));

    it('initializes variables with default values', function () {
        expect(controller.loading).toBeTruthy();
        expect(controller.selectedFilter).toBe(TodoFilter.ACTIVE);
        expect(controller.searchText).toBe('');
        expect(controller.page).toBe(1);
        expect(controller.itemsPerPage).toBe(10);
        expect(controller.totalPages).toBe(1);
        expect(controller.todos.length).toBe(0);
        expect(controller.totalTodos).toBe(0);
    });

    describe('updating status of a todo', function() {
        var todo;

        beforeEach(function () {
            // This is for the request on load
            $httpBackend.whenGET(/.*?\/todos?.*/g).respond(200, {count: totalTodos, todos: todos});
        });

        it('updates status when server returns a successful response', function () {
            todo = todos[0];
            // Add properties added in controller
            todo.status = TodoStatus.NOT_STARTED;
            todo.actionLoading = false;

            $httpBackend.expectPATCH(/.*\/todos\/.*\/update_status/).respond(200, {
                "_id": {"$oid": 1},
                "_status": "started",
                "created_at": (new Date()).toISOString(),
                "is_deleted": false,
                "tag_ids": tagIds,
                "title": "Todo title 1",
                "updated_at": (new Date()).toISOString()
            });

            // Change status
            todo.status = TodoStatus.STARTED;
            controller.updateTodoStatus(todo);
            expect(todo.actionLoading).toBeTruthy();
            $httpBackend.flush();

            expect(todo.actionLoading).toBeFalsy();
            expect(todo._status).toBe(TodoStatus.STARTED.key);
            expect(todo.status).toBe(TodoStatus.STARTED);
        });

        it('handles error when server returns an error response', function () {
            todo = todos[0];
            // Add properties added in controller
            todo.status = TodoStatus.NOT_STARTED;
            todo.actionLoading = false;

            $httpBackend.expectPATCH(/.*\/todos\/.*\/update_status/).respond(403, {});

            // Change status
            todo.status = TodoStatus.STARTED;
            controller.updateTodoStatus(todo);
            expect(todo.actionLoading).toBeTruthy();
            $httpBackend.flush();

            expect(todo.actionLoading).toBeFalsy();
            expect(todo._status).toBe(TodoStatus.NOT_STARTED.key);
            expect(todo.status).toBe(TodoStatus.NOT_STARTED);
            expect(controller.errorMessage.status).toBe(403);
        });

    });

    describe('deleting todo', function() {
        var todo;

        beforeEach(function () {
            // This is for the request on load
            $httpBackend.whenGET(/.*?\/todos?.*/g).respond(200, {count: totalTodos, todos: todos});
        });

        it('deletes todo when server returns a successful response', function () {
            controller.selectedFilter = TodoFilter.ACTIVE;
            todo = todos[0];
            todo.actionLoading = false;

            $httpBackend.whenGET(/.*?\/todos?.*/g).respond(200, {count: totalTodos, todos: todos});
            $httpBackend.expectDELETE(/.*\/todos\/.*/g).respond(200, {
                "_id": {"$oid": 1},
                "_status": "started",
                "created_at": (new Date()).toISOString(),
                "is_deleted": true,
                "tag_ids": tagIds,
                "title": "Todo title 1",
                "updated_at": (new Date()).toISOString()
            });

            controller.deleteRestoreTodo(todo);
            expect(todo.actionLoading).toBeTruthy();
            $httpBackend.flush();

            expect(todo.actionLoading).toBeFalsy();
        });

        it('handles error when server returns an error response', function () {
            controller.selectedFilter = TodoFilter.ACTIVE;
            todo = todos[0];
            todo.actionLoading = false;

            $httpBackend.expectDELETE(/.*\/todos\/.*/g).respond(403, {});

            controller.deleteRestoreTodo(todo);
            expect(todo.actionLoading).toBeTruthy();
            $httpBackend.flush();

            expect(todo.actionLoading).toBeFalsy();
            expect(controller.errorMessage.status).toBe(403);
        });
    });

    describe('restoring todo', function() {
        var todo;

        beforeEach(function () {
            // This is for the request on load
            $httpBackend.whenGET(/.*?\/todos?.*/g).respond(200, {count: totalTodos, todos: todos});
        });

        it('restores todo when server returns a successful response', function() {
            controller.selectedFilter = TodoFilter.DELETED;
            todo = todos[0];
            todo.actionLoading = false;

            $httpBackend.whenGET(/.*?\/todos?.*/g).respond(200, {count: totalTodos, todos: todos});
            $httpBackend.expectPATCH(/.*\/todos\/.*\/undo_delete/g).respond(200, {
                "_id": {"$oid": 1},
                "_status": "started",
                "created_at": (new Date()).toISOString(),
                "is_deleted": false,
                "tag_ids": tagIds,
                "title": "Todo title 1",
                "updated_at": (new Date()).toISOString()
            });

            controller.deleteRestoreTodo(todo);
            expect(todo.actionLoading).toBeTruthy();
            $httpBackend.flush();

            expect(todo.actionLoading).toBeFalsy();
        });

        it('handles error when server returns an error response', function () {
            controller.selectedFilter = TodoFilter.DELETED;
            todo = todos[0];
            todo.actionLoading = false;

            $httpBackend.expectPATCH(/.*\/todos\/.*/g).respond(403, {});

            controller.deleteRestoreTodo(todo);
            expect(todo.actionLoading).toBeTruthy();
            $httpBackend.flush();

            expect(todo.actionLoading).toBeFalsy();
            expect(controller.errorMessage.status).toBe(403);
        });
    });

    describe('listing paginated todos on page load', function () {
        it('shows todos when server returns with a FILLED array of todos', function () {
            expect(controller.loading).toBeTruthy();

            $httpBackend.expectGET(/.*?\/todos?.*/g).respond(200, {count: totalTodos, todos: todos});
            $httpBackend.flush();

            expect(controller.totalTodos).toBe(35);
            expect(controller.totalPages).toBe(4);
            expect(controller.todos.length).toBe(10);
            expect(controller.todos[0].tags.length).toBe(2);
            expect(controller.loading).toBeFalsy();
        });

        it('expects the creation of status property on every todo returned by server', function () {
            expect(controller.loading).toBeTruthy();

            $httpBackend.expectGET(/.*?\/todos?.*/g).respond(200, {count: totalTodos, todos: todos});
            $httpBackend.flush();

            expect(controller.todos[0].status).toBe(TodoStatus.NOT_STARTED);
            expect(controller.todos[1].status).toBe(TodoStatus.NOT_STARTED);
            expect(controller.todos[2].status).toBe(TodoStatus.NOT_STARTED);
            expect(controller.loading).toBeFalsy();
        });

        it('displays the correct # number of todo when its array index is provided on a particular page of todos', function () {
            controller.totalPages = 4;

            // Assume that you are on 1st page out of total 4 pages
            controller.page = 1;

            $httpBackend.expectGET(/.*?\/todos?.*/g).respond(200, {count: totalTodos, todos: todos});
            $httpBackend.flush();

            expect(controller.getIndexForDisplay(0)).toBe(1);
            expect(controller.getIndexForDisplay(todos.length - 1)).toBe(10);

            // Navigate to 2nd page
            $httpBackend.expectGET(/.*?\/todos?.*/g).respond(200, {count: totalTodos, todos: todos});
            controller.getNextPage();
            $httpBackend.flush();

            // Check expectation for the first and last tag item
            expect(controller.getIndexForDisplay(0)).toBe(11);
            expect(controller.getIndexForDisplay(todos.length - 1)).toBe(20);

            // Navigate to 3rd page
            $httpBackend.expectGET(/.*?\/todos?.*/g).respond(200, {count: totalTodos, todos: todos});
            controller.getNextPage();
            $httpBackend.flush();

            expect(controller.getIndexForDisplay(0)).toBe(21);
            expect(controller.getIndexForDisplay(todos.length - 1)).toBe(30);

            // Navigate to last page
            $httpBackend.expectGET(/.*?\/todos?.*/g).respond(200, {count: totalTodos, todos: todos});
            controller.getNextPage();
            $httpBackend.flush();

            expect(controller.getIndexForDisplay(0)).toBe(31);
            expect(controller.getIndexForDisplay(todos.length - 1)).toBe(40);
        });

        it('shows fromItems, toItems, and totalTodos equals to ZERO when server returns with an EMPTY array of todos', function () {
            expect(controller.loading).toBeTruthy();

            $httpBackend.expectGET(/.*?\/todos?.*/g).respond(200, {count: 0, todos: []});
            $httpBackend.flush();

            expect(controller.fromItems()).toBe(0);
            expect(controller.toItems()).toBe(0);
            expect(controller.totalTodos).toBe(0);
            expect(controller.totalPages).toBe(0);
            expect(controller.todos.length).toBe(0);
            expect(controller.loading).toBeFalsy();
        });

        it('handles error when server returns an error response', function () {
            expect(controller.loading).toBeTruthy();

            $httpBackend.expectGET(/.*?\/todos?.*/g).respond(403, {});
            $httpBackend.flush();

            expect(controller.errorMessage.status).toBe(403);
            expect(controller.loading).toBeFalsy();
        });
    });

    describe('paginating to previous and next pages', function () {
        beforeEach(function () {
            // This is for the request on load
            $httpBackend.expectGET(/.*?\/todos?.*/g).respond(200, {count: totalTodos, todos: todos});
            $httpBackend.flush();
        });

        it('shows 2nd page of todos when next page button is clicked on 1st page', function () {
            // Assume that you are on 1st page
            controller.page = 1;
            controller.totalPages = 4;

            $httpBackend.expectGET(/.*?\/todos?.*/g).respond(200, {count: totalTodos, todos: todos});
            controller.getNextPage();
            expect(controller.loading).toBeTruthy();
            $httpBackend.flush();

            expect(controller.page).toBe(2);
            expect(controller.fromItems()).toBe(11);
            expect(controller.toItems()).toBe(20);
            expect(controller.firstPage()).toBeFalsy();
            expect(controller.lastPage()).toBeFalsy();
            expect(controller.loading).toBeFalsy();
        });

        it('shows 1st page of todos when previous page button is clicked on 2nd page', function () {
            // Assume that you are on 2nd page
            controller.page = 2;
            controller.totalPages = 4;

            $httpBackend.expectGET(/.*?\/todos?.*/g).respond(200, {count: totalTodos, todos: todos});
            controller.getPreviousPage();
            expect(controller.loading).toBeTruthy();
            $httpBackend.flush();

            expect(controller.page).toBe(1);
            expect(controller.fromItems()).toBe(1);
            expect(controller.toItems()).toBe(10);
            expect(controller.firstPage()).toBeTruthy();
            expect(controller.lastPage()).toBeFalsy();
            expect(controller.loading).toBeFalsy();
        });

        it('shows 1st page of todos when previous page button is clicked on 1st page (Edge Case)', function () {
            // Assume that you are on 1st page
            controller.page = 1;
            controller.totalPages = 4;

            $httpBackend.expectGET(/.*?\/todos?.*/g).respond(200, {count: totalTodos, todos: todos});

            controller.getPreviousPage();
            expect(controller.loading).toBeTruthy();
            $httpBackend.flush();

            expect(controller.page).toBe(1);
            expect(controller.fromItems()).toBe(1);
            expect(controller.toItems()).toBe(10);
            expect(controller.firstPage()).toBeTruthy();
            expect(controller.lastPage()).toBeFalsy();
            expect(controller.loading).toBeFalsy();
        });

        it('shows last page of todos when next page button is clicked on last page (Edge Case)', function () {
            // Assume that you are on 4th page
            controller.page = 4;
            controller.totalPages = 4;

            $httpBackend.expectGET(/.*?\/todos?.*/g).respond(200, {count: totalTodos, todos: todos});

            controller.getNextPage();
            expect(controller.loading).toBeTruthy();
            $httpBackend.flush();

            expect(controller.page).toBe(4);
            expect(controller.fromItems()).toBe(31);
            expect(controller.toItems()).toBe(totalTodos);
            expect(controller.firstPage()).toBeFalsy();
            expect(controller.lastPage()).toBeTruthy();
            expect(controller.loading).toBeFalsy();
        });

        it('shows toItems equals to totalTodos on last page', function () {
            // Assume that you are on 3rd page and total pages are 4
            controller.page = 3;
            controller.totalPages = 4;

            $httpBackend.expectGET(/.*?\/todos?.*/g).respond(200, {count: totalTodos, todos: todos});
            controller.getNextPage();
            expect(controller.loading).toBeTruthy();
            $httpBackend.flush();

            expect(controller.page).toBe(4);
            expect(controller.fromItems()).toBe(31);
            expect(controller.toItems()).toBe(controller.totalTodos);
            expect(controller.loading).toBeFalsy();
        });
    });

    describe('using search and clear search buttons', function () {
        beforeEach(function () {
            // This is for the request on load
            $httpBackend.expectGET(/.*?\/todos?.*/g).respond(200, {count: totalTodos, todos: todos});
            $httpBackend.flush();
        });

        it("shows found set of todos when tag's name is searched", function () {
            controller.searchText = '[Searched]';

            $httpBackend.expectGET(/.*?\/todos?.*/g).respond(200, {count: totalSearchedTodos, todos: searchedTodos});
            controller.searchTodos();
            expect(controller.loading).toBeTruthy();
            $httpBackend.flush();

            expect(controller.page).toBe(1);
            expect(controller.totalTodos).toBe(totalSearchedTodos);
            expect(controller.totalPages).toBe(3);
            expect(controller.todos.length).toBe(10);
            expect(controller.fromItems()).toBe(1);
            expect(controller.toItems()).toBe(10);
            expect(controller.loading).toBeFalsy();
        });

        it("shows 1st set of found todos when tag's name is searched again on a different page of previous result (Edge Case)", function () {
            controller.searchText = '[Searched]';

            // Upon searching and then navigating, assume that you are on 2nd page now out of a total of 3 pages of searched result
            controller.page = 2;
            controller.totalPages = 3;
            $httpBackend.expectGET(/.*?\/todos?.*/g).respond(200, {count: totalSearchedTodos, todos: searchedTodos});

            controller.searchText = 'Some different search text';
            controller.searchTodos();
            expect(controller.loading).toBeTruthy();
            $httpBackend.flush();

            expect(controller.page).toBe(1);
            expect(controller.totalTodos).toBe(totalSearchedTodos);
            expect(controller.totalPages).toBe(3);
            expect(controller.todos.length).toBe(10);
            expect(controller.fromItems()).toBe(1);
            expect(controller.toItems()).toBe(10);
            expect(controller.loading).toBeFalsy();
        });

        it('shows 1st page of todos when clear search button is clicked on 3rd page (Edge Case)', function () {
            // Upon navigating, assume that you are on 3rd page now out of a total of 4 pages
            controller.page = 3;
            controller.totalPages = 4;

            $httpBackend.expectGET(/.*?\/todos?.*/g).respond(200, {count: totalTodos, todos: todos});
            controller.clearSearchText();
            expect(controller.loading).toBeTruthy();
            $httpBackend.flush();

            expect(controller.page).toBe(1);
            expect(controller.fromItems()).toBe(1);
            expect(controller.toItems()).toBe(10);
            expect(controller.loading).toBeFalsy();
        });
    });

});