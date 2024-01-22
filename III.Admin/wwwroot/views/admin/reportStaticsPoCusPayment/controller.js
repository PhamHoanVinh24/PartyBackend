var ctxfolder = "/views/admin/reportStaticsPoCusPayment";
var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose"
    }


    var submitFormUpload = function (url, data, callback) {

        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            data: data
        }

        $http(req).then(callback);
    };
    return {
        getListContract: function (callback) {
            $http.post('/Admin/reportStaticsPoCusPayment/GetListContract/').then(callback);
        },
        getListCustomer: function (callback) {
            $http.post('/Admin/reportStaticsPoCusPayment/GetListCustomer/').then(callback);
        },
        getListProduct: function (callback) {
            $http.post('/Admin/reportStaticsPoCusPayment/GetListProduct/').then(callback);
        },
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, $confirm, DTColumnBuilder, DTInstances, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.dateNow = new Date();
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/reportStaticsPoCusPayment/Translation');
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
        })
    $validatorProvider.setDefaults({
        errorElement: 'span',
        errorClass: 'help-block',
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
app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $http, $filter) {
    var vm = $scope;
    $scope.model = {
        FromDate: '',
        ToDate: '',
        ContractCode: '',
        CusCode: '',
    };

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/reportStaticsPoCusPayment/Jtable",
            beforeSend: function (jqXHR, settings) {
                resetCheckbox();
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
                d.ContractCode = $scope.model.ContractCode;
                d.CusCode = $scope.model.CusCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [1, 'desc'])
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
        })
        .withOption('footerCallback', function (tfoot, data) {
            if (data.length > 0) {
                $scope.$apply(function () {
                    
                    //$scope.totalPaymentVnd = data[0].TotalPaymentVnd;
                    $scope.totalPaymentVnd = formatNumber(data[0].TotalPaymentVnd);
                    //$scope.totalRevenueAfterTaxVnd = data[0].TotalRevenueAfterTaxVnd;

                    $scope.totalRevenueAfterTaxVnd = formatNumber(data[0].TotalRevenueAfterTaxVnd);

                    //$scope.totalDebtVnd = data[0].TotalDebtVnd;
                    $scope.totalDebtVnd = formatNumber(data[0].TotalDebtVnd);
                });
            } else {
                $scope.$apply(function () {
                    $scope.totalPaymentVnd = 0;
                    $scope.totalRevenueAfterTaxVnd = 0;
                    $scope.totalDebtVnd = 0;
                });
            }
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withTitle('{{ "VCMM_LIST_COL_STT" | translate }}').notSortable().withOption('sWidth', '30px').withOption('sClass', 'tcenter').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('{{ "Id" | translate }}').notSortable().withOption('sClass', 'hidden').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ContractCode').withTitle('{{ "RSPCP_LIST_COL_CONTRACT_CODE" | translate }}').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ContractNo').withTitle('{{ "RSPCP_LIST_COL_CONTRACT_NO" | translate }}').notSortable().renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{ "RSPCP_LIST_COL_TITLE" | translate }}').notSortable().renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EffectiveDate').withTitle('{{ "RSPCP_LIST_COL_EFFECTIVE_DATE" | translate }}').notSortable().renderWith(function (data, type) {
        if (data != null && data != '')
            return $filter('date')(new Date(data), 'dd/MM/yyyy');
        else
            return '';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CusName').withTitle('{{ "RSPCP_LIST_COL_CUS_NAME" | translate }}').notSortable().renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('RevenueAfterTaxVnd').withTitle('{{ "RSPCP_LIST_COL_REVENUE_AFTER_TAX" | translate }}').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type) {
        var dataFormat = $filter('currency')(data, '', 0);
        return '<span class="text-success bold"> ' + dataFormat + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PaymentVnd').withTitle('{{ "RSPCP_LIST_COL_PAYMENT" | translate }}').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type) {
        var dataFormat = $filter('currency')(data, '', 0);
        return '<span class="text-success bold"> ' + dataFormat + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DebtVnd').withTitle('{{ "RSPCP_LIST_COL_DEBT" | translate }}').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type) {
        var dataFormat = $filter('currency')(data, '', 0);
        return '<span class="text-danger bold"> ' + dataFormat + '</span>';
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('BuyCost').withTitle('Giá nhập').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type) {
    //    var dataFormat = $filter('currency')(data, '', 0);
    //    return '<span class="bold"> ' + dataFormat + '</span>';
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('SaleCost').withTitle('Giá bán').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type) {
    //    var dataFormat = $filter('currency')(data, '', 0);
    //    return '<span class="bold"> ' + dataFormat + '</span>';
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('Thời gian').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type) {
    //    if (data != null && data != '')
    //        return $filter('date')(new Date(data), 'dd/MM/yyyy HH:mm');
    //    else
    //        return '';
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('pathimg').withTitle('Ảnh').notSortable().renderWith(function (data, type) {
    //    return data === "" ? "" : '<img class="img-circle" src="' + data + '" height="65" width="65">';
    //}).withOption('sWidth', '50px'));

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
    function resetCheckbox() {
        $scope.selected = [];
        vm.selectAll = false;
    }
    function formatNumber(n) {
        // format number 1000000 to 1,234,567
        return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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
    $rootScope.reload = function () {
        $scope.reload();
    }

    $rootScope.rootreload = function () {
        $scope.reload();
    }

    $scope.initLoad = function () {
        dataservice.getListContract(function (rs) {rs=rs.data;
            $scope.listContract = rs;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.listContract.unshift(all)
        });
        dataservice.getListCustomer(function (rs) {rs=rs.data;
            $scope.listCustomer = rs;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.listCustomer.unshift(all)
        });
    }
    $scope.initLoad();
    function loadDate() {
        $("#FromDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ToDate').datepicker('setStartDate', maxDate);
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#ToDate').datepicker('setStartDate', null);
            }
        });
        $("#ToDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromDate').datepicker('setEndDate', maxDate);
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#FromDate').datepicker('setEndDate', null);
            }
        });
        $('.end-date').click(function () {
            if ($scope.model.FromDate != undefined && $scope.model.FromDate != '' && $scope.model.FromDate != null) {
                var from = $scope.model.FromDate.split("/");
                var date = new Date(from[2], from[1] - 1, from[0])
                $('#ToDate').datepicker('setStartDate', date);
            }
            $('#FromDate').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            if ($scope.model.ToDate != undefined && $scope.model.ToDate != '' && $scope.model.ToDate != null) {
                var from = $scope.model.ToDate.split("/");
                var date = new Date(from[2], from[1] - 1, from[0])
                $('#FromDate').datepicker('setEndDate', $scope.model.ToDate);
            }
            $('#ToDate').datepicker('setStartDate', null);
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
    }, 200);

    //function showHideSearch() {
    //    $(".btnSearch").click(function () {
    //        $(".input-search").removeClass('hidden');
    //        $(".btnSearch").hide();
    //    });
    //    $(".close-input-search").click(function () {
    //        $(".input-search").addClass('hidden');
    //        $(".btnSearch").show();
    //    });
    //}

    ////Export Excel
    //$scope.export = function () {
    //    var orderBy = 'Id DESC';
    //    var exportType = 0;
    //    var orderArr = $scope.dtInstance.DataTable.order();
    //    var column;
    //    if (orderArr.length == 2) {
    //        column = $scope.dtInstance.DataTable.init().aoColumns[orderArr[0]];
    //        orderBy = column.mData + ' ' + orderArr[1];
    //    } else if (orderArr.length > 0) {
    //        var order = orderArr[0];
    //        column = $scope.dtInstance.DataTable.init().aoColumns[order[0]];
    //        orderBy = column.mData + ' ' + order[1];
    //    }
    //    //var pageInfo = $scope.dtInstance.DataTable.page.info();
    //    //var obj = {
    //    //    start: pageInfo.row,
    //    //    length: pageInfo.length,
    //    //    //QueryOrderBy: orderBy,
    //    //    ExportType: exportType,
    //    //    Month: $scope.model.CustomerMonth,
    //    //    Packcode: $scope.model.PackCode,
    //    //    Cif: $scope.model.CustomerCif
    //    //};

    //    var page = vm.dtInstance.DataTable.page() + 1;
    //    var length = vm.dtInstance.DataTable.page.len();
    //    location.href = "/Admin/reportStaticsPoCusPayment/ExportExcel?"
    //        + "page=" + page
    //        + "&row=" + length
    //        + "&customerName=" + $scope.model.CustomerName
    //        + "&areaExport=" + $scope.model.Area
    //        + "&productCode=" + $scope.model.ProductCode
    //        + "&brandCode=" + $scope.model.BrandCode
    //        + "&fromDate=" + $scope.model.FromDate
    //        + "&toDate=" + $scope.model.ToDate
    //        + "&dateSearch=" + $scope.model.DateSearch
    //        + "&orderBy=" + orderBy
    //}
});
