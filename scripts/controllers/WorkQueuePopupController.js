/*RequestControler
    Description: This module will contain all of the functions required to implement the Login functionality
    Input:
    Output:

    Last Updated: 11/16/2016 Perumal: Modified to point DB.
    11/8/2016 - Perumal: Initial creation
*/

(function () {
    'use strict';

    var app = angular
        .module('ARB.DashboardPopupModule', [])

    app.controller('WorkQueuePopupController', dashboardPopupController);

    dashboardPopupController.$inject = ['$uibModalInstance', '$location', 'RequestService', 'UtilService', 'AlertService', '$timeout'];

    function dashboardPopupController($uibModalInstance, $location, RequestService, UtilService, AlertService, $timeout) {

        var vm = this;
        var requestData = [];
        var stageData = [];
        var searchData = {};
        var isAlert = false;
        var alertMessage = "";
        searchData.Stage = "";
        searchData.Status = "";
        var requestTableOptions = {
            data: requestData,
            
            columns: [{
                "title": 'ID',
                "data": "RequestID",
                "visible" : false
                
            }, {
                "title": "Project ID",
                "data": "ProjectID"
            }, {
                "title": "Phase",
                "data": "Phase",
                "sWidth": "5%"
            }, {
                "title": "Project Description",
                "data": "ProjectName",
                "sWidth": "45%"
            }, {
                "title": "Date Requested",
                "data": "DateRequested",
                "sWidth": "10%",
                "render": function (data) {
                    return UtilService.DateToString(data);
                }
            }, {
                "title": "Stage",
                "data": "StageDesc",
                "sWidth": "15%"
            }, {
                "title": "Status",
                "data": "Status",
                "sWidth": "2%"
            }],
            order: [[4, 'desc']],
            rowClickHandler: requestSelectHandler,

        };


        Init();

        /*Init Method
            Description: This method initiates the Work Queue page, and retrieves Requests list associated to loggged in user
                         and populated in datatable.
            Input:
            Output:

            Last Updated: 11/8/2016 - Perumal: Initial creation
        */
        function Init() {
            searchData.ProjectID = "";
            AlertService.ShowLoader("Loading Requests...");
                
                RequestService.GetRequestList(false,function (data) {
                    AlertService.HideLoader();
                    if (data.length > 0) {
                        requestData.splice(0, requestData.length);
                        Array.prototype.push.apply(requestData, data);
                    }
                }, function () {
                    AlertService.HideLoader();
                })
                RequestService.GetStages(function (data) {
                    vm.StageData = data;
                })
            
        }

        function showall() {
            AlertService.ShowLoader("Loading Requests...");
            searchData.Stage = "";
            searchData.Status = "";
            searchData.ProjectID = "";
            RequestService.GetRequestList(true,function (data) {
                AlertService.HideLoader();
                requestData.splice(0, requestData.length);
                Array.prototype.push.apply(requestData, data);
            }, function () {
                AlertService.HideLoader();
            })
        }

        function search() {
            if (searchData.Stage != "" || searchData.Status != "" || searchData.ProjectID != "") {
                AlertService.ShowLoader("Loading Requests...");
                RequestService.SearchRequestList(vm.SearchData, function (data) {
                    AlertService.HideLoader();
                    if (data.length > 0) {
                        requestData.splice(0, requestData.length);
                        Array.prototype.push.apply(requestData, data);
                    }
                    else {
                        ShowAlert({
                            message: "No Records Found!",
                            type: "danger"

                        });
                        clear();
                    }
                }, function () {
                    AlertService.HideLoader();
                })
            } else {
                ShowAlert({
                    message: "Please Enter Filters for Search!",
                    type: "danger"

                });
                clear();
            }
        }

        function clear(){
          searchData.Stage = "";
            searchData.Status = "";
            searchData.ProjectID = "";
            Init();
        }
        
        function CloseAlert() {
            vm.IsAlert = false;
            vm.AlertMessage = "";
        }



        function ShowAlert(Alertobj) {
            vm.AlertMessage = Alertobj.message
            vm.IsAlert = true;
            $timeout(function () {
                CloseAlert()
            }, 5000);


        }

		 function cancelDialog() {
            $uibModalInstance.dismiss();
        }

		function requestSelectHandler(row) {
			$uibModalInstance.dismiss(row.RequestID);
        }

        angular.extend(vm, {
            requestTableOptions: requestTableOptions,
            Showall: showall,
            Search: search,
            StageData: stageData,
            SearchData:searchData,
            Clear: clear,
            CloseAlert: CloseAlert,
            IsAlert: isAlert,
            AlertMessage: alertMessage,
			CloseModal: cancelDialog,
        });

        return vm;

    }
})();