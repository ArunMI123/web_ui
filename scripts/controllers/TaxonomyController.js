(function () {
    'use strict';

    var app = angular
        .module('ARB.TaxonomyModule', [])

    app.controller('TaxonomyController', taxonomyController);

    taxonomyController.$inject = ['$location', 'RequestService', 'UtilService', 'AlertService', 'ToolbarService', '$rootScope', 'TaxonomyService', '$scope', '$filter','$routeParams', 'toaster'];

    function taxonomyController($location, RequestService, UtilService, AlertService, ToolbarService, $rootScope, TaxonomyService, $scope, $filter, $routeParams, toaster) {

		var paramType = $routeParams.type ;

		var domain = {
			DomainID:"",
			DomainName:"",
			DomainType:"Tooling"
		}

		var category = {
			CategoryID:"",
			Name:"",
			ParentCategoryID:null,
			CategoryLevel:"1"
		}

		var subCategory = {
			CategoryID:"",
			Name:"",
			ParentCategoryID:null,
			CategoryLevel:null
		}

		var softwareAndTools = {
			SoftwareAndToolsID:"",
			Name:"",
			Version:null,
			LifeCycleID:null,
			TechStackID:null
		}

		var domainList = [];
        var taxonomyList = [];
		var taxonomyFilterList = [];
        var RegionList = [];
        var categoryList = [];
        var subCategoryList = [];
		var softwareAndToolsList = [];
        var categoryFilterList = [];
        var subCategoryFilterList = [];
		var technologyStacksList = [];
		var lifeCycleList = [];

        var taxonomyOptions = {};
		var grdTaxonomyDomain = {};
		var grdTaxonomyCategory = {};
		var grdTaxonomySubCategory = {};
		var grdTaxonomySoftwareAndTools = {};

		

        var selectedTaxonomy = {};
        var vm = this;
        $rootScope.viewToolbar = false;
        Init()

        
        $.fn.dataTableExt.sErrMode="throw"
        taxonomyOptions = {
            "data": taxonomyList,
            "language": {
                "zeroRecords": "No records to display"
            },
            "columns": [{
                "width": "15%",
                "title": "Domain",
                "data": "Domain"
            }, {
                "width": "25%",
                "title": "Category",
                "data": "Category"
            }, {
                "width": "25%",
                "title": "SubCategory",
                "data": "SubCategory"
            }, {
                "width": "35%",
                "title": "SoftwareTools",
                "data": "SoftwareTools"
            }],
            searching: false,
            pageLength: 10,
            lengthMenu: false,
            bLengthChange: false,
        }


		

        function Init() {
		
			TaxonomyService.GetDomains(function (data) {
                domainList.splice(0, domainList.length);
                Array.prototype.push.apply(domainList, data);

            })

            TaxonomyService.GetCategories(function (data) {
                categoryList.splice(0, categoryList.length);
                Array.prototype.push.apply(categoryList, data);
                categoryFilterList = categoryList;
            
            })

            TaxonomyService.GetSubCategories(function (data) {
                subCategoryList.splice(0, subCategoryList.length);
                Array.prototype.push.apply(subCategoryList, data);
                subCategoryFilterList.splice(0, subCategoryFilterList.length);
                Array.prototype.push.apply(subCategoryFilterList, data);
            })

			TaxonomyService.GetSoftwareAndTools(function (data) {
                softwareAndToolsList.splice(0, softwareAndToolsList.length);
                Array.prototype.push.apply(softwareAndToolsList, data);
            })

			TaxonomyService.GetTechnologyStacks(function (data) {
                technologyStacksList.splice(0, technologyStacksList.length);
                Array.prototype.push.apply(technologyStacksList, data);
				console.log("technologyStacksList");
				console.log(technologyStacksList);
            })

			TaxonomyService.GetLifeCycles(function (data) {
                lifeCycleList.splice(0, lifeCycleList.length);
                Array.prototype.push.apply(lifeCycleList, data);
				console.log("lifeCycleList");
				console.log(lifeCycleList);
            })

            TaxonomyService.GetRegion(function (data) {
                RegionList.splice(0, taxonomyList.length);
                Array.prototype.push.apply(RegionList, data);
               
            })

            TaxonomyService.GetTaxonomyData(function (data) {
                taxonomyList.splice(0, taxonomyList.length);
                Array.prototype.push.apply(taxonomyList, data);
                taxonomyFilterList.splice(0, taxonomyFilterList.length);
                Array.prototype.push.apply(taxonomyFilterList, data);
            })
        }

		function changeCategory()
		{
			debugger;
			    if (vm.SelectedTaxonomy.CategoryID == null) {
                    delete vm.SelectedTaxonomy.CategoryID;
                    delete vm.SelectedTaxonomy.SubCategoryID;
                    subCategoryList.splice(0, subCategoryList.length);
                    Array.prototype.push.apply(subCategoryList,subCategoryFilterList);
                } else {
                    var filter = {
                        ParentCategoryID: vm.SelectedTaxonomy.CategoryID
                    }
                    var subCategoryFilter = $filter('filter')(subCategoryFilterList, filter, true);
                    subCategoryList.splice(0, subCategoryList.length);
                    Array.prototype.push.apply(subCategoryList, subCategoryFilter);
                }
				
				var taxonomyfilter = [];
				var filter = {
						DomainID:vm.SelectedTaxonomy.DomainID,
                        CategoryID: vm.SelectedTaxonomy.CategoryID
                }

				taxonomyfilter = $filter('filter')(taxonomyFilterList, filter, true);
				if (taxonomyfilter.length > 0) {
					taxonomyList.splice(0, taxonomyList.length);
					Array.prototype.push.apply(taxonomyList, taxonomyfilter);
				} else {
					AlertService.ShowAlert({
						message: "No data found!",
						type: "danger"

					});
					taxonomyList.splice(0, taxonomyList.length);
					Array.prototype.push.apply(taxonomyList, taxonomyfilter);
				}
		}


		function changeSubCategory()
		{
				var filter = {};

				if (vm.SelectedTaxonomy.DomainID != null) {
					filter.DomainID = vm.SelectedTaxonomy.DomainID
				}
				if (vm.SelectedTaxonomy.CategoryID != null) {
					filter.CategoryID = vm.SelectedTaxonomy.CategoryID
				}
				if (vm.SelectedTaxonomy.SubCategoryID != null) {
					filter.SubCategoryID = vm.SelectedTaxonomy.SubCategoryID
				}
				
				var taxonomyfilter = [];

				taxonomyfilter = $filter('filter')(taxonomyFilterList, filter, true);
				if (taxonomyfilter.length > 0) {
					taxonomyList.splice(0, taxonomyList.length);
					Array.prototype.push.apply(taxonomyList, taxonomyfilter);
				} else {
					AlertService.ShowAlert({
						message: "No data found!",
						type: "danger"

					});
					taxonomyList.splice(0, taxonomyList.length);
					Array.prototype.push.apply(taxonomyList, taxonomyfilter);
				}
		}

        function filterTaxonomy() {
           
            if (angular.isDefined(vm.SelectedTaxonomy.Domain)) {
                if (vm.SelectedTaxonomy.Domain == null) {
                    delete vm.SelectedTaxonomy.Domain;
                } else {
                    
                    //var categoryfilter = $filter('filter')(categoryFilterList, vm.SelectedTaxonomy, true);
                    //console.log(categoryfilter);
                    //categoryList.splice(0, categoryList.length);
                    //Array.prototype.push.apply(categoryList, categoryfilter);
                }
            }
            if (angular.isDefined(vm.SelectedTaxonomy.CategoryID)) {
                if (vm.SelectedTaxonomy.CategoryID == null) {
                    delete vm.SelectedTaxonomy.CategoryID;
                    delete vm.SelectedTaxonomy.SubCategoryID;
                    subCategoryList.splice(0, subCategoryList.length);
                    Array.prototype.push.apply(subCategoryList,subCategoryFilterList);
                } else {
                    var filter = {
                        ParentCategoryID: vm.SelectedTaxonomy.CategoryID
                    }
                    var subCategoryFilter = $filter('filter')(subCategoryFilterList, filter, true);
                    subCategoryList.splice(0, subCategoryList.length);
                    Array.prototype.push.apply(subCategoryList, subCategoryFilter);
                }
            }
            if (angular.isDefined(vm.SelectedTaxonomy.SubCategoryID)) {
                if (vm.SelectedTaxonomy.SubCategoryID == null) {
                    delete vm.SelectedTaxonomy.SubCategoryID;
                }
            }
            if (angular.isDefined(vm.SelectedTaxonomy.Region_TaxonomyToolsMapping)) {
                if (vm.SelectedTaxonomy.Region_TaxonomyToolsMapping.RegionID == null) {
                    delete vm.SelectedTaxonomy.Region_TaxonomyToolsMapping;
                }
            }
            var taxonomyfilter = [];
            taxonomyfilter = $filter('filter')(filterList, vm.SelectedTaxonomy, true);
            if (taxonomyfilter.length > 0) {
                taxonomyList.splice(0, taxonomyList.length);
                Array.prototype.push.apply(taxonomyList, taxonomyfilter);
            } else {
                AlertService.ShowAlert({
                    message: "No data found!",
                    type: "danger"

                });
                taxonomyList.splice(0, taxonomyList.length);
                Array.prototype.push.apply(taxonomyList, taxonomyfilter);
            }
        }


		// Domain Section Starts

		grdTaxonomyDomain = {
            "data": domainList,
            "language": {
                "zeroRecords": "No records to display"
            },
            "columns": [{
                "width": "50%",
                "title": "Domain",
                "data": "DomainName"
            }],
            searching: false,
            pageLength: 10,
            lengthMenu: false,
            bLengthChange: false,
			rowClickHandler: grdDomainRowSelectHandler
        }

		function grdDomainRowSelectHandler(row) {
			
    		domain.DomainName = row.DomainName;
			domain.DomainID	  =	row.DomainID;
			domain.DomainType = "Tooling";
			$scope.$apply();
		}

		function saveDomain()
		{
			 if(vm.masterForm.$valid)
			 {
				var isDomainExists = false;
				if(domain.DomainID != "" & domain.DomainID != null & domain.DomainID != "0" & domain.DomainID != 'undefined')
				{
					domainList.find(function(element){
					if(element.DomainName == domain.DomainName && element.DomainID != domain.DomainID ) 
						isDomainExists = true;
					})
				}
				else
				{
					domainList.find(function(element){
					if(element.DomainName == domain.DomainName) 
						isDomainExists = true;
					})
				}

				if(isDomainExists == true)
				{
						toaster.pop('warning', "Warning", "Domain name already exists...!");
				}
				else
				{
					TaxonomyService.SaveDomain(domain, function (data) {
					   domain.DomainName = "";
					   domain.DomainID="";
					   TaxonomyService.GetDomains(function (data) {
						domainList.splice(0, domainList.length);
						Array.prototype.push.apply(domainList, data);

					})

						toaster.pop('success', "Success", "Domain Saved...!");
					})
				}
			}
		}

		function resetDomain()
		{
			 domain.DomainName="";
			 domain.DomainID="";
			 $scope.$apply;
			 toaster.pop('note', "Info", "Changes Discarded...!");
		}

		// Domain Section Ends



		// Category Section Starts
		grdTaxonomyCategory = {
            "data": categoryList,
            "language": {
                "zeroRecords": "No records to display"
            },
            "columns": [{
                "width": "50%",
                "title": "Category",
                "data": "Name"
            }],
            searching: false,
            pageLength: 10,
            lengthMenu: false,
            bLengthChange: false,
			rowClickHandler: grdCategoryRowSelectHandler
        }

		function grdCategoryRowSelectHandler(row) {
    		category.Name = row.Name;
			category.CategoryID= row.CategoryID;
			category.ParentCategoryID = null;
			category.CategoryLevel = row.CategoryLevel;
			$scope.$apply();
		}

		function saveCategory()
		{

			if(vm.masterForm.$valid)
			 {
				var isCategoryExists = false;
				if(category.CategoryID != "" & category.CategoryID != null & category.CategoryID != "0" & category.CategoryID != 'undefined')
				{
					categoryList.find(function(element)
						{
						if(element.Name == category.Name && element.CategoryID != category.CategoryID ) 
							isCategoryExists = true;
						}
					)
				}
				else
				{
					categoryList.find(function(element){
					if(element.Name == category.Name) 
						isCategoryExists = true;
					})
				}

				if(isCategoryExists == true)
				{
						toaster.pop('warning', "Warning", "Category name already exists...!");
				}
				else
				{
					TaxonomyService.SaveCategory(category, function (data) {
					    category.Name = "";
						category.CategoryID = "";

					    TaxonomyService.GetCategories(function (data) {
						categoryList.splice(0, categoryList.length);
						Array.prototype.push.apply(categoryList, data);

					})
						toaster.pop('success', "Success", "Category Saved...!");
					})
				}
			}
		}

		function resetCategory()
		{
			category.Name="";
			category.CategoryID="";
			toaster.pop('note', "Info", "Changes Discarded...!");
		}

		// Category Section Ends


		// SubCategory Section Starts
		grdTaxonomySubCategory = {
            "data": subCategoryList,
            "language": {
                "zeroRecords": "No records to display"
            },
            "columns": [
			{
                "width": "50%",
                "title": "Category",
                "data": "Category2.Name"
            },
			{
                "width": "50%",
                "title": "Sub-Category",
                "data": "Name"
            }
			
			],
            searching: false,
            pageLength: 10,
            lengthMenu: false,
            bLengthChange: false,
			rowClickHandler: grdSubCategoryRowSelectHandler
        }

		function grdSubCategoryRowSelectHandler(row) {
    		subCategory.Name = row.Name;
			subCategory.CategoryID= row.CategoryID;
			subCategory.ParentCategoryID = row.ParentCategoryID;
			subCategory.CategoryLevel = row.CategoryLevel ;
			$scope.$apply();
		}

		function saveSubCategory()
		{
			if(vm.masterForm.$valid)
			 {
				var isSubCategoryExists = false;
				if(subCategory.CategoryID != "" & subCategory.CategoryID != null & subCategory.CategoryID != "0" & subCategory.CategoryID != 'undefined')
				{
					subCategoryList.find(function(element)
						{
						if(element.Name == subCategory.Name && element.CategoryID != subCategory.CategoryID ) 
							isSubCategoryExists = true;
						}
					)
				}
				else
				{
					subCategoryList.find(function(element){
					if(element.Name == subCategory.Name && element.ParentCategoryID == subCategory.ParentCategoryID ) 
						isSubCategoryExists = true;
					})
				}

				if(isSubCategoryExists == true)
				{
						toaster.pop('warning', "Warning", "Sub-Category name already exists for this Category...!");
				}
				else
				{
					TaxonomyService.SaveCategory(subCategory, function (data) {
						subCategory.Name="";
						subCategory.CategoryID="";
						subCategory.ParentCategoryID="";
						subCategory.CategoryLevel="";

					    TaxonomyService.GetSubCategories(function (data) {
						subCategoryList.splice(0, subCategoryList.length);
						Array.prototype.push.apply(subCategoryList, data);

					})
						toaster.pop('success', "Success", "Sub-Category Saved...!");
					})
				}
			}
		}

		function resetSubCategory()
		{
			subCategory.Name="";
			subCategory.CategoryID="";
			subCategory.ParentCategoryID="";
			subCategory.CategoryLevel="";

			toaster.pop('note', "Info", "Changes Discarded...!");
		}


		

		// Software And Tools Section Starts

		grdTaxonomySoftwareAndTools = {
            "data": softwareAndToolsList,
            "language": {
                "zeroRecords": "No records to display"
            },
            "columns": [
			{
                "width": "50%",
                "title": "Softwares And Tools",
                "data": "Name"
            },
			{
                "width": "10%",
                "title": "Version",
                "data": "Version"
            },
			{
                "width": "25%",
                "title": "Technology Stack",
                "data" : function (data) {
                    if (data.TechnologyStack == null) {
                        return "";
                    }
                    else {
                        return data.TechnologyStack.Name;
                    }
                }
            },
			{
                "width": "15%",
                "title": "Life Cycle",
                "data": function (data) {
                    if (data.LifeCycle == null) {
                        return "";
                    }
                    else {
                        return data.LifeCycle.LifeCycleStage;
                    }
                }
            }
			
			
			],

            searching: false,
            pageLength: 10,
            lengthMenu: false,
            bLengthChange: false,
			rowClickHandler: grdSoftwareAndToolsRowSelectHandler
        }

		function grdSoftwareAndToolsRowSelectHandler(row) {
			softwareAndTools.SoftwareAndToolsID = row.SoftwareAndToolsID;
    		softwareAndTools.Name = row.Name;
			softwareAndTools.Version = row.Version;
			softwareAndTools.LifeCycleID = row.LifeCycleID;
			softwareAndTools.TechStackID = row.TechStackID ;
			$scope.$apply();
		}

		function saveSoftwareAndTools()
		{
			debugger;
			if(vm.masterForm.$valid)
			 {
				var isSoftwareAndToolExists = false;
				if(softwareAndTools.SoftwareAndToolsID != "" & softwareAndTools.SoftwareAndToolsID != null & softwareAndTools.SoftwareAndToolsID != "0" & softwareAndTools.SoftwareAndToolsID != 'undefined')
				{
					softwareAndToolsList.find(function(element)
						{
						if(element.Name == softwareAndTools.Name && element.SoftwareAndToolsID != softwareAndTools.SoftwareAndToolsID ) 
							isSoftwareAndToolExists = true;
						}
					)
				}
				else
				{
					softwareAndToolsList.find(function(element){
					if(element.Name == softwareAndTools.Name ) 
						isSoftwareAndToolExists = true;
					})
				}

				if(isSoftwareAndToolExists == true)
				{
						toaster.pop('warning', "Warning", "SoftwareAndTools name already exists...!");
				}
				else
				{
					TaxonomyService.SaveSoftwareAndTool(softwareAndTools, function (data) {
						softwareAndTools.SoftwareAndToolsID = "";
    					softwareAndTools.Name = "";
						softwareAndTools.Version = "";
						softwareAndTools.LifeCycleID = "";
						softwareAndTools.TechStackID = "";

					   TaxonomyService.GetSoftwareAndTools(function (data) {
							softwareAndToolsList.splice(0, softwareAndToolsList.length);
							Array.prototype.push.apply(softwareAndToolsList, data);
						})

						toaster.pop('success', "Success", "SoftwareAndTools Saved...!");
					})
				}
			}
		}

		function resetSoftwareAndTools()
		{
			softwareAndTools.SoftwareAndToolsID = "";
    		softwareAndTools.Name = "";
			softwareAndTools.Version = "";
			softwareAndTools.LifeCycleID = "";
			softwareAndTools.TechStackID = "";
			

			toaster.pop('note', "Info", "Changes Discarded...!");
		}

		// Software And Tools Section ends here

        angular.extend(vm, {
            TaxonomyOptions: taxonomyOptions,
            TaxonomyList: taxonomyList,
            FilterTaxonomy: filterTaxonomy,
            SelectedTaxonomy: selectedTaxonomy,
            TaxonomyFilterList: taxonomyFilterList,
            RegionList: RegionList,
            CategoryList: categoryList,
            SubCategoryList: subCategoryList,
			SoftwareAndToolsList:softwareAndToolsList,
			TechnologyStacksList:technologyStacksList,
			LifeCycleList:lifeCycleList,
			
			
			ParamType:paramType	,

			DomainList:domainList,
			GrdTaxonomyDomain:grdTaxonomyDomain,
			SaveDomain:saveDomain,
			Domain:domain,
			ResetDomain:resetDomain,

			Category:category,
			GrdTaxonomyCategory:grdTaxonomyCategory,
			SaveCategory:saveCategory,
			ResetCategory:resetCategory,			

			SubCategory:subCategory,
			GrdTaxonomySubCategory:grdTaxonomySubCategory,
			SaveSubCategory:saveSubCategory,
			ResetSubCategory:resetSubCategory,	

			SoftwareAndTools:softwareAndTools,
			SaveSoftwareAndTools:saveSoftwareAndTools,
			GrdTaxonomySoftwareAndTools:grdTaxonomySoftwareAndTools,
			ResetSoftwareAndTools:resetSoftwareAndTools,

			ChangeCategory:changeCategory,
			ChangeSubCategory:changeSubCategory
        });

        return vm;

    }
})()