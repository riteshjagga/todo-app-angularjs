'use strict';

describe('Testing ListTagsController', function () {

    var controller, $scope, $httpBackend, tags, totalTags, searchedTags, totalSearchedTags;

    beforeEach(module('todoApp'));
    beforeEach(module('todoApp.tags'));

    beforeEach(inject(function (_$controller_, $rootScope, _$httpBackend_) {
        var i = 0;
        $scope = $rootScope.$new();
        $httpBackend = _$httpBackend_;
        controller = _$controller_('ListTagsController', {$scope: $scope});

        $httpBackend.whenGET(/.html*/).respond(200, '');

        var todoIds = [];
        todoIds.push({"$oid": 1});
        todoIds.push({"$oid": 2});

        totalTags = 35;
        tags = [];
        for (i = 0; i < 10; i++) {
            tags.push({
                "_id": {"$oid": i},
                "created_at": (new Date()).toISOString(),
                "todo_ids": todoIds, // Associate two todos with every tag
                "name": "Tag " + i,
                "updated_at": (new Date()).toISOString()
            });
        }

        totalSearchedTags = 25;
        searchedTags = [];
        for (i = 0; i < 10; i++) {
            searchedTags.push({
                "_id": {"$oid": i},
                "created_at": (new Date()).toISOString(),
                "todo_ids": todoIds, // Associate two todos with every tag
                "name": "[Searched] Tag " + i,
                "updated_at": (new Date()).toISOString()
            });
        }
    }));

    it('initializes variables with default values', function () {
        expect(controller.loading).toBeTruthy();
        expect(controller.searchText).toBe('');
        expect(controller.page).toBe(1);
        expect(controller.itemsPerPage).toBe(10);
        expect(controller.totalPages).toBe(1);
        expect(controller.tags.length).toBe(0);
        expect(controller.totalTags).toBe(0);
    });

    describe('when paginated list of tags is requested on page load', function () {
        it('shows tags when server returns with a FILLED array of tags', function () {
            expect(controller.loading).toBeTruthy();

            $httpBackend.expectGET(/.*?\/tags?.*/g).respond(200, { count: totalTags, tags: tags });
            $httpBackend.flush();

            expect(controller.totalTags).toBe(35);
            expect(controller.totalPages).toBe(4);
            expect(controller.tags.length).toBe(10);
            expect(controller.tags[0].totalTodos).toBe(2);
            expect(controller.loading).toBeFalsy();
        });

        it('expects the creation of totalTodos property on every tag returned by server', function () {
            expect(controller.loading).toBeTruthy();

            $httpBackend.expectGET(/.*?\/tags?.*/g).respond(200, { count: totalTags, tags: tags });
            $httpBackend.flush();

            expect(controller.tags[0].totalTodos).toBe(2);
            expect(controller.tags[1].totalTodos).toBe(2);
            expect(controller.tags[2].totalTodos).toBe(2);
            expect(controller.loading).toBeFalsy();
        });

        it('displays the correct # number of todo when its array index is provided on a particular page of todos', function () {
            controller.totalPages = 4;

            // Assume that you are on 1st page out of total 4 pages
            controller.page = 1;

            $httpBackend.expectGET(/.*?\/tags?.*/g).respond(200, { count: totalTags, tags: tags });
            $httpBackend.flush();

            expect(controller.getIndexForDisplay(0)).toBe(1);
            expect(controller.getIndexForDisplay(tags.length - 1)).toBe(10);

            // Navigate to 2nd page
            $httpBackend.expectGET(/.*?\/tags?.*/g).respond(200, { count: totalTags, tags: tags });
            controller.getNextPage();
            $httpBackend.flush();

            // Check expectation for the first and last tag item
            expect(controller.getIndexForDisplay(0)).toBe(11);
            expect(controller.getIndexForDisplay(tags.length - 1)).toBe(20);

            // Navigate to 3rd page
            $httpBackend.expectGET(/.*?\/tags?.*/g).respond(200, { count: totalTags, tags: tags });
            controller.getNextPage();
            $httpBackend.flush();

            expect(controller.getIndexForDisplay(0)).toBe(21);
            expect(controller.getIndexForDisplay(tags.length - 1)).toBe(30);

            // Navigate to last page
            $httpBackend.expectGET(/.*?\/tags?.*/g).respond(200, { count: totalTags, tags: tags });
            controller.getNextPage();
            $httpBackend.flush();

            expect(controller.getIndexForDisplay(0)).toBe(31);
            expect(controller.getIndexForDisplay(tags.length - 1)).toBe(40);
        });

        it('shows fromItems, toItems, and totalTags equals to ZERO when server returns with an EMPTY array of tags', function () {
            expect(controller.loading).toBeTruthy();

            $httpBackend.expectGET(/.*?\/tags?.*/g).respond(200, { count: 0, tags: [] });
            $httpBackend.flush();

            expect(controller.fromItems()).toBe(0);
            expect(controller.toItems()).toBe(0);
            expect(controller.totalTags).toBe(0);
            expect(controller.totalPages).toBe(0);
            expect(controller.tags.length).toBe(0);
            expect(controller.loading).toBeFalsy();
        });

        it('handles error when server returns an error response', function () {
            expect(controller.loading).toBeTruthy();

            $httpBackend.expectGET(/.*?\/tags?.*/g).respond(403, {});
            $httpBackend.flush();

            expect(controller.errorMessage.status).toBe(403);
            expect(controller.loading).toBeFalsy();
        });
    });

    describe('Using pagination buttons', function () {
        beforeEach(function() {
            // This is for the request on load
            $httpBackend.expectGET(/.*?\/tags?.*/g).respond(200, { count: totalTags, tags: tags });
            $httpBackend.flush();
        });

        it('shows 2nd page of tags when next page button is clicked on 1st page', function () {
            // Assume that you are on 1st page
            controller.page = 1;
            controller.totalPages = 4;

            $httpBackend.expectGET(/.*?\/tags?.*/g).respond(200, { count: totalTags, tags: tags });
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

        it('shows 1st page of tags when previous page button is clicked on 2nd page', function () {
            // Assume that you are on 2nd page
            controller.page = 2;
            controller.totalPages = 4;

            $httpBackend.expectGET(/.*?\/tags?.*/g).respond(200, { count: totalTags, tags: tags });
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

        it('shows 1st page of tags when previous page button is clicked on 1st page (Edge Case)', function () {
            // Assume that you are on 1st page
            controller.page = 1;
            controller.totalPages = 4;

            $httpBackend.expectGET(/.*?\/tags?.*/g).respond(200, { count: totalTags, tags: tags });

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

        it('shows last page of tags when next page button is clicked on last page (Edge Case)', function () {
            // Assume that you are on 4th page
            controller.page = 4;
            controller.totalPages = 4;

            $httpBackend.expectGET(/.*?\/tags?.*/g).respond(200, { count: totalTags, tags: tags });

            controller.getNextPage();
            expect(controller.loading).toBeTruthy();
            $httpBackend.flush();

            expect(controller.page).toBe(4);
            expect(controller.fromItems()).toBe(31);
            expect(controller.toItems()).toBe(totalTags);
            expect(controller.firstPage()).toBeFalsy();
            expect(controller.lastPage()).toBeTruthy();
            expect(controller.loading).toBeFalsy();
        });

        it('shows toItems equals to totalTags on last page', function () {
            // Assume that you are on 3rd page and total pages are 4
            controller.page = 3;
            controller.totalPages = 4;

            $httpBackend.expectGET(/.*?\/tags?.*/g).respond(200, { count: totalTags, tags: tags });
            controller.getNextPage();
            expect(controller.loading).toBeTruthy();
            $httpBackend.flush();

            expect(controller.page).toBe(4);
            expect(controller.fromItems()).toBe(31);
            expect(controller.toItems()).toBe(controller.totalTags);
            expect(controller.loading).toBeFalsy();
        });
    });

    describe('Using search and clear search buttons', function () {
        beforeEach(function() {
            // This is for the request on load
            $httpBackend.expectGET(/.*?\/tags?.*/g).respond(200, { count: totalTags, tags: tags });
            $httpBackend.flush();
        });

        it("shows found set of tags when tag's name is searched", function () {
            controller.searchText = '[Searched]';

            $httpBackend.expectGET(/.*?\/tags?.*/g).respond(200, { count: totalSearchedTags, tags: searchedTags });
            controller.searchTags();
            expect(controller.loading).toBeTruthy();
            $httpBackend.flush();

            expect(controller.page).toBe(1);
            expect(controller.totalTags).toBe(totalSearchedTags);
            expect(controller.totalPages).toBe(3);
            expect(controller.tags.length).toBe(10);
            expect(controller.fromItems()).toBe(1);
            expect(controller.toItems()).toBe(10);
            expect(controller.loading).toBeFalsy();
        });

        it("shows 1st set of found tags when tag's name is searched again on a different page of previous result (Edge Case)", function () {
            controller.searchText = '[Searched]';

            // Upon searching and then navigating, assume that you are on 2nd page now out of a total of 3 pages of searched result
            controller.page = 2;
            controller.totalPages = 3;
            $httpBackend.expectGET(/.*?\/tags?.*/g).respond(200, { count: totalSearchedTags, tags: searchedTags });

            controller.searchText = 'Some different search text';
            controller.searchTags();
            expect(controller.loading).toBeTruthy();
            $httpBackend.flush();

            expect(controller.page).toBe(1);
            expect(controller.totalTags).toBe(totalSearchedTags);
            expect(controller.totalPages).toBe(3);
            expect(controller.tags.length).toBe(10);
            expect(controller.fromItems()).toBe(1);
            expect(controller.toItems()).toBe(10);
            expect(controller.loading).toBeFalsy();
        });

        it('shows 1st page of tags when clear search button is clicked on 3rd page (Edge Case)', function () {
            // Upon navigating, assume that you are on 3rd page now out of a total of 4 pages
            controller.page = 3;
            controller.totalPages = 4;

            $httpBackend.expectGET(/.*?\/tags?.*/g).respond(200, { count: totalTags, tags: tags });
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