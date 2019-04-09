'use strict';

angular.module('todoApp.core')
    .service('ConfigService', [
        '$window',
        function($window) {
            this.getBaseUrl = getBaseUrl;

            function getBaseUrl () {
              if($window.location.href.search(/localhost/) > -1) {
                  return 'http://localhost:3000'
              } else {
                  return 'https://rj-todo-app-herokuapp.com';
              }
            }

        }]);