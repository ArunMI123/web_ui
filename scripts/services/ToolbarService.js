/*RequestControler
    Description: This module will contain all Alert related funtionalities
    Input:
    Output:

    Last Updated: 11/10/2016 -  Initial creation
*/
(function () {
    'use strict';

    angular
        .module('ARB.Services')
        .factory('ToolbarService', factory);

    factory.$inject = ['$location'];

    function factory($location) {

        var buttonContext = {

            back: {
                visible: false,
                defaultHandler: backHandler
            },
            newRequest: {
                visible: false,
                defaultHandler : newRequestHandler
            },
            User: {
                visible: false,
                },
            cancel: {
                visible: false
            },
            save: {
                visible: false
            },
            submit: {
                visible: false
            },
            attachFiles: {
                visible: false
            },
            adminFunctions: {
                visible: false
            },
            reminder: {
                visible: false
            },
            copyfrom: {
                visible: false
            }
        }

        
        function registerButton(buttonName,useExistingHandler, handler){
            buttonContext[buttonName].visible = true;

            if (!useExistingHandler)
                buttonContext[buttonName].handler = handler ? handler : buttonContext[buttonName].defaultHandler;
        }

        function unregisterButton(buttonName) {
            buttonContext[buttonName].visible = false;
        }

        function reset() {
            for (var key in buttonContext) {
                buttonContext[key].visible = false;
                buttonContext[key].handler = undefined;
            }
        }

        function newRequestHandler() {
            $location.path("/request")
        }

        function backHandler() {
            $location.path("/workQueue")
        }

        var service = {
            ButtonContext: buttonContext,
            RegisterButton: registerButton,
            UnregisterButton: unregisterButton,
            Reset: reset,
            AttactmentFiles: []
        };

        return service;


    }
})();