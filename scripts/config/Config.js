/*RequestControler
    Description: This module will contain all configuration required for angular aplication.
    Input:
    Output:

    Last Updated: 11/3/2016 -  Initial creation
*/
(function() {
    'use strict';


    angular
        .module('ARB.Config')
        .constant('ARB_CONFIG', arbAppConfig());
   
    function arbAppConfig (){

        var config = {
            apiUrl: 'http://localhost',
            enableDebug: true,
            dateFormat: 'MM/dd/yyyy'

        };

        return config;

    }
})();