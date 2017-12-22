/*Review Constants
    Description: This module will contain all Constants required for Review.
    Input:
    Output:

    Last Updated: 1/10/2017 -  Initial creation
*/
(function() {
    'use strict';


    angular
        .module('ARB.ReviewConstants')
        .constant('REVIEW_STAGE', reviewStages());
   
    function reviewStages() {

       
        // Stage Enum
        // Has to be sync with Review Stage Table
        var stages = {
            NEW: 1,
            SUBMITTED: 2,
            REWORK: 3,
            AWAITING_PACKAGE:4,
            PACKAGE_SUBMITTED:5,
            PACKAGE_APPROVED:6,
            REVIEW_INITIATED:7,
            REVIEW_COMPLETED: 8,
            CANCELLED:9,
            FINAL: 10
        }


        return stages;

    }
})();