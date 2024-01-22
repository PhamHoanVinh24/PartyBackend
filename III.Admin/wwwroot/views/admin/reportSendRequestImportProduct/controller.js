var ctxfolder = "/views/admin/reportSendRequestImportProduct";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber']);
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
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        updateExpectedDate: function (id, data, callback) {
            $http.get('/Admin/ReportSendRequestImportProduct/updateExpectedDate?id=' + id + '&&expectedDate=' + data).then(callback);
        },
        getListSupplier: function (callback) {
            $http.post('/Admin/SendRequestImportProduct/GetSuppliers/').then(callback);
        },
        getContract: function (callback) {
            $http.post('/Admin/Contract/GetContract/').then(callback);
        },
    };
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $cookies, $translate, dataservice, $filter) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    $rootScope.permissionReportSendRequestImportProduct = PERMISSION_ReportSendRequestImportProduct;
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        $rootScope.IsTranslate = true;
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        });
    });
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/ReportSendRequestImportProduct/Translation');
    caption = $translateProvider.translations();

    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
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
    $httpProvider.interceptors.push('interceptors');
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
        ContractCode: '',
        Status: '',
        BudgetF: '',
        BudgetT: '',
        Signer: '',
        Currency: '',
        SupCode: '',
        Title: '',
        ProductCode: '',
        ReqCode: '',
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-change="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: $rootScope.permissionReportSendRequestImportProduct.LIST,
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
                d.ReqCode = $scope.model.ReqCode;
                d.Title = $scope.model.Title;
                d.ProductCode = $scope.model.ProductCode;
                d.SupCode = $scope.model.SupCode;
                d.ContractCode = $scope.model.ContractCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
                var model = {};
                var listdata = $('#tblDataContract').DataTable().data();
                for (var i = 0; i < listdata.length; i++) {
                    var createdTime = $filter('date')(new Date(listdata[i].CreatedTime), 'dd/MM/yyyy');
                    loadDateJTable(createdTime, listdata[i].Id);
                }
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                    $scope.selected[data.Id] = !$scope.selected[data.Id];
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.Id] = false;
                    } else {
                        $('#tblDataContract').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.Id] = true;
                    }
                }

                vm.selectAll = false;
                $scope.$apply();
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().withOption('sClass').renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-change="toggleOne(selected)"/><span></span></label>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductCode').withTitle('{{"RSRIP_COL_PRODUCT_CODE"|translate}}').withOption('sClass', '').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductName').withTitle('{{"RSRIP_COL_PRODUCT_NAME"|translate}}').withOption('sClass', '').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ReqCode').withTitle('{{"RSRIP_COL_REQ_CODE"|translate}}').withOption('sClass', 'hidden').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SupName').withTitle('{{"RSRIP_COL_SUP_NAME"|translate}}').withOption('sClass', '').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ExpectedDate').withTitle('{{"RSRIP_COL_EXPECTED_DATE"|translate}}').withOption('sClass', '').renderWith(function (data, type, full) {
        var dataRs = data != null && data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : '';
        return '<div id="' + full.Id + '" class="input-group date dateTimePicker_' + full.Id + '"><input type="text" class="form-control input-date" value="' + dataRs + '"><span class="input-group-addon"><span class="fa fa-calendar"></span></span></div>'
        //return data != null && data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"RSRIP_COL_TITLE"|translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PoCount').withTitle('{{"RSRIP_COL_PO_COUNT"|translate}}').withOption('sClass', '').renderWith(function (data, type) {
        return data != "" ? $filter('currency')(data, '', 0) : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('RateConversion').withTitle('{{"RSRIP_COL_RATE_CONVERSION"|translate}}').withOption('sClass', '').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('RateLoss').withTitle('{{"RSRIP_COL_RATE_LOSS"|translate}}').withOption('sClass', '').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withTitle('{{"RSRIP_COL_QUANTITY"|translate}}').withOption('sClass', '').renderWith(function (data, type) {
        return data != "" ? $filter('currency')(data, '', 0) : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Unit').withTitle('{{"RSRIP_COL_UNIT"|translate}}').withOption('sClass', '').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"RSRIP_COL_CREATED_TIME"|translate}}').withOption('sClass', 'nowrap dataTable-20per').renderWith(function (data, type, full) {
        return data != null ? $filter('date')(new Date(data), 'dd/MM/yyyy HH:mm') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"RSRIP_COL_NOTE"|translate}}').withOption('sClass', '').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withTitle('{{"RSRIP_COL_ACTION"|translate}}').withOption('sClass', 'hidden nowrap dataTable-w80').renderWith(function (data, type, full, meta) {
        return '<button title="{{&quot; RSRIP_TITLE_EDIT &quot; | translate}}" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="{{&quot; RSRIP_TITLE_DEL &quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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

    function loadDate() {
        $("#datefrom").datetimepicker({
            //startDate: new Date(),
            useCurrent: true,
            autoclose: true,
            keepOpen: true,
            format: 'dd/mm/yyyy hh:ii',
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#datetotimepicker').datetimepicker('setStartDate', maxDate);
        });
        $("#datetotimepicker").datetimepicker({
            useCurrent: true,
            autoclose: true,
            keepOpen: false,
            format: 'dd/mm/yyyy hh:ii',
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#datefrom').datetimepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            $('#datefrom').datetimepicker('setEndDate', new Date('01/01/4000'));
        });
        $('.start-date').click(function () {
            $('#datetotimepicker').datetimepicker('setStartDate', '01/01/1900');
        });
    }
    function loadDateJTable(startDate, id) {
        $("#" + id).datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
            startDate: startDate
        }).on('changeDate', function (selected) {
            var id = parseInt(this.id);
            var maxDate = new Date(selected.date.valueOf());

            var date = $filter('date')(new Date(maxDate), 'dd/MM/yyyy');
            if (date != null) {
                dataservice.updateExpectedDate(id, date, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                    }
                });
            }

            //var smaxDate = $filter('date')(maxDate, 'MM/dd/yyyy');
            //if (screatedTime >= maxDate && createdTime != smaxDate) {
            //    var date = $filter('date')(new Date(createdTime), 'dd/MM/yyyy');
            //    App.toastrError("Ngày dự kiến hàng về phải lớn hơn hoặc bằng ngày " + date);
            //    $scope.reloadNoResetPage();
            //} else {
            //    var date = $filter('date')(new Date(maxDate), 'dd/MM/yyyy');
            //    if (date != null) {
            //        dataservice.updateExpectedDate(id, date, function (rs) {rs=rs.data;
            //            if (rs.Error) {
            //                App.toastrError(rs.Title);
            //            }
            //            else {
            //                App.toastrSuccess(rs.Title);
            //            }
            //        });
            //    }
            //}
        });
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
    };
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.init = function () {
        dataservice.getListSupplier(function (result) {
            result = result.data;
            $scope.suppliers = result;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.suppliers.unshift(all)
        });
        dataservice.getContract(function (rs) {
            rs = rs.data;
            $scope.ContractData = rs;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.ContractData.unshift(all)
        })
        //var date = new Date();
        //var priorDate = new Date().setDate(date.getDate() - 30)
        //$scope.model.ToDate = $filter('date')((date), 'dd/MM/yyyy HH:mm')
        //$scope.model.FromDate = $filter('date')((priorDate), 'dd/MM/yyyy HH:mm')
    }
    $scope.init();
    $scope.search = function () {
        reloadData(true);
    };

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
        //showHideSearch();
    }, 50);
    //Export Excel
    //$scope.export = function () {
    //    var orderBy = 'ProductCode ASC';
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
    //    var page = vm.dtInstance.DataTable.page() + 1;
    //    var length = vm.dtInstance.DataTable.page.len();
    //    location.href = "/Admin/ReportSendRequestImportProduct/ExportExcel?"
    //        + "page=" + page
    //        + "&row=" + length
    //        + "&fromDate=" + $scope.model.FromDate
    //        + "&toDate=" + $scope.model.ToDate
    //        + "&reqCode=" + $scope.model.ReqCode
    //        + "&supCode=" + $scope.model.SupCode
    //        + "&title=" + $scope.model.Title
    //        + "&productCode=" + $scope.model.ProductCode
    //        + "&orderBy=" + orderBy
    //}
    //$scope.exportToManufacurer = function () {
    //    var orderBy = 'ProductCode ASC';
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
    //    var page = vm.dtInstance.DataTable.page() + 1;
    //    var length = vm.dtInstance.DataTable.page.len();
    //    location.href = "/Admin/ReportSendRequestImportProduct/ExportExcelToManufacurer?"
    //        + "page=" + page
    //        + "&row=" + length
    //        + "&fromDate=" + $scope.model.FromDate
    //        + "&toDate=" + $scope.model.ToDate
    //        + "&reqCode=" + $scope.model.ReqCode
    //        + "&supCode=" + $scope.model.SupCode
    //        + "&title=" + $scope.model.Title
    //        + "&productCode=" + $scope.model.ProductCode
    //        + "&orderBy=" + orderBy
    //}

    //Export excel select row
    $scope.export = function () {
        var editItems = [];
        $scope.dataExport = "";
        for (var id in $scope.selected) {
            if ($scope.selected.hasOwnProperty(id)) {
                if ($scope.selected[id]) {
                    editItems.push(id);
                }
            }
        }
        if (editItems.length > 0) {
            for (var j = 0; j < editItems.length; j++) {
                $scope.dataExport += editItems[j] + ",";
            }
            location.href = "/Admin/ReportSendRequestImportProduct/ExportExcelSelectRow?"
                + "listId=" + $scope.dataExport
        }
        else
        {
            App.toastrError(caption.RSRIP_MSG_NO_ORDER_REQUESTS)
        }
    }

    $scope.exportToManufacurer = function () {
        var editItems = [];
        $scope.dataExport = "";
        for (var id in $scope.selected) {
            if ($scope.selected.hasOwnProperty(id)) {
                if ($scope.selected[id]) {
                    editItems.push(id);
                }
            }
        }
        if (editItems.length > 0) {
            for (var j = 0; j < editItems.length; j++) {
                $scope.dataExport += editItems[j] + ",";
            }
            location.href = "/Admin/ReportSendRequestImportProduct/ExportExcelSelectRowToManufacurer?"
                + "listId=" + $scope.dataExport
        }
        else {
            App.toastrError(caption.RSRIP_MSG_NO_ORDER_REQUESTS)
        }
    }
});
