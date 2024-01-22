var ctxfolder = "/views/admin/reportStaticsPoSupPayment";
var ctxfolderMessage = "/views/message-box";
var ctxfolderFileShare = "/views/admin/fileObjectShare";
var ctxfolderCard = "/views/admin/cardJob";
var ctxfolderCommonSetting = "/views/admin/commonSetting";

var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber', 'ng.jsoneditor']);
app.factory("interceptors", [function () {
    return {
        // if beforeSend is defined call it
        'request': function (request) {
            if (request.beforeSend)
                request.beforeSend();

            return request;
        },
        // if complete is defined call it
        'response': function (response) {
            if (response.config.complete)
                response.config.complete(response);
            return response;
        }
    };
}]);
app.factory('httpResponseInterceptor', ['$q', '$rootScope', '$location', function ($q, $rootScope, $location) {
    return {
        responseError: function (rejection) {
            if (rejection.status === 400) {
                App.toastrError(rejection.data);
            }
            return $q.reject(rejection);
        }
    };
}]);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    var submitFormUpload = function (url, data, callback) {
        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            beforeSend: function () {
                App.blockUI({
                    target: "#modal-body",
                    boxed: true,
                    message: 'loading...'
                });
            },
            complete: function () {
                App.unblockUI("#modal-body");
            },
            data: data
        }
        $http(req).then(callback);
    };
    return {
        getDataType: function (callback) {
            $http.get('/Admin/CommonSetting/GetDataType').then(callback);
        },
        //common
        getListCommon: function (callback) {
            $http.post('/Admin/contractPo/GetListCommon').then(callback);
        },
        getListContract: function (callback) {
            $http.post('/Admin/ReportStaticsPoSup/GetListContract/').then(callback);
        },
        getCustomers: function (callback) {
            $http.post('/Admin/contractPo/GetCustomers/').then(callback);
        },
        getSuppliers: function (callback) {
            $http.post('/Admin/contractPo/GetSuppliers/').then(callback);
        },
        getCurrency: function (callback) {
            $http.post('/Admin/contractPo/GetCurrency').then(callback);
        },
        getStatusPOSup: function (callback) {
            $http.post('/Admin/ContractPo/getStatusPOSup/').then(callback);
        },
        getTotal: function (data, callback) {
            $http.post('/Admin/ReportStaticsPoSupPayment/GetTotal/', data).then(callback);
        },
    };
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $cookies, $translate, dataservice, $filter) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        $rootScope.IsTranslate = true;
        caption = caption[culture];
        $rootScope.partternNumber = /^[0-9]\d*(\\d+)?$/; //Chỉ cho nhập số khong the am
    });
    dataservice.getSuppliers(function (rs) {rs=rs.data;
        $rootScope.suppliers = rs;
    })
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/ReportStaticsPoSupPayment/Translation');
    caption = $translateProvider.translations();

    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
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
    $httpProvider.interceptors.push('interceptors');
    $httpProvider.interceptors.push('httpResponseInterceptor');
});
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $window, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        Key: '',
        FromDate: '',
        ToDate: '',
        SupCode: '',
        PoSupCode: '',
        Status: '',
        BudgetF: '',
        BudgetT: '',
        Signer: '',
        Currency: ''
    }

    $scope.TotalAmount = 0;
    $scope.TotalPayment = 0;
    $scope.TotalNotPayment = 0;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/ReportStaticsPoSupPayment/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
                d.PoSupCode = $scope.model.PoSupCode;
                d.SupCode = $scope.model.SupCode;
                d.Status = $scope.model.Status;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
                dataservice.getTotal($scope.model, function (rs) {rs=rs.data;
                    $scope.TotalAmount = rs.TotalAmount;
                    $scope.TotalPayment = rs.TotalPayment;
                    $scope.TotalNotPayment = rs.TotalNotPayment;
                });
                $scope.$apply();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [0, 'desc'])
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
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().withOption('sClass', 'hidden').renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PoSupCode').withTitle('{{"RSPSORP_LIST_COL_PO_SUB_CODE" | translate}}').withOption('sClass', ' dataTable-pr0 w170').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Type').withTitle('{{"RSPSORP_LIST_COL_TYPE" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type) {
        if (data == "STORAGE") {
            return "Lưu kho";
        } else {
            return "Đơn hàng theo khách hàng";
        }
    }));

    //vm.dtColumns.push(DTColumnBuilder.newColumn('OrderBy').withTitle('{{"CP_LIST_COL_ORDER_BY" | translate}}').withOption('sClass', 'tleft dataTable-pr0  w150').renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Consigner').withTitle('{{"CP_LIST_COL_CONSIGNER" | translate}}').withOption('sClass', 'tleft dataTable-pr0 w60').renderWith(function (data, type) {
    //    return data;
    //}));

    vm.dtColumns.push(DTColumnBuilder.newColumn('SupName').withTitle('{{"RSPSORP_LIST_COL_SUP_NAME" | translate}}').withOption('sClass', '').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TotalAmount').withTitle('{{"RSPSORP_LIST_COL_TOTAL_AMOUNT" | translate}}').withOption('sClass', '').renderWith(function (data, type) {
        return data != "" ? "<span class='text-danger bold'>" + $filter('currency')(data, '', 0) + "<span/>" : "<span class='text-danger bold'>0<span/>";
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TotalPayment').withTitle('{{"RSPSORP_LIST_COL_TOTAL_PAYMENT" | translate}}').withOption('sClass', '').renderWith(function (data, type, full) {
        return data != "" ? "<span class='text-primary bold'>" + $filter('currency')(data, '', 0) + "<span/>" : "<span class='text-primary bold'>0<span/>";
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('').withTitle('{{"RSPSORP_LIST_COL_TOTAL_NOT_PAYMENT" | translate}}').withOption('sClass', '').renderWith(function (data, type, full) {
        return data != "" ? "<span class='text-danger bold'>" + $filter('currency')(full.TotalAmount - full.TotalPayment, '', 0) + "<span/>" : "<span class='text-danger bold'>0<span/>";
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"RSPSORP_LIST_COL_CREATED_TIME" | translate}}').withOption('sClass', 'tcenter dataTable-pr0 w70').renderWith(function (data, type, full) {
        return data != null ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    };
    function callback(json) {

    };
    function toggleAll(selectAll, selectedItems) {
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                selectedItems[id] = selectAll;
            }
        }
    };
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
    };

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
    };
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $rootScope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.search = function () {
        reloadData(true);
    };

    $scope.initData = function () {
        dataservice.getListContract(function (result) {result=result.data;
            $scope.poSups = result;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.poSups.unshift(all)
        });
    }

    $scope.changleSelect = function (SelectType, item) {
        if (SelectType == "PoSupCode" && ($scope.model.PoSupCode != undefined && $scope.model.PoSupCode != "" && $scope.model.PoSupCode != null)) {
            $scope.reload();
        }

        if (SelectType == "SupCode" && ($scope.model.SupCode != undefined && $scope.model.SupCode != "" && $scope.model.SupCode != null)) {
            $scope.reload();
        }
    }

    $scope.initData();
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    function loadDate() {
        $("#datefrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateto').datepicker('setStartDate', maxDate);
        });
        $("#dateto").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#datefrom').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            $('#datefrom').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#dateto').datepicker('setStartDate', null);
        });

    }
    setTimeout(function () {
        loadDate();
        //showHideSearch();
    }, 50);
});
