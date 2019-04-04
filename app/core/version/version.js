'use strict';

angular.module('todoApp.version', [
  'todoApp.version.interpolate-filter',
  'todoApp.version.version-directive'
])

.value('version', '0.1');
