var ctxfolderContract = "/views/admin/contract";
var ctxfolderMessage = "/views/message-box";
var ctxfolderFileShare = "/views/admin/fileObjectShare";
var ctxfolderImpProduct = "/views/admin/sendRequestImportProduct";
var ctxfolderCommonSetting = "/views/admin/commonSetting";
var app = angular.module('App_ESEIM_CONTRACT', ['App_ESEIM_DASHBOARD', 'App_ESEIM_CUSTOMER', 'App_ESEIM_PROJECT', 'App_ESEIM_CARD_JOB', 'App_ESEIM_ATTR_MANAGER', 'App_ESEIM_MATERIAL_PROD', 'App_ESEIM_REPOSITORY', 'App_ESEIM_SUPPLIER', 'App_ESEIM_FILE_PLUGIN', 'App_ESEIM_WF_PLUGIN', "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ngTagsInput', 'dynamicNumber', 'ng.jsoneditor', 'ui.tab.scroll']);
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
app.directive('customOnChangeContractPay', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChangeContractPay);
            element.on('change', onChangeHandler);
            element.on('$destroy', function () {
                element.off();
            });

        }
    };
});
app.service('myService', function () {
    var data;
    this.setData = function (d) {
        data = d;
    }
    this.getData = function () {
        return data;
    }
});
app.factory('dataserviceContract', function ($http) {
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
        //common
        getListCommon: function (callback) {
            $http.post('/Admin/Contract/GetListCommon').then(callback);
        },
        insertContract: function (data, callback) {
            $http.post('/Admin/Contract/InsertContract/', data).then(callback);
        },
        updateContract: function (data, callback) {
            $http.post('/Admin/Contract/UpdateContract/', data).then(callback);
        },
        deleteContract: function (data, callback) {
            $http.post('/Admin/Contract/DeleteContract/' + data).then(callback);
        },
        getItemContract: function (data, callback) {
            $http.get('/Admin/Contract/GetItem?id=' + data, {
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
        getListSupString: function (data, callback) {
            $http.get('/Admin/Contract/GetListSupString?contractCode=' + data).then(callback);
        },
        getListUserContract: function (callback) {
            $http.post('/Admin/Contract/GetListUser').then(callback);
        },
        getCustomers: function (callback) {
            $http.post('/Admin/Contract/GetCustomers/').then(callback);
        },
        getProjects: function (callback) {
            $http.post('/Admin/Contract/GetProjects/').then(callback);
        },
        getListProjectAdd: function (data, callback) {
            $http.post('/Admin/Contract/GetListProjectAdd?prjCode=' + data).then(callback);
        },
        getCustomerFromPrj: function (data, callback) {
            $http.get('/Admin/Contract/GetCustomerFromPrj?prjCode=' + data).then(callback);
        },
        getInfoFromPrj: function (data, callback) {
            $http.get('/Admin/Contract/GetInfoFromPrj?prjCode=' + data).then(callback);
        },
        getCurrency: function (callback) {
            $http.post('/Admin/Contract/GetCurrency').then(callback);
        },
        getCusName: function (data, callback) {
            $http.get('/Admin/Contract/GetCusName?cusCode=' + data).then(callback);
        },
        getStatusPOCus: function (callback) {
            $http.post('/Admin/Contract/GetStatusPOCus/').then(callback);
        },
        getBranch: function (callback) {
            $http.post('/Admin/Project/GetBranch').then(callback);
        },
        //CommonSetting
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
        getObjCode: function (objDepen, callback) {
            $http.post('/Admin/CardJob/GetObjCode/?Dependency=' + objDepen).then(callback);
        },
        //task
        getTask: function (callback) {
            $http.post('/Admin/Contract/GetTask').then(callback);
        },
        insertTagPeople: function (data, callback) {
            $http.post('/Admin/Contract/InsertTagPeople', data).then(callback);
        },
        deleteTagPeople: function (data, callback) {
            $http.post('/Admin/Contract/DeleteTagPeople', data).then(callback);
        },
        getListUser: function (callback) {
            $http.post('/Admin/User/GetListUser').then(callback);
        },

        //note
        getContractNote: function (data, callback) {
            $http.post('/Admin/Contract/GetContractNote', data).then(callback);
        },
        insertContractNote: function (data, callback) {
            $http.post('/Admin/Contract/InsertContractNote', data).then(callback);
        },
        updateContractNote: function (data, callback) {
            $http.post('/Admin/Contract/UpdateContractNote', data).then(callback);
        },
        deleteContractNote: function (data, callback) {
            $http.post('/Admin/Contract/DeleteContractNote', data).then(callback);
        },
        getUserlogin: function (callback) {
            $http.post('/Admin/Contract/GetUserlogin').then(callback);
        },

        //detai
        getContractDetail: function (data, callback) {
            $http.post('/Admin/Contract/GetContractDetail/' + data).then(callback);
        },
        insertContractDetail: function (data, callback) {
            $http.post('/Admin/Contract/InsertContractDetail/', data).then(callback);
        },
        updateContractDetail: function (data, callback) {
            $http.post('/Admin/Contract/UpdateContractDetail/', data).then(callback);
        },
        deleteContractDetail: function (data, callback) {
            $http.post('/Admin/Contract/DeleteContractDetail/' + data).then(callback);
        },

        //file
        getTreeCategory: function (callback) {
            $http.post('/Admin/EDMSRepository/GetTreeCategory').then(callback);
        },
        getContractFile: function (data, callback) {
            $http.post('/Admin/Contract/GetContractFile/' + data).then(callback);
        },
        insertContractFile: function (data, callback) {
            submitFormUpload('/Admin/Contract/InsertContractFile/', data, callback);
        },
        updateContractFile: function (data, callback) {
            submitFormUpload('/Admin/Contract/UpdateContractFile/', data, callback);
        },
        deleteContractFile: function (data, callback) {
            $http.post('/Admin/Contract/DeleteContractFile/' + data).then(callback);
        },
        getSuggestionsContractFile: function (data, callback) {
            $http.get('/Admin/Contract/GetSuggestionsContractFile?contractCode=' + data).then(callback);
        },
        getListObjectTypeShare: function (callback) {
            $http.get('/Admin/FileObjectShare/GetListObjectTypeShare/').then(callback);
        },
        getListObjectCode: function (objectCode, objectType, callback) {
            $http.get('/Admin/FileObjectShare/GetListObjectCode?objectCode=' + objectCode + '&objectType=' + objectType).then(callback);
        },
        getListFileWithObject: function (objectCode, objectType, callback) {
            $http.get('/Admin/FileObjectShare/GetListFileWithObject?objectCode=' + objectCode + '&objectType=' + objectType).then(callback);
        },
        getListObjectShare: function (objectCodeShared, objectTypeShared, objectCode, objectType, fileCode, callback) {
            $http.get('/Admin/FileObjectShare/GetListObjectShare?objectCodeShared=' + objectCodeShared + '&objectTypeShared=' + objectTypeShared + '&objectCode=' + objectCode + '&objectType=' + objectType + '&fileCode=' + fileCode).then(callback);
        },
        insertFileShare: function (data, callback) {
            $http.post('/Admin/FileObjectShare/InsertFileShare/', data).then(callback);
        },
        deleteObjectShare: function (data, callback) {
            $http.get('/Admin/FileObjectShare/DeleteObjectShare?id=' + data).then(callback);
        },
        getItemFile: function (data, data1, data2, callback) {
            $http.get('/Admin/EDMSRepository/GetItemFile?id=' + data + '&&IsEdit=' + data1 + '&mode=' + data2).then(callback);
        },
        createTempFile: function (data, data1, data2, callback) {
            $http.post('/Admin/EDMSRepository/CreateTempFile?Id=' + data + "&isSearch=" + data1 + "&content=" + data2).then(callback);
        },
        getListUserShare: function (callback) {
            $http.post('/Admin/EDMSRepository/GetListUser').then(callback);
        },

        //atribute
        getContractAttr: function (data, callback) {
            $http.post('/Admin/Contract/GetContractAttr/' + data).then(callback);
        },
        insertContractAttr: function (data, callback) {
            $http.post('/Admin/Contract/InsertContractAttr/', data).then(callback);
        },
        updateContractAttr: function (data, callback) {
            $http.post('/Admin/Contract/UpdateContractAttr/', data).then(callback);
        },
        deleteContractAttr: function (data, callback) {
            $http.post('/Admin/Contract/DeleteContractAttr/' + data).then(callback);
        },

        //relative
        getListContractOrther: function (data, callback) {
            $http.get('/Admin/Contract/GetListContractOrther?contractCode=' + data).then(callback);
        },
        getListRelative: function (callback) {
            $http.post('/Admin/Contract/GetListRelative').then(callback);
        },
        insertRelative: function (data, callback) {
            $http.post('/Admin/Contract/InsertRelative', data).then(callback);
        },
        updateRelative: function (data, callback) {
            $http.post('/Admin/Contract/UpdateRelative/', data).then(callback);
        },
        deleteRelative: function (id, contractCode, callback) {
            $http.get('/Admin/Contract/DeleteRelative?id=' + id + '&contractCode=' + contractCode).then(callback);
        },

        //payment
        getTotalPayment: function (data, callback) {
            $http.post('/Admin/Contract/GetTotalPayment', data).then(callback);
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
        getObjDependencyFund: function (callback) {
            $http.post('/Admin/FundAccEntry/GetObjDependencyFund').then(callback);
        },
        getObjCode: function (objDepen, callback) {
            $http.post('/Admin/CardJob/GetObjCode/?Dependency=' + objDepen).then(callback);
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
        checkLimitTotal: function (data, callback) {
            $http.post('/Admin/Contract/CheckLimitTotal?aetCode=' + data).then(callback);
        },
        checkLimitTotalUpdate: function (data, data1, callback) {
            $http.post('/Admin/Contract/CheckLimitTotalUpdate?aetCode=' + data + "&&aetCodeChild=" + data1).then(callback);
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
        getAddress: function (lat, lon, callback) {
            $http.get('/Admin/CardJob/GetAddress?lat=' + lat + '&lon=' + lon).then(callback);
        },
        getListCurrencyPayment: function (callback) {
            $http.post('/Admin/FundAccEntry/GetListCurrency/').then(callback);
        },
        getCurrencyDefaultPayment: function (callback) {
            $http.post('/Admin/FundAccEntry/GetCurrencyDefaultPayment').then(callback);
        },

        //tab service 
        getService: function (callback) {
            $http.get('/Admin/Contract/GetService').then(callback);
        },
        insertService: function (data, callback) {
            $http.post('/Admin/Contract/InsertService', data).then(callback);
        },
        updateService: function (data, callback) {
            $http.post('/Admin/Contract/UpdateService', data).then(callback);
        },
        deleteServiceDetail: function (data, callback) {
            $http.post('/Admin/Contract/DeleteServiceDetail?Id=' + data).then(callback);
        },
        getServiceDetail: function (data, callback) {
            $http.post('/Admin/Contract/GetServiceDetail?Id=' + data).then(callback);
        },
        getServiceUnit: function (callback) {
            $http.get('/Admin/Contract/GetServiceUnit').then(callback);
        },

        //product
        getListProduct: function (callback) {
            $http.post('/Admin/Contract/GetListProduct').then(callback);
        },
        getServiceCondition: function (callback) {
            $http.post('/Admin/Contract/GetServiceCondition').then(callback);
        },
        getCostByServiceAndCondition: function (callback) {
            $http.post('/Admin/Contract/GetCostByServiceAndCondition').then(callback);
        },
        getCostTotalContract: function (callback) {
            $http.post('/Admin/Contract/GetCostTotalContract').then(callback);
        },
        getUpdateLog: function (data, callback) {
            $http.post('/Admin/Contract/GetUpdateLog?ContractCode=' + data).then(callback);
        },
        getListConfirmText: function (data, callback) {
            $http.post('/Admin/Contract/GetListConfirmText?ContractCode=' + data).then(callback);
        },
        getProductCost: function (callback) {
            $http.post('/Admin/Contract/GetProductCost').then(callback);
        },
        getProductUnit: function (callback) {
            $http.post('/Admin/Contract/GetProductUnit').then(callback);
        },
        getPriceOption: function (data, callback) {
            $http.get('/Admin/Contract/GetPriceOption?customerCode=' + data).then(callback);
        },
        insertProduct: function (data, callback) {
            $http.post('/Admin/Contract/InsertProduct', data).then(callback);
        },
        deleteProductInContract: function (data, callback) {
            $http.post('/Admin/Contract/DeleteProductInContract?Id=' + data).then(callback);
        },
        updateProductInContract: function (data, callback) {
            $http.post('/Admin/Contract/UpdateProductInContract', data).then(callback);
        },
        getItemProductInContract: function (data1, data2, data3, callback) {
            $http.get('/Admin/Contract/GetItemProductInContract/?contractCode=' + data1 + '&productCode=' + data2 + '&productType=' + data3).then(callback);
        },
        getContractCode: function (data, callback) {
            $http.post('/Admin/Contract/GetContractCode?role=' + data).then(callback);
        },
        insertConfirmText: function (poSupCode, confirm, callback) {
            $http.post('/Admin/contract/InsertConfirmText?contractCode=' + poSupCode + '&&confirm=' + confirm).then(callback);
        },
        updateConfirmTextById: function (poSupCode, id, confirm, callback) {
            $http.post('/Admin/contract/UpdateConfirmTextById?contractCode=' + poSupCode + '&&id=' + id + '&&confirm=' + confirm).then(callback);
        },
        deleteConfirmTextById: function (poSupCode, id, callback) {
            $http.post('/Admin/contract/DeleteConfirmTextById?contractCode=' + poSupCode + '&&id=' + id).then(callback);
        },
        getListSupplier: function (callback) {
            $http.post('/Admin/MaterialProductHistorySale/GetListSupplier/').then(callback);
        },
        chkExistRequestImp: function (data1, callback) {
            $http.get('/Admin/Contract/ChkExistRequestImp/?poCode=' + data1).then(callback);
        },
        getCustommerContactInfo: function (data, callback) {
            $http.get('/Admin/Contract/GetCustommerContactInfo?cusCode=' + data).then(callback);
        },
        updateCustommerContactInfo: function (data, callback) {
            $http.post('/Admin/Contract/UpdateCustommerContactInfo', data).then(callback);
        },

        //đặt hàng
        getImpStatus: function (callback) {
            $http.post('/Admin/SendRequestImportProduct/getImpStatus/').then(callback);
        },
        genReqCode: function (callback) {
            $http.post('/Admin/SendRequestImportProduct/GenReqCode').then(callback);
        },
        genTitle: function (data, callback) {
            $http.post('/Admin/SendRequestImportProduct/GenTitle?poCode=' + data).then(callback);
        },
        insertImpProduct: function (data, callback) {
            $http.post('/Admin/SendRequestImportProduct/Insert/', data).then(callback);
        },
        updateImpProduct: function (data, callback) {
            $http.post('/Admin/SendRequestImportProduct/Update', data).then(callback);
        },
        deleteImpProduct: function (data, callback) {
            $http.post('/Admin/SendRequestImportProduct/Delete?id=' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/SendRequestImportProduct/GetItem?id=' + data).then(callback);
        },
        getListUnit: function (callback) {
            $http.post('/Admin/SendRequestImportProduct/GetListUnit').then(callback);
        },
        getListCurrency: function (callback) {
            $http.post('/Admin/ServiceCategoryPrice/GetListCurrency').then(callback);
        },
        getListProductWithContractBuyer: function (data, callback) {
            $http.get('/Admin/SendRequestImportProduct/GetListProductWithContractBuyer?contractCode=' + data).then(callback);
        },
        getListProductWithProject: function (data, callback) {
            $http.get('/Admin/SendRequestImportProduct/GetListProductWithProject?projectCode=' + data).then(callback);
        },
        insertDetail: function (data, callback) {
            $http.post('/Admin/SendRequestImportProduct/InsertDetail', data).then(callback);
        },
        updateDetail: function (data, callback) {
            $http.post('/Admin/SendRequestImportProduct/UpdateDetail', data).then(callback);
        },
        deleteDetail: function (data, callback) {
            $http.post('/Admin/SendRequestImportProduct/DeleteDetail?id=' + data).then(callback);
        },
        getListPoProduct: function (data, callback) {
            $http.get('/Admin/SendRequestImportProduct/GetListPoProduct?contractCode=' + data).then(callback);
        },
        getListProjectCode: function (callback) {
            $http.post('/Admin/SendRequestImportProduct/GetListProjectCode').then(callback);
        },
        getListProjectSearch: function (callback) {
            $http.post('/Admin/SendRequestImportProduct/GetListProjectSearch').then(callback);
        },
        getListProductWithPoSale: function (poCode, callback) {
            $http.get('/Admin/SendRequestImportProduct/GetListProductWithPoSale?contractCode=' + poCode).then(callback);
        },
        getListProductProject: function (poCode, callback) {
            $http.get('/Admin/SendRequestImportProduct/GetListProductProject?projectCode=' + poCode).then(callback);
        },
        jTableDetail: function (reqCode, callback) {
            $http.get('/Admin/SendRequestImportProduct/JTableDetail?reqCode=' + reqCode).then(callback);
        },


        //schedule pay
        getPayTimes: function (data, callback) {
            $http.get('/Admin/Contract/GetPayTimes?contractCode=' + data).then(callback);
        },
        //getContractSchedulePay: function (data, callback) {
        //    $http.post('/Admin/Contract/GetContractSchedulePay/' + data).then(callback);
        //},
        insertContractSchedulePay: function (data, callback) {
            $http.post('/Admin/Contract/InsertContractSchedulePay/', data).then(callback);
        },
        updateContractSchedulePay: function (data, callback) {
            $http.post('/Admin/Contract/UpdateContractSchedulePay/', data).then(callback);
        },
        deleteContractSchedulePay: function (data, callback) {
            $http.post('/Admin/Contract/DeleteContractSchedulePay/' + data).then(callback);
        },
        //Show history version
        getItemHistoryVersion: function (data, callback) {
            $http.get('/Admin/Contract/GetItemHistoryVersion?contractCode=' + data, {
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

        //Contract Po Buyer
        getContractPoBuyer: function (callback) {
            $http.post('/Admin/Contract/GetContractPoBuyer/').then(callback);
        },
        getRqImpProduct: function (callback) {
            $http.post('/Admin/Contract/GetRqImpProduct/').then(callback);
        },
        getObjectRelative: function (callback) {
            $http.get('/Admin/Contract/GetObjectRelative').then(callback);
        },

        insertContractPo: function (data, callback) {
            $http.post('/Admin/Contract/InsertContractPo/', data).then(callback);
        },
        updateContractPo: function (data, callback) {
            $http.post('/Admin/Contract/UpdateContractPo/', data).then(callback);
        },
        deleteContractPo: function (data, callback) {
            $http.post('/Admin/Contract/DeleteContractPo?id=' + data).then(callback);
        },

        //Request Import Product
        insertRequestImportProduct: function (data, callback) {
            $http.post('/Admin/Contract/InsertRequestImportProduct/', data).then(callback);
        },
        updateRequestImportProduct: function (data, callback) {
            $http.post('/Admin/Contract/UpdateRequestImportProduct/', data).then(callback);
        },
        deleteRequestImportProduct: function (data, callback) {
            $http.post('/Admin/Contract/DeleteRequestImportProduct?id=' + data).then(callback);
        },

        //Project
        insertContractProject: function (data, callback) {
            $http.post('/Admin/Contract/InsertContractProject/', data).then(callback);
        },
        updateContractProject: function (data, callback) {
            $http.post('/Admin/Contract/UpdateContractProject/', data).then(callback);
        },
        deleteContractProject: function (data, callback) {
            $http.post('/Admin/Contract/DeleteContractProject?id=' + data).then(callback);
        },

        //Schedule
        scheduleContractSales: function (data, data1, callback) {
            $http.post('/Admin/Contract/ScheduleContractSales?month=' + data + '&year=' + data1).then(callback);
        },

        assignToContract: function (data, callback) {
            $http.post('/Admin/Contract/AssignToContract', data).then(callback);
        },
        deleteAssignContract: function (data, callback) {
            $http.post('/Admin/Contract/DeleteAssignContract?id=' + data).then(callback);
        },
        getCountContract: function (callback) {
            $http.post('/Admin/Contract/GetCountContract').then(callback);
        },

        //Workfow
        getListRepeat: function (data, callback) {
            $http.post('/Admin/Contract/GetListRepeat?code=' + data).then(callback);
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
            $http.post('/Admin/Contract/GetItemHeaderWithCode?code=' + data).then(callback);
        },
        getActionStatus: function (data, callback) {
            $http.get('/Admin/Contract/GetActionStatus?code=' + data).then(callback);
        },
        getItemHeader: function (data, callback) {
            $http.post('/Admin/Contract/GetItemHeader?id=' + data).then(callback);
        },
        getListRepeat: function (data, callback) {
            $http.post('/Admin/Contract/GetListRepeat?code=' + data).then(callback);
        },
        getStepWorkFlow: function (data, callback) {
            $http.post('/Admin/Contract/GetStepWorkFlow?code=' + data).then(callback);
        },
        updateStatusWF: function (data, data1, data2, data3, callback) {
            $http.post('/Admin/WorkflowActivity/UpdateStatusWF?objType=' + data + '&objCode=' + data1 + '&status=' + data2 + '&actRepeat=' + data3).then(callback);
        },

        getCountNotify: function (callback) {
            $http.post('/Admin/NotifiManager/GetCountNotify/').then(callback);
        },

        //Print
        getProductInContract: function (data, callback) {
            $http.post('/Admin/Contract/GetProductInContract?contractCode=' + data).then(callback);
        },

        //Permission File
        getUserShareFilePermission: function (data, callback) {
            $http.post('/Admin/CardJob/GetUserShareFilePermission?id=' + data).then(callback);
        },
        insertFileShareContract: function (data, callback) {
            $http.post('/Admin/Contract/InsertFileShareContract', data).then(callback);
        },
        deleteShareFile: function (data, data1, callback) {
            $http.post('/Admin/CardJob/DeleteShareFile?id=' + data + '&userName=' + data1).then(callback);
        },
        autoShareFilePermission: function (data, callback) {
            $http.post('/Admin/Contract/AutoShareFilePermission', data).then(callback);
        },

        //Status
        getLogStatus: function (data, callback) {
            $http.post('/Admin/Contract/GetLogStatus?contractCode=' + data).then(callback);
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

app.controller('Ctrl_ESEIM_CONTRACT', function ($scope, $rootScope, $cookies, $translate, dataserviceContract, $filter) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        $rootScope.IsTranslate = true;
        caption = caption[culture] ? caption[culture] : caption;
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^đĐ!@#$%^&*<>?\s]*$/g;
            var partternTelephone = /[0-9]/g;
            var partternVersion = /^\d+(\.\d+)*$/g;
            var mess = { Status: false, Title: "" }
            //if (!partternCode.test(data.ContractCode)) {
            //    mess.Status = true;
            //    mess.Title = mess.Title.concat(" - ", caption.COM_VALIDATE_ITEM_CODE.replace("{0}", caption.CONTRACT_CURD_LBL_CONTRACT_CODE), "<br/>");//"Mã hợp đồng không chứa ký tự đặc biệt hoặc khoảng trắng!"
            //}
            if (!partternVersion.test(data.Version) && data.Version != null) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.CONTRACT_MSG_VERSION, "<br/>");//"Phiên bản phải là chữ số!"
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
        $rootScope.validationOptionsContractMenu = {
            rules: {
                ContractCode: {
                    required: true,
                    maxlength: 100,
                },
                Title: {
                    required: true,
                    maxlength: 1000,
                    regx: /^[^\s].*/
                },
                sEffectiveDate: {
                    required: true,
                },
                TaxAmount: {
                    required: true,
                },
                sEndDate: {
                    required: true,
                },
                ContactPhone: {
                    regx: /^(0)+([0-9]{9})\b$/
                },
                ContactEmail: {
                    regx: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
                },
                Duration: {
                    required: true,
                },
                ContractNo: {
                    required: true,
                    regx: /^[^\s].*/
                },
                Maintenance: {
                    required: true,
                },
                ContractDate: {
                    required: true,
                },
            },
            messages: {
                ContractCode: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_LBL_CONTRACT_CODE),//"Nhập mã hợp đồng",
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CONTRACT_CURD_LBL_CONTRACT_CODE).replace("{1}", "100"),//"Mã hợp đồng không vượt quá 100 kí tự!",
                },
                Title: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_LBL_CONTRACT_NAME),//"Nhập tên hợp đồng",
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CONTRACT_CURD_LBL_CONTRACT_CODE).replace("{1}", "1000"),//"Tên hợp đồng không vượt quá 255 kí tự!",
                    regx: "Tên hợp đồng không bắt đầu bằng khoảng trắng"
                },
                sEffectiveDate: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_LBL_START_DAY),
                },
                TaxAmount: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_LBL_PROJECT_TOTAL_TAX),
                },
                sEndDate: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_LBL_END_DAY),
                },
                ContactPhone: {
                    regx: caption.COM_MSG_INVALID_FORMAT.replace("{0}", caption.CONTRACT_CURD_LBL_CONTACT_PHONE),
                },
                ContactEmail: {
                    regx: caption.COM_MSG_INVALID_FORMAT.replace("{0}", caption.CONTRACT_CURD_LBL_CONTACT_EMAIL),
                },
                Duration: {
                    //required: "Thời gian thực hiện không được để trống!",
                    required: caption.CONTRACT_VALIDATE_TXT_CONTRACT_TIME,
                },
                ContractNo: {
                    //required: "Số hợp đồng không được để trống!",
                    required: caption.CONTRACT_VALIDATE_TXT_CONTRACT,
                    regx: "Số hợp đồng không bắt đầu bằng khoảng trắng"
                },
                Maintenance: {
                    //required: "Thời gian bảo hành không được để trống!",                
                    required: caption.CONTRACT_VALIDATE_TIME,
                },
                ContractDate: {
                    //required: "Ngày ký kết là bắt buộc!",
                    required: caption.CONTRACT_VALIDATE_TXT_CONTRACT_DATE,
                },
            }
        }

        //$rootScope.validationOptionsContractDetail = {
        //    rules: {
        //        ItemCode: {
        //            required: true,
        //            maxlength: 100,
        //        },
        //        ItemName: {
        //            required: true,
        //            maxlength: 255,
        //        },
        //        Quatity: {
        //            required: true,
        //            maxlength: 18,
        //        },
        //        Cost: {
        //            required: true,
        //            maxlength: 18,
        //        }
        //    },
        //    messages: {
        //        ItemCode: {
        //            required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_TAB_DETAIL_CURD_LBL_ITEM_CODE),//"Mã chi tiết yêu cầu bắt buộc!",
        //            maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CONTRACT_CURD_TAB_DETAIL_CURD_LBL_ITEM_CODE).replace("{1}", "100")//"Không vượt quá 100 kí tự"
        //        },
        //        ItemName: {
        //            required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_TAB_DETAIL_CURD_LBL_ITEM_NAME),//"Tên chi tiết yêu cầu bắt buộc!",
        //            maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CONTRACT_CURD_TAB_DETAIL_CURD_LBL_ITEM_NAME).replace("{1}", "255")//"Không vượt quá 255 kí tự"
        //        },
        //        Quatity: {
        //            required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_TAB_DETAIL_CURD_LBL_QUATITY),//"Số lượng yêu cầu bắt buộc!",
        //            maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CONTRACT_CURD_TAB_DETAIL_CURD_LBL_QUATITY).replace("{1}", "255")//"Số lượng không vượt quá 255 kí tự"
        //        },
        //        Cost: {
        //            required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_TAB_DETAIL_CURD_LBL_COST),//"Đơn giá yêu cầu bắt buộc!",
        //            maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CONTRACT_CURD_TAB_DETAIL_CURD_LBL_COST).replace("{1}", "18")//"Đơn giá hông vượt quá 18 kí tự"
        //        },
        //    }
        //}
        $rootScope.validationOptionsContractNote = {
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
        $rootScope.validationOptionsContractAttr = {
            rules: {
                AttrCode: {
                    required: true,
                    maxlength: 255,
                },
                AttrValue: {
                    required: true,
                    maxlength: 255,
                }
            },
            messages: {
                AttrCode: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_TAB_ATTRIBUTE_CURD_LBL_ATTR_CODE),//"Bắt buộc",
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CONTRACT_CURD_TAB_ATTRIBUTE_CURD_LBL_ATTR_CODE).replace("{1}", "255")//"Không vượt quá 255 kí tự"
                },
                AttrValue: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_TAB_ATTRIBUTE_CURD_LBL_ATTR_VALUE),//"Bắt buộc",
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CONTRACT_CURD_TAB_ATTRIBUTE_CURD_LBL_ATTR_VALUE).replace("{1}", "255")//"Không vượt quá 255 kí tự"
                }
            }
        }
        $rootScope.validationOptionsContractSchedulePay = {
            rules: {
                PayTimes: {
                    required: true,
                },
            },
            messages: {
                PayTimes: {
                    required: caption.CONTRACT_CURD_LBL_PAYMENT_TIMES_ARE_REQUIRED,
                },
            }
        }
        $rootScope.validationOptionsContractTabService = {
            rules: {
                //    Quantity: {
                //        required: true,
                //    }
                //},
                //messages: {
                //    Quantity: {
                //        required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_TAB_LOS_LBL_QUANTITY),
                //    }
            }
        }
        $rootScope.validationOptionsContractTabProduct = {
            rules: {
                Quantity: {
                    required: true,
                },
                UnitPrice: {
                    required: true,
                },
                Tax: {
                    required: true,
                },
            },
            messages: {
                Quantity: {
                    required: caption.CONTRACT_CURD_VALIDATE_QUANTITY_NO_BLANK,
                },
                UnitPrice: {
                    required: caption.CONTRACT_CURD_VALIDATE_PRICE_NO_BLANK,
                },
                Tax: {
                    required: caption.CONTRACT_CURD_VALIDATE_TAX_NO_BLANK,
                }
            }

        }
        $rootScope.validationOptionsContractFile = {
            rules: {
                FileName: {
                    required: true
                },

            },
            messages: {
                FileName: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_TAB_FILE_CURD_LBL_FILE_NAME),
                },

            }
        }
        //$rootScope.validationOptionsList = {
        //    rules: {
        //        ListName: {
        //            required: true
        //        },

        //    },
        //    messages: {
        //        ListName: {
        //            required: 'Tiêu đề yêu cầu bắt buộc',
        //        },
        //    }
        //}
        $rootScope.validationOptionsContractPayment = {
            rules: {
                Title: {
                    required: true,
                },
                Total: {
                    required: true,
                    regx: /[0-9]+(\,[0-9][0-9]?)?/
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
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_TAB_PAYMENT_CURD_LBL_TITLE),//"Tiêu đề yêu cầu bắt buộc",
                },
                Total: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_TAB_PAYMENT_CURD_LBL_TOTAL),//"Tiêu đề yêu cầu bắt buộc",
                    //regx: caption.COM_NOT_LESS_THAN_ZERO.replace("{0}", caption.CONTRACT_CURD_TAB_PAYMENT_CURD_LBL_TOTAL),
                    regx: caption.CONTRACT_VALIDATE_MONEY
                },
                DeadLine: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_TAB_PAYMENT_CURD_LBL_DEADLINE),//"Tiêu đề yêu cầu bắt buộc",
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
    dataserviceContract.getCustomers(function (rs) {
        rs = rs.data;
        $rootScope.Customers = rs;
        var all = {
            Code: '',
            Name: caption.COM_TXT_ALL,
            Role: '',
            Address: '',
            ZipCode: '',
            MobilePhone: '',
            PersonInCharge: '',
            Email: ''
        }
        $rootScope.Customers.unshift(all);
        $rootScope.MapCustomerRole = [];
        $rootScope.MapCustomer = [];
        for (var i = 0; i < rs.length; ++i) {
            $rootScope.MapCustomerRole[rs[i].Code] = rs[i].Role;
            $rootScope.MapCustomer[rs[i].Code] = rs[i].Role;
        }
    })
    dataserviceContract.getListCommon(function (rs) {
        rs = rs.data;
        $rootScope.ListCommon = rs;
        for (let i = 0; i < rs.length; i++) {
            if (rs[i].Group == "CONTRACT_TYPE") {
                $rootScope.ContractType = rs[i].Code;
                break;
            }
        }
    });
    dataserviceContract.getCurrency(function (rs) {
        rs = rs.data;
        $rootScope.currencyData = rs;
    });
    dataserviceContract.getStatusPOCus(function (rs) {
        rs = rs.data;
        $rootScope.status = rs;
        $rootScope.Status = rs.length != 0 ? rs[0].Code : '';
    });

    $rootScope.zoomMapDefault = 16;
    $rootScope.latDefault = 21.0277644;
    $rootScope.lngDefault = 105.83415979999995;
    $rootScope.addressDefault = 'Hanoi, Hoàn Kiếm, Hanoi, Vietnam';

    $rootScope.Budget = 0;
    $rootScope.TaxTotalDetail = 0;
    $rootScope.BudgetTotalDetail = 0;
    $rootScope.BudgetService = 0;
    $rootScope.BudgetProduct = 0;
    $rootScope.customerType = "";
    $rootScope.ContractCode = '';
    $rootScope.PoCode = '';
    $rootScope.CusCode = '';
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
        {
            Code: "APPROVED",
            Name: "Duyệt"
        },
        {
            Code: "REFUSE",
            Name: "Từ chối"
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
    $rootScope.CreatedTime = '';
    $rootScope.Object = {
        CustomerId: '',
        CardName: ''
    }
    $rootScope.ObjectTypeFile = "CONTRACT";
    $rootScope.moduleName = "CONTRACT";
    $rootScope.dtInstancePayment = {};
    //Convert string to Json object
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
            var arr = str.split('x');

            for (var i = 0; i < arr.length; i++) {
                arr[i] = arr[i].trim();
            }

            if (arr[0].split(' ')[0] !== undefined && arr[0].split(' ')[0] !== null)
                A.Key = arr[0].split(' ')[0];

            if (arr.length >= 2)
                if (arr[1].split(' ')[1] !== undefined && arr[1].split(' ')[1] !== null) {
                    B.Key = arr[1].split(' ')[1];
                    B.Value = arr[1].split(' ')[0];
                }
            if (arr.length >= 3)
                if (arr[2].split(' ')[1] !== undefined && arr[2].split(' ')[1] !== null) {
                    C.Key = arr[2].split(' ')[1];
                    C.Value = arr[2].split(' ')[0];
                }
            if (arr.length >= 4)
                if (arr[3].split(' ')[1] !== undefined && arr[3].split(' ')[1] !== null) {
                    D.Key = arr[3].split(' ')[1];
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
    $translateProvider.useUrlLoader('/Admin/contract/Translation');
    caption = $translateProvider.translations();

    $routeProvider
        .when('/', {
            templateUrl: ctxfolderContract + '/index.html',
            controller: 'contractindex'
        })
        .when('/add', {
            templateUrl: ctxfolderContract + '/add.html',
            controller: 'contractAdd'
        })
        .when('/edit', {
            templateUrl: ctxfolderContract + '/edit.html',
            controller: 'contractEdit'
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
    $httpProvider.interceptors.push('httpResponseInterceptor');
});

app.controller('contractindex', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceContract, $window, $filter, myService, $location) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        //Key: '',
        FromDate: '',
        ToDate: '',
        ContractCode: '',
        Status: '',
        BudgetF: '',
        BudgetT: '',
        Signer: '',
        Currency: '',
        BranchId: '',
        CusCode: ''
    }
    $scope.initData = function () {
        dataserviceContract.getBranch(function (rs) {
            rs = rs.data;
            $scope.listBranch = rs;
            var all = {
                Code: '',
                Name: caption.COM_TXT_ALL
            }
            $scope.listBranch.unshift(all);
        })
        dataserviceContract.getCountContract(function (rs) {
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
            url: "/Admin/Contract/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                //d.Key = $scope.model.Key;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
                d.ContractCode = $scope.model.ContractCode;
                d.Status = $scope.model.Status;
                d.BudgetF = $scope.model.BudgetF;
                d.BudgetT = $scope.model.BudgetT;
                d.CusCode = $scope.model.CusCode;
                d.Currency = $scope.model.Currency;
                d.BranchId = $scope.model.BranchId;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                    $scope.selected[data.id] = !$scope.selected[data.Id];
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.id] = false;
                    } else {
                        $('#tblDataContract').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.id] = true;
                    }
                }

                vm.selectAll = false;
                $scope.$apply();
            });
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {

                    var Id = data.id;
                    $scope.edit(Id);
                }
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("id").withTitle(titleHtml).notSortable().withOption('sClass', 'hidden').renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Code').withTitle('{{"CONTRACT_LIST_COL_CODE" | translate}}').withOption('sClass', 'hidden dataTable-pr0 w170').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('cusName').withTitle('{{"CONTRACT_CURD_COL_CUSNAME"|translate}}').withOption('sClass', 'w300').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('contractNo').withTitle('{{"CONTRACT_CURD_COL_CONTACT_NO"|translate}}').withOption('sClass', '').renderWith(function (data, type, full) {
        if (full.IsViewed == "False") {
            return '<span style = "font-weight: 700;">' + data + '</span>';
        } else {
            return data;
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('sEndDate').withTitle('{{"CONTRACT_CURD_COL_S_END_DATE"|translate}}').withOption('sClass', 'tcenter').renderWith(function (data, type) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('{{"CONTRACT_CURD_COL_NAME"|translate}}').withOption('sClass', '').renderWith(function (data, type, full) {
        if (full.IsViewed == "False") {
            return '<span style = "font-weight: 700;">' + data + '</span>';
        } else {
            return data;
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('budgetExcludeTax').withTitle('{{"CONTRACT_CURD_COL_BUDGET_EXCLUDE_TAX"|translate}}').withOption('sClass', 'tcenter ').renderWith(function (data, type) {
        var tax = data != "" ? $filter('currency')(data, '', 0) : null;
        return '<span class="text-danger bold">' + tax + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('currency').withTitle('{{"CONTRACT_LIST_COL_CURENCY" | translate}}').withOption('sClass', 'tcenter ').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Percent').withTitle('{{ "PROJECT_LIST_COL_PROGRESS" | translate }}').withOption('sClass', 'tcenter ').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('budgetExcludeTax').withTitle('{{"CONTRACT_CURD_COL_BUDGET_EXCLUDE_TAX_VND"|translate}}').withOption('sClass', 'tcenter ').renderWith(function (data, type, full) {
        if (data != "" && full.ExchangeRate != "") {
            var rs = data * full.ExchangeRate;
            var excludeTax = data != "" && full.ExchangeRate != "" ? $filter('currency')(rs, '', 0) : null;
            return '<span class ="text-danger bold">' + excludeTax + '</span>'
        }
        else {
            return null;
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('contractDate').withTitle('{{"CONTRACT_CURD_COL_CONTRACT_DATE"|translate}}').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data != null && data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('sEndDate').withTitle('{{"CONTRACT_CURD_COL_SEND_DATE"|translate}}').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data != null && data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('status').withTitle('{{"CONTRACT_TAB_WA_LIST_COL_STATUS"|translate}}').withOption('sClass', 'tcenter').renderWith(function (data, type, full) {
        return '<span class="' + full.icon + '"></span> ' + data;
    }));
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"CONTRACT_LIST_COL_CREATE_TIME"|translate}}').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data != null && data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withTitle('{{"CONTRACT_LIST_COL_ACTION" | translate}}').withOption('sClass', 'tcenter nowrap dataTable-w80').renderWith(function (data, type, full, meta) {
        return '<a title="Sửa" ng-click="edit(' + full.id + ')" class="fs25 pr10"><i class="fas fa-edit" style="--fa-primary-color: green;"></i></a>' +
            '<a title="Xoá" ng-click="delete(' + full.id + ')"  class="fs25"><i class="fas fa-trash" style="--fa-primary-color: red;"></i></a>';
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

    $scope.reload = function () {
        reloadData(true);
    };

    $rootScope.reloadMain = function () {
        $scope.reload();
    };

    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };

    $scope.search = function () {
        reloadData(true);
    };

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceContract.deleteContract(id, function (result) {
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

    //$scope.edit = function (id) {
    //    dataserviceContract.getItemContract(id, function (rs) {
    //        rs = rs.data;
    //        $rootScope.ContractCode = rs.Object.ContractCode;
    //        var modalInstance = $uibModal.open({
    //            animation: true,
    //            templateUrl: ctxfolderContract + '/edit.html',
    //            controller: 'contractEdit',
    //            backdrop: 'static',
    //            size: '70',
    //            resolve: {
    //                para: function () {
    //                    return id;
    //                }
    //            }
    //        });
    //        modalInstance.result.then(function (d) {
    //            $scope.reloadNoResetPage();
    //        }, function () { });
    //    });


    //};

    //$scope.add = function () {
    //    var modalInstance = $uibModal.open({
    //        animation: true,
    //        templateUrl: ctxfolderContract + '/add.html',
    //        controller: 'contractAdd',
    //        backdrop: 'static',
    //        size: '70'
    //    });
    //    modalInstance.result.then(function (d) {
    //        $scope.reload();
    //    }, function () { });
    //};

    $scope.add = function () {
        $location.path('/add');
    }

    $scope.edit = function (id) {
        dataserviceContract.getItemContract(id, function (rs) {
            rs = rs.data;
            $rootScope.ContractCode = rs.Object.ContractCode;
            $rootScope.ObjCode = rs.Object.ContractCode;

            myService.setData(data = id);
            $location.path('/edit');
        });
    }

    $scope.addCardJob = function () {
        var userModel = {};
        var editItems = [];
        for (var id in $scope.selected) {
            if ($scope.selected.hasOwnProperty(id)) {
                if ($scope.selected[id]) {
                    editItems.push(id);
                }
            }
        }
        if (editItems.length > 0) {
            if (editItems.length == 1) {
                var listdata = $('#tblDataContract').DataTable().data();
                for (var i = 0; i < listdata.length; i++) {
                    if (listdata[i].id == editItems[0]) {
                        userModel = listdata[i];
                        break;
                    }
                }
                var obj = {
                    Code: userModel.Code,
                    Name: userModel.Name,
                    TabBoard: 7
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
                App.toastrError(caption.CONTRACT_MSG_CHOOSE_CPNTRACT) // Vui lòng chọn hợp đồng!
            }
        } else {
            App.toastrError(caption.CONTRACT_MSG_CPNTRACT) //Không có hợp đông nào được chọn
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
            $scope.model.ToDate = "";
            $scope.model.FromDate = "";
        }

    }

    $scope.showSchedule = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderContract + '/scheduleContractSale.html',
            controller: 'schedule-contract-sale',
            backdrop: 'static',
            size: '70'
        });
        modalInstance.result.then(function (d) {
        }, function () {
            //$rootScope.reloadGridCard();
        });
    }

    setTimeout(function () {
        loadDate();
        //showHideSearch();
    }, 50);
    $rootScope.loadContract = function (resetPage) {
        reloadData(resetPage);
    }
});

app.controller('contractAdd', function ($scope, $rootScope, $compile, $uibModal, DTColumnBuilder, DTInstances, dataserviceContract, $filter) {
    $scope.model = {
        ContractCode: '',
        ContractType: '',
        //Status: 'CUS_REQUEST',
        MainService: '',
        Currency: 'VND',
        CusCode: '',
        PrjCode: '',
        sEffectiveDate: '',
        sEndDate: '',
        Duration: '',
        ExchangeRate: 1,
        Maintenance: 0,
        BudgetExcludeTax: 0,
        TaxAmount: 0,
        Budget: 0,
        Discount: 0,
        Commission: 0,
        Status: ''
    }
    $scope.ListProjects = [];
    $scope.modelViewHeader = {
        BudgetTotalInput: 0,
        TaxTotalDetail: 0,
        BudgetTotalDetail: 0,
        LastBudget: 0,
    };

    $scope.modelContact = {
        ContactId: null,
        ContactName: '',
        ContactPhone: '',
        ContactEmail: '',
        CusCode: ''
    }
    $scope.modelWf = {
        WorkflowCode: "",
        ObjectType: "CONTRACT",
        ObjectInst: "",
    };
    $scope.IsLoadProject = false;
    $rootScope.IsLoadProjectSave = false;
    $rootScope.ContractIdDelete = -1;
    $rootScope.Currency = 'VND';
    $scope.initData = function () {
        $rootScope.ContractCode = '';
        $scope.model.ContractType = $rootScope.ContractType;
        //$scope.model.Status = $rootScope.Status;
        dataserviceContract.getListProjectAdd('', function (rs) {
            rs = rs.data;
            $scope.ListProjects.push({ Code: '', Name: '-- Chọn --' });
            $scope.ListProjects = $scope.ListProjects.concat(rs);
        });
        dataserviceContract.getWorkFlow(function (result) {
            result = result.data;
            $rootScope.lstWorkflow = result;
        });
        dataserviceContract.getStatusAct(function (rs) {
            rs = rs.data;
            $scope.lstStatus = rs;
        })
        dataserviceContract.suggestWF($scope.modelWf.ObjectType, function (rs) {
            rs = rs.data;
            $scope.model.WorkflowCat = rs;
            setTimeout(function () {
                $rootScope.loadDiagramWF($scope.model.WorkflowCat);
            }, 400)
        })
    }
    $scope.initData();
    $scope.isInserted = false;
    $rootScope.customerType = "LE";
    $rootScope.Budget = 0;
    $rootScope.RealBudget = 0;
    $rootScope.ContractId = -1;
    $rootScope.ContractCode = "";
    $rootScope.ListService = [];
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
        $rootScope.reloadMain();
    };
    $scope.cancelFromProject = function () {
        dataserviceContract.deleteContract($rootScope.ContractIdDelete, function (result) {
            result = result.data;
            if (result.Error) {
                //App.toastrError(result.Title);
            } else {
                //App.toastrSuccess(result.Title);
                $uibModalInstance.close();
            }
        });
    };
    $scope.chkContract = function () {
        if ($rootScope.ContractCode == '') {
            App.toastrError(caption.CONTRACT_CURD_MSG_CREATE_CONTRACR);//Vui lòng tạo trước hợp đồng!
        }
    }
    $scope.loadProject = function (projectCode) {
        if (projectCode == '' || projectCode == null || projectCode == undefined) {
            App.toastrError(caption.CONTRACT_CURD_MSG_CREATE_CHOOSEPROJECT_BEFORE_DOWNLOADING);
            //App.toastrError('Chọn dự án trước khi tải.');
        }
        else {
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
                windowClass: "message-center",
                controller: function ($scope, $uibModalInstance) {
                    $scope.message = caption.CONTRACT_CURD_MSG_DO_YOU_WANT_TO_CREATE_CONTRACT_FROM_PROJECT;
                    $scope.ok = function () {

                        dataserviceContract.getInfoFromPrj(projectCode, function (rs) {
                            rs = rs.data;
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            } else {
                                App.toastrSuccess(rs.Title);
                                $uibModalInstance.close(rs.Object);
                            }
                        })


                    };
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: '25',
            });
            modalInstance.result.then(function (d) {

                $scope.model.ContractCode = d.ContractCode;
                $scope.model.CusCode = d.CusCode;
                $scope.model.EffectiveDate = d.EffectiveDate;
                $scope.model.EndDate = d.EndDate;
                $scope.model.Duration = d.Duration;
                $scope.model.BudgetExcludeTax = d.BudgetExcludeTax;
                $scope.model.Budget = d.Budget;
                $scope.model.RealBudget = d.RealBudget;
                $scope.model.LastBudget = d.LastBudget;

                $scope.modelViewHeader.TaxTotalDetail = $scope.model.RealBudget - $scope.model.Budget;
                $scope.modelViewHeader.BudgetTotalDetail = $scope.model.RealBudget;
                $scope.modelViewHeader.LastBudget = $scope.model.LastBudget;
                $scope.modelViewHeader.BudgetTotalInput = d.BudgetExcludeTax;
                $scope.model.sEffectiveDate = ($scope.model.EffectiveDate != null ? $filter('date')(new Date($scope.model.EffectiveDate), 'dd/MM/yyyy') : null);
                $scope.model.sEndDate = ($scope.model.EndDate != null ? $filter('date')(new Date($scope.model.EndDate), 'dd/MM/yyyy') : null);

                $scope.IsLoadProject = true;
                $rootScope.IsLoadProjectSave = true;
                $rootScope.ContractCode = d.ContractCode;
                $rootScope.ContractIdDelete = d.Id;
                $scope.model.ContractHeaderID = d.Id;

                $rootScope.reloadTabProduct();
                $rootScope.reloadTabService();


                var role = $rootScope.MapCustomerRole[$scope.model.CusCode];

                if (role != undefined) {
                    //đại lý
                    if (role == "CUSTOMER_AGENCY") {
                        $rootScope.customerType = "DAILY";
                    }
                    else {
                        $rootScope.customerType = "LE";
                    }
                    $rootScope.initPriceContract();
                }
                else {
                    $rootScope.customerType = "LE";
                }
                dataserviceContract.getService(function (rs) {
                    rs = rs.data;
                    //
                    if ($rootScope.customerType == "LE") {
                        for (var i = 0; i < rs.length; i++) {
                            if (rs[i].ServiceGroup == "DV_002") {
                                $rootScope.ListService.push(rs[i]);
                            }
                        }
                    }
                    else if ($rootScope.customerType == "DAILY") {
                        for (var i = 0; i < rs.length; i++) {
                            if (rs[i].ServiceGroup == "DV_001") {
                                $rootScope.ListService.push(rs[i]);
                            }
                        }
                    }

                    //$scope.services = rs;
                });

                $rootScope.ContractCode = '';
            }, function () {
            });
        }


    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "ContractType" && $scope.model.ContractType != "") {
            $scope.errorContractType = false;
        }
        if (SelectType == "Status" && $scope.model.Status != "") {
            $scope.errorStatus = false;
        }
        if (SelectType == "MainService" && $scope.model.MainService != "") {
            $scope.errorMainService = false;
        }
        if (SelectType == "Currency" && $scope.model.Currency != "") {
            $scope.errorCurrency = false;

            $rootScope.Currency = $scope.model.Currency;
            if ($scope.model.Currency == 'CURRENCY_VND') {
                $scope.model.ExchangeRate = 1;
            }
        }
        if (SelectType == "CusCode") {
            $scope.errorCusCode = false;
            var role = $rootScope.MapCustomerRole[$scope.model.CusCode];
            dataserviceContract.getContractCode(role, function (rs) {
                rs = rs.data;
                $scope.model.ContractCode = rs.Object;
            });
            dataserviceContract.getCustommerContactInfo($scope.model.CusCode, function (rs) {
                rs = rs.data;
                if (rs != null) {
                    $scope.modelContact.ContactId = rs.Id;
                    $scope.modelContact.ContactName = rs.ContactName;
                    $scope.modelContact.ContactPhone = rs.MobilePhone;
                    $scope.modelContact.ContactEmail = rs.Email;
                }
            });
        }
        if (SelectType == "PrjCode") {
            //$scope.errorPrjCode = false;
            //dataserviceContract.getCustomerFromPrj($scope.model.PrjCode, function (rs) {rs=rs.data;
            //    var getCustomerMain = rs.find(function (element) {
            //        if (element.IsMain == true) return true;
            //    });
            //    if (getCustomerMain) {
            //        $scope.model.CusCode = getCustomerMain.Code;
            //        $scope.errorCusCode = false;
            //    }

            //    var role = $rootScope.MapCustomerRole[$scope.model.CusCode];
            //    dataserviceContract.getContractCode(role, function (rs) {rs=rs.data;
            //        $scope.model.ContractCode = rs.Object;
            //    })
            //})
        }

        if (SelectType == "BudgetExcludeTax" && ($scope.model.BudgetExcludeTax != null && $scope.model.BudgetExcludeTax != undefined && $scope.model.BudgetExcludeTax < 0)) {
            $scope.errorBudgetExcludeTax = true;
        } else {
            $scope.errorBudgetExcludeTax = false;
            $scope.calculateBudget();
        }
        if (SelectType == "ExchangeRate" && ($scope.model.ExchangeRate == null || $scope.model.ExchangeRate == undefined || $scope.model.ExchangeRate <= 0)) {
            $scope.errorExchangeRate = true;
        } else {
            $scope.errorExchangeRate = false;
        }
        if (SelectType == "TaxAmount" && ($scope.model.TaxAmount != null && $scope.model.TaxAmount != undefined && $scope.model.TaxAmount < 0)) {
            $scope.errorTaxAmount = true;
        } else {
            $scope.errorTaxAmount = false;
            $scope.calculateBudget();
        }
        if (SelectType == "Discount" && ($scope.model.Discount != null && $scope.model.Discount != undefined && $scope.model.Discount < 0)) {
            $scope.errorDiscount = true;
        } else {
            $scope.errorDiscount = false;
            $scope.calculateLastBudget();
        }
        if (SelectType == "Commission" && ($scope.model.Commission != null && $scope.model.Commission != undefined && $scope.model.Commission < 0)) {
            $scope.errorCommission = true;
        } else {
            $scope.errorCommission = false;
            $scope.calculateLastBudget();
        }
    }
    $scope.calculateLastBudget = function () {
        if ($scope.model.Discount == null || $scope.model.Discount == undefined) {
            $scope.model.Discount = 0;
        }
        if ($scope.model.Commission == null || $scope.model.Commission == undefined) {
            $scope.model.Commission = 0;
        }
        $scope.modelViewHeader.LastBudget = $scope.modelViewHeader.BudgetTotalDetail * (1 - $scope.model.Discount / 100 - $scope.model.Commission / 100);
    }
    $scope.calculateBudget = function () {
        if ($scope.model.BudgetExcludeTax == null || $scope.model.BudgetExcludeTax == undefined) {
            $scope.model.BudgetExcludeTax = 0;
        }
        if ($scope.model.TaxAmount == null || $scope.model.TaxAmount == undefined) {
            $scope.model.TaxAmount = 0;
        }
        $scope.modelViewHeader.BudgetTotalInput = $scope.model.BudgetExcludeTax + $scope.model.TaxAmount;
    }
    $scope.submit = function () {
        if ($scope.model.Maintenance > 9999) {
            return App.toastrError("Vui lòng nhập thời gian bảo hành nhỏ hơn hoặc bằng 4 chữ số");
        }
        $scope.model.LastBudget = $scope.modelViewHeader.LastBudget;
        $scope.model.RealBudget = $scope.modelViewHeader.BudgetTotalDetail;
        var chkValidate = validationSelect($scope.model);
        if ($scope.addform.validate() && chkValidate.Status == false) {
            $rootScope.PoCode = $scope.model.ContractCode;
            $rootScope.CusCode = $scope.model.CusCode;
            var msg = $rootScope.checkData($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
            if ($rootScope.ContractCode == '') {
                //insert
                var modalInstance = $uibModal.open({
                    templateUrl: ctxfolderMessage + '/messageConfirmAdd.html',
                    resolve: {
                        para: function () {
                            return $scope.model;
                        }
                    },
                    controller: function ($scope, $uibModalInstance, para) {
                        $scope.message = caption.CONTRACT_VALIDATE_ADD_CONTRACT_CONFIRM;//"Bạn muốn thêm hợp đồng này ?";
                        $scope.ok = function () {
                            dataserviceContract.insertContract(para, function (result) {
                                result = result.data;
                                if (result.Error) {
                                    App.toastrError(result.Title);
                                } else {
                                    $rootScope.ObjCode = para.ContractCode;
                                    App.toastrSuccess(result.Title);
                                    $uibModalInstance.close(true);
                                    var role = $rootScope.MapCustomerRole[para.CusCode];

                                    if (role != undefined) {
                                        //đại lý
                                        if (role == "CUSTOMER_AGENCY") {
                                            $rootScope.customerType = "DAILY";
                                        }
                                        else {
                                            $rootScope.customerType = "LE";
                                        }
                                        //$rootScope.initPrice();
                                    }
                                    else {
                                        $rootScope.customerType = "LE";
                                    }
                                    dataserviceContract.getService(function (rs) {
                                        rs = rs.data;
                                        //
                                        if ($rootScope.customerType == "LE") {
                                            for (var i = 0; i < rs.length; i++) {
                                                if (rs[i].ServiceGroup == "DV_002") {
                                                    $rootScope.ListService.push(rs[i]);
                                                }
                                            }
                                        }
                                        else if ($rootScope.customerType == "DAILY") {
                                            for (var i = 0; i < rs.length; i++) {
                                                if (rs[i].ServiceGroup == "DV_001") {
                                                    $rootScope.ListService.push(rs[i]);
                                                }
                                            }
                                        }

                                        //$scope.services = rs;
                                    });

                                    //$rootScope.loadContract(true);
                                    $rootScope.ContractCode = para.ContractCode;
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
                    if (d == true) {
                        $scope.isInserted = true;
                    }
                    $rootScope.ContractCode = $scope.model.ContractCode;
                    $rootScope.ObjCode = $scope.model.ContractCode;
                    $rootScope.ContractName = $scope.model.Title;

                    $scope.modelContact.CusCode = $scope.model.CusCode;
                    dataserviceContract.updateCustommerContactInfo($scope.modelContact, function (result) {
                        result = result.data;
                    });
                    //Workflow
                    $scope.modelWf.ObjectInst = $scope.model.ContractCode;
                    $scope.modelWf.WorkflowCode = $scope.model.WorkflowCat;
                    $scope.modelWf.ObjectName = $scope.model.Title;
                    dataserviceContract.createWfInstance($scope.modelWf, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        }
                        else {
                            //App.toastrSuccess(rs.Title);
                            var wfInstCode = rs.Object.WfInstCode;
                            $scope.WfInstCode = wfInstCode;
                            $rootScope.loadDiagramWfInst($scope.model.ContractCode, $scope.modelWf.ObjectType);
                            dataserviceContract.getLogStatus($scope.model.ContractCode, function (rs) {
                                rs = rs.data;
                                try {
                                    var lstStatus = JSON.parse(rs.Status);
                                } catch (e) {
                                    console.log(e);
                                    lstStatus = [];
                                }
                                if (lstStatus.length > 0) {
                                    $scope.model.Status = lstStatus[lstStatus.length - 1].StatusCode;
                                    $scope.model.StatusDefault = lstStatus[lstStatus.length - 1].StatusCode;
                                    $scope.model.StatusTemp = lstStatus[lstStatus.length - 1].StatusCode;
                                    $scope.listStatusLog = lstStatus;
                                }
                            })
                        }
                    })

                }, function () {
                });
            } else {
                //update
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
                            dataserviceContract.updateContract(para, function (result) {
                                result = result.data;
                                if (result.Error) {
                                    App.toastrError(result.Title);
                                } else {
                                    App.toastrSuccess(result.Title);
                                    $uibModalInstance.close();
                                    //Workflow
                                    $scope.modelWf.ObjectInst = $scope.model.ContractCode;
                                    $scope.modelWf.WorkflowCode = $scope.model.WorkflowCat;
                                    dataserviceContract.createWfInstance($scope.modelWf, function (rs) {
                                        rs = rs.data;
                                        if (rs.Error) {
                                            App.toastrError(rs.Title);
                                        } else {
                                            //App.toastrSuccess(rs.Title);
                                            var wfInstCode = rs.Object.WfInstCode;
                                            $scope.WfInstCode = wfInstCode;
                                            dataserviceContract.insertInstRunning(wfInstCode, $scope.modelWf.WorkflowCode, function (rs) {

                                            })

                                            dataserviceContract.getItemHeaderWithCode($scope.model.ContractCode, function (rs) {
                                                data = rs.data;
                                                $scope.lstStep = data.list;
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
                                            })
                                        }
                                    })
                                    dataserviceContract.getActionStatus($scope.model.ContractCode, function (rs) {
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
                                    })
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
                    $scope.modelContact.CusCode = $scope.model.CusCode;
                    dataserviceContract.updateCustommerContactInfo($scope.modelContact, function (result) {
                        result = result.data;
                    });

                    $rootScope.loadDiagramWfInst($scope.model.ContractCode, $rootScope.modelWf.ObjectType);
                }, function () {

                });
            }
        }
    }
    $scope.submitFromProject = function () {
        $scope.model.Budget = $rootScope.Budget;
        $scope.model.RealBudget = $scope.modelViewHeader.BudgetTotalDetail;
        $scope.model.LastBudget = $scope.modelViewHeader.LastBudget;
        var chkValidate = validationSelect($scope.model);
        if ($scope.addform.validate() && chkValidate.Status == false) {
            $rootScope.PoCode = $scope.model.ContractCode;
            $rootScope.CusCode = $scope.model.CusCode;
            var msg = $rootScope.checkData($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
            $scope.model.IsLoadProject = true;
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmAdd.html',
                resolve: {
                    para: function () {
                        return $scope.model;
                    }
                },
                controller: function ($scope, $uibModalInstance, para) {
                    $scope.message = caption.CONTRACT_VALIDATE_ADD_CONTRACT_CONFIRM;//"Bạn muốn thêm hợp đồng này ?";
                    $scope.ok = function () {

                        dataserviceContract.updateContract(para, function (result) {
                            result = result.data;
                            if (result.Error) {
                                App.toastrError(result.Title.replace(caption.CONTRACT_CURD_MSG_UPDATE, caption.CONTRACT_CURD_MSG_ADD));
                            } else {

                                App.toastrSuccess(result.Title.replace(caption.CONTRACT_CURD_MSG_UPDATE, caption.CONTRACT_CURD_MSG_ADD));
                                $rootScope.IsLoadProjectSave = false;
                                $uibModalInstance.close(true);
                                var role = $rootScope.MapCustomerRole[para.CusCode];

                                if (role != undefined) {
                                    //đại lý
                                    if (role == "CUSTOMER_AGENCY") {
                                        $rootScope.customerType = "DAILY";
                                    }
                                    else {
                                        $rootScope.customerType = "LE";
                                    }
                                }
                                else {
                                    $rootScope.customerType = "LE";
                                }
                                dataserviceContract.getService(function (rs) {
                                    rs = rs.data;
                                    //
                                    if ($rootScope.customerType == "LE") {
                                        for (var i = 0; i < rs.length; i++) {
                                            if (rs[i].ServiceGroup == "DV_002") {
                                                $rootScope.ListService.push(rs[i]);
                                            }
                                        }
                                    }
                                    else if ($rootScope.customerType == "DAILY") {
                                        for (var i = 0; i < rs.length; i++) {
                                            if (rs[i].ServiceGroup == "DV_001") {
                                                $rootScope.ListService.push(rs[i]);
                                            }
                                        }
                                    }

                                    //$scope.services = rs;
                                });

                                $rootScope.loadContract(false);
                                $rootScope.ContractCode = para.ContractCode;
                                $rootScope.initPriceContract();
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
                if (d == true) {
                    $scope.isInserted = true;
                }
                $rootScope.ContractCode = $scope.model.ContractCode;

                $scope.modelContact.CusCode = $scope.model.CusCode;
                dataserviceContract.updateCustommerContactInfo($scope.modelContact, function (result) {
                    result = result.data;
                });
            }, function () {
            });
        }
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
                        Group: 'CONTRACT_STATUS_PO_CUS',
                        GroupNote: 'Trạng thái của hợp đồng',
                        AssetCode: 'CONTRACT'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceContract.getStatusPOCus(function (rs) {
                rs = rs.data;
                $rootScope.status = rs;
            });
            dataserviceContract.getListCommon(function (rs) {
                rs = rs.data;
                $rootScope.ListCommon = rs;
            });
        }, function () { });
    }
    $scope.addCommonSettingContractType = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'CONTRACT_TYPE',
                        GroupNote: 'Loại hợp đồng',
                        AssetCode: 'CONTRACT'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceContract.getListCommon(function (rs) {
                rs = rs.data;
                $rootScope.ListCommon = rs;
            });
        }, function () { });
    }
    $scope.activity = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderContract + '/activity.html',
            controller: 'activity',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return $scope.model.ContractCode;
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }
    $scope.openLog = function () {
        dataserviceContract.getUpdateLog($scope.model.ContractCode, function (rs) {
            rs = rs.data;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderContract + '/showLog.html',
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
    $scope.calculateEffectiveDate = function () {
        if ($scope.model.sEffectiveDate != "") {
            if ($scope.model.Duration != '') {
                $scope.model.sEndDate = addDays($scope.model.sEffectiveDate, $scope.model.Duration);
                $('#EndDate').datepicker('update', $scope.model.sEndDate);
            }
            else {
                if ($scope.model.sEndDate != '') {
                    var endDate = $scope.model.sEndDate.split("/");
                    var endDate1 = new Date(endDate[2], endDate[1] - 1, endDate[0]);
                    var effectiveDate = $scope.model.sEffectiveDate.split("/");
                    var effectiveDate1 = new Date(effectiveDate[2], effectiveDate[1] - 1, effectiveDate[0]);
                    if (endDate1 > effectiveDate1) {
                        var diffMs = (endDate1 - effectiveDate1);
                        var diffDay = Math.floor((diffMs / 86400000));
                        $scope.model.Duration = diffDay;
                        $('#Duration').val(diffDay);
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
        if ($scope.model.Duration != "") {
            if ($scope.model.sEffectiveDate != '') {
                $scope.model.sEndDate = addDays($scope.model.sEffectiveDate, $scope.model.Duration);
                $('#EndDate').datepicker('update', $scope.model.sEndDate);
            }
            else {
                if ($scope.model.sEndDate != '') {
                    $scope.model.sEffectiveDate = addDays($scope.model.sEndDate, -1 * $scope.model.Duration);
                    $('#EffectiveDate').datepicker('update', $scope.model.sEffectiveDate);
                }
            }
            resetValidateEndDate();
            resetValidateEffectiveDate();
        }
    }
    $scope.calculateEndDate = function () {
        if ($scope.model.sEndDate != "") {
            if ($scope.model.sEffectiveDate != '') {
                var endDate = $scope.model.sEndDate.split("/");
                var endDate1 = new Date(endDate[2], endDate[1] - 1, endDate[0]);
                var effectiveDate = $scope.model.sEffectiveDate.split("/");
                var effectiveDate1 = new Date(effectiveDate[2], effectiveDate[1] - 1, effectiveDate[0]);
                if (endDate1 > effectiveDate1) {
                    var diffMs = (endDate1 - effectiveDate1);
                    var diffDay = Math.floor((diffMs / 86400000));
                    $scope.model.Duration = diffDay;
                    $('#Duration').val(diffDay);
                    resetValidateDuration();
                }
                else {
                    App.toastrError(caption.CONTRACT_CURD_MSG_CHECK_DATE);
                }
            }
            else {
                if ($scope.model.Duration != '') {
                    $scope.model.sEffectiveDate = addDays($scope.model.sEndDate, -1 * $scope.model.Duration);
                    $('#EffectiveDate').datepicker('update', $scope.model.sEffectiveDate);
                }
            }
        }
        resetValidateEffectiveDate();
    }
    $scope.addProject = function () {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderContract + '/addProject.html',
            controller: 'addProjectMini',
            size: '60',
        });
        modalInstance.result.then(function (d) {
            dataserviceContract.getProjects(function (rs) {
                rs = rs.data;
                $scope.Projects = rs;
                $scope.ListProjects = rs;
            })
        }, function () {
            dataserviceContract.getProjects(function (rs) {
                rs = rs.data;
                $scope.Projects = rs;
                $scope.ListProjects = rs;
            })
        });
    }
    $scope.addCustomer = function () {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderCustomer + '/add.html',
            controller: 'addCustomer',
            size: '70',
        });
        modalInstance.result.then(function (d) {
            dataserviceContract.getCustomers(function (rs) {
                rs = rs.data;
                $rootScope.Customers = rs;
            })
        }, function () {
        });
    }

    $scope.changeWorkFlowInts = function (a) {
        dataserviceContract.getStepWorkFlow(a, function (rs) {
            data = rs.data;
            $scope.lstStep = data.list;
            setTimeout(function () {
                $('#progressbar li').css('width', 'calc(100%/' + data.list.length + ')');
            }, 10);
        })
    }
    $scope.changeStatus = function () {
        if ($scope.model.Status == "REPEAT_REQUIRE_REWORK" || $scope.model.Status == "FINAL_REQUIRE_REWORK") {
            dataserviceContract.getListRepeat($scope.model.ContractCode, function (rs) {
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
    };

    // view detail

    $scope.viewCmsDetail = function (item, bookMark) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderDashBoard + '/viewItem.html',
            controller: 'viewItemDashBoard',
            backdrop: 'static',
            windowClass: 'message-avoid-header',
            size: '65',
            resolve: {
                para: function () {
                    return {
                        data: item,
                        bookMark: bookMark
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    };

    function validationSelect(data) {

        var mess = { Status: false, Title: "" };

        if (data.ContractType == "" || data.ContractType == null || data.ContractType == undefined) {
            $scope.errorContractType = true;
            mess.Status = true;
        } else {
            $scope.errorContractType = false;

        }
        if (data.Currency == "" || data.Currency == null || data.Currency == undefined) {
            $scope.errorCurrency = true;
            mess.Status = true;
        } else {
            $scope.errorCurrency = false;
        }
        if (data.CusCode == "" || data.CusCode == null || data.CusCode == undefined) {
            $scope.errorCusCode = true;
            mess.Status = true;
        } else {
            $scope.errorCusCode = false;
        }

        if (data.BudgetExcludeTax != null && data.BudgetExcludeTax != undefined && data.BudgetExcludeTax < 0) {
            $scope.errorBudgetExcludeTax = true;
            mess.Status = true;
        } else {
            $scope.errorBudgetExcludeTax = false;
        }
        if (data.ExchangeRate == null || data.ExchangeRate == undefined || data.ExchangeRate <= 0) {
            $scope.errorExchangeRate = true;
            mess.Status = true;
        } else {
            $scope.errorExchangeRate = false;
        }
        if (data.TaxAmount != null && data.TaxAmount != undefined && data.TaxAmount < 0) {
            $scope.errorTaxAmount = true;
            mess.Status = true;
        } else {
            $scope.errorTaxAmount = false;
        }
        if (data.Discount != null && data.Discount != undefined && data.Discount < 0) {
            $scope.errorDiscount = true;
            mess.Status = true;
        } else {
            $scope.errorDiscount = false;
        }
        if (data.Commission != null && data.Commission != undefined && data.Commission < 0) {
            $scope.errorCommission = true;
            mess.Status = true;
        } else {
            $scope.errorCommission = false;
        }

        return mess;
    };
    function addDays(dt, n) {
        var ds = dt.split("/");
        var startDate = new Date(ds[2], ds[1] - 1, ds[0]);   // YYYY/MM/DD - months in Javascript are 0-11
        startDate.setTime(startDate.getTime() + (n * 24 * 60 * 60 * 1000));
        var futureDate = startDate.getDate() + "/" + (startDate.getMonth() + 1) + "/" + startDate.getFullYear();
        futureDate = futureDate.replace(/^(\d{1}\/)/, "0$1").replace(/(\d{2}\/)(\d{1}\/)/, "$10$2");
        return futureDate;
    }
    function loadDate() {
        $("#datefrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EffectiveDate').datepicker('setStartDate', maxDate);
            if ($('#datefrom input').valid()) {
                $('#datefrom input').removeClass('invalid').addClass('success');
            }
        });
        $("#acceptanceTime").datepicker({
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
            $('#datefrom').datepicker('setEndDate', maxDate);
            resetValidateEffectiveDate();
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#EndDate').datepicker('setStartDate', null);
            }
        });
        $("#EndDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EffectiveDate').datepicker('setEndDate', maxDate);
            resetValidateEndDate();
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#EffectiveDate').datepicker('setEndDate', null);
            }
        });
    }
    function resetValidateEndDate() {
        if ($('#EndDate input').valid()) {
            $('#EndDate input').removeClass('invalid').addClass('success');
        }
    }
    function resetValidateEffectiveDate() {
        if ($('#EffectiveDate input').valid()) {
            $('#EffectiveDate input').removeClass('invalid').addClass('success');
        }
    }
    function resetValidateDuration() {
        if ($('#Duration').valid()) {
            $('#Duration').removeClass('invalid').addClass('success');
        }
    }
    $rootScope.amountbudget = function (objInput) {
        $scope.model.Budget = objInput.Budget;
        $scope.modelViewHeader.BudgetTotalDetail = objInput.RealBudget;
        $scope.modelViewHeader.TaxTotalDetail = objInput.TaxDetail;
        $scope.modelViewHeader.LastBudget = objInput.LastBudget;
    }
    setTimeout(function () {
        loadDate();
        setModalDraggable('.modal-dialog');
    }, 200);

    $scope.impProduct = function () {
        dataserviceContract.chkExistRequestImp($rootScope.PoCode, function (rs) {
            rs = rs.data;
            if (rs == true) {
                App.toastrError(caption.CONTRACT_CURD_MSG_CONTRACT_ORDER_HAS_BEEN_CREATED_REQUEST_ORDER);
            }
            else {
                var check = false;
                dataserviceContract.getListPoProduct($rootScope.ContractCode, function (result) {
                    result = result.data;
                    $scope.listPo = result;
                    for (var i = 0; i < $scope.listPo.length; i++) {
                        if ($rootScope.PoCode == $scope.listPo[i].Code) {
                            check = true;
                            break;
                        }
                    }

                    if (check) {
                        var modalInstance = $uibModal.open({
                            animation: true,
                            templateUrl: ctxfolderImpProduct + '/addNoRelatative.html',
                            controller: 'addImpProduct',
                            backdrop: 'static',
                            size: '70',
                            resolve: {
                                para: function () {
                                    return $rootScope.PoCode;
                                }
                            }
                        });
                        modalInstance.result.then(function (d) {
                        }, function () { });
                    } else {
                        App.toastrError(caption.CONTRAT_CURD_MSG_THE_CONTRACT_EFFECTIVE_DATE);
                    };
                });
            }
        });
    }
    //Export Excel
    $scope.export = function () {
        //var orderBy = 'ProductCode ASC';
        //var exportType = 0;
        //var orderArr = $scope.dtInstance.DataTable.order();
        //var column;
        //if (orderArr.length == 2) {
        //    column = $scope.dtInstance.DataTable.init().aoColumns[orderArr[0]];
        //    orderBy = column.mData + ' ' + orderArr[1];
        //} else if (orderArr.length > 0) {
        //    var order = orderArr[0];
        //    column = $scope.dtInstance.DataTable.init().aoColumns[order[0]];
        //    orderBy = column.mData + ' ' + order[1];
        //}
        //var page = vm.dtInstance.DataTable.page() + 1;
        //var length = vm.dtInstance.DataTable.page.len();
        location.href = "/Admin/Contract/ExportExcelProduct?"
            + "contractCode=" + $scope.model.ContractCode
    }

    //Edit Activity Instance
    $scope.editInstAct = function (id, objCode) {
        dataserviceContract.checkPermissionEditActivityById(id, function (rs) {
            rs = rs.data;
            if (!rs) {
                return App.toastrError(caption.COM_MSG_PERMISSION_EDIT_ACT);
            }
            dataserviceContract.getItemActInst(id, function (rs) {
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
                    $rootScope.loadDiagramWfInst($scope.model.ContractCode, $scope.modelWf.ObjectType);
                    dataserviceContract.getLogStatus($scope.model.ContractCode, function (rs) {
                        rs = rs.data;
                        try {
                            var lstStatus = JSON.parse(rs.Status);
                        } catch (e) {
                            console.log(e);
                            lstStatus = [];
                        }
                        if (lstStatus.length > 0) {
                            $scope.model.Status = lstStatus[lstStatus.length - 1].StatusCode;
                            $scope.model.StatusDefault = lstStatus[lstStatus.length - 1].StatusCode;
                            $scope.model.StatusTemp = lstStatus[lstStatus.length - 1].StatusCode;
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

app.controller('contractEdit', function ($scope, $filter, $rootScope, $uibModal, $compile, dataserviceContract, myService, $location) {
    $rootScope.ListService = [];
    $scope.ListSupplier = [];
    $scope.ListProjects = [];
    $scope.modelViewHeader = {
        BudgetTotalInput: 0,
        TaxTotalDetail: 0,
        BudgetTotalDetail: 0,
        CusName: 0,
    };
    $scope.modelContact = {
        ContactId: null,
        ContactName: '',
        ContactPhone: '',
        ContactEmail: '',
        CusCode: ''
    }

    $rootScope.modelWf = {
        WorkflowCode: "",
        ObjectType: "CONTRACT",
        ObjectInst: "",
    };

    $scope.Appendix = false;
    $scope.checkAppendix = function () {

        if ($scope.Appendix == true) {
            var vers = parseInt($scope.model.Version) + 1;
            if (parseInt($scope.model.Version) == 0) {
                $scope.model.ContractCode = $scope.model.ContractCode + '_' + vers;
            } else {
                var idx = $scope.model.ContractCode.lastIndexOf("_");
                var baseCode = $scope.model.ContractCode.substring(0, idx);
                $scope.model.ContractCode = baseCode + '_' + vers;
            }
            $scope.model.Version = vers;
        } else {
            $scope.model.Version = parseInt($scope.model.Version) - 1;
            $scope.model.ContractCode = $rootScope.ContractCode;
        }
    };

    var para = myService.getData();

    if (para == undefined) {
        para = $location.search().id;
    }
    if (para == undefined || para <= 0) {
        location.href = "/Admin/Contract";
    }

    if (para != undefined) {
        $scope.initData = function () {
            updateNotify();
            dataserviceContract.getItemContract(para, function (rs) {
                debugger
                rs = rs.data;
                $scope.model = rs.Object;
                $rootScope.ContractCode = $scope.model.ContractCode;
                $rootScope.ContractName = $scope.model.Title;
                try {
                    var lstStatus = JSON.parse($scope.model.Status);
                } catch (e) {
                    console.log(e);
                    lstStatus = [];
                }
                if (lstStatus.length > 0) {
                    $scope.model.Status = lstStatus[lstStatus.length - 1].StatusCode;
                    $scope.model.StatusDefault = lstStatus[lstStatus.length - 1].StatusCode;
                    $scope.model.StatusTemp = lstStatus[lstStatus.length - 1].StatusCode;
                    $scope.listStatusLog = lstStatus;
                }
                $rootScope.PoCode = $scope.model.ContractCode;
                $rootScope.CusCode = $scope.model.CusCode;
                $rootScope.ObjCode = $scope.model.ContractCode;
                dataserviceContract.getCusName($scope.model.CusCode, function (rs) {
                    rs = rs.data;
                    $scope.modelViewHeader.CusName = rs;
                });
                $rootScope.Currency = $scope.model.Currency;
                dataserviceContract.getListSupString($scope.model.ContractCode, function (rs) {
                    rs = rs.data;
                    $scope.ListSupplier = rs.Object;
                });

                var role = $rootScope.MapCustomerRole[$scope.model.CusCode];
                if (role != undefined) {
                    //đại lý
                    if (role == "CUSTOMER_AGENCY") {
                        $rootScope.customerType = "DAILY";
                    }
                    else {
                        $rootScope.customerType = "LE";
                    }
                }
                else {
                    $rootScope.customerType = "LE";
                }
                dataserviceContract.getListProjectAdd($scope.model.PrjCode, function (rs) {
                    rs = rs.data;
                    $scope.ListProjects.push({ Code: '', Name: '-- Chọn --' });
                    $scope.ListProjects = $scope.ListProjects.concat(rs);
                });
                dataserviceContract.getCustommerContactInfo($scope.model.CusCode, function (rs) {
                    rs = rs.data;
                    if (rs != null) {
                        $scope.modelContact.ContactId = rs.Id;
                        $scope.modelContact.ContactName = rs.ContactName;
                        $scope.modelContact.ContactPhone = rs.MobilePhone;
                        $scope.modelContact.ContactEmail = rs.Email;
                    }
                });
                dataserviceContract.getService(function (rs) {
                    rs = rs.data;
                    if ($rootScope.customerType == "LE") {
                        for (var i = 0; i < rs.length; i++) {
                            if (rs[i].ServiceGroup == "DV_002") {
                                $rootScope.ListService.push(rs[i]);
                            }
                        }
                    }
                    else if ($rootScope.customerType == "DAILY") {
                        for (var i = 0; i < rs.length; i++) {
                            if (rs[i].ServiceGroup == "DV_001") {
                                $rootScope.ListService.push(rs[i]);
                            }
                        }
                    }
                });
                $scope.model.sEffectiveDate = ($scope.model.EffectiveDate != null ? $filter('date')(new Date($scope.model.EffectiveDate), 'dd/MM/yyyy') : "");
                $scope.model.sEndDate = ($scope.model.EndDate != null ? $filter('date')(new Date($scope.model.EndDate), 'dd/MM/yyyy') : "");
                $scope.model.ContractDate = ($scope.model.ContractDate != null ? $filter('date')(new Date($scope.model.ContractDate), 'dd/MM/yyyy') : "");
                $scope.model.AcceptanceTime = ($scope.model.AcceptanceTime != null ? $filter('date')(new Date($scope.model.AcceptanceTime), 'dd/MM/yyyy') : "");
                $scope.model.CreatedTime = convertDate($scope.model.CreatedTime);
                $scope.model.DeletedTime = convertDate($scope.model.DeletedTime);
                $scope.model.Duration = parseInt($scope.model.Duration);
                $scope.model.Maintenance = parseInt($scope.model.Maintenance);
                $rootScope.ContractId = $scope.model.ContractHeaderID;
                $rootScope.ContractCode = $scope.model.ContractCode;
                $rootScope.PoCode = $scope.model.ContractCode;
                $rootScope.CusCode = $scope.model.CusCode;
                $scope.modelViewHeader.BudgetTotalInput = $scope.model.BudgetExcludeTax + $scope.model.TaxAmount;
                $scope.modelViewHeader.TaxTotalDetail = $scope.model.RealBudget - $scope.model.Budget;
                $scope.modelViewHeader.BudgetTotalDetail = $scope.model.RealBudget;

                $scope.modelViewHeader.LastBudget = $scope.model.LastBudget;
                //$scope.model.ContractType = $rootScope.ContractType;
                //$scope.model.Status = $rootScope.Status;
                setTimeout(function () {
                    initDateTime();
                    validateDefaultDate($scope.model.ContractDate, $scope.model.sEffectiveDate, $scope.model.sEndDate);
                }, 100);
                dataserviceContract.getProductInContract($scope.model.ContractCode, function (rs) {
                    rs = rs.data;
                    $scope.lstProductDetail = rs;
                })

                setTimeout(function () {
                    $rootScope.loadDiagramWfInst($rootScope.ContractCode, $rootScope.modelWf.ObjectType);
                }, 800)
            })
            dataserviceContract.getWorkFlow(function (result) {
                result = result.data;
                $rootScope.lstWorkflow = result;
            });
            dataserviceContract.getStatusAct(function (rs) {
                rs = rs.data;
                $scope.lstStatus = rs;
            })
        }
        $scope.initData();
    }
    else {
        $location.path("/");
    }

    $scope.changeStatus = function () {
        $scope.model.StatusTemp = $scope.model.StatusDefault;

        //if ($scope.model.Status == "REPEAT_REQUIRE_REWORK" || $scope.model.Status == "FINAL_REQUIRE_REWORK") {
        //    dataserviceContract.getListRepeat($scope.model.ContractCode, function (rs) {
        //        rs = rs.data;
        //        var arr = [];
        //        if (rs.list != undefined && rs.list != null && rs.list != "") {
        //            for (var i = 0; i < rs.list.length; i++) {
        //                if (rs.list[i].IntsCode == rs.current) {
        //                    for (var j = 0; j < i; j++) {
        //                        arr.push(rs.list[j]);
        //                    }
        //                }
        //            }
        //            $scope.lstActRepeat = arr;
        //            $scope.showAct = true;
        //        }
        //    })
        //}
        //else {
        //    $scope.showAct = false;
        //}
    }

    $scope.cancel = function () {
        $rootScope.ContractCode = "";
        $uibModalInstance.close('cancel');
        //$rootScope.reloadMain();
    };
    $rootScope.cancelEdit = function () {
        $scope.cancel();
    };
    $scope.submit = function () {
        if ($scope.model.Maintenance > 9999) {
            return App.toastrError("Vui lòng nhập thời gian bảo hành nhỏ hơn hoặc bằng 4 chữ số");
        }
        $scope.model.LastBudget = $scope.modelViewHeader.LastBudget;
        $scope.model.RealBudget = $scope.modelViewHeader.BudgetTotalDetail;
        var chkValidate = validationSelect($scope.model);
        if ($scope.addform.validate() && chkValidate.Status == false) {
            var msg = $rootScope.checkData($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
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
                        dataserviceContract.updateContract(para, function (result) {
                            result = result.data;
                            if (result.Error) {
                                App.toastrError(result.Title);
                            } else {
                                App.toastrSuccess(result.Title);
                                $uibModalInstance.close();
                                $rootScope.loadContract(false);
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
                $scope.modelContact.CusCode = $scope.model.CusCode;
                dataserviceContract.updateCustommerContactInfo($scope.modelContact, function (result) {
                    result = result.data;
                });
            }, function () {

            });
        }
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "ContractType" && $scope.model.ContractType != "") {
            $scope.errorContractType = false;
        }
        if (SelectType == "Status" && $scope.model.Status != "") {
            $scope.errorStatus = false;
        }
        if (SelectType == "MainService" && $scope.model.MainService != "") {
            $scope.errorMainService = false;
        }
        if (SelectType == "Currency" && $scope.model.Currency != "") {
            $scope.errorCurrency = false;

            $rootScope.Currency = $scope.model.Currency;
            if ($scope.model.Currency == 'CURRENCY_VND') {
                $scope.model.ExchangeRate = 1;
            }
        }
        if (SelectType == "CusCode") {
            $scope.errorCusCode = false;
            //không cho đổi mã hợp đồng
            var role = $rootScope.MapCustomerRole[$scope.model.CusCode];
            dataserviceContract.getCustommerContactInfo($scope.model.CusCode, function (rs) {
                rs = rs.data;
                if (rs != null) {
                    $scope.modelContact.ContactId = rs.Id;
                    $scope.modelContact.ContactName = rs.ContactName;
                    $scope.modelContact.ContactPhone = rs.MobilePhone;
                    $scope.modelContact.ContactEmail = rs.Email;
                }
            });
            //dataserviceContract.getContractCode(role, function (rs) {rs=rs.data;
            //    $scope.model.ContractCode = rs.Object;
            //})
        }
        if (SelectType == "PrjCode") {
            //dataserviceContract.getCustomerFromPrj($scope.model.PrjCode, function (rs) {rs=rs.data;
            //    var getCustomerMain = rs.find(function (element) {
            //        if (element.IsMain == true) return true;
            //    });
            //    if (getCustomerMain) {
            //        $scope.model.CusCode = getCustomerMain.Code;
            //        $scope.errorCusCode = false;
            //    }
            //    var role = $rootScope.MapCustomerRole[$scope.model.CusCode];
            //     //không cho đổi mã hợp đồng
            //    //dataserviceContract.getContractCode(role, function (rs) {rs=rs.data;
            //    //    $scope.model.ContractCode = rs.Object;
            //    //})
            //})
        }
        if (SelectType == "BudgetExcludeTax" && ($scope.model.BudgetExcludeTax != null && $scope.model.BudgetExcludeTax != undefined && $scope.model.BudgetExcludeTax < 0)) {
            $scope.errorBudgetExcludeTax = true;
        } else {
            $scope.errorBudgetExcludeTax = false;
            $scope.calculateBudget();
        }
        if (SelectType == "ExchangeRate" && ($scope.model.ExchangeRate == null || $scope.model.ExchangeRate == undefined || $scope.model.ExchangeRate <= 0)) {
            $scope.errorExchangeRate = true;
        } else {
            $scope.errorExchangeRate = false;
        }
        if (SelectType == "TaxAmount" && ($scope.model.TaxAmount != null && $scope.model.TaxAmount != undefined && $scope.model.TaxAmount < 0)) {
            $scope.errorTaxAmount = true;
        } else {
            $scope.errorTaxAmount = false;
            $scope.calculateBudget();
        }
        if (SelectType == "Discount" && ($scope.model.Discount != null && $scope.model.Discount != undefined && $scope.model.Discount < 0)) {
            $scope.errorDiscount = true;
        } else {
            $scope.errorDiscount = false;
            $scope.calculateLastBudget();
        }
        if (SelectType == "Commission" && ($scope.model.Commission != null && $scope.model.Commission != undefined && $scope.model.Commission < 0)) {
            $scope.errorCommission = true;
        } else {
            $scope.errorCommission = false;
            $scope.calculateLastBudget();
        }
    }
    $scope.calculateLastBudget = function () {
        if ($scope.model.Discount == null || $scope.model.Discount == undefined) {
            $scope.model.Discount = 0;
        }
        if ($scope.model.Commission == null || $scope.model.Commission == undefined) {
            $scope.model.Commission = 0;
        }
        $scope.modelViewHeader.LastBudget = $scope.modelViewHeader.BudgetTotalDetail * (1 - $scope.model.Discount / 100 - $scope.model.Commission / 100);
    }
    $scope.calculateBudget = function () {
        if ($scope.model.BudgetExcludeTax == null || $scope.model.BudgetExcludeTax == undefined) {
            $scope.model.BudgetExcludeTax = 0;
        }
        if ($scope.model.TaxAmount == null || $scope.model.TaxAmount == undefined) {
            $scope.model.TaxAmount = 0;
        }
        $scope.modelViewHeader.BudgetTotalInput = $scope.model.BudgetExcludeTax + $scope.model.TaxAmount;
    }
    $scope.addCardJob = function () {
        var userModel = {};
        var listdata = $('#tblDataContract').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].id == para) {
                userModel = listdata[i];
                break;
            }
        }

        var obj = {
            Code: userModel.Code,
            Name: userModel.Name,
            TabBoard: 7
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
            //$scope.reload();
        }, function () { });
    };
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
                        Group: 'CONTRACT_STATUS_PO_CUS',
                        GroupNote: 'Trạng thái của hợp đồng',
                        AssetCode: 'CONTRACT'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceContract.getStatusPOCus(function (rs) {
                rs = rs.data;
                $rootScope.status = rs;
            });
            dataserviceContract.getListCommon(function (rs) {
                rs = rs.data;
                $rootScope.ListCommon = rs;
            });
        }, function () { });
    }
    $scope.addCommonSettingContractType = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'CONTRACT_TYPE',
                        GroupNote: 'Loại hợp đồng',
                        AssetCode: 'CONTRACT'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceContract.getListCommon(function (rs) {
                rs = rs.data;
                $rootScope.ListCommon = rs;
            });
        }, function () { });
    }
    $scope.activity = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderContract + '/activity.html',
            controller: 'activity',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return $scope.model.ContractCode;
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }
    $scope.openLog = function () {
        dataserviceContract.getUpdateLog($scope.model.ContractCode, function (rs) {
            rs = rs.data;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderContract + '/showLog.html',
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
                $scope.reload();
            }, function () { });
        });
    }
    $scope.showHistoryVersion = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderContract + '/historyVersion.html',
            controller: 'historyVersion',
            size: '70',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return $rootScope.ContractCode;
                }
            }
        });
        modalInstance.result.then(function (d) {
        }, function () {
        });
    }
    $scope.calculateEffectiveDate = function () {
        if ($scope.model.sEffectiveDate != "") {
            if ($scope.model.Duration != '') {
                $scope.model.sEndDate = addDays($scope.model.sEffectiveDate, $scope.model.Duration);
                $('#EndDate').datepicker('update', $scope.model.sEndDate);
            }
            else {
                if ($scope.model.sEndDate != '') {
                    var endDate = $scope.model.sEndDate.split("/");
                    var endDate1 = new Date(endDate[2], endDate[1] - 1, endDate[0]);
                    var effectiveDate = $scope.model.sEffectiveDate.split("/");
                    var effectiveDate1 = new Date(effectiveDate[2], effectiveDate[1] - 1, effectiveDate[0]);
                    if (endDate1 > effectiveDate1) {
                        var diffMs = (endDate1 - effectiveDate1);
                        var diffDay = Math.floor((diffMs / 86400000));
                        $scope.model.Duration = diffDay;
                        $('#Duration').val(diffDay);
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
        if ($scope.model.Duration != "") {
            if ($scope.model.sEffectiveDate != '') {
                $scope.model.sEndDate = addDays($scope.model.sEffectiveDate, $scope.model.Duration);
                $('#EndDate').datepicker('update', $scope.model.sEndDate);
            }
            else {
                if ($scope.model.sEndDate != '') {
                    $scope.model.sEffectiveDate = addDays($scope.model.sEndDate, -1 * $scope.model.Duration);
                    $('#EffectiveDate').datepicker('update', $scope.model.sEffectiveDate);
                }
            }
            resetValidateEndDate();
            resetValidateEffectiveDate();
        }
    }
    $scope.calculateEndDate = function () {
        if ($scope.model.sEndDate != "") {
            if ($scope.model.sEffectiveDate != '') {
                var endDate = $scope.model.sEndDate.split("/");
                var endDate1 = new Date(endDate[2], endDate[1] - 1, endDate[0]);
                var effectiveDate = $scope.model.sEffectiveDate.split("/");
                var effectiveDate1 = new Date(effectiveDate[2], effectiveDate[1] - 1, effectiveDate[0]);
                if (endDate1 > effectiveDate1) {
                    var diffMs = (endDate1 - effectiveDate1);
                    var diffDay = Math.floor((diffMs / 86400000));
                    $scope.model.Duration = diffDay;
                    $('#Duration').val(diffDay);
                    resetValidateDuration();
                }
                else {
                    App.toastrError(caption.CONTRACT_CURD_MSG_CHECK_DATE);
                }
            }
            else {
                if ($scope.model.Duration != '') {
                    $scope.model.sEffectiveDate = addDays($scope.model.sEndDate, -1 * $scope.model.Duration);
                    $('#EffectiveDate').datepicker('update', $scope.model.sEffectiveDate);
                }
            }
        }
    }
    $scope.addProject = function () {

        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderContract + '/addProject.html',
            controller: 'addProjectMini',
            size: '60',
        });
        modalInstance.result.then(function (d) {
            dataserviceContract.getProjects(function (rs) {
                rs = rs.data;
                $scope.Projects = rs;
                $scope.ListProjects = rs;
            })
        }, function () {
            dataserviceContract.getProjects(function (rs) {
                rs = rs.data;
                $scope.Projects = rs;
                $scope.ListProjects = rs;
            })
        });
    }
    $scope.addCustomer = function () {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderCustomer + '/add.html',
            controller: 'addCustomer',
            size: '70',
        });
        modalInstance.result.then(function (d) {
            dataserviceContract.getCustomers(function (rs) {
                rs = rs.data;
                $rootScope.Customers = rs;
            })
        }, function () {
        });
    }

    function convertDate(data) {
        var date = $filter('date')(new Date(data), 'dd/MM/yyyy');
        return date;
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.ContractType == "" || data.ContractType == null || data.ContractType == undefined) {
            $scope.errorContractType = true;
            mess.Status = true;
        } else {
            $scope.errorContractType = false;

        }
        if (data.Status == "" || data.Status == null || data.Status == undefined) {
            $scope.errorStatus = true;
            mess.Status = true;
        } else {
            $scope.errorStatus = false;

        }
        //if (data.MainService == "") {
        //    $scope.errorMainService = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorMainService = false;

        //}
        if (data.Currency == "" || data.Currency == null || data.Currency == undefined) {
            $scope.errorCurrency = true;
            mess.Status = true;
        } else {
            $scope.errorCurrency = false;
        }
        if (data.CusCode == "" || data.CusCode == null || data.CusCode == undefined) {
            $scope.errorCusCode = true;
            mess.Status = true;
        } else {
            $scope.errorCusCode = false;
        }
        //if (data.PrjCode == "" || data.PrjCode == null || data.PrjCode == undefined) {
        //    $scope.errorPrjCode = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorPrjCode = false;
        //}
        //if (data.sEndDate == "" || data.sEndDate == null || data.sEndDate == undefined) {
        //    $scope.errorsEndDate = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorsEndDate = false;
        //}
        if (data.BudgetExcludeTax != null && data.BudgetExcludeTax != undefined && data.BudgetExcludeTax < 0) {
            $scope.errorBudgetExcludeTax = true;
            mess.Status = true;
        } else {
            $scope.errorBudgetExcludeTax = false;
        }
        if (data.ExchangeRate == null || data.ExchangeRate == undefined || data.ExchangeRate <= 0) {
            $scope.errorExchangeRate = true;
            mess.Status = true;
        } else {
            $scope.errorExchangeRate = false;
        }
        if (data.TaxAmount != null && data.TaxAmount != undefined && data.TaxAmount < 0) {
            $scope.errorTaxAmount = true;
            mess.Status = true;
        } else {
            $scope.errorTaxAmount = false;
        }
        if (data.Discount != null && data.Discount != undefined && data.Discount < 0) {
            $scope.errorDiscount = true;
            mess.Status = true;
        } else {
            $scope.errorDiscount = false;
        }
        if (data.Commission != null && data.Commission != undefined && data.Commission < 0) {
            $scope.errorCommission = true;
            mess.Status = true;
        } else {
            $scope.errorCommission = false;
        }

        return mess;
    };
    function initDateTime() {
        $("#datefrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EffectiveDate').datepicker('setStartDate', maxDate);
            if ($('#datefrom input').valid()) {
                $('#datefrom input').removeClass('invalid').addClass('success');
            }
        });
        $("#acceptanceTime").datepicker({
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
            $('#datefrom').datepicker('setEndDate', maxDate);
            resetValidateEffectiveDate();
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#EndDate').datepicker('setStartDate', null);
            }
        });
        $("#EndDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EffectiveDate').datepicker('setEndDate', maxDate);
            resetValidateEndDate();
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#EffectiveDate').datepicker('setEndDate', null);
            }
        });
    }
    function addDays(dt, n) {
        var ds = dt.split("/");
        var startDate = new Date(ds[2], ds[1] - 1, ds[0]);   // YYYY/MM/DD - months in Javascript are 0-11
        startDate.setTime(startDate.getTime() + (n * 24 * 60 * 60 * 1000));
        var futureDate = startDate.getDate() + "/" + (startDate.getMonth() + 1) + "/" + startDate.getFullYear();
        futureDate = futureDate.replace(/^(\d{1}\/)/, "0$1").replace(/(\d{2}\/)(\d{1}\/)/, "$10$2");
        return futureDate;
    }
    function validateDefaultDate(datefrom, from, to) {
        setStartDate("#EndDate", from);
        setEndDate("#EffectiveDate", to);
        setStartDate("#EffectiveDate", datefrom);
        setEndDate("#datefrom", from);

    }
    function resetValidateEndDate() {
        if ($('#EndDate input').valid()) {
            $('#EndDate input').removeClass('invalid').addClass('success');
        }
    }
    function resetValidateEffectiveDate() {
        if ($('#EffectiveDate input').valid()) {
            $('#EffectiveDate input').removeClass('invalid').addClass('success');
        }
    }
    function resetValidateDuration() {
        if ($('#Duration').valid()) {
            $('#Duration').removeClass('invalid').addClass('success');
        }
    }
    setTimeout(function () {
        //initDateTime();
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 200);
    $rootScope.amountbudget = function (objInput) {
        $scope.model.Budget = objInput.Budget;
        $scope.modelViewHeader.BudgetTotalDetail = objInput.RealBudget;
        $scope.modelViewHeader.TaxTotalDetail = objInput.TaxDetail;
        $scope.modelViewHeader.LastBudget = objInput.LastBudget;
    }

    $scope.impProduct = function () {

        dataserviceContract.chkExistRequestImp($rootScope.PoCode, function (rs) {
            rs = rs.data;
            if (rs == true) {
                App.toastrError(caption.CONTRACT_CURD_MSG_CONTRACT_ORDER_HAS_BEEN_CREATED_REQUEST_ORDER);
            }
            else {
                var check = false;
                dataserviceContract.getListPoProduct($rootScope.ContractCode, function (result) {
                    result = result.data;
                    $scope.listPo = result;
                    for (var i = 0; i < $scope.listPo.length; i++) {
                        if ($rootScope.PoCode == $scope.listPo[i].Code) {
                            check = true;
                            break;
                        }
                    }

                    if (check) {
                        var modalInstance = $uibModal.open({
                            animation: true,
                            templateUrl: ctxfolderImpProduct + '/addNoRelatative.html',
                            controller: 'addImpProduct',
                            backdrop: 'static',
                            size: '70',
                            resolve: {
                                para: function () {
                                    return $rootScope.PoCode;
                                }
                            }
                        });
                        modalInstance.result.then(function (d) {
                        }, function () { });
                    } else {
                        App.toastrError(caption.CONTRAT_CURD_MSG_THIS_CONTRACT_ORDER_HAS_EXPIRED_OR_HAS_NO_PRODUCTS_TO_IMPORT);
                    };
                });
            }
        });
    }
    $scope.export = function () {
        location.href = "/Admin/Contract/ExportExcelProduct?"
            + "contractCode=" + $scope.model.ContractCode
    }

    //Show, hide header
    $scope.isShowHeader = true;
    $scope.showHeaderCard = function () {
        $scope.isShowHeader = true;
    }
    $scope.hideHeader = function () {
        $scope.isShowHeader = false;
    }
    function updateNotify() {
        dataserviceContract.getCountNotify(function (rs) {
            rs = rs.data;
            document.getElementById("contractSale").innerText = "Bạn có " + rs.CountContract + " hợp đồng bán.";
            document.getElementById("countAllNotifyNew").innerText = rs.All;
            document.getElementById("allNotifyNew").innerText = rs.All + " mới";
        })
    }
    //End show, hide header

    //Edit Activity Instance
    $scope.editInstAct = function (id, objCode) {
        dataserviceContract.checkPermissionEditActivityById(id, function (rs) {
            rs = rs.data;
            if (!rs) {
                return App.toastrError(caption.COM_MSG_PERMISSION_EDIT_ACT);
            }
            dataserviceContract.getItemActInst(id, function (rs) {
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
                    $rootScope.loadDiagramWfInst($scope.model.ContractCode, $scope.modelWf.ObjectType);
                    dataserviceContract.getLogStatus($scope.model.ContractCode, function (rs) {
                        rs = rs.data;
                        debugger
                        try {
                            var lstStatus = JSON.parse(rs.Status);
                        } catch (e) {
                            console.log(e);
                            lstStatus = [];
                        }
                        if (lstStatus.length > 0) {
                            $scope.model.Status = lstStatus[lstStatus.length - 1].StatusCode;
                            $scope.model.StatusDefault = lstStatus[lstStatus.length - 1].StatusCode;
                            $scope.model.StatusTemp = lstStatus[lstStatus.length - 1].StatusCode;
                            $scope.listStatusLog = lstStatus;
                        }
                    })
                }, function () {
                });
            })
        })
    }
    //End

    //Print
    $scope.print = function () {
        var department = '<table style="margin-left: auto; margin-right: auto; width: 100%; height: auto;">' +
            '<tbody>' +
            '<tr>' +
            '<td style="width: 259.258px; text-align: left;" colspan="2">' +
            '<p><strong>&nbsp;</strong></p>' +
            '<p><strong>Chi nhánh: ' + "" + '</strong></p>' +
            '</td>' +
            '</tr>' +
            '<tr>' +
            '<td style="width: 216.758px; text-align: left;">' +
            '<p><strong>Phòng ban: ' + "" + '</strong></p>' +
            '</td>' +
            '</tr>' +
            '</tbody>' +
            '</table>';

        //model.TimeTicketCreate
        var infoTime = $scope.model.sEffectiveDate.split("/");

        var header = '<table style="margin-left: auto; margin-right: auto;">' +
            '<tbody>' +
            '<tr>' +
            '<td width="198">' +
            '<p>&nbsp;</p>' +
            '</td>' +
            '<td width="250">' +
            '<p style="text-align: left;"><strong>HỢP ĐỒNG BÁN</strong></p>' +
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
            '<p style="text-align: left;">Số: <strong class="bold">' + $scope.model.ContractCode + '</strong></p>' +
            '</td>' +
            '<td width="167">' +
            '<p>Có .........................</p>' +
            '</td>' +
            '</tr>' +
            '</tbody>' +
            '</table>';

        //Info
        var cusName = "";
        for (var i = 0; i < $rootScope.Customers.length; i++) {
            if ($rootScope.Customers[i].Code === $scope.model.CusCode) {
                cusName = $rootScope.Customers[i].Name;
                break;
            }
        }

        var info = '<p style="text-align: center;">&nbsp;</p>' +
            '<p style="text-align: left;">&nbsp; - Tên hợp đồng: <strong>' + $scope.model.Title + '</strong></p>' +
            '<p style="text-align: left;">&nbsp; - Khách hàng: <strong>' + cusName + '</strong></p>' +
            '<p style="text-align: left;">&nbsp; - Ngày ký kết: <strong>' + $scope.model.ContractDate + '</strong></p>' +
            '<p style="text-align: left;">&nbsp; - Ngày hiệu lực: <strong>' + $scope.model.sEffectiveDate + '</strong></p>' +
            '<p style="text-align: left;">&nbsp; - Thời gian thực hiện: <strong>' + $scope.model.Duration + ' ngày</strong></p>' +
            '<p style="text-align: left;">&nbsp; - Mô tả: ' + $scope.model.Describe + '</p>';

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
            '<p>Thực tế</p>' +
            '</td>' +
            '</tr>';

        //$scope.lstProductDetail
        var detailProduct = "";
        var idx = 1;
        var total = 0;
        for (var i = 0; i < $scope.lstProductDetail.length; i++) {
            var salePrice = $scope.lstProductDetail[i].UnitPrice + '';
            var totalMoney = ($scope.lstProductDetail[i].UnitPrice * $scope.lstProductDetail[i].Quantity) + '';
            total += ($scope.lstProductDetail[i].UnitPrice * $scope.lstProductDetail[i].Quantity);
            detailProduct += '<tr>' +
                '<td style="width: 26.7578px; text-align: center;">' +
                '<p>' + idx + '</p>' +
                '</td>' +
                '<td style="width: 193.008px; text-align: center;">' +
                '<p>' + $scope.lstProductDetail[i].ProductCode + ';</p>' +
                '</td>' +
                '<td style="width: 40.5078px; text-align: center;">' +
                '<p> ' + $scope.lstProductDetail[i].ProductCode + ' </p>' +
                '</td>' +
                '<td style="width: 46.7578px; text-align: center;">' +
                '<p>' + $scope.lstProductDetail[i].sUnit + '</p >' +
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
    //end print
});

app.controller('detailHistory', function ($scope, $filter, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceContract, para) {
    $rootScope.ListService = [];
    $scope.ListSupplier = [];
    $scope.ListProjects = [];
    $scope.modelViewHeader = {
        BudgetTotalInput: 0,
        TaxTotalDetail: 0,
        BudgetTotalDetail: 0,
        CusName: 0,
    };
    $scope.modelContact = {
        ContactId: null,
        ContactName: '',
        ContactPhone: '',
        ContactEmail: '',
        CusCode: ''
    }
    $scope.Appendix = false;
    $scope.checkAppendix = function () {
        if ($scope.Appendix == true) {
            var vers = parseInt($scope.model.Version) + 1;
            if (parseInt($scope.model.Version) == 0) {
                $scope.model.ContractCode = $scope.model.ContractCode + '_' + vers;
            } else {
                var idx = $scope.model.ContractCode.lastIndexOf("_");
                var baseCode = $scope.model.ContractCode.substring(0, idx);
                $scope.model.ContractCode = baseCode + '_' + vers;
            }
            $scope.model.Version = vers;
        } else {
            $scope.model.Version = parseInt($scope.model.Version) - 1;
            $scope.model.ContractCode = $rootScope.ContractCode;
        }
    };
    $scope.initData = function () {
        //dataserviceContract.getItemHistoryVersion(para, function (rsHist) {
        //    if (rsHist.Error) {
        //        App.toastrError(rsHist.Title);
        //    }
        //    else {
        //$scope.model = rsHist.Object;
        $scope.model = para;
        $rootScope.ContractCode = $scope.model.ContractCode;

        dataserviceContract.getCusName($scope.model.CusCode, function (rs) {
            rs = rs.data;
            $scope.modelViewHeader.CusName = rs;
        });
        $rootScope.Currency = $scope.model.Currency;
        dataserviceContract.getListSupString($scope.model.ContractCode, function (rs) {
            rs = rs.data;
            $scope.ListSupplier = rs.Object;
        });

        var role = $rootScope.MapCustomerRole[$scope.model.CusCode];
        if (role != undefined) {
            //đại lý
            if (role == "CUSTOMER_AGENCY") {
                $rootScope.customerType = "DAILY";
            }
            else {
                $rootScope.customerType = "LE";
            }
        }
        else {
            $rootScope.customerType = "LE";
        }
        dataserviceContract.getListProjectAdd($scope.model.PrjCode, function (rs) {
            rs = rs.data;
            $scope.ListProjects.push({ Code: '', Name: '-- Chọn --' });
            $scope.ListProjects = $scope.ListProjects.concat(rs);
        });
        dataserviceContract.getCustommerContactInfo($scope.model.CusCode, function (rs) {
            rs = rs.data;
            if (rs != null) {
                $scope.modelContact.ContactId = rs.Id;
                $scope.modelContact.ContactName = rs.ContactName;
                $scope.modelContact.ContactPhone = rs.MobilePhone;
                $scope.modelContact.ContactEmail = rs.Email;
            }
        });
        dataserviceContract.getService(function (rs) {
            rs = rs.data;
            //
            if ($rootScope.customerType == "LE") {
                for (var i = 0; i < rs.length; i++) {
                    if (rs[i].ServiceGroup == "DV_002") {
                        $rootScope.ListService.push(rs[i]);
                    }
                }
            }
            else if ($rootScope.customerType == "DAILY") {
                for (var i = 0; i < rs.length; i++) {
                    if (rs[i].ServiceGroup == "DV_001") {
                        $rootScope.ListService.push(rs[i]);
                    }
                }
            }

            //$scope.services = rs;
        });
        $scope.model.sEffectiveDate = ($scope.model.EffectiveDate != null ? $filter('date')(new Date($scope.model.EffectiveDate), 'dd/MM/yyyy') : "");
        $scope.model.sEndDate = ($scope.model.EndDate != null ? $filter('date')(new Date($scope.model.EndDate), 'dd/MM/yyyy') : "");
        $scope.model.ContractDate = ($scope.model.ContractDate != null ? $filter('date')(new Date($scope.model.ContractDate), 'dd/MM/yyyy') : "");
        $scope.model.AcceptanceTime = ($scope.model.AcceptanceTime != null ? $filter('date')(new Date($scope.model.AcceptanceTime), 'dd/MM/yyyy') : "");
        $scope.model.CreatedTime = convertDate($scope.model.CreatedTime);
        $scope.model.DeletedTime = convertDate($scope.model.DeletedTime);
        $scope.model.Duration = parseInt($scope.model.Duration);
        $scope.model.Maintenance = parseInt($scope.model.Maintenance);
        $rootScope.ContractId = $scope.model.ContractHeaderID;
        $rootScope.ContractCode = $scope.model.ContractCode;
        $rootScope.PoCode = $scope.model.ContractCode;
        $rootScope.CusCode = $scope.model.CusCode;
        $scope.modelViewHeader.BudgetTotalInput = $scope.model.BudgetExcludeTax + $scope.model.TaxAmount;
        $scope.modelViewHeader.TaxTotalDetail = $scope.model.RealBudget - $scope.model.Budget;
        $scope.modelViewHeader.BudgetTotalDetail = $scope.model.RealBudget;

        $scope.modelViewHeader.LastBudget = $scope.model.LastBudget;
        //$scope.model.ContractType = $rootScope.ContractType;
        //$scope.model.Status = $rootScope.Status;
        setTimeout(function () {
            initDateTime();
            validateDefaultDate($scope.model.ContractDate, $scope.model.sEffectiveDate, $scope.model.sEndDate);
        }, 100);
        //}
        //})
    };
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
        //$rootScope.reloadMain();
    };
    $scope.submit = function () {

        $scope.model.LastBudget = $scope.modelViewHeader.LastBudget;
        $scope.model.RealBudget = $scope.modelViewHeader.BudgetTotalDetail;
        validationSelect($scope.model);
        if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
            var msg = $rootScope.checkData($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
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
                        dataserviceContract.updateContract(para, function (result) {
                            result = result.data;
                            if (result.Error) {
                                App.toastrError(result.Title);
                            } else {
                                App.toastrSuccess(result.Title);
                                $uibModalInstance.close();
                                $rootScope.loadContract(false);
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
                $scope.modelContact.CusCode = $scope.model.CusCode;
                dataserviceContract.updateCustommerContactInfo($scope.modelContact, function (result) {
                    result = result.data;
                });
            }, function () {

            });
        }
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "ContractType" && $scope.model.ContractType != "") {
            $scope.errorContractType = false;
        }
        if (SelectType == "Status" && $scope.model.Status != "") {
            $scope.errorStatus = false;
        }
        if (SelectType == "MainService" && $scope.model.MainService != "") {
            $scope.errorMainService = false;
        }
        if (SelectType == "Currency" && $scope.model.Currency != "") {
            $scope.errorCurrency = false;

            $rootScope.Currency = $scope.model.Currency;
            if ($scope.model.Currency == 'CURRENCY_VND') {
                $scope.model.ExchangeRate = 1;
            }
        }
        if (SelectType == "CusCode") {
            $scope.errorCusCode = false;
            //không cho đổi mã hợp đồng
            var role = $rootScope.MapCustomerRole[$scope.model.CusCode];
            dataserviceContract.getCustommerContactInfo($scope.model.CusCode, function (rs) {
                rs = rs.data;
                if (rs != null) {
                    $scope.modelContact.ContactId = rs.Id;
                    $scope.modelContact.ContactName = rs.ContactName;
                    $scope.modelContact.ContactPhone = rs.MobilePhone;
                    $scope.modelContact.ContactEmail = rs.Email;
                }
            });
            //dataserviceContract.getContractCode(role, function (rs) {rs=rs.data;
            //    $scope.model.ContractCode = rs.Object;
            //})
        }
        if (SelectType == "PrjCode") {
            //dataserviceContract.getCustomerFromPrj($scope.model.PrjCode, function (rs) {rs=rs.data;
            //    var getCustomerMain = rs.find(function (element) {
            //        if (element.IsMain == true) return true;
            //    });
            //    if (getCustomerMain) {
            //        $scope.model.CusCode = getCustomerMain.Code;
            //        $scope.errorCusCode = false;
            //    }
            //    var role = $rootScope.MapCustomerRole[$scope.model.CusCode];
            //     //không cho đổi mã hợp đồng
            //    //dataserviceContract.getContractCode(role, function (rs) {rs=rs.data;
            //    //    $scope.model.ContractCode = rs.Object;
            //    //})
            //})
        }
        if (SelectType == "BudgetExcludeTax" && ($scope.model.BudgetExcludeTax != null && $scope.model.BudgetExcludeTax != undefined && $scope.model.BudgetExcludeTax < 0)) {
            $scope.errorBudgetExcludeTax = true;
        } else {
            $scope.errorBudgetExcludeTax = false;
            $scope.calculateBudget();
        }
        if (SelectType == "ExchangeRate" && ($scope.model.ExchangeRate == null || $scope.model.ExchangeRate == undefined || $scope.model.ExchangeRate <= 0)) {
            $scope.errorExchangeRate = true;
        } else {
            $scope.errorExchangeRate = false;
        }
        if (SelectType == "TaxAmount" && ($scope.model.TaxAmount != null && $scope.model.TaxAmount != undefined && $scope.model.TaxAmount < 0)) {
            $scope.errorTaxAmount = true;
        } else {
            $scope.errorTaxAmount = false;
            $scope.calculateBudget();
        }
        if (SelectType == "Discount" && ($scope.model.Discount != null && $scope.model.Discount != undefined && $scope.model.Discount < 0)) {
            $scope.errorDiscount = true;
        } else {
            $scope.errorDiscount = false;
            $scope.calculateLastBudget();
        }
        if (SelectType == "Commission" && ($scope.model.Commission != null && $scope.model.Commission != undefined && $scope.model.Commission < 0)) {
            $scope.errorCommission = true;
        } else {
            $scope.errorCommission = false;
            $scope.calculateLastBudget();
        }
    }
    $scope.calculateLastBudget = function () {
        if ($scope.model.Discount == null || $scope.model.Discount == undefined) {
            $scope.model.Discount = 0;
        }
        if ($scope.model.Commission == null || $scope.model.Commission == undefined) {
            $scope.model.Commission = 0;
        }
        $scope.modelViewHeader.LastBudget = $scope.modelViewHeader.BudgetTotalDetail * (1 - $scope.model.Discount / 100 - $scope.model.Commission / 100);
    }
    $scope.calculateBudget = function () {
        if ($scope.model.BudgetExcludeTax == null || $scope.model.BudgetExcludeTax == undefined) {
            $scope.model.BudgetExcludeTax = 0;
        }
        if ($scope.model.TaxAmount == null || $scope.model.TaxAmount == undefined) {
            $scope.model.TaxAmount = 0;
        }
        $scope.modelViewHeader.BudgetTotalInput = $scope.model.BudgetExcludeTax + $scope.model.TaxAmount;
    }
    $scope.addCardJob = function () {
        var userModel = {};
        var listdata = $('#tblDataContract').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].id == para.ContractHeaderID) {
                userModel = listdata[i];
                break;
            }
        }
        var obj = {
            Code: userModel.Code,
            Name: userModel.Name,
            TabBoard: 7
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
            //$scope.reload();
        }, function () { });
    };
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
                        Group: 'CONTRACT_STATUS_PO_CUS',
                        GroupNote: 'Trạng thái của hợp đồng',
                        AssetCode: 'CONTRACT'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceContract.getStatusPOCus(function (rs) {
                rs = rs.data;
                $rootScope.status = rs;
            });
            dataserviceContract.getListCommon(function (rs) {
                rs = rs.data;
                $rootScope.ListCommon = rs;
            });
        }, function () { });
    }
    $scope.addCommonSettingContractType = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'CONTRACT_TYPE',
                        GroupNote: 'Loại hợp đồng',
                        AssetCode: 'CONTRACT'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceContract.getListCommon(function (rs) {
                rs = rs.data;
                $rootScope.ListCommon = rs;
            });
        }, function () { });
    }
    $scope.activity = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderContract + '/activity.html',
            controller: 'activity',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return $scope.model.ContractCode;
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }
    $scope.openLog = function () {
        dataserviceContract.getUpdateLog($scope.model.ContractCode, function (rs) {
            rs = rs.data;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderContract + '/showLog.html',
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
                $scope.reload();
            }, function () { });
        });
    }
    $scope.showHistoryVersion = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderContract + '/historyVersion.html',
            controller: 'historyVersion',
            size: '70',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return $rootScope.ContractCode;
                }
            }
        });
        modalInstance.result.then(function (d) {
        }, function () {
        });
    }
    $scope.calculateEffectiveDate = function () {
        if ($scope.model.sEffectiveDate != "") {
            if ($scope.model.Duration != '') {
                $scope.model.sEndDate = addDays($scope.model.sEffectiveDate, $scope.model.Duration);
                $('#EndDate').datepicker('update', $scope.model.sEndDate);
            }
            else {
                if ($scope.model.sEndDate != '') {
                    var endDate = $scope.model.sEndDate.split("/");
                    var endDate1 = new Date(endDate[2], endDate[1] - 1, endDate[0]);
                    var effectiveDate = $scope.model.sEffectiveDate.split("/");
                    var effectiveDate1 = new Date(effectiveDate[2], effectiveDate[1] - 1, effectiveDate[0]);
                    if (endDate1 > effectiveDate1) {
                        var diffMs = (endDate1 - effectiveDate1);
                        var diffDay = Math.floor((diffMs / 86400000));
                        $scope.model.Duration = diffDay;
                        $('#Duration').val(diffDay);
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
        if ($scope.model.Duration != "") {
            if ($scope.model.sEffectiveDate != '') {
                $scope.model.sEndDate = addDays($scope.model.sEffectiveDate, $scope.model.Duration);
                $('#EndDate').datepicker('update', $scope.model.sEndDate);
            }
            else {
                if ($scope.model.sEndDate != '') {
                    $scope.model.sEffectiveDate = addDays($scope.model.sEndDate, -1 * $scope.model.Duration);
                    $('#EffectiveDate').datepicker('update', $scope.model.sEffectiveDate);
                }
            }
            resetValidateEndDate();
            resetValidateEffectiveDate();
        }
    }
    $scope.calculateEndDate = function () {
        if ($scope.model.sEndDate != "") {
            if ($scope.model.sEffectiveDate != '') {
                var endDate = $scope.model.sEndDate.split("/");
                var endDate1 = new Date(endDate[2], endDate[1] - 1, endDate[0]);
                var effectiveDate = $scope.model.sEffectiveDate.split("/");
                var effectiveDate1 = new Date(effectiveDate[2], effectiveDate[1] - 1, effectiveDate[0]);
                if (endDate1 > effectiveDate1) {
                    var diffMs = (endDate1 - effectiveDate1);
                    var diffDay = Math.floor((diffMs / 86400000));
                    $scope.model.Duration = diffDay;
                    $('#Duration').val(diffDay);
                    resetValidateDuration();
                }
                else {
                    App.toastrError(caption.CONTRACT_CURD_MSG_CHECK_DATE);
                }
            }
            else {
                if ($scope.model.Duration != '') {
                    $scope.model.sEffectiveDate = addDays($scope.model.sEndDate, -1 * $scope.model.Duration);
                    $('#EffectiveDate').datepicker('update', $scope.model.sEffectiveDate);
                }
            }
        }
    }
    $scope.addProject = function () {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderContract + '/addProject.html',
            controller: 'addProjectMini',
            size: '60',
        });
        modalInstance.result.then(function (d) {
            dataserviceContract.getProjects(function (rs) {
                rs = rs.data;
                $scope.Projects = rs;
            })
        }, function () {
            dataserviceContract.getProjects(function (rs) {
                rs = rs.data;
                $scope.Projects = rs;
            })
        });
    }
    $scope.addCustomer = function () {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderCustomer + '/add.html',
            controller: 'addCustomer',
            size: '70',
        });
        modalInstance.result.then(function (d) {
            dataserviceContract.getCustomers(function (rs) {
                rs = rs.data;
                $rootScope.Customers = rs;
            })
        }, function () {
        });
    }

    function convertDate(data) {
        var date = $filter('date')(new Date(data), 'dd/MM/yyyy');
        return date;
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.ContractType == "" || data.ContractType == null || data.ContractType == undefined) {
            $scope.errorContractType = true;
            mess.Status = true;
        } else {
            $scope.errorContractType = false;

        }
        if (data.Status == "" || data.Status == null || data.Status == undefined) {
            $scope.errorStatus = true;
            mess.Status = true;
        } else {
            $scope.errorStatus = false;

        }
        //if (data.MainService == "") {
        //    $scope.errorMainService = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorMainService = false;

        //}
        if (data.Currency == "" || data.Currency == null || data.Currency == undefined) {
            $scope.errorCurrency = true;
            mess.Status = true;
        } else {
            $scope.errorCurrency = false;
        }
        if (data.CusCode == "" || data.CusCode == null || data.CusCode == undefined) {
            $scope.errorCusCode = true;
            mess.Status = true;
        } else {
            $scope.errorCusCode = false;
        }
        //if (data.PrjCode == "" || data.PrjCode == null || data.PrjCode == undefined) {
        //    $scope.errorPrjCode = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorPrjCode = false;
        //}
        //if (data.sEndDate == "" || data.sEndDate == null || data.sEndDate == undefined) {
        //    $scope.errorsEndDate = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorsEndDate = false;
        //}
        if (data.BudgetExcludeTax != null && data.BudgetExcludeTax != undefined && data.BudgetExcludeTax < 0) {
            $scope.errorBudgetExcludeTax = true;
            mess.Status = true;
        } else {
            $scope.errorBudgetExcludeTax = false;
        }
        if (data.ExchangeRate == null || data.ExchangeRate == undefined || data.ExchangeRate <= 0) {
            $scope.errorExchangeRate = true;
            mess.Status = true;
        } else {
            $scope.errorExchangeRate = false;
        }
        if (data.TaxAmount != null && data.TaxAmount != undefined && data.TaxAmount < 0) {
            $scope.errorTaxAmount = true;
            mess.Status = true;
        } else {
            $scope.errorTaxAmount = false;
        }
        if (data.Discount != null && data.Discount != undefined && data.Discount < 0) {
            $scope.errorDiscount = true;
            mess.Status = true;
        } else {
            $scope.errorDiscount = false;
        }
        if (data.Commission != null && data.Commission != undefined && data.Commission < 0) {
            $scope.errorCommission = true;
            mess.Status = true;
        } else {
            $scope.errorCommission = false;
        }

        return mess;
    };
    function initDateTime() {
        $("#datefrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EffectiveDate').datepicker('setStartDate', maxDate);
            if ($('#datefrom input').valid()) {
                $('#datefrom input').removeClass('invalid').addClass('success');
            }
        });
        $("#acceptanceTime").datepicker({
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
            $('#datefrom').datepicker('setEndDate', maxDate);
            resetValidateEffectiveDate();
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#EndDate').datepicker('setStartDate', null);
            }
        });
        $("#EndDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EffectiveDate').datepicker('setEndDate', maxDate);
            resetValidateEndDate();
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#EffectiveDate').datepicker('setEndDate', null);
            }
        });
    }
    function addDays(dt, n) {
        var ds = dt.split("/");
        var startDate = new Date(ds[2], ds[1] - 1, ds[0]);   // YYYY/MM/DD - months in Javascript are 0-11
        startDate.setTime(startDate.getTime() + (n * 24 * 60 * 60 * 1000));
        var futureDate = startDate.getDate() + "/" + (startDate.getMonth() + 1) + "/" + startDate.getFullYear();
        futureDate = futureDate.replace(/^(\d{1}\/)/, "0$1").replace(/(\d{2}\/)(\d{1}\/)/, "$10$2");
        return futureDate;
    }
    function validateDefaultDate(datefrom, from, to) {
        setStartDate("#EndDate", from);
        setEndDate("#EffectiveDate", to);
        setStartDate("#EffectiveDate", datefrom);
        setEndDate("#datefrom", from);

    }
    function resetValidateEndDate() {
        if ($('#EndDate input').valid()) {
            $('#EndDate input').removeClass('invalid').addClass('success');
        }
    }
    function resetValidateEffectiveDate() {
        if ($('#EffectiveDate input').valid()) {
            $('#EffectiveDate input').removeClass('invalid').addClass('success');
        }
    }
    function resetValidateDuration() {
        if ($('#Duration').valid()) {
            $('#Duration').removeClass('invalid').addClass('success');
        }
    }
    setTimeout(function () {
        //initDateTime();
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 200);
    $rootScope.amountbudget = function (objInput) {
        $scope.model.Budget = objInput.Budget;
        $scope.modelViewHeader.BudgetTotalDetail = objInput.RealBudget;
        $scope.modelViewHeader.TaxTotalDetail = objInput.TaxDetail;
        $scope.modelViewHeader.LastBudget = objInput.LastBudget;
    }

    $scope.export = function () {
        location.href = "/Admin/Contract/ExportExcelProduct?"
            + "contractCode=" + $scope.model.ContractCode
    }
});

app.controller('contractTabFile', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceContract, $filter, dataserviceSupplier) {
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
            url: "/Admin/Contract/JTableFile",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ContractCode = $rootScope.ContractCode;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
            },
            complete: function () {
                heightTableManual(250);
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataContractFile")
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
    //end option table
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ContractFileID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileName').withTitle('{{"CONTRACT_CURD_TAB_FILE_LIST_COL_NAME" | translate}}').renderWith(function (data, type, full) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('ReposName').withTitle('{{"CONTRACT_CURD_TAB_FILE_LIST_COL_CATEGORY_NAME" | translate}}').renderWith(function (data, type, full) {
        return '<i class="fa fa-folder-open icon-state-warning"></i>&nbsp' + data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"CONTRACT_CURD_TAB_FILE_LIST_COL_CREATED_TIME" | translate}}').withOption('sClass', 'w75 text-center nowrap').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileID').withOption('sClass', 'nowrap dataTable-w80 text-center').withOption('sClass', 'w75 text-center nowrap').withTitle("{{'CONTRACT_BTN_VIEW_CONTENT_FILE' | translate}}").notSortable().renderWith(function (data, type, full) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('').withTitle('{{"CONTRACT_CURD_TAB_FILE_LIST_COL_DESCRIPTION" | translate}}').withOption('sClass', 'w75 text-center nowrap').notSortable().renderWith(function (data, type, full) {
        return '<button title="Mô tả" ng-click="extension(' + full.FileID + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-info-circle"></i></button>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeFile').withTitle('{{"CONTRACT_TAB_FILE_LIST_COL_FILE_TYPE" | translate}}').withOption('sClass', 'w75 text-center nowrap').notSortable().renderWith(function (data, type, full) {
        if (data == "SHARE") {
            return "<label class='text-primary'>Tệp được chia sẻ</label>";
        } else {
            return "Tệp gốc";
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"CONTRACT_CURD_TAB_FILE_COL_ACTION" | translate}}').withOption('sClass', 'w75 text-center nowrap').notSortable().renderWith(function (data, type, full) {
        if (full.TypeFile == "SHARE") {
            return '<a ng-click="dowload(\'' + full.FileCode + '\')" target="_blank" style="width: 25px; height: 25px; padding: 0px" title="Tải xuống - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline green " download><i class="fa fa-download pt5"></i></a>';
        } else {
            return '<a ng-click="share(' + full.Id + ')"  title="Chia sẻ - ' + full.FileName + '" class="fs25 pr10 "><i class="fas fa-share-alt "></i></a>' +
                '<a ng-click="dowload(\'' + full.FileCode + '\')"   title="Tải xuống - ' + full.FileName + '" class="fs25 pr10"><i class="fas fa-download "style="--fa-primary-color: green;"></i></a>' +
                '<a title="Xoá" ng-click="delete(' + full.Id + ')"  class="fs25"><i class="fas fa-trash"style="--fa-primary-color: red;"></i></a>';
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

    $scope.reload = function () {
        reloadData(true);
    }

    $rootScope.reloadFile = function () {
        $scope.reload();
    }

    $scope.search = function () {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderContract + '/contractTabFileSearch.html',
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
            data.append("ContractCode", $rootScope.ContractCode);
            data.append("IsMore", false);
            dataserviceContract.insertContractFile(data, function (result) {
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
        dataserviceContract.getContractFile(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                rs.Object.FileName = fileName;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderContract + '/contractTabFileEdit.html',
                    controller: 'contractTabFileEdit',
                    windowClass: "modal-file",
                    backdrop: 'static',
                    size: '55',
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
        var listdata = $('#tblDataContractFile').DataTable().data();
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
                    dataserviceContract.deleteContractFile(id, function (result) {
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
            controller: 'contractTabFileShare',
            windowClass: 'modal-center',
            backdrop: 'static',
            size: '60',
        });
        modalInstance.result.then(function (d) {
            reloadData()
        }, function () { });
    }

    $scope.viewFile = function (id) {
        //dataserviceContract.getByteFile(id, function (rs) {rs=rs.data;
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
        var listdata = $('#tblDataContractFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].FileCode == fileCode) {
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
        //dataserviceContract.getSuggestionsContractFile($rootScope.ContractCode, function (rs) {
        //    rs = rs.data;
        //    var data = rs !== '' ? rs : { CatCode: '', ObjectCode: $rootScope.ContractCode, ObjectType: 'CONTRACT' };
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

        dataserviceSupplier.getDefaultRepo($rootScope.ContractCode, 'CONTRACT', function (rs) {
            rs = rs.data;
            var data = rs !== null ? rs : { CatCode: '', ObjectCode: $rootScope.ContractCode, ObjectType: 'CONTRACT' };
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
    };

    $scope.getObjectFile = function (id) {
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            dataserviceContract.getItemFile(id, true, function (rs) {
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
        var listdata = $('#tblDataContractFile').DataTable().data();
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
                dataserviceContract.getItemFile(id, true, mode, function (rs) {
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
                App.toastrError(caption.CONTRACT_LBL_FILE_LIMIT_SIZE);
            }

        }
    };

    $scope.viewWord = function (id, mode) {
        var userModel = {};
        var listdata = $('#tblDataContractFile').DataTable().data();
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
                dataserviceContract.getItemFile(id, true, mode, function (rs) {
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
                App.toastrError(caption.CONTRACT_LBL_FILE_LIMIT_SIZE);
            }
        }
    };

    $scope.viewPDF = function (id, mode) {
        var userModel = {};
        var listdata = $('#tblDataContractFile').DataTable().data();
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
                dataserviceContract.getItemFile(id, true, mode, function (rs) {
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
                App.toastrError(caption.CONTRACT_LBL_FILE_LIMIT_SIZE);
            }
        }
    };

    $scope.view = function (id) {

        var isImage = false;
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        var userModel = {};
        var listdata = $('#tblDataContractFile').DataTable().data();
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
            dataserviceContract.createTempFile(id, false, "", function (rs) {
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
            dataserviceContract.createTempFile(id, false, "", function (rs) {
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
            templateUrl: ctxfolderContract + '/viewer.html',
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
            templateUrl: ctxfolderContract + '/shareFile.html',
            controller: 'shareFileContract',
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

    $scope.modelShare = {
        Id: '',
        LstShare: ''
    };

    $scope.permission = {
        Read: true,
        Write: true,
        Delete: true
    };

    function defaultShareFile(id) {
        dataserviceContract.getListUserShare(function (rs) {
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
                dataserviceContract.autoShareFilePermission($scope.modelShare, function (rs) { })
            }
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
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
        });
    }

    setTimeout(function () {
        loadDate();
    }, 200);
});

app.controller('shareFileContract', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, dataserviceContract, para) {
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

        dataserviceContract.getListUserShare(function (rs) {
            rs = rs.data;
            $scope.listUser = rs;
        });

        dataserviceContract.getUserShareFilePermission($scope.model.Id, function (rs) {
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
        dataserviceContract.insertFileShareContract($scope.model1, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                dataserviceContract.getUserShareFilePermission($scope.model.Id, function (rs) {
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
        dataserviceContract.insertFileShareContract(item, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                dataserviceContract.getUserShareFilePermission($scope.model.Id, function (rs) {
                    rs = rs.data;
                    $scope.lstUserSharePermission = rs;
                })
            }
        })
    }

    $scope.deleteShare = function (userName) {
        dataserviceContract.deleteShareFile(para.Id, userName, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title)
            }
            else {
                App.toastrSuccess(rs.Title);
                dataserviceContract.getUserShareFilePermission($scope.model.Id, function (rs) {
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

app.controller('contractTabFileAdd', function ($scope, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, dataserviceContract, para) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('FolderName').notSortable().withTitle('{{"CONTRACT_LIST_COL_ARCHIVE_DIRECTORY" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
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
                App.toastrError(caption.CONTRAT_CURD_MSG_PLEASE_SELECT_AN_ARCHIVE_DIRECTORY);
                return;
            } else if (itemSelect.length > 1) {
                App.toastrError(caption.CONTRAT_CURD_MSG_PLEASE_SELECT_AN_ARCHIVE_DIRECTORY);
                return;
            }
            var data = new FormData();
            data.append("CateRepoSettingId", itemSelect.length != 0 ? itemSelect[0] : "");
            data.append("FileUpload", $scope.file);
            data.append("FileName", $scope.file.name);
            data.append("Desc", $scope.model.Desc);
            data.append("Tags", $scope.model.Tags);
            data.append("NumberDocument", $scope.model.NumberDocument);
            data.append("ContractCode", $rootScope.ContractCode);
            data.append("IsMore", true);
            dataserviceContract.insertContractFile(data, function (result) {
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
            dataserviceContract.getTreeCategory(function (result) {
                result = result.data;
                if (!result.Error) {
                    var root = {
                        id: 'root',
                        parent: "#",
                        text: caption.CONTRACT_LBL_ALL_CATE,//"Tất cả kho dữ liệu"
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

app.controller('contractTabFileEdit', function ($scope, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModal, $uibModalInstance, dataserviceContract, para) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('FolderName').withOption('sClass', '').withTitle('{{"CONTRACT_LIST_COL_FOLDER" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
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
            App.toastrError(caption.CONTRAT_CURD_MSG_PLEASE_SELECT_AN_ARCHIVE_DIRECTORY);
        } else if (itemSelect.length > 1) {
            App.toastrError(caption.CONTRAT_CURD_MSG_PLEASE_SELECT_AN_ARCHIVE_DIRECTORY);
        } else {
            if ($scope.editformfile.validate()) {
                var data = new FormData();
                data.append("CateRepoSettingId", itemSelect[0]);
                data.append("FileCode", para.FileCode);
                data.append("Desc", $scope.model.Desc);
                data.append("Tags", $scope.model.Tags);
                data.append("NumberDocument", $scope.model.NumberDocument);
                data.append("ContractCode", $rootScope.ContractCode);
                dataserviceContract.updateContractFile(data, function (result) {
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
            dataserviceContract.getTreeCategory(function (result) {
                result = result.data;
                if (!result.Error) {
                    var root = {
                        id: 'root',
                        parent: "#",
                        text: caption.CONTRACT_LBL_ALL_CATE,//"Tất cả kho dữ liệu"
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

app.controller('contractTabFileImageViewer', function ($scope, $rootScope, $compile, $uibModal, $confirm, dataserviceContract, $filter, $uibModalInstance, para) {
    $scope.Image = para;
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('contractTabFileShare', function ($scope, $rootScope, $compile, $uibModalInstance, dataserviceContract) {
    $scope.model = {
        ObjectCodeShared: $rootScope.ContractCode,
        ObjectTypeShared: 'CONTRACT',
        ObjectType: '',
        ObjectCode: '',
        FileCode: '',
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.init = function () {
        dataserviceContract.getListObjectTypeShare(function (rs) {
            rs = rs.data;
            $scope.listObjType = rs;
        });
        dataserviceContract.getListFileWithObject($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, function (rs) {
            rs = rs.data;
            $scope.listFileObject = rs;
        });
        reloadListObjectShare($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, $scope.model.ObjectCode, $scope.model.ObjectType, $scope.model.FileCode);
    }
    $scope.init();
    $scope.changeObjType = function (ObjType) {
        dataserviceContract.getListObjectCode($rootScope.ContractCode, ObjType, function (rs) {
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
        dataserviceContract.deleteObjectShare(id, function (rs) {
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
            dataserviceContract.insertFileShare($scope.model, function (rs) {
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
            App.toastrError(caption.CONTRAT_CURD_MSG_NO_OBJECT_SELECTED)
            error = true;
            return error;
        }
        if (($scope.model.ObjectCode == "" || $scope.model.ObjectCode == undefined)) {
            App.toastrError(caption.CONTRAT_CURD_MSG_NO_OBJECT_CODE_SELECTED)
            error = true;
            return error;
        }
        if (($scope.model.FileCode == "" || $scope.model.FileCode == undefined)) {
            App.toastrError(caption.CONTRAT_CURD_MSG_NO_FILE_SELECTED)
            error = true;
            return error;
        }
    }
    function reloadListObjectShare(objectCodeShared, objectTypeShared, objectCode, objectType, fileCode) {
        dataserviceContract.getListObjectShare(objectCodeShared, objectTypeShared, objectCode, objectType, fileCode, function (rs) {
            rs = rs.data;
            $scope.listObjectShare = rs;
        })
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('contractTabNote', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceContract, $filter) {
    var vm = $scope;
    $scope.model = {
        Title: '',
        Note: ''
    }
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Contract/JTableContractNote",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ContractCode = $rootScope.ContractCode;
                d.Title = $scope.model.Title;
                d.Note = $scope.model.Note;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataContractNote")
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
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("ContractNoteId").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.ContractNoteId] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ContractNoteId + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withTitle('{{"CONTRACT_CURD_TAB_NOTE_LIST_COL_STT" | translate}}').renderWith(function (data, type) {
    //    return '<span  class="btn btn-success" style="height: 20px; font-size: 5; padding: 0">Tags</button>';
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"CONTRACT_CURD_TAB_NOTE_LIST_COL_TITLE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Tags').withTitle('{{"CONTRACT_CURD_TAB_NOTE_LIST_COL_TAGS" | translate}}').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"CONTRACT_CURD_TAB_NOTE_LIST_COL_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"CONTRACT_CURD_TAB_NOTE_LIST_COL_CREATED_TIME" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('').withTitle('{{"CONTRACT_CURD_TAB_NOTE_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<a title="Sửa" ng-click="edit(' + full.ContractNoteId + ')"  class="fs25 pr10"><i class="fas fa-edit"style="--fa-primary-color: green;"></i></a>' +
            '<a title="Xoá" ng-click="delete(' + full.ContractNoteId + ')"  class="fs25"><i class="fas fa-trash"style="--fa-primary-color: red;"></i></a>';
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
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderContract + '/contractTabNoteAdd.html',
            controller: 'contractTabNoteAdd',
            backdrop: 'static',
            size: '35'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.edit = function (id) {
        dataserviceContract.getContractNote(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderContract + '/contractTabNoteEdit.html',
                    controller: 'contractTabNoteEdit',
                    backdrop: 'static',
                    size: '35',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    $scope.reload();
                }, function () {
                });
            }
        })
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceContract.deleteContractNote(id, function (result) {
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
});
app.controller('contractTabNoteAdd', function ($scope, $rootScope, $uibModal, $uibModalInstance, $filter, dataserviceContract) {
    $scope.model = {
        ContractCode: '',
        Title: '',
        Tags: '',
        Note: ''
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {

        if ($scope.addformNote.validate()) {
            $scope.model.ContractCode = $rootScope.ContractCode;
            dataserviceContract.insertContractNote($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            })
        }
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('contractTabNoteEdit', function ($scope, $rootScope, $uibModal, $uibModalInstance, $filter, dataserviceContract, para) {
    $scope.init = function () {
        $scope.model = para;
    }
    $scope.init();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        if ($scope.editformNote.validate()) {
            dataserviceContract.updateContractNote($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            })
        }
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

//Tab attribute
app.controller('contractTabAttribute', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceContract, $filter) {
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

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Contract/JTableAttribute",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ContractCode = $rootScope.ContractCode;
                //d.AttrCode = $scope.model.AttrCode;
                //d.AttrValue = $scope.model.AttrValue;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataAttribute")
                //tblDataAttribute
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('code').withTitle('{{"CONTRACT_CURD_TAB_ATTRIBUTE_LIST_COL_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('value').withTitle('{{"CONTRACT_CURD_TAB_ATTRIBUTE_LIST_COL_VALUE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('attrGroup').withTitle('{{"CONTRACT_CURD_TAB_ATTRIBUTE_LIST_COL_ATTR_GROUP" | translate}}').renderWith(function (data, type) {
        for (var i = 0; i < $rootScope.ListCommon.length; i++) {
            if ($rootScope.ListCommon[i].Code == data) {
                return $rootScope.ListCommon[i].Name;
                break;
            }
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('note').withTitle('{{"CONTRACT_TAB_EXT_TXT_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));


    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"CONTRACT_CURD_TAB_ATTRIBUTE_LIST_COL_ACTION" | translate}}').withOption('sWidth', '40px').renderWith(function (data, type, full) {
        return '<a title="Sửa" ng-click="edit(' + full.id + ')"  class="fs25 pr10"><i class="fas fa-edit"style="--fa-primary-color: green;"></i></a>' +
            '<a title="Xoá" ng-click="delete(' + full.id + ')"  class="fs25"><i class="fas fa-trash"style="--fa-primary-color: red;"></i></a>';
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
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.AttrGroup == "" || data.AttrGroup == null || data.AttrGroup == undefined) {
            $scope.borderValidateAttrGroup = {
                "border-color": "#e73d4a",
            }
            $scope.errorAttrGroup = true;
            mess.Status = true;
        } else {
            $scope.errorAttrGroup = false;

        }
        return mess;
    };
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "AttrGroup" && $scope.model.AttrGroup != "") {
            $scope.errorAttrGroup = false;
            $scope.borderValidateAttrGroup = {
                "border-color": "#d4d4d4",
            }
        }
    }
    $scope.changeAttrValue = function () {
        if ($scope.model.AttrValue != "") {
            $scope.errorAttrValue = false;
        }
    };
    $scope.reload = function () {
        reloadData(true);
    }
    //$scope.checkValidator = function (data) {
    //    var msg = { Error: false, Title: null };
    //    if (data.AttrCode == '') {
    //        msg.Error = true;
    //        msg.Title = "Vui lòng nhập mã thuộc tính";
    //    }
    //    if (data.AttrValue == '') {
    //        msg.Error = true;
    //        if (msg.Title == null)
    //            msg.Title = "Vui lòng nhập giá trị";
    //        else
    //            msg.Title = msg.Title + "</br>Vui lòng nhập giá trị";
    //    }
    //    if (data.AttrGroup == '') {
    //        msg.Error = true;
    //        if (msg.Title == null)
    //            msg.Title = "Vui lòng chọn nhóm";
    //        else
    //            msg.Title = msg.Title + "</br>Vui lòng chọn nhóm";
    //    }
    //    return msg;
    //}
    $scope.ChangCheckValue = function () {
        if ($scope.model.AttrValue != "") {
            $scope.borderValidateAttrValue = {
                "border-color": "#d4d4d4",

            }
        }
    }
    $scope.ChangCheckCode = function () {
        if ($scope.model.AttrCode != "") {
            $scope.borderValidateAttrCode = {
                "border-color": "#d4d4d4",

            }
        }
    }
    $scope.add = function () {
        validationSelect($scope.model);
        if (!$scope.addform.validate() && validationSelect($scope.model).Status == false) {
            if ($scope.model.AttrValue == "") {
                $scope.borderValidateAttrValue = {
                    "border-color": "#e73d4a",
                }
            }
            if ($scope.model.AttrCode == "") {
                $scope.borderValidateAttrCode = {
                    "border-color": "#e73d4a",
                }
            }
        }
        if ($scope.addform.validate()) {
            //var msg = $scope.checkValidator($scope.model);
            //if (msg.Error == true) {
            //    App.toastrWarning(msg.Title);
            //    return;
            //}
            //if (validationSelect($scope.model).Status == false) {
            //    App.toastrError(msg.Title);
            //    return;
            //}
            //if (validationSelect($scope.model).Status == false)
            $scope.model.ContractCode = $rootScope.ContractCode;
            dataserviceContract.insertContractAttr($scope.model, function (rs) {
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
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;//"Bạn có chắc chắn muốn xóa?";
                $scope.ok = function () {
                    dataserviceContract.deleteContractAttr(id, function (result) {
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
        $scope.model.ContractCode = $rootScope.ContractCode;
        $scope.model.ContractAttributeID = $scope.editId;
        validationSelect($scope.model);
        if (!$scope.addform.validate() && validationSelect($scope.model).Status == false) {
            if ($scope.model.AttrValue == "") {
                $scope.borderValidateAttrValue = {
                    "border-color": "#e73d4a",
                }
            }

        }
        if ($scope.addform.validate()) {
            dataserviceContract.updateContractAttr($scope.model, function (rs) {
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
            })
        }
        //var msg = $scope.checkValidator($scope.model);
        //if (msg.Error == true) {
        //    App.toastrWarning(msg.Title);
        //    return;
        //}

    }
});
app.controller('contractTabAttributeAdd', function ($scope, $rootScope, $uibModal, $uibModalInstance, $filter, dataserviceContract) {
    $scope.model = {
        ContractCode: '',
        AttrCode: '',
        AttrValue: '',
        //AttrGroup: ''
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {

        if ($scope.addformAttribute.validate()) {
            $scope.model.ContractCode = $rootScope.ContractCode;
            dataserviceContract.insertContractAttr($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close(rs.Object);
                }
            })
        }
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('contractTabAttributeEdit', function ($scope, $rootScope, $uibModal, $uibModalInstance, $filter, dataserviceContract, para) {
    $scope.init = function () {
        $scope.model = para;
    }
    $scope.init();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {

        if ($scope.editformAttribute.validate()) {
            dataserviceContract.updateContractAttr($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            })
        }
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('contractTabRelated', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceContract, $filter) {
    var vm = $scope;
    $scope.model = {
        Id: '',
        ContractCode: '',
        Relative: ''
    }
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Contract/JTableContractRelated",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ContractCode = $rootScope.ContractCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataContractRelated")
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {

                    var ContractCode = data.ContractCode;
                    $rootScope.cancelEdit();
                    $scope.detail(ContractCode);
                }
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ContractCode').withTitle('{{"CONTRACT_CURD_TAB_OTHER_LIST_COL_CONTRACT_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"CONTRACT_CURD_TAB_OTHER_LIST_COL_TITLE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('RelativeText').withTitle('{{"CONTRACT_TAB_RELATED_LBL_RELATIVE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{"CONTRACT_CURD_TAB_OTHER_LIST_COL_CREATED_BY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"CONTRACT_CURD_TAB_OTHER_LIST_COL_CREATED_TIME" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Action').withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').renderWith(function (data, type, full) {
        return '<a title="Sửa" ng-click="getItem(' + full.Id + ')"  class="fs25 pr10"><i class="fas fa-edit"style="--fa-primary-color: green;"></i></a>' +
            '<a title="Xóa" ng-click="delete(' + full.Id + ')"  class="fs25"><i class="fas fa-trash"style="--fa-primary-color: red;"></i></a>';
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
        var mess = { Status: false, Title: "" }
        if (data.ContractCode == '') {
            $scope.errorContractCode = true;
            mess.Status = true;
        } else {
            $scope.errorContractCode = false;
        }
        if (data.Relative == "") {
            $scope.errorRelative = true;
            mess.Status = true;
        } else {
            $scope.errorRelative = false;
        }
        return mess;
    };
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.initLoad = function () {
        dataserviceContract.getListContractOrther($rootScope.ContractCode, function (rs) {
            rs = rs.data;
            $scope.listContract = rs;
        })
        dataserviceContract.getListRelative(function (rs) {
            rs = rs.data;
            $scope.listRelative = rs;
        })
    }
    $scope.initLoad();
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "ContractCode" && $scope.model.ContractCode != null) {
            $scope.errorContractCode = false;
        }
        if (SelectType == "Relative" && $scope.model.Relative != "") {
            $scope.errorRelative = false;
        }
    }
    $scope.getItem = function (id) {

        var userModel = {};
        var listdata = $('#tblDataContractRelated').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        $scope.model.Id = userModel.Id;
        $scope.model.ContractCode = userModel.ContractCode;
        $scope.model.Relative = userModel.Relative;
    }
    $scope.add = function () {
        validationSelect($scope.model);
        if (!validationSelect($scope.model).Status) {
            var obj = {
                ContractCode: $rootScope.ContractCode,
                ContractRelative: $scope.model
            }
            dataserviceContract.insertRelative(obj, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reload();
                    $scope.resetInput();
                }
            })
        }
    }
    $scope.edit = function () {
        validationSelect($scope.model);
        if (!validationSelect($scope.model).Status) {
            var obj = {
                ContractCode: $rootScope.ContractCode,
                ContractRelative: $scope.model
            }
            dataserviceContract.updateRelative(obj, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reload();
                    $scope.resetInput();
                }
            })
        }
    }
    $scope.detail = function (contractCode) {
        dataserviceContract.getItemHistoryVersion(contractCode, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderContract + "/detailHistory.html",
                    controller: 'detailHistory',
                    size: '70',
                    backdrop: 'static',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                }, function () { });
            }
        })
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.CONTRAT_CURD_MSG_ARE_YOU_SURE_YOU_WANT_TO_DELETE_VOTES;
                $scope.ok = function () {
                    dataserviceContract.deleteRelative(id, $rootScope.ContractCode, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $uibModalInstance.close();
                        }
                        App.unblockUI("#contentMain");
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
    $scope.resetInput = function () {
        $scope.model.Id = '';
        $scope.model.ContractCode = '';
        $scope.model.Relative = '';
    }
    $scope.addCommonSettingContractRelative = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'CONTRACT_RELATIVE',
                        GroupNote: 'Mối quan hệ (Đối tượng liên quan)',
                        AssetCode: 'CONTRACT'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceContract.getListRelative(function (rs) {
                rs = rs.data;
                $scope.listRelative = rs;
            });
        }, function () { });
    }
});

app.controller('contractTabMembers', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceContract, $filter) {
    var vm = $scope;
    $scope.model = {
        ContractCode: $rootScope.ContractCode,
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
            url: "/Admin/Contract/JTableTagPeople",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ContractCode = $rootScope.ContractCode;
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('Assigner').withTitle('{{"Người được giao việc" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"Mô tả" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AssignerTime').withTitle('{{"Thời gian tạo" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withTitle('{{"Thao tác" | translate}}').withOption('sClass', 'tcenter nowrap dataTable-w80').renderWith(function (data, type, full, meta) {
        return '<a title="Xoá" ng-click="delete(' + full.Id + ')"  class="fs25"><i class="fas fa-trash"style="--fa-primary-color: red;"></i></a>';
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
        dataserviceContract.getListUser(function (rs) {
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
                ContractCode: $rootScope.ContractCode,
                UserId: $scope.model.Assignee,
                Note: $scope.model.Note
            };
            dataserviceContract.assignToContract(data, function (rs) {
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
        dataserviceContract.deleteAssignContract(id, function (rs) {
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

//tab payment
app.controller('contractTabPayment', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances,  dataserviceContract, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        ContractCode: $rootScope.ContractCode,
        FromTo: '',
        DateTo: '',
        PaymentName: '',
        PaymentType: '',
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Contract/JTableContractTabPayment",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ContractCode = $rootScope.ContractCode;
                d.FromTo = $scope.model.FromTo;
                d.DateTo = $scope.model.DateTo;
                d.PaymentName = $scope.model.PaymentName;
                d.PaymentType = $scope.model.PaymentType;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataPayment")
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
            $scope.model.ContractCode = $rootScope.ContractCode;
            dataserviceContract.getTotalPayment($scope.model, function (result) {
                result = result.data;
                console.log(result);
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    $scope.TotalReceiptApproved = Math.round(result.TotalReceiptApproved);
                    $scope.TotalReceipt = Math.round(result.TotalReceipt);
                    $scope.TotalExpenseApproved = Math.round(result.TotalExpenseApproved);
                    $scope.TotalExpense = Math.round(result.TotalExpense);
                    $scope.TotalSurplusApproved = Math.round(result.TotalSurplusApproved);
                    $scope.isVND = result.IsVnd;
                    console.log($scope.isVND);
                    setTimeout(function () {
                        $scope.$apply();
                    })
                }
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DeadLine').withTitle('{{ "CONTRACT_LIST_COL_COLLECTION_PAYMENT_DATE" | translate}}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('CatName').withTitle('{{"CONTRACT_CURD_TAB_PAYMENT_LIST_COL_CAT_NAME" | translate}}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"CONTRACT_CURD_TAB_PAYMENT_LIST_TITLE" | translate}}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type, full, meta) {
        var catName = '<span class="badge-customer badge-customer-success fs9 ml5">' + full.CatName + '</span>';
        var time = "";
        var title = '<span class = "bold">' + data + '</span><br />' + catName + time;

        if (full.SLastLog != '' && full.SLastLog != null && full.SLastLog != undefined) {
            title += formatDetail(full);
        }
        return title;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AetType').withTitle('{{"CONTRACT_CURD_TAB_PAYMENT_LIST_COL_AET_TYPE" | translate}}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
        if (data == "Receipt") {
            return caption.FEA_REVENUE;
        }
        else {
            return caption.FEA_EXPENDI;
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Total').withTitle('{{"CONTRACT_CURD_TAB_PAYMENT_LIST_COL_TOTAL" | translate}}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
        return '<span class="text-danger bold">' + $filter('currency')(data, '', 0) + '</span>';
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Currency').withTitle('{{"FAE_LIST_COL_AET_TYPE" | translate}}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"CONTRACT_CURD_TAB_PAYMENT_LIST_COL_STATUS" | translate}}').withOption('sClass', 'dataTable-pr0 nowrap').renderWith(function (data, type, full, meta) {
    //    //switch (data) {
    //    //    case "CREATED":
    //    //        data = "Khởi tạo";
    //    //        return '<span class="text-success">' + data + '</span>';
    //    //        break;
    //    //    case "PENDING":
    //    //        data = "Chờ xử lý";
    //    //        return '<span class="text-warning"> ' + data + '</span>';
    //    //        break;
    //    //    case "APPROVED":
    //    //        data = "Đã duyệt";
    //    //        return '<span class="text-primary"> ' + data + '</span>';
    //    //        break;
    //    //    case "REFUSE":
    //    //        data = "Từ chối";
    //    //        return '<span class="text-danger"> ' + data + '</span>';
    //    //        break;
    //    //    case "CANCEL":
    //    //        data = "Hủy bỏ";
    //    //        return '<span class="text-danger"> ' + data + '</span>';
    //    //        break;
    //    //}
    //    return full.StatusObject;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Payer').withTitle('{{"CONTRACT_CURD_TAB_PAYMENT_LIST_COL_PAYER" | translate}}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Receiptter').withTitle('{{"CONTRACT_CURD_TAB_PAYMENT_LIST_COL_RECEIPTTER" | translate}}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').renderWith(function (data, type, full) {
        return '<a title="Sửa" ng-click="edit(' + full.Id + ')"  class="fs25 pr20"><i class="fas fa-edit" style="--fa-primary-color: green;"></i></a>' +
            '<a title="Xóa" ng-click="delete(' + full.Id + ')"  class="fs25"><i class="fas fa-trash" style="--fa-primary-color: red;"></i></a>';
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
                $scope.message = caption.CONTRAT_CURD_MSG_ARE_YOU_SURE_YOU_WANT_TO_DELETE_VOTES;
                $scope.ok = function () {
                    dataserviceContract.deletePayment(id, function (rs) {
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
            templateUrl: ctxfolderContract + '/contractTabPaymentAdd.html',
            controller: 'contractTabPaymentAdd',
            backdrop: 'static',
            windowClass: "modal-funAccEntry",
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
            templateUrl: ctxfolderContract + '/contractTabPaymentEdit.html',
            controller: 'contractTabPaymentEdit',
            backdrop: 'static',
            windowClass: "modal-funAccEntry",
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
    function formatDetail(full) {
        try {
            var log = JSON.parse(full.SLastLog);
            console.log(log.ObjectRelative)
        } catch (e) {
            console.log(e);
            return "";
        }
        //console.log(log);
        var domActs = '<div>'; /*'<div class="d-flex">';*/
        domActs += log.ObjectRelative + ' - ' + log.Name + ' [ ' + log.CreatedBy + ' - ' + log.SCreatedTime + ' ]</div>';
        return domActs;
        //var actName = "";
        //if (lstAct.IsLock && lstAct.ActStatus != "Khóa hoạt động" && lstAct.ActStatus != "Không kích hoạt") {
        //    actName = '<span>' + (lstAct.ActName.length > 50 ? lstAct.ActName.substr(0, 50) + " ..." : lstAct.ActName) + '</span>';
        //}
        //else {
        //    actName = lstAct.ActName.length > 50 ? lstAct.ActName.substr(0, 50) + " ..." : lstAct.ActName;
        //}
        //if (i % 4 != 0) {
        //    domActs += '<div class="mnh70 col-lg-3 col-md-6 pl-0 pr5 mt5">';
        //}
        //else {
        //    domActs += '<div class="row">'
        //}
        //domActs += '<div class="mt5">';
        //domActs += '<div class="d-flex">';
        //domActs += '<div style="display: inline-block; vertical-align:top">';
        //if (/*data == "True"*/(lstAct.ActType == "Bắt đầu" && lstAct.ActStatus == "Kích hoạt") || lstAct.ActStatus == "Đã xử lý") {
        //    domActs += '<a title="Xét duyệt" type="button" ng-click="approve(\'' + lstAct.ActivityInstCode + '\', \'' + lstAct.ActStatus + '\')" style1 = "width: 28px; height: 28px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline"><i class="fas fa-check-circle" style="--fa-secondary-color:green; --fa-secondary-opacity: 1; --fa-primary-color: white; font-size: 25px;margin-right: 10px;"></i></a>';
        //}
        //else if (lstAct.ActStatus == "Hủy" || lstAct.ActStatus == "Dừng lại") {
        //    domActs += '<a title="Xét duyệt" type="button" ng-click="approve(\'' + lstAct.ActivityInstCode + '\', \'' + lstAct.ActStatus + '\')" style1 = "width: 28px; height: 28px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline"><i class="fas fa-circle" style="color:orange;font-size: 25px;margin-right: 10px;"></i></a>';
        //}
        //else if (lstAct.ActStatus == "Đang xử lý") {
        //    domActs += '<a title="Xét duyệt" type="button" ng-click="approve(\'' + lstAct.ActivityInstCode + '\', \'' + lstAct.ActStatus + '\')" style1 = "width: 28px; height: 28px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline"><i class="fas fa-circle" style="color:green;font-size: 25px;margin-right: 10px;"></i></button>';
        //}
        //else {
        //    domActs += '<a title="Xét duyệt" type="button" ng-click="approve(\'' + lstAct.ActivityInstCode + '\', \'' + lstAct.ActStatus + '\')" style1 = "width: 28px; height: 28px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline"><i class="fas fa-circle" style="color:grey;font-size: 25px;margin-right: 10px;"></i></button>';
        //}
        //domActs += '</div>';
        //domActs += '<div style="display: inline-block; margin-left: 5px; font-weight: 500">';
        //if (lstAct.ActStatus == "Đã xử lý") {
        //    domActs += '<a class="actName" title="' + lstAct.ActName + '" ng-click1="editInstAct(' + lstAct.Id + ',\'' + full.ObjectCode + '\')">' + actName + '</a>' + '<span class="badge-customer badge-customer-success">' + lstAct.ActStatus + '</span>';
        //}
        //else if (lstAct.ActStatus == "Đang xử lý" || lstAct.ActStatus == "Chưa xử lý" || lstAct.ActStatus == "Kích hoạt") {
        //    var pending = '';
        //    if (lstAct.ActStatus != "Chưa xử lý") {
        //        domActs += '<a class="actName" title="' + lstAct.ActName + '" ng-click1="editInstAct(' + lstAct.Id + ',\'' + full.ObjectCode + '\')">' + actName + '</a>' + '<span class="badge-customer badge-customer-warning">' + lstAct.ActStatus + '</span>' + pending;
        //    }
        //    else {
        //        domActs += '<a class="actName" title="' + lstAct.ActName + '" ng-click1="editInstAct(' + lstAct.Id + ',\'' + full.ObjectCode + '\')">' + actName + '</a>' + '<span class="badge-customer badge-customer-lock">' + lstAct.ActStatus + '</span>';
        //    }
        //}
        //else if (lstAct.ActStatus == "Hủy") {
        //    domActs += '<a class="actName" title="' + lstAct.ActName + '" ng-click1="editInstAct(' + lstAct.Id + ',\'' + full.ObjectCode + '\')">' + actName + '</a>' + '<span class="badge-customer badge-customer-danger">' + lstAct.ActStatus + '</span>';
        //}
        //else if (lstAct.ActStatus == "Dừng lại") {
        //    domActs += '<a class="actName" title="' + lstAct.ActName + '" ng-click1="editInstAct(' + lstAct.Id + ',\'' + full.ObjectCode + '\')">' + actName + '</a>' + '<span class="badge-customer badge-customer-pause">' + lstAct.ActStatus + '</span>';
        //}
        //else {
        //    domActs += '<a class="actName" title="' + lstAct.ActName + '" ng-click1="editInstAct(' + lstAct.Id + ',\'' + full.ObjectCode + '\')">' + actName + '</a>' + '';
        //}
        //if (lstAct.IsApprovable) {
        //    domActs += '<img class="blink-act" src="/images/default/green-blink.png" style="width: 17px;height: 17px;margin-top: -5px;" />';
        //}
        //domActs += '</div>';
        //domActs += '</div>';
        //if (lstAct.ActStatus == "Đã xử lý" && lstAct.Log) {
        //    domActs += '<span class="fs10"><span class="bold fs12">' + lstAct.Log.CreatedBy + '</span><br/> [' + lstAct.Log.sCreatedTime + ']</span>';
        //}
        //if (i % 3 == 0 && i != 0) {
        //    domActs += '</div>';
        //}
        //domActs += '</div>';
        //domActs += '</div>';
        //return domActs;
    }
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
app.controller('contractTabPaymentAdd', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, dataserviceContract) {
    $scope.model = {
        AetCode: '',
        GoogleMap: '',
        AetCode: '',
        Title: '',
        AetType: 'Receipt',
        AetDescription: '',
        Currency: '',
        ObjType: 'CONTRACT',
        ObjCode: $rootScope.ContractCode,
        WorkflowCat: 'THU_CHI',
    }

    $scope.modelWf = {
        WorkflowCode: "THU_CHI",
        ObjectType: "FUND_ACC_ENTRY",
        ObjectInst: "",
    };
    //$scope.AetCode = [];
    $scope.LimitTotal = null;
    $scope.listFundFile = [];
    $scope.listFundFileRemove = [];
    $scope.openMap = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderContract + '/googleMap.html',
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
    dataserviceContract.getCurrencyDefaultPayment(function (rs) {
        rs = rs.data;
        $scope.model.Currency = rs;
    });
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
        if (data.Total == null || data.Total == undefined || $scope.model.Total <= 0) {
            $scope.errorTotal = true;
            mess.Status = true;
        } else {
            $scope.errorTotal = false;
        }

        return mess;
    }
    $scope.initData = function () {
        dataserviceContract.getGetAetRelative(function (rs) {
            rs = rs.data;
            $rootScope.AetRelative = rs;
        })
        dataserviceContract.getGetCatName(function (rs) {
            rs = rs.data;
            $rootScope.listCatName = rs;
        });
        dataserviceContract.getListTitle(function (rs) {
            rs = rs.data;
            $rootScope.listTitle = rs;
        })
        dataserviceContract.gettreedata({ IdI: null }, function (result) {
            result = result.data;
            //$scope.treeData = result.map(function (obj, index) { if (obj.Code == 'ADVANCE_CONTRACT' || obj.Code == 'PAY_CONTRACT') return obj; });
            $scope.treeData = result;
        });
        dataserviceContract.getObjDependencyFund(function (rs) {
            rs = rs.data;
            $scope.listObjType = rs;
        });
        dataserviceContract.getObjCode("CONTRACT", function (rs) {
            rs = rs.data;
            $scope.listObjCode = rs;
        });
        dataserviceContract.getListCurrencyPayment(function (rs) {
            rs = rs.data;
            $scope.listCurrency = rs;
        });
    }
    $scope.initData();

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        var check = CKEDITOR.instances['Note'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['Note'].getData();
            $scope.model.AetDescription = data;
        }
        dataserviceContract.getGenAETCode($scope.model.AetType, $scope.model.CatCode, function (rs) {
            rs = rs.data;
            $scope.model.ListFileAccEntry = $scope.listFundFile;
            $scope.model.ListFileAccEntryRemove = $scope.listFundFileRemove;
            $scope.model.AetCode = rs;
            validationSelect($scope.model);

            if ($scope.LimitTotal != null && $scope.model.AetType == "Expense" && $scope.model.Total > $scope.LimitTotal) {
                App.toastrError(caption.CONTRAT_CURD_MSG_THE_PARENT_CHECK);
                return;
            }

            if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
                dataserviceContract.insertPayment($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        //Workflow
                        $scope.modelWf.ObjectInst = $scope.model.AetCode;
                        $scope.modelWf.WorkflowCode = $scope.model.WorkflowCat;
                        $scope.modelWf.ObjectName = $scope.model.Title;
                        dataserviceContract.createWfInstance($scope.modelWf, function (rs) {
                            rs = rs.data;
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            } else {
                                //App.toastrSuccess(rs.Title);
                                var wfInstCode = rs.Object.WfInstCode;
                                $scope.WfInstCode = wfInstCode;
                                $uibModalInstance.close();
                            }
                        })
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
            if ($('#DeadLine .input-date').valid()) {
                $('#DeadLine .input-date').removeClass('invalid').addClass('success');
            }
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#DeadLine').datepicker('setEndDate', null);
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
    }
    //bảng file
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.changeAetRelative = function () {
        dataserviceContract.checkPlan($scope.model.AetRelative, function (rs) {
            rs = rs.data;
            $scope.isPlanRelative = rs.IsPlan;
            if ($scope.isPlanRelative) {
                $('#DeadLine').datepicker('setEndDate', new Date());
                $scope.model.DeadLine = "";
                $scope.model.AetType = rs.AetTye;
                $scope.IsHide = true;
                $scope.model.Currency = rs.Currency;
            }
        });
        console.log($scope.isPlanRelative);
        dataserviceContract.checkLimitTotal($scope.model.AetRelative, function (rs) {
            rs = rs.data;
            if (rs.IsLimitTotal == true) {
                $scope.LimitTotal = rs.LimitTotal;
            } else {
                $scope.LimitTotal = null;
            }
        });


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

    $scope.loadFilePayment = function (event) {                                   //loadfile

        var files = event.target.files;
        var checkExits = $scope.listFundFile.filter(k => k.FileName === files[0].name);
        if (checkExits.length == 0) {
            var formData = new FormData();
            formData.append("file", files[0] != undefined ? files[0] : null);
            dataserviceContract.uploadFile(formData, function (rs) {
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
            App.toastrError(caption.CONTRAT_CURD_MSG_FILE_ALREADY_EXISTS);
        }
    }
    $scope.removeFileReq = function (index) {                             //remove file
        var itemRemove = $scope.listFundFile[index];

        if (itemRemove.Id != null) {
            $scope.listFundFileRemove.push(itemRemove);
        }
        $scope.listFundFile.splice(index, 1);
    }
    $scope.triggerUpload = function () {
        $('#btn-upload-file').click();
    }
    function ckEditer() {
        var editor1 = CKEDITOR.replace('Note', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['Note'].config.height = 80;
    }
    setTimeout(function () {
        ckEditer();
    }, 1000);
});
app.controller('contractTabPaymentEdit', function ($scope, $rootScope, $uibModal, $uibModalInstance, dataserviceContract, para) {

    console.log(para);
    $scope.model = {
        ListFileAccEntry: [],
    }

    $scope.modelWf = {
        WorkflowCode: "THU_CHI",
        ObjectType: "FUND_ACC_ENTRY",
        ObjectInst: "",
    };
    $scope.LimitTotal = null;
    $scope.disableAetRelative = false;
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

        dataserviceContract.checkPlan($scope.model.AetRelative, function (rs) {
            rs = rs.data;
            $scope.isPlanRelative = rs.IsPlan;
            if ($scope.isPlanRelative) {
                $('#DeadLine').datepicker('setEndDate', new Date());
                $scope.model.DeadLine = "";
                $scope.model.AetType = rs.AetTye;
                $scope.IsHide = true;
                $scope.model.Currency = rs.Currency;
            }
        });
        console.log($scope.isPlanRelative);
        dataserviceContract.checkLimitTotalUpdate($scope.model.AetRelative, $scope.model.AetCode, function (rs) {
            rs = rs.data;
            if (rs.IsLimitTotal == true) {
                $scope.LimitTotal = rs.LimitTotal;
            } else {
                $scope.LimitTotal = null;
            }
        });

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
    }
    $scope.openMap = function () {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderContract + '/googleMap.html',
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
            templateUrl: ctxfolderContract + '/activityPayment.html',
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
        if (data.Total == null || data.Total == undefined || $scope.model.Total <= 0) {
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
            dataserviceContract.uploadFile(formData, function (rs) {
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
            App.toastrError(capti.CONTRAT_CURD_MSG_FILE_ALREADY_EXISTS);
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
        dataserviceContract.getListTitle(function (rs) {
            rs = rs.data;
            $rootScope.listTitle = rs;
        });
        dataserviceContract.getItemPayment(para, function (rs) {
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
                dataserviceContract.getListFundFiles($scope.model.AetCode, function (rs) {
                    rs = rs.data;
                    $scope.listFundFile = rs;
                });
                dataserviceContract.getAetRelativeChil($scope.model.AetCode, function (rs) {
                    rs = rs.data;
                    var list = [];
                    for (var i = 0; i < rs.length; i++) {
                        list.push(rs[i].Total.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
                    }
                    $scope.totalChild = list.join(" - ");

                });
                if ($scope.model.ObjType != "") {
                    dataserviceContract.getObjCode($scope.model.ObjType, function (rs) {
                        rs = rs.data;
                        $scope.listObjCode = rs;
                    });
                }
                if ($scope.model.AetRelative != null) {
                    dataserviceContract.checkLimitTotalUpdate($scope.model.AetRelative, $scope.model.AetCode, function (rs) {
                        rs = rs.data;
                        if (rs.IsLimitTotal == true) {
                            $scope.LimitTotal = rs.LimitTotal;
                        } else {
                            $scope.LimitTotal = null;
                        }
                    });
                }

                setTimeout(function () {
                    $rootScope.loadDiagramWfInst($scope.model.AetCode, $scope.modelWf.ObjectType);
                }, 800)
            }
            if ($scope.IsPermission == true || rs[0].IsPlan == true) {

                $scope.disableAetRelative = true;
            }
        });
        //dataserviceContract.getGetCurrency(function (rs) {rs=rs.data;
        //    $rootScope.listCurrency = rs;
        //});
        dataserviceContract.getGetCatName(function (rs) {
            rs = rs.data;
            $rootScope.listCatName = rs;
        });
        //dataserviceContract.getGetAetRelative(function (rs) {rs=rs.data;
        //    $rootScope.AetRelative = rs;
        //});
        dataserviceContract.gettreedata({ IdI: null }, function (result) {
            result = result.data;
            //$scope.treeData = result.map(function (obj, index) { if (obj.Code == 'ADVANCE_CONTRACT' || obj.Code == 'PAY_CONTRACT') return obj; });
            $scope.treeData = result;
        });
        dataserviceContract.getObjDependencyFund(function (rs) {
            rs = rs.data;
            $scope.listObjType = rs;
        });
        dataserviceContract.getListCurrencyPayment(function (rs) {
            rs = rs.data;
            $scope.listCurrency = rs;
        });
    }
    $scope.isTotal = false;
    $scope.openLog = function () {
        dataserviceContract.getUpdateLogPayment($scope.model.AetCode, function (rs) {
            rs = rs.data;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderContract + '/showLog.html',
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

            dataserviceContract.insertAccEntryTracking($scope.model.AetCode, $scope.model.Action, $scope.model.Note, $scope.model.AetRelative, function (rs) {
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
        var check = CKEDITOR.instances['Note'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['Note'].getData();
            $scope.model.AetDescription = data;
        }
        validationSelect($scope.model);
        if ($scope.LimitTotal != null && $scope.model.AetType == "Expense" && $scope.model.Total > $scope.LimitTotal) {
            App.toastrError(caption.CONTRAT_CURD_MSG_THE_PARENT_CHECK);
            return;
        }

        if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
            $scope.model.ListFileAccEntry = $scope.listFundFile;
            $scope.model.ListFileAccEntryRemove = $scope.listFundFileRemove;
            dataserviceContract.updatePayment($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
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
            dataserviceContract.getObjCode(item.Code, function (rs) {
                rs = rs.data;
                $scope.listObjCode = rs;
            });
        }
    }
    $scope.deleteObjType = function () {
        $scope.model.ObjType = null;
        $scope.model.ObjCode = null;
    }
    $scope.triggerUpload = function () {
        $('#btn-upload-file').click();
    }
    function ckEditer() {
        var editor1 = CKEDITOR.replace('Note', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['Note'].config.height = 80;
    }
    setTimeout(function () {
        ckEditer();
    }, 1000);
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        //initAutocomplete();
        //Yêu cầu từ ngày --> đến ngày
        $("#DeadLine").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        //$('#DeadLine').datepicker('setEndDate', new Date());
    });

});
app.controller('googleMap', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceContract, $filter, para) {
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

            dataserviceContract.getAddress(point.lat, point.lng, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    var html = "<b>" + caption.CONTRAT_CURD_MSG_INFORMATION + "</b> <br/>" + rs.Object;
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
app.controller('activityPayment', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataserviceContract, $timeout, para) {
    $scope.listAccEntryTracking = [];
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.initLoad = function () {
        dataserviceContract.getGetAccTrackingDetail(para, function (rs) {
            rs = rs.data;
            for (var i = 0; i < rs.Object.length; i++) {
                rs.Object[i].Action = $rootScope.listStatus.filter(x => x.Code == rs.Object[i].Action)[0].Name;
            }
            $scope.listAccEntryTracking = rs.Object;
        });
    }

    $scope.initLoad();
});

//Tab schedule pay
app.controller('contractTabSchedulePay', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceContract, $filter) {
    var vm = $scope;
    $scope.model = {
        sEstimateTime: '',
        Percentage: '',
        Money: '',
        Note: '',
        Condition: '',
        Quantity: '',
        PayTimes: '',
    }
    $scope.init = function () {
        dataserviceContract.getPayTimes($rootScope.ContractCode, function (rs) {
            rs = rs.data;
            $scope.model.PayTimes = rs;
        });
    }
    $scope.init();

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    $scope.isAdd = true;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Contract/JTableSchedulePay",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ContractCode = $rootScope.ContractCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataSchedulePay")
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('PayTimes').withTitle('{{"CONTRACT_LBL_TIMES" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Percentage').withTitle('{{"CONTRACT_LBL_PERCENT" | translate}}').renderWith(function (data, type) {
        var percent = data != null && data != '' && data != undefined ? data + '%' : '';
        return '<span class="bold">' + percent + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Money').withTitle('{{"CONTRACT_LBL_THE_VALUE_OF_MONEY" | translate}}').renderWith(function (data, type) {
        var money = data != "" ? $filter('currency')(data, '', 0) : null;
        return '<span class="bold text-danger">' + money + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EstimateTime').withTitle('{{"CONTRACT_LBL_INTEND_TIME" | translate}}').renderWith(function (data, type) {
        return data != null && data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Condition').withTitle('{{"CONTRACT_LBL_INTEND_CONDITION" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withTitle('{{"CONTRACT_LBL_INTEND_MASS" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"CONTRACT_CURD_TAB_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<a title="Sửa" ng-click="edit(' + full.Id + ')"  class="fs25 pr10"><i class="fas fa-edit"></i></a>' +
            '<a title="Xoá" ng-click="delete(' + full.Id + ')"  class="fs25"><i class="fas fa-trash"></i></a>';
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

    $scope.changleSelect = function (SelectType) {

    }
    $scope.reload = function () {
        reloadData(true);
    }
    $rootScope.reloadSchedulePay = function () {
        $scope.reload();
    }
    $scope.add = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
            $scope.model.ContractCode = $rootScope.ContractCode;
            dataserviceContract.insertContractSchedulePay($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    $scope.reload();
                    App.toastrSuccess(rs.Title);
                    $scope.model.PayTimes = $scope.model.PayTimes + 1;
                    //$uibModalInstance.close(rs.Object);
                }
            })
        }
    }
    $scope.edit = function (id) {
        $scope.isAdd = false;
        $scope.editId = id;
        var listdata = $('#tblDataSchedulePay').DataTable().data();
        for (var i = 0; i < listdata.length; ++i) {
            if (listdata[i].Id == id) {
                var item = listdata[i];
                $scope.model.PayTimes = item.PayTimes;
                $scope.model.Percentage = item.Percentage;
                $scope.model.Money = item.Money;
                $scope.model.EstimateTime = item.EstimateTime;

                $scope.model.sEstimateTime = ($scope.model.EstimateTime != null ? $filter('date')(new Date($scope.model.EstimateTime), 'dd/MM/yyyy') : "");
                $scope.model.Condition = item.Condition;
                $scope.model.Quantity = item.Quantity;
                $scope.model.Note = item.Note;
                break;
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
                    dataserviceContract.deleteContractSchedulePay(id, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $rootScope.reloadSchedulePay();
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
            sEstimateTime: '',
            Percentage: '',
            Money: '',
            Note: '',
            Condition: '',
            Quantity: '',
            PayTimes: '',
        }
    }
    $scope.save = function () {

        $scope.model.Id = $scope.editId;
        $scope.model.ContractCode = $rootScope.ContractCode;
        validationSelect($scope.model);
        if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
            dataserviceContract.updateContractSchedulePay($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    $scope.editId = -1;
                    $rootScope.reloadSchedulePay();
                    App.toastrSuccess(rs.Title);
                    dataserviceContract.getPayTimes($rootScope.ContractCode, function (rs) {
                        rs = rs.data;
                        $scope.model.PayTimes = rs;
                    });
                    $scope.close();
                }
            })
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        return mess;
    };
    function loadDate() {
        $("#estimateDate").datepicker({
            useCurrent: false,
            autoclose: true,
            keepOpen: false,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
        });
    }
    setTimeout(function () {
        loadDate();
    }, 200);
});

//tab service
app.controller('contractTabService', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceContract, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        ServiceCode: '',
        Quantity: 1,
        Currency: '',
        Tax: 10
    }
    $scope.isExtend = false;
    $scope.isAdd = true;
    //khách lẻ
    $scope.currencys = [
        {
            Code: 'JPY',
            Name: 'Yên'
        },
        {
            Code: 'VND',
            Name: 'VND'
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
            url: "/Admin/Contract/JTableContractService",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                $rootScope.Budget = 0;
                $rootScope.RealBudget = 0;
                $rootScope.serviceJtable = {};
                d.ContractCode = $rootScope.ContractCode;
                d.Service = $scope.model.Service;
            },
            complete: function () {
                heightTableManual(250, "#tblDataService")
                App.unblockUI("#contentMain");
                for (var i in $rootScope.serviceJtable) {
                    var data = $rootScope.serviceJtable[i];
                    try {
                        var cost = parseFloat(data.Cost) * parseInt(data.Quantity);
                        $rootScope.Budget = $rootScope.Budget + cost; //+ cost * data.Tax / 100;
                    } catch (Ex) {
                        console.log("co loi");
                        console.log(data);
                    }

                }
                console.log("tong " + $rootScope.Budget);
                if ($scope.serviceTotalCost.length == 0) {
                    dataserviceContract.getCostTotalContract(function (rs) {
                        rs = rs.data;
                        $scope.serviceTotalCost = rs;
                        $scope.filterTotalCost();
                    });
                }
                else {
                    $scope.filterTotalCost();
                }
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('ServiceCode').withTitle('{{"CONTRACT_TAB_LOS_LIST_COL_SERVICE_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'class18'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ServiceName').withTitle('{{"CONTRACT_TAB_LOS_LIST_COL_SERVICE_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'class18'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Cost').withTitle('{{"CONTRACT_TAB_LOS_LIST_COL_COST" | translate}}').renderWith(function (data, type) {
        var dt = data != "" ? $filter('currency')(data, '', 0) : '';
        dt = "<span class= 'text-danger' style = 'font-weight:bold'>" + dt + "</span>";
        return dt;
    }).withOption('sClass', 'class18'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withTitle('{{"CONTRACT_TAB_LOS_LIST_COL_QUANTITY" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('currency')(data, '', 0) : '';
    }).withOption('sClass', 'class9'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('').withTitle('{{"CONTRACT_TAB_LOS_LIST_COL_TOTAL" | translate}}').renderWith(function (data, type, full) {
        var cost = parseFloat(full.Cost) * parseFloat(full.Quantity);
        var dt = cost != "" ? $filter('currency')(cost, '', 0) : '';
        dt = "<span  class= 'text-danger' style = 'font-weight:bold'>" + dt + "</span>";
        return dt;
    }).withOption('sClass', 'class18'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Tax').withTitle('{{"CONTRACT_TAB_LOP_LIST_COL_TAX" | translate}}').renderWith(function (data, type, full) {
        return '<span class ="bold">' + data + '</span>';
    }).withOption('sClass', 'class9'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TaxMoney').withTitle('{{"CONTRACT_LBL_TAX_MONEY" | translate}}').renderWith(function (data, type, full) {
        var cost = ((full.Quantity * full.Cost) * full.Tax) / 100;
        var dt = cost != "" ? $filter('currency')(cost, '', 0) : 0;
        return '<span class= "text-danger bold">' + dt + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('').withTitle('{{"CONTRACT_TAB_LOS_LIST_COL_AFTER_TAX" | translate}}').renderWith(function (data, type, full) {
        var cost = parseFloat(full.Cost) * parseFloat(full.Quantity);
        cost = cost + cost * parseFloat(full.Tax) / 100;
        var dt = cost != "" ? $filter('currency')(cost, '', 0) : '';
        dt = "<span  class= 'text-danger' style = 'font-weight:bold'>" + dt + "</span>";
        return dt;
    }).withOption('sClass', 'class9'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Unit').withTitle('{{"CONTRACT_TAB_LOS_LIST_COL_UNIT" | translate}}').renderWith(function (data, type) {
        for (var i = 0; i < $rootScope.ListCommon.length; i++) {
            if ($rootScope.ListCommon[i].Code == data) {
                return $rootScope.ListCommon[i].Name;
                break;
            }
        }
    }).withOption('sClass', 'class9'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Currency').withTitle('{{"CONTRACT_TAB_LOS_LIST_COL_CURRENCY" | translate}}').renderWith(function (data, type) {
    //    if (data == "VND")
    //        return "VNĐ";
    //    else if (data == "USD")
    //        return "USD";
    //    else if (data == "JPY")
    //        return "Yên";
    //    else return data;
    //}).withOption('sClass', 'class9'));


    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<a title="Sửa" ng-click="edit(' + full.Id + ')" class="fs25 pr10"><i class="fas fa-edit"style="--fa-primary-color: green;"></i></a>' +
            '<a title="Xoá" ng-click="delete(' + full.Id + ')" class="fs25"><i class="fas fa-trash"style="--fa-primary-color: red;"></i></a>';
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
    $rootScope.reloadTabService = function () {
        $scope.reload();
    }
    function validationSelect(data, Type) {

        var mess = { Status: false, Title: "" }
        if (data.ServiceCode == "" || data.ServiceCode == null) {
            $scope.errorServiceCode = true;
            mess.Status = true;
        } else {
            $scope.errorServiceCode = false;
        }

        if (data.Cost == undefined || data.Cost == null || data.Cost <= 0) {
            $scope.errorCost = true;
            mess.Status = true;
        } else {
            $scope.errorCost = false;
        }
        //if (data.Currency == "" || data.Currency == null) {
        //    $scope.errorCurrency = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorCurrency = false;
        //}
        if (data.Unit == "" || data.Unit == null) {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;
        }
        if (data.Tax != null && data.Tax != undefined && data.Tax < 0) {
            $scope.errorTax = true;
            mess.Status = true;
        } else {
            $scope.errorTax = false;
        }
        if (data.Quantity == null || data.Quantity == undefined || data.Quantity <= 0) {
            $scope.errorQuantity = true;
            mess.Status = true;
        } else {
            $scope.errorQuantity = false;
        }
        if ($scope.isExtend) {
            if (Type == "INSERT") {
                if (data.ServiceCondition == "" || data.ServiceCondition == null) {
                    $scope.errorServiceCondition = true;
                    mess.Status = true;
                } else {
                    $scope.errorServiceCondition = false;
                }
                if (data.Range == null) {
                    $scope.errorRange = true;
                    mess.Status = true;
                } else {
                    $scope.errorRange = false;
                }
            }
        }
        return mess;
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
    $scope.add = function () {

        $scope.isAdd = true;
        validationSelect($scope.model, "INSERT");
        if ($scope.addformTabService.validate() && !validationSelect($scope.model, "INSERT").Status) {
            $scope.model.ContractCode = $rootScope.ContractCode;
            $scope.model.Note = $scope.getDescription();
            if ($scope.model.Tax == null || $scope.model.Tax == "") {
                $scope.model.Tax = 0;
            }
            if ($scope.isExtend != true) {
                if ($scope.serviceDetails.length == 0) {
                    App.toastrWarning(caption.CONTRAT_CURD_MSG_PLEASE_SELECT_THE_STANDARD_SERVICE_AGAIN);
                }
                else {
                    dataserviceContract.insertService($scope.model, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        }
                        else {
                            $scope.model = {
                                ServiceCode: '',
                                Quantity: 1,
                                Cost: '',
                                Unit: '',
                                Currency: 'VND',
                                Tax: 0
                            }
                            App.toastrSuccess(rs.Title);
                            $scope.serviceDetails = [];
                            $scope.reload();
                            $rootScope.amountbudget(rs.Object);
                        }
                    });
                }
            } else {
                if ($scope.model.ServiceCondition != "SERVICE_CONDITION_000" && $scope.serviceDetails.length == 0) {
                    App.toastrWarning(caption.CONTRAT_CURD_MSG_PLEASE_ENTER_FULL_INFORMATION);
                    $scope.model.ServiceCondition = "";
                    $scope.model.Range = null;
                }
                else {
                    dataserviceContract.insertService($scope.model, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        }
                        else {
                            $scope.model = {
                                ServiceCode: '',
                                Quantity: 1,
                                Cost: '',
                                Unit: '',
                                Currency: 'VND',
                                Tax: 0
                            }
                            App.toastrSuccess(rs.Title);
                            $scope.serviceDetails = [];
                            $scope.reload();
                            $rootScope.amountbudget(rs.Object);
                        }
                    });
                }
            }
        }

        //var msg = "";
        //if ($scope.model.ServiceCode == null || $scope.model.ServiceCode == '' || $scope.model.ServiceCode == undefined) {
        //    msg = "Vui lòng chọn dịch vụ";
        //}
        //if ($scope.model.Quantity == null || $scope.model.Quantity == '' || $scope.model.Quantity == undefined) {
        //    if (msg == "")
        //        msg = "Vui lòng chọn số lượng";
        //    else
        //        msg = msg + "</br> Vui lòng chọn số lượng";
        //}
        //if ($scope.model.Cost == null || $scope.model.Cost == '' || $scope.model.Cost == undefined) {
        //    if (msg == "")
        //        msg = "Vui lòng nhập giá";
        //    else
        //        msg = msg + "</br> Vui lòng nhập giá";
        //}
        //if (msg == "") {
        //    $scope.model.ContractCode = $rootScope.ContractCode;
        //    $scope.model.Note = $scope.getDescription();

        //    if ($scope.isExtend != true) {
        //        if ($scope.serviceDetails.length == 0) {
        //            App.toastrWarning("Vui lòng chọn lại dịch vụ chuẩn");
        //        }
        //        else {
        //            dataserviceContract.insertService($scope.model, function (rs) {rs=rs.data;
        //                if (rs.Error) {
        //                    App.toastrError(rs.Title);
        //                }
        //                else {
        //                    $scope.model = {
        //                        ServiceCode: '',
        //                        Quantity: 1,
        //                        Cost: '',
        //                        Unit: '',
        //                        Currency: 'VND',
        //                        Tax: 0
        //                    }
        //                    App.toastrSuccess(rs.Title);
        //                    $scope.serviceDetails = [];
        //                    $scope.reload();

        //                }
        //            });
        //        }
        //    } else {
        //        if ($scope.model.ServiceCondition != "SERVICE_CONDITION_000" && $scope.serviceDetails.length == 0) {
        //            App.toastrWarning("Vui lòng nhập đầy đủ thông tin");
        //            $scope.model.ServiceCondition = "";
        //            $scope.model.Range = "";
        //        }
        //        else {
        //            dataserviceContract.insertService($scope.model, function (rs) {rs=rs.data;
        //                if (rs.Error) {
        //                    App.toastrError(rs.Title);
        //                }
        //                else {
        //                    $scope.model = {
        //                        ServiceCode: '',
        //                        Quantity: 1,
        //                        Cost: '',
        //                        Unit: '',
        //                        Currency: 'VND',
        //                        Tax: 0
        //                    }
        //                    App.toastrSuccess(rs.Title);
        //                    $scope.serviceDetails = [];
        //                    $scope.reload();
        //                }
        //            });
        //        }
        //    }
        //}
        //else {
        //    App.toastrWarning(msg);
        //}
    }
    $scope.edit = function (id) {
        //$scope.changeExtend();
        $scope.isAdd = false;
        $scope.editId = id;
        var listdata = $('#tblDataService').DataTable().data();
        for (var i = 0; i < listdata.length; ++i) {
            if (id == listdata[i].Id) {

                var count = 0;
                var data = listdata[i];
                $scope.model.Id = data.Id;
                $scope.model.ServiceCode = data.ServiceCode;
                $scope.model.Quantity = parseInt(data.Quantity);
                $scope.model.Cost = parseFloat(data.Cost);
                $scope.model.Unit = data.Unit;
                $scope.model.Currency = data.Currency;
                $scope.model.Tax = parseFloat(data.Tax);
                $scope.calTax();
                $scope.serviceDetails = [];
                var note = data.Note;
                if (note.length > 0) {
                    var arr = note.split(';');
                    for (var j = 0; j < arr.length; ++j) {
                        var item = arr[j];
                        if (item.length > 0) {
                            var arr1 = item.split('|');
                            if (arr1.length == 2) {
                                if ($rootScope.customerType == "LE") {
                                    var le = $scope.unExcludeCondition[1];
                                    if (arr1[0] == le) {
                                        var data1 = $rootScope.map[$scope.model.ServiceCode + "|" + arr1[0]];
                                        if (data1 != undefined) {
                                            data1.Id = count;
                                            $scope.serviceDetails.push(data1);
                                            count++;
                                        }
                                    }
                                    else {
                                        var data1 = $rootScope.map[$scope.model.ServiceCode + "|" + arr1[0] + "|" + arr1[1]];
                                        if (data1 != undefined) {
                                            data1.Id = count;
                                            $scope.serviceDetails.push(data1);
                                            count++;
                                        }
                                    }
                                }
                                else if ($rootScope.customerType == "DAILY") {
                                    var daily = $scope.unExcludeCondition[3];
                                    if (arr1[0] == daily) {
                                        var data1 = $rootScope.map[$scope.model.ServiceCode + "|" + arr1[0]];
                                        if (data1 != undefined) {
                                            data1.Id = count;
                                            $scope.serviceDetails.push(data1);
                                            count++;
                                        }
                                    }
                                    else {
                                        var data1 = $rootScope.map[$scope.model.ServiceCode + "|" + arr1[0] + "|" + arr1[1]];
                                        if (data1 != undefined) {
                                            data1.Id = count;
                                            $scope.serviceDetails.push(data1);
                                            count++;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                break;
            }
        }
        if ($scope.serviceDetails.length == 1) {
            console.log($scope.serviceDetails);
            console.log($rootScope.excludeCondition);
            var item = $scope.serviceDetails[0];
            if ($rootScope.customerType == "LE") {
                if ($rootScope.excludeCondition[item.Condition] == 1) {
                    $scope.isExtend = false;
                }
                else {
                    $scope.isExtend = true;
                }
            }
            else if ($rootScope.customerType == "DAILY") {
                if ($rootScope.excludeCondition[item.Condition] == 3) {
                    $scope.isExtend = false;
                }
                else {
                    $scope.isExtend = true;
                }
            }
        }
        else {
            $scope.isExtend = true;
        }
        //lọc ra condition từ $rootScope.serviceCost
        $scope.serviceConditions = [];
        $scope.serviceCost = [];
        if ($scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
            for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                var data = $rootScope.serviceCost[i];
                if (data.ServiceCode == $scope.model.ServiceCode && data.Condition != null && data.Condition != '' && data.Condition != undefined) {
                    $scope.serviceConditions.push(data);
                }
            }
            for (var i = 0; i < $scope.serviceConditions.length; ++i) {
                $scope.serviceConditions[i].Code = $scope.serviceConditions[i].Condition;
                $scope.serviceConditions[i].Name = $scope.serviceConditions[i].ConditionName;
            }
            console.log($scope.serviceConditions);
            var hasMap = {};
            for (var i = 0; i < $scope.serviceConditions.length; ++i) {
                var item = $scope.serviceConditions[i];
                hasMap[item.Code] = item;
            }
            $scope.serviceConditions = [];
            for (var i in hasMap) {
                $scope.serviceConditions.push(hasMap[i]);
            }
            for (var i = $scope.serviceConditions.length - 1; i >= 0; --i) {
                var item = $scope.serviceConditions[i];
                if ($rootScope.excludeCondition[item.Code] != undefined) {
                    $scope.serviceConditions.splice(i, 1);
                }
            }
        }

    }
    $scope.close = function (id) {
        $scope.isAdd = true;
        $scope.model = {
            ServiceCode: '',
            Quantity: 1,
            Cost: '',
            Unit: '',
            Currency: 'VND',
            Tax: 0
        }
        $scope.editId = -1;
        $scope.serviceDetails = [];
        $scope.serviceConditions = [];
    }
    $scope.save = function (id) {
        var msg = "";
        if (!validationSelect($scope.model, "UPDATE").Status) {
            $scope.model.ContractCode = $rootScope.ContractCode;
            $scope.model.Note = $scope.getDescription();
            if ($scope.serviceDetails.length == 0 && $scope.isExtend == false) {
                App.toastrWarning(caption.CONTRAT_CURD_MSG_PLEASE_SELECT_THE_STANDARD_SERVICE_AGAIN);
                return;
            }
            if ($scope.serviceDetails.length == 0 && $scope.isExtend == true) {
                App.toastrWarning(caption.CONTRAT_CURD_MSG_PLEASE_SELECT_AN_EXTENDED_SERVICE_AGAIN);
                return;
            }
            $scope.isAdd = true;
            dataserviceContract.updateService($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    $scope.model = {
                        ServiceCode: '',
                        Quantity: 1,
                        Cost: '',
                        Unit: '',
                        Currency: 'VND',
                        Tax: 0
                    }
                    $scope.editId = -1;
                    App.toastrSuccess(rs.Title);
                    $scope.serviceDetails = [];
                    $scope.reload();
                    $rootScope.amountbudget(rs.Object);
                }
            });

        }
        //if ($scope.model.ServiceCode == null || $scope.model.ServiceCode == '' || $scope.model.ServiceCode == undefined) {
        //    msg = "Vui lòng chọn dịch vụ";
        //}
        //if ($scope.model.Quantity == null || $scope.model.Quantity == '' || $scope.model.Quantity == undefined) {
        //    if (msg == "")
        //        msg = "Vui lòng chọn số lượng";
        //    else
        //        msg = msg + "</br> Vui lòng chọn số lượng";
        //}
        //if ($scope.model.Cost == null || $scope.model.Cost == '' || $scope.model.Cost == undefined) {
        //    if (msg == "")
        //        msg = "Vui lòng nhập giá";
        //    else
        //        msg = msg + "</br> Vui lòng nhập giá";
        //}
        //if (msg == "") {
        //    $scope.model.ContractCode = $rootScope.ContractCode;
        //    $scope.model.Note = $scope.getDescription();
        //    if ($scope.serviceDetails.length == 0 && $scope.isExtend == false) {
        //        App.toastrWarning("Vui lòng chọn lại dịch vụ chuẩn");
        //        return;
        //    }
        //    if ($scope.serviceDetails.length == 0 && $scope.isExtend == true) {
        //        App.toastrWarning("Vui lòng chọn lại dịch vụ mở rộng");
        //        return;
        //    }
        //    $scope.isAdd = true;
        //    dataserviceContract.updateService($scope.model, function (rs) {rs=rs.data;
        //        if (rs.Error) {
        //            App.toastrError(rs.Title);
        //        }
        //        else {
        //            $scope.model = {
        //                ServiceCode: '',
        //                Quantity: 1,
        //                Cost: '',
        //                Unit: '',
        //                Currency: 'VND',
        //                Tax: 0
        //            }
        //            $scope.editId = -1;
        //            App.toastrSuccess(rs.Title);
        //            $scope.serviceDetails = [];
        //            $scope.reload();
        //        }
        //    });
        //}
        //else {
        //    App.toastrWarning(msg);
        //}
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;//"Bạn có chắc chắn muốn xóa?";
                $scope.ok = function () {
                    dataserviceContract.deleteServiceDetail(id, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $uibModalInstance.close(result);
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
            $rootScope.amountbudget(d.Object);
        }, function () {
        });
    }
    $scope.changeService = function () {

        $scope.errorServiceCode = false;
        for (var i = 0; i < $scope.services.length; ++i) {
            if ($scope.services[i].Code == $scope.model.ServiceCode) {
                $scope.model.Unit = $scope.services[i].Unit;

                break;
            }
        }

        if ($scope.isExtend == true) {

            //lọc ra condition từ $rootScope.serviceCost
            $scope.serviceConditions = [];
            $scope.serviceDetails = [];
            $scope.model.ServiceCondition = "";
            $scope.serviceCost = [];
            $scope.model.Range = null;
            $scope.model.Cost = "";
            if ($scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
                for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                    var data = $rootScope.serviceCost[i];
                    if (data.ServiceCode == $scope.model.ServiceCode && data.Condition != null && data.Condition != '' && data.Condition != undefined) {

                        var it = $rootScope.excludeCondition[data.Condition];
                        if (it == undefined) {
                            $scope.serviceConditions.push(data);

                        }
                    }
                }
                for (var i = 0; i < $scope.serviceConditions.length; ++i) {
                    $scope.serviceConditions[i].Code = $scope.serviceConditions[i].Condition;
                    $scope.serviceConditions[i].Name = $scope.serviceConditions[i].ConditionName;
                }
                console.log($scope.serviceConditions);
                var hasMap = {};
                for (var i = 0; i < $scope.serviceConditions.length; ++i) {
                    var item = $scope.serviceConditions[i];
                    hasMap[item.Code] = item;
                }
                $scope.serviceConditions = [];
                for (var i in hasMap) {
                    $scope.serviceConditions.push(hasMap[i]);
                }

            }
            if ($scope.serviceConditions.length == 0 && $scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
                App.toastrWarning(caption.CONTRAT_CURD_MSG_UNKNOWN_SERVICE_CONDITIONS);
            }
        }
        else {
            //chưa làm
            $scope.changeExtend();
        }

        if ($scope.model.Cost != null && $scope.model.Cost != '' && $scope.model.Cost != undefined) {
            $scope.errorCost = false;
        }

        if ($scope.model.Unit != null && $scope.model.Unit != '' && $scope.model.Unit != undefined) {
            $scope.errorUnit = false;
        }
    }
    $scope.changeCondition = function () {
        $scope.errorServiceCondition = false;
        if ($rootScope.customerType == "LE") {
            var le = $scope.unExcludeCondition[1];
            if ($rootScope.ServiceConditionOld == "SERVICE_CONDITION_000") {
                if ($scope.model.ServiceCondition != "SERVICE_CONDITION_000") {
                    $scope.serviceDetails = [];
                    $scope.model.Cost = "";

                }
            }
            else {
                if ($scope.model.ServiceCondition == "SERVICE_CONDITION_000") {
                    $scope.serviceDetails = [];
                    $scope.model.Cost = "";

                }
            }

            $scope.serviceCost = [];
            var j = 0;
            $scope.model.Range = null;
            if ($scope.model.ServiceCondition == "SERVICE_CONDITION_000") {
                $scope.serviceDetails = [];
                $scope.model.Cost = "";
                $rootScope.ServiceConditionOld = $scope.model.ServiceCondition;
                for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                    var item = $rootScope.serviceCost[i];
                    if (item.ServiceCode == $scope.model.ServiceCode && item.Condition == $scope.model.ServiceCondition) {
                        $scope.model.Cost = item.Price;
                        item.ConditionRange = "";
                        $scope.serviceDetails.push(item);
                        $scope.operationCost();
                        break;
                    }
                }
            }
            else {
                $rootScope.ServiceConditionOld = $scope.model.ServiceCondition;
                if ($scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
                    if ($scope.model.ServiceCondition != null && $scope.model.ServiceCondition != '' && $scope.model.ServiceCondition != undefined) {
                        for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                            var data = $rootScope.serviceCost[i];
                            if (data.ServiceCode == $scope.model.ServiceCode && data.Condition == $scope.model.ServiceCondition) {
                                if (data.ConditionRange.length > 4) {
                                    data.Id = j;
                                    $scope.serviceCost.push(data);
                                    j++;
                                }
                            }
                        }
                    }
                    else {

                    }
                }
            }
        }
        else if ($rootScope.customerType == "DAILY") {
            var daily = $scope.unExcludeCondition[3];
            if ($rootScope.ServiceConditionOld == daily) {
                if ($scope.model.ServiceCondition != daily) {
                    $scope.serviceDetails = [];
                    $scope.model.Cost = "";
                }
            }
            else {
                if ($scope.model.ServiceCondition == daily) {
                    $scope.serviceDetails = [];
                    $scope.model.Cost = "";
                }
            }

            $scope.serviceCost = [];
            var j = 0;
            $scope.model.Range = null;
            if ($scope.model.ServiceCondition == daily) {
                $scope.serviceDetails = [];
                $scope.model.Cost = "";
                $rootScope.ServiceConditionOld = $scope.model.ServiceCondition;
                for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                    var item = $rootScope.serviceCost[i];
                    if (item.ServiceCode == $scope.model.ServiceCode && item.Condition == $scope.model.ServiceCondition) {
                        $scope.model.Cost = item.Price;
                        item.ConditionRange = "";
                        $scope.serviceDetails.push(item);
                        $scope.operationCost();
                        break;
                    }
                }
            }
            else {
                $rootScope.ServiceConditionOld = $scope.model.ServiceCondition;
                if ($scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
                    if ($scope.model.ServiceCondition != null && $scope.model.ServiceCondition != '' && $scope.model.ServiceCondition != undefined) {
                        for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                            var data = $rootScope.serviceCost[i];
                            if (data.ServiceCode == $scope.model.ServiceCode && data.Condition == $scope.model.ServiceCondition) {
                                if (data.ConditionRange.length > 4) {
                                    data.Id = j;
                                    $scope.serviceCost.push(data);
                                    j++;
                                }
                            }
                        }
                    }
                    else {

                    }
                }
            }
        }
    }
    $scope.init = function () {
        //Sơn làm đoạn này
        //$scope.services = $rootScope.ListService;
        $scope.services = [];
        dataserviceContract.getService(function (rs) {
            rs = rs.data;

            if ($rootScope.customerType == "LE") {
                for (var i = 0; i < rs.length; i++) {
                    if (rs[i].ServiceGroup == "DV_002") {
                        $scope.services.push(rs[i]);
                    }
                }
            }
            else if ($rootScope.customerType == "DAILY") {
                for (var i = 0; i < rs.length; i++) {
                    if (rs[i].ServiceGroup == "DV_001") {
                        $scope.services.push(rs[i]);
                    }
                }
            }

            $scope.services = rs;
        });
        dataserviceContract.getServiceUnit(function (rs) {
            rs = rs.data;
            $scope.units = rs;
        });
        dataserviceContract.getServiceCondition(function (rs) {
            rs = rs.data;
            //$rootScope.serviceConditions = rs;
            for (var i = 0; i < rs.length; ++i) {
                var item = rs[i];
                if (item.Priority != null && (1 <= item.Priority && item.Priority <= 4)) {
                    $rootScope.excludeCondition[item.Code] = item.Priority;
                    $rootScope.unExcludeCondition[item.Priority] = item.Code;
                }
            }
        });
        dataserviceContract.getCostByServiceAndCondition(function (rs) {
            rs = rs.data;
            $rootScope.serviceCost = rs;
            if (rs != null) {
                for (var i = 0; i < rs.length; ++i) {
                    var item = rs[i];

                    if (item.ConditionRange != null && item.ConditionRange.length > 0) {
                        if (item.ConditionRange == " -> ")
                            $rootScope.map[item.ServiceCode + "|" + item.Condition] = item;
                        else
                            $rootScope.map[item.ServiceCode + "|" + item.Condition + "|" + item.ConditionRange] = item;
                    }
                    else {
                        $rootScope.map[item.ServiceCode + "|" + item.Condition] = item;
                    }
                }
            }
            //$scope.serviceCost = $rootScope.serviceCost;
            //for (var i = 0; i < $scope.serviceCost.length; ++i) {
            //    $scope.serviceCost[i].Code = $scope.serviceCost[i].Condition;
            //    $scope.serviceCost[i].Name = $scope.serviceCost[i].ConditionRange;
            //}
            //Condition: "SERVICE_CONDITION_002"
            //ConditionName: "Khách hàng thi công"
            //ConditionRange: "12 năm -> 25 năm"
        });
        dataserviceContract.getCostTotalContract(function (rs) {
            rs = rs.data;
            $scope.serviceTotalCost = rs;
        });

    }
    $scope.filterCost = function () {
        $scope.errorRange = false;
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
                    //    $scope.model.Cost = data.Price;
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
                    App.toastrWarning(caption.CONTRAT_CURD_MSG_PLEASE_ENTER_MANUALLY);
                    $scope.model.Cost = '';
                }

            }
            else {

            }
        }
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Unit" && ($scope.model.Unit != "" || $scope.model.Unit != null)) {
            $scope.errorUnit = false;
        }
        if (SelectType == "Tax" && ($scope.model.Tax != null && $scope.model.Tax != undefined && $scope.model.Tax < 0)) {
            $scope.errorTax = true;
        }
        else {
            $scope.errorTax = false;
            if ($scope.model.Tax == null || $scope.model.Tax == undefined) {
                $scope.model.Tax = 0;
            }
            $scope.calTax();
        }
        if (SelectType == "Cost" && ($scope.model.Cost == null || $scope.model.Cost == undefined || $scope.model.Cost <= 0)) {
            $scope.errorCost = true;
        }
        else {
            $scope.errorCost = false;
            $scope.calTax();
        }
        if (SelectType == "Quantity" && ($scope.model.Quantity == null || $scope.model.Quantity == undefined || $scope.model.Quantity <= 0)) {
            $scope.errorQuantity = true;
        }
        else {
            $scope.calTax();
            $scope.errorQuantity = false;
        }
    }
    $scope.operationCost = function () {
        $scope.model.Cost = 0;
        // $scope.model.Cost = data.Price;
        for (var i = 0; i < $scope.serviceDetails.length; ++i) {
            try {
                var item = $scope.serviceDetails[i];
                $scope.model.Cost = $scope.model.Cost + item.Price;
            }
            catch (ex) {

            }
        }
        // giảm giá

    }
    $scope.init();
    $scope.removeserviceDetails = function (indx) {
        $scope.serviceDetails.splice(indx, 1);
        $scope.operationCost();
    }
    $scope.getDescription = function () {
        console.log($scope.serviceDetails);
        var des = "";
        if ($scope.isExtend == false) {
            for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                var item = $rootScope.serviceCost[i];
                if ($rootScope.customerType == "LE") {
                    var code = $rootScope.unExcludeCondition[1];
                    if (item.Condition == code) {
                        return item.Condition + "|";
                    }
                }
                else if ($rootScope.customerType == "DAILY") {
                    var code = $rootScope.unExcludeCondition[3];
                    if (item.Condition == code) {
                        return item.Condition + "|";
                    }
                }
            }
        }
        else {
            for (var i = 0; i < $scope.serviceDetails.length; ++i) {
                des = des + $scope.serviceDetails[i].Code + "|" + $scope.serviceDetails[i].ConditionRange + ";";
            }
        }
        //if ($scope.serviceDetails.length == 0) {
        //    for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
        //        var item = $rootScope.serviceCost[i];
        //        if (item.Condition == "SERVICE_CONDITION_000") {
        //            return item.Condition + "|";
        //        }
        //    }

        //}
        //else {
        //    for (var i = 0; i < $scope.serviceDetails.length; ++i) {
        //        des = des + $scope.serviceDetails[i].Code + "|" + $scope.serviceDetails[i].ConditionRange + ";";
        //    }
        //}
        return des;
    }
    $scope.changeExtend = function () {
        if ($scope.isExtend == true) {
            $scope.changeService();
        } else {
            $scope.serviceConditions = [];
            $scope.serviceDetails = [];
            $scope.model.Cost = "";
            if ($scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
                for (var i in $rootScope.excludeCondition) {
                    var item = $rootScope.excludeCondition[i];
                    if ($rootScope.customerType == "LE") {
                        if (item == 1) {
                            var stand = i;
                            var obj = $rootScope.map[$scope.model.ServiceCode + "|" + stand];
                            if (obj != undefined) {
                                console.log(obj);
                                $scope.model.Cost = obj.Price;
                                obj.Name = obj.ConditionName;
                                obj.ConditionRange = "";
                                $scope.serviceDetails.push(obj);
                            }
                        }
                    }
                    else if ($rootScope.customerType == "DAILY") {
                        if (item == 3) {
                            var stand = i;
                            var obj = $rootScope.map[$scope.model.ServiceCode + "|" + stand];
                            if (obj != undefined) {
                                console.log(obj);
                                $scope.model.Cost = obj.Price;
                                obj.Name = obj.ConditionName;
                                obj.ConditionRange = "";
                                $scope.serviceDetails.push(obj);
                            }
                        }
                    }
                }

            }
        }
    }

    $scope.modelView = {
        TaxMoney: ''
    }
    $scope.calTax = function () {

        $scope.modelView.TaxMoney = Math.round(($scope.model.Tax * $scope.model.Cost * $scope.model.Quantity) / 100);
    }

});

//tab product
app.controller('contractTabProduct', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceContract, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        ProductCode: '',
        PriceOption: '',
        //UnitPrice: 0,
        Tax: 10
    }

    $scope.currentSelectedProduct = null;
    $scope.products = [];
    $scope.productType = "";
    $scope.isAdd = true;
    $scope.isShowImpProduct = true;
    $scope.priceOption = [];
    $rootScope.productJtable = {};

    $scope.priceOptionAgent = [
        { Code: "PRICE_COST_CATELOGUE", Name: "Giá đại lý catalogue" },
        { Code: "PRICE_COST_AIRLINE", Name: "Giá đại lý đường bay" },
        { Code: "PRICE_COST_SEA", Name: "Giá đại lý đường biển" }
    ];
    $scope.priceOptionRetail = [
        { Code: "PRICE_RETAIL_BUILD", Name: "Giá bán lẻ có thi công" },
        { Code: "PRICE_RETAIL_BUILD_AIRLINE", Name: "Giá bán lẻ có thi công bay" },
        { Code: "PRICE_RETAIL_BUILD_SEA", Name: "Giá bán lẻ có thi công kho, biển" },
        { Code: "PRICE_RETAIL_NO_BUILD", Name: "Giá bán lẻ không thi công" },
        { Code: "PRICE_RETAIL_NO_BUILD_AIRLINE", Name: "Giá bán lẻ không thi công bay" },
        { Code: "PRICE_RETAIL_NO_BUILD_SEA", Name: "Giá bán lẻ không thi công kho, biển" }
    ];

    //$scope.currentData = '';
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Contract/JTableProduct",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ContractCode = $rootScope.ContractCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataProductDetail")
                console.log($rootScope.productJtable);
                for (var i in $rootScope.productJtable) {
                    var data = $rootScope.productJtable[i];
                    try {
                        var cost = parseFloat(data.UnitPrice) * parseInt(data.Quantity);
                        $rootScope.Budget = $rootScope.Budget + cost; //+ cost * data.Tax / 100;
                    } catch (Ex) {

                    }
                }
                //console.log("tong " + $rootScope.Budget);
                //if ($scope.serviceTotalCost.length == 0) {
                //    dataserviceContract.getCostTotalContract(function (rs) {rs=rs.data;
                //        $scope.serviceTotalCost = rs;
                //        $scope.filterTotalCost();
                //    });
                //}
                //else {
                //    $scope.filterTotalCost();
                //}
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
            $rootScope.productJtable[dataIndex] = data;
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);

            //double click trên 1 dòng
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var row = $(evt.target).closest('tr');
                    // data key value
                    var key = row.attr("data-id");
                    // cell values
                    var Id = row.find('td:eq(1)').text();
                    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                        $scope.selected[data.Id] = !$scope.selected[data.Id];
                    } else {
                        var self = $(this).parent();
                        $('#tblDataProductDetail').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.Id] = true;

                        var objPara = {
                            ProductCode: data.ProductCode,
                            ProductType: data.ProductType,
                            ContractCode: $rootScope.ContractCode,
                        }
                        var modalInstance = $uibModal.open({
                            animation: true,
                            templateUrl: ctxfolderContract + '/contractTabProductDetail.html',
                            controller: 'contractTabProductDetail',
                            backdrop: 'static',
                            size: '40',
                            resolve: {
                                para: function () {
                                    return objPara;
                                }
                            }
                        });
                        modalInstance.result.then(function (d) {
                            $scope.reload();
                        }, function () {
                        });
                    }
                    $scope.$apply();
                }
            });
        });
    //end option table
    //Tạo các cột của bảng để đổ dữ liệu vào
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductCode').withTitle('{{"CONTRACT_TAB_LOP_LIST_COL_PRODUCT_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UnitPrice').withTitle('{{"CONTRACT_TAB_LOP_LIST_COL_UNIT_PRICE" | translate}}').renderWith(function (data, type) {
        var dt = data != "" ? $filter('currency')(data, '', 0) : null;
        return '<span class= "text-danger bold">' + dt + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withTitle('{{"CONTRACT_TAB_LOP_LIST_COL_QUANTITY" | translate}}').renderWith(function (data, type) {
        var dt = data != "" ? $filter('currency')(data, '', 0) : null;
        return dt;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('sUnit').withTitle('{{"CONTRACT_TAB_LOP_LIST_COL_S_UNIT" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Tax').withTitle('{{"CONTRACT_TAB_LOP_LIST_COL_TAX" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TaxMoney').withTitle('{{"CONTRACT_LBL_TAX_MONEY" | translate}}').renderWith(function (data, type, full) {
        var cost = ((full.Quantity * full.UnitPrice) * full.Tax) / 100;
        var dt = cost != "" ? $filter('currency')(cost, '', 0) : 0;
        return '<span class= "text-danger bold">' + dt + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TotalPrice').withTitle('{{"CONTRACT_TAB_LOP_LIST_COL_TOTAL_PRICE" | translate}}').renderWith(function (data, type, full) {
        var cost = full.Quantity * full.UnitPrice;
        var dt = cost != "" ? $filter('currency')(cost, '', 0) : null;
        return '<span class= "text-danger bold">' + dt + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('').withTitle('{{"CONTRACT_TAB_LOP_LIST_COL_AFTER_TAX" | translate}}').renderWith(function (data, type, full) {
        var cost = full.Quantity * full.UnitPrice + (full.Quantity * full.UnitPrice) * full.Tax / 100;
        var dt = cost != "" ? $filter('currency')(cost, '', 0) : null;
        return '<span class= "text-danger bold">' + dt + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"CONTRACT_TAB_LOP_LIST_COL_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StatusName').withTitle('{{"CONTRACT_LIST_COL_ORDER_STATUS" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<a title="Sửa" ng-click="edit(' + full.Id + ')" class="fs25 pr10"><i class="fas fa-edit"style="--fa-primary-color: green;"></i></a>' +
            '<a title="Xoá" ng-click="delete(' + full.Id + ')" class="fs25"><i class="fas fa-trash"style="--fa-primary-color: red;"></i></a>';
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
    function validationselectTabProject(data) {
        var mess = { Status: false, Title: "" }
        if (data.ProductCode == "" || data.ProductCode == null) {
            $scope.errorProductCode = true;
            mess.Status = true;
        } else {
            $scope.errorProductCode = false;
        }
        if (data.Unit == "" || data.Unit == null) {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;
        }
        if (data.UnitPrice == undefined || data.UnitPrice == null || data.UnitPrice <= 0) {
            $scope.errorUnitPrice = true;
            mess.Status = true;
        } else {
            $scope.errorUnitPrice = false;
        }
        if (data.Tax != null && data.Tax != undefined && data.Tax < 0) {
            $scope.errorTax = true;
            mess.Status = true;
        } else {
            $scope.errorTax = false;
        }
        if (data.Quantity == null || data.Quantity == undefined || data.Quantity <= 0) {
            $scope.errorQuantity = true;
            mess.Status = true;
        } else {
            $scope.errorQuantity = false;
        }
        return mess;
    }
    $scope.changleSelect = function (SelectType) {

        //if (SelectType == "ProductCode" && $scope.model.ProductCode != "") {
        //    $scope.errorProductCode = false;
        //}
        if (SelectType == "Unit" && $scope.model.Unit != "") {
            $scope.errorUnit = false;
        }
        if (SelectType == "Tax" && ($scope.model.Tax != null && $scope.model.Tax != undefined && $scope.model.Tax < 0)) {
            $scope.errorTax = true;
            $scope.calTax();
        }
        else {
            $scope.errorTax = false;
            if ($scope.model.Tax == null || $scope.model.Tax == undefined) {
                $scope.model.Tax = 0;
            }
            $scope.calTax();
        }

        if (SelectType == "UnitPrice" && ($scope.model.UnitPrice == null || $scope.model.UnitPrice == undefined || $scope.model.UnitPrice <= 0)) {
            $scope.errorUnitPrice = true;
        }
        else {
            $scope.errorUnitPrice = false;
            $scope.calTax();
        }
        if (SelectType == "Quantity" && ($scope.model.Quantity == null || $scope.model.Quantity == undefined || $scope.model.Quantity <= 0)) {
            $scope.errorQuantity = true;
        }
        else {
            $scope.errorQuantity = false;
            $scope.calTax();
        }
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $rootScope.reloadTabProduct = function () {
        $scope.reload();
    }
    $scope.changeProduct = function () {
        //$scope.errorProductCode = false;
        var item = null;
        for (var i = 0; i < $scope.products.length; ++i) {
            if ($scope.products[i].Code == $scope.model.ProductCode) {
                item = $scope.products[i];
                $scope.currentSelectedProduct = item;
                break;
            }
        }
        if (item != null) {
            $scope.errorUnit = false;
            if ($scope.units.findIndex(x => x.Code == item.Unit) != -1) {
                $scope.model.Unit = item.Unit;
            }
            else {
                $scope.errorUnit = true;
                $scope.model.Unit = "";
            }
            $scope.model.Tax = item.Tax;
            $scope.productType = item.ProductType;
            $scope.pack = item.Pack;
            $scope.packJson = JSON.stringify($rootScope.jsonSpecification($scope.pack));
        }
        $scope.filterPrice();
    }
    $scope.filterPrice = function () {
        if ($scope.model.ProductCode != '' && $scope.model.PriceOption != '' && $scope.currentSelectedProduct != null) {
            var price = 0;
            if ($scope.model.PriceOption == "PRICE_COST_CATELOGUE")
                price = $scope.currentSelectedProduct.PriceCostCatelogue;
            if ($scope.model.PriceOption == "PRICE_COST_AIRLINE")
                price = $scope.currentSelectedProduct.PriceCostAirline;
            if ($scope.model.PriceOption == "PRICE_COST_SEA")
                price = $scope.currentSelectedProduct.PriceCostSea;
            if ($scope.model.PriceOption == "PRICE_RETAIL_BUILD")
                price = $scope.currentSelectedProduct.PriceRetailBuild;
            if ($scope.model.PriceOption == "PRICE_RETAIL_BUILD_AIRLINE")
                price = $scope.currentSelectedProduct.PriceRetailBuildAirline;
            if ($scope.model.PriceOption == "PRICE_RETAIL_BUILD_SEA")
                price = $scope.currentSelectedProduct.PriceRetailBuildSea;
            if ($scope.model.PriceOption == "PRICE_RETAIL_NO_BUILD")
                price = $scope.currentSelectedProduct.PriceRetailNoBuild;
            if ($scope.model.PriceOption == "PRICE_RETAIL_NO_BUILD_AIRLINE")
                price = $scope.currentSelectedProduct.PriceRetailNoBuildAirline;
            if ($scope.model.PriceOption == "PRICE_RETAIL_NO_BUILD_SEA")
                price = $scope.currentSelectedProduct.PriceRetailNoBuildSea;
            $scope.model.UnitPrice = price;
        }
    }
    $scope.validator = function (data) {

        var msg = { Error: false, Title: null };
        if (data.ProductCode == null || data.ProductCode == '' || data.ProductCode == undefined) {
            msg.Error = true;
            msg.Title = "Vui lòng chọn sản phẩm";
        }
        //if (data.Quantity == null || data.Quantity == '' || data.Quantity == undefined) {
        //    msg.Error = true;
        //    if (msg.Title != null)
        //        msg.Title = msg.Title + "</br>Vui lòng nhập số lượng";
        //    else
        //        msg.Title = "Vui lòng nhập số lượng";
        //}
        if (data.UnitPrice == null) {
            msg.Error = true;
            if (msg.Title != null)
                msg.Title = msg.Title + "</br>Vui lòng nhập giá";
            else
                msg.Title = "Vui lòng nhập giá";
        }
        if (data.UnitPrice == '') {
            msg.Error = true;
            if (msg.Title != null)
                msg.Title = msg.Title + "</br>Vui lòng nhập giá";
            else
                msg.Title = "Vui lòng nhập giá";
        }
        if (data.UnitPrice == undefined) {
            msg.Error = true;
            if (msg.Title != null)
                msg.Title = msg.Title + "</br>Vui lòng nhập giá";
            else
                msg.Title = "Vui lòng nhập giá";
        }
        //if (data.Tax == null || data.Tax == '' || data.Tax == undefined) {
        //    msg.Error = true;
        //    if (msg.Title != null)
        //        msg.Title = msg.Title + "</br>Vui lòng nhập thuế";
        //    else
        //        msg.Title = "Vui lòng nhập thuế";
        //}
        return msg;
    }
    $scope.add = function () {
        var obj = {
            ContractCode: $rootScope.ContractCode,
            ProductCode: $scope.model.ProductCode,
            ProductType: $scope.productType,
            Quantity: $scope.model.Quantity,
            Cost: $scope.model.UnitPrice,
            Unit: $scope.model.Unit,
            Tax: ($scope.model.Tax == null || $scope.model.Tax == '') ? 0 : $scope.model.Tax,
            Note: $scope.model.Note,
            PriceType: $scope.model.PriceOption,
            PackJson: $scope.packJson,
            Pack: $scope.pack
        }
        validationselectTabProject($scope.model);
        if (validationselectTabProject($scope.model).Status == false) {
            dataserviceContract.insertProduct(obj, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    $scope.reload();
                    App.toastrError(rs.Title);
                    if (rs.ID != '' && rs.ID < 0) {
                        $rootScope.amountbudget(rs.Object);
                    }
                }
                else {
                    debugger
                    $scope.reload();
                    $rootScope.amountbudget(rs.Object);
                    App.toastrSuccess(rs.Title);

                }
            });
        }
    }
    $scope.edit = function (id) {
        //$scope.changeExtend();
        $scope.isAdd = false;
        $scope.editId = id;
        var listdata = $('#tblDataProductDetail').DataTable().data();
        for (var i = 0; i < listdata.length; ++i) {
            if (listdata[i].Id == id) {
                var item = listdata[i];
                $scope.model.ProductCode = item.ProductCode;
                $scope.model.Quantity = item.Quantity;
                $scope.model.UnitPrice = item.UnitPrice;
                $scope.model.Unit = item.Unit;
                $scope.model.Tax = ((item.Tax != null && item.Tax != '') ? '' + item.Tax : '10');
                $scope.model.Note = item.Note;
                $scope.model.PriceOption = item.PriceType;
                $scope.calTax();
                break;
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
                    dataserviceContract.deleteProductInContract(id, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $uibModalInstance.close(result.Object);
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
            $rootScope.amountbudget(d);
        }, function () {
        });
    }

    $scope.modelView = {
        TaxMoney: ''
    }
    $scope.calTax = function () {

        $scope.modelView.TaxMoney = Math.round(($scope.model.Tax * $scope.model.UnitPrice * $scope.model.Quantity) / 100);
    }

    $scope.init = function () {
        $scope.priceOption = [];
        if ($rootScope.customerType == "LE")
            $scope.priceOption = $scope.priceOptionRetail;
        else
            $scope.priceOption = $scope.priceOptionAgent;
        dataserviceContract.getProductCost(function (rs) {
            rs = rs.data;
            $scope.products = rs;

        });
        dataserviceContract.getProductUnit(function (rs) {
            rs = rs.data;
            $scope.units = rs;
        });
    }
    $scope.init();
    $rootScope.initPrice = function () {
        //
        dataserviceContract.getPriceOption($rootScope.CustomerCode, function (rs) {
            rs = rs.data;
            $scope.priceOption = rs.Object;
        })
    }
    $rootScope.initPriceContract = function () {

        if ($rootScope.customerType == "LE")
            $scope.priceOption = $scope.priceOptionRetail;
        else
            $scope.priceOption = $scope.priceOptionAgent;
    }
    $scope.close = function (id) {
        $scope.isAdd = true;
        $scope.model = {
            ServiceCode: '',
            Quantity: 1,
            Cost: '',
            Unit: '',
            //Currency: 'VND',
            Tax: 10
        }
        $scope.modelView.TaxMoney = '';
        $scope.editId = -1;
        $scope.serviceDetails = [];
        $scope.serviceConditions = [];
    }
    $scope.save = function (id) {
        if ($scope.model.Tax == null || $scope.model.Tax == undefined) {
            $scope.model.Tax = 0;
        }
        validationselectTabProject($scope.model);
        //var msg = $scope.validator($scope.model);
        //if (msg.Error == true) {
        //    App.toastrWarning(msg.Title);
        //    return;
        //}
        var md = {};
        md.ContractCode = $rootScope.ContractCode;
        md.ProductCode = $scope.model.ProductCode;
        md.Quantity = $scope.model.Quantity;
        md.Cost = $scope.model.UnitPrice;
        md.Unit = $scope.model.Unit;
        md.Tax = $scope.model.Tax;
        md.Note = $scope.model.Note;

        md.ContractHeaderID = $rootScope.ContractId;
        md.ContractCode = $rootScope.ContractCode;
        md.PriceType = $scope.model.PriceOption;
        md.ProductType = $scope.productType;

        if (/*$scope.addformTabProduct.validate() && */validationselectTabProject($scope.model).Status == false) {
            dataserviceContract.updateProductInContract(md, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                    if (rs.ID != '' && rs.ID < 0) {
                        $scope.reload();
                        $rootScope.amountbudget(rs.Object);
                    }
                }
                else {
                    $scope.isAdd = true;
                    $scope.model = {
                        ServiceCode: '',
                        Quantity: 1,
                        Cost: '',
                        Unit: '',
                        //Currency: 'VND',
                        Tax: 10
                    }
                    $scope.editId = -1;
                    App.toastrSuccess(rs.Title);
                    $scope.serviceDetails = [];
                    $scope.reload();
                    $rootScope.amountbudget(rs.Object);
                }
            });
        }
    }

    //Add material product
    $scope.addMaterialProd = function () {
        $rootScope.ProductCode = '';
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderMaterialProd + '/add.html',
            controller: 'addMaterialProd',
            backdrop: 'static',
            size: '60',
            resolve: {
                para: function () {
                    return null;
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceContract.getProductCost(function (rs) {
                rs = rs.data;
                $scope.products = rs;
            });
        }, function () {
        });
    }

});
app.controller('contractTabProductDetail', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataserviceContract, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.model = {};
    $scope.modelViewProductDetail = {
        ProductCode: para.ProductCode,
        WarningNotData: false,
    };

    $scope.initData = function () {
        dataserviceContract.getItemProductInContract(para.ContractCode, para.ProductCode, para.ProductType, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {

                $scope.model.ListData = rs.Object;
                if (rs.Object.length == 0) {

                    $scope.modelViewProductDetail.WarningNotData = true;
                }
            }
        });
    }
    $scope.initData();

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 50);

});

//tab card
app.controller('contractTabCardJob', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceContract, $filter) {
    var listObject = [];
    var obj = {
        Code: $rootScope.ContractCode,
        Name: $rootScope.ContractName
    }
    listObject.push(obj);
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/CardJob/GetGridCard",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ListObjCode = listObject;
                d.BoardCode = "";
                d.CardName = "";
                d.Fromdate = "";
                d.Todate = "";
                d.Status = "";
                d.Object = "";
                d.BranchId = "";
                d.ObjType = "";
                d.WorkflowInstCode = "";
                d.TabBoard = 7;
            },
            complete: function (d) {
                App.unblockUI("#contentMain");
                $(".dataTables_scrollBody").addClass('scroller-sm-fade');
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(3)
        .withOption('order', [0, 'asc'])
        .withOption('serverSide', true)
        //.withOption('scrollY', "62vh")
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiled) {
                $scope.headerCompiled = true;
                $compile(angular.element(header).contents())($scope);
            }
        })
        .withOption('initComplete', function (settings, json) {
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            $compile(angular.element(row))($scope);
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    $rootScope.CardCode = data.CardCode;
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: ctxfolderCardJob + '/add-card-buffer.html',
                        controller: 'edit-cardCardJob',
                        size: '80',
                        backdrop: 'static',
                        keyboard: false,
                        resolve: {
                            para: function () {
                                return data.CardCode;
                            }
                        }
                    });
                    modalInstance.result.then(function (d) {
                        $rootScope.reloadGridCard();
                        updateNotify();
                    }, function () { });
                }
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("CardID").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CardName').withTitle('<i class="fa fa-paper-plane mr5"></i>{{"CJ_COL_CARD_NAME" | translate}}').renderWith(function (data, type, full) {
        var deadLine = '';
        var workType = "";
        var priority = "";
        var updateTimeTxt = "";
        var showLadbelApprove = "";
        var groupAssign = "";
        var departmentAssign = "";
        var wfName = "";
        var actName = "";
        if (full.DepartmentAssign != "") {
            departmentAssign = '<br/><span class="fs9 black">' + caption.CJ_CURD_BTN_DEPARTMENT + ': ' + full.DepartmentAssign + '</span>'
        }
        if (full.GroupAssign != "") {
            groupAssign = '<br/><span class="fs9 black">' + caption.CJ_CURD_BTN_TEAM + ': ' + full.GroupAssign + '</span>'
        }
        if (full.IsShowLabelAssign == 'True') {
            showLadbelApprove = '</br><img src="/images/default/icon-warning.gif" style = "width: 17px; height: 17px;"/><span class="fs9 blink">' + caption.CJ_LBL_APPROVE_EMP + ' ! </span>'
        }

        if (full.WfName != "") {
            wfName = '<br/><span class="fs9">' + '<span style="color: green;">' + caption.CJ_LBL_WF + ': </span>' + full.WfName + '</span>'
        }
        if (full.ActName != "") {
            actName = '; <span class="fs9"><span style="color: green;">' + caption.CJ_TXT_ACTIVITY + ': </span>' + full.ActName + '</span>'
        }

        var cardName = data.length > 40 ? data.substr(0, 40) + " ..." : data;
        if (full.UpdateTime != null && full.UpdateTime != "" && full.UpdateTime != undefined) {

            var updateText = $filter('date')(full.UpdateTime, 'dd/MM/yyyy HH:mm:ss')
            updateTimeTxt = '<span class="fs9 black">' + caption.CJ_LBL_UPDATE_TIME + ': ' + updateText + '</span>'

            var updated = new Date(full.UpdateTime);
            var currentTime = new Date();
            var diffMsUpdate = (updated - currentTime);
            var diffDayUpdated = Math.floor((diffMsUpdate / 86400000));
            if (diffDayUpdated == -1) {
                var diffHrsUpdate = Math.floor((diffMsUpdate % 86400000) / 3600000);
                if (diffHrsUpdate < 10) {
                    cardName = '<span style = "color: #9406b7">' + cardName + '</span>'
                }
            }
        }
        if (full.WorkType != "") {
            workType = '<span class="fs9 mr-1" style="color: #048004;">' + caption.CJ_LBL_WORK_TYPE + ': ' + full.WorkType + '</span>'
        }
        if (full.Priority != "") {
            priority = '<span class="badge-customer badge-customer-success ml-1">' + full.Priority + '</span>'
        }
        if (full.Deadline == '') {
            deadLine = '<span class="badge-customer badge-customer-success fs9 ml5">{{"CJ_LBL_NO_SET_DEADLINE" | translate}}</span>'
        }
        else {
            if (full.Status != 'Thẻ rác' && full.Status != 'Đóng' && full.Status != 'Bị hủy' && full.Status != 'Hoàn thành') {
                var created = new Date(full.Deadline);
                var now = new Date();
                var diffMs = (created - now);
                var diffDay = Math.floor((diffMs / 86400000));
                if ((diffDay + 1) < 0) {
                    deadLine = '<span class="badge-customer badge-customer-danger fs9 ml5">' + caption.CJ_LBL_TIME_OUT + '</span>';
                } else if ((diffDay + 1) > 0) {
                    deadLine = '<span class="badge-customer badge-customer-success fs9 ml5">' + caption.CJ_LBL_STILL_DATE + ' ' + (diffDay + 1) + ' ' + caption.CJ_LBL_DAY + '</span>'
                } else {
                    var end = new Date(new Date().setHours(23, 59, 59, 999));
                    var diffMs1 = (end - now);
                    var diffHrs = Math.floor((diffMs1 % 86400000) / 3600000);
                    var diffMins = Math.round(((diffMs1 % 86400000) % 3600000) / 60000);
                    deadLine = '<span class="badge-customer badge-customer-success fs9 ml5">' + caption.CJ_LBL_STILL_DATE + ' ' + diffHrs + 'h ' + diffMins + 'p</span>'
                }
            }
        }
        if (full.Status == 'Hoàn thành') {
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.CardCode + ': </span>' +
                cardName +
                '<div class="pt5"><span class="badge-customer badge-customer-success fs9" style="width:95px;">&nbsp;' + caption.CJ_LBL_SUCCESS + '</span>' + priority +
                '</div>' + '<div class= "pt5">' + workType + updateTimeTxt + showLadbelApprove + departmentAssign + groupAssign + wfName + actName + '</div>';
        }
        else if (full.Status == 'Đang triển khai') {
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.CardCode + ': </span>' +
                '<span> ' + cardName + '</span >' +
                '<div class="pt5"><span class="badge-customer badge-customer-danger" style="width:95px;">&nbsp;' + caption.CJ_LBL_PENDING + '</span>' + deadLine + priority +
                '</div>' + '<div class ="pt5">' + workType + updateTimeTxt + showLadbelApprove + departmentAssign + groupAssign + wfName + actName + '</div>';
        }
        else if (full.Status == 'Bị hủy') {
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.CardCode + ': </span>' +
                cardName +
                '<div class="pt5"><span class="badge-customer badge-customer-warning" style="width:95px;">&nbsp;' + caption.CJ_LBL_CANCLE + '</span>' + priority +
                '</div>' + '<div class ="pt5">' + workType + updateTimeTxt + showLadbelApprove + departmentAssign + groupAssign + wfName + actName + '</div>';
        }
        else if (full.Status == 'Mới tạo') {
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.CardCode + ': </span>' +
                cardName +
                '<div class="pt5"><span class="badge-customer badge-customer-success fs9" style="width:95px;">&nbsp;' + caption.CJ_LBL_CREATE + '</span>' + deadLine + priority +
                '</div>' + '<div class ="pt5">' + workType + updateTimeTxt + showLadbelApprove + departmentAssign + groupAssign + wfName + actName + '</div>';
        }
        else if (full.Status == 'Thẻ rác') {
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.CardCode + ': </span>' +
                cardName +
                '<div class="pt5"><span class="badge-customer badge-customer-danger fs9" style="width:95px;">&nbsp;' + caption.CJ_TAB_STATUS_TRASH + '</span>' + deadLine + priority +
                '</div>' + '<div class ="pt5">' + workType + updateTimeTxt + showLadbelApprove + departmentAssign + groupAssign + wfName + actName + '</div>';
        }
        else if (full.Status == 'Đóng') {
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.CardCode + ': </span>' +
                cardName +
                '<div class="pt5"><span class="badge-customer badge-customer-danger fs9" style="width:95px;">&nbsp;' + caption.CJ_MSG_TAB_CLOSE + '</span>' + deadLine + priority +
                '</div>' + '<div class ="pt5">' + workType + updateTimeTxt + showLadbelApprove + departmentAssign + groupAssign + wfName + actName + '</div>';
        }
    }).withOption('sClass', 'nowrap'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BeginTime').withTitle('<i class="fa fa-calendar mr5"></i>{{"CJ_LIST_COL_START" | translate}}').withOption('sClass', 'text-wrap w50').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Deadline').withTitle('<i class="fa fa-calendar mr5"></i>{{"CJ_LIST_COL_DEADLINE" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }).withOption('sClass', 'text-wrap w50'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EndTime').withTitle('<i class="fa fa-calendar mr5"></i>{{"CJ_LIST_COL_END" | translate}}').withOption('sClass', 'text-wrap w20').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('<i class="fa fa-user mr5"></i>{{"CJ_COL_CREATE_BY" | translate}}').withOption('sClass', 'text-wrap w20').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BoardName').withTitle('<i class="fa fa-newspaper-o mr5"></i>{{"CJ_LIST_COL_BOARD" | translate}}').withOption('sClass', 'text-wrap w20').renderWith(function (data, type) {
        return '<span class="badge-customer badge-customer-success ml-1" style = "background-color: #3c92e8fc !important;">' + data + '</span>'
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('<i class="fa fa-calendar mr5"></i>{{"CJ_COL_CREATE_DATE" | translate}}').withOption('sClass', 'text-wrap w20').renderWith(function (data, type) {
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
    $rootScope.reloadGridCard = function () {
        reloadData(false);
    }
});

app.controller('activity', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataserviceContract, $timeout, para) {
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
        dataserviceContract.getListConfirmText(para, function (rs) {
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
        dataserviceContract.deleteConfirmTextById(para, item.Id, function (rs) {
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
            dataserviceContract.insertConfirmText(para, $scope.model.Confirm, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.initLoad();
                }
            });
        } else {
            App.toastrError(caption.CONTRAT_CURD_MSG_PLEASE_CHOOSE_TO_ENTER_COMMENTS)
        }
    }

    $scope.close = function () {
        $scope.isEdit = false;
    }

    $scope.save = function () {
        item.Body = $scope.model.Confirm;
        if ($scope.model.Confirm != '' && $scope.isEdit) {
            dataserviceContract.updateConfirmTextById(para, item.Id, item.Body, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                }
            });
        } else {
            App.toastrError(caption.CONTRAT_CURD_MSG_PLEASE_SELECT_1_COMMENT_TO_CORRECT_IT)
        }
    }
});

app.controller('showLog', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataserviceContract, $timeout, para) {
    var data = JSON.parse(para);
    //$scope.logs = [];
    //if (data != null) {
    //    for (var i = 0; i < data.length; ++i) {
    //        data[i].UpdateContent = JSON.parse(data[i].UpdateContent);

    //        //var obj = {
    //        //    CreatedTime: data[i].Header.UpdatedTime != null ? $filter('date')(new Date(data[i].Header.UpdatedTime), 'dd/MM/yyyy HH:mm:ss') : $filter('date')(new Date(data[i].Header.CreatedTime), 'dd/MM/yyyy HH:mm:ss'),
    //        //    CreatedBy: data[i].Header.UpdatedBy != null ? data[i].Header.UpdatedBy : data[i].Header.CreatedBy,
    //        //    Body: data[i]
    //        //}

    //        //$scope.logs.push(obj);
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

app.controller('addImpProduct', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceContract, $filter, para) {
    $scope.model = {
        CusCode: '',
        SupCode: '',
        PoCode: '',
        ReqCode: '',
        Title: '',
        ListProductDetail: []
    }
    $scope.isTex = false;
    $rootScope.PoSupCode = '';
    $rootScope.listProducts = [];
    $scope.IsDisablePoCode = true;
    $scope.isShowHeader = true;
    $scope.isShowDetail = false;
    $rootScope.customerType = "LE";
    $rootScope.Budget = 0;
    $rootScope.RealBudget = 0;
    $rootScope.ContractId = -1;
    //$rootScope.ContractCode = "";
    $scope.products = [];
    $scope.ListPoCus = [];
    $scope.forms = {};
    $scope.status = [];
    $scope.cancel = function () {
        $uibModalInstance.close();
    };

    $scope.changeCustomer = function () {

        $scope.model.CusAddress = "";
        $scope.model.CusZipCode = "";
        $scope.model.CusMobilePhone = "";
        $scope.model.CusPersonInCharge = "";
        $scope.model.CusEmail = "";

        var customer = $rootScope.MapCustomer[$scope.model.CusCode];
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
        //console.log(supplier);
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

    function initData() {
        dataserviceContract.getImpStatus(function (rs) {
            rs = rs.data;
            $scope.status = rs;
            $scope.model.Status = $scope.status[0].Code;
        });

        dataserviceContract.getListPoProduct('', function (result) {
            result = result.data;
            $scope.ListPoCus = result;
        });
        dataserviceContract.genReqCode(function (result) {
            result = result.data;
            $scope.model.ReqCode = result;
            $rootScope.ReqCode = result;
        });
        dataserviceContract.genTitle(para, function (result) {
            result = result.data;
            $scope.model.Title = result;
        });
        var today = new Date(new Date());
        $scope.model.sCreatedTime = $filter('date')(new Date(today), 'dd/MM/yyyy hh:mm:ss');
        $rootScope.CreatedTime = $scope.model.sCreatedTime;
        $scope.model.PoCode = $rootScope.PoCode;
        $scope.model.CusCode = $rootScope.CusCode;

        if ($scope.model.CusCode != '' || $scope.model.CusCode != null)
            $scope.changeCustomer();
        dataserviceContract.getListProductWithPoSale($scope.model.PoCode, function (result) {
            result = result.data;
            $rootScope.listProducts = result;
        });
        dataserviceContract.getListSupplier(function (result) {
            result = result.data;
            $scope.suppliers = result;
        });
    }
    initData();

    $scope.chkContract = function () {
        if ($rootScope.ContractCode == '') {
            App.toastrError(caption.CONTRACT_CURD_MSG_CREATE_CONTRACR);//Vui lòng tạo trước hợp đồng!
        }
    }

    $scope.changleSelect = function (SelectType, Item) {
        if (SelectType == "PoCode" && $scope.model.PoCode != "") {
            $scope.errorPoCode = false;

            setTimeout(function () {
                $rootScope.loadDateJTable();
            }, 200);

            $scope.model.CusCode = Item.CusCode;
            if ($scope.model.CusCode != '' || $scope.model.CusCode != null)
                $scope.changeCustomer();
            dataserviceContract.getListProductWithPoSale($scope.model.PoCode, function (result) {
                result = result.data;
                $rootScope.listProducts = result;
            });
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.PoCode == "" || data.PoCode == null) {
            $scope.errorPoCode = true;
            mess.Status = true;
        } else {
            $scope.errorPoCode = false;
        }
        return mess;
    };
    $scope.checkAdd = function () {
        if ($scope.isAdded == false) {
            App.toastrError(caption.COM_MSG_ADD_PARENT_FIRST.replace('{0}', caption.PROJECT_TAB_RQ_IMP));
        }
    }
    $scope.isAdded = false;
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.forms.addform.validate() && !validationSelect($scope.model).Status) {
            $scope.model.ListProductDetail = $rootScope.listProducts;
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmAdd.html',
                resolve: {
                    para: function () {
                        return $scope.model;
                    }
                },
                controller: function ($scope, $uibModalInstance, para) {
                    $scope.message = caption.CONTRAT_CURD_MSG_IMPORT_REQUESTS
                    $scope.ok = function () {
                        dataserviceContract.insertImpProduct(para, function (result) {
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
                $rootScope.ReqCode = $scope.model.ReqCode;
                $scope.isAdded = true;
            }, function () {
            });
        }
    }

    $scope.addCardJob = function () {
        var obj = {
            Code: $scope.model.ReqCode,
            Name: $scope.model.Title,
            TabBoard: 10
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

    $rootScope.amountbudget = function (objInput) {
        $scope.model.Budget = objInput.Budget;
        $scope.modelViewHeader.BudgetTotalDetail = objInput.RealBudget;
        $scope.modelViewHeader.TaxTotalDetail = objInput.TaxDetail;
    }

    $scope.activity = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderContract + '/activity.html',
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
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
        $("#DateOfOrder").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
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

            setTimeout(function () {
                $rootScope.loadDateJTable();
            }, 200);
        }
    }
    //$scope.ShowDetail = function () {
    //    $scope.isShowHeader = false;
    //    $scope.isShowDetail = true;
    //}
    $scope.openAttributeFormManager = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderContract + '/attributeManager.html',
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
    $scope.addCommonSettingWHStatus = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'IMP_STATUS',
                        GroupNote: 'Trạng thái Y/C đặt hàng',
                        AssetCode: 'WAREHOUSE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceContract.getImpStatus(function (rs) {
                rs = rs.data;
                $rootScope.status = rs;
            });
        }, function () { });
    }
});
app.controller('addProduct_old', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceContract, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.model = {
        ProductCode: '',
        ProductType: '',
        ProductTypeName: '',
        Catalogue: '',
        Quantity: 1,
        Unit: '',
        Currency: 'CURRENCY_VND',
        UnitPrice: 0,
        PoSupCode: '',
        ListProductDetail: []
    }
    $scope.listPoProduct = [];
    $scope.isExtend = false;
    $scope.isAdd = true;
    $scope.errorRateConversion = false;
    $scope.errorRateLoss = false;
    $scope.errorSupCode = false;
    $scope.isDisableProductCode = false;
    $scope.isDisableUnit = false;
    $scope.isDisableProductType = true;
    $scope.isDisableCatalogue = true;
    $scope.isDisableCurrency = false;
    //khách lẻ
    $scope.currencys = [
        {
            Code: 'JPY',
            Name: 'Yên'
        },
        {
            Code: 'VND',
            Name: 'VND'
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
    $scope.add = function () {

        if ($rootScope.ReqCode != '') {
            $scope.isAdd = true;
            $scope.model.ReqCode = $rootScope.ReqCode;
            $scope.model.ListProductDetail = $rootScope.listProducts;
            dataserviceContract.insertDetail($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                }
            });
        }
    }
    $scope.edit = function (id) {
        $scope.isAdd = false;
        $scope.editId = id;
        var listdata = $('#tblData').DataTable().data();
        for (var i = 0; i < listdata.length; ++i) {
            if (id == listdata[i].Id) {
                var count = 0;
                var data = listdata[i];

                $scope.model.Id = data.Id;
                $scope.model.ReqCode = data.ReqCode;
                $scope.model.ProductCode = data.ProductCode;
                $scope.model.Quantity = parseInt(data.Quantity);
                $scope.model.Unit = data.Unit;
                $scope.model.RateConversion = parseInt(data.RateConversion);
                $scope.model.RateLoss = parseInt(data.RateLoss);
                $scope.model.PoCount = data.PoCount;
                $scope.model.Note = data.Note;
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

    }
    $scope.save = function (id) {

        $scope.model.ReqCode = $rootScope.ReqCode;
        $scope.model.ListProductDetail = $rootScope.listProducts;

        for (var i = 0; i < $scope.model.ListProductDetail.length; i++) {
            if ($scope.model.ListProductDetail[i].SupCode == '' || $scope.model.ListProductDetail[i].SupCode == null || $scope.model.ListProductDetail[i].SupCode == undefined) {
                $scope.errorSupCode = true;
                break;
            } else {
                $scope.errorSupCode = false;
            }

            if ($scope.model.ListProductDetail[i].RateLoss == '' || $scope.model.ListProductDetail[i].RateLoss <= 0) {
                $scope.errorRateLoss = true;
                break;
            }
        }
        if (!$scope.errorRateConversion && !$scope.errorRateLoss && !$scope.errorSupCode) {
            dataserviceContract.updateDetail($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                }
            });
        } else {
            if ($scope.errorSupCode) {
                App.toastrError(caption.CONTRAT_CURD_MSG_PLEASE_SELECT_THE_SUPPLIER);
                return;
            } else {
                if ($scope.errorRateConversion && $scope.errorRateLoss) {
                    App.toastrError(caption.CONTRAT_CURD_MSG_POSITIVE_NUMBER_ENTRY);
                    return;
                } else if ($scope.errorRateConversion) {
                    App.toastrError(caption.CONTRAT_CURD_MSG_POSITIVE_CONVERSION_RATE);
                    return;
                } else if ($scope.errorRateLoss) {
                    App.toastrError(caption.CONTRAT_CURD_MSG_ENTERED_POSITIVE_NUMBERS);
                    return;
                }
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
                    dataserviceContract.deleteDetail(id, function (result) {
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
    $scope.changeService = function () {
        for (var i = 0; i < $scope.services.length; ++i) {
            if ($scope.services[i].Code == $scope.model.ServiceCode) {
                $scope.model.Unit = $scope.services[i].Unit;
                break;
            }
        }
        if ($scope.isExtend == true) {

            //lọc ra condition từ $rootScope.serviceCost
            $scope.serviceConditions = [];
            $scope.serviceDetails = [];
            $scope.model.ServiceCondition = "";
            $scope.serviceCost = [];
            $scope.model.Range = "";
            $scope.model.UnitPrice = "";
            if ($scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
                for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                    var data = $rootScope.serviceCost[i];
                    if (data.ServiceCode == $scope.model.ServiceCode && data.Condition != null && data.Condition != '' && data.Condition != undefined) {

                        var it = $rootScope.excludeCondition[data.Condition];
                        if (it == undefined) {
                            $scope.serviceConditions.push(data);

                        }
                    }
                }
                for (var i = 0; i < $scope.serviceConditions.length; ++i) {
                    $scope.serviceConditions[i].Code = $scope.serviceConditions[i].Condition;
                    $scope.serviceConditions[i].Name = $scope.serviceConditions[i].ConditionName;
                }
                console.log($scope.serviceConditions);
                var hasMap = {};
                for (var i = 0; i < $scope.serviceConditions.length; ++i) {
                    var item = $scope.serviceConditions[i];
                    hasMap[item.Code] = item;
                }
                $scope.serviceConditions = [];
                for (var i in hasMap) {
                    $scope.serviceConditions.push(hasMap[i]);
                }

            }
            if ($scope.serviceConditions.length == 0 && $scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
                App.toastrWarning(caption.CONTRAT_CURD_MSG_UNKNOWN_SERVICE_CONDITIONS);
            }
        }
        else {
            //chưa làm
            $scope.changeExtend();
        }
    }
    $scope.changeCondition = function () {


        if ($rootScope.customerType == "LE") {
            var le = $scope.unExcludeCondition[1];
            if ($rootScope.ServiceConditionOld == "SERVICE_CONDITION_000") {
                if ($scope.model.ServiceCondition != "SERVICE_CONDITION_000") {
                    $scope.serviceDetails = [];
                    $scope.model.UnitPrice = "";
                }
            }
            else {
                if ($scope.model.ServiceCondition == "SERVICE_CONDITION_000") {
                    $scope.serviceDetails = [];
                    $scope.model.UnitPrice = "";
                }
            }

            $scope.serviceCost = [];
            var j = 0;
            $scope.model.Range = "";
            if ($scope.model.ServiceCondition == "SERVICE_CONDITION_000") {
                $scope.serviceDetails = [];
                $scope.model.UnitPrice = "";
                $rootScope.ServiceConditionOld = $scope.model.ServiceCondition;
                for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                    var item = $rootScope.serviceCost[i];
                    if (item.ServiceCode == $scope.model.ServiceCode && item.Condition == $scope.model.ServiceCondition) {
                        $scope.model.UnitPrice = item.Price;
                        item.ConditionRange = "";
                        $scope.serviceDetails.push(item);
                        $scope.operationCost();
                        break;
                    }
                }
            }
            else {
                $rootScope.ServiceConditionOld = $scope.model.ServiceCondition;
                if ($scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
                    if ($scope.model.ServiceCondition != null && $scope.model.ServiceCondition != '' && $scope.model.ServiceCondition != undefined) {
                        for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                            var data = $rootScope.serviceCost[i];
                            if (data.ServiceCode == $scope.model.ServiceCode && data.Condition == $scope.model.ServiceCondition) {
                                if (data.ConditionRange.length > 4) {
                                    data.Id = j;
                                    $scope.serviceCost.push(data);
                                    j++;
                                }
                            }
                        }
                    }
                    else {

                    }
                }
            }
        }
        else if ($rootScope.customerType == "DAILY") {
            var daily = $scope.unExcludeCondition[3];
            if ($rootScope.ServiceConditionOld == daily) {
                if ($scope.model.ServiceCondition != daily) {
                    $scope.serviceDetails = [];
                    $scope.model.UnitPrice = "";
                }
            }
            else {
                if ($scope.model.ServiceCondition == daily) {
                    $scope.serviceDetails = [];
                    $scope.model.UnitPrice = "";
                }
            }

            $scope.serviceCost = [];
            var j = 0;
            $scope.model.Range = "";
            if ($scope.model.ServiceCondition == daily) {
                $scope.serviceDetails = [];
                $scope.model.UnitPrice = "";
                $rootScope.ServiceConditionOld = $scope.model.ServiceCondition;
                for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                    var item = $rootScope.serviceCost[i];
                    if (item.ServiceCode == $scope.model.ServiceCode && item.Condition == $scope.model.ServiceCondition) {
                        $scope.model.UnitPrice = item.Price;
                        item.ConditionRange = "";
                        $scope.serviceDetails.push(item);
                        $scope.operationCost();
                        break;
                    }
                }
            }
            else {
                $rootScope.ServiceConditionOld = $scope.model.ServiceCondition;
                if ($scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
                    if ($scope.model.ServiceCondition != null && $scope.model.ServiceCondition != '' && $scope.model.ServiceCondition != undefined) {
                        for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                            var data = $rootScope.serviceCost[i];
                            if (data.ServiceCode == $scope.model.ServiceCode && data.Condition == $scope.model.ServiceCondition) {
                                if (data.ConditionRange.length > 4) {
                                    data.Id = j;
                                    $scope.serviceCost.push(data);
                                    j++;
                                }
                            }
                        }
                    }
                    else {

                    }
                }
            }
        }
    }

    $scope.init = function () {
        dataserviceContract.getListCurrency(function (rs) {
            rs = rs.data;
            $scope.currencys = rs;
        });
        dataserviceContract.getListUnit(function (rs) {
            rs = rs.data;
            $scope.units = rs;
        });
        dataserviceContract.getListSupplier(function (result) {
            result = result.data;
            $scope.suppliers = result;
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
                    App.toastrWarning(caption.CONTRAT_CURD_MSG_PLEASE_ENTER_MANUALLY);
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
    $scope.removeserviceDetails = function (indx) {
        $scope.serviceDetails.splice(indx, 1);
        $scope.operationCost();
    }
    $scope.getDescription = function () {
        var des = "";
        if ($scope.isExtend == false) {
            for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                var item = $rootScope.serviceCost[i];
                if ($rootScope.customerType == "LE") {
                    var code = $rootScope.unExcludeCondition[1];
                    if (item.Condition == code) {
                        return item.Condition + "|";
                    }
                }
                else if ($rootScope.customerType == "DAILY") {
                    var code = $rootScope.unExcludeCondition[3];
                    if (item.Condition == code) {
                        return item.Condition + "|";
                    }
                }
            }
        }
        else {
            for (var i = 0; i < $scope.serviceDetails.length; ++i) {
                des = des + $scope.serviceDetails[i].Code + "|" + $scope.serviceDetails[i].ConditionRange + ";";
            }
        }
        //if ($scope.serviceDetails.length == 0) {
        //    for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
        //        var item = $rootScope.serviceCost[i];
        //        if (item.Condition == "SERVICE_CONDITION_000") {
        //            return item.Condition + "|";
        //        }
        //    }

        //}
        //else {
        //    for (var i = 0; i < $scope.serviceDetails.length; ++i) {
        //        des = des + $scope.serviceDetails[i].Code + "|" + $scope.serviceDetails[i].ConditionRange + ";";
        //    }
        //}
        return des;
    }

    $scope.changeExtend = function () {
        if ($scope.isExtend == true) {
            $scope.changeService();
        } else {
            $scope.serviceConditions = [];
            $scope.serviceDetails = [];
            if ($scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
                for (var i in $rootScope.excludeCondition) {
                    var item = $rootScope.excludeCondition[i];
                    if ($rootScope.customerType == "LE") {
                        if (item == 1) {
                            var stand = i;
                            var obj = $rootScope.map[$scope.model.ServiceCode + "|" + stand];
                            if (obj != undefined) {
                                console.log(obj);
                                $scope.model.UnitPrice = obj.Price;
                                obj.Name = obj.ConditionName;
                                obj.ConditionRange = "";
                                $scope.serviceDetails.push(obj);
                            }
                        }
                    }
                    else if ($rootScope.customerType == "DAILY") {
                        if (item == 3) {
                            var stand = i;
                            var obj = $rootScope.map[$scope.model.ServiceCode + "|" + stand];
                            if (obj != undefined) {
                                console.log(obj);
                                $scope.model.UnitPrice = obj.Price;
                                obj.Name = obj.ConditionName;
                                obj.ConditionRange = "";
                                $scope.serviceDetails.push(obj);
                            }
                        }
                    }
                }

            }
        }
    }

    $scope.isDisableForm = function () {
        $scope.isDisableProductCode = true;
    }
    $scope.removeDisableForm = function () {
        $scope.isDisableProductCode = false;
    }
    //Action khi chọn 1 combobox
    $scope.changeRate = function (item) {
        var msg = { error: false, title: '' };

        if (item.RateConversion != '' && item.RateConversion > 0) {
            $scope.errorRateConversion = false;
        } else {
            msg.error = true;
            $scope.errorRateConversion = true;
            msg.title += "- Tỉ lệ quy đổi nhập số dương<br/>";
        }

        if (item.RateLoss != '' && item.RateLoss > 0) {
            $scope.errorRateLoss = false;
        } else {
            msg.error = true;
            $scope.errorRateLoss = true;
            msg.title += "- Tỉ lệ hao hụt nhập số dương<br/>";
        }

        if (!msg.error) {
            item.Quantity = Math.ceil(item.PoCount / item.RateConversion * item.RateLoss);
        } else {
            App.toastrError(msg.title);
        }
    }
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
        if (data.Currency == "") {
            $scope.errorCurrency = true;
            mess.Status = true;
        } else {
            $scope.errorCurrency = false;
        }
        if (data.Unit == "") {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;
        }
        return mess;
    };

    $rootScope.loadDateJTable = function () {
        var createdDate = $filter('date')($rootScope.CreatedTime, 'dd/MM/yyyy');
        $(".datePicker").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
            startDate: createdDate,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
        });
    }

    setTimeout(function () {
        $rootScope.loadDateJTable();
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('addProduct', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceContract, $filter) {
    var vm = $scope;
    var id = -1;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.model = {
        ProductCode: '',
        ProductName: '',
        ProductType: '',
        ProductTypeName: '',
        Catalogue: '',
        Unit: '',
        Currency: 'CURRENCY_VND',
        UnitPrice: 0,
        PoSupCode: '',
        ListProductDetail: [],
        ListDelProduct: []
    }
    $scope.listPoProduct = [];
    $scope.isExtend = false;
    $scope.isAdd = true;
    $scope.errorRateConversion = false;
    $scope.errorRateLoss = false;
    $scope.errorSupCode = false;
    $scope.isDisableProductCode = false;
    $scope.isDisableUnit = false;
    $scope.isDisableProductType = true;
    $scope.isDisableCatalogue = true;
    $scope.isDisableCurrency = false;
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
    $scope.listProductDetail = [];
    $rootScope.serviceJtable = {};
    $rootScope.map = {};
    $rootScope.excludeCondition = {};
    $scope.editId = -1;
    $rootScope.unExcludeCondition = {};
    $scope.add = function () {
        if ($rootScope.ReqCode != '') {
            $scope.isAdd = true;
            $scope.model.ReqCode = $rootScope.ReqCode;
            $scope.model.ListProductDetail = $rootScope.listProducts;
            dataserviceContract.insertDetail($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                }
            });
        }
    }
    $scope.edit = function (id) {
        $scope.isAdd = false;
        $scope.editId = id;
        var listdata = $('#tblData').DataTable().data();
        for (var i = 0; i < listdata.length; ++i) {
            if (id == listdata[i].Id) {
                var count = 0;
                var data = listdata[i];

                $scope.model.Id = data.Id;
                $scope.model.ReqCode = data.ReqCode;
                $scope.model.ProductCode = data.ProductCode;
                $scope.model.Quantity = parseInt(data.Quantity);
                $scope.model.Unit = data.Unit;
                $scope.model.RateConversion = parseInt(data.RateConversion);
                $scope.model.RateLoss = parseInt(data.RateLoss);
                $scope.model.PoCount = data.PoCount;
                $scope.model.Note = data.Note;
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

    }
    $scope.save = function (id) {
        $scope.model.ReqCode = $rootScope.ReqCode;
        $scope.model.ListProductDetail = $rootScope.listProducts;

        for (var i = 0; i < $scope.model.ListProductDetail.length; i++) {
            if ($scope.model.ListProductDetail[i].SupCode == '' || $scope.model.ListProductDetail[i].SupCode == null || $scope.model.ListProductDetail[i].SupCode == undefined) {
                $scope.errorSupCode = true;
                break;
            } else {
                $scope.errorSupCode = false;
            }

            if ($scope.model.ListProductDetail[i].Quantity == '' || $scope.model.ListProductDetail[i].Quantity == null || $scope.model.ListProductDetail[i].Quantity < 0) {
                $scope.errorQuantity = true;
                break;
            } else {
                $scope.errorQuantity = false;
            }

            if ($scope.model.ListProductDetail[i].RateLoss == '' || $scope.model.ListProductDetail[i].RateLoss == null || $scope.model.ListProductDetail[i].RateLoss <= 0) {
                $scope.errorRateLoss = true;
                break;
            }

            if ($scope.model.ListProductDetail[i].RateConversion == '' || $scope.model.ListProductDetail[i].RateConversion == null) {
                $scope.errorRateConversion = true;
                break;
            }
        }
        if (!$scope.errorRateConversion && !$scope.errorRateLoss && !$scope.errorSupCode && !$scope.errorQuantity) {
            var model = angular.copy($scope.model);
            if (model.ListDelProduct && model.ListDelProduct.length == 0) {
                model.ListDelProduct = null;
            }
            //if ($scope.addProduct.validate()) {
            dataserviceContract.updateDetail(model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                }
            });
            //}

        } else {
            if ($scope.errorSupCode) {
                App.toastrError(caption.SRIP_MSG_SELECT_SUPP_FOR_PRODUCT);
                return;
            } else {
                if ($scope.errorRateConversion && $scope.errorRateLoss) {
                    App.toastrError(caption.SRIP_MSG_RATE_NON_NEGA);
                    return;
                } else if ($scope.errorRateConversion) {
                    App.toastrError(caption.SRIP_MSG_RATE_TRANSFER);
                    return;
                } else if ($scope.errorRateLoss) {
                    App.toastrError(caption.SRIP_MSG_RATE_LOST);
                    return;
                } else if ($scope.errorQuantity) {
                    App.toastrError(caption.SRIP_MSG_QUANTITY_PLUS);
                }
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
                    dataserviceContract.deleteDetail(id, function (result) {
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
    $scope.changeService = function () {
        for (var i = 0; i < $scope.services.length; ++i) {
            if ($scope.services[i].Code == $scope.model.ServiceCode) {
                $scope.model.Unit = $scope.services[i].Unit;
                break;
            }
        }
        if ($scope.isExtend == true) {

            //lọc ra condition từ $rootScope.serviceCost
            $scope.serviceConditions = [];
            $scope.serviceDetails = [];
            $scope.model.ServiceCondition = "";
            $scope.serviceCost = [];
            $scope.model.Range = "";
            $scope.model.UnitPrice = "";
            if ($scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
                for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                    var data = $rootScope.serviceCost[i];
                    if (data.ServiceCode == $scope.model.ServiceCode && data.Condition != null && data.Condition != '' && data.Condition != undefined) {
                        var it = $rootScope.excludeCondition[data.Condition];
                        if (it == undefined) {
                            $scope.serviceConditions.push(data);

                        }
                    }
                }
                for (var i = 0; i < $scope.serviceConditions.length; ++i) {
                    $scope.serviceConditions[i].Code = $scope.serviceConditions[i].Condition;
                    $scope.serviceConditions[i].Name = $scope.serviceConditions[i].ConditionName;
                }
                console.log($scope.serviceConditions);
                var hasMap = {};
                for (var i = 0; i < $scope.serviceConditions.length; ++i) {
                    var item = $scope.serviceConditions[i];
                    hasMap[item.Code] = item;
                }
                $scope.serviceConditions = [];
                for (var i in hasMap) {
                    $scope.serviceConditions.push(hasMap[i]);
                }

            }
            if ($scope.serviceConditions.length == 0 && $scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
                App.toastrWarning(caption.SRIP_MSG_SERVICE_NOT_DEFINE);
            }
        }
        else {
            //chưa làm
            $scope.changeExtend();
        }
    }
    $scope.changeCondition = function () {
        if ($rootScope.customerType == "LE") {
            var le = $scope.unExcludeCondition[1];
            if ($rootScope.ServiceConditionOld == "SERVICE_CONDITION_000") {
                if ($scope.model.ServiceCondition != "SERVICE_CONDITION_000") {
                    $scope.serviceDetails = [];
                    $scope.model.UnitPrice = "";
                }
            }
            else {
                if ($scope.model.ServiceCondition == "SERVICE_CONDITION_000") {
                    $scope.serviceDetails = [];
                    $scope.model.UnitPrice = "";
                }
            }

            $scope.serviceCost = [];
            var j = 0;
            $scope.model.Range = "";
            if ($scope.model.ServiceCondition == "SERVICE_CONDITION_000") {
                $scope.serviceDetails = [];
                $scope.model.UnitPrice = "";
                $rootScope.ServiceConditionOld = $scope.model.ServiceCondition;
                for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                    var item = $rootScope.serviceCost[i];
                    if (item.ServiceCode == $scope.model.ServiceCode && item.Condition == $scope.model.ServiceCondition) {
                        $scope.model.UnitPrice = item.Price;
                        item.ConditionRange = "";
                        $scope.serviceDetails.push(item);
                        $scope.operationCost();
                        break;
                    }
                }
            }
            else {
                $rootScope.ServiceConditionOld = $scope.model.ServiceCondition;
                if ($scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
                    if ($scope.model.ServiceCondition != null && $scope.model.ServiceCondition != '' && $scope.model.ServiceCondition != undefined) {
                        for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                            var data = $rootScope.serviceCost[i];
                            if (data.ServiceCode == $scope.model.ServiceCode && data.Condition == $scope.model.ServiceCondition) {
                                if (data.ConditionRange.length > 4) {
                                    data.Id = j;
                                    $scope.serviceCost.push(data);
                                    j++;
                                }
                            }
                        }
                    }
                    else {

                    }
                }
            }
        }
        else if ($rootScope.customerType == "DAILY") {
            var daily = $scope.unExcludeCondition[3];
            if ($rootScope.ServiceConditionOld == daily) {
                if ($scope.model.ServiceCondition != daily) {
                    $scope.serviceDetails = [];
                    $scope.model.UnitPrice = "";
                }
            }
            else {
                if ($scope.model.ServiceCondition == daily) {
                    $scope.serviceDetails = [];
                    $scope.model.UnitPrice = "";
                }
            }

            $scope.serviceCost = [];
            var j = 0;
            $scope.model.Range = "";
            if ($scope.model.ServiceCondition == daily) {
                $scope.serviceDetails = [];
                $scope.model.UnitPrice = "";
                $rootScope.ServiceConditionOld = $scope.model.ServiceCondition;
                for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                    var item = $rootScope.serviceCost[i];
                    if (item.ServiceCode == $scope.model.ServiceCode && item.Condition == $scope.model.ServiceCondition) {
                        $scope.model.UnitPrice = item.Price;
                        item.ConditionRange = "";
                        $scope.serviceDetails.push(item);
                        $scope.operationCost();
                        break;
                    }
                }
            }
            else {
                $rootScope.ServiceConditionOld = $scope.model.ServiceCondition;
                if ($scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
                    if ($scope.model.ServiceCondition != null && $scope.model.ServiceCondition != '' && $scope.model.ServiceCondition != undefined) {
                        for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                            var data = $rootScope.serviceCost[i];
                            if (data.ServiceCode == $scope.model.ServiceCode && data.Condition == $scope.model.ServiceCondition) {
                                if (data.ConditionRange.length > 4) {
                                    data.Id = j;
                                    $scope.serviceCost.push(data);
                                    j++;
                                }
                            }
                        }
                    }
                    else {

                    }
                }
            }
        }
    }
    $scope.selectContractBuyer = function (item) {
        dataserviceContract.getListProductWithContractBuyer(item.Code, function (rs) {
            rs = rs.data;
            $scope.listProduct = rs;
            $scope.listProductDetail = item.listProductDetail;
        })
        $scope.model.ProjectCode = '';
    }
    $scope.selectProject = function (item) {
        dataserviceContract.getListProductWithProject(item.Code, function (rs) {
            rs = rs.data;
            $scope.listProduct = rs;
            $scope.listProductDetail = item.listProductDetail;
        })
        $scope.model.PoCode = '';
    }
    $scope.selectProduct = function (item) {
        $scope.model.ProductName = item.Name;
        $scope.model.Unit = item.Unit;
        $scope.model.UnitName = item.UnitName;
    }
    $scope.addProduct = function () {
        setTimeout(function () {
            $rootScope.loadDateJTable();
        });
        if ($scope.model.ProductCode == "" || $scope.model.ProductCode == null || $scope.model.ProductCode == undefined) {
            return App.toastrError(caption.CONTRACT_VALIDATE_PLS_SELECT_PRODUCT);
        }

        var isProduct = false;
        var obj = {
            Id: id--,
            ProductCode: $scope.model.ProductCode,
            ProductName: $scope.model.ProductName,
            Unit: $scope.model.Unit,
            UnitName: $scope.model.UnitName,
        }

        for (var i = 0; i < $rootScope.listProducts.length; i++) {
            if ($rootScope.listProducts[i].ProductCode == obj.ProductCode) {
                App.toastrError(caption.SRIP_MSG_PRODUCT_EXIST_IN_PRO);
                isProduct = true;
                break;
            }
        }
        if (isProduct == false) {
            $rootScope.listProducts.push(obj);
            for (var i = 0; i < $scope.model.ListDelProduct.length; i++) {
                if (obj.ProductCode == $scope.model.ListDelProduct[i].ProductCode) {
                    $scope.model.ListDelProduct.splice(i, 1);
                }
            }
        }
    }
    $scope.removeProduct = function (item) {
        //$rootScope.listProducts.splice(index, 1);
        //App.toastrSuccess("Xóa sản phẩm thành công");
        for (var i = 0; i < $rootScope.listProducts.length; i++) {
            if ($rootScope.listProducts[i].ProductCode == item.ProductCode) {
                $rootScope.listProducts.splice(i, 1);
                App.toastrSuccess(caption.SRIP_MSG_DEL_PRODUCT_SUCCESS);
                var objDel = {
                    Id: id--,
                    ProductCode: item.ProductCode,
                    ProductName: item.ProductName,
                }
                $scope.model.ListDelProduct.push(objDel);
            }
        }
    }

    $scope.init = function () {
        dataserviceContract.getListCurrency(function (rs) {
            rs = rs.data;
            $scope.currencys = rs;
        });
        dataserviceContract.getListUnit(function (rs) {
            rs = rs.data;
            $scope.units = rs;
        });
        dataserviceContract.getListSupplier(function (result) {
            result = result.data;
            $scope.suppliers = result;
        });
        dataserviceContract.getListPoProduct('', function (result) {
            result = result.data;
            $scope.ListPoCus = result;
        });
        dataserviceContract.getListProjectCode(function (result) {
            result = result.data;
            $scope.ListProjectCode = result;
        });
        dataserviceContract.getListProduct(function (result) {
            result = result.data;
            $scope.listProduct = result;
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
                    App.toastrWarning(caption.SRIP_MSG_NOT_FILTER_COST);
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
    $scope.removeserviceDetails = function (indx) {
        $scope.serviceDetails.splice(indx, 1);
        $scope.operationCost();
    }
    $scope.getDescription = function () {
        var des = "";
        if ($scope.isExtend == false) {
            for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                var item = $rootScope.serviceCost[i];
                if ($rootScope.customerType == "LE") {
                    var code = $rootScope.unExcludeCondition[1];
                    if (item.Condition == code) {
                        return item.Condition + "|";
                    }
                }
                else if ($rootScope.customerType == "DAILY") {
                    var code = $rootScope.unExcludeCondition[3];
                    if (item.Condition == code) {
                        return item.Condition + "|";
                    }
                }
            }
        }
        else {
            for (var i = 0; i < $scope.serviceDetails.length; ++i) {
                des = des + $scope.serviceDetails[i].Code + "|" + $scope.serviceDetails[i].ConditionRange + ";";
            }
        }
        //if ($scope.serviceDetails.length == 0) {
        //    for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
        //        var item = $rootScope.serviceCost[i];
        //        if (item.Condition == "SERVICE_CONDITION_000") {
        //            return item.Condition + "|";
        //        }
        //    }

        //}
        //else {
        //    for (var i = 0; i < $scope.serviceDetails.length; ++i) {
        //        des = des + $scope.serviceDetails[i].Code + "|" + $scope.serviceDetails[i].ConditionRange + ";";
        //    }
        //}
        return des;
    }

    $scope.changeExtend = function () {
        if ($scope.isExtend == true) {
            $scope.changeService();
        } else {
            $scope.serviceConditions = [];
            $scope.serviceDetails = [];
            if ($scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
                for (var i in $rootScope.excludeCondition) {
                    var item = $rootScope.excludeCondition[i];
                    if ($rootScope.customerType == "LE") {
                        if (item == 1) {
                            var stand = i;
                            var obj = $rootScope.map[$scope.model.ServiceCode + "|" + stand];
                            if (obj != undefined) {
                                console.log(obj);
                                $scope.model.UnitPrice = obj.Price;
                                obj.Name = obj.ConditionName;
                                obj.ConditionRange = "";
                                $scope.serviceDetails.push(obj);
                            }
                        }
                    }
                    else if ($rootScope.customerType == "DAILY") {
                        if (item == 3) {
                            var stand = i;
                            var obj = $rootScope.map[$scope.model.ServiceCode + "|" + stand];
                            if (obj != undefined) {
                                console.log(obj);
                                $scope.model.UnitPrice = obj.Price;
                                obj.Name = obj.ConditionName;
                                obj.ConditionRange = "";
                                $scope.serviceDetails.push(obj);
                            }
                        }
                    }
                }

            }
        }
    }

    $scope.isDisableForm = function () {
        $scope.isDisableProductCode = true;
    }
    $scope.removeDisableForm = function () {
        $scope.isDisableProductCode = false;
    }
    //Action khi chọn 1 combobox
    $scope.changeRate = function (item) {
        var msg = { error: false, title: '' };

        if (item.RateConversion != '' && item.RateConversion > 0) {
            $scope.errorRateConversion = false;
        } else {
            msg.error = true;
            $scope.errorRateConversion = true;
            msg.title += "- Tỉ lệ quy đổi nhập số dương<br/>";
        }

        if (item.RateLoss != '' && item.RateLoss > 0) {
            $scope.errorRateLoss = false;
        } else {
            msg.error = true;
            $scope.errorRateLoss = true;
            msg.title += "- Tỉ lệ hao hụt nhập số dương<br/>";
        }

        if (item.Quantity != '' && item.Quantity > 0) {
            $scope.errorQuantity = false;
        } else {
            msg.error = true;
            $scope.errorQuantity = true;
            msg.title += "- Số lượng nhập số dương<br/>";
        }

        if (!msg.error) {
            item.Quantity = Math.ceil(item.PoCount / item.RateConversion * item.RateLoss);
            try {
                item.Quantity = item.Quantity || 0;
            } catch (e) {
                console.log(e);
                item.Quantity = 0;
            }
        } else {
            App.toastrError(msg.title);
        }
    }
    $scope.changeQuantity = function (item) {
        var quantityPrimary = Math.ceil(item.PoCount / item.RateConversion * item.RateLoss);
        if (item.Quantity !== quantityPrimary) {
            item.Edit = 'Đã sửa đổi';
        } else {
            item.Edit = '';
        }
    }
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
    $rootScope.loadDateJTable = function () {
        $(".dateExpect").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
        });
        var createdDate = $filter('date')($rootScope.CreatedTime, 'dd/MM/yyyy');
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.ProductCode == "") {
            $scope.errorProductCode = true;
            mess.Status = true;
        } else {
            $scope.errorProductCode = false;
        }
        if (data.Currency == "") {
            $scope.errorCurrency = true;
            mess.Status = true;
        } else {
            $scope.errorCurrency = false;
        }
        if (data.Unit == "") {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;
        }
        return mess;
    };
    setTimeout(function () {
        $rootScope.loadDateJTable();
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 200);
});

//commomsetting
app.controller('detail', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceContract, $filter, para) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withTitle('{{"CONTRACT_LIST_COL_ORDER" | translate}}').notSortable().withOption('sWidth', '30px').withOption('sClass', 'tcenter w50').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ValueSet').withTitle('{{"CONTRACT_LIST_COL_VALUE_SET" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeName').withTitle('{{"CONTRACT_LIST_COL_TYPE_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"CONTRACT_LIST_COL_CREATE_TIME" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{"CONTRACT_LIST_COL_CREATE_BY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"CONTRACT_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<a title="Xoá" ng-click="delete(' + full.SettingID + ')"  class="fs25"><i class="fas fa-trash"style="--fa-primary-color: red;"></i></a>';
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
        dataserviceContract.getDataType(function (rs) {
            rs = rs.data;
            $scope.listDataType = rs;
        });
    }
    $scope.init();
    $scope.add = function () {

        if ($scope.model.ValueSet == '') {
            App.toastrError(caption.CONTRACT_CURD_MSG_SETTING_NOT_BLANK);
        } else if ($scope.model.ValueSet.length > 255) {
            App.toastrError("Vui lòng nhập giá trị cài đặt nhỏ hơn 255 ký tự");
        } else {
            dataserviceContract.insertCommonSetting($scope.model, function (rs) {
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
            App.toastrError(caption.CONTRACT_CURD_MSG_DATA_NOT_BLANK)
        } else if ($scope.model.ValueSet.length > 255) {
            App.toastrError("Vui lòng nhập giá trị cài đặt nhỏ hơn 255 ký tự");
        } else {
            dataserviceContract.updateCommonSetting($scope.model, function (rs) {
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
                $scope.message = "Bạn có chắc chắn muốn xóa ?";
                $scope.ok = function () {
                    dataserviceContract.deleteCommonSetting(id, function (rs) {
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
app.controller('googleMap', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceContract, $filter, para) {
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

            dataserviceContract.getAddress(point.lat, point.lng, function (rs) {
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
//show history version
app.controller('historyVersion', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceContract, $window, $filter, $uibModalInstance) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Contract/JTableHistoryVersion",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ContractCode = $rootScope.ContractCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
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
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
            //$(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
            //    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
            //        $scope.selected[data.id] = !$scope.selected[data.Id];
            //    } else {
            //        var self = $(this).parent();
            //        if ($(self).hasClass('selected')) {
            //            $(self).removeClass('selected');
            //            $scope.selected[data.id] = false;
            //        } else {
            //            $('#tblDataContract').DataTable().$('tr.selected').removeClass('selected');
            //            $scope.selected.forEach(function (obj, index) {
            //                if ($scope.selected[index])
            //                    $scope.selected[index] = false;
            //            });
            //            $(self).addClass('selected');
            //            $scope.selected[data.id] = true;
            //        }
            //    }

            //    vm.selectAll = false;
            //    $scope.$apply();
            //});
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {

                    var Id = data.id;
                    var Version = data.Version;
                    var obj = {
                        Id: Id,
                        Version: Version,
                    }
                    $scope.detailHistoryVersion(obj);
                }
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("id").withTitle(titleHtml).notSortable().withOption('sClass', 'hidden').renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('cusName').withTitle('{{"CONTRACT_CURD_COL_CUSNAME"|translate}}').withOption('sClass', 'w300').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('contractNo').withTitle('{{"CONTRACT_CURD_COL_CONTACT_NO"|translate}}').withOption('sClass', '').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('sEndDate').withTitle('{{"CONTRACT_CURD_COL_S_END_DATE"|translate}}').withOption('sClass', 'tcenter').renderWith(function (data, type) {
    //    var deadLine = '';
    //    if (data == '') {
    //        deadLine = '<span class="badge-customer badge-customer-success fs9 ml5">Không đặt thời hạn</span>'
    //    } else {
    //        var created = new Date(data);
    //        var diffMs = (created - new Date());
    //        var diffDay = Math.floor((diffMs / 86400000));
    //        if ((diffDay + 1) < 0) {
    //            deadLine = '<span class="badge-customer badge-customer-danger fs9 ml5 bold">Đã quá hạn</span>';
    //        } else if ((diffDay + 1) < 8) {
    //            deadLine = '<span class="badge-customer badge-customer-warning">Còn ' + (diffDay + 1) + ' ngày</span>'
    //        } else if ((diffDay + 1) < 16) {
    //            deadLine = '<span class="badge-customer badge-customer-success">Còn ' + (diffDay + 1) + ' ngày</span>'
    //        } else {
    //            deadLine = '<span class="badge-customer badge-customer-success fs9">Còn ' + (diffDay + 1) + ' ngày</span>'
    //        }
    //    }
    //    return '<div class="pt5">' + deadLine +
    //        '</div> ';
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('{{"CONTRACT_CURD_COL_NAME"|translate}}').withOption('sClass', '').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('budgetExcludeTax').withTitle('{{"CONTRACT_CURD_COL_BUDGET_EXCLUDE_TAX"|translate}}').withOption('sClass', 'tcenter ').renderWith(function (data, type) {
        return data != "" ? $filter('currency')(data, '', 0) : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('currency').withTitle('{{"CONTRACT_LIST_COL_CURENCY" | translate}}').withOption('sClass', 'tcenter ').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('budgetExcludeTax').withTitle('{{"CONTRACT_CURD_COL_BUDGET_EXCLUDE_TAX_VND"|translate}}').withOption('sClass', 'tcenter ').renderWith(function (data, type, full) {
        if (data != "" && full.ExchangeRate != "") {
            var rs = data * full.ExchangeRate;
            return data != "" && full.ExchangeRate != "" ? $filter('currency')(rs, '', 0) : null;
        }
        else {
            return null;
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('contractDate').withTitle('{{"CONTRACT_CURD_COL_CONTRACT_DATE"|translate}}').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data != null && data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('sEndDate').withTitle('{{"CONTRACT_CURD_COL_SEND_DATE"|translate}}').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data != null && data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withTitle('{{"CONTRACT_LIST_COL_ACTION" | translate}}').withOption('sClass', 'tcenter nowrap dataTable-w80').renderWith(function (data, type, full, meta) {
    //    return '<button title="Sửa" ng-click="edit(' + full.id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
    //        '<button title="Xoá" ng-click="delete(' + full.id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    //}));

    $scope.cancel = function () {

        $uibModalInstance.dismiss('cancel');
        //$rootScope.reloadMain();
    };
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
    $rootScope.reloadMain = function () {
        $scope.reload();
    };
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.search = function () {
        reloadData(true);
    };
    $scope.detailHistoryVersion = function (obj) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderContract + '/detailHistoryVersion.html',
            controller: 'detailHistoryVersion',
            backdrop: 'static',
            size: '70',
            resolve: {
                para: function () {
                    return obj;
                }
            }
        });
    };
});
app.controller('detailHistoryVersion', function ($scope, $filter, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceContract, para) {
    $rootScope.ListService = [];
    $scope.ListSupplier = [];
    $scope.ListProjects = [];
    $scope.modelViewHeader = {
        BudgetTotalInput: 0,
        TaxTotalDetail: 0,
        BudgetTotalDetail: 0,
        CusName: 0,
    };
    $scope.modelContact = {
        ContactId: null,
        ContactName: '',
        ContactPhone: '',
        ContactEmail: '',
        CusCode: ''
    }
    $scope.initData = function () {
        dataserviceContract.getItemHistoryVersion(para.Id, function (rsHist) {

            if (rsHist.Error) {
                App.toastrError(rsHist.Title);
            }
            else {
                $scope.model = rsHist.Object;
                //dataserviceContract.getCusName($scope.model.CusCode, function (rs) {rs=rs.data;
                //    $scope.modelViewHeader.CusName = rs;
                //});
                //$rootScope.Currency = $scope.model.Currency;
                //dataserviceContract.getListSupString(para.ContractCode, function (rs) {rs=rs.data;
                //    $scope.ListSupplier = rs.Object;
                //});

                //var role = $rootScope.MapCustomerRole[$scope.model.CusCode];
                //if (role != undefined) {
                //    if (role == "CUSTOMER_AGENCY") {
                //        $rootScope.customerType = "DAILY";
                //    }
                //    else {
                //        $rootScope.customerType = "LE";
                //    }
                //}
                //else {
                //    $rootScope.customerType = "LE";
                //}
                //dataserviceContract.getListProjectAdd($scope.model.PrjCode, function (rs) {rs=rs.data;
                //    $scope.ListProjects.push({ Code: '', Name: '-- Chọn --' });
                //    $scope.ListProjects = $scope.ListProjects.concat(rs);
                //});
                //dataserviceContract.getCustommerContactInfo($scope.model.CusCode, function (rs) {rs=rs.data;
                //    if (rs != null) {
                //        $scope.modelContact.ContactId = rs.Id;
                //        $scope.modelContact.ContactName = rs.ContactName;
                //        $scope.modelContact.ContactPhone = rs.MobilePhone;
                //        $scope.modelContact.ContactEmail = rs.Email;
                //    }
                //});
                //dataserviceContract.getService(function (rs) {rs=rs.data;
                //    if ($rootScope.customerType == "LE") {
                //        for (var i = 0; i < rs.length; i++) {
                //            if (rs[i].ServiceGroup == "DV_002") {
                //                $rootScope.ListService.push(rs[i]);
                //            }
                //        }
                //    }
                //    else if ($rootScope.customerType == "DAILY") {
                //        for (var i = 0; i < rs.length; i++) {
                //            if (rs[i].ServiceGroup == "DV_001") {
                //                $rootScope.ListService.push(rs[i]);
                //            }
                //        }
                //    }
                //});
                $scope.model.sEffectiveDate = ($scope.model.EffectiveDate != null ? $filter('date')(new Date($scope.model.EffectiveDate), 'dd/MM/yyyy') : "");
                $scope.model.sEndDate = ($scope.model.EndDate != null ? $filter('date')(new Date($scope.model.EndDate), 'dd/MM/yyyy') : "");
                $scope.model.ContractDate = ($scope.model.ContractDate != null ? $filter('date')(new Date($scope.model.ContractDate), 'dd/MM/yyyy') : "");
                $scope.model.AcceptanceTime = ($scope.model.AcceptanceTime != null ? $filter('date')(new Date($scope.model.AcceptanceTime), 'dd/MM/yyyy') : "");
                $scope.model.CreatedTime = convertDate($scope.model.CreatedTime);
                $scope.model.DeletedTime = convertDate($scope.model.DeletedTime);
                $scope.model.Duration = parseInt($scope.model.Duration);
                $scope.model.Maintenance = parseInt($scope.model.Maintenance);
                $rootScope.ContractId = $scope.model.ContractHeaderID;
                $rootScope.ContractCode = $scope.model.ContractCode;
                $rootScope.PoCode = $scope.model.ContractCode;
                $rootScope.CusCode = $scope.model.CusCode;
                $scope.modelViewHeader.BudgetTotalInput = $scope.model.BudgetExcludeTax + $scope.model.TaxAmount;
                $scope.modelViewHeader.TaxTotalDetail = $scope.model.RealBudget - $scope.model.Budget;
                $scope.modelViewHeader.BudgetTotalDetail = $scope.model.RealBudget;

                $scope.modelViewHeader.LastBudget = $scope.model.LastBudget;
                setTimeout(function () {
                    initDateTime();
                }, 100);
            }
        })

    }
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
        //$rootScope.reloadMain();
    };
    function initDateTime() {
        $("#datefrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EffectiveDate').datepicker('setStartDate', maxDate);
            if ($('#datefrom input').valid()) {
                $('#datefrom input').removeClass('invalid').addClass('success');
            }
        });
        $("#acceptanceTime").datepicker({
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
            $('#datefrom').datepicker('setEndDate', maxDate);
            resetValidateEffectiveDate();
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#EndDate').datepicker('setStartDate', null);
            }
        });
        $("#EndDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EffectiveDate').datepicker('setEndDate', maxDate);
            resetValidateEndDate();
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#EffectiveDate').datepicker('setEndDate', null);
            }
        });
    }
    setTimeout(function () {
        //initDateTime();
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 200);
    function convertDate(data) {
        var date = $filter('date')(new Date(data), 'dd/MM/yyyy');
        return date;
    }
    //$scope.export = function () {
    //    location.href = "/Admin/Contract/ExportExcelProduct?"
    //        + "contractCode=" + $scope.model.ContractCode
    //}
});

//tab product
app.controller('contractTabProductHis', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceContract, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        ProductCode: '',
        PriceOption: '',
        //UnitPrice: 0,
        Tax: 10
    }
    $scope.currentSelectedProduct = null;
    $scope.products = [];
    $scope.productType = "";
    $scope.isAdd = true;
    $scope.isShowImpProduct = true;
    $scope.priceOption = [];
    $rootScope.productJtable = {};

    //$scope.priceOptionAgent = [
    //    { Code: "PRICE_COST_CATELOGUE", Name: "Giá đại lý catalogue" },
    //    { Code: "PRICE_COST_AIRLINE", Name: "Giá đại lý đường bay" },
    //    { Code: "PRICE_COST_SEA", Name: "Giá đại lý đường biển" }
    //];
    //$scope.priceOptionRetail = [
    //    { Code: "PRICE_RETAIL_BUILD", Name: "Giá bán lẻ có thi công" },
    //    { Code: "PRICE_RETAIL_BUILD_AIRLINE", Name: "Giá bán lẻ có thi công bay" },
    //    { Code: "PRICE_RETAIL_BUILD_SEA", Name: "Giá bán lẻ có thi công kho, biển" },
    //    { Code: "PRICE_RETAIL_NO_BUILD", Name: "Giá bán lẻ không thi công" },
    //    { Code: "PRICE_RETAIL_NO_BUILD_AIRLINE", Name: "Giá bán lẻ không thi công bay" },
    //    { Code: "PRICE_RETAIL_NO_BUILD_SEA", Name: "Giá bán lẻ không thi công kho, biển" }
    //];

    //$scope.currentData = '';
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Contract/JTableProductHis",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ContractCode = $rootScope.ContractCode;
                //d.ContractVersionHis = $rootScope.ContractVersionHis;
            },
            complete: function () {
                App.unblockUI("#contentMain");

                console.log($rootScope.productJtable);
                for (var i in $rootScope.productJtable) {
                    var data = $rootScope.productJtable[i];
                    try {
                        var cost = parseFloat(data.UnitPrice) * parseInt(data.Quantity);
                        $rootScope.Budget = $rootScope.Budget + cost; //+ cost * data.Tax / 100;
                    } catch (Ex) {

                    }
                }
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
            $rootScope.productJtable[dataIndex] = data;
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
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductCode').withTitle('{{"CONTRACT_TAB_LOP_LIST_COL_PRODUCT_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UnitPrice').withTitle('{{"CONTRACT_TAB_LOP_LIST_COL_UNIT_PRICE" | translate}}').renderWith(function (data, type) {
        var dt = data != "" ? $filter('currency')(data, '', 0) : null;
        return dt;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withTitle('{{"CONTRACT_TAB_LOP_LIST_COL_QUANTITY" | translate}}').renderWith(function (data, type) {
        var dt = data != "" ? $filter('currency')(data, '', 0) : null;
        return dt;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('sUnit').withTitle('{{"CONTRACT_TAB_LOP_LIST_COL_S_UNIT" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Tax').withTitle('{{"CONTRACT_TAB_LOP_LIST_COL_TAX" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TotalPrice').withTitle('{{"CONTRACT_TAB_LOP_LIST_COL_TOTAL_PRICE" | translate}}').renderWith(function (data, type, full) {
        var cost = full.Quantity * full.UnitPrice;
        var dt = cost != "" ? $filter('currency')(cost, '', 0) : null;
        return dt;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('').withTitle('{{"CONTRACT_TAB_LOP_LIST_COL_AFTER_TAX" | translate}}').renderWith(function (data, type, full) {
        var cost = full.Quantity * full.UnitPrice + (full.Quantity * full.UnitPrice) * full.Tax / 100;
        var dt = cost != "" ? $filter('currency')(cost, '', 0) : null;
        return dt;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"CONTRACT_TAB_LOP_LIST_COL_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StatusName').withTitle('{{"CONTRACT_LIST_COL_ORDER_STATUS" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
    //    return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
    //        '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    //}));
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
    function validationselectTabProject(data) {
        var mess = { Status: false, Title: "" }
        if (data.ProductCode == "" || data.ProductCode == null) {
            $scope.errorProductCode = true;
            mess.Status = true;
        } else {
            $scope.errorProductCode = false;
        }
        if (data.Unit == "" || data.Unit == null) {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;
        }
        if (data.UnitPrice == undefined || data.UnitPrice == null || data.UnitPrice <= 0) {
            $scope.errorUnitPrice = true;
            mess.Status = true;
        } else {
            $scope.errorUnitPrice = false;
        }
        if (data.Tax != null && data.Tax != undefined && data.Tax < 0) {
            $scope.errorTax = true;
            mess.Status = true;
        } else {
            $scope.errorTax = false;
        }
        if (data.Quantity == null || data.Quantity == undefined || data.Quantity <= 0) {
            $scope.errorQuantity = true;
            mess.Status = true;
        } else {
            $scope.errorQuantity = false;
        }
        return mess;
    }
    $scope.changleSelect = function (SelectType) {

        if (SelectType == "ProductCode" && $scope.model.ProductCode != "") {
            $scope.errorProductCode = false;
        }
        if (SelectType == "Unit" && $scope.model.Unit != "") {
            $scope.errorUnit = false;
        }
        if (SelectType == "Tax" && ($scope.model.Tax != null && $scope.model.Tax != undefined && $scope.model.Tax < 0)) {
            $scope.errorTax = true;
        }
        else {
            $scope.errorTax = false;
            if ($scope.model.Tax == null || $scope.model.Tax == undefined) {
                $scope.model.Tax = 0;
            }
        }

        if (SelectType == "UnitPrice" && ($scope.model.UnitPrice == null || $scope.model.UnitPrice == undefined || $scope.model.UnitPrice <= 0)) {
            $scope.errorUnitPrice = true;
        }
        else {
            $scope.errorUnitPrice = false;
        }
        if (SelectType == "Quantity" && ($scope.model.Quantity == null || $scope.model.Quantity == undefined || $scope.model.Quantity <= 0)) {
            $scope.errorQuantity = true;
        }
        else {
            $scope.errorQuantity = false;
        }
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $rootScope.reloadTabProduct = function () {
        $scope.reload();
    }
    $scope.changeProduct = function () {
        $scope.errorProductCode = false;
        var item = null;
        for (var i = 0; i < $scope.products.length; ++i) {
            if ($scope.products[i].Code == $scope.model.ProductCode) {
                item = $scope.products[i];
                $scope.currentSelectedProduct = item;
                break;
            }
        }
        if (item != null) {

            $scope.errorUnit = false;
            $scope.model.Unit = item.Unit;
            $scope.model.Tax = item.Tax;
            $scope.productType = item.ProductType;
        }
        $scope.filterPrice();
    }
    $scope.filterPrice = function () {
        if ($scope.model.ProductCode != '' && $scope.model.PriceOption != '' && $scope.currentSelectedProduct != null) {
            var price = 0;
            if ($scope.model.PriceOption == "PRICE_COST_CATELOGUE")
                price = $scope.currentSelectedProduct.PriceCostCatelogue;
            if ($scope.model.PriceOption == "PRICE_COST_AIRLINE")
                price = $scope.currentSelectedProduct.PriceCostAirline;
            if ($scope.model.PriceOption == "PRICE_COST_SEA")
                price = $scope.currentSelectedProduct.PriceCostSea;
            if ($scope.model.PriceOption == "PRICE_RETAIL_BUILD")
                price = $scope.currentSelectedProduct.PriceRetailBuild;
            if ($scope.model.PriceOption == "PRICE_RETAIL_BUILD_AIRLINE")
                price = $scope.currentSelectedProduct.PriceRetailBuildAirline;
            if ($scope.model.PriceOption == "PRICE_RETAIL_BUILD_SEA")
                price = $scope.currentSelectedProduct.PriceRetailBuildSea;
            if ($scope.model.PriceOption == "PRICE_RETAIL_NO_BUILD")
                price = $scope.currentSelectedProduct.PriceRetailNoBuild;
            if ($scope.model.PriceOption == "PRICE_RETAIL_NO_BUILD_AIRLINE")
                price = $scope.currentSelectedProduct.PriceRetailNoBuildAirline;
            if ($scope.model.PriceOption == "PRICE_RETAIL_NO_BUILD_SEA")
                price = $scope.currentSelectedProduct.PriceRetailNoBuildSea;
            $scope.model.UnitPrice = price;
        }
    }
    $scope.validator = function (data) {

        var msg = { Error: false, Title: null };
        if (data.ProductCode == null || data.ProductCode == '' || data.ProductCode == undefined) {
            msg.Error = true;
            msg.Title = "Vui lòng chọn sản phẩm";
        }

        return msg;
    }

    $scope.init = function () {
        $scope.priceOption = [];
        if ($rootScope.customerType == "LE")
            $scope.priceOption = $scope.priceOptionRetail;
        else
            $scope.priceOption = $scope.priceOptionAgent;
        dataserviceContract.getProductCost(function (rs) {
            rs = rs.data;
            $scope.products = rs;

        });
        dataserviceContract.getProductUnit(function (rs) {
            rs = rs.data;
            $scope.units = rs;

        });
    }
    $scope.init();
    $scope.close = function (id) {
        $scope.isAdd = true;
        $scope.model = {
            ServiceCode: '',
            Quantity: 1,
            Cost: '',
            Unit: '',
            //Currency: 'VND',
            Tax: 10
        }
        $scope.editId = -1;
        $scope.serviceDetails = [];
        $scope.serviceConditions = [];
    }
    $scope.save = function (id) {
        if ($scope.model.Tax == null || $scope.model.Tax == undefined) {
            $scope.model.Tax = 0;
        }
        validationselectTabProject($scope.model);
        var md = {};
        md.ContractCode = $rootScope.ContractCode;
        md.ProductCode = $scope.model.ProductCode;
        md.Quantity = $scope.model.Quantity;
        md.Cost = $scope.model.UnitPrice;
        md.Unit = $scope.model.Unit;
        md.Tax = $scope.model.Tax;
        md.Note = $scope.model.Note;

        md.ContractHeaderID = $rootScope.ContractId;
        md.ContractCode = $rootScope.ContractCode;
        md.PriceType = $scope.model.PriceOption;
        md.ProductType = $scope.productType;

        if (/*$scope.addformTabProduct.validate() && */validationselectTabProject($scope.model).Status == false) {
            dataserviceContract.updateProductInContract(md, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                    if (rs.ID != '' && rs.ID < 0) {
                        $scope.reload();
                        $rootScope.amountbudget(rs.Object);
                    }
                }
                else {
                    $scope.isAdd = true;
                    $scope.model = {
                        ServiceCode: '',
                        Quantity: 1,
                        Cost: '',
                        Unit: '',
                        //Currency: 'VND',
                        Tax: 10
                    }
                    $scope.editId = -1;
                    App.toastrSuccess(rs.Title);
                    $scope.serviceDetails = [];
                    $scope.reload();
                    $rootScope.amountbudget(rs.Object);
                }
            });
        }
    }
});

app.controller('contractTabContractPo', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceContract, $filter) {
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
            url: "/Admin/Contract/JtableContractPo",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ContractCode = $rootScope.ContractCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataContractPo")
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
            $rootScope.productJtable[dataIndex] = data;
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
                        $('#tblDataContractPo').DataTable().$('tr.selected').removeClass('selected');
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('ObjCode').withTitle('{{"CONTRACT_CURD_LBL_CODE_ORDERS" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Type').withTitle('{{"CONTRACT_CURD_TAB_PAYMENT_LIST_COL_AET_TYPE" | translate}}').renderWith(function (data, type) {
        if (data == "STORAGE") {
            return "Lưu kho";
        } else {
            return "Đơn hàng theo khách hàng";
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('OrderBy').withTitle('{{"CONTRACT_CURD_LBL_ORDERER" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Consigner').withTitle('{{"CONTRACT_CURD_LBL_SENDER" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"CONTRACT_CURD_TAB_FILE_LIST_COL_CREATED_TIME" | translate}}').renderWith(function (data, type) {
        return data != null ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Action').withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').renderWith(function (data, type, full) {
        return '<a title="Xóa" ng-click="delete(' + full.Id + ')" class="fs25"><i class="fas fa-trash"style="--fa-primary-color: red;"></i></a>';
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
        dataserviceContract.getContractPoBuyer(function (rs) {
            rs = rs.data;
            $scope.listContractBuy = rs;
        })
        dataserviceContract.getObjectRelative(function (rs) {
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
            $scope.model.ObjRootCode = $rootScope.ContractCode;
            dataserviceContract.insertContractPo($scope.model, function (rs) {
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
            $scope.model.ObjRootCode = $rootScope.ContractCode;
            dataserviceContract.updateRequestImportProduct($scope.model, function (rs) {
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
        dataserviceContract.deleteContractPo(id, function (rs) {
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

app.controller('contractTabRequestImportProduct', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceContract, $filter) {
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
            url: "/Admin/Contract/JtableRequestImportProduct",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ContractCode = $rootScope.ContractCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataRQImportProduct")
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
            $rootScope.productJtable[dataIndex] = data;
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
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ObjCode').withTitle('{{"CONTRACT_CURD_LBL_REQUEST_CODE" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"CONTRACT_CURD_LBL_TITLE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CusName').withTitle('{{"CONTRACT_CURD_LBL_CUSTOMERS_WORKS" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{"CONTRACT_CURD_LBL_SENDER" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"CONTRACT_CURD_TAB_FILE_LIST_COL_CREATED_TIME" | translate}}').renderWith(function (data, type) {
        return data != null ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Action').withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').renderWith(function (data, type, full) {
        return '<a title="Xóa" ng-click="delete(' + full.Id + ')" class="fs25"><i class="fas fa-trash"style="--fa-primary-color: red;"></i></a>';
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
        dataserviceContract.getRqImpProduct(function (rs) {
            rs = rs.data;
            $scope.listRqImpProduct = rs;
        })
        dataserviceContract.getObjectRelative(function (rs) {
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
            $scope.model.ObjRootCode = $rootScope.ContractCode;
            dataserviceContract.insertRequestImportProduct($scope.model, function (rs) {
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
            $scope.model.ObjRootCode = $rootScope.ContractCode;
            dataserviceContract.updateRequestImportProduct($scope.model, function (rs) {
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
        dataserviceContract.deleteRequestImportProduct(id, function (rs) {
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

app.controller('contractTabProject', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceContract, $filter) {
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
            url: "/Admin/Contract/JtableContractProject",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ContractCode = $rootScope.ContractCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataProject")
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
            $rootScope.productJtable[dataIndex] = data;
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
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ObjCode').withTitle('{{"CONTRACT_CURD_LBL_PROJECT_CODE" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProjectTitle').withTitle('{{"CONTRACT_CURD_LBL_PROJECT_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Budget').withTitle('{{"CONTRACT_CURD_TAB_PAYMENT_CURD_LBL_TOTAL" | translate}}').renderWith(function (data, type) {
        var budget = data != "" ? $filter('currency')(data, '', 0) : null;
        return '<span class= "text-danger bold">' + budget + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Currency').withTitle('{{"CONTRACT_CURD_TAB_DETAIL_LIST_COL_UNIT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StartTime').withTitle('{{"CONTRACT_TAB_WA_LIST_COL_BEGIN_TIME" | translate}}').renderWith(function (data, type) {
        return data != null ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EndTime').withTitle('{{"CONTRACT_CURD_LBL_END_DAY" | translate}}').renderWith(function (data, type) {
        return data != null ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Action').withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').renderWith(function (data, type, full) {
        return '<a title="Xóa" ng-click="delete(' + full.Id + ')"  class="fs25"><i class="fas fa-trash"style="--fa-primary-color: red;"></i></a>';
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
    $scope.changleSelect = function (selectType) {
        if (selectType == "ObjCode" && $scope.model.ObjCode != "") {
            $scope.errorObjCode = false;
        }
        if (selectType == "ObjRelative" && $scope.model.ObjRelative != "") {
            $scope.errorObjRelative = false;
        }
    }
    $scope.init = function () {
        dataserviceContract.getProjects(function (rs) {
            rs = rs.data;
            $scope.listProject = rs;
        })
        dataserviceContract.getObjectRelative(function (rs) {
            rs = rs.data;
            $scope.listRelative = rs;
        })
    }
    $scope.init();
    $scope.add = function () {
        if (validationSelect($scope.model).Status == false) {
            $scope.model.ObjRootCode = $rootScope.ContractCode;
            dataserviceContract.insertContractProject($scope.model, function (rs) {
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
            $scope.model.ObjRootCode = $rootScope.ContractCode;
            dataserviceContract.updateContractProject($scope.model, function (rs) {
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
        dataserviceContract.deleteContractProject(id, function (rs) {
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

//Schedule contract sale
app.controller('schedule-contract-sale', function ($scope, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModal, $uibModalInstance, $filter, dataserviceContract) {
    $scope.model = {
        MemberId: '',
        FromDate: '',
        ToDate: ''
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.statistical = function () {
        dataserviceContract.getWorkTimeOfUser('', '', '', function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/statistical.html',
                    controller: 'statistical',
                    backdrop: 'static',
                    resolve: {
                        para: function () {
                            return {
                                data: rs.Object.Data,
                                user: rs.Object.User
                            };
                        }
                    },
                    size: '70'
                });
                modalInstance.result.then(function (d) {

                }, function () {
                });
            }
        })
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
        //$('#DateTo').datepicker('update', $rootScope.DateNow);
        $('.end-date').click(function () {
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
        });
    }
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
                var month = $('#calendarContractSale').fullCalendar('getDate').format('MM');
                var year = $('#calendarContractSale').fullCalendar('getDate').format('YYYY');
                dataserviceContract.scheduleContractSales(month, year, function (rs) {
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
                        var nextpay = {
                            value: 2,
                            title: "Thanh toán: " + value.Nextpay,
                            start: value.Date,
                            className: 'fc-event-event-green',
                            date: value.Date,
                            displayEventTime: false,
                        }
                        var renew = {
                            value: 3,
                            title: "Gia hạn: " + value.Renew,
                            start: value.Date,
                            className: 'fc-event-event-azure',
                            date: value.Date,
                            displayEventTime: false,
                        }

                        event.push(expried);
                        event.push(nextpay);
                        event.push(renew);
                    })
                    callback(event);
                })
            },
            eventClick: function (calEvent) {
                var date = $filter('date')(new Date(calEvent.date), 'dd/MM/yyyy');
                var value = calEvent.value;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderContract + '/view-calendar.html',
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
            $('#calendarContractSale').fullCalendar('gotoDate', date);
        }
    }
    setTimeout(function () {
        loadCalendar("calendarContractSale");
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
app.controller('grid-view-calendar', function ($scope, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModal, $uibModalInstance, $filter, dataserviceContract, para) {
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.date = para.Date;
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        //Key: '',
        FromDate: '',
        ToDate: '',
        ContractCode: '',
        Status: '',
        BudgetF: '',
        BudgetT: '',
        Signer: '',
        Currency: '',
        BranchId: '',
        CusCode: ''
    }
    $scope.initData = function () {
        dataserviceContract.getBranch(function (rs) {
            rs = rs.data;
            $scope.listBranch = rs;
            var all = {
                Code: '',
                Name: caption.COM_TXT_ALL
            }
            $scope.listBranch.unshift(all);
        })
        var date = new Date();
        var priorDate = new Date().setDate(date.getDate() - 30)
        $scope.model.ToDate = $filter('date')((date), 'dd/MM/yyyy')
        $scope.model.FromDate = $filter('date')((priorDate), 'dd/MM/yyyy')
    }
    $scope.initData();
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Contract/JTableCalendar",
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
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                    $scope.selected[data.id] = !$scope.selected[data.Id];
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.id] = false;
                    } else {
                        $('#tblDataContractCalendar').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.id] = true;
                    }
                }

                vm.selectAll = false;
                $scope.$apply();
            });
            //$(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
            //    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

            //    } else {

            //        var Id = data.id;
            //        $scope.edit(Id);
            //    }
            //});
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("id").withTitle(titleHtml).notSortable().withOption('sClass', 'hidden').renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Code').withTitle('{{"CONTRACT_LIST_COL_CODE" | translate}}').withOption('sClass', 'hidden dataTable-pr0 w170').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('cusName').withTitle('{{"CONTRACT_CURD_COL_CUSNAME"|translate}}').withOption('sClass', 'w300').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('contractNo').withTitle('{{"CONTRACT_CURD_COL_CONTACT_NO"|translate}}').withOption('sClass', '').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('sEndDate').withTitle('{{"CONTRACT_CURD_COL_S_END_DATE"|translate}}').withOption('sClass', 'tcenter').renderWith(function (data, type) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('{{"CONTRACT_CURD_COL_NAME"|translate}}').withOption('sClass', '').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('budgetExcludeTax').withTitle('{{"CONTRACT_CURD_COL_BUDGET_EXCLUDE_TAX"|translate}}').withOption('sClass', 'tcenter ').renderWith(function (data, type) {
        var tax = data != "" ? $filter('currency')(data, '', 0) : null;
        return '<span class="text-danger bold">' + tax + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('currency').withTitle('{{"CONTRACT_LIST_COL_CURENCY" | translate}}').withOption('sClass', 'tcenter ').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Percent').withTitle('{{ "PROJECT_LIST_COL_PROGRESS" | translate }}').withOption('sClass', 'tcenter ').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('budgetExcludeTax').withTitle('{{"CONTRACT_CURD_COL_BUDGET_EXCLUDE_TAX_VND"|translate}}').withOption('sClass', 'tcenter ').renderWith(function (data, type, full) {
        if (data != "" && full.ExchangeRate != "") {
            var rs = data * full.ExchangeRate;
            var excludeTax = data != "" && full.ExchangeRate != "" ? $filter('currency')(rs, '', 0) : null;
            return '<span class ="text-danger bold">' + excludeTax + '</span>'
        }
        else {
            return null;
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('contractDate').withTitle('{{"CONTRACT_CURD_COL_CONTRACT_DATE"|translate}}').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data != null && data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('sEndDate').withTitle('{{"CONTRACT_CURD_COL_SEND_DATE"|translate}}').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data != null && data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('status').withTitle('{{"CONTRACT_TAB_WA_LIST_COL_STATUS"|translate}}').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"CONTRACT_LIST_COL_CREATE_TIME"|translate}}').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data != null && data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withTitle('{{"CONTRACT_LIST_COL_ACTION" | translate}}').withOption('sClass', 'tcenter nowrap dataTable-w80').renderWith(function (data, type, full, meta) {
    //    return '<button title="Sửa" ng-click="edit(' + full.id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
    //        '<button title="Xoá" ng-click="delete(' + full.id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    //}));

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

app.controller('addProjectMini', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $controller, $sce) {
    $controller('addProject', { $scope: $scope });
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.isMini = true;
    $scope.project = {};
});