var ctxfolder = "/views/admin/reportStaticsStockCard";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber', 'ng.jsoneditor']);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        getListContract: function (callback) {
            $http.post('/Admin/ReportStaticsStockCard/GetListContract/').then(callback);
        },
        getListCustommer: function (callback) {
            $http.post('/Admin/ReportStaticsStockCard/GetListCustommer/').then(callback);
        },
        getListSupplier: function (callback) {
            $http.post('/Admin/ReportStaticsStockCard/GetListSupplier/').then(callback);
        },
        getListProduct: function (callback) {
            $http.post('/Admin/ReportStaticsPoCus/GetListProduct/').then(callback);
        },
        getListStore: function (callback) {
            $http.post('/Admin/ReportStaticsStockCard/GetListStore/').then(callback);
        },
        //New Mapping
        getListWareHouse: function (callback) {
            $http.get('/Admin/EDMSDiagramWarehouse/GetListMappingType?type=AREA').then(callback);
        },
        getListMapping: function (data, callback) {
            $http.get('/Admin/EDMSDiagramWarehouse/GetListMappingFilter?start=' + data).then(callback);
        },
        getTotal: function (data, callback) {
            $http.post('/Admin/ReportStaticsStockCard/GetTotal/', data).then(callback);
        },
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, $cookies, $translate, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
    });
    $rootScope.ExpCode = '';
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {

    $translateProvider.useUrlLoader('/Admin/ReportStaticsStockCard/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/edit/:id', {
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit'
        })
        .when('/add/', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
        }).when('/function/', {
            templateUrl: ctxfolder + '/function.html',
            controller: 'function'
        }).when('/tree', {
            templateUrl: ctxfolder + '/indexTree.html',
            controller: 'indexTree'
        });

    $validatorProvider.setDefaults({
        errorElement: 'span',
        errorClass: 'help-block',
        errorPlacement: function (error, element) {
            if (element.parent('.input-group').length) {
                error.insertAfter(element.parent());
            } else if (element.prop('type') === 'radio' && element.parent('.radio-inline').length) {
                error.insertAfter(element.parent().parent());
            } else if (element.prop('type') === 'checkbox' || element.prop('type') === 'radio') {
                error.appendTo(element.parent().parent());
            } else {
                error.insertAfter(element);
            }
        },
        highlight: function (element) {
            $(element).closest('.form-group').addClass('has-error');
        },
        unhighlight: function (element) {
            $(element).closest('.form-group').removeClass('has-error');
        },
        success: function (label) {
            label.closest('.form-group').removeClass('has-error');
        }
    });
});

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, $filter) {
    $scope.model = {
        ContractCode: '',
        StoreCode: '',
        ProductCode:''
    }

    $scope.TotalQuantity = 0;
    $scope.TotalQuantityByStore = 0;
    $scope.TotalQuantityInStore = 0;
    $scope.TotalCost = 0;
    $scope.TotalAmount = 0;

    $scope.listTypes = [{
        Code: "SALE",
        Name: "Xuất"
    }, {
        Code: "BUY",
        Name: "Nhập"
    }];

    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/ReportStaticsStockCard/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProductCode = $scope.model.ProductCode;
                d.ProductType = $scope.model.ProductType;
                //d.Name = $scope.model.Name;
                d.FromTo = $scope.model.FromTo;
                d.DateTo = $scope.model.DateTo;
                d.Group = $scope.model.Group;
                d.Type = $scope.model.Type;
                d.ContractCode = $scope.model.ContractCode;
                d.CusCode = $scope.model.CusCode;
                d.SupCode = $scope.model.SupCode;
                d.StoreCode = $scope.model.StoreCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableViewportManual(220, "#tblData");
                //dataservice.getTotal($scope.model, function (result) {result=result.data;
                //    $scope.TotalQuantity = result.TotalQuantity;
                //    $scope.TotalQuantityByStore = result.TotalQuantityByStore;
                //    $scope.TotalQuantityInStore = result.TotalQuantityInStore;
                //});
                $scope.$apply();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [9, 'desc'])
        .withOption('serverSide', true)
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiled) {
                $scope.headerCompiled = true;
                $compile(angular.element(header).contents())($scope);
            }
        })
        .withOption('initComplete', function (settings, json) {
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm.dtColumns = [];
    var ad = 0;
    //vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
    //    .renderWith(function (data, type, full, meta) {
    //        $scope.selected[full.Id] = false;
    //        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    //    }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductCode').withTitle('{{"RSSC_LIST_COL__PRODUCT_CODE" | translate}}').withOption('sClass', 'dataTable-10per').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductName').withTitle('{{"RSSC_LIST_COL_PRODUCT_NAME" | translate}}').withOption('sClass', '').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductType').withTitle('{{"RSSC_LIST_COL_PRODUCT_TYPE" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type) {
        if (data == "SUB_PRODUCT")
            return '<span class="bold">Nguyên liệu vật tư</span>';
        if (data == "FINISHED_PRODUCT")
            return '<span class="bold">Thành phẩm</span>';
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('HeaderName').withTitle('{{"RSSC_LIST_COL_HEADER_NAME" | translate}}').withOption('sClass', '').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('StoreName').withTitle('{{"RSSC_LIST_COL_STORE" | translate}}').withOption('sClass', 'dataTable-10per').renderWith(function (data, type) {
        return data;
    }));
    
    vm.dtColumns.push(DTColumnBuilder.newColumn('Type').withTitle('{{"RSSC_LIST_COL_TYPE" | translate}}').renderWith(function (data, type) {
        if (data == "SALE_EXP" || data == "SALE_NOT_EXP")
            return '<span class="text-info bold">Xuất</span>';
        if (data == "BUY_IMP" || data == "BUY_NOT_IMP")
            return '<span class="text-success bold">Nhập</span>';
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withTitle('{{"RSSC_LIST_COL_QUANTITY" | translate}}').renderWith(function (data, type, full) {
        return "<span class='text-primary'>" + data + " " + full.UnitName + "</span>";
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('TotalQuantityByStore').withTitle('{{"RSSC_COL_TOTAL_QUANTITY_BY_STORE" | translate}}').renderWith(function (data, type, full) {
        return data != "" && data != 0 ? "<span class='text-primary'>" + data + "</span>" : 0;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('TotalQuantityInStore').withTitle('{{"RSSC_COL_TOTAL_QUANTITY_IN_STORE" | translate}}').renderWith(function (data, type, full) {
        return data != "" && data != 0 ? "<span class='text-primary'>" + data + "</span>" : 0;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"RSSC_COL_CREATED_TIME" | translate}}').withOption('sClass', '').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));

    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }
    function toggleAll(selectAll, selectedItems) {
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                selectedItems[id] = selectAll;
            }
        }
    }
    function toggleOne(selectedItems) {
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                if (!selectedItems[id]) {
                    vm.selectAll = false;
                    return;
                }
            }
        }
        vm.selectAll = true;
    }

    // view help detail
    $scope.viewCmsDetail = function (helpId) {
        //item, bookMark
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderDashBoard + '/viewItem.html',
            controller: 'viewItemHelp',
            backdrop: 'static',
            windowClass: 'message-avoid-header',
            size: '65',
            resolve: {
                para: function () {
                    return {
                        helpId
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    };



    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.search = function () {
        reloadData(true);
    }
    $scope.initData = function () {
        dataservice.getListContract(function (result) {result=result.data;
            $scope.contracts = result;
        });
        dataservice.getListCustommer(function (result) {result=result.data;
            $scope.customers = result;
        });
        dataservice.getListSupplier(function (result) {result=result.data;
            $scope.suppliers = result;
        });

        dataservice.getListStore(function (result) {result=result.data;
            $scope.stores = result;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.stores.unshift(all)
        });

        dataservice.getListProduct(function (result) {result=result.data;
            if (result.Error) {
                App.toastrError(result.Title);
            } else {
                $scope.ListProduct = result;
                var all = {
                    Code: '',
                    Name: 'Tất cả'
                }
                $scope.ListProduct.unshift(all)
            }
        });
    }

    $scope.initData();

    $scope.changleSelect = function (SelectType, item) {
        if (SelectType == "ProductCode" && ($scope.model.ProductCode != undefined && $scope.model.ProductCode != "" && $scope.model.ProductCode != null)) {
            $scope.model.ProductType = item.ProductType;
            $scope.reload();
        }

        if (SelectType == "StoreCode" && ($scope.model.StoreCode != undefined && $scope.model.StoreCode != "" && $scope.model.StoreCode != null)) {
            $scope.reload();
        }

        if (SelectType == "ContractCode" && ($scope.model.ContractCode != undefined && $scope.model.ContractCode != "" && $scope.model.ContractCode != null)) {
            $scope.reload();
        }

        if (SelectType == "CusCode" && ($scope.model.CusCode != undefined && $scope.model.CusCode != "" && $scope.model.CusCode != null)) {
            $scope.reload();
        }

        if (SelectType == "SupCode" && ($scope.model.SupCode != undefined && $scope.model.SupCode != "" && $scope.model.SupCode != null)) {
            $scope.reload();
        }

        if (SelectType == "Type" && ($scope.model.Type != undefined && $scope.model.Type != "" && $scope.model.Type != null)) {
            $scope.reload();
        }
    }

    $scope.removeSelect = function (SelectType) {
        if (SelectType == "ProductCode") {
            $scope.model.ProductCode = "";
            $scope.model.ProductType = "";
        }
    }

    function loadDate() {
        $("#FromTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#DateTo').datepicker('setStartDate', maxDate);
        });
        $("#DateTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromTo').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            if ($scope.model.FromDate != undefined && $scope.model.FromDate != '' && $scope.model.FromDate != null) {
                var from = $scope.model.FromDate.split("/");
                var date = new Date(from[2], from[1] - 1, from[0])
                $('#DateTo').datepicker('setStartDate', date);
            }
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            if ($scope.model.ToDate != undefined && $scope.model.ToDate != '' && $scope.model.ToDate != null) {
                var from = $scope.model.ToDate.split("/");
                var date = new Date(from[2], from[1] - 1, from[0])
                $('#FromTo').datepicker('setEndDate', $scope.model.ToDate);
            }
            $('#DateTo').datepicker('setStartDate', null);
        });
    }

    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }

    $scope.viewTree = function () {
        location.href = '/Admin/ReportStaticsStockCard#!/tree';
    }

    setTimeout(function () {
        loadDate();
    }, 50);
});

app.controller('indexTree', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, $filter) {
    $rootScope.isAllData = 'True';
    $scope.model = {
        ContractCode: '',
        StoreCode: '',
        ProductCode:''
    }

    $scope.TotalQuantity = 0;
    $scope.TotalQuantityByStore = 0;
    $scope.TotalQuantityInStore = 0;
    $scope.TotalCost = 0;
    $scope.TotalAmount = 0;

    $scope.listTypes = [{
        Code: "SALE",
        Name: "Xuất"
    }, {
        Code: "BUY",
        Name: "Nhập"
    }];

    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/ReportStaticsStockCard/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProductCode = $scope.model.ProductCode;
                d.ProductType = $scope.model.ProductType;
                //d.Name = $scope.model.Name;
                d.FromTo = $scope.model.FromTo;
                d.DateTo = $scope.model.DateTo;
                d.Group = $scope.model.Group;
                d.Type = $scope.model.Type;
                d.ContractCode = $scope.model.ContractCode;
                d.CusCode = $scope.model.CusCode;
                d.SupCode = $scope.model.SupCode;
                d.StoreCode = $scope.model.StoreCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableViewportManual(220, "#tblData");
                //dataservice.getTotal($scope.model, function (result) {result=result.data;
                //    $scope.TotalQuantity = result.TotalQuantity;
                //    $scope.TotalQuantityByStore = result.TotalQuantityByStore;
                //    $scope.TotalQuantityInStore = result.TotalQuantityInStore;
                //});
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [9, 'desc'])
        .withOption('serverSide', true)
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiled) {
                $scope.headerCompiled = true;
                $compile(angular.element(header).contents())($scope);
            }
        })
        .withOption('initComplete', function (settings, json) {
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm.dtColumns = [];
    var ad = 0;
    //vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
    //    .renderWith(function (data, type, full, meta) {
    //        $scope.selected[full.Id] = false;
    //        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    //    }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductCode').withTitle('{{"RSSC_LIST_COL__PRODUCT_CODE" | translate}}').withOption('sClass', 'dataTable-10per').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductName').withTitle('{{"RSSC_LIST_COL_PRODUCT_NAME" | translate}}').withOption('sClass', '').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductType').withTitle('{{"RSSC_LIST_COL_PRODUCT_TYPE" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type) {
        if (data == "SUB_PRODUCT")
            return '<span class="bold">Nguyên liệu vật tư</span>';
        if (data == "FINISHED_PRODUCT")
            return '<span class="bold">Thành phẩm</span>';
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('HeaderName').withTitle('{{"RSSC_LIST_COL_HEADER_NAME" | translate}}').withOption('sClass', '').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('StoreName').withTitle('{{"RSSC_LIST_COL_STORE" | translate}}').withOption('sClass', 'dataTable-10per').renderWith(function (data, type) {
        return data;
    }));
    
    vm.dtColumns.push(DTColumnBuilder.newColumn('Type').withTitle('{{"RSSC_LIST_COL_TYPE" | translate}}').renderWith(function (data, type) {
        if (data == "SALE_EXP" || data == "SALE_NOT_EXP")
            return '<span class="text-info bold">Xuất</span>';
        if (data == "BUY_IMP" || data == "BUY_NOT_IMP")
            return '<span class="text-success bold">Nhập</span>';
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withTitle('{{"RSSC_LIST_COL_QUANTITY" | translate}}').renderWith(function (data, type, full) {
        return "<span class='text-primary'>" + data + " " + full.UnitName + "</span>";
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('TotalQuantityByStore').withTitle('{{"RSSC_COL_TOTAL_QUANTITY_BY_STORE" | translate}}').renderWith(function (data, type, full) {
        return data != "" && data != 0 ? "<span class='text-primary'>" + data + "</span>" : 0;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('TotalQuantityInStore').withTitle('{{"RSSC_COL_TOTAL_QUANTITY_IN_STORE" | translate}}').renderWith(function (data, type, full) {
        return data != "" && data != 0 ? "<span class='text-primary'>" + data + "</span>" : 0;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"RSSC_COL_CREATED_TIME" | translate}}').withOption('sClass', '').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));

    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }
    function toggleAll(selectAll, selectedItems) {
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                selectedItems[id] = selectAll;
            }
        }
    }
    function toggleOne(selectedItems) {
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                if (!selectedItems[id]) {
                    vm.selectAll = false;
                    return;
                }
            }
        }
        vm.selectAll = true;
    }

    // view help detail
    $scope.viewCmsDetail = function (helpId) {
        //item, bookMark
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderDashBoard + '/viewItem.html',
            controller: 'viewItemHelp',
            backdrop: 'static',
            windowClass: 'message-avoid-header',
            size: '65',
            resolve: {
                para: function () {
                    return {
                        helpId
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    };

    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.search = function () {
        reloadData(true);
    }
    $scope.initData = function () {
        dataservice.getListContract(function (result) {result=result.data;
            $scope.contracts = result;
        });
        dataservice.getListCustommer(function (result) {result=result.data;
            $scope.customers = result;
        });
        dataservice.getListSupplier(function (result) {result=result.data;
            $scope.suppliers = result;
        });

        dataservice.getListStore(function (result) {result=result.data;
            $scope.stores = result;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.stores.unshift(all)
        });

        dataservice.getListProduct(function (result) {result=result.data;
            if (result.Error) {
                App.toastrError(result.Title);
            } else {
                $scope.ListProduct = result;
                var all = {
                    Code: '',
                    Name: 'Tất cả'
                }
                $scope.ListProduct.unshift(all)
            }
        });
    }

    $scope.initData();

    $scope.changleSelect = function (SelectType, item) {
        if (SelectType == "ProductCode" && ($scope.model.ProductCode != undefined && $scope.model.ProductCode != "" && $scope.model.ProductCode != null)) {
            $scope.model.ProductType = item.ProductType;
            $scope.reload();
        }

        if (SelectType == "StoreCode" && ($scope.model.StoreCode != undefined && $scope.model.StoreCode != "" && $scope.model.StoreCode != null)) {
            $scope.reload();
        }

        if (SelectType == "ContractCode" && ($scope.model.ContractCode != undefined && $scope.model.ContractCode != "" && $scope.model.ContractCode != null)) {
            $scope.reload();
        }

        if (SelectType == "CusCode" && ($scope.model.CusCode != undefined && $scope.model.CusCode != "" && $scope.model.CusCode != null)) {
            $scope.reload();
        }

        if (SelectType == "SupCode" && ($scope.model.SupCode != undefined && $scope.model.SupCode != "" && $scope.model.SupCode != null)) {
            $scope.reload();
        }

        if (SelectType == "Type" && ($scope.model.Type != undefined && $scope.model.Type != "" && $scope.model.Type != null)) {
            $scope.reload();
        }
    }

    $scope.removeSelect = function (SelectType) {
        if (SelectType == "ProductCode") {
            $scope.model.ProductCode = "";
            $scope.model.ProductType = "";
        }
    }

    function loadDate() {
        $("#FromTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#DateTo').datepicker('setStartDate', maxDate);
        });
        $("#DateTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromTo').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            if ($scope.model.FromDate != undefined && $scope.model.FromDate != '' && $scope.model.FromDate != null) {
                var from = $scope.model.FromDate.split("/");
                var date = new Date(from[2], from[1] - 1, from[0])
                $('#DateTo').datepicker('setStartDate', date);
            }
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            if ($scope.model.ToDate != undefined && $scope.model.ToDate != '' && $scope.model.ToDate != null) {
                var from = $scope.model.ToDate.split("/");
                var date = new Date(from[2], from[1] - 1, from[0])
                $('#FromTo').datepicker('setEndDate', $scope.model.ToDate);
            }
            $('#DateTo').datepicker('setStartDate', null);
        });
    }

    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }

    // Mảng treeData ban đầu
    $scope.initialTreeData = [
        {
            id: 'root',
            parent: "#",
            text: "RSSC_TREE_ALL_TYPE",
            state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
        },
        {
            id: '1',
            parent: "root",
            text: "RSSC_TREE_UPDATE_DATA",
            state: { selected: false, opened: true }
        },
        {
            id: '2',
            parent: "root",
            text: "RSSC_TREE_IMPORT_GOODS_REPORT",
            state: { selected: false, opened: true }
        },
        {
            id: '3',
            parent: "root",
            text: "RSSC_TREE_REPORT_ON_EXPORT",
            state: { selected: false, opened: true }
        },
        {
            id: '4',
            parent: "root",
            text: "RSSC_TREE_INVENTORY_REPORT",
            state: { selected: false, opened: true }
        },
        {
            id: '5',
            parent: "root",
            text: "RSSC_TREE_DICTIONARY_CATEGORY",
            state: { selected: false, opened: true }
        },
        {
            id: '6',
            parent: "root",
            text: "RSSC_TREE_PRINT_DICTIONARY_CATEGORIES",
            state: { selected: false, opened: true }
        },
        {
            id: '2.1',
            parent: "2",
            text: "RSSC_TREE_LIST_IMPORT_VOUCHERS",
            state: { selected: false, opened: true }
        },
        {
            id: '2.2',
            parent: "2",
            text: "RSSC_TREE_LIST_ENTERPRISES",
            state: { selected: false, opened: true }
        },
        {
            id: '2.3',
            parent: "2",
            text: "RSSC_TREE_STATISTICS_VOUCHERS",
            state: { selected: false, opened: true }
        },
        {
            id: '2.4',
            parent: "2",
            text: "RSSC_TREE_LIST_GROUP_VOUCHER_ACCORDING",
            state: { selected: false, opened: true }
        },
        {
            id: '2.5',
            parent: "2",
            text: "RSSC_TREE_LIST_GROUP_FORM_IMPORT",
            state: { selected: false, opened: true }
        },
        {
            id: '2.6',
            parent: "2",
            text: "RSSC_TREE_STATISTICS_VOUCHERS_ITEMS",
            state: { selected: false, opened: true }
        },
        {
            id: '2.7',
            parent: "2",
            text: "RSSC_TREE_APPLICATION_WAREHOUSING",
            state: { selected: false, opened: true }
        },
        {
            id: '2.8',
            parent: "2",
            text: "RSSC_TREE_REPORT_VALUES_CUSTOMER",
            state: { selected: false, opened: true }
        },
        {
            id: '2.9',
            parent: "2",
            text: "RSSC_TREE_REPORT_IMPORTED",
            state: { selected: false, opened: true }
        },
        {
            id: '2.10',
            parent: "2",
            text: "RSSC_TREE_DETAILED_BOOK_ACCOUNT",
            state: { selected: false, opened: true }
        },
        {
            id: '2.11',
            parent: "2",
            text: "RSSC_TREE_T_ACCOUNT",
            state: { selected: false, opened: true }
        },
        {
            id: '3.1',
            parent: "3",
            text: "RSSC_TREE_TABLE_EXPORT_SLIP",
            state: { selected: false, opened: true }
        },
        {
            id: '3.2',
            parent: "3",
            text: "RSSC_TREE_LIST_EXPORT_VOUCHERS",
            state: { selected: false, opened: true }
        },
        {
            id: '3.3',
            parent: "3",
            text: "RSSC_TREE_STATISTICS_GROUP_ACCORDING",
            state: { selected: false, opened: true }
        },
        {
            id: '3.4',
            parent: "3",
            text: "RSSC_TREE_TABLE_EXPORT_VOUCHERS",
            state: { selected: false, opened: true }
        },
        {
            id: '3.5',
            parent: "3",
            text: "RSSC_TREE_STATISTIC_EXPORT",
            state: { selected: false, opened: true }
        },
        {
            id: '3.6',
            parent: "3",
            text: "RSSC_TREE_LIST_GROUPS",
            state: { selected: false, opened: true }
        },
        {
            id: '3.7',
            parent: "3",
            text: "RSSC_TREE_APPEARANCE_WAREHOUSING",
            state: { selected: false, opened: true }
        },
        {
            id: '3.8',
            parent: "3",
            text: "RSSC_TREE_REPORT_EXPORT_VALUE",
            state: { selected: false, opened: true }
        },
        {
            id: '3.9',
            parent: "3",
            text: "RSSC_TREE_REPORT_GROUP_ACCORDING",
            state: { selected: false, opened: true }
        },
        {
            id: '3.10',
            parent: "3",
            text: "RSSC_TREE_DETAILED_BOOK_ACCOUNT",
            state: { selected: false, opened: true }
        },
        {
            id: '3.11',
            parent: "3",
            text: "RSSC_TREE_T_ACCOUNT",
            state: { selected: false, opened: true }
        },
        {
            id: '4.1',
            parent: "4",
            text: "RSSC_TREE_WAREHOUSE_CARD",
            state: { selected: false, opened: true }
        },
        {
            id: '4.2',
            parent: "4",
            text: "RSSC_TREE_DETAILED_BOOKS",
            state: { selected: false, opened: true }
        },
        {
            id: '4.3',
            parent: "4",
            text: "RSSC_TREE_DETAILED_TABLE_MATERIALS",
            state: { selected: false, opened: true }
        },
        {
            id: '4.4',
            parent: "4",
            text: "RSSC_TREE_SUMMARY_IMPORT_EXPORT",
            state: { selected: false, opened: true }
        },
        {
            id: '4.5',
            parent: "4",
            text: "RSSC_TREE_INVENTORY_REPORT",
            state: { selected: false, opened: true }
        },
        {
            id: '4.6',
            parent: "4",
            text: "RSSC_TREE_REPORT_INVENTORY",
            state: { selected: false, opened: true }
        },
        {
            id: '4.7',
            parent: "4",
            text: "RSSC_TREE_SUMMARY_IMPORT_EXPORT_SERIAL",
            state: { selected: false, opened: true }
        },
        {
            id: '4.8',
            parent: "4",
            text: "RSSC_TREE_INTENTORY_REPORT_PERIOD",
            state: { selected: false, opened: true }
        },
        {
            id: '4.9',
            parent: "4",
            text: "RSSC_TREE_REPORT_INVENTORY_PN",
            state: { selected: false, opened: true }
        },
        {
            id: '4.10',
            parent: "4",
            text: "RSSC_TREE_INTENTORY_REPORT_MINIMUM",
            state: { selected: false, opened: true }
        },
        {
            id: '4.11',
            parent: "4",
            text: "RSSC_TREE_INTENTORY_REPORT_MAXIMUM",
            state: { selected: false, opened: true }
        },
        {
            id: '4.12',
            parent: "4",
            text: "RSSC_TREE_SUMMARY_IMPORT_EXPORT_BORROWED",
            state: { selected: false, opened: true }
        },
        {
            id: '4.13',
            parent: "4",
            text: "RSSC_TREE_MONTHLY_AVERAGE",
            state: { selected: false, opened: true }
        },
        {
            id: '4.14',
            parent: "4",
            text: "RSSC_TREE_DETAILED_BOOK_ACCOUNT",
            state: { selected: false, opened: true }
        },
        {
            id: '4.15',
            parent: "4",
            text: "COM_BTN_SEARCH",
            state: { selected: false, opened: true }
        },
    ];
    
    // Dịch các chuỗi ngôn ngữ trong mảng
    angular.forEach($scope.initialTreeData, function (node) {
        if (node.text && node.text !== 'root') {
            node.text = $translate.instant(node.text);
        }
    });

    // Gán mảng đã được dịch cho $scope
    $scope.treeData = $scope.initialTreeData;

    function customMenu(node) {
        var items = {};

        items = {
                'item1': {
                    'label': caption.COM_BTN_EDIT,
                    'icon': "fa fa-edit",
                    'action': function (data) {
                        var modalInstance = $uibModal.open({
                            animation: true,
                            templateUrl: ctxfolderGroup + '/edit.html',
                            controller: 'editGroup',
                            backdrop: 'static',
                            size: '40',
                            resolve: {
                                para: function () {
                                    return node.original.catId;
                                }
                            }
                        });
                        modalInstance.result.then(function (d) {
                            $('#treeDiv').jstree(true).refresh();
                            setTimeout(function () {
                                $scope.readyCB();
                            }, 200);
                        }, function () {
                        });
                    }
                },
                'item2': {
                    'label': caption.COM_BTN_DELETE,
                    'icon': "fa fa-trash",
                    'action': function (data) {
                        var modalInstance = $uibModal.open({
                            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
                            windowClass: "message-center",
                            resolve: {
                                para: function () {
                                    return node.original.catId;
                                }
                            },
                            controller: function ($scope, $uibModalInstance, para) {
                                $scope.message = 'Bạn có muốn xóa nhóm sản phẩm';
                                $scope.ok = function () {
                                    dataserviceMaterial.deleteGroup(para, function (rs) {
                                        rs = rs.data;
                                        if (rs.Error) {
                                            App.toastrError(rs.Title);
                                        } else {
                                            App.toastrSuccess(rs.Title);
                                            $uibModalInstance.close();
                                        }
                                    });
                                };

                                $scope.cancel = function () {
                                    $uibModalInstance.dismiss('cancel');
                                };
                            },
                            size: '25',
                        });
                        modalInstance.result.then(function (d) {
                            $('#treeDiv').jstree(true).refresh();
                            setTimeout(function () {
                                $scope.readyCB();
                                $scope.reload();
                            }, 200);
                        }, function () {
                        });
                    }
                }
            };

        return items;
    }

    $scope.treeConfig = {
        core: {
            multiple: true,
            animation: true,
            error: function (error) {
                //$log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
            },
            check_callback: true,
            worker: true,

        },
        types: {
            default: {
                icon: 'fa fa-folder icon-state-warning'
            }
        },
        version: 1,
        plugins: ['checkbox', 'types', 'contextmenu'],
        checkbox: {
            "three_state": false,
            "whole_node": false,
            "keep_selected_style": false,
            "cascade": "undetermined",
        },
        contextmenu: {
            items: customMenu
        }
    };

    $scope.viewTable = function () {
        location.href = '/Admin/ReportStaticsStockCard';
    }

    $scope.treeEvents = {
        'ready': $scope.readyCB,
        'select_node': $scope.selectNodeRepository,
        'deselect_node': $scope.deselectNodeRepository,
    };

    setTimeout(function () {
        loadDate();
    }, 50);
});