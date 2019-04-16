'use strict';

angular.module('todoApp.core')
    .constant('TodoFilter', {
        ACTIVE: {key: 'active', label: 'Active'},
        DELETED: {key: 'deleted', label: 'Deleted'},

        toArray: function() {
            return [this.ACTIVE, this.DELETED];
        },

        findByKey: function (key) {
            return this.toArray().filter(function(status) {
                return (status.key === key);
            })[0];
        }
    });
