'use strict';

angular.module('todoApp.core')
    .constant('TodoStatus', {
        NOT_STARTED: {key: 'not_started', label: 'Not Started'},
        STARTED: {key: 'started', label: 'Started'},
        FINISHED: {key: 'finished', label: 'Finished'},

        toArray: function() {
            return [this.NOT_STARTED, this.STARTED, this.FINISHED];
        },

        findByKey: function (key) {
            return this.toArray().filter(function(status) {
                return (status.key === key);
            })[0];
        }
    });
