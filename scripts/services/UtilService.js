/*RequestControler
    Description: This module will contain all Alert related funtionalities
    Input:
    Output:

    Last Updated: 11/8/2016 -  Initial creation
*/
(function () {
    'use strict';

    angular
        .module('ARB.Services')
        .factory('UtilService', factory);

    factory.$inject = ['$timeout','$filter'];

    function factory($timeout,$filter) {
        
       
         /*
         Description: Convert a date value to a more human friendly string M/D/YYYY
         Input: theDateToFormat - the date type variable
         Output: string representation of the date value

         Last Update:    11/15/2016 Updated for Angular
         7/20/2015 - JDS: Updated notes and description
         6/15/2015 - JDS: Initial Creation
         */
        function dateToString(theDateToFormat) {
          
            if (isRealValue(theDateToFormat)) {
                if (typeof (theDateToFormat) !== null && theDateToFormat !== 'undefined') {
                    return $filter('date')(theDateToFormat,'MM/dd/yyyy');
                } else {
                    return '';
                }
            }
        }

          /*
        Description: function to test objects for null, undefined or empty
        Input: obj = object to test
        Output:
    
        Last Updated: 6/15/2015 - Initial Creation
        */
        function isRealValue(obj) {
            return obj && obj !== "null" && obj !== "No Result" && obj !== "undefined" && obj.length !== 0;
        }

        var service = {
            DateToString: dateToString,
            IsRealValue: isRealValue
        };

        return service;


    }
})();