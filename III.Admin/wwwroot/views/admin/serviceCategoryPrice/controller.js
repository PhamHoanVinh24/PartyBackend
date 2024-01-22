var ctxfolder = "/views/admin/serviceCategoryPrice";
var ctxfolderMessage = "/views/message-box";
var ctxfolderCommonSetting = "/views/admin/commonSetting";

var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD', "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ui.tinymce', 'dynamicNumber']);
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
        deleteItems: function (data, callback) {
            $http.post('/Admin/ServiceCategoryPrice/DeleteItems', data).then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/ServiceCategoryPrice/GetItem?Id=' + data).then(callback);
        },
        // product cosst
        insert: function (data, callback) {
            $http.post('/Admin/ServiceCategoryPrice/Insert', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/ServiceCategoryPrice/Delete?Id=' + data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/ServiceCategoryPrice/Update', data).then(callback);
        },
        insertCostCondition: function (data, callback) {
            $http.post('/Admin/ServiceCategoryPrice/InsertCostCondition', data).then(callback);
        },
        deleteProduct: function (data, callback) {
            $http.post('/Admin/ServiceCategoryPrice/DeleteProduct?Id=' + data).then(callback);
        },
        getServiceConditonItem: function (data, callback) {
            $http.post('/Admin/ServiceCategoryPrice/GetServiceConditionItem?Id=' + data).then(callback);
        },
        updateCostCondition: function (data, callback) {
            $http.post('/Admin/ServiceCategoryPrice/UpdateCostCondition', data).then(callback);
        },
        getListServiceCategory: function (callback) {
            $http.post('/Admin/ServiceCategoryPrice/GetListServiceCategory').then(callback);
        },
        getServiceUnit: function (callback) {
            $http.post('/Admin/ServiceCategoryPrice/GetServiceUnit').then(callback);
        },
        getServiceUnitValue: function (callback) {
            $http.post('/Admin/ServiceCategoryPrice/GetServiceUnitValue').then(callback);
        },
        getServiceCondition: function (callback) {
            $http.post('/Admin/ServiceCategoryPrice/GetServiceCondition').then(callback);
        },
        getServiceResponsibleUser: function (callback) {
            $http.post('/Admin/ServiceCategoryPrice/GetServiceResponsibleUser').then(callback);
        },
        getServiceStatus: function (callback) {
            $http.post('/Admin/ServiceCategoryPrice/GetServiceStatus').then(callback);
        },
        getListCurrency: function (callback) {
            $http.post('/Admin/ServiceCategoryPrice/GetListCurrency').then(callback);
        },
        getServiceDefault: function (headerCode, serviceCatCode, callback) {
            $http.post('/Admin/ServiceCategoryPrice/GetServiceDefault?headerCode=' + headerCode + "&&serviceCatCode=" + serviceCatCode).then(callback);
        },
        getUnitByServiceCode: function (data, callback) {
            $http.post('/Admin/ServiceCategoryPrice/GetUnitByServiceCode?serviceCode=' + data).then(callback);
        },
    }
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
    $translateProvider.useUrlLoader('/Admin/ServiceCategoryPrice/Translation');
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
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, $filter) {
    $scope.model = {
        productcode: '',
        productname: '',
        unit: '',
        describe: '',
        Status: ''
    }
    $scope.status = [
        { Code: '', Name: 'Tất cả' },
        { Code: "EFFETIVE", Name: "Còn hiệu lực" },
        { Code: "EXPIRE", Name: "Đã hết hạn" }
    ];
    var vm = $scope;
    $scope.selected = [];
    $scope.suppliers = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/ServiceCategoryPrice/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Title = $scope.model.Title;
                d.Status = $scope.model.Status;
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"SCP_COL_TITLE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EffectiveDate').withTitle('{{"SCP_COL_EFFECTIVE_DATE" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ExpiryDate').withTitle('{{"SCP_COL_EXPIRY_DATE" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"SCP_COL_CREATED_TIME" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{"SCP_COL_CREATED_BY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"SCP_COL_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'd-flex w75').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        var listButton = '';
        if ($rootScope.PERMISSION_SERVICE_CATEGORY_PRICE.Update) {
            listButton += '<a ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding-right: 0px" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a>';
        }
        if ($rootScope.PERMISSION_SERVICE_CATEGORY_PRICE.Delete) {
            listButton += '<a ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding-left: 10px" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash fs25"></i></a>';
        }
        return listButton;
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


    }
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
    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.delete(id, function (rs) {
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
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter, DTOptionsBuilder) {
    $scope.model = {
        HeaderCode: '',
        Title: '',
        sEffectiveDate: '',
        sExpiryDate: '',
        ResponsibleUser: '',
        Note: '',
    };
    $scope.modelChild = {
        ServiceCatCode: '',
        ObjectCode: '',
        Unit: '',
        ObjFromValue: '',
        ObjToValue: '',
        Price: '',
        Currency: '',
        Rate: 1,
    };
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    var vm = $scope;
    $scope.selected = [];
    $scope.listService = [];
    $scope.listResponsibleUser = [];
    $rootScope.listCondition = [];
    $rootScope.listUnit = [];
    $rootScope.listUnitValue = [];
    $scope.listCurrency = [];
    $scope.isDisableAdd = true;
    $scope.isDisableUnit = false;
    $scope.isDisableObjectCode = false;
    $scope.isDisableFromValue = false;
    $scope.isDisableToValue = false;
    $scope.isDisablePrice = false;
    $scope.isDisableRate = false;

    $scope.formText = true;
    $scope.formDateTime = false;
    $scope.formNumber = false;
    $scope.formMoney = false;

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
            url: "/Admin/ServiceCategoryPrice/JTableDetail",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.HeaderCode = $scope.model.HeaderCode;
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('ServiceCatCode').withTitle('{{"SCP_CURD_COL_SERVICE_CAT_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ServiceName').withTitle('{{"SCP_CURD_COL_SERVICE_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ServiceUnit').withTitle('{{"SCP_CURD_COL_SERVICE_UNIT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ObjectCode').withTitle('{{"SCP_CURD_COL_OBJ_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ObjFromValue').withTitle('{{"SCP_CURD_COL_OBJ_FROM_VALUE" | translate}}').renderWith(function (data, type, full) {
        if (full.Type == "MONEY" || full.ServiceCatCode == "DV_000") {
            return '<span class="text-danger">' + $filter('currency')(data, '', 0) + '</span>';
        } else {
            return data;
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ObjToValue').withTitle('{{"SCP_CURD_COL_OBJ_TO_VALUE" | translate}}').renderWith(function (data, type, full) {
        if (full.Type == "MONEY" || full.ServiceCatCode == "DV_000") {
            return '<span class="text-danger">' + $filter('currency')(data, '', 0) + '</span>';
        } else {
            return data;
        }
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('Rate').withTitle('{{"SCP_CURD_COL_RATE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full, meta) {
        return '<a title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding-right: 10px" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a>' +
            '<a title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash fs25"></i></a>';
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
    //function loadDate() {
    //    $("#EffectiveDate").datepicker({
    //        inline: false,
    //        autoclose: true,
    //        format: "dd/mm/yyyy",
    //        fontAwesome: true,
    //    }).on('changeDate', function (selected) {
    //        var maxDate = new Date(selected.date.valueOf());
    //        $('#ExpiryDate').datepicker('setStartDate', maxDate);
    //    });
    //    $("#ExpiryDate").datepicker({
    //        inline: false,
    //        autoclose: true,
    //        format: "dd/mm/yyyy",
    //        fontAwesome: true,
    //    }).on('changeDate', function (selected) {
    //        var maxDate = new Date(selected.date.valueOf());
    //        $('#EffectiveDate').datepicker('setEndDate', maxDate);
    //        });
    //}
    $scope.reload = function () {
        reloadData(true);
    }

    $scope.initData = function () {
        dataservice.getListServiceCategory(function (rs) {
            rs = rs.data;
            $scope.listService = rs.Object;
        });
        dataservice.getServiceUnit(function (rs) {
            rs = rs.data;
            $rootScope.listUnit = rs;
        });
        dataservice.getServiceUnitValue(function (rs) {
            rs = rs.data;
            $rootScope.listUnitValue = rs;
        });
        dataservice.getServiceCondition(function (rs) {
            rs = rs.data;
            $rootScope.listCondition = rs;
        });
        dataservice.getServiceStatus(function (rs) {
            rs = rs.data;
            $scope.listStatus = rs;
        });
        dataservice.getServiceResponsibleUser(function (rs) {
            rs = rs.data;
            $scope.listResponsibleUser = rs;
        });
        dataservice.getListCurrency(function (rs) {
            rs = rs.data;
            $scope.listCurrency = rs;
        });
    }
    $scope.initData();

    $scope.add = function () {
        $scope.changeRate();
        if ($scope.model.HeaderCode != '') {
            $scope.modelChild.HeaderCode = $scope.model.HeaderCode;
            if ($scope.modelChild.Price == '' || $scope.modelChild.Price == null)
                $scope.modelChild.Price = 0;
            if ($scope.modelChild.ServiceCatCode != "DV_000" && $scope.modelChild.ObjectCode == "SERVICE_CONDITION_000") {
                $scope.modelChild.Rate = 1;
            }
            if ($scope.modelChild.ServiceCatCode == "DV_000") {
                $scope.setDataServiceDefault();
                var msg = $rootScope.checkNumber($scope.modelChild);
                if (msg.Status) {
                    App.toastrError(msg.Title);
                    return;
                }
            }

            if ($scope.modelChild.Rate != '') {
                if ($scope.modelChild.ObjectCode == "SERVICE_CONDITION_000" && ($scope.modelChild.Price == 0 && $scope.modelChild.Currency == '')) {
                    App.toastrError(caption.SCP_CURD_MSG_INFO);
                } else {
                    var check = $scope.checkValidate();

                    if (!check.Error) {
                        $scope.modelChild.Priority = $rootScope.priority;
                        dataservice.insertCostCondition($scope.modelChild, function (rs) {
                            rs = rs.data;
                            if (rs.Error == true) {
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
                }
            } else {
                App.toastrError(caption.SCP_CURD_MSG_RATE);
            }
        }
        else {
            App.toastrError("Chưa lưu lại thông tin bảng giá");
        }
    }
    $scope.edit = function (id) {
        dataservice.getServiceConditonItem(id, function (rs) {
            rs = rs.data;

            $scope.modelChild = rs;
            if (rs.Priority != null) {
                $rootScope.priority = rs.Priority;
            } else {
                $rootScope.priority = 0;
            }

            if (rs.Type == 'NUMBER') {
                $scope.modelChild.ObjFromValue = parseInt($scope.modelChild.ObjFromValue);
                $scope.modelChild.ObjToValue = parseInt($scope.modelChild.ObjToValue);
            }

            $scope.isEdit = true;
            $scope.setData();
        });
    }
    $scope.save = function () {
        $scope.modelChild.HeaderCode = $scope.model.HeaderCode;
        if ($scope.modelChild.Price == '' || $scope.modelChild.Price == null)
            $scope.modelChild.Price = 0;
        if ($scope.modelChild.ServiceCatCode == "DV_000") {
            $scope.setDataServiceDefault();
            var msg = $rootScope.checkNumber($scope.modelChild);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
        }
        if ($scope.modelChild.Rate != '') {
            if ($scope.modelChild.ObjectCode == "SERVICE_CONDITION_000" && ($scope.modelChild.Price == 0 && $scope.modelChild.Currency == '')) {
                App.toastrError(caption.SCP_CURD_MSG_INFO);
            } else {
                var check = $scope.checkValidate();
                if (!check.Error) {
                    $scope.modelChild.Priority = $rootScope.priority;
                    dataservice.updateCostCondition($scope.modelChild, function (rs) {
                        rs = rs.data;
                        if (rs.Error == true) {
                            App.toastrError(rs.Title);
                        }
                        else {
                            App.toastrSuccess(rs.Title);
                            $scope.isEdit = false;
                            $scope.changeRate();
                            //$scope.clearData();
                            reloadData(false);
                        }
                    });
                } else {
                    App.toastrError(check.Title);
                }
            }
        } else {
            App.toastrError(caption.SCP_CURD_MSG_RATE);
        }
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deleteProduct(id, function (rs) {
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
    $scope.submit = function () {
        if ($scope.addform.validate() && $scope.isDisableAdd) {
            dataservice.insert($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error == true) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.model.HeaderCode = rs.Object.HeaderCode;
                    $scope.model.GivenName = rs.Object.GivenName;
                    $scope.isDisableAdd = false;
                }
            });
        }
    }

    $scope.close = function () {
        $scope.isEdit = false;
    }
    $scope.changleSelect = function (Type, Item) {
        if (Type == 'ObjectCode') {
            $scope.changeRate();
            if (Item != null) {
                if (Item.Priority != null) {
                    $rootScope.priority = Item.Priority;
                } else {
                    $rootScope.priority = 0;
                }
            } else {
                $rootScope.priority = 0;
            }
            if (Item != null) {
                if (Item.Type != null) {
                    $scope.showFormType(Item.Type);
                } else {
                    $scope.formText = true;
                    $scope.formDateTime = false;
                    $scope.formNumber = false;
                    $scope.formMoney = false;
                }
            }

            if ($scope.modelChild.ObjectCode == "SERVICE_CONDITION_000") {
                $scope.isDisableFromValue = true;
                $scope.isDisableToValue = true;
                $scope.modelChild.Unit = '';
                $scope.isDisableUnit = true;
                $scope.isDisableRate = true;
                $scope.isDisablePrice = false;
                $scope.isDisableCurrency = false;
            } else if ($rootScope.priority == 2 || $rootScope.priority == 3 || $rootScope.priority == 4) {
                $scope.isDisableFromValue = true;
                $scope.isDisableToValue = true;
                $scope.modelChild.Unit = '';
                $scope.isDisableUnit = true;
                $scope.isDisableRate = false;
                $scope.isDisablePrice = true;
                $scope.isDisableCurrency = true;
                $scope.clearDataObjFromTo();
            } else {
                $scope.isDisableFromValue = false;
                $scope.isDisableToValue = false;
                $scope.isDisableUnit = false;
                $scope.isDisableRate = false;
                $scope.isDisablePrice = true;
                $scope.isDisableCurrency = true;
            }
        }
        if (Type == "ServiceCode") {
            dataservice.getUnitByServiceCode($scope.modelChild.ServiceCatCode, function (rs) {
                rs = rs.data;
                if (rs != null)
                    $scope.modelChild.ServiceUnit = rs;
            });
            //$scope.clearDataNotServiceCatCode();
            if ($scope.modelChild.ServiceCatCode == "DV_000") {
                $scope.showFormType("MONEY");
                $scope.isDisableFromValue = false;
                $scope.isDisableToValue = false;
                $scope.isDisableUnit = false;
                $scope.isDisableRate = false;
                $scope.isDisablePrice = true;
                $scope.isDisableCurrency = true;
                $scope.isDisableObjectCode = true;
            } else {
                $scope.isDisableFromValue = true;
                $scope.isDisableToValue = true;
                $scope.modelChild.Unit = '';
                $scope.isDisableUnit = true;
                $scope.isDisableRate = true;
                $scope.isDisablePrice = false;
                $scope.isDisableCurrency = false;
                $scope.isDisableObjectCode = false;

                if ($scope.modelChild.ObjectCode == "SERVICE_CONDITION_000") {
                    $scope.isDisableFromValue = true;
                    $scope.isDisableToValue = true;
                    $scope.modelChild.Unit = '';
                    $scope.isDisableUnit = true;
                    $scope.isDisableRate = true;
                    $scope.isDisablePrice = false;
                    $scope.isDisableCurrency = false;
                } else if ($rootScope.priority == 2 || $rootScope.priority == 3 || $rootScope.priority == 4) {
                    $scope.isDisableFromValue = true;
                    $scope.isDisableToValue = true;
                    $scope.modelChild.Unit = '';
                    $scope.isDisableUnit = true;
                    $scope.isDisableRate = false;
                    $scope.isDisablePrice = true;
                    $scope.isDisableCurrency = true;
                    $scope.clearDataObjFromTo();
                } else {
                    $scope.isDisableFromValue = false;
                    $scope.isDisableToValue = false;
                    $scope.isDisableUnit = false;
                    $scope.isDisableRate = false;
                    $scope.isDisablePrice = true;
                    $scope.isDisableCurrency = true;
                }
            }
        }
    }
    $scope.changeRate = function () {
        dataservice.getServiceDefault($scope.model.HeaderCode, $scope.modelChild.ServiceCatCode, function (rs) {
            rs = rs.data;
            if (rs.length > 0) {
                $scope.modelChild.Price = $scope.modelChild.Rate * rs[0].Price;
                $scope.modelChild.Currency = rs[0].Currency;
            }
        });
    }
    $scope.setData = function () {
        if ($scope.modelChild.Type != '' && $scope.modelChild.Type != null)
            $scope.showFormType($scope.modelChild.Type);
        if ($scope.modelChild.ServiceCatCode == "DV_000") {
            $scope.changleSelect("ServiceCode", null);
        } else if ($scope.modelChild.ObjectCode == "SERVICE_CONDITION_000") {
            $scope.changleSelect("ObjectCode", null);
        } else if ($rootScope.priority == 2 || $rootScope.priority == 3 || $rootScope.priority == 4) {
            $scope.isDisableFromValue = true;
            $scope.isDisableToValue = true;
            $scope.modelChild.Unit = '';
            $scope.isDisableUnit = true;
            $scope.isDisableRate = false;
            $scope.isDisablePrice = true;
            $scope.isDisableCurrency = true;
        } else {
            $scope.isDisableFromValue = false;
            $scope.isDisableToValue = false;
            $scope.isDisableUnit = false;
            $scope.isDisableRate = false;
            $scope.isDisablePrice = true;
            $scope.isDisableCurrency = true;
        }
    }
    $scope.showFormType = function (Type) {
        switch (Type) {
            case "NUMBER":
                $scope.formText = false;
                $scope.formDateTime = false;
                $scope.formNumber = true;
                $scope.formMoney = false;
                break;
            case "DATETIME":
                $scope.formText = false;
                $scope.formDateTime = true;
                $scope.formNumber = false;
                $scope.formMoney = false;
                setTimeout(function () {
                    loadDate();
                }, 200);
                break;
            case "MONEY":
                $scope.formText = false;
                $scope.formDateTime = false;
                $scope.formNumber = false;
                $scope.formMoney = true;
                break;
            default:
                $scope.formText = true;
                $scope.formDateTime = false;
                $scope.formNumber = false;
                break;
        }

        $rootScope.Type = Type;
    }
    $scope.checkValidate = function () {
        var msg = {
            Error: false,
            Title: ""
        }
        if (!$scope.isDisableUnit) {
            if ($scope.modelChild.Unit == null || $scope.modelChild.Unit == '' || $scope.modelChild.Unit == undefined) {
                msg.Error = true;
                msg.Title = caption.SCP_CURD_VALIDATE_UNIT;
                return msg;
            }
        }

        if ($scope.modelChild.Price <= 0 && $scope.modelChild.ServiceCatCode != "DV_000" && !$scope.isDisablePrice) {
            msg.Error = true;
            msg.Title += "- Giá phải lớn hơn 0 <br/>";
        }

        if ($scope.modelChild.Rate <= 0) {
            msg.Error = true;
            msg.Title += "- Tỉ lệ phải lớn hơn 0 <br/>";
        }

        var Type = $rootScope.Type;
        switch (Type) {
            case "NUMBER":
                if ($scope.modelChild.ObjFromValue <= 0 && !$scope.isDisableFromValue) {
                    msg.Error = true;
                    msg.Title += "- Giá trị từ phải lớn hơn 0 <br/>";
                }
                if ($scope.modelChild.ObjToValue <= 0 && !$scope.isDisableToValue) {
                    msg.Error = true;
                    msg.Title += "- Giá trị đến phải lớn hơn 0 <br/>";
                }

                if ($scope.modelChild.ObjFromValue > $scope.modelChild.ObjToValue) {
                    msg.Error = true;
                    msg.Title += "- " + caption.SCP_CURD_VALIDATE_VALUE_FROM + "<br/>";
                    break;
                }
                break;
            case "MONEY":
                if ($scope.modelChild.ObjFromValue <= 0 && !$scope.isDisableFromValue) {
                    msg.Error = true;
                    msg.Title += "- Giá trị từ phải lớn hơn 0 <br/>";
                }
                if ($scope.modelChild.ObjToValue <= 0 && !$scope.isDisableToValue) {
                    msg.Error = true;
                    msg.Title += "- Giá trị đến phải lớn hơn 0 <br/>";
                }

                if ($scope.modelChild.ObjFromValue > $scope.modelChild.ObjToValue) {
                    msg.Error = true;
                    msg.Title = "- " + caption.SCP_CURD_VALIDATE_VALUE_FROM + "<br/>";
                    break;
                }
                break;
        }

        return msg;
    }
    $scope.clearData = function () {
        $scope.modelChild = {
            ServiceCatCode: '',
            ObjectCode: '',
            Unit: '',
            ObjFromValue: '',
            ObjToValue: '',
            Price: '',
            Currency: '',
            Rate: '',
        };
    }
    $scope.clearDataNotServiceCatCode = function () {
        $scope.modelChild.ObjectCode = '';
        $scope.modelChild.ObjFromValue = '';
        $scope.modelChild.ObjToValue = '';
        $scope.modelChild.Price = '';
        $scope.modelChild.Currency = '';
        $scope.modelChild.Rate = 1;
    }
    $scope.setDataServiceDefault = function () {
        $scope.modelChild.Price = 0;
        $scope.modelChild.Currency = '';
        $scope.modelChild.ObjectCode = '';
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
        })
        //    .keyup(function (e) {
        //    if (e.keyCode == 8 || e.keyCode == 46) {
        //        $('#ExpiryDate').datepicker('setStartDate', null);
        //    }
        //});
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
        })
        //    .keyup(function (e) {
        //    if (e.keyCode == 8 || e.keyCode == 46) {
        //        $('#EffectiveDate').datepicker('setEndDate', null);
        //    }
        //});
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
        })
        //    .keyup(function (e) {
        //    if (e.keyCode == 8 || e.keyCode == 46) {
        //        $('#ObjToDate').datepicker('setStartDate', null);
        //    }
        //});
        $("#ObjToDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        })
            .on('changeDate', function (selected) {
                var maxDate = new Date(selected.date.valueOf());
                $('#ObjFromDate').datepicker('setEndDate', maxDate);
                if ($('#ObjToDate').valid()) {
                    $('#ObjToDate').removeClass('invalid').addClass('success');
                }
            })
        //    .keyup(function (e) {
        //    if (e.keyCode == 8 || e.keyCode == 46) {
        //        $('#ObjFromDate').datepicker('setEndDate', null);
        //    }
        //});
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
                        Group: 'SERVICE_UNIT_VALUE',
                        GroupNote: 'Đơn vị giá trị',
                        AssetCode: 'SERVICE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataservice.getServiceUnitValue(function (rs) {
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
                        Group: 'SERVICE_CONDITION',
                        GroupNote: 'Điều kiện ràng buộc',
                        AssetCode: 'SERVICE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataservice.getServiceCondition(function (rs) {
                rs = rs.data;
                $rootScope.listCondition = rs;
            });
        }, function () { });
    }
    $scope.addCommonSettingServiceUnit = function () {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'SERVICE_UNIT',
                        GroupNote: 'Đơn vị dịch vụ',
                        AssetCode: 'SERVICE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataservice.getServiceUnit(function (rs) {
                rs = rs.data;
                $rootScope.listUnit = rs;
            });
        }, function () { });
    }
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter, DTOptionsBuilder, para) {
    $scope.model = {
        HeaderCode: '',
        Title: '',
        sEffectiveDate: '',
        sExpiryDate: '',
        ResponsibleUser: '',
        Note: '',
    };
    $scope.modelChild = {
        ServiceCatCode: '',
        ObjectCode: '',
        Unit: '',
        ObjFromValue: '',
        ObjToValue: '',
        Price: '',
        Currency: '',
        Rate: 1,
    };
    $scope.model = para;
    if (para.ResponsibleUser != '' && para.ResponsibleUser != undefined)
        $scope.model.ResponsibleUser = parseInt(para.ResponsibleUser);
    $scope.model.sEffectiveDate = ($scope.model.EffectiveDate != null ? $filter('date')(new Date($scope.model.EffectiveDate), 'dd/MM/yyyy') : "");
    $scope.model.sExpiryDate = ($scope.model.ExpiryDate != null ? $filter('date')(new Date($scope.model.ExpiryDate), 'dd/MM/yyyy') : "");
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    var vm = $scope;
    $scope.selected = [];
    $scope.listService = [];
    $scope.listResponsibleUser = [];
    $rootScope.listCondition = [];
    $rootScope.listUnit = [];
    $rootScope.listUnitValue = [];
    $scope.listCurrency = [];
    $scope.listStatus = [];
    $scope.isDisableUnit = false;
    $scope.isDisableObjectCode = false;
    $scope.isDisableFromValue = false;
    $scope.isDisableToValue = false;
    $scope.isDisablePrice = false;
    $scope.isDisableRate = false;

    $scope.formText = true;
    $scope.formDateTime = false;
    $scope.formNumber = false;
    $scope.formMoney = false;

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
            url: "/Admin/ServiceCategoryPrice/JTableDetail",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.HeaderCode = $scope.model.HeaderCode;
            },
            complete: function () {

                App.unblockUI("#contentMain");
                heightTableManual(400, "#tblData");
                $scope.$apply();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
        .withOption('order', [1, 'asc'])
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('ServiceCatCode').withTitle('{{"SCP_CURD_COL_SERVICE_CAT_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ServiceName').withTitle('{{"SCP_CURD_COL_SERVICE_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ServiceUnit').withTitle('{{"SCP_CURD_COL_SERVICE_UNIT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ObjectCode').withTitle('{{"SCP_CURD_COL_OBJ_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ObjFromValue').withTitle('{{"SCP_CURD_COL_OBJ_FROM_VALUE" | translate}}').renderWith(function (data, type, full) {
        if (full.Type == "MONEY" || full.ServiceCatCode == "DV_000") {
            return '<span class="text-danger">' + $filter('currency')(data, '', 0) + '</span>';
        } else {
            return data;
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ObjToValue').withTitle('{{"SCP_CURD_COL_OBJ_TO_VALUE" | translate}}').renderWith(function (data, type, full) {
        if (full.Type == "MONEY" || full.ServiceCatCode == "DV_000") {
            return '<span class="text-danger">' + $filter('currency')(data, '', 0) + '</span>';
        } else {
            return data;
        }
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('Rate').withTitle('{{"SCP_CURD_COL_RATE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full, meta) {
        return '<a title=""{{&quot;COM_BTN_EDIT&quot; | translate}}"  ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding-right: 10px" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a>' +
            '<a title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash fs25"></i></a>';

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
        dataservice.getListServiceCategory(function (rs) {
            rs = rs.data;
            $scope.listService = rs.Object;
        });
        dataservice.getServiceUnit(function (rs) {
            rs = rs.data;
            $rootScope.listUnit = rs;
        });
        dataservice.getServiceUnitValue(function (rs) {
            rs = rs.data;
            $rootScope.listUnitValue = rs;
        });
        dataservice.getServiceCondition(function (rs) {
            rs = rs.data;
            $rootScope.listCondition = rs;
        });
        dataservice.getServiceStatus(function (rs) {
            rs = rs.data;
            $scope.listStatus = rs;
        });
        dataservice.getServiceResponsibleUser(function (rs) {
            rs = rs.data;
            $scope.listResponsibleUser = rs;
        });
        dataservice.getListCurrency(function (rs) {
            rs = rs.data;
            $scope.listCurrency = rs;
        });
    }
    $scope.initData();

    $scope.add = function () {
        debugger
        $scope.changeRate();
        if ($scope.model.HeaderCode != '') {
            $scope.modelChild.HeaderCode = $scope.model.HeaderCode;
            if ($scope.modelChild.Price == '' || $scope.modelChild.Price == null)
                $scope.modelChild.Price = 0;
            if ($scope.modelChild.ServiceCatCode != "DV_000" && $scope.modelChild.ObjectCode == "SERVICE_CONDITION_000") {
                $scope.modelChild.Rate = 1;
            }
            if ($scope.modelChild.ServiceCatCode == "DV_000") {
                $scope.setDataServiceDefault();
                var msg = $rootScope.checkNumber($scope.modelChild);
                if (msg.Status) {
                    App.toastrError(msg.Title);
                    return;
                }
            }

            if ($scope.modelChild.ObjectCode == "SERVICE_CONDITION_000" && ($scope.modelChild.Price == 0 && $scope.modelChild.Currency == '')) {
                App.toastrError(caption.SCP_CURD_MSG_INFO);
            } else {
                var check = $scope.checkValidate();
                if (!check.Error) {
                    $scope.modelChild.Priority = $rootScope.priority;
                    dataservice.insertCostCondition($scope.modelChild, function (rs) {
                        rs = rs.data;
                        if (rs.Error == true) {
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
            }
        }
    }
    $scope.edit = function (id) {
        dataservice.getServiceConditonItem(id, function (rs) {
            rs = rs.data;
            $scope.modelChild = rs;
            if (rs.Priority != null) {
                $rootScope.priority = rs.Priority;
            } else {
                $rootScope.priority = 0;
            }

            if (rs.Type == 'NUMBER') {
                $scope.modelChild.ObjFromValue = parseInt($scope.modelChild.ObjFromValue);
                $scope.modelChild.ObjToValue = parseInt($scope.modelChild.ObjToValue);
            }

            $scope.isEdit = true;
            $scope.setData();
        });
    }
    $scope.save = function () {
        $scope.modelChild.HeaderCode = $scope.model.HeaderCode;
        if ($scope.modelChild.Price == '' || $scope.modelChild.Price == null)
            $scope.modelChild.Price = 0;
        if ($scope.modelChild.ServiceCatCode == "DV_000") {
            $scope.setDataServiceDefault();
            var msg = $rootScope.checkNumber($scope.modelChild);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
        }
        if ($scope.modelChild.Rate != '') {
            if ($scope.modelChild.ObjectCode == "SERVICE_CONDITION_000" && ($scope.modelChild.Price == 0 && $scope.modelChild.Currency == '')) {
                App.toastrError(caption.SCP_CURD_MSG_INFO);
            } else {
                var check = $scope.checkValidate();
                if (!check.Error) {
                    $scope.modelChild.Priority = $rootScope.priority;
                    dataservice.updateCostCondition($scope.modelChild, function (rs) {
                        rs = rs.data;
                        if (rs.Error == true) {
                            App.toastrError(rs.Title);
                        }
                        else {
                            App.toastrSuccess(rs.Title);
                            $scope.isEdit = false;
                            $scope.changeRate();
                            //$scope.clearData();
                            reloadData(false);
                        }
                    });
                } else {
                    App.toastrError(check.Title);
                }
            }
        } else {
            App.toastrError(caption.SCP_CURD_MSG_RATE);
        }
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deleteProduct(id, function (rs) {
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
    $scope.submit = function () {
        if ($scope.editform.validate()) {
            dataservice.update($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error == true) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                }
            });
        }
    }

    $scope.close = function () {
        $scope.isEdit = false;
    }
    $scope.changleSelect = function (Type, Item) {
        if (Type == 'ObjectCode') {
            $scope.changeRate();
            if (Item != null) {
                if (Item.Priority != null) {
                    $rootScope.priority = Item.Priority;
                } else {
                    $rootScope.priority = 0;
                }
            } else {
                $rootScope.priority = 0;
            }
            if (Item != null) {
                if (Item.Type != null) {
                    $scope.showFormType(Item.Type);
                } else {
                    $scope.formText = true;
                    $scope.formDateTime = false;
                    $scope.formNumber = false;
                    $scope.formMoney = false;
                }
            }

            if ($scope.modelChild.ObjectCode == "SERVICE_CONDITION_000") {
                $scope.isDisableFromValue = true;
                $scope.isDisableToValue = true;
                $scope.modelChild.Unit = '';
                $scope.isDisableUnit = true;
                $scope.isDisableRate = true;
                $scope.isDisablePrice = false;
                $scope.isDisableCurrency = false;
            } else if ($rootScope.priority == 2 || $rootScope.priority == 3 || $rootScope.priority == 4) {
                $scope.isDisableFromValue = true;
                $scope.isDisableToValue = true;
                $scope.modelChild.Unit = '';
                $scope.isDisableUnit = true;
                $scope.isDisableRate = false;
                $scope.isDisablePrice = true;
                $scope.isDisableCurrency = true;
                $scope.clearDataObjFromTo();
            } else {
                $scope.isDisableFromValue = false;
                $scope.isDisableToValue = false;
                $scope.isDisableUnit = false;
                $scope.isDisableRate = false;
                $scope.isDisablePrice = true;
                $scope.isDisableCurrency = true;
            }
        }
        if (Type == "ServiceCode") {
            dataservice.getUnitByServiceCode($scope.modelChild.ServiceCatCode, function (rs) {
                rs = rs.data;
                if (rs != null)
                    $scope.modelChild.ServiceUnit = rs;
            });
            //$scope.clearDataNotServiceCatCode();
            if ($scope.modelChild.ServiceCatCode == "DV_000") {
                $scope.showFormType("MONEY");
                $scope.isDisableFromValue = false;
                $scope.isDisableToValue = false;
                $scope.isDisableUnit = false;
                $scope.isDisableRate = false;
                $scope.isDisablePrice = true;
                $scope.isDisableCurrency = true;
                $scope.isDisableObjectCode = true;
            } else {
                $scope.isDisableFromValue = true;
                $scope.isDisableToValue = true;
                $scope.modelChild.Unit = '';
                $scope.isDisableUnit = true;
                $scope.isDisableRate = true;
                $scope.isDisablePrice = false;
                $scope.isDisableCurrency = false;
                $scope.isDisableObjectCode = false;

                if ($scope.modelChild.ObjectCode == "SERVICE_CONDITION_000") {
                    $scope.isDisableFromValue = true;
                    $scope.isDisableToValue = true;
                    $scope.modelChild.Unit = '';
                    $scope.isDisableUnit = true;
                    $scope.isDisableRate = true;
                    $scope.isDisablePrice = false;
                    $scope.isDisableCurrency = false;
                } else if ($rootScope.priority == 2 || $rootScope.priority == 3 || $rootScope.priority == 4) {
                    $scope.isDisableFromValue = true;
                    $scope.isDisableToValue = true;
                    $scope.modelChild.Unit = '';
                    $scope.isDisableUnit = true;
                    $scope.isDisableRate = false;
                    $scope.isDisablePrice = true;
                    $scope.isDisableCurrency = true;
                    $scope.clearDataObjFromTo();
                } else {
                    $scope.isDisableFromValue = false;
                    $scope.isDisableToValue = false;
                    $scope.isDisableUnit = false;
                    $scope.isDisableRate = false;
                    $scope.isDisablePrice = true;
                    $scope.isDisableCurrency = true;
                }
            }
        }
    }
    $scope.changeRate = function () {
        dataservice.getServiceDefault($scope.model.HeaderCode, $scope.modelChild.ServiceCatCode, function (rs) {
            rs = rs.data;
            if (rs.length > 0) {
                $scope.modelChild.Price = $scope.modelChild.Rate * rs[0].Price;
                $scope.modelChild.Currency = rs[0].Currency;
            }
        });
    }
    $scope.setData = function () {
        if ($scope.modelChild.Type != '' && $scope.modelChild.Type != null)
            $scope.showFormType($scope.modelChild.Type);
        if ($scope.modelChild.ServiceCatCode == "DV_000") {
            $scope.changleSelect("ServiceCode", null);
        } else if ($scope.modelChild.ObjectCode == "SERVICE_CONDITION_000") {
            $scope.changleSelect("ObjectCode", null);
        } else if ($rootScope.priority == 2 || $rootScope.priority == 3 || $rootScope.priority == 4) {
            $scope.isDisableFromValue = true;
            $scope.isDisableToValue = true;
            $scope.modelChild.Unit = '';
            $scope.isDisableUnit = true;
            $scope.isDisableRate = false;
            $scope.isDisablePrice = true;
            $scope.isDisableCurrency = true;
        } else {
            $scope.isDisableFromValue = false;
            $scope.isDisableToValue = false;
            $scope.isDisableUnit = false;
            $scope.isDisableRate = false;
            $scope.isDisablePrice = true;
            $scope.isDisableCurrency = true;
        }
    }
    $scope.showFormType = function (Type) {
        switch (Type) {
            case "NUMBER":
                $scope.formText = false;
                $scope.formDateTime = false;
                $scope.formNumber = true;
                $scope.formMoney = false;
                break;
            case "DATETIME":
                $scope.formText = false;
                $scope.formDateTime = true;
                $scope.formNumber = false;
                $scope.formMoney = false;
                setTimeout(function () {
                    loadDate();
                }, 200);
                break;
            case "MONEY":
                $scope.formText = false;
                $scope.formDateTime = false;
                $scope.formNumber = false;
                $scope.formMoney = true;
                break;
            default:
                $scope.formText = true;
                $scope.formDateTime = false;
                $scope.formNumber = false;
                break;
        }

        $rootScope.Type = Type;
    }
    $scope.checkValidate = function () {
        var msg = {
            Error: false,
            Title: ""
        }
        if (!$scope.isDisableUnit) {
            if ($scope.modelChild.Unit == null || $scope.modelChild.Unit == '' || $scope.modelChild.Unit == undefined) {
                msg.Error = true;
                msg.Title = caption.SCP_CURD_VALIDATE_UNIT;
                return msg;
            }
        }

        if ($scope.modelChild.Price <= 0 && $scope.modelChild.ServiceCatCode != "DV_000" && !$scope.isDisablePrice) {
            msg.Error = true;
            msg.Title += "- Giá phải lớn hơn 0 <br/>";
        }

        if ($scope.modelChild.Rate <= 0) {
            msg.Error = true;
            msg.Title += "- Tỉ lệ phải lớn hơn 0 <br/>";
        }

        var Type = $rootScope.Type;
        switch (Type) {
            case "NUMBER":
                if ($scope.modelChild.ObjFromValue <= 0 && !$scope.isDisableFromValue) {
                    msg.Error = true;
                    msg.Title += "- Giá trị từ phải lớn hơn 0 <br/>";
                }
                if ($scope.modelChild.ObjToValue <= 0 && !$scope.isDisableToValue) {
                    msg.Error = true;
                    msg.Title += "- Giá trị đến phải lớn hơn 0 <br/>";
                }

                if ($scope.modelChild.ObjFromValue > $scope.modelChild.ObjToValue) {
                    msg.Error = true;
                    msg.Title += "- " + caption.SCP_CURD_VALIDATE_VALUE_FROM + "<br/>";
                    break;
                }
                break;
            case "MONEY":
                if ($scope.modelChild.ObjFromValue <= 0 && !$scope.isDisableFromValue) {
                    msg.Error = true;
                    msg.Title += "- Giá trị từ phải lớn hơn 0 <br/>";
                }
                if ($scope.modelChild.ObjToValue <= 0 && !$scope.isDisableToValue) {
                    msg.Error = true;
                    msg.Title += "- Giá trị đến phải lớn hơn 0 <br/>";
                }

                if ($scope.modelChild.ObjFromValue > $scope.modelChild.ObjToValue) {
                    msg.Error = true;
                    msg.Title = "- " + caption.SCP_CURD_VALIDATE_VALUE_FROM + "<br/>";
                    break;
                }
                break;
        }

        return msg;
    }
    $scope.clearData = function () {
        $scope.modelChild = {
            ServiceCatCode: '',
            ObjectCode: '',
            Unit: '',
            ObjFromValue: '',
            ObjToValue: '',
            Price: '',
            Currency: '',
            Rate: '',
        };
    }
    $scope.clearDataNotServiceCatCode = function () {
        $scope.modelChild.ObjectCode = '';
        $scope.modelChild.ObjFromValue = '';
        $scope.modelChild.ObjToValue = '';
        $scope.modelChild.Price = '';
        $scope.modelChild.Currency = '';
        $scope.modelChild.Rate = 1;
    }
    $scope.clearDataObjFromTo = function () {
        $scope.modelChild.ObjFromValue = '';
        $scope.modelChild.ObjToValue = '';
    }
    $scope.setDataServiceDefault = function () {
        $scope.modelChild.Price = 0;
        $scope.modelChild.Currency = '';
        $scope.modelChild.ObjectCode = '';
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
        });
        //    .keyup(function (e) {
        //    if (e.keyCode == 8 || e.keyCode == 46) {
        //        $('#ExpiryDate').datepicker('setStartDate', null);
        //    }
        //});
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
        })
            .keyup(function (e) {
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
        })
            .keyup(function (e) {
                if (e.keyCode == 8 || e.keyCode == 46) {
                    $('#ObjFromDate').datepicker('setEndDate', null);
                }
            });
        $('#ExpiryDate').datepicker('setStartDate', new Date($scope.model.EffectiveDate));
        $('#EffectiveDate').datepicker('setEndDate', new Date($scope.model.ExpiryDate));
    }
    setTimeout(function () {
        loadDate();
    }, 500);
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
                        Group: 'SERVICE_UNIT_VALUE',
                        GroupNote: 'Đơn vị giá trị',
                        AssetCode: 'SERVICE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataservice.getServiceUnitValue(function (rs) {
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
                        Group: 'SERVICE_CONDITION',
                        GroupNote: 'Điều kiện ràng buộc',
                        AssetCode: 'SERVICE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataservice.getServiceCondition(function (rs) {
                rs = rs.data;
                $rootScope.listCondition = rs;
            });
        }, function () { });
    }

    $scope.addCommonSettingServiceUnit = function () {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'SERVICE_UNIT',
                        GroupNote: 'Đơn vị dịch vụ',
                        AssetCode: 'SERVICE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataservice.getServiceUnit(function (rs) {
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
            App.toastrError("Vui lòng nhập giá trị cài đặt nhỏ hơn 255 ký tự");
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
            App.toastrError("Vui lòng nhập giá trị cài đặt nhỏ hơn 255 ký tự");
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