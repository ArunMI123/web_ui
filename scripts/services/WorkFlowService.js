(function () {
    'use strict';

    angular
        .module('ARB.Services')
        .factory('WorkFlowService', factory);

    factory.$inject = ['$http', '$timeout', '$filter', 'UserService', 'RequestService', '$rootScope', 'AlertService', 'REVIEW_STAGE'];

    function factory($http, $timeout, $filter, UserService, RequestService, $rootScope, AlertService,REVIEW_STAGE) {
        var service = {
            SaveDMAcceptance: saveDMAcceptance,
            SaveReviewerAssignments: saveReviewerAssignments,
            GetReviewerDetail: getReviewerDetail,
            GetAllReviewers: getAllReviewers,
            SubmitVote: submitVote,
            LogEvent: logEvent,
            ReviewerReassignment: reviewerReassignment,
            PackageDecision: packageDecision
        };
        

        var EVENT={
            REQUESTCREATED: 1,
            REQUESTUPDATED: 2,
            REQUESTSUBMITTED: 3,
            VOTING: 4,
            REVIEW: 5,
            REQUESTACCEPTED: 6,
            REQUESTREJECTED: 7,
            VOTED: 8
    }

        function saveDMAcceptance(request, submissionDecision, submissionDecisionComment) {

            AlertService.ShowLoader("Processing Request.");
            RequestService.AddAcceptance(request, submissionDecision, submissionDecisionComment, function (data) {
                if (submissionDecision === 1 || submissionDecision === 2) {
                   var stateUpdatePromise = RequestService.UpdateStage(request.RequestID, REVIEW_STAGE.AWAITING_PACKAGE, "");
                    stateUpdatePromise.then(function (data) {
                        var logEventPromise = logEvent(request.RequestID, 'Awaiting Package', 'Request Awaiting for Package');
                        if (submissionDecision === 1) {
                            RequestService.SentMail(request.RequestID, "AwaitingPackageOnline");
                            logEvent(request.RequestID, 'Review Type', 'This Request is Reviewing as "Online"',5);
                        } else {
                            RequestService.SentMail(request.RequestID, "AwaitingPackageOffline");
                            logEvent(request.RequestID, 'Review Type', 'This Request is Reviewing as "Offline"', 5);
                        }
                       logEventPromise.then(function (logData) {
                           $rootScope.$emit('StageUpdated', REVIEW_STAGE.AWAITING_PACKAGE, logData.data);
                           AlertService.HideLoader();
                       });
                   });
                    
               }
                if (submissionDecision === 3) {
                    logEvent(request.RequestID, 'Review Type', 'This Request is Reviewing as "Lite"', 5);
                   var stateUpdatePromise = RequestService.UpdateStage(request.RequestID, REVIEW_STAGE.REVIEW_INITIATED,"");
                   stateUpdatePromise.then(function (data) {
                       
                       var logEventPromise = logEvent(request.RequestID, 'Review Intiated', 'Review Initiated for Request');
                       RequestService.SentMail(request.RequestID, "RequestorReviewLiteMail");
                       logEventPromise.then(function (logData) {
                           $rootScope.$emit('StageUpdated', REVIEW_STAGE.REVIEW_INITIATED, logData.data);
                           RequestService.SentMail(request.RequestID, "ReviewInitiated");
                           AlertService.HideLoader();
                       });
                   });

               }
                if (submissionDecision === 4) {
                    logEvent(request.RequestID, 'Review Type', 'This Request is Reviewing as "NoReview"', 5);
                   RequestService.SentMail(request.RequestID, "NoReview");
                   var stateUpdatePromise = RequestService.UpdateStage(request.RequestID, REVIEW_STAGE.FINAL, "");
                   stateUpdatePromise.then(function (data) {
                       var logEventPromise = logEvent(request.RequestID, 'Review Decision', 'NO Review');
                       RequestService.SentMail(request.RequestID, "Final");
                       logEventPromise.then(function (logData) {
                           $rootScope.$emit('StageUpdated', REVIEW_STAGE.FINAL, logData.data);
                           AlertService.HideLoader();
                       });
                   });

               }
                if (submissionDecision == 5) {
                    
                    var stateUpdatePromise = RequestService.UpdateStage(request.RequestID, REVIEW_STAGE.REWORK, "");
                    stateUpdatePromise.then(function (data) {
                        var logEventPromise = logEvent(request.RequestID, 'Rework', 'Request Rejected', EVENT.REQUESTREJECTED);
                        RequestService.SentMail(request.RequestID, "Rework");
                        logEventPromise.then(function (logData) {
                            $rootScope.$emit('StageUpdated', REVIEW_STAGE.REWORK, logData.data);
                            AlertService.HideLoader();
                        });
                    });

                }
               
            }, function () {


            });

        }
        function packageDecision(request, decision,comment) {
            AlertService.ShowLoader("Processing Request.");
            RequestService.PackageDecision(request.RequestID, decision,comment,UserService.GetProfile().Email,function(){
                if (decision === '1') {
                var stateUpdatePromise = RequestService.UpdateStage(request.RequestID, REVIEW_STAGE.PACKAGE_APPROVED, "");
                stateUpdatePromise.then(function (data) {
                    var logEventPromise = logEvent(request.RequestID, 'Package Approved', 'Package Approved');
                    logEventPromise.then(function (logData) {
                        $rootScope.$emit('StageUpdated', REVIEW_STAGE.PACKAGE_APPROVED, logData.data);
                        AlertService.HideLoader();
                    });
                });

            }
            if (decision === '2') {
                RequestService.SentMail(request.RequestID, "PackageRejectedMail");
                var stateUpdatePromise = RequestService.UpdateStage(request.RequestID, REVIEW_STAGE.AWAITING_PACKAGE, "");
                stateUpdatePromise.then(function (data) {
                    var logEventPromise = logEvent(request.RequestID, 'Package Rejected', 'Package Rejected by DM');
                    logEventPromise.then(function (logData) {
                        $rootScope.$emit('StageUpdated', REVIEW_STAGE.AWAITING_PACKAGE, logData.data);
                        AlertService.HideLoader();
                    });
                });

            }
          
        })

        }
        

        function saveReviewerAssignments(request,reviewerAssignmentList) {
            AlertService.ShowLoader("Processing Request.");
            RequestService.UpdateReviewers(request.RequestID, reviewerAssignmentList, function () {
             
                var stateUpdatePromise = RequestService.UpdateStage(request.RequestID, REVIEW_STAGE.REVIEW_INITIATED, "");
                stateUpdatePromise.then(function (data) {

                    var logEventPromise = logEvent(request.RequestID, 'Review Initiated', 'Review Initiated', EVENT.REVIEW);
                    RequestService.SentMail(request.RequestID, "ReviewInitiated");
                    logEventPromise.then(function (logData) {

                        AlertService.ShowAlert({
                            message: "Request form reviewers updated.",
                            type: "success"

                        });

                        $rootScope.$emit('StageUpdated', REVIEW_STAGE.REVIEW_INITIATED, logData.data);
                        AlertService.HideLoader();
                    });
                });
              
            });
        }
        
        function reviewerReassignment(request, reviewerList,callback ) {
            RequestService.UpdateReviewers(request.RequestID, reviewerList, function (data) {
                    return callback(data)
                })
         
        }

        function logEvent(requestId,StageDesc,eventText,eventId,domain,callback) {
         
            var event = {
                RequestID: requestId,
                EventType: eventId,
                EventText: eventText,
                StageDescription: StageDesc,
                Author: UserService.GetProfile().Name,
                Domain:domain
            }
             
            return RequestService.LogEvent(event);
        }
        
        function getAllReviewers(request, stage, callback) {
           RequestService.GetAllReviewer(request.RequestID, stage, function (data) {
               callback(data);
            })
        }
       
        function submitVote(request, stage, voteList, domainName) {
            var decision = "";
            AlertService.ShowLoader("Processing Request.");
            RequestService.UpdateReviewers(request.RequestID, voteList, function () {
                var eventComment;
                var eventtype;
              
                    eventComment = "Review Cast";
                    eventtype = EVENT.REVIEW;
            
                var eventLogPromise = logEvent(request.RequestID, eventComment, eventComment,eventtype,domainName);
                eventLogPromise.then(function (logData) {
                         Decision(request, stage);
                        AlertService.HideLoader();
                    });
               
            });
           
   }


        function Decision(request, stage) {
            AlertService.ShowLoader("Processing Request.");
            var decision = '';
              AlertService.ShowAlert({
                    message: "Your Review was Saved.",
                    type: "success"

                });
                
                RequestService.GetAllReviewer(request.RequestID, REVIEW_STAGE.REVIEW_INITIATED, function (data) {
                   decision = determineReviewResult(data);
                    if (decision != null) {
                        AlertService.ShowLoader("Processing Request..");
                     request.ReviewerReviewDecision = decision;
                        request.ReviewerReviewDecisionDate = new Date();
                        RequestService.SaveRequest(request, function (data) {
                            //var newStage;
                            //var stateUpdatePromise = RequestService.UpdateStage(request.RequestID, REVIEW_STAGE.REVIEW_COMPLETED, "");
                            //stateUpdatePromise.then(function (data) {
                            //    var logEventPromise = logEvent(request.RequestID, 'Review Completed', 'Review Completed', EVENT.REVIEW);
                            //    RequestService.SentMail(request.RequestID, "ReviewCompleted");
                            //    logEventPromise.then(function (logData) {
                            //        $rootScope.$emit('StageUpdated', REVIEW_STAGE.REVIEW_COMPLETED, logData.data);
                            //       
                            //    });
                               
                            //});
                            AlertService.HideLoader();
                        });
                       
                    }

                })
            
            //if (stage == REVIEW_STAGE.VOTING) {
            //    ("Calling Decision method for stage :" + stage);
            //    AlertService.ShowAlert({
            //        message: "Your Vote was Saved.",
            //        type: "success"

            //    });
                
            //    AlertService.ShowLoader("Processing Request.");
            //    RequestService.GetAllReviewer(request.RequestID, STAGE.VOTING, function (data) {
            //      decision = determineResultDecision(data);
            //      ("Calling Decision method for decision :" + decision);
            //        if (decision != null) {
            //            if (decision == 'tied') {
                       
            //                var stateUpdatePromise = RequestService.UpdateStage(request.RequestID, STAGE.VOTING_TIED, "");
            //                ("Calling Decision method for stateUpdatePromise :" + stateUpdatePromise);
            //                stateUpdatePromise.then(function (data) {

            //                    var logEventPromise = logEvent(request.RequestID, 'Voting Tied', 'Voting Tied', EVENT.VOTING);
            //                    ("Calling Decision method for logEventPromise :" + logEventPromise);
            //                    logEventPromise.then(function (logData) {

            //                        $rootScope.$emit('StageUpdated', STAGE.VOTING_TIED, logData.data);
            //                        AlertService.HideLoader();
            //                    });
            //                });
            //            }
            //            else {
            //                AlertService.ShowLoader("Processing Request.");
            //                request.VotingDecision= decision;
            //                request.VotingDecisionDate= new Date();
            //                RequestService.SaveRequest(request, function (data) {

            //                    var stateUpdatePromise = RequestService.UpdateStage(request.RequestID, STAGE.VOTING_COMPLETED, "");
            //                    ("Calling Decision method for stateUpdatePromise :" + stateUpdatePromise);
            //            stateUpdatePromise.then(function (data) {

            //                var logEventPromise = logEvent(request.RequestID, 'Voting Completed', 'Voting Completed', EVENT.VOTING);
            //                ("Calling Decision method for logEventPromise :" + logEventPromise);
            //                logEventPromise.then(function (logData) {
                                
            //                    // Update Stage to Review Initiated
            //                    if (decision != "Lite") {
            //                        var stateUpdatePromise1 = RequestService.UpdateStage(request.RequestID, STAGE.REVIEW, "");
            //                        ("Calling Decision method for stateUpdatePromise1 :" + stateUpdatePromise1);
            //                        stateUpdatePromise1.then(function (data) {

            //                            var logEventPromise1 = logEvent(request.RequestID, 'Review Initiated', 'Review Initiated', EVENT.REVIEW);
            //                            logEventPromise1.then(function (logData) {

            //                                $rootScope.$emit('StageUpdated', STAGE.REVIEW, logData.data);
            //                                AlertService.HideLoader();
            //                            });
            //                        });
            //                    } else {
                                
            //                        $rootScope.$emit('StageUpdated', STAGE.VOTING_COMPLETED, logData.data);
            //                        AlertService.HideLoader();
            //                    }

            //                });
            //            });

            //        })    
            //        }
            //        }



            //    })
            //}
        }
        function determineResultDecision(arrayList) {
           
            var array_elements = determineDecision(arrayList);
                  
            if (array_elements.length < arrayList.length)
                return null;

            array_elements.sort();
            var current = null;
            var modeMap = {};
            var maxEl = array_elements[0], maxCount = 1, maxElsecond = '';

            for (var i = 0; i < array_elements.length; i++) {
                var el = array_elements[i];
                if (array_elements[i] != current) {
                    current = array_elements[i];
                    modeMap[el] = 1;
                } else {
                    modeMap[el]++;
                }

                if (modeMap[el] > maxCount) {
                    maxEl = el;
                    maxCount = modeMap[el];
                }
            }
            var onlineValue ;
            for (var key in modeMap) {
                var value = modeMap[key];
                onlineValue=modeMap['Online']
                if (value == maxCount && key != maxEl) {
                  
                    maxElsecond = key;
                }
            }
            if (onlineValue == maxCount) {
                maxEl='Online'
            }
            else if (maxElsecond != '') {
                maxEl = 'tied';
            }
            ("Calling determineResultDecision method for maxEl :" + maxEl);
            return maxEl;
        }

        function determineDecision(arrayList) {
            var modeMap = [];
            var counter = 0;
            var intCountReviewer = arrayList.length;
            $.each(arrayList, function (idx, obj) {
                if (obj.Result == "No Result") {
                    return null;
                } else {
                    modeMap[counter] = obj.Result;
                    counter++;
                }
            })
            ("Calling determineDecision method for modeMap :" + modeMap);
            return modeMap;
        }


        function determineReviewResult(arrayList) {

            var array = determineDecision(arrayList);
           
            if (array.length < arrayList.length)
                return null;

            array.sort();
            var current = null;
            var modeMap = {};
            var approveWC = false, approveWE = false;
            var maxEl = array[0], maxCount = 1;
            for (var i = 0; i < array.length; i++) {
                var el = array[i];
                if (el === 'Approved w/Conditions') {
                    approveWC = true;
                }
                if (el === 'Approved w/Exceptions') {
                    approveWE = true;
                }
                if (array[i] != current) {
                    current = array[i];
                    modeMap[el] = 1;
                } else {
                    modeMap[el]++;
                }

                if (modeMap[el] > maxCount) {
                    maxEl = el;
                    maxCount = modeMap[el];
                }
            }
            if (maxEl === 'Approved' && approveWC === true) {
                maxEl = 'Approved w/Conditions';
            }
            if (maxEl === 'Approved' && approveWE === true) {
                maxEl = 'Approved w/Exceptions';
            }
            return maxEl;
        }

   

            function getReviewerDetail(request,callback) 
            {
                RequestService.GetReviewer(request.RequestID, function (data) {
                    callback(data);
                })
            }
        
           return service;


    }
})();