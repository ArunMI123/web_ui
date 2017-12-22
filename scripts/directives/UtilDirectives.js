/*RequestControler
    Description: This module declares ARB Util directives
    Input:
    Output:

    Last Updated: 11/18/2016 -  Perumal Initial creation
*/

(function () {
    'use strict';

    var app = angular
        .module('ARB.Directives');

    app.directive('convertToNumber', convertToNumber);

        function convertToNumber($window, AlertService, ToolbarService) {
            // Usage:
            //     <convertToNumber></convertToNumber>
            // Creates:
            // 
            var directive = {
                link: link,
                require: 'ngModel'
            };
            return directive;

            function link(scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function (val) { 
                    return parseInt(val, 10);
                });
                ngModel.$formatters.push(function (val) {
                    return '' + val;
                });
            }
        }

    //  Directive for Uppercase

        app.directive('allCapsInput', allCapsInput);

        function allCapsInput() {
            return {
                require: 'ngModel',
                link: function (scope, element, attr, ngModelCtrl) {
                    function fromUser(text) {
                        var transformedInput = text.toUpperCase();
                       if (transformedInput !== text) {
                            ngModelCtrl.$setViewValue(transformedInput);
                            ngModelCtrl.$render();
                        }
                        return transformedInput;
                    }
                    ngModelCtrl.$parsers.push(fromUser);
                }
            };
        };

        app.directive('customOnChange', function() {
           
            return {
               

                restrict: 'A',
                link: function (scope, element, attrs) {
                    var onChangeFunc = scope.$eval(attrs.customOnChange);
                    element.bind('change', onChangeFunc);
                }
            }; 
        });

        app.filter('uniqueFilter', function () {
            return function (collection, keyname) {
                var output = [],
                  keys = [];


                angular.forEach(collection, function (item) {
                    var key = item[keyname];
                    if (keys.indexOf(key) === -1) {
                        keys.push(key);
                        output.push(item);
                    }
                });


                return output;
            };
        })



        app.directive('dateValidation', dateValidation);

        function dateValidation($filter) {
            
                return {
                    restrict: 'A',
                    require: '?ngModel',
                    link: function (scope, element, attrs, ngModel) {
                        ngModel.$formatters.push(function (viewValue) {
                         return viewValue;

                        });
                    }


                }

            
        }

		 app.directive('focus',		function($timeout) {
			 return {
				 scope : {
				   trigger : '@focus'
				 },
				 link : function(scope, element) {
				  scope.$watch('trigger', function(value) {
					if (value === "true") {
					  $timeout(function() {
					   element[0].focus();
					  });
				   }
				 });
				 }
			};
		}); 

      app.directive('dropdownMultiselect', function () {
            return {
                restrict: 'E',
                scope: {
                    model: '=',
                    options: '=',
                },
                template:
                        "<div class='btn-group' data-ng-class='{open: open}'>" +
                            "<button class='btn btn-small'>Select...</button>" +
                            "<button class='btn btn-small dropdown-toggle'data-ng-click='openDropdown()'> <span class='caret'></span></button>" +
                            "<ul class='dropdown-menu' aria-labelledby='dropdownMenu'>" +
                                "<li><a data-ng-click='selectAll()'><span class='glyphicon glyphicon-ok green' aria-hidden='true'></span> Check All</a></li>" +
                                "<li><a data-ng-click='deselectAll();'> <span class='glyphicon glyphicon-remove red' aria-hidden='true'></span> Uncheck All</a></li>" +
                                "<li class='divider'></li>" +
                                "<li data-ng-repeat='option in options'><a data-ng-click='toggleSelectItem(option)'><span data-ng-class='getClassName(option)'  aria-hidden='true'></span> {{option.name}}</a></li>" +
                            "</ul>" +
                        "</div>",

                controller: function ($scope) {
                    $scope.openDropdown = function () {
                        $scope.open = !$scope.open;
                    };

                    $scope.selectAll = function () {
                        $scope.model = [];
                        angular.forEach($scope.options, function (item, index) {
                            $scope.model.push(item.id);
                        });
                    };

                    $scope.deselectAll = function () {
                        $scope.model = [];
                    };

                    $scope.toggleSelectItem = function (option) {
                        var intIndex = -1;
                        angular.forEach($scope.model, function (item, index) {
                            if (item == option.id) {
                                intIndex = index;
                            }
                        });

                        if (intIndex >= 0) {
                            $scope.model.splice(intIndex, 1);
                        }
                        else {
                            $scope.model.push(option.id);
                        }
                    };

                    $scope.getClassName = function (option) {
                        var varClassName = 'glyphicon glyphicon-remove red';
                        angular.forEach($scope.model, function (item, index) {
                            if (item == option.id) {
                                varClassName = 'glyphicon glyphicon-ok green';
                            }
                        });
                        return (varClassName);
                    };
                }
            }
        });

})();