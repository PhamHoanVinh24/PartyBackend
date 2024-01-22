var ctxfolderImpStore = "/views/admin/productSettingWarning";
var ctxfolderMessage = "/views/message-box";
var ctxfolderQrCode = "/views/admin/edmsQRCodeManager";
var ctxfolderCommonSetting = "/views/admin/commonSetting";
var app = angular.module('App_ESEIM_SETTING', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber', 'ng.jsoneditor', 'monospaced.qrcode'])
    .directive('customOnChange', function () {
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

app.service('myService', function () {
    var data;
    this.setData = function (d) {
        data = d;
    }
    this.getData = function () {
        return data;
    }
});

app.factory('dataserviceSetting', function ($http) {
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
        calculateCurrentQuantity: function (callback) {
            $http.put('/Admin/ProductSettingWarning/CalculateCurrentQuantity').then(callback);
        },
        getProductDetail: function (data, callback) {
            $http.get('/Admin/ProductImport/GetProductDetail?ticketCode=' + data).then(callback);
        },
        getWarningType: function (callback) {
            $http.get('/Admin/ProductSettingWarning/GetWarningType').then(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/ProductSettingWarning/GetItem?id=' + data).then(callback);
        },
        GetTicketcode: function (data, callback) {
            $http.get('/Admin/ProductImport/getTicket?product=' + data).then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/ProductSettingWarning/Insert', data, {
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
            $http.put('/Admin/ProductSettingWarning/Update', data, {
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
            $http.delete('/Admin/ProductSettingWarning/Deletes', data, {
                beforeSend: function () {
                    App.blockUI({
                        target: ".message-body",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI(".message-body");
                }
            }).then(callback);
        },
        deleteWithId: function (data, callback) {
            $http.delete('/Admin/ProductSettingWarning/Delete?id=' + data, {
                beforeSend: function () {
                    App.blockUI({
                        target: ".message-body",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI(".message-body");
                }
            }).then(callback);
        },
        getUnit: function (data, callback) {
            $http.get('/Admin/ProductImport/GetUnit?impCode=' + data).then(callback);
        },
        getStore: function (callback) {
            $http.post('/Admin/ProductImport/GetStore').then(callback);
        },
        getUser: function (callback) {
            $http.post('/Admin/ProductImport/GetUser').then(callback);
        },
        getSupplier: function (callback) {
            $http.post('/Admin/ProductImport/Getsupplier').then(callback);
        },

        getListLotProduct: function (callback) {
            $http.post('/Admin/ProductImport/GetListLotProduct').then(callback);
        },
        getListLotProduct4Update: function (data, callback) {
            $http.post('/Admin/ProductImport/GetListLotProduct4Update?lotProductCode=' + data).then(callback);
        },
        getListStore: function (callback) {
            $http.post('/Admin/ProductImport/GetListStore').then(callback);
        },
        getListSupplier: function (callback) {
            $http.post('/Admin/ProductImport/GetListSupplier').then(callback);
        },
        getListUserImport: function (callback) {
            $http.post('/Admin/ProductImport/GetListUserImport').then(callback);
        },
        getListProdStatus: function (callback) {
            $http.post('/Admin/ProductImport/GetListProdStatus').then(callback);
        },
        getListReason: function (callback) {
            $http.post('/Admin/ProductImport/GetListReason').then(callback);
        },
        getListCurrency: function (callback) {
            $http.post('/Admin/ProductImport/GetListCurrency').then(callback);
        },
        getListProduct: function (callback) {
            $http.post('/Admin/ProductImport/GetListProduct').then(callback);
        },
        getListComponent: function (data, callback) {
            $http.post('/Admin/ProductImport/GetListComponent', data).then(callback);
        },
        getListAttribute: function (data, callback) {
            $http.post('/Admin/ProductImport/GetListAttribute', data).then(callback);
        },
        getMappingJson: function (data, callback) {
            $http.post('/Admin/ProductImport/GetMappingJson?parentMappingId=' + data).then(callback);
        },
        getListProductCategory: function (data, data1, data2, callback) {
            $http.post('/Admin/ProductImport/GetListProductCategory?pageNo=' + data + '&pageSize=' + data1 + '&content=' + data2).then(callback);
        },
        getListProductMapping: function (data, data1, data2, callback) {
            $http.post('/Admin/ProductImport/GetListProductMapping?pageNo=' + data + '&pageSize=' + data1 + '&content=' + data2).then(callback);
        },
        getListUnit: function (callback) {
            $http.post('/Admin/ProductImport/GetListUnit').then(callback);
        },
        getListPaymentStatus: function (callback) {
            $http.post('/Admin/ProductImport/GetListPaymentStatus').then(callback);
        },
        getLotProduct: function (data, callback) {
            $http.post('/Admin/ProductImport/GetLotProduct?lotProductCode=' + data).then(callback);
        },
        ////lấy giá của 1 sản phẩm
        //getSalePrice: function (data, callback) {
        //    $http.post('/Admin/ProductImport/GetSalePrice?qrCode=' + data).then(callback);
        //},
        //tạo mã QR_Code
        generatorQRCode: function (data, callback) {
            $http.post('/Admin/ProductImport/GeneratorQRCode?code=' + data).then(callback);
        },

        getListLine: function (data, callback) {
            $http.get('/Admin/ProductImport/GetListLine?storeCode=' + data, callback).then(callback);
        },
        getListRackByLineCode: function (data, callback) {
            $http.get('/Admin/ProductImport/GetListRackByLineCode?lineCode=' + data, callback).then(callback);
        },
        getListProductInStore: function (data, callback) {
            $http.get('/Admin/ProductImport/GetListProductInStore?rackCode=' + data, callback).then(callback);
        },
        getQuantityEmptyInRack: function (data, callback) {
            $http.get('/Admin/ProductImport/GetQuantityEmptyInRack?rackCode=' + data, callback).then(callback);
        },
        orderingProductInStore: function (data, callback) {
            $http.post('/Admin/ProductImport/OrderingProductInStore', data, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#modal-body",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#modal-body");
                }
            }).then(callback);
        },
        deleteProductInStore: function (data, callback) {
            $http.get('/Admin/ProductImport/DeleteProductInStore?id=' + data, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#modal-body",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#modal-body");
                }
            }).then(callback);
        },
        checkProductInStore: function (data, callback) {
            $http.get('/Admin/ProductImport/CheckProductInStore?idImportProduct=' + data, callback).then(callback);
        },
        checkProductInStoreCoil: function (productQrCode, coilCode, callback) {
            $http.get('/Admin/ProductImport/CheckProductInStoreCoil?productQrCode=' + productQrCode + '&&coilCode=' + coilCode, callback).then(callback);
        },
        checkProductCoilOrderingStore: function (productQrCode, callback) {
            $http.get('/Admin/ProductImport/CheckProductCoilOrderingStore?productQrCode=' + productQrCode, callback).then(callback);
        },
        checkQuantityMaxProductInStore: function (data, callback) {
            $http.get('/Admin/ProductImport/CheckQuantityMaxProductInStore?productQrCode=' + data, callback).then(callback);
        },
        getPositionProduct: function (productQrCode, productCoil, callback) {
            $http.get('/Admin/ProductImport/GetPositionProduct?productQrCode=' + productQrCode + '&&productCoil=' + productCoil, callback).then(callback);
        },
        getProductNotInStore: function (productQrCode, productCoil, callback) {
            $http.get('/Admin/ProductImport/GetProductNotInStore?productQrCode=' + productQrCode + '&&productCoil=' + productCoil, callback).then(callback);
        },
        checkProductInExpTicket: function (data, callback) {
            $http.get('/Admin/ProductImport/CheckProductInExpTicket?productQrCode=' + data, callback).then(callback);
        },
        getUpdateLog: function (data, callback) {
            $http.post('/Admin/ProductImport/GetUpdateLog?ticketCode=' + data).then(callback);
        },

        getListProductRelative: function (callback) {
            $http.post('/Admin/ProductImport/GetListProductRelative').then(callback);
        },

        //Tạo mã ticket code
        createTicketCode: function (data, callback) {
            $http.post('/Admin/ProductImport/CreateTicketCode?type=' + data).then(callback);
        },
        countCoil: function (callback) {
            $http.post('/Admin/ProductImport/CountCoil').then(callback);
        },
        setCoilInStore: function (id, data, callback) {
            $http.get('/Admin/ProductImport/SetCoilInStore?id=' + id + "&&rackCode=" + data).then(callback);
        },
        setCoilInStore: function (id, data, callback) {
            $http.get('/Admin/ProductImport/GetPositionInfo?rackCode=' + data).then(callback);
        },

        getListCoilByProdQrCode: function (ticketCode, productQrCode, callback) {
            $http.get('/Admin/ProductImport/GetListCoilByProdQrCode?ticketCode=' + ticketCode + '&&productQrCode=' + productQrCode).then(callback);
        },
        getListCustomers: function (callback) {
            $http.post('/Admin/Project/GetListCustomers/').then(callback);
        },
        getContractPoBuyer: function (callback) {
            $http.post('/Admin/Project/GetContractPoBuyer/').then(callback);
        },

        //Commonseting reason
        getDataTypeCommon: function (callback) {
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
        getCurrency: function (callback) {
            $http.post('/Admin/CardJob/GetCurrency').then(callback);
        },
        getProductUnit: function (callback) {
            $http.post('/Admin/materialProduct/GetProductUnit/').then(callback);
        },

        //Insert detail
        insertDetail: function (data, callback) {
            $http.post('/Admin/ProductImport/InsertDetail', data).then(callback);
        },
        getProductDetail: function (data, callback) {
            $http.get('/Admin/ProductImport/GetProductDetail?ticketCode=' + data).then(callback);
        },
        deleteDetail: function (data, callback) {
            $http.post('/Admin/ProductImport/DeleteDetail?id=' + data).then(callback);
        },
        getAttrProduct: function (data, callback) {
            $http.get('/Admin/ProductImport/GetAttrProduct?product=' + data).then(callback);
        },
        insertAttrValue: function (data, callback) {
            $http.post('/Admin/ProductImport/InsertAttrValue', data).then(callback);
        },
        getAttrUnit: function (callback) {
            $http.post('/Admin/AttributeManager/GetAttrUnit').then(callback);
        },
        getAttrValue: function (data, data1, callback) {
            $http.get('/Admin/ProductImport/GetAttrValue?ticketCode=' + data + "&product=" + data1).then(callback);
        },
        deleteAttrValue: function (data, callback) {
            $http.post('/Admin/ProductImport/DeleteAttrValue?id=' + data).then(callback);
        },
        getItemAttrValue: function (data, callback) {
            $http.post('/Admin/ProductImport/GetItemAttrValue?id=' + data).then(callback);
        },
        orderProductVatco: function (data, callback) {
            $http.post('/Admin/ProductImport/OrderProductVatco', data).then(callback);
        },
        orderProductComponent: function (data, callback) {
            $http.post('/Admin/ProductImport/OrderProductComponent', data).then(callback);
        },
        getPositionProductVatco: function (data, data1, callback) {
            $http.post('/Admin/ProductImport/GetPositionProductVatco?id=' + data + "&ticketCode=" + data1).then(callback);
        },
        deleteOrderProduct: function (data, callback) {
            $http.post('/Admin/ProductImport/DeleteOrderProduct?id=' + data).then(callback);
        },
        getInfoProduct: function (data, data1, callback) {
            $http.get('/Admin/ProductImport/GetInfoProduct?product=' + data + '&ticket=' + data1).then(callback);
        },
        getInfoProductBottle: function (data, data1, data2, callback) {
            $http.get('/Admin/ProductImport/GetInfoProduct?product=' + data + '&ticket=' + data1 + '&fuelCode=' + data2).then(callback);
        },
        insertDetailByLot: function (data, callback) {
            $http.post('/Admin/ProductImport/InsertDetailByLot', data).then(callback);
        },
        unitFromPack: function (data, callback) {
            $http.get('/Admin/ProductImport/UnitFromPack?json=' + data).then(callback);
        },
        getWorkFlow: function (callback) {
            $http.post('/Admin/PayDecision/GetWorkFlow').then(callback);
        },
        getStepWorkFlow: function (data, callback) {
            $http.post('/Admin/ProductImport/GetStepWorkFlow?code=' + data).then(callback);
        },
        getStatusAct: function (callback) {
            $http.post('/Admin/PayDecision/GetStatusAct').then(callback);
        },
        //Workflow
        createWfInstance: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/CreateWfInstance', data).then(callback)
        },
        insertInstRunning: function (data, data1, callback) {
            $http.post('/Admin/WorkflowActivity/InsertInstRunning?wfInstCode=' + data + '&wfCode=' + data1).then(callback);
        },
        getItemHeaderWithCode: function (data, callback) {
            $http.post('/Admin/ProductImport/GetItemHeaderWithCode?code=' + data).then(callback);
        },
        getActionStatus: function (data, callback) {
            $http.get('/Admin/ProductImport/GetActionStatus?code=' + data).then(callback);
        },
        getItemHeader: function (data, callback) {
            $http.post('/Admin/ProductImport/GetItemHeader?id=' + data).then(callback);
        },
        getListRepeat: function (data, callback) {
            $http.post('/Admin/ProductImport/GetListRepeat?code=' + data).then(callback);
        },
        updateStatusWF: function (data, data1, data2, data3, callback) {
            $http.post('/Admin/WorkflowActivity/UpdateStatusWF?objType=' + data + '&objCode=' + data1 + '&status=' + data2 + '&actRepeat=' + data3).then(callback);
        },

        //Print
        getInfoUserImport: function (data, callback) {
            $http.post('/Admin/ProductImport/GetInfoUserImport?userName=' + data).then(callback);
        },

        //New design
        getTreePack: function (data, data1, callback) {
            $http.post('/Admin/WarehousePackManager/GetTreePack?packType=' + data + '&packLevel=' + data1).then(callback);
        },
        gonvertRecords2Packing: function (data, callback) {
            $http.post('/Admin/ProductImport/ConvertRecords2Packing?packCode=' + data).then(callback);
        },
        getTreeZone: function (callback) {
            $http.post('/Admin/WarehouseZoneManager/GetTreeZone').then(callback);
        },
        getInfoZone: function (data, callback) {
            $http.post('/Admin/WarehouseZoneManager/GetInfoZone?zoneCode=' + data).then(callback);
        },

        getLogStatus: function (data, callback) {
            $http.post('/Admin/ProductImport/GetLogStatus?code=' + data).then(callback);
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
            $http.get('/Admin/EDMSDiagramWarehouse/GetListMapping?start=' + data).then(callback);
        },

        //Export
        insertFromWord: function (data, callback) {
            $http.post('/Admin/ProductImport/InsertFromWord', data, {
                beforeSend: function () {
                    //App.blockUI({
                    //    target: ".modal-content",
                    //    boxed: true,
                    //    message: 'loading...'
                    //});
                },
                complete: function () {
                    //App.unblockUI(".modal-content");
                }
            }).then(callback);
        },
        // Import Excel
        uploadFile: function (data, callback) {
            submitFormUpload('/Admin/ProductImport/UploadFileExcel', data, callback)
        },
        //logInfomation: function (data, callback) {
        //    $http.post('/Admin/Project/LogInfomation', data).then(callback);
        //},
        validateData: function (data, callback) {
            $http.post('/Admin/ProductImport/ValidateData', data).then(callback);
        },
        insertFromExcel: function (data, callback) {
            $http.post('/Admin/ProductImport/InsertFromExcel', data).then(callback);
        },
        viewFileOnline: function (data, callback) {
            $http.post('/Admin/CardJob/ViewFileOnline', data).then(callback);
        },
        getGirdCardBoard: function (callback) {
            $http.post('/Admin/ProductImport/GetGirdCardBoard').then(callback);
        },
        getObjFileShare: function (callback) {
            $http.post('/Admin/CardJob/GetObjFileShare').then(callback);
        },
        importFromServer: function (data, callback) {
            $http.post('/Admin/ProductImport/ImportFromServer?idRepoCatFile=' + data).then(callback);
        },
    }
});

app.controller('Ctrl_ESEIM_SETTING', function ($scope, $rootScope, $compile, $uibModal, $cookies, $translate, dataserviceSetting) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        });

        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9._äöüÄÖÜ]*$/g;
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.TicketCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.COM_VALIDATE_ITEM_CODE.replace('{0}', caption.MIS_MSG_CODE), "<br/>");
            }
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                ImpCode: {
                    required: true,
                    maxlength: 100
                },
                LotProductCode: {
                    required: true,
                },
                CreatedTime: {
                    required: true,
                },
                Note: {
                    maxlength: 1000
                },
                Title: {
                    required: true,
                    maxlength: 255
                },
            },
            messages: {
                ImpCode: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.MIS_CURD_LBL_MIS_CODE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.MIS_CURD_LBL_MIS_CODE).replace("{1}", "100")
                },
                //LotProductCode: {
                //    required: caption.COM_ERR_REQUIRED.replace("{0}", "Lô vật tư"),
                //},
                CreatedTime: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.MIS_CURD_LBL_MIS_CREATE),
                },
                Note: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.MIS_CURD_LBL_MIS_NOTE).replace("{1}", "1000"),
                },
                Title: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.MIS_LIST_COL_TITLE_IMPORT),
                    maxlength: "Tiêu đề vượt quá 255 ký tự"
                },
            }
        }
    });
    $rootScope.patternPacking = /^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z]*(\sx?\s[1-9]{1}[0-9]* [ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z]*)*$/

});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/ProductImport/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderImpStore + '/index.html',
            controller: 'index'
        })
        .when('/add', {
            templateUrl: ctxfolderImpStore + '/add.html',
            controller: 'add'
        })
        .when('/edit', {
            templateUrl: ctxfolderImpStore + '/edit.html',
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
    $httpProvider.interceptors.push('interceptors');
});

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceSetting, $filter, $window, myService, $location) {
    var vm = $scope;
    $scope.model = {
        Title: '',
        CusCode: '',
        StoreCode: '',
        UserImport: '',
        FromDate: '',
        ToDate: '',
        TimeTicketCreate: '',
        ReasonName: ''
    };

    $scope.modelSave = {
        Id: '',
        ProductCode: '',
        MinValue: '',
        MaxValue: '',
        Flag: false,
        WarningType: '',
        FromDate: '',
        ToDate: '',
        UserName :'',
        Packing: '',
        High:'',
        Wide: '',
        Weight: '',
        UnitWeight:'',
    };

    $scope.requestInfoProduct = {
        TicketCode:'',
        ProductCode: '',
        Packing: '',
        High:'',
        Wide: '',
        Weight: '',
        UnitWeight:'',
    };

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/ProductSettingWarning/JTable",
            beforeSend: function (jqXHR, settings) {
                //resetCheckbox();
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
                d.UserImport = $scope.model.UserImport;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
                d.ReasonName = $scope.model.ReasonName;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
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
            //if ($rootScope.permissionMaterialImpStore.Update) {
            //    $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
            //        if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

            //        } else {
            //            var Id = data.Id;
            //            $scope.edit(Id);
            //        }
            //    });
            //}
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[data.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + data.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));//.withOption('sClass', 'hidden')
    vm.dtColumns.push(DTColumnBuilder.newColumn('STT').withTitle('STT').renderWith(function (data, type, full, meta) {
        return meta.row + 1;
        //'<qrcode role="button" ng-click="viewQrCode(\'' + full.TicketCode + '\')" data=' + full.TicketCode + ' size="35"></qrcode>'
        //return '<img ng-click="viewQrCode(\'' + full.TicketCode + '\')"  src="../../../images/default/ic_qrcode.png" role="button" class="h-50 w50">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductCode').withTitle('Product Code').renderWith(function (data) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductName').withTitle('Product Name').renderWith(function (data) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('MinValue').withTitle('Min Value').renderWith(function (data) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('MaxValue').withTitle('Max Value').renderWith(function (data) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('MinTime').withTitle('Min Time').renderWith(function (data) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('MaxTime').withTitle('Max Time').renderWith(function (data) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Flag').withTitle('Flag').renderWith(function (data) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('WarningType').withTitle('WarningType').renderWith(function (data) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('WarningTypeName').withTitle('Warning Type Name').renderWith(function (data) {
        return data;
    }));
    
    //vm.dtColumns.push(DTColumnBuilder.newColumn('CostTotal').withTitle('{{"MES_LIST_COL_ESTORE_TOTAL_MONEY" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('currency')(data, '', 2) : null;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('CurrencyName').withTitle('{{"MIT_COL_CURRENCY" | translate }}').renderWith(function (data) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Discount').withTitle('{{"MIS_LIST_COL_DISCOUNT" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('currency')(data, '', 2) : null;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Commission').withTitle('{{"Hoa hồng" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('currency')(data, '', 2) : null;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('TaxTotal').withTitle('{{"Thuế" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('currency')(data, '', 2) : null;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('TotalMustPayment').withTitle('{{"Tổng phải trả" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('currency')(data, '', 2) : null;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('TotalPayed').withTitle('{{"Tổng đã trả" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('currency')(data, '', 2) : null;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('NextTimePayment').withTitle('{{"Ngày trả tiếp" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('TimeTicketCreate').withTitle('{{"MIS_LIST_COL_MIS_DATE_TO_MIS" | translate }}').renderWith(function (data) {
    //    return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"MIS_LIST_COL_MIS_NOTE" | translate }}').renderWith(function (data) {
    //    return data;
    //}));
    
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'w50 nowrap').withTitle('Action').renderWith(function (data, type, full) {
        var listButton = '';
        listButton += '<a ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding-right: 5px;" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a>';
        listButton += '<a title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash  fs25"></i></a>';
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

    $scope.resetId = function(){
        $scope.modelSave.Id = null;
    }
   
    function Check(value, minvalue, maxvalue) {
        var numberValue = Number(value)
        var numberMinValue = Number(minvalue)
        var numberMaxValue = Number(maxvalue)
        if (numberValue < numberMinValue ) {
            return value + "<span style='color: red; '> Thiếu </span>";
        }else if (numberValue > numberMaxValue) {
            return value + "<span style='color: green;'> Thừa </span>";
        } else {
            return value + "<span style='color: black;'> Bình Thường </span>";
        }
    }
    $scope.listTicketCode = [];
    $scope.listProduct = [];
    $scope.productInfo=[];

    $scope.initLoad = function () {
        // dataserviceSetting.getListWareHouse(function (rs) {
        //     rs = rs.data;
        //     $scope.listStore = rs;
        // });
        // dataserviceSetting.getListSupplier(function (rs) {
        //     rs = rs.data;
        //     $scope.listCustomer = rs;
        // });
        // dataserviceSetting.getListUserImport(function (rs) {
        //     rs = rs.data;
        //     $scope.listUserImport = rs;
        // });
        // dataserviceSetting.getListReason(function (rs) {
        //     rs = rs.data;
        //     $scope.listReason = rs;
        // });
        // dataserviceSetting.getListProdStatus(function (rs) {
        //     rs = rs.data;
        //     $scope.listStatus = rs;
        // });

        dataserviceSetting.getWarningType(function (rs) {
            rs = rs.data;
            $scope.listTicketCode = rs.Object;
        });

        dataserviceSetting.getListProduct(function (rs) {
            rs = rs.data;
            $scope.listProduct = rs;
        });

        // $scope.changeProduct = function () {
        //     if ($scope.modelSave.ProductCode) {
        //         // Lấy thông tin sản phẩm từ $scope.modelSave.ProductCode
        //         // Thực hiện các thao tác cần thiết với thông tin sản phẩm
        //         // Ví dụ:
        //         console.log("Selected Product Code:", $scope.modelSave.ProductCode);
        //         console.log("Selected Product Code:", $scope.modelSave.ticketCode);

        //         dataservice.getInfoProduct($scope.modelSave.ProductCode, "IMP_ODD_T6.2022_50").then(function(response) {
        //          $scope.productInfo = response.data;
        //          console.log($scope.productInfo);
        //         })
        //         .catch(function(error) {
        //                  console.error("Error fetching product info:", error);
        //         });
        //         console.log($scope.productInfo );



        //         // console.log(dataservice.getInfoProduct($scope.modelSave.ProductCode, "IMP_ODD_T6.2022_50"));
        //         // // Gọi hàm để lấy thông tin sản phẩm từ server (nếu cần)
        //         // // Ví dụ:

        //         // dataservice.getInfoProduct($scope.modelSave.ProductCode, "IMP_ODD_T6.2022_50")
        //         //     .then(function(response) {
        //         //         console.log("gg");
        //         //         var productInfo = response.data;
        //         //         console.log("Product Info:", productInfo);
        
        //         //         // Cập nhật các trường thông tin sản phẩm trong $scope.modelSave
        //         //         $scope.modelSave.Packing = productInfo.Packing;
        //         //         $scope.modelSave.High = productInfo.High;
        //         //         $scope.modelSave.Wide = productInfo.Wide;
        //         //         // ... và các trường khác tương ứng
        //         //     })
        //         //     .catch(function(error) {
        //         //         console.error("Error fetching product info:", error);
        //         //     });
        //     }
        // };
            


    }
    $scope.initLoad();
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
        console.log("Load lại data");
        reloadData(false);
    };

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


    //$scope.add = function () {
    //    var modalInstance = $uibModal.open({
    //        animation: true,
    //        templateUrl: ctxfolderImpStore + '/add.html',
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
    //        templateUrl: ctxfolderImpStore + '/edit.html',
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
       // $scope.modelSave.Id == '';
        $scope.submit();
    }

    $scope.edit = function (id) {
        // $scope.modelSave = {
        //     Id: '',
        //     ProductCode: '',
        //     MinValue: '',
        //     MaxValue: '',
        //     Flag: false,
        //     WarningType: '',
        //     FromDate: '',
        //     ToDate: '',
        //     UserName :''
        // };
        dataserviceSetting.getItem(id, function (rs) {
            rs = rs.data.Object
            console.log(rs)
            $scope.modelSave.Id = rs.Id.toString()
            $scope.modelSave.ProductCode = rs.ProductCode.toString()
            $scope.modelSave.MinValue = rs.MinValue.toString()
            $scope.modelSave.MaxValue = rs.MaxValue.toString()
            $scope.modelSave.WarningType = rs.WarningType.toString()
            $scope.modelSave.FromDate = formatDateTimeToDDMMYYYY(rs.MinTime);
            $scope.modelSave.ToDate = formatDateTimeToDDMMYYYY(rs.MaxTime);
        });
    }


    function formatDateTimeToDDMMYYYY(dateTimeString) {
        // Tạo một đối tượng Date từ giá trị đầu vào
        var date = new Date(dateTimeString);

        // Lấy ngày, tháng, năm từ đối tượng Date
        var day = date.getDate();
        var month = date.getMonth() + 1; // Tháng bắt đầu từ 0, cần +1
        var year = date.getFullYear();

        // Chuyển đổi ngày và tháng thành chuỗi với 2 chữ số, thêm 0 nếu cần
        var dayString = day < 10 ? '0' + day : day;
        var monthString = month < 10 ? '0' + month : month;

        // Tạo chuỗi theo định dạng "DD/mm/YYYY"
        var formattedDate = dayString + '/' + monthString + '/' + year;

        return formattedDate;
    }

    $scope.submit = function () {
        if ($scope.addform.validate()) {
            if($scope.modelSave.Id == null || $scope.modelSave.Id == ''){
                console.log("add")
                console.log($scope.modelSave);
                dataserviceSetting.insert($scope.modelSave, function (rs) {
					rs = rs.data;
					if (rs.Error) {
						App.toastrError(rs.Title);
					}
					else {
						App.toastrSuccess(rs.Title);
                        $scope.reloadNoResetPage(); 
					}
				});
                
			}else{
                console.log($scope.modelSave);
                dataserviceSetting.update($scope.modelSave, function (rs) {
					rs = rs.data;
					if (rs.Error) {
						App.toastrError(rs.Title);

					}
					else {
						App.toastrSuccess(rs.Title);
						//$uibModalInstance.close();
                        $scope.reloadNoResetPage(); 
					}
                    $scope.modelSave.Id = null;
				});
                
			}
        
        }
          
         
    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceSetting.deleteWithId(id, function (rs) {
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
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }

    $scope.currentQuantityColumnAdded = false;
    $scope.read = function () {
        console.log("cap nhat clicked!");
            dataserviceSetting.calculateCurrentQuantity( function (rs) {
                console.log(rs);
                 vm.reloadData();
            })
       if (!$scope.currentQuantityColumnAdded) {
            var currentQuantityColumn = DTColumnBuilder.newColumn('CurrentQuantity')
                .withTitle('Current Quantity')
                .renderWith(function (data, type, full, meta) {
                    return Check(data, full.MinValue, full.MaxValue);
                });
            vm.dtColumns.splice(4, 0, currentQuantityColumn);
            $scope.currentQuantityColumnAdded = true;
        } 
        vm.reloadData();
    };


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
        
    }, 200);
});