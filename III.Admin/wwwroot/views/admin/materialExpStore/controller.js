var ctxfolderExp = "/views/admin/materialExpStore";
var ctxfolderMessage = "/views/message-box";
var ctxfolderQrCode = "/views/admin/edmsQRCodeManager";

var app = angular.module('App_ESEIM_EXPORTSTORE', ['App_ESEIM_DASHBOARD', 'App_ESEIM_MATERIAL_PROD', 'App_ESEIM', "App_ESEIM_CUSTOMER", "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber', 'ng.jsoneditor', 'monospaced.qrcode']);

app.service('myService', function () {
    var data;
    this.setData = function (d) {
        data = d;
    }
    this.getData = function () {
        return data;
    }
});

app.factory('dataserviceExp', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        getUnit: function (data, callback) {
            $http.get('/Admin/MaterialExpStore/GetUnit?impCode=' + data).then(callback);
        },
        getStore: function (callback) {
            $http.post('/Admin/MaterialExpStore/GetStore').then(callback);
        },
        getUser: function (callback) {
            $http.post('/Admin/MaterialExpStore/GetUser').then(callback);
        },
        getSupplier: function (callback) {
            $http.post('/Admin/MaterialExpStore/Getsupplier').then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/GetItem', data).then(callback);
        },
        getListProductGrid: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/GetListProductGrid', data).then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/Insert', data, {
                beforeSend: function () {
                    App.blockUI({
                        target: ".modal-content",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI(".modal-content");
                }
            }).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/Update', data, {
                beforeSend: function () {
                    App.blockUI({
                        target: ".modal-content",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI(".modal-content");
                }
            }).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/Delete', data).then(callback);
        },
        insertDetailProductCoid: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/InsertDetailProductCoid', data, {
                beforeSend: function () {
                    App.blockUI({
                        target: ".modal-content",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI(".modal-content");
                }
            }).then(callback);
        },
        deleteDetailProductCoid: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/DeleteDetailProductCoid', data).then(callback);
        },
        insertDetailProductOdd: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/InsertDetailProductOdd', data, {
                beforeSend: function () {
                    App.blockUI({
                        target: ".modal-content",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI(".modal-content");
                }
            }).then(callback);
        },
        deleteDetailProductOdd: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/DeleteDetailProductOdd', data).then(callback);
        },
        getListLotProduct: function (callback) {
            $http.post('/Admin/MaterialExpStore/GetListLotProduct').then(callback);
        },
        getListLotProduct4Update: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/GetListLotProduct4Update?lotProductCode=' + data).then(callback);
        },
        getListStore: function (callback) {
            $http.post('/Admin/MaterialExpStore/GetListStore').then(callback);
        },
        getListContract: function (callback) {
            $http.post('/Admin/MaterialExpStore/GetListContract').then(callback);
        },
        getListCustomer: function (callback) {
            $http.post('/Admin/MaterialExpStore/GetListCustomer').then(callback);
        },
        getCustomer: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/GetCustomer?contractCode=' + data).then(callback);
        },
        getListUserExport: function (callback) {
            $http.post('/Admin/MaterialExpStore/GetListUserExport').then(callback);
        },
        getListReason: function (callback) {
            $http.post('/Admin/MaterialExpStore/GetListReason').then(callback);
        },
        getListCurrency: function (callback) {
            $http.post('/Admin/MaterialExpStore/GetListCurrency').then(callback);
        },
        getListProduct: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/GetListProduct?storeCode=' + data).then(callback);
        },
        getListProductCode: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/GetListProductCode?storeCode=' + data).then(callback);
        },
        //Vatco
        getListProductCodeVatco: function (data, data1, callback) {
            $http.post('/Admin/MaterialExpStore/GetListProductCodeVatco?storeCode=' + data + '&lotCode=' + data1).then(callback);
        },
        getListProduct4QrCode: function (data1, data2, data3, callback) {
            $http.post('/Admin/MaterialExpStore/GetListProduct4QrCode?storeCode=' + data1 + '&productCode=' + data2 + '&productType=' + data3).then(callback);
        },
        getListGridProduct: function (data1, data2, data3, callback) {
            $http.post('/Admin/MaterialExpStore/GetListGridProduct?ticketExpCode=' + data1 + '&productCode=' + data2 + '&productType=' + data3).then(callback);
        },
        getListCoilByProdQrCode: function (data1, data2, data3, data4, callback) {
            $http.post('/Admin/MaterialExpStore/GetListCoilByProdQrCode?storeCode=' + data1 + '&productCode=' + data2 + '&productType=' + data3 + '&productQrCode=' + data4).then(callback);
        },
        getListLotByProdQrCode: function (data1, data2, data3, data4, callback) {
            $http.post('/Admin/MaterialExpStore/GetListLotByProdQrCode?storeCode=' + data1 + '&productCode=' + data2 + '&productType=' + data3 + '&productQrCode=' + data4).then(callback);
        },
        getListRackCode: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/GetListRackCode?productQrCode=' + data).then(callback);
        },
        getListUnit: function (callback) {
            $http.post('/Admin/MaterialExpStore/GetListUnit').then(callback);
        },
        getListPaymentStatus: function (callback) {
            $http.post('/Admin/MaterialExpStore/GetListPaymentStatus').then(callback);
        },
        getLotProduct: function (data, data1, callback) {
            $http.post('/Admin/MaterialExpStore/GetLotProduct/?lotProductCode=' + data + '&storeCode=' + data1).then(callback);
        },
        getLotProduct4Update: function (data, data1, data2, callback) {
            $http.post('/Admin/MaterialExpStore/GetLotProduct4Update/?lotProductCode=' + data + '&&storeCode=' + data1 + '&&ticketCode=' + data2).then(callback);
        },
        //Tạo mã ticket code
        createTicketCode: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/CreateTicketCode?type=' + data).then(callback);
        },

        //tạo mã QR_Code
        generatorQRCode: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/GeneratorQRCode?code=' + data).then(callback);
        },
        getUpdateLog: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/GetUpdateLog?ticketCode=' + data).then(callback);
        },
        getPositionProduct: function (productQrCode, productCoil, callback) {
            $http.get('/Admin/MaterialExpStore/GetPositionProduct?productQrCode=' + productQrCode + '&&productCoil=' + productCoil, callback).then(callback);
        },
        getPositionProductCode: function (productCode, productLot, storeCode, callback) {
            $http.get('/Admin/MaterialExpStore/GetPositionProduct?productCode=' + productCode + '&&productLot=' + productLot + '&&storeCode=' + storeCode, callback).then(callback);
        },
        getListProductLot: function (data, data1, callback) {
            $http.post('/Admin/MaterialExpStore/GetListProductLot?productCode=' + data + '&&storeCode=' + data1).then(callback);
        },

        //Insert product detail delivery
        insertDetailProductOddVatco: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/InsertDetailProductOddVatco', data).then(callback);
        },
        getInfoProduct: function (data, callback) {
            $http.get('/Admin/MaterialImpStore/GetInfoProduct?product=' + data).then(callback);
        },
        getCurrency: function (callback) {
            $http.post('/Admin/CardJob/GetCurrency').then(callback);
        },
        getLstProdDetailVatco: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/GetLstProdDetailVatco?ticketCode=' + data).then(callback);
        },
        unitFromPack: function (data, data1, data2, callback) {
            $http.get('/Admin/MaterialExpStore/UnitFromPack?json=' + data + '&unit=' + data1 + '&prodQrCode=' + data2).then(callback);
        },
        calQuantityByUnit: function (pack, quantity, unit, srcUnit, callback) {
            $http.get('/Admin/MaterialExpStore/CalQuantityByUnit?pack=' + pack + '&quantity=' + quantity + '&unit=' + unit + '&srcUnit=' + srcUnit).then(callback);
        },
        getListDetailDelivery: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/GetListDetailDelivery?ticketCode=' + data).then(callback);
        },
        delDeliveryDetail: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/DelDeliveryDetail?id=' + data).then(callback);
        },
        cleanUpMapStock: function (data, data1, data2, data3, data4, callback) {
            $http.post('/Admin/MaterialExpStore/CleanUpMapStock?mappId=' + data + '&prodCode=' + data1 + '&store=' + data2 + '&lot=' + data3 + '&productCode=' + data4).then(callback);
        },

        //Workfow
        getListRepeat: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/GetListRepeat?code=' + data).then(callback);
        },
        getWorkFlow: function (callback) {
            $http.post('/Admin/PayDecision/GetWorkFlow').then(callback);
        },
        getStatusAct: function (callback) {
            $http.post('/Admin/PayDecision/GetStatusAct').then(callback);
        },
        createWfInstance: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/CreateWfInstance', data).then(callback)
        },
        insertInstRunning: function (data, data1, callback) {
            $http.post('/Admin/WorkflowActivity/InsertInstRunning?wfInstCode=' + data + '&wfCode=' + data1).then(callback);
        },
        getItemHeaderWithCode: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/GetItemHeaderWithCode?code=' + data).then(callback);
        },
        getActionStatus: function (data, callback) {
            $http.get('/Admin/MaterialExpStore/GetActionStatus?code=' + data).then(callback);
        },
        getItemHeader: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/GetItemHeader?id=' + data).then(callback);
        },
        getListRepeat: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/GetListRepeat?code=' + data).then(callback);
        },
        getStepWorkFlow: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/GetStepWorkFlow?code=' + data).then(callback);
        },
        updateStatusWF: function (data, data1, data2, data3, callback) {
            $http.post('/Admin/WorkflowActivity/UpdateStatusWF?objType=' + data + '&objCode=' + data1 + '&status=' + data2 + '&actRepeat=' + data3).then(callback);
        },

        //Print
        getInfoUserImport: function (data, callback) {
            $http.post('/Admin/MaterialImpStore/GetInfoUserImport?userName=' + data).then(callback);
        },

        getLogStatus: function (data, callback) {
            $http.post('/Admin/MaterialExpStore/GetLogStatus?code=' + data).then(callback);
        },
        checkPermissionEditActivityById: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/CheckPermissionEditActivityById?id=' + data).then(callback);
        },
        getItemActInst: function (data, callback) {
            $http.get('/Admin/WorkflowActivity/GetItemActInst?id=' + data).then(callback)
        },
        suggestWF: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/SuggestWF?type=' + data).then(callback);
        },
        //New Mapping
        getListWareHouse: function (callback) {
            $http.get('/Admin/EDMSDiagramWarehouse/GetListMappingType?type=AREA').then(callback);
        },
        getListMapping: function (data, callback) {
            $http.get('/Admin/EDMSDiagramWarehouse/GetListMappingFilter?start=' + data).then(callback);
        },
    }
});

app.controller('Ctrl_ESEIM_EXPORTSTORE', function ($scope, $rootScope, $compile, $uibModal, $cookies, $translate, dataserviceExp) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    $rootScope.permissionMaterialExpStore = PERMISSION_MaterialExpStore;
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

        return mess;
    }
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
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
                    required: caption.MES_VALIDATE_TITLE,
                    maxlength: "Tiêu đề vượt quá 255 ký tự"
                },
                TimeTicketCreate: {
                    required: caption.MES_MSG_ENTER_CREATED_TIME
                },
                Note: {
                    maxlength: caption.MES_CURD_VALIDATE_EXPSTORE_NOTE
                }
            }
        };
    });
    $rootScope.ExpCode = '';

    $rootScope.jsonSpecification = function (str) {
        var A = {
            Key: '',
            Value: ''
        };
        var B = {
            Key: '',
            Value: ''
        };
        var C = {
            Key: '',
            Value: ''
        };
        var D = {
            Key: '',
            Value: ''
        };

        if (str !== undefined && str !== null && str !== '') {
            debugger
            var arr = str.split('x');

            for (var i = 0; i < arr.length; i++) {
                arr[i] = arr[i].trim();
            }

            if (arr[0].split(' ')[0] !== undefined && arr[0].split(' ')[0] !== null)
                //A.Key = arr[0].split(' ')[0];
                A.Key = arr[0];

            if (arr.length >= 2)
                if (arr[1].split(' ')[1] !== undefined && arr[1].split(' ')[1] !== null) {
                    var arrB = arr[1].split(' ');
                    var key = "";
                    for (var i = 1; i < arrB.length; i++) {
                        if (key == "") {
                            key = arrB[i];
                        }
                        else {
                            key += " " + arrB[i];
                        }
                    }

                    B.Key = key;
                    B.Value = arr[1].split(' ')[0];
                }
            if (arr.length >= 3)
                if (arr[2].split(' ')[1] !== undefined && arr[2].split(' ')[1] !== null) {

                    var arrC = arr[2].split(' ');
                    var key = "";
                    for (var i = 1; i < arrC.length; i++) {
                        if (key == "") {
                            key = arrC[i];
                        }
                        else {
                            key += " " + arrC[i];
                        }
                    }

                    C.Key = key;
                    C.Value = arr[2].split(' ')[0];
                }
            if (arr.length >= 4)
                if (arr[3].split(' ')[1] !== undefined && arr[3].split(' ')[1] !== null) {
                    var arrD = arr[3].split(' ');
                    var key = "";
                    for (var i = 1; i < arrD.length; i++) {
                        if (key == "") {
                            key = arrD[i];
                        }
                        else {
                            key += " " + arrD[i];
                        }
                    }

                    D.Key = key;
                    D.Value = arr[3].split(' ')[0];
                }
        }

        var obj = {
            A: A,
            B: B,
            C: C,
            D: D
        };

        return obj;
    }
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {

    $translateProvider.useUrlLoader('/Admin/MaterialExpStore/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderExp + '/index.html',
            controller: 'index'
        })
        .when('/add', {
            templateUrl: ctxfolderExp + '/add.html',
            controller: 'add'
        })
        .when('/edit', {
            templateUrl: ctxfolderExp + '/edit.html',
            controller: 'edit'
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

app.controller('index', function ($scope, $rootScope, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceExp, $filter, $window, myService, $location) {
    var vm = $scope;
    $scope.model = {
        Title: '',
        CusCode: '',
        StoreCode: '',
        UserExport: '',
        FromDate: '',
        ToDate: '',
        Reason: '',
    };

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: $rootScope.permissionMaterialExpStore.LIST,
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
                d.Title = $scope.model.Title;
                d.CusCode = $scope.model.CusCode;
                d.StoreCode = $scope.model.StoreCode;
                d.UserExport = $scope.model.UserExport;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
                d.Reason = $scope.model.Reason;
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
                        $('#tblData').DataTable().$('tr.selected').removeClass('selected');
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
            if ($rootScope.permissionMaterialExpStore.Update) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withOption('sClass', 'hidden').withTitle('Id').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('QrTicketCode').withTitle('{{"MES_LIST_COL_QR" | translate}}').renderWith(function (data, type, full, meta) {
        return '<qrcode role="button" ng-click="viewQrCode(\'' + full.TicketCode + '\')" data=' + full.TicketCode + ' size="35"></qrcode>'
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('TicketCode').withTitle('{{"MES_LIST_COL_ESTORE_CODE" | translate}}').renderWith(function (data, type, full, meta) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"MES_LIST_COL_TITLE" | translate }}').renderWith(function (data) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('CusName').withTitle('{{"Khách hàng" | translate }}').renderWith(function (data) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StoreName').withTitle('{{"MES_LIST_COL_ESTORE_NAME" | translate }}').renderWith(function (data) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UserExportName').withTitle('{{"MES_LIST_COL_PEOPLE_EXPORT" | translate }}').renderWith(function (data) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ReasonName').withTitle('{{"MES_LIST_COL_REASON" | translate }}').renderWith(function (data) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('CostTotal').withTitle('{{"MES_LIST_COL_ESTORE_TOTAL_MONEY" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('currency')(data, '', 2) : null;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('CurrencyName').withTitle('{{"Tiền tệ" | translate }}').renderWith(function (data) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Discount').withTitle('{{"Chiết khấu" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('currency')(data, '', 2) : null;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Commission').withTitle('{{"Hoa hồng" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('currency')(data, '', 2) : null;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('TaxTotal').withTitle('{{"Thuế" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('currency')(data, '', 2) : null;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('TotalMustPayment').withTitle('{{"Tổng phải thu" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('currency')(data, '', 2) : null;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('TotalPayed').withTitle('{{"Tổng đã thu" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('currency')(data, '', 2) : null;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('NextTimePayment').withTitle('{{"Ngày thu tiếp" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TimeTicketCreate').withTitle('{{"MES_LIST_COL_CREATED_TIME" | translate }}').renderWith(function (data) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"MES_LIST_COL_NOTE" | translate }}').renderWith(function (data) {
        return data;
    }));

    //vm.dtColumns.push(DTColumnBuilder.newColumn('Debt').withTitle('{{"MES_LIST_COL_ESTORE_DEBT" | translate }}').renderWith(function (data, type, full) {
    //    var result = "";
    //    if (data == "") {
    //        result = caption.COM_MSG_NO_CONFIRM;
    //    } else if (data == "True") {
    //        result = (full.Total - full.TotalPayed);
    //        result = result != "" ? $filter('currency')(result, '', 0) : null
    //    } else if (data == "False") {
    //        result = caption.COM_MSG_NO_CONFIRM;
    //    }
    //    return result;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'w50 nowrap').withTitle('{{"MES_LIST_COL_ESTORE_ACTION" | translate }}').renderWith(function (data, type, full) {
        var listButton = '';
        if ($rootScope.permissionMaterialExpStore.Update) {
            listButton += '<a ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding-right: 5px;" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a>';
        }
        if ($rootScope.permissionMaterialExpStore.Delete) {
            listButton += '<a title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px; class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash  fs25"></i></a>';
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
    function resetCheckbox() {
        $scope.selected = [];
        vm.selectAll = false;
    }

    $scope.search = function () {
        reloadData(true);
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $rootScope.reloadRoot = function () {
        $scope.reload();
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
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


    $scope.initLoad = function () {
        //dataserviceExp.getListLotProduct(function (rs) {rs=rs.data;
        //    $scope.listLotProduct = rs;
        //});
        //dataserviceExp.getListUnit(function (rs) {rs=rs.data;
        //    $scope.listUnit = rs;
        //});
        dataserviceExp.getListWareHouse(function (rs) {
            rs = rs.data;
            $scope.listStore = rs;
            $scope.listStoreReceipt = rs;
            $rootScope.MapStores = {};
            for (var i = 0; i < rs.length; ++i) {
                $rootScope.MapStores[rs[i].Code] = rs[i];
            }
        });
        dataserviceExp.getListCustomer(function (rs) {
            rs = rs.data;
            $scope.listCustomer = rs;
        });
        dataserviceExp.getListUserExport(function (rs) {
            rs = rs.data;
            $scope.listUserExport = rs;
        });
        dataserviceExp.getListReason(function (rs) {
            rs = rs.data;
            $scope.listReason = rs;
        });
        //dataserviceExp.getListReason(function (rs) {rs=rs.data;
        //    $scope.listReason = rs;
        //});
        //dataserviceExp.getListCurrency(function (rs) {rs=rs.data;
        //    $scope.listCurrency = rs;
        //});
        //dataserviceExp.getListPaymentStatus(function (rs) {rs=rs.data;
        //    $scope.listPaymentStatus = rs;
        //});
    }
    $scope.initLoad();


    //$scope.add = function () {
    //    var modalInstance = $uibModal.open({
    //        animation: true,
    //        templateUrl: ctxfolderExp + '/add.html',
    //        controller: 'add',
    //        backdrop: 'static',
    //        size: '65',
    //        resolve: {
    //            para: function () {
    //                return '';
    //            }
    //        }
    //    });
    //    modalInstance.result.then(function (d) {
    //        $scope.reload();
    //    }, function () {
    //    });
    //}
    //$scope.edit = function (id) {
    //    var modalInstance = $uibModal.open({
    //        animation: true,
    //        templateUrl: ctxfolderExp + '/edit.html',
    //        controller: 'edit',
    //        backdrop: 'static',
    //        size: '65',
    //        resolve: {
    //            para: function () {
    //                return id;
    //            }
    //        }
    //    });
    //    modalInstance.result.then(function (d) {
    //        $scope.reloadNoResetPage();
    //    }, function () { });
    //};

    $scope.add = function () {
        $location.path('/add');
    }

    $scope.edit = function (id) {
        myService.setData(data = id);
        $location.path('/edit');
    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceExp.delete(id, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                            $uibModalInstance.close();
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
    $scope.viewQrCode = function (code) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderQrCode + '/qrViewer.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
                $scope.qrcodeString = code;
                setTimeout(function () {
                    setModalDraggable('.modal-dialog');
                }, 200);
            },
            backdrop: 'static',
            size: '25',
        });
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
    }, 200);
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $confirm, DTOptionsBuilder, DTColumnBuilder, DTInstances, $filter, dataserviceExp, dataserviceMaterial, $window) {
    $scope.isNotSave = true;
    //Khởi tạo
    $scope.modelShow = {
        ProductQrCode: ''
    };
    $scope.modelList = {
        ProductCode: '',
        ProductType: '',
        ProductQrCode: '',
        Unit: '',
        SalePrice: '',
        QuantityExp: ''
    };

    $scope.modelWf = {
        WorkflowCode: "",
        ObjectType: "EXPORT_STORE",
        ObjectInst: "",
    };
    $scope.listLotProductBackup = [];
    $scope.model = {};
    $scope.model.Title = '';
    $scope.model.TimeTicketCreate = $filter('date')(new Date(), 'dd/MM/yyyy');
    $scope.model.StoreCode = '';
    $scope.model.CusCode = '';
    $scope.model.Reason = 'EXP_TO_SALE';
    $scope.model.StoreCodeReceipt = '';
    $scope.model.UserExport = '';
    $scope.model.Note = '';
    $scope.model.UserReceipt = '';
    $scope.model.InsurantTime = '';
    $scope.IsEnabledExportLot = false;
    $rootScope.IsEnabledExportLot = false;
    $scope.modelDisable = true;
    $scope.maxQuantity = 0;
    $scope.maxQuantityExport = 0;
    $scope.disableChoiseProduct = true;

    $scope.init = function () {
        $scope.model.LotProductCode = '';
        $scope.model.TicketCode = '';
        $scope.model.ListProduct = [];
        $scope.model.ListPoProduct = [];
        $scope.errorLotProductCode = false;
        var type = "ODD";
        if ($rootScope.IsEnabledExpLot) {
            type = "PO";
        } else {
            $scope.model.LotProductCode = '';
        };
        dataserviceExp.createTicketCode(type, function (rs) {
            rs = rs.data;
            $scope.model.TicketCode = rs.Object;
        });

        dataserviceExp.suggestWF($scope.modelWf.ObjectType, function (rs) {
            rs = rs.data;
            $scope.model.WorkflowCat = rs;
            setTimeout(function () {
                $rootScope.loadDiagramWF($scope.model.WorkflowCat);
            }, 400)
        })
    }
    $scope.init();

    $scope.initLoad = function () {
        dataserviceExp.getListLotProduct(function (rs) {
            rs = rs.data;
            // bỏ dòng $scope.listLotProduct = rs; để fix bug #1005
            //$scope.listLotProduct = rs;
            $scope.listLotProductBackup = rs;
        });
        dataserviceExp.getListUnit(function (rs) {
            rs = rs.data;
            $scope.listUnit = rs;
        });
        dataserviceExp.getListWareHouse(function (rs) {
            rs = rs.data;
            $scope.listStore = rs;
            $scope.listStoreReceipt = rs;
            $rootScope.MapStores = {};
            for (var i = 0; i < rs.length; ++i) {
                $rootScope.MapStores[rs[i].Code] = rs[i];
            }
        });
        dataserviceExp.getListContract(function (rs) {
            rs = rs.data;
            $scope.listContract = rs;
        });
        dataserviceExp.getListCustomer(function (rs) {
            rs = rs.data;
            $scope.listCustomer = rs;
        });
        dataserviceExp.getListUserExport(function (rs) {
            rs = rs.data;
            $scope.listUserExport = rs;
        });
        dataserviceExp.getListReason(function (rs) {
            rs = rs.data;
            $scope.listReason = rs;
        });
        dataserviceExp.getListPaymentStatus(function (rs) {
            rs = rs.data;
            $scope.listPaymentStatus = rs;
        });
        dataserviceExp.getWorkFlow(function (result) {
            result = result.data;
            $rootScope.lstWorkflow = result;
        });
        dataserviceExp.getStatusAct(function (rs) {
            rs = rs.data;
            $scope.lstStatus = rs;
        })

        dataserviceExp.getCurrency(function (rs) {
            rs = rs.data;
            $scope.listCurrentcy = rs;
            if ($scope.listCurrentcy.length > 0) {
                $scope.modelList.Currency = $scope.listCurrentcy[0].Code;
            }
        })
    }
    $scope.initLoad();

    $scope.changeWorkFlowInts = function (a) {
        if ($scope.model.WorkflowCat == null || $scope.model.WorkflowCat == '' || $scope.model.WorkflowCat == undefined) {
            $scope.errorWorkflowCat = true;
        } else {
            $scope.errorWorkflowCat = false;
        }

        dataserviceExp.getStepWorkFlow(a, function (rs) {
            data = rs.data;
            $scope.lstStep = data.list;
            setTimeout(function () {
                $('#progressbar li').css('width', 'calc(100%/' + data.list.length + ')');
            }, 10);
        })
    }
    $scope.changeStatus = function () {
        if ($scope.model.Status == null || $scope.model.Status == '' || $scope.model.Status == undefined) {
            $scope.errorStatus = true;
        } else {
            $scope.errorStatus = false;
        }

        if ($scope.model.Status == "REPEAT_REQUIRE_REWORK" || $scope.model.Status == "FINAL_REQUIRE_REWORK") {
            dataserviceExp.getListRepeat($scope.model.TicketCode, function (rs) {
                rs = rs.data;
                var arr = [];
                if (rs.list != undefined && rs.list != null && rs.list != "") {
                    for (var i = 0; i < rs.list.length; i++) {
                        if (rs.list[i].IntsCode == rs.current) {
                            for (var j = 0; j < i; j++) {
                                arr.push(rs.list[j]);
                            }
                        }
                    }
                    $scope.lstActRepeat = arr;
                    $scope.showAct = true;
                }
            })
        }
        else {
            $scope.showAct = false;
        }
    }

    $scope.reloadGridDetail = function () {
        dataserviceExp.getListProductGrid($rootScope.rootId, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model.ListProduct = rs.Object.ListProduct;
            }
        });
    }

    $rootScope.refeshData = function (id) {
        dataserviceExp.getItem(id, function (rs) {
            rs = rs.data;

            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model = rs.Object.Header;
                $scope.model.ListPoProduct = rs.Object.ListPoProduct;

                dataserviceExp.getListProductGrid($rootScope.rootId, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        $scope.model.ListProduct = rs.Object.ListProduct;
                    }
                });

                if ($scope.model.LotProductCode != '') {
                    $scope.IsEnabledExportLot = true;
                    $rootScope.IsEnabledExportLot = true;

                    dataserviceExp.getListLotProduct4Update($scope.model.LotProductCode, function (rs) {
                        rs = rs.data;
                        $scope.listLotProduct = rs;
                    });
                }
                else {
                    //Không theo lô thì không cần lấy danh sách lô
                    //dataserviceExp.getListLotProduct(function (rs) {rs=rs.data;
                    //    $scope.listLotProduct = rs;
                    //});
                }

                dataserviceExp.getListProductCode($scope.model.StoreCode, function (rs) {
                    rs = rs.data;
                    $scope.listProduct = rs;
                });
            }
        });
    }
    //Load init date
    function loadPoper() {
        $('[data-toggle="popover"]').popover()
    }
    function loadDate() {
        $("#InsurantTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $("#TimeTicketCreate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        var today = new Date(new Date());
        $('#InsurantTime').datepicker('setStartDate', today);

        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }
    setTimeout(function () {
        loadDate();
        loadPoper();
    }, 200);
    //Hết khởi tạo

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
        $rootScope.reloadRoot();
    };

    //Hàm lựa chọn/bỏ lựa chọn nhập theo lô
    $scope.checkedExportLot = function (chk) {
        $rootScope.IsEnabledExportLot = chk;
        $scope.errorLotProductCode = false;

        //thêm dòng để fix bug #1005
        if (!chk) {
            $scope.listLotProduct = [];
            $scope.model.LotProductCode = null;
        }
        else {
            $scope.listLotProduct = $scope.listLotProductBackup;
        }

        var type = "ODD";
        if ($rootScope.IsEnabledExportLot) {
            type = "PO";
        } else {
            $scope.model.LotProductCode = '';
            $scope.model.ListProduct = [];
        };

        dataserviceExp.createTicketCode(type, function (rs) {
            rs = rs.data;
            $scope.model.TicketCode = rs.Object;
        });
    };

    //The function of adding products to the Vatco warehousing

    $scope.addVatCo = function () {
        if ($scope.isNotSave) {
            App.toastrError(caption.MES_MSG_PLS_ADD_EXP_STORE);
            return;
        }
        validationSelectProd($scope.modelList);

        if (!validationSelectProd($scope.modelList).Status) {
            var data = {
                TicketCode: $scope.model.TicketCode,
                ProductCode: $scope.modelList.ProductCode,
                ProductType: $scope.modelList.ProductType,
                ProductQrCode: $scope.modelList.ProductQrCode,
                sProductQrCode: $scope.modelList.sProductQrCode,
                Quantity: $scope.modelList.QuantityExp,
                Unit: $scope.modelList.Unit,
                SalePrice: $scope.modelList.SalePrice,
                Currency: $scope.modelList.Currency,
                WHS_Code: $scope.model.StoreCode,
                MapId: $scope.modelList.MapId,
                MarkWholeProduct: $scope.modelList.MarkWholeProduct,
                MaxQuantity: $scope.maxQuantityExport,
                JsonPack: JSON.stringify($rootScope.jsonSpecification($scope.packing)),
                SrcUnit: $scope.srcUnit,
                IsCustomized: $scope.modelList.IsCustomized,
                ProdCustomJson: $scope.modelList.ProdCustomJson
            };

            if ($scope.quantityByUnit < $scope.modelList.QuantityExp) {
                App.toastrError(caption.MES_MSG_OUT_RANGE_QUANTITY);
                return;
            }
            dataserviceExp.insertDetailProductOddVatco(data, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    dataserviceExp.getListDetailDelivery($scope.model.TicketCode, function (rs) {
                        rs = rs.data;
                        $scope.lstProductDetail = rs.Object;
                    })
                    dataserviceExp.cleanUpMapStock($scope.modelList.MapId, $scope.modelList.ProductQrCode, $scope.model.StoreCode, "", $scope.modelList.ProductCode, function (rs) {
                        rs = rs.data;
                        dataserviceExp.getListProductCodeVatco($scope.model.StoreCode, $scope.model.LotProductCode, function (rs) {
                            rs = rs.data;
                            $scope.listProduct = rs;
                            if (rs.length == 0) {
                                App.toastrError(caption.MES_MSG_NO_FOUND_PRODUCT_IN_STORE);
                            }
                        });
                        $scope.resetModelList();
                    })
                }
            })
        }
    }

    $scope.deleteDetail = function (id) {
        dataserviceExp.delDeliveryDetail(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                dataserviceExp.getListDetailDelivery($scope.model.TicketCode, function (rs) {
                    rs = rs.data;
                    $scope.lstProductDetail = rs.Object;
                })
                dataserviceExp.getListProductCodeVatco($scope.model.StoreCode, $scope.model.LotProductCode, function (rs) {
                    rs = rs.data;
                    $scope.listProduct = rs;
                    if (rs.length == 0) {
                        App.toastrError(caption.MES_MSG_NO_FOUND_PRODUCT_IN_STORE);
                    }
                });
            }
        })
    }

    $scope.editProd = function () {
        if ($scope.modelList.ProductCode == null || $scope.modelList.ProductCode == "" || $scope.modelList.ProductCode == undefined) {
            App.toastrError(caption.MIS_VALIDATE_CHOOSE_PRODUCT);
            return;
        }
        var id = $scope.modelList.Id;
        dataserviceMaterial.getItem(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                var object = rs;
                $rootScope.ProductID = $scope.modelList.Id;
                $rootScope.ProductCode = $scope.modelList.ProductCode;
                $rootScope.ObjCode = $scope.modelList.ProductCode;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderMaterialProd + '/edit.html',
                    controller: 'editProdCustom',
                    backdrop: 'static',
                    size: '65',
                    resolve: {
                        para: function () {
                            return object;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    console.log(d);
                    if (Object.keys(d).length === 0) {
                        console.log('no update');
                    }
                    else {
                        $scope.modelList.ProdCustomJson = JSON.stringify(d, null, 2);
                        $scope.modelList.IsCustomized = true;
                    }
                    //$scope.reloadNoResetPage();
                }, function () {
                    console.log('exit');
                });
            }
        });
    }
    $scope.viewProdCustom = function (index) {
        //if ($scope.modelList.ProductCode == null || $scope.modelList.ProductCode == "" || $scope.modelList.ProductCode == undefined) {
        //    App.toastrError(caption.MIS_VALIDATE_CHOOSE_PRODUCT);
        //    return;
        //}
        var item = $scope.lstProductDetail[index];
        if (item != null) {
            var id = item.IdProduct;
        }
        else {
            return App.toastrError(caption.MIST_ADD_PRODUCT_SAVE_BEFORE_SORT);
        }
        dataserviceMaterial.getItem(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                var object = rs;
                $rootScope.ProductID = $scope.modelList.Id;
                $rootScope.ProductCode = $scope.modelList.ProductCode;
                $rootScope.ObjCode = $scope.modelList.ProductCode;
                object.ProdCustomJson = item.ProdCustomJson;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderMaterialProd + '/edit.html',
                    controller: 'viewProdCustom',
                    backdrop: 'static',
                    size: '65',
                    resolve: {
                        para: function () {
                            return object;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    console.log(d);
                    if (Object.keys(d).length === 0) {
                        console.log('no update');
                    }
                    else {
                        $scope.modelList.ProdCustomJson = JSON.stringify(d, null, 2);
                        $scope.modelList.IsCustomized = true;
                    }
                    //$scope.reloadNoResetPage();
                }, function () {
                    console.log('exit');
                });
            }
        });
    }
    $scope.resetModelList = function () {
        $scope.modelList.ProductCode = "";
        $scope.modelList.QuantityExp = "";
        $scope.modelList.Unit = "";
        $scope.modelList.SalePrice = "";
    }

    $scope.changeSelect = function (SelectType, item) {
        //Hàm chọn 1 lô để nhập
        if (SelectType == "LotProductCode") {
            $rootScope.LotProductCode = item.Code;
            $scope.model.Reason = 'IMP_FROM_BUY';
            $scope.model.StoreCodeSend = '';

            dataserviceExp.getLotProduct(item.Code, function (rs) {
                rs = rs.data;
                $scope.model.CusCode = rs.SupCode;
                createTicketCode($scope.model.LotProductCode, $scope.model.StoreCode, $scope.model.UserImport);
                $scope.model.ListProduct = rs.ListProduct;
            });
        }
        if (SelectType == "ProductCode") {

            if ($scope.modelList.ProductCode == null || $scope.modelList.ProductCode == '' || $scope.modelList.ProductCode == undefined) {
                $scope.errorProductCode = true;
            } else {
                $scope.errorProductCode = false;
                //var product = $scope.listProduct.find(function (element) {
                //    if (element.Code == $scope.modelList.ProductCode) return true;
                //});
                $scope.modelList.Id = item.Id;
                $scope.modelList.Unit = item.Unit;
                $scope.modelList.MapId = item.MapId;
                $scope.modelList.MarkWholeProduct = item.MarkWholeProduct;
                $scope.modelList.ProductQrCode = item.ProductQrCode;
                $scope.modelList.PackCode = item.PackCode;

                $scope.maxQuantityExport = item.Quantity;
                $scope.lot = item.Lot;
                $scope.long = item.Long;
                $scope.high = item.High;
                $scope.wide = item.Wide;
                $scope.weight = item.Weight;
                $scope.packing = item.Packing;
                $scope.unitWeight = item.UnitWeight;
                $scope.srcUnit = item.Unit;

                $scope.jsonPacking = JSON.stringify($rootScope.jsonSpecification($scope.packing));
                dataserviceExp.unitFromPack($scope.jsonPacking, $scope.modelList.Unit, $scope.modelList.ProductQrCode, function (rs) {
                    rs = rs.data;
                    $scope.listUnit = rs.Object;
                })

                dataserviceExp.calQuantityByUnit($scope.jsonPacking, $scope.maxQuantityExport, $scope.modelList.Unit, item.Unit, function (rs) {
                    rs = rs.data
                    $scope.quantityByUnit = rs;
                })
            }
        }
        if (SelectType == "Unit") {
            if ($scope.modelList.Unit != undefined && $scope.modelList.Unit != null && $scope.modelList.Unit != '') {
                $scope.errorUnit = false;
                if ($scope.modelList.ProductCode != '' && $scope.modelList.ProductCode != undefined && $scope.modelList.ProductCode != null) {
                    $scope.jsonPacking = JSON.stringify($rootScope.jsonSpecification($scope.packing));
                    dataserviceExp.calQuantityByUnit($scope.jsonPacking, $scope.maxQuantityExport, $scope.modelList.Unit, $scope.srcUnit, function (rs) {
                        rs = rs.data
                        $scope.quantityByUnit = rs;
                    })
                }
            } else {
                $scope.errorUnit = true;
            }
        }
    }
    $scope.change = function (type) {
        switch (type) {
            case 'price':
                if ($scope.modelList.SalePrice == null || $scope.modelList.SalePrice == '' || $scope.modelList.SalePrice == undefined) {
                    $scope.errorSalePrice = true;
                } else {
                    $scope.errorSalePrice = false;
                }
                break;
            case 'QuantityExp':
                if ($scope.modelList.QuantityExp == null || $scope.modelList.QuantityExp == '' || $scope.modelList.QuantityExp == undefined) {
                    $scope.errorQuantityExp = true;
                } else {
                    $scope.errorQuantityExp = false;

                    if ($scope.quantityByUnit < $scope.modelList.QuantityExp) {
                        App.toastrError(caption.MES_MSG_OUT_RANGE_QUANTITY);
                        $scope.modelList.QuantityExp = 0;
                        return;
                    }
                }
                break;
            default:
        }
    }
    function validationSelectProd(data) {
        var mess = { Status: false, Title: "" }
        if (data.ProductCode == "" || data.ProductCode == undefined) {
            $scope.errorProductCode = true;
            mess.Status = true;
        } else {
            $scope.errorProductCode = false;
        }
        if (data.Unit == "" || data.Unit == undefined) {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;
        }
        //if (data.Currency == "" || data.Currency == undefined) {
        //    $scope.errorCurrency = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorCurrency = false;
        //}
        //if (data.SalePrice == "" || data.SalePrice == undefined) {
        //    $scope.errorSalePrice = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorSalePrice = false;
        //}
        if (data.QuantityExp == "" || data.QuantityExp == undefined) {
            $scope.errorQuantityExp = true;
            mess.Status = true;
        } else {
            $scope.errorQuantityExp = false;
        }
        return mess;
    };


    $scope.openLog = function () {
        dataserviceExp.getUpdateLog($scope.model.TicketCode, function (rs) {
            rs = rs.data;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderExp + '/showLog.html',
                controller: 'showLog',
                backdrop: 'static',
                size: '70',
                resolve: {
                    para: function () {
                        return rs.Object;
                    }
                }
            });
            modalInstance.result.then(function (d) {
            }, function () { });
        });
    }

    $scope.viewQrCode = function (code) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderQrCode + '/qrViewerBase64.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
                $scope.data = code;
                setTimeout(function () {
                    setModalDraggable('.modal-dialog');
                }, 200);
            },
            backdrop: 'static',
            size: '25',
        });
    }

    //Action khi chọn 1 combobox
    $scope.changleSelect = function (SelectType, item) {
        //Hàm chọn 1 lô để nhập
        if (SelectType == "LotProductCode") {
            $rootScope.LotProductCode = item.Code;
            $scope.model.Reason = 'EXP_TO_SALE';
            $scope.model.StoreCodeReceipt = '';
            dataserviceExp.getListProductCodeVatco($scope.model.StoreCode, $rootScope.LotProductCode, function (rs) {
                rs = rs.data;
                $scope.listProduct = rs;
                if (rs.length == 0) {
                    App.toastrError(caption.MES_MSG_NO_FOUND_PRODUCT_IN_STORE);
                }
            });

            //Bỏ validate
            if ($scope.model.LotProductCode != undefined && $scope.model.LotProductCode != null && $scope.model.LotProductCode != '') {
                $scope.errorLotProductCode = false;
            }
        }
        if (SelectType == "ProductQrCode") {
            $scope.modelList.Unit = item.Unit;
            $scope.modelList.UnitName = item.UnitName;
            $scope.modelList.ProductCode = item.ProductCode;
            $scope.modelList.ProductName = item.Name;
            $scope.modelList.ProductType = item.ProductType;
            $scope.modelList.SupCode = item.SupCode;
            $scope.modelList.SupName = item.SupName;

            //Xóa vị trí kệ, số lượng
            $scope.modelList.Quantity = null;
            $scope.modelList.RackCode = '';
            $scope.modelList.RackName = '';
            $scope.maxQuantity = 0;

            //Show label QR_Code sản phẩm
            $scope.modelShow.ProductQrCode = item.Code;

            dataserviceExp.getListRackCode($scope.modelList.ProductQrCode, function (rs) {
                rs = rs.data;
                $scope.listRackCode = rs;
            });

            dataserviceExp.getListProductLot($scope.modelList.ProductCode, $scope.model.StoreCode, function (rs) {
                rs = rs.data;
                $scope.listLot = rs.Object;
                $scope.modelList.ProductLot = '';
            });
        }
        if (SelectType == "ProductLot") {
            dataserviceExp.getListRackCode($scope.modelList.ProductQrCode, function (rs) {
                rs = rs.data;
                $scope.listRackCode = rs;
            });

            dataserviceExp.getPositionProductCode($scope.modelList.ProductCode, item.Code, $scope.model.StoreCode, function (rs) {
                rs = rs.data;
                if (!rs.Error) {
                    $scope.listCoil = rs.Object;
                    $scope.modelList.ProductCoil = '';
                }
            });
        }
        if (SelectType == "ProductCoil") {
            $scope.modelList.ProductCoil = item.ProductCoil;
            $scope.modelList.RackCode = item.RackCode;
            $scope.modelList.RackName = item.PositionInStore;
            $scope.modelList.ProductQrCode = item.ProductQrCode;
            $scope.modelList.Quantity = item.Remain;
            $scope.maxQuantity = item.Remain;
            angular.forEach($scope.listRackCode, function (value, key) {
                if (value.Code == $scope.modelList.RackCode) {
                    $scope.modelList.RackName = value.Name;
                }
            })

            dataserviceExp.generatorQRCode($scope.modelList.ProductQrCode, function (result) {
                result = result.data;
                $scope.modelList.sProductQrCode = result;
            });
        }
        if (SelectType == "RackCode") {
            $scope.modelList.RackCode = item.Code;
            $scope.modelList.RackName = item.Name;
            $scope.modelList.Quantity = item.Quantity;
            $scope.maxQuantity = item.Quantity;
        }
        if (SelectType == "StoreCode") {
            $scope.disableChoiseProduct = false;

            $scope.model.ListProduct = [];
            $scope.modelList = {};
            dataserviceExp.getListProductCodeVatco($scope.model.StoreCode, $scope.model.LotProductCode, function (rs) {
                rs = rs.data;
                $scope.listProduct = rs;
                if (rs.length == 0) {
                    App.toastrError(caption.MES_MSG_NO_FOUND_PRODUCT_IN_STORE);
                }
            });

            if ($scope.model.StoreCode != undefined && $scope.model.StoreCode != null && $scope.model.StoreCode != '') {
                $scope.errorStoreCode = false;
            }
            if ($scope.model.LotProductCode != undefined && $scope.model.LotProductCode != null && $scope.model.LotProductCode != '') {
                dataserviceExp.getLotProduct($scope.model.LotProductCode, $scope.model.StoreCode, function (rs) {
                    rs = rs.data;
                    $scope.model.ListPoProduct = rs.ListProduct;
                    $scope.model.ListProduct = [];
                });
            }
        }
        if (SelectType == "Reason") {
            if ($scope.model.Reason != undefined && $scope.model.Reason != null && $scope.model.Reason != '') {
                $scope.errorReason = false;
            }
            if ($scope.model.Reason == 'EXP_TO_SALE') {
                $scope.model.StoreCodeReceipt = '';
            }
            else {
                $scope.model.ContractCode = '';
                $scope.model.CusCode = '';
            }
        }
        //if (SelectType == "StoreCodeReceipt") {
        //    if ($scope.model.StoreCodeReceipt == $scope.model.StoreCode) {
        //        $scope.model.StoreCodeReceipt = '';
        //        App.toastrError(caption.MES_MSG_WARE_HOURE_GOTO_DEFERICEN);
        //    }
        //    if ($scope.model.StoreCodeReceipt != undefined && $scope.model.StoreCodeReceipt != null && $scope.model.StoreCodeReceipt != '') {
        //        $scope.errorStoreCodeReceipt = false;
        //    }
        //}
        if (SelectType == "UserExport") {
            if ($scope.model.UserExport != undefined && $scope.model.UserExport != null && $scope.model.UserExport != '') {
                $scope.errorUserExport = false;
            }
        }
        if (SelectType == "ContractCode") {
            dataserviceExp.getCustomer(item.Code, function (rs) {
                rs = rs.data;
                $scope.model.CusCode = rs;
            });
        }
    }

    //Vatco: thêm chi tiết thuộc tính sản phẩm
    $scope.attrValue = function () {
        if ($scope.modelList.ProductCode == null || $scope.modelList.ProductCode == "" || $scope.modelList.ProductCode == undefined) {
            App.toastrError(caption.MES_MSG_PLS_SELECT_PROD);
            return;
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderExp + '/ticket-exp-attr-value.html',
            controller: 'ticket-exp-attr-value',
            backdrop: 'static',
            size: '65',
            resolve: {
                para: function () {
                    return {
                        TicketCode: $scope.model.TicketCode,
                        ProductCode: $scope.modelList.ProductCode
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {
        }, function () { });
    };

    //Validate UiSelect
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null lô hàng khi chọn xuất theo lô
        if ($scope.IsEnabledExportLot == true && (data.LotProductCode == undefined || data.LotProductCode == null || data.LotProductCode == '')) {
            $scope.errorLotProductCode = true;
            mess.Status = true;
        } else {
            $scope.errorLotProductCode = false;
        }

        //Check null kho hàng
        if (data.StoreCode == undefined || data.StoreCode == null || data.StoreCode == '') {
            $scope.errorStoreCode = true;
            mess.Status = true;
        } else {
            $scope.errorStoreCode = false;
        }

        //Check null lý do
        if (data.Reason == undefined || data.Reason == null || data.Reason == '') {
            $scope.errorReason = true;
            mess.Status = true;
        } else {
            $scope.errorReason = false;
        }

        //Check null kho chuyển đến
        //if ($scope.model.Reason == 'EXP_TO_MOVE_STORE' && (data.StoreCodeReceipt == undefined || data.StoreCodeReceipt == null || data.StoreCodeReceipt == '')) {
        //    $scope.errorStoreCodeReceipt = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorStoreCodeReceipt = false;
        //}

        //Check null nhân viên xuất
        if (data.UserExport == undefined || data.UserExport == null || data.UserExport == '') {
            $scope.errorUserExport = true;
            mess.Status = true;
        } else {
            $scope.errorUserExport = false;
        }

        if (data.WorkflowCat == undefined || data.WorkflowCat == null || data.WorkflowCat == '') {
            $scope.errorWorkflowCat = true;
            mess.Status = true;
        } else {
            $scope.errorWorkflowCat = false;
        }

        return mess;
    };

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
                var msg = $rootScope.checkData($scope.model);
                if (msg.Status) {
                    App.toastrError(msg.Title);
                    return;
                } else {
                    if ($scope.isNotSave) {
                        dataserviceExp.insert($scope.model, function (rs) {
                            rs = rs.data;
                            if (rs.Error) {
                                var type = "ODD";
                                if ($rootScope.IsEnabledExportLot) {
                                    type = "PO";
                                } else {
                                    $scope.model.LotProductCode = '';
                                };
                                dataserviceExp.createTicketCode(type, function (rs) {
                                    rs = rs.data;
                                    $scope.model.TicketCode = rs.Object;
                                    $scope.confirmCodeExits($scope.model.TicketCode);
                                });
                            } else {
                                $scope.isNotSave = false;
                                $scope.isDisable = true;
                                $scope.isEdit = true;
                                $rootScope.storeCode = $scope.model.StoreCode;
                                App.toastrSuccess(rs.Title);
                                $rootScope.rootId = rs.ID;
                                //Workflow
                                $scope.modelWf.ObjectInst = $scope.model.TicketCode;
                                $scope.modelWf.WorkflowCode = $scope.model.WorkflowCat;
                                $scope.modelWf.ObjectName = $scope.model.Title;
                                dataserviceExp.createWfInstance($scope.modelWf, function (rs) {
                                    rs = rs.data;
                                    if (rs.Error) {
                                        App.toastrError(rs.Title);
                                    } else {
                                        //App.toastrSuccess(rs.Title);
                                        var wfInstCode = rs.Object.WfInstCode;
                                        $scope.WfInstCode = wfInstCode;
                                        $rootScope.loadDiagramWfInst($scope.model.TicketCode, $scope.modelWf.ObjectType);
                                        dataserviceExp.getLogStatus($scope.model.TicketCode, function (rs) {
                                            rs = rs.data;
                                            try {
                                                var lstStatus = JSON.parse(rs.Status);
                                            } catch (e) {
                                                console.log(e);
                                                lstStatus = [];
                                            }
                                            if (lstStatus.length > 0) {
                                                $scope.model.Status = lstStatus[lstStatus.length - 1].Code;
                                                $scope.model.StatusDefault = lstStatus[lstStatus.length - 1].Code;
                                                $scope.model.StatusTemp = lstStatus[lstStatus.length - 1].Code;
                                                $scope.listStatusLog = lstStatus;
                                            }
                                        })
                                    }
                                })
                            }
                        });
                    } else {
                        dataserviceExp.update($scope.model, function (rs) {
                            rs = rs.data;
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            } else {
                                App.toastrSuccess(rs.Title);
                            }
                        });
                    }
                }
            }
        }
    }

    //Edit Activity Instance
    $scope.editInstAct = function (id, objCode) {
        dataserviceExp.checkPermissionEditActivityById(id, function (rs) {
            rs = rs.data;
            if (!rs) {
                return App.toastrError(caption.COM_MSG_PERMISSION_EDIT_ACT);
            }
            dataserviceExp.getItemActInst(id, function (rs) {
                $rootScope.IsLock = rs.data.IsLock;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/add-activity-instance.html',
                    controller: 'edit-activity-instance',
                    backdrop: 'static',
                    keyboard: false,
                    size: '60',
                    resolve: {
                        para: function () {
                            return {
                                Data: rs.data,
                                ObjCode: objCode
                            }
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    $rootScope.loadDiagramWfInst($scope.model.TicketCode, $scope.modelWf.ObjectType);
                    dataserviceExp.getLogStatus($scope.model.TicketCode, function (rs) {
                        rs = rs.data;
                        try {
                            var lstStatus = JSON.parse(rs.Status);
                        } catch (e) {
                            console.log(e);
                            lstStatus = [];
                        }
                        if (lstStatus.length > 0) {
                            $scope.model.Status = lstStatus[lstStatus.length - 1].Code;
                            $scope.model.StatusDefault = lstStatus[lstStatus.length - 1].Code;
                            $scope.model.StatusTemp = lstStatus[lstStatus.length - 1].Code;
                            $scope.listStatusLog = lstStatus;
                        }
                    })
                }, function () {
                });
            })
        })
    }
    //End

    $scope.confirmCodeExits = function (ticketCode) {
        var model = $scope.model;
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmQuestion.html',
            windowClass: "message-center",
            resolve: {
                para: function () {
                    return {
                        model
                    };
                }
            },
            controller: function ($scope, $uibModalInstance, para) {
                $scope.message = caption.MES_MSG_CODE_EXIST_TRANSFER_TO + " " + ticketCode;
                $scope.ok = function () {
                    dataserviceExp.insert(para.model, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close(rs.ID);
                        }
                    });
                };

                $scope.cancel = function () {
                    $uibModalInstance.close(false, null);
                };
            },
            size: '25'
        });
        modalInstance.result.then(function (d) {
            if (d != undefined) {
                $scope.isNotSave = false;
                $scope.isDisable = true;
                $scope.isEdit = true;
                $rootScope.storeCode = $scope.model.StoreCode;
                $rootScope.rootId = d;
            }
        }, function () {
        });
    }

    $scope.addCustomer = function () {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderCustomer + '/add.html',
            controller: 'addCustomer',
            size: '70',
        });
        modalInstance.result.then(function (d) {
            dataserviceExp.getListCustomer(function (rs) {
                rs = rs.data;
                $scope.listCustomer = rs;
            });
        }, function () {
        });
    }
});

app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, DTOptionsBuilder, DTColumnBuilder, DTInstances, $filter, dataserviceExp, dataserviceMaterial, myService, $window, $location) {
    var vm = $scope;
    //Khởi tạo
    $scope.modelShow = {
        ProductQrCode: ''
    };
    $scope.modelWf = {
        WorkflowCode: "",
        ObjectType: "EXPORT_STORE",
        ObjectInst: "",
    };
    $scope.model = {};
    $scope.model.Title = '';
    $scope.model.StoreCode = '';
    $scope.model.CusCode = '';
    $scope.model.Reason = 'EXP_TO_SALE';
    $scope.model.StoreCodeReceipt = '';
    $scope.model.TimeTicketCreate = $filter('date')(new Date(), 'dd/MM/yyyy');
    $scope.model.UserExport = '';
    $scope.model.Note = '';
    $scope.model.UserReceipt = '';
    $scope.model.InsurantTime = '';

    var para = myService.getData();
    if (para == undefined) {
        para = $location.search().id;
    }
    if (para == undefined || para <= 0) {
        location.href = "/Admin/MaterialExpStore";
    }

    if (para != undefined) {
        $rootScope.rootId = para;
        $scope.init = function () {
            $scope.model.LotProductCode = null;
            $scope.model.ListProduct = [];
            $scope.model.ListPoProduct = [];
            $scope.modelList = {
                ProductCode: '',
                ProductName: '',
                RackCode: '',
                RackName: '',
                ProductQrCode: '',
                sProductQrCode: '',
                Quantity: null,
                Unit: '',
                UnitName: '',
                SalePrice: null,
                TaxRate: 10,
                Discount: 0,
                Commission: 0,
            };
        }
        $scope.init();
        $scope.initLoad = function () {
            dataserviceExp.getListUnit(function (rs) {
                rs = rs.data;
                $scope.listUnit = rs;
            });
            dataserviceExp.getListWareHouse(function (rs) {
                rs = rs.data;
                $scope.listStore = rs;
                $scope.listStoreReceipt = rs;
                $rootScope.MapStores = {};
                for (var i = 0; i < rs.length; ++i) {
                    $rootScope.MapStores[rs[i].Code] = rs[i];
                }
            });
            dataserviceExp.getListContract(function (rs) {
                rs = rs.data;
                $scope.listContract = rs;
            });
            dataserviceExp.getListCustomer(function (rs) {
                rs = rs.data;
                $scope.listCustomer = rs;
            });
            dataserviceExp.getListUserExport(function (rs) {
                rs = rs.data;
                $scope.listUserExport = rs;
            });
            dataserviceExp.getListReason(function (rs) {
                rs = rs.data;
                $scope.listReason = rs;
            });
            dataserviceExp.getListPaymentStatus(function (rs) {
                rs = rs.data;
                $scope.listPaymentStatus = rs;
            });

            dataserviceExp.getItem(para, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    $scope.model = rs.Object.Header;
                    try {
                        var lstStatus = JSON.parse($scope.model.Status);
                    } catch (e) {
                        console.log(e);
                        lstStatus = [];
                    }
                    if (lstStatus.length > 0) {
                        $scope.model.Status = lstStatus[lstStatus.length - 1].Code;
                        $scope.model.StatusDefault = lstStatus[lstStatus.length - 1].Code;
                        $scope.model.StatusTemp = lstStatus[lstStatus.length - 1].Code;
                        $scope.listStatusLog = lstStatus;
                    }
                    dataserviceExp.getListDetailDelivery($scope.model.TicketCode, function (rs) {
                        rs = rs.data;
                        $scope.lstProductDetail = rs.Object;
                    })
                    if ($scope.model.LotProductCode != '') {
                        $scope.IsEnabledExportLot = true;
                        $rootScope.IsEnabledExportLot = true;
                        dataserviceExp.getListLotProduct(function (rs) {
                            rs = rs.data;
                            $scope.listLotProduct = rs;
                        });
                    }
                    dataserviceExp.getListProductCodeVatco($scope.model.StoreCode, $scope.model.LotProductCode, function (rs) {
                        rs = rs.data;
                        $scope.listProduct = rs;
                        if (rs.length == 0) {
                            App.toastrError(caption.MES_MSG_NO_FOUND_PRODUCT_IN_STORE);
                        }
                    });
                    dataserviceExp.getInfoUserImport($scope.model.UserExport, function (rs) {
                        rs = rs.data;
                        $scope.infoUserExport = rs;
                    })
                    setTimeout(function () {
                        $rootScope.loadDiagramWfInst($scope.model.TicketCode, $scope.modelWf.ObjectType);
                    }, 800)
                }
            });

            dataserviceExp.getCurrency(function (rs) {
                rs = rs.data;
                $scope.listCurrentcy = rs;
                if ($scope.listCurrentcy.length > 0) {
                    $scope.modelList.Currency = $scope.listCurrentcy[0].Code;
                }
            })

            dataserviceExp.getWorkFlow(function (result) {
                result = result.data;
                $rootScope.lstWorkflow = result;
            });
        }
        $scope.initLoad();
    }
    else {
        $location.path("/");
    }

    $scope.changeStatus = function () {
        if ($scope.model.Status == "REPEAT_REQUIRE_REWORK" || $scope.model.Status == "FINAL_REQUIRE_REWORK") {
            dataserviceExp.getListRepeat($scope.model.TicketCode, function (rs) {
                rs = rs.data;
                var arr = [];
                if (rs.list != undefined && rs.list != null && rs.list != "") {
                    for (var i = 0; i < rs.list.length; i++) {
                        if (rs.list[i].IntsCode == rs.current) {
                            for (var j = 0; j < i; j++) {
                                arr.push(rs.list[j]);
                            }
                        }
                    }
                    $scope.lstActRepeat = arr;
                    $scope.showAct = true;
                }
            })
        }
        else {
            $scope.showAct = false;
        }
    }

    $scope.IsEnabledExportLot = false;
    $rootScope.IsEnabledExportLot = false;
    $scope.modelDisable = true;
    $scope.maxQuantity = 0;
    $scope.listCoil = [];
    //Luôn luôn có Store code rồi nên biến này = false
    $scope.disableChoiseProduct = false;

    $scope.reloadGridDetail = function () {

        dataserviceExp.getListProductGrid($rootScope.rootId, function (rs) {
            rs = rs.data;

            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model.ListProduct = rs.Object.ListProduct;
            }
        });
    }

    $rootScope.refeshData = function (id) {
        dataserviceExp.getItem(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model = rs.Object.Header;
                $scope.model.ListPoProduct = rs.Object.ListPoProduct;

                dataserviceExp.getListProductGrid($rootScope.rootId, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        $scope.model.ListProduct = rs.Object.ListProduct;
                    }
                });

                if ($scope.model.LotProductCode != '') {
                    $scope.IsEnabledExportLot = true;
                    $rootScope.IsEnabledExportLot = true;

                    dataserviceExp.getListLotProduct4Update($scope.model.LotProductCode, function (rs) {
                        rs = rs.data;
                        $scope.listLotProduct = rs;
                    });
                }
                else {
                    //Không theo lô thì không cần lấy danh sách lô
                    //dataserviceExp.getListLotProduct(function (rs) {rs=rs.data;
                    //    $scope.listLotProduct = rs;
                    //});
                }

                dataserviceExp.getListProductCode($scope.model.StoreCode, function (rs) {
                    rs = rs.data;
                    $scope.listProduct = rs;
                });
            }
        });
    }

    //Load init date
    function loadPoper() {
        $('[data-toggle="popover"]').popover()
    }
    function loadDate() {
        $("#InsurantTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $("#TimeTicketCreate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        var today = new Date(new Date());
        $('#InsurantTime').datepicker('setStartDate', today);

        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }
    setTimeout(function () {
        loadDate();
        loadPoper();
    }, 200);
    //Hết khởi tạo

    //Edit Activity Instance
    $scope.editInstAct = function (id, objCode) {
        dataserviceExp.checkPermissionEditActivityById(id, function (rs) {
            rs = rs.data;
            if (!rs) {
                return App.toastrError(caption.COM_MSG_PERMISSION_EDIT_ACT);
            }
            dataserviceExp.getItemActInst(id, function (rs) {
                $rootScope.IsLock = rs.data.IsLock;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/add-activity-instance.html',
                    controller: 'edit-activity-instance',
                    backdrop: 'static',
                    keyboard: false,
                    size: '60',
                    resolve: {
                        para: function () {
                            return {
                                Data: rs.data,
                                ObjCode: objCode
                            }
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    $rootScope.loadDiagramWfInst($scope.model.TicketCode, $scope.modelWf.ObjectType);
                    dataserviceExp.getLogStatus($scope.model.TicketCode, function (rs) {
                        rs = rs.data;
                        try {
                            var lstStatus = JSON.parse(rs.Status);
                        } catch (e) {
                            console.log(e);
                            lstStatus = [];
                        }
                        if (lstStatus.length > 0) {
                            $scope.model.Status = lstStatus[lstStatus.length - 1].Code;
                            $scope.model.StatusDefault = lstStatus[lstStatus.length - 1].Code;
                            $scope.model.StatusTemp = lstStatus[lstStatus.length - 1].Code;
                            $scope.listStatusLog = lstStatus;
                        }
                    })
                }, function () {
                });
            })
        })
    }
    //End

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
        $rootScope.reloadRoot();
    }

    //Hàm lựa chọn/bỏ lựa chọn nhập theo lô
    $scope.checkedExportLot = function (chk) {
        $scope.init();
        $rootScope.IsEnabledExportLot = chk;
        $scope.errorLotProductCode = false;
    }

    $scope.modelList.SalePrice = "";
    $scope.modelList.QuantityExp = "";

    $scope.addVatCo = function () {
        if ($scope.isNotSave) {
            App.toastrError(caption.MES_MSG_PLS_ADD_EXP_STORE);
            return;
        }
        validationSelectProd($scope.modelList);
        if (!validationSelectProd($scope.modelList).Status) {
            var data = {
                TicketCode: $scope.model.TicketCode,
                ProductCode: $scope.modelList.ProductCode,
                ProductType: $scope.modelList.ProductType,
                ProductQrCode: $scope.modelList.ProductQrCode,
                sProductQrCode: $scope.modelList.sProductQrCode,
                Quantity: $scope.modelList.QuantityExp,
                Unit: $scope.modelList.Unit,
                SalePrice: $scope.modelList.SalePrice,
                Currency: $scope.modelList.Currency,
                WHS_Code: $scope.model.StoreCode,
                MapId: $scope.modelList.MapId,
                MarkWholeProduct: $scope.modelList.MarkWholeProduct,
                MaxQuantity: $scope.maxQuantityExport,
                JsonPack: JSON.stringify($rootScope.jsonSpecification($scope.packing)),
                SrcUnit: $scope.srcUnit,
                IsCustomized: $scope.modelList.IsCustomized,
                ProdCustomJson: $scope.modelList.ProdCustomJson
            };

            if ($scope.quantityByUnit < $scope.modelList.QuantityExp) {
                App.toastrError(caption.MES_MSG_OUT_RANGE_QUANTITY);
                return;
            }

            dataserviceExp.insertDetailProductOddVatco(data, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    dataserviceExp.getListDetailDelivery($scope.model.TicketCode, function (rs) {
                        rs = rs.data;
                        $scope.lstProductDetail = rs.Object;
                    })
                    dataserviceExp.cleanUpMapStock($scope.modelList.MapId, $scope.modelList.ProductQrCode, $scope.model.StoreCode, "", $scope.modelList.ProductCode, function (rs) {
                        rs = rs.data;
                        dataserviceExp.getListProductCodeVatco($scope.model.StoreCode, $scope.model.LotProductCode, function (rs) {
                            rs = rs.data;
                            $scope.listProduct = rs;
                            if (rs.length == 0) {
                                App.toastrError(caption.MES_MSG_NO_FOUND_PRODUCT_IN_STORE);
                            }
                        });
                        $scope.resetModelList();
                    })
                }
            })
        }
    }

    $scope.deleteDetail = function (id) {
        dataserviceExp.delDeliveryDetail(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                dataserviceExp.getListDetailDelivery($scope.model.TicketCode, function (rs) {
                    rs = rs.data;
                    $scope.lstProductDetail = rs.Object;
                })
                dataserviceExp.getListProductCodeVatco($scope.model.StoreCode, $scope.model.LotProductCode, function (rs) {
                    rs = rs.data;
                    $scope.listProduct = rs;
                    if (rs.length == 0) {
                        App.toastrError(caption.MES_MSG_NO_FOUND_PRODUCT_IN_STORE);
                    }
                });
            }
        })
    }

    $scope.editProd = function () {
        if ($scope.modelList.ProductCode == null || $scope.modelList.ProductCode == "" || $scope.modelList.ProductCode == undefined) {
            App.toastrError(caption.MIS_VALIDATE_CHOOSE_PRODUCT);
            return;
        }
        var id = $scope.modelList.Id;
        dataserviceMaterial.getItem(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                var object = rs;
                $rootScope.ProductID = $scope.modelList.Id;
                $rootScope.ProductCode = $scope.modelList.ProductCode;
                $rootScope.ObjCode = $scope.modelList.ProductCode;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderMaterialProd + '/edit.html',
                    controller: 'editProdCustom',
                    backdrop: 'static',
                    size: '65',
                    resolve: {
                        para: function () {
                            return object;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    console.log(d);
                    if (Object.keys(d).length === 0) {
                        console.log('no update');
                    }
                    else {
                        $scope.modelList.ProdCustomJson = JSON.stringify(d, null, 2);
                        $scope.modelList.IsCustomized = true;
                    }
                    //$scope.reloadNoResetPage();
                }, function () {
                    console.log('exit');
                });
            }
        });
    }
    $scope.viewProdCustom = function (index) {
        //if ($scope.modelList.ProductCode == null || $scope.modelList.ProductCode == "" || $scope.modelList.ProductCode == undefined) {
        //    App.toastrError(caption.MIS_VALIDATE_CHOOSE_PRODUCT);
        //    return;
        //}
        var item = $scope.lstProductDetail[index];
        if (item != null) {
            var id = item.IdProduct;
        }
        else {
            return App.toastrError(caption.MIST_ADD_PRODUCT_SAVE_BEFORE_SORT);
        }
        dataserviceMaterial.getItem(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                var object = rs;
                $rootScope.ProductID = $scope.modelList.Id;
                $rootScope.ProductCode = $scope.modelList.ProductCode;
                $rootScope.ObjCode = $scope.modelList.ProductCode;
                object.ProdCustomJson = item.ProdCustomJson;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderMaterialProd + '/edit.html',
                    controller: 'viewProdCustom',
                    backdrop: 'static',
                    size: '65',
                    resolve: {
                        para: function () {
                            return object;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    console.log(d);
                    if (Object.keys(d).length === 0) {
                        console.log('no update');
                    }
                    else {
                        $scope.modelList.ProdCustomJson = JSON.stringify(d, null, 2);
                        $scope.modelList.IsCustomized = true;
                    }
                    //$scope.reloadNoResetPage();
                }, function () {
                    console.log('exit');
                });
            }
        });
    }

    $scope.changeSelect = function (SelectType, item) {
        //Hàm chọn 1 lô để nhập
        if (SelectType == "LotProductCode") {
            $rootScope.LotProductCode = item.Code;
            $scope.model.Reason = 'IMP_FROM_BUY';
            $scope.model.StoreCodeSend = '';

            dataserviceExp.getLotProduct(item.Code, function (rs) {
                rs = rs.data;
                $scope.model.CusCode = rs.SupCode;
                createTicketCode($scope.model.LotProductCode, $scope.model.StoreCode, $scope.model.UserImport);
                $scope.model.ListProduct = rs.ListProduct;
            });
        }
        if (SelectType == "ProductCode") {

            if ($scope.modelList.ProductCode == null || $scope.modelList.ProductCode == '' || $scope.modelList.ProductCode == undefined) {
                $scope.errorProductCode = true;
            } else {
                $scope.errorProductCode = false;
                //var product = $scope.listProduct.find(function (element) {
                //    if (element.Code == $scope.modelList.ProductCode) return true;
                //});
                $scope.modelList.Id = item.Id;
                $scope.modelList.Unit = item.Unit;
                $scope.modelList.MapId = item.MapId;
                $scope.modelList.MarkWholeProduct = item.MarkWholeProduct;
                $scope.modelList.ProductQrCode = item.ProductQrCode;

                $scope.maxQuantityExport = item.Quantity;
                $scope.lot = item.Lot;
                $scope.long = item.Long;
                $scope.high = item.High;
                $scope.wide = item.Wide;
                $scope.weight = item.Weight;
                $scope.packing = item.Packing;
                $scope.unitWeight = item.UnitWeight;
                $scope.srcUnit = item.Unit;

                $scope.jsonPacking = JSON.stringify($rootScope.jsonSpecification($scope.packing));
                dataserviceExp.unitFromPack($scope.jsonPacking, $scope.modelList.Unit, $scope.modelList.ProductQrCode, function (rs) {
                    rs = rs.data;
                    $scope.listUnit = rs.Object;
                })

                dataserviceExp.calQuantityByUnit($scope.jsonPacking, $scope.maxQuantityExport, $scope.modelList.Unit, item.Unit, function (rs) {
                    rs = rs.data
                    $scope.quantityByUnit = rs;
                })
            }
        }
        if (SelectType == "Unit") {
            if ($scope.modelList.Unit != undefined && $scope.modelList.Unit != null && $scope.modelList.Unit != '') {
                $scope.errorUnit = false;
                if ($scope.modelList.ProductCode != '' && $scope.modelList.ProductCode != undefined && $scope.modelList.ProductCode != null) {
                    $scope.jsonPacking = JSON.stringify($rootScope.jsonSpecification($scope.packing));
                    dataserviceExp.calQuantityByUnit($scope.jsonPacking, $scope.maxQuantityExport, $scope.modelList.Unit, $scope.srcUnit, function (rs) {
                        rs = rs.data
                        $scope.quantityByUnit = rs;
                    })
                }
            } else {
                $scope.errorUnit = true;
            }
        }
    }

    $scope.change = function (type) {
        switch (type) {
            case 'price':
                if ($scope.modelList.SalePrice == null || $scope.modelList.SalePrice == '' || $scope.modelList.SalePrice == undefined) {
                    $scope.errorSalePrice = true;
                } else {
                    $scope.errorSalePrice = false;
                }
                break;
            case 'QuantityExp':
                if ($scope.modelList.QuantityExp == null || $scope.modelList.QuantityExp == '' || $scope.modelList.QuantityExp == undefined) {
                    $scope.errorQuantityExp = true;
                } else {
                    $scope.errorQuantityExp = false;

                    if ($scope.quantityByUnit < $scope.modelList.QuantityExp) {
                        App.toastrError(caption.MES_MSG_OUT_RANGE_QUANTITY);
                        $scope.modelList.QuantityExp = 0;
                        return;
                    }
                }
                break;
            default:
        }
    }

    $scope.openLog = function () {
        dataserviceExp.getUpdateLog($scope.model.TicketCode, function (rs) {
            rs = rs.data;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderExp + '/showLog.html',
                controller: 'showLog',
                backdrop: 'static',
                size: '70',
                resolve: {
                    para: function () {
                        return rs.Object;
                    }
                }
            });
            modalInstance.result.then(function (d) {
            }, function () { });
        });
    }

    $scope.viewQrCode = function (code) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderQrCode + '/qrViewerBase64.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
                $scope.data = code;
                setTimeout(function () {
                    setModalDraggable('.modal-dialog');
                }, 200);
            },
            backdrop: 'static',
            size: '25',
        });
    }

    //Action khi chọn 1 combobox
    $scope.changleSelect = function (SelectType, item) {
        //Hàm chọn 1 lô để nhập
        if (SelectType == "LotProductCode") {
            $rootScope.LotProductCode = item.Code;
            $scope.model.Reason = 'EXP_TO_SALE';
            $scope.model.StoreCodeReceipt = '';

            dataserviceExp.getLotProduct(item.Code, $scope.model.StoreCode, function (rs) {
                rs = rs.data;
                $scope.model.CusCode = rs.CusCode;

                $scope.model.ListPoProduct = rs.ListProduct;
                $scope.model.ListProduct = [];
            });

            //Bỏ validate
            if ($scope.model.LotProductCode != undefined && $scope.model.LotProductCode != null && $scope.model.LotProductCode != '') {
                $scope.errorLotProductCode = false;
            }
        }
        if (SelectType == "ProductQrCode") {
            $scope.modelList.Unit = item.Unit;
            $scope.modelList.UnitName = item.UnitName;
            $scope.modelList.ProductCode = item.ProductCode;
            $scope.modelList.ProductName = item.Name;
            $scope.modelList.ProductType = item.ProductType;
            $scope.modelList.SupCode = item.SupCode;
            $scope.modelList.SupName = item.SupName;

            //Xóa vị trí kệ, số lượng
            $scope.modelList.Quantity = null;
            $scope.modelList.RackCode = '';
            $scope.modelList.RackName = '';
            $scope.maxQuantity = 0;

            //Show label QR_Code sản phẩm
            $scope.modelShow.ProductQrCode = item.Code;
            dataserviceExp.getListRackCode($scope.modelList.ProductQrCode, function (rs) {
                rs = rs.data;
                $scope.listRackCode = rs;
            });

            dataserviceExp.getListProductLot($scope.modelList.ProductCode, $scope.model.StoreCode, function (rs) {
                rs = rs.data;
                $scope.listLot = rs.Object;
                $scope.modelList.ProductLot = '';
            });
        }
        if (SelectType == "ProductLot") {
            dataserviceExp.getListRackCode($scope.modelList.ProductQrCode, function (rs) {
                rs = rs.data;
                $scope.listRackCode = rs;
            });

            dataserviceExp.getPositionProductCode($scope.modelList.ProductCode, item.Code, $scope.model.StoreCode, function (rs) {
                rs = rs.data;
                if (!rs.Error) {
                    $scope.listCoil = rs.Object;
                    $scope.modelList.ProductCoil = '';

                    //if ($scope.model.ListProduct.length > 0) {
                    //    for (var i = 0; i < $scope.model.ListProduct.length; i++) {

                    //        var elementCheckListCoil = $scope.listCoil.find(function (element) {
                    //            if (element.ProductCoil == $scope.model.ListProduct[i].ProductCoil) {
                    //                if (element.Remain == $scope.modelList.Quantity) {
                    //                    element.Remain = 0;
                    //                    $scope.modelList.Quantity = 0;

                    //                    var index = $scope.listCoil.indexOf(element);
                    //                    $scope.listCoil.splice(index, 1);
                    //                }

                    //                if (element.Remain > $scope.modelList.Quantity) {
                    //                    element.Remain = element.Remain - $scope.modelList.Quantity;
                    //                    $scope.modelList.Quantity = element.Remain - $scope.modelList.Quantity;
                    //                }
                    //                return element;
                    //            }
                    //        });
                    //    }
                    //}
                }
            });
        }
        if (SelectType == "ProductCoil") {
            $scope.modelList.ProductCoil = item.ProductCoil;
            $scope.modelList.RackCode = item.RackCode;
            $scope.modelList.RackName = item.PositionInStore;
            $scope.modelList.ProductQrCode = item.ProductQrCode;
            $scope.modelList.Quantity = item.Remain;
            $scope.maxQuantity = item.Remain;
            angular.forEach($scope.listRackCode, function (value, key) {
                if (value.Code == $scope.modelList.RackCode) {
                    $scope.modelList.RackName = value.Name;
                }
            })

            dataserviceExp.generatorQRCode($scope.modelList.ProductQrCode, function (result) {
                result = result.data;
                $scope.modelList.sProductQrCode = result;
            });
        }
        if (SelectType == "RackCode") {
            $scope.modelList.RackCode = item.Code;
            $scope.modelList.RackName = item.Name;
            $scope.modelList.Quantity = item.Quantity;
            $scope.maxQuantity = item.Quantity;
        }
        if (SelectType == "StoreCode") {
            $scope.disableChoiseProduct = false;

            $scope.model.ListProduct = [];
            $scope.modelList = {};
            dataserviceExp.getListProductCode($scope.model.StoreCode, function (rs) {
                rs = rs.data;
                $scope.listProduct = rs;
                if (rs.length == 0) {
                    App.toastrError(caption.MES_MSG_NO_FOUND_PRODUCT_IN_STORE);
                }
            });
            if ($scope.model.StoreCode != undefined && $scope.model.StoreCode != null && $scope.model.StoreCode != '') {
                $scope.errorStoreCode = false;
            }
            if ($scope.model.LotProductCode != undefined && $scope.model.LotProductCode != null && $scope.model.LotProductCode != '') {
                dataserviceExp.getLotProduct($scope.model.LotProductCode, $scope.model.StoreCode, function (rs) {
                    rs = rs.data;
                    $scope.model.ListPoProduct = rs.ListProduct;
                    $scope.model.ListProduct = [];
                });
            }
        }
        if (SelectType == "Reason") {
            if ($scope.model.Reason != undefined && $scope.model.Reason != null && $scope.model.Reason != '') {
                $scope.errorReason = false;
            }
            if ($scope.model.Reason == 'EXP_TO_SALE') {
                $scope.model.StoreCodeReceipt = '';
            }
            else {
                $scope.model.ContractCode = '';
                $scope.model.CusCode = '';
            }
        }
        //if (SelectType == "StoreCodeReceipt") {
        //    if ($scope.model.StoreCodeReceipt == $scope.model.StoreCode) {
        //        $scope.model.StoreCodeReceipt = '';
        //        App.toastrError(caption.MES_MSG_WARE_HOURE_GOTO_DEFERICEN);
        //    }
        //    if ($scope.model.StoreCodeReceipt != undefined && $scope.model.StoreCodeReceipt != null && $scope.model.StoreCodeReceipt != '') {
        //        $scope.errorStoreCodeReceipt = false;
        //    }
        //}
        if (SelectType == "UserExport") {
            if ($scope.model.UserExport != undefined && $scope.model.UserExport != null && $scope.model.UserExport != '') {
                $scope.errorUserExport = false;
            }
        }
        if (SelectType == "ContractCode") {
            dataserviceExp.getCustomer(item.Code, function (rs) {
                rs = rs.data;
                $scope.model.CusCode = rs;
            });
        }
    }

    //Validate UiSelect
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null lô hàng khi chọn xuất theo lô
        if ($scope.IsEnabledExportLot == true && (data.LotProductCode == undefined || data.LotProductCode == null || data.LotProductCode == '')) {
            $scope.errorLotProductCode = true;
            mess.Status = true;
        } else {
            $scope.errorLotProductCode = false;
        }

        //Check null kho hàng
        if (data.StoreCode == undefined || data.StoreCode == null || data.StoreCode == '') {
            $scope.errorStoreCode = true;
            mess.Status = true;
        } else {
            $scope.errorStoreCode = false;
        }

        //Check null lý do
        if (data.Reason == undefined || data.Reason == null || data.Reason == '') {
            $scope.errorReason = true;
            mess.Status = true;
        } else {
            $scope.errorReason = false;
        }

        //Check null kho chuyển đến
        //if ($scope.model.Reason == 'EXP_TO_MOVE_STORE' && (data.StoreCodeReceipt == undefined || data.StoreCodeReceipt == null || data.StoreCodeReceipt == '')) {
        //    $scope.errorStoreCodeReceipt = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorStoreCodeReceipt = false;
        //}

        //Check null nhân viên xuất
        if (data.UserExport == undefined || data.UserExport == null || data.UserExport == '') {
            $scope.errorUserExport = true;
            mess.Status = true;
        } else {
            $scope.errorUserExport = false;
        }

        return mess;
    };

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
                var msg = $rootScope.checkData($scope.model);
                if (msg.Status) {
                    App.toastrError(msg.Title);
                    return;
                } else {
                    dataserviceExp.update($scope.model, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        }
                        else {
                            App.toastrSuccess(rs.Title);
                            dataserviceExp.updateStatusWF("EXPORT_STORE", $scope.model.TicketCode, $scope.model.Status, $scope.model.ActRepeat, function (rs) {
                                if ($scope.model.Status != "FINAL_DONE") {
                                    dataserviceExp.getActionStatus($scope.model.TicketCode, function (rs) {
                                        rs = rs.data;
                                        var json = JSON.parse(rs[0].StatusLog);
                                        var arr = [];
                                        arr.push(json[json.length - 1]);
                                        $scope.loghis = arr;
                                        $scope.model.Status = $scope.loghis[0].StatusCode;
                                    })
                                    dataserviceExp.getItemHeaderWithCode($scope.model.TicketCode, function (rs) {
                                        data = rs.data;
                                        $scope.lstStep = data.list;
                                        if (data.editrole != undefined && data.editrole != "" && data.editrole != null && data.editrole == true) {
                                            $('.detail').removeClass('dis');
                                        }
                                        else {
                                            $scope.roleedit = false;
                                            $('.detail').addClass('dis');
                                        }
                                        setTimeout(function () {
                                            $('#progressbar li').css('width', 'calc(100%/' + data.list.length + ')');
                                            $('.' + $scope.lstStep[$scope.lstStep.length - 1].IntsCode + '').addClass('end');
                                            for (var i = 0; i < $scope.lstStep.length; i++) {
                                                if ($scope.lstStep[i].Status == "STATUS_ACTIVITY_APPROVED") {
                                                    $('.' + $scope.lstStep[i].IntsCode + '').addClass('active');
                                                }
                                            }
                                            if (data.current != undefined && data.current != "" && data.current != null) {
                                                setTimeout(function () {
                                                    $('.' + data.current + '').addClass('active2');
                                                }, 5);
                                            }
                                        }, 5);

                                        if (data.com != undefined && data.com != "" && data.com != null) {
                                            $scope.lstStatus = data.com
                                        }
                                        else {
                                            $scope.check = true;
                                        }
                                    })
                                    $scope.showAct = false;
                                }
                            })
                        }
                    });
                }
            }
        }
    }

    $scope.addCustomer = function () {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderCustomer + '/add.html',
            controller: 'addCustomer',
            size: '70',
        });
        modalInstance.result.then(function (d) {
            dataserviceExp.getListCustomer(function (rs) {
                rs = rs.data;
                $scope.listCustomer = rs;
            });
        }, function () {
        });
    }

    $scope.export = function () {
        location.href = "/Admin/MaterialExpStore/ExportExcelProduct?"
            + "ticketCode=" + $scope.model.TicketCode
    }

    $scope.resetModelList = function () {
        $scope.modelList.ProductCode = "";
        $scope.modelList.QuantityExp = "";
        $scope.modelList.Unit = "";
        $scope.modelList.SalePrice = "";
    }

    function validationSelectProd(data) {
        var mess = { Status: false, Title: "" }
        if (data.ProductCode == "") {
            $scope.errorProductCode = true;
            mess.Status = true;
        } else {
            $scope.errorProductCode = false;
        }
        if (data.Unit == "") {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;
        }
        //if (data.Currency == "") {
        //    $scope.errorCurrency = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorCurrency = false;
        //}
        //if (data.SalePrice == "") {
        //    $scope.errorSalePrice = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorSalePrice = false;
        //}
        if (data.QuantityExp == "") {
            $scope.errorQuantityExp = true;
            mess.Status = true;
        } else {
            $scope.errorQuantityExp = false;
        }
        return mess;
    };

    //Print
    $scope.print = function () {
        var department = '<table style="margin-left: auto; margin-right: auto; width: 100%; height: auto;">' +
            '<tbody>' +
            '<tr>' +
            '<td style="width: 259.258px; text-align: left;" colspan="2">' +
            '<p><strong>&nbsp;</strong></p>' +
            '<p><strong>Chi nhánh: ' + $scope.infoUserExport.BranchName + '</strong></p>' +
            '</td>' +
            '</tr>' +
            '<tr>' +
            '<td style="width: 216.758px; text-align: left;">' +
            '<p><strong>Phòng ban: ' + $scope.infoUserExport.Department + '</strong></p>' +
            '</td>' +
            '</tr>' +
            '</tbody>' +
            '</table>';

        //model.TimeTicketCreate
        var infoTime = $scope.model.TimeTicketCreate.split("/");

        var header = '<table style="margin-left: auto; margin-right: auto;">' +
            '<tbody>' +
            '<tr>' +
            '<td width="198">' +
            '<p>&nbsp;</p>' +
            '</td>' +
            '<td width="250">' +
            '<p style="text-align: left;"><strong>PHIẾU XUẤT KHO</strong></p>' +
            '</td>' +
            '<td width="167">' +
            '<p>&nbsp;</p>' +
            '</td>' +
            '</tr>' +
            '<tr>' +
            '<td width="198">' +
            '<p>&nbsp;</p>' +
            '</td>' +
            '<td width="250">' +
            '<p style="text-align: left;"><em>Ngày ' + infoTime[0] + ' tháng ' + infoTime[1] + ' năm ' + infoTime[2] + ' </em></p>' +
            '</td>' +
            '<td width="167">' +
            '<p>Nợ .........................</p>' +
            '</td>' +
            '</tr>' +
            '<tr>' +
            '<td width="198">' +
            '<p>&nbsp;</p>' +
            '</td>' +
            '<td width="250">' +
            '<p style="text-align: left;">Số: <strong class="bold">' + $scope.model.TicketCode + '</strong></p>' +
            '</td>' +
            '<td width="167">' +
            '<p>Có .........................</p>' +
            '</td>' +
            '</tr>' +
            '</tbody>' +
            '</table>';

        //Info
        var givenNameUsrExp = "";
        for (var i = 0; i < $scope.listUserExport.length; i++) {
            if ($scope.model.UserExport === $scope.listUserExport[i].Code) {
                givenNameUsrExp = $scope.listUserExport[i].Name;
                break;
            }
        }
        var reasonName = "";
        for (var i = 0; i < $scope.listReason.length; i++) {
            if ($scope.model.Reason === $scope.listReason[i].Code) {
                reasonName = $scope.listReason[i].Name;
                break;
            }
        }
        var storeName = "";
        for (var i = 0; i < $scope.listStore.length; i++) {
            if ($scope.model.StoreCode === $scope.listStore[i].Code) {
                storeName = $scope.listStore[i].Name;
                break;
            }
        }

        var info = '<p style="text-align: center;">&nbsp;</p>' +
            '<p style="text-align: left;">&nbsp; - Nhân viên xuất: <strong>' + givenNameUsrExp + '</strong></p>' +
            '<p style="text-align: left;">&nbsp; - Lý do xuất kho: <strong>' + reasonName + '</strong></p>' +
            '<p style="text-align: left;">&nbsp; - Xuất tại kho: <strong>' + storeName + '</strong>........Địa điểm ...............................................</p>' +
            '<p style="text-align: left;">&nbsp; - Ghi chú: ' + $scope.model.Note + '</p>';

        var detailHeaderProd = '<table style="border-collapse: collapse;height: auto; width: 100%;" border="1">' +
            '<tbody>' +
            '<tr>' +
            '<td rowspan="2" style="width: 26.7578px; text-align: center;">' +
            '<p>STT</p>' +
            '</td>' +
            '<td rowspan="2" style="width: 193.008px; text-align: center;">' +
            '<p>Tên hàng hóa, vật tư</p>' +
            '</td>' +
            '<td rowspan="2" style="width: 40.5078px; text-align: center;">' +
            '<p>Mã số</p>' +
            '</td>' +
            '<td rowspan="2" style="width: 46.7578px; text-align: center;">' +
            '<p>Đơn vị tính</p>' +
            '</td>' +
            '<td style="width: 114.258px; text-align: center;" colspan="2">' +
            '<p>Số lượng</p>' +
            '</td>' +
            '<td rowspan="2" style="width: 69.2578px; text-align: center;">' +
            '<p>Đơn giá</p>' +
            '</td>' +
            '<td rowspan="2" style="width: 105.508px; text-align: center;">' +
            '<p>Thành tiền</p>' +
            '</td>' +
            '</tr>' +
            '<tr>' +
            '<td width="70">' +
            '<p>Yêu cầu</p>' +
            '</td>' +
            '<td width="62">' +
            '<p>Thực xuất</p>' +
            '</td>' +
            '</tr>';

        //$scope.lstProductDetail
        var detailProduct = "";
        var idx = 1;
        var total = 0;
        for (var i = 0; i < $scope.lstProductDetail.length; i++) {
            var salePrice = $scope.lstProductDetail[i].SalePrice + '';
            var totalMoney = ($scope.lstProductDetail[i].SalePrice * $scope.lstProductDetail[i].Quantity) + '';
            total += ($scope.lstProductDetail[i].SalePrice * $scope.lstProductDetail[i].Quantity);
            detailProduct += '<tr>' +
                '<td style="width: 26.7578px; text-align: center;">' +
                '<p>' + idx + '</p>' +
                '</td>' +
                '<td style="width: 193.008px; text-align: center;">' +
                '<p>' + $scope.lstProductDetail[i].ProductName + ';</p>' +
                '</td>' +
                '<td style="width: 40.5078px; text-align: center;">' +
                '<p> ' + $scope.lstProductDetail[i].ProductCode + ' </p>' +
                '</td>' +
                '<td style="width: 46.7578px; text-align: center;">' +
                '<p>' + $scope.lstProductDetail[i].Unit + '</p >' +
                '</td>' +
                '<td style="width: 50.5078px; text-align: center;">' +
                '<p>' + $scope.lstProductDetail[i].Quantity + '</p>' +
                '</td>' +
                '<td style="width: 58.0078px; text-align: center;">' +
                '<p>' + $scope.lstProductDetail[i].Quantity + '</p>' +
                '</td>' +
                '<td style="width: 69.2578px; text-align: center;">' +
                '<p>' + formatNumber(salePrice) + '</p>' +
                '</td>' +
                '<td style="width: 105.508px; text-align: center;">' +
                '<p>' + formatNumber(totalMoney) + '</p>' +
                '</td>' +
                '</tr>';
            idx++;
        }

        var endDetailProd = '</tbody>' +
            '</table >';

        //total

        var footer =
            '<p style="text-align: left;">- Tổng số tiền (viết bằng chữ): <strong>' + docso(total) + '</strong></p>' +
            '<p style="text-align: left;">- Số chứng từ gốc kèm theo:........................................................................................</p>' +
            '<table style="margin-left: auto; margin-right: auto; width: 641px; height: auto;" width="602">' +
            '<tbody>' +
            '<tr>' +
            '<td style="width: 105.508px;">' +
            '<p>&nbsp;</p>' +
            '</td>' +
            '<td style="width: 106.758px;">' +
            '<p>&nbsp;</p>' +
            '</td>' +
            '<td style="width: 406.758px;" colspan="3">' +
            '<p><em>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Ngày .... tháng .... năm ....</em></p>' +
            '</td>' +
            '</tr>' +
            '<tr>' +
            '<td style="width: 200.508px; padding-right: 10px;">' +
            '<p><strong>Người lập phiếu</strong></p>' +
            '</td>' +
            '<td style="width: 250.758px;">' +
            '<p><strong>Người nhận hàng</strong></p>' +
            '</td>' +
            '<td style="width: 200.2578px; padding-left: 20px">' +
            '<p><strong>Thủ kho</strong></p>' +
            '</td>' +
            '<td style="width: 200.508px; padding-left: 20px">' +
            '<p><strong>Kế toán trưởng </strong></p>' +
            '</td>' +
            '<td style="width: 150.508px;">' +
            '<p><strong>Giám đốc </strong></p>' +
            '</td>' +
            '</tr>' +
            '<tr>' +
            '<td style="width: 105.508px;">' +
            '<p><em>(Ký, họ tên)</em></p>' +
            '</td>' +
            '<td style="width: 106.758px;">' +
            '<p><em>(Ký, họ tên)</em></p>' +
            '</td>' +
            '<td style="width: 99.2578px;">' +
            '<p><em>(Ký, họ tên)</em></p>' +
            '</td>' +
            '<td style="width: 100.508px;">' +
            '<p><em>(Ký, họ tên)</em></p>' +
            '</td>' +
            '<td style="width: 195.508px;">' +
            '<p><em>(Ký, họ tên)</em></p>' +
            '</td>' +
            '</tr>' +
            '</tbody>' +
            '</table>' +
            '<p style="text-align: center;">&nbsp;</p>';

        var frame1 = document.createElement('iframe');
        document.body.appendChild(frame1);
        var frameDoc = frame1.contentWindow ? frame1.contentWindow : frame1.contentDocument.document ? frame1.contentDocument.document : frame1.contentDocument;

        var content = department + header + info + detailHeaderProd + detailProduct + endDetailProd + footer;

        frameDoc.document.write('<style>@page{margin: 30px;size: auto;}</style>' +
            '<body onload="window.print()">' + content + '</body>');
        frameDoc.document.close();
        setTimeout(function () {
            document.body.removeChild(frame1);
        }, 1500);
    }

    function formatNumber(n) {
        return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }
    var mangso = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    function dochangchuc(so, daydu) {
        var chuoi = "";
        chuc = Math.floor(so / 10);
        donvi = so % 10;
        if (chuc > 1) {
            chuoi = " " + mangso[chuc] + " mươi";
            if (donvi == 1) {
                chuoi += " mốt";
            }
        } else if (chuc == 1) {
            chuoi = " mười";
            if (donvi == 1) {
                chuoi += " một";
            }
        } else if (daydu && donvi > 0) {
            chuoi = " lẻ";
        }
        if (donvi == 5 && chuc > 1) {
            chuoi += " lăm";
        } else if (donvi > 1 || (donvi == 1 && chuc == 0)) {
            chuoi += " " + mangso[donvi];
        }
        return chuoi;
    }
    function docblock(so, daydu) {
        var chuoi = "";
        tram = Math.floor(so / 100);
        so = so % 100;
        if (daydu || tram > 0) {
            chuoi = " " + mangso[tram] + " trăm";
            chuoi += dochangchuc(so, true);
        } else {
            chuoi = dochangchuc(so, false);
        }
        return chuoi;
    }
    function dochangtrieu(so, daydu) {
        var chuoi = "";
        trieu = Math.floor(so / 1000000);
        so = so % 1000000;
        if (trieu > 0) {
            chuoi = docblock(trieu, daydu) + " triệu,";
            daydu = true;
        }
        nghin = Math.floor(so / 1000);
        so = so % 1000;
        if (nghin > 0) {
            chuoi += docblock(nghin, daydu) + " nghìn,";
            daydu = true;
        }
        if (so > 0) {
            chuoi += docblock(so, daydu);
        }
        return chuoi;
    }
    function docso(so) {
        if (so == 0) return mangso[0];
        var chuoi = "", hauto = "";
        do {
            ty = so % 1000000000;
            so = Math.floor(so / 1000000000);
            if (so > 0) {
                chuoi = dochangtrieu(ty, true) + hauto + chuoi;
            } else {
                chuoi = dochangtrieu(ty, false) + hauto + chuoi;
            }
            hauto = " tỷ,";
        } while (so > 0);
        return chuoi;
    }
});

app.controller('editProdCustom', function ($scope, $rootScope, $compile, $controller, $uibModal, $uibModalInstance, dataserviceMaterial, para) {
    $scope.isCustom = true;
    $rootScope.prodCustomUuid = generateUUID();
    $controller('editProd', { $scope: $scope, para: para, $uibModalInstance: $uibModalInstance });
    $scope.header = "Tùy chỉnh thiết bị xuất";
    $scope.originModel = angular.copy($scope.model);
    $scope.submit = function () {
        console.log('submit custom');
        if ($rootScope.listProductAttributes) {
            $scope.model.ListProductAttributes = $rootScope.listProductAttributes;
        }
        if ($rootScope.listProductComponents) {
            $scope.model.listProductComponents = $rootScope.listProductComponents;
        }
        var diffObj = diff($scope.originModel, $scope.model);
        $uibModalInstance.close(diffObj);
    }
    function diff(obj1, obj2) {
        const result = {};
        if (Object.is(obj1, obj2)) {
            return undefined;
        }
        if (!obj2 || typeof obj2 !== 'object') {
            return obj2;
        }
        Object.keys(obj1 || {}).concat(Object.keys(obj2 || {})).forEach(key => {
            if (obj2[key] !== obj1[key] && !Object.is(obj1[key], obj2[key])) {
                result[key] = obj2[key];
            }
            if (typeof obj2[key] === 'object' && typeof obj1[key] === 'object') {
                const value = diff(obj1[key], obj2[key]);
                if (value !== undefined) {
                    result[key] = value;
                }
            }
        });
        return result;
    }
    //Load init date
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.Unit == "") {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;

        }
        if (data.ImpType == "" || data.ImpType == null) {
            $scope.errorImpType = true;
            mess.Status = true;
        } else {
            $scope.errorImpType = false;
        }
        if (data.GroupCode == "") {
            $scope.errorGroupCode = true;
            mess.Status = true;
        } else {
            $scope.errorGroupCode = false;

        }
        if (data.TypeCode == "") {
            $scope.errorTypeCode = true;
            mess.Status = true;
        } else {
            $scope.errorTypeCode = false;
        }
        if ($rootScope.patternPacking.test(data.Packing)) {
            $scope.errorPacking = false;
        } else {
            mess.Status = true;
            $scope.errorPacking = true;
        }
        //if (data.Size != null && data.Size != '' && data.Size != undefined) {
        //    var partternSize = /^[0-9]*(\s)?(x|X|\*)(\s)?[0-9]*$/;
        //    if (!partternSize.test(data.Size)) {
        //        mess.Title = mess.Title.concat(" - ", caption.MLP_VALIDATE_SIZE_FORMAT, "<br/>");
        //        $scope.errorSize = true;
        //        mess.Status = true;
        //    } else {
        //        $scope.errorSize = false;
        //    }
        //} else {
        //    $scope.errorSize = false;
        //}
        return mess;
    };
    function loadDate() {
        $("#ForeCastTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        //var today = new Date(new Date());
        //$('#ForeCastTime').datepicker('setStartDate', today);
        //$('#ForeCastTime').datepicker('update', new Date());
        //$('#ForeCastTime').datepicker('setEndDate', today);
        //$scope.model.TimeTicketCreate = $filter('date')(new Date(today), 'dd/MM/yyyy');
        //$('#ForeCastTime').datepicker('setStartDate', today);

        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }
    function ckEditer() {
        var editor = CKEDITOR.replace('ckEditorItem', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
    }

    setTimeout(function () {
        //loadDate();
        //ckEditer();
    }, 200);
});

app.controller('viewProdCustom', function ($scope, $rootScope, $compile, $controller, $uibModal, $uibModalInstance, dataserviceMaterial, para) {
    $scope.isCustom = true;
    $scope.viewCustom = true;
    $controller('editProd', { $scope: $scope, para: para, $uibModalInstance: $uibModalInstance });
    $scope.header = "Xem tùy chỉnh thiết bị xuất";
    $scope.originModel = angular.copy($scope.model);
    $scope.prodCustomJson = para.ProdCustomJson;
    $scope.submit = function () {
        //console.log('submit custom');
        //var diffObj = diff($scope.originModel, $scope.model);
        //$uibModalInstance.close(diffObj);
    }
    function diff(obj1, obj2) {
        const result = {};
        if (Object.is(obj1, obj2)) {
            return undefined;
        }
        if (!obj2 || typeof obj2 !== 'object') {
            return obj2;
        }
        Object.keys(obj1 || {}).concat(Object.keys(obj2 || {})).forEach(key => {
            if (obj2[key] !== obj1[key] && !Object.is(obj1[key], obj2[key])) {
                result[key] = obj2[key];
            }
            if (typeof obj2[key] === 'object' && typeof obj1[key] === 'object') {
                const value = diff(obj1[key], obj2[key]);
                if (value !== undefined) {
                    result[key] = value;
                }
            }
        });
        return result;
    }
    //Load init date
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.Unit == "") {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;

        }
        if (data.ImpType == "" || data.ImpType == null) {
            $scope.errorImpType = true;
            mess.Status = true;
        } else {
            $scope.errorImpType = false;
        }
        if (data.GroupCode == "") {
            $scope.errorGroupCode = true;
            mess.Status = true;
        } else {
            $scope.errorGroupCode = false;

        }
        if (data.TypeCode == "") {
            $scope.errorTypeCode = true;
            mess.Status = true;
        } else {
            $scope.errorTypeCode = false;
        }
        if ($rootScope.patternPacking.test(data.Packing)) {
            $scope.errorPacking = false;
        } else {
            mess.Status = true;
            $scope.errorPacking = true;
        }
        //if (data.Size != null && data.Size != '' && data.Size != undefined) {
        //    var partternSize = /^[0-9]*(\s)?(x|X|\*)(\s)?[0-9]*$/;
        //    if (!partternSize.test(data.Size)) {
        //        mess.Title = mess.Title.concat(" - ", caption.MLP_VALIDATE_SIZE_FORMAT, "<br/>");
        //        $scope.errorSize = true;
        //        mess.Status = true;
        //    } else {
        //        $scope.errorSize = false;
        //    }
        //} else {
        //    $scope.errorSize = false;
        //}
        return mess;
    };
    function loadDate() {
        $("#ForeCastTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        //var today = new Date(new Date());
        //$('#ForeCastTime').datepicker('setStartDate', today);
        //$('#ForeCastTime').datepicker('update', new Date());
        //$('#ForeCastTime').datepicker('setEndDate', today);
        //$scope.model.TimeTicketCreate = $filter('date')(new Date(today), 'dd/MM/yyyy');
        //$('#ForeCastTime').datepicker('setStartDate', today);

        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }
    function ckEditer() {
        var editor = CKEDITOR.replace('ckEditorItem', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
    }

    setTimeout(function () {
        //loadDate();
        //ckEditer();
    }, 200);
});

app.controller('choiseProduct', function ($scope, $rootScope, $compile, $uibModal, $confirm, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, dataserviceExp, para) {
    var vm = $scope;
    //Khởi tạo
    $scope.modelShow = {
        ProductQrCode: ''
    };

    $scope.isAdd = true;
    $scope.model = {};
    $scope.model.ListProduct = [];
    $scope.modelList = {
        ProductCode: '',
        ProductName: '',
        RackCode: '',
        RackName: '',
        ProductQrCode: '',
        sProductQrCode: '',
        Quantity: null,
        Unit: '',
        UnitName: '',
    };

    $scope.listCoil = [];
    $scope.listCoilChoose = [];

    $scope.init = function () {
        if (para.Product.Quantity != undefined && para.Product.Quantity != null && para.Product.Quantity > 0) {
            $scope.model.QuantityTotal = para.Product.Quantity;
            $scope.model.QuantityOrder = para.Product.QuantityOrder;
            $scope.model.QuantityNeedExport = para.Product.QuantityOrder - para.Product.Quantity;
            //$scope.model.ListProduct = para.Product.ListProductInRack;
        }
        else {
            $scope.model.QuantityTotal = 0;
            $scope.model.QuantityOrder = para.Product.QuantityOrder;
            $scope.model.QuantityNeedExport = para.Product.QuantityOrder;
            //$scope.model.ListProduct = [];
        }

    }
    $scope.init();
    $scope.modelDisable = true;
    $scope.maxQuantity = 0;

    $scope.initLoad = function () {
        dataserviceExp.getListUnit(function (rs) {
            rs = rs.data;
            $scope.listUnit = rs;
        });
        dataserviceExp.getListProduct4QrCode(para.StoreCode, para.Product.ProductCode, para.Product.ProductType, function (rs) {
            rs = rs.data;
            $scope.listProduct = rs;
        });
        dataserviceExp.getListGridProduct(para.Model.TicketCode, para.Product.ProductCode, para.Product.ProductType, function (rs) {
            rs = rs.data;
            $scope.model.ListProduct = rs;
        });
    }
    $scope.initLoad();
    //Hết khởi tạo

    $scope.reloadGrid = function (param1, param2, param3) {
        dataserviceExp.getListGridProduct(para.Model.TicketCode, para.Product.ProductCode, para.Product.ProductType, function (rs) {
            rs = rs.data;
            $scope.model.ListProduct = rs;
        });
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
        $rootScope.refeshData($rootScope.rootId);
        //$rootScope.reloadRoot();
    }

    //Hàm add sản phẩm vào list chi tiết
    $scope.add = function () {
        //Check null
        if ($scope.modelList.ProductCode == undefined || $scope.modelList.ProductCode == null || $scope.modelList.ProductCode == '' ||
            //$scope.modelList.RackCode == undefined || $scope.modelList.RackCode == null || $scope.modelList.RackCode == '' ||
            $scope.modelList.ProductLot == undefined || $scope.modelList.ProductLot == null || $scope.modelList.ProductLot == '' ||
            $scope.modelList.ProductCoil == undefined || $scope.modelList.ProductCoil == null || $scope.modelList.ProductCoil == '' ||
            $scope.modelList.Quantity == undefined || $scope.modelList.Quantity == null || $scope.modelList.Quantity == 0
        ) {
            App.toastrError(caption.MES_MSG_ENTER_INFO_REQUIRED);
        }
        else {
            if ($scope.modelList.Quantity > $scope.model.QuantityNeedExport) {
                App.toastrError(caption.MES_MSG_TOTAL_GREATER_THAN_EXP);
            }
            else {

                if ($scope.modelList.Quantity > $scope.maxQuantity) {
                    App.toastrError(caption.MES_MSG_AMOUNT_PRODUCT_ENTER);
                }
                else {
                    var addItem = {
                        TicketCode: para.Model.TicketCode,
                        ProductCoil: $scope.modelList.ProductCoil,
                        ProductLot: $scope.modelList.ProductLot,
                        ProductCode: $scope.modelList.ProductCode,
                        ProductType: $scope.modelList.ProductType,
                        ProductName: $scope.modelList.ProductName,
                        ProductQrCode: $scope.modelList.ProductQrCode,
                        sProductQrCode: $scope.modelList.sProductQrCode,
                        RackCode: $scope.modelList.RackCode,
                        RackName: $scope.modelList.RackName,
                        Quantity: $scope.modelList.Quantity,
                        Unit: $scope.modelList.Unit,
                        UnitName: $scope.modelList.UnitName,
                    };

                    dataserviceExp.insertDetailProductCoid(addItem, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            $scope.reloadGrid(addItem.TicketCode, addItem.ProductCode, addItem.ProductType);

                            //Thay đổi các giá trị tổng
                            $scope.model.QuantityTotal = $scope.model.QuantityTotal + addItem.Quantity;
                            $scope.model.QuantityNeedExport = $scope.model.QuantityNeedExport - addItem.Quantity;
                            $scope.maxQuantity = $scope.maxQuantity - addItem.Quantity;

                            var elementCheckListCoil = $scope.listCoil.find(function (element) {
                                if (element.ProductCoil == $scope.modelList.ProductCoil) {

                                    if (element.Remain == $scope.modelList.Quantity) {
                                        element.Remain = 0;
                                        //$scope.modelList.Quantity = 0;

                                        var index = $scope.listCoil.indexOf(element);
                                        $scope.listCoilChoose.push(element);
                                        $scope.listCoil.splice(index, 1);
                                    }

                                    if (element.Remain > $scope.modelList.Quantity) {
                                        element.Remain = element.Remain - $scope.modelList.Quantity;
                                        //$scope.modelList.Quantity = element.Remain - $scope.modelList.Quantity;
                                    }
                                    return element;
                                }
                            });

                            $scope.modelList.Quantity = $scope.model.QuantityNeedExport;

                            App.toastrSuccess(rs.Title);
                        }
                    });
                }
            }
        }
    }
    ////Hàm edit sản phẩm
    //$scope.edit = function (item, index) {
    //    
    //    $scope.isAdd = false;

    //    //Thay đổi các giá trị tổng
    //    //$scope.model.QuantityTotal = $scope.model.QuantityTotal - item.Quantity;
    //    $scope.model.QuantityNeedExport = $scope.model.QuantityNeedExport + item.Quantity;
    //    ////$scope.modelList.Quantity = $scope.model.QuantityNeedExport;

    //    //Lấy ra list ProductLot
    //    dataserviceExp.getListProductLot(item.ProductCode, para.StoreCode, function (rs) {rs=rs.data;
    //        $scope.listLot = rs.Object;
    //    });

    //    //Lấy ra list CoilCode
    //    dataserviceExp.getPositionProductCode(item.ProductCode, item.ProductLot, para.StoreCode, function (rs) {rs=rs.data;
    //        if (!rs.Error) {
    //            $scope.listCoil = rs.Object;

    //            //lấy giá trị max Quantity
    //            angular.forEach($scope.listCoil, function (value, key) {
    //                if (value.ProductCoil == item.ProductCoil) {
    //                    $scope.maxQuantity = value.Remain + item.Quantity;
    //                }
    //            })
    //        }
    //    });

    //    //Lấy lại giá trị model đưa lên chỗ add
    //    $scope.modelList.ProductCode = item.ProductCode;
    //    $scope.modelList.ProductType = item.ProductType;
    //    $scope.modelList.ProductName = item.ProductName;
    //    $scope.modelList.ProductCoil = item.ProductCoil;
    //    $scope.modelList.ProductLot = item.ProductLot;
    //    $scope.modelList.ProductQrCode = item.ProductQrCode;
    //    $scope.modelList.sProductQrCode = item.sProductQrCode;
    //    $scope.modelList.RackCode = item.RackCode;
    //    $scope.modelList.RackName = item.RackName;
    //    $scope.modelList.Quantity = item.Quantity;
    //    $scope.modelList.Unit = item.Unit;
    //    $scope.modelList.UnitName = item.UnitName;
    //}
    //$scope.close = function (id) {
    //    $scope.isAdd = true;
    //    $scope.modelList = {
    //        ProductCode: '',
    //        ProductName: '',
    //        RackCode: '',
    //        RackName: '',
    //        ProductQrCode: '',
    //        sProductQrCode: '',
    //        Quantity: null,
    //        Unit: '',
    //        UnitName: '',
    //    };
    //    $scope.init();
    //    $scope.initLoad();
    //}
    //Hàm remove sản phẩm
    $scope.removeItem = function (item, index) {
        dataserviceExp.deleteDetailProductCoid(item.Id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.reloadGrid(item.TicketCode, item.ProductCode, item.ProductType);

                //Lấy lại giá trị model vừa xóa đưa lên chỗ add
                $scope.modelList.ProductCode = item.ProductCode;
                $scope.modelList.ProductType = item.ProductType;
                $scope.modelList.ProductName = item.ProductName;
                $scope.modelList.ProductCoil = item.ProductCoil;
                $scope.modelList.ProductLot = item.ProductLot == undefined ? '' : item.ProductLot;
                $scope.modelList.ProductQrCode = item.ProductQrCode;
                $scope.modelList.sProductQrCode = item.sProductQrCode;
                $scope.modelList.RackCode = item.RackCode;
                $scope.modelList.RackName = item.RackName;
                $scope.modelList.Quantity = item.Quantity;
                $scope.modelList.Unit = item.Unit;
                $scope.modelList.UnitName = item.UnitName;

                //Thay đổi các giá trị tổng
                $scope.model.QuantityTotal = $scope.model.QuantityTotal - item.Quantity;
                $scope.model.QuantityNeedExport = $scope.model.QuantityNeedExport + item.Quantity;
                //$scope.modelList.Quantity = $scope.model.QuantityNeedExport;

                //Lấy ra list ProductLot
                dataserviceExp.getListProductLot($scope.modelList.ProductCode, para.StoreCode, function (rs) {
                    rs = rs.data;
                    $scope.listLot = rs.Object;
                });

                //Lấy ra list CoidCode
                dataserviceExp.getPositionProductCode($scope.modelList.ProductCode, $scope.modelList.ProductLot, para.StoreCode, function (rs) {
                    rs = rs.data;
                    if (!rs.Error) {
                        $scope.listCoil = rs.Object;

                        //lấy giá trị max Quantity
                        angular.forEach($scope.listCoil, function (value, key) {

                            if (value.ProductCoil == $scope.modelList.ProductCoil) {
                                $scope.maxQuantity = value.Remain;
                            }
                        })

                    }
                });

                App.toastrSuccess(rs.Title);
            }
        });
    }

    //Action khi chọn 1 combobox
    $scope.changleSelect = function (SelectType, item) {
        if (SelectType == "ProductQrCode") {
            $scope.modelList.Unit = item.Unit;
            $scope.modelList.UnitName = item.UnitName;
            $scope.modelList.ProductCode = item.ProductCode;
            $scope.modelList.ProductName = item.Name;
            $scope.modelList.ProductType = item.ProductType;
            $scope.modelList.SupCode = item.SupCode;
            $scope.modelList.SupName = item.SupName;

            //Xóa vị trí kệ, số lượng
            $scope.modelList.Quantity = null;
            $scope.modelList.RackCode = '';
            $scope.modelList.RackName = '';
            $scope.maxQuantity = 0;

            //Show label QR_Code sản phẩm
            $scope.modelShow.ProductQrCode = item.Code;

            dataserviceExp.getListRackCode($scope.modelList.ProductQrCode, function (rs) {
                rs = rs.data;
                $scope.listRackCode = rs;
            });

            dataserviceExp.getListProductLot($scope.modelList.ProductCode, para.StoreCode, function (rs) {
                rs = rs.data;
                $scope.listLot = rs.Object;
                $scope.modelList.ProductLot = '';
            });
        }

        if (SelectType == "ProductLot") {
            dataserviceExp.getListRackCode($scope.modelList.ProductQrCode, function (rs) {
                rs = rs.data;
                $scope.listRackCode = rs;
            });

            dataserviceExp.getPositionProductCode($scope.modelList.ProductCode, item.Code, para.StoreCode, function (rs) {
                rs = rs.data;
                if (!rs.Error) {
                    $scope.listCoil = rs.Object;
                    $scope.modelList.ProductCoil = '';

                    //if ($scope.model.ListProduct.length > 0) {
                    //    for (var i = 0; i < $scope.model.ListProduct.length; i++) {

                    //        var elementCheckListCoil = $scope.listCoil.find(function (element) {
                    //            if (element.ProductCoil == $scope.model.ListProduct[i].ProductCoil) {
                    //                if (element.Remain == $scope.modelList.Quantity) {
                    //                    element.Remain = 0;
                    //                    $scope.modelList.Quantity = 0;

                    //                    var index = $scope.listCoil.indexOf(element);
                    //                    $scope.listCoil.splice(index, 1);
                    //                }
                    //                else if (element.Remain > $scope.modelList.Quantity) {
                    //                    element.Remain = element.Remain - $scope.modelList.Quantity;
                    //                    $scope.modelList.Quantity = element.Remain - $scope.modelList.Quantity;
                    //                }

                    //                return element;
                    //            }
                    //        });
                    //    }
                    //}
                }
            });
        }

        if (SelectType == "ProductCoil") {
            $scope.modelList.ProductCoil = item.ProductCoil;
            $scope.modelList.RackCode = item.RackCode;
            $scope.modelList.RackName = item.PositionInStore;
            $scope.modelList.ProductQrCode = item.ProductQrCode;
            $scope.modelList.Quantity = item.Remain;
            $scope.maxQuantity = item.Remain;
            angular.forEach($scope.listRackCode, function (value, key) {
                if (value.Code == $scope.modelList.RackCode) {
                    $scope.modelList.RackName = value.Name;
                }
            })

            dataserviceExp.generatorQRCode($scope.modelList.ProductQrCode, function (result) {
                result = result.data;
                $scope.modelList.sProductQrCode = result;
            });
        }
        if (SelectType == "RackCode") {
            $scope.modelList.RackCode = item.Code;
            $scope.modelList.RackName = item.Name;
            $scope.modelList.Quantity = item.Quantity;
            $scope.maxQuantity = item.Quantity;
        }
    }
    $scope.viewQrCode = function (code) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderQrCode + '/qrViewerBase64.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
                $scope.data = code;
                setTimeout(function () {
                    setModalDraggable('.modal-dialog');
                }, 200);
            },
            backdrop: 'static',
            size: '25',
        });
    }

    //Validate UiSelect
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }

        return mess;
    };
    function loadPoper() {
        $('[data-toggle="popover"]').popover()
    }

    //$scope.submit = function () {
    //    validationSelect($scope.model);
    //    if ($scope.model.ListProduct.length == 0) {
    //        App.toastrError(caption.MES_MSG_CHOSE_PRODUCT_WARE_HOURE);
    //        return;
    //    }
    //    if ($scope.model.QuantityTotal > para.Product.QuantityMax) {
    //        App.toastrError('Số lượng tổng cộng vượt quá lượng cần phải xuất.');
    //        return;
    //    }
    //    dataserviceExp.update(para.Model, function (rs) {rs=rs.data;
    //        if (rs.Error) {
    //            App.toastrError('Cập nhật thất bại');
    //        } else {
    //            App.toastrSuccess('Cập nhật thành công');
    //            $rootScope.refeshData($rootScope.rootId);
    //        }
    //    });
    //}
    setTimeout(function () {
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
        loadPoper();
    }, 200);
});

app.controller('reportInStock', function ($scope, $rootScope, $compile, $uibModal, $confirm, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, dataserviceExp, para) {
    var vm = $scope;
    $scope.model = {};

    $scope.listCoil = [];

    $scope.initLoad = function () {

        //if (para.Product.ListProductInRack.length > 0) {
        //    var productQrCode = para.Product.ListProductInRack[0].ProductQrCode;
        var productQrCode = para.ProductQrCode;
        dataserviceExp.getListCoilByProdQrCode(para.StoreCode, para.Product.ProductCode, para.Product.ProductType, productQrCode, function (rs) {
            rs = rs.data;
            $scope.listCoil = [];
            $scope.QuantityExpTotal = 0;
            $scope.RemainTotal = 0;
            if (rs.Object.length > 0) {
                for (var j = 0; j < rs.Object.length; j++) {
                    rs.Object[j].ValueCoil = rs.Object[j].Size;
                    rs.Object[j].QuantityExp = rs.Object[j].Size - rs.Object[j].Remain;
                    rs.Object[j].StoreCode = rs.Object[j].RackCode.split("_")[rs.Object[j].RackCode.split("_").length - 1];
                    var store = $rootScope.MapStores[rs.Object[j].StoreCode];
                    if (store != undefined) {
                        rs.Object[j].StoreName = store.Name;
                    }

                    var productCoil = rs.Object[j].ProductCoil;
                    rs.Object[j].RuleCoil = productCoil.split("_")[productCoil.split("_").length - 2];

                    if (rs.Object[j].StoreCode == para.StoreCode) {

                        $scope.QuantityExpTotal = $scope.QuantityExpTotal + rs.Object[j].QuantityExp;
                        $scope.RemainTotal = $scope.RemainTotal + rs.Object[j].Remain;

                        $scope.listCoil.push(rs.Object[j]);
                    }
                }
            }
        });
        //}
    }
    $scope.initLoad();
    //Hết khởi tạo

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    function loadPoper() {
        $('[data-toggle="popover"]').popover()
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        loadPoper();
    }, 200);
});

app.controller('reportLotInStock', function ($scope, $rootScope, $compile, $uibModal, $confirm, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, dataserviceExp, para) {
    var vm = $scope;
    $scope.model = {};

    $scope.listLot = [];

    $scope.initLoad = function () {
        dataserviceExp.getListLotByProdQrCode(para.StoreCode, para.Product.ProductCode, para.Product.ProductType, para.ProductQrCode, function (rs) {
            rs = rs.data;
            $scope.listLot = [];
            $scope.QuantityTotal = 0;
            $scope.QuantityUnitTotal = 0;
            if (rs.Object.length > 0) {
                for (var j = 0; j < rs.Object.length; j++) {
                    var store = $rootScope.MapStores[rs.Object[j].StoreCode];
                    if (store != undefined) {
                        rs.Object[j].StoreName = store.Name;
                    }

                    $scope.QuantityTotal = $scope.QuantityTotal + rs.Object[j].Quantity;
                    $scope.QuantityUnitTotal = $scope.QuantityUnitTotal + rs.Object[j].QuantityUnit;

                    $scope.listLot.push(rs.Object[j]);
                }
            }
        });
    }
    $scope.initLoad();
    //Hết khởi tạo

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    function loadPoper() {
        $('[data-toggle="popover"]').popover()
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        loadPoper();
    }, 200);
});

app.controller('showLog', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataserviceExp, $timeout, para) {
    var data = JSON.parse(para);
    //$scope.logs = [];
    //if (data != null) {
    //    for (var i = 0; i < data.length; ++i) {
    //        var obj = {
    //            CreatedTime: data[i].Header.UpdatedTime != null ? $filter('date')(new Date(data[i].Header.UpdatedTime), 'dd/MM/yyyy HH:mm:ss') : $filter('date')(new Date(data[i].Header.CreatedTime), 'dd/MM/yyyy HH:mm:ss'),
    //            CreatedBy: data[i].Header.UpdatedBy != null ? data[i].Header.UpdatedBy : data[i].Header.CreatedBy,
    //            Body: data[i]
    //        }

    //        $scope.logs.push(obj);
    //    }
    //}
    $scope.obj = { data: data, options: { mode: 'code' } };
    $scope.onLoad = function (instance) {
        instance.expandAll();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    setTimeout(function () {
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 1);
});

app.controller('ticket-exp-attr-value', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceExp, $filter, para) {
    $scope.model = {
        AttrCode: "",
        Value: ''
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.initData = function () {
        dataserviceExp.getAttrProduct(para.ProductCode, function (rs) {
            rs = rs.data;
            $scope.listAttr = rs;
        })
        dataserviceExp.getAttrUnit(function (rs) {
            rs = rs.data;
            $scope.lstUnit = rs;
        })
        dataserviceExp.getAttrValue(para.TicketCode, para.ProductCode, function (rs) {
            rs = rs.data;
            $scope.lstAttrValue = rs;
        })
    }
    //$scope.initData();
    $scope.changeSelect = function (selectType, item) {
        if ($scope.model.AttrCode != "") {

            $scope.model.Unit = item.Unit;
        }
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if (!validationSelect($scope.model).Status) {
            var data = {
                TicketImpCode: para.TicketCode,
                ProdCode: para.ProductCode,
                Code: $scope.model.AttrCode,
                Value: $scope.model.Value,
                Unit: $scope.model.Unit
            };

            dataserviceExp.insertAttrValue(data, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);

                    dataserviceExp.getAttrValue(para.TicketCode, para.ProductCode, function (rs) {
                        rs = rs.data;
                        $scope.lstAttrValue = rs;
                    })
                }
            })
        }
    }

    $scope.changeValue = function (type) {
        if ($scope.model.Value != "" || $scope.model.Value != null || $scope.model.Value != undefined) {
            $scope.errorValue = false;
        } else {
            $scope.errorValue = true;
        }

    }
    $scope.changeSelect = function (type) {
        if (type == "AttrCode") {
            if ($scope.model.AttrCode != "") {
                $scope.errorAttrCode = false;
            } else {
                $scope.errorAttrCode = true;
            }
        }
    }


    function validationSelect(data) {
        var mess = { Status: false, Title: "" }

        if (data.Value == "") {
            $scope.errorValue = true;
            mess.Status = true;
        } else {
            $scope.errorValue = false;
        }
        if (data.AttrCode == "") {
            $scope.errorAttrCode = true;
            mess.Status = true;
        } else {
            $scope.errorAttrCode = false;
        }
        return mess;
    }
    $scope.delete = function (id) {
        dataserviceExp.deleteAttrValue(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                dataserviceExp.getAttrValue(para.TicketCode, para.ProductCode, function (rs) {
                    rs = rs.data;
                    $scope.lstAttrValue = rs;
                });
            }
        });
    };

    // handle click and add class
    var str = "A x 12 B x 4 C x 5 D";


    JsonSpecification(str);

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
