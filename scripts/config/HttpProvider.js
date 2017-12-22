/*RequestControler
    Description: This module will contain Configuration for httpProvider.
    Input:
    Output:

    Last Updated: 11/4/2016 -  Initial creation
*/
(function() {
    'use strict';

    angular
        .module('ARB.Config')
        .config(httpProvider);
   
   
    function httpProvider($httpProvider) {
        /* Request Trasformer */

        var requestHandler = function (data, headersGetter) {
            
           // AlertService.ShowLoader("one");
            return data;
        };

        $httpProvider.defaults.transformRequest.push(requestHandler);

      
        $httpProvider.interceptors.push(function ($q, $rootScope, AlertService, $location) {
      return {
        'responseError': responseError
      };

      function responseError(rejection) {
          
          var defer = $q.defer();

          if (rejection.status === 401) {
              $location.path('/#');
              var alertMessage = {
                  message: "Authorization Denied!",
                  type: 'danger'
              }
          } else  {
                var alertMessage = {
              message: "Error Occured !",
              type : 'danger'
          }
          }
          
          if (rejection.status !== 409)
          {
              AlertService.ShowAlert(alertMessage);
          }
         
          AlertService.HideLoader();

          defer.reject(rejection);
          return defer.promise;
        }
    });
  }


})();



//$httpProvider.responseInterceptors.push('myHttpInterceptor');
//var spinnerFunction = function (data, headersGetter) {
//    // todo start the spinner here
//    //alert('start spinner');
//    $('#mydiv').show();
//    return data;
//};
//$httpProvider.defaults.transformRequest.push(spinnerFunction);
//})
//// register the interceptor as a service, intercepts ALL angular ajax http calls
//    .factory('myHttpInterceptor', function ($q, $window) {
//        return function (promise) {
//            return promise.then(function (response) {
//                // do something on success
//                // todo hide the spinner
//                //alert('stop spinner');
//                $('#mydiv').hide();
//                return response;

//            }, function (response) {
//                // do something on error
//                // todo hide the spinner
//                //alert('stop spinner');
//                $('#mydiv').hide();
//                return $q.reject(response);
//            });
//        };
//    });