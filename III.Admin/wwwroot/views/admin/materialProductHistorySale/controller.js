var ctxfolder = "/views/admin/materialProductHistorySale";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber', 'ng.jsoneditor']);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        gettreedataLevel: function (callback) {
            $http.post('/Admin/materialProduct/GetProductUnit/').then(callback);
        },
        getproductgroup: function (callback) {
            $http.post('/Admin/materialProduct/GetProductGroup/').then(callback);
        },
        getProductTypes: function (callback) {
            $http.post('/Admin/materialProduct/GetProductTypes/').then(callback);
        },
        getListContract: function (callback) {
            $http.post('/Admin/MaterialProductHistorySale/GetListContract/').then(callback);
        },
        getListCustommer: function (callback) {
            $http.post('/Admin/MaterialProductHistorySale/GetListCustommer/').then(callback);
        },
        getListSupplier: function (callback) {
            $http.post('/Admin/MaterialProductHistorySale/GetListSupplier/').then(callback);
        },
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, $cookies, $translate, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.checkData = function (data) {
        var partternCode = /^[a-zA-Z0-9._äöüÄÖÜ]*$/g;
        //var partternName = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]+[^!@#$%^&*<>?]*$/; //Có chứa được khoảng trắng
        //var partternDescription = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]*[^Đđ!@#$%^&*<>?]*$/; //Có thể null, và có chứa được khoảng trắng
        //var partternUrl = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]*[^!@$%^&*<>?]*$/; //Có thể null, và có chứa được khoảng trắng & dấu #
        var mess = { Status: false, Title: "" }
        if (!partternCode.test(data.ExpCode)) {
            mess.Status = true;
            mess.Status = true;
            mess.Title = mess.Title.concat(" - ", caption.COM_VALIDATE_ITEM_CODE.replace('{0}', caption.ADM_RESOURCE_CURD_LBL_RESOURCE_CODE), "<br/>");
        }
        //if (!partternName.test(data.Title)) {
        //    mess.Status = true;
        //    mess.Title += " - " + caption.VALIDATE_ITEM_NAME.replace('{0}', caption.APP_NAME) + "<br/>";
        //}
        //if (!partternUrl.test(data.AppUrl)) {
        //    mess.Status = true;
        //    mess.Title += " - " + caption.VALIDATE_ITEM.replace('{0}', caption.URL_APP) + "<br/>";
        //}
        return mess;
    }
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        });


        //            required: true,
        //            maxlength: 255
        //        },
        //        ApplicationCode: {
        //            required: true,
        //            maxlength: 50
        //        },
        //        Ord: {
        //            required: true,
        //            maxlength: 5
        //        },
        //        AppUrl: {
        //            required: true,
        //            maxlength: 255
        //        }
        //    },
        //    messages: {
        //        Title: {
        //            required: caption.ERR_REQUIRED.replace('{0}', caption.APP_NAME),
        //            maxlength: caption.ERR_EXCEED_CHARACTERS.replace('{0}', caption.APP_NAME).replace('{1}', '255')
        //        },
        //        ApplicationCode: {
        //            required: caption.ERR_REQUIRED.replace("{0}", caption.APP_CODE),
        //            maxlength: caption.ERR_EXCEED_CHARACTERS.replace("{0}", caption.APP_CODE).replace("{1}", "50")
        //        },
        //        Ord: {
        //            required: caption.ERR_REQUIRED.replace("{0}", caption.ORDER),
        //            maxlength: caption.ERR_EXCEED_CHARACTERS.replace('{0}', caption.ORDER_SORT).replace('{1}', '5')
        //        },
        //        AppUrl: {
        //            required: caption.ERR_REQUIRED.replace("{0}", caption.URL_APP),
        //            maxlength: caption.ERR_EXCEED_CHARACTERS.replace("{0}", caption.URL_APP).replace("{1}", "255")
        //        }
        //    }
        //}

    });
    $rootScope.validationOptions = {
        rules: {
            Title: {
                required: true,
                maxlength: 255
            },
            TimeTicketCreate: {
                required: true,
            },
            Note: {
                maxlength: 1000
            }
        },
        messages: {
            Title: {
                required: caption.MES_MSG_TITLE,
                maxlength: caption.MES_MSG_TITLE_255
            },
            TimeTicketCreate: {
                required: caption.MES_MSG_ENTER_CREATED_TIME
            },
            Note: {
                maxlength: caption.MES_CURD_VALIDATE_EXPSTORE_NOTE
            }
        }
    }
    $rootScope.ExpCode = '';
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {

    $translateProvider.useUrlLoader('/Admin/MaterialProductHistorySale/Translation');
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
        CusCode: '',
        SupCode: '',
        Type: '',
        MappingCode: ''
    }

    $scope.listTypes = [
        {
            Code: '',
            Name: 'Tất cả'
        },
        {
            Code: "IMPORT_RETURN",
            Name: "Nhập trả về"
        },
        {
            Code: "ARRANGE_IMP",
            Name: "Xếp nhập"
        },
        {
            Code: "EXPORT_PARTIAL",
            Name: "Xuất linh kiện"
        },
        {
            Code: "EXPORT_FULL",
            Name: "Xuất đầy đủ"
        },
        {
            Code: "REARRANGE",
            Name: "Xếp lại"
        }
    ];

    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/MaterialProductHistorySale/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Code = $scope.model.Code;
                d.Name = $scope.model.Name;
                d.FromTo = $scope.model.FromTo;
                d.DateTo = $scope.model.DateTo;
                d.Group = $scope.model.Group;
                d.Type = $scope.model.Type;
                d.ContractCode = $scope.model.ContractCode;
                d.CusCode = $scope.model.CusCode;
                d.SupCode = $scope.model.SupCode;
                d.MappingCode = $scope.model.MappingCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(600,'#tblDataProductHistory');
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('STT').withTitle('{{"STT" | translate}}').withOption('sClass', 'dataTable-10per').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Type').withTitle('{{"Kiểu" | translate}}').withOption('sClass', 'dataTable-20per').renderWith(function (data, type) {
        if (data == "EXPORT_PARTIAL" || data == "EXPORT_FULL")
            return '<span class="text-danger bold">Xuất (rút)</span>';
        if (data == "ARRANGE_IMP" || data == "IMPORT_RETURN")
            return '<span class="text-success bold">Nhập (trả)</span>';
        return '<span class="text-info bold">Xếp lại</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('{{"Tên phiếu [ Vị trí cũ]" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
        if (data == "IMPORT_RETURN")
            return `<span class="bold">${full.TicketNameImpReturn}</span>`;
        if (data == "EXPORT_PARTIAL")
            return `<span class="bold">${full.TicketNameExportPartial}</span>`;
        if (data == "ARRANGE_IMP")
            return `<span class="bold">${full.TicketNameImpArrange}</span>`;
        if (data == "EXPORT_FULL")
            return `<span class="bold">${full.TicketNameExportFull}</span>`;
        if (data == "REARRANGE")
            return `<span class="bold">${full.MappingCodeOld}</span>`;
        return 'Không xác định';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('MappingCode').withTitle('{{"Vị trí" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withTitle('{{"MLP_TAB_HISTORY_LIST_COL_QUANTIY" | translate}}').renderWith(function (data, type, full) {
        return "<span class='text-primary'>" + data + "</span>";
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductNo').withTitle('{{"Thứ tự" | translate}}').renderWith(function (data, type, full) {
        return "<span class='text-primary'>" + data + "</span>";
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('GattrFlatCode').withTitle('{{"Thuộc tính" | translate}}').renderWith(function (data, type) {
        return "<span class='text-primary'>" + data + "</span>";
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
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.search = function () {
        reloadData(true);
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

    $scope.initData = function () {
        dataservice.gettreedataLevel(function (result) {
            result = result.data;
            $scope.treedataLevel = result;
        });
        dataservice.getproductgroup(function (result) {
            result = result.data;
            $scope.productGroups = result;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.productGroups.unshift(all)
        });
        dataservice.getProductTypes(function (result) {
            result = result.data;
            $scope.productTypes = result;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.productTypes.unshift(all)
        });
        dataservice.getListContract(function (result) {
            result = result.data;
            $scope.contracts = result;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.contracts.unshift(all)
        });
        dataservice.getListCustommer(function (result) {
            result = result.data;
            $scope.customers = result;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.customers.unshift(all)
        });
        dataservice.getListSupplier(function (result) {
            result = result.data;
            $scope.suppliers = result;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.suppliers.unshift(all)
        });
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

    setTimeout(function () {
        loadDate();
    }, 50);
});
