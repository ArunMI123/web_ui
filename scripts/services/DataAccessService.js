(function () {
    'use strict';

    angular
        .module('ARB.Services')
        .factory('DataAccess', factory);

    factory.$inject = ['$http','$timeout'];

    function factory($http,$timeout) {
        var service = {
            ajaxCall: ajaxCall
        };

        return service;


    }
})();