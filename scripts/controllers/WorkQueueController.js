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
        .module('ARB.DashboardModule', [])

    app.controller('WorkQueueController', dashboardController);

    dashboardController.$inject = ['$location', '$uibModal', 'RequestService', 'UtilService', 'AlertService', 'ToolbarService', 'UserService'];

    function dashboardController($location,$uibModal,RequestService, UtilService, AlertService, ToolbarService, UserService) {

        var vm = this;
        var requestData = [];
        var stageData = [];
        var searchData = {};
        searchData.Stage = "";
        searchData.Status = "";
        
        var requestTableOptions = {
            data: requestData,
            
            columns: [{
                "title": 'ID',
                "data": "RequestID",
                "sWidth": "5%",
                "visible" : false
                
            }, {
                "title": "Project ID",
                "data": "ProjectID",
                "sWidth": "15%",
                "render": function (data, type, row) {
                   
                    return '<a href="#/request/'+ row.RequestID +'">' + data + '</a>';}
                
            }, {
                "title": "Phase",
                "data": "Phase",
                "sWidth": "5%"
            }, {
                "title": "Project Name",
                "data": "ProjectName",
                "sWidth": "25%"
            }, {
                "title": "Solution Architect",
                "data": "SA",
                "sWidth": "10%"
            }, {
                "title": "Requester",
                "data": "Requester",
                "sWidth": "10%"
            },
            {
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
                "sWidth": "10%"
            
            },{
                "title": "Priority",
                "data": "Priority",
                "visible": false
            
            }, {
                "title": "Review Type",
                "data": "ReviewType",
                "sWidth": "15%",
                "render": function (data) {
                    if (data == null || data == "Reject") {
                        return "UnAssigned";
                    } else {
                        return data;
                    }
                    
                }
            }],
            order: [ 9, 'desc' ],
            "autoWidth": false,
           
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
            
            ToolbarService.Reset();
            var user = UserService.GetProfile();
            if (user.Role != "Public") {
                ToolbarService.RegisterButton("newRequest");
            }
            
            if (user.Role == "DM") {
                ToolbarService.RegisterButton("User",false, manageUser);
            }
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
                if (data.length > 0) {
                    requestData.splice(0, requestData.length);
                    Array.prototype.push.apply(requestData, data);
                    }
            }, function () {
                AlertService.HideLoader();
            })
        }

        function search() {
            if (searchData.Stage != "" || searchData.Status != "" || searchData.ProjectID != "") {
                AlertService.ShowLoader("Loading Requests...");
            
                RequestService.SearchRequestList(vm.SearchData, function (data) {
                    
                   
                    AlertService.HideLoader();
                    requestData.splice(0, requestData.length);
                    if (data.length > 0) {
                        
                        Array.prototype.push.apply(requestData, data);
                    }
                    
                }, function () {
                    AlertService.HideLoader();
                })
            } else {
                AlertService.ShowAlert({
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

                
        function manageUser() {
            var modalInstance = $uibModal.open({
                animation: true,
                size: 'lg',
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'Views/Templates/ManageUser.html',
                controller: 'ManageUserController as manageUserCtrl',
                resolve: {

                }

            });
        }
        angular.extend(vm, {
            requestTableOptions: requestTableOptions,
            Showall: showall,
            Search: search,
            StageData: stageData,
            SearchData:searchData,
            Clear:clear,
            RequestData:requestData
        });

        return vm;

    }
})();