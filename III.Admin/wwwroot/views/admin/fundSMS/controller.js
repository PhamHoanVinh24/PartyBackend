var ctxfolder = "/views/admin/fundSMS";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["App_ESEIM_DASHBOARD","ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber']);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        getListBank: function (callback) {
            $http.post('/Admin/FundSMS/GetListBank').then(callback);
        },
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $filter, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
            //max: 'Max some message {0}'
        });
    });



});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/FundSMS/Translation');
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
});
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, $filter, $window) {
    var vm = $scope;
    $scope.model = {

        AETType: '',
        CatCode: '',
        Bank: '',
        Status:''

    };
    $scope.listStatus = [
        { Code: '', Name: caption.FSMS_ALL },
        {
            Code: "Processed",
            Name: caption.FSMS_PROCESSED
        }, {
            Code: "NoProcess",
            Name: caption.FSMS_NOT_PROCESSED
        }];
    $scope.changeToTime = function () {
        $scope.model.ToTime = "";
        $('#FromTime').datepicker('setEndDate', null);
    };
    $scope.changeFromTime = function () {
        $scope.model.FromTime = "";
        $('#Totime').datepicker('setStartDate', null);
    };
    dataservice.getListBank(function (rs) {rs=rs.data;
        
        $scope.listBank = rs;
        var all = {
            Code: '',
            Name: caption.FSMS_ALL
        }
        $scope.listBank.unshift(all)
    });
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/FundSMS/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.STK = $scope.model.STK;
                d.Status = $scope.model.Status;
                d.FromTime = $scope.model.FromTime;
                d.ToTime = $scope.model.ToTime;
                d.Bank = $scope.model.Bank;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [6, 'desc'])
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));

   
    vm.dtColumns.push(DTColumnBuilder.newColumn('stk').withOption('sClass', 'dataTable-10per').withTitle('{{"FSMS_LIST_COL_ACCOUNT_NUMBER" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('raw').withOption('sClass', 'dataTable-30per').withTitle('{{"FSMS_LIST_COL_SMS_RAW" | translate}}').renderWith(function (data, type) {
        //return '<span class="text-danger">' + $filter('balance')(data, '', 0) + '</span>';
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('money').withOption().withTitle('{{"FSMS_LIST_COL_MONEY" | translate}}').renderWith(function (data, type) {
        //return '<span class="text-danger">' + $filter('balance')(data, '', 0) + '</span>';
       
        return '<span class="text-danger">'+ data +'</span>';

    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('balance').withOption().withTitle('{{"FSMS_LIST_COL_BALANCE" | translate}}').renderWith(function (data, type) {
        //return '<span class="text-danger">' + $filter('balance')(data, '', 0) + '</span>';
        return '<span class="text-danger">' + data + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('created').withOption().withTitle('{{"FSMS_LIST_COL_CREATED" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy HH:mm:ss') : null;
        //return data;

    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('status').withOption().withTitle('{{"FSMS_LIST_COL_STATUS" | translate}}').renderWith(function (data, type) {
        if (data == "NoProcess") {
            return '<span class="text-danger">{{"FSMS_NOT_PROCESSED"| translate}}</span>';
        }
        if (data == "Processed") {
            return '<span class="text-success">{{"FSMS_PROCESSED" | translate}}</span>';
        }
       
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('bank').withOption().withTitle('{{"FSMS_LIST_COL_BANK" | translate}}').renderWith(function (data, type) {
        return data;
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
    }
    $scope.search = function () {
        reloadData(true);
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
        //Yêu cầu từ ngày --> đến ngày
        $("#Fromtime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#Totime').datepicker('setStartDate', maxDate);
        });
        $("#Totime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#Fromtime').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            $('#Fromtime').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#Totime').datepicker('setStartDate', null);
        });
        

    });

});
