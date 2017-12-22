/*RequestControler
    Description: This module Declares ARB Header directive
    Input:
    Output:

    Last Updated: 11/2/2016 -  Initial creation
*/

(function() {
    'use strict';

    angular
        .module('ARB.Directives')
        .directive('arbHeader', arbHeader);

    function arbHeader ($window,UserService){
        // Usage:
        //     <arbHeader></arbHeader>
        // Creates:
        // 
        var directive = {
            link: link,
            restrict: 'E',
            templateUrl:"Views/Templates/ArbHeader.html"
        };
        return directive;

        function link(scope, element, attrs) {
            scope.getProfile = UserService.GetProfile;
            scope.getswitch = UserService.Getswitch;
            scope.IsSwitch = UserService.IsSwitch;
            scope.SwitchUser = UserService.SwitchUser;
            scope.OtherProfile = UserService.OtherProfile
            scope.Logout = UserService.Logout;
        }
    }

})();