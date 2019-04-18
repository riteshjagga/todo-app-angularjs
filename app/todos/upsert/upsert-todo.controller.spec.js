'use strict';

describe('Testing UpsertTodoController', function () {

    var $controller, ctrl, $scope, $q, deferred, $httpBackend, tags, totalTags, tagIds;
    var newTodo = {data: {title: '', tag_ids: []}};

    /**
     * Regular expression is explained below:
     * Regular expression are enclosed in a pair of forward slash
     * . means any single character, except newline and when combined with *, it means any single character with zero or more occurrences
     * \/ means to escape the forward slash so that it is not treated as regular expression symbol but a literal forward slash character
     * \/todos\/ means url string must have /todos/ and
     * .* at the end means anything can come after /todos/
     */
    var todosUrl = /.*\/todos/;
    var todoUrl = /.*\/todos\/.*/;
    var tagsUrl = /.*\/tags/;


    /* var todosUrl = new RegExp('.*\/todos');
    var tagsUrl = new RegExp('.*\/tags');*/

    beforeEach(module('todoApp'));
    beforeEach(module('todoApp.todos'));

    beforeEach(inject(function (_$controller_, $rootScope, _$q_, _$httpBackend_) {
        $controller = _$controller_;

        $scope = $rootScope.$new();

        $q = _$q_;
        deferred = _$q_.defer(); // We use the $q service to create a mock instance of defer

        $httpBackend = _$httpBackend_;
        $httpBackend.whenGET(/.*.html/).respond(200, '');

        totalTags = 10;
        tags = [];
        for (var i = 0; i < totalTags; i++) {
            tags.push({
                "_id": {"$oid": i},
                "created_at": (new Date()).toISOString(),
                "todo_ids": [{"$oid": 1}, {"$oid": 2}], // Associate two todos with every tag
                "name": "Tag " + i,
                "updated_at": (new Date()).toISOString()
            });
        }
    }));

    it('initializes variables with default values', function () {
        $httpBackend.expectGET(tagsUrl).respond(200, { count: totalTags, tags: tags });
        ctrl = $controller('UpsertTodoController', {$scope: $scope, $stateParams: {id: ''}});

        expect(ctrl.errorMessage).toBe('');
        expect(ctrl.loading).toBeTruthy();
        expect(ctrl.inActionLoading).toBeFalsy();
        expect(ctrl.isNew).toBeTruthy();
        expect(ctrl.todo).toBe(null);
        expect(ctrl.tags.length).toBe(0);

        $httpBackend.flush();

        expect(ctrl.loading).toBeFalsy();
        expect(ctrl.todo.title).toBe('');
        expect(ctrl.tags.length).toBe(10);
    });

    describe('Adding new todo i.e. when id is NOT provided in $stateParams', function() {

        beforeEach(function() {
            $httpBackend.expectGET(tagsUrl).respond(200, { count: totalTags, tags: tags });
            ctrl = $controller('UpsertTodoController', {$scope: $scope, $stateParams: {id: ''}});
            $httpBackend.flush();
        });

        it('adds new todo when server returns a successful response', function() {
            // Arrangements
            $httpBackend.expectPOST(todosUrl).respond(200, {todo: ctrl.todo});
            ctrl.todo.title = 'New Tag';
            ctrl.todo.tag_ids = [{"$oid": 1}, {"$oid": 2}];

            // Actions
            ctrl.upsertTodo();

            // Assertions
            expect(ctrl.inActionLoading).toBeTruthy();

            // Actions
            $httpBackend.flush();

            // Assertions
            expect(ctrl.inActionLoading).toBeFalsy();
        });

        it('handles error when server returns an error response', function() {
            // Arrangements
            $httpBackend.expectPOST(todosUrl).respond(403, {});
            ctrl.todo.title = 'New Tag';
            ctrl.todo.tag_ids = [{"$oid": 1}, {"$oid": 2}];

            // Actions
            ctrl.upsertTodo();

            // Assertions
            expect(ctrl.inActionLoading).toBeTruthy();

            // Actions
            $httpBackend.flush();

            // Assertions
            expect(ctrl.inActionLoading).toBeFalsy();
            expect(ctrl.errorMessage.status).toBe(403);
        });

    });

    describe('Updating todo i.e. when id is provided in $stateParams', function() {

        beforeEach(function() {
            $httpBackend.expectGET(todoUrl).respond(200, { title: 'Water the plants', tag_ids: [{"$oid": 1}, {"$oid": 2}] });
            $httpBackend.expectGET(tagsUrl).respond(200, { count: totalTags, tags: tags });
            ctrl = $controller('UpsertTodoController', {$scope: $scope, $stateParams: {id: '1'}});
            $httpBackend.flush();
        });

        it('updates todo when server returns a successful response', function() {
            // Arrangements
            $httpBackend.expectPUT(todoUrl).respond(200, {todo: ctrl.todo});
            ctrl.todo.title = 'Water the veggies';
            ctrl.todo.tag_ids = [{"$oid": 1}];

            // Actions
            ctrl.upsertTodo();

            // Assertions
            expect(ctrl.inActionLoading).toBeTruthy();

            // Actions
            $httpBackend.flush();

            // Assertions
            expect(ctrl.inActionLoading).toBeFalsy();
        });

        it('handles error when server returns an error response', function() {
            // Arrangements
            $httpBackend.expectPUT(todoUrl).respond(403, {});
            ctrl.todo.title = 'Water the veggies';
            ctrl.todo.tag_ids = [{"$oid": 1}];

            // Actions
            ctrl.upsertTodo();

            // Assertions
            expect(ctrl.inActionLoading).toBeTruthy();

            // Actions
            $httpBackend.flush();

            // Assertions
            expect(ctrl.inActionLoading).toBeFalsy();
            expect(ctrl.errorMessage.status).toBe(403);
        });

    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
});