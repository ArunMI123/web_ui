/*RequestControler
    Description: This module will contain all Alert related funtionalities
    Input:
    Output:

    Last Updated: 11/3/2016 -  Initial creation
*/
(function () {
    'use strict';

    angular
        .module('ARB.Services')
        .factory('AlertService', factory);

    factory.$inject = ['$timeout'];

    function factory($timeout) {
        var currentAlert = {
            message: "",
            type: ""
        }

        var currentLoader = {
            message: ""
        }
        var isAlertVisible = false;
        var loaderVisibility = false;

        function ShowAlert(alertObj) {
            (alertObj);
            currentAlert.message = alertObj.message;
            currentAlert.type = alertObj.type;

            isAlertVisible = true;
            $timeout(function () { CloseAlert() }, 7000);
           
        }

      

        function IsAlertOpened() {
            return isAlertVisible;
        }

        function GetAlert() {
            return currentAlert;
        }

        function CloseAlert(){
            isAlertVisible = false;
            currentAlert.message = "";
            currentAlert.type ="";
        }

        function showLoader(message) {
            loaderVisibility = true;
            currentLoader.message = message;
        }

        function hideLoader() {
            loaderVisibility = false;
            currentLoader.message = "";
        }
        function getLoaderVisibility() {
            return loaderVisibility;
        }

        function getLoader() {
            return currentLoader;
        }



        var service = {
            ShowAlert: ShowAlert,
            IsAlertOpened: IsAlertOpened,
            GetAlert: GetAlert,
            CloseAlert: CloseAlert,
            ShowLoader: showLoader,
            HideLoader: hideLoader,
            GetLoaderVisibility : getLoaderVisibility,
            GetLoader: getLoader
        };

        return service;


    }
})();