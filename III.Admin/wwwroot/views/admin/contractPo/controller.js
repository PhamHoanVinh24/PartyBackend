var ctxfolderContractPO = "/views/admin/contractPo";
var ctxfolderMessage = "/views/message-box";
var ctxfolderFileShare = "/views/admin/fileObjectShare";
var ctxfolderCard = "/views/admin/cardJob";
var ctxfolderCommonSetting = "/views/admin/commonSetting";

var app = angular.module('App_ESEIM_CONTRACT_PO', ['App_ESEIM_DASHBOARD', 'App_ESEIM', 'App_ESEIM_CARD_JOB', 'App_ESEIM_CUSTOMER', 'App_ESEIM_ATTR_MANAGER', 'App_ESEIM_REPOSITORY', 'App_ESEIM_SUPPLIER', 'App_ESEIM_FILE_PLUGIN', 'App_ESEIM_WF_PLUGIN', "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber', 'ng.jsoneditor']);

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

app.service('myService', function () {
    var data;
    this.setData = function (d) {
        data = d;
    }
    this.getData = function () {
        return data;
    }
});

app.directive('customOnChangeContract', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChangeContract);
            element.on('change', onChangeHandler);
            element.on('$destroy', function () {
                element.off();
            });

        }
    };
});

app.filter("fomartDateTime", function ($filter) {
    return function (date) {
        var dateNow = $filter('date')(new Date(), 'dd/MM/yyyy');
        var createDate = $filter('date')(new Date(date), 'dd/MM/yyyy');
        if (dateNow == createDate) {
            var today = new Date();
            var created = new Date(date);
            var diffMs = (today - created);
            var diffHrs = Math.floor((diffMs % 86400000) / 3600000);
            var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
            if (diffHrs <= 0) {
                if (diffMins <= 0) {
                    return 'Vừa xong';
                } else {
                    return diffMins + ' phút trước';
                }
            } else {
                return diffHrs + ' giờ ' + diffMins + ' phút trước.';
            }
        } else {
            return $filter('date')(new Date(date), 'dd/MM/yyyy lúc h:mma');
        }
    }
});

app.factory('dataserviceContractPO', function ($http) {
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
        getSupName: function (data, callback) {
            $http.post('/Admin/ContractPo/GetSupName?Id=' + data).then(callback);
        },
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

        //common
        getListCommon: function (callback) {
            $http.post('/Admin/contractPo/GetListCommon').then(callback);
        },
        getAddress: function (lat, lon, callback) {
            $http.get('/Admin/CardJob/GetAddress?lat=' + lat + '&lon=' + lon).then(callback);
        },
        getCustomers: function (callback) {
            $http.post('/Admin/contractPo/GetCustomers/').then(callback);
        },
        getSuppliers: function (callback) {
            $http.post('/Admin/contractPo/GetSuppliers/').then(callback);
        },
        getListContractProjectReq: function (callback) {
            $http.post('/Admin/contractPo/GetListContractProjectReq/').then(callback);
        },
        getListSupCode: function (data, data1, callback) {
            $http.post('/Admin/contractPo/GetListSupCode?Code=' + data + '&Type=' + data1).then(callback);
        },
        getCurrency: function (callback) {
            $http.post('/Admin/contractPo/GetCurrency').then(callback);
        },
        getStatusPOSup: function (callback) {
            $http.post('/Admin/ContractPo/getStatusPOSup/').then(callback);
        },
        getListContract: function (callback) {
            $http.post('/Admin/Contract/GetContract/').then(callback);
        },
        getListProject: function (callback) {
            $http.post('/Admin/Project/GetListProject').then(callback);
        },
        getListProjectSearch: function (callback) {
            $http.post('/Admin/SendRequestImportProduct/GetListProjectSearch').then(callback);
        },
        getBranch: function (callback) {
            $http.post('/Admin/Project/GetBranch').then(callback);
        },

        //attribute
        insertContractAttr: function (data, callback) {
            $http.post('/Admin/ContractPo/InsertContractAttr/', data).then(callback);
        },
        updateContractAttr: function (data, callback) {
            $http.post('/Admin/ContractPo/UpdateContractAttr/', data).then(callback);
        },
        deleteContractAttr: function (data, callback) {
            $http.post('/Admin/ContractPo/DeleteContractAttr/' + data).then(callback);
        },

        //đặt hàng
        genPoSupCode: function (data, callback) {
            $http.post('/Admin/contractPo/GenPoSupCode?SupCode=' + data).then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/contractPo/Insert/', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/contractPo/Update', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/contractPo/Delete?id=' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/contractPo/GetItem?id=' + data).then(callback);
        },
        getUpdateLog: function (data, callback) {
            $http.post('/Admin/contractPo/GetUpdateLog?PoSupCode=' + data).then(callback);
        },
        getListConfirmText: function (data, callback) {
            $http.post('/Admin/contractPo/GetListConfirmText?poSupCode=' + data).then(callback);
        },
        insertConfirmText: function (poSupCode, confirm, callback) {
            $http.post('/Admin/contractPo/InsertConfirmText?poSupCode=' + poSupCode + '&&confirm=' + confirm).then(callback);
        },
        updateConfirmTextById: function (poSupCode, id, confirm, callback) {
            $http.post('/Admin/contractPo/UpdateConfirmTextById?poSupCode=' + poSupCode + '&&id=' + id + '&&confirm=' + confirm).then(callback);
        },
        deleteConfirmTextById: function (poSupCode, id, callback) {
            $http.post('/Admin/contractPo/DeleteConfirmTextById?poSupCode=' + poSupCode + '&&id=' + id).then(callback);
        },
        getListProduct: function (callback) {
            $http.post('/Admin/contractPo/GetListProduct').then(callback);
        },
        getListUnit: function (callback) {
            $http.post('/Admin/contractPo/GetListUnit').then(callback);
        },
        getListCurrency: function (callback) {
            $http.post('/Admin/ServiceCategoryPrice/GetListCurrency').then(callback);
        },
        insertDetail: function (data, callback) {
            $http.post('/Admin/contractPo/InsertDetail', data).then(callback);
        },
        updateDetail: function (data, callback) {
            $http.post('/Admin/contractPo/UpdateDetail', data).then(callback);
        },
        updateDetailReqImp: function (data, callback) {
            $http.post('/Admin/contractPo/UpdateDetailReqImp', data, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#contentMain");
                }
            }).then(callback);
        },
        deleteDetail: function (data, callback) {
            $http.post('/Admin/contractPo/DeleteDetail?id=' + data).then(callback);
        },
        getListRequest: function (fromDate, toDate, projectCode, contractCode, requestCode, supCode, callback) {
            $http.post('/Admin/contractPo/GetListRequest?fromDate=' + fromDate + '&toDate=' + toDate + '&projectCode=' + projectCode + '&contractCode=' + contractCode + '&requestCode=' + requestCode + '&supCode=' + supCode).then(callback);
        },
        getListAllRequest: function (callback) {
            $http.post('/Admin/contractPo/GetListAllRequest').then(callback);
        },
        getListProductByRequest: function (reqCode, supCode, callback) {
            $http.get('/Admin/contractPo/GetListProductByRequest?reqCode=' + reqCode + '&&supCode=' + supCode).then(callback);
        },
        checkListProductByRequest: function (reqCode, supCode, poSupCode, callback) {
            $http.get('/Admin/contractPo/CheckListProductByRequest?reqCode=' + reqCode + '&&supCode=' + supCode + '&&poSupCode=' + poSupCode).then(callback);
        },
        jTableDetailImp: function (poSupCode, contractCode, projectCode, callback) {
            $http.get('/Admin/contractPo/JTableDetailImp?poSupCode=' + poSupCode + '&&contractCode=' + contractCode + '&&projectCode=' + projectCode).then(callback);
        },
        getListRequestByPoSupCode: function (data, callback) {
            $http.get('/Admin/contractPo/GetListRequestByPoSupCode?poSupCode=' + data).then(callback);
        },

        //Payment
        getTotalPayment: function (data, callback) {
            $http.post('/Admin/contractPo/GetTotalPayment', data).then(callback);
        },
        getGetAetRelative: function (callback) {
            $http.post('/Admin/FundAccEntry/GetAetRelative').then(callback);
        },
        getGetCatName: function (callback) {
            $http.post('/Admin/FundAccEntry/GetCatName').then(callback);
        },
        getListTitle: function (callback) {
            $http.post('/Admin/FundAccEntry/GetListTitle').then(callback);
        },
        gettreedata: function (data, callback) {
            $http.post('/Admin/FundCatReptExps/GetTreeData', data).then(callback);
        },
        getObjDependency: function (callback) {
            $http.post('/Admin/FundAccEntry/GetObjDependencyFund').then(callback);
        },
        getGenAETCode: function (type, catCode, callback) {
            $http.post('/admin/FundAccEntry/GenAETCode?type=' + type + "&&catCode=" + catCode).then(callback);
        },
        insertPayment: function (data, callback) {
            $http.post('/Admin/FundAccEntry/Insert/', data).then(callback);
        },
        checkPlan: function (data, callback) {
            $http.post('/Admin/FundAccEntry/CheckPlan?aetCode=' + data).then(callback);
        },
        uploadFile: function (data, callback) {
            submitFormUpload('/Admin/FundAccEntry/UploadFile', data, callback);
        },
        deletePayment: function (data, callback) {
            $http.post('/Admin/FundAccEntry/Delete/' + data).then(callback);
        },
        getItemPayment: function (data, callback) {
            $http.post('/Admin/FundAccEntry/GetItem/', data).then(callback);
        },
        getListFundFiles: function (data, callback) {
            $http.post('/Admin/FundAccEntry/GetListFundFiles?aetCode=' + data).then(callback);
        },
        getAetRelativeChil: function (data, callback) {
            $http.post('/Admin/FundAccEntry/GetAetRelativeChil?aetCode=' + data).then(callback);
        },
        getUpdateLogPayment: function (data, callback) {
            $http.post('/Admin/FundAccEntry/GetUpdateLog?aetCode=' + data).then(callback);
        },
        insertAccEntryTracking: function (aetCode, status, note, aetRelative, callback) {
            $http.post('/admin/FundAccEntry/InsertAccEntryTracking?aetCode=' + aetCode + "&&status=" + status + "&&note=" + note + "&&aetRelative=" + aetRelative).then(callback);
        },
        updatePayment: function (data, callback) {
            $http.post('/Admin/FundAccEntry/Update/', data).then(callback);
        },
        getGetAccTrackingDetail: function (data, callback) {
            $http.get('/Admin/FundAccEntry/GetAccTrackingDetail?aetCode=' + data).then(callback);
        },
        getObjCode: function (objDepen, callback) {
            $http.post('/Admin/CardJob/GetObjCode/?Dependency=' + objDepen).then(callback);
        },
        getAddress: function (lat, lon, callback) {
            $http.get('/Admin/CardJob/GetAddress?lat=' + lat + '&lon=' + lon).then(callback);
        },
        getListCurrency: function (callback) {
            $http.post('/Admin/FundAccEntry/GetListCurrency/').then(callback);
        },
        getCurrencyDefaultPayment: function (callback) {
            $http.post('/Admin/FundAccEntry/GetCurrencyDefaultPayment').then(callback);
        },

        //Contract Po Buyer
        getContractPoBuyer: function (callback) {
            $http.post('/Admin/ContractPo/GetContractPoBuyer/').then(callback);
        },
        getContractSale: function (callback) {
            $http.post('/Admin/ContractPo/GetContractSale/').then(callback);
        },
        getRqImpProduct: function (callback) {
            $http.post('/Admin/ContractPo/GetRqImpProduct/').then(callback);
        },
        getObjectRelative: function (callback) {
            $http.get('/Admin/ContractPo/GetObjectRelative').then(callback);
        },

        getProjects: function (callback) {
            $http.post('/Admin/ContractPo/GetProjects/').then(callback);
        },
        insertContractSale: function (data, callback) {
            $http.post('/Admin/ContractPo/InsertContractSale/', data).then(callback);
        },
        updateContractSale: function (data, callback) {
            $http.post('/Admin/ContractPo/UpdateContractSale/', data).then(callback);
        },
        deleteContractSale: function (data, callback) {
            $http.post('/Admin/ContractPo/DeleteContractSale?id=' + data).then(callback);
        },

        //Request Import Product
        insertRequestImportProduct: function (data, callback) {
            $http.post('/Admin/ContractPo/InsertRequestImportProduct/', data).then(callback);
        },
        updateRequestImportProduct: function (data, callback) {
            $http.post('/Admin/ContractPo/UpdateRequestImportProduct/', data).then(callback);
        },
        deleteRequestImportProduct: function (data, callback) {
            $http.post('/Admin/ContractPo/DeleteRequestImportProduct?id=' + data).then(callback);
        },

        //Project
        insertContractProject: function (data, callback) {
            $http.post('/Admin/ContractPo/InsertContractProject/', data).then(callback);
        },
        updateContractProject: function (data, callback) {
            $http.post('/Admin/ContractPo/UpdateContractProject/', data).then(callback);
        },
        deleteContractProject: function (data, callback) {
            $http.post('/Admin/ContractPo/DeleteContractProject?id=' + data).then(callback);
        },

        //File
        insertPOFile: function (data, callback) {
            submitFormUpload('/Admin/ContractPo/InsertPOFile/', data, callback);
        },
        getSuggestionsPOFile: function (data, callback) {
            $http.get('/Admin/ContractPo/GetSuggestionsPOFile?poCode=' + data).then(callback);
        },
        getTreeCategory: function (callback) {
            $http.post('/Admin/EDMSRepository/GetTreeCategory').then(callback);
        },
        getPOFile: function (data, callback) {
            $http.post('/Admin/ContractPo/GetPOFile/' + data).then(callback);
        },
        updatePOFile: function (data, callback) {
            submitFormUpload('/Admin/ContractPo/UpdatePOFile/', data, callback);
        },
        deletePOFile: function (data, callback) {
            $http.post('/Admin/ContractPo/DeletePOFile/' + data).then(callback);
        },
        getItemFile: function (data, data1, data2, callback) {
            $http.get('/Admin/EDMSRepository/GetItemFile?id=' + data + '&&IsEdit=' + data1 + '&mode=' + data2).then(callback);
        },
        createTempFile: function (data, data1, data2, callback) {
            $http.post('/Admin/EDMSRepository/CreateTempFile?Id=' + data + "&isSearch=" + data1 + "&content=" + data2).then(callback);
        },

        //Schedule
        scheduleContractPO: function (data, data1, callback) {
            $http.post('/Admin/ContractPo/ScheduleContractPO?month=' + data + '&year=' + data1).then(callback);
        },

        getListUser: function (callback) {
            $http.post('/Admin/User/GetListUser').then(callback);
        },
        assignToContractPO: function (data, callback) {
            $http.post('/Admin/ContractPo/AssignToContractPO', data).then(callback);
        },
        deleteAssignContract: function (data, callback) {
            $http.post('/Admin/Contract/DeleteAssignContract?id=' + data).then(callback);
        },
        getCountContractPO: function (callback) {
            $http.post('/Admin/ContractPo/GetCountContractPO').then(callback);
        },

        //Workfow
        getListRepeat: function (data, callback) {
            $http.post('/Admin/ContractPo/GetListRepeat?code=' + data).then(callback);
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
            $http.post('/Admin/ContractPo/GetItemHeaderWithCode?code=' + data).then(callback);
        },
        getActionStatus: function (data, callback) {
            $http.get('/Admin/ContractPo/GetActionStatus?code=' + data).then(callback);
        },
        getItemHeader: function (data, callback) {
            $http.post('/Admin/ContractPo/GetItemHeader?id=' + data).then(callback);
        },
        getListRepeat: function (data, callback) {
            $http.post('/Admin/ContractPo/GetListRepeat?code=' + data).then(callback);
        },
        getStepWorkFlow: function (data, callback) {
            $http.post('/Admin/ContractPo/GetStepWorkFlow?code=' + data).then(callback);
        },
        updateStatusWF: function (data, data1, data2, data3, callback) {
            $http.post('/Admin/WorkflowActivity/UpdateStatusWF?objType=' + data + '&objCode=' + data1 + '&status=' + data2 + '&actRepeat=' + data3).then(callback);
        },
        getCountNotify: function (callback) {
            $http.post('/Admin/NotifiManager/GetCountNotify/').then(callback);
        },

        //Permission File
        getListUserShare: function (callback) {
            $http.post('/Admin/EDMSRepository/GetListUser').then(callback);
        },
        getUserShareFilePermission: function (data, callback) {
            $http.post('/Admin/CardJob/GetUserShareFilePermission?id=' + data).then(callback);
        },
        insertFileShareContract: function (data, callback) {
            $http.post('/Admin/ContractPo/InsertFileShareContract', data).then(callback);
        },
        deleteShareFile: function (data, data1, callback) {
            $http.post('/Admin/CardJob/DeleteShareFile?id=' + data + '&userName=' + data1).then(callback);
        },
        autoShareFilePermission: function (data, callback) {
            $http.post('/Admin/ContractPo/AutoShareFilePermission', data).then(callback);
        },

        //Status
        getLogStatus: function (data, callback) {
            $http.post('/Admin/ContractPo/GetLogStatus?poSupCode=' + data).then(callback);
        },
        checkPermissionEditActivityById: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/CheckPermissionEditActivityById?id=' + data).then(callback);
        },
        getItemActInst: function (data, callback) {
            $http.get('/Admin/WorkflowActivity/GetItemActInst?id=' + data).then(callback)
        },
        suggestWF: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/SuggestWF?type=' + data).then(callback);
        }
    };
});

app.controller('Ctrl_ESEIM_CONTRACT_PO', function ($scope, $rootScope, $cookies, $translate, dataserviceContractPO, $filter) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        $rootScope.IsTranslate = true;
        caption = caption[culture] ? caption[culture] : caption;
        $.extend($.validator.messages, {
            //min: caption.COM_VALIDATE_VALUE_MIN,
        });
        $rootScope.partternNumber = /^[0-9]\d*(\\d+)?$/; //Chỉ cho nhập số khong the am
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^đĐ!@#$%^&*<>?\s]*$/g;
            var partternTelephone = /[0-9]/g;
            var partternVersion = /^\d+(\.\d+)*$/g;
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.ContractCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.COM_VALIDATE_ITEM_CODE.replace("{0}", caption.CONTRACT_CURD_LBL_CONTRACT_CODE), "<br/>");//"Mã hợp đồng không chứa ký tự đặc biệt hoặc khoảng trắng!"
            }
            if (!partternVersion.test(data.Version) && data.Version != null) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", "Phiên bản nhập không đúng", "<br/>");//"Phiên bản phải là chữ số!"
            }
            return mess;
        }
        $rootScope.checkDatamore = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;

            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.AttrCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.COM_VALIDATE_ITEM_CODE.replace("{0}", caption.CONTRACT_CURD_TAB_ATTRIBUTE_CURD_LBL_ATTR_CODE), "<br/>");// "Mã thuộc tính không chứa ký tự đặc biệt hoặc khoảng trắng!"
            }

            return mess;
        }
        $rootScope.checkDatapayment = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;

            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.PayCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.COM_VALIDATE_ITEM_CODE.replace("{0}", caption.CONTRACT_CURD_TAB_PAYMENT_CURD_LBL_PAY_CODE), "<br/>");//"Mã phiếu thu-chi không chứa ký tự đặc biệt hoặc khoảng trắng!"
            }

            return mess;
        }

        //Validate
        $rootScope.validationOptions = {
            rules: {
                PoSupCode: {
                    required: true,
                    maxlength: 255,
                },
                PoTitle: {
                    required: true,
                    maxlength: 255,
                    regx: /^[^\s].*/,
                },
                Email: {
                    regx: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
                    maxlength: 255,
                },
                Mobile: {
                    regx: /^(0)+([0-9]{9,10})\b$/,
                    maxlength: 255,
                },
                OrderBy: {
                    required: true,
                    maxlength: 255,
                    regx: /^[^\s].*/
                },
                Consigner: {
                    required: true,
                    maxlength: 255,
                    regx: /^[^\s].*/
                },
                ExchangeRate: {
                    maxlength: 255,
                },
                Buyer: {
                    maxlength: 255,
                    regx: /^[^\s].*/
                },
                ShippingAdd: {
                    maxlength: 255,
                    regx: /^[^\s].*/
                },
                PaymentTerm: {
                    maxlength: 255,
                    regx: /^[^\s].*/
                },
                Noted: {
                    maxlength: 500,
                    regx: /^[^\s].*/
                },
                DateCount: {
                    maxlength: 3,
                    regx: /^[0-9]+$/
                }
            },
            messages: {
                Noted: {
                    maxlength: "Tối đa 500 ký tự",
                    regx: "Không bắt đầu bằng khoảng trắng"
                },
                ShippingAdd: {
                    maxlength: "Tối đa 255 ký tự",
                    regx: "Không bắt đầu bằng khoảng trắng"
                },

                ExchangeRate: {
                    maxlength: "Tối đa 255 ký tự",
                    regx: "Nhập định dạng số"
                },

                PoSupCode: {
                    maxlength: "Tối đa 255 ký tự",
                    required: caption.CP_VALIDATE_PO_CODE_NO_BLANK,
                },
                PoTitle: {
                    required: caption.CP_VALIDATE_TITLE_NO_BLANK,
                    maxlength: "Tối đa 255 ký tự",
                    regx: "Tiêu đề không bắt đầu bằng khoảng trắng"
                },
                Email: {
                    maxlength: "Tối đa 255 ký tự",
                    regx: caption.CP_VALIDATE_EMAIL,
                },
                Mobile: {
                    maxlength: "Tối đa 255 ký tự",
                    regx: caption.CP_VALIDATE_PHONE_NUMBER,
                },
                OrderBy: {
                    required: caption.CP_VALIDATE_USER_RQ_IMP_PROD,
                    maxlength: "Tối đa 255 ký tự",
                    regx: "Không bắt đầu bằng khoảng trắng"
                },
                Consigner: {
                    required: caption.CP_VALIDATE_SENDER,
                    maxlength: "Tối đa 255 ký tự",
                    regx: "Không bắt đầu bằng khoảng trắng"
                },
                Buyer: {
                    maxlength: "Tối đa 255 ký tự",
                    regx: "Không bắt đầu bằng khoảng trắng"
                },
                PaymentTerm: {
                    maxlength: "Tối đa 255 ký tự",
                    regx: "Không bắt đầu bằng khoảng trắng"
                },
                DateCount: {
                    regx: "Nhập số nguyên dương",
                    maxlength: "Ngày dự kiến không quá 1000 ngày",
                }
            }
        }
        $rootScope.validationProductOptions = {
            rules: {
                UnitPrice: {
                    required: true,
                },
                Quantity: {
                    required: true,
                },
            },
            messages: {
                UnitPrice: {
                    required: caption.CP_VALIDATE_PRICE_NO_BLANK,
                },
                Quantity: {
                    required: caption.CP_VALIDATE_QUANTITY_NO_BLANK,
                },
            }
        }
        $rootScope.validationOptionsDetail = {
            rules: {
                ItemCode: {
                    required: true,
                    maxlength: 100,
                },
                ItemName: {
                    required: true,
                    maxlength: 255,
                },
                Quatity: {
                    required: true,
                    maxlength: 18,
                },
                Cost: {
                    required: true,
                    maxlength: 18,
                }
            },
            messages: {
                ItemCode: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_TAB_DETAIL_CURD_LBL_ITEM_CODE),//"Mã chi tiết yêu cầu bắt buộc!",
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CONTRACT_CURD_TAB_DETAIL_CURD_LBL_ITEM_CODE).replace("{1}", "100")//"Không vượt quá 100 kí tự"
                },
                ItemName: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_TAB_DETAIL_CURD_LBL_ITEM_NAME),//"Tên chi tiết yêu cầu bắt buộc!",
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CONTRACT_CURD_TAB_DETAIL_CURD_LBL_ITEM_NAME).replace("{1}", "255")//"Không vượt quá 255 kí tự"
                },
                Quatity: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_TAB_DETAIL_CURD_LBL_QUATITY),//"Số lượng yêu cầu bắt buộc!",
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CONTRACT_CURD_TAB_DETAIL_CURD_LBL_QUATITY).replace("{1}", "255")//"Số lượng không vượt quá 255 kí tự"
                },
                Cost: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_TAB_DETAIL_CURD_LBL_COST),//"Đơn giá yêu cầu bắt buộc!",
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CONTRACT_CURD_TAB_DETAIL_CURD_LBL_COST).replace("{1}", "18")//"Đơn giák hông vượt quá 18 kí tự"
                },
            }
        }
        $rootScope.validationOptionsNote = {
            rules: {
                Title: {
                    required: true,
                },
                Tags: {
                    required: true,
                }
            },
            messages: {
                Title: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_TAB_NOTE_CURD_TXT_TITLE),//"Tiêu đề yêu cầu bắt buộc",
                },
                Tags: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_TAB_NOTE_CURD_LBL_TAG),//"Tags yêu cầu bắt buộc",
                }
            }
        }
        $rootScope.validationOptionsAttr = {
            rules: {
                AttrCode: {
                    required: true,
                    maxlength: 255,
                    regx: /^[^\s].*/,
                },
                AttrValue: {
                    required: true,
                    maxlength: 255,
                    regx: /^[^\s].*/,
                }
            },
            messages: {
                AttrCode: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CP_CURD_TAB_ATTRIBUTE_CURD_LBL_ATTR_CODE),//"Bắt buộc",
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CP_CURD_TAB_ATTRIBUTE_CURD_LBL_ATTR_CODE).replace("{1}", "255"),
                    regx: "Tiêu đề không bắt đầu bằng khoảng trắng",
                },
                AttrValue: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CP_CURD_TAB_ATTRIBUTE_CURD_LBL_ATTR_VALUE),//"Bắt buộc",
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CP_CURD_TAB_ATTRIBUTE_CURD_LBL_ATTR_VALUE).replace("{1}", "255"),
                    regx: "Tiêu đề không bắt đầu bằng khoảng trắng"
                }
            }
        }
        $rootScope.validationPaymentOptions = {
            rules: {
                Title: {
                    required: true,

                },
                DeadLine: {
                    required: true,

                },
                Payer: {
                    required: true,
                    regx: /^[^\s].*/,
                    maxlength: 255
                },
                Receiptter: {
                    required: true,
                    regx: /^[^\s].*/,
                    maxlength: 255
                }

            },
            messages: {
                Title: {
                    required: caption.CP_VALIDATE_TITLE_NO_BLANK,
                },
                DeadLine: {
                    required: caption.CP_VALIDATE_DATE_FUND,
                },
                Payer: {
                    required: caption.FEA_VALIDATE_PAYER,
                    regx: caption.FAE_VALIDATE_REGX_PAYER,
                    maxlength: caption.FAE_VALIDATE_MAX_LENGTH_INPUT_TEXT
                },
                Receiptter: {
                    required: caption.FEA_VALIDATE_RECEIVER,
                    regx: caption.FAE_VALIDATE_REGX_RECEIPTER,
                    maxlength: caption.FAE_VALIDATE_MAX_LENGTH_INPUT_TEXT
                }

            }
        }
    });
    $rootScope.Object = {
        ContractCode: '',
        CardName: ''
    }
    dataserviceContractPO.getCustomers(function (rs) {
        rs = rs.data;
        $rootScope.Customers = rs;
        $rootScope.MapCustomer = {};
        for (var i = 0; i < rs.length; ++i) {
            $rootScope.MapCustomer[rs[i].Code] = rs[i];
        }
    })
    dataserviceContractPO.getSuppliers(function (rs) {
        rs = rs.data;
        $rootScope.Suppliers = rs;
        $rootScope.MapSupplier = {};
        for (var i = 0; i < rs.length; ++i) {
            $rootScope.MapSupplier[rs[i].Code] = rs[i];
        }
    })
    dataserviceContractPO.getListContractProjectReq(function (rs) {
        rs = rs.data;
        $rootScope.ListContractProject = rs;
    })
    dataserviceContractPO.getListCommon(function (rs) {
        rs = rs.data;
        $rootScope.ListCommon = rs;
    });
    dataserviceContractPO.getCurrency(function (rs) {
        rs = rs.data;
        $rootScope.currencyData = rs;
    });
    $rootScope.PaymentType = [{
        Value: false,
        Name: "Phiếu chi"
    }, {
        Value: true,
        Name: "Phiếu thu"
    }]
    $rootScope.zoomMapDefault = 16;
    $rootScope.latDefault = 21.0277644;
    $rootScope.lngDefault = 105.83415979999995;
    $rootScope.addressDefault = 'Hanoi, Hoàn Kiếm, Hanoi, Vietnam';
    $rootScope.ObjectCodeShared = '';

    $rootScope.Budget = 0;
    $rootScope.customerType = "";
    $rootScope.PoSupCode = "";
    $rootScope.SupCode = "";

    dataserviceContractPO.getStatusPOSup(function (rs) {
        rs = rs.data;
        $rootScope.status = rs;
    });

    //Dùng bên Vatco
    $rootScope.types = [
        {
            Code: 'TYPE_CONTRACT_001',
            Name: 'Mua bán trong nước',
            Icon: 'fas fa-plus text-success'
        },
        {
            Code: 'TYPE_CONTRACT_002',
            Name: 'Mua bán nước ngoài',
            Icon: 'fas fa-spinner text-warning'
        }
    ];


    $rootScope.IsStorage = false;

    $rootScope.listStatus = [
        {
            Code: "CREATED",
            Name: "Khởi tạo"
        },
        {
            Code: "CANCEL",
            Name: "Hủy bỏ"
        },
        {
            Code: "PENDING",
            Name: "Chờ xử lý"
        },

    ];

    $rootScope.listManagerStatus = [
        {
            Code: "APPROVED",
            Name: "Duyệt"
        },
        {
            Code: "REFUSE",
            Name: "Từ chối"
        },
    ];
    $rootScope.ContractCode4AddProduct = '';
    $rootScope.ProjectCode4AddProduct = '';
    $rootScope.ObjectTypeFile = "PO_SUPPLIER";
    $rootScope.moduleName = "CONTRACT";
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/ContractPo/Translation');
    caption = $translateProvider.translations();

    $routeProvider
        .when('/', {
            templateUrl: ctxfolderContractPO + '/index.html',
            controller: 'index'
        })
        .when('/add', {
            templateUrl: ctxfolderContractPO + '/add.html',
            controller: 'add'
        })
        .when('/edit', {
            templateUrl: ctxfolderContractPO + '/edit.html',
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
    $httpProvider.interceptors.push('httpResponseInterceptor');
});

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceContractPO, $window, $filter, myService, $location) {
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
        ProjectCode: '',
        BranchId: ''
    }
    $scope.initData = function () {
        dataserviceContractPO.getBranch(function (rs) {
            rs = rs.data;
            $scope.listBranch = rs;
            var all = {
                Code: '',
                Name: caption.CP_TXT_ALL
            }
            $scope.listBranch.unshift(all)
        })

        dataserviceContractPO.getCountContractPO(function (rs) {
            rs = rs.data;
            $scope.allContract = rs.All;
            $scope.assignSuccess = rs.AssignSuccess;
            $scope.assignNotSuccess = rs.AssignNotSuccess;
        })
    }
    $scope.initData();
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/contractPo/JTable",
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
                d.ContractCode = $scope.model.ContractCode;
                d.Status = $scope.model.Status;
                d.ProjectCode = $scope.model.ProjectCode;
                d.BranchId = $scope.model.BranchId;
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
                        $('#tblDataContractPO').DataTable().$('tr.selected').removeClass('selected');
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.Id;
                    $scope.edit(Id);
                }
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().withOption('sClass', 'hidden').renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PoSupCode').withTitle('{{"CP_LIST_COL_PO_SUP_CODE" | translate}}').withOption('sClass', ' dataTable-pr0 w170').renderWith(function (data, type, full) {
        if (full.IsViewed == "False") {
            return '<span style = "font-weight: 700;">' + data + '</span>';
        } else {
            return data;
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PoTitle').withTitle('{{"CP_LIST_COL_PO_TITLE" | translate}}').withOption('sClass', ' dataTable-pr0 nowrap').renderWith(function (data, type, full) {
        if (full.IsViewed == "False") {
            return '<span style = "font-weight: 700;">' + data + '</span>';
        } else {
            return data;
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Type').withTitle('{{"CP_TAB_PAYMENT_LIST_COL_AET_TYPE" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type) {
        //if (data == "STORAGE") {
        //    return "Lưu kho";
        //} else {
        //    return "Đơn hàng theo khách hàng";
        //}
        if (data === "TYPE_CONTRACT_001") {
            return "Mua hàng trong nước";
        } else {
            return "Mua hàng nước ngoài";
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('OrderBy').withTitle('{{"CP_LIST_COL_ORDER_BY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Consigner').withTitle('{{"CP_LIST_COL_CONSIGNER" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('BuyerCode').withTitle('{{"CP_LIST_COL_BUYER_CODE" | translate}}').withOption('sClass', 'tleft dataTable-pr0 w200').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SupName').withTitle('{{"CP_LIST_COL_SUP" | translate}}').withOption('sClass', '').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"CP_LIST_COL_CREATED_TIME" | translate}}').withOption('sClass', 'tcenter dataTable-pr0 w70').notSortable().renderWith(function (data, type, full) {
        return data != null ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('TotalAmount').withTitle('{{"Tổng tiền" | translate}}').withOption('sClass', '').renderWith(function (data, type) {
    //    return data != "" ? $filter('currency')(data, '', 0) : null;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('TotalPayment').withTitle('{{"Tổng tiền đã trả" | translate}}').withOption('sClass', '').renderWith(function (data, type, full) {
    //    return rs = data != "" ? '<a class="text-underline" ng-click="viewPayment(\'' + full.PoSupCode + '\')">' + $filter('currency')(data, '', 0) + '</a>' : '<a class="text-danger text-underline" ng-click="viewPayment(\'' + full.PoSupCode + '\')">Thêm phiếu thu/chi</a>';
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ExpirationDate').withTitle('{{ "ATTRM_LIST_COL_EXPIRATION_DATE" | translate }}').withOption('sClass', 'w50').renderWith(function (data, type) {
        if (data !== null && data !== undefined && data !== '') {
            data = convertDatetime(data);
            var created = new Date(data);
            var now = new Date();
            var diffMs = (created - now);
            var diffDay = Math.floor((diffMs / 86400000));
            if ((diffDay + 1) < 0) {
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-danger fs9 ml5">Đã quá hạn</span>';
            } else if ((diffDay + 1) > 0) {
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-success fs9 ml5">Còn ' + (diffDay + 1) + ' ngày</span>'
            } else {
                var end = new Date(new Date().setHours(23, 59, 59, 999));
                var diffMs1 = (end - now);

                var diffHrs = Math.floor((diffMs1 % 86400000) / 3600000);
                var diffMins = Math.round(((diffMs1 % 86400000) % 3600000) / 60000);
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-success fs9 ml5">Còn ' + diffHrs + 'h ' + diffMins + 'p</span>'
            }
        }
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('RenewalDate').withTitle('{{ "ATTRM_LIST_COL_RENEWAL_DATE" | translate }}').withOption('sClass', 'w50').renderWith(function (data, type) {
        if (data !== null && data !== undefined && data !== '') {
            data = convertDatetime(data);
            var created = new Date(data);
            var now = new Date();
            var diffMs = (created - now);
            var diffDay = Math.floor((diffMs / 86400000));
            if ((diffDay + 1) < 0) {
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-danger fs9 ml5">Đã quá hạn</span>';
            } else if ((diffDay + 1) > 0) {
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-success fs9 ml5">Còn ' + (diffDay + 1) + ' ngày</span>'
            } else {
                var end = new Date(new Date().setHours(23, 59, 59, 999));
                var diffMs1 = (end - now);

                var diffHrs = Math.floor((diffMs1 % 86400000) / 3600000);
                var diffMins = Math.round(((diffMs1 % 86400000) % 3600000) / 60000);
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-success fs9 ml5">Còn ' + diffHrs + 'h ' + diffMins + 'p</span>'
            }
        }
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PaymentNextDate').withTitle('{{ "ATTRM_LIST_COL_PAYMENT_DATE" | translate }}').withOption('sClass', 'w50').renderWith(function (data, type) {
        if (data !== null && data !== undefined && data !== '') {
            data = convertDatetime(data);
            var created = new Date(data);
            var now = new Date();
            var diffMs = (created - now);
            var diffDay = Math.floor((diffMs / 86400000));
            if ((diffDay + 1) < 0) {
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-danger fs9 ml5">Đã quá hạn</span>';
            } else if ((diffDay + 1) > 0) {
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-success fs9 ml5">Còn ' + (diffDay + 1) + ' ngày</span>'
            } else {
                var end = new Date(new Date().setHours(23, 59, 59, 999));
                var diffMs1 = (end - now);

                var diffHrs = Math.floor((diffMs1 % 86400000) / 3600000);
                var diffMins = Math.round(((diffMs1 % 86400000) % 3600000) / 60000);
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-success fs9 ml5">Còn ' + diffHrs + 'h ' + diffMins + 'p</span>'
            }
        }
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"CP_LIST_COL_STATUS" | translate}}').withOption('sClass', 'nowrap dataTable-pr0 w180 bold').renderWith(function (data, type, full) {
        return '<span class="' + full.Icon + '"></span> ' + data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withTitle('{{"COM_LIST_COL_ACTION"|translate}}').withOption('sClass', 'nowrap dataTable-w80').renderWith(function (data, type, full, meta) {
        //return '<button title="Giao việc" ng-click="addCardJob(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trello"></i></button>' +
        //    '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
        //    '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';

        return '<a title="Sửa" ng-click="edit(' + full.Id + ')"  class="fs25 pr10"><i class="fas fa-edit" style="--fa-primary-color: green;"></i></a>' +
            '<a title="Xoá" ng-click="delete(' + full.Id + ')" class="fs25"><i class="fas fa-trash" style="--fa-primary-color: red;"></i></a>';
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

    $scope.initLoad = function () {
        dataserviceContractPO.getListContract(function (rs) {
            rs = rs.data;
            $scope.ContractData = rs;
            var all = {
                Code: '',
                Name: caption.CP_TXT_ALL,
                ContractNo: ''
            }
            $scope.ContractData.unshift(all)
        });
        dataserviceContractPO.getListProjectSearch(function (result) {
            result = result.data;
            $scope.ListProjectSearch = result;
            var all = {
                Code: '',
                Name: caption.CP_TXT_ALL
            }
            $scope.ListProjectSearch.unshift(all)
        });
    }
    $scope.initLoad();

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceContractPO.delete(id, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
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

    //$scope.edit = function (id) {
    //    var modalInstance = $uibModal.open({
    //        animation: true,
    //        templateUrl: ctxfolderContractPO + '/edit.html',
    //        controller: 'edit',
    //        backdrop: 'static',
    //        size: '60',
    //        resolve: {
    //            para: function () {
    //                return id;
    //            }
    //        }
    //    });
    //    modalInstance.result.then(function (d) {
    //        //$scope.reloadNoResetPage();
    //    }, function () { });
    //};
    //$scope.add = function () {
    //    $rootScope.Object.ContractCode = '';

    //    var modalInstance = $uibModal.open({
    //        animation: true,
    //        templateUrl: ctxfolderContractPO + '/add.html',
    //        controller: 'add',
    //        backdrop: 'static',
    //        size: '60'
    //    });
    //    modalInstance.result.then(function (d) {
    //        $scope.reload();
    //    }, function () { });
    //};

    $scope.add = function () {
        $rootScope.Object.ContractCode = '';
        $location.path('/add');
    }

    $scope.edit = function (id) {
        dataserviceContractPO.getItem(id, function (rs) {
            rs = rs.data;
            $rootScope.ObjCode = rs.Object.PoSupCode;
            myService.setData(data = id);
            $location.path('/edit');
        });
    }

    $scope.viewPayment = function (poSupCode) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderContractPO + '/contractTabPayment.html',
            controller: 'contractTabPayment',
            backdrop: 'static',
            size: '60',
            resolve: {
                para: function () {
                    return poSupCode;
                }
            }
        });
        modalInstance.result.then(function (d) {
            //$scope.reloadNoResetPage();
        }, function () { });
    };

    $scope.addCardJob = function (reqID) {
        var userModel = {};
        var editItems = [];
        for (var id in $scope.selected) {
            if ($scope.selected.hasOwnProperty(id)) {
                if ($scope.selected[id]) {
                    editItems.push(id);
                }
            }
        }
        if (reqID != null && reqID != '' && reqID != undefined)
            editItems[0] = reqID;

        if (editItems.length > 0) {
            if (editItems.length == 1) {
                var listdata = $('#tblDataContractPO').DataTable().data();
                for (var i = 0; i < listdata.length; i++) {

                    if (listdata[i].Id == editItems[0]) {
                        userModel = listdata[i];
                        break;
                    }
                }
                var obj = {
                    Code: userModel.PoSupCode,
                    Name: userModel.PoTitle,
                    TabBoard: 11
                }
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderCardJob + "/add-card-buffer.html",
                    controller: 'add-card-object',
                    backdrop: 'static',
                    size: '80',
                    resolve: {
                        para: function () {
                            return obj;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                }, function () { });
            } else {
                //App.toastrError(caption.CP_MSG_CHOOSE_ITEM) // Vui lòng chọn một hợp đồng mua!
                App.toastrError(caption.CP_MSG_SELECT_CONTRACT_PO) // Vui lòng chọn một hợp đồng mua!
            }
        } else {
            //App.toastrError(caption.CP_MSG_NOT_CHOOSE_ITEM) //Không có một hợp đồng mua nào được chọn
            App.toastrError(caption.CP_MSG_NO_CONTRACT_SELECT) //Không có một hợp đồng mua nào được chọn
        }
    };

    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
            var date = new Date();
            var priorDate = new Date().setDate(date.getDate() - 30)
            $scope.model.ToDate = $filter('date')((date), 'dd/MM/yyyy')
            $scope.model.FromDate = $filter('date')((priorDate), 'dd/MM/yyyy')
        } else {
            $scope.isSearch = false;
            $scope.model.ToDate = ""
            $scope.model.FromDate = ""
        }

    }

    $scope.showSchedule = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderContractPO + '/scheduleContractPO.html',
            controller: 'schedule-contract-po',
            backdrop: 'static',
            size: '70'
        });
        modalInstance.result.then(function (d) {
        }, function () {
        });
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

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, DTColumnBuilder, DTInstances, dataserviceContractPO, $filter) {
    $scope.model = {
        BuyerCode: '',
        SupCode: '',
        PoSupCode: '',
        Type: $rootScope.types[0].Code,
        ExchangeRate: 1,
        Currency: 'VND',
        ContractCode: '',
        ProjectCode: '',
        Status: 'INITIAL_BEGIN',
        sDateOfOrder: '',
        sEstimateTime: ''
    }

    $scope.modelWf = {
        WorkflowCode: "",
        ObjectType: "CONTRACT_PO",
        ObjectInst: "",
    };

    $scope.modelView = {
        ContractProject: '',
    }
    $scope.isTex = false;
    $rootScope.PoSupCode = '';
    $scope.isShowHeader = true;
    $scope.isShowDetail = false;
    $rootScope.isAdd = false;

    $rootScope.IsDisableSupCode = false;
    $rootScope.IsDisableType = false;
    $rootScope.customerType = "LE";
    $rootScope.Budget = 0;
    $rootScope.RealBudget = 0;
    $rootScope.ContractId = -1;
    $rootScope.ContractCode = "";
    $scope.products = [];
    $scope.forms = {};

    $scope.sDateCount = '';

    $scope.cancel = function () {
        $uibModalInstance.close();
    };

    function initData() {
        dataserviceContractPO.getListProduct(function (result) {
            result = result.data;
            $scope.products = result;
        });
        dataserviceContractPO.getListContractProjectReq(function (rs) {
            rs = rs.data;
            $rootScope.ListContractProject = rs;
        })
        dataserviceContractPO.genPoSupCode($scope.model.SupCode, function (result) {
            result = result.data;
            $scope.model.PoSupCode = result;
        });
        //$scope.model.Status = $rootScope.status[0].Code;
        $scope.changeCustomer();
        dataserviceContractPO.getWorkFlow(function (result) {
            result = result.data;
            $rootScope.lstWorkflow = result;
        });
        dataserviceContractPO.getStatusAct(function (rs) {
            rs = rs.data;
            $scope.lstStatus = rs;
        })
        dataserviceContractPO.suggestWF($scope.modelWf.ObjectType, function (rs) {
            rs = rs.data;
            $scope.model.WorkflowCat = rs;
            setTimeout(function () {
                $rootScope.loadDiagramWF($scope.model.WorkflowCat);
            }, 400)
        })
    }

    $scope.changeWorkFlowInts = function (wfCode) {
        if ($scope.model.WorkflowCat == "" || $scope.model.WorkflowCat == undefined || $scope.model.WorkflowCat == null) {
            $scope.errorWorkflowCat = true;
        }
        else {
            $scope.errorWorkflowCat = false;
        }
        $rootScope.loadDiagramWF(wfCode);
    }

    $scope.chkContract = function () {
        if ($rootScope.Object.ContractCode == '') {
            App.toastrError(caption.CONTRACT_CURD_MSG_CREATE_CONTRACR);//Vui lòng tạo trước hợp đồng!
        }
    }

    $scope.changleSelect = function (SelectType, item) {
        if (SelectType == "BuyerCode" && $scope.model.BuyerCode != "") {
            $scope.errorBuyerCode = false;
        }
        if (SelectType == "SupCode" && $scope.model.SupCode != "") {
            $scope.errorSupCode = false;
        }
        if (SelectType == "ContractProject" && $scope.modelView.ContractProject != "") {
            $scope.errorContractProject = false;
            dataserviceContractPO.getListSupCode(item.Code, item.Type, function (rs) {
                rs = rs.data;
                $scope.ListSupCode = rs;
            });
            if (item.Type == "PROJECT") {
                $scope.model.ContractCode = '';
                $scope.model.ProjectCode = item.Code;
                $rootScope.ContractCode4AddProduct = '';
                $rootScope.ProjectCode4AddProduct = item.Code;
            } else {
                $scope.model.ProjectCode = '';
                $scope.model.ContractCode = item.Code;
                $rootScope.ContractCode4AddProduct = item.Code;
                $rootScope.ProjectCode4AddProduct = '';
            }
        }
        if (SelectType == "Currency" && $scope.model.Currency != "") {
            $scope.errorCurrency = false;
            if ($scope.model.Currency == 'CURRENCY_VND') {
                $scope.model.ExchangeRate = 1;
            }
        }
        if (SelectType == "ExchangeRate" && ($scope.model.ExchangeRate == null || $scope.model.ExchangeRate == undefined || $scope.model.ExchangeRate <= 0)) {
            $scope.errorExchangeRate = true;
        } else {
            $scope.errorExchangeRate = false;
        }
    }

    $scope.resetContractProject = function () {
        $scope.ListSupCode = [];
        $scope.model.SupCode = '';
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.BuyerCode == "" || data.BuyerCode == null) {
            $scope.errorBuyerCode = true;
            mess.Status = true;
        } else {
            $scope.errorBuyerCode = false;
        }
        if (data.SupCode == "" || data.SupCode == null) {
            $scope.errorSupCode = true;
            mess.Status = true;
        } else {
            $scope.errorSupCode = false;
        }
        if ((data.ContractCode == "" || data.ContractCode == null) && (data.ProjectCode == "" || data.ProjectCode == null)) {
            $scope.errorContractProject = true;
            mess.Status = true;
        } else {
            $scope.errorContractProject = false;
        }
        if (data.sDateOfOrder == "" || data.sDateOfOrder == null || data.sDateOfOrder == undefined) {
            $scope.errorsDateOfOrder = true;
            mess.Status = true;
        } else {
            $scope.errorsDateOfOrder = false;
        }
        if (data.sEstimateTime == "" || data.sEstimateTime == null || data.sEstimateTime == undefined) {
            $scope.errorsEstimateTime = true;
            mess.Status = true;
        } else {
            $scope.errorsEstimateTime = false;
        }
        if (data.Currency == "" || data.Currency == null || data.Currency == undefined) {
            $scope.errorCurrency = true;
            mess.Status = true;
        } else {
            $scope.errorCurrency = false;
        }
        if (data.ExchangeRate == null || data.ExchangeRate == undefined || data.ExchangeRate <= 0) {
            $scope.errorExchangeRate = true;
            mess.Status = true;
        } else {
            $scope.errorExchangeRate = false;
        }

        if (data.WorkflowCat == null || data.WorkflowCat == undefined || data.WorkflowCat == "") {
            $scope.errorWorkflowCat = true;
            mess.Status = true;
        } else {
            $scope.errorWorkflowCat = false;
        }
        return mess;
    };

    $scope.submit = function () {
        $rootScope.SupCode = $scope.model.SupCode;
        $scope.model.Status = '';
        validationSelect($scope.model);
        if ($scope.forms.addform.validate() && !validationSelect($scope.model).Status) {
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmAdd.html',
                resolve: {
                    para: function () {
                        return $scope.model;
                    }
                },
                controller: function ($scope, $uibModalInstance, para) {
                    //$scope.message = caption.CP_MSG_ADD_TICKET
                    $scope.message = "Bạn muốn thêm đơn đặt hàng không?"
                    $scope.ok = function () {
                        dataserviceContractPO.insert(para, function (result) {
                            result = result.data;
                            if (result.Error) {
                                App.toastrError(result.Title);
                            } else {
                                $rootScope.IsDisableSupCode = true;
                                $rootScope.IsDisableType = true;
                                $rootScope.isAdd = true;
                                $rootScope.ObjCode = para.PoSupCode;
                                $rootScope.PoSupCode = para.PoSupCode;
                                App.toastrSuccess(result.Title);
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
                $rootScope.Object.ContractCode = $scope.model.ContractCode;
                $rootScope.PoSupCode = $scope.model.PoSupCode;
                $rootScope.ObjCode = $scope.model.PoSupCode;
                //Workflow
                $scope.modelWf.ObjectInst = $scope.model.PoSupCode;
                $scope.modelWf.WorkflowCode = $scope.model.WorkflowCat;
                $scope.modelWf.ObjectName = $scope.model.PoTitle;
                dataserviceContractPO.createWfInstance($scope.modelWf, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        //App.toastrSuccess(rs.Title);
                        var wfInstCode = rs.Object.WfInstCode;
                        $scope.WfInstCode = wfInstCode;
                        $rootScope.loadDiagramWfInst($scope.model.PoSupCode, $scope.modelWf.ObjectType);
                        dataserviceContractPO.getLogStatus($scope.model.PoSupCode, function (rs) {
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
            }, function () {
            });
        }
    }

    $rootScope.amountbudget = function (amount) {
        $scope.model.Budget = amount;
    }

    $scope.activity = function () {
        if ($rootScope.isAdd == true) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderContractPO + '/activity.html',
                controller: 'activity',
                size: '50',
                backdrop: 'static',
                resolve: {
                    para: function () {
                        return $scope.model.PoSupCode;
                    }
                },
            });
            modalInstance.result.then(function (d) {

            }, function () {
            });
        } else {
            App.toastrError(caption.CP_MSG_ADD_TICKET_FIRST);
        }
    }

    $scope.openLog = function () {
        dataserviceContractPO.getUpdateLog($scope.model.PoSupCode, function (rs) {
            rs = rs.data;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderContractPO + '/showLog.html',
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

    $scope.changeType = function () {
        if ($scope.model.Type == "STORAGE") {
            $rootScope.IsStorage = true;
        } else {
            $rootScope.IsStorage = false;
        }
    }

    $scope.changeCustomer = function () {
        $scope.model.CusAddress = "";
        $scope.model.CusZipCode = "";
        $scope.model.CusMobilePhone = "";
        $scope.model.CusPersonInCharge = "";
        $scope.model.CusEmail = "";

        var customer = $rootScope.MapCustomer[$scope.model.BuyerCode];
        if (customer != undefined) {
            $scope.model.CusAddress = customer.Address;
            $scope.model.CusZipCode = customer.ZipCode;
            $scope.model.CusMobilePhone = customer.MobilePhone;
            $scope.model.CusPersonInCharge = customer.PersonInCharge;
            $scope.model.CusEmail = customer.Email;
        }
    }

    $scope.changeSupplier = function () {
        $scope.model.SupAddress = "";
        $scope.model.SupEmail = "";
        $scope.model.SupZipCode = "";
        $scope.model.SupMobilePhone = "";
        $scope.model.SupPersonInCharge = "";

        var supplier = $rootScope.MapSupplier[$scope.model.SupCode];
        if (supplier != undefined) {
            $scope.model.SupAddress = supplier.Address;
            $scope.model.SupMobilePhone = supplier.MobilePhone;
            $scope.model.SupEmail = supplier.Email;
            var list = supplier.ListExtend;
            if (list != null) {
                for (var i in list) {
                    var item = list[i];
                    if (item.ext_code == "ZIP_CODE") {
                        $scope.model.SupZipCode = item.ext_value;
                    }
                    if (item.ext_code == "PERSON_IN_CHARGE") {
                        $scope.model.SupPersonInCharge = item.ext_value;
                    }
                }
            }
            //Tạo lại mã khi chọn 1 NCC
            dataserviceContractPO.genPoSupCode($scope.model.SupCode, function (result) {
                result = result.data;
                $scope.model.PoSupCode = result;
            });
        }
    }

    initData();

    $scope.calculateDateOfOrder = function () {
        if ($scope.model.sDateOfOrder != "") {
            if ($scope.sDateCount != '' && $scope.sDateCount != undefined) {
                $scope.model.sEstimateTime = addDays($scope.model.sDateOfOrder, $scope.sDateCount);
                $('#EstimateTime').datepicker('update', $scope.model.sEstimateTime);
            }
            else {
                if ($scope.model.sEstimateTime != '') {
                    var endDate = $scope.model.sEstimateTime.split("/");
                    var endDate1 = new Date(endDate[2], endDate[1] - 1, endDate[0]);
                    var effectiveDate = $scope.model.sDateOfOrder.split("/");
                    var effectiveDate1 = new Date(effectiveDate[2], effectiveDate[1] - 1, effectiveDate[0]);
                    if (endDate1 > effectiveDate1) {
                        var diffMs = (endDate1 - effectiveDate1);
                        var diffDay = Math.floor((diffMs / 86400000));
                        $scope.sDateCount = diffDay;
                        $('#DateCount').val(diffDay);
                        resetValidateDuration();
                    }
                    else {
                        App.toastrError(caption.CONTRACT_CURD_MSG_CHECK_DATE);
                    }
                }
            }
            resetValidateEndDate();
        }
    }

    $scope.calculateDuration = function () {
        debugger
        if ($scope.sDateCount != "" && $scope.sDateCount != undefined && $scope.sDateCount > 0) {
            if ($scope.model.sDateOfOrder != '') {
                $scope.model.sEstimateTime = addDays($scope.model.sDateOfOrder, $scope.sDateCount);
                $('#EstimateTime').datepicker('update', $scope.model.EstimateTime);
            }
            else {
                if ($scope.model.sEstimateTime != '') {
                    $scope.model.sDateOfOrder = addDays($scope.model.sEstimateTime, -1 * $scope.sDateCount);
                    $('#DateOfOrder').datepicker('update', $scope.model.sDateOfOrder);
                }
            }
            resetValidateEndDate();
            resetValidateEffectiveDate();
        }
    }

    $scope.calculateEstimateTime = function () {
        if ($scope.model.sEstimateTime != "") {
            if ($scope.model.sDateOfOrder != '') {
                var endDate = $scope.model.sEstimateTime.split("/");
                var endDate1 = new Date(endDate[2], endDate[1] - 1, endDate[0]);
                var effectiveDate = $scope.model.sDateOfOrder.split("/");
                var effectiveDate1 = new Date(effectiveDate[2], effectiveDate[1] - 1, effectiveDate[0]);
                if (endDate1 > effectiveDate1) {
                    var diffMs = (endDate1 - effectiveDate1);
                    var diffDay = Math.floor((diffMs / 86400000));
                    $scope.sDateCount = diffDay;
                    $('#DateCount').val(diffDay);
                    resetValidateDuration();
                }
                else {
                    App.toastrError(caption.CP_CURD_MSG_CHECK_DATE);
                }
            }
            else {
                if ($scope.sDateCount != '' && $scope.sDateCount > 0) {
                    $scope.model.sDateOfOrder = addDays($scope.model.sDateOfOrder, -1 * $scope.sDateCount);
                    $('#DateOfOrder').datepicker('update', $scope.model.sDateOfOrder);
                }
            }
        }
        resetValidateEffectiveDate();
    }

    function addDays(dt, n) {
        var ds = dt.split("/");
        var startDate = new Date(ds[2], ds[1] - 1, ds[0]);
        startDate.setTime(startDate.getTime() + (n * 24 * 60 * 60 * 1000));
        var futureDate = startDate.getDate() + "/" + (startDate.getMonth() + 1) + "/" + startDate.getFullYear();
        futureDate = futureDate.replace(/^(\d{1}\/)/, "0$1").replace(/(\d{2}\/)(\d{1}\/)/, "$10$2");
        return futureDate;
    }

    function resetValidateDuration() {
        if ($('#DateCount').valid()) {
            $('#DateCount').removeClass('invalid').addClass('success');
        }
    }

    function resetValidateEffectiveDate() {
        if ($('#DateOfOrder input').valid()) {
            $('#DateOfOrder input').removeClass('invalid').addClass('success');
        }
    }

    function resetValidateEndDate() {
        if ($('#EstimateTime input').valid()) {
            $('#EstimateTime input').removeClass('invalid').addClass('success');
        }
    }

    $scope.resetCustomer = function () {
        $scope.model.CusAddress = "";
        $scope.model.CusZipCode = "";
        $scope.model.CusMobilePhone = "";
        $scope.model.CusPersonInCharge = "";
        $scope.model.CusEmail = "";
    }

    $scope.resetSupplier = function () {
        $scope.model.SupAddress = "";
        $scope.model.SupMobilePhone = "";
        $scope.model.SupEmail = "";
        $scope.model.SupZipCode = "";
        $scope.model.SupPersonInCharge = "";
    }

    setTimeout(function () {
        var startDate = new Date();
        setModalDraggable('.modal-dialog');
        $("#DateOfOrder").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $scope.model.sDateOfOrder = new Date(selected.date.valueOf());
            if ($scope.model.sDateOfOrder == "" || $scope.model.sDateOfOrder == null || $scope.model.sDateOfOrder == undefined) {
                $scope.errorsDateOfOrder = true;
            } else {
                $scope.errorsDateOfOrder = false;
            }
            $('#EstimateTime').datepicker('setStartDate', maxDate);
        });
        $("#EstimateTime").datepicker({
            startDate: startDate,
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            $scope.model.sEstimateTime = new Date(selected.date.valueOf());
            if ($scope.model.sEstimateTime == "" || $scope.model.sEstimateTime == null || $scope.model.sEstimateTime == undefined) {
                $scope.errorsEstimateTime = true;
            } else {
                $scope.errorsEstimateTime = false;
            }
            $('#DateOfOrder').datepicker('setEndDate', $scope.model.sEstimateTime);
        });

        $("#datefrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $("#EffectiveDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EndDate').datepicker('setStartDate', maxDate);
        });
        $("#EndDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EffectiveDate').datepicker('setEndDate', maxDate);
        });
        setModalDraggable('.modal-dialog');
    }, 200);

    $scope.ShowHeader = function () {
        if ($scope.isTex == false) {
            $scope.isShowHeader = true
            $scope.isShowDetail = false;
        }
        else {
            $scope.isShowHeader = false
            $scope.isShowDetail = true;
        }
    }

    $scope.openAttributeFormManager = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderContractPO + '/attributeManager.html',
            controller: 'attributeManager',
            backdrop: 'static',
            size: '70',
            resolve: {
                para: function () {
                    return $scope.model.PoSupCode;
                }
            },
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () { });
    }

    $scope.addCommonSettingContractStatus = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'CONTRACT_STATUS_PO_SUP',
                        GroupNote: 'Trạng thái đặt hàng(Nhà cung cấp)',
                        AssetCode: 'CONTRACT'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceContractPO.getStatusPOSup(function (rs) {
                rs = rs.data;
            });
            dataserviceContractPO.getListCommon(function (rs) {
                rs = rs.data;
                $rootScope.ListCommon = rs;
            });
        }, function () { });
    }

    $scope.addCardJob = function () {
        if (!$rootScope.isAdd) {
            //App.toastrError(caption.CP_MSG_SAVE_BEFORE_JOB_CARD);
            App.toastrError(caption.CP_MSG_CLICK_SAVE);
            return;
        }

        var obj = {
            Code: $scope.model.PoSupCode,
            Name: $scope.model.PoTitle,
            TabBoard: 11
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCardJob + "/add-card-buffer.html",
            controller: 'add-card-object',
            backdrop: 'static',
            size: '80',
            resolve: {
                para: function () {
                    return obj;
                }
            }
        });
        modalInstance.result.then(function (d) {
        }, function () { });
    };

    //Edit Activity Instance
    $scope.editInstAct = function (id, objCode) {
        dataserviceContractPO.checkPermissionEditActivityById(id, function (rs) {
            rs = rs.data;
            if (!rs) {
                return App.toastrError(caption.COM_MSG_PERMISSION_EDIT_ACT);
            }
            dataserviceContractPO.getItemActInst(id, function (rs) {
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
                    $rootScope.loadDiagramWfInst($scope.model.PoSupCode, $scope.modelWf.ObjectType);
                    dataserviceContractPO.getLogStatus($scope.model.PoSupCode, function (rs) {
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

    //Show, hide header
    $scope.isShowHeader = true;

    $scope.showHeaderCard = function () {
        $scope.isShowHeader = true;
    }

    $scope.hideHeader = function () {
        $scope.isShowHeader = false;
    }

    //End show, hide header
});

app.controller('edit', function ($scope, $filter, $rootScope, $compile, $uibModal, dataserviceContractPO, myService, $location) {
    $scope.modelView = {
        ContractProject: '',
    }

    $scope.modelWf = {
        WorkflowCode: "",
        ObjectType: "CONTRACT_PO",
        ObjectInst: "",
    };
    $scope.isTex = false;
    $scope.isShowHeader = true;
    $scope.isShowDetail = false;
    $scope.forms = {};
    $scope.model = {};
    $scope.SupName = '';
    $scope.products = [];
    $scope.changeCustomer = function () {
        $scope.model.CusAddress = "";
        $scope.model.CusZipCode = "";
        $scope.model.CusMobilePhone = "";
        $scope.model.CusPersonInCharge = "";
        $scope.model.CusEmail = "";
        var customer = $rootScope.MapCustomer[$scope.model.BuyerCode];

        if (customer != undefined) {
            $scope.model.CusAddress = customer.Address;
            $scope.model.CusZipCode = customer.ZipCode;
            $scope.model.CusMobilePhone = customer.MobilePhone;
            $scope.model.CusPersonInCharge = customer.PersonInCharge;
            $scope.model.CusEmail = customer.Email;
        }
    }

    $scope.changeSupplier = function () {
        $scope.model.SupAddress = "";
        $scope.model.SupEmail = "";
        $scope.model.SupZipCode = "";
        $scope.model.SupMobilePhone = "";
        $scope.model.SupPersonInCharge = "";
        var supplier = $rootScope.MapSupplier[$scope.model.SupCode];

        if (supplier != undefined) {
            $scope.model.SupAddress = supplier.Address;
            $scope.model.SupMobilePhone = supplier.MobilePhone;
            $scope.model.SupEmail = supplier.Email;
            var list = supplier.ListExtend;
            if (list != null) {
                for (var i in list) {
                    var item = list[i];
                    if (item.ext_code == "ZIP_CODE") {
                        $scope.model.SupZipCode = item.ext_value;
                    }
                    if (item.ext_code == "PERSON_IN_CHARGE") {
                        $scope.model.SupPersonInCharge = item.ext_value;
                    }
                }
            }
        }
    }

    var para = myService.getData();
    if (para == undefined) {
        para = $location.search().id;
    }
    if (para == undefined || para <= 0) {
        location.href = "/Admin/ContractPO";
    }

    if (para != undefined) {
        $scope.initData = function () {
            dataserviceContractPO.getItem(para, function (rs) {
                rs = rs.data;
                debugger
                $scope.model = rs.Object;
                $scope.modelView.ContractProject = ($scope.model.ContractCode != null && $scope.model.ContractCode != '') ? $scope.model.ContractCode : $scope.model.ProjectCode;
                if ($scope.model.ContractCode != null && $scope.model.ContractCode != '') {
                    $rootScope.ContractCode4AddProduct = $scope.model.ContractCode;
                    $rootScope.ProjectCode4AddProduct = '';
                } else {
                    $rootScope.ContractCode4AddProduct = '';
                    $rootScope.ProjectCode4AddProduct = $scope.model.ContractCode;
                }
                dataserviceContractPO.getSupName($scope.model.Id, function (rs) {
                    rs = rs.data;
                    $scope.SupName = rs[0].SupName;
                });
                $scope.model.sEstimateTime = "";
                $scope.model.sDateOfOrder = ($scope.model.DateOfOrder != null ? $filter('date')(new Date($scope.model.DateOfOrder), 'dd/MM/yyyy') : "");
                $scope.model.sEstimateTime = ($scope.model.EstimateTime != null ? $filter('date')(new Date($scope.model.EstimateTime), 'dd/MM/yyyy') : "");

                var endDate = $scope.model.sEstimateTime.split("/");
                var endDate1 = new Date(endDate[2], endDate[1] - 1, endDate[0]);
                var effectiveDate = $scope.model.sDateOfOrder.split("/");
                var effectiveDate1 = new Date(effectiveDate[2], effectiveDate[1] - 1, effectiveDate[0]);
                if (endDate1 > effectiveDate1) {
                    var diffMs = (endDate1 - effectiveDate1);
                    var diffDay = Math.floor((diffMs / 86400000));
                    $scope.sDateCount = diffDay;
                }

                $rootScope.PoSupCode = $scope.model.PoSupCode;
                $rootScope.SupCode = $scope.model.SupCode;
                $rootScope.ObjCode = $scope.model.PoSupCode;

                // get SupCode
                var indexSupCode = $rootScope.ListContractProject.findIndex(x => x.Code == $scope.modelView.ContractProject);
                if (indexSupCode != -1) {
                    var itemContract = $rootScope.ListContractProject[indexSupCode];
                    dataserviceContractPO.getListSupCode(itemContract.Code, itemContract.Type, function (rs) {
                        rs = rs.data;
                        $scope.ListSupCode = rs;
                    });
                }

                setTimeout(function () {
                    $rootScope.loadDiagramWfInst($scope.model.PoSupCode, $scope.modelWf.ObjectType);
                    $rootScope.searchProduct();
                }, 1000)
                dataserviceContractPO.getLogStatus($scope.model.PoSupCode, function (rs) {
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

                //Dùng bên Facco
                if ($scope.model.Type == "STORAGE") {
                    $rootScope.IsStorage = true;
                }
                if ($scope.model.Type == "REQUEST") {
                    $rootScope.IsStorage = false;
                }
                $scope.changeCustomer();
                $scope.changeSupplier();
                setTimeout(function () {
                    //validateDefaultDate($scope.model.sDateOfOrder, $scope.model.sEstimateTime);
                }, 100);
            });
            dataserviceContractPO.getListProduct(function (result) {
                result = result.data;
                $scope.products = result;
            });

            dataserviceContractPO.getWorkFlow(function (result) {
                result = result.data;
                $rootScope.lstWorkflow = result;
            });
            dataserviceContractPO.getStatusAct(function (rs) {
                rs = rs.data;
                $scope.lstStatus = rs;
            })
            dataserviceContractPO.getItemHeader(para, function (rs) {
                rs = rs.data;

                var data = rs;
                if (data.list != undefined && data.list != "" && data.list != null) {
                    $scope.lstStep = data.list;
                    setTimeout(function () {
                        $('#progressbar li').css('width', 'calc(100%/' + data.list.length + ')');
                        $('.' + $scope.lstStep[$scope.lstStep.length - 1].IntsCode + '').addClass('end');
                        for (var i = 0; i < $scope.lstStep.length; i++) {
                            if ($scope.lstStep[i].Status == "STATUS_ACTIVITY_APPROVED") {
                                $('.' + $scope.lstStep[i].IntsCode + '').addClass('active');
                            }
                            if ($scope.lstStep[i].IntsCode == data.current && $scope.lstStep[i].Status == "STATUS_ACTIVITY_APPROVE_END") {
                                $(".export").removeClass('dis');
                            }
                        }
                    }, 5);
                }
                else {
                    $scope.lstStep = "";
                }
                if (data.current != undefined && data.current != "" && data.current != null) {
                    setTimeout(function () {
                        $('.' + data.current + '').addClass('active2');
                    }, 5);
                }
                else {
                    data.current = "";
                }
                if (data.editrole != undefined && data.editrole != "" && data.editrole != null && data.editrole == true) {
                    $('.detail').removeClass('dis');
                    $scope.roleedit = true;
                }
                else {
                    $scope.roleedit = false;
                    $('.detail').addClass('dis');
                }

                if (data.data != undefined && data.data != "" && data.data != null) {
                    $scope.model.WorkflowCat = data.data.WorkflowCat;
                    $scope.check = false;

                    if (data.data.Status.length != undefined) {
                        try {
                            var json = JSON.parse(data.data.Status);
                        } catch (e) {
                            console.log(e);
                            json = [];
                        }
                        var arr = [];
                        arr.push(json[json.length - 1]);
                        $scope.loghis = arr;
                        $scope.model.Status = $scope.loghis[0].StatusCode;
                    }
                }
                else {
                    $scope.model.WorkflowCat = data.WorkflowCat;
                    $scope.model.Status = data.WorkflowCat;
                    if (data.Status != undefined && data.Status != null && data.Status != '') {
                        try {
                            var json = JSON.parse(data.StatusLog);
                        } catch (e) {
                            console.log(e);
                            json = [];
                        }
                        var arr = [];
                        arr.push(json[json.length - 1]);
                        $scope.loghis = arr;
                        $scope.model.Status = $scope.loghis[0].StatusCode;
                    }
                }
                $scope.lstStatus = data.com
            });
        }
        $scope.initData();
    }
    else {
        $location.path("/");
    }
    $scope.changeStatus = function () {
        if ($scope.model.Status == "" || $scope.model.Status == null || $scope.model.Status == undefined) {
            $scope.errorStatus = true;
        }
        else {
            $scope.errorStatus = false;
        }
        if ($scope.model.Status == "REPEAT_REQUIRE_REWORK" || $scope.model.Status == "FINAL_REQUIRE_REWORK") {
            dataserviceContractPO.getListRepeat($scope.model.PoSupCode, function (rs) {
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
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.changleSelect = function (SelectType, item) {
        if (SelectType == "BuyerCode" && $scope.model.BuyerCode != "") {
            $scope.errorBuyerCode = false;
        }
        if (SelectType == "SupCode" && $scope.model.SupCode != "") {
            $scope.errorSupCode = false;
        }
        if (SelectType == "ContractProject" && $scope.modelView.ContractProject != "") {
            $scope.errorContractProject = false;
            dataserviceContractPO.getListSupCode(item.Code, item.Type, function (rs) {
                rs = rs.data;
                $scope.ListSupCode = rs;
            });
            if (item.Type == "PROJECT") {
                $scope.model.ContractCode = '';
                $scope.model.ProjectCode = item.Code;
                $rootScope.ContractCode4AddProduct = '';
                $rootScope.ProjectCode4AddProduct = item.Code;
            } else {
                $scope.model.ProjectCode = '';
                $scope.model.ContractCode = item.Code;
                $rootScope.ContractCode4AddProduct = item.Code;
                $rootScope.ProjectCode4AddProduct = '';
            }
        }
        if (SelectType == "Currency" && $scope.model.Currency != "") {
            $scope.errorCurrency = false;
            if ($scope.model.Currency == 'CURRENCY_VND') {
                $scope.model.ExchangeRate = 1;
            }
        }
        if (SelectType == "ExchangeRate" && ($scope.model.ExchangeRate == null || $scope.model.ExchangeRate == undefined || $scope.model.ExchangeRate <= 0)) {
            $scope.errorExchangeRate = true;
        } else {
            $scope.errorExchangeRate = false;
        }
    }
    $scope.resetContractProject = function () {
        $scope.ListSupCode = [];
        $scope.model.SupCode = '';
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.BuyerCode == "" || data.BuyerCode == null) {
            $scope.errorBuyerCode = true;
            mess.Status = true;
        } else {
            $scope.errorBuyerCode = false;
        }
        if (data.SupCode == "" || data.SupCode == null) {
            $scope.errorSupCode = true;
            mess.Status = true;
        } else {
            $scope.errorSupCode = false;
        }
        if ((data.ContractCode == "" || data.ContractCode == null) && (data.ProjectCode == "" || data.ProjectCode == null)) {
            $scope.errorContractProject = true;
            mess.Status = true;
        } else {
            $scope.errorContractProject = false;
        }
        if (data.sDateOfOrder == "" || data.sDateOfOrder == null || data.sDateOfOrder == undefined) {
            $scope.errorsDateOfOrder = true;
            mess.Status = true;
        } else {
            $scope.errorsDateOfOrder = false;
        }
        if (data.sEstimateTime == "" || data.sEstimateTime == null || data.sEstimateTime == undefined) {
            $scope.errorsEstimateTime = true;
            mess.Status = true;
        } else {
            $scope.errorsEstimateTime = false;
        }
        if (data.Currency == "" || data.Currency == null || data.Currency == undefined) {
            $scope.errorCurrency = true;
            mess.Status = true;
        } else {
            $scope.errorCurrency = false;
        }
        if (data.ExchangeRate == null || data.ExchangeRate == undefined || data.ExchangeRate <= 0) {
            $scope.errorExchangeRate = true;
            mess.Status = true;
        } else {
            $scope.errorExchangeRate = false;
        }
        return mess;
    };

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.forms.editform.validate() && !validationSelect($scope.model).Status) {
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmUpdate.html',
                resolve: {
                    para: function () {
                        return $scope.model;
                    }
                },
                windowClass: "message-center",
                controller: function ($scope, $uibModalInstance, para) {
                    $scope.message = caption.COM_MSG_EDIT_CONFIRM.replace("{0}", "");//"Bạn có chắc chắn muốn thay đổi ?";
                    $scope.ok = function () {
                        dataserviceContractPO.update(para, function (result) {
                            result = result.data;
                            if (result.Error) {
                                App.toastrError(result.Title);
                            } else {
                                App.toastrSuccess(result.Title);
                                $uibModalInstance.close();
                                $rootScope.reloadNoResetPage();
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
                dataservice.updateStatusWF("CONTRACT_PO", $scope.model.PoSupCode, $scope.model.Status, $scope.model.ActRepeat, function (rs) {
                    if ($scope.model.Status != "FINAL_DONE") {
                        dataserviceContractPO.getActionStatus($scope.model.PoSupCode, function (rs) {
                            rs = rs.data;
                            try {
                                var json = JSON.parse(rs[0].StatusLog);
                            } catch (e) {
                                console.log(e);
                                json = [];
                            }
                            var arr = [];
                            arr.push(json[json.length - 1]);
                            $scope.loghis = arr;
                            $scope.model.Status = $scope.loghis[0].StatusCode;
                        })
                        dataserviceContractPO.getItemHeaderWithCode($scope.model.PoSupCode, function (rs) {
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
            }, function () {
            });
        }
    }

    $scope.calculateDateOfOrder = function () {

        if ($scope.model.sDateOfOrder != "") {
            if ($scope.sDateCount != '' && $scope.sDateCount != undefined && $scope.sDateCount > 0) {
                $scope.model.sEstimateTime = addDays($scope.model.sDateOfOrder, $scope.sDateCount);
                $('#EstimateTime').datepicker('update', $scope.model.sEstimateTime);
            }
            else {
                if ($scope.model.sEstimateTime != '') {
                    var endDate = $scope.model.sEstimateTime.split("/");
                    var endDate1 = new Date(endDate[2], endDate[1] - 1, endDate[0]);
                    var effectiveDate = $scope.model.sDateOfOrder.split("/");
                    var effectiveDate1 = new Date(effectiveDate[2], effectiveDate[1] - 1, effectiveDate[0]);
                    if (endDate1 > effectiveDate1) {
                        var diffMs = (endDate1 - effectiveDate1);
                        var diffDay = Math.floor((diffMs / 86400000));
                        $scope.sDateCount = diffDay;
                        $('#DateCount').val(diffDay);
                        resetValidateDuration();
                    }
                }
            }
            resetValidateEndDate();
        }
    }
    $scope.calculateDuration = function () {
        debugger
        if ($scope.sDateCount != "" && $scope.sDateCount != undefined && $scope.sDateCount > 0) {
            if ($scope.model.sDateOfOrder != '') {
                $scope.model.sEstimateTime = addDays($scope.model.sDateOfOrder, $scope.sDateCount);
                $('#EstimateTime').datepicker('update', $scope.model.EstimateTime);
            }
            else {
                if ($scope.model.sEstimateTime != '') {
                    $scope.model.sDateOfOrder = addDays($scope.model.sEstimateTime, -1 * $scope.sDateCount);
                    $('#DateOfOrder').datepicker('update', $scope.model.sDateOfOrder);
                }
            }
            resetValidateEndDate();
            resetValidateEffectiveDate();
        }
    }
    $scope.calculateEstimateTime = function () {
        if ($scope.model.sEstimateTime != "") {
            if ($scope.model.sDateOfOrder != '') {
                var endDate = $scope.model.sEstimateTime.split("/");
                var endDate1 = new Date(endDate[2], endDate[1] - 1, endDate[0]);
                var effectiveDate = $scope.model.sDateOfOrder.split("/");
                var effectiveDate1 = new Date(effectiveDate[2], effectiveDate[1] - 1, effectiveDate[0]);
                if (endDate1 > effectiveDate1) {
                    var diffMs = (endDate1 - effectiveDate1);
                    var diffDay = Math.floor((diffMs / 86400000));
                    $scope.sDateCount = diffDay;
                    $('#DateCount').val(diffDay);
                    resetValidateDuration();
                }
                else {
                    App.toastrError(caption.CP_CURD_MSG_CHECK_DATE);
                }
            }
            else {
                if ($scope.sDateCount != '' && $scope.sDateCount > 0) {
                    $scope.model.sDateOfOrder = addDays($scope.model.sDateOfOrder, -1 * $scope.sDateCount);
                    $('#DateOfOrder').datepicker('update', $scope.model.sDateOfOrder);
                }
            }
        }
        resetValidateEffectiveDate();
    }

    function addDays(dt, n) {
        var ds = dt.split("/");
        var startDate = new Date(ds[2], ds[1] - 1, ds[0]);
        startDate.setTime(startDate.getTime() + (n * 24 * 60 * 60 * 1000));
        var futureDate = startDate.getDate() + "/" + (startDate.getMonth() + 1) + "/" + startDate.getFullYear();
        futureDate = futureDate.replace(/^(\d{1}\/)/, "0$1").replace(/(\d{2}\/)(\d{1}\/)/, "$10$2");
        return futureDate;
    }
    function resetValidateDuration() {
        if ($('#DateCount').valid()) {
            $('#DateCount').removeClass('invalid').addClass('success');
        }
    }
    function resetValidateEffectiveDate() {
        if ($('#DateOfOrder input').valid()) {
            $('#DateOfOrder input').removeClass('invalid').addClass('success');
        }
    }
    function resetValidateEndDate() {
        if ($('#EstimateTime input').valid()) {
            $('#EstimateTime input').removeClass('invalid').addClass('success');
        }
    }

    $rootScope.amountbudget = function (amount) {
        $scope.model.Budget = amount;
    }
    function convertDate(data) {
        var date = $filter('date')(new Date(data), 'dd/MM/yyyy');
        return date;
    }
    function validateDefaultDate(dateOrder, dateEstimate) {
        setStartDate("#EstimateTime", dateOrder);
        setEndDate("#DateOfOrder", dateEstimate);
    }
    setTimeout(function () {
        updateNotify();
        setModalDraggable('.modal-dialog');
        $("#DateOfOrder").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $scope.model.sDateOfOrder = new Date(selected.date.valueOf());
            if ($scope.model.sDateOfOrder == "" || $scope.model.sDateOfOrder == null || $scope.model.sDateOfOrder == undefined) {
                $scope.errorsDateOfOrder = true;
            } else {
                $scope.errorsDateOfOrder = false;
            }
            $('#EstimateTime').datepicker('setStartDate', maxDate);
        });
        $("#EstimateTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            $scope.model.sEstimateTime = new Date(selected.date.valueOf());
            if ($scope.model.sEstimateTime == "" || $scope.model.sEstimateTime == null || $scope.model.sEstimateTime == undefined) {
                $scope.errorsEstimateTime = true;
            } else {
                $scope.errorsEstimateTime = false;
            }
            //$('#DateOfOrder').datepicker('setEndDate', $scope.model.sEstimateTime);
        });

        $("#datefrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $("#EffectiveDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EndDate').datepicker('setStartDate', maxDate);
        });
        $("#EndDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EffectiveDate').datepicker('setEndDate', maxDate);
        });
        setModalDraggable('.modal-dialog');
    }, 200);
    $scope.addCardJob = function () {
        var obj = {
            Code: $scope.model.PoSupCode,
            Name: $scope.model.PoTitle,
            TabBoard: 11
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCardJob + "/add-card-buffer.html",
            controller: 'add-card-object',
            backdrop: 'static',
            size: '80',
            resolve: {
                para: function () {
                    return obj;
                }
            }
        });
        modalInstance.result.then(function (d) {
        }, function () { });
    };

    $scope.isTex == false
    $scope.ShowHeader = function () {

        if ($scope.isTex == false) {
            $scope.isShowHeader = true
            $scope.isShowDetail = false;
            $scope.isTex = true;
        }
        else {
            $scope.isShowHeader = false
            $scope.isShowDetail = true;
            $scope.isTex = false;
        }
    }
    $scope.activity = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderContractPO + '/activity.html',
            controller: 'activity',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return $scope.model.PoSupCode;
                }
            },
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }
    $scope.openLog = function () {
        dataserviceContractPO.getUpdateLog($scope.model.PoSupCode, function (rs) {
            rs = rs.data;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderContractPO + '/showLog.html',
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
    $scope.openAttributeFormManager = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderContractPO + '/attributeManager.html',
            controller: 'attributeManager',
            backdrop: 'static',
            size: '70',
            resolve: {
                para: function () {
                    return $scope.model.PoSupCode;
                }
            },
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () { });
    }
    $scope.addCommonSettingContractStatus = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'CONTRACT_STATUS_PO_SUP',
                        GroupNote: 'Trạng thái đặt hàng(Nhà cung cấp)',
                        AssetCode: 'CONTRACT'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceContractPO.getStatusPOSup(function (rs) {
                rs = rs.data;
                $rootScope.status = rs;
            });
            dataserviceContractPO.getListCommon(function (rs) {
                rs = rs.data;
                $rootScope.ListCommon = rs;
            });
        }, function () { });

    }

    //Edit Activity Instance
    $scope.editInstAct = function (id, objCode) {
        dataserviceContractPO.checkPermissionEditActivityById(id, function (rs) {
            rs = rs.data;
            if (!rs) {
                return App.toastrError(caption.COM_MSG_PERMISSION_EDIT_ACT);
            }
            dataserviceContractPO.getItemActInst(id, function (rs) {
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
                    $rootScope.loadDiagramWfInst($scope.model.PoSupCode, $scope.modelWf.ObjectType);
                    dataserviceContractPO.getLogStatus($scope.model.PoSupCode, function (rs) {
                        rs = rs.data;
                        try {
                            var json = JSON.parse(rs.Status);
                        } catch (e) {
                            console.log(e);
                            json = [];
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

    //Show, hide header
    $scope.isShowHeader = true;
    $scope.showHeaderCard = function () {
        $scope.isShowHeader = true;
    }
    $scope.hideHeader = function () {
        $scope.isShowHeader = false;
    }
    function updateNotify() {
        dataserviceContractPO.getCountNotify(function (rs) {
            rs = rs.data;
            document.getElementById("contractPO").innerText = "Bạn có " + rs.CountContractPO + " hợp đồng mua.";
            document.getElementById("countAllNotifyNew").innerText = rs.All;
            document.getElementById("allNotifyNew").innerText = rs.All + " mới";
        })
    }
    //End show, hide header
});

app.controller('addProduct', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceContractPO, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        ProductCode: '',
        ProductType: '',
        ProductTypeName: '',
        Catalogue: '',
        Quantity: 1,
        Unit: '',
        Note: '',
        Currency: 'CURRENCY_VND',
        UnitPrice: '',
        PoSupCode: '',
        ListProductDetail: []
    }
    $scope.modelSearch = {
        FromDate: '',
        ToDate: '',
        ProjectCode: $rootScope.ProjectCode4AddProduct,
        ContractCode: $rootScope.ContractCode4AddProduct,
        RequestCode: ''
    }
    $scope.isExtend = false;
    $scope.isAdd = true;
    $scope.isDisableProductCode = false;
    $scope.isDisableUnit = false;
    $scope.isDisableProductType = true;
    $scope.isDisableCatalogue = true;
    $scope.isDisableCurrency = false;

    $scope.errorPrice = false;
    $scope.errorQuantity = false;

    $scope.listRequestChoose = [];
    $scope.listRequest = [];
    $scope.listAllRequest = [];
    $scope.listProducts = [];
    $scope.listProductsOld = [];
    $scope.listReqCode = [];
    $scope.forms = {};

    $scope.isCheckAll = false;

    //khách lẻ
    $scope.currencys = [
        {
            Code: 'JPY',
            Name: 'Yên'
        },
        {
            Code: 'VND',
            Name: 'VNĐ'
        },
        {
            Code: 'USD',
            Name: 'USD'
        }
    ];
    $scope.services = [];
    $rootScope.serviceCost = [];
    $scope.serviceCost = [];
    $scope.serviceTotalCost = [];
    $scope.serviceDetails = [];
    $rootScope.serviceJtable = {};
    $rootScope.map = {};
    $rootScope.excludeCondition = {};
    $scope.editId = -1;
    $rootScope.unExcludeCondition = {};
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/ContractPo/JTableDetail",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.PoSupCode = $rootScope.PoSupCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
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
            $rootScope.serviceJtable[dataIndex] = data;
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    //end option table
    //Tạo các cột của bảng để đổ dữ liệu vào
    vm.dtColumns = [];

    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductCode').withTitle('{{"CP_LIST_COL_PRODUCT_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'class18'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductName').withTitle('{{"CP_LIST_COL_PRODUCT_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'class18'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Unit').withTitle('{{"CP_LIST_COL_UNIT" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UnitName').withTitle('{{"CP_LIST_COL_UNIT" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'class9'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UnitPrice').withTitle('{{"CP_LIST_COL_COST" | translate}}').renderWith(function (data, type) {
        var dt = data != "" ? $filter('currency')(data, '', 0) : null;
        dt = "<span class = 'text-danger bold'>" + dt + "</span>";
        return dt;
    }).withOption('sClass', 'class18'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"CP_LIST_COL_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'class18'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withTitle('{{"CP_LIST_COL_QUANTITY" | translate}}').renderWith(function (data, type) {
        var dt = data != "" ? $filter('currency')(data, '', 0) : null;
        dt = "<span class = 'text-primary bold'>" + dt + "</span>";
        return dt;
    }).withOption('sClass', 'class9'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('TotalAmount').withTitle('{{"CP_LIST_COL_TOTAL_COST" | translate}}').renderWith(function (data, type, full) {
        var cost = full.UnitPrice * full.Quantity;
        var dt = cost != "" ? $filter('currency')(cost, '', 0) : null;
        dt = "<span class = 'text-danger bold'>" + dt + "</span>";
        return dt;
    }).withOption('sClass', 'class18'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Currency').withTitle('Tiền tệ').renderWith(function (data, type) {
    //    return data;
    //}).withOption('sClass', 'hidden'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('CurrencyName').withTitle('Tiền tệ').renderWith(function (data, type) {
    //    return data;
    //}).withOption('sClass', 'class9'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"CP_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }).withOption('sClass', 'class9'));
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
    $scope.filterTotalCost = function () {
        $rootScope.RealBudget = $rootScope.Budget;
        for (var i = 0; i < $scope.serviceTotalCost.length; ++i) {
            try {
                var data = $scope.serviceTotalCost[i];
                if (data.ObjFromValue != null && data.ObjToValue != null) {
                    var fromCost = parseFloat(data.ObjFromValue);
                    var toCost = parseFloat(data.ObjToValue);
                    if (fromCost <= $rootScope.Budget && $rootScope.Budget <= toCost) {
                        $rootScope.RealBudget = $rootScope.Budget * data.Price;
                        break;

                    }
                }
                else if (data.ObjFromValue == null && data.ObjToValue != null) {
                    var toCost = parseFloat(data.ObjToValue);
                    if ($rootScope.Budget <= toCost) {

                        $rootScope.RealBudget = $rootScope.Budget * data.Price;
                        break;

                    }
                }
                else if (data.ObjFromValue != null && data.ObjToValue == null) {
                    var fromCost = parseFloat(data.ObjFromValue);
                    if (fromCost <= $rootScope.Budget) {

                        $rootScope.RealBudget = $rootScope.Budget * data.Price;
                        break;

                    }
                }
            }
            catch (ex) { }
        }

    }
    
    $scope.search = function () {
        if ($scope.modelSearch.FromDate != '' || $scope.modelSearch.ToDate != '' || $scope.modelSearch.ProjectCode != '' || $scope.modelSearch.ContractCode != '' || $scope.modelSearch.RequestCode != '') {
            dataserviceContractPO.getListRequest($scope.modelSearch.FromDate, $scope.modelSearch.ToDate, $scope.modelSearch.ProjectCode, $scope.modelSearch.ContractCode, $scope.modelSearch.RequestCode, $rootScope.SupCode, function (result) {
                result = result.data;
                $scope.listRequest = result;
                $scope.listRequestChoose = result;
                if ($scope.listRequest.length > 0 && $scope.listRequestChoose.length > 0) {
                    $scope.listProducts = [];
                    for (var i = 0; i < $scope.listRequestChoose.length; i++) {
                        dataserviceContractPO.getListProductByRequest($scope.listRequestChoose[i].Code, $rootScope.SupCode, function (result) {
                            result = result.data;
                            if (result.length > 0) {
                                for (var i = 0; i < result.length; i++) {
                                    result[i].Checked = true;
                                    result[i].Type = "NEW";
                                    $scope.listProducts.push(result[i]);
                                }
                                $scope.listProducts.reverse();
                                $scope.setCheckAll();
                            }
                        });
                    }

                    for (var i = 0; i < $scope.listProductsOld.length; i++) {
                        $scope.listProducts.push($scope.listProductsOld[i]);
                    }

                } else {
                    App.toastrError(caption.CP_MSG_NOT_FOUND_REQUEST);
                }
            });
        }
    }
    $rootScope.searchProduct = function () {
        $scope.search();
    }
    $scope.add = function () {
        if ($scope.model.UnitPrice == null && !$scope.errorPrice) {
            $scope.errorPrice = true;
            return false;
        }

        //if ($scope.errorPrice || $scope.errorQuantity) {
        //    return false;
        //}

        if ($rootScope.PoSupCode != '') {
            validationSelect($scope.model);
            $scope.isAdd = true;
            $scope.model.PoSupCode = $rootScope.PoSupCode;
            if ($scope.forms.addform.validate() && !validationSelect($scope.model).Status) {
                dataserviceContractPO.insertDetail($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $scope.model.Currency = '';
                        $scope.model.Unit = '';
                        $scope.model.UnitPrice = '';
                        $scope.model.Catalogue = '';
                        $scope.model.ProductTypeName = '';
                        $scope.model.ProductCode = '';
                        $scope.model.Quantity = 1;
                        $scope.reload();
                    }
                });
            }
        }
    }
    $scope.edit = function (id) {
        $scope.isAdd = false;
        $scope.editId = id;
        var listdata = $('#tblDataProduct').DataTable().data();
        for (var i = 0; i < listdata.length; ++i) {
            if (id == listdata[i].Id) {
                var count = 0;
                var data = listdata[i];

                $scope.model.Id = data.Id;
                $scope.model.PoSupCode = data.PoSupCode;
                $scope.model.ProductCode = data.ProductCode;
                $scope.model.Quantity = parseInt(data.Quantity);
                $scope.model.UnitPrice = parseFloat(data.UnitPrice);
                $scope.model.Unit = data.Unit;
                $scope.model.Note = data.Note;
                $scope.model.Currency = data.Currency;
                $scope.model.Catalogue = data.Catalogue;
                $scope.model.ProductType = data.ProductType;
                $scope.model.ProductTypeName = data.ProductTypeName;
                $scope.isDisableForm();
                break;
            }
        }
    }
    $scope.close = function (id) {
        $scope.isAdd = true;
        $scope.editId = -1;
        $scope.removeDisableForm();
        $scope.model.Currency = '';
        $scope.model.Unit = '';
        $scope.model.UnitPrice = '';
        $scope.model.Catalogue = '';
        $scope.model.ProductTypeName = '';
        $scope.model.ProductCode = '';
        $scope.changeQuantityPrice();

    }
    $scope.save = function (id) {
        if ($rootScope.IsStorage) {
            if ($scope.model.UnitPrice == null && !$scope.errorPrice) {
                $scope.errorPrice = true;
                return false;
            }

            //if ($scope.errorPrice || $scope.errorQuantity) {
            //    return false;
            //}

            validationSelect($scope.model);
            if ($scope.forms.addform.validate() && !validationSelect($scope.model).Status) {
                dataserviceContractPO.updateDetail($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {

                        App.toastrSuccess(rs.Title);
                        $scope.reload();
                        $scope.isAdd = true;
                        $scope.removeDisableForm();
                        $scope.model.Currency = '';
                        $scope.model.Unit = '';
                        $scope.model.UnitPrice = '';
                        $scope.model.Note = '';
                        $scope.model.Catalogue = '';
                        $scope.model.ProductTypeName = '';
                        $scope.model.ProductCode = '';
                        $scope.model.Quantity = 1;

                        $scope.jTableDetailImp();
                    }
                });
            }
        } else {
            $scope.listReqCode = [];
            for (var i = 0; i < $scope.listRequestChoose.length; i++) {
                $scope.listReqCode.push($scope.listRequestChoose[i].Code);
            }
            $scope.model.PoSupCode = $rootScope.PoSupCode;
            //$scope.model.ReqCode = $scope.listReqCode.join();
            $scope.ListProductDetail = [];
            for (var i = 0; i < $scope.listProducts.length; i++) {
                if ($scope.listProducts[i].Checked)
                    $scope.model.ListProductDetail.push($scope.listProducts[i]);
            }

            for (var i = 0; i < $scope.model.ListProductDetail.length; i++) {
                if ($scope.model.ListProductDetail[i].RateLoss == '' || $scope.model.ListProductDetail[i].RateLoss <= 0) {
                    $scope.errorRateLoss = true;
                    break;
                }
            }
            if (!$scope.errorRateConversion && !$scope.errorRateLoss) {
                dataserviceContractPO.updateDetailReqImp($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);

                        $scope.jTableDetailImp();
                    }
                });
            } else {
                //if ($scope.errorRateConversion && $scope.errorRateLoss) {
                //    App.toastrError("- Tỉ lệ quy đổi và tỉ lệ hao hụt nhập số dương");
                //    return;
                //} else if ($scope.errorRateConversion) {
                //    App.toastrError("- Tỉ lệ quy đổi nhập số dương");
                //    return;
                //} else if ($scope.errorRateLoss) {
                //    App.toastrError("- Tỉ lệ hao hụt nhập số dương");
                //    return;
                //}
            }
        }
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;//"Bạn có chắc chắn muốn xóa?";
                $scope.ok = function () {
                    dataserviceContractPO.deleteDetail(id, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $uibModalInstance.close(id);
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
            if ($scope.editId == d) {
                $scope.close();
            }

            $scope.reload();
        }, function () {
        });
    }
    $scope.changeQuantityPrice = function () {

        if (($scope.model.UnitPrice != '' && $scope.model.UnitPrice != null && $scope.model.UnitPrice != undefined) || $scope.model.UnitPrice == 0) {
            if ($scope.model.UnitPrice <= 0) {
                $scope.errorPrice = true;
            }
            else {
                $scope.errorPrice = false;
            }
        } else {
            $scope.errorPrice = false;
        }
        if (($scope.model.Quantity != '' && $scope.model.Quantity != null && $scope.model.Quantity != undefined) || $scope.model.Quantity == 0) {
            if ($scope.model.Quantity <= 0) {
                $scope.errorQuantity = true;
            } else {
                $scope.errorQuantity = false;
            }
        } else {
            $scope.errorQuantity = false;
        }
    }
    $scope.init = function () {
        dataserviceContractPO.getListAllRequest(function (result) {
            result = result.data;
            $scope.listAllRequest = result;

            if ($rootScope.PoSupCode != '') {
                $scope.jTableDetailImp();
            }
        });
        dataserviceContractPO.getListCurrency(function (rs) {
            rs = rs.data;
            $scope.currencys = rs;
        });
        dataserviceContractPO.getListUnit(function (rs) {
            rs = rs.data;
            $scope.units = rs;
        });
        dataserviceContractPO.getListProject(function (rs) {
            rs = rs.data;
            $scope.projects = rs;
        });
        dataserviceContractPO.getListContract(function (rs) {
            rs = rs.data;
            $scope.contracts = rs;
        });
    }
    $scope.jTableDetailImp = function () {
        dataserviceContractPO.jTableDetailImp($rootScope.PoSupCode, $rootScope.ContractCode4AddProduct, $rootScope.ProjectCode4AddProduct, function (result) {
            result = result.data;
            $scope.listProducts = [];
            $scope.listProductsOld = [];
            $scope.model.ListProductDetail = [];
            for (var i = 0; i < result.length; i++) {
                result[i].Checked = true;
                result[i].Type = "OLD";
                $scope.listProducts.push(result[i]);
                $scope.listProductsOld.push(result[i]);
            }

            $scope.setCheckAll();

            $scope.listRequestChoose = [];
            for (var i = 0; i < $scope.listProducts.length; i++) {
                var rs = $scope.listAllRequest.filter(x => x.Code == $scope.listProducts[i].ReqCode);
                if (rs.length == 1) {
                    var obj = {
                        Code: rs[0].Code,
                        Name: rs[0].Name
                    }

                    var rs = $scope.listRequestChoose.filter(x => x.Code == obj.Code);
                    if (rs.length == 0) {
                        $scope.listRequestChoose.push(obj);
                    }
                }
            }
        });
    }
    $scope.filterCost = function () {
        if ($scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
            if ($scope.model.ServiceCondition != null && $scope.model.ServiceCondition != '' && $scope.model.ServiceCondition != undefined) {
                var data = null;
                if ($scope.serviceCost != null) {
                    for (var i = 0; i < $scope.serviceCost.length; ++i) {
                        var item = $scope.serviceCost[i];
                        if (item.Id == $scope.model.Range) {
                            data = item;
                            break;
                        }
                    }
                }
                if (data != null) {
                    console.log(data);
                    //if (data.Price >= 0) {
                    //    $scope.model.UnitPrice = data.Price;
                    //}

                    var isCheck = false;
                    for (var i = 0; i < $scope.serviceDetails.length; ++i) {
                        var item = $scope.serviceDetails[i];
                        if (item.ConditionName == data.ConditionName && item.ConditionRange == data.ConditionRange) {
                            isCheck = true;
                            break;
                        }
                    }
                    if (isCheck == false) {
                        $scope.serviceDetails.push(data);
                    }
                    else {
                        //App.toastrWarning("Bạn đã thêm ");
                    }

                    //    Condition: "SERVICE_CONDITION_002"
                    //ConditionName: "Khách hàng thi công"
                    //ConditionRange: "12 năm -> 25 năm"
                    $scope.operationCost();
                    console.log($scope.serviceDetails);
                }
                else {
                    App.toastrWarning(caption.CP_MSG_NOT_FILTER_COST);
                    $scope.model.UnitPrice = '';
                }

            }
            else {

            }
        }
    }
    $scope.operationCost = function () {
        $scope.model.UnitPrice = 0;
        // $scope.model.UnitPrice = data.Price;
        for (var i = 0; i < $scope.serviceDetails.length; ++i) {
            try {
                var item = $scope.serviceDetails[i];
                $scope.model.UnitPrice = $scope.model.UnitPrice + item.Price;
            }
            catch (ex) {

            }
        }
        // giảm giá
    }
    $scope.init();

    $scope.changeRequest = function (item) {
        var result = $scope.listRequestChoose.filter(x => x == item);
        if (result.length == 0) {
            var rs = $scope.listRequestChoose.filter(x => x.Code == item.Code);
            if (rs.length == 0) {
                dataserviceContractPO.checkListProductByRequest(item.Code, $rootScope.SupCode, $rootScope.PoSupCode, function (result) {
                    result = result.data;
                    if (result) {
                        App.toastrError(caption.CP_MSG_REQUEST_DIFF_LOC);
                    } else {
                        dataserviceContractPO.getListProductByRequest(item.Code, $rootScope.SupCode, function (result) {
                            result = result.data;
                            if (result.length > 0) {
                                for (var i = 0; i < result.length; i++) {
                                    $scope.listProducts.push(result[i]);
                                }
                                $scope.search();
                                $scope.listRequestChoose.push(item);
                            }
                            else {
                                App.toastrError(caption.CP_MSG_NO_PROD_IN_SUPP_OF_RQ);
                            }
                        });
                    }
                });
            } else {
                App.toastrError(caption.CP_MSG_REUQEST_IN_LIST);
            }

            setTimeout(function () {
                loadDate();
            }, 100);
        }
    }

    $scope.checkAll = function () {
        if ($scope.isCheckAll) {
            if ($scope.listProducts.length > 0) {
                for (var i = 0; i < $scope.listProducts.length; i++) {
                    $scope.listProducts[i].Checked = true;
                }
            }
        } else {
            if ($scope.listProducts.length > 0) {
                for (var i = 0; i < $scope.listProducts.length; i++) {
                    $scope.listProducts[i].Checked = false;
                }
            }
        }
    }

    $scope.setCheckAll = function () {
        if ($scope.listProducts.length > 0) {
            var checkCount = 0;
            for (var i = 0; i < $scope.listProducts.length; i++) {
                if ($scope.listProducts[i].Checked) {
                    checkCount++;
                }
            }

            if (checkCount == $scope.listProducts.length) {
                $scope.isCheckAll = true;
            } else {
                $scope.isCheckAll = false;
            }
        }
    }

    $scope.setUnCheckByReq = function (checked, reqCode) {
        if ($scope.listProducts.length > 0) {
            var checkCount = 0;
            for (var i = 0; i < $scope.listProducts.length; i++) {
                if ($scope.listProducts[i].ReqCode == reqCode) {
                    $scope.listProducts[i].Checked = checked;
                }
            }
        }
    }

    $scope.checkItem = function (x) {
        if (x.Checked) {
            x.Checked = false;
            $scope.isCheckAll = false;
        } else {
            x.Checked = true;
        }
        $scope.setUnCheckByReq(x.Checked, x.ReqCode);
        $scope.setCheckAll();
    }

    $scope.isDisableForm = function () {
        $scope.isDisableProductCode = true;
    }
    $scope.removeDisableForm = function () {
        $scope.isDisableProductCode = false;
    }
    $scope.removeRequest = function (index) {
        var reqCodeRemove = $scope.listRequestChoose[index].Code;
        $scope.listRequestChoose.splice(index, 1);
        for (var i = 0; i < $scope.listProducts.length; i++) {
            if ($scope.listProducts[i].ReqCode == reqCodeRemove) {
                $scope.listProducts.splice(i, 1);
                i--;
                $scope.search();
            }
        }
    }

    //Action khi chọn 1 combobox
    $scope.changleSelect = function (SelectType, item) {
        if (SelectType == "ProductCode") {
            $scope.model.Unit = item.Unit;
            if (item.Unit != '')
                $scope.errorUnit = false;
            $scope.model.UnitName = item.UnitName;
            $scope.model.ProductName = item.Name;
            $scope.model.ProductType = item.ProductType;
            $scope.model.ProductTypeName = item.ProductTypeName;
            $scope.model.Catalogue = item.Catalogue;
        }

        if (SelectType == "ProductCode" && $scope.model.ProductCode != "") {
            $scope.errorProductCode = false;
        }
        if (SelectType == "Currency" && $scope.model.Currency != "") {
            $scope.errorCurrency = false;
        }
        if (SelectType == "Unit" && $scope.model.Unit != "") {
            $scope.errorUnit = false;
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.ProductCode == "") {
            $scope.errorProductCode = true;
            mess.Status = true;
        } else {
            $scope.errorProductCode = false;
        }
        //if (data.Currency == "") {
        //    $scope.errorCurrency = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorCurrency = false;
        //}
        if (data.Unit == "") {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;
        }
        if (data.UnitPrice == "") {
            $scope.errorPrice = true;
            mess.Status = true;
        } else {
            $scope.errorPrice = false;
        }
        if (data.Quantity == "") {
            $scope.errorQuantity = true;
            mess.Status = true;
        } else {
            $scope.errorQuantity = false;
        }
        return mess;
    };

    function loadDate() {
        $(".datePicker").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
        });
        $("#datefromtimepicker").datetimepicker({
            //startDate: new Date(),
            useCurrent: true,
            autoclose: true,
            keepOpen: true,
            format: 'dd/mm/yyyy hh:ii',
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#datetotimepicker').datetimepicker('setStartDate', maxDate);
            $scope.search();
        });
        $("#datetotimepicker").datetimepicker({
            useCurrent: true,
            autoclose: true,
            keepOpen: true,
            format: 'dd/mm/yyyy hh:ii',
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#datefromtimepicker').datetimepicker('setEndDate', maxDate);
            $scope.search();
        });
        $('.end-date').click(function () {
            $('#datefromtimepicker').datetimepicker('setEndDate', new Date('01/01/4000'));
        });
        $('.start-date').click(function () {
            $('#datetotimepicker').datetimepicker('setStartDate', '01/01/1900');
        });
    }

    setTimeout(function () {
        loadDate();
        //setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 100);
});

app.controller('activity', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataserviceContractPO, $timeout, para) {
    $scope.listLogConfirm = [];
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    var item = '';

    $scope.isEdit = false;

    $scope.model = {
        Confirm: ''
    };

    $scope.initLoad = function () {
        dataserviceContractPO.getListConfirmText(para, function (rs) {
            rs = rs.data;
            $scope.listLogConfirm = rs;
        });
    };

    $scope.initLoad();

    $scope.editItem = function (index) {
        $scope.isEdit = true;
        item = $scope.listLogConfirm[index];
        $scope.model.Confirm = $scope.listLogConfirm[index].Body;
    }

    $scope.removeItem = function (index) {
        item = $scope.listLogConfirm[index];
        dataserviceContractPO.deleteConfirmTextById(para, item.Id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $scope.listLogConfirm.splice(index, 1);
            }
        });
    }

    $scope.add = function () {
        if ($scope.model.Confirm != '' && !$scope.isEdit) {
            dataserviceContractPO.insertConfirmText(para, $scope.model.Confirm, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.initLoad();
                }
            });
        } else {
            App.toastrError(caption.CP_MSG_ENTER_REPORT)
        }
    }

    $scope.close = function () {
        $scope.isEdit = false;
    }

    $scope.save = function () {
        item.Body = $scope.model.Confirm;
        if ($scope.model.Confirm != '' && $scope.isEdit) {
            dataserviceContractPO.updateConfirmTextById(para, item.Id, item.Body, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                }
            });
        } else {
            App.toastrError(caption.CP_MSG_SELECT_REPORT)
        }
    }
});

app.controller('showLog', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataserviceContractPO, $timeout, para) {
    var data = para;
    //$scope.logs = [];
    if (data != null) {
        for (var i = 0; i < data.length; ++i) {
            data[i].UpdateContent = JSON.parse(data[i].UpdateContent);

            //var obj = {
            //    CreatedTime: data[i].Header.UpdatedTime != null ? $filter('date')(new Date(data[i].Header.UpdatedTime), 'dd/MM/yyyy HH:mm:ss') : $filter('date')(new Date(data[i].Header.CreatedTime), 'dd/MM/yyyy HH:mm:ss'),
            //    CreatedBy: data[i].Header.UpdatedBy != null ? data[i].Header.UpdatedBy : data[i].Header.CreatedBy,
            //    Body: data[i]
            //}

            //$scope.logs.push(obj);
        }
    }
    $scope.obj = { data: data, options: { mode: 'code' } };
    //$scope.onLoad = function (instance) {
    //    instance.expandAll();
    //};

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    setTimeout(function () {
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 1);
});

app.controller('attributeManager', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $location, $filter, $uibModalInstance, dataserviceContractPO, $timeout, para) {
    $scope.logs = para;
    $scope.PoSupCode = para;
    console.log($scope.logs);
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.attrGroups = [
        { Code: "TIME_GROUP", Name: "Thời gian" }
    ];
    $scope.model = {
        AttrCode: '',
        AttrValue: '',
        AttrGroup: $scope.attrGroups[0].Code
    }

    $scope.isAdd = true;
    $scope.forms = {};

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/ContractPo/JTableAttribute",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.PoSupCode = $scope.PoSupCode;
                //d.AttrCode = $scope.model.AttrCode;
                //d.AttrValue = $scope.model.AttrValue;
            },
            complete: function () {
                App.unblockUI("#contentMain");
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
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("check").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('code').withTitle('{{"CP_CURD_TAB_ATTRIBUTE_LIST_COL_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('value').withTitle('{{"CP_CURD_TAB_ATTRIBUTE_LIST_COL_VALUE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('attrGroup').withTitle('{{"CP_CURD_TAB_ATTRIBUTE_LIST_COL_ATTR_GROUP" | translate}}').renderWith(function (data, type) {
        for (var i = 0; i < $rootScope.ListCommon.length; i++) {
            if ($rootScope.ListCommon[i].Code == data) {
                return $rootScope.ListCommon[i].Name;
                break;
            }
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('note').withTitle('{{"CP_CURD_TAB_ATTRIBUTE_LIST_COL_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));


    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').withOption('sWidth', '40px').renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="edit(' + full.id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }).withOption('sClass', 'col50'));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
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
    function callback(json) {

    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.checkValidator = function (data) {
        var msg = { Error: false, Title: null };
        //if (data.AttrCode == '') {
        //    msg.Error = true;
        //    //msg.Title = "Vui lòng nhập mã thuộc tính";
        //    $scope.errorAttrCode = true;
        //}
        //if (data.AttrValue == '') {
        //    msg.Error = true;
        //    $scope.errorAttrValue = true;
        //}
        if (data.AttrGroup == '') {
            msg.Error = true;
            $scope.errorAttrGroup = true;
        }

        return msg;
    }

    $scope.changleSelect = function (Type, item) {
        if (Type == "AttrGroup")
            $scope.errorAttrGroup = false;
    }

    $scope.add = function () {
        var msg = $scope.checkValidator($scope.model);

        if ($scope.forms.addAtrributeform.validate() && msg.Error == false) {
            $scope.model.PoSupCode = $scope.PoSupCode;
            dataserviceContractPO.insertContractAttr($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    $scope.reload();
                    App.toastrSuccess(rs.Title);
                    //$uibModalInstance.close(rs.Object);
                }
            })
        }
    }
    $scope.edit = function (id) {

        $scope.isAdd = false;
        $scope.editId = id;
        var listdata = $('#tblDataAttribute').DataTable().data();
        for (var i = 0; i < listdata.length; ++i) {
            if (listdata[i].id == id) {
                var item = listdata[i];
                $scope.model.AttrCode = item.code;
                $scope.model.AttrValue = item.value;
                $scope.model.AttrGroup = item.attrGroup;
                $scope.model.Note = item.note;
                break;
            }
        }
    }
    $scope.delete = function (id) {
        debugger
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = "Bạn có chắc chắn muốn xóa?";
                $scope.ok = function () {
                    dataserviceContractPO.deleteContractAttr(id, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
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
            $scope.reload();
        }, function () {
        });
    }
    $scope.close = function (id) {
        $scope.isAdd = true;
        $scope.model = {
            AttrCode: '',
            AttrValue: '',
            AttrGroup: $scope.attrGroups[0].Code
        }
    }
    $scope.save = function (id) {
        $scope.model.ContractAttributeID = $scope.editId;
        var msg = $scope.checkValidator($scope.model);

        if ($scope.forms.addAtrributeform.validate() && msg.Error == false) {
            $scope.model.PoSupCode = $scope.PoSupCode;
            dataserviceContractPO.updateContractAttr($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    $scope.editId = -1;
                    App.toastrSuccess(rs.Title);
                    $scope.close();
                    $scope.reload();
                }
            });
        }
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

app.controller('detail', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceContractPO, $filter, para) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withTitle('{{"CP_LIST_COL_ORDER" | translate}}').notSortable().withOption('sWidth', '30px').withOption('sClass', 'tcenter w50').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ValueSet').withTitle('{{"CP_LIST_COL_VALUE_SET" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeName').withTitle('{{"CP_LIST_COL_TYPE_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"CP_LIST_COL_CREATE_TIME" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{"CP_LIST_COL_CREATE_BY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"CP_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
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
        dataserviceContractPO.getDataType(function (rs) {
            rs = rs.data;
            $scope.listDataType = rs;
        });
    }
    $scope.init();
    $scope.add = function () {

        if ($scope.model.ValueSet == '') {
            App.toastrError(caption.CP_CURD_MSG_SETTING_NOT_BLANK);
        } else if ($scope.model.ValueSet.length > 255) {
            App.toastrError("Vui lòng nhập giá trị cài đặt nhỏ hơn 255 ký tự");
        } else {
            dataserviceContractPO.insertCommonSetting($scope.model, function (rs) {
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
            App.toastrError(caption.CP_CURD_MSG_DATA_NOT_BLANK)
        } else if ($scope.model.ValueSet.length > 255) {
            App.toastrError("Vui lòng nhập giá trị cài đặt nhỏ hơn 255 ký tự");
        } else {
            dataserviceContractPO.updateCommonSetting($scope.model, function (rs) {
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
                    dataserviceContractPO.deleteCommonSetting(id, function (rs) {
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

app.controller('googleMap', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceContractPO, $filter, para) {
    var lat = '';
    var lng = '';
    var address = '';
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.submit = function () {
        var obj = {
            lat: lat,
            lng: lng,
            address: address,
        }
        $uibModalInstance.close(obj);
    }
    $scope.initMap = function () {
        fields_vector_source = new ol.source.Vector({});
        var center = ol.proj.transform([$rootScope.lngDefault, $rootScope.latDefault], 'EPSG:4326', 'EPSG:3857');
        map = new ol.Map({
            target: $('#map')[0],

            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM({
                        url: 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'


                    })
                }),
                new ol.layer.Vector({
                    source: fields_vector_source
                })
            ],

            view: new ol.View({
                center: center,
                zoom: 15

            }),

            controls: ol.control.defaults({
                attribution: false,
                zoom: false,
            })
        });
        var pathGG = $('#pathGG').html();
        var id = $("#ID").html();
        var aaa = parseInt(id);
        if (pathGG != "" && pathGG != null) {
            pathSourceVector = new ol.source.Vector({
                features: []
            });
            pathLayerMarker = new ol.layer.Vector({
                source: pathSourceVector
            });
            var path = polyline.decode(pathGG);

            pathLayerMarker = renderLinePathLayer(path);
            map.addLayer(pathLayerMarker);

            var styles3 = [

                new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: '#64c936',
                        width: 3
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(100, 201, 54,1)'
                    })
                }),
            ];

            var iconStyleStart = new ol.style.Style({
                image: new ol.style.Icon(({
                    anchor: [0.5, 26],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    src: 'https://i.imgur.com/pjZYQLJ.png'
                })),
                zIndex: 11
            });
            var iconStyleEnd = new ol.style.Style({
                image: new ol.style.Icon(({
                    anchor: [0.5, 26],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    src: 'https://i.imgur.com/3g07NhB.png'
                })),
                zIndex: 11
            });

            var pathLenght = path.length - 1;
            var iconFeatureStart = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.transform([parseFloat(path[0][1]), parseFloat(path[0][0])], 'EPSG:4326', 'EPSG:3857')),
                type: "valve"
            });

            iconFeatureStart.setId(1);
            iconFeatureStart.setStyle(iconStyleStart);
            var iconFeatureEnd = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.transform([parseFloat(path[pathLenght][1]), parseFloat(path[pathLenght][0])], 'EPSG:4326', 'EPSG:3857')),
                type: "valve"
            });
            iconFeatureEnd.setId(2);
            iconFeatureEnd.setStyle(iconStyleEnd);
            var vectorIcon = new ol.source.Vector({});
            vectorIcon.addFeature(iconFeatureStart);
            vectorIcon.addFeature(iconFeatureEnd);

            var vectorLayer = new ol.layer.Vector({
                source: vectorIcon,
                style: styles3
            });

            map.addLayer(vectorLayer);


            //pathSource = new ol.source.Vector({});


            pathSource.addFeature(renderLineStringFeature(path))
            var field_location = pathSource.getFeatureById(aaa).getProperties();
            var field_extent = field_location.geometry.getExtent();
            map.getView().fit(field_extent, map.getSize());
            map.getView().setZoom(12);
        }
    }
    $scope.initMap();
    function initData() {
        //init
        if (para) {
            lat = para.lt != '' ? para.lt : $rootScope.latDefault;
            lng = para.lg != '' ? para.lg : $rootScope.lngDefault;
            address = para.lg != '' ? para.address : $rootScope.addressDefault;
            document.getElementById("startPlace").value = address;
        } else {
            lat = $rootScope.latDefault;
            lng = $rootScope.lngDefault;
            address = $rootScope.addressDefault;
            document.getElementById("startPlace").value = $rootScope.addressDefault;
        }

        var centerPoint = { lat: lat, lng: lng };
        var infowindow = new google.maps.InfoWindow({
            content: '<b>Thông tin</b> <br/>' + address,
        });
        var maps = new google.maps.Map(
            document.getElementById('map'), { zoom: $rootScope.zoomMapDefault, center: centerPoint });
        maps.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('startPlace'));
        var marker = new google.maps.Marker({
            zoom: 12,
            position: centerPoint,
            map: maps,
        });
        var defaultBounds = new google.maps.LatLngBounds(new google.maps.LatLng(-33.8902, 151.1759), new google.maps.LatLng(-33.8474, 151.2631));
        var options = {
            bounds: defaultBounds,
            types: ['geocode']
        };




        //Autocomplete
        var input = document.getElementById('startPlace');
        var autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.bindTo('bounds', map);
        var service = new google.maps.places.PlacesService(maps);



        //Map change
        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            infowindow.close();
            marker.setVisible(false);
            var place = autocomplete.getPlace();
            if (!place.geometry) {
                window.alert("Autocomplete's returned place contains no geometry");
                return;
            }

            // If the place has a geometry, then present it on a map.
            if (place.geometry.viewport) {
                maps.fitBounds(place.geometry.viewport);
            } else {
                maps.setCenter(place.geometry.location);
                maps.setZoom(17);
            }
            marker.setIcon(({
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(35, 35)
            }));
            marker.setPosition(place.geometry.location);
            marker.setVisible(true);
            var html = "<b>" + place.name + "</b> <br/>" + place.formatted_address;
            infowindow.setContent(html);
            infowindow.open(maps, marker);
            address = place.formatted_address;
            $scope.$apply();
        });



        //Map click
        infowindow.open(map, marker);
        maps.addListener('click', function (event) {
            var point = { lat: event.latLng.lat(), lng: event.latLng.lng() }
            lat = point.lat;
            lng = point.lng;

            dataserviceContractPO.getAddress(point.lat, point.lng, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    var html = "<b>Thông tin</b> <br/>" + rs.Object;
                    infowindow.setContent(html);
                    infowindow.open(map, marker, html);
                    document.getElementById("startPlace").value = rs.Object;
                    address = rs.Object;
                }
            })
            if (marker) {
                marker.setPosition(point);
            }
            else {
                marker = new google.maps.Marker({
                    position: point,
                    map: maps,
                });
            }
            maps.setZoom($rootScope.zoomMapDefault);
        })
    }
    function setHeightMap() {
        var maxHeightMap = $(window).height() - $("#map").position().top - 200;
        $("#map").css({
            'max-height': maxHeightMap,
            'height': maxHeightMap,
            'overflow': 'auto',
        });
        mapReSize();
    }
    function mapReSize() {
        setTimeout(function () {
            map.updateSize();
        }, 600);
    }
    setTimeout(function () {
        initData();
        setHeightMap();
        setModalDraggable('.modal-dialog');
    }, 200)
});

//Thanh toán
//tab payment

app.controller('contractTabPayment', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceContractPO, $filter) {
    var vm = $scope;
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $rootScope.Object.PoSupCode = $rootScope.PoSupCode;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        ContractCode: $rootScope.PoSupCode,
        FromTo: '',
        DateTo: '',
        PaymentName: '',
        PaymentType: '',
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/ContractPo/JTableContractTabPayment",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {

                d.ContractCode = $rootScope.PoSupCode;
                d.FromTo = $scope.model.FromTo;
                d.DateTo = $scope.model.DateTo;
                d.PaymentName = $scope.model.PaymentName;
                d.PaymentType = $scope.model.PaymentType;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataPaymentPO");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
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
            //const contextScope = $scope.$new(true);
            //contextScope.data = data;
            //contextScope.contextMenu = $scope.contextMenu;
            //$compile(angular.element(row).find('input'))($scope);
            //$compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        })
        .withOption('footerCallback', function (tfoot, data) {
            dataserviceContractPO.getTotalPayment($scope.model, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {

                    $scope.totalReceipts = Math.round(result.totalReceipts);
                    $scope.totalPaymentSlip = Math.round(result.totalExpense);
                    $scope.totalMoney = Math.round($scope.totalReceipts - $scope.totalPaymentSlip);
                }
            });
        });
    vm.dtColumns = [];

    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DeadLine').withTitle('{{"CP_TAB_PAYMENT_LIST_COL_DEAD_LINE" | translate}}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CatName').withTitle('{{"CP_TAB_PAYMENT_LIST_COL_CAT_NAME" | translate}}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"CP_TAB_PAYMENT_LIST_COL_TITLE" | translate}}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AetType').withTitle('{{"CP_TAB_PAYMENT_LIST_COL_AET_TYPE" | translate}}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
        if (data == "Receipt") {
            return "Thu";
        }
        else {
            return "Chi";
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Total').withTitle('{{"CP_TAB_PAYMENT_LIST_COL_TOTAL" | translate}}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
        return '<span class="text-danger">' + $filter('currency')(data, '', 0) + '</span>';
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Currency').withTitle('{{"FAE_LIST_COL_AET_TYPE" | translate}}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"CP_TAB_PAYMENT_LIST_COL_STATUS" | translate}}').withOption('sClass', 'dataTable-pr0 nowrap').renderWith(function (data, type) {
        switch (data) {
            case "CREATED":
                data = "Khởi tạo";
                return '<span class="text-success">' + data + '</span>';
                break;
            case "PENDING":
                data = "Chờ xử lý";
                return '<span class="text-warning"> ' + data + '</span>';
                break;
            case "APPROVED":
                data = "Đã duyệt";
                return '<span class="text-primary"> ' + data + '</span>';
                break;
            case "REFUSE":
                data = "Từ chối";
                return '<span class="text-danger"> ' + data + '</span>';
                break;
            case "CANCEL":
                data = "Hủy bỏ";
                return '<span class="text-danger"> ' + data + '</span>';
                break;
        }
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Payer').withTitle('{{"CP_TAB_PAYMENT_LIST_COL_PAYER" | translate}}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Receiptter').withTitle('{{"CP_TAB_PAYMENT_LIST_COL_RECEIPTTER" | translate}}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xóa" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};

    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
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
    function callback(json) {

    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.init = function () {
        $rootScope.PaymentType = [{
            Value: false,
            Name: "Phiếu chi"
        }, {
            Value: true,
            Name: "Phiếu thu"
        }];
    }
    $scope.init();
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceContractPO.deletePayment(id, function (rs) {
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
            $scope.reload();
        }, function () {
        });
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderContractPO + '/contractTabPaymentAdd.html',
            controller: 'contractTabPaymentAdd',
            backdrop: 'static',
            windowClass: "payment",
            size: '70'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.edit = function (id) {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderContractPO + '/contractTabPaymentEdit.html',
            controller: 'contractTabPaymentEdit',
            backdrop: 'static',
            windowClass: "payment",
            size: '70',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            reloadData();
        }, function () { });
    };
    setTimeout(function () {
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
    }, 200);
});

app.controller('contractTabPaymentAdd', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, dataserviceContractPO) {
    $scope.model = {
        AetCode: '',
        GoogleMap: '',
        AetCode: '',
        Title: '',
        AetType: 'Expense',
        AetDescription: '',
        Currency: '',
        ObjType: 'PO_SUPPLIER',
        ObjCode: $rootScope.Object.PoSupCode,
    };
    dataserviceContractPO.getCurrencyDefaultPayment(function (rs) {
        rs = rs.data;

        $scope.model.Currency = rs;
    });
    //$scope.AetCode = [];
    $scope.listFundFile = [];
    $scope.listFundFileRemove = [];
    $scope.openMap = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderContractPO + '/googleMap.html',
            controller: 'googleMap',
            backdrop: 'static',
            size: '80',
            resolve: {
                para: function () {
                    if ($scope.model.GoogleMap != '') {
                        return {
                            lt: parseFloat($scope.model.GoogleMap.split(',')[0]),
                            lg: parseFloat($scope.model.GoogleMap.split(',')[1]),
                            address: $scope.model.Address,
                        };
                    } else {
                        return '';
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            if (d != undefined) {
                $scope.model.GoogleMap = d.lat + ',' + d.lng;
                $scope.model.Address = d.address;
            }
        }, function () { });
    }
    $scope.model1 = {
        listMember: []
    }
    $scope.listAetType = [
        {
            Code: "Receipt",
            Name: "Thu"
        }, {
            Code: "Expense",
            Name: "Chi"
        }];
    $scope.listAetRelativeType = [
        {
            Code: "Vay",
            Name: "Vay"
        },
        {
            Code: "Trả",
            Name: "Trả"
        }];
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.AetType == "" || data.AetType == null) {
            $scope.errorAetType = true;
            mess.Status = true;
        } else {
            $scope.errorAetType = false;
        }
        if (data.Currency == "" || data.Currency == null) {
            $scope.errorCurrency = true;
            mess.Status = true;
        } else {
            $scope.errorCurrency = false;
        }
        if (data.CatCode == "" || data.CatCode == null) {
            $scope.errorCatCode = true;
            mess.Status = true;
        } else {
            $scope.errorCatCode = false;
        }
        if (data.Total == null || data.Total == undefined || data.Total <= 0) {
            $scope.errorTotal = true;
            mess.Status = true;
        } else {
            $scope.errorTotal = false;
        }

        return mess;
    }
    $scope.initData = function () {
        dataserviceContractPO.getGetAetRelative(function (rs) {
            rs = rs.data;
            $rootScope.AetRelative = rs;
        })
        dataserviceContractPO.getGetCatName(function (rs) {
            rs = rs.data;
            $rootScope.listCatName = rs;
        });
        dataserviceContractPO.getListTitle(function (rs) {
            rs = rs.data;
            $rootScope.listTitle = rs;
        })
        dataserviceContractPO.gettreedata({ IdI: null }, function (result) {
            result = result.data;
            //$scope.treeData = result.map(function (obj, index) { if (obj.Code == 'ADVANCE_CONTRACT' || obj.Code == 'PAY_CONTRACT') return obj; });
            $scope.treeData = result;
        });
        dataserviceContractPO.getObjDependency(function (rs) {
            rs = rs.data;
            $scope.listObjType = rs;
        });
        dataserviceContractPO.getObjCode("PO_SUPPLIER", function (rs) {
            rs = rs.data;
            $scope.listObjCode = rs;
        });
        dataserviceContractPO.getListCurrency(function (rs) {
            rs = rs.data;
            $scope.listCurrency = rs;
        });

    }
    $scope.initData();

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        dataserviceContractPO.getGenAETCode($scope.model.AetType, $scope.model.CatCode, function (rs) {
            rs = rs.data;
            $scope.model.ListFileAccEntry = $scope.listFundFile;
            $scope.model.ListFileAccEntryRemove = $scope.listFundFileRemove;
            $scope.model.AetCode = rs;
            validationSelect($scope.model);
            if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
                dataserviceContractPO.insertPayment($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                        $rootScope.reloadNoResetPage();
                    }
                });
            }
        })
    }
    function initAutocomplete() {
        var defaultBounds = new google.maps.LatLngBounds(new google.maps.LatLng(-33.8902, 151.1759), new google.maps.LatLng(-33.8474, 151.2631));
        var options = {
            bounds: defaultBounds,
            types: ['geocode']
        };
        var autocomplete = new google.maps.places.Autocomplete(document.getElementById('textAreaAddress'), options);
        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            var place = autocomplete.getPlace();
            lat = place.geometry.location.lat();
            lng = place.geometry.location.lng();
            $("#locationGPS").val(lat + ',' + lng);
            $scope.model.GoogleMap = lat + ',' + lng
            $scope.model.Address = document.getElementById('textAreaAddress').value;
            console.log(lat + ',' + lng);
        });
    }
    function validateDefault() {

        setEndDate("#DeadLine", new Date());
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        //initAutocomplete();

        //Yêu cầu từ ngày --> đến ngày
        $("#DeadLine").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function () {
            if ($('#DeadLine input').valid()) {
                $('#DeadLine input').removeClass('invalid').addClass('success');
            }
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#DeadLine').datepicker('setEndDate', null
                );
            }
        });
        //$('#DeadLine').datepicker('setEndDate', new Date());
    });
    $scope.changleSelect = function (SelectType, item) {
        if (SelectType == "CatCode" && $scope.model.CatCode != "") {
            $scope.errorCatCode = false;
        } else if (SelectType == "CatCode") {
            $scope.errorCatCode = true;
        }
        if (SelectType == "AetType" && $scope.model.AetType != "") {
            $scope.errorAetType = false;
        } else if (SelectType == "AetType") {
            $scope.errorAetType = true;
        }
        if (SelectType == "Total" && ($scope.model.Total == null || $scope.model.Total == undefined || $scope.model.Total <= 0)) {
            $scope.errorTotal = true;
        } else {
            $scope.errorTotal = false;
        }
    }
    //bảng file
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.changeAetRelative = function () {

        dataserviceContractPO.checkPlan($scope.model.AetRelative, function (rs) {
            rs = rs.data;
            $scope.isPlanRelative = rs;
            if ($scope.isPlanRelative) {
                $('#DeadLine').datepicker('setEndDate', new Date());
                $scope.model.DeadLine = "";
                $scope.model.AetType = rs.AetTye;

                $scope.model.Currency = rs.Currency;
            }
        });
        console.log($scope.isPlanRelative);


    }
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
    }
    $scope.search = function () {

        reloadData(true);
    }

    $scope.loadFilePayment = function (event) {

        var files = event.target.files;
        var checkExits = $scope.listFundFile.filter(k => k.FileName === files[0].name);
        if (checkExits.length == 0) {
            var formData = new FormData();
            formData.append("file", files[0] != undefined ? files[0] : null);
            dataserviceContractPO.uploadFile(formData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    $('#btn-upload-file').replaceWith($('#btn-upload-file').val('').clone(true));
                    App.toastrSuccess(rs.Title);
                    $scope.listFundFile.push(rs.Object);
                }
            });
        } else {
            App.toastrError(caption.COM_MSG_FILE_EXISTS);
        }
    }
    $scope.removeFileReq = function (index) {
        var itemRemove = $scope.listFundFile[index];

        if (itemRemove.Id != null) {
            $scope.listFundFileRemove.push(itemRemove);
        }
        $scope.listFundFile.splice(index, 1);
    }
});

app.controller('contractTabPaymentEdit', function ($scope, $rootScope, $uibModal, $uibModalInstance, dataserviceContractPO, para) {

    console.log(para);
    $scope.model = {
        ListFileAccEntry: [],
    }
    $scope.listFundFile = [];
    $scope.listFundFileRemove = [];

    $scope.listAetType = [
        {
            Code: "Receipt",
            Name: "Thu"
        },
        {
            Code: "Expense",
            Name: "Chi"
        }];
    $scope.listAetRelativeType = [
        {
            Code: "Vay",
            Name: "Vay"
        },
        {
            Code: "Trả",
            Name: "Trả"
        }];
    $scope.IsPermission = false;
    $scope.IsPermissionManager = false;
    $scope.changeAetRelative = function () {

        dataserviceContractPO.checkPlan($scope.model.AetRelative, function (rs) {
            rs = rs.data;
            $scope.isPlanRelative = rs;
            if ($scope.isPlanRelative) {
                $('#DeadLine').datepicker('setEndDate', new Date());
                $scope.model.DeadLine = "";
                $scope.model.AetType = rs.AetTye;

                $scope.model.Currency = rs.Currency;
            }
        });
        console.log($scope.isPlanRelative);


    }
    $scope.disableAetRelative = false;
    $scope.IsShow = true;
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "CatCode" && $scope.model.CatCode != "") {
            $scope.errorCatCode = false;
        } else if (SelectType == "CatCode") {
            $scope.errorCatCode = true;
        }
        if (SelectType == "AetType" && $scope.model.AetType != "") {
            $scope.errorAetType = false;
        } else if (SelectType == "AetType") {
            $scope.errorAetType = true;
        }
        if (SelectType == "Total" && ($scope.model.Total == null || $scope.model.Total == undefined || $scope.model.Total <= 0)) {
            $scope.errorTotal = true;
        } else {
            $scope.errorTotal = false;
        }
    }
    $scope.openMap = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderContractPO + '/googleMap.html',
            controller: 'googleMap',
            backdrop: 'static',
            size: '80',
            resolve: {
                para: function () {
                    if ($scope.model.GoogleMap != '') {
                        return {
                            lt: parseFloat($scope.model.GoogleMap.split(',')[0]),
                            lg: parseFloat($scope.model.GoogleMap.split(',')[1]),
                            address: $scope.model.Address,
                        };
                    } else {
                        return '';
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            if (d != undefined) {
                $scope.model.GoogleMap = d.lat + ',' + d.lng;
                $scope.model.Address = d.address;
            }
        }, function () { });
    }
    $scope.activity = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderContractPO + '/activityPayment.html',
            controller: 'activityPayment',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return $scope.model.AetCode;
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.AetType == "" || data.AetType == null) {
            $scope.errorAetType = true;
            mess.Status = true;
        } else {
            $scope.errorAetType = false;

        }
        if (data.Currency == "" || data.Currency == null) {
            $scope.errorCurrency = true;
            mess.Status = true;
        } else {
            $scope.errorCurrency = false;

        }
        if (data.CatCode == "" || data.CatCode == null) {
            $scope.errorCatCode = true;
            mess.Status = true;
        } else {
            $scope.errorCatCode = false;
        }
        if (data.Total == null || data.Total == undefined || data.Total <= 0) {
            $scope.errorTotal = true;
            mess.Status = true;
        } else {
            $scope.errorTotal = false;
        }

        return mess;
    }
    function validationManager(data) {

        var mess = { Status: false, Title: "" }
        if (data == "" || data == null) {
            $scope.errorAction = true;
            mess.Status = true;
        }
        else {
            $scope.errorAction = false;

        }
        return mess;
    }
    function callback(json) {

    }
    $scope.loadFilePayment = function (event) {
        var files = event.target.files;
        var checkExits = $scope.listFundFile.filter(k => k.FileName === files[0].name);
        if (checkExits.length == 0) {
            var formData = new FormData();
            formData.append("file", files[0] != undefined ? files[0] : null);
            dataserviceContractPO.uploadFile(formData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.listFundFile.push(rs.Object);
                    $('#btn-upload-file').replaceWith($('#btn-upload-file').val('').clone(true));
                }
            });
        } else {
            App.toastrError(caption.COM_MSG_FILE_EXISTS);
        }
    }
    $scope.removeFileReq = function (index) {
        if (!$scope.IsPermission) {
            var itemRemove = $scope.listFundFile[index];

            if (itemRemove.Id != null) {
                $scope.listFundFileRemove.push(itemRemove);
            }
            $scope.listFundFile.splice(index, 1);
        }
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.initData = function () {

        dataserviceContractPO.getItemPayment(para, function (rs) {
            rs = rs.data;

            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model = rs[0];
                $scope.IsPermission = rs[0].IsPermission;
                $scope.IsShow = rs[0].IsShow;
                if ($scope.IsPermission) {
                    $scope.IsPermission = false;

                    if ((rs[0].Status == "APPROVED" || rs[0].Status == "REFUSE")) {
                        $scope.IsPermissionManager = true;

                    };
                    if ($scope.model.IsPlan == false && (rs[0].Status == "APPROVED" || rs[0].Status == "REFUSE")) {
                        $scope.IsPermission = true;
                    }
                    if ($scope.model.IsPlan == true && (rs[0].Status == "APPROVED" || rs[0].Status == "REFUSE")) {
                        $scope.IsPermission = false;
                    }
                } else {
                    if (rs[0].Action != null) {
                        $scope.IsPermissionManager = true;
                        $scope.IsPermission = true;
                    } else {
                        $scope.IsPermission = true;
                    }
                }
                if ($scope.IsPermission == true && rs[0].IsPlan == true) {
                    $scope.disableAetRelative = true;
                }

                dataserviceContractPO.getListFundFiles($scope.model.AetCode, function (rs) {
                    rs = rs.data;
                    $scope.listFundFile = rs;
                });
                dataserviceContractPO.getAetRelativeChil($scope.model.AetCode, function (rs) {
                    rs = rs.data;
                    var list = [];
                    for (var i = 0; i < rs.length; i++) {
                        list.push(rs[i].Total.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
                    }
                    $scope.totalChild = list.join(" - ");

                });

                if ($scope.model.ObjType != "") {
                    dataserviceContractPO.getObjCode($scope.model.ObjType, function (rs) {
                        rs = rs.data;
                        $scope.listObjCode = rs;
                    });
                }
            }
        });
        //dataserviceContractPO.getGetCurrency(function (rs) {rs=rs.data;
        //    $rootScope.listCurrency = rs;
        //});
        dataserviceContractPO.getGetCatName(function (rs) {
            rs = rs.data;
            $rootScope.listCatName = rs;
        });
        //dataserviceContractPO.getGetAetRelative(function (rs) {rs=rs.data;
        //    $rootScope.AetRelative = rs;
        //});
        dataserviceContractPO.getListTitle(function (rs) {
            rs = rs.data;
            $rootScope.listTitle = rs;
        });
        dataserviceContractPO.gettreedata({ IdI: null }, function (result) {
            result = result.data;
            //$scope.treeData = result.map(function (obj, index) { if (obj.Code == 'ADVANCE_CONTRACT' || obj.Code == 'PAY_CONTRACT') return obj; });
            $scope.treeData = result;
        });
        dataserviceContractPO.getObjDependency(function (rs) {
            rs = rs.data;
            $scope.listObjType = rs;
        });
        dataserviceContractPO.getListCurrency(function (rs) {
            rs = rs.data;
            $scope.listCurrency = rs;
        });

    }
    $scope.isTotal = false;
    $scope.openLog = function () {
        dataserviceContractPO.getUpdateLogPayment($scope.model.AetCode, function (rs) {
            rs = rs.data;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderContractPO + '/showLog.html',
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
    $scope.initData();
    $scope.updateAccTracking = function () {
        if (validationManager($scope.model.Action).Status == false) {

            dataserviceContractPO.insertAccEntryTracking($scope.model.AetCode, $scope.model.Action, $scope.model.Note, $scope.model.AetRelative, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            });
        }
    }
    function initAutocomplete() {
        var defaultBounds = new google.maps.LatLngBounds(new google.maps.LatLng(-33.8902, 151.1759), new google.maps.LatLng(-33.8474, 151.2631));
        var options = {
            bounds: defaultBounds,
            types: ['geocode']
        };
        var autocomplete = new google.maps.places.Autocomplete(document.getElementById('textAreaAddress'), options);
        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            var place = autocomplete.getPlace();
            lat = place.geometry.location.lat();
            lng = place.geometry.location.lng();
            $("#locationGPS").val(lat + ',' + lng);
            $scope.model.GoogleMap = lat + ',' + lng
            $scope.model.Address = document.getElementById('textAreaAddress').value;
            console.log(lat + ',' + lng);
        });
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
            $scope.model.ListFileAccEntry = $scope.listFundFile;
            $scope.model.ListFileAccEntryRemove = $scope.listFundFileRemove;
            dataserviceContractPO.updatePayment($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                    $rootScope.reloadNoResetPage();
                }
            });

        }
    }
    $scope.changleSelect = function (SelectType, item) {
        if (SelectType == "CatCode" && $scope.model.CatCode != "") {
            $scope.errorCatCode = false;
        } else if (SelectType == "CatCode") {
            $scope.errorCatCode = true;
        }
        if (SelectType == "AetType" && $scope.model.AetType != "") {
            $scope.errorAetType = false;
        } else if (SelectType == "AetType") {
            $scope.errorAetType = true;
        }

        if (SelectType == "ObjType" && $scope.model.ObjType != "") {
            dataserviceContractPO.getObjCode(item.Code, function (rs) {
                rs = rs.data;
                $scope.listObjCode = rs;
            });
        }
    }
    $scope.deleteObjType = function () {
        $scope.model.ObjType = null;
        $scope.model.ObjCode = null;
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        //initAutocomplete();
        //Yêu cầu từ ngày --> đến ngày
        $("#DeadLine").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function () {
            if ($('#DeadLine input').valid()) {
                $('#DeadLine input').removeClass('invalid').addClass('success');
            }
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#DeadLine').datepicker('setEndDate', null);
            }
        });
        //$('#DeadLine').datepicker('setEndDate', new Date());
    });

});

app.controller('googleMap', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceContractPO, $filter, para) {
    var lat = '';
    var lng = '';
    var address = '';
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.submit = function () {
        var obj = {
            lat: lat,
            lng: lng,
            address: address,
        }
        $uibModalInstance.close(obj);
    }
    $scope.initMap = function () {
        fields_vector_source = new ol.source.Vector({});
        var center = ol.proj.transform([$rootScope.lngDefault, $rootScope.latDefault], 'EPSG:4326', 'EPSG:3857');
        map = new ol.Map({
            target: $('#map')[0],

            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM({
                        url: 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'


                    })
                }),
                new ol.layer.Vector({
                    source: fields_vector_source
                })
            ],

            view: new ol.View({
                center: center,
                zoom: 15

            }),

            controls: ol.control.defaults({
                attribution: false,
                zoom: false,
            })
        });
        var pathGG = $('#pathGG').html();
        var id = $("#ID").html();
        var aaa = parseInt(id);
        if (pathGG != "" && pathGG != null) {
            pathSourceVector = new ol.source.Vector({
                features: []
            });
            pathLayerMarker = new ol.layer.Vector({
                source: pathSourceVector
            });
            var path = polyline.decode(pathGG);

            pathLayerMarker = renderLinePathLayer(path);
            map.addLayer(pathLayerMarker);

            var styles3 = [

                new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: '#64c936',
                        width: 3
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(100, 201, 54,1)'
                    })
                }),
            ];

            var iconStyleStart = new ol.style.Style({
                image: new ol.style.Icon(({
                    anchor: [0.5, 26],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    src: 'https://i.imgur.com/pjZYQLJ.png'
                })),
                zIndex: 11
            });
            var iconStyleEnd = new ol.style.Style({
                image: new ol.style.Icon(({
                    anchor: [0.5, 26],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    src: 'https://i.imgur.com/3g07NhB.png'
                })),
                zIndex: 11
            });

            var pathLenght = path.length - 1;
            var iconFeatureStart = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.transform([parseFloat(path[0][1]), parseFloat(path[0][0])], 'EPSG:4326', 'EPSG:3857')),
                type: "valve"
            });

            iconFeatureStart.setId(1);
            iconFeatureStart.setStyle(iconStyleStart);
            var iconFeatureEnd = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.transform([parseFloat(path[pathLenght][1]), parseFloat(path[pathLenght][0])], 'EPSG:4326', 'EPSG:3857')),
                type: "valve"
            });
            iconFeatureEnd.setId(2);
            iconFeatureEnd.setStyle(iconStyleEnd);
            var vectorIcon = new ol.source.Vector({});
            vectorIcon.addFeature(iconFeatureStart);
            vectorIcon.addFeature(iconFeatureEnd);

            var vectorLayer = new ol.layer.Vector({
                source: vectorIcon,
                style: styles3
            });

            map.addLayer(vectorLayer);


            //pathSource = new ol.source.Vector({});


            pathSource.addFeature(renderLineStringFeature(path))
            var field_location = pathSource.getFeatureById(aaa).getProperties();
            var field_extent = field_location.geometry.getExtent();
            map.getView().fit(field_extent, map.getSize());
            map.getView().setZoom(12);
        }
    }
    $scope.initMap();
    function initData() {
        //init
        if (para) {
            lat = para.lt != '' ? para.lt : $rootScope.latDefault;
            lng = para.lg != '' ? para.lg : $rootScope.lngDefault;
            address = para.lg != '' ? para.address : $rootScope.addressDefault;
            document.getElementById("startPlace").value = address;
        } else {
            lat = $rootScope.latDefault;
            lng = $rootScope.lngDefault;
            address = $rootScope.addressDefault;
            document.getElementById("startPlace").value = $rootScope.addressDefault;
        }

        var centerPoint = { lat: lat, lng: lng };
        var infowindow = new google.maps.InfoWindow({
            content: '<b>Thông tin</b> <br/>' + address,
        });
        var maps = new google.maps.Map(
            document.getElementById('map'), { zoom: $rootScope.zoomMapDefault, center: centerPoint });
        maps.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('startPlace'));
        var marker = new google.maps.Marker({
            zoom: 12,
            position: centerPoint,
            map: maps,
        });
        var defaultBounds = new google.maps.LatLngBounds(new google.maps.LatLng(-33.8902, 151.1759), new google.maps.LatLng(-33.8474, 151.2631));
        var options = {
            bounds: defaultBounds,
            types: ['geocode']
        };




        //Autocomplete
        var input = document.getElementById('startPlace');
        var autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.bindTo('bounds', map);
        var service = new google.maps.places.PlacesService(maps);



        //Map change
        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            infowindow.close();
            marker.setVisible(false);
            var place = autocomplete.getPlace();
            if (!place.geometry) {
                window.alert("Autocomplete's returned place contains no geometry");
                return;
            }

            // If the place has a geometry, then present it on a map.
            if (place.geometry.viewport) {
                maps.fitBounds(place.geometry.viewport);
            } else {
                maps.setCenter(place.geometry.location);
                maps.setZoom(17);
            }
            marker.setIcon(({
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(35, 35)
            }));
            marker.setPosition(place.geometry.location);
            marker.setVisible(true);
            var html = "<b>" + place.name + "</b> <br/>" + place.formatted_address;
            infowindow.setContent(html);
            infowindow.open(maps, marker);
            address = place.formatted_address;
            $scope.$apply();
        });



        //Map click
        infowindow.open(map, marker);
        maps.addListener('click', function (event) {
            var point = { lat: event.latLng.lat(), lng: event.latLng.lng() }
            lat = point.lat;
            lng = point.lng;

            dataserviceContractPO.getAddress(point.lat, point.lng, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    var html = "<b>Thông tin</b> <br/>" + rs.Object;
                    infowindow.setContent(html);
                    infowindow.open(map, marker, html);
                    document.getElementById("startPlace").value = rs.Object;
                    address = rs.Object;
                }
            })
            if (marker) {
                marker.setPosition(point);
            }
            else {
                marker = new google.maps.Marker({
                    position: point,
                    map: maps,
                });
            }
            maps.setZoom($rootScope.zoomMapDefault);
        })
    }
    function setHeightMap() {
        var maxHeightMap = $(window).height() - $("#map").position().top - 200;
        $("#map").css({
            'max-height': maxHeightMap,
            'height': maxHeightMap,
            'overflow': 'auto',
        });
        mapReSize();
    }
    function mapReSize() {
        setTimeout(function () {
            map.updateSize();
        }, 600);
    }
    setTimeout(function () {
        initData();
        setHeightMap();
        setModalDraggable('.modal-dialog');
    }, 200)
});

app.controller('activityPayment', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataserviceContractPO, $timeout, para) {
    $scope.listAccEntryTracking = [];
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.initLoad = function () {
        dataserviceContractPO.getGetAccTrackingDetail(para, function (rs) {
            rs = rs.data;
            for (var i = 0; i < rs.Object.length; i++) {
                rs.Object[i].Action = $rootScope.listStatus.filter(x => x.Code == rs.Object[i].Action)[0].Name;
            }
            $scope.listAccEntryTracking = rs.Object;
        });
    }

    $scope.initLoad();
});

app.controller('contractTabRequestImportProduct', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceContractPO, $filter) {
    $scope.model = {
        Id: 0,
        ObjCode: '',
        ObjRelative: '',
        ObjNote: ''
    }
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/contractPo/JtableRequestImportProduct",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.PoSupCode = $rootScope.PoSupCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataRQImportProduct");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                    $scope.selected[data.Id] = !$scope.selected[data.Id];
                    $scope.model.Id = 0;
                    $scope.resetSelect();
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.Id] = false;
                        $scope.model.Id = 0;
                        $scope.resetSelect();
                    } else {
                        $('#tblDataRQImportProduct').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.Id] = true;
                        $scope.getItem(data);
                    }
                }

                vm.selectAll = false;
                $scope.$apply();
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().withOption('sClass', 'hidden').renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ObjCode').withTitle('{{"CP_LIST_COL_RQ_CODE" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"CP_LIST_COL_PO_TITLE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CusName').withTitle('{{"CP_LIST_COL_CUS_BUILDING" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{"CP_LIST_COL_SENDER" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"CP_LIST_COL_CREATE_TIME" | translate}}').renderWith(function (data, type) {
        return data != null ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Action').withTitle('{{ "CP_LIST_COL_ACTION" | translate }}').renderWith(function (data, type, full) {
        return '<button title="Xóa" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $scope.init = function () {
        dataserviceContractPO.getRqImpProduct(function (rs) {
            rs = rs.data;
            $scope.listRqImpProduct = rs;
        })
        dataserviceContractPO.getObjectRelative(function (rs) {
            rs = rs.data;
            $scope.listRelative = rs;
        })
    }
    $scope.init();
    $scope.changleSelect = function (selectType) {
        if (selectType == "ObjCode" && $scope.model.ObjCode != "") {
            $scope.errorObjCode = false;
        }
        if (selectType == "ObjRelative" && $scope.model.ObjRelative != "") {
            $scope.errorObjRelative = false;
        }
    }
    $scope.add = function () {
        if (validationSelect($scope.model).Status == false) {
            $scope.model.ObjRootCode = $rootScope.PoSupCode;
            dataserviceContractPO.insertRequestImportProduct($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                }
            })
        }
    }
    $scope.getItem = function (item) {
        $scope.model.Id = item.Id;
        $scope.model.ObjCode = item.ObjCode;
        $scope.model.ObjRelative = item.ObjRelative;
        $scope.model.ObjNote = item.ObjNote;
    }
    $scope.update = function () {
        if (validationSelect($scope.model).Status == false) {
            $scope.model.ObjRootCode = $rootScope.PoSupCode;
            dataserviceContractPO.updateRequestImportProduct($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                    $scope.resetSelect();
                }
            })
        }
    }
    $scope.delete = function (id) {
        dataserviceContractPO.deleteRequestImportProduct(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                reloadData(true);
                $scope.resetSelect();
            }
        })
    }
    $scope.resetSelect = function () {
        $scope.model.Id = 0;
        $scope.model.ObjCode = '';
        $scope.model.ObjRelative = '';
        $scope.model.ObjNote = '';
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.ObjCode == "") {
            $scope.errorObjCode = true;
            mess.Status = true;
        } else {
            $scope.errorObjCode = false;
        }
        if (data.ObjRelative == "") {
            $scope.errorObjRelative = true;
            mess.Status = true;
        } else {
            $scope.errorObjRelative = false;
        }
        return mess;
    }
});

app.controller('contractTabProject', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceContractPO, $filter) {
    $scope.model = {
        Id: 0,
        ObjCode: '',
        ObjRelative: '',
        ObjNote: ''
    }
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/contractPo/JtableContractProject",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.PoSupCode = $rootScope.PoSupCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataPoSale")
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                    $scope.selected[data.Id] = !$scope.selected[data.Id];
                    $scope.model.Id = 0;
                    $scope.resetSelect();
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.Id] = false;
                        $scope.model.Id = 0;
                        $scope.resetSelect();
                    } else {
                        $('#tblDataProject').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.Id] = true;
                        $scope.getItem(data);
                    }
                }

                vm.selectAll = false;
                $scope.$apply();
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().withOption('sClass', 'hidden').renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ObjCode').withTitle('{{"CP_LIST_COL_PROJECT_CODE" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProjectTitle').withTitle('{{"CP_LIST_COL_PRO_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Budget').withTitle('{{"CP_LIST_COL_MONEY" | translate}}').renderWith(function (data, type) {
        var budget = data != "" ? $filter('currency')(data, '', 0) : null;
        return '<span class= "text-danger bold">' + budget + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Currency').withTitle('{{"CP_LIST_COL_UNIT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StartTime').withTitle('{{"CP_LIST_COL_START_DATE" | translate}}').renderWith(function (data, type) {
        return data != null ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EndTime').withTitle('{{"CP_LIST_COL_END_DATE" | translate}}').renderWith(function (data, type) {
        return data != null ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Action').withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').renderWith(function (data, type, full) {
        return '<button title="Xóa" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $scope.init = function () {
        dataserviceContractPO.getProjects(function (rs) {
            rs = rs.data;
            $scope.listProject = rs;
        })
        dataserviceContractPO.getObjectRelative(function (rs) {
            rs = rs.data;
            $scope.listRelative = rs;
        })
    }
    $scope.init();
    $scope.changleSelect = function (selectType) {
        if (selectType == "ObjCode" && $scope.model.ObjCode != "") {
            $scope.errorObjCode = false;
        }
        if (selectType == "ObjRelative" && $scope.model.ObjRelative != "") {
            $scope.errorObjRelative = false;
        }
    }
    $scope.add = function () {
        if (validationSelect($scope.model).Status == false) {
            $scope.model.ObjRootCode = $rootScope.PoSupCode;
            dataserviceContractPO.insertContractProject($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                }
            })
        }
    }
    $scope.getItem = function (item) {
        $scope.model.Id = item.Id;
        $scope.model.ObjCode = item.ObjCode;
        $scope.model.ObjRelative = item.ObjRelative;
        $scope.model.ObjNote = item.ObjNote;
    }
    $scope.update = function () {
        if (validationSelect($scope.model).Status == false) {
            $scope.model.ObjRootCode = $rootScope.PoSupCode;
            dataserviceContractPO.updateContractProject($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                    $scope.resetSelect();
                }
            })
        }
    }
    $scope.delete = function (id) {
        dataserviceContractPO.deleteContractProject(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                reloadData(true);
                $scope.resetSelect();
            }
        })
    }
    $scope.resetSelect = function () {
        $scope.model.Id = 0;
        $scope.model.ObjCode = '';
        $scope.model.ObjRelative = '';
        $scope.model.ObjNote = '';
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.ObjCode == "") {
            $scope.errorObjCode = true;
            mess.Status = true;
        } else {
            $scope.errorObjCode = false;
        }
        if (data.ObjRelative == "") {
            $scope.errorObjRelative = true;
            mess.Status = true;
        } else {
            $scope.errorObjRelative = false;
        }
        return mess;
    }
});

app.controller('contractTabContractSale', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceContractPO, $filter) {
    $scope.model = {
        Id: 0,
        ObjCode: '',
        ObjRelative: '',
        ObjNote: ''
    }
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/contractPo/JtableContractSale",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.PoSupCode = $rootScope.PoSupCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataContractSale");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                    $scope.selected[data.Id] = !$scope.selected[data.Id];
                    $scope.model.Id = 0;
                    $scope.resetSelect();
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.Id] = false;
                        $scope.model.Id = 0;
                        $scope.resetSelect();
                    } else {
                        $('#tblDataContractSale').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.Id] = true;
                        $scope.getItem(data);
                    }
                }

                vm.selectAll = false;
                $scope.$apply();
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().withOption('sClass', 'hidden').renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CusName').withTitle('{{"CP_LIST_COL_CUS_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ContractNo').withTitle('{{"CP_LIST_COL_NUM_CONTRACT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EndDate').withTitle('{{"CP_LIST_COL_DEADLINE_CONTRACT" | translate}}').renderWith(function (data, type) {
        var deadLine = '';
        if (data == '') {
            deadLine = '<span class="badge-customer badge-customer-success fs9 ml5">Không đặt thời hạn</span>'
        } else {
            var created = new Date(data);
            var diffMs = (created - new Date());
            var diffDay = Math.floor((diffMs / 86400000));
            if ((diffDay + 1) < 0) {
                deadLine = '<span class="badge-customer badge-customer-danger fs9 ml5 bold">Đã quá hạn</span>';
            } else if ((diffDay + 1) < 8) {
                deadLine = '<span class="badge-customer badge-customer-warning">Còn ' + (diffDay + 1) + ' ngày</span>'
            } else if ((diffDay + 1) < 16) {
                deadLine = '<span class="badge-customer badge-customer-success">Còn ' + (diffDay + 1) + ' ngày</span>'
            } else {
                deadLine = '<span class="badge-customer badge-customer-success fs9">Còn ' + (diffDay + 1) + ' ngày</span>'
            }
        }
        return '<div class="pt5">' + deadLine +
            '</div> ';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"CP_LIST_COL_CONTENT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BudgetExcludeTax').withTitle('{{"CP_LIST_COL_VALUE" | translate}}').renderWith(function (data, type) {
        var exTax = data != "" ? $filter('currency')(data, '', 0) : null;
        return '<span class= "text-danger bold">' + exTax + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BudgetExcludeTax').withTitle('{{"CP_LIST_COL_TRANSFER" | translate}}').renderWith(function (data, type, full) {
        if (data != "" && full.ExchangeRate != "") {
            var rs = data * full.ExchangeRate;
            var tax = data != "" && full.ExchangeRate != "" ? $filter('currency')(rs, '', 0) : null;
            return '<span class= "text-danger bold">' + tax + '</span>';
        }
        else {
            return null;
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Action').withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').renderWith(function (data, type, full) {
        return '<button title="Xóa" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $scope.init = function () {
        dataserviceContractPO.getContractSale(function (rs) {
            rs = rs.data;
            $scope.listContractSale = rs;
        })
        dataserviceContractPO.getObjectRelative(function (rs) {
            rs = rs.data;
            $scope.listRelative = rs;
        })
    }
    $scope.init();
    $scope.changleSelect = function (selectType) {
        if (selectType == "ObjCode" && $scope.model.ObjCode != "") {
            $scope.errorObjCode = false;
        }
        if (selectType == "ObjRelative" && $scope.model.ObjRelative != "") {
            $scope.errorObjRelative = false;
        }
    }
    $scope.add = function () {
        if (validationSelect($scope.model).Status == false) {
            $scope.model.ObjRootCode = $rootScope.PoSupCode;
            dataserviceContractPO.insertContractSale($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                }
            })
        }
    }
    $scope.getItem = function (item) {
        $scope.model.Id = item.Id;
        $scope.model.ObjCode = item.ObjCode;
        $scope.model.ObjRelative = item.ObjRelative;
        $scope.model.ObjNote = item.ObjNote;
    }
    $scope.update = function () {
        if (validationSelect($scope.model).Status == false) {
            $scope.model.ObjRootCode = $rootScope.PoSupCode;
            dataserviceContractPO.updateContractSale($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                    $scope.resetSelect();
                }
            })
        }
    }
    $scope.delete = function (id) {
        dataserviceContractPO.deleteContractSale(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                reloadData(true);
                $scope.resetSelect();
            }
        })
    }
    $scope.resetSelect = function () {
        $scope.model.Id = 0;
        $scope.model.ObjCode = '';
        $scope.model.ObjRelative = '';
        $scope.model.ObjNote = '';
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.ObjCode == "") {
            $scope.errorObjCode = true;
            mess.Status = true;
        } else {
            $scope.errorObjCode = false;
        }
        if (data.ObjRelative == "") {
            $scope.errorObjRelative = true;
            mess.Status = true;
        } else {
            $scope.errorObjRelative = false;
        }
        return mess;
    }
});

app.controller('file', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceContractPO, $filter, dataserviceSupplier) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        FromDate: '',
        ToDate: '',
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/ContractPo/JTableFile",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.PoCode = $rootScope.PoSupCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataContractPOFile");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileName').withTitle('{{ "CP_LIST_COL_PO_TITLE" | translate }}').renderWith(function (data, type, full) {
        var excel = ['.XLSM', '.XLSX', '.XLS'];
        var document = ['.TXT'];
        var word = ['.DOCX', '.DOC'];
        var pdf = ['.PDF'];
        var powerPoint = ['.PPS', '.PPTX', '.PPT'];
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        var icon = "";
        if (excel.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(106,170,89);font-size: 15px;" class="fa fa-file-excel-o" aria-hidden="true"></i>&nbsp;';
        } else if (word.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(13,118,206);font-size: 15px;" class="fa fa-file-word-o" aria-hidden="true"></i>&nbsp;';
        } else if (document.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(0,0,0);font-size: 15px;" class="fa fa-file-text-o" aria-hidden="true"></i>&nbsp;';
        } else if (pdf.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-pdf-o" aria-hidden="true"></i>&nbsp;';
        } else if (powerPoint.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-powerpoint-o" aria-hidden="true"></i>&nbsp;';
        } else if (image.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(42,42,42);font-size: 15px;" class="fa fa-picture-o" aria-hidden="true"></i>&nbsp;';
        } else {
            icon = '<i style="color: rgb(42,42,42);font-size: 15px;" class="fas fa-align-justify" aria-hidden="true"></i>&nbsp;';
        }
        return icon + data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ReposName').withTitle('{{"CP_LIST_COL_FORDER" | translate}}').renderWith(function (data, type, full) {
        return '<i class="fa fa-folder-open icon-state-warning"></i>&nbsp' + data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileID').withOption('sClass', 'nowrap dataTable-w80 text-center').notSortable().withTitle("{{'CP_LIST_COL_VIEW_CONTENT' | translate}}").renderWith(function (data, type, full) {
        var excel = ['.XLSM', '.XLSX', '.XLS'];
        var document = ['.TXT'];
        var word = ['.DOCX', '.DOC'];
        var pdf = ['.PDF'];
        var powerPoint = ['.PPS', '.PPTX', '.PPT'];
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];

        var mode = 2;
        if (full.ListUserShare != "" && full.ListUserShare != null && full.ListUserShare != undefined) {
            var lstShare = JSON.parse(full.ListUserShare);
            if (lstShare.length > 0) {
                for (var i = 0; i < lstShare.length; i++) {
                    if (lstShare[i].Code == userName) {
                        if (!lstShare[i].Permission.Write) {
                            mode = 0;
                            break;
                        }
                    }
                }
            }
        }

        if (excel.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'excel';
            return '<a ng-click="viewExcel(' + full.Id + ', ' + mode + '' + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else if (word.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'Syncfusion';
            return '<a ng-click="viewWord(' + full.Id + ', ' + mode + '' + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else if (pdf.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'pdf';
            return '<a ng-click="viewPDF(' + full.Id + ', ' + mode + '' + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else if (document.indexOf(full.FileTypePhysic.toUpperCase()) !== -1 || image.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            return '<a ng-click="tabFileHistory(0)"  title="{{&quot; Lịch sử sửa tệp &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-history pt5"></i></a>' +
                '<a ng-click="view(' + full.Id + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else {
            return '<a ng-click="getObjectFile(0)" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('').withTitle('{{ "CP_CURD_TAB_ATTRIBUTE_LIST_COL_NOTE" | translate }}').notSortable().renderWith(function (data, type, full) {
        return '<button title="Mô tả" ng-click="extension(' + full.FileID + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-info-circle"></i></button>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{ "CP_LIST_COL_CREATED_TIME" | translate }}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeFile').withTitle('{{"CP_LIST_COL_TYPE_FILE" | translate}}').renderWith(function (data, type, full) {
        if (data == "SHARE") {
            return "<label class='text-primary'>Tệp được chia sẻ</label>";
        } else {
            return "Tệp gốc";
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').withOption('sClass', 'w75 nowrap').renderWith(function (data, type, full) {
        if (full.TypeFile == "SHARE") {
            return '<a ng-click="dowload(\'' + full.FileCode + '\')" target="_blank" style="width: 25px; height: 25px; padding: 0px" title="Tải xuống - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline green " download><i class="fa fa-download pt5"></i></a>';
        } else {
            return '<a ng-click="share(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" title="Chia sẻ - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline blue "><i class="fa fa-share-alt pt5"></i></a>' +
                '<a ng-click="dowload(\'' + full.FileCode + '\')" style="width: 25px; height: 25px; padding: 0px" title="Tải xuống - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline green"><i class="fa fa-download pt5"></i></a>' +
                '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
        }
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
    }

    $scope.reload = function () {
        reloadData(true);
    }

    $rootScope.reloadFile = function () {
        $scope.reload();
    }

    $scope.search = function () {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderSupplier + '/fileSearch.html',
            windowClass: 'modal-file',
            backdrop: 'static',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            size: '30',
        });
        modalInstance.result.then(function (d) {
            reloadData()
        }, function () { });
    }

    $scope.add = function () {
        if ($scope.file == '' || $scope.file == undefined) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        } else {
            var data = new FormData();
            data.append("FileUpload", $scope.file);
            data.append("PoCode", $rootScope.PoSupCode);
            data.append("IsMore", false);
            dataserviceContractPO.insertPOFile(data, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    defaultShareFile(result.Object);
                    $scope.reload();
                }
            });
        }
    }

    $scope.edit = function (fileName, id) {
        dataserviceContractPO.getPOFile(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                rs.Object.FileName = fileName;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderContractPO + '/fileEdit.html',
                    controller: 'fileEdit',
                    windowClass: "modal-file",
                    backdrop: 'static',
                    size: '60',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    reloadData()
                }, function () { });
            }
        })
    }

    $scope.delete = function (id) {
        var userModel = {};
        var listdata = $('#tblDataContractPOFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        if (userModel.ListUserShare != "" && userModel.ListUserShare != null && userModel.ListUserShare != undefined) {
            var lstShare = JSON.parse(userModel.ListUserShare);
            var isDelete = true;
            if (lstShare.length > 0) {
                for (var i = 0; i < lstShare.length; i++) {
                    if (lstShare[i].Code == userName) {
                        if (!lstShare[i].Permission.Delete) {
                            isDelete = false;
                            break;
                        }
                    }
                }
                if (!isDelete) {
                    return App.toastrError("Bạn không có quyền xóa tệp tin");
                }
            }
        }

        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceContractPO.deletePOFile(id, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
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
            $scope.reload();
        }, function () {
        });
    }

    $scope.share = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderFileShare + '/fileShare.html',
            controller: 'fileShare',
            windowClass: 'modal-center',
            backdrop: 'static',
            size: '60',
        });
        modalInstance.result.then(function (d) {
            reloadData()
        }, function () { });
    }

    $scope.viewFile = function (id) {
        //dataserviceContractPO.getByteFile(id, function (rs) {rs=rs.data;
        //    
        //    var blob = new Blob([rs.Object], { type: "application/msword;charset=utf-8" });
        //    var blobUrl = URL.createObjectURL(blob);
        //    var url = window.encodeURIComponent(blobUrl);
        //    window.open('https://docs.google.com/gview?url=' + "https://facco.s-work.vn" + '' + url + '&embedded=true', '_blank');
        //})
        //var userModel = {};
        //var listdata = $('#tblDataFile').DataTable().data();
        //for (var i = 0; i < listdata.length; i++) {
        //    if (listdata[i].Id == id) {
        //        userModel = listdata[i];
        //        break;
        //    }
        //}
        //
        //var dt = userModel.Url;
        //dt = dt.replace("\/", "\\");
        //var url1 = "upload\\repository" + dt;
        //url1 = "\\uploads\\repository\\3.THÔNG TIN CHUNG\\mail vib.docx";
        //var url = window.encodeURIComponent(url1);
        //window.open('https://docs.google.com/gview?url=' + "https://facco.s-work.vn" + '' + url + '&embedded=true', '_blank');
    }

    $scope.viewImage = function (id) {
        //var userModel = {};
        //var listdata = $('#tblDataFile').DataTable().data();
        //for (var i = 0; i < listdata.length; i++) {
        //    if (listdata[i].Id == id) {
        //        userModel = listdata[i];
        //        break;
        //    }
        //}
        //toDataUrl(window.location.origin + userModel.Url, function (myBase64) {
        //    var modalInstance = $uibModal.open({
        //        templateUrl: '/views/admin/edmsRepository/imageViewer.html',
        //        controller: 'contractTabFileImageViewer',
        //        backdrop: 'static',
        //        size: '40',
        //        resolve: {
        //            para: function () {
        //                return myBase64;
        //            }
        //        }
        //    });
        //    modalInstance.result.then(function (d) {
        //    }, function () {
        //    });
        //});
    }

    $scope.dowload = function (fileCode) {
        var userModel = {};
        var listdata = $('#tblDataContractPOFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        if (userModel.ListUserShare != "" && userModel.ListUserShare != null && userModel.ListUserShare != undefined) {
            var lstShare = JSON.parse(userModel.ListUserShare);
            var isDownload = true;
            if (lstShare.length > 0) {
                for (var i = 0; i < lstShare.length; i++) {
                    if (lstShare[i].Code == userName) {
                        if (!lstShare[i].Permission.Write && !lstShare[i].Permission.Read) {
                            isDownload = false;
                            break;
                        }
                    }
                }
                if (!isDownload) {
                    return App.toastrError("Bạn không có quyền tải tệp tin");
                }
            }
        }
        location.href = "/Admin/EDMSRepository/DownloadFile?fileCode="
            + fileCode;
    }

    $scope.extend = function () {
        //dataserviceContractPO.getSuggestionsPOFile($rootScope.PoSupCode, function (rs) {
        //    rs = rs.data;
        //    var data = rs !== '' ? rs : { CatCode: '', ObjectCode: $rootScope.PoSupCode, ObjectType: 'PO_SUPPLIER' };
        //    var modalInstance = $uibModal.open({
        //        templateUrl: ctxfolderRepository + '/addFile.html',
        //        controller: 'addFile',
        //        windowClass: 'modal-file',
        //        backdrop: 'static',
        //        size: '60',
        //        resolve: {
        //            para: function () {
        //                return data;
        //            }
        //        }
        //    });
        //    modalInstance.result.then(function (d) {
        //        reloadData();
        //    }, function () { });
        //});
        dataserviceSupplier.getDefaultRepo($rootScope.PoSupCode, 'PO_SUPPLIER', function (rs) {
            rs = rs.data;
            var data = rs !== null ? rs : { CatCode: '', ObjectCode: $rootScope.PoSupCode, ObjectType: 'PO_SUPPLIER' };
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderSupplier + '/addFile.html',
                controller: 'setupRepoDefault',
                windowClass: 'modal-file',
                backdrop: 'static',
                size: '60',
                resolve: {
                    para: function () {
                        return data;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                reloadData();
            }, function () { });
        })
    };

    $scope.loadFile = function (event) {
        $scope.file = event.target.files[0];
    }

    $scope.getObjectFile = function (id) {
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            dataserviceContractPO.getItemFile(id, true, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                    return null;
                }
            });
        }
    };

    $scope.viewExcel = function (id, mode) {
        var userModel = {};
        var listdata = $('#tblDataContractPOFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }

        if (userModel.ListUserShare != "" && userModel.ListUserShare != null && userModel.ListUserShare != undefined) {
            var lstShare = JSON.parse(userModel.ListUserShare);
            var isView = true;
            if (lstShare.length > 0) {
                for (var i = 0; i < lstShare.length; i++) {
                    if (lstShare[i].Code == userName) {
                        if (!lstShare[i].Permission.Write && !lstShare[i].Permission.Read) {
                            isView = false;
                            break;
                        }
                    }
                }
                if (!isView) {
                    return App.toastrError("Bạn không có quyền xem tệp tin");
                }
            }
        }

        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            if (userModel.SizeOfFile < 20971520) {
                dataserviceContractPO.getItemFile(id, true, mode, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        if (rs.ID === -1) {
                            App.toastrError(rs.Title);
                            setTimeout(function () {
                                window.open('/Admin/Excel#', '_blank');
                            }, 2000);
                        } else {
                            App.toastrError(rs.Title);
                        }
                        return null;
                    } else {
                        window.open('/Admin/Excel#', '_blank');
                    }
                });
            } else {
                App.toastrError(caption.CP_MSG_FILE_SIZE_LIMIT);
            }

        }
    };

    $scope.viewWord = function (id, mode) {
        var userModel = {};
        var listdata = $('#tblDataContractPOFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        if (userModel.ListUserShare != "" && userModel.ListUserShare != null && userModel.ListUserShare != undefined) {
            var lstShare = JSON.parse(userModel.ListUserShare);
            var isView = true;
            if (lstShare.length > 0) {
                for (var i = 0; i < lstShare.length; i++) {
                    if (lstShare[i].Code == userName) {
                        if (!lstShare[i].Permission.Write && !lstShare[i].Permission.Read) {
                            isView = false;
                            break;
                        }
                    }
                }
                if (!isView) {
                    return App.toastrError("Bạn không có quyền xem tệp tin");
                }
            }
        }
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {

            if (userModel.SizeOfFile < 20971520) {
                dataserviceContractPO.getItemFile(id, true, mode, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        if (rs.ID === -1) {
                            App.toastrError(rs.Title);
                            setTimeout(function () {
                                window.open('/Admin/Docman#', '_blank');
                            }, 2000);
                        } else {
                            App.toastrError(rs.Title);
                        }
                        return null;
                    } else {
                        window.open('/Admin/Docman#', '_blank');
                    }
                });
            } else {
                App.toastrError(caption.CP_MSG_FILE_SIZE_LIMIT);
            }
        }
    };

    $scope.viewPDF = function (id, mode) {
        var userModel = {};
        var listdata = $('#tblDataContractPOFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        if (userModel.ListUserShare != "" && userModel.ListUserShare != null && userModel.ListUserShare != undefined) {
            var lstShare = JSON.parse(userModel.ListUserShare);
            var isView = true;
            if (lstShare.length > 0) {
                for (var i = 0; i < lstShare.length; i++) {
                    if (lstShare[i].Code == userName) {
                        if (!lstShare[i].Permission.Write && !lstShare[i].Permission.Read) {
                            isView = false;
                            break;
                        }
                    }
                }
                if (!isView) {
                    return App.toastrError("Bạn không có quyền xem tệp tin");
                }
            }
        }
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            if (userModel.SizeOfFile < 20971520) {
                dataserviceContractPO.getItemFile(id, true, mode, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        if (rs.ID === -1) {
                            App.toastrError(rs.Title);
                            setTimeout(function () {
                                window.open('/Admin/PDF#', '_blank');
                            }, 2000);
                        } else {
                            App.toastrError(rs.Title);
                        }
                        return null;
                    } else {
                        window.open('/Admin/PDF#', '_blank');
                    }
                });
            } else {
                App.toastrError(caption.CP_MSG_FILE_SIZE_LIMIT);
            }
        }
    };

    $scope.view = function (id) {

        var isImage = false;
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        var userModel = {};
        var listdata = $('#tblDataContractPOFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        if (userModel.ListUserShare != "" && userModel.ListUserShare != null && userModel.ListUserShare != undefined) {
            var lstShare = JSON.parse(userModel.ListUserShare);
            var isView = true;
            if (lstShare.length > 0) {
                for (var i = 0; i < lstShare.length; i++) {
                    if (lstShare[i].Code == userName) {
                        if (!lstShare[i].Permission.Write && !lstShare[i].Permission.Read) {
                            isView = false;
                            break;
                        }
                    }
                }
                if (!isView) {
                    return App.toastrError("Bạn không có quyền xem tệp tin");
                }
            }
        }

        if (image.indexOf(userModel.FileTypePhysic.toUpperCase()) !== -1) {
            isImage = true;
        }
        if (userModel.CloudFileId != null && userModel.CloudFileId != "") {
            //SHOW LÊN MÀN HÌNH LUÔN
            // window.open(" https://drive.google.com/file/d/" + userModel.CloudFileId + "/view", "_blank");
            //$scope.openViewer("https://drive.google.com/file/d/"+userModel.CloudFileId + "/view");3
            dataserviceContractPO.createTempFile(id, false, "", function (rs) {
                rs = rs.data;
                rs.Object = encodeURI(rs.Object);
                if (rs.Error == false) {
                    if (isImage == false) {
                        window.open(rs.Object, '_blank')
                        //$scope.openViewer("https://docs.google.com/gview?url=" + window.location.origin + '/' + rs.Object + '&embedded=true', isImage);
                    } else
                        $scope.openViewer(rs.Object, isImage);
                    //window.open('https://docs.google.com/gview?url=' + window.location.origin + '/' + rs.Object + '&embedded=true', '_blank');
                }
                else {

                }
            });
        }
        else {
            dataserviceContractPO.createTempFile(id, false, "", function (rs) {
                rs = rs.data;
                rs.Object = encodeURI(rs.Object);
                if (rs.Error == false) {
                    if (isImage == false) {

                        var url = window.location.origin + '/' + rs.Object;
                        window.open(url, '_blank')
                        //$scope.openViewer("https://docs.google.com/gview?url=" + window.location.origin + '/' + rs.Object + '&embedded=true', isImage);
                    }
                    else
                        $scope.openViewer(rs.Object, isImage);
                    //window.open('https://docs.google.com/gview?url=' + window.location.origin + '/' + rs.Object + '&embedded=true', '_blank');
                }
                else {

                }
            });
        }
    }

    $scope.openViewer = function (url, isImage) {
        var data = {};
        data.url = url;
        data.isImage = isImage;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderContractPO + '/viewer.html',
            controller: 'viewer',
            backdrop: 'false',
            size: '60',
            resolve: {
                para: function () {
                    return data;
                }
            }
        });
    }

    $scope.extension = function (item) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderRepository + '/extension.html',
            controller: 'extension',
            backdrop: 'static',
            size: '40',
            resolve: {
                para: function () {
                    return {
                        Type: 'LIST',
                        Object: item
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    };

    $scope.share = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderContractPO + '/shareFile.html',
            controller: 'shareFileContractPO',
            backdrop: 'static',
            size: '40',
            resolve: {
                para: function () {
                    return {
                        Id: id
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    };

    function defaultShareFile(id) {
        dataserviceContractPO.getListUserShare(function (rs) {
            rs = rs.data;
            $scope.listUser = rs;
            $scope.lstUserShare = [];
            if ($scope.listUser.length > 0) {
                for (var i = 0; i < $scope.listUser.length; i++) {
                    var item = {
                        Code: $scope.listUser[i].Code,
                        Name: $scope.listUser[i].Name,
                        DepartmentName: $scope.listUser[i].DepartmentName,
                        Permission: $scope.permission
                    }
                    $scope.lstUserShare.push(item);
                }
                $scope.modelShare.Id = id;
                $scope.modelShare.LstShare = JSON.stringify($scope.lstUserShare);
                dataserviceContractPO.autoShareFilePermission($scope.modelShare, function (rs) { })
            }
        });
    }

    setTimeout(function () {
        loadDate();
    }, 200);
});

app.controller('shareFileContractPO', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, dataserviceContract, para) {
    $scope.cancel = function () {
        $uibModalInstance.close('cancel');
    };

    $scope.model = {
        UserName: ''
    };

    $scope.model1 = {
        Code: '',
        Name: '',
        DepartmentName: '',
        Id: para.Id
    };

    $scope.permission = {
        Read: true,
        Write: true,
        Delete: true
    };

    $scope.init = function () {
        $scope.model.Id = para.Id;

        dataserviceContractPO.getListUserShare(function (rs) {
            rs = rs.data;
            $scope.listUser = rs;
        });

        dataserviceContractPO.getUserShareFilePermission($scope.model.Id, function (rs) {
            rs = rs.data;
            $scope.lstUserSharePermission = rs;
        })
    };

    $scope.init();

    $scope.share = function () {
        if ($scope.model.UserName == '') {
            return App.toastrError("Vui lòng chọn nhân viên");
        }
        $scope.model1.Permission = $scope.permission;
        dataserviceContractPO.insertFileShareContract($scope.model1, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                dataserviceContractPO.getUserShareFilePermission($scope.model.Id, function (rs) {
                    rs = rs.data;
                    $scope.lstUserSharePermission = rs;
                })
            }
        })
    }

    $scope.updatePermission = function (item, position, value) {
        item.Id = para.Id;
        if (position == 0) {
            if (value) {
                item.Permission.Read = false;
            }
            else {
                item.Permission.Read = true;
            }
        }
        else if (position == 1) {
            if (value) {
                item.Permission.Write = false;
            }
            else {
                item.Permission.Write = true;
            }
        }
        else {
            if (value) {
                item.Permission.Delete = false;
            }
            else {
                item.Permission.Delete = true;
            }
        }
        dataserviceContractPO.insertFileShareContract(item, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                dataserviceContractPO.getUserShareFilePermission($scope.model.Id, function (rs) {
                    rs = rs.data;
                    $scope.lstUserSharePermission = rs;
                })
            }
        })
    }

    $scope.deleteShare = function (userName) {
        dataserviceContractPO.deleteShareFile(para.Id, userName, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title)
            }
            else {
                App.toastrSuccess(rs.Title);
                dataserviceContractPO.getUserShareFilePermission($scope.model.Id, function (rs) {
                    rs = rs.data;
                    $scope.lstUserSharePermission = rs;
                })
            }
        })
    }

    $scope.changeUser = function (item) {
        debugger
        $scope.model1.Name = item.Name;
        $scope.model1.Code = item.Code;
        $scope.model1.DepartmentName = item.DepartmentName;
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('fileAdd', function ($scope, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, dataserviceContractPO, para) {
    $scope.treeDataCategory = [];
    $scope.catCode = para.CatCode;
    $scope.model = {
        NumberDocument: '',
        Tags: '',
        Desc: ''
    };
    var vm = $scope;
    vm.dt = {};
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSRepository/JtableFolderSettingWithCategory",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.CatCode = $scope.catCode;
                $scope.selected = [];
            },
            complete: function () {
                App.unblockUI("#contentMain");
                $(".dataTables_scrollBody").addClass('scroller-sm-fade');
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(30)
        .withOption('order', [0, 'desc'])
        .withOption('serverSide', true)
        .withOption('scrollY', "340px")
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
            if (data.FolderId == '' || data.FolderId == null) {
                if (para.Path == data.Path) {
                    angular.element(row).addClass('selected');
                }
            } else {
                if (para.FolderId == data.FolderId) {
                    angular.element(row).addClass('selected');
                }
            }
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.Id] = false;
                    } else {
                        $('#tblDataFolder').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.Id] = true;
                    }
                }
                $scope.$apply();
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle('').notSortable()
        .renderWith(function (data, type, full, meta) {
            if (full.FolderId == '' || full.FolderId == null) {
                if (para.Path == full.Path) {
                    $scope.selected[full.Id] = true;
                } else {
                    $scope.selected[full.Id] = false;
                }
            } else {
                if (para.FolderId == full.FolderId) {
                    $scope.selected[full.Id] = true;
                } else {
                    $scope.selected[full.Id] = false;
                }
            }

            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected,$event,' + full.Id + ')"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ''));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FolderName').notSortable().withTitle('{{"CP_LIST_COL_FORDER_SAVE" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
        return '<i class="jstree-icon jstree-themeicon fa fa-folder icon-state-warning jstree-themeicon-custom" aria-hidden="true"></i>&nbsp;' + data;
    }));
    vm.reloadData = reloadData;
    vm.dt.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dt.dtInstance.reloadData(callback, resetPaging);
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
    function toggleOne(selectedItems, evt, itemId) {
        $('#tblDataFolder').DataTable().$('tr.selected').removeClass('selected');
        for (var id in selectedItems) {
            if (id != itemId) {
                selectedItems[id] = false;
            } else {
                if (selectedItems[id]) {
                    $(evt.target).closest('tr').toggleClass('selected');
                }
            }
        }
    }

    $scope.loadFile = function (event) {
        $scope.file = event.target.files[0];
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        if ($scope.file == '' || $scope.file == undefined) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        } else {
            var itemSelect = [];
            for (var id in $scope.selected) {
                if ($scope.selected.hasOwnProperty(id)) {
                    if ($scope.selected[id]) {
                        itemSelect.push(id);
                    }
                }
            }
            if (itemSelect.length == 0) {
                App.toastrError(caption.CP_MSG_PLS_SELECT_FORDER);
                return;
            } else if (itemSelect.length > 1) {
                App.toastrError(caption.CP_MSG_PLS_SELECT_ONE_FORDER);
                return;
            }
            var data = new FormData();
            data.append("CateRepoSettingId", itemSelect.length != 0 ? itemSelect[0] : "");
            data.append("FileUpload", $scope.file);
            data.append("FileName", $scope.file.name);
            data.append("Desc", $scope.model.Desc);
            data.append("Tags", $scope.model.Tags);
            data.append("NumberDocument", $scope.model.NumberDocument);
            data.append("PoCode", $rootScope.PoSupCode);
            data.append("IsMore", true);
            dataserviceContractPO.insertPOFile(data, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $uibModalInstance.close();
                }
            });
        }
    };

    //treeview
    $scope.ctr = {};
    $scope.readyCB = function () {
        if ($scope.treeDataCategory.length == 0) {
            App.blockUI({
                target: "#contentMainRepository",
                boxed: true,
                message: 'loading...'
            });
            dataserviceContractPO.getTreeCategory(function (result) {
                result = result.data;
                if (!result.Error) {
                    var root = {
                        id: 'root',
                        parent: "#",
                        text: caption.CP_LBL_ALL_FORDER,//"Tất cả kho dữ liệu"
                        state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
                    }
                    $scope.treeDataCategory.push(root);
                    var index = 0;
                    $scope.ListParent = result.filter(function (item) {
                        return (item.ParentCode == '#');
                    });
                    for (var i = 0; i < result.length; i++) {
                        if (result[i].ParentCode == '#') {
                            var stt = $scope.ListParent.length - index;
                            if (stt.toString().length == 1) {
                                stt = "0" + stt;
                            }
                            index = index + 1;
                            var data = {
                                id: result[i].Code,
                                parent: 'root',
                                text: stt + ' - ' + result[i].Title,
                                catId: result[i].Id,
                                catCode: result[i].Code,
                                catName: result[i].Title,
                                catParent: result[i].ParentCode,
                                listRepository: result[i].ListRepository,
                                state: { selected: result[i].Code == para.CatCode ? true : false, opened: true }
                            }
                            $scope.treeDataCategory.push(data);
                        } else {
                            var data = {
                                id: result[i].Code,
                                parent: result[i].ParentCode,
                                text: result[i].Code + ' - ' + result[i].Title,
                                catId: result[i].Id,
                                catCode: result[i].Code,
                                catName: result[i].Title,
                                catParent: result[i].ParentCode,
                                listRepository: result[i].ListRepository,
                                state: { selected: result[i].Code == para.CatCode ? true : false, opened: true }
                            }
                            $scope.treeDataCategory.push(data);
                        }
                    }
                    App.unblockUI("#contentMainRepository");
                }
            });
        }
    }
    $scope.selectNodeCategory = function () {
        var listNoteSelect = $scope.ctr.treeInstance.jstree(true).get_checked(true);
        $scope.catCode = listNoteSelect[0].id;
        reloadData(true);
    }
    $scope.deselectNodeCategory = function () {
        $scope.catCode = "";
        reloadData(true);
    }
    $scope.treeConfig = {
        core: {
            multiple: false,
            animation: true,
            error: function (error) {
                $log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
            },
            check_callback: true,
            worker: true,

        },
        types: {
            default: {
                icon: 'fa fa-folder icon-state-warning'
            }
        },
        version: 1,
        plugins: ['checkbox', 'types', 'sort'],
        checkbox: {
            "three_state": false,
            "whole_node": true,
            "keep_selected_style": true,
            "cascade": "undetermined",
        }
    };
    $scope.treeEvents = {
        'ready': $scope.readyCB,
        'select_node': $scope.selectNodeCategory,
        'deselect_node': $scope.deselectNodeCategory,
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('fileEdit', function ($scope, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModal, $uibModalInstance, dataserviceContractPO, para) {
    $scope.treeDataCategory = [];
    $scope.catCode = para.CateRepoSettingCode;
    $scope.model = {
        NumberDocument: '',
        Tags: '',
        Desc: '',
        FileName: ''
    };
    var vm = $scope;
    vm.dt = {};
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSRepository/JtableFolderSettingWithCategory",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.CatCode = $scope.catCode;
                $scope.selected = [];
            },
            complete: function () {
                App.unblockUI("#contentMain");
                $(".dataTables_scrollBody").addClass('scroller-sm-fade');
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(30)
        .withOption('order', [0, 'desc'])
        .withOption('serverSide', true)
        .withOption('scrollY', "340px")
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
            if (para.Path != null && para.Path != "") {
                if (para.Path == data.Path) {
                    angular.element(row).addClass('selected');
                }
            } else {
                if (para.FolderId == data.FolderId) {
                    angular.element(row).addClass('selected');
                }
            }
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.Id] = false;
                    } else {
                        $('#tblDataFolder').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.Id] = true;
                    }
                }
                $scope.$apply();
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle('').notSortable()
        .renderWith(function (data, type, full, meta) {
            if (para.Path != null && para.Path != "") {
                if (para.Path == full.Path) {
                    $scope.selected[full.Id] = true;
                } else {
                    $scope.selected[full.Id] = false;
                }
            }
            else {
                if (para.FolderId == full.FolderId) {
                    $scope.selected[full.Id] = true;
                } else {
                    $scope.selected[full.Id] = false;
                }
            }
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected,$event,' + full.Id + ')"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ''));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FolderName').withOption('sClass', '').withTitle('{{"CP_LIST_COL_FORDER_FILE" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
        return '<i class="jstree-icon jstree-themeicon fa fa-folder icon-state-warning jstree-themeicon-custom" aria-hidden="true"></i>&nbsp;' + data;
    }));
    vm.reloadData = reloadData;
    vm.dt.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dt.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }
    function toggleAll(selectAll, selectedItems) {
        if (selectAll)
            $('#tblDataDetailRepository').DataTable().$('tr:not(.selected)').addClass('selected');
        else
            $('#tblDataDetailRepository').DataTable().$('tr.selected').removeClass('selected');
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                selectedItems[id] = selectAll;
            }
        }
    }
    function toggleOne(selectedItems, evt, itemId) {
        $('#tblDataFolder').DataTable().$('tr.selected').removeClass('selected');
        for (var id in selectedItems) {
            if (id != itemId) {
                selectedItems[id] = false;
            } else {
                if (selectedItems[id]) {
                    $(evt.target).closest('tr').toggleClass('selected');
                }
            }
        }
    }

    $scope.init = function () {
        $scope.model.FileName = para.FileName;
        $scope.model.NumberDocument = para.NumberDocument;
        $scope.model.Tags = (para.Tags != '' && para.Tags != null) ? para.Tags.split(',') : [];
        $scope.model.Desc = para.Desc;
    }
    $scope.init();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        var itemSelect = [];
        for (var id in $scope.selected) {
            if ($scope.selected.hasOwnProperty(id)) {
                if ($scope.selected[id]) {
                    itemSelect.push(id);
                }
            }
        }
        if (itemSelect.length == 0) {
            App.toastrError(caption.CP_MSG_PLS_SELECT_FORDER);
        } else if (itemSelect.length > 1) {
            App.toastrError(caption.CP_MSG_PLS_SELECT_ONE_FORDER);
        } else {
            if ($scope.editformfile.validate()) {
                var data = new FormData();
                data.append("CateRepoSettingId", itemSelect[0]);
                data.append("FileCode", para.FileCode);
                data.append("Desc", $scope.model.Desc);
                data.append("Tags", $scope.model.Tags);
                data.append("NumberDocument", $scope.model.NumberDocument);
                data.append("PoCode", $rootScope.PoSupCode);
                dataserviceContractPO.updatePOFile(data, function (result) {
                    result = result.data;
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                        $uibModalInstance.close();
                    }
                });
            }
        }
    };
    //treeview
    $scope.ctr = {};
    $scope.readyCB = function () {
        if ($scope.treeDataCategory.length == 0) {
            App.blockUI({
                target: "#contentMainRepository",
                boxed: true,
                message: 'loading...'
            });
            dataserviceContractPO.getTreeCategory(function (result) {
                result = result.data;
                if (!result.Error) {
                    var root = {
                        id: 'root',
                        parent: "#",
                        text: caption.CP_LBL_ALL_FORDER,//"Tất cả kho dữ liệu"
                        state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
                    }
                    $scope.treeDataCategory.push(root);
                    var index = 0;
                    $scope.ListParent = result.filter(function (item) {
                        return (item.ParentCode == '#');
                    });
                    for (var i = 0; i < result.length; i++) {
                        if (result[i].ParentCode == '#') {
                            var stt = $scope.ListParent.length - index;
                            if (stt.toString().length == 1) {
                                stt = "0" + stt;
                            }
                            index = index + 1;
                            var data = {
                                id: result[i].Code,
                                parent: 'root',
                                text: stt + ' - ' + result[i].Title,
                                catId: result[i].Id,
                                catCode: result[i].Code,
                                catName: result[i].Title,
                                catParent: result[i].ParentCode,
                                listRepository: result[i].ListRepository,
                                state: { selected: result[i].Code == para.CateRepoSettingCode ? true : false, opened: true }
                            }
                            $scope.treeDataCategory.push(data);
                        } else {
                            var data = {
                                id: result[i].Code,
                                parent: result[i].ParentCode,
                                text: result[i].Code + ' - ' + result[i].Title,
                                catId: result[i].Id,
                                catCode: result[i].Code,
                                catName: result[i].Title,
                                catParent: result[i].ParentCode,
                                listRepository: result[i].ListRepository,
                                state: { selected: result[i].Code == para.CateRepoSettingCode ? true : false, opened: true }
                            }
                            $scope.treeDataCategory.push(data);
                        }
                    }
                    App.unblockUI("#contentMainRepository");
                    console.log($scope.treeDataCategory);
                }
            });
        }
    }
    $scope.selectNodeCategory = function () {
        var listNoteSelect = $scope.ctr.treeInstance.jstree(true).get_checked(true);
        $scope.catCode = listNoteSelect[0].id;
        reloadData(true);
    }
    $scope.deselectNodeCategory = function () {
        $scope.catCode = "";
        reloadData(true);
    }
    $scope.treeConfig = {
        core: {
            multiple: false,
            animation: true,
            error: function (error) {
                $log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
            },
            check_callback: true,
            worker: true,

        },
        types: {
            default: {
                icon: 'fa fa-folder icon-state-warning'
            }
        },
        version: 1,
        plugins: ['checkbox', 'types', 'sort'],
        checkbox: {
            "three_state": false,
            "whole_node": true,
            "keep_selected_style": true,
            "cascade": "undetermined",
        }
    };
    $scope.treeEvents = {
        'ready': $scope.readyCB,
        'select_node': $scope.selectNodeCategory,
        'deselect_node': $scope.deselectNodeCategory,
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        //setModalMaxHeight('.modal-file');
    }, 200);
});

app.controller('fileImageViewer', function ($scope, $rootScope, $compile, $uibModal, $confirm, dataserviceContractPO, $filter, $uibModalInstance, para) {
    $scope.Image = para;
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('fileShare', function ($scope, $rootScope, $compile, $uibModalInstance, dataserviceContractPO) {
    $scope.model = {
        ObjectCodeShared: $rootScope.ObjectSupplier.SupplierCode,
        ObjectTypeShared: 'SUPPLIER',
        ObjectType: '',
        ObjectCode: '',
        FileCode: '',
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.init = function () {
        dataserviceContractPO.getListObjectTypeShare(function (rs) {
            rs = rs.data;
            $scope.listObjType = rs;
        });
        dataserviceContractPO.getListFileWithObject($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, function (rs) {
            rs = rs.data;
            $scope.listFileObject = rs;
        });
        reloadListObjectShare($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, $scope.model.ObjectCode, $scope.model.ObjectType, $scope.model.FileCode);
    }
    $scope.init();
    $scope.changeObjType = function (ObjType) {
        dataserviceContractPO.getListObjectCode($rootScope.ObjectSupplier.ContractCode, ObjType, function (rs) {
            rs = rs.data;
            $scope.listObjCode = rs;
        });
        reloadListObjectShare($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, $scope.model.ObjectCode, ObjType, $scope.model.FileCode);
    }
    $scope.changeObjCode = function (objectCode) {
        reloadListObjectShare($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, objectCode, $scope.model.ObjectType, $scope.model.FileCode);
    }
    $scope.selectFile = function (fileCode) {
        reloadListObjectShare($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, $scope.model.ObjectCode, $scope.model.ObjectType, fileCode);
    }
    $scope.reloadListObjectShare = function () {
        reloadListObjectShare($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, $scope.model.ObjectCode, $scope.model.ObjectType, $scope.model.FileCode);
    }
    $scope.removeObjectShare = function (id) {
        dataserviceContractPO.deleteObjectShare(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                reloadListObjectShare($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, $scope.model.ObjectCode, $scope.model.ObjectType, $scope.model.FileCode);
            }
        });
    }
    $scope.share = function () {
        if (!$scope.validate()) {
            dataserviceContractPO.insertFileShare($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    reloadListObjectShare($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, $scope.model.ObjectCode, $scope.model.ObjectType, $scope.model.FileCode);
                }
            });
        }
    }
    $scope.validate = function () {
        var error = false;
        if (($scope.model.ObjectType == "" || $scope.model.ObjectType == undefined)) {
            App.toastrError(caption.CP_MSG_NO_SELECT_OBJ)
            error = true;
            return error;
        }
        if (($scope.model.ObjectCode == "" || $scope.model.ObjectCode == undefined)) {
            App.toastrError(capton.CP_MSG_NO_SELECT_OBJ_CODE)
            error = true;
            return error;
        }
        if (($scope.model.FileCode == "" || $scope.model.FileCode == undefined)) {
            App.toastrError(caption.CP_MSG_NO_SELECT_FILE)
            error = true;
            return error;
        }
    }
    function reloadListObjectShare(objectCodeShared, objectTypeShared, objectCode, objectType, fileCode) {
        dataserviceContractPO.getListObjectShare(objectCodeShared, objectTypeShared, objectCode, objectType, fileCode, function (rs) {
            rs = rs.data;
            $scope.listObjectShare = rs;
        })
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('viewer', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, para, $sce) {

    var data = para;
    $scope.url = data.url;
    $scope.isImage = data.isImage;
    if ($scope.isImage)
        $scope.url = "/" + $scope.url;
    $scope.currentProjectUrl = $sce.trustAsResourceUrl($scope.url);
    console.log($scope.currentProjectUrl);
    console.log(data);
});
//Schedule contract sale

app.controller('schedule-contract-po', function ($scope, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModal, $uibModalInstance, $filter, dataserviceContractPO) {
    $scope.model = {
        MemberId: '',
        FromDate: '',
        ToDate: ''
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    function loadCalendar(id) {
        $('#' + id).fullCalendar({
            defaultView: 'month',
            selectable: true,
            editable: true,
            eventLimit: true,
            header: {
                left: 'prev,next,today',
                right: 'prevYear, nextYear',
                center: 'title',
            },
            dayNames: [caption.CJ_LBL_SUNDAY, caption.CJ_LBL_MONDAY, caption.CJ_LBL_TUESDAY, caption.CJ_LBL_WEDNESDAY, caption.CJ_LBL_THUSDAY, caption.CJ_LBL_FRIDAY, caption.CJ_LBL_SATURDAY],
            monthNames: [caption.CJ_LBL_JANUARY + ' - ', caption.CJ_LBL_FEBRUARY + ' - ', caption.CJ_LBL_MARCH + ' - ', caption.CJ_LBL_APRIL + ' - ', caption.CJ_LBL_MAY + ' - ', caption.CJ_LBL_JUNE + ' - ', caption.CJ_LBL_JULY + ' - ', caption.CJ_LBL_AUGUST + ' - ', caption.CJ_LBL_SEPTEMBER + ' - ', caption.CJ_LBL_OCTOBER + ' - ', caption.CJ_LBL_NOVEMBER + ' - ', caption.CJ_LBL_DECEMBER + ' - '],
            monthNamesShort: [caption.CJ_LBL_JAN + ' - ', caption.CJ_LBL_FEB + ' - ', caption.CJ_LBL_MAR + ' - ', caption.CJ_LBL_APR + ' - ', caption.CJ_LBL_MA + ' - ', caption.CJ_LBL_JUN + ' - ', caption.CJ_LBL_JUL + ' - ', caption.CJ_LBL_AUG + ' - ', caption.CJ_LBL_SEP + ' - ', caption.CJ_LBL_OCT + ' - ', caption.CJ_LBL_NOV + ' - ', caption.CJ_LBL_DEC + ' - '],
            dayNamesShort: [caption.CJ_LBL_SUNDAY, caption.CJ_LBL_MON, caption.CJ_LBL_TUE, caption.CJ_LBL_WED, caption.CJ_LBL_THUS, caption.CJ_LBL_FRI, caption.CJ_LBL_SAT],

            buttonText: {
                today: caption.CJ_LBL_TODAY,
                icon: 'far fa-calendar-check'
            },
            events: function (start, end, timezone, callback) {
                var month = $('#calendarContractPO').fullCalendar('getDate').format('MM');
                var year = $('#calendarContractPO').fullCalendar('getDate').format('YYYY');
                dataserviceContractPO.scheduleContractPO(month, year, function (rs) {
                    rs = rs.data;
                    var event = [];
                    angular.forEach(rs.Object, function (value, key) {
                        var expried = {
                            value: 1,
                            title: "Hết hạn: " + value.Expried,
                            start: value.Date,
                            className: 'fc-event-event-pink',
                            date: value.Date,
                            displayEventTime: false,
                        }
                        var nextPay = {
                            value: 2,
                            title: "Thanh toán: " + value.NextPay,
                            start: value.Date,
                            className: 'fc-event-event-green',
                            date: value.Date,
                            displayEventTime: false,
                        }
                        var renew = {
                            value: 3,
                            title: "Gia hạn: " + value.Renew,
                            start: value.Date,
                            className: 'fc-event-event-orange',
                            date: value.Date,
                            displayEventTime: false,
                        }

                        event.push(nextPay);
                        event.push(renew);
                        event.push(expried);
                    })
                    callback(event);
                })
            },
            eventClick: function (calEvent) {
                var date = $filter('date')(new Date(calEvent.date), 'dd/MM/yyyy');
                var value = calEvent.value;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderContractPO + '/view-calendar.html',
                    controller: 'grid-view-calendar',
                    size: '70',
                    resolve: {
                        para: function () {
                            return {
                                Date: date,
                                Value: value,
                            }
                        }
                    }
                });
                modalInstance.result.then(function (d) {

                });
            },
            eventOrder: "value",
        })
    }
    function gotoDate(date) {
        if (!$rootScope.isNext) {
            $('#calendarContractPO').fullCalendar('gotoDate', date);
        }
    }
    setTimeout(function () {
        loadCalendar("calendarContractPO");
        setModalDraggable(".modal-dialog");
        $('.fc-prev-button').click(function () {
            $rootScope.isNext = true;
        });
        $('.fc-next-button').click(function () {
            $rootScope.isNext = true;
        });
        $('.fc-today-button').click(function () {
            $rootScope.isNext = true;
        });
        $('.fc-prevYear-button').click(function () {
            $rootScope.isNext = true;
        });
        $('.fc-nextYear-button').click(function () {
            $rootScope.isNext = true;
        });
    }, 200);
});

app.controller('grid-view-calendar', function ($scope, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModal, $uibModalInstance, $filter, dataserviceContractPO, para) {
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.date = para.Date;
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/ContractPO/JTableCalendar",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Date = para.Date;
                d.Value = para.Value;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                //heightTableAuto();
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
                        $('#tblDataContractPOCalendar').DataTable().$('tr.selected').removeClass('selected');
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
            //$(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
            //    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

            //    } else {
            //        var Id = data.Id;
            //        $scope.edit(Id);
            //    }
            //});
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().withOption('sClass', 'hidden').renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PoSupCode').withTitle('{{"CP_LIST_COL_PO_SUP_CODE" | translate}}').withOption('sClass', ' dataTable-pr0 w170').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PoTitle').withTitle('{{"CP_LIST_COL_PO_TITLE" | translate}}').withOption('sClass', ' dataTable-pr0 w300').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Type').withTitle('{{"CP_TAB_PAYMENT_LIST_COL_AET_TYPE" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type) {
        if (data == "STORAGE") {
            return "Lưu kho";
        } else {
            return "Đơn hàng theo khách hàng";
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('OrderBy').withTitle('{{"CP_LIST_COL_ORDER_BY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Consigner').withTitle('{{"CP_LIST_COL_CONSIGNER" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('BuyerCode').withTitle('{{"CP_LIST_COL_BUYER_CODE" | translate}}').withOption('sClass', 'tleft dataTable-pr0 w200').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SupName').withTitle('{{"CP_LIST_COL_SUP" | translate}}').withOption('sClass', '').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"CP_LIST_COL_CREATED_TIME" | translate}}').withOption('sClass', 'tcenter dataTable-pr0 w70').notSortable().renderWith(function (data, type, full) {
        return data != null ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('TotalAmount').withTitle('{{"Tổng tiền" | translate}}').withOption('sClass', '').renderWith(function (data, type) {
    //    return data != "" ? $filter('currency')(data, '', 0) : null;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('TotalPayment').withTitle('{{"Tổng tiền đã trả" | translate}}').withOption('sClass', '').renderWith(function (data, type, full) {
    //    return rs = data != "" ? '<a class="text-underline" ng-click="viewPayment(\'' + full.PoSupCode + '\')">' + $filter('currency')(data, '', 0) + '</a>' : '<a class="text-danger text-underline" ng-click="viewPayment(\'' + full.PoSupCode + '\')">Thêm phiếu thu/chi</a>';
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ExpirationDate').withTitle('{{ "ATTRM_LIST_COL_EXPIRATION_DATE" | translate }}').withOption('sClass', 'w50').renderWith(function (data, type) {
        if (data !== null && data !== undefined && data !== '') {
            data = convertDatetime(data);
            var created = new Date(data);
            var now = new Date();
            var diffMs = (created - now);
            var diffDay = Math.floor((diffMs / 86400000));
            if ((diffDay + 1) < 0) {
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-danger fs9 ml5">Đã quá hạn</span>';
            } else if ((diffDay + 1) > 0) {
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-success fs9 ml5">Còn ' + (diffDay + 1) + ' ngày</span>'
            } else {
                var end = new Date(new Date().setHours(23, 59, 59, 999));
                var diffMs1 = (end - now);

                var diffHrs = Math.floor((diffMs1 % 86400000) / 3600000);
                var diffMins = Math.round(((diffMs1 % 86400000) % 3600000) / 60000);
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-success fs9 ml5">Còn ' + diffHrs + 'h ' + diffMins + 'p</span>'
            }
        }
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('RenewalDate').withTitle('{{ "ATTRM_LIST_COL_RENEWAL_DATE" | translate }}').withOption('sClass', 'w50').renderWith(function (data, type) {
        if (data !== null && data !== undefined && data !== '') {
            data = convertDatetime(data);
            var created = new Date(data);
            var now = new Date();
            var diffMs = (created - now);
            var diffDay = Math.floor((diffMs / 86400000));
            if ((diffDay + 1) < 0) {
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-danger fs9 ml5">Đã quá hạn</span>';
            } else if ((diffDay + 1) > 0) {
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-success fs9 ml5">Còn ' + (diffDay + 1) + ' ngày</span>'
            } else {
                var end = new Date(new Date().setHours(23, 59, 59, 999));
                var diffMs1 = (end - now);

                var diffHrs = Math.floor((diffMs1 % 86400000) / 3600000);
                var diffMins = Math.round(((diffMs1 % 86400000) % 3600000) / 60000);
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-success fs9 ml5">Còn ' + diffHrs + 'h ' + diffMins + 'p</span>'
            }
        }
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PaymentNextDate').withTitle('{{ "ATTRM_LIST_COL_PAYMENT_DATE" | translate }}').withOption('sClass', 'w50').renderWith(function (data, type) {
        if (data !== null && data !== undefined && data !== '') {
            data = convertDatetime(data);
            var created = new Date(data);
            var now = new Date();
            var diffMs = (created - now);
            var diffDay = Math.floor((diffMs / 86400000));
            if ((diffDay + 1) < 0) {
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-danger fs9 ml5">Đã quá hạn</span>';
            } else if ((diffDay + 1) > 0) {
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-success fs9 ml5">Còn ' + (diffDay + 1) + ' ngày</span>'
            } else {
                var end = new Date(new Date().setHours(23, 59, 59, 999));
                var diffMs1 = (end - now);

                var diffHrs = Math.floor((diffMs1 % 86400000) / 3600000);
                var diffMins = Math.round(((diffMs1 % 86400000) % 3600000) / 60000);
                data = '<span class="text-green bold">' + $filter('date')(new Date(data), 'dd/MM/yyyy') + '</span></br>' + '<span class="badge-customer badge-customer-success fs9 ml5">Còn ' + diffHrs + 'h ' + diffMins + 'p</span>'
            }
        }
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"CP_LIST_COL_STATUS" | translate}}').withOption('sClass', 'nowrap dataTable-pr0 w180 bold').renderWith(function (data, type, full) {
        return '<span class="' + full.Icon + '"></span> ' + data;
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

    $scope.reload = function () {
        reloadData(true);
    };
    setTimeout(function () {
        setModalDraggable(".modal-dialog");
    }, 200);
});

app.controller('contractTabMembers', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceContractPO, $filter) {
    var vm = $scope;
    $scope.model = {
        ContractPOCode: $rootScope.PoSupCode,
        Assignee: '',
        Note: ''
    }
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/ContractPO/JTableMember",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ContractPOCode = $rootScope.PoSupCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
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
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().withOption('sClass', 'hidden').renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Assigner').withTitle('{{"CP_CURD_MSG_PERSON_JOB" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"CP_CURD_MSG_DESCRIPTION" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AssignerTime').withTitle('{{"CP_CURD_MSG_CREATE_TIME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withTitle('{{"CP_CURD_MSG_MANIPULATION" | translate}}').withOption('sClass', 'tcenter nowrap dataTable-w80').renderWith(function (data, type, full, meta) {
        return '<button title="{{"CP_CURD_MSG_DELETE" | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
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
    function callback(json) {

    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.Assignee == "" || data.Assignee == null) {
            $scope.errorAssignee = true;
            mess.Status = true;
        } else {
            $scope.errorAssignee = false;
        }
        return mess;
    };
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.init = function () {
        dataserviceContractPO.getListUser(function (rs) {
            rs = rs.data;
            $scope.listUser = rs;
        })
    }
    $scope.init();
    $scope.changleSelect = function (selectType) {
        if (selectType == "Assignee" && $scope.model.Assignee != "") {
            $scope.errorAssignee = false;
        }
    }
    $scope.add = function () {
        if (validationSelect($scope.model).Status == false) {
            var data = {
                ContractPOCode: $rootScope.PoSupCode,
                UserId: $scope.model.Assignee,
                Note: $scope.model.Note
            };
            dataserviceContractPO.assignToContractPO(data, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                }
            })
        }
    }
    $scope.delete = function (id) {
        dataserviceContractPO.deleteAssignContract(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                reloadData(true);
            }
        })
    }
});
