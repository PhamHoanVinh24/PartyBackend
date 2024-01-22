var ctxfolder = "/views/admin/reportStaticsPoSup";
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
            $http.post('/Admin/ReportStaticsPoSup/GetListContract/').then(callback);
        },
        getListProduct: function (callback) {
            $http.post('/Admin/ReportStaticsPoCus/GetListProduct/').then(callback);
        },
        getListSupplier: function (callback) {
            $http.post('/Admin/ReportStaticsPoSup/GetListSupplier/').then(callback);
        },
        getTotalPoSup: function (data, callback) {
            $http.post('/Admin/ReportStaticsPoSup/GetTotalPoSup/', data).then(callback);
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

    $translateProvider.useUrlLoader('/Admin/ReportStaticsPoSup/Translation');
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
        SupCode: '',
        PoSupCode: '',
        ProductCode:''
    }

    $scope.listTypes = [{
        Code: "SALE",
        Name: "Bán"
    }, {
        Code: "BUY",
        Name: "Mua"
    }];

    $scope.costTotal = 0;
    $scope.quantityTotal = 0;
    $scope.total = 0;

    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/ReportStaticsPoSup/Jtable",
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
                d.Name = $scope.model.Name;
                d.FromTo = $scope.model.FromTo;
                d.DateTo = $scope.model.DateTo;
                d.Group = $scope.model.Group;
                d.Type = $scope.model.Type;
                d.PoSupCode = $scope.model.PoSupCode;
                d.CusCode = $scope.model.CusCode;
                d.SupCode = $scope.model.SupCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
                dataservice.getTotalPoSup($scope.model, function (result) {result=result.data;
                    $scope.costTotal = result.costTotal;
                    $scope.quantityTotal = result.quantityTotal;
                    $scope.total = result.total;
                });
                $scope.$apply();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [0, 'asc'])
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('PoName').withTitle('{{"RSPS_LIST_COL_PURCHASE_ORDER_SUPPLIER" | translate}}').withOption('sClass', '').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SupName').withTitle('{{"RSPS_LIST_COL_SUPPLIER" | translate}}').withOption('sClass', '').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductCode').withTitle('{{"RSPS_LIST_COL_CODE" | translate}}').withOption('sClass', 'dataTable-10per').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductName').withTitle('{{"RSPS_LIST_COL_PRODUCTNAME" | translate}}').withOption('sClass', '').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductType').withTitle('{{"RSPS_LIST_COL_PRODUCT_TYPE" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type) {
        if (data == "SUB_PRODUCT")
            return '<span class="bold">Nguyên liệu vật tư</span>';
        if (data == "FINISHED_PRODUCT")
            return '<span class="bold">Thành phẩm</span>';
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Type').withTitle('{{"Loại" | translate}}').renderWith(function (data, type) {
    //    if (data == "SALE_EXP" || data == "SALE_NOT_EXP")
    //        return '<span class="text-info bold">Bán</span>';
    //    if (data == "BUY_IMP" || data == "BUY_NOT_IMP")
    //        return '<span class="text-success bold">Mua</span>';
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withTitle('{{"RSPS_LIST_COL_QUANTITY" | translate}}').renderWith(function (data, type, full) {
        return "<span class='text-primary'>" + data + " " + full.UnitName + "</span>";
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('QuantityNeedImpExp').withTitle('{{"Số lượng cần nhập/xuất" | translate}}').renderWith(function (data, type, full) {
    //    return data != "" && data != 0 ? "<span class='text-primary'>" + data + " " + full.UnitName + "</span>" : "Đã nhập/xuất đủ";
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Cost').withTitle('{{"RSPS_LIST_COL_PRICE" | translate}}').renderWith(function (data, type) {
        return data != "" ? "<span class='text-danger'>" + $filter('currency')(data, '', 0) + "</span>" : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Cost').withTitle('{{"RSPS_LIST_COL_TOTAL_PRICE" | translate}}').renderWith(function (data, type, full) {
        return data != "" ? "<span class='text-danger'>" + $filter('currency')(data * full.Quantity, '', 0) + "</span>" : null;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('HeaderName').withTitle('{{"Phiếu nhập/xuất" | translate}}').withOption('sClass', '').renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('CusName').withTitle('{{"Khách hàng" | translate}}').withOption('sClass', '').renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTimeSale').withTitle('{{"Ngày bán hàng" | translate}}').withOption('sClass', '').renderWith(function (data, type) {
    //    return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    //}));

    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"RSPS_LIST_COL_CREATED_TIME" | translate}}').withOption('sClass', '').renderWith(function (data, type) {
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
            $scope.poSups = result;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.poSups.unshift(all)
        });
        dataservice.getListSupplier(function (result) {result=result.data;
            $scope.suppliers = result;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.suppliers.unshift(all)
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

        if (SelectType == "PoSupCode" && ($scope.model.PoSupCode != undefined && $scope.model.PoSupCode != "" && $scope.model.PoSupCode != null)) {
            $scope.reload();
        }

        if (SelectType == "SupCode" && ($scope.model.SupCode != undefined && $scope.model.SupCode != "" && $scope.model.SupCode != null)) {
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
    setTimeout(function () {
        loadDate();
    }, 50);
});
