/*RequestControler
    Description: This module Declares ARB Header directive
    Input:
    Output:

    Last Updated: 11/9/2016 -  Initial creation
*/

(function() {
    'use strict';

    angular
        .module('ARB.Directives')
        .directive('arbLoading', arbLoader);

    function arbLoader($window, AlertService) {
        // Usage:
        //     <arb-loading></arb-loading>
        // Creates:
        // 
        var directive = {
            link: link,
            restrict: 'E',
            templateUrl:"Views/Templates/ArbLoading.html"
        };
        return directive;

        function link(scope, element, attrs) {
            scope.AlertService = AlertService;
            
        }
    }

})();