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
        .module('ARB.ManageUserModule', [])

    app.controller('ManageUserController', dashboardPopupController);

    dashboardPopupController.$inject = ['$uibModalInstance', '$scope', 'ReviewService', 'UtilService', 'RequestService', 'AlertService', '$timeout', 'UserService'];

    function dashboardPopupController($uibModalInstance, $scope, ReviewService, UtilService, RequestService, AlertService, $timeout, UserService) {

        var vm = this;
        var userData = [];
        var domains = [];
        var user = {};
		var domain={};
        var assignedDomain = [];
        var isAlert = false;
		var newDomain={};
        var alertMessage = "";
		var isValid = "";
		var isdomainValid = "";
		
      
        var requestTableOptions = {
            data: userData,
            
            columns: [{
                "title": 'ID',
                "data": "ReviewerID",
               
                "visible" : false
                
            }, {
                "title": "Reviewer Name",
                "data": "ReviewerName",
               
            }, {
                "title": "Reviewer Email",
                "data": "ReviewerEmail",
               
            }, {
                "title": "Domain",
                "data": "ReviewerDomainAssignments",
                
                "render": function (data) {
                    var domain = "";
                    angular.forEach(data, function (value, key) {
                        
                        if (key == 0) {
                            domain = value.Domain.DomainName;
                        } else {

                            domain = domain + "," + value.Domain.DomainName;
                        }
                    })
                    if (domain == null) {
                        domain = "No domain Assigned"
                    } else if (domain.length > 30) {
                        var domain = domain.substring(0, 30) + "...";
                    
                        }

                    return domain;
                }
            }],
            searching: false,
            rowClickHandler: userSelectHandler,
            pageLength: 5,
        lengthMenu: false,
        bLengthChange: false
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
		
			 vm.User = {};
			 vm.NewDomain = {};
			 vm.AssignedDomain = [];
    AlertService.ShowLoader("Loading Requests...");
         ReviewService.GetList("domain", function (data) {
             if (data.length > 0) {
       // vm.Domains = data;
                 domains.splice(0, domains.length);
               Array.prototype.push.apply(domains, data);
                
              }
             
         })
            ReviewService.GetUserList(function (data) {
                    AlertService.HideLoader();
                    if (data.length > 0) {
                       userData.splice(0, userData.length);
                        Array.prototype.push.apply(userData, data);
                    }
                }, function () {
                    AlertService.HideLoader();
                })
            
            $timeout(function () {
                $scope.$apply();
            })
            
        }

        function addDomain(domain, value) {
            if (value) {
                vm.AssignedDomain.push(domain.DomainID)
            } else {
                var index = vm.AssignedDomain.indexOf(domain.DomainID);
                vm.AssignedDomain.splice(index, 1);
            }
        }

        function userSelectHandler(row) {
      
            
            vm.AssignedDomain = [];
            vm.User = row;
            if (UtilService.IsRealValue(vm.User.ReviewerDomainAssignments)) {
            angular.forEach(vm.User.ReviewerDomainAssignments, function (value) {
                vm.AssignedDomain.push(value.DomainID);
            })
            }
            $scope.$apply();
        }
        function clear() {
		
            Init();
            vm.User.ReviewerEmail = null;
            vm.User = {};
            vm.AssignedDomain = [];
			vm.ManageForm.$setPristine();
			vm.ManageForm.$setUntouched();
			vm.IsValid = false;
			
        }

        function saveUser() {
            
            if (UtilService.IsRealValue(vm.User.ReviewerID) && vm.User.Active == false) {
                RequestService.GetReviewerAssignedCount(vm.User.ReviewerID, function (data) {
                    if (data == 0) {
                        saveValidUser()
                    } else {
                        ShowAlert({
                            message: "Reveiwer associate with Requests! Please Reassign to other reviewer",

                        });
                    }
                })
            } else {
                saveValidUser()
            }
        }
        function saveValidUser() {
            vm.IsDomainValid = false;
          
            if (vm.ManageForm.name.$invalid || vm.ManageForm.email.$invalid || vm.ManageForm.Role.$invalid || vm.ManageForm.Activecheckbox.$invalid || vm.AssignedDomain.length < 0) {
			
			vm.IsValid = true;
			
		  ShowAlert({
                    message: "Please enter values for User Fields!",
                  
                });
               
		}
            else {
            var Closed = 0;
            var domainArray = [];
		
            angular.forEach(vm.AssignedDomain, function (value) {
                if (value != null) {
                    var domainobj = {

                        ReviewerID: vm.User.ReviewerID,
                        DomainID: value
                    };
                    domainArray.push(domainobj);
                }
            })
            vm.User.ReviewerDomainAssignments = domainArray;
            if (!UtilService.IsRealValue(vm.User.ReviewerID)) {
                vm.User.CreatedBy = UserService.GetProfile().Email;
            } 
            vm.User.ModifiedBy = UserService.GetProfile().Email;
            vm.User.ModifiedDate = new Date();
            if (vm.User.Active == null) {
                vm.User.Active = true;
            }
                RequestService.SaveUser(vm.User, function (data) {
                
                if (data.status == 200) {
                    Init()
						vm.ManageForm.$setUntouched();
						vm.IsValid = false;
                    ShowAlert({
                        message: "User Saved Successfully!",
                        type: "success"
                    });
                    vm.User = data.data;
                    angular.forEach(vm.User.ReviewerDomainAssignments, function (value) {
                        vm.AssignedDomain.push(value.DomainID);
                    })
               
                    }
                }, function (data) {
                    if (data.status == 409) {

                        ShowAlert({
                            message: "MailID Already Exists!",
                            type: "error"
                        });
                    }
                })
         }
		}

		 function saveDomain(domain) {
		 vm.IsValid = false;
	  if(vm.ManageDomain.DomainType.$invalid || vm.ManageDomain.DomainName.$invalid)
		 {
		 vm.IsDomainValid = true;
		 ShowAlert({
                    message: "Please enter values for Domain Fields!",
                    type: "success"
                });
		 }
		 else
		 {
            RequestService.SaveDomain(domain, function (data) {

            if (data.status == 200) {
                  Init()
                vm.ManageDomain.$setUntouched();
				vm.IsDomainValid = false;
                ShowAlert({
                    message: "Domain Saved Successfully!",
                    type: "success"
                });
                    if (data.data.length > 0) {
                        vm.Domains.splice(0, vm.Domains.length);
                        Array.prototype.push.apply(vm.Domains, data.data);
                        //vm.Domains = data;
                    }

                }}, function (data) {
                if (data.status == 409) {

                    ShowAlert({
                        message: "Domain Already Exists!",
                        type: "error"
                    });
                }
                })
           } 
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
			//$uibModalInstance.dismiss(row.RequestID);
        }

        angular.extend(vm, {
            requestTableOptions: requestTableOptions,
            CancelDialog:cancelDialog,
            CloseAlert: CloseAlert,
            IsAlert: isAlert,
            AlertMessage: alertMessage,
            CloseModal: cancelDialog,
            Domains: domains,
            AddDomain: addDomain,
            AssignedDomain: assignedDomain,
            User: user,
            SaveUser: saveUser,
			NewDomain : newDomain,
            Clear: clear,
			SaveDomain:saveDomain,
			IsValid:isValid,
			IsDomainValid : isdomainValid


			
        });

        return vm;

    }
})();