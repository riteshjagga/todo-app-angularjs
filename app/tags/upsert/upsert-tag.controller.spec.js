'use strict';

describe('Testing UpsertTagController', function () {

    var $controller, ctrl, $scope, $q, deferred, $httpBackend;
    var newTag = {data: {name: ''}};

    /**
     * Regular expression is explained below:
     * Regular expression are enclosed in a pair of forward slash, and g after the ending forward slash means its a global search
     * . means any single character, except newline and when combined with *, it means any single character with zero or more occurrences
     * \/ means to escape the forward slash so that it is not treated as regular expression symbol but a literal forward slash character
     * \/tags\/ means url string must have /tags/ and
     * .* at the end means anything can come after /tags/
     */
    var tagsUrl = /.*\/tags/g;
    var tagUrl = /.*\/tags\/.*/g;

    beforeEach(module('todoApp'));
    beforeEach(module('todoApp.tags'));

    beforeEach(inject(function (_$controller_, $rootScope, _$q_, _$httpBackend_) {
        $controller = _$controller_;

        $scope = $rootScope.$new();

        $q = _$q_;
        deferred = _$q_.defer(); // We use the $q service to create a mock instance of defer

        $httpBackend = _$httpBackend_;
        $httpBackend.whenGET(/.html*/).respond(200, '');
    }));

    it('initializes variables with default values', function () {
        ctrl = $controller('UpsertTagController', {$scope: $scope, $stateParams: {id: ''}});
        expect(ctrl.loading).toBeTruthy();
        expect(ctrl.inActionLoading).toBeFalsy();
        expect(ctrl.tag).toBe(null);
        expect(ctrl.isNew).toBeTruthy();
    });

    describe('when id is NOT provided in $stateParams', function() {

        beforeEach(function() {
            ctrl = $controller('UpsertTagController', {$scope: $scope, $stateParams: {id: ''}});
        });

        it('shows new tag form', function () {
            //ctrl = $controller('UpsertTagController', {$scope: $scope, $stateParams: {id: ''}});
            expect(ctrl.isNew).toBeTruthy();
            expect(ctrl.loading).toBeTruthy();

            deferred.resolve(newTag);
            $scope.$apply(); // We have to call apply for this to work

            expect(ctrl.loading).toBeFalsy();
            expect(ctrl.tag.name).toBe('');
        });

        it('adds new tag when add tag form is submitted', function() {
            expect(ctrl.isNew).toBeTruthy();

            deferred.resolve(newTag);
            $scope.$apply(); // We have to call apply for this to work

            $httpBackend.expectPOST(tagsUrl).respond(200, { name: 'Flower' });
            ctrl.upsertTag();
            expect(ctrl.inActionLoading).toBeTruthy();
            $httpBackend.flush();
            
            expect(ctrl.inActionLoading).toBeFalsy();
        });
    });

    describe('when id is provided in $stateParams', function() {
        beforeEach(function () {
            ctrl = $controller('UpsertTagController', {$scope: $scope, $stateParams: {id: '1'}});

            expect(ctrl.isNew).toBeFalsy();
            expect(ctrl.loading).toBeTruthy();

            var tagUrl = /.*\/tags\/.*/g;
            $httpBackend.expectGET(tagUrl).respond(200, { name: 'Flower' });
            $httpBackend.flush();
            expect(ctrl.loading).toBeFalsy();
        });

        it('shows edit tag form', function () {
            expect(ctrl.tag.name).toBe('Flower');
        });

        it('updated tag when edit tag form is submitted', function() {
            $httpBackend.expectPUT(tagUrl).respond(200, { name: 'Flora' });
            ctrl.upsertTag();
            expect(ctrl.inActionLoading).toBeTruthy();
            $httpBackend.flush();

            expect(ctrl.inActionLoading).toBeFalsy();
        });
    });

});