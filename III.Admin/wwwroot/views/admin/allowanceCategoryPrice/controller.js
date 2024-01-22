var ctxfolder = "/views/admin/allowanceCategoryPrice";
var ctxfolderMessage = "/views/message-box";
var ctxfolderCommonSetting = "/views/admin/commonSetting";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ui.tinymce', 'dynamicNumber']);
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
            data: data
        }
        $http(req).then(callback);
    };
    return {
        //commomsetting
        getDataType: function (callback) {
            $http.get('/Admin/CommonSetting/GetDataType').then(callback);
        },
        insertCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Insert/', data).then(callback);
        },
        updateCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Update/', data).then(callback);
        },
        deleteCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Delete', data).then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/AllowanceCategoryPrice/GetItem?Id=' + data).then(callback);
        },

        insertCostCondition: function (data, callback) {
            $http.post('/Admin/AllowanceCategoryPrice/InsertCostCondition', data).then(callback);
        },
        updateCostCondition: function (data, callback) {
            $http.post('/Admin/AllowanceCategoryPrice/UpdateCostCondition', data).then(callback);
        },
        deleteCostCondition: function (data, callback) {
            $http.post('/Admin/AllowanceCategoryPrice/DeleteCostCondition?Id=' + data).then(callback);
        },
        getAllowanceUnit: function (callback) {
            $http.post('/Admin/AllowanceCategoryPrice/GetAllowanceUnit').then(callback);
        },
        getAllowanceUnitValue: function (callback) {
            $http.post('/Admin/AllowanceCategoryPrice/GetAllowanceUnitValue').then(callback);
        },
        getAllowanceCondition: function (callback) {
            $http.post('/Admin/AllowanceCategoryPrice/GetAllowanceCondition').then(callback);
        },
        getAllowanceStatus: function (callback) {
            $http.post('/Admin/AllowanceCategoryPrice/GetAllowanceStatus').then(callback);
        },
        getListCurrency: function (callback) {
            $http.post('/Admin/AllowanceCategoryPrice/GetListCurrency').then(callback);
        },
        getAllowanceDefault: function (headerCode, serviceCatCode, callback) {
            $http.post('/Admin/AllowanceCategoryPrice/GetAllowanceDefault?headerCode=' + headerCode + "&&serviceCatCode=" + serviceCatCode).then(callback);
        },
        getUnitByAllowanceCode: function (data, callback) {
            $http.post('/Admin/AllowanceCategoryPrice/GetUnitByAllowanceCode?serviceCode=' + data).then(callback);
        },

        getListAllowance: function (callback) {
            $http.post('/Admin/AssignAllowance/GetListAllowance').then(callback);
        },
    };
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    $rootScope.PERMISSION_SERVICE_CATEGORY_PRICE = PERMISSION_SERVICE_CATEGORY_PRICE;
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        });
        $rootScope.validationOptions = {
            rules: {
                Title: {
                    required: true,
                },
                EffectiveDate: {
                    required: true,
                },
                ExpiryDate: {
                    required: true,
                },
            },
            messages: {
                Title: {
                    required: caption.SCP_MEG_IMPORT,
                },
                EffectiveDate: {
                    required: caption.SCP_MEG_IMPORT_FROM,
                },
                ExpiryDate: {
                    required: caption.SCP_MEG_IMPORT_TO,
                },
            }
        }
        $rootScope.IsTranslate = true;
    });
    $rootScope.partternNumber = /^[0-9]\d*(\\d+)?$/; //Chỉ cho nhập số khong the am
    $rootScope.checkNumber = function (data) {
        var partternNumber = /^[0-9]\d*(\\d+)?$/;
        var mess = { Status: false, Title: "" }
        if (!partternNumber.test(data.ObjFromValue)) {
            mess.Status = true;
            mess.Title = mess.Title.concat(" - ", caption.SCP_MEG_IMPORT_FROM_NUMBER, "<br/>");
        }
        if (!partternNumber.test(data.ObjToValue)) {
            mess.Status = true;
            mess.Title = mess.Title.concat(" - ", caption.SCP_MEG_IMPORT_TO_NUMBER, "<br/>");
        }
        return mess;
    }

    $rootScope.QrDefault = "";
    $rootScope.BarDefault = "";
    $rootScope.Cost = 0;
    $rootScope.priority = 0;
    $rootScope.Type = "";
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/AllowanceCategoryPrice/Translation');
    caption = $translateProvider.translations();

    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/add', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
        })
        .when('/edit', {
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit'
        })
        .when('/detail', {
            templateUrl: ctxfolder + '/detail.html',
            controller: 'detail'
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
app.directive('customOnChange', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChange);
            element.on('change', onChangeHandler);
            element.on('$destroy', function () {
                element.off();
            });

        }
    };
});
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.suppliers = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    $scope.listAllowance = [];

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/AllowanceCategoryPrice/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
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

            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                    $scope.selected[data.Id] = !$scope.selected[data.Id];
                } else {
                    //var self = $(this).parent();
                    //if ($(self).hasClass('selected')) {
                    //    $(self).removeClass('selected');
                    //    $scope.selected[data.Id] = false;
                    //} else {
                    //    $('#tblData').DataTable().$('tr.selected').removeClass('selected');
                    //    $scope.selected.forEach(function (obj, index) {
                    //        if ($scope.selected[index])
                    //            $scope.selected[index] = false;
                    //    });
                    //    $(self).addClass('selected');
                    //    $scope.selected[data.Id] = true;
                    //}
                }

                vm.selectAll = false;
                $scope.$apply();
            });
            if ($rootScope.PERMISSION_SERVICE_CATEGORY_PRICE.Update) {
                $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                    } else {
                        var Id = data.Id;
                        $scope.edit(Id);
                    }
                });
            }
        });

    vm.dtColumns = [];
    var ad = 0;
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AllowanceCatCode').withTitle('{{"SCP_CURD_COL_SERVICE_CAT_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AllowanceName').withTitle('{{"SCP_CURD_COL_SERVICE_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ObjectCode').withTitle('{{"SCP_CURD_COL_OBJ_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ObjFromValue').withTitle('{{"SCP_CURD_COL_OBJ_FROM_VALUE" | translate}}').renderWith(function (data, type, full) {
        return '<span class="text-primary">' + $filter('currency')(data, '', '') + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ObjToValue').withTitle('{{"SCP_CURD_COL_OBJ_TO_VALUE" | translate}}').renderWith(function (data, type, full) {
        return '<span class="text-primary">' + $filter('currency')(data, '', '') + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Unit').withTitle('{{"SCP_CURD_COL_UNIT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Price').withTitle('{{"SCP_CURD_COL_PRICE" | translate}}').renderWith(function (data, full, type) {
        return '<span class="text-danger">' + $filter('currency')(data, '', 0) + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Currency').withTitle('{{"SCP_CURD_COL_CURRENCY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full, meta) {
        return '<button title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $scope.initData = function () {
        dataservice.getListAllowance(function (rs) {
            rs = rs.data;
            $scope.listAllowance = rs;
        });
    };
    $scope.initData();

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '70',
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.edit = function (id) {
        dataservice.getItem(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/edit.html',
                    controller: 'edit',
                    backdrop: 'static',
                    size: '70',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    $scope.reloadNoResetPage();
                }, function () {
                });
            }
        });
    };

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deleteCostCondition(id, function (rs) {
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
            $scope.reloadNoResetPage();
        }, function () {
        });
    };
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
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
        });
        $("#CreatedDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            //var maxDate = new Date(selected.date.valueOf());
            //$('#ToDate').datepicker('setStartDate', maxDate);
        });
        $("#ExpiryDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            //var maxDate = new Date(selected.date.valueOf());
            //$('#FromDate').datepicker('setEndDate', maxDate);
        });
    }
    setTimeout(function () {
        loadDate();
    }, 50);
});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter, DTOptionsBuilder) {
    $scope.model = {
        AllowanceCatCode: '',
        ObjectCode: '',
        Unit: '',
        ObjFromValue: '',
        ObjToValue: '',
        Price: '',
        Currency: ''
    };
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    var vm = $scope;
    $scope.selected = [];
    $scope.listAllowance = [];
    $rootScope.listCondition = [];
    $rootScope.listUnit = [];
    $rootScope.listUnitValue = [];
    $scope.listCurrency = [];

    $scope.formText = false;
    $scope.formDateTime = false;
    $scope.formNumber = false;
    $scope.formMoney = true;

    $scope.datatable = {};
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    $scope.currentItemEdit = null;
    $scope.isEdit = false;
    $scope.dataJtable = {};
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/AllowanceCategoryPrice/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(400, "#tblData");
                $scope.$apply();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
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
            $scope.datatable[data.Id] = data;
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    vm.dtColumns = [];

    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AllowanceCatCode').withTitle('{{"SCP_CURD_COL_SERVICE_CAT_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AllowanceName').withTitle('{{"SCP_CURD_COL_SERVICE_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ObjectCode').withTitle('{{"SCP_CURD_COL_OBJ_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ObjFromValue').withTitle('{{"SCP_CURD_COL_OBJ_FROM_VALUE" | translate}}').renderWith(function (data, type, full) {
        return '<span class="text-primary">' + $filter('currency')(data, '', '') + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ObjToValue').withTitle('{{"SCP_CURD_COL_OBJ_TO_VALUE" | translate}}').renderWith(function (data, type, full) {
        return '<span class="text-primary">' + $filter('currency')(data, '', '') + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Unit').withTitle('{{"SCP_CURD_COL_UNIT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Price').withTitle('{{"SCP_CURD_COL_PRICE" | translate}}').renderWith(function (data, full, type) {
        return '<span class="text-danger">' + $filter('currency')(data, '', 0) + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Currency').withTitle('{{"SCP_CURD_COL_CURRENCY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full, meta) {
        return '<button title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};

    function reloadData(resetPaging) {
        $rootScope.Cost = 0;
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

    $scope.initData = function () {
        dataservice.getListAllowance(function (rs) {
            rs = rs.data;
            $scope.listAllowance = rs;
        });
        dataservice.getAllowanceUnit(function (rs) {
            rs = rs.data;
            $rootScope.listUnit = rs;
        });
        dataservice.getAllowanceUnitValue(function (rs) {
            rs = rs.data;
            $rootScope.listUnitValue = rs;
        });
        dataservice.getAllowanceCondition(function (rs) {
            rs = rs.data;
            $rootScope.listCondition = rs;
        });
        dataservice.getAllowanceStatus(function (rs) {
            rs = rs.data;
            $scope.listStatus = rs;
        });
        dataservice.getListCurrency(function (rs) {
            rs = rs.data;
            $scope.listCurrency = rs;
        });
    };
    $scope.initData();

    $scope.add = function () {
        var check = $scope.checkValidate();
        if (!check.Error) {
            dataservice.insertCostCondition($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    //$scope.clearData();
                    $scope.reload();
                }
            });
        } else {
            App.toastrError(check.Title);
        }
    };
    $scope.edit = function (id) {
        dataservice.getItem(id, function (rs) {
            rs = rs.data;
            $scope.model = rs.Object;
            $scope.isEdit = true;
        });
    };
    $scope.save = function () {
        var check = $scope.checkValidate();
        if (!check.Error) {
            dataservice.updateCostCondition($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    //$scope.clearData();
                    $scope.reload();
                }
            });
        } else {
            App.toastrError(check.Title);
        }
    };
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deleteCostCondition(id, function (rs) {
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
            reloadData(false);
        }, function () {
        });
    };

    $scope.close = function () {
        $scope.isEdit = false;
    }
    $scope.changleSelect = function (Type, Item) {

    };
    $scope.checkValidate = function () {
        var msg = {
            Error: false,
            Title: ""
        }

        if ($scope.model.Price <= 0 && $scope.model.AllowanceCatCode != "DV_000" && !$scope.isDisablePrice) {
            msg.Error = true;
            msg.Title += "- Giá phải lớn hơn 0 <br/>";
        }

        var Type = $rootScope.Type;
        switch (Type) {
            case "NUMBER":
                if ($scope.model.ObjFromValue <= 0 && !$scope.isDisableFromValue) {
                    msg.Error = true;
                    msg.Title += "- Giá trị từ phải lớn hơn 0 <br/>";
                }
                if ($scope.model.ObjToValue <= 0 && !$scope.isDisableToValue) {
                    msg.Error = true;
                    msg.Title += "- Giá trị đến phải lớn hơn 0 <br/>";
                }

                if ($scope.model.ObjFromValue > $scope.model.ObjToValue) {
                    msg.Error = true;
                    msg.Title += "- " + caption.SCP_CURD_VALIDATE_VALUE_FROM + "<br/>";
                    break;
                }
                break;
            case "MONEY":
                if ($scope.model.ObjFromValue <= 0 && !$scope.isDisableFromValue) {
                    msg.Error = true;
                    msg.Title += "- Giá trị từ phải lớn hơn 0 <br/>";
                }
                if ($scope.model.ObjToValue <= 0 && !$scope.isDisableToValue) {
                    msg.Error = true;
                    msg.Title += "- Giá trị đến phải lớn hơn 0 <br/>";
                }

                if ($scope.model.ObjFromValue > $scope.model.ObjToValue) {
                    msg.Error = true;
                    msg.Title = "- " + caption.SCP_CURD_VALIDATE_VALUE_FROM + "<br/>";
                    break;
                }
                break;
        }

        return msg;
    }
    $scope.clearData = function () {
        $scope.model = {
            AllowanceCatCode: '',
            ObjectCode: '',
            Unit: '',
            ObjFromValue: '',
            ObjToValue: '',
            Price: '',
            Currency: '',
            Rate: '',
        };
    }
    $scope.clearDataNotAllowanceCatCode = function () {
        $scope.model.ObjectCode = '';
        $scope.model.ObjFromValue = '';
        $scope.model.ObjToValue = '';
        $scope.model.Price = '';
        $scope.model.Currency = '';
    };
    $scope.setDataAllowanceDefault = function () {
        $scope.model.Price = 0;
        $scope.model.Currency = '';
        $scope.model.ObjectCode = '';
    };
    function loadDate() {
        $("#EffectiveDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ExpiryDate').datepicker('setStartDate', maxDate);
            if ($('#EffectiveDate').valid()) {
                $('#EffectiveDate').removeClass('invalid').addClass('success');
            }
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#ExpiryDate').datepicker('setStartDate', null);
            }
        });
        $("#ExpiryDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EffectiveDate').datepicker('setEndDate', maxDate);
            if ($('#ExpiryDate').valid()) {
                $('#ExpiryDate').removeClass('invalid').addClass('success');
            }
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#EffectiveDate').datepicker('setEndDate', null);
            }
        });
        $("#ObjFromDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ObjToDate').datepicker('setStartDate', maxDate);
            if ($('#ObjFromDate').valid()) {
                $('#ObjFromDate').removeClass('invalid').addClass('success');
            }
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#ObjToDate').datepicker('setStartDate', null);
            }
        });
        $("#ObjToDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ObjFromDate').datepicker('setEndDate', maxDate);
            if ($('#ObjToDate').valid()) {
                $('#ObjToDate').removeClass('invalid').addClass('success');
            }
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#ObjFromDate').datepicker('setEndDate', null);
            }
        });
    }
    setTimeout(function () {
        loadDate();
    }, 200);
    $scope.addCommonSettingUnit = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'ALLOWANCE_UNIT_VALUE',
                        GroupNote: 'Đơn vị giá trị',
                        AssetCode: 'ALLOWANCE'
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataservice.getAllowanceUnitValue(function (rs) {
                rs = rs.data;
                $rootScope.listUnitValue = rs;
            });
        }, function () { });
    }
    $scope.addCommonSettingObjectCode = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'ALLOWANCE_CONDITION',
                        GroupNote: 'Điều kiện ràng buộc',
                        AssetCode: 'ALLOWANCE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataservice.getAllowanceCondition(function (rs) {
                rs = rs.data;
                $rootScope.listCondition = rs;
            });
        }, function () { });
    }
    $scope.addCommonSettingAllowanceUnit = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'ALLOWANCE_UNIT',
                        GroupNote: 'Đơn vị phụ cấp',
                        AssetCode: 'ALLOWANCE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataservice.getAllowanceUnit(function (rs) {
                rs = rs.data;
                $rootScope.listUnit = rs;
            });
        }, function () { });
    }
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter, DTOptionsBuilder, para) {
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    var vm = $scope;
    $scope.selected = [];
    $scope.listAllowance = [];
    $rootScope.listCondition = [];
    $rootScope.listUnit = [];
    $rootScope.listUnitValue = [];
    $scope.listCurrency = [];

    $scope.formText = false;
    $scope.formDateTime = false;
    $scope.formNumber = false;
    $scope.formMoney = true;

    $scope.datatable = {};
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    $scope.currentItemEdit = null;
    $scope.isEdit = true;
    $scope.dataJtable = {};
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/AllowanceCategoryPrice/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(400, "#tblData");
                $scope.$apply();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
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
            $scope.datatable[data.Id] = data;
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    vm.dtColumns = [];

    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AllowanceCatCode').withTitle('{{"SCP_CURD_COL_SERVICE_CAT_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AllowanceName').withTitle('{{"SCP_CURD_COL_SERVICE_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ObjectCode').withTitle('{{"SCP_CURD_COL_OBJ_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ObjFromValue').withTitle('{{"SCP_CURD_COL_OBJ_FROM_VALUE" | translate}}').renderWith(function (data, type, full) {
        return '<span class="text-primary">' + $filter('currency')(data, '', '') + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ObjToValue').withTitle('{{"SCP_CURD_COL_OBJ_TO_VALUE" | translate}}').renderWith(function (data, type, full) {
        return '<span class="text-primary">' + $filter('currency')(data, '', '') + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Unit').withTitle('{{"SCP_CURD_COL_UNIT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Price').withTitle('{{"SCP_CURD_COL_PRICE" | translate}}').renderWith(function (data, full, type) {
        return '<span class="text-danger">' + $filter('currency')(data, '', 0) + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Currency').withTitle('{{"SCP_CURD_COL_CURRENCY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full, meta) {
        return '<button title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};

    function reloadData(resetPaging) {
        $rootScope.Cost = 0;
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

    $scope.initData = function () {
        $scope.model = para;

        dataservice.getListAllowance(function (rs) {
            rs = rs.data;
            $scope.listAllowance = rs;
        });
        dataservice.getAllowanceUnit(function (rs) {
            rs = rs.data;
            $rootScope.listUnit = rs;
        });
        dataservice.getAllowanceUnitValue(function (rs) {
            rs = rs.data;
            $rootScope.listUnitValue = rs;
        });
        dataservice.getAllowanceCondition(function (rs) {
            rs = rs.data;
            $rootScope.listCondition = rs;
        });
        dataservice.getAllowanceStatus(function (rs) {
            rs = rs.data;
            $scope.listStatus = rs;
        });
        dataservice.getListCurrency(function (rs) {
            rs = rs.data;
            $scope.listCurrency = rs;
        });
    };
    $scope.initData();

    $scope.add = function () {
        var check = $scope.checkValidate();
        if (!check.Error) {
            dataservice.insertCostCondition($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    //$scope.clearData();
                    $scope.reload();
                }
            });
        } else {
            App.toastrError(check.Title);
        }
    };
    $scope.edit = function (id) {
        dataservice.getItem(id, function (rs) {
            rs = rs.data;
            $scope.model = rs.Object;
            $scope.isEdit = true;
        });
    };
    $scope.save = function () {
        var check = $scope.checkValidate();
        if (!check.Error) {
            dataservice.updateCostCondition($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    //$scope.clearData();
                    $scope.reload();
                }
            });
        } else {
            App.toastrError(check.Title);
        }
    };
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deleteCostCondition(id, function (rs) {
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
            reloadData(false);
        }, function () {
        });
    }

    $scope.close = function () {
        $scope.isEdit = false;
    }
    $scope.changleSelect = function (Type, Item) {

    };
    $scope.checkValidate = function () {
        var msg = {
            Error: false,
            Title: ""
        }

        if ($scope.model.Price <= 0 && $scope.model.AllowanceCatCode != "DV_000" && !$scope.isDisablePrice) {
            msg.Error = true;
            msg.Title += "- Giá phải lớn hơn 0 <br/>";
        }

        var Type = $rootScope.Type;
        switch (Type) {
            case "NUMBER":
                if ($scope.model.ObjFromValue <= 0 && !$scope.isDisableFromValue) {
                    msg.Error = true;
                    msg.Title += "- Giá trị từ phải lớn hơn 0 <br/>";
                }
                if ($scope.model.ObjToValue <= 0 && !$scope.isDisableToValue) {
                    msg.Error = true;
                    msg.Title += "- Giá trị đến phải lớn hơn 0 <br/>";
                }

                if ($scope.model.ObjFromValue > $scope.model.ObjToValue) {
                    msg.Error = true;
                    msg.Title += "- " + caption.SCP_CURD_VALIDATE_VALUE_FROM + "<br/>";
                    break;
                }
                break;
            case "MONEY":
                if ($scope.model.ObjFromValue <= 0 && !$scope.isDisableFromValue) {
                    msg.Error = true;
                    msg.Title += "- Giá trị từ phải lớn hơn 0 <br/>";
                }
                if ($scope.model.ObjToValue <= 0 && !$scope.isDisableToValue) {
                    msg.Error = true;
                    msg.Title += "- Giá trị đến phải lớn hơn 0 <br/>";
                }

                if ($scope.model.ObjFromValue > $scope.model.ObjToValue) {
                    msg.Error = true;
                    msg.Title = "- " + caption.SCP_CURD_VALIDATE_VALUE_FROM + "<br/>";
                    break;
                }
                break;
        }

        return msg;
    }
    $scope.clearData = function () {
        $scope.model = {
            AllowanceCatCode: '',
            ObjectCode: '',
            Unit: '',
            ObjFromValue: '',
            ObjToValue: '',
            Price: '',
            Currency: '',
            Rate: '',
        };
    }
    $scope.clearDataNotAllowanceCatCode = function () {
        $scope.model.ObjectCode = '';
        $scope.model.ObjFromValue = '';
        $scope.model.ObjToValue = '';
        $scope.model.Price = '';
        $scope.model.Currency = '';
        $scope.model.Rate = 1;
    }
    $scope.setDataAllowanceDefault = function () {
        $scope.model.Price = 0;
        $scope.model.Currency = '';
        $scope.model.ObjectCode = '';
    }
    function loadDate() {
        $("#EffectiveDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ExpiryDate').datepicker('setStartDate', maxDate);
            if ($('#EffectiveDate').valid()) {
                $('#EffectiveDate').removeClass('invalid').addClass('success');
            }
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#ExpiryDate').datepicker('setStartDate', null);
            }
        });
        $("#ExpiryDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EffectiveDate').datepicker('setEndDate', maxDate);
            if ($('#ExpiryDate').valid()) {
                $('#ExpiryDate').removeClass('invalid').addClass('success');
            }
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#EffectiveDate').datepicker('setEndDate', null);
            }
        });
        $("#ObjFromDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ObjToDate').datepicker('setStartDate', maxDate);
            if ($('#ObjFromDate').valid()) {
                $('#ObjFromDate').removeClass('invalid').addClass('success');
            }
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#ObjToDate').datepicker('setStartDate', null);
            }
        });
        $("#ObjToDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ObjFromDate').datepicker('setEndDate', maxDate);
            if ($('#ObjToDate').valid()) {
                $('#ObjToDate').removeClass('invalid').addClass('success');
            }
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#ObjFromDate').datepicker('setEndDate', null);
            }
        });
    }
    setTimeout(function () {
        loadDate();
    }, 200);
    $scope.addCommonSettingUnit = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'ALLOWANCE_UNIT_VALUE',
                        GroupNote: 'Đơn vị giá trị',
                        AssetCode: 'ALLOWANCE'
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataservice.getAllowanceUnitValue(function (rs) {
                rs = rs.data;
                $rootScope.listUnitValue = rs;
            });
        }, function () { });
    }
    $scope.addCommonSettingObjectCode = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'ALLOWANCE_CONDITION',
                        GroupNote: 'Điều kiện ràng buộc',
                        AssetCode: 'ALLOWANCE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataservice.getAllowanceCondition(function (rs) {
                rs = rs.data;
                $rootScope.listCondition = rs;
            });
        }, function () { });
    }
    $scope.addCommonSettingAllowanceUnit = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'ALLOWANCE_UNIT',
                        GroupNote: 'Đơn vị phụ cấp',
                        AssetCode: 'ALLOWANCE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataservice.getAllowanceUnit(function (rs) {
                rs = rs.data;
                $rootScope.listUnit = rs;
            });
        }, function () { });
    }
});
app.controller('detail', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, para) {
    var vm = $scope;
    $scope.model = {
        CodeSet: '',
        ValueSet: '',
        AssetCode: para.AssetCode,
        Group: para.Group,
        GroupNote: para.GroupNote
    }
    $scope.listDataType = [];
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/CommonSetting/JTableDetail/",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.SettingGroup = para.Group;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(400, "#tblData");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [2, 'asc'])
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                var self = $(this).parent();
                if ($(self).hasClass('selected')) {
                    $(self).removeClass('selected');
                    resetInput();
                } else {
                    $('#tblDataDetail').DataTable().$('tr.selected').removeClass('selected');
                    $(self).addClass('selected');
                    $scope.model.CodeSet = data.CodeSet;
                    $scope.model.ValueSet = data.ValueSet;
                    $scope.model.Type = data.Type;
                }
                $scope.$apply();
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("SettingID").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.SettingID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.SettingID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withTitle('{{"SCP_LIST_COL_ORDER" | translate}}').notSortable().withOption('sWidth', '30px').withOption('sClass', 'tcenter w50').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ValueSet').withTitle('{{"SCP_LIST_COL_VALUE_SET" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeName').withTitle('{{"SCP_LIST_COL_TYPE_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"SCP_LIST_COL_CREATE_TIME" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{"SCP_LIST_COL_CREATE_BY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button title="Xoá" ng-click="delete(' + full.SettingID + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    function resetInput() {
        $scope.model.CodeSet = '';
        $scope.model.ValueSet = ''
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.init = function () {
        dataservice.getDataType(function (rs) {
            rs = rs.data;
            $scope.listDataType = rs;
        });
    }
    $scope.init();
    $scope.add = function () {
        if ($scope.model.ValueSet == '') {
            App.toastrError(caption.SCP_CURD_MSG_SETTING_NOT_BLANK);
        } else if ($scope.model.ValueSet.length > 255) {
            App.toastrError(caption.COM_MSG_VALUE_SET_TOO_BIG);
        } else {
            dataservice.insertCommonSetting($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                }
            })
        }
    }
    $scope.edit = function () {
        if ($scope.model.CodeSet == '') {
            App.toastrError(caption.SCP_CURD_MSG_DATA_NOT_BLANK)
        } else if ($scope.model.ValueSet.length > 255) {
            App.toastrError(caption.COM_MSG_VALUE_SET_TOO_BIG);
        } else {
            dataservice.updateCommonSetting($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                    resetInput();
                }
            })
        }
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deleteCommonSetting(id, function (rs) {
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
            $scope.reloadNoResetPage();
        }, function () {
        });
    }
    $scope.cancel = function () {
        //$uibModalInstance.dismiss('cancel');
        $uibModalInstance.close();
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});