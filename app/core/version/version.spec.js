'use strict';

describe('todoApp.version module', function() {
  beforeEach(module('todoApp.version'));

  describe('version service', function() {
    it('should return current version', inject(function(version) {
      expect(version).toEqual('0.1');
    }));
  });
});
