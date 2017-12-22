(function () {
    'use strict';

    angular
        .module('ARB.Services')
        .factory('UserService', factory);

    factory.$inject = ['$http', '$timeout', '$cookies', '$filter', '$location', 'AlertService', '$route', '$rootScope'];

    function factory($http, $timeout, $cookies, $filter, $location, AlertService, $route, $rootScope) {
        var Switchflag = false;

        var service = {
            GetProfile: getProfile,
            LoginUser: loginUser,
            Getswitch: getswitch,
            IsSwitch: isSwitch,
            SwitchUser: switchUser,
            OtherProfile: otherProfile,
            Logout: logout,
            ButtonService: buttonService,
            Profiles: profiles
        };

        var profiles = [];
        function setupAuth(accessToken) {
            ("Calling setupAuth method for Token : " + accessToken)
            if (accessToken === 'invaliduser') {
                delete $http.defaults.headers.common['Authorization'];
                $location.path('/#');
            }
            else if (accessToken !== null || accessToken !== 'undefined' || accessToken !== '') {
                var header = 'Bearer ' + accessToken;
                delete $http.defaults.headers.common['Authorization'];
                $http.defaults.headers.common['Authorization'] = header;
                sessionStorage['accessToken'] = accessToken;
                return header;
            }
        }

        function otherProfile(user) {

            var otherProfiles = {};
            var otherUser1;
            var otherUser2;
            if (angular.isDefined(user)) {
                if (user.Role === "DM") {
                    otherUser1 = "Reviewer";
                    otherUser2 = "Public";
                } else if (user.Role === "Reviewer") {
                    otherUser1 = "DM";
                    otherUser2 = "Public";
                } else if (user.Role === "Public") {
                    otherUser1 = "DM";
                    if (user.otherRole != "DM") {
                        otherUser2 = user.otherRole;
                    }
                    else {
                        otherUser2 = "Reviewer";
                    }

                } else if (user.Role === "Requester") {
                    otherUser1 = "DM";
                    otherUser2 = "Public";
                }
                otherProfiles = {
                    user1: otherUser1,
                    user2: otherUser2
                }

            }
            service.Profiles = otherProfiles;
            return otherProfiles;
        }

        function logout() {
            Switchflag = false;
            $cookies.remove("user");
            $location.path('/#');
            AlertService.ShowAlert({
                message: "Logout Success !",
                type: "success"

            });
        }

        function switchUser(user) {

            var userdata = JSON.parse($cookies.get('user'));
            userdata.otherRole = userdata.Role;
            userdata.Role = user;
            $cookies.put('user', angular.toJson(userdata));
            $location.path('/#');
            $location.path('/workQueue');
            $route.reload();
            Switchflag = false;
        }


        function isSwitch() {
            return Switchflag;
        }
        function getProfile() {

            if (angular.isUndefined($cookies.get('user'))) {
                return $cookies.get('user');
            }
            else {
                return JSON.parse($cookies.get('user'));
            }

        }
        function getswitch() {

            Switchflag = true;
        }

        function loginUser(userName, passWord, successCallback, errorCallback) {
            var user = {};
            user.UserName = userName;
            user.Password = passWord;

            if (!userName && !passWord)
                return -1;

            return $http.post($rootScope.DashboardService + 'Account/Token', user).then(function (data) {
                setupAuth(data.data.AccessToken);
                return successCallback(data.data);
            }, function (data) {
                setupAuth('invaliduser');
                return errorCallback(data.data)
            });


        }

        //function for button sending rest call to request controller
        function buttonService(successCallback) {
            //Url for rest function.
            //here we give attachment controller url for storeSP
            return $http.get('./api/Attachments/StoreSPItem').then(function (data) {

                return successCallback(data.data);
            });
        }
        return service;


    }
})();