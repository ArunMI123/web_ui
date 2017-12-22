/*RequestControler
    Description: This module will contain all of the functions required to implement the Login functionality
    Input:
    Output:

    Last Updated: 11/3/2016 -  Initial creation
*/

(function () {
    'use strict';
	   var app = angular
        .module('ARB.LoginModule', []);

    app.controller('LoginController', loginController);

    loginController.$inject = ['$location', 'UserService', 'AlertService', '$cookies', 'UtilService'];

    function loginController($location, UserService, AlertService, $cookies, UtilService) {
        var vm = this;
        var userName;
        var password;
        function Login(userName, passWord) {
            if ((!UtilService.IsRealValue(vm.UserName)) || (!UtilService.IsRealValue(vm.Password))) {
                AlertService.ShowAlert({
                    message: "Please enter valid Username / Password",
                    type: "danger"

                });
            }
            else {
                AlertService.ShowLoader("Accessing NASA Credentials.");
                var domainsQueue = UserService.LoginUser(vm.UserName, vm.Password, function (data) {
                    (data);
                    $cookies.put('user', angular.toJson(data));
                    if (angular.isUndefined($location.search().requestId)) {
                        $location.path('/workQueue');
                    } else {
                        $location.path('/request/' + $location.search().requestId);
                    }

                    AlertService.ShowAlert({
                        message: "Login Success !",
                        type: "success"

                    });
                    $location.search('');
                }, function (data) {

                    AlertService.ShowAlert({
                        message: data,
                        type: "danger"

                    });
                    vm.Password = null;
                });
            }

        }

        //Click event function which invoke userservice
        function buttonClick() {
            //refer Script/services/UserSevice
            UserService.ButtonService(function (data) {
                //success callback function

            });

        }

        angular.extend(vm, {
            Login: Login,
            Password: password,
            UserName: userName,
            ButtonClick: buttonClick
            //for access from html page
        });

        return vm;


    }
})();