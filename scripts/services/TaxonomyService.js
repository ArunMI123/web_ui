(function () {
    'use strict';

    angular
        .module('ARB.Services')
        .factory('TaxonomyService', factory);

    factory.$inject = ['$http','$timeout','$filter','UserService'];

    function factory($http, $timeout, $filter, UserService) {
        var service = {
			GetDomains:getDomains,
            GetTaxonomyData: getTaxonomyData,
            GetRegion: getRegion,
            GetCategories:getCategories,
            GetSubCategories:getSubCategories,
			GetSoftwareAndTools:getSoftwareAndTools,
			GetTechnologyStacks:getTechnologyStacks,
			GetLifeCycles:getLifeCycles,
			SaveDomain:saveDomain,
			SaveCategory:saveCategory,
			SaveSoftwareAndTool:saveSoftwareAndTool,
        }

		
		function getDomains(successCallback, errorCallback) {
             return $http.get('./api/Taxonomy/GetDomains').then(function (data) {
                  return successCallback(data.data)
			}, errorCallback);
        }

        function getCategories(successCallback, errorCallback) {
             return $http.get('./api/Taxonomy/GetCategories').then(function (data) {
                  return successCallback(data.data)
			}, errorCallback);
        }

        function getSubCategories(successCallback, errorCallback) {
             return $http.get('./api/Taxonomy/GetSubCategories').then(function (data) {
                 return successCallback(data.data)
			}, errorCallback);
        }
    
		function getSoftwareAndTools(successCallback, errorCallback) {
             return $http.get('./api/Taxonomy/GetSoftwareAndTools').then(function (data) {
                 return successCallback(data.data)
			}, errorCallback);
        }
	
		function getTechnologyStacks(successCallback, errorCallback) {
             return $http.get('./api/Taxonomy/GetTechnologyStacks').then(function (data) {
                 return successCallback(data.data)
			}, errorCallback);
        }

		function getLifeCycles(successCallback, errorCallback) {
             return $http.get('./api/Taxonomy/GetLifeCycles').then(function (data) {
                 return successCallback(data.data)
			}, errorCallback);
        }


        function getRegion(successCallback, errorCallback) {
            return $http.get('./api/Taxonomy/GetRegions').then(function (data) {
                return successCallback(data.data)
            }, errorCallback);
        }
    
        function getTaxonomyData(successCallback, errorCallback) {
            return $http.get('./api/Taxonomy/GetSoftwareTableData').then(function (data) {
                  return successCallback(data.data)
            }, errorCallback);
        }


		function saveDomain(data,successCallback, errorCallback) {
             return $http.post('./api/Taxonomy/SaveDomain', data).then(function (data) {
                  return successCallback(data.data)
			 }, errorCallback);
        }

		function saveCategory(data,successCallback, errorCallback) {
             return $http.post('./api/Taxonomy/SaveCategory', data).then(function (data) {
                  return successCallback(data.data)
			 }, errorCallback);
        }

		function saveSoftwareAndTool(data,successCallback, errorCallback) {
             return $http.post('./api/Taxonomy/SaveSoftwareAndTool', data).then(function (data) {
                  return successCallback(data.data)
			 }, errorCallback);
        }

        return service;
    }
})();