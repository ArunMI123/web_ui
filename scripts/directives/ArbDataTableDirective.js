/*RequestControler
    Description: This module Declares ARB Header directive
    Input:
    Output:

    Last Updated: 11/8/2016 -  Initial creation
*/

(function () {
    'use strict';

    angular
        .module('ARB.Directives')
        .directive('arbDataTable', arbDataTable);
    function arbDataTable($window) {


        var directive = {
            link: link,
            restrict: 'EA',
            scope: {
                arbDataTable: '='
            }

        };
        return directive;

        function link(scope, element, attrs) {
           var dt;

            scope.$watchCollection(function () { return (scope.arbDataTable.data) }, function (data) {

if (dt != undefined && data.length > 0) {
                    dt.fnClearTable();
                    dt.fnAddData(scope.arbDataTable.data);
                    dt.fnDraw();
                    dt.addClass('table.dataTable tbody th, table.dataTable tbody td')
                    dt.addClass('tablefont');
}
else if (dt != undefined &&  data.length < 1) {
   dt.fnClearTable();
}
                else {
                    dt = $(element).dataTable(scope.arbDataTable);
}
                

                dt.addClass('tablefont');
                $(element).on('page.dt', function () {
                    element.find('tr').removeClass('selected');
                  
                    window.setTimeout(function () {

                        if (scope.arbDataTable.rowClickHandler != undefined) {

                            element.find('tr').on('click', function () {
                                element.find('tr').removeClass('selected');
                                $(this).addClass('selected');
                                scope.arbDataTable.rowClickHandler(dt.fnGetData(this));
                            });
                        }
                    }, 100);

                });
                if (scope.arbDataTable.rowClickHandler != undefined) {

                    element.find('tr').on('click', function () {
                        element.find('tr').removeClass('selected');
                        $(this).addClass('selected');

                        scope.arbDataTable.rowClickHandler(dt.fnGetData(this));
                    });

                }

            });

        }
    }

})();