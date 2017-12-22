/*RequestControler
    Description: This module declares ARB Toolbar directive
    Input:
    Output:

    Last Updated: 11/3/2016 -  Initial creation
*/

(function() {
    'use strict';

    angular
        .module('ARB.Directives')
        .directive('arbToolbar', arbToolbar);

    arbToolbar.$inject = ['$window', 'AlertService', 'ToolbarService'];
    
    function arbToolbar ($window,AlertService,ToolbarService) {
        // Usage:
        //     <arbHeader></arbHeader>
        // Creates:
        // 
        var directive = {
            link: link,
            restrict: 'E',
            templateUrl:"Views/Templates/ArbToolbar.html"
        };
        return directive;

        function link(scope, element, attrs) {
            scope.AlertService = AlertService;
            scope.ToolbarService = ToolbarService;
        }
    }

})();