angular.module('todoApp.core')
  .component('preloader', {
      template: '<img class="preloader {{$ctrl.size}}" src="./images/throbber.gif" alt="preloader" />',
      bindings: {
          size: '@'
      }
  });