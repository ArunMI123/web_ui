(function () {
    'use strict';

    angular
        .module('ARB.Services')
        .factory('RequestService', factory);

    factory.$inject = ['$http', '$timeout', '$filter', 'UserService', 'AlertService', '$rootScope'];

    function factory($http, $timeout, $filter, UserService, AlertService, $rootScope) {
        var service = {
            GetRequestList: getRequestList,
            GetRequest: getRequest,
            SaveRequest: saveRequest,
            GetConditions: getConditions,
            UpdateReviewers: updateReviewers,
            UpdateStage: updateStage,
            AddAcceptance: addAcceptance,
            GetReviewer: getReviewer,
            GetAllReviewer: getAllReviewer,
            SaveCondition: saveCondition,
            ResolveCondition: resolveCondition,
            AddAttachments: addAttachments,
            LogEvent: logEvent,
            GetEventLog: getEventLog,
            DeleteAttachment: deleteAttachment,
            ConditionCount: conditionCount,
            DeleteCondition: DeleteCondition,
            DeleteConditionAttachment: DeleteConditionAttachment,
            ReviewerReassignment: reviewerReassignment,
            DeleteReviwerAssignment: deleteReviwerAssignment,
            GetActionItem: getActionItem,
            GetAttachments: getAttachments,
            GetAttachment: getAttachment,
            GetStages: getStages,
            GetSubmitResult: getSubmitResult,
            SearchRequestList: searchRequestList,
            SentMail: sentMail,
            UpdateDueDate: updateDueDate,
            GetResultCount: getResultCount,
            PackageDecision: packageDecision,
            GetConditionCount: getConditionCount,
            SaveUser: saveUser,
            SaveDomain: saveDomain,
            PackageSubmission: packageSubmission,
            GetSharePointLoc: getSharePointLoc,
            GetReviewerAssignedCount: getReviewerAssignedCount
        };

        function getAttachment(url, file) {


            $http({
                method: 'GET',
                url: url,

                responseType: 'arraybuffer'
            }).
                success(function (data, status, headers) {
                    headers = headers();

                    var filename = file;
                    var contentType = headers['content-type'];
                    var linkElement = document.createElement('a');
                    try {
                        var ms_ie = false;
                        var ua = window.navigator.userAgent;
                        var old_ie = ua.indexOf('MSIE ');
                        var new_ie = ua.indexOf('Trident/');

                        if ((old_ie > -1) || (new_ie > -1)) {
                            ms_ie = true;
                        }


                        var blob = new Blob([data], { type: contentType }, filename);

                        if (ms_ie) {
                            window.navigator.msSaveBlob(blob, filename);
                        }
                        else {
                            var url = window.URL.createObjectURL(blob);

                            linkElement.setAttribute('href', url);
                            linkElement.setAttribute("download", filename);
                            var clickEvent = new MouseEvent("click", {
                                "view": window,
                                "bubbles": true,
                                "cancelable": false
                            });
                            linkElement.dispatchEvent(clickEvent);
                        }
                    } catch (ex) {
                        (ex);
                    }
                }).error(function (data) {
                    (data);
                });
        }



        function getStages(successCallback, errorCallback) {
            return $http.get($rootScope.DashboardService + 'Request/Stages').then(function (data) { return successCallback(data.data) }, errorCallback);
        }


        function getRequestList(flag, successCallback, errorCallback) {
            var user = UserService.GetProfile()
            user.IsAll = flag;

            return $http.post($rootScope.DashboardService + 'Request/GetRequests', user).then(function (data) { return successCallback(data.data) }, errorCallback);
        }

        function searchRequestList(searchdata, successCallback, errorCallback) {
            searchdata.User = UserService.GetProfile()
            return $http.post($rootScope.DashboardService + 'Request/SearchRequest', searchdata).then(function (data) { return successCallback(data.data) }, errorCallback);
        }

        function getRequest(requestId, successCallback, errorCallback) {

            return $http.get($rootScope.DashboardService + 'Request/' + requestId, []).then(function (data) { return successCallback(data.data) }, errorCallback);
        }

        function getAttachments(requestId, successCallback, errorCallback) {


            return $http.get($rootScope.DashboardService + 'Request/' + requestId + '/GetAttachments', []).then(function (data) { return successCallback(data.data) }, errorCallback);
        }

        function getConditions(requestId, successCallback, errorCallback) {

            return $http.get('data/ActionItems.json', []).then(function (data) { return successCallback(data.data) }, errorCallback);
        }

        function saveRequest(request, successCallback, errorCallback) {

            return $http.post('./api/Request', request).then(function (data) {

                return successCallback(data.data)
            }, errorCallback);
        }

        function updateStage(requestId, stage, comment) {

            var request = {
                StageId: stage,
                comments: comment,
            }
            return $http.post('./api/Request/' + requestId + '/UpdateStage', request);
        }

        function updateReviewers(requestId, reviewerAssignmentList, successCallback, errorCallback) {

            return $http.post('./api/Request/' + requestId + '/UpdateReviewers', reviewerAssignmentList).then(function (data) { return successCallback(data.data) }, errorCallback);
        }
        function getReviewer(requestId, successCallback, errorCallback) {

            return $http.get('./api/Request/' + requestId + '/ReviewerDetail')
                .then(function (data) { return successCallback(data.data) }, errorCallback);

        }
        function getAllReviewer(requestId, stage, successCallback, errorCallback) {

            return $http.get('./api/Request/' + requestId + '/Reviewers/' + stage)
                .then(function (data) { return successCallback(data.data) }, errorCallback);

        }


        function addAcceptance(requestId, resultStatus, comment, successCallback, errorCallback) {

            var request = {
                ResultId: resultStatus,
                Comments: comment,

            }
            return $http.post('./api/Request/' + requestId.RequestID + '/AddAcceptance', request).then(function (data) {
                return successCallback(data.data)

            }, errorCallback);

        }


        function resolveCondition(requestID, actionItem, attachments, successCallback, errorCallback) {

            // Build Multipart data;
            var formData = new FormData();

            formData.append("actionItem", angular.toJson(actionItem));

            for (var i = 0; i < attachments.length; i++) {
                formData.append("file" + i, attachments[i]);

            }

            return $http.post('./api/Request/' + requestID + '/condition/' + actionItem.ActionItemID + '/resolve', formData, {
                headers: { 'Content-Type': undefined },
                transformRequest: angular.identity,
            }).then(successCallback, errorCallback);

        }



        function saveCondition(requestId, condition, successCallback, errorCallback) {

            ("Calling saveCondition method for Request Id :" + requestId);
            return $http.post('./api/Request/' + requestId + '/SaveCondition', condition).then(function (data) { return successCallback(data.data) }, errorCallback);


        }

        function addAttachments(requestID, attachments, successCallback, errorCallback) {

            // Build Multipart data;
            var formData = new FormData();

            for (var i = 0; i < attachments.length; i++) {
                formData.append("file" + i, attachments[i]);

            }


            return $http.post('./api/Request/' + requestID + '/Attachments', formData, {
                headers: { 'Content-Type': undefined },
                transformRequest: angular.identity,
            }).then(successCallback, errorCallback);


        }


        function logEvent(event) {

            return $http.post('./api/Request/AddEventLog', event);
        }

        function getEventLog(requestId, successCallback, errorCallback) {

            return $http.get('./api/Request/' + requestId + '/EventLog').then(function (data) { return successCallback(data.data) }, errorCallback);

        }


        function deleteAttachment(requestId, attachment, successCallback, errorCallback) {

            return $http.post('./api/Attachments/' + requestId + '/DeleteAttachments', attachment).then(function (data) { return successCallback(data.data) }, errorCallback);
        }

        function conditionCount(requestId, successCallback, errorCallback) {

            return $http.get('./api/Request/' + requestId + '/ActionItemCount').then(function (data) { return successCallback(data.data) }, errorCallback);
        }


        function DeleteConditionAttachment(requestID, Attachment, successCallback, errorCallback) {

            return $http.post('./api/Attachments/' + requestID + '/RemoveActionItemAttachment', Attachment).then(function (data) { return successCallback(data.data) }, errorCallback);
        }

        function DeleteCondition(requestID, ActionItemId, successCallback, errorCallback) {

            return $http.get('./api/Request/' + requestID + "/" + ActionItemId + '/DeleteCondition').then(function (data) { return successCallback(data.data) }, errorCallback);
        }

        function reviewerReassignment(requesid, reviewerlist, successCallback) {
            ("Calling reviewerReassignment method for Request : " + requesid + "reviewerlist : " + reviewerlist);
            return $http.post('./api/Request/' + requestId + '/reassignReviewer', reviewerlist).then(function (data) { return successCallback(data.data) }, errorCallback);

        }

        function deleteReviwerAssignment(requesid, stage, successCallback) {

            return $http.get('./api/Request/' + requesid + '/DeleteReviewerAssignment/' + stage).then(function (data) { return successCallback(data.data) });
        }

        function getActionItem(requestid, actionItemID, successCallback) {

            return $http.get('./api/Request/' + requestid + '/GetActionItem/' + actionItemID).then(function (data) { return successCallback(data.data) });
        }

        function getSubmitResult(requestid, successCallback) {
            return $http.get('./api/Request/' + requestid + '/GetSubmitResult').then(function (data) {
                return successCallback(data)
            });
        }
        function sentMail(requestid, EmailText, successCallback) {
            return $http.get('./api/Request/' + requestid + '/SentMail/' + EmailText);
        }


        function updateDueDate(requestId, duedate, successCallback, errorCallback) {
            var request = {
                DueByDate: duedate
            }
            return $http.post('./api/Request/' + requestId + '/UpdateDueDate', request)
                .then(function (data) { return successCallback(data.data) }, errorCallback);

        }

        function packageSubmission(requestId, packageSubmissiondate, successCallback, errorCallback) {
            var request = {
                PackageSubmissionDate: packageSubmissiondate
            }
            return $http.post('./api/Request/' + requestId + '/UpdatePackageDate', request)
                .then(function (data) { return successCallback(data.data) }, errorCallback);

        }

        function getResultCount(requestid, successCallback) {
            return $http.get('./api/Request/' + requestid + '/ReviwerResultCount').then(function (data) {
                return successCallback(data)
            });
        }

        function packageDecision(requestId, resultStatus, comment, email, successCallback, errorCallback) {

            var request = {
                RequestID: requestId,
                PackageResult: resultStatus,
                PackageComment: comment,
                CreatedBy: email
            }
            return $http.post('./api/Request/' + requestId + '/AddPackageDecision', request).then(function (data) {
                return successCallback(data.data)

            }, errorCallback);

        }
        function getConditionCount(requestid, email, successCallback) {
            return $http.get('./api/Request/' + requestid + '/GetNoofCondition/' + email).then(function (data) {
                return successCallback(data.data)
            });
        }
        function getSharePointLoc(requestid, successCallback) {
            return $http.get('./api/Request/' + requestid + '/GetSharepointLoc').then(function (data) {
                return successCallback(data.data)
            });
        }


        function saveUser(userDetail, successCallback, errorCallback) {
            return $http.post($rootScope.UserService + 'User/SaveUser', userDetail).then(function (data) {
                return successCallback(data)
            }, function (data) {

                return errorCallback(data);
            });
        }

        function saveDomain(domain, successCallback, errorCallback) {

            return $http.post($rootScope.UserService + 'User/AddDomain', domain).then(function (data) {
                return successCallback(data);
            }, function (data) {

                return errorCallback(data);
            });
        }


        function getReviewerAssignedCount(reviewerid, successCallback) {
            return $http.get($rootScope.UserService + 'User/ReviwerAssignmentList/' + reviewerid).then(function (data) {
                return successCallback(data.data)
            });
        }
        return service;


    }


})();