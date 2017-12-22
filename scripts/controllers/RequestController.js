-/*RequestControler
    Description: This module will contain all of the functions required to implement the request form functionality.
    Input:
    Output:

    Last Updated: 11/3/2016 -  Initial creation
*/

(function () {
    'use strict';
    var app = angular
      .module('ARB.RequestModule', ['ngSanitize', 'ui.select'])

    app.controller('RequestController', requestController);

    requestController.$inject = ['$location','$timeout', '$uibModal', '$filter', 'ReviewService', 'AlertService', '$routeParams', 'UserService', 'RequestService', 'ToolbarService', '$q', 'UtilService', 'WorkFlowService', '$rootScope', '$scope', '$window', 'REVIEW_STAGE'];

    function requestController($location,$timeout, $uibModal, $filter, ReviewService, AlertService, $routeParams, UserService, RequestService, ToolbarService, $q, UtilService, WorkFlowService, $rootScope, $scope, $window, REVIEW_STAGE) {

        // Revieling modules to View

        var reviewerList = {};
        var questionList = {};
        var standardList = {};
        var selectedStandard = [];
        var checkStandardlist = [];
        var standardModel = [];
        var eventListOptions = {};
        var conditionCount = {};
        var eventList = [];
        
        var dueDate = new Date();
        eventListOptions = {
            "data": eventList,
            "columns": [{
                "title": "Created",
                "data": "EventDate",
                "render": function (data) {
                    return UtilService.DateToString(data);
                }
            }, {
                "title": "Event Description",
                "data": "EventText"
            }, {
                "title": "Review State",
                "data": "StageDescription"
            }, {
                "title": "Domain",
                "data": "Domain"
            }, {
                "title": "Created By",
                "data": "Author"
            }
            //, {
            //    "title": "Reviewer",
            //    "data": "Author"
            //}
            ],
            searching: false,
            pageLength: 5,
            lengthMenu: false,
            bLengthChange: false,
        }

        
        /* Get requestId from param. If requestId is zero, consider as new Request
            request.requestId will be used deside whether new or old request in VM */
        var paramRequestId = $routeParams.requestId ? parseInt($routeParams.requestId) : 0;

        // Inital Request Object
        var request = {
            RequestID: paramRequestId,
            ProjectID: "",
            ProjectName: "",
            Phase: "",
            ProjectType: "",
            DateRequested: "",
            DateOfARB: "",
            ProjectManager: "",
            InfrastructurePM: "",
            SolutionArchitect: "",
            SecurityArchitect: "",
            BusinessScope: "",
            TechScope: "",
            Region: "",
            SubmissionDate: "",
            Stage: 1, //
            StageDesc: "New",
            DateEntered: "",
            EnteredBy: "",
            EstProjectHoursJ0: "",
            EstProjectCostJ0: "",
            EstTotalHours: "",
            EstTotalCost: "",
            Attachments: [],
            ResolutionType: ""
        }

        var reviewForm = {
            ReviewersList: [],
            VotingResult: [],
            ReviewResult: [],
            CurrentReviewer: {},
            CurrentProfile: "",
            Popupurl: "ARBPopup.html",
            HeaderTextforDM: "Reviewing",
            ConditionButtonText: "Manage Conditions",
            DueDate:dueDate,
            SharepointLoc:[]
        }

        var panelAuthorizeFlags = {
            instructions: false,
            acceptPackage: false,
            voterPanel: false,
            reviewerPanel: false,
            assignVote: false,
            aprovalResults: false,
            votingResults: false,
            actionItems: false,
            eventLogs: false,
            requestFormPanel: false,
            reAssignPanel: false,
            isAssignReview:false,
            isAssignVote: false,
            isRequestor: false,
            packageActionPanel: false,
            packageAcceptancePanel:false
        }

        var vm = {

            ManageCondition: manageCondition,
            GetReviewerList: getReviewerList,
            GetQuestionList: getQuestionList,
            GetStandardList: getStandardList,
            ConditionCount: conditionCount,
            CheckStandardlist: checkStandardlist,
            StandardModel: standardModel,
            SelectStandard: selectStandard,
            Request: request,
            PanelAuthorizeFlags: panelAuthorizeFlags,
            DropdownLists: {},
            SubmitSubmissionDecision: submitSubmissionDecision,
            ReviewForm: reviewForm,
            SubmitPackage: submitPackage,
            SubmitReview: submitReview,
            EventListOptions: eventListOptions,
            DeleteAttachments: deleteAttachments,
            OpenAttachment: openAttachment,
            CheckReviewer: checkReviewer,
            ReAssignDecision: reAssignDecision,
            SubmitToReview: submitToReview,
            ShowAttachmentLoader: showAttachmentLoader,
            NetNewChange: netNewChange,
            StandardBasedChange: standardBasedChange,
            SubmitPackageDecision:submitPackageDecision,
            GetProfile: getProfile,
            DMComment: {},
           
   
        };

        var showAttachmentLoader = {};




        function Init() {
           
            vm.ShowAttachmentLoader = false;
            if (angular.isUndefined(UserService.GetProfile())) {
                AlertService.ShowAlert({
                    message: "Authorization Denied! Please Login",
                    type: "danger"

                });
                var UriIndex = $location.path().replace("/request/", "");
                $location.url('/login?requestId=' + UriIndex);

            } else {

                fillReviewAspects();
                // Reset Toolbar buttons and register required buttons
                registerToolbarButtons();
                //Get RequestDetails
                if (request.RequestID !== 0) {
                    RequestService.GetRequest(request.RequestID, function (data) {
                        vm.Request = data;
                        getEventLog(data);
                     
                        // Change DateRequested to date Format
                        if (vm.Request.DateRequested)
                            vm.Request.DateRequested = new Date(vm.Request.DateRequested);
                        if (vm.Request.JEventDate)
                            vm.Request.JEventDate = new Date(vm.Request.JEventDate);
                        if (vm.Request.DueByDate)
                            vm.Request.DueByDate = new Date(vm.Request.DueByDate);
                        setDisplayState();
                        vm.ShowAttachmentLoader = true;
                        fillAttachments(request.RequestID);
                        fillSharePointLoc(request.RequestID);
                    });
                  
                   


                } else {
                    // Initialize Default values for New request
                    var user = UserService.GetProfile();
                    vm.Request.Region = user.RegionID;
                    vm.Request.DateRequested = new Date();
                    vm.Request.EnteredBy = user.Email;
                    setDisplayState();
                }
               
                eventListOptions = {
                    "data": eventList,
                    "columns": [{
                        "title": "Created",
                        "data": "EventDate",
                    }, {
                        "title": "Event Description",
                        "data": "EventText"
                    }, {
                        "title": "Review State",
                        "data": "StageDescription"
                    }, {
                        "title": "Domain",
                        "data": "Domain"
                    }, {
                        "title": "Created By",
                        "data": "Author"
                    }
                    //, {
                    //    "title": "Reviewer",
                    //    "data": "ReviewerName"
                    //}
                    ]
                }
            }
        }


        function getProfile() {
            return UserService.GetProfile();
        }

        /*
          Description:Function to save Review by reviewer.
          Input:		
          Output:
          Last Updated: 6/15/2015 - Initial Creation
       */
        function selectStandard() {
            var selectStandard = [];
            angular.forEach(standardList, function (value) {
                if (value.selected === true) {
                    selectStandard.push(value)
                }
            });
            return selectStandard;
        }


        /*
           Description:	function to fill the Event Logs
           Input:		reviewerList is the results of the CAML query of the SharePoint list
           Output:List of Events Log
           
           Last Updated: 6/15/2015 - Initial Creation
       */


        function getEventLog(request) {

            RequestService.GetEventLog(request.RequestID, function (data) {
                populateEventLog(data)
            });


        }

        /* 
        Description:	Method to bind Log data to  
        Input:		reviewerList is the results of the CAML query of the SharePoint list
        Output:List of Events Log
        
        Last Updated: 6/15/2015 - Initial Creation
        */
        function populateEventLog(logData) {
            eventList.splice(0, eventList.length);
            Array.prototype.push.apply(eventList, logData);
        }
        /*
            Description:	function to fill the reviewer's list
            Input:		reviewerList is the results of the CAML query of the SharePoint list
            Output:
            
            Last Updated: 6/15/2015 - Initial Creation
        */
        function fillReviewerList() {
            ReviewService.GetReviewerList(function (_reviewerList) {
                ("_reviewerList");
                angular.forEach(domainList, function (value, index) {
                    (value);

                    reviewerList[value] = $filter('filter')(_reviewerList, { domain: value }, true);
                    (reviewerList[value]);
                });

            }, function () {

            });
        }



        //To load the Attachment list for the request from the Share Point 
        function fillAttachments(requestId) {
		
            RequestService.GetAttachments(requestId, function (data) {
                      
                vm.Request.Attachments = data;
                vm.ShowAttachmentLoader = false;

            }, function () {
				  
                $timeout(function () {
                    vm.ShowAttachmentLoader = false;
                    $scope.$apply();
                });
                AlertService.ShowAlert({
                    message: "Unable to load attachments!",
                    type: "danger"
                });
            });
        }
    
        function fillSharePointLoc(requestId) {

            RequestService.GetSharePointLoc(requestId, function (data) {
                      
                vm.ReviewForm.SharepointLoc=data;
 
            })
        }

        /*
        Description:	function to fill the request Form.
        Input:		List is the results of the CAML query of the SharePoint list
        Output:
        
        Last Updated: 6/15/2015 - Initial Creation
    */

        function fillReviewAspects() {
            // Load Domain List
            var aspectsQueue = [];
            AlertService.ShowLoader("Loading Request Form...");

            var domainsQueue = ReviewService.GetList("domain", function (data) {
                vm.DropdownLists['domain'] = data;
            }, function () {
            });
            var projectsTypeQueue = ReviewService.GetList("projectType", function (data) {
                vm.DropdownLists['projectType'] = data;
            }, function () {
            });

            var regionQueue = ReviewService.GetList("region", function (data) {
                vm.DropdownLists['region'] = data;
            }, function () {
            });

            var reviewersQueue = ReviewService.GetList("reviewer", function (data) {
                
                vm.DropdownLists['reviewer'] = data;
            }, function () {
            });

            var standardsQueue = ReviewService.GetStandardList(vm.Request.RequestID, function (_standardList) {
                standardList = _standardList;
              
            })

            var questionQueue = ReviewService.GetQuestionsList(vm.Request.RequestID, function (_questionList) {

                angular.forEach(vm.DropdownLists['domain'], function (value, index) {
                    
                    questionList[value.DomainName] = $filter('filter')(_questionList, { DomainName: value.DomainName }, true);

                });
              
            });
            var stagesQueue = ReviewService.GetList("stage", function (data) {
                vm.DropdownLists['stage'] = data;
            }, function () {
            });

            var reviewType = ReviewService.GetReviewType(function (data) {
                vm.DropdownLists['ReviewType'] = data;
            }, function () {
            });

           

            aspectsQueue.push(domainsQueue);
            aspectsQueue.push(regionQueue);
            aspectsQueue.push(projectsTypeQueue);
            aspectsQueue.push(reviewersQueue);
            aspectsQueue.push(standardsQueue);
            aspectsQueue.push(questionQueue);
            aspectsQueue.push(reviewType);
            //aspectsQueue.push(resolutionType);
            
            $q.all(aspectsQueue).then(function () {
                AlertService.HideLoader();
            });


        }

        /*
          Description:	function to Open popup for manage condition.
          Input:		List is the results of the CAML query of the SharePoint list
          Output:
  
          Last Updated: 6/15/2015 - Initial Creation
       */
        function manageCondition() {
            var modalInstance = $uibModal.open({
                animation: true,
                size: 'lg',
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'Views/Templates/ManageCondition.html',
                controller: 'ManageConditionController as manageConditionCtrl',
                resolve: {
                    request: function () {
                        return vm.Request;
                    },
                    reviewer: function () {
                        if (!angular.equals({}, vm.ReviewForm.CurrentReviewer)) {
                            return vm.ReviewForm.CurrentReviewer;
                        } else {
                            /* TODO What to do if DM creates Action Item .? */
                            return null;
                        }
                    },
                    domainList: function () {
                        if (!angular.equals({}, vm.ReviewForm.CurrentReviewer)) {
                            var Domains = $filter('filter')(vm.ReviewForm.ReviewResult, { ReviewerID: vm.ReviewForm.CurrentReviewer.ReviewerID }, true);
                            return Domains;
                        } else {
                            /* TODO What to do if DM creates Action Item .? */
                            return null;
                        }
                    }
                }

            });

            modalInstance.result.then(function (selectedItem) { }, function () {
                getConditionCount();
                if (vm.Request.Stage == 8) {
                    RequestService.ConditionCount(vm.Request.RequestID, function (data) {
                        vm.Request.ConditionCount = data;
                        if (vm.Request.ConditionCount.TotalCondition == vm.Request.ConditionCount.ClosedCondition) {
                            AlertService.ShowLoader("Processing Request.");
                               var stateUpdatePromise = RequestService.UpdateStage(request.RequestID, REVIEW_STAGE.FINAL, ""); // Update Stage to VOTING_COMPLETED
                                stateUpdatePromise.then(function (data) {
                                    $rootScope.$emit('StageUpdated', REVIEW_STAGE.FINAL);
                                    AlertService.HideLoader();
                                });
                        }
                    })
                }
            })
        }
        



		function manageCopyFrom() {
		    var modalInstance = $uibModal.open({
		        animation: true,
		        size: 'lg',
		        ariaLabelledBy: 'modal-title',
		        ariaDescribedBy: 'modal-body',
		        templateUrl: 'Views/WorkQueuePopup.html',
		        controller: 'WorkQueuePopupController as dashboardPopupCtrl',
		        resolve: {

		        }

		    });

		    modalInstance.result.then(function (selectedItem) { }, function (selectedRequestId) {
		        if (selectedRequestId != undefined && selectedRequestId != null && selectedRequestId != 'backdrop click' && selectedRequestId != 'escape key press') {
		            copyFromRequest(selectedRequestId);
		        }
		    });
		}
        /*
           Description:	function to Defines buttons in header.
           Input:		List is the results of the CAML query of the SharePoint list
           Output:
   
           Last Updated: 6/15/2015 - Initial Creation
        */
        function registerToolbarButtons() {
            ToolbarService.Reset();
            ToolbarService.RegisterButton("back",false, backFunction);
            ToolbarService.RegisterButton("save", false, saveRequest);
			ToolbarService.RegisterButton("copyfrom", false, manageCopyFrom);
            ToolbarService.RegisterButton("submit", false, function () {
                saveRequest(true);
            });
            ToolbarService.RegisterButton("cancel", false, cancelRequest);
            if ((UserService.GetProfile().Role == 'DM') || (UserService.GetProfile().Role == 'Demand Manager') ) {
                ToolbarService.RegisterButton("reminder", false, reminder);
            }
            if(vm.Request.RequestID != 0)
            {
                ToolbarService.RegisterButton("attachFiles", false, function () {
                    if (vm.Request.RequestID !== 0) {
                        addAttachments(vm.Request.RequestID);
                    }
                });
                }
           
        }

		function backFunction()
		{
			if(vm.requestForm.$dirty == true)
			{
			    openPopup('back', {}, function (modalResult) {
					if (modalResult == 'Ok') {
						$location.path('/workQueue');
					}
				});
			}
			else
			{
				$location.path('/workQueue');
			}
		}

        function cancelRequest() {
		    
            openPopup('cancel', {}, function (modalResult) {
                if (modalResult == 'Ok') {
                    $location.path('/workQueue');
                }
            });
        }

        function getReviewerList() {
            return reviewerList;
        }

        function getQuestionList() {

            return questionList;
        }


        function getStandardList() {
            return standardList;
        }

        function getRequestContext() {
            return request;
        }

        // Display State based on Role and Request State
        /*
        Description: function to set the display state for the page based on the review status and the user
        Input: processStage = the stage of the review
        userRole = the role that the logged in user belongs to
        Output:
        Initial Creation - 6/15/2015
        Last Updated: 11/9/2016 Perumal. Modified with angular flags and events.

        */
        function setDisplayState() {
              panelAuthorizeFlags.eventLogs = true;
            resetLeftPanelAuthorizeFlags();
            switch (vm.Request.Stage) {

                case REVIEW_STAGE.NEW: //'New':
                    panelAuthorizeFlags.instructions = true;
                    panelAuthorizeFlags.eventLogs = false;
                    panelAuthorizeFlags.requestFormPanel = true;
                    ToolbarService.UnregisterButton("reminder"); 
					if(vm.Request.RequestID != 0)
					{
						ToolbarService.UnregisterButton("copyfrom"); 
					}
                    break;

                case REVIEW_STAGE.SUBMITTED: //'Submitted': // Review Submission [Submission Review]
                    panelAuthorizeFlags.requestFormPanel = true;
                    ToolbarService.UnregisterButton("reminder");
					ToolbarService.UnregisterButton("copyfrom"); 
                    if (UserService.GetProfile().Role == 'DM' || UserService.GetProfile().Role == 'Demand Manager') {
                        panelAuthorizeFlags.acceptPackage = true;
                        vm.ReviewForm.SubmissionDecision = "";
                        vm.ReviewForm.SubmissionDecisionComment = "";
                         }
                    else {
                        panelAuthorizeFlags.instructions = true;
                        panelAuthorizeFlags.requestFormPanel = false;
                        ToolbarService.UnregisterButton("save");
                        ToolbarService.UnregisterButton("attachFiles");
                        
                    }
                    ToolbarService.UnregisterButton("cancel");
                    ToolbarService.UnregisterButton("submit");
                    break;

              

                case REVIEW_STAGE.REWORK: //'Rework':
					ToolbarService.UnregisterButton("copyfrom"); 
                    ToolbarService.RegisterButton("submit", false, function () {
                        saveRequest(true);
                    });
                    ToolbarService.UnregisterButton("reminder");
                    panelAuthorizeFlags.instructions = true;
                    panelAuthorizeFlags.eventLogs = false;
                    panelAuthorizeFlags.requestFormPanel = true;
                  
                    break;

                case REVIEW_STAGE.AWAITING_PACKAGE: 
                    ToolbarService.UnregisterButton("submit");
                    ToolbarService.UnregisterButton("cancel");
                    ToolbarService.UnregisterButton("copyfrom");
                    panelAuthorizeFlags.packageAcceptancePanel = false;
                    if (UserService.GetProfile().Email == vm.Request.EnteredBy || UserService.GetProfile().Email == vm.Request.SolutionArchitect) {
                        panelAuthorizeFlags.packageActionPanel = true;
                        panelAuthorizeFlags.requestFormPanel = true;
                    }
                    if (UserService.GetProfile().Role == 'DM') {
                        panelAuthorizeFlags.requestFormPanel = true;
                    }
                    break;

                case REVIEW_STAGE.PACKAGE_SUBMITTED: 
                    panelAuthorizeFlags.packageActionPanel = false;

                    if (UserService.GetProfile().Role == 'DM') {
                        panelAuthorizeFlags.packageAcceptancePanel = true;
                        panelAuthorizeFlags.requestFormPanel = true;
                        vm.ReviewForm.PackageDecision = "";
                        vm.ReviewForm.PackageDecisionComment = "";
                    } else if (UserService.GetProfile().Email == vm.Request.EnteredBy || UserService.GetProfile().Email == vm.Request.SolutionArchitect) {
                        panelAuthorizeFlags.requestFormPanel = true;
                    }
                    ToolbarService.UnregisterButton("submit");
                    ToolbarService.UnregisterButton("cancel");
                    ToolbarService.UnregisterButton("copyfrom");
                    break;

                case REVIEW_STAGE.PACKAGE_APPROVED:
                    

                    if (UserService.GetProfile().Role == 'DM') {
                        panelAuthorizeFlags.isAssignReview = true;
                        panelAuthorizeFlags.packageAcceptancePanel = false;
                        panelAuthorizeFlags.assignVote = true;
                        panelAuthorizeFlags.requestFormPanel = true;
                        vm.ReviewForm.DueDate=new Date(vm.Request.DueByDate);
                    } else if (UserService.GetProfile().Email == vm.Request.EnteredBy || UserService.GetProfile().Email == vm.Request.SolutionArchitect) {
                        panelAuthorizeFlags.requestFormPanel = true;
                    }
                    ToolbarService.UnregisterButton("submit");
                    ToolbarService.UnregisterButton("cancel");
                    ToolbarService.UnregisterButton("copyfrom");
                    break;

                //case REVIEW_STAGE.VOTING: //'Voting Initiated':
				//	ToolbarService.UnregisterButton("copyfrom"); 
                //    ToolbarService.UnregisterButton("submit");
                //    ToolbarService.UnregisterButton("cancel");
                //    panelAuthorizeFlags.voterPanel = false;
                //    if (UserService.GetProfile().Role == 'Reviewer') {
                //        panelAuthorizeFlags.voterPanel = true;
                //        ToolbarService.UnregisterButton("attachFiles");
                //        ToolbarService.UnregisterButton("save");

                //    }
                //    else if (UserService.GetProfile().Role == 'DM' || UserService.GetProfile().Role == 'Demand Manager' ||
                //     UserService.GetProfile().Role == 'PM' || UserService.GetProfile().Role == 'Project Manager' ||
                //   UserService.GetProfile().Role == 'SA' || UserService.GetProfile().Role == 'Solution Architect') {
                //        panelAuthorizeFlags.approvalResults = true;
                //        panelAuthorizeFlags.votingResults = true;
                //        panelAuthorizeFlags.requestFormPanel = true;

                //    }
                //    else {
                        
                //        ToolbarService.UnregisterButton("save");
                //        panelAuthorizeFlags.requestFormPanel = false;
                //        panelAuthorizeFlags.approvalResults = true;
                //        panelAuthorizeFlags.votingResults = true;
                //        ToolbarService.UnregisterButton("attachFiles");
                //    }


                //    WorkFlowService.GetAllReviewers(vm.Request, REVIEW_STAGE.VOTING, function (data) {
                //        vm.ReviewForm.VotingResult = data;
                //        for (var i = 0; i < data.length; i++) {
                //            if (data[i].Reviewer.ReviewerEmail.toLowerCase() == UserService.GetProfile().Email.toLowerCase()) {
                //                vm.ReviewForm.CurrentProfile = i;
                //                vm.ReviewForm.CurrentReviewer = data[i];
                //            }
                //        }
                //        if (angular.equals(vm.ReviewForm.CurrentProfile,"")) {
                //            checkRequester();
                //        }
                //    })

                //    WorkFlowService.GetAllReviewers(vm.Request, REVIEW_STAGE.REVIEW, function (data) {
                //        vm.ReviewForm.ReviewResult = data;
                //    })


                //    break;
                //case REVIEW_STAGE.VOTING_TIED:// 'Voting Tied':
				//	ToolbarService.UnregisterButton("copyfrom");                    
                //    if (UserService.GetProfile().Role == 'DM' || UserService.GetProfile().Role == 'Demand Manager') {
                //        panelAuthorizeFlags.voterPanel = true;
                //        panelAuthorizeFlags.votingResults = true;
                //        var result = {
                //            Result: 'No Result',
                //            Comments: ""
                //        }

                //        vm.ReviewForm.CurrentReviewer = result;
                //    }
                //    else {
                //        panelAuthorizeFlags.approvalResults = true;
                //        panelAuthorizeFlags.votingResults = true;
                //        ToolbarService.UnregisterButton("save");
                //        ToolbarService.UnregisterButton("attachFiles");
                //    }

                //    WorkFlowService.GetAllReviewers(vm.Request, REVIEW_STAGE.REVIEW, function (data) {
                //        vm.ReviewForm.ReviewResult = data;
                //    })
                //    WorkFlowService.GetAllReviewers(vm.Request, REVIEW_STAGE.VOTING, function (data) {
                //        vm.ReviewForm.VotingResult = data;

                //    })

                //    ToolbarService.UnregisterButton("submit");
                //    ToolbarService.UnregisterButton("cancel");
                //    if (UserService.GetProfile().Role == 'DM' || UserService.GetProfile().Role == 'Demand Manager' ||
                //     UserService.GetProfile().Role == 'PM' || UserService.GetProfile().Role == 'Project Manager' ||
                //     UserService.GetProfile().Role == 'SA' || UserService.GetProfile().Role == 'Solution Architect') {
                //        panelAuthorizeFlags.requestFormPanel = true;
                //    }
                //    else {
                //        panelAuthorizeFlags.requestFormPanel = false;
                //        ToolbarService.UnregisterButton("attachFiles");
                //        ToolbarService.UnregisterButton("save");
                //    }

                //    break;
                //case REVIEW_STAGE.VOTING_COMPLETED:
				//	ToolbarService.UnregisterButton("copyfrom"); 
                //    panelAuthorizeFlags.isAssignReview = true;
                //    panelAuthorizeFlags.isAssignVote = false;
                //    WorkFlowService.GetAllReviewers(vm.Request, REVIEW_STAGE.REVIEW, function (data) {
                //        vm.ReviewForm.ReviewResult = data;
                //    })
                //    WorkFlowService.GetAllReviewers(vm.Request, REVIEW_STAGE.VOTING, function (data) {
                //        vm.ReviewForm.VotingResult = data;

                //    })
                //    if (UserService.GetProfile().Role == 'Reviewer') {
                //        panelAuthorizeFlags.requestFormPanel = false;
                //        panelAuthorizeFlags.approvalResults = false;
                //        panelAuthorizeFlags.votingResults = true;
                //        ToolbarService.UnregisterButton("save");
                //        ToolbarService.UnregisterButton("attachFiles");
                //    }
                //        //Last Updated: 2/04/2016 - Dilip - : DM after voting Complete assign Reviewers to review
                //    else if (UserService.GetProfile().Role == 'DM' || UserService.GetProfile().Role == 'Demand Manager') {
                //        panelAuthorizeFlags.requestFormPanel = true;
                //        panelAuthorizeFlags.acceptPackage = false;
                //        panelAuthorizeFlags.assignVote = true;


                //    }
                //    else {
                //        ToolbarService.UnregisterButton("save");
                //        panelAuthorizeFlags.approvalResults = false;
                //        panelAuthorizeFlags.votingResults = true;
                //        ToolbarService.UnregisterButton("attachFiles");
                //    }

                //    ////Last Updated: 1/07/2016 - Dilip - : Submit, Save, Cancel buttons turned off
                    
                //    ToolbarService.UnregisterButton("submit");
                //    ToolbarService.UnregisterButton("cancel");
                //    break;

                case REVIEW_STAGE.REVIEW_INITIATED: //'Review Initiated':
					ToolbarService.UnregisterButton("copyfrom"); 
					getConditionCount();
                    if (UserService.GetProfile().Role == 'Reviewer') {
                        panelAuthorizeFlags.reviewerPanel = true;
                        panelAuthorizeFlags.actionItems = true;
                        panelAuthorizeFlags.reAssignPanel = false;
                    } else if (UserService.GetProfile().Role == 'DM' || UserService.GetProfile().Role == 'Demand Manager')
                            
                    {
                        
                        panelAuthorizeFlags.actionItems = true;
                        //RequestService.GetResultCount(vm.Request.RequestID, function (data) {
                        //    vm.ResutCount = data.data;
                        //    if (vm.ResutCount == 0) {
                                var result = {
                                    Result: 'No Result',
                                    Comments: ""
                                }
                                vm.ReviewForm.HeaderTextforDM = "Final Disposition";
                                vm.ReviewForm.CurrentReviewer = result;
                                panelAuthorizeFlags.approvalResults = true;
                                panelAuthorizeFlags.reAssignPanel = false;
                                panelAuthorizeFlags.reviewerPanel = true;
                            //} else {
                            //    panelAuthorizeFlags.approvalResults = true;
                            //    panelAuthorizeFlags.reviewerPanel = false;
                            //    panelAuthorizeFlags.reAssignPanel = true;
                      //      }

                      //})
                      
                    }
                    else {
                       
                        panelAuthorizeFlags.votingResults = true;
                        panelAuthorizeFlags.actionItems = true;
                        panelAuthorizeFlags.approvalResults = true;
                    }
                    
                    WorkFlowService.GetAllReviewers(vm.Request, REVIEW_STAGE.REVIEW_INITIATED, function (data) {
                        vm.ReviewForm.ReviewResult = data;
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].Reviewer.ReviewerEmail.toLowerCase() == UserService.GetProfile().Email.toLowerCase() && UserService.GetProfile().Role == 'Reviewer') {
                                vm.ReviewForm.CurrentProfile = i;
                                vm.ReviewForm.CurrentReviewer = data[i];
                            }
                        }
                        if (angular.equals(vm.ReviewForm.CurrentProfile,"")) 
                        {
                            checkRequester();
                        }
                       
                    })
                  
                    panelAuthorizeFlags.requestFormPanel = false;
                    ToolbarService.UnregisterButton("save");
                    ToolbarService.UnregisterButton("attachFiles");
                    ToolbarService.UnregisterButton("submit");
                    ToolbarService.UnregisterButton("cancel");
                    break;

                case REVIEW_STAGE.REVIEW_COMPLETED:
					ToolbarService.UnregisterButton("copyfrom"); 
                    getConditionCount();
                    WorkFlowService.GetAllReviewers(vm.Request, REVIEW_STAGE.REVIEW_INITIATED, function (data) {
                        vm.ReviewForm.ReviewResult = data;
                        if (UserService.GetProfile().Role == 'Reviewer') {
                            for (var i = 0; i < data.length; i++) {
                               
                                if (data[i].Reviewer.ReviewerEmail.toLowerCase() == UserService.GetProfile().Email.toLowerCase()) {
                                    vm.ReviewForm.CurrentProfile = i;
                                    vm.ReviewForm.CurrentReviewer = data[i];
                                }
                            }
                        }
                    })
                  
                    if (UserService.GetProfile().Role == 'DM' || UserService.GetProfile().Role == 'Demand Manager') {
                        //vm.ReviewForm.HeaderTextforDM = "Final Disposition";
                        panelAuthorizeFlags.reviewerPanel = false;
                        panelAuthorizeFlags.approvalResults = true;
                                                                   
                        var result = {
                            Result: 'No Result',
                            Comments:""
                                }
                       
                        vm.ReviewForm.CurrentReviewer = result;
                    }
                    else if (UserService.GetProfile().Role == 'Reviewer') //Last Updated: 2/22/2016 - Dilip - : DM, PM, SA should be able see the Review and Voting Result
                    {
                        panelAuthorizeFlags.approvalResults = true;
                        panelAuthorizeFlags.votingResults = true;
                        
                    }
                    else {
                        panelAuthorizeFlags.approvalResults = true;
                        panelAuthorizeFlags.votingResults = true;
                       
                    }
                    panelAuthorizeFlags.requestFormPanel = false;
                    ToolbarService.UnregisterButton("attachFiles");
                    ToolbarService.UnregisterButton("save");
                    ToolbarService.UnregisterButton("cancel");
                    ToolbarService.UnregisterButton("submit");

                    panelAuthorizeFlags.actionItems = true;
                    break;


                //case REVIEW_STAGE.REQUEST_COMPLETED: //'REQUEST_COMPLETED':
                //    ToolbarService.UnregisterButton("copyfrom");
                //    getConditionCount();

                   
                //    WorkFlowService.GetAllReviewers(vm.Request, REVIEW_STAGE.REVIEW, function (data) {
                //        vm.ReviewForm.ReviewResult = data;
                //        for (var i = 0; i < data.length; i++) {
                //            if (data[i].Reviewer.ReviewerEmail.toLowerCase() == UserService.GetProfile().Email.toLowerCase()) {
                //                vm.ReviewForm.CurrentProfile = i;
                //            }
                //        }

                //    })
                //    WorkFlowService.GetAllReviewers(vm.Request, REVIEW_STAGE.VOTING, function (data) {


                //        vm.ReviewForm.VotingResult = data;

                //    });

                //    ToolbarService.UnregisterButton("attachFiles");
                //    ToolbarService.UnregisterButton("save");
                //    ToolbarService.UnregisterButton("cancel");
                //    ToolbarService.UnregisterButton("submit");
                //    panelAuthorizeFlags.approvalResults = true;
                //    panelAuthorizeFlags.actionItems = true;
                //    panelAuthorizeFlags.requestFormPanel = false;
                //    break;

                case REVIEW_STAGE.FINAL: //'Final':
                    ToolbarService.UnregisterButton("copyfrom");
                    ToolbarService.UnregisterButton("reminder");
                    getConditionCount();
                    WorkFlowService.GetAllReviewers(vm.Request, REVIEW_STAGE.REVIEW_INITIATED, function (data) {
                        vm.ReviewForm.ReviewResult = data;
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].Reviewer.ReviewerEmail.toLowerCase() == UserService.GetProfile().Email.toLowerCase()) {
                                vm.ReviewForm.CurrentProfile = i;
                            }
                        }

                    })
                   
                    ToolbarService.UnregisterButton("attachFiles");
                    ToolbarService.UnregisterButton("save");
                    ToolbarService.UnregisterButton("cancel");
                    ToolbarService.UnregisterButton("submit");
                    panelAuthorizeFlags.approvalResults = true;
                    panelAuthorizeFlags.actionItems = true;
                    panelAuthorizeFlags.requestFormPanel = false;
                    break;

                default:
                    panelAuthorizeFlags.approvalResults = true;
                    panelAuthorizeFlags.votingResults = true;
            }

            /*ADD Public View*/
            if (UserService.GetProfile().Role == 'Public') {
                ToolbarService.UnregisterButton("attachFiles");
                ToolbarService.UnregisterButton("save");
                ToolbarService.UnregisterButton("cancel");
                ToolbarService.UnregisterButton("submit");
                vm.ReviewForm.ConditionButtonText="View Conditions"
                panelAuthorizeFlags.requestFormPanel = false;
                panelAuthorizeFlags.instructions = false;
                panelAuthorizeFlags.packageAcceptancePanel = false;
                panelAuthorizeFlags.packageActionPanel = false;
                if (vm.Request.Stage > 6) {
                    panelAuthorizeFlags.approvalResults = true;

                } else {
                    panelAuthorizeFlags.approvalResults = false;
                }
            }
        }
        /*
           Description:	function to Reset panel flags.
           Input:		List is the results of the CAML query of the SharePoint list
           Output:
           
           Last Updated: 6/15/2015 - Initial Creation
       */
        function resetLeftPanelAuthorizeFlags() {
            panelAuthorizeFlags.instructions = false;
            panelAuthorizeFlags.acceptPackage = false,
            panelAuthorizeFlags.voterPanel = false,
            panelAuthorizeFlags.reviewerPanel = false,
            panelAuthorizeFlags.assignVote = false,
            panelAuthorizeFlags.approvalResults = false,
            panelAuthorizeFlags.votingResults = false,
            panelAuthorizeFlags.actionItems = false,
            panelAuthorizeFlags.eventLogs = false
            panelAuthorizeFlags.packageAcceptancePanel = false;
            panelAuthorizeFlags.packageActionPanel = false;

        }

        function reminder() {

            RequestService.SentMail(vm.Request.RequestID, "RequesterReminderMail");
            AlertService.ShowAlert({
                message: "Reminders Sent Successfully",
                type: "success"
            });
       }

        /*
             Description:	function to Check Reviewer associated or not.
             Input:		
             Output:
             Last Updated: 6/15/2015 - Initial Creation
              */


        function checkRequester() {

            if (angular.equals({}, vm.ReviewForm.CurrentReviewer)) {
                if (UserService.GetProfile().Role == 'Reviewer') {

                    if (vm.Request.EnteredBy == UserService.GetProfile().Email || vm.Request.SecurityArchitect == UserService.GetProfile().Email || vm.Request.SolutionArchitect == UserService.GetProfile().Email || vm.Request.ProjectManager == UserService.GetProfile().Email || vm.Request.InfrastructurePM == UserService.GetProfile().Email) {
                        panelAuthorizeFlags.approvalResults = true;
                        panelAuthorizeFlags.votingResults = true;
                        panelAuthorizeFlags.voterPanel = false;
                        panelAuthorizeFlags.reviewerPanel = false;
                        panelAuthorizeFlags.isRequestor = true;
                    }
                    else {
                       
                        panelAuthorizeFlags.voterPanel = false;
                        panelAuthorizeFlags.reviewerPanel = false;
                        panelAuthorizeFlags.isRequestor = true;
                    }
                }
            }
        }
        /*
              Description:	function to Get the Condition Count.
              Input:		
              Output:
              Last Updated: 6/15/2015 - Initial Creation
               */
        function getConditionCount() {
            RequestService.ConditionCount(vm.Request.RequestID, function (data) {
                vm.Request.ConditionCount = data;

            })
        }

		function netNewChange()
		{
		    if((vm.Request.NetNew <= 0) || (vm.Request.NetNew == null))
		  {
			vm.Request.NetNewComments = null;
		  }
		}

		function standardBasedChange()
		{
		    if((vm.Request.StandardBased >= 100) ||(vm.Request.StandardBased == null))
		  {
			vm.Request.StandardBasedComments = null;
		  }
		}


		function copyFromRequest(selectedRequestId)
		{
		    RequestService.GetRequest(selectedRequestId, function (data) {
						data.RequestID = 0;
						data.Attachments = null;
						data.Phase = null;
						data.DMReviewDecision = null;
						data.DMReviewDecisionComment = null;
						data.DMReviewDecisionDate = null;
						data.DateEntered = null;
						data.EnteredBy = UserService.GetProfile().Email;
						data.Stage = 1;
						data.StageDesc = "New";
						data.StageID = null;
						data.Status = "New";
						data.SubmissionDate = null;
						data.VotingDecision  = null;
						data.VotingDecisionCommand  = null;
						data.VotingDecisionDate = null;
						data.Reviews = null;
						data.ReviewerReviewDecisionDate = null;
						data.ReviewerReviewDecision = null;
						var user = UserService.GetProfile();
						data.Region = user.RegionID;
						data.DateRequested = new Date();
						data.QuestionResponses = null;
						data.GHEAStandardsUseds = null;
						//data.JEventDate = new Date(data.JEventDate);
						data.JEventDate = null;

						vm.Request = data;

			            var questionQueue = ReviewService.GetQuestionsList(selectedRequestId, function (_questionList) {
						
							angular.forEach(_questionList, function (value) {
								value.QuestionResponseID = null;
								value.RequestID = 0;
							});
						
							angular.forEach(vm.DropdownLists['domain'], function (value, index) {
							    questionList[value.DomainName] = $filter('filter')(_questionList, { DomainName: value.DomainName }, true);
							});
              
						});

					   var standardsQueue = ReviewService.GetStandardList(selectedRequestId, function (_standardList) {
						  
							angular.forEach(_standardList, function (value) {
									value.RequestID = 0;
							});
							standardList = _standardList;
						})
						
                        setDisplayState();
                    });
		}


        function checkReviewer() {
             var isReviewer = false
            if (UserService.GetProfile().Role == "Reviewer" && vm.Request.EnteredBy==UserService.GetProfile().Email) {
                isReviewer = true
            }
            return isReviewer;
        }
        /*
        Description:	function to Save the request Form.
        Input:		
        Output:
        Last Updated: 6/15/2015 - Initial Creation
         */
        function saveRequest(isSubmission) {
            var datediff=false;
            var user = UserService.GetProfile();
            if (validationOnSave(isSubmission || vm.Request.Stage > 1)) {
                
                var oldRequestId = vm.Request.RequestID;
                  if (oldRequestId == 0) {
                    vm.Request.Stage == 1; // Set stage to NEW
                    //if (user.Role != "DM" || (user.Role == "DM" && !UtilService.IsRealValue(vm.Request.EnteredBy))) {
                    //    vm.Request.EnteredBy = user.Email;
                    //}
                    }

                // Check if isSumbitted flag is true
                if (isSubmission) {
                    vm.Request.SubmissionDate = new Date();
                     vm.Request.DueByDate=new Date();
                    vm.Request.Stage = 2 //Submitted ;

                }
                var isAlert = false;

                //zCZXc{

                    
                var objectHeaders = [];
                var i = 0;
                for (var property in questionList) {
                    for (var property1 in questionList[property]) {
                        //if (isSubmission || vm.Request.Stage > 1) {
                        //if (questionList[property][property1].ResponseValue == questionList[property][property1].CommentOption || (questionList[property][property1].CommentOption == 'Both' && (questionList[property][property1].ResponseValue=='Yes'|| questionList[property][property1].ResponseValue=='No'))) 
                        //{
                        //    if (!UtilService.IsRealValue(questionList[property][property1].ResposeAnswer)) {
						//		 questionList[property][property1].IsCommentMandatory = true;
			            //         isAlert = true;
                        //    }
						//	else
						//	{
						//		questionList[property][property1].IsCommentMandatory = false;
						//	}
                        //} else {
						//    questionList[property][property1].IsCommentMandatory = false;
                          
                        //}
                        //}
						
                        objectHeaders.push(questionList[property][property1]);
                    }

                }
				if (isAlert) {
						AlertService.ShowAlert({
                                    message:"Under Validation Summary, if you have selected an option(Yes/No), please provide additional comments ", // "Please Enter Comment for " + questionList[property][property1].DomainName,
                                    type: "danger"

                        });
						if (isSubmission) {
						     vm.Request.Stage = 1 //Submitted ;

						}
				}
				
				if (!isAlert) {
                    vm.Request.GHEAStandardsUseds = selectStandard();
                    vm.Request.QuestionResponses = objectHeaders;
                   
                    if (angular.isUndefined(vm.Request.BusinessScope)) {
                        vm.Request.BusinessScope = "";
                    }
                    
                    if (angular.isDefined(vm.Request.JEventDate) && vm.Request.JEventDate != null) {
                        var jEventDateString = vm.Request.JEventDate.toString();
                        var jEventDate = jEventDateString.substring(0, jEventDateString.indexOf("GMT")) + "GMT+0000";
                        vm.Request.JEventDate = new Date(jEventDate);
                       
                    }
                    if (UtilService.IsRealValue(vm.Request.JEventDate) && UtilService.IsRealValue(vm.Request.SubmissionDate)) {
                        datediff = new Date(vm.Request.JEventDate)< new Date(vm.Request.SubmissionDate);
                    }
                    if (datediff) {
                        openPopup('JeventCheck1', {}, function (modalResult) {
                            if (modalResult == 'Ok') {
                                saveRequestForm(isSubmission, oldRequestId)

                            }
                        })
                    }
                    else {
                        saveRequestForm(isSubmission, oldRequestId)

                    }
                }
            }
        }







        function saveRequestForm(isSubmission, oldRequestId) {
            AlertService.ShowLoader("Processing Request.");
            RequestService.SaveRequest(vm.Request, function (data) {
                if (isSubmission) {
                    if (oldRequestId == 0) {
                        addEvent(data, "Request Created", "Request Created", 1);
                        $location.path("/request/" + data.RequestID);
                    }
                    addEvent(data, "Request Submitted", "Submitted", 3);
                    RequestService.SentMail(data.RequestID, "RequestSubmitted");

                    AlertService.ShowAlert({
                        message: "Request Submitted",
                        type: "success"

                    });

                } else if (oldRequestId == 0) {
                    addEvent(data, "Request Created", "Request Created", 1);
                    AlertService.ShowAlert({
                        message: "Request Created !",
                        type: "success"

                    });

                    AlertService.ShowLoader("Loading Request.");
                    $location.path("/request/" + data.RequestID);

                } else {
                    addEvent(data, "Request Updated", "Request Updated", 2);
                    AlertService.ShowAlert({
                        message: "Request Updated !",
                        type: "success"

                    });

                }
                vm.Request = data;

                getEventLog(data);

                if (vm.Request.DateRequested)
                    vm.Request.DateRequested = new Date(vm.Request.DateRequested);
                if (vm.Request.JEventDate)
                    vm.Request.JEventDate = new Date(vm.Request.JEventDate);
                AlertService.HideLoader();
                setDisplayState();

                vm.requestForm.$setPristine();

            }, function (data) {

                // Handle 409 - Conflict Resource - Duplicate Request.
                if (data.status == 409) {
                    AlertService.ShowAlert({
                        message: "Duplicate Request!",
                        type: "danger"

                    });
                }
                if (data.status == 406) {
                    AlertService.ShowAlert({
                        message: "Submitted By Email ID not in Active Directory",
                        type: 'danger'
                    })
                }
                AlertService.HideLoader();
            });

        }














        /*
      Description:Function to save EventLog in request Form.
      Input:RequestID,StageDescription,EventCommment,Domain(if Reviewer)		
      Output:List of Event Log
      Last Updated: 6/15/2015 - Initial Creation
      */
        function addEvent(request, StageDescription, Eventtext, EventID) {
            var domain = "";
            if (!angular.isUndefined(vm.ReviewForm.CurrentReviewer.Domain)) {
                domain = vm.ReviewForm.CurrentReviewer.Domain.DomainName;
            }
            var logEventPromise = WorkFlowService.LogEvent(request.RequestID, StageDescription, Eventtext, EventID, domain);

            logEventPromise.then(function (data) {

                eventList.splice(0, eventList.length);
                Array.prototype.push.apply(eventList, data.data);
            });

            return logEventPromise
        }

        /*
          Description:Function to save the attachment files in request Form.
          Input:		
          Output:
          Last Updated: 6/15/2015 - Initial Creation
          */
        function addAttachments(requestId) {
            if (ToolbarService.AttactmentFiles.length > 0) {
				AlertService.ShowLoader("Attaching Files...");
				RequestService.AddAttachments(requestId, ToolbarService.AttactmentFiles, function (data) {
				    AlertService.HideLoader();
				    vm.Request.Attachments = data.data;
				    openPopup("Files added successfully", ToolbarService.AttactmentFiles);
				    ToolbarService.AttactmentFiles = [];
                    addEvent(vm.Request, "File Uploaded", "File Uploaded", 9);
                    
                }, function (error) {
						 AlertService.HideLoader();
						 AlertService.ShowAlert({
                                message: "Error occured while attaching the files",
                                type: "danger"
						 });
						 ToolbarService.AttactmentFiles = [];
					}
				)
				
            }
        }






        /*
      Description:Function to validate request Form.
      Input:		
      Output:
      Last Updated: 6/15/2015 - Initial Creation
   */
        function validationOnSave(isSubmission) {

            //To check given value is between 0-100
            var zeroToHundredRegExp = /^[0-9][0-9]?$|^100$/
            var isSubmit = false;
            var otherError = false;
            if (angular.isUndefined(isSubmission) || isSubmission == false) {
                isSubmit = false;
            }
            else {
                isSubmit = true;
            }

            angular.forEach(vm.requestForm.$error, function (field) {


                angular.forEach(field, function (errorField) {
                   
                       
                        if (errorField.$error.required && !isSubmit && (errorField.$name == "JEventDate" || errorField.$name == "ProjectManager" || errorField.$name == "InfrastructurePM" ||
                            errorField.$name == "SolutionArchitect" || errorField.$name == "SecurityArchitect" || errorField.$name == "NetNew" || errorField.$name == "StandardBased"
                            || errorField.$name == "NetNewComments" || errorField.$name == "StandardBasedComments" || errorField.$name == "BusinessScope"
                            || errorField.$name == "TechScope" || errorField.$name == "estJ0Cost" || errorField.$name == "estJ0Hrs" ||
                            errorField.$name == "estTotalProjectCost" || errorField.$name == "estTotalProjectHrs" || errorField.$name.charAt(0) == "Q" || errorField.$name.charAt(0) == "A")) {
                            errorField.$setUntouched();
                        }
                
                    else if (errorField.$error.email) {
                        errorField.$setTouched();
                    }
                   else {
                        errorField.$setTouched();
                        otherError = true;
                    }
                  

                })
            });

            var isValid = true;

            // Check for mandatory fields
            if (vm.requestForm.$error.required) {

                if (otherError) {
                    AlertService.ShowAlert({
                        message: "Please enter all mandatory fields.",
                        type: "warning"

                    });



                    isValid = false;
                }
                else {

                    isValid = true
                }

            }
            if (isValid) {
                if (vm.requestForm.$error.email && vm.requestForm.$error.email.length > 0) {

                    var fieldTitle = "";
                    switch (vm.requestForm.$error.email[0].$name) {
                        case "EnteredBy": fieldTitle = "Entered By"; break;
                        case "ProjectManager": fieldTitle = "Project Manager"; break;
                        case "InfrastructurePM": fieldTitle = "Infrastructure PM"; break;
                        case "SolutionArchitect": fieldTitle = "Solution Architect"; break;
                        case "SecurityArchitect": fieldTitle = "Security Architect"; break;
                        case "SubmittedBy": fieldTitle = "Submitted By"; break;
                    }

                    AlertService.ShowAlert({
                        message: "Please enter valid Email for " + fieldTitle + ".",
                        type: "warning"

                    });
                    isValid = false;
                } else if (vm.requestForm.$error.date && vm.requestForm.$error.date.length > 0) {
                    AlertService.ShowAlert({
                        message: "Please enter a valid Date.",
                        type: "warning"

                    });
                    isValid = false;
                }
                else if (vm.requestForm.NetNew.$touched && zeroToHundredRegExp.test(vm.Request.NetNew) != true && vm.requestForm.NetNew.$viewValue != "") {
                    AlertService.ShowAlert({
                        message: "Please enter a valid %[0-100] value for % Net New.",
                        type: "warning"

                    });
                    isValid = false;
                }
                else if (vm.requestForm.StandardBased.$touched && zeroToHundredRegExp.test(vm.Request.StandardBased) != true && vm.requestForm.StandardBased.$viewValue != "") {
                    AlertService.ShowAlert({
                        message: "Please enter a valid %[0-100] value for % Standard Based.",
                        type: "warning"

                    });
                    isValid = false;
                }

                return isValid;
            }
        }
        /*
      Description:Function to save SubmissionDecition.
      Input:		
      Output:
      Last Updated: 6/15/2015 - Initial Creation
        */
        function submitSubmissionDecision() {
            
            var submissionDecision = vm.ReviewForm.SubmissionDecision;
            var submissionDecisionComment = vm.ReviewForm.SubmissionDecisionComment;
                    if (!UtilService.IsRealValue(submissionDecision)) {
                        AlertService.ShowAlert({
                            message: "Please enter valid Decision",
                            type: "danger"

                        });

                    }
                    else if (submissionDecision=="5"&&!UtilService.IsRealValue(submissionDecisionComment)) {
                        AlertService.ShowAlert({
                            message: "Please enter valid Comments",
                            type: "danger"

                        });

                    } else {
                        //vm.DuebyDate = submissionDecision;
                        //RequestService.SaveRequest(vm.Request, function (data) { })






                        WorkFlowService.SaveDMAcceptance(vm.Request, submissionDecision, submissionDecisionComment)
            }

        }

        
        
        function submitPackageDecision() {
            var packageDecision = vm.ReviewForm.PackageDecision;
            var packageDecisionComment = vm.ReviewForm.PackageDecisionComment;
            if (!UtilService.IsRealValue(packageDecision)) {
                AlertService.ShowAlert({
                    message: "Please enter valid Decision",
                    type: "danger"

                });

            }
            else if (packageDecision == "2" && !UtilService.IsRealValue(packageDecisionComment)) {
                AlertService.ShowAlert({
                    message: "Please enter valid Comments",
                    type: "danger"

                });

            }

            else {

                WorkFlowService.PackageDecision(vm.Request, packageDecision, packageDecisionComment)

            }

        }
        /*
      Description:Function to Assign reveiwer for Vote.
      Input:		
      Output:
      Last Updated: 6/15/2015 - Initial Creation
        */
        function submitToReview() {
            if (vm.ReviewForm.DueDate != null) {

                var IsDuplicate = false;
                // Since there is no Reviewer disposition, Reviewers for voting is considered as Reviewers for actual review
                var reviewersForReview = angular.copy(vm.ReviewForm.ReviewersList);
                var reviewersForothers = [];
           
                    if (angular.isDefined(vm.ReviewForm.ReviewersListOther) && vm.ReviewForm.ReviewersListOther.length > 0) {

                        vm.ReviewForm.ReviewersListOther.filter(function (Reviewer) {
                          
                                var otherreviewer = {
                                    ReviewerID: Reviewer.ReviewerID,
                                    DomainID: 11,
                                    Stage: REVIEW_STAGE.REVIEW_INITIATED,
                                    Result: "No Result",
                                    RequestID: vm.Request.RequestID
                                }
                                reviewersForothers.push(otherreviewer);
                           
                        });

                    }
               
                    reviewersForReview.concat(reviewersForothers);

                //Add assignment records for Voting stage
                for (var i = 1; i < reviewersForReview.length; i++) {

                    if (!angular.isUndefined(reviewersForReview[i]) && angular.isNumber(reviewersForReview[i].ReviewerID) && !isNaN(reviewersForReview[i].ReviewerID)) {
                        reviewersForReview[i].Stage = REVIEW_STAGE.REVIEW_INITIATED;
                        reviewersForReview[i].Result = "No Result"
                    } else {
                        reviewersForReview.splice(i, 1);
                        i--;
                    }
                }
                if (!IsDuplicate) {
                    reviewersForothers = reviewersForothers.filter(Boolean);
                    reviewersForReview = reviewersForReview.concat(reviewersForothers);
                    vm.ReviewForm.ReviewersList = reviewersForReview.filter(Boolean);
                    RequestService.UpdateDueDate(vm.Request.RequestID, vm.Request.DueByDate, function (data) {
                    })
                    if (vm.ReviewForm.ReviewersList.length > 0) {
                        WorkFlowService.SaveReviewerAssignments(vm.Request, vm.ReviewForm.ReviewersList);
                    } else {
                        AlertService.ShowAlert(
                            {
                                message: "Please Select Reviewers for review",
                                type: "danger"
                            }
                            )
                    }
                } else {

                    AlertService.ShowAlert({
                        message: "Duplicate Reviewer Found!",
                        type: "danger"
                    })
                }
            } else {
                AlertService.ShowAlert({
                    message: "Please Enter DueDate !",
                    type: "danger"
                })

            }
            }

      


        function submitPackage() {
            var datediff = false;
          var packagesubmission = new Date();
          
          if (UtilService.IsRealValue(vm.Request.JEventDate) && UtilService.IsRealValue(packagesubmission)) {
              datediff = new Date(vm.Request.JEventDate) < new Date(packagesubmission);
                    }
                    if (datediff) {
                        openPopup('JeventCheck2', {}, function (modalResult) {
                            if (modalResult == 'Ok') {
                                PackageSubmission(packagesubmission)

                            }
                        })
                    }
                    else {
                        PackageSubmission(packagesubmission)

                    }
      }
        /*
      Description:Function to save vote by reviewer.
      Input:		
      Output:
      Last Updated: 6/15/2015 - Initial Creation
         */
        function PackageSubmission(packagesubmission) {
            AlertService.ShowLoader("Processing Request..");
            
            RequestService.PackageSubmission(request.RequestID, packagesubmission, function () {

            var stateUpdatePromise1 = RequestService.UpdateStage(request.RequestID, REVIEW_STAGE.PACKAGE_SUBMITTED, "");  // Update Stage to REVIEW_INITIATED
           
            stateUpdatePromise1.then(function (data) {
                var logEventPromise1 = WorkFlowService.LogEvent(request.RequestID, "Package Submitted", "Package Submitted", 5);
                RequestService.SentMail(request.RequestID, "PackageSubmittedMail");
                RequestService.SentMail(request.RequestID, "PackageSubmittedMailToRequester");
                logEventPromise1.then(function (logData) {
                    AlertService.ShowLoader("Processing Request.");
                    $rootScope.$emit('StageUpdated', REVIEW_STAGE.PACKAGE_SUBMITTED, logData.data);
                    AlertService.HideLoader();

                });

            }) 
                
            })
        }

        /*
     Description:Function to Reassign reviewer.
     Input:		
     Output:
     Last Updated: 5/11/2017 - Initial Creation
        */
        function reAssignDecision() {
 
            var reAssignList = [];
            angular.forEach(vm.ReviewForm.ReviewResult, function (value, key) {
                var reviewer = {
                    ReviewerID: value.Reviewer.ReviewerID,
                    DomainID: value.Domain.DomainID,
                    RequestID: vm.Request.RequestID,
                    Result: value.Result,
                    Comments:value.Comments,
                    Stage: REVIEW_STAGE.REVIEW_INITIATED,
                    ReviewerAssignmentId: value.ReviewerAssignmentId
                }
                reAssignList.push(reviewer);

            })
            WorkFlowService.ReviewerReassignment(vm.Request,reAssignList,function(data){
                AlertService.ShowAlert({
                    message: "Reviewer Assigned Successfully",
                    type: "success"

                });
             
            });
        }

        

        /*
      Description:Function to save Review by reviewer.
      Input:		
      Output:
      Last Updated: 6/15/2015 - Initial Creation
         */
        function submitReview() {

            var Result = vm.ReviewForm.CurrentReviewer.Result;
            var Command = vm.ReviewForm.CurrentReviewer.Comments;
            
            

                    if (!UtilService.IsRealValue(Result)) {
                        AlertService.ShowAlert({
                            message: "Please enter valid Decision",
                            type: "danger"

                        });

                    }
                    else if (!UtilService.IsRealValue(Command) && (Result == "Return" || Result == "Approved w/Exceptions")) {
                        AlertService.ShowAlert({
                            message: "Please enter valid Comments.",
                            type: "danger"

                        });

                    }
        else {
            RequestService.GetConditionCount(vm.Request.RequestID,UserService.GetProfile().Email, function (data) {
                if (Result == "Approved w/Conditions" && data == 0) {
                    AlertService.ShowAlert({
                        message: "Please Add Conditon to Choose this option.",
                        type: "danger"

                    });
                }
                else if (Result == "Approved" && data > 0) {
                    AlertService.ShowAlert({
                        message: "Please Select Approved w/Conditions.",
                        type: "danger"

                    });
                }
                else{
                    if (UserService.GetProfile().Role == 'DM' || UserService.GetProfile().Role == 'Demand Manager') {
                        AlertService.ShowLoader("Processing Request.");
                        RequestService.ConditionCount(vm.Request.RequestID, function (data) {
                            vm.Request.ConditionCount = data;
                       
                            vm.Request.DMReviewDecision = Result;
                            vm.Request.DMReviewDecisionComment = Command;
                            vm.Request.DMReviewDecisionDate = new Date();
                            AlertService.ShowLoader("Processing Request.");
                           
                            RequestService.SaveRequest(vm.Request, function (data) {
                                if (vm.Request.ConditionCount.TotalCondition == vm.Request.ConditionCount.ClosedCondition) {
                                    var stateUpdatePromise = RequestService.UpdateStage(vm.Request.RequestID, REVIEW_STAGE.FINAL, ""); // Update Stage to VOTING_COMPLETED
                                    stateUpdatePromise.then(function (data) {

                                        var logEventPromise = WorkFlowService.LogEvent(vm.Request.RequestID, "Reveiw Decision", "ARB Review Decision is " + Result + ".", 4);
                                        RequestService.SentMail(vm.Request.RequestID, "Final");
                                        logEventPromise.then(function (logData) {

                                            $rootScope.$emit('StageUpdated', REVIEW_STAGE.FINAL, logData.data);
                                            AlertService.HideLoader();
                                        });
                                    });

                                }
                                else{
                                    var stateUpdatePromise = RequestService.UpdateStage(vm.Request.RequestID, REVIEW_STAGE.REVIEW_COMPLETED, ""); // Update Stage to VOTING_COMPLETED
                                    stateUpdatePromise.then(function (data) {
                                        RequestService.SentMail(vm.Request.RequestID, "ReviewCompleted");
                                        var logEventPromise = WorkFlowService.LogEvent(vm.Request.RequestID, "Reveiw Decision", "ARB Review Decision is " + Result + ".", 4);
                                        logEventPromise.then(function (logData) {

                                            $rootScope.$emit('StageUpdated', REVIEW_STAGE.REVIEW_COMPLETED, logData.data);

                                            AlertService.HideLoader();
                                        });
                                    });
                                }
                            })

                        })
                      

                    }
                    else {
                      
                        var domainName = "";
                        if (!angular.isUndefined(vm.ReviewForm.CurrentReviewer.Domain))
                            domainName = vm.ReviewForm.CurrentReviewer.Domain.DomainName;
                        vm.ReviewForm.CurrentReviewer.LastModified = new Date();
                        var review = [];
                        var otherDomainrev = $filter('filter')(vm.ReviewForm.ReviewResult, { ReviewerID: vm.ReviewForm.CurrentReviewer.ReviewerID }, true);
                        for (var i = 0; i < otherDomainrev.length; i++) {
                            otherDomainrev[i].Result=vm.ReviewForm.CurrentReviewer.Result;
                            otherDomainrev[i].Comments = vm.ReviewForm.CurrentReviewer.Comments;
                          }
                        //    review.push(vm.ReviewForm.CurrentReviewer);
                        //review.push(otherDomainrev);
                        WorkFlowService.SubmitVote(vm.Request, REVIEW_STAGE.REVIEW_INITIATED, otherDomainrev, domainName);
                        //addEvent(vm.Request, "Review Cast", "Review Cast", 9);
                    }
                }
            })
            }
        }

       
        /*
     Description:Function to Delete Attachments.
     Input:RequestID,AttachmentID		
     Output:
     Last Updated: 6/15/2015 - Initial Creation
        */
        function deleteAttachments(requestID, attachment) {

            var user = UserService.GetProfile();

            if (user.Role == 'DM' || user.Role == 'Demand Manager' || user.Role == 'Requester') {

                openPopup('delete', {}, function (modalResult) {
					if (modalResult == 'Ok') {
						AlertService.ShowLoader("Deleteing File(s)...");
                        RequestService.DeleteAttachment(requestID, attachment, function (data) {
							AlertService.HideLoader();
							vm.Request.Attachments = data;
							addEvent(vm.Request, "File Deleted", "File Deleted", 10);
                        },
							function () 
							{
								  AlertService.HideLoader();
								  AlertService.ShowAlert({
									  message: "Unable to delete attachments!",
									  type: "danger"
								  });
							}
						);
                    }


                })
            } else {
                AlertService.ShowAlert({
                    message: 'Requester or DM can Delete Attachment',
                    type: "danger"

                });
            }
        }



        function openAttachment(url,filename) {
                 RequestService.GetAttachment(url, filename.AttachmentName);
        }



        function openPopup(type, object, callback) {
            var result;
            var modalInstance = $uibModal.open({
                animation: true,
                size: 'md',
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'Views/Templates/ArbAttachments.html',
                controller: 'ModalController as modalCtrl',

                resolve: {
                    type: function () {
                        return type;
                    },
                    Attachments: function () {
                        return object;
                    }

                }
            })
            modalInstance.result.then(callback);
        }


        /*
           Description:Function to Update stage.
           Input:		
           Output:
           Last Updated: 6/15/2015 - Initial Creation
        */
        $rootScope.$on('StageUpdated', function (event, stage, logData) {
            AlertService.ShowLoader("Processing Request.");
            if (logData) {
                populateEventLog(logData);
            }
            if (stage == "")
            {
                return 1;
            }
            var oldStage = vm.Request.StageDesc;
            vm.Request.Stage = stage;
            vm.Request.StageDesc = $filter('filter')(vm.DropdownLists['stage'], { Key: stage })[0].Value;
            setDisplayState();
            // $scope.$applyAsync();
            $timeout(function() {
                $scope.$apply();
            })
                 AlertService.ShowAlert({
                message: 'Stage updated from ' + oldStage + ' to ' + vm.Request.StageDesc + '.',
                type: "success"

            });
                 AlertService.HideLoader()
        });

        Init();


        return vm;
    }



    app.controller('ModalController', Modalcontroller)
    Modalcontroller.$inject = ['$uibModalInstance', 'RequestService', '$scope', 'AlertService', 'type', 'Attachments']
    function Modalcontroller($uibModalInstance, RequestService, $scope, AlertService, type, Attachments) {
        var vm = this
        var attachments = Attachments;
        var isUpload = false;
        var isDeleteFile = true;
        var isCancel = false;
        var isBack = false;
        var isJevent = false;
        var header = "";
        var message = "";
       
        if (type == "Files added successfully") {
            isUpload = true;
            isDeleteFile = false;
            isCancel = false;
            isJevent = false;
        }

        if (type == "delete" || type == "deleteActionItem") {
            if (type == "delete") {
                header = "File Attachment";
                message = "Are you sure want to remove this attachment ?";
            } else if (type == "deleteActionItem") {
                header = "Manage Condition";
                message = "Are you sure want to remove this condition ?";
            }
            isDeleteFile = true;
            isUpload = false;
            isCancel = false;
            isBack = false;
            isJevent = false;
        }

        if (type == "JeventCheck1" || type == "JeventCheck2") {
            header = "JEvent Confirmation";
            message = "Since the J-event Target is prior to the ARB completion, this will be recorded as a Late ARB.";
            isJevent = true;
            isDeleteFile = false;
            isUpload = false;
            isCancel = false;
            isBack = false;
          
        }

        if (type == "cancel") {
            isDeleteFile = false;
            isUpload = false;
            isCancel = true;
            isBack = false;
            isJevent = false;
        }

		if (type == "back") {
            isDeleteFile = false;
            isUpload = false;
			isCancel = false;
			isBack = true;
			isJevent = false;
        }

        function cancel() {
            $uibModalInstance.close('cancel');
        }
        function ok() {
            $uibModalInstance.close('Ok');
        }


        angular.extend(vm, {
            Attachments: attachments,
            type: type,
            Cancel: cancel,
            Ok: ok,
            IsUpload: isUpload,
            IsDeleteFile: isDeleteFile,
            IsCancel: isCancel,
			IsBack : isBack,
            Header: header,
            Message: message,
            IsJevent: isJevent
        });


        return vm;
    }



    /*
    Description: This module will contain all of the functions required to implement the Action Items form functionality.
    Input:
    Output:

    Last Updated: 11/3/2016 -  Initial creation
    */

  app.controller('ManageConditionController', manageConditionController)
  manageConditionController.$inject = ['$uibModalInstance', 'RequestService', 'ReviewService', 'WorkFlowService', '$scope', '$window', 'AlertService', 'UserService', 'request', 'reviewer','domainList', '$timeout', '$location', '$anchorScroll', '$uibModal', 'UtilService'];
  function manageConditionController($uibModalInstance, RequestService, ReviewService, WorkFlowService, $scope, $window, AlertService, UserService, request, reviewer,domainList,$timeout, $location, $anchorScroll, $uibModal, UtilService) {
        var isRequester = true;
        var isAlert = false;
        var alertMessage = "";
        var conditionHeader="Manage Conditions"
        if (UserService.GetProfile().Role == "Public")
        {
            conditionHeader = "View Conditions"
        }
        
        var isDomain = false;
        var vm = this;
        var reviewerData = {};
        var mindate =
            {
                minDate:new Date()
            }
      
        init();

        var conditionData = [];
        var isClosed = false;

        var conditionsTableOptions = {
            data: conditionData,
            columns: [{
                "title": 'ActionItemID',
                "data": "RequestID",
                "visible": false

            },
            {
                "title": "Domain",
                "data":function (data) {
                    if (data.DomainID == null) {
                        var res = "NA";
                        return res;
                    }
                    else {
                        return data.Domain.DomainName;
                    }
                }
                   


            }, {
                "title": "Type",
                "data": "ActionItemType1.ActionItemType1",

            },
            {
                "title": "Action Comments",
                "data": function (data) {
                    if (data.ActionItemText.length > 50) {
                        var res = data.ActionItemText.substring(0, 50) + "...";
                        return res;
                    }
                    else {
                        return data.ActionItemText;
                    }
                }


            }

            ],
            searching: false,
            pageLength: 5,
            lengthMenu: false,
            bLengthChange: false,
            rowClickHandler: conditionSelectHandler
        };

        var conditionDisplayFlag = false;
        var riskCategories = [];
        var actionTypes = [];
        var oldActionItemId;
        var assignedRisk = [];
        var resolutionTypes = [];

        /*
       Description:Function to add checked risk.
       Input:		
       Output:
       Last Updated: 6/15/2015 - Initial Creation
        */
        function addRisk(risk, value) {
            if (value) {
                vm.AssignedRisk.push(risk.Key)
            } else {
                var index = vm.AssignedRisk.indexOf(risk.Key);
                vm.AssignedRisk.splice(index, 1);
            }
        }
        /*
          Description:Function to fill data in model.
          Input:		
          Output:
          Last Updated: 6/15/2015 - Initial Creation
       */
        function init() {

            AlertService.ShowLoader("Loading Condition..");
            var user = UserService.GetProfile();
            vm.Condition = {};
            ReviewService.GetActionItem(request, function (data) {
                
                conditionData.splice(0, conditionData.length);
                Array.prototype.push.apply(conditionData, data);
            })

            ReviewService.GetRiskCategory(function (data) {
                vm.RiskCategories = data;

            })

            ReviewService.GetActionType(function (data) {
                vm.ActionTypes = data;

            })

            ReviewService.GetResolutionType(function (data) {
                
                vm.ResolutionTypes = data;

            })

            if (UtilService.IsRealValue(domainList)) {
                if (domainList.length == 1) {
                    isDomain = false;
                    vm.Condition.DomainID = domainList[0].Domain.DomainID;
                } else if (domainList.length > 1) {
                    isDomain = true;
                    vm.DomainList = domainList;
                } else {
                    isDomain = false;

                }
            }
            AlertService.HideLoader();
        }
        /*
         Description:Function to Load data for condition.
         Input:		
         Output:
         Last Updated: 6/15/2015 - Initial Creation
      */


        function getActionItem(requestid, actionid) {
            AlertService.ShowLoader("Loading Condition..");
        
            RequestService.GetActionItem(requestid,actionid, function (data) {
                vm.Condition = data;
                if (vm.Condition.DueByDate) {

                    vm.Condition.DueByDate = new Date(vm.Condition.DueByDate);

                }
                if (vm.Condition.DateResolved)
                    vm.Condition.DateResolved = new Date(vm.Condition.DateResolved);
                if (vm.Condition.DateClosed) {
                    vm.Condition.isClosed = true;
                }

                angular.forEach(vm.Condition.RiskCategoryAssignments, function (value) {
                    vm.AssignedRisk.push(value.RiskCategoryID)
                })

                vm.ConditionDisplayFlag = true;
                AlertService.HideLoader();
            })
        }

        /*
           Description:Function to select condition.
           Input:		
           Output:
           Last Updated: 6/15/2015 - Initial Creation
        */
        function conditionSelectHandler(row) {
            vm.AttactmentFiles = [];
            vm.AssignedRisk = [];
            if (UtilService.IsRealValue(row)) {
                getActionItem(request.RequestID, row.ActionItemID);
            }
            
        }
		 
        /*
          Description:Function to cancel dialog box.
          Input:		
          Output:
          Last Updated: 6/15/2015 - Initial Creation
       */
        function cancelDialog() {
            $uibModalInstance.dismiss('cancel');
        }
        /*
           Description:Function to display selected condition.
           Input:		
           Output:
           Last Updated: 6/15/2015 - Initial Creation
        */
        function displayConditionDetail(conditionData) {
            vm.ConditionDisplayFlag = true;
            $scope.$apply();
            }

        function addCondition() {
            vm.Condition = {};
            var riskArray = [];
            vm.AssignedRisk = [];
            cancelConditionDetailView();
            vm.ConditionDisplayFlag = true;
        }

        function cancelConditionDetailView() {
            vm.ConditionDisplayFlag = false;
        }

        function openAttachment(url, filename) {
            RequestService.GetAttachment(url, filename.AttachmentName);
        }

        function addEvent(request, StageDescription, Eventtext, EventID, evDomain) {
          var logEventPromise = WorkFlowService.LogEvent(request.RequestID, StageDescription, Eventtext, EventID, evDomain);
        }

       
        /*
         Description: This functions Save the request.
         Input:Form Data
         Output:
         Last Updated: 11/3/2016 -  Initial creation
        */
        function saveCondition() {
            var Closed = 0;
            var riskArray = [];
            angular.forEach(vm.AssignedRisk, function (value) {
                if (value != null) {
                    var Riskobj = {
                        ActionItemID: vm.Condition.ActionItemID,
                        RiskCategoryID: value
                    };
                    riskArray.push(Riskobj);
                }
            })
            vm.Condition.RiskCategoryAssignments = riskArray;

           
            if (vm.Condition.RiskCategoryAssignments.length==0) {
                    ShowAlert({
                        message: "Please Choose Concern Types!",
                        type: "danger"

                    });
            }

            else if (!UtilService.IsRealValue(vm.Condition.RiskCategoryComments)) {
                ShowAlert({
                    message: "Please Enter valid Comments for Concern Description!",
                    type: "danger"

                });
            }

            else if (!UtilService.IsRealValue(vm.Condition.ActionItemType)) {
                ShowAlert({
                    message: "Please Select Action Type!",
                    type: "danger"

                });
            }

            else if (!UtilService.IsRealValue(vm.Condition.ActionItemSubType)) {
                ShowAlert({
                    message: "Please Select SubType!",
                    type: "danger"

                });
            } 
            
            else if (!UtilService.IsRealValue(vm.Condition.DueByDate)) {
               
                ShowAlert({
                    message: "Please Enter valid Due Date",
                    type: "danger"

                });

            } 
            else if (!UtilService.IsRealValue(vm.Condition.ResolutionStrategy)) {

                ShowAlert({
                    message: "Please Select Resolution Strategy!",
                    type: "danger"

                });
            }
            else if (!UtilService.IsRealValue(vm.Condition.ActionItemText)) {

                ShowAlert({
                    message: "Please Enter Valid Comments for Condition Description",
                    type: "danger"

                });
            } else if (vm.IsDomain&&!UtilService.IsRealValue(vm.Condition.DomainID)) 
                {
                ShowAlert({
                    message: "Please Select Domain",
                    type: "danger"

                });
            }

            else {
                AlertService.ShowLoader("Saving Condition..");

                if (angular.isDefined(vm.Condition.isClosed) && vm.Condition.isClosed) {
                    vm.Condition.DateClosed = new Date();
                    Closed = 1;
                    vm.Condition.Closed = true;

                } else if (angular.isDefined(vm.Condition.isClosed) && !vm.Condition.isClosed) {
                    vm.Condition.DateClosed = null;
                    Closed = 2;
                    vm.Condition.Closed = false;
                }
                else {

                    vm.Condition.DateEntered = new Date();
                }


                if (angular.isUndefined(vm.Condition.DomainID)) {
                    if (UserService.GetProfile().Role == "Reviewer" && reviewer != null) {
                        vm.Condition.DomainID = reviewer.DomainID;
                    }
                    else {
                        vm.Condition.DomainID = 1;
                    }

                }


                vm.Condition.RequestID = request.RequestID;
                oldActionItemId = vm.Condition.ActionItemID;
                var dueDateString = vm.Condition.DueByDate.toString();
                var dueDate = dueDateString.substring(0, dueDateString.indexOf("GMT")) + "GMT+0000";
                vm.Condition.DueByDate = new Date(dueDate);
                vm.Condition.DateRequested = null;
                if (angular.isUndefined(vm.Condition.ActionItemID) || vm.Condition.ActionItemID == 0) {
                    vm.Condition.CreatedBy = UserService.GetProfile().Email;
                }
                vm.Condition.ModifiedBy = UserService.GetProfile().Email;
                vm.Condition.ModifiedDate = new Date();
                RequestService.SaveCondition(request.RequestID, vm.Condition, function (data) {
                    AlertService.HideLoader();
                    if (Closed == 1 || Closed == 2) {
                        if (Closed == 1) {
                            ShowAlert({
                                message: "Condition Closed !",
                                type: "success"
                            });
                        }
                        if (Closed == 2) {
                            ShowAlert({
                                message: "Condition Reopen !",
                                type: "success"
                            });
                        }
                        // addEvent(request, "Action Item Updated", "Action Item Updated", 8, vm.Condition.DomainID);
                    } else {
                        if (angular.isUndefined(vm.Condition.ActionItemID) || vm.Condition.ActionItemID == 0) {
                            ShowAlert({
                                message: "Condition Saved !",
                                type: "success"
                            });
                            addEvent(request, "Action Item Added", "Action Item Added", 8, vm.Condition.DomainID);
                        } else {
                            ShowAlert({
                                message: "Condition Updated !",
                                type: "success"
                            });
                            addEvent(request, "Action Item Updated", "Action Item Updated", 8, vm.Condition.DomainID);
                        }
                    }
                    RequestService.SentMail(request.RequestID, "ConditionUpdate");
                    getActionItem(request.RequestID, data);
                    init();
                })



            }
        };

        
		 function isRealValueCheck(input) {
			return UtilService.IsRealValue(input)
			
		 }

        /*
           Description:Function to save resole condition.
           Input:		
           Output:
           Last Updated: 6/15/2015 - Initial Creation
        */
        function resolveCondition() {
           
            if (!UtilService.IsRealValue(vm.Condition.DateResolved)) {
                ShowAlert({
                    message: "Please enter valid date value in Resolved Date",
                    type: "danger"

                });
            }
            else if (!UtilService.IsRealValue(vm.Condition.Resolution)) {
                
                ShowAlert({
                    message: "Please enter valid Resolve Comments",
                    type: "danger"

                });
            } else {
                AlertService.ShowLoader("Resolving Condition..");
                vm.Condition.Closed = false;
                RequestService.ResolveCondition(request.RequestID, vm.Condition, vm.AttactmentFiles, function () {
                    AlertService.HideLoader();
                    ShowAlert({
                        message: 'Condition Resolved',
                        type: "success"
                    });
                    addEvent(request, "Action Item Updated", "Action Item Updated", 8, vm.Condition.DomainID);
                    vm.AttactmentFiles = [];
                     cancelConditionDetailView();
                }, function () {
                    ShowAlert({
                        message: 'Error occured',
                        type: "danger"
                    });
                   
                });
            }
        }


        /*
           Description:Function to Delete condition.
           Input:		
           Output:
           Last Updated: 6/15/2015 - Initial Creation
        */
        function deleteCondition() {
            if (angular.isDefined(vm.Condition)) {
                openPopup('deleteActionItem', {}, function (modalResult) {
                    if (modalResult == "Ok") {
                        AlertService.ShowLoader("Deleting Condition..");
                        RequestService.DeleteCondition(request.RequestID, vm.Condition.ActionItemID, function (data) {
                            cancelConditionDetailView()
                            AlertService.HideLoader();
                            ReviewService.GetActionItem(request, function (data) {
                                conditionData.splice(0, conditionData.length);
                                Array.prototype.push.apply(conditionData, data);
                            })
                            ShowAlert(
                        {
                            message: 'Condition Deleted',
                            type: "success"

                        }
                    )
                        })
                    }
                });
            } else {
                ShowAlert({
                    message: "Please Select Condition to Delete",
                    type: "danger"

                });

            }
        }
        /*
      Description:Function to Delete Attachment.
      Input:		
      Output:
      Last Updated: 6/15/2015 - Initial Creation
   */
        function deleteAttachment(attachment) {
            openPopup('delete', {}, function (modalResult) {
                if (modalResult == "Ok") {
                    RequestService.DeleteConditionAttachment(request.RequestID, attachment, function (data) {
                        cancelConditionDetailView();
                        ReviewService.GetActionItem(request, function (data) {
                            conditionData.splice(0, conditionData.length);
                            Array.prototype.push.apply(conditionData, data);
                        })
                        ShowAlert(
                        {
                            message: 'Attachment Deleted',
                            type: "success"
                        }
                        )
                    })
                }
            });
        }

        /*
  Description:Function to Check role
  Input:role or email		
  Output:flag for role
  Last Updated: 6/15/2015 - Initial Creation
*/
        function checkRole(role) {
            var isRole = false
            if (role == 'SA') {
                if (UserService.GetProfile().Email == vm.Request.SolutionArchitect) {
                    isRole = true;
                }
            } else {
                if (UserService.GetProfile().Role == role) {
                    isRole = true;
                }
            }
            return isRole;
        }

        function checkResolvers() {

            var isresolver = false
            if (UserService.GetProfile().Role != "Public") {
          

                    if (UserService.GetProfile().Role == "DM" || UserService.GetProfile().Email == vm.Request.SolutionArchitect) {
                        isresolver = true;
                    }
                
            }
              return isresolver;
            }


        function checkAddButton() {
              var isVisible = false
            if (UserService.GetProfile().Role == "DM" || (UserService.GetProfile().Role == "Reviewer" && UtilService.IsRealValue(reviewer))) {
                isVisible = true;
            }
            if (vm.Request.Stage == 8) {
                isVisible = false;
            }
            return isVisible;
        }

        function checkAdder() {
            var isReviewer = false
            if (UserService.GetProfile().Role == "DM" ) {
                isReviewer = true;
            }else if (UserService.GetProfile().Role == "Reviewer" && UtilService.IsRealValue(reviewer)) {
                if (vm.Request.Stage == 10) {
                    var isReviewer = false
                }
            else{
                if (angular.isUndefined(vm.Condition)) {
                    isReviewer = true;
                } else if (angular.isUndefined(vm.Condition.ActionItemID)) {
                    isReviewer = true;
                }
                else {
                    //if (reviewer.DomainID == vm.Condition.DomainID) {
                    if(UserService.GetProfile().Email==vm.Condition.CreatedBy){
                    isReviewer = true;
                    }
                }
            }
        }
            return isReviewer;
        }


        function openPopup(type, object, callback) {
            var result;
            var modalInstance = $uibModal.open({
                animation: true,
                size: 'md',
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'Views/Templates/ArbAttachments.html',
                controller: 'ModalController as modalCtrl',

                resolve: {
                    type: function () {
                        return type;
                    },
                    Attachments: function () {
                        return object;
                    }

                }
            })
            modalInstance.result.then(callback);
        }



        function CloseAlert() {
            vm.IsAlert = false;
            vm.AlertMessage = "";
        }



        function ShowAlert(Alertobj) {
            var oldLocation = $location.hash();
            $location.hash('modal-body');
            $anchorScroll();
            $location.hash(oldLocation);
            vm.AlertMessage = Alertobj.message
            vm.IsAlert = true;
            $timeout(function () {
                CloseAlert()
            }, 5000);


        }

        function RefreshQuestionList() {
            Alertobj.message = "OK it worked."
            ShowAlert()
        }

        angular.extend(vm, {
            CloseModal: cancelDialog,
            ConditionsTableOptions: conditionsTableOptions,
            RiskCategories: riskCategories,
            AddCondition: addCondition,
            ConditionDisplayFlag: conditionDisplayFlag,
            CancelConditionDetailView: cancelConditionDetailView,
            Request: request,
            ResolveCondition: resolveCondition,
            ConditionData: conditionData,
            SaveCondition: saveCondition,
            AttactmentFiles: [],
            AddRisk: addRisk,
            ActionTypes: actionTypes,
            AssignedRisk: assignedRisk,
            IsClosed: isClosed,
            OpenAttachment: openAttachment,
            DeleteAttachment: deleteAttachment,
            DeleteCondition: deleteCondition,
            CheckAdder: checkAdder,
            CheckRole: checkRole,
            CheckResolvers: checkResolvers,
            ReviewerData: reviewerData,
            CloseAlert: CloseAlert,
            IsAlert: isAlert,
            AlertMessage: alertMessage,
            Mindate: mindate,
            IsRequester: isRequester,
            IsRealValueCheck: isRealValueCheck,
            CheckAddButton: checkAddButton,
            ConditionHeader: conditionHeader,
            Checkstage: 10,
            ResolutionType: resolutionTypes,
            DomainList: domainList,
            IsDomain: isDomain
        });


        return vm;
    }

})();
