/*RequestControler
    Description: This module will contain all services for Review module.
    Input:
    Output:

    Last Updated: 11/3/2016 -  Initial creation
*/

(function () {
    'use strict';

    angular
        .module('ARB.Services')
        .factory('ReviewService', factory);

    factory.$inject = ['$http', '$rootScope'];

    function factory($http, $rootScope) {
        var service = {
            GetQuestionsList: getQuestionsList,
            GetList: getList,
            GetActionItem: getActionItem,
            GetRiskCategory: getRiskCategory,
            GetActionType: getActionType,
            GetStandardList: getStandardList,
            GetReviewType: getReviewType,
            GetEventType: getEventType,
            GetResolutionType: getResolutionType,
            GetUserList: getUserList,
            GetUser: getUser,
            GetDomainUser: getDomainUser

        };

        var valueList = {};

        function getUserList(successCallback, errorCallback) {
            return $http.get($rootScope.UserService + 'User/UserList', []).then(function (data) { return successCallback(data.data) }, errorCallback);
        }

        function getUser(userID, successCallback, errorCallback) {
            return $http.get($rootScope.DashboardService + 'Review/User/' + userID, []).then(function (data) { return successCallback(data.data) }, errorCallback);
        }

        function getDomainUser(email, successCallback, errorCallback) {
            return $http.get($rootScope.DashboardService + 'Review/Domainuser/' + email, []).then(function (data) { return successCallback(data.data) }, errorCallback);
        }
        function getQuestionsList(requestId, successCallback, errorCallback) {
            ("Calling getQuestionsList method for Request Id :" + requestId);
            return $http.get($rootScope.DashboardService + 'Review/' + requestId + '/Question', []).then(function (data) {

                return successCallback(data.data)
            }, errorCallback);
        }

        function getStandardList(requestId, successCallback, errorCallback) {
            ("Calling getStandardList method for Request Id :" + requestId);
            return $http.get($rootScope.DashboardService + 'Review/' + requestId + '/Standards', []).then(function (data) { return successCallback(data.data) }, errorCallback);
        }


        function getList(aspect, successCallback, errorCallback) {

            var urlSuffix = "";

            switch (aspect) {
                case 'domain': urlSuffix = "Domains"; break;
                case 'reviewer': urlSuffix = "Reviewers"; break;
                case 'standard': urlSuffix = "Standards"; break;
                case 'acrionType': urlSuffix = "ActionTypes"; break;
                case 'projectType': urlSuffix = "ProjectTypes"; break;
                case 'region': urlSuffix = "Regions"; break;
                case 'stage': urlSuffix = "Stages"; break;
                case 'riskCategorie': urlSuffix = "RiskCategories"; break;
                case 'resolutionType': urlSuffix = "ResolutionTypes"; break;

            }

            if (valueList[aspect] && valueList[aspect].length > 0)

                successCallback(valueList[aspect]);
            else {
                return $http.get(getAPIPath(urlSuffix), []).then(
                    function (data) {
                        valueList[aspect] = data.data;
                        return successCallback(data.data)
                    }, errorCallback);
            }
        }

        function getAPIPath(pathSuffix) {
            ("Calling getAPIPath method for Path Suffix :" + pathSuffix);
            return $rootScope.UserService + "User/" + pathSuffix;
        }

        function getActionItem(request, successCallback) {
            ("Calling getActionItem method for Request :" + request);
            return $http.get('./api/Request/' + request.RequestID + '/GetActionItem').then(function (data) {
                return successCallback(data.data)

            })
        }

        function getRiskCategory(successCallback) {

            return $http.get('./api/Review/RiskCategories').then(function (data) {
                return successCallback(data.data)

            })
        }

        function getActionType(successCallback) {

            return $http.get('./api/Review/ActionTypes').then(function (data) {
                return successCallback(data.data)

            })
        }

        function getEventType(successCallback) {
            return $http.get('./api/Review/EventType').then(function (data) {
                return successCallback(data.data)

            })
        }

        function getReviewType(successCallback) {
            return $http.get('./api/Review/ReviewType').then(function (data) {
                return successCallback(data.data)

            })
        }

        function getResolutionType(successCallback) {
            return $http.get('./api/Review/ResolutionTypes').then(function (data) {
                return successCallback(data.data)

            })
        }
        return service;


    }
})();