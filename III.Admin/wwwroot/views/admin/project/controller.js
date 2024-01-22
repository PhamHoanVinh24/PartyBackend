var ctxfolderProject = "/views/admin/project";
var ctxfolderMessage = "/views/message-box";
var ctxfolderFileShare = "/views/admin/fileObjectShare";
var ctxfolderCommonSetting = "/views/admin/commonSetting";
var ctxfolderImpProduct = "/views/admin/sendRequestImportProduct";
var app = angular.module('App_ESEIM_PROJECT', ['App_ESEIM_DASHBOARD', 'App_ESEIM', 'App_ESEIM_CARD_JOB', 'App_ESEIM_CUSTOMER', 'App_ESEIM_FILE_PLUGIN', 'App_ESEIM_SUPPLIER', 'App_ESEIM_ATTR_MANAGER', 'App_ESEIM_MATERIAL_PROD', 'App_ESEIM_REPOSITORY', "ui.bootstrap", "ngRoute", "ngCookies", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", "pascalprecht.translate", 'datatables.colreorder', 'angular-confirm', 'ui.select', 'ngTagsInput', 'dynamicNumber', 'ui.tab.scroll']);
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

app.directive('customOnChangeProject', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChangeProject);
            element.on('change', onChangeHandler);
            element.on('$destroy', function () {
                element.off();
            });

        }
    };
});

app.directive('paymentOnChange', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.paymentOnChange);
            element.on('change', onChangeHandler);
            element.on('$destroy', function () {
                element.off();
            });

        }
    };
});

app.factory('dataserviceProject', function ($http) {
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
        getDataType: function (callback) {
            $http.get('/Admin/CommonSetting/GetDataType').then(callback);
        },
        insertCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Insert/', data).then(callback);
        },
        getTotalReceipt: function (fromTime, toTime, aetType, status, isplan, callback) {
            $http.post('/Admin/FundAccEntry/Total?fromDatePara=' + fromTime + "&&toDatePara=" + toTime + "&&aetType=" + aetType + "&&status=" + status + "&&isPlan=" + isplan).then(callback);
        },
        updateCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Update/', data).then(callback);
        },
        deleteCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Delete', data).then(callback);
        },
        getListUser: function (callback) {
            $http.post('/Admin/User/GetListUser').then(callback);
        },
        getObjDependency: function (callback) {
            $http.post('/Admin/CardJob/GetObjDependency').then(callback);
        },
        gettreedata: function (data, callback) {
            $http.post('/Admin/FundCatReptExps/GetTreeData', data).then(callback);
        },
        getGetCatName: function (callback) {
            $http.post('/Admin/FundAccEntry/GetCatName').then(callback);
        },
        getListTitle: function (callback) {
            $http.post('/Admin/FundAccEntry/GetListTitle').then(callback);
        },
        getGetAetRelative: function (callback) {
            $http.post('/Admin/FundAccEntry/GetAetRelative').then(callback);
        },
        getGenAETCode: function (type, catCode, callback) {
            $http.post('/admin/FundAccEntry/GenAETCode?type=' + type + "&&catCode=" + catCode).then(callback);
        },
        getCurrency: function (callback) {
            $http.post('/Admin/MaterialPaymentTicket/GetUnit').then(callback);
        },
        getAddress: function (lat, lon, callback) {
            $http.get('/Admin/CardJob/GetAddress?lat=' + lat + '&lon=' + lon).then(callback);
        },
        getListCustomers: function (callback) {
            $http.post('/Admin/Project/GetListCustomers/').then(callback);
        },
        getListSupplier: function (callback) {
            $http.post('/Admin/Project/GetListSupplier/').then(callback);
        },
        getStatus: function (callback) {
            $http.post('/Admin/Project/GetStatus/').then(callback);
        },
        getListProject: function (callback) {
            $http.post('/Admin/Project/GetListProject/').then(callback);
        },
        getBranch: function (callback) {
            $http.post('/Admin/Project/GetBranch').then(callback);
        },

        //payment
        getItemPayment: function (data, callback) {
            $http.post('/Admin/FundAccEntry/GetItem/', data).then(callback);
        },
        insertPayment: function (data, callback) {
            $http.post('/Admin/FundAccEntry/Insert/', data).then(callback);
        },
        updatePayment: function (data, callback) {
            $http.post('/Admin/FundAccEntry/Update/', data).then(callback);
        },
        deletePayment: function (data, callback) {
            $http.post('/Admin/FundAccEntry/Delete/' + data).then(callback);
        },
        getTotalPayment: function (data, callback) {
            $http.post('/Admin/Project/GetTotalPayment', data).then(callback);
        },
        insertAccEntryTracking: function (aetCode, status, note, aetRelative, callback) {
            $http.post('/admin/FundAccEntry/InsertAccEntryTracking?aetCode=' + aetCode + "&&status=" + status + "&&note=" + note + "&&aetRelative=" + aetRelative).then(callback);
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
        insertFilePayment: function (data, callback) {
            submitFormUpload('/Admin/Project/InsertFilePayment/', data, callback);
        },

        //project
        exportExcel: function (data, callback) {
            $http.post('/Admin/Project/ExportExcel/', data).then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/Project/Insert/', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/Project/Update/', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/Project/Delete/' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/Project/GetItem/' + data).then(callback);
        },
        getProjectType: function (callback) {
            $http.post('/Admin/Project/GetProjectType/').then(callback);
        },
        getObjCode: function (objDepen, callback) {
            $http.post('/Admin/CardJob/GetObjCode/?Dependency=' + objDepen).then(callback);
        },
        checkPlan: function (data, callback) {
            $http.post('/Admin/FundAccEntry/CheckPlan?aetCode=' + data).then(callback);
        },
        getListFundFiles: function (data, callback) {
            $http.post('/Admin/FundAccEntry/GetListFundFiles?aetCode=' + data).then(callback);
        },
        getAetRelativeChil: function (data, callback) {
            $http.post('/Admin/FundAccEntry/GetAetRelativeChil?aetCode=' + data).then(callback);
        },
        getTotalSurplus: function (data, callback) {
            $http.post('/Admin/Project/GetTotalSurplus/', data).then(callback);
        },
        addCheckList: function (data, callback) {
            $http.post('/Admin/Project/AddCheckList', data).then(callback);
        },

        //attribute
        getItemProjectTabAttribute: function (data, callback) {
            $http.post('/Admin/Project/GetItemProjectTabAttribute/', data).then(callback);
        },
        insertProjectTabAttribute: function (data, callback) {
            $http.post('/Admin/Project/InsertProjectTabAttribute/', data).then(callback);
        },
        updateProjectTabAttribute: function (data, callback) {
            $http.post('/Admin/Project/UpdateProjectTabAttribute/', data).then(callback);
        },
        deleteProjectTabAttribute: function (data, callback) {
            $http.post('/Admin/Project/DeleteProjectTabAttribute/', data).then(callback);
        },


        //Member
        getMember: function (data, callback) {
            $http.get('/Admin/Project/GetMember/' + data).then(callback);
        },
        insertProjectTabMember: function (data, callback) {
            $http.post('/Admin/Project/InsertProjectTabMember/', data).then(callback);
        },
        updateProjectTabMember: function (data, callback) {
            $http.post('/Admin/Project/UpdateProjectTabMember/', data).then(callback);
        },
        deleteProjectTabMember: function (data, callback) {
            $http.post('/Admin/Project/DeleteProjectTabMember/' + data).then(callback);
        },

        //Note
        getNote: function (data, callback) {
            $http.get('/Admin/Project/GetNote/' + data).then(callback);
        },
        insertProjectTabNote: function (data, callback) {
            $http.post('/Admin/Project/InsertProjectTabNote/', data).then(callback);
        },
        deleteprojectTabNote: function (data, callback) {
            $http.post('/Admin/Project/DeleteprojectTabNote/' + data).then(callback);
        },
        updateProjectTabNote: function (data, callback) {
            $http.post('/Admin/Project/UpdateProjectTabNote/', data).then(callback);
        },

        //Event
        getAppointment: function (data, callback) {
            $http.get('/Admin/Project/GetAppointment/' + data).then(callback);
        },
        insertProjectTabAppointment: function (data, callback) {
            $http.post('/Admin/Project/InsertProjectTabAppointment/', data).then(callback);
        },
        deleteProjectTabAppointment: function (data, callback) {
            $http.post('/Admin/Project/DeleteProjectTabAppointment/' + data).then(callback);
        },
        updateProjectTabAppointment: function (data, callback) {
            $http.post('/Admin/Project/UpdateProjectTabAppointment/', data).then(callback);
        },
        getAllEvent: function (data, callback) {
            $http.get('/Admin/Project/GetAllEvent?projectCode=' + data).then(callback);
        },

        //File
        getTreeCategory: function (callback) {
            $http.post('/Admin/EDMSRepository/GetTreeCategory').then(callback);
        },
        getProjectFile: function (data, callback) {
            $http.post('/Admin/Project/GetProjectFile/' + data).then(callback);
        },
        insertProjectFile: function (data, callback) {
            submitFormUpload('/Admin/Project/InsertProjectFile/', data, callback);
        },
        updateProjectFile: function (data, callback) {
            submitFormUpload('/Admin/Project/UpdateProjectFile/', data, callback);
        },
        deleteProjectFile: function (data, callback) {
            $http.post('/Admin/Project/DeleteProjectFile/' + data).then(callback);
        },
        getItemFile: function (data, data1, data2, callback) {
            $http.get('/Admin/EDMSRepository/GetItemFile?id=' + data + '&&IsEdit=' + data1 + '&mode=' + data2).then(callback);
        },
        getSuggestionsProjectFile: function (data, callback) {
            $http.get('/Admin/Project/GetSuggestionsProjectFile?projectCode=' + data).then(callback);
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
        createTempFile: function (data, data1, data2, callback) {
            $http.post('/Admin/EDMSRepository/CreateTempFile?Id=' + data + "&isSearch=" + data1 + "&content=" + data2).then(callback);
        },

        //contact
        insertContact: function (data, callback) {
            $http.post('/Admin/Project/InsertContact/', data).then(callback);
        },
        deleteContact: function (data, callback) {
            $http.post('/Admin/Project/DeleteContact/' + data).then(callback);
        },
        updateContact: function (data, callback) {
            $http.post('/Admin/Project/UpdateContact/', data).then(callback);
        },
        getContact: function (data, callback) {
            $http.get('/Admin/Project/GetContact/' + data).then(callback);
        },

        //tab teams
        getAllTeam: function (callback) {
            $http.post('/Admin/Project/GetAllTeam').then(callback);
        },
        addTeam: function (data, callback) {
            $http.post('/Admin/Project/AddTeam/', data).then(callback);
        },
        deleteTeam: function (data, callback) {
            $http.post('/Admin/Project/DeleteTeam/', data).then(callback);
        },
        getTeamInProject: function (projectId, callback) {
            $http.post('/Admin/Project/GetTeamInProject?projectId=' + projectId).then(callback);
        },

        //product
        getProduct: function (callback) {
            $http.post('/Admin/Project/GetProduct').then(callback);
        },
        getProductUnit: function (callback) {
            $http.post('/Admin/Contract/GetProductUnit').then(callback);
        },
        getPriceOption: function (data, callback) {
            $http.get('/Admin/Project/GetPriceOption?customerCode=' + data).then(callback);
        },
        getItemPrice: function (data, callback) {
            $http.get('/Admin/Project/GetItemPrice?productCode=' + data).then(callback);
        },
        insertProduct: function (data, callback) {
            $http.post('/Admin/Project/InsertProduct', data).then(callback);
        },
        updateProduct: function (data, callback) {
            $http.post('/Admin/Project/UpdateProduct', data).then(callback);
        },
        deleteProduct: function (data, callback) {
            $http.post('/Admin/Project/DeleteProduct/' + data).then(callback);
        },
        getProductInProject: function (data, callback) {
            $http.post('/Admin/Project/GetProductInProject?projectCode=' + data).then(callback);
        },

        //productHeader
        createTicketCodeProduct: function (data, callback) {
            $http.post('/Admin/Project/CreateTicketCodeProduct?projectCode=' + data).then(callback);
        },
        insertProductHeader: function (data, callback) {
            $http.post('/Admin/Project/InsertProductHeader', data).then(callback);
        },
        getProductHeader: function (data, callback) {
            $http.post('/Admin/Project/GetProductHeader?id=' + data).then(callback);
        },
        updateProductHeader: function (data, callback) {
            $http.post('/Admin/Project/UpdateProductHeader', data).then(callback);
        },
        deleteProductHeader: function (data, callback) {
            $http.post('/Admin/Project/DeleteProductHeader/' + data).then(callback);
        },
        getListStore: function (callback) {
            $http.post('/Admin/MaterialImpStore/GetListStore').then(callback);
        },
        getListProductRemain: function (data, callback) {
            $http.get('/Admin/Project/GetListProductRemain?projectCode=' + data).then(callback);
        },
        exportExcelProduct: function (data, callback) {
            $http.post('/Admin/Project/ExportExcelProduct?projectCode=' + data).then(callback);
        },
        //productDetail
        insertProductDetail: function (data, callback) {
            $http.post('/Admin/Project/InsertProductDetail', data).then(callback);
        },
        getProductDetail: function (data, callback) {
            $http.get('/Admin/Project/GetProductDetail?ticketCode=' + data).then(callback);
        },
        deleteProductDetail: function (data, data1, callback) {
            $http.post(`/Admin/Project/DeleteProductDetail?id=${data}&headerId=${data1}`).then(callback);
        },
        // Import Excel
        uploadFile: function (data, callback) {
            submitFormUpload('/Admin/Project/UploadFileExcel', data, callback)
        },
        //logInfomation: function (data, callback) {
        //    $http.post('/Admin/Project/LogInfomation', data).then(callback);
        //},
        validateData: function (data, callback) {
            $http.post('/Admin/Project/ValidateData', data).then(callback);
        },
        insertFromExcel: function (data, callback) {
            $http.post('/Admin/Project/InsertFromExcel', data).then(callback);
        },

        //service
        getService: function (callback) {
            $http.get('/Admin/Project/GetService').then(callback);
        },
        getServiceLevel: function (callback) {
            $http.get('/Admin/Project/GetServiceLevel').then(callback);
        },
        getServiceDuration: function (callback) {
            $http.get('/Admin/Project/GetServiceDuration').then(callback);
        },
        insertService: function (data, callback) {
            $http.post('/Admin/Project/InsertService', data).then(callback);
        },
        updateService: function (data, callback) {
            $http.post('/Admin/Project/UpdateService', data).then(callback);
        },
        deleteService: function (data, callback) {
            $http.post('/Admin/Project/DeleteService/' + data).then(callback);
        },

        //serviceHeader
        createTicketCodeService: function (data, callback) {
            $http.post('/Admin/Project/CreateTicketCodeService?projectCode=' + data).then(callback);
        },
        insertServiceHeader: function (data, callback) {
            $http.post('/Admin/Project/InsertServiceHeader', data).then(callback);
        },
        getServiceHeader: function (data, callback) {
            $http.post('/Admin/Project/GetServiceHeader?id=' + data).then(callback);
        },
        updateServiceHeader: function (data, callback) {
            $http.post('/Admin/Project/UpdateServiceHeader', data).then(callback);
        },
        deleteServiceHeader: function (data, callback) {
            $http.post('/Admin/Project/DeleteServiceHeader/' + data).then(callback);
        },
        //serviceDetail
        insertServiceDetail: function (data, callback) {
            $http.post('/Admin/Project/InsertServiceDetail', data).then(callback);
        },
        getServiceDetail: function (data, callback) {
            $http.get('/Admin/Project/GetServiceDetail?ticketCode=' + data).then(callback);
        },
        deleteServiceDetail: function (data, data1, callback) {
            $http.post(`/Admin/Project/DeleteServiceDetail?id=${data}&headerId=${data1}`).then(callback);
        },

        getCustomers: function (callback) {
            $http.post('/Admin/Contract/GetCustomers/').then(callback);
        },
        getListSupplier: function (callback) {
            $http.post('/Admin/MaterialProductHistorySale/GetListSupplier/').then(callback);
        },
        getProjectCode: function (data1, callback) {
            $http.get('/Admin/Contract/GetProjectCode/' + data1).then(callback);
        },
        //getContractFromProject: function (data1, callback) {
        //    $http.get('/Admin/Contract/GetContractFromProject/?projectCode=' + data1).then(callback);
        //},
        chkExistRequestImp: function (data1, callback) {
            $http.get('/Admin/Contract/ChkExistRequestImp/?poCode=' + data1).then(callback);
        },
        getListCurrency: function (callback) {
            $http.post('/Admin/ServiceCategoryPrice/GetListCurrency').then(callback);
        },
        getListProduct: function (poCode, callback) {
            $http.get('/Admin/Project/GetListProduct?projectCode=' + poCode).then(callback);
        },
        getListAllProduct: function (callback) {
            $http.post('/Admin/Contract/GetListProduct').then(callback);
        },
        ////Request Import Product
        getContractPoBuyer: function (callback) {
            $http.post('/Admin/Project/GetContractPoBuyer/').then(callback);
        },
        getContractSale: function (callback) {
            $http.post('/Admin/Project/GetContractSale/').then(callback);
        },
        getRqImpProduct: function (callback) {
            $http.post('/Admin/Project/GetRqImpProduct/').then(callback);
        },
        getObjectRelative: function (callback) {
            $http.get('/Admin/Project/GetObjectRelative').then(callback);
        },
        insertRequestImportProduct: function (data, callback) {
            $http.post('/Admin/Project/InsertRequestImportProduct/', data).then(callback);
        },
        updateRequestImportProduct: function (data, callback) {
            $http.post('/Admin/Project/UpdateRequestImportProduct/', data).then(callback);
        },
        deleteRequestImportProduct: function (data, callback) {
            $http.post('/Admin/Project/DeleteRequestImportProduct?id=' + data).then(callback);
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
        getListUnit: function (callback) {
            $http.post('/Admin/SendRequestImportProduct/GetListUnit').then(callback);
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

        //Contract Po Buyer
        insertContractPoBuyer: function (data, callback) {
            $http.post('/Admin/Project/InsertContractPoBuyer/', data).then(callback);
        },
        updateContractPoBuyer: function (data, callback) {
            $http.post('/Admin/Project/UpdateContractPoBuyer/', data).then(callback);
        },
        deleteContractPoBuyer: function (data, callback) {
            $http.post('/Admin/Project/DeleteContractPoBuyer?id=' + data).then(callback);
        },

        //Contract sale
        insertContractSale: function (data, callback) {
            $http.post('/Admin/Project/InsertContractSale/', data).then(callback);
        },
        updateContractSale: function (data, callback) {
            $http.post('/Admin/Project/UpdateContractSale/', data).then(callback);
        },
        deleteContractSale: function (data, callback) {
            $http.post('/Admin/Project/DeleteContractSale?id=' + data).then(callback);
        },

        //Schedule
        scheduleContractProject: function (data, data1, callback) {
            $http.post('/Admin/Project/ScheduleContractProject?month=' + data + '&year=' + data1).then(callback);
        },

        getCountProj: function (callback) {
            $http.post('/Admin/Project/GetCountProj').then(callback);
        },
        //Percent object
        getPercentObject: function (data, data1, callback) {
            $http.post('/Admin/CardJob/GetPercentObject?objCode=' + data + '&objType=' + data1).then(callback)
        },

        getCountNotify: function (callback) {
            $http.post('/Admin/NotifiManager/GetCountNotify/').then(callback);
        },

        //Status
        getLogStatus: function (data, callback) {
            $http.post('/Admin/Project/GetLogStatus?code=' + data).then(callback);
        },
        checkPermissionEditActivityById: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/CheckPermissionEditActivityById?id=' + data).then(callback);
        },
        getItemActInst: function (data, callback) {
            $http.get('/Admin/WorkflowActivity/GetItemActInst?id=' + data).then(callback)
        },
        createWfInstance: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/CreateWfInstance', data).then(callback)
        },
        insertInstRunning: function (data, data1, callback) {
            $http.post('/Admin/WorkflowActivity/InsertInstRunning?wfInstCode=' + data + '&wfCode=' + data1).then(callback);
        },
        getWorkFlow: function (callback) {
            $http.post('/Admin/PayDecision/GetWorkFlow').then(callback);
        },
        suggestWF: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/SuggestWF?type=' + data).then(callback);
        },
        //Project Card
        addProjectCard: function (data, callback) {
            $http.post('/Admin/Project/AddProjectCard/', data).then(callback);
        },
        addProjectItem: function (data, callback) {
            $http.post('/Admin/Project/AddProjectItem/', data).then(callback);
        },
        deleteProjectCard: function (data, callback) {
            $http.post('/Admin/Project/DeleteProjectCard/' + data).then(callback);
        },
        getItemProjectCard: function (data, callback) {
            $http.get('/Admin/Project/GetItemProjectCard/' + data).then(callback);
        },
        updateProjectItem: function (data, callback) {
            $http.post('/Admin/Project/UpdateItemCard', data).then(callback);
        },
        getListItemPlan: function (callback) {
            $http.post('/Admin/Project/GetListItem').then(callback);
        },
        getListCardJob: function (callback) {
            $http.post('/Admin/Project/GetListCardJob').then(callback);
        },
        getListUnitTime: function (callback) {
            $http.post('/Admin/Project/GetListUnitTime').then(callback);
        },
        getDataDiagram: function (data,callback) {
            $http.post('/Admin/Project/GetDataDiagram?projectCode='+ data).then(callback);
        },
        getProjectProgres: function (data, callback) {
            $http.post('/Admin/Project/GetProjectProgres?projectCode=' + data).then(callback);
        },
        deleteProjectItem: function (data, callback) {
            $http.post('/Admin/Project/DeleteProjectItem/' + data).then(callback);
        },
        getTrueTypeFont: function (callback) {
            $http.get('/files/Times New Roman.base64.txt').then(callback);
        },
    }
});

app.controller('Ctrl_ESEIM_PROJECT', function ($scope, $rootScope, $cookies, $filter, dataserviceProject, $translate) {
    $rootScope.IsTranslate = false;
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {
        $rootScope.IsTranslate = true;
        caption = caption[culture] ? caption[culture] : caption;
        $rootScope.partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;
        $rootScope.partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/;
        //Miêu tả có thể null, và có chứa được khoảng trắng
        $rootScope.partternDescription = /^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*$/;
        $rootScope.partternDate = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;//Pormat dd/mm/yyyy
        $rootScope.partternEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        $rootScope.partternNumber = /^[0-9]\d*(\\d+)?$/; //Chỉ cho nhập số khong the am
        $rootScope.partternFloat = /^-?\d*(\.\d+)?$/; //Số thực
        $rootScope.partternNotSpace = /^[^\s].*/; //Không chứa khoảng trắng đầu dòng hoặc cuối dòng
        $rootScope.partternPhone = /^(0)+([0-9]{9})\b$/; //Số điện thoại 10,11 số bắt đầu bằng số 0

        $rootScope.checkDataProject = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;
            var partternTelephone = /[0-9]/g;
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.PROJECT_CURD_VALIDATE_CHARACTERS_SPACE, "<br/>");
            }

            return mess;
        }
        $rootScope.checkDataProjectFile = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;
            var partternTelephone = /[0-9]/g;
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.PROJECT_CURD_TAB_FILE_VALIDATE_CHARACTERS_SPACE, "<br/>");
            }

            return mess;
        }
        $rootScope.checkDataProjectPayment = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;

            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.PayCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.PROJECT_CURD_TAB_PAYMENT_VALIDATE_CHARACTERS_SPACE, "<br/>");
            }

            return mess;
        }
        $rootScope.validationOptionsProject = {
            rules: {
                ProjectCode: {
                    required: true,
                    maxlength: 100,
                    regx: /^[a-zA-Z0-9_äöüÄÖÜ]*$/
                },
                ProjectTitle: {
                    required: true,
                    maxlength: 255,
                    regx: /^[^\s].*/
                },
                Budget: {
                    required: true,
                    maxlength: 53,
                },
                FromTo: {
                    required: true
                },
                DateTo: {
                    required: true
                },
                Address: {
                    maxlength: 500,
                    regx: /^[^\s].*/
                }
            },
            messages: {
                Address: {
                    maxlength: "Tối đa 500 ký tự",
                    regx: "Địa chỉ không bắt đầu bằng khoảng trắng"
                },

                ProjectCode: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.PROJECT_CURD_LBL_PROJECT_CODE_PROJECT),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.PROJECT_CURD_LBL_PROJECT_CODE_PROJECT).replace("{1}", "255"),
                    regx: "Mã dự án không chứa dấu và ký tự đặc biệt"
                },
                ProjectTitle: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.PROJECT_CURD_LBL_PROJECT_NAME_PROJECT),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.PROJECT_CURD_LBL_PROJECT_NAME_PROJECT).replace("{1}", "255"),
                    regx: "Tên dự án không bắt đầu bằng khoảng trắng"
                },
                Budget: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.PROJECT_CURD_LBL_PROJECT_BUDGET),
                    maxlength: "Tối đa số có 53 chữ số"
                },
                FromTo: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.PROJECT_CURD_LBL_PROJECT_STARTTIME),
                },
                DateTo: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.PROJECT_CURD_LBL_PROJECT_ENDTIME),
                }
            }
        }
        $rootScope.validateOptionsProjectMember = {
            rules: {
                Position: {
                    required: true,
                    regx: /^[^\s].*/
                },

            },
            messages: {
                Position: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.PROJECT_CURD_TAB_MEMBER_LBL_POSITION),
                    regx: "Vị trí không bắt đầu bằng khoảng trắng"
                },

            }
        }
        $rootScope.validationOptionsProjectFile = {
            rules: {
                FileName: {
                    required: true
                },

            },
            messages: {
                FileName: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.PROJECT_CURD_TAB_FILE_NAME),
                },

            }
        }
        $rootScope.validateOptionProjectNote = {
            rules: {
                FromDate: {
                    required: true,
                    regx: /^[^\s].*/
                },
                ToDate: {
                    required: true,
                    regx: /^[^\s].*/
                },
                Title: {
                    required: true,
                    maxlength: 255,
                    regx: /^[^\s].*/
                },

            },
            messages: {
                FromDate: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", /*caption.PROJECT_CURD_TAB_NOTE_CURD_LBL_NOTE*/ "Từ ngày"),
                    regx: "Ghi chú không bắt đầu bằng khoảng trắng"
                },
                ToDate: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", /*caption.PROJECT_CURD_TAB_NOTE_CURD_LBL_NOTE*/ "Đến ngày"),
                    regx: "Ghi chú không bắt đầu bằng khoảng trắng"
                },
                Title: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.PROJECT_CURD_TAB_NOTE_CURD_LBL_TITLE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.PROJECT_CURD_TAB_NOTE_CURD_LBL_TITLE).replace("{1}", "255"),
                    regx: "Tiêu đề không bắt đầu bằng khoảng trắng"
                },

            }
        }
        $rootScope.validationOptionsProjectAttr = {
            rules: {
                AttrCode: {
                    required: true
                },
                AttrValue: {
                    required: true
                }
            },
            messages: {
                AttrCode: {
                    required: caption.PROJECT_CURD_ATTRIBUTE_CODE_VALIDATE
                },
                AttrValue: {
                    required: caption.PROJECT_CURD_ATTR_VALUE
                }
            }
        }
        $rootScope.validationOptionsProjectPayment = {
            rules: {
                Title: {
                    required: true,
                },
                DeadLine:
                {
                    required: true,
                },
                Total: {
                    regx: /^$|^[0-9,]+$/
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
                    required: caption.PROJECT_VALIDATE_TITLE,
                },
                DeadLine:
                {
                    required: caption.PROJECT_VALIDATE_DATE_FUND,
                },
                Total: {
                    regx: caption.PROJECT_VALIDATE_MONEY
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
        $rootScope.validationOptionsTabProduct = {
            rules: {
                Title: {
                    required: true,
                },
                PortType:
                {
                    required: true,
                },
                TicketTime: {
                    required: true,
                },
                Receiver: {
                    required: true,
                    //regx: /^[^\s].*/,
                    maxlength: 255
                },
                Sender: {
                    required: true,
                    //regx: /^[^\s].*/,
                    maxlength: 255
                }
            },
            messages: {
                Title: {
                    required: "Tiêu đề phiếu không được để trống",
                },
                PortType:
                {
                    required: "Loại phiếu không được để trống",
                },
                TicketTime: {
                    required: "Ngày nhập/xuất không được để trống"
                },
                Receiver: {
                    required: "Người nhận không được để trống",
                    //regx: caption.FAE_VALIDATE_REGX_PAYER,
                    maxlength: "Người nhận không được vượt quá 255 ký tự"
                },
                Sender: {
                    required: "Người gửi không được để trống",
                    //regx: caption.FAE_VALIDATE_REGX_RECEIPTER,
                    maxlength: "Người gửi không được vượt quá 255 ký tự"
                }
            }
        }
        $rootScope.validationOptionsTabProductDetail = {
            rules: {
                ProductCode: {
                    required: true,
                },
                Quantity:
                {
                    required: true,
                },
                Cost: {
                    required: true,
                },
            },
            messages: {
                ProductCode: {
                    required: "Thiết bị vật tư không được để trống",
                },
                Quantity:
                {
                    required: "Số lượng không được để trống",
                },
                Cost: {
                    required: "Số tiền không được để trống",
                },
            }
        }
        $rootScope.validationOptionsTabServiceDetail = {
            rules: {
                ProductCode: {
                    required: true,
                },
                Quantity:
                {
                    required: true,
                },
                Cost: {
                    required: true,
                },
            },
            messages: {
                ProductCode: {
                    required: "Thiết bị vật tư không được để trống",
                },
                Quantity:
                {
                    required: "Số lượng không được để trống",
                },
                Cost: {
                    required: "Số tiền không được để trống",
                },
            }
        }

        $rootScope.zoomMapDefault = 16;
        $rootScope.latCustomerDefault = 21.0277644;
        $rootScope.lngCustomerDefault = 105.83415979999995;
        $rootScope.addressCustomerDefault = 'Hanoi, Hoàn Kiếm, Hanoi, Vietnam';
    });
    dataserviceProject.getCustomers(function (rs) {
        rs = rs.data;
        $rootScope.Customers = rs;
        $rootScope.MapCustomerRole = [];
        $rootScope.MapCustomer = [];
        for (var i = 0; i < rs.length; ++i) {
            $rootScope.MapCustomerRole[rs[i].Code] = rs[i].Role;
            $rootScope.MapCustomer[rs[i].Code] = rs[i];
        }
    })

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
        //{
        //    Code: "APPROVED",
        //    Name: "Duyệt"
        //},
        //{
        //    Code: "REFUSE",
        //    Name: "Từ chối"
        //},
    ];
    dataserviceProject.getCurrency(function (rs) {
        rs = rs.data;
        $rootScope.currencyProject = rs;
    });
    dataserviceProject.getProjectType(function (rs) {
        rs = rs.data;
        $rootScope.projectType = rs;
        var all = {
            Code: "",
            Name: caption.PROJECT_TXT_ALL
        }
        $rootScope.projectType.push(all);
    });
    $rootScope.ObjectTypeFile = "PROJECT";
    $rootScope.moduleName = "PROJECT";
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/Project/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderProject + '/index.html',
            controller: 'indexProject'
        })
        .when('/add', {
            templateUrl: ctxfolderProject + '/add.html',
            controller: 'addProject'
        })
        .when('/edit', {
            templateUrl: ctxfolderProject + '/edit.html',
            controller: 'editProject'
        })
        .when('/diagram', {
            templateUrl: ctxfolderProject + '/projectDiagramRadial.html',
            controller: 'projectDiagramRadial'
        })
        .when('/show-gantt', {
            templateUrl: ctxfolderProject + '/show-gantt.html',
            controller: 'show-gantt'
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

app.controller('indexProject', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter, $window, myService, $location) {
    var vm = $scope;
    $scope.model = {
        //General
        FromDate: '',
        ToDate: '',
        ProjectCode: '',
        StatusObject: '',
        //Product
        ProductCode: '',
        CustomerCode: '',
        SupplierCode: '',
        //Service
        ServiceCode: '',
        PortType: '',
        //Payment
        CatCode: '',
        AetType: '',
        SurplusStart: '',
        SurplusEnd: '',
        //Tab
        SearchTab: 'PRODUCT',
    }
    $scope.switchTab = function (tab) {
        $scope.model = {
            //General
            FromDate: '',
            ToDate: '',
            ProjectCode: '',
            StatusObject: '',
            //Product
            ProductCode: '',
            CustomerCode: '',
            SupplierCode: '',
            //Service
            ServiceCode: '',
            PortType: '',
            //Payment
            CatCode: '',
            AetType: '',
            SurplusStart: '',
            SurplusEnd: '',
            SearchTab: tab
        }
        $scope.reload();
        $scope.isSearch = false;
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

    $scope.listPortType = [
        { Code: '', Name: 'Tất cả' },
        { Code: 'IMPORT', Name: 'Kiểu nhập' },
        { Code: 'EXPORT', Name: 'Kiểu xuất' },
    ];

    $scope.listAetType = [
        {
            Code: "Receipt",
            Name: "Thu"
        }, {
            Code: "Expense",
            Name: "Chi"
        }
    ];

    $scope.initData = function () {
        dataserviceProject.getBranch(function (rs) {
            rs = rs.data;
            $scope.listBranch = rs;
            var all = {
                Code: "",
                Name: caption.PROJECT_TXT_ALL
            }
            $scope.listBranch.push(all);
        })
        dataserviceProject.getCountProj(function (rs) {
            rs = rs.data;
            $scope.allContract = rs.All;
            $scope.assignSuccess = rs.AssignSuccess;
            $scope.assignNotSuccess = rs.AssignNotSuccess;
        })
        dataserviceProject.getProduct(function (rs) {
            rs = rs.data;
            $scope.listProducts = [{ Code: '', Name: 'Tất cả' }];
            $scope.listProducts = $scope.listProducts.concat(rs);
        });
        $scope.listCustomers = [{ Code: '', Name: 'Tất cả' }];
        $scope.listCustomers = $scope.listCustomers.concat($rootScope.Customers);
        dataserviceProject.getListSupplier(function (rsSup) {
            rsSup = rsSup.data;
            $scope.listSuppliers = [{ Code: '', Name: 'Tất cả' }];
            $scope.listSuppliers = $scope.listSuppliers.concat(rsSup);
        })
        dataserviceProject.getStatus(function (rs) {
            rs = rs.data;
            $scope.listStatusPro = [{ Code: '', Name: 'Tất cả' }];
            $scope.listStatusPro = $scope.listStatusPro.concat(rs);
            $scope.model.Status = $scope.listStatusPro[0].Code;
        })
        dataserviceProject.getListProject(function (rs) {
            rs = rs.data;
            $scope.listProject = [{ Code: '', Name: 'Tất cả' }];
            $scope.listProject = $scope.listProject.concat(rs);
        });
        dataserviceProject.gettreedata({ IdI: null }, function (result) {
            result = result.data;
            $scope.treeData = result;
            var all = {
                Code: '',
                Title: caption.FEA_STATUS_ALL
            }
            $scope.treeData.unshift(all)
        });
        dataserviceProject.getService(function (rs) {
            rs = rs.data;
            $scope.listServices = [{ Code: '', Name: 'Tất cả' }];
            $scope.listServices = $scope.listServices.concat(rs);
        });
    }
    $scope.initData();
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Project/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                //General
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
                d.ProjectCode = $scope.model.ProjectCode;
                d.StatusObject = $scope.model.StatusObject;
                //Product
                d.ProductCode = $scope.model.ProductCode;
                d.CustomerCode = $scope.model.CustomerCode;
                d.SupplierCode = $scope.model.SupplierCode;
                //Service
                d.ServiceCode = $scope.model.ServiceCode;
                d.PortType = $scope.model.PortType;
                //Payment
                d.CatCode = $scope.model.CatCode;
                d.AetType = $scope.model.AetType;
                d.SurplusStart = $scope.model.SurplusStart;
                d.SurplusEnd = $scope.model.SurplusEnd;
                //Tab
                d.SearchTab = $scope.model.SearchTab;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                //heightTableAuto();
                heightTableViewportManual(300, "#tblData");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [8, 'asc'])
        .withOption('serverSide', true)
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiled) {
                $scope.headerCompiled = true;
                $compile(angular.element(header).contents())($scope);
            }
        })
        .withOption('initComplete', function (settings, json) {
        })
        .withOption('rowCallback', function (row, data) {
            if (data.IsRead == 'False') {
                $(row).addClass('row-no-read');
            }
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    $scope.edit(data.Code, data.CustomerCode, data.Id);
                }
            });
        })
        .withOption('footerCallback', function (tfoot, data) {
            //$scope.model.ProjectCode = $rootScope.ProjectCode;
            //dataserviceProject.getTotalSurplus($scope.model, function (result) {
            //    result = result.data;
            //    console.log(result);
            //    if (result.Error) {
            //        App.toastrError(result.Title);
            //    } else {
            //        $scope.TotalPaymentSurplus = Math.round(result.TotalPaymentSurplus);
            //        $scope.TotalProductSurplus = Math.round(result.TotalProductSurplus);
            //        $scope.TotalServiceSurplus = Math.round(result.TotalServiceSurplus);
            //        $scope.TotalAllSurplus = Math.round(result.TotalAllSurplus);
            //        setTimeout(function () {
            //            $scope.$apply();
            //        })
            //    }
            //});
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Code').withTitle('{{ "PROJECT_LIST_COL_PROJECT_CODE_PROJECT" | translate }}').renderWith(function (data, type, full) {
        var code = "";
        //if (full.IsViewed == "False") {
        //    code = '<span class ="bold fs13">' + data + '</span>';
        //} else {
        //    code = data;
        //}
        code = '<span class ="bold fs13">' + data + '</span>'
        if (full.SetPriority == '1') {
            return '<span> ' + code + '</span>&nbsp;&nbsp;' +
                '<span class="pt5"><span class="badge-customer badge-customer-danger  fs9">&nbsp;Cao</span></span>';
        } else if (full.SetPriority == '2') {
            return code + '&nbsp;&nbsp;' +
                '<span class="pt5"><span class="badge-customer badge-customer-warning">&nbsp;Trung bình</span></span>';
        } else if (full.SetPriority == '3') {
            return code + '&nbsp;&nbsp;' +
                '<span class="pt5"><span class="badge-customer badge-customer-success">&nbsp;Thấp</span></span>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('{{ "PROJECT_LIST_COL_PROJECT_NAME_PROJECT" | translate }}').withOption('sClass', 'dataTable-pr0 nowrap').renderWith(function (data, type, full) {
        //if (full.IsViewed == "False") {
        //    return '<span class ="bold fs13">' + data + '</span>';
        //} else {
        //    return data;
        //}
        return '<span class ="bold fs13">' + data + '</span>'
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Budget').withTitle('{{ "PROJECT_LIST_COL_PROJECT_BUDGET" | translate }}').withOption('sClass', 'dataTable-pr0 nowrap').renderWith(function (data, type, full) {
        var budget = data != "" ? $filter('currency')(data, '', 0) : null;
        return '<span class="text-danger bold">' + budget + '</span>' + ' ' + full.Currency;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Currency').withTitle('{{ "PROJECT_LIST_COL_PROJECT_CURRENCY" | translate }}').withOption('sClass', 'w50 hidden').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Progress').withTitle('{{ "PROJECT_LIST_COL_PROGRESS" | translate }}').withOption('sClass', 'w50 tCenter').renderWith(function (data, type, full) {
        return '<a id="' + full.Code + '" class="actions" ng-click="showPercent(\'' + full.Code + '\')"><i class="fa fa-eye fs18 text-success" aria-hidden="true" ></i></a>'
            + '<span id="pro_' + full.Code + '" class="text-danger bold"></span>'
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StartTime').withTitle('{{ "PROJECT_LIST_COL_PROJECT_STARTTIME" | translate }}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
        var date = $filter('date')(new Date(data), 'MM/dd/yyyy');
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EndTime').withTitle('{{ "PROJECT_LIST_COL_PROJECT_ENDTIME" | translate }}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SetPriority').withTitle('PROJECT_LIST_COL_PRIORITY').withOption('sClass', 'hidden').renderWith(function (data, type) {
        if (data == '1') {
            return '<span class="badge-customer badge-customer-success fs9">&nbsp;Thấp</span>';
        } else if (data == '2') {
            return '<span class="badge-customer badge-customer-warning">&nbsp;Trung bình</span>';
        } else if (data == '3') {
            return '<span class="badge-customer badge-customer-danger">&nbsp;Cao</span>';
        }
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{ "PROJECT_CURD_COMBO_PROJECT_STATUS" | translate }}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap dataTable-pr0 dataTable-w80').withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').renderWith(function (data, type, full, meta) {
        return '<a title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(\'' + full.Code + '\',\'' + full.CustomerCode + '\',' + full.Id + ')" style = "width: 25px; height: 25px; padding-right: 15px" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25" style="margin-right: 10px;"></i></a>' +
            '<a title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style = "width: 25px; height: 25px; padding-right: 15px" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash fs25" style="margin-right: 10px;"></i></a>' +
            '<a title="{{&quot;PROJECT_TITLE_PROD&quot; | translate}}" ng-click="impProduct(\'' + full.Code + '\',\'' + full.CustomerCode + '\')" style = "width: 25px; height: 25px; padding-right: 5px" class=""><i class="fas fa-plus fs25" style="margin-right: 10px;"></i></a>';
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

    $scope.search = function () {
        validationSelect($scope.model);
        if (validationSelect($scope.model).Status == false) {
            reloadData(true);
        }
    };
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };

    //$scope.add = function () {
    //    $rootScope.ProjectCode = '';
    //    var modalInstance = $uibModal.open({
    //        animation: true,
    //        templateUrl: ctxfolderProject + '/add.html',
    //        controller: 'addProject',
    //        backdrop: 'static',
    //        size: '60'
    //    });
    //    modalInstance.result.then(function (d) {
    //        $scope.reload();
    //    }, function () { });
    //};

    //$scope.edit = function (projectCode, customerCode, id) {
    //    $rootScope.ProjectCode = projectCode;
    //    $rootScope.CustomerCode = customerCode;
    //    var modalInstance = $uibModal.open({
    //        animation: true,
    //        templateUrl: ctxfolderProject + '/edit.html',
    //        controller: 'editProject',
    //        backdrop: 'static',
    //        size: '60',
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

    $scope.edit = function (projectCode, customerCode, id) {
        $rootScope.ProjectCode = projectCode;
        $rootScope.ObjCode = projectCode;
        $rootScope.CustomerCode = customerCode;
        myService.setData(data = id);
        $location.path('/edit');
    }

    $scope.exportExcel = function () {
        dataserviceProject.exportExcel($scope.model, function (rs) {
            rs = rs.data;
            //location.href = rs.pathFile;
            var uri = location.origin + rs.pathFile;
            //console.log(uri);
            downloadURI(uri, rs.fileName);
        });
    }
    function downloadURI(uri, name) {
        var link = document.createElement("a");
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        delete link;
    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceProject.delete(id, function (rs) {
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
    };

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
                var listdata = $('#tblData').DataTable().data();
                for (var i = 0; i < listdata.length; i++) {
                    if (listdata[i].Id == editItems[0]) {
                        userModel = listdata[i];
                        break;
                    }
                }
                var obj = {
                    Code: userModel.Code,
                    Name: userModel.Name,
                    TabBoard: 5
                }
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderCardJob + "/add-card.html",
                    controller: 'add-cardCardJob',
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
                App.toastrError(caption.PROJECT_MSG_SELECT_PRO)
            }
        } else {
            // App.toastrError("Không có dự án nào được chọn!")
            App.toastrError(caption.PROJECT_MSG_NO_PROJECTS_SELECTED);
        }
    };

    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Budget" && ($scope.model.Budget == "" || $scope.model.Budget && $rootScope.partternFloat.test($scope.model.Budget))) {
            $scope.errorBudget = false;
        } else if (SelectType == "Budget") {
            $scope.errorBudget = true;
        }
    }

    $scope.progress = function (projectCode) {
        window.location = "/Admin/ProjectProgress?projectCode=" + projectCode;
    }

    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    $scope.showSchedule = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderProject + '/scheduleProject.html',
            controller: 'schedule-project',
            backdrop: 'static',
            size: '70'
        });
        modalInstance.result.then(function (d) {
        }, function () {
        });
    }

    $scope.impProduct = function (projectCode, customerCode) {
        $rootScope.CustomerCode = customerCode;
        //dataserviceProject.getProjectCode(id, function (rsCode) {
        dataserviceProject.chkExistRequestImp(projectCode, function (rs) {
            rs = rs.data;
            if (rs == true) {
                App.toastrError(caption.PROJECT_MSG_EXIST_RQ_IMP);
            }
            else {
                dataserviceProject.getProductInProject(projectCode, function (rs1) {
                    rs1 = rs1.data;
                    if (rs1.length > 0) {
                        var modalInstance = $uibModal.open({
                            animation: true,
                            templateUrl: ctxfolderProject + '/addImpProduct.html',
                            controller: 'addImpProduct',
                            backdrop: 'static',
                            size: '60',
                            resolve: {
                                para: function () {
                                    return projectCode;
                                }
                            }
                        });
                        modalInstance.result.then(function (d) {
                        }, function () { });
                    } else {
                        App.toastrError(caption.PROJECT_MSG_ADD_PRODUCT_TO_PRO);
                    }
                })
            }
        });
        //});
    }

    $scope.showPercent = function (code) {
        $scope.listdata = $('#tblData').DataTable().data();
        var idx = 0;
        for (var i = 0; i < $scope.listdata.length; i++) {
            if ($scope.listdata[i].Code === code) {
                idx = i;
                break;
            }
        }
        dataserviceProject.getPercentObject(code, 'PROJECT', function (rs) {
            rs = rs.data;
            $("#pro_" + code).text(rs + "%");
            var x = document.getElementById(code);
            x.remove();
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
        //$('#FromTo').datepicker('setEndDate', $rootScope.DateNow);
        //$('#DateTo').datepicker('setStartDate', $rootScope.DateBeforeSevenDay);
        //$('#FromTo').datepicker('update', $rootScope.DateBeforeSevenDay);
        //$('#DateTo').datepicker('update', $rootScope.DateNow);
        $('.end-date').click(function () {
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
        });
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.Budget && !$rootScope.partternFloat.test(data.Budget)) {
            $scope.errorBudget = true;
            mess.Status = true;
        } else {
            $scope.errorBudget = false;
        }
        return mess;
    };
    setTimeout(function () {
        loadDate();
    }, 200);
});

app.controller('addProject', function ($scope, $rootScope, $compile, $uibModal, DTColumnBuilder, DTInstances, dataserviceProject, $filter) {
    $rootScope.ProjectCode = '';
    $scope.listSetPriority = [
        {
            Code: 3,
            Name: "Thấp"
        },
        {
            Code: 2,
            Name: "Trung bình"
        },
        {
            Code: 1,
            Name: "Cao"
        },
    ];
    $scope.model = {
        ProjectCode: '',
        ProjectTitle: '',
        PrjType: $rootScope.projectType.length != 0 ? $rootScope.projectType[0].Code : '',
        Currency: $rootScope.currencyProject[1].Code,
        Budget: '',
        PrjMode: '',
        SetPriority: $scope.listSetPriority[0].Code,
        CaseWorker: '',
        StartTime: '',
        EndTime: '',
        CustomerCode: '',
        SupplierCode: '',
        GoogleMap: '',
        Address: '',
        Currency: 'VND',
        PrjStatus: 'ACTIVE',

    }

    $scope.modelWf = {
        WorkflowCode: "",
        ObjectType: "PROJECT",
        ObjectInst: "",
    };

    $scope.initData = function () {
        dataserviceProject.getListCustomers(function (rsCus) {
            rsCus = rsCus.data;
            $scope.Customers = rsCus;
        })
        dataserviceProject.getListSupplier(function (rsSup) {
            rsSup = rsSup.data;
            $scope.Suppliers = rsSup;
        })
        dataserviceProject.getListUser(function (rs) {
            rs = rs.data;
            $scope.listUser = rs;
        })
        $scope.model.StartTime = $rootScope.dateNow;
        dataserviceProject.getStatus(function (rs) {
            rs = rs.data;
            $scope.listStatusPro = rs;
            $scope.model.Status = $scope.listStatusPro[0].Code
        })
        dataserviceProject.getWorkFlow(function (result) {
            result = result.data;
            $rootScope.lstWorkflow = result;
        });
        dataserviceProject.suggestWF($scope.modelWf.ObjectType, function (rs) {
            rs = rs.data;
            $scope.model.WorkflowCat = rs;
            setTimeout(function () {
                $rootScope.loadDiagramWF($scope.model.WorkflowCat);
            }, 400)
        })
    }
    console.log('init Data');
    $scope.initData();

    $scope.addCommonSettingProjectType = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'PRO_TYPE',
                        GroupNote: 'Loại dự án',
                        AssetCode: 'PROJECT'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceProject.getProjectType(function (rs) {
                rs = rs.data;
                $rootScope.projectType = rs;
            });
        }, function () { });
    }

    $scope.addCommonSettingSetPriority = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'PRO_SET_PRIORITY',
                        GroupNote: 'Thiết lập ưu tiên',
                        AssetCode: 'PROJECT'
                    }
                }
            }
        });
    }

    $scope.chkProject = function () {
        if ($rootScope.ProjectCode == '') {
            App.toastrError(caption.PROJECT_CHECK_CLICK_OPEN_TAB);
        }
    }
    $scope.senddata = function () {
        var data = $rootScope.ProjectCode;
        $rootScope.$emit('eventName', data);
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.project = {};
    $scope.submit = function () {
        $scope.senddata();
        validationSelect($scope.model);
        if ($scope.project.addform.validate() && !validationSelect($scope.model).Status) {
            var msg = $rootScope.checkDataProject($scope.model.ProjectCode);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
            if ($rootScope.ProjectCode == '') {
                dataserviceProject.insert($scope.model, function (result) {
                    result = result.data;
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                        $rootScope.ProjectCode = $scope.model.ProjectCode;
                        $rootScope.ProjectTitle = $scope.model.ProjectTitle;
                        $rootScope.CustomerCode = $scope.model.CustomerCode;
                        $rootScope.ObjCode = $scope.model.ProjectCode;
                        $rootScope.initPrice();

                        //Workflow
                        $scope.modelWf.ObjectInst = $scope.model.ProjectCode;
                        $scope.modelWf.WorkflowCode = $scope.model.WorkflowCat;
                        $scope.modelWf.ObjectName = $scope.model.ProjectTitle;
                        dataserviceProject.createWfInstance($scope.modelWf, function (rs) {
                            rs = rs.data;
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            } else {
                                //App.toastrSuccess(rs.Title);
                                var wfInstCode = rs.Object.WfInstCode;
                                $scope.WfInstCode = wfInstCode;
                                $rootScope.loadDiagramWfInst($scope.model.ProjectCode, $scope.modelWf.ObjectType);
                                dataserviceProject.getLogStatus($scope.model.ProjectCode, function (rs) {
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
                dataserviceProject.update($scope.model, function (rs) {
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

    // show chart

    $scope.showGantt = function () {
        $location.path('/show-gantt');
    }

    $scope.diagramRadial = function () {
        $location.path('/diagram');
    }
    // end show chart

    $scope.addCustomer = function () {

        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderCustomer + '/add-import-module.html',
            controller: 'addImportModule',
            size: '70',
        });
        modalInstance.result.then(function (d) {
            dataserviceProject.getListCustomers(function (rsCus) {
                rsCus = rsCus.data;
                $scope.Customers = rsCus;
            })
        }, function () {
            dataserviceProject.getListCustomers(function (rsCus) {
                rsCus = rsCus.data;
                $scope.Customers = rsCus;
            })
        });
    }

    $scope.addSupplier = function () {

        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderSupplier + '/add-supp-module.html',
            controller: 'addSuppImport',
            size: '70',
        });
        modalInstance.result.then(function (d) {
            dataserviceProject.getListSupplier(function (rsSup) {
                rsSup = rsSup.data;
                $scope.Suppliers = rsSup;
            })
        }, function () {
            dataserviceProject.getListSupplier(function (rsSup) {
                rsSup = rsSup.data;
                $scope.Suppliers = rsSup;
            })
        });
    }

    $scope.openMap = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCustomer + '/google-map.html',
            controller: 'googleMapCustomer',
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

    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Currency" && $scope.model.Currency != "") {
            $scope.errorCurrency = false;
        }
        if (SelectType == "PrjStatus" && $scope.model.PrjStatus != "") {
            $scope.errorPrjStatus = false;
        }
        if (SelectType == "CustomerCode" && $scope.model.CustomerCode != "") {
            $scope.errorCustomer = false;
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
            $scope.model.GoogleMap = lat + ',' + lng;
            $scope.model.Address = document.getElementById('textAreaAddress').value;
        });
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.Currency == "" || data.Currency == null) {
            $scope.errorCurrency = true;
            mess.Status = true;
        } else {
            $scope.errorCurrency = false;
        }
        if (data.CustomerCode == "" || data.CustomerCode == null) {
            $scope.errorCustomer = true;
            mess.Status = true;
        } else {
            $scope.errorCustomer = false;
        }
        return mess;
    };

    function initDateTime() {
        $("#FromTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#DateTo').datepicker('setStartDate', maxDate);
            if ($('#FromTo').valid()) {
                $('#FromTo').removeClass('invalid').addClass('success');
            }
        });
        $("#DateTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromTo').datepicker('setEndDate', maxDate);
            if ($('#DateTo').valid()) {
                $('#DateTo').removeClass('invalid').addClass('success');
            }
        });
        $('.end-date').click(function () {
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
        });
    }

    setTimeout(function () {
        //initAutocomplete();
        initDateTime();
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 200);

    //Edit Activity Instance
    $scope.editInstAct = function (id, objCode) {
        dataserviceProject.checkPermissionEditActivityById(id, function (rs) {
            rs = rs.data;
            if (!rs) {
                return App.toastrError(caption.COM_MSG_PERMISSION_EDIT_ACT);
            }
            dataserviceProject.getItemActInst(id, function (rs) {
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
                    $rootScope.loadDiagramWfInst($scope.model.ProjectCode, $scope.modelWf.ObjectType);
                    dataserviceProject.getLogStatus($scope.model.ProjectCode, function (rs) {
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
    $rootScope.isShowHeader = true;
    $rootScope.lengthDetail = 5;
    $rootScope.showHeaderCard = function () {
        $rootScope.isShowHeader = true;
        $rootScope.lengthDetail = 5;
    }
    $rootScope.hideHeader = function () {
        $rootScope.isShowHeader = false;
        $rootScope.lengthDetail = 25;
    }
    //End show, hide header
});

app.controller('editProject', function ($scope, $rootScope, $compile, $uibModal, DTColumnBuilder, DTInstances, dataserviceProject, $filter, myService, $location) {
    $scope.listSetPriority = [
        {
            Code: 3,
            Name: "Thấp"
        },
        {
            Code: 2,
            Name: "Trung bình"
        },
        {
            Code: 1,
            Name: "Cao"
        },
    ];
    $scope.modelWf = {
        WorkflowCode: "",
        ObjectType: "PROJECT",
        ObjectInst: "",
    };
    var para = myService.getData();
    if (para == undefined) {
        para = $location.search().id;
    }
    if (para == undefined || para <= 0) {
        location.href = "/Admin/Project";
    }

    if (para == undefined) {
        $location.path("/");
    }
    else {
        $scope.initData = function () {
            dataserviceProject.getItem(para, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    $scope.model = rs;
                    $rootScope.ProjectCode = $scope.model.ProjectCode;
                    $rootScope.ProjectTitle = $scope.model.ProjectTitle;
                    $rootScope.ObjCode = $scope.model.ProjectCode;
                    try {
                        var lstStatus = JSON.parse($scope.model.Statuss);
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
                    validateDefault();

                    setTimeout(function () {
                        $rootScope.loadDiagramWfInst($rootScope.ProjectCode, $scope.modelWf.ObjectType);
                    }, 800)
                }
            });
            dataserviceProject.getListCustomers(function (rsCus) {
                rsCus = rsCus.data;
                $scope.Customers = rsCus;
            })
            dataserviceProject.getListSupplier(function (rsSup) {
                rsSup = rsSup.data;
                $scope.Suppliers = rsSup;
            })
            dataserviceProject.getStatus(function (rs) {
                rs = rs.data;
                $scope.listStatusPro = rs;
            })
            dataserviceProject.getWorkFlow(function (result) {
                result = result.data;
                $rootScope.lstWorkflow = result;
            });
        }
        $scope.initData();
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.editform.validate() && !validationSelect($scope.model).Status) {
            dataserviceProject.update($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                }
            });
        }
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Currency" && $scope.model.Currency != "") {
            $scope.errorCurrency = false;
        }
        if (SelectType == "PrjStatus" && $scope.model.PrjStatus != "") {
            $scope.errorPrjStatus = false;
        }
        if (SelectType == "CustomerCode" && $scope.model.CustomerCode != "") {
            $scope.errorCustomer = false;
        }
        //if (SelectType == "SupplierCode" && $scope.model.SupplierCode != "") {
        //    $scope.errorSupplier = false;
        //}
        if (SelectType == "CaseWorker" && $scope.model.CaseWorker != "") {
            $scope.errorCaseWorker = false;
        }
    }

    // show chart
   
    $scope.showGantt = function () {
        $location.path('/show-gantt');
    }

    $scope.diagramRadial = function () {
        $location.path('/diagram');
    }
    // end show chart

    $scope.addCardJob = function () {
        var userModel = {};
        var listdata = $('#tblData').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id === para) {
                userModel = listdata[i];
                break;
            }
        }
        var obj = {
            Code: userModel.Code,
            Name: userModel.Name,
            TabBoard: 5
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: "/views/admin/cardJob/add-card.html",
            controller: 'add-cardCardJob',
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
    $scope.addCommonSettingProjectType = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'PRO_TYPE',
                        GroupNote: 'Loại dự án',
                        AssetCode: 'PROJECT'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceProject.getProjectType(function (rs) {
                rs = rs.data;
                $rootScope.projectType = rs;
            });
        }, function () { });
    }
    $scope.addCommonSettingSetPriority = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'PRO_SET_PRIORITY',
                        GroupNote: 'Thiết lập ưu tiên',
                        AssetCode: 'PROJECT'
                    }
                }
            }
        });

    }
    $scope.openMap = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCustomer + '/google-map.html',
            controller: 'googleMapCustomer',
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
    $scope.addCustomer = function () {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderCustomer + '/add-import-module.html',
            controller: 'addImportModule',
            size: '70',
        });
        modalInstance.result.then(function (d) {
            dataserviceProject.getListCustomers(function (rsCus) {
                rsCus = rsCus.data;
                $scope.Customers = rsCus;
            })
        }, function () {
        });
    }
    $scope.addSupplier = function () {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderSupplier + '/add-supp-module.html',
            controller: 'addSuppImport',
            size: '70',
        });
        modalInstance.result.then(function (d) {
            dataserviceProject.getListSupplier(function (rsSup) {
                rsSup = rsSup.data;
                $scope.Suppliers = rsSup;
            })
        }, function () {
        });
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
            $scope.model.GoogleMap = lat + ',' + lng;
            $scope.model.Address = document.getElementById('textAreaAddress').value;
        });
    }
    function validateDefault() {
    }
    function initDateTime() {
        $("#FromTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#DateTo').datepicker('setStartDate', maxDate);
            if ($('#FromTo').valid()) {
                $('#FromTo').removeClass('invalid').addClass('success');
            }
        });
        $("#DateTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromTo').datepicker('setEndDate', maxDate);
            if ($('#DateTo').valid()) {
                $('#DateTo').removeClass('invalid').addClass('success');
            }
        });
        validateDefault();
        $('.end-date').click(function () {
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
        });

        $('#FromTo').datepicker('setEndDate', $scope.model.EndTime);
        $('#DateTo').datepicker('setStartDate', $scope.model.StartTime);
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.Currency == "" || data.Currency == null) {
            $scope.errorCurrency = true;
            mess.Status = true;
        } else {
            $scope.errorCurrency = false;
        }
        if (data.CustomerCode == "" || data.CustomerCode == null) {
            $scope.errorCustomer = true;
            mess.Status = true;
        } else {
            $scope.errorCustomer = false;
        }
        //if (data.SupplierCode == "") {
        //    $scope.errorSupplier = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorSupplier = false;
        //}
        return mess;
    };

    $scope.impProduct = function () {
        dataserviceProject.chkExistRequestImp($rootScope.ProjectCode, function (rs) {
            rs = rs.data;
            if (rs == true) {
                App.toastrError(caption.PROJECT_MSG_PRO_EXIST_RQ_IMP);
            }
            else {
                dataserviceProject.getProductInProject($rootScope.ProjectCode, function (rs1) {
                    rs1 = rs1.data;
                    if (rs1.length > 0) {
                        var modalInstance = $uibModal.open({
                            animation: true,
                            templateUrl: ctxfolderProject + '/addImpProduct.html',
                            controller: 'addImpProduct',
                            backdrop: 'static',
                            size: '60',
                            resolve: {
                                para: function () {
                                    return $rootScope.ProjectCode;
                                }
                            }
                        });
                        modalInstance.result.then(function (d) {
                        }, function () { });
                    } else {
                        App.toastrError(caption.PROJECT_MSG_ADD_PRODUCT_TO_PRO);
                    }
                })



                //var check = false;
                //dataserviceProject.getListPoProduct(function (result) {result=result.data;
                //    $scope.listPo = result;
                //    for (var i = 0; i < $scope.listPo.length; i++) {
                //        if ($rootScope.ProjectCode == $scope.listPo[i].Code) {
                //            check = true;
                //            break;
                //        }
                //    }

                //    if (check) {
                //        var modalInstance = $uibModal.open({
                //            animation: true,
                //            templateUrl: ctxfolderProject + '/addImpProduct.html',
                //            controller: 'addImpProduct',
                //            backdrop: 'static',
                //            size: '70',
                //            resolve: {
                //                para: function () {
                //                    return $rootScope.ProjectCode;
                //                }
                //            }
                //        });
                //        modalInstance.result.then(function (d) {
                //        }, function () { });
                //    } else {
                //        App.toastrError("Dự án này đã hết hạn hoặc không có sản phẩm cần đặt hàng ");
                //    };
                //});
            }
        });
    }
    setTimeout(function () {
        //initAutocomplete();
        initDateTime();
        updateNotify();
        setModalDraggable('.modal-dialog');
    }, 500);

    //Show, hide header
    $rootScope.isShowHeader = true;
    $rootScope.lengthDetail = 5;
    $rootScope.showHeaderCard = function () {
        $rootScope.isShowHeader = true;
        $rootScope.lengthDetail = 5;
    }
    $rootScope.hideHeader = function () {
        $rootScope.isShowHeader = false;
        $rootScope.lengthDetail = 25;
    }

    //Edit Activity Instance
    $scope.editInstAct = function (id, objCode) {
        dataserviceProject.checkPermissionEditActivityById(id, function (rs) {
            rs = rs.data;
            if (!rs) {
                return App.toastrError(caption.COM_MSG_PERMISSION_EDIT_ACT);
            }
            dataserviceProject.getItemActInst(id, function (rs) {
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
                    $rootScope.loadDiagramWfInst($scope.model.ProjectCode, $scope.modelWf.ObjectType);
                    dataserviceProject.getLogStatus($scope.model.ProjectCode, function (rs) {
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

    function updateNotify() {
        dataserviceProject.getCountNotify(function (rs) {
            rs = rs.data;
            document.getElementById("countProject").innerText = "Bạn có " + rs.CountProject + " dự án.";
            document.getElementById("countAllNotifyNew").innerText = rs.All;
            document.getElementById("allNotifyNew").innerText = rs.All + " mới";
        })
    }
    //End show, hide header
});

app.controller('projectTabProduct', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter) {
    $scope.listPortType = [
        { Code: '', Name: 'Tất cả' },
        { Code: 'IMPORT', Name: 'Kiểu nhập hàng hóa' },
        { Code: 'EXPORT', Name: 'Kiểu xuất hàng hóa' },
    ];
    $scope.model = {
        FromDate: '',
        ToDate: '',
        PortType: '',
        ProductCode: '',
        ProjectCode: $rootScope.ProjectCode,
    }
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Project/JTableProductNew",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProjectCode = $rootScope.ProjectCode;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
                d.PortType = $scope.model.PortType;
                d.ProductCode = $scope.model.ProductCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataProductProject");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength($rootScope.lengthDetail)
        .withOption('order', [0, 'desc'])
        .withOption('serverSide', true)
        .withOption('headerCallback', function (header) {
            setTimeout(function () {
                $compile(angular.element(header).contents())($scope);
                $scope.$apply();
            })
        })
        .withOption('initComplete', function (settings, json) {
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);

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
                        //var modalInstance = $uibModal.open({
                        //    animation: true,
                        //    templateUrl: ctxfolderContract + '/contractTabProductDetail.html',
                        //    controller: 'contractTabProductDetail',
                        //    backdrop: 'static',
                        //    size: '40',
                        //    resolve: {
                        //        para: function () {
                        //            return objPara;
                        //        }
                        //    }
                        //});
                        //modalInstance.result.then(function (d) {
                        //    $scope.reload();
                        //}, function () {
                        //});
                    }
                    $scope.$apply();
                }
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductCode').withTitle('{{"PROJECT_TAB_PRODUCT_LIST_COL_PRODUCT_CODE" | translate}}').renderWith(function (data, type, full) {
        return '<span class="bold">' + data + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Cost').withTitle('{{"PROJECT_TAB_PRODUCT_COL_UNIT_PRICE" | translate}}').renderWith(function (data, type) {
        var dt = data != "" ? $filter('currency')(data, '', 0) : 0;
        return '<span class="text-danger bold">' + dt + '</span>';
    }).withOption('sClass', 'w50'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withTitle('{{"PROJECT_TAB_PRODUCT_LIST_COL_QUANTITY" | translate}}').renderWith(function (data, type) {
        var dt = data != "" ? $filter('currency')(data, '', 0) : 0;
        return dt;
    }).withOption('sClass', 'w50'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UnitName').withTitle('{{"PROJECT_TAB_PRODUCT_LIST_COL_S_UNIT" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'w50'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('HeaderName').withTitle('{{"Tên phiếu" | translate}}').renderWith(function (data, type, full) {
        var title = '<span class = "bold">' + data + '</span>';

        if (full.SLastLog != '' && full.SLastLog != null && full.SLastLog != undefined) {
            title += formatDetail(full);
        }
        return title;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('TaxMoney').withTitle('{{"PROJECT_LIST_COL_TAX_MONEY" | translate}}').renderWith(function (data, type, full) {
    //    var cost = ((full.Quantity * full.Cost) * full.Tax) / 100;
    //    var dt = cost != "" ? $filter('currency')(cost, '', 0) : 0;
    //    return '<span class="text-danger bold">' + dt + '</span>';
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('TotalPrice').withTitle('{{"PROJECT_TAB_PRODUCT_LIST_COL_TOTAL_PRICE" | translate}}').renderWith(function (data, type, full) {
    //    var cost = (full.Quantity * full.Cost) + ((full.Quantity * full.Cost) * full.Tax) / 100;
    //    var dt = cost != "" ? $filter('currency')(cost, '', 0) : 0;
    //    return '<span class="text-danger bold">' + dt + '</span>';
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('').withTitle('{{"CONTRACT_TAB_LOP_LIST_COL_AFTER_TAX" | translate}}').renderWith(function (data, type, full) {
    //    var cost = full.Quantity * full.UnitPrice + (full.Quantity * full.UnitPrice) * full.Tax / 100;
    //    var dt = cost != "" ? $filter('currency')(cost, '', 0) : null;
    //    return dt;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"PROJECT_TAB_PRODUCT_LIST_COL_NOTE" | translate}}').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<a title="{{&quot;PROJECT_TITLE_REPAIR&quot; | translate}}" ng-click="edit(' + full.HeaderId + ')" style = "width: 25px; height: 25px; padding-right: 25px" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a>' +
            '<a title="{{&quot;PROJECT_SRIP_COL_LIST_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ',' + full.HeaderId + ')" style="width: 25px; height: 25px; padding: 0px" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash  fs25"></i></a>';
    }).withOption('sClass', 'w50'));
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
        dataserviceProject.getProduct(function (rs) {
            rs = rs.data;
            $scope.listProducts = [{ Code: '', Name: 'Tất cả' }];
            $scope.listProducts = $scope.listProducts.concat(rs);
        });
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
            dataserviceProject.getProduct(function (rs) {
                rs = rs.data;
                $scope.products = rs;
            });
        }, function () {
        });
    }
    $scope.init();
    $scope.reload = function () {
        $scope.dtOptions.withDisplayLength($rootScope.lengthDetail);
        $scope.headerCompiled = false;
        reloadData(true);
    }
    $scope.search = function () {
        reloadData(true);
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderProject + '/projectTabProductAdd.html',
            controller: 'projectTabProductAdd',
            backdrop: 'static',
            //windowClass: "modal-funAccEntry",
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
            templateUrl: ctxfolderProject + '/projectTabProductEdit.html',
            controller: 'projectTabProductEdit',
            backdrop: 'static',
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
    $scope.delete = function (id, headerId) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;//"Bạn có chắc chắn muốn xóa?";
                $scope.ok = function () {
                    dataserviceProject.deleteProductDetail(id, headerId, function (result) {
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

    $scope.exportExcel = function () {
        dataserviceProject.exportExcelProduct($rootScope.ProjectCode, function (rs) {
            rs = rs.data;
            //location.href = rs.pathFile;
            var uri = location.origin + rs.pathFile;
            //console.log(uri);
            downloadURI(uri, rs.fileName);
        });
    }
    function downloadURI(uri, name) {
        var link = document.createElement("a");
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        delete link;
    }
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
        $("#datefromProduct").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#datetoProduct').datepicker('setStartDate', maxDate);
        });
        $("#datetoProduct").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#datefromProduct').datepicker('setEndDate', maxDate);
        });
    }, 200);
});
app.controller('projectTabProductAdd', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, dataserviceProject) {
    $scope.model = {
        Id: '',
        TicketCode: '',
        TicketTime: moment().format("DD/MM/YYYY"),
        TicketCount: 1,
        ProjectCode: $rootScope.ProjectCode,
        Note: '',
        StoreCode: '',
        PortType: 'IMPORT'
    }
    $scope.modelWf = {
        WorkflowCode: "PROJECT_PRODUCT",
        ObjectType: "PROJECT_PRODUCT",
        ObjectInst: "",
    };
    $scope.modelView = {
        TaxMoney: ''
    }
    $scope.listPortType = [
        { Code: 'IMPORT', Name: 'Kiểu nhập hàng hóa' },
        { Code: 'EXPORT', Name: 'Kiểu xuất hàng hóa' },
    ];
    $scope.reloadProduct = function () {
        if ($scope.model.PortType == "IMPORT") {
            dataserviceProject.getProduct(function (rs) {
                rs = rs.data;
                $scope.products = rs;
            });
        }
        else {
            dataserviceProject.getListProductRemain($rootScope.ProjectCode, function (rs) {
                rs = rs.data;
                $scope.products = rs;
            });
        }
    }
    $scope.init = function () {
        $rootScope.initPrice();
        $scope.reloadProduct();
        dataserviceProject.getProductUnit(function (rs) {
            rs = rs.data;
            $scope.units = rs;
        });
        dataserviceProject.getListSupplier(function (rsSup) {
            rsSup = rsSup.data;
            $scope.Suppliers = rsSup;
        })
        dataserviceProject.createTicketCodeProduct($rootScope.ProjectCode, function (rs) {
            rs = rs.data;
            if (rs.Error == false) {
                $scope.model.TicketCode = rs.Object;
                $scope.model.TicketCount = rs.ID;
            }
        });
        dataserviceProject.getListStore(function (rs) {
            rs = rs.data;
            $scope.listStore = rs;
        });
        $scope.$on('RELOAD_LIST_PROJECT_PRODUCT_DETAIL', function () {
            console.log('reload triggered');
            $scope.getDetail();
        });
    }
    $rootScope.initPrice = function () {
        //
        dataserviceProject.getPriceOption($rootScope.CustomerCode, function (rs) {
            rs = rs.data;
            $scope.priceOption = rs.Object;
        })
    }
    $scope.init();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.calTax = function () {
        $scope.modelView.TaxMoney = Math.round(($scope.model.Tax * $scope.model.Cost * $scope.model.Quantity) / 100);
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "PortType" && $scope.model.PortType != "") {
            $scope.errorPortType = false;
            $scope.reloadProduct();
        }
        if (SelectType == "ProductCode" && $scope.modelDetail.ProductCode != "") {
            $scope.errorProductCode = false;
        }

        if (SelectType == "Quantity" && ($scope.modelDetail.Quantity === "" || $scope.modelDetail.Quantity === null || $scope.modelDetail.Quantity > 0 && $scope.modelDetail.Quantity < 100000)) {
            $scope.errorQuantity = false;
        }

        if (SelectType == "Cost" && ($scope.modelDetail.Cost === "" || $scope.modelDetail.Cost === null || $scope.modelDetail.Cost > 0 /*&& $scope.modelDetail.Cost < 100000*/)) {
            $scope.errorTotal = false;
        }

        //if (SelectType == "UnitPrice" && ($scope.model.Cost != null && $scope.model.Cost != undefined && $scope.model.Cost >= 0)) {
        //    $scope.errorUnitPrice = false;
        //    $scope.calTax();
        //}

        //if (SelectType == "Quantity" && ($scope.model.Quantity != null && $scope.model.Quantity != undefined && $scope.model.Quantity >= 0)) {
        //    $scope.errorQuantity = false;
        //    $scope.calTax()
        //}
    }
    $scope.selectProduct = function (item) {
        //$scope.model.ProductName;
        //$scope.modelDetail.ProductCode = item.Code;
        $scope.modelDetail.Unit = item.Unit;
        $scope.modelDetail.Max = item.Quantity;
        //$scope.model.Tax = 0;
        //$scope.productType = item.ProductType;
        $scope.currentSelectedProduct = item;
        //$scope.filterPrice();
        //validationTabProjectDetail($scope.model);
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
            $scope.model.Cost = price;
        }
    }
    $scope.validationTabProjectDetail = function (data) {
        var msg = { Error: false, Title: null };
        if (data.PortType == null || data.PortType == '' || data.PortType == undefined) {
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
        //if (data.UnitPrice == null) {
        //    msg.Error = true;
        //    if (msg.Title != null)
        //        msg.Title = msg.Title + "</br>Vui lòng nhập giá";
        //    else
        //        msg.Title = "Vui lòng nhập giá";
        //}
        //if (data.UnitPrice == '') {
        //    msg.Error = true;
        //    if (msg.Title != null)
        //        msg.Title = msg.Title + "</br>Vui lòng nhập giá";
        //    else
        //        msg.Title = "Vui lòng nhập giá";
        //}
        //if (data.UnitPrice == undefined) {
        //    msg.Error = true;
        //    if (msg.Title != null)
        //        msg.Title = msg.Title + "</br>Vui lòng nhập giá";
        //    else
        //        msg.Title = "Vui lòng nhập giá";
        //}
        //if (data.Tax == null || data.Tax == '' || data.Tax == undefined) {
        //    msg.Error = true;
        //    if (msg.Title != null)
        //        msg.Title = msg.Title + "</br>Vui lòng nhập thuế";
        //    else
        //        msg.Title = "Vui lòng nhập thuế";
        //}
        return msg;
    }
    $scope.validator = function (data) {
        var msg = { Error: false, Title: null };
        //if (data.ProductCode == null || data.ProductCode == '' || data.ProductCode == undefined) {
        //    msg.Error = true;
        //    msg.Title = "Vui lòng chọn sản phẩm";
        //}
        //if (data.Quantity == null || data.Quantity == '' || data.Quantity == undefined) {
        //    msg.Error = true;
        //    if (msg.Title != null)
        //        msg.Title = msg.Title + "</br>Vui lòng nhập số lượng";
        //    else
        //        msg.Title = "Vui lòng nhập số lượng";
        //}
        //if (data.UnitPrice == null) {
        //    msg.Error = true;
        //    if (msg.Title != null)
        //        msg.Title = msg.Title + "</br>Vui lòng nhập giá";
        //    else
        //        msg.Title = "Vui lòng nhập giá";
        //}
        //if (data.UnitPrice == '') {
        //    msg.Error = true;
        //    if (msg.Title != null)
        //        msg.Title = msg.Title + "</br>Vui lòng nhập giá";
        //    else
        //        msg.Title = "Vui lòng nhập giá";
        //}
        //if (data.UnitPrice == undefined) {
        //    msg.Error = true;
        //    if (msg.Title != null)
        //        msg.Title = msg.Title + "</br>Vui lòng nhập giá";
        //    else
        //        msg.Title = "Vui lòng nhập giá";
        //}
        //if (data.Tax == null || data.Tax == '' || data.Tax == undefined) {
        //    msg.Error = true;
        //    if (msg.Title != null)
        //        msg.Title = msg.Title + "</br>Vui lòng nhập thuế";
        //    else
        //        msg.Title = "Vui lòng nhập thuế";
        //}
        return msg;
    }
    $scope.getItem = function (id) {
        var listdata = $('#tblDataProductProject').DataTable().data();
        for (var i = 0; i < listdata.length; ++i) {
            if (listdata[i].Id == id) {

                var item = listdata[i];
                $scope.model.Id = item.Id;
                $scope.model.ProductCode = item.Code;
                $scope.model.Quantity = item.Quantity;
                $scope.model.Unit = item.Unit;
                $scope.model.Cost = item.Cost;
                $scope.model.Tax = ((item.Tax != null && item.Tax != '') ? parseFloat(item.Tax) : 10);
                $scope.model.Note = item.Note;
                $scope.model.PriceOption = item.PriceType;
                $scope.calTax();
                break;
            }
        }
    }
    $scope.isAdded = false;
    $scope.checkProductRemain = function () {
        if ($scope.model.PortType == "IMPORT") {
            return true;
        }
        else {
            var quantity = 0;
            for (var i = 0; i < $scope.listProdDetail.length; i++) {
                var item = $scope.listProdDetail[i];
                if (item.ProductCode == $scope.modelDetail.Code && item.UnitCode == $scope.modelDetail.Unit) {
                    quantity += item.Quantity;
                }
            }
            console.log(quantity);
            if ($scope.modelDetail.Quantity + quantity > $scope.modelDetail.Max) {
                return false
            }
            else {
                return true;
            }
        }
    }
    $scope.submit = function () {
        //var check = CKEDITOR.instances['Note'];
        //if (check !== undefined) {
        //    var data = CKEDITOR.instances['Note'].getData();
        //    $scope.model.AetDescription = data;
        //}
        //var obj = {
        //    ProjectCode: $rootScope.ProjectCode,
        //    ProductCode: $scope.model.ProductCode,
        //    ProductType: $scope.productType,
        //    Quantity: $scope.model.Quantity,
        //    Cost: $scope.model.Cost,
        //    Unit: $scope.model.Unit,
        //    Tax: ($scope.model.Tax == null || $scope.model.Tax == '') ? 0 : $scope.model.Tax,
        //    Note: $scope.model.Note,
        //    PriceType: $scope.model.PriceOption,
        //}
        if ($scope.listProdDetail.length == 0) {
            return App.toastrError('Vui lòng nhập ít nhất 1 chi tiết');
        }
        validationProjectTabHeader($scope.model);
        if ($scope.addformTabProduct.validate() && validationProjectTabHeader($scope.model).Status == false) {
            dataserviceProject.insertProductHeader($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    //$rootScope.amountbudget(rs.Object);
                    App.toastrSuccess(rs.Title);
                    $scope.modelWf.ObjectInst = rs.ID;
                    $scope.isAdded = true;
                    $uibModalInstance.close();
                    //$scope.modelWf.WorkflowCode = $scope.model.WorkflowCat;
                    //$scope.modelWf.ObjectName = $scope.model.ProductName;
                    //dataserviceProject.createWfInstance($scope.modelWf, function (rs) {
                    //    rs = rs.data;
                    //    if (rs.Error) {
                    //        App.toastrError(rs.Title);
                    //    } else {
                    //        //App.toastrSuccess(rs.Title);
                    //        var wfInstCode = rs.Object.WfInstCode;
                    //        $scope.WfInstCode = wfInstCode;
                    //        $uibModalInstance.close();
                    //    }
                    //})
                    //$scope.reload();
                }
            });
        }
    }
    $scope.update = function () {
        validationTabProjectDetail($scope.model);
        if (validationTabProjectDetail($scope.model).Status == false) {
            dataserviceProject.updateProduct($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reset();
                    $scope.reload();
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
            dataserviceProject.getProduct(function (rs) {
                rs = rs.data;
                $scope.products = rs;
            });
        }, function () {
        });
    }
    // import from excel
    $scope.importExcel = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderProject + '/excel.html',
            controller: 'excel',
            backdrop: 'static',
            size: '80',
            resolve: {
                para: function () {
                    return {
                        TicketCode: $scope.model.TicketCode,
                        PortType: $scope.model.PortType
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }

    // get detail and add, delete detail
    $scope.listProdDetail = [];
    $scope.modelDetail = {
        ProductCode: '',
        Unit: '',
        Cost: 0,
        Quantity: 0
    };
    $scope.getDetail = function () {
        dataserviceProject.getProductDetail($scope.model.TicketCode, function (rs) {
            rs = rs.data;
            $scope.listProdDetail = rs;
        });
    }
    $scope.addDetail = function () {
        //var check = CKEDITOR.instances['Note'];
        //if (check !== undefined) {
        //    var data = CKEDITOR.instances['Note'].getData();
        //    $scope.model.AetDescription = data;
        //}
        //if ($scope.isAdded == false) {
        //    return App.toastrError('Vui lòng lưu trước khi thêm chi tiết');
        //}
        var checkProductRemain = $scope.checkProductRemain();
        if (checkProductRemain == false) {
            return App.toastrError('Số lượng xuất vượt quá số lượng tồn kho là ' + $scope.modelDetail.Max);
        }
        var obj = {
            TicketCode: $scope.model.TicketCode,
            ProductCode: $scope.modelDetail.ProductCode,
            Quantity: $scope.modelDetail.Quantity,
            SupplierCode: $scope.modelDetail.SupplierCode,
            StoreCode: $scope.modelDetail.StoreCode,
            Cost: $scope.modelDetail.Cost,
            Unit: $scope.modelDetail.Unit,
        }
        validationTabProjectDetail($scope.modelDetail);
        if ($scope.addDetailformTabProduct.validate() && validationTabProjectDetail($scope.modelDetail).Status == false) {
            dataserviceProject.insertProductDetail(obj, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    //$rootScope.amountbudget(rs.Object);
                    App.toastrSuccess(rs.Title);
                    $scope.getDetail();
                    $scope.reloadProduct();
                    $scope.modelDetail = {
                        ProductCode: '',
                        Unit: '',
                        Cost: 0,
                        Quantity: 0
                    };
                }
            });
        }
    }

    $scope.deleteDetail = function (id) {
        dataserviceProject.deleteProductDetail(id, -1, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $scope.getDetail();
                $scope.reloadProduct();
            }
        })
    }
    function validationTabProjectDetail(data) {
        var mess = { Status: false, Title: "" };
        if (data.ProductCode == "" || data.ProductCode == null) {
            $scope.errorProductCode = true;
            mess.Status = true;
        } else {
            $scope.errorProductCode = false;
        }
        if (data.Quantity === "" || data.Quantity === null || data.Quantity > 0 && data.Quantity < 100000) {
            $scope.errorQuantity = false;
        } else {
            $scope.errorQuantity = true;
            mess.Status = true;
        }
        if (data.Cost === "" || data.Cost === null || data.Cost > 0 /*&& data.Cost < 100000*/) {
            $scope.errorTotal = false;
        } else {
            $scope.errorTotal = true;
            mess.Status = true;
        }
        return mess;
    }
    function validationProjectTabHeader(data) {
        var mess = { Status: false, Title: "" };
        if (data.PortType == "" || data.PortType == null) {
            $scope.errorPortType = true;
            mess.Status = true;
        } else {
            $scope.errorPortType = false;
        }
        return mess;
    }
    //function ckEditer() {
    //    var editor1 = CKEDITOR.replace('Note', {
    //        cloudServices_tokenUrl: '/MobileApp/Token',
    //        cloudServices_uploadUrl: '/MobileApp/UploadFile',
    //        filebrowserBrowseUrl: '',
    //        filebrowserUploadUrl: '/MobileApp/Upload',
    //        embed_provider: '/uploader/upload.php'
    //    });
    //    CKEDITOR.instances['Note'].config.height = 160;
    //}
    setTimeout(function () {
        //ckEditer();
        $("#TicketTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function () {
            if ($('#TicketTime .input-date').valid()) {
                $('#TicketTime .input-date').removeClass('invalid').addClass('success');
            }
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#TicketTime').datepicker('setEndDate', null);
            }
        });
    }, 1000);
});
app.controller('projectTabProductEdit', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, dataserviceProject, para) {
    $scope.model = {
        Id: '',
        TicketCode: '',
        TicketCount: 1,
        TicketTime: '',
        ProjectCode: $rootScope.ProjectCode,
        Note: '',
        StoreCode: '',
        PortType: 'IMPORT'
    }
    $scope.modelWf = {
        WorkflowCode: "PROJECT_PRODUCT",
        ObjectType: "PROJECT_PRODUCT",
        ObjectInst: "",
    };
    $scope.modelView = {
        TaxMoney: ''
    }
    $scope.listPortType = [
        { Code: 'IMPORT', Name: 'Kiểu nhập hàng hóa' },
        { Code: 'EXPORT', Name: 'Kiểu xuất hàng hóa' },
    ];
    $scope.getDetail = function () {
        dataserviceProject.getProductDetail($scope.model.TicketCode, function (rs) {
            rs = rs.data;
            $scope.listProdDetail = rs;
        });
    }
    $scope.init = function () {
        //$rootScope.initPrice();
        dataserviceProject.getProductHeader(para, function (rs) {
            rs = rs.data;

            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model = rs.Object;
                $scope.model.TicketTime = moment($scope.model.TicketTime).format("DD/MM/YYYY");
                $scope.getDetail();
                if ($scope.model.PortType == "IMPORT") {
                    dataserviceProject.getProduct(function (rs) {
                        rs = rs.data;
                        $scope.products = rs;
                    });
                }
                else {
                    dataserviceProject.getListProductRemain($rootScope.ProjectCode, function (rs) {
                        rs = rs.data;
                        $scope.products = rs;
                    });
                }
                //setTimeout(function () {
                //    $rootScope.loadDiagramWfInst($scope.model.Id, $scope.modelWf.ObjectType);
                //}, 800)
            }
        });
        //dataserviceProject.getProduct(function (rs) {
        //    rs = rs.data;
        //    $scope.products = rs;
        //});
        dataserviceProject.getProductUnit(function (rs) {
            rs = rs.data;
            $scope.units = rs;
        });
        dataserviceProject.getListSupplier(function (rsSup) {
            rsSup = rsSup.data;
            $scope.Suppliers = rsSup;
        })
        dataserviceProject.getListStore(function (rs) {
            rs = rs.data;
            $scope.listStore = rs;
        });
        $scope.$on('RELOAD_LIST_PROJECT_PRODUCT_DETAIL', function () {
            console.log('reload triggered');
            $scope.getDetail();
        });
        //dataserviceProject.createTicketCodeProduct($rootScope.ProjectCode, function (rs) {
        //    rs = rs.data;
        //    if (rs.Error == false) {
        //        $scope.model.TicketCode = rs.Object;
        //        $scope.model.TicketCount = rs.ID;
        //    }
        //});
    }
    //$rootScope.initPrice = function () {
    //    //
    //    dataserviceProject.getPriceOption($rootScope.CustomerCode, function (rs) {
    //        rs = rs.data;
    //        $scope.priceOption = rs.Object;
    //    })
    //}
    $scope.init();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.calTax = function () {
        $scope.modelView.TaxMoney = Math.round(($scope.model.Tax * $scope.model.Cost * $scope.model.Quantity) / 100);
    }
    $scope.reloadProduct = function () {
        if ($scope.model.PortType == "IMPORT") {
            dataserviceProject.getProduct(function (rs) {
                rs = rs.data;
                $scope.products = rs;
            });
        }
        else {
            dataserviceProject.getListProductRemain($rootScope.ProjectCode, function (rs) {
                rs = rs.data;
                $scope.products = rs;
            });
        }
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "PortType" && $scope.model.PortType != "") {
            $scope.errorPortType = false;
            $scope.reloadProduct();
        }
        if (SelectType == "ProductCode" && $scope.modelDetail.ProductCode != "") {
            $scope.errorProductCode = false;
        }

        if (SelectType == "Quantity" && ($scope.modelDetail.Quantity === "" || $scope.modelDetail.Quantity === null || $scope.modelDetail.Quantity > 0 && $scope.modelDetail.Quantity < 100000)) {
            $scope.errorQuantity = false;
        }

        if (SelectType == "Cost" && ($scope.modelDetail.Cost === "" || $scope.modelDetail.Cost === null || $scope.modelDetail.Cost > 0 /*&& $scope.modelDetail.Cost < 100000*/)) {
            $scope.errorTotal = false;
        }
        //if (SelectType == "ProductCode" && $scope.model.ProductCode != "") {
        //    $scope.errorProductCode = false;
        //}
        //if (SelectType == "Unit" && $scope.model.Unit != "") {
        //    $scope.errorUnit = false;
        //}
        //if (SelectType == "Tax" && ($scope.model.Tax != null && $scope.model.Tax != undefined && $scope.model.Tax < 0)) {
        //    $scope.errorTax = true;
        //    $scope.calTax();
        //}
        //else {
        //    $scope.errorTax = false;
        //    if ($scope.model.Tax == null || $scope.model.Tax == undefined) {
        //        $scope.model.Tax = 0;
        //    }
        //    $scope.calTax();
        //}

        //if (SelectType == "UnitPrice" && ($scope.model.Cost != null && $scope.model.Cost != undefined && $scope.model.Cost >= 0)) {
        //    $scope.errorUnitPrice = false;
        //    $scope.calTax();
        //}

        //if (SelectType == "Quantity" && ($scope.model.Quantity != null && $scope.model.Quantity != undefined && $scope.model.Quantity >= 0)) {
        //    $scope.errorQuantity = false;
        //    $scope.calTax()
        //}
    }
    $scope.selectProduct = function (item) {
        //$scope.model.ProductName;
        //$scope.modelDetail.ProductCode = item.Code;
        $scope.modelDetail.Unit = item.Unit;
        $scope.modelDetail.Max = item.Quantity;
        //$scope.model.Tax = 0;
        //$scope.productType = item.ProductType;
        $scope.currentSelectedProduct = item;
        //$scope.filterPrice();
        //validationTabProjectDetail($scope.model);
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
            $scope.model.Cost = price;
        }
    }
    $scope.validator = function (data) {

        var msg = { Error: false, Title: null };
        //if (data.ProductCode == null || data.ProductCode == '' || data.ProductCode == undefined) {
        //    msg.Error = true;
        //    msg.Title = "Vui lòng chọn sản phẩm";
        //}
        //if (data.Quantity == null || data.Quantity == '' || data.Quantity == undefined) {
        //    msg.Error = true;
        //    if (msg.Title != null)
        //        msg.Title = msg.Title + "</br>Vui lòng nhập số lượng";
        //    else
        //        msg.Title = "Vui lòng nhập số lượng";
        //}
        //if (data.UnitPrice == null) {
        //    msg.Error = true;
        //    if (msg.Title != null)
        //        msg.Title = msg.Title + "</br>Vui lòng nhập giá";
        //    else
        //        msg.Title = "Vui lòng nhập giá";
        //}
        //if (data.UnitPrice == '') {
        //    msg.Error = true;
        //    if (msg.Title != null)
        //        msg.Title = msg.Title + "</br>Vui lòng nhập giá";
        //    else
        //        msg.Title = "Vui lòng nhập giá";
        //}
        //if (data.UnitPrice == undefined) {
        //    msg.Error = true;
        //    if (msg.Title != null)
        //        msg.Title = msg.Title + "</br>Vui lòng nhập giá";
        //    else
        //        msg.Title = "Vui lòng nhập giá";
        //}
        //if (data.Tax == null || data.Tax == '' || data.Tax == undefined) {
        //    msg.Error = true;
        //    if (msg.Title != null)
        //        msg.Title = msg.Title + "</br>Vui lòng nhập thuế";
        //    else
        //        msg.Title = "Vui lòng nhập thuế";
        //}
        return msg;
    }
    $scope.getItem = function (id) {
        var listdata = $('#tblDataProductProject').DataTable().data();
        for (var i = 0; i < listdata.length; ++i) {
            if (listdata[i].Id == id) {

                var item = listdata[i];
                $scope.model.Id = item.Id;
                $scope.model.ProductCode = item.Code;
                $scope.model.Quantity = item.Quantity;
                $scope.model.Unit = item.Unit;
                $scope.model.Cost = item.Cost;
                $scope.model.Tax = ((item.Tax != null && item.Tax != '') ? parseFloat(item.Tax) : 10);
                $scope.model.Note = item.Note;
                $scope.model.PriceOption = item.PriceType;
                $scope.calTax();
                break;
            }
        }
    }
    $scope.isAdded = true;
    $scope.submit = function () {
        //var check = CKEDITOR.instances['Note'];
        //if (check !== undefined) {
        //    var data = CKEDITOR.instances['Note'].getData();
        //    $scope.model.AetDescription = data;
        //}
        //var obj = {
        //    ProjectCode: $rootScope.ProjectCode,
        //    ProductCode: $scope.model.ProductCode,
        //    ProductType: $scope.productType,
        //    Quantity: $scope.model.Quantity,
        //    Cost: $scope.model.Cost,
        //    Unit: $scope.model.Unit,
        //    Tax: ($scope.model.Tax == null || $scope.model.Tax == '') ? 0 : $scope.model.Tax,
        //    Note: $scope.model.Note,
        //    PriceType: $scope.model.PriceOption,
        //}
        if ($scope.listProdDetail.length == 0) {
            return App.toastrError('Vui lòng nhập ít nhất 1 chi tiết');
        }
        validationProjectTabHeader($scope.model);
        if ($scope.addformTabProduct.validate() && validationProjectTabHeader($scope.model).Status == false) {
            dataserviceProject.updateProductHeader($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    //$rootScope.amountbudget(rs.Object);
                    App.toastrSuccess(rs.Title);
                    //$scope.modelWf.ObjectInst = rs.ID;
                    $uibModalInstance.close();
                    //$scope.reload();
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
            dataserviceProject.getProduct(function (rs) {
                rs = rs.data;
                $scope.products = rs;
            });
        }, function () {
        });
    }
    // import from excel
    $scope.importExcel = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderProject + '/excel.html',
            controller: 'excel',
            backdrop: 'static',
            size: '80',
            resolve: {
                para: function () {
                    return {
                        TicketCode: $scope.model.TicketCode,
                        PortType: $scope.model.PortType
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }

    // get detail and add, delete detail
    $scope.listProdDetail = [];
    $scope.modelDetail = {
        ProductCode: '',
        Unit: '',
        Cost: 0,
        Quantity: 0
    };
    $scope.checkProductRemain = function () {
        if ($scope.model.PortType == "IMPORT") {
            return true;
        }
        else {
            if ($scope.modelDetail.Quantity > $scope.modelDetail.Max) {
                return false
            }
            else {
                return true;
            }
        }
    }
    $scope.addDetail = function () {
        var checkProductRemain = $scope.checkProductRemain();
        if (checkProductRemain == false) {
            return App.toastrError('Số lượng xuất vượt quá số lượng tồn kho là ' + $scope.modelDetail.Max);
        }
        var obj = {
            TicketCode: $scope.model.TicketCode,
            ProductCode: $scope.modelDetail.ProductCode,
            Quantity: $scope.modelDetail.Quantity,
            SupplierCode: $scope.modelDetail.SupplierCode,
            Cost: $scope.modelDetail.Cost,
            Unit: $scope.modelDetail.Unit,
        }
        validationTabProjectDetail($scope.modelDetail);
        if ($scope.addDetailformTabProduct.validate() && validationTabProjectDetail($scope.modelDetail).Status == false) {
            dataserviceProject.insertProductDetail(obj, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    //$rootScope.amountbudget(rs.Object);
                    App.toastrSuccess(rs.Title);
                    $scope.getDetail();
                    $scope.reloadProduct();
                    $scope.modelDetail = {
                        ProductCode: '',
                        Unit: '',
                        Cost: 0,
                        Quantity: 0
                    };
                }
            });
        }
    }

    $scope.deleteDetail = function (id) {
        dataserviceProject.deleteProductDetail(id, -1, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $scope.getDetail();
                $scope.reloadProduct();
            }
        })
    }
    function validationTabProjectDetail(data) {
        var mess = { Status: false, Title: "" };
        if (data.ProductCode == "" || data.ProductCode == null) {
            $scope.errorProductCode = true;
            mess.Status = true;
        } else {
            $scope.errorProductCode = false;
        }
        if (data.Quantity === "" || data.Quantity === null || data.Quantity > 0 && data.Quantity < 100000) {
            $scope.errorQuantity = false;
        } else {
            $scope.errorQuantity = true;
            mess.Status = true;
        }
        if (data.Cost === "" || data.Cost === null || data.Cost > 0 /*&& data.Cost < 100000*/) {
            $scope.errorTotal = false;
        } else {
            $scope.errorTotal = true;
            mess.Status = true;
        }
        return mess;
    }
    function validationProjectTabHeader(data) {
        var mess = { Status: false, Title: "" };
        if (data.PortType == "" || data.PortType == null) {
            $scope.errorPortType = true;
            mess.Status = true;
        } else {
            $scope.errorPortType = false;
        }
        return mess;
    }
    //function ckEditer() {
    //    var editor1 = CKEDITOR.replace('Note', {
    //        cloudServices_tokenUrl: '/MobileApp/Token',
    //        cloudServices_uploadUrl: '/MobileApp/UploadFile',
    //        filebrowserBrowseUrl: '',
    //        filebrowserUploadUrl: '/MobileApp/Upload',
    //        embed_provider: '/uploader/upload.php'
    //    });
    //    CKEDITOR.instances['Note'].config.height = 160;
    //}
    setTimeout(function () {
        //ckEditer();
        $("#TicketTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function () {
            if ($('#TicketTime .input-date').valid()) {
                $('#TicketTime .input-date').removeClass('invalid').addClass('success');
            }
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#TicketTime').datepicker('setEndDate', null);
            }
        });
    }, 1000);
});

app.controller('excel', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataserviceProject, $timeout, para) {
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.IsEdit = false;
    //wflow
    $scope.modelWf = {
        WorkflowCode: "",
        ObjectType: "DECISION_END_CONTRACT",
        ObjectInst: "",
    };
    $scope.portType = para.PortType;
    $scope.initData = function () {
        dataserviceProject.getProduct(function (rs) {
            rs = rs.data;
            $scope.products = rs;
        });
        dataserviceProject.getProductUnit(function (rs) {
            rs = rs.data;
            $scope.units = rs;
        });
        dataserviceProject.getListSupplier(function (rsSup) {
            rsSup = rsSup.data;
            $scope.Suppliers = rsSup;
        })
        dataserviceProject.getListStore(function (rs) {
            rs = rs.data;
            $scope.listStore = rs;
        });
    }
    $scope.initData();
    $scope.changeUnit = function (data) {
        //dataserviceEndContract.getUserDepartment(data, function (rs) {
        //    rs = rs.data;
        //    $scope.lstUserinDpt = rs;
        //    if (rs != null && rs != undefined && rs != "") {
        //        var all = {
        //            Code: "",
        //            Name: caption.COM_TXT_ALL
        //        }
        //        $scope.lstUserinDpt.unshift(all)
        //    }
        //})
    }
    //$scope.changeEmployee = function (data) {
    //    for (var i = 0; i < $scope.lstUserinDpt.length; i++) {
    //        if ($scope.lstUserinDpt[i].Code == data) {
    //            $scope.model.NewRole = $scope.lstUserinDpt[i].OldRole;
    //        }
    //    }
    //}
    //$scope.checkloop = function () {
    //    $scope.ListEmp = [];
    //}

    $scope.uploadFile = function () {
        var form = new FormData;
        var file = document.getElementById("FileItem").files[0];
        form.append("fileUpload", file);
        if (file == null || file == undefined || file == "") {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        } else {
            dataserviceProject.uploadFile(form, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $scope.header = rs.Object.Header;
                    //$rootScope.DecisionNum = $scope.header.DecisionNumber;
                    $scope.Listdata = rs.Object.Detail;
                    $scope.count = $scope.Listdata.length;
                    $scope.showCheck = true;
                }
            });
        }
    };
    var url = "";
    $scope.openExcel = false;
    $scope.fileNameChanged = function () {
        $scope.openExcel = true;
        setTimeout(function () {
            $scope.$apply();
        });
        //$('.openExcel').removeClass('hidden');
    }
    $scope.loadExcel = function () {
        var form = new FormData;
        var file = document.getElementById("FileItem").files[0];
        form.append("fileUpload", file);
        form.append("fileNameUpload", file.name);
        if (file === null || file === undefined || file === "") {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        } else {
            var excel = ['.xlsm', '.xlsx', '.xlsb', '.xltx', '.xltm', '.xls', '.xlt', '.xls', '.xml', '.xml', '.xlam', '.xla', '.xlw', '.xlr'];

            window.open(url, '_blank');

        }
    };
    $scope.model = {
        ProductCode: '',
        Unit: '',
        Cost: 0,
        Quantity: 0
    };
    $scope.editDetails = function (data) {
        $scope.model.Id = data.Id;
        $scope.model.ProductCode = data.ProductCode;
        $scope.model.ProductName = data.ProductName;
        //$scope.changeUnit($scope.model.DepartmentCode);
        $scope.model.UnitName = data.UnitName;
        $scope.model.Unit = data.Unit;
        $scope.model.SCost = data.SCost;
        $scope.model.Cost = data.Cost;
        $scope.model.Quantity = data.Quantity;
        $scope.model.SQuantity = data.SQuantity;
        $scope.model.SupplierCode = data.SupplierCode;
        //$scope.changeEmployee($scope.model.EmployeeCode);
        $scope.IsEdit = true;
    }
    $scope.delete = function (data) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM.replace('{0}', "");
                $scope.ok = function () {
                    rs = true;
                    $uibModalInstance.close();
                };
                $scope.cancel = function () {
                    rs = false;
                    $uibModalInstance.close();
                };
            },
            size: '25',
        });
        modalInstance.result.then(function () {
            if (rs) {
                $scope.Listdata.splice($scope.Listdata.findIndex(v => v.Id === data.Id), 1);
            }
        }, function () {
        });
    }
    $scope.submitEdit = function () {
        $scope.lstModel = [];
        //dataserviceEndContract.logInfomation($scope.model, function (rs) {
        //    rs = rs.data;
        //    if (rs.Error) {
        //        App.toastrError(rs.Title);
        //    } else {
        //        App.toastrSuccess(rs.Title);

        //    }
        //});
        $scope.lstModel = $scope.model;
        for (var i = 0; i < $scope.Listdata.length; i++) {
            if ($scope.Listdata[i].Id == $scope.lstModel.Id) {
                $scope.Listdata[i].ProductCode = $scope.lstModel.ProductCode;
                $scope.Listdata[i].ProductName = $scope.lstModel.ProductName;
                $scope.Listdata[i].UnitName = $scope.lstModel.UnitName;
                $scope.Listdata[i].Unit = $scope.lstModel.Unit;
                $scope.Listdata[i].SCost = $scope.lstModel.SCost;
                $scope.Listdata[i].Cost = $scope.lstModel.Cost;
                $scope.Listdata[i].SQuantity = $scope.lstModel.SQuantity;
                $scope.Listdata[i].Quantity = $scope.lstModel.Quantity;
                $scope.Listdata[i].SupplierCode = $scope.lstModel.SupplierCode;
                //$scope.Listdata[i].checkloop = $scope.lstModel.Reason;
            }
        }
        $scope.IsEdit = false;
        /*for (var i = 0; i < $scope.Listdata.length; i++) {
            if ($scope.lstUserinDpt[i].Id == data.Id) {
                $scope.model.OldRole = $scope.lstUserinDpt[i].OldRole;
            }
            $scope.ListEmp.push(obj);
        }*/
    }
    $scope.modelHeader = {
        SupplierCode: ''
    };
    $scope.valiteData = function () {
        if ($scope.modelHeader.SupplierCode === undefined || $scope.modelHeader.SupplierCode === null || $scope.modelHeader.SupplierCode === '') {
            return App.toastrError("Nhà cung cấp trống");
        }
        dataserviceProject.validateData({ ListEmp: $scope.Listdata, PortType: para.PortType, ProjectCode: $rootScope.ProjectCode }, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
                //$uibModalInstance.close();
            } else {
                App.toastrSuccess("Không có bản ghi lỗi, có thể lưu lại");
                $scope.showSubmit = true;
            }
            $scope.Listdata = rs.Object.ListEmp;
        });
    }
    $scope.submit = function () {
        for (var i = 0; i < $scope.Listdata.length; i++) {
            $scope.Listdata[i].TicketCode = para.TicketCode;
        }

        if ($scope.Listdata.length == 0) {
            App.toastrError("Danh sách trống, vui lòng nhập dữ liệu");
        }
        else {
            //if ($scope.header.DecisionNumber === undefined || $scope.header.DecisionNumber === null || $scope.header.DecisionNumber === '') {
            //    return App.toastrError("Số quyết định trống");
            //}

            //if ($scope.header.DecisionDate === undefined || $scope.header.DecisionDate === null || $scope.header.DecisionDate === '') {
            //    return App.toastrError("Ngày quyết định trống");
            //}
            dataserviceProject.insertFromExcel({ ListEmp: $scope.Listdata }, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    //$location.path('/');
                    $uibModalInstance.close();
                    $rootScope.$broadcast('RELOAD_LIST_PROJECT_PRODUCT_DETAIL');
                }
            });

            //$scope.modelHeader = para;
            //$scope.modelHeader.DecisionNum = $scope.header.DecisionNumber;
            //$scope.modelHeader.Title = $scope.header.DecisionNumber;
            //$scope.modelHeader.sDecisionDate = $scope.header.DecisionDate;

            //if ($scope.modelHeader.Status != "STATUS_ACTIVITY_DO") {
            //    App.toastrError("Phiếu chưa được khởi tạo");
            //}
            //else {
            //    $scope.modelWf.ObjectInst = $scope.modelHeader.DecisionNum;
            //    $scope.modelWf.WorkflowCode = $scope.modelHeader.WorkflowCat;
            //    dataserviceEndContract.createWfInstance($scope.modelWf, function (rs) {
            //        rs = rs.data;
            //        if (rs.Error) {
            //            App.toastrError(rs.Title);
            //        } else {
            //            App.toastrSuccess(rs.Title);
            //            var wfInstCode = rs.Object.WfInstCode;
            //            $scope.WfInstCode = wfInstCode;
            //            //dataserviceEndContract.insertInstRunning(wfInstCode, $scope.modelWf.WorkflowCode, function (rs) {

            //            //})
            //            dataserviceEndContract.insert($scope.modelHeader, function (rs) {
            //                rs = rs.data;
            //                if (rs.Error) {
            //                    App.toastrError(rs.Title);
            //                } else {

            //                }
            //            })
            //        }
            //    })
            //}
        }
    }
    $scope.cancelEdit = function () {
        $scope.IsEdit = false;
    }
    function loadDate() {
        //$("#Decisiondate").datepicker({
        //    inline: false,
        //    autoclose: true,
        //    format: "dd/mm/yyyy",
        //    fontAwesome: true,
        //});
        //$("#planDate").datepicker({
        //    inline: false,
        //    autoclose: true,
        //    format: "dd/mm/yyyy",
        //    fontAwesome: true,
        //    todayBtn: true,
        //    todayHighlight: true
        //});
    }
    setTimeout(function () {
        loadDate();
    }, 50);
});
app.controller('projectTabService', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        Id: '',
        ServiceCode: '',
        ProjectCode: $rootScope.ProjectCode,
        Level: '',
        Quantity: '',
        DurationTime: '',
        Unit: '',
        Note: ''
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Project/JTableService",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProjectCode = $rootScope.ProjectCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataServiceProject");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength($rootScope.lengthDetail)
        .withOption('order', [0, 'desc'])
        .withOption('serverSide', true)
        .withOption('headerCallback', function (header) {
            setTimeout(function () {
                $compile(angular.element(header).contents())($scope);
                $scope.$apply();
            })
        })
        .withOption('initComplete', function (settings, json) {
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);

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
                        //var modalInstance = $uibModal.open({
                        //    animation: true,
                        //    templateUrl: ctxfolderContract + '/contractTabProductDetail.html',
                        //    controller: 'contractTabProductDetail',
                        //    backdrop: 'static',
                        //    size: '40',
                        //    resolve: {
                        //        para: function () {
                        //            return objPara;
                        //        }
                        //    }
                        //});
                        //modalInstance.result.then(function (d) {
                        //    $scope.reload();
                        //}, function () {
                        //});
                    }
                    $scope.$apply();
                }
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ServiceCode').withTitle('{{"PROJECT_TAB_SERVICE_LIST_COL_SERVICE_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ServiceName').withTitle('{{"PROJECT_TAB_SERVICE_LIST_COL_SERVICE_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LevelName').withTitle('{{"PROJECT_TAB_SERVICE_LIST_COL_LEVEL" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withTitle('{{"PROJECT_TAB_SERVICE_LIST_COL_QUANTITY" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('currency')(data, '', 0) : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DurationTime').withTitle('{{"PROJECT_TAB_SERVICE_LIST_COL_DURATION_TIME" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UnitName').withTitle('{{"PROJECT_TAB_SERVICE_LIST_COL_UNIT" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"PROJECT_TAB_SERVICE_LIST_COL_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<a title="{{&quot;PROJECT_TITLE_REPAIR&quot; | translate}}" ng-click="getItem(' + full.Id + ')" style = "width: 25px; height: 25px; padding-right: 5px" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a>' +
            '<a title="{{&quot;PROJECT_SRIP_COL_LIST_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash  fs25"></i></a>';
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
        dataserviceProject.getService(function (rs) {
            rs = rs.data;
            $scope.services = rs;
        });
        dataserviceProject.getServiceLevel(function (rs) {
            rs = rs.data;
            $scope.serviceLevel = rs;
            $scope.model.Level = $scope.serviceLevel.length != 0 ? $scope.serviceLevel[0].Code : '';
        })
        dataserviceProject.getServiceDuration(function (rs) {
            rs = rs.data;
            $scope.serviceDurationUnit = rs;
            $scope.model.Unit = $scope.serviceDurationUnit.length != 0 ? $scope.serviceDurationUnit[0].Code : '';
        })
    }
    $scope.init();
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "ServiceCode" && $scope.model.ServiceCode != "") {
            $scope.errorServiceCode = false;
        }
        if (SelectType == "Level" && $scope.model.Level != "") {
            $scope.errorLevel = false;
        }
        if (SelectType == "Quantity" && ($scope.model.Quantity != null && $scope.model.Quantity != '' && $scope.model.Quantity > 0)) {
            $scope.errorQuantity = false;
        }
        if (SelectType == "DurationTime" && ($scope.model.DurationTime != null && $scope.model.DurationTime != '' && $scope.model.DurationTime > 0)) {
            $scope.errorDurationTime = false;
        }
    }
    $scope.reload = function () {
        $scope.dtOptions.withDisplayLength($rootScope.lengthDetail);
        $scope.headerCompiled = false;
        reloadData(true);
    }
    $scope.getItem = function (id) {
        var listdata = $('#tblDataServiceProject').DataTable().data();
        for (var i = 0; i < listdata.length; ++i) {
            if (listdata[i].Id == id) {
                var item = listdata[i];

                $scope.model.Id = item.Id;
                $scope.model.ServiceCode = item.ServiceCode;
                $scope.model.Level = item.Level;
                $scope.model.Quantity = item.Quantity;
                $scope.model.DurationTime = item.DurationTime;
                $scope.model.Unit = item.Unit;
                $scope.model.Note = item.Note;
                break;
            }
        }
    }
    $scope.add = function () {
        var obj = {
            ServiceCode: $scope.model.ServiceCode,
            Level: $scope.model.Level,
            Quantity: $scope.model.Quantity,
            DurationTime: $scope.model.DurationTime,
            Unit: $scope.model.Unit,
            Note: $scope.model.Note,
            ProjectCode: $rootScope.ProjectCode,
        }
        if (validationselectTabService($scope.model).Status == false) {
            dataserviceProject.insertService(obj, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $scope.reload();
                }
            });
        }
    }
    $scope.update = function () {
        if (validationselectTabService($scope.model).Status == false) {
            dataserviceProject.updateService($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reload();
                }
            });
        }
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;//"Bạn có chắc chắn muốn xóa?";
                $scope.ok = function () {
                    dataserviceProject.deleteService(id, function (result) {
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
    $scope.reset = function () {
        $scope.model.Id = '';
        $scope.model.ServiceCode = '';
        $scope.model.Level = '';
        $scope.model.Quantity = '';
        $scope.model.DurationTime = '';
        $scope.model.Note = '';
    }
    function validationselectTabService(data) {
        var mess = { Status: false, Title: "" }
        if (data.ServiceCode == "" || data.ServiceCode == null) {
            $scope.errorServiceCode = true;
            mess.Status = true;
        } else {
            $scope.errorServiceCode = false;
        }
        if (data.Level == "" || data.Level == null) {
            $scope.errorLevel = true;
            mess.Status = true;
        } else {
            $scope.errorLevel = false;
        }
        if (data.Quantity == '' || data.Quantity == null || data.Quantity <= 0) {
            $scope.errorQuantity = true;
            mess.Status = true;
        } else {
            $scope.errorQuantity = false;
        }
        if (data.DurationTime == "" || data.DurationTime == null) {
            $scope.errorDurationTime = true;
            mess.Status = true;
        } else {
            $scope.errorDurationTime = false;
        }
        return mess;
    }
});

app.controller('projectTabServiceNew', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter) {
    $scope.listPortType = [
        { Code: '', Name: 'Tất cả' },
        { Code: 'IMPORT', Name: 'Kiểu nhập dịch vụ' },
        { Code: 'EXPORT', Name: 'Kiểu xuất dịch vụ' },
    ];
    $scope.model = {
        FromDate: '',
        ToDate: '',
        PortType: '',
        ServiceCode: '',
        ProjectCode: $rootScope.ProjectCode,
    }
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Project/JTableServiceNew",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProjectCode = $rootScope.ProjectCode;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
                d.PortType = $scope.model.PortType;
                d.ServiceCode = $scope.model.ServiceCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataServiceProject");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength($rootScope.lengthDetail)
        .withOption('order', [0, 'desc'])
        .withOption('serverSide', true)
        .withOption('headerCallback', function (header) {
            setTimeout(function () {
                $compile(angular.element(header).contents())($scope);
                $scope.$apply();
            })
        })
        .withOption('initComplete', function (settings, json) {
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);

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
                        $('#tblDataServiceDetail').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.Id] = true;

                        var objPara = {
                            ServiceCode: data.ServiceCode,
                            ServiceType: data.ServiceType,
                            ContractCode: $rootScope.ContractCode,
                        }
                        //var modalInstance = $uibModal.open({
                        //    animation: true,
                        //    templateUrl: ctxfolderContract + '/contractTabServiceDetail.html',
                        //    controller: 'contractTabServiceDetail',
                        //    backdrop: 'static',
                        //    size: '40',
                        //    resolve: {
                        //        para: function () {
                        //            return objPara;
                        //        }
                        //    }
                        //});
                        //modalInstance.result.then(function (d) {
                        //    $scope.reload();
                        //}, function () {
                        //});
                    }
                    $scope.$apply();
                }
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ServiceCode').withTitle('{{"Dịch vụ" | translate}}').renderWith(function (data, type, full) {
        return '<span class="bold">' + data + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Cost').withTitle('{{"PROJECT_TAB_PRODUCT_COL_UNIT_PRICE" | translate}}').renderWith(function (data, type) {
        var dt = data != "" ? $filter('currency')(data, '', 0) : 0;
        return '<span class="text-danger bold">' + dt + '</span>';
    }).withOption('sClass', 'w50'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withTitle('{{"PROJECT_TAB_PRODUCT_LIST_COL_QUANTITY" | translate}}').renderWith(function (data, type) {
        var dt = data != "" ? $filter('currency')(data, '', 0) : 0;
        return dt;
    }).withOption('sClass', 'w50'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('DurationTime').withTitle('{{"PROJECT_TAB_SERVICE_LIST_COL_DURATION_TIME" | translate}}').renderWith(function (data, type, full) {
    //    return data;
    //}).withOption('sClass', 'w50'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UnitName').withTitle('{{"PROJECT_TAB_PRODUCT_LIST_COL_S_UNIT" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'w50'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('HeaderName').withTitle('{{"Tên phiếu" | translate}}').renderWith(function (data, type, full) {
        var title = '<span class = "bold">' + data + '</span>';

        if (full.SLastLog != '' && full.SLastLog != null && full.SLastLog != undefined) {
            title += formatDetail(full);
        }
        return title;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('TaxMoney').withTitle('{{"PROJECT_LIST_COL_TAX_MONEY" | translate}}').renderWith(function (data, type, full) {
    //    var cost = ((full.Quantity * full.Cost) * full.Tax) / 100;
    //    var dt = cost != "" ? $filter('currency')(cost, '', 0) : 0;
    //    return '<span class="text-danger bold">' + dt + '</span>';
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('TotalPrice').withTitle('{{"PROJECT_TAB_PRODUCT_LIST_COL_TOTAL_PRICE" | translate}}').renderWith(function (data, type, full) {
    //    var cost = (full.Quantity * full.Cost) + ((full.Quantity * full.Cost) * full.Tax) / 100;
    //    var dt = cost != "" ? $filter('currency')(cost, '', 0) : 0;
    //    return '<span class="text-danger bold">' + dt + '</span>';
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('').withTitle('{{"CONTRACT_TAB_LOP_LIST_COL_AFTER_TAX" | translate}}').renderWith(function (data, type, full) {
    //    var cost = full.Quantity * full.UnitPrice + (full.Quantity * full.UnitPrice) * full.Tax / 100;
    //    var dt = cost != "" ? $filter('currency')(cost, '', 0) : null;
    //    return dt;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"PROJECT_TAB_PRODUCT_LIST_COL_NOTE" | translate}}').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<a title="{{&quot;PROJECT_TITLE_REPAIR&quot; | translate}}" ng-click="edit(' + full.HeaderId + ')" style = "width: 25px; height: 25px; padding-right: 25px" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a>' +
            '<a title="{{&quot;PROJECT_SRIP_COL_LIST_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ',' + full.HeaderId + ')" style="width: 25px; height: 25px; padding: 0px" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash  fs25"></i></a>';
    }).withOption('sClass', 'w50'));
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
        dataserviceProject.getService(function (rs) {
            rs = rs.data;
            $scope.listServices = [{ Code: '', Name: 'Tất cả' }];
            $scope.listServices = $scope.listServices.concat(rs);
        });
    }

    //Add material service
    //$scope.addMaterialProd = function () {
    //    $rootScope.ServiceCode = '';
    //    var modalInstance = $uibModal.open({
    //        animation: true,
    //        templateUrl: ctxfolderMaterialProd + '/add.html',
    //        controller: 'addMaterialProd',
    //        backdrop: 'static',
    //        size: '60',
    //        resolve: {
    //            para: function () {
    //                return null;
    //            }
    //        }
    //    });
    //    modalInstance.result.then(function (d) {
    //        dataserviceProject.getService(function (rs) {
    //            rs = rs.data;
    //            $scope.services = rs;
    //        });
    //    }, function () {
    //    });
    //}
    $scope.init();
    $scope.reload = function () {
        $scope.dtOptions.withDisplayLength($rootScope.lengthDetail);
        $scope.headerCompiled = false;
        reloadData(true);
    }
    $scope.search = function () {
        reloadData(true);
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderProject + '/projectTabServiceAdd.html',
            controller: 'projectTabServiceAdd',
            backdrop: 'static',
            //windowClass: "modal-funAccEntry",
            size: '50'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.edit = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderProject + '/projectTabServiceEdit.html',
            controller: 'projectTabServiceEdit',
            backdrop: 'static',
            size: '50',
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
    $scope.delete = function (id, headerId) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;//"Bạn có chắc chắn muốn xóa?";
                $scope.ok = function () {
                    dataserviceProject.deleteServiceDetail(id, headerId, function (result) {
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
        $("#datefromService").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#datetoService').datepicker('setStartDate', maxDate);
        });
        $("#datetoService").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#datefromService').datepicker('setEndDate', maxDate);
        });
    }, 200);
});
app.controller('projectTabServiceAdd', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, dataserviceProject) {
    $scope.model = {
        Id: '',
        TicketCode: '',
        TicketTime: moment().format("DD/MM/YYYY"),
        TicketCount: 1,
        ProjectCode: $rootScope.ProjectCode,
        Note: '',
        PortType: 'IMPORT'
    }
    $scope.modelWf = {
        WorkflowCode: "PROJECT_PRODUCT",
        ObjectType: "PROJECT_PRODUCT",
        ObjectInst: "",
    };
    $scope.modelView = {
        TaxMoney: ''
    }
    $scope.listPortType = [
        { Code: 'IMPORT', Name: 'Kiểu nhập dịch vụ' },
        { Code: 'EXPORT', Name: 'Kiểu xuất dịch vụ' },
    ];
    $scope.init = function () {
        $rootScope.initPrice();
        dataserviceProject.getService(function (rs) {
            rs = rs.data;
            $scope.services = rs;
        });
        //dataserviceProject.getServiceUnit(function (rs) {
        //    rs = rs.data;
        //    $scope.units = rs;
        //});
        dataserviceProject.getServiceDuration(function (rs) {
            rs = rs.data;
            $scope.units = rs;
            $scope.model.Unit = $scope.serviceDurationUnit.length != 0 ? $scope.serviceDurationUnit[0].Code : '';
        })
        dataserviceProject.getListSupplier(function (rsSup) {
            rsSup = rsSup.data;
            $scope.Suppliers = rsSup;
        })
        dataserviceProject.createTicketCodeService($rootScope.ProjectCode, function (rs) {
            rs = rs.data;
            if (rs.Error == false) {
                $scope.model.TicketCode = rs.Object;
                $scope.model.TicketCount = rs.ID;
            }
        });
    }
    $rootScope.initPrice = function () {
        //
        dataserviceProject.getPriceOption($rootScope.CustomerCode, function (rs) {
            rs = rs.data;
            $scope.priceOption = rs.Object;
        })
    }
    $scope.init();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.calTax = function () {
        $scope.modelView.TaxMoney = Math.round(($scope.model.Tax * $scope.model.Cost * $scope.model.Quantity) / 100);
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "PortType" && $scope.model.PortType != "") {
            $scope.errorPortType = false;
            $scope.reloadProduct();
        }
        if (SelectType == "ServiceCode" && $scope.modelDetail.ServiceCode != "") {
            $scope.errorServiceCode = false;
        }

        if (SelectType == "Quantity" && ($scope.modelDetail.Quantity === "" || $scope.modelDetail.Quantity === null || $scope.modelDetail.Quantity > 0 && $scope.modelDetail.Quantity < 100000)) {
            $scope.errorQuantity = false;
        }

        if (SelectType == "Cost" && ($scope.modelDetail.Cost === "" || $scope.modelDetail.Cost === null || $scope.modelDetail.Cost > 0 /*&& $scope.modelDetail.Cost < 100000*/)) {
            $scope.errorTotal = false;
        }
        //if (SelectType == "Unit" && $scope.model.Unit != "") {
        //    $scope.errorUnit = false;
        //}
        //if (SelectType == "Tax" && ($scope.model.Tax != null && $scope.model.Tax != undefined && $scope.model.Tax < 0)) {
        //    $scope.errorTax = true;
        //    $scope.calTax();
        //}
        //else {
        //    $scope.errorTax = false;
        //    if ($scope.model.Tax == null || $scope.model.Tax == undefined) {
        //        $scope.model.Tax = 0;
        //    }
        //    $scope.calTax();
        //}

        //if (SelectType == "UnitPrice" && ($scope.model.Cost != null && $scope.model.Cost != undefined && $scope.model.Cost >= 0)) {
        //    $scope.errorUnitPrice = false;
        //    $scope.calTax();
        //}
    }
    $scope.selectService = function (item) {
        //$scope.model.ServiceName;
        //$scope.modelDetail.ServiceCode = item.Code;
        //$scope.modelDetail.Unit = item.Unit;
        //$scope.model.Tax = 0;
        //$scope.serviceType = item.ServiceType;
        $scope.currentSelectedService = item;
        //$scope.filterPrice();
        //validationTabProjectDetail($scope.model);
    }
    $scope.filterPrice = function () {
        if ($scope.model.ServiceCode != '' && $scope.model.PriceOption != '' && $scope.currentSelectedService != null) {
            var price = 0;
            if ($scope.model.PriceOption == "PRICE_COST_CATELOGUE")
                price = $scope.currentSelectedService.PriceCostCatelogue;
            if ($scope.model.PriceOption == "PRICE_COST_AIRLINE")
                price = $scope.currentSelectedService.PriceCostAirline;
            if ($scope.model.PriceOption == "PRICE_COST_SEA")
                price = $scope.currentSelectedService.PriceCostSea;
            if ($scope.model.PriceOption == "PRICE_RETAIL_BUILD")
                price = $scope.currentSelectedService.PriceRetailBuild;
            if ($scope.model.PriceOption == "PRICE_RETAIL_BUILD_AIRLINE")
                price = $scope.currentSelectedService.PriceRetailBuildAirline;
            if ($scope.model.PriceOption == "PRICE_RETAIL_BUILD_SEA")
                price = $scope.currentSelectedService.PriceRetailBuildSea;
            if ($scope.model.PriceOption == "PRICE_RETAIL_NO_BUILD")
                price = $scope.currentSelectedService.PriceRetailNoBuild;
            if ($scope.model.PriceOption == "PRICE_RETAIL_NO_BUILD_AIRLINE")
                price = $scope.currentSelectedService.PriceRetailNoBuildAirline;
            if ($scope.model.PriceOption == "PRICE_RETAIL_NO_BUILD_SEA")
                price = $scope.currentSelectedService.PriceRetailNoBuildSea;
            $scope.model.Cost = price;
        }
    }
    $scope.validator = function (data) {

        var msg = { Error: false, Title: null };
        //if (data.ServiceCode == null || data.ServiceCode == '' || data.ServiceCode == undefined) {
        //    msg.Error = true;
        //    msg.Title = "Vui lòng chọn sản phẩm";
        //}
        //if (data.Quantity == null || data.Quantity == '' || data.Quantity == undefined) {
        //    msg.Error = true;
        //    if (msg.Title != null)
        //        msg.Title = msg.Title + "</br>Vui lòng nhập số lượng";
        //    else
        //        msg.Title = "Vui lòng nhập số lượng";
        //}
        //if (data.UnitPrice == null) {
        //    msg.Error = true;
        //    if (msg.Title != null)
        //        msg.Title = msg.Title + "</br>Vui lòng nhập giá";
        //    else
        //        msg.Title = "Vui lòng nhập giá";
        //}
        //if (data.UnitPrice == '') {
        //    msg.Error = true;
        //    if (msg.Title != null)
        //        msg.Title = msg.Title + "</br>Vui lòng nhập giá";
        //    else
        //        msg.Title = "Vui lòng nhập giá";
        //}
        //if (data.UnitPrice == undefined) {
        //    msg.Error = true;
        //    if (msg.Title != null)
        //        msg.Title = msg.Title + "</br>Vui lòng nhập giá";
        //    else
        //        msg.Title = "Vui lòng nhập giá";
        //}
        //if (data.Tax == null || data.Tax == '' || data.Tax == undefined) {
        //    msg.Error = true;
        //    if (msg.Title != null)
        //        msg.Title = msg.Title + "</br>Vui lòng nhập thuế";
        //    else
        //        msg.Title = "Vui lòng nhập thuế";
        //}
        return msg;
    }
    $scope.getItem = function (id) {
        var listdata = $('#tblDataServiceProject').DataTable().data();
        for (var i = 0; i < listdata.length; ++i) {
            if (listdata[i].Id == id) {

                var item = listdata[i];
                $scope.model.Id = item.Id;
                $scope.model.ServiceCode = item.Code;
                $scope.model.Quantity = item.Quantity;
                $scope.model.Unit = item.Unit;
                $scope.model.Cost = item.Cost;
                $scope.model.Tax = ((item.Tax != null && item.Tax != '') ? parseFloat(item.Tax) : 10);
                $scope.model.Note = item.Note;
                $scope.model.PriceOption = item.PriceType;
                $scope.calTax();
                break;
            }
        }
    }
    $scope.isAdded = false;
    $scope.submit = function () {
        //var check = CKEDITOR.instances['Note'];
        //if (check !== undefined) {
        //    var data = CKEDITOR.instances['Note'].getData();
        //    $scope.model.AetDescription = data;
        //}
        //var obj = {
        //    ProjectCode: $rootScope.ProjectCode,
        //    ServiceCode: $scope.model.ServiceCode,
        //    ServiceType: $scope.serviceType,
        //    Quantity: $scope.model.Quantity,
        //    Cost: $scope.model.Cost,
        //    Unit: $scope.model.Unit,
        //    Tax: ($scope.model.Tax == null || $scope.model.Tax == '') ? 0 : $scope.model.Tax,
        //    Note: $scope.model.Note,
        //    PriceType: $scope.model.PriceOption,
        //}
        if ($scope.listProdDetail.length == 0) {
            return App.toastrError('Vui lòng nhập ít nhất 1 chi tiết');
        }
        validationProjectTabHeader($scope.model);
        if ($scope.addformTabService.validate() && validationProjectTabHeader($scope.model).Status == false) {
            dataserviceProject.insertServiceHeader($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    //$rootScope.amountbudget(rs.Object);
                    App.toastrSuccess(rs.Title);
                    $scope.modelWf.ObjectInst = rs.ID;
                    $scope.isAdded = true;
                    $uibModalInstance.close();
                    //$scope.modelWf.WorkflowCode = $scope.model.WorkflowCat;
                    //$scope.modelWf.ObjectName = $scope.model.ServiceName;
                    //dataserviceProject.createWfInstance($scope.modelWf, function (rs) {
                    //    rs = rs.data;
                    //    if (rs.Error) {
                    //        App.toastrError(rs.Title);
                    //    } else {
                    //        //App.toastrSuccess(rs.Title);
                    //        var wfInstCode = rs.Object.WfInstCode;
                    //        $scope.WfInstCode = wfInstCode;
                    //        $uibModalInstance.close();
                    //    }
                    //})
                    //$scope.reload();
                }
            });
        }
    }
    $scope.update = function () {
        validationTabProjectDetail($scope.model);
        if (validationTabProjectDetail($scope.model).Status == false) {
            dataserviceProject.updateService($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reset();
                    $scope.reload();
                }
            });
        }
    }

    //Add material service
    $scope.addMaterialProd = function () {
        $rootScope.ServiceCode = '';
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
            dataserviceProject.getService(function (rs) {
                rs = rs.data;
                $scope.services = rs;
            });
        }, function () {
        });
    }

    // get detail and add, delete detail
    $scope.listProdDetail = [];
    $scope.modelDetail = {
        ServiceCode: '',
        Unit: '',
        DurationTime: 0,
        Cost: 0,
        Quantity: 0
    };
    $scope.getDetail = function () {
        dataserviceProject.getServiceDetail($scope.model.TicketCode, function (rs) {
            rs = rs.data;
            $scope.listProdDetail = rs;
        });
    }
    $scope.addDetail = function () {
        //var check = CKEDITOR.instances['Note'];
        //if (check !== undefined) {
        //    var data = CKEDITOR.instances['Note'].getData();
        //    $scope.model.AetDescription = data;
        //}
        //if ($scope.isAdded == false) {
        //    return App.toastrError('Vui lòng lưu trước khi thêm chi tiết');
        //}
        var obj = {
            TicketCode: $scope.model.TicketCode,
            ServiceCode: $scope.modelDetail.ServiceCode,
            DurationTime: $scope.modelDetail.DurationTime,
            Quantity: $scope.modelDetail.Quantity,
            Cost: $scope.modelDetail.Cost,
            Unit: $scope.modelDetail.Unit,
        }
        validationTabProjectDetail($scope.modelDetail);
        if ($scope.addDetailformTabService.validate() && validationTabProjectDetail($scope.modelDetail).Status == false) {
            dataserviceProject.insertServiceDetail(obj, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    //$rootScope.amountbudget(rs.Object);
                    App.toastrSuccess(rs.Title);
                    $scope.getDetail();
                }
            });
        }
    }

    $scope.deleteDetail = function (id) {
        dataserviceProject.deleteServiceDetail(id, -1, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $scope.getDetail();
            }
        })
    }
    function validationTabProjectDetail(data) {
        var mess = { Status: false, Title: "" };
        if (data.ServiceCode == "" || data.ServiceCode == null) {
            $scope.errorServiceCode = true;
            mess.Status = true;
        } else {
            $scope.errorServiceCode = false;
        }
        if (data.Quantity === "" || data.Quantity === null || data.Quantity > 0 && data.Quantity < 100000) {
            $scope.errorQuantity = false;
        } else {
            $scope.errorQuantity = true;
            mess.Status = true;
        }
        if (data.Cost === "" || data.Cost === null || data.Cost > 0 /*&& data.Cost < 100000*/) {
            $scope.errorTotal = false;
        } else {
            $scope.errorTotal = true;
            mess.Status = true;
        }
        return mess;
    }
    function validationProjectTabHeader(data) {
        var mess = { Status: false, Title: "" };
        if (data.PortType == "" || data.PortType == null) {
            $scope.errorPortType = true;
            mess.Status = true;
        } else {
            $scope.errorPortType = false;
        }
        return mess;
    }
    //function ckEditer() {
    //    var editor1 = CKEDITOR.replace('Note', {
    //        cloudServices_tokenUrl: '/MobileApp/Token',
    //        cloudServices_uploadUrl: '/MobileApp/UploadFile',
    //        filebrowserBrowseUrl: '',
    //        filebrowserUploadUrl: '/MobileApp/Upload',
    //        embed_provider: '/uploader/upload.php'
    //    });
    //    CKEDITOR.instances['Note'].config.height = 160;
    //}
    setTimeout(function () {
        //ckEditer();
        $("#TicketTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function () {
            if ($('#TicketTime .input-date').valid()) {
                $('#TicketTime .input-date').removeClass('invalid').addClass('success');
            }
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#TicketTime').datepicker('setEndDate', null);
            }
        });
    }, 1000);
});
app.controller('projectTabServiceEdit', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, dataserviceProject, para) {
    $scope.model = {
        Id: '',
        TicketCode: '',
        TicketCount: 1,
        ProjectCode: $rootScope.ProjectCode,
        Note: '',
        PortType: 'IMPORT'
    }
    $scope.modelWf = {
        WorkflowCode: "PROJECT_PRODUCT",
        ObjectType: "PROJECT_PRODUCT",
        ObjectInst: "",
    };
    $scope.modelView = {
        TaxMoney: ''
    }
    $scope.listPortType = [
        { Code: 'IMPORT', Name: 'Kiểu nhập dịch vụ' },
        { Code: 'EXPORT', Name: 'Kiểu xuất dịch vụ' },
    ];
    $scope.getDetail = function () {
        dataserviceProject.getServiceDetail($scope.model.TicketCode, function (rs) {
            rs = rs.data;
            $scope.listProdDetail = rs;
        });
    }
    $scope.init = function () {
        //$rootScope.initPrice();
        dataserviceProject.getServiceHeader(para, function (rs) {
            rs = rs.data;

            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model = rs.Object;
                $scope.model.TicketTime = moment($scope.model.TicketTime).format("DD/MM/YYYY");
                $scope.getDetail();
                setTimeout(function () {
                    $rootScope.loadDiagramWfInst($scope.model.Id, $scope.modelWf.ObjectType);
                }, 800)
            }
        });
        dataserviceProject.getService(function (rs) {
            rs = rs.data;
            $scope.services = rs;
        });
        //dataserviceProject.getServiceUnit(function (rs) {
        //    rs = rs.data;
        //    $scope.units = rs;
        //});
        dataserviceProject.getServiceDuration(function (rs) {
            rs = rs.data;
            $scope.units = rs;
            $scope.model.Unit = $scope.serviceDurationUnit.length != 0 ? $scope.serviceDurationUnit[0].Code : '';
        })
        dataserviceProject.getListSupplier(function (rsSup) {
            rsSup = rsSup.data;
            $scope.Suppliers = rsSup;
        })
        //dataserviceProject.createTicketCodeService($rootScope.ProjectCode, function (rs) {
        //    rs = rs.data;
        //    if (rs.Error == false) {
        //        $scope.model.TicketCode = rs.Object;
        //        $scope.model.TicketCount = rs.ID;
        //    }
        //});
    }
    //$rootScope.initPrice = function () {
    //    //
    //    dataserviceProject.getPriceOption($rootScope.CustomerCode, function (rs) {
    //        rs = rs.data;
    //        $scope.priceOption = rs.Object;
    //    })
    //}
    $scope.init();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.calTax = function () {
        $scope.modelView.TaxMoney = Math.round(($scope.model.Tax * $scope.model.Cost * $scope.model.Quantity) / 100);
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "PortType" && $scope.model.PortType != "") {
            $scope.errorPortType = false;
            $scope.reloadProduct();
        }
        if (SelectType == "ServiceCode" && $scope.modelDetail.ServiceCode != "") {
            $scope.errorServiceCode = false;
        }

        if (SelectType == "Quantity" && ($scope.modelDetail.Quantity === "" || $scope.modelDetail.Quantity === null || $scope.modelDetail.Quantity > 0 && $scope.modelDetail.Quantity < 100000)) {
            $scope.errorQuantity = false;
        }

        if (SelectType == "Cost" && ($scope.modelDetail.Cost === "" || $scope.modelDetail.Cost === null || $scope.modelDetail.Cost > 0 /*&& $scope.modelDetail.Cost < 100000*/)) {
            $scope.errorTotal = false;
        }
        //if (SelectType == "Unit" && $scope.model.Unit != "") {
        //    $scope.errorUnit = false;
        //}
        //if (SelectType == "Tax" && ($scope.model.Tax != null && $scope.model.Tax != undefined && $scope.model.Tax < 0)) {
        //    $scope.errorTax = true;
        //    $scope.calTax();
        //}
        //else {
        //    $scope.errorTax = false;
        //    if ($scope.model.Tax == null || $scope.model.Tax == undefined) {
        //        $scope.model.Tax = 0;
        //    }
        //    $scope.calTax();
        //}

        //if (SelectType == "UnitPrice" && ($scope.model.Cost != null && $scope.model.Cost != undefined && $scope.model.Cost >= 0)) {
        //    $scope.errorUnitPrice = false;
        //    $scope.calTax();
        //}

        //if (SelectType == "Quantity" && ($scope.model.Quantity != null && $scope.model.Quantity != undefined && $scope.model.Quantity >= 0)) {
        //    $scope.errorQuantity = false;
        //    $scope.calTax()
        //}
    }
    $scope.selectService = function (item) {
        //$scope.model.ServiceName;
        //$scope.modelDetail.ServiceCode = item.Code;
        //$scope.modelDetail.Unit = item.Unit;
        //$scope.model.Tax = 0;
        //$scope.serviceType = item.ServiceType;
        $scope.currentSelectedService = item;
        //$scope.filterPrice();
        //validationTabProjectDetail($scope.model);
    }
    $scope.filterPrice = function () {
        if ($scope.model.ServiceCode != '' && $scope.model.PriceOption != '' && $scope.currentSelectedService != null) {
            var price = 0;
            if ($scope.model.PriceOption == "PRICE_COST_CATELOGUE")
                price = $scope.currentSelectedService.PriceCostCatelogue;
            if ($scope.model.PriceOption == "PRICE_COST_AIRLINE")
                price = $scope.currentSelectedService.PriceCostAirline;
            if ($scope.model.PriceOption == "PRICE_COST_SEA")
                price = $scope.currentSelectedService.PriceCostSea;
            if ($scope.model.PriceOption == "PRICE_RETAIL_BUILD")
                price = $scope.currentSelectedService.PriceRetailBuild;
            if ($scope.model.PriceOption == "PRICE_RETAIL_BUILD_AIRLINE")
                price = $scope.currentSelectedService.PriceRetailBuildAirline;
            if ($scope.model.PriceOption == "PRICE_RETAIL_BUILD_SEA")
                price = $scope.currentSelectedService.PriceRetailBuildSea;
            if ($scope.model.PriceOption == "PRICE_RETAIL_NO_BUILD")
                price = $scope.currentSelectedService.PriceRetailNoBuild;
            if ($scope.model.PriceOption == "PRICE_RETAIL_NO_BUILD_AIRLINE")
                price = $scope.currentSelectedService.PriceRetailNoBuildAirline;
            if ($scope.model.PriceOption == "PRICE_RETAIL_NO_BUILD_SEA")
                price = $scope.currentSelectedService.PriceRetailNoBuildSea;
            $scope.model.Cost = price;
        }
    }
    $scope.validator = function (data) {

        var msg = { Error: false, Title: null };
        //if (data.ServiceCode == null || data.ServiceCode == '' || data.ServiceCode == undefined) {
        //    msg.Error = true;
        //    msg.Title = "Vui lòng chọn sản phẩm";
        //}
        //if (data.Quantity == null || data.Quantity == '' || data.Quantity == undefined) {
        //    msg.Error = true;
        //    if (msg.Title != null)
        //        msg.Title = msg.Title + "</br>Vui lòng nhập số lượng";
        //    else
        //        msg.Title = "Vui lòng nhập số lượng";
        //}
        //if (data.UnitPrice == null) {
        //    msg.Error = true;
        //    if (msg.Title != null)
        //        msg.Title = msg.Title + "</br>Vui lòng nhập giá";
        //    else
        //        msg.Title = "Vui lòng nhập giá";
        //}
        //if (data.UnitPrice == '') {
        //    msg.Error = true;
        //    if (msg.Title != null)
        //        msg.Title = msg.Title + "</br>Vui lòng nhập giá";
        //    else
        //        msg.Title = "Vui lòng nhập giá";
        //}
        //if (data.UnitPrice == undefined) {
        //    msg.Error = true;
        //    if (msg.Title != null)
        //        msg.Title = msg.Title + "</br>Vui lòng nhập giá";
        //    else
        //        msg.Title = "Vui lòng nhập giá";
        //}
        //if (data.Tax == null || data.Tax == '' || data.Tax == undefined) {
        //    msg.Error = true;
        //    if (msg.Title != null)
        //        msg.Title = msg.Title + "</br>Vui lòng nhập thuế";
        //    else
        //        msg.Title = "Vui lòng nhập thuế";
        //}
        return msg;
    }
    $scope.getItem = function (id) {
        var listdata = $('#tblDataServiceProject').DataTable().data();
        for (var i = 0; i < listdata.length; ++i) {
            if (listdata[i].Id == id) {

                var item = listdata[i];
                $scope.model.Id = item.Id;
                $scope.model.ServiceCode = item.Code;
                $scope.model.Quantity = item.Quantity;
                $scope.model.Unit = item.Unit;
                $scope.model.Cost = item.Cost;
                $scope.model.Tax = ((item.Tax != null && item.Tax != '') ? parseFloat(item.Tax) : 10);
                $scope.model.Note = item.Note;
                $scope.model.PriceOption = item.PriceType;
                $scope.calTax();
                break;
            }
        }
    }
    $scope.isAdded = true;
    $scope.submit = function () {
        //var check = CKEDITOR.instances['Note'];
        //if (check !== undefined) {
        //    var data = CKEDITOR.instances['Note'].getData();
        //    $scope.model.AetDescription = data;
        //}
        //var obj = {
        //    ProjectCode: $rootScope.ProjectCode,
        //    ServiceCode: $scope.model.ServiceCode,
        //    ServiceType: $scope.serviceType,
        //    Quantity: $scope.model.Quantity,
        //    Cost: $scope.model.Cost,
        //    Unit: $scope.model.Unit,
        //    Tax: ($scope.model.Tax == null || $scope.model.Tax == '') ? 0 : $scope.model.Tax,
        //    Note: $scope.model.Note,
        //    PriceType: $scope.model.PriceOption,
        //}
        if ($scope.listProdDetail.length == 0) {
            return App.toastrError('Vui lòng nhập ít nhất 1 chi tiết');
        }
        validationProjectTabHeader($scope.model);
        if ($scope.addformTabService.validate() && validationProjectTabHeader($scope.model).Status == false) {
            dataserviceProject.updateServiceHeader($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    //$rootScope.amountbudget(rs.Object);
                    App.toastrSuccess(rs.Title);
                    //$scope.modelWf.ObjectInst = rs.ID;
                    $uibModalInstance.close();
                    //$scope.reload();
                }
            });
        }
    }

    //Add material service
    $scope.addMaterialProd = function () {
        $rootScope.ServiceCode = '';
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
            dataserviceProject.getService(function (rs) {
                rs = rs.data;
                $scope.services = rs;
            });
        }, function () {
        });
    }

    // get detail and add, delete detail
    $scope.listProdDetail = [];
    $scope.modelDetail = {
        ServiceCode: '',
        Unit: '',
        DurationTime: 0,
        Cost: 0,
        Quantity: 0
    };
    $scope.addDetail = function () {
        //var check = CKEDITOR.instances['Note'];
        //if (check !== undefined) {
        //    var data = CKEDITOR.instances['Note'].getData();
        //    $scope.model.AetDescription = data;
        //}
        //if ($scope.isAdded == false) {
        //    return App.toastrError('Vui lòng lưu trước khi thêm chi tiết');
        //}
        var obj = {
            TicketCode: $scope.model.TicketCode,
            ServiceCode: $scope.modelDetail.ServiceCode,
            DurationTime: $scope.modelDetail.DurationTime,
            Quantity: $scope.modelDetail.Quantity,
            Cost: $scope.modelDetail.Cost,
            Unit: $scope.modelDetail.Unit,
        }
        validationTabProjectDetail($scope.modelDetail);
        if ($scope.addDetailformTabService.validate() && validationTabProjectDetail($scope.modelDetail).Status == false) {
            dataserviceProject.insertServiceDetail(obj, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    //$rootScope.amountbudget(rs.Object);
                    App.toastrSuccess(rs.Title);
                    $scope.getDetail();
                }
            });
        }
    }

    $scope.deleteDetail = function (id) {
        dataserviceProject.deleteServiceDetail(id, -1, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $scope.getDetail();
            }
        })
    }
    function validationTabProjectDetail(data) {
        var mess = { Status: false, Title: "" };
        if (data.ServiceCode == "" || data.ServiceCode == null) {
            $scope.errorServiceCode = true;
            mess.Status = true;
        } else {
            $scope.errorServiceCode = false;
        }
        if (data.Quantity === "" || data.Quantity === null || data.Quantity > 0 && data.Quantity < 100000) {
            $scope.errorQuantity = false;
        } else {
            $scope.errorQuantity = true;
            mess.Status = true;
        }
        if (data.Cost === "" || data.Cost === null || data.Cost > 0 /*&& data.Cost < 100000*/) {
            $scope.errorTotal = false;
        } else {
            $scope.errorTotal = true;
            mess.Status = true;
        }
        return mess;
    }
    function validationProjectTabHeader(data) {
        var mess = { Status: false, Title: "" };
        if (data.PortType == "" || data.PortType == null) {
            $scope.errorPortType = true;
            mess.Status = true;
        } else {
            $scope.errorPortType = false;
        }
        return mess;
    }
    //function ckEditer() {
    //    var editor1 = CKEDITOR.replace('Note', {
    //        cloudServices_tokenUrl: '/MobileApp/Token',
    //        cloudServices_uploadUrl: '/MobileApp/UploadFile',
    //        filebrowserBrowseUrl: '',
    //        filebrowserUploadUrl: '/MobileApp/Upload',
    //        embed_provider: '/uploader/upload.php'
    //    });
    //    CKEDITOR.instances['Note'].config.height = 160;
    //}
    setTimeout(function () {
        //ckEditer();
        $("#TicketTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function () {
            if ($('#TicketTime .input-date').valid()) {
                $('#TicketTime .input-date').removeClass('invalid').addClass('success');
            }
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#TicketTime').datepicker('setEndDate', null);
            }
        });
    }, 1000);
});

app.controller('projectTabMember', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        Fullname: '',
        Position: '',
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Project/JTableMember",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProjectCode = $rootScope.ProjectCode;
                d.Fullname = $scope.model.Fullname;
                d.Position = $scope.model.Position;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength($rootScope.lengthDetail)
        .withOption('order', [0, 'desc'])
        .withOption('serverSide', true)
        .withOption('headerCallback', function (header) {
            setTimeout(function () {
                $compile(angular.element(header).contents())($scope);
                $scope.$apply();
            })
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
    }).withOption('sClass', ''));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('{{ "PROJECT_CURD_TAB_MEMBER_LIST_COL_FULLNAME" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Position').withTitle('{{ "PROJECT_CURD_TAB_MEMBER_LIST_COL_POSITION" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Email').withTitle('{{ "PROJECT_CURD_TAB_MEMBER_LIST_COL_EMAIL" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Active').withTitle('{{ "PROJECT_CURD_TAB_MEMBER_LIST_COL_STATUS" | translate }}').renderWith(function (data, type) {
        return data == "True" ? '<span class="text-success">Hoạt động</span>' : '<span class="text-danger">Không hoạt động</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Action').notSortable().withOption('sClass', 'nowrap dataTable-w80').withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').renderWith(function (data, type, full, meta) {
        return '<a title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding-right: 5px" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a>' +
            '<a title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash  fs25"></i></a>';
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
        $scope.dtOptions.withDisplayLength($rootScope.lengthDetail);
        $scope.headerCompiled = false;
        reloadData(true);
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderProject + '/projectTabMemberAdd.html',
            controller: 'projectTabMemberAdd',
            backdrop: 'static',
            size: '30'
        });
        modalInstance.result.then(function (d) {
            $scope.model.Fullname = "";
            $scope.model.Position = "";
            $scope.reload();
        }, function () { });
    }
    $scope.edit = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderProject + '/projectTabMemberEdit.html',
            controller: 'projectTabMemberEdit',
            backdrop: 'static',
            size: '30',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.model.Fullname = "";
            $scope.model.Position = "";
            reloadData();
        }, function () { });
    };
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;     //Bạn có chắc chắn muốn xóa
                $scope.ok = function () {
                    dataserviceProject.deleteProjectTabMember(id, function (result) {
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
            $scope.model.Fullname = "";
            $scope.model.Position = "";
            $scope.reload();
        }, function () {
        });
    }

});
app.controller('projectTabMemberAdd', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceProject, $filter) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.model = {
        Position: '',
        ProjectId: '',
    };
    $scope.initLoad = function () {
        dataserviceProject.getListUser(function (rs) {
            rs = rs.data;
            $scope.listUser = rs;
        });
    }
    $scope.initLoad();
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.MemberCode == "" || data.MemberCode == null) {
            $scope.errorMemberCode = true;
            mess.Status = true;
        } else {
            $scope.errorMemberCode = false;
        }
        return mess;
    };

    $scope.changleSelect = function (SelectType) {
        if (SelectType == "MemberCode" && $scope.model.MemberCode != "") {
            $scope.errorMemberCode = false;
        }
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
            $scope.model.ProjectCode = $rootScope.ProjectCode;
            dataserviceProject.insertProjectTabMember($scope.model, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $uibModalInstance.close();
                }
            });
        };
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('projectTabMemberEdit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceProject, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.initData = function () {
        dataserviceProject.getMember(para, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.model = rs;
                $scope.model.Member = $scope.model.MemberCode;
            }
        });
        dataserviceProject.getListUser(function (rs) {
            rs = rs.data;
            $scope.listUser = rs;
        });
    }
    $scope.initData();
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };


        if (data.MemberCode == "" || data.MemberCode == null) {
            $scope.errorMemberCode = true;
            mess.Status = true;
        } else {
            $scope.errorMemberCode = false;

        }
        return mess;
    };
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "MemberCode" && $scope.model.MemberCode != "") {
            $scope.errorMemberCode = false;
        }
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
            $scope.model.ProjectCode = $rootScope.ProjectCode;
            dataserviceProject.updateProjectTabMember($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            });
        };
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('projectTabFile', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter, dataserviceSupplier) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        FileName: '',
        FromDate: '',
        ToDate: '',
    }

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Project/JTableFile",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProjectCode = $rootScope.ProjectCode;
                d.FileName = $scope.model.FileName;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataProjectFile");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength($rootScope.lengthDetail)
        .withOption('order', [0, 'desc'])
        .withOption('serverSide', true)
        .withOption('headerCallback', function (header) {
            setTimeout(function () {
                $compile(angular.element(header).contents())($scope);
                $scope.$apply();
            })
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileName').withTitle('{{ "PROJECT_CURD_TAB_FILE_LIST_COL_FILENAME" | translate }}').renderWith(function (data, type, full) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('ReposName').withTitle('{{ "PROJECT_CURD_TAB_FILE_LIST_COL_REPOSNAME" | translate }}').renderWith(function (data, type, full) {
        return '<i class="fa fa-folder-open icon-state-warning"></i>&nbsp' + data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileID').withOption('sClass', 'nowrap dataTable-w80 text-center').withTitle("{{'PROJECT_LIST_COL_VIEW_CONTENT' | translate}}").renderWith(function (data, type, full) {
        var excel = ['.XLSM', '.XLSX', '.XLS'];
        var document = ['.TXT'];
        var word = ['.DOCX', '.DOC'];
        var pdf = ['.PDF'];
        var powerPoint = ['.PPS', '.PPTX', '.PPT'];
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        var icon = "";
        var typefile = "#";
        if (excel.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'excel';
            return '<a ng-click="viewExcel(' + full.Id + ', 2' + ')" title="{{&quot; PROJECT_TITLE_EDIT &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else if (word.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'Syncfusion';
            return '<a ng-click="viewWord(' + full.Id + ', 2' + ')" title="{{&quot; PROJECT_TITLE_EDIT &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else if (pdf.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'pdf';
            return '<a ng-click="viewPDF(' + full.Id + ', 2' + ')" title="{{&quot; PROJECT_TITLE_EDIT &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else if (document.indexOf(full.FileTypePhysic.toUpperCase()) !== -1 || image.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            return '<a ng-click="tabFileHistory(0)"  title="{{&quot; {{&quot;PROJECT_TITLE_EDIT_HISTORY&quot; | translate}} &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-history pt5"></i></a>' +
                '<a ng-click="view(' + full.Id + ')" title="{{&quot; PROJECT_TITLE_EDIT &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else {
            return '<a ng-click="getObjectFile(0)" title="{{&quot; PROJECT_TITLE_EDIT &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Desc').withTitle('{{ "PROJECT_CURD_TAB_FILE_LIST_COL_NOTE" | translate }}').notSortable().renderWith(function (data, type, full) {
        return '<button title="{{&quot;PROJECT_TITLE_DESCRIBE&quot; | translate}}" ng-click="extension(' + full.FileID + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-info-circle"></i></button>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{ "PROJECT_CURD_TAB_FILE_LIST_COL_CREATETIME" | translate }}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeFile').withTitle('{{ "PROJECT_CURD_TAB_FILE_LIST_COL_TYPE_FILE" | translate }}').renderWith(function (data, type, full) {
        if (data == "SHARE") {
            return "<label class='text-primary'>Tệp được chia sẻ</label>";
        } else {
            return "Tệp gốc";
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Action').withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').renderWith(function (data, type, full) {
        if (full.TypeFile == "SHARE") {
            return '<a ng-click="dowload(\'' + full.FileCode + '\')" target="_blank" style="width: 25px; height: 25px; padding: 0px" title="{{&quot;PROJECT_TITLE_DOW&quot; | translate}} - ' + full.FileName + '" class="" download><i class="fas fa-download fs25 pt5"></i></a>';
        } else {
            return '<a title="{{&quot;PROJECT_TITLE_REPAIR&quot; | translate}}" ng-click="edit(\'' + full.FileName + '\',' + full.Id + ')" style = "width: 25px; height: 25px; padding-right: 5px" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a>' +
                '<a ng-click="dowload(\'' + full.FileCode + '\')" style="width: 25px; height: 25px; padding: 0px" title="{{&quot;PROJECT_TITLE_DOW&quot; | translate}} - ' + full.FileName + '" class=""><i class="fas fs25 fa-download pt5"></i></a>' +
                '<a title="{{&quot;PROJECT_SRIP_COL_LIST_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash  fs25"></i></a>';
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
        $scope.dtOptions.withDisplayLength($rootScope.lengthDetail);
        $scope.headerCompiled = false;
        reloadData(true);
    }

    $rootScope.reloadFile = function () {
        $scope.reload();
    }

    $scope.search = function () {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderProject + '/projectTabFileSearch.html',
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
            data.append("ProjectCode", $rootScope.ProjectCode);
            data.append("IsMore", false);
            dataserviceProject.insertProjectFile(data, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $scope.reload();
                }
            });
        }
    }
    $scope.edit = function (fileName, id) {
        dataserviceProject.getProjectFile(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                rs.Object.FileName = fileName;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderProject + '/projectTabFileEdit.html',
                    controller: 'projectTabFileEdit',
                    windowClass: 'modal-file',
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
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceProject.deleteProjectFile(id, function (result) {
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
            controller: 'projectTabFileShare',
            windowClass: 'modal-center',
            backdrop: 'static',
            size: '60',
        });
        modalInstance.result.then(function (d) {
            reloadData()
        }, function () { });
    }
    $scope.viewFile = function (id) {
        //dataserviceProject.getByteFile(id, function (rs) {rs=rs.data;
        //    //
        //    var blob = new Blob([rs.Object], { type: "application/msword;charset=utf-8" });
        //    var blobUrl = URL.createObjectURL(blob);
        //    var url = window.encodeURIComponent(blobUrl);
        //    window.open('https://docs.google.com/gview?url=' + "https://facco.s-work.vn" + '' + url + '&embedded=true', '_blank');
        //})
        //var userModel = {};
        //var listdata = $('#tblDataFileProject').DataTable().data();
        //for (var i = 0; i < listdata.length; i++) {
        //    if (listdata[i].Id == id) {
        //        userModel = listdata[i];
        //        break;
        //    }
        //}
        ////
        //var dt = userModel.Url;
        //dt = dt.replace("\/", "\\");
        //var url1 = "upload\\repository" + dt;
        //url1 = "\\uploads\\repository\\3.THÔNG TIN CHUNG\\mail vib.docx";
        //var url = window.encodeURIComponent(url1);
        //window.open('https://docs.google.com/gview?url=' + "https://facco.s-work.vn" + '' + url + '&embedded=true', '_blank');
    }
    $scope.viewImage = function (id) {
        var userModel = {};
        var listdata = $('#tblDataFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        toDataUrl(window.location.origin + userModel.Url, function (myBase64) {
            var modalInstance = $uibModal.open({
                templateUrl: '/views/admin/edmsRepository/imageViewer.html',
                controller: 'projectTabFileimageViewer',
                backdrop: 'static',
                size: '40',
                resolve: {
                    para: function () {
                        return myBase64;
                    }
                }
            });
            modalInstance.result.then(function (d) {
            }, function () {
            });
        });
    }
    $scope.dowload = function (fileCode) {
        location.href = "/Admin/EDMSRepository/DownloadFile?fileCode="
            + fileCode;
    }
    $scope.extend = function (id) {
        //dataserviceProject.getSuggestionsProjectFile($rootScope.ProjectCode, function (rs) {
        //    rs = rs.data;
        //    var data = rs !== '' ? rs : { CatCode: '', ObjectCode: $rootScope.ProjectCode, ObjectType: 'PROJECT' };
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
        //})

        dataserviceSupplier.getDefaultRepo($rootScope.ProjectCode, 'PROJECT', function (rs) {
            rs = rs.data;
            var data = rs !== null ? rs : { CatCode: '', ObjectCode: $rootScope.ProjectCode, ObjectType: 'PROJECT' };
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
    }
    $scope.loadFile = function (event) {
        $scope.file = event.target.files[0];
    }

    $scope.getObjectFile = function (id) {
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            dataserviceProject.getItemFile(id, true, function (rs) {
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
        var listdata = $('#tblDataProjectFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            if (userModel.SizeOfFile < 20971520) {
                dataserviceProject.getItemFile(id, true, mode, function (rs) {
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
                App.toastrError(caption.PROJECT_MSG_FILE_SIZE_LIMIT);
            }

        }
    };
    $scope.viewWord = function (id, mode) {
        var userModel = {};
        var listdata = $('#tblDataProjectFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }

        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {

            if (userModel.SizeOfFile < 20971520) {
                dataserviceProject.getItemFile(id, true, mode, function (rs) {
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
                App.toastrError(caption.PROJECT_MSG_FILE_SIZE_LIMIT);
            }
        }
    };
    $scope.viewPDF = function (id, mode) {
        var userModel = {};
        var listdata = $('#tblDataProjectFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            if (userModel.SizeOfFile < 20971520) {
                dataserviceProject.getItemFile(id, true, mode, function (rs) {
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
                App.toastrError(caption.PROJECT_MSG_FILE_SIZE_LIMIT);
            }
        }
    };
    $scope.view = function (id) {

        var isImage = false;
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        var userModel = {};
        var listdata = $('#tblDataProjectFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        if (image.indexOf(userModel.FileTypePhysic.toUpperCase()) !== -1) {
            isImage = true;
        }
        if (userModel.CloudFileId != null && userModel.CloudFileId != "") {
            //SHOW LÊN MÀN HÌNH LUÔN
            // window.open(" https://drive.google.com/file/d/" + userModel.CloudFileId + "/view", "_blank");
            //$scope.openViewer("https://drive.google.com/file/d/"+userModel.CloudFileId + "/view");3
            dataserviceProject.createTempFile(id, false, "", function (rs) {
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
            dataserviceProject.createTempFile(id, false, "", function (rs) {
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
            templateUrl: ctxfolderProject + '/viewer.html',
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

    function loadDate() {
        $("#FromToProject").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#DateToProject').datepicker('setStartDate', maxDate);
        });
        $("#DateToProject").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromToProject').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            $('#FromToProject').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateToProject').datepicker('setStartDate', null);
        });
    }
    setTimeout(function () {
        loadDate();
    }, 200);
});
app.controller('projectTabFileAdd', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter, para) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('FolderName').notSortable().withTitle('{{"PROJECT_LIST_COL_FORDER_SAVE" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
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
                App.toastrError(caption.PROJECT_MSG_SELECT_FORDER);
                return;
            } else if (itemSelect.length > 1) {
                App.toastrError(caption.PROJECT_MSG_SELECT_FORDER);
                return;
            }
            var data = new FormData();
            data.append("CateRepoSettingId", itemSelect.length != 0 ? itemSelect[0] : "");
            data.append("FileUpload", $scope.file);
            data.append("FileName", $scope.file.name);
            data.append("Desc", $scope.model.Desc);
            data.append("Tags", $scope.model.Tags);
            data.append("NumberDocument", $scope.model.NumberDocument);
            data.append("ProjectCode", $rootScope.ProjectCode);
            data.append("IsMore", true);
            dataserviceProject.insertProjectFile(data, function (result) {
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
            dataserviceProject.getTreeCategory(function (result) {
                result = result.data;
                if (!result.Error) {
                    var root = {
                        id: 'root',
                        parent: "#",
                        text: caption.PROJECT_LBL_ALL_CATE,//"Tất cả kho dữ liệu"
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
app.controller('projectTabFileEdit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, para) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('FolderName').withOption('sClass', '').withTitle('{{"PROJECT_LIST_COL_FORDER" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
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
            App.toastrError(caption.PROJECT_MSG_SELECT_FORDER);
        } else if (itemSelect.length > 1) {
            App.toastrError(caption.PROJECT_MSG_SELECT_FORDER);
        } else {
            if ($scope.editformfile.validate()) {
                var data = new FormData();
                data.append("CateRepoSettingId", itemSelect[0]);
                data.append("FileCode", para.FileCode);
                data.append("Desc", $scope.model.Desc);
                data.append("Tags", $scope.model.Tags);
                data.append("NumberDocument", $scope.model.NumberDocument);
                data.append("ProjectCode", $rootScope.ProjectCode);
                dataserviceProject.updateProjectFile(data, function (result) {
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
            dataserviceProject.getTreeCategory(function (result) {
                result = result.data;
                if (!result.Error) {
                    var root = {
                        id: 'root',
                        parent: "#",
                        text: caption.PROJECT_LBL_ALL_CATE,//"Tất cả kho dữ liệu"
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
app.controller('projectTabFileimageViewer', function ($scope, $rootScope, $compile, $uibModal, $confirm, dataserviceProject, $filter, $uibModalInstance, para) {
    $scope.Image = para;
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('projectTabFileShare', function ($scope, $rootScope, $compile, $uibModalInstance, dataserviceProject) {
    $scope.model = {
        ObjectCodeShared: $rootScope.ProjectCode,
        ObjectTypeShared: 'PROJECT',
        ObjectType: '',
        ObjectCode: '',
        FileCode: '',
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.init = function () {
        dataserviceProject.getListObjectTypeShare(function (rs) {
            rs = rs.data;
            $scope.listObjType = rs;
        });
        dataserviceProject.getListFileWithObject($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, function (rs) {
            rs = rs.data;
            $scope.listFileObject = rs;
        });
        reloadListObjectShare($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, $scope.model.ObjectCode, $scope.model.ObjectType, $scope.model.FileCode);
    }
    $scope.init();
    $scope.changeObjType = function (ObjType) {
        dataserviceProject.getListObjectCode($rootScope.ProjectCode, ObjType, function (rs) {
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
        dataserviceProject.deleteObjectShare(id, function (rs) {
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
            dataserviceProject.insertFileShare($scope.model, function (rs) {
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
            App.toastrError(caption.PROJECT_MSG_NO_OBJ_SELECT)
            error = true;
            return error;
        }
        if (($scope.model.ObjectCode == "" || $scope.model.ObjectCode == undefined)) {
            App.toastrError(caption.PROJECT_MSG_NO_OBJ_CODE)
            error = true;
            return error;
        }
        if (($scope.model.FileCode == "" || $scope.model.FileCode == undefined)) {
            App.toastrError(caption.PROJECT_MSG_NO_FILE_SELECT)
            error = true;
            return error;
        }
    }
    function reloadListObjectShare(objectCodeShared, objectTypeShared, objectCode, objectType, fileCode) {
        dataserviceProject.getListObjectShare(objectCodeShared, objectTypeShared, objectCode, objectType, fileCode, function (rs) {
            rs = rs.data;
            $scope.listObjectShare = rs;
        })
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('projectTabNote', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter) {
    var vm = $scope;
    $scope.model = {
        Title: '',
        RepeatType: 'NEVER'
    }
    $scope.listRepeatType = [
        { Code: 'NEVER', Name: 'Không lặp' },
        { Code: 'HOUR', Name: 'Giờ' },
        { Code: 'DAY', Name: 'Ngày' },
        { Code: 'MONTH', Name: 'Tháng' },
        { Code: 'YEAR', Name: 'Năm' },
    ];
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Project/JTableProjectAppointment",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProjectCode = $rootScope.ProjectCode;
                //d.Title = $scope.model.Title;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataNoteProject");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength($rootScope.lengthDetail)
        .withOption('order', [0, 'desc'])
        .withOption('serverSide', true)
        .withOption('headerCallback', function (header) {
            setTimeout(function () {
                $compile(angular.element(header).contents())($scope);
                $scope.$apply();
            })
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withTitle('{{ "PROJECT_CURD_TAB_NOTE_LIST_COL_ADDRESS" | translate }}').renderWith(function (data, type) {
    //    return '<span  class="btn btn-success" style="height: 20px; font-size: 5; padding: 0">Tags</button>';
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{ "PROJECT_CURD_TAB_NOTE_LIST_COL_TITLE" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('RepeatType').withTitle('{{ "Kiểu lặp lại" | translate }}').renderWith(function (data, type) {
        var indexType = $scope.listRepeatType.findIndex(x => x.Code == data);
        if (true) {
            return $scope.listRepeatType[indexType].Name;
        }
        else {
            return data;
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Location').withTitle('{{ "Vị trí" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{ "PROJECT_CURD_TAB_NOTE_LIST_COL_NOTE" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FromDate').withTitle('{{ "Từ ngày" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ToDate').withTitle('{{ "Đến ngày" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('').withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').renderWith(function (data, type, full) {
        return '<a title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding-right: 25px;" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a>' +
            '<a title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash  fs25"></i></a>';
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

    $scope.openMap = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCustomer + '/google-map.html',
            controller: 'googleMapCustomer',
            backdrop: 'static',
            size: '80',
            resolve: {
                para: function () {
                    if ($scope.model.GoogleMap && $scope.model.GoogleMap != '') {
                        return {
                            lt: parseFloat($scope.model.GoogleMap.split(',')[0]),
                            lg: parseFloat($scope.model.GoogleMap.split(',')[1]),
                            address: $scope.model.Location,
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
                $scope.model.Location = d.address;
            }
        }, function () { });
    }
    $scope.search = function () {
        reloadData(true);
    }
    $scope.reload = function () {
        $scope.dtOptions.withDisplayLength($rootScope.lengthDetail);
        $scope.headerCompiled = false;
        reloadData(true);
    }
    $scope.viewCalendar = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderProject + '/reminderCalendar.html',
            controller: 'projectTabNoteCalendar',
            backdrop: 'static',
            size: '60'
        });
        modalInstance.result.then(function (d) {
            $scope.reload()
        }, function () { });
    }
    $scope.projectEvent = {};
    $scope.add = function () {
        if ($scope.projectEvent.addform.validate()) {
            $scope.model.ProjectCode = $rootScope.ProjectCode;
            dataserviceProject.insertProjectTabAppointment($scope.model, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $scope.reload();
                    //$uibModalInstance.close();
                }
                //App.unblockUI("#contentMain");
            });
        };
    };
    //$scope.add = function () {
    //    var modalInstance = $uibModal.open({
    //        animation: true,
    //        templateUrl: ctxfolderProject + '/reminderAdd.html',
    //        controller: 'projectTabNoteAdd',
    //        backdrop: 'static',
    //        size: '30'
    //    });
    //    modalInstance.result.then(function (d) {
    //        $scope.reload()
    //    }, function () { });
    //}
    $scope.edit = function (id) {
        dataserviceProject.getAppointment(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.model = rs;
                $scope.model.FromDate = moment($scope.model.FromDate).format("DD/MM/YYYY HH:mm");
                $scope.model.ToDate = moment($scope.model.ToDate).format("DD/MM/YYYY HH:mm");
                $scope.isEdit = true;
            }
        });
    }
    $scope.reset = function () {
        $scope.model.Id = '';
        $scope.model.Title = '';
        $scope.model.FromDate = '';
        $scope.model.ToDate = '';
        $scope.model.Location = '';
        $scope.model.GoogleMap = '';
        $scope.model.Note = '';
        $scope.model.RepeatType = 'NEVER';
        $scope.isEdit = false;
    }
    $scope.add = function () {
        if ($scope.projectEvent.addform.validate()) {
            $scope.model.ProjectCode = $rootScope.ProjectCode;
            dataserviceProject.insertProjectTabAppointment($scope.model, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $scope.reload();
                    //$uibModalInstance.close();
                }
                //App.unblockUI("#contentMain");
            });
        };
    };
    $scope.isEdit = false;
    $scope.update = function () {
        if ($scope.projectEvent.addform.validate()) {
            $scope.model.ProjectCode = $rootScope.ProjectCode;
            dataserviceProject.updateProjectTabAppointment($scope.model, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $scope.reload();
                    $scope.reset();
                    //$uibModalInstance.close();
                }
                //App.unblockUI("#contentMain");
            });
        };
    };
    //$scope.edit = function (id) {
    //    var modalInstance = $uibModal.open({
    //        animation: true,
    //        templateUrl: ctxfolderProject + '/projectTabNoteEdit.html',
    //        controller: 'projectTabNoteEdit',
    //        backdrop: 'static',
    //        size: '30',
    //        resolve: {
    //            para: function () {
    //                return id;
    //            }
    //        }
    //    });
    //    modalInstance.result.then(function (d) {
    //        reloadData();
    //    }, function () { });
    //};
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceProject.deleteProjectTabAppointment(id, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $uibModalInstance.close();
                        }
                        //App.unblockUI("#contentMain");
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

    function loadDate() {
        $("#FromDateEvent").datetimepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy hh:ii",
            //startDate: new Date(moment().subtract(5, 'minutes')),
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ToDateEvent').datetimepicker('setStartDate', maxDate);

            if ($('#FromDateEvent').valid()) {
                $('#FromDateEvent').removeClass('invalid').addClass('success');
            }
        });
        $("#ToDateEvent").datetimepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy hh:ii",
            //startDate: new Date(),
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromDateEvent').datetimepicker('setEndDate', maxDate);

            if ($('#ToDateEvent').valid()) {
                $('#ToDateEvent').removeClass('invalid').addClass('success');
            }
        });
        $('.start-date').click(function () {
            $('#FromDateEvent').datetimepicker('setEndDate', null);
        });
        $('.end-date').click(function () {
            $('#ToDateEvent').datetimepicker('setStartDate', null);
        });
    }
    setTimeout(function () {
        //setModalDraggable('.modal-dialog');
        loadDate();
    }, 200);
});
app.controller('projectTabNoteAdd', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceProject, $filter) {
    $scope.model = {
        Position: '',
        ProjectId: '',
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        if ($scope.addform.validate()) {

            $scope.model.ProjectCode = $rootScope.ProjectCode;
            dataserviceProject.insertProjectTabNote($scope.model, function (result) {
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
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('projectTabNoteEdit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceProject, $filter, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.model = {
        Title: '',
        Note: '',
    };
    $scope.initData = function () {
        dataserviceProject.getNote(para, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.model = rs;
            }
        });
    }
    $scope.initData();
    $scope.submit = function () {
        if ($scope.addform.validate()) {
            dataserviceProject.updateProjectTabNote($scope.model, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $uibModalInstance.close();
                }
            });
        };
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('projectTabNoteCalendar', function ($scope, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModal, $uibModalInstance, $filter, dataserviceProject) {
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
            eventLimit: false,
            nextDayThreshold: '00:00:00',
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
                dataserviceProject.getAllEvent($rootScope.ProjectCode, function (rs) {
                    rs = rs.data;
                    var event = [];
                    var stt = 0;
                    var checkDate = null;

                    for (var i = 0; i < rs.length; i++) {
                        var value = rs[i];

                        var obj = {
                            stt: stt,
                            value: value,
                            title: value.Title + ' (' + value.sStartTime + ' - ' + value.sEndTime + ')', //(value.Title.length > 15 ? value.Title.substr(0, 15) + "..." : value.Title) + ' (' + value.sStartTime + ' - ' + value.sEndTime + ')' ,
                            //title: caption.MS_LBL_MEETING + ' ' + ": " + value.Title + ' \n' + caption.MS_LBL_TIME_MEETING + '  :  ' + value.sStartTime + ' - ' + value.sEndTime + '\n ' + caption.MS_LBL_STATUS + ' : ' + value.Status,
                            start: value.FromDate,
                            end: value.ToDate,
                            className: value.ClassName,
                            date: value.Date,
                            //color: value.Color,
                            //textColor: value.TextColor,
                            displayEventTime: false,
                            edit: false,
                            copy: false,
                            startTime: value.FromDate,
                            titlemeet: value.Title,
                            //status: value.Status,
                            //statusCode: value.StatusCode,
                            timemeet: value.sStartTime + ' - ' + value.sEndTime
                        }

                        stt++;

                        event.push(obj);

                        stt++;
                    }
                    callback(event);
                })
            },
            eventClick: function (calEvent) {
                //var date = $filter('date')(new Date(calEvent.date), 'dd/MM/yyyy');
                //var value = calEvent.value;
                //var modalInstance = $uibModal.open({
                //    animation: true,
                //    templateUrl: ctxfolderProject + '/view-calendar.html',
                //    controller: 'grid-view-calendar',
                //    size: '70',
                //    resolve: {
                //        para: function () {
                //            return {
                //                Date: date,
                //                Value: value,
                //            }
                //        }
                //    }
                //});
                //modalInstance.result.then(function (d) {

                //});
            },
            eventOrder: "value",
        })
    }
    setTimeout(function () {
        loadCalendar("calendar-event");
        setModalDraggable(".modal-dialog");
    }, 200);
});


app.controller('projectTabPayment', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {

        FromDate: '',
        ToDate: '',
        ProjectId: '',
        PaymentType: '',
        ProjectCode: $rootScope.ProjectCode,
    }

    //$scope.model = {
    //    ContractCode: ''
    //}
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Project/JTableProjectTabPayment",
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
                d.PaymentType = $scope.model.PaymentType;
                d.ProjectCode = $rootScope.ProjectCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataPayment");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength($rootScope.lengthDetail)
        .withOption('order', [0, 'desc'])
        .withOption('serverSide', true)
        .withOption('headerCallback', function (header) {
            setTimeout(function () {
                $compile(angular.element(header).contents())($scope);
                $scope.$apply();
            })
        })
        .withOption('initComplete', function (settings, json) {
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row))($scope);
        })
        .withOption('footerCallback', function (tfoot, data) {
            $scope.model.ProjectCode = $rootScope.ProjectCode;
            dataserviceProject.getTotalPayment($scope.model, function (result) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('DeadLine').withTitle('{{"PROJECT_LIST_COL_DEAD_LINE" | translate}}').withOption('sClass', 'dataTable-pr0 w50').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('CatName').withTitle('{{"PROJECT_LIST_COL_CAT_NAME" | translate}}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"PROJECT_LIST_COL_TITLE" | translate}}').withOption('sClass', 'dataTable-pr0 w-50').renderWith(function (data, type, full, meta) {
        var catName = '<span class="badge-customer badge-customer-success fs9 ml5">' + full.CatName + '</span>';
        var time = "";
        var title = '<span class = "bold">' + data + '</span><br />' + catName + time;

        if (full.SLastLog != '' && full.SLastLog != null && full.SLastLog != undefined) {
            title += formatDetail(full);
        }
        return title;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AetType').withTitle('{{"CONTRACT_CURD_TAB_PAYMENT_LIST_COL_AET_TYPE" | translate}}').withOption('sClass', 'dataTable-pr0 w50').renderWith(function (data, type) {
        if (data == "Receipt") {
            return caption.FEA_REVENUE;
        }
        else {
            return caption.FEA_EXPENDI;
        }
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Total').withTitle('{{"PROJECT_LIST_COL_TOTAL" | translate}}').withOption('sClass', 'dataTable-pr0 w50').renderWith(function (data, type) {
        return '<span class="text-danger bold">' + $filter('currency')(data, '', 0) + '</span>';
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Currency').withTitle('{{"Tiền tệ" | translate}}').withOption('sClass', 'dataTable-pr0 w50').renderWith(function (data, type) {
        return data;
    }));

    //vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"PROJECT_LIST_COL_STATUS" | translate}}').withOption('sClass', 'dataTable-pr0 nowrap').renderWith(function (data, type, full, meta) {
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
    //    //return data;
    //    return full.StatusObject;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Payer').withTitle('{{"PROJECT_LIST_COL_PAYER" | translate}}').withOption('sClass', 'dataTable-pr0 w50').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Receiptter').withTitle('{{"PROJECT_LIST_COL_RECEIPTTER" | translate}}').withOption('sClass', 'dataTable-pr0 w50').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').renderWith(function (data, type, full) {
        return '<a title="{{&quot;PROJECT_TITLE_REPAIR&quot; | translate}}" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding-right: 20px;" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a>' +
            '<a title="{{&quot;PROJECT_SRIP_COL_LIST_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash  fs25"></i></a>';
    }).withOption('sClass', 'w50'));
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
        $scope.dtOptions.withDisplayLength($rootScope.lengthDetail);
        $scope.headerCompiled = false;
        reloadData(true);
    }
    $scope.searchPayment = function () {
        reloadData(true);
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderProject + '/projectTabPaymentAdd.html',
            controller: 'projectTabPaymentAdd',
            backdrop: 'static',
            windowClass: "modal-funAccEntry",
            size: '70'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.edit = function (PaymentTickitId) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderProject + '/projectTabPaymentEdit.html',
            controller: 'projectTabPaymentEdit',
            backdrop: 'static',
            windowClass: "modal-funAccEntry",
            size: '70',
            resolve: {
                para: function () {
                    return PaymentTickitId;
                }
            }
        });
        modalInstance.result.then(function (d) {
            reloadData();
        }, function () { });
    };
    $scope.delete = function (PaymentTickitId) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceProject.deletePayment(PaymentTickitId, function (result) {
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
        $("#datefromPayment").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#datetoPayment').datepicker('setStartDate', maxDate);
        });
        $("#datetoPayment").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#datefromPayment').datepicker('setEndDate', maxDate);
        });
    }, 200);
});
app.controller('projectTabPaymentAdd', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, dataserviceProject) {
    $scope.model = {
        AetCode: '',
        GoogleMap: '',
        AetCode: '',
        Title: '',
        AetType: '',
        AetDescription: '',
        Currency: 'VND',
        ObjType: 'PROJECT',
        ObjCode: $rootScope.ProjectCode,
        WorkflowCat: 'THU_CHI',
    }

    $scope.modelWf = {
        WorkflowCode: "THU_CHI",
        ObjectType: "FUND_ACC_ENTRY",
        ObjectInst: "",
    };
    dataserviceProject.getCurrencyDefaultPayment(function (rs) {
        rs = rs.data;
        $scope.model.Currency = rs;
    });
    //$scope.AetCode = [];
    $scope.listFundFile = [];
    $scope.listFundFileRemove = [];
    $scope.openMap = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderProject + '/googleMap.html',
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
    $scope.initData = function () {
        //dataserviceProject.getGetCurrency(function (rs) {rs=rs.data;
        //    $rootScope.listCurrency = rs;
        //})
        dataserviceProject.getGetAetRelative(function (rs) {
            rs = rs.data;
            $rootScope.AetRelative = rs;
        })
        dataserviceProject.getGetCatName(function (rs) {
            rs = rs.data;
            $rootScope.listCatName = rs;
        });
        dataserviceProject.getListTitle(function (rs) {
            rs = rs.data;
            $rootScope.listTitle = rs;
        })
        dataserviceProject.gettreedata({ IdI: null }, function (result) {
            result = result.data;
            $scope.treeData = result;
        });
        dataserviceProject.getObjDependency(function (rs) {
            rs = rs.data;
            $scope.listObjType = rs;
        });
        dataserviceProject.getObjCode("PROJECT", function (rs) {
            rs = rs.data;
            $scope.listObjCode = rs;
        });
        dataserviceProject.getListCurrency(function (rs) {
            rs = rs.data;

            $scope.listCurrency = rs;
        });
    }
    $scope.initData();
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
        if (data.Total == null || data.Total == undefined) {
            $scope.errorTotal = true;
            mess.Status = true;
        } else {
            $scope.errorTotal = false;
        }

        return mess;
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        var check = CKEDITOR.instances['Note'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['Note'].getData();
            $scope.model.AetDescription = data;
        }
        dataserviceProject.getGenAETCode($scope.model.AetType, $scope.model.CatCode, function (rs) {
            rs = rs.data;
            $scope.model.ListFileAccEntry = $scope.listFundFile;
            $scope.model.ListFileAccEntryRemove = $scope.listFundFileRemove;
            $scope.model.AetCode = rs;
            validationSelect($scope.model);
            if ($scope.addformpayment.validate() && validationSelect($scope.model).Status == false) {
                dataserviceProject.insertPayment($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        //$uibModalInstance.close();
                        //Workflow
                        $scope.modelWf.ObjectInst = $scope.model.AetCode;
                        $scope.modelWf.WorkflowCode = $scope.model.WorkflowCat;
                        $scope.modelWf.ObjectName = $scope.model.Title;
                        dataserviceProject.createWfInstance($scope.modelWf, function (rs) {
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

        });
    };
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

        if (SelectType == "ObjType" && $scope.model.ObjType != "") {
            dataserviceProject.getObjCode(item.Code, function (rs) {
                rs = rs.data;
                $scope.listObjCode = rs;
            });
        }
        if (SelectType == "Total" && ($scope.model.Total == null || $scope.model.Total == undefined)) {
            $scope.errorTotal = true;
        } else {
            $scope.errorTotal = false;
        }
        if (SelectType == "Currency" && ($scope.model.Currency == null || $scope.model.Currency == undefined)) {
            $scope.errorCurrency = true;
        } else {
            $scope.errorCurrency = false;
        }
    }
    $scope.IsHide = false;
    //bảng file
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.changeAetRelative = function () {
        dataserviceProject.checkPlan($scope.model.AetRelative, function (rs) {
            rs = rs.data;
            $scope.isPlanRelative = rs.IsPlan;
            if ($scope.isPlanRelative) {
                $('#DeadLine').datepicker('setEndDate', new Date());
                $scope.model.DeadLine = "";
                $scope.model.AetType = rs.AetTye;
                $scope.IsHide = true;
                $scope.model.Currency = rs.Currency
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
    $scope.loadFileReq = function (event) {
        var files = event.target.files;
        var checkExits = $scope.listFundFile.filter(k => k.FileName === files[0].name);
        if (checkExits.length == 0) {
            var data = new FormData();
            data.append("FileUpload", files[0] != undefined ? files[0] : null);
            data.append("ProjectCode", $rootScope.ProjectCode);
            data.append("IsMore", false);
            dataserviceProject.insertFilePayment(data, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    $('#btn-upload-file').replaceWith($('#btn-upload-file').val('').clone(true));
                    App.toastrSuccess(result.Title);
                    $scope.listFundFile.push(result.Object);
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
app.controller('projectTabPaymentEdit', function ($scope, $rootScope, $uibModal, $uibModalInstance, dataserviceProject, para) {
    $scope.model = {
        ListFileAccEntry: [],
        ObjCode: $rootScope.ProjectCode,
        AetCode: '',
    }

    $scope.modelWf = {
        WorkflowCode: "THU_CHI",
        ObjectType: "FUND_ACC_ENTRY",
        ObjectInst: "",
    };
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
    $scope.IsShow = true;
    $scope.addObj = function () {
        if ($scope.IsPermission == false) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/add-object-relative.html',
                controller: 'add-object-relative',
                size: '50',
                resolve: {
                    AetCode: function () {
                        return $scope.model.AetCode;
                    }
                }

            });
            modalInstance.result.then(function (d) {
                $scope.initCardRelative(AetCode);
            }, function () {
            });
        }
    };
    $scope.disableAetRelative = false;
    $scope.changeAetRelative = function () {

        dataserviceProject.checkPlan($scope.model.AetRelative, function (rs) {
            rs = rs.data;

            $scope.isPlanRelative = rs.IsPlan;
            if ($scope.isPlanRelative) {
                $('#DeadLine').datepicker('setEndDate', new Date());
                $scope.model.DeadLine = "";
                $scope.model.AetType = rs.AetTye;
                $scope.hide = true;
                $scope.model.Currency = rs.Currency
            }

        });



    }
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
        if (SelectType == "ObjType" && $scope.model.ObjType != "") {
            dataserviceProject.getObjCode(item.Code, function (rs) {
                rs = rs.data;
                $scope.listObjCode = rs;
            });
        }
        if (SelectType == "Total" && ($scope.model.Total == null || $scope.model.Total == undefined)) {
            $scope.errorTotal = true;
        } else {
            $scope.errorTotal = false;
        }
    }
    $scope.openMap = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderProject + '/googleMap.html',
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
            templateUrl: ctxfolder + '/activity.html',
            controller: 'activity',
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
        if (data.Total == null || data.Total == undefined) {
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
            k
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
    $scope.loadFileReq = function (event) {
        var files = event.target.files;
        var checkExits = $scope.listFundFile.filter(k => k.FileName === files[0].name);
        if (checkExits.length == 0) {
            var data = new FormData();
            data.append("FileUpload", files[0] != undefined ? files[0] : null);
            data.append("ProjectCode", $rootScope.ProjectCode);
            data.append("IsMore", false);
            dataserviceProject.insertFilePayment(data, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    $('#btn-upload-file').replaceWith($('#btn-upload-file').val('').clone(true));
                    App.toastrSuccess(result.Title);
                    $scope.listFundFile.push(result.Object);
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
        dataserviceProject.getItemPayment(para, function (rs) {
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


                    if ((rs[0].Action == "APPROVED" || rs[0].Action == "REFUSE")) {
                        $scope.IsPermissionManager = true;

                    }
                    if ($scope.model.IsPlan == false && (rs[0].Action == "APPROVED" || rs[0].Action == "REFUSE")) {
                        $scope.IsPermission = true;
                    }
                    if ($scope.model.IsPlan == true && (rs[0].Action == "APPROVED" || rs[0].Action == "REFUSE")) {
                        $scope.IsPermission = false;
                    }
                } else {
                    if (rs[0].Action != null) {
                        $scope.IsPermissionManager = false;
                        $scope.IsPermission = true;
                    } else {
                        $scope.IsPermission = true;
                    }
                }


                dataserviceProject.getListFundFiles($scope.model.AetCode, function (rs) {
                    rs = rs.data;
                    $scope.listFundFile = rs;
                });
                dataserviceProject.getAetRelativeChil($scope.model.AetCode, function (rs) {
                    rs = rs.data;
                    var list = [];
                    for (var i = 0; i < rs.length; i++) {
                        list.push(rs[i].Total.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
                    }
                    $scope.totalChild = list.join(" - ");
                });

                if ($scope.model.ObjType != "") {
                    dataserviceProject.getObjCode($scope.model.ObjType, function (rs) {
                        rs = rs.data;
                        $scope.listObjCode = rs;
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

        dataserviceProject.getGetCatName(function (rs) {
            rs = rs.data;
            $rootScope.listCatName = rs;
        });

        dataserviceProject.getListTitle(function (rs) {
            rs = rs.data;
            $rootScope.listTitle = rs;
        });
        dataserviceProject.gettreedata({ IdI: null }, function (result) {
            result = result.data;
            $scope.treeData = result;
        });
        dataserviceProject.getObjDependency(function (rs) {
            rs = rs.data;
            $scope.listObjType = rs;
        });
        dataserviceProject.getObjCode("PROJECT", function (rs) {
            rs = rs.data;
            $scope.listObjCode = rs;
        });
        dataserviceProject.getListCurrency(function (rs) {
            rs = rs.data;

            $scope.listCurrency = rs;
        });
    }

    $scope.isTotal = false;
    $scope.openLog = function () {
        dataserviceProject.getUpdateLog($scope.model.AetCode, function (rs) {
            rs = rs.data;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/showLog.html',
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
            dataserviceProject.insertAccEntryTracking($scope.model.AetCode, $scope.model.Action, $scope.model.Note, $scope.model.AetRelative, function (rs) {
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
        if ($scope.editformpayment.validate() && validationSelect($scope.model).Status == false) {
            $scope.model.ListFileAccEntry = $scope.listFundFile;
            $scope.model.ListFileAccEntryRemove = $scope.listFundFileRemove;
            dataserviceProject.updatePayment($scope.model, function (rs) {
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
            dataserviceProject.getObjCode(item.Code, function (rs) {
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
});
app.controller('googleMap', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceProject, $filter, para) {
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

            dataserviceProject.getAddress(point.lat, point.lng, function (rs) {
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

app.controller('projectTabTeam', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter) {
    $scope.model = {
        TeamCode: ''
    }

    $scope.errorTeamCode = false;
    $scope.teams = [];
    $scope.AddTeams = [];
    $scope.initLoad = function () {
        dataserviceProject.getAllTeam(function (rs) {
            rs = rs.data;
            $scope.teams = rs;
        });
        dataserviceProject.getTeamInProject($rootScope.ProjectCode, function (rs) {
            rs = rs.data;
            $scope.AddTeams = rs;
        });
    }
    $scope.initLoad();

    $scope.add = function () {
        if (!$scope.changeSelect()) {
            var index = -1;
            for (indx = 0; indx < $scope.AddTeams.length; ++indx) {
                if ($scope.AddTeams[indx].TeamCode == $scope.model.TeamCode) {
                    index = indx;
                    break;
                }
            }
            if (index > -1) {
                App.toastrError(caption.PROJECT_MSG_TEAM_EXIST);
            }
            else {
                for (indx = 0; indx < $scope.teams.length; ++indx) {
                    if ($scope.teams[indx].TeamCode == $scope.model.TeamCode) {
                        var data = $scope.teams[indx];
                        data.ProjectCode = $rootScope.ProjectCode;
                        dataserviceProject.addTeam(data, function (rs) {
                            rs = rs.data;
                            if (rs.Error == false) {
                                $scope.AddTeams.push($scope.teams[indx]);
                            }
                            else {
                                App.toastrError(rs.Title);
                            }
                        });
                        break;
                    }
                }
            }
        }
    }
    $scope.changeSelect = function () {
        var error = false;

        if ($scope.model.TeamCode == '') {
            $scope.errorTeamCode = true;
            error = true;
        } else {
            $scope.errorTeamCode = false;
        }

        return error;
    }
    $scope.removeTeam = function (indx) {
        var data = {
            ProjectCode: $rootScope.ProjectCode,
            TeamCode: $scope.AddTeams[indx].TeamCode
        }
        dataserviceProject.deleteTeam(data, function (rs) {
            rs = rs.data;
            if (rs.Error == false) {
                $scope.AddTeams.splice(indx, 1);
            }
            else {
                App.toastrError(msg.Title);
            }
        });

    }
});

app.controller('projectTabCardJob', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter, $confirm) {
    var listObject = [];
    var obj = {
        Code: $rootScope.ProjectCode,
        Name: $rootScope.ProjectTitle
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
                d.TabBoard = 5;
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

app.controller('detail', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter, para) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withTitle('{{"PROJECT_LIST_COL_ORDER" | translate}}').notSortable().withOption('sWidth', '30px').withOption('sClass', 'tcenter w50').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ValueSet').withTitle('{{"PROJECT_LIST_COL_VALUE_SET" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeName').withTitle('{{"PROJECT_LIST_COL_TYPE_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"PROJECT_LIST_COL_CREATE_TIME" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{"PROJECT_LIST_COL_CREATE_BY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"PROJECT_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button title="{{&quot;PROJECT_SRIP_COL_LIST_DELETE&quot; | translate}}" ng-click="delete(' + full.SettingID + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
        dataserviceProject.getDataType(function (rs) {
            rs = rs.data;
            $scope.listDataType = rs;
        });
    }
    $scope.init();
    $scope.add = function () {
        if ($scope.model.ValueSet == '') {
            App.toastrError(caption.PROJECT_CURD_MSG_SETTING_NOT_BLANK);
        } else if ($scope.model.ValueSet.length > 255) {
            App.toastrError("Vui lòng nhập giá trị cài đặt nhỏ hơn 255 ký tự");
        } else {
            dataserviceProject.insertCommonSetting($scope.model, function (rs) {
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
            App.toastrError(caption.PROJECT_CURD_MSG_DATA_NOT_BLANK)
        } else if ($scope.model.ValueSet.length > 255) {
            App.toastrError("Vui lòng nhập giá trị cài đặt nhỏ hơn 255 ký tự");
        } else {
            dataserviceProject.updateCommonSetting($scope.model, function (rs) {
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
                    dataserviceProject.deleteCommonSetting(id, function (rs) {
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

app.controller('add_group_or_team', function ($scope, $rootScope, $cookies, $compile, $uibModal, $filter, dataserviceProject) {
    $scope.model = {};
    var id = -1;
    var obj = {
        CardCode: 975,
        Type: 1
    };

    $scope.cardMember = {
        listObj: [],
        listMember: []
    };
    $scope.listTeamAndGroupUser = [];
    $scope.listDeleteObj = [];
    $scope.listDeleteMember = [];
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.initData = function () {
        dataserviceProject.getTeamAndGroupUserAssign(obj.CardCode, function (rs) {
            rs = rs.data;
            $scope.cardMember.listObj = rs;
        });
        dataserviceProject.getMemberAssign(obj.CardCode, function (rs) {
            rs = rs.data;
            $scope.cardMember.listMember = rs;
        });
        dataserviceProject.getListTeams(function (team) {
            dataserviceProject.getGroupUser(function (groupUser) {
                var all = {
                    Code: 'All',
                    Name: 'Tất cả người dùng',
                    Type: 3,
                    Group: 'Người dùng'
                }
                $scope.listTeamAndGroupUser.push(all);
                var listTeamAndGroupUser = obj.Type == 1 ? team.concat(groupUser) : groupUser.concat(team);
                for (var i = 0; i < listTeamAndGroupUser.length; i++) {
                    $scope.listTeamAndGroupUser.push(listTeamAndGroupUser[i]);
                }
            })
        });
        dataserviceProject.getActivityAssign(obj.CardCode, function (rs) {
            rs = rs.data;
            $scope.ActivityData = rs;
        });
    };
    $scope.initData();

    $scope.teamOrGroupSelect = function (obj) {
        if (obj.Type == 1) {
            dataserviceProject.getMemberInTeam(obj.Code, function (rs) {
                rs = rs.data;
                $scope.listUser = rs;
            });
        } else if (obj.Type == 2) {
            dataserviceProject.getListUserInGroupUser(obj.Code, function (rs) {
                rs = rs.data;
                $scope.listUser = rs;
            });
        } else {
            dataserviceProject.getListUser(function (rs) {
                rs = rs.data;
                $scope.listUser = rs;
            });
        }
        $scope.isCheckAll = false;
        ////check Exist
        //for (var i = 0; i < $scope.cardMember.listTeam.length; i++) {
        //    if ($scope.cardMember.listTeam[i].TeamCode === item.TeamCode) {
        //        App.toastrError(caption.CJ_CURD_MSG_TEAM_EXITED);//Team đã tồn tại!
        //        return;
        //    }
        //}

        //check exist user in team
        //var listMemberInTeam = item.Members.split(',');
        //for (var i = 0; i < listMemberInTeam.length; i++) {
        //    for (var j = 0; j < $scope.cardMember.listMember.length; j++) {
        //        if ($scope.cardMember.listMember[j].UserId == listMemberInTeam[i]) {
        //            $scope.cardMember.listMember.splice(j, 1);
        //            break;
        //        }
        //    }
        //}
        //var obj = {
        //    Id: id--,
        //    TeamCode: item.Code,
        //    TeamName: item.Name,
        //    //Members: item.Members,
        //    CreatedTime: $filter('date')(new Date(), 'dd/MM/yyyy hh:mm:ss'),
        //}
        //$scope.cardMember.listTeam.push(obj);

        ////remove member in list
        //for (var i = 0; i < $scope.listTeam.length; i++) {
        //    if ($scope.listTeam[i].TeamCode === item.TeamCode) {
        //        $scope.listTeam.splice(i, 1);
        //        break;
        //    }
        //}
    };

    $scope.teamOrGroupSelectAll = function (isCheck, obj) {
        if (isCheck) {
            if (obj.Type == 1 || obj.Type == 2) {
                var checkExist = $scope.cardMember.listObj.filter(function (objObject, index) { return objObject.Code == obj.Code; });
                if (checkExist.length != 0) {
                    App.toastrError(checkExist[0].Name + caption.PROJECT_MSG_ASSIGNED_WORK);
                    return;
                }
                var item = {
                    Id: id--,
                    Code: obj.Code,
                    Name: obj.Name,
                    Type: obj.Type,
                    CreatedTime: $filter('date')(new Date(), 'dd/MM/yyyy hh:mm:ss'),
                }
                $scope.cardMember.listObj.push(item);
                if (obj.Type == 1) {
                    App.toastrSuccess(caption.PROJECT_MSG_ADD_GROUP_SUCCESS);
                } else {
                    App.toastrSuccess(caption.PROJECT_MSG_ADD_DEPART_SUCCESS);
                }
            } else {
                for (var i = 0; i < $scope.listUser.length; i++) {
                    //add member
                    var obj = {
                        Id: id--,
                        UserId: $scope.listUser[i].UserId,
                        GivenName: $scope.listUser[i].GivenName,
                        CreatedTime: $filter('date')(new Date(), 'dd/MM/yyyy hh:mm:ss'),
                    }
                    $scope.cardMember.listMember.push(obj);
                }
                App.toastrSuccess(caption.PROJECT_MSG_ADD_EMP_SUCCESS);
            }
        } else {

        }

        //check exist user in team
        //var listMemberInTeam = item.Members.split(',');



        ////remove member in list
        //for (var i = 0; i < $scope.listTeam.length; i++) {
        //    if ($scope.listTeam[i].TeamCode === item.TeamCode) {
        //        $scope.listTeam.splice(i, 1);
        //        break;
        //    }
        //}
    };
    $scope.memberSelect = function (item) {
        //check Exist member
        for (var i = 0; i < $scope.cardMember.listMember.length; i++) {
            if ($scope.cardMember.listMember[i].UserId === item.UserId) {
                App.toastrError(caption.PROJECT_MSG_MEMBER_ASSIGNED);//Thành viên đã tồn tại!
                return;
            }
        }

        ////check member exist in team
        //for (var i = 0; i < $scope.cardMember.listTeam.length; i++) {
        //    var listMember = $scope.cardMember.listTeam[i].Members.split(',');
        //    var checkExistUser = listMember.find(function (element) {
        //        if (element == item.UserId) return true;
        //    });
        //    if (checkExistUser) {
        //        App.toastrError("Thành viên đã giao trong nhóm");
        //        return;
        //    }
        //}
        //add member
        var obj = {
            Id: id--,
            UserId: item.UserId,
            GivenName: item.GivenName,
            CreatedTime: $filter('date')(new Date(), 'dd/MM/yyyy hh:mm:ss'),
        }
        $scope.cardMember.listMember.push(obj);
        for (var i = 0; i < $scope.listUser.length; i++) {
            if ($scope.listUser[i].UserId == item.UserId) {
                $scope.listUser.splice(i, 1);
                break;
            }
        }
    };
    $scope.removeMember = function (userId, id) {
        for (var i = 0; i < $scope.cardMember.listMember.length; i++) {
            if ($scope.cardMember.listMember[i].UserId == userId) {
                $scope.cardMember.listMember.splice(i, 1);
                if (id > 0) {
                    $scope.listDeleteMember.push(id);
                }
                break;
            }
        }
    };
    $scope.removeObj = function (code, id) {
        for (var i = 0; i < $scope.cardMember.listObj.length; i++) {
            if ($scope.cardMember.listObj[i].Code == code) {
                $scope.cardMember.listObj.splice(i, 1);
                $scope.isCheckAll = false;
                if (id > 0) {
                    $scope.listDeleteObj.push(id);
                }
                break;
            }
        }
    }

    $scope.submit = function () {
        var data = { cardcode: obj.CardCode, listObj: $scope.cardMember.listObj, listDeletedObj: $scope.listDeleteObj, listmember: $scope.cardMember.listMember, listDeleteMember: $scope.listDeleteMember };
        console.log(data);
        dataserviceProject.assignGroupOrTeam(data, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.cancel();
            }
        });
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('googleMapCustomer', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceProject, $filter, para) {
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
        var center = ol.proj.transform([$rootScope.lngCustomerDefault, $rootScope.latCustomerDefault], 'EPSG:4326', 'EPSG:3857');
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
    function initData() {
        //init
        if (para) {
            lat = para.lt != '' ? para.lt : $rootScope.latCustomerDefault;
            lng = para.lg != '' ? para.lg : $rootScope.lngCustomerDefault;
            address = para.lg != '' ? para.address : $rootScope.addressCustomerDefault;
            document.getElementById("startPlace").value = address;
        } else {
            lat = $rootScope.latCustomerDefault;
            lng = $rootScope.lngCustomerDefault;
            address = $rootScope.addressCustomerDefault;
            document.getElementById("startPlace").value = $rootScope.addressCustomerDefault;
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

            dataserviceProject.getAddress(point.lat, point.lng, function (rs) {
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
    setTimeout(function () {
        initData();
        setHeightMap();
        setModalDraggable('.modal-dialog');
    }, 200)
});


app.controller('addImpProduct', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceProject, $filter, para) {
    $scope.model = {
        CusCode: '',
        SupCode: '',
        PoCode: '',
        ReqCode: '',
        ProjectCode: '',
        ListProductDetail: []
    }
    //
    $scope.isTex = false;
    $rootScope.PoSupCode = '';
    $rootScope.listProducts = [];
    $scope.IsDisablePoCode = true;
    $rootScope.isShowHeader = true;
    $scope.isShowDetailProject = false;
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
        dataserviceProject.getImpStatus(function (rs) {
            rs = rs.data;
            $scope.status = rs;
            $scope.model.Status = $scope.status[0].Code;
        });

        dataserviceProject.getListPoProduct('', function (result) {
            result = result.data;
            $scope.ListPoCus = result;
        });
        dataserviceProject.genReqCode(function (result) {
            result = result.data;
            $scope.model.ReqCode = result;
            $rootScope.ReqCode = result;
        });
        dataserviceProject.genTitle(para, function (result) {
            result = result.data;
            $scope.model.Title = result;
        });
        var today = new Date(new Date());
        $scope.model.sCreatedTime = $filter('date')(new Date(today), 'dd/MM/yyyy hh:mm:ss');
        $rootScope.CreatedTime = $scope.model.sCreatedTime;
        $scope.model.ProjectCode = para;

        $scope.model.CusCode = $rootScope.CustomerCode;

        if ($scope.model.CusCode != '' || $scope.model.CusCode != null)
            $scope.changeCustomer();

        //dataserviceProject.getContractFromProject($scope.model.ProjectCode, function (result) {result=result.data;
        //    $scope.model.PoCode = result;
        //});
        dataserviceProject.getListProduct($scope.model.ProjectCode, function (result) {
            result = result.data;
            $rootScope.listProducts = result;
        });
        dataserviceProject.getListSupplier(function (result) {
            result = result.data;
            $scope.suppliers = result;
        });
    }
    initData();

    $scope.chkContract = function () {
        if ($rootScope.ContractCode == '') {
            App.toastrError(caption.PROJECT_MSG_CREATE_CONTRACT_FIRST);//Vui lòng tạo trước hợp đồng!
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
            dataserviceProject.getListProduct($scope.model.PoCode, function (result) {
                result = result.data;
                $rootScope.listProducts = result;
            });
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        //if (data.PoCode == "" || data.PoCode == null) {
        //    $scope.errorPoCode = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorPoCode = false;
        //}
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
                    $scope.message = caption.PROJECT_MSG_ADD_RQ_IMP_PORD
                    $scope.ok = function () {
                        dataserviceProject.insertImpProduct(para, function (result) {
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

    $rootScope.amountbudget = function (objInput) {
        $scope.model.Budget = objInput.Budget;
        $scope.modelView.BudgetTotalDetail = objInput.RealBudget;
        $scope.modelView.TaxTotalDetail = objInput.TaxDetail;
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
            $rootScope.isShowHeader = true
            $scope.isShowDetailProject = false;
        }
        else {
            $rootScope.isShowHeader = false
            $scope.isShowDetailProject = true;

            setTimeout(function () {
                $rootScope.loadDateJTable();
            }, 200);
        }
    }
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
            dataserviceProject.getImpStatus(function (rs) {
                rs = rs.data;
                $rootScope.status = rs;
            });
        }, function () { });
    }
});
app.controller('addProduct_old', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter) {
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
            dataserviceProject.insertDetail($scope.model, function (rs) {
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
                $scope.isDisableForm(); Project
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
    $scope.save = function () {
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

            dataserviceProject.updateDetail($scope.model, function (rs) {
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
                App.toastrError(caption.PROJECT_MSG_SELECT_SUPP_FOR_PROD);
                return;
            } else {
                if ($scope.errorRateConversion && $scope.errorRateLoss) {
                    App.toastrError(caption.PROJECT_MSG_RATE);
                    return;
                } else if ($scope.errorRateConversion) {
                    App.toastrError(caption.PROJECT_MSG_RATE_TRANSFER);
                    return;
                } else if ($scope.errorRateLoss) {
                    App.toastrError(caption.PROJECT_MSG_RATE_LOST);
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
                    dataserviceProject.deleteDetail(id, function (result) {
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
                App.toastrWarning(caption.PROJECT_MSG_SERVICE_NO_CONDITION);
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
        dataserviceProject.getListCurrency(function (rs) {
            rs = rs.data;
            $scope.currencys = rs;
        });
        dataserviceProject.getListUnit(function (rs) {
            rs = rs.data;
            $scope.units = rs;
        });
        dataserviceProject.getListSupplier(function (result) {
            result = result.data;
            $scope.suppliers = result;
        });
        dataserviceProject.getListProject(function (rs) {
            rs = rs.data;
            $scope.ListProjectCode = rs;
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
                    App.toastrWarning(caption.PROJECT_MSG_NO_FILTER_COST);
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
    $scope.selectProject = function () {
        $scope.listProduct = [];
        dataserviceProject.getListProduct($scope.model.ProjectCode, function (rs) {
            rs = rs.data;
            $scope.listProduct = rs;
        });
    }
    var id = -1;
    $scope.addProduct = function () {
        var isProduct = false;
        if ($scope.model.ProductCode != "") {

            var obj = {
                Id: id--,
                ProductCode: $scope.model.ProductCode,
                ProductName: $scope.model.ProductName,
            }
            for (var i = 0; i < $rootScope.listProducts.length; i++) {
                if ($rootScope.listProducts[i].ProductCode == obj.ProductCode) {
                    App.toastrError(caption.PROJECT_MSG_PROD_IN_PRO);
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
        } else {
            App.toastrError(caption.PROJECT_MSG_VALIDATE_CHOSE_PRODUCT);
        }

    }
    $scope.removeProduct = function (item) {
        for (var i = 0; i < $rootScope.listProducts.length; i++) {
            if ($rootScope.listProducts[i].ProductCode == item.ProductCode) {
                $rootScope.listProducts.splice(i, 1);
                App.toastrSuccess(caption.PROJECT_MSG_DEL_PROD_SUCCESS);
                var objDel = {
                    Id: id--,
                    ProductCode: item.ProductCode,
                    ProductName: item.ProductName,
                }
                $scope.model.ListDelProduct.push(objDel);
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
        if (SelectType == "ProductCode" && $scope.model.ProductCode != "") {
            if (SelectType == "ProductCode") {
                $scope.model.Unit = item.Unit;
                if (item.Unit != '')
                    $scope.errorUnit = false;
                $scope.model.UnitName = item.UnitName;
                $scope.model.ProductName = item.ProductName;
                $scope.model.ProductType = item.ProductType;
                $scope.model.ProductTypeName = item.ProductTypeName;
                $scope.model.Catalogue = item.Catalogue;
            }
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
app.controller('addProduct', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter) {
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
            dataserviceProject.insertDetail($scope.model, function (rs) {
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
            dataserviceProject.updateDetail(model, function (rs) {
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
                    dataserviceProject.deleteDetail(id, function (result) {
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
        dataserviceProject.getListProductWithContractBuyer(item.Code, function (rs) {
            rs = rs.data;
            $scope.listProduct = rs;
            $scope.listProductDetail = item.listProductDetail;
        })
        $scope.model.ProjectCode = '';
    }
    $scope.selectProject = function (item) {
        dataserviceProject.getListProductWithProject(item.Code, function (rs) {
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
        if ($scope.model.ProductCode != "" && $scope.model.ProductCode != null && $scope.model.ProductCode != undefined) {
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
        } else {
            App.toastrError(caption.PROJECT_MSG_VALIDATE_CHOSE_PRODUCT);
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
        dataserviceProject.getListCurrency(function (rs) {
            rs = rs.data;
            $scope.currencys = rs;
        });
        dataserviceProject.getListUnit(function (rs) {
            rs = rs.data;
            $scope.units = rs;
        });
        dataserviceProject.getListSupplier(function (result) {
            result = result.data;
            $scope.suppliers = result;
        });
        dataserviceProject.getListPoProduct('', function (result) {
            result = result.data;
            $scope.ListPoCus = result;
        });
        dataserviceProject.getListProjectCode(function (result) {
            result = result.data;
            $scope.ListProjectCode = result;
        });
        dataserviceProject.getListAllProduct(function (result) {
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

app.controller('projectTabRequestAskPrice', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        //CustomerCode: '',
        Title: '',
        ContractCode: ''
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Project/JTableContract/",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProjectCode = $rootScope.ProjectCode;
                d.ContractCode = $scope.model.ContractCode;
                d.ContractNo = $scope.model.ContractNo;
                d.Title = $scope.model.Title;
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
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).find('input'))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        })
    //.withOption('footerCallback', function (tfoot, data) {
    //    if (data.length > 0) {
    //        $scope.$apply(function () {
    //            $scope.totalBudgets = 0;
    //            $scope.currency = data[0].currency;
    //            $scope.totalBudgets = parseFloat(data[0].totalContract);
    //        });
    //    }
    //});
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('code').withTitle('{{ "PROJECT_CURD_TAB_CONTRACT_LIST_COL_CONTRACTCODE" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('no').withTitle('{{ "PROJECT_LIST_COL_NUM_CONTRACT" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('cusName').withTitle('{{ "PROJECT_LIST_COL_CUS" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('title').withTitle('{{ "PROJECT_CURD_TAB_CONTRACT_LIST_COL_TITLE" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('effectiveDate').withTitle('{{"PROJECT_LIST_COL_DATE_EFFECT" | translate}}').renderWith(function (data, type) {
        return data != null && data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('budgetExcludeTax').withTitle('{{ "PROJECT_CURD_TAB_CONTRACT_LIST_COL_BUDGET" | translate }}').renderWith(function (data, type) {
        return data != "" ? "<span class='text-danger'>" + $filter('currency')(data, '', 0) + "</span>" : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('currency').withTitle('{{ "PROJECT_CURD_TAB_CONTRACT_LIST_COL_CURRENCY" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('budget').withTitle('{{"PROJECT_LIST_COL_TRANSFER_VND" | translate}}').renderWith(function (data, type) {
        return data != "" ? "<span class='text-danger'>" + $filter('currency')(data, '', 0) + "</span>" : null;
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
    $scope.search = function () {
        reloadData(true);
    }
    //$scope.initLoad = function () {
    //    var userModel = {};
    //    var listdata = $('#tblDataIndex').DataTable().data();
    //    for (var i = 0; i < listdata.length; i++) {
    //        if (listdata[i].id == $rootScope.Object.SupplierId) {
    //            userModel = listdata[i];
    //            break;
    //        }
    //    }
    //    $scope.model.CustomerCode = userModel.cusCode;
    //}
    //$scope.initLoad();
});

app.controller('contract', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        //CustomerCode: '',
        Title: '',
        ContractCode: ''
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Project/JTableContract/",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProjectCode = $rootScope.ProjectCode;
                d.ContractCode = $scope.model.ContractCode;
                d.ContractNo = $scope.model.ContractNo;
                d.Title = $scope.model.Title;
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
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).find('input'))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        })
    //.withOption('footerCallback', function (tfoot, data) {
    //    if (data.length > 0) {
    //        $scope.$apply(function () {
    //            $scope.totalBudgets = 0;
    //            $scope.currency = data[0].currency;
    //            $scope.totalBudgets = parseFloat(data[0].totalContract);
    //        });
    //    }
    //});
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('code').withTitle('{{ "PROJECT_CURD_TAB_CONTRACT_LIST_COL_CONTRACTCODE" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('no').withTitle('{{ "PROJECT_LIST_COL_NUM_CONTRACT" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('cusName').withTitle('{{ "PROJECT_LIST_COL_CUS" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('title').withTitle('{{ "PROJECT_CURD_TAB_CONTRACT_LIST_COL_TITLE" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('effectiveDate').withTitle('{{"PROJECT_LIST_COL_DATE_EFFECT" | translate}}').renderWith(function (data, type) {
        return data != null && data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('budgetExcludeTax').withTitle('{{ "PROJECT_CURD_TAB_CONTRACT_LIST_COL_BUDGET" | translate }}').renderWith(function (data, type) {
        return data != "" ? "<span class='text-danger'>" + $filter('currency')(data, '', 0) + "</span>" : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('currency').withTitle('{{ "PROJECT_CURD_TAB_CONTRACT_LIST_COL_CURRENCY" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('budget').withTitle('{{"PROJECT_LIST_COL_TRANSFER_VND" | translate}}').renderWith(function (data, type) {
        return data != "" ? "<span class='text-danger'>" + $filter('currency')(data, '', 0) + "</span>" : null;
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
    $scope.search = function () {
        reloadData(true);
    }
    //$scope.initLoad = function () {
    //    var userModel = {};
    //    var listdata = $('#tblDataIndex').DataTable().data();
    //    for (var i = 0; i < listdata.length; i++) {
    //        if (listdata[i].id == $rootScope.Object.SupplierId) {
    //            userModel = listdata[i];
    //            break;
    //        }
    //    }
    //    $scope.model.CustomerCode = userModel.cusCode;
    //}
    //$scope.initLoad();
});

app.controller('projectTabRequestImportProduct', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter) {
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
            url: "/Admin/Project/JtableRequestImportProduct",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProjectCode = $rootScope.ProjectCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataProjectRQImportProduct");
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
                        $('#tblDataProjectRQImportProduct').DataTable().$('tr.selected').removeClass('selected');
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('ObjCode').withTitle('{{"PROJECT_LIST_COL_RQ_CODE" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"PROJECT_CURD_TAB_CONTRACT_LIST_COL_TITLE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CusName').withTitle('{{"PROJECT_LIST_COL_CUS_BUILD" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{"PROJECT_LIST_COL_SENDER" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"PROJECT_LIST_COL_CREATE_TIME" | translate}}').renderWith(function (data, type) {
        return data != null ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Action').withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').renderWith(function (data, type, full) {
        return '<a title="{{&quot;PROJECT_SRIP_COL_LIST_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash  fs25"></i></a>';
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
        dataserviceProject.getRqImpProduct(function (rs) {
            rs = rs.data;
            $scope.listRqImpProduct = rs;
        })
        dataserviceProject.getObjectRelative(function (rs) {
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
            $scope.model.ObjRootCode = $rootScope.ProjectCode;
            dataserviceProject.insertRequestImportProduct($scope.model, function (rs) {
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
            $scope.model.ObjRootCode = $rootScope.ProjectCode;
            dataserviceProject.updateRequestImportProduct($scope.model, function (rs) {
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
        dataserviceProject.deleteRequestImportProduct(id, function (rs) {
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

app.controller('projectTabContractPo', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter) {
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
            url: "/Admin/Project/JtableContractPoBuyer",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProjectCode = $rootScope.ProjectCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataProjectContractPo");
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
                        $('#tblDataProjectContractPo').DataTable().$('tr.selected').removeClass('selected');
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
    //end option table
    //Tạo các cột của bảng để đổ dữ liệu vào
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().withOption('sClass', 'hidden').renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ObjCode').withTitle('{{"PROJECT_MSG_LIST_COL_TICKETCODE" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Type').withTitle('{{"PROJECT_LIST_COL_TYPE" | translate}}').renderWith(function (data, type) {
        if (data == "STORAGE") {
            return "Lưu kho";
        } else {
            return "Đơn hàng theo khách hàng";
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('OrderBy').withTitle('{{"PROJECT_LIST_COL_CUS_RQ_PROD" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Consigner').withTitle('{{"PROJECT_LIST_COL_SENDER" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SupName').withTitle('{{"PROJECT_LIST_COL_SUPP" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"PROJECT_LIST_COL_CREATE_TIME" | translate}}').renderWith(function (data, type) {
        return data != null ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Action').withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').renderWith(function (data, type, full) {
        return '<a title="{{&quot;PROJECT_SRIP_COL_LIST_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash  fs25"></i></a>';
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
        dataserviceProject.getContractPoBuyer(function (rs) {
            rs = rs.data;
            $scope.listContractBuy = rs;
        })
        dataserviceProject.getObjectRelative(function (rs) {
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
            $scope.model.ObjRootCode = $rootScope.ProjectCode;
            dataserviceProject.insertContractPoBuyer($scope.model, function (rs) {
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
            $scope.model.ObjRootCode = $rootScope.ProjectCode;
            dataserviceProject.updateContractPoBuyer($scope.model, function (rs) {
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
        dataserviceProject.deleteContractPoBuyer(id, function (rs) {
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

app.controller('projectTabContractSale', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceProject, $filter) {
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
            url: "/Admin/Project/JtableContractSale",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProjectCode = $rootScope.ProjectCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataProjectContractSale");
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
                        $('#tblDataProjectContractSale').DataTable().$('tr.selected').removeClass('selected');
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
    //end option table
    //Tạo các cột của bảng để đổ dữ liệu vào
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().withOption('sClass', 'hidden').renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CusName').withTitle('{{"PROJECT_CURD_TAB_CUSTOMER_LIST_COL_CUSNAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ContractNo').withTitle('{{"PROJECT_LIST_COL_NUM_CONTRACT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EndDate').withTitle('{{"PROJECT_LIST_COL_CONTRACT_DEADLINE" | translate}}').renderWith(function (data, type) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"PROJECT_LIST_COL_CONTENT_CONTRACT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BudgetExcludeTax').withTitle('{{"PROJECT_LIST_COL_VALUE" | translate}}').renderWith(function (data, type) {
        var exTax = data != "" ? $filter('currency')(data, '', 0) : null;
        return '<span class="text-danger bold">' + exTax + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BudgetExcludeTax').withTitle('{{"PROJECT_LIST_COL_TRANSFER_VND" | translate}}').renderWith(function (data, type, full) {
        if (data != "" && full.ExchangeRate != "") {
            var rs = data * full.ExchangeRate;
            var tax = data != "" && full.ExchangeRate != "" ? $filter('currency')(rs, '', 0) : null;
            return '<span class="text-danger bold">' + tax + '</span>';
        }
        else {
            return null;
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Action').withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').renderWith(function (data, type, full) {
        return '<a title="{{&quot;PROJECT_SRIP_COL_LIST_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash  fs25"></i></a>';
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
        dataserviceProject.getContractSale(function (rs) {
            rs = rs.data;
            $scope.listContractSale = rs;
        })
        dataserviceProject.getObjectRelative(function (rs) {
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
            $scope.model.ObjRootCode = $rootScope.ProjectCode;
            dataserviceProject.insertContractSale($scope.model, function (rs) {
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
            $scope.model.ObjRootCode = $rootScope.ProjectCode;
            dataserviceProject.updateContractSale($scope.model, function (rs) {
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
        dataserviceProject.deleteContractSale(id, function (rs) {
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
app.controller('schedule-project', function ($scope, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModal, $uibModalInstance, $filter, dataserviceProject) {
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
                var month = $('#calendarContractProject').fullCalendar('getDate').format('MM');
                var year = $('#calendarContractProject').fullCalendar('getDate').format('YYYY');
                dataserviceProject.scheduleContractProject(month, year, function (rs) {
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

                        event.push(expried);
                        event.push(nextPay);
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
                    templateUrl: ctxfolderProject + '/view-calendar.html',
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
        loadCalendar("calendarContractProject");
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
app.controller('grid-view-calendar', function ($scope, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModal, $uibModalInstance, $filter, dataserviceProject, para) {
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
            url: "/Admin/Project/JTableCalendar",
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
        .withOption('order', [8, 'asc'])
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
                        $('#tblDataProjectCalendar').DataTable().$('tr.selected').removeClass('selected');
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Code').withTitle('{{ "PROJECT_LIST_COL_PROJECT_CODE_PROJECT" | translate }}').renderWith(function (data, type, full) {
        if (full.SetPriority == '1') {
            return '<span> ' + data + '</span>&nbsp;&nbsp;' +
                '<span class="pt5"><span class="badge-customer badge-customer-danger  fs9">&nbsp;Cao</span></span>';
        } else if (full.SetPriority == '2') {
            return '<span> ' + data + '</span>&nbsp;&nbsp;' +
                '<span class="pt5"><span class="badge-customer badge-customer-warning">&nbsp;Trung bình</span></span>';
        } else if (full.SetPriority == '3') {
            return '<span> ' + data + '</span>&nbsp;&nbsp;' +
                '<span class="pt5"><span class="badge-customer badge-customer-success">&nbsp;Thấp</span></span>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('{{ "PROJECT_LIST_COL_PROJECT_NAME_PROJECT" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Budget').withTitle('{{ "PROJECT_LIST_COL_PROJECT_BUDGET" | translate }}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
        var budget = data != "" ? $filter('currency')(data, '', 0) : null;
        return '<span class="text-danger bold">' + budget + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Currency').withTitle('{{ "PROJECT_LIST_COL_PROJECT_CURRENCY" | translate }}').withOption('sClass', 'w50').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Progress').withTitle('{{ "PROJECT_LIST_COL_PROGRESS" | translate }}').withOption('sClass', 'w50').renderWith(function (data, type, full) {
        return '<span class="pt5"><span role="button" ng-click=progress(\'' + full.Code + '\')>&nbsp;' + data + '</span></span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StartTime').withTitle('{{ "PROJECT_LIST_COL_PROJECT_STARTTIME" | translate }}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
        var date = $filter('date')(new Date(data), 'MM/dd/yyyy');
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EndTime').withTitle('{{ "PROJECT_LIST_COL_PROJECT_ENDTIME" | translate }}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SetPriority').withTitle('PROJECT_LIST_COL_PRIORITY').withOption('sClass', 'hidden').renderWith(function (data, type) {
        if (data == '1') {
            return '<span class="badge-customer badge-customer-success fs9">&nbsp;Thấp</span>';
        } else if (data == '2') {
            return '<span class="badge-customer badge-customer-warning">&nbsp;Trung bình</span>';
        } else if (data == '3') {
            return '<span class="badge-customer badge-customer-danger">&nbsp;Cao</span>';
        }
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{ "PROJECT_CURD_COMBO_PROJECT_STATUS" | translate }}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
        return data;
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
app.controller('projectTabCard', function ($scope, $rootScope, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $compile, dataserviceProject, $filter, $location) {
    // init function to populate data to controller
    $scope.initData = function () {
        dataserviceProject.getListItemPlan(function (rs) {
            rs = rs.data;
            $scope.listItemPlan = rs;
        });
        dataserviceProject.getListUnitTime(function (rs) {
            rs = rs.data;
            $scope.listUnit = rs;
        });
    }
    $scope.initData();

    // lưới 
    $scope.model = {
        ProjectCode: '',
        ItemName: '',
        ItemLevel: '',
        ItemWeight: '',
        ItemParent: '',
        DurationTime: '',
        DurationUnit: '',
        Cost: '',
        CostUnit: '',
    }

    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Project/JTableProjectCard",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProjectCode = $rootScope.ProjectCode;
                // d.ItemName = $scope.model.ItemName;
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

            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {

                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ItemName').withTitle('{{"PROJECT_ITEMS_NAME" | translate}}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type, full) { // 
        return '<span ng-if="' + full.ItemLevel + '=== 0">' + data + '</span>' + '<span ng-if="' + full.ItemLevel + ' === 1" ><i class="fas fa-arrow-right"></i>' + '  ' + data + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ItemCode').withTitle('{{"PROJECT_CARD_JOB" | translate}}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type, full) { // 
        return '<a ng-click="addCardJob(' + full.ItemCode + ')" style = "width: 25px; height: 25px; padding-right: 10px" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-list fs25 color-cf-blue pr-2"></i></a>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DurationTime').withTitle('{{"PROJECT_LBL_DURATIONTIME" | translate}}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type, full) { // 
        return '<span>' + full.DurationTime + '</span>' + ' ' + full.DurationUnit;;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Cost').withTitle('{{"PROJECT_CURD_LBL_PROJECT_PRJ_BUDGET" | translate}}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type, full) { // '{{"PROJECT_ACTION" | translate}}'
        var cost = data != "" ? $filter('currency')(data, '', 0) : null;
        return '<span class="text-danger bold">' + cost + '</span>' + ' ' + full.CostUnit;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ItemWeight').withTitle('{{"PROJECT_LBL_WEIGHT" | translate}}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) { //
        return data + '<span>  %</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProjectCode').notSortable().withOption('sClass', 'w25').withTitle('{{"PROJECT_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<a title="Xoá" ng-click="delete(' + full.Id + ')" style = "width: 25px; height: 25px; padding-right: 5px" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash fs25"></i></a>';
    }));

    vm.reloadData = reloadData;
    vm.dtInstance = {};

    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
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
    $scope.search = function () {
        reloadData(true);
    }
    $scope.reload = function () {
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
    // endluoi
    // ham add
    $scope.addCheckList = function () {
        $scope.model.ProjectCode = $rootScope.ProjectCode;
        console.log($scope.model.ProjectCode);
        validationSelect($scope.model);
        if ($scope.tabcardform.validate() && !validationSelect($scope.model).Status) {
            dataserviceProject.addProjectCard($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $scope.id = rs.Object;
                    //  $uibModalInstance.close();
                }
                reloadData(true);
            });
            //  $scope.model = '';
        }
    }
    // validate model (show error when user do not enter specific value)
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null ItemName
        if (data.ItemName == "" || data.ItemName == null) {
            $scope.errorItemName = true;
            mess.Status = true;
        } else {
            $scope.errorItemName = false;
        }
        // Check null errorDurationTime
        if (data.DurationTime == "" || data.DurationTime == null) {
            $scope.errorDurationTime = true;
            mess.Status = true;
        } else {
            $scope.errorDurationTime = false;
        }
        //Check null errorCost
        if (data.Cost == "" || data.Cost == null) {
            $scope.errorCost = true;
            mess.Status = true;
        } else {
            $scope.errorCost = false;
        }
        // Check null currency
        if (data.DurationUnit == "" || data.DurationUnit == null) {
            $scope.errorCurrency = true;
            mess.Status = true;
        } else {
            $scope.errorCurrency = false;
        }
        if (data.CostUnit == "" || data.CostUnit == null) {
            $scope.errorCurrency = true;
            mess.Status = true;
        } else {
            $scope.errorCurrency = false;
        }
        if (data.ItemWeight == "" || data.ItemWeight == null) {
            $scope.errorItemWeight = true;
            mess.Status = true;
        } else {
            $scope.errorItemWeight = false;
        }
        return mess;
    };
    // end add
    // ham delete
    $scope.delete = function (id) {
        console.log("Ok");
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceProject.deleteProjectCard(id, function (rs) {
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
            reloadData(true);
        }, function () {
        });
    }

    $scope.addCardJob = function (ItemCode) {
        console.log("Ok");
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderProject + '/projectAddCardjob.html',
            controller: 'projectAddCardjob',
            backdrop: 'static',
            size: '50',
            resolve: {
                para: function () {
                    return ItemCode;
                }
            }
        });
        modalInstance.result.then(function (d) {
            reloadData(true);
        },
            function () {
            });
    }

    // end delete
    setTimeout(function () {
        setModalDraggable(".modal-dialog");
    }, 200);
});
app.controller('projectAddCardjob', function ($scope, $rootScope, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $compile, dataserviceProject, $filter, $uibModalInstance, para) {
    $scope.model = {
        JobcardCode: '',
        ItemCode: '',
        Weight: ''
    };
    $scope.initData = function () {
        dataserviceProject.getListCardJob(function (rs) {
            rs = rs.data;
            console.log(rs);
            $scope.listCardJob = rs;
        });
        $scope.model.ItemCode = para;
    }
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.close('cancel');
    }
    // luoi

    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Project/JTableItemCard",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ItemCode = $scope.model.ItemCode;
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

            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    //var Id = data.Id;
                    //$scope.edit(Id);
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CardJobName').withTitle('{{"PROJECT_CARD_NAME" | translate}}').withOption('sClass', '').renderWith(function (data, type) { // 
        return '<span style="font-size: 16px !important; font-weight: bold; ">' + data + ' </span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Weight').withTitle('{{"Trong So" | translate}}').withOption('sClass', '').renderWith(function (data, type, full) { // 
        return '<p>' + data + '  %</p>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ItemCode').notSortable().withOption('sClass', 'w25').withTitle('{{"PROJECT_ACTION" | translate}}').renderWith(function (data, type, full) { //
        return '<a title="Xoá" ng-click="delete(' + full.Id + ')" style = "width: 25px; height: 25px; padding-right: 5px" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash fs25"></i></a>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};

    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
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
    $scope.search = function () {
        reloadData(true);
    }
    $scope.submit = function () {
        console.log("OK");
        validationSelect($scope.model);
        if ($scope.addcardjobform.validate() && !validationSelect($scope.model).Status) {
            dataserviceProject.addProjectItem($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $scope.id = rs.Object;
                    // $uibModalInstance.close();
                }
                reloadData(true);
            });
        }
    }
    $scope.addWeight = function (Id) {
        console.log(Id);
        // validationSelect($scope.model);
        // if ($scope.addcardjobform.validate() && !validationSelect($scope.model).Status) {
        dataserviceProject.updateProjectItem($scope.model, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.id = rs.Object;
                // $uibModalInstance.close();
            }
            reloadData(true);
        });
        //}
    }

    $scope.delete = function (id) {
        console.log("Ok");
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceProject.deleteProjectItem(id, function (rs) {
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
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null ItemName
        if (data.JobcardCode == "" || data.JobcardCode == null) {
            $scope.errorJobcardCode = true;
            mess.Status = true;
        } else {
            $scope.errorJobcardCode = false;
        }
        if (data.Weight == "" || data.Weight == null) {
            $scope.errorWeight = true;
            mess.Status = true;
        } else {
            $scope.errorWeight = false;
        }
        return mess;
    };

});
app.controller('projectDiagramRadial', function ($scope, $rootScope, dataserviceProject) {
   // $scope.listDataDiagram = [];
    $scope.initData = function () {
        dataserviceProject.getDataDiagram($rootScope.ProjectCode,function (rs) {
            rs = rs.data;
            $scope.listDataDiagram = rs;
            console.log($scope.listDataDiagram);
            configDiagram();
            function configDiagram() {
                ej.diagrams.Diagram.Inject(ej.diagrams.DataBinding, ej.diagrams.RadialTree);
                //based on the option, Click event to perform ZoomIn,ZoomOut and Reset.
                function onItemClick(args) {
                    var diagram = document.getElementById('diagram').ej2_instances[0];
                    switch (args.item.text) {
                        case 'Zoom In':
                            var zoomin = { type: 'ZoomIn', zoomFactor: 0.2 };
                            diagram.zoomTo(zoomin);
                            break;
                        case 'Zoom Out':
                            var zoomout = { type: 'ZoomOut', zoomFactor: 0.2 };
                            diagram.zoomTo(zoomout);
                            break;
                        case 'Reset':
                            diagram.reset();
                            diagram.fitToPage();
                            break;
                    }
                }
                var height = window.outerHeight - 300;
                console.log(height);
                //Initialize diagram control
                var diagram = new ej.diagrams.Diagram({
                    width: '100%', height: height + 'px', snapSettings: { constraints: ej.diagrams.SnapConstraints.None },
                    //configures data source settings
                    dataSourceSettings: {
                        id: 'Id', parentId: 'ItemParent',
                        dataSource: new ej.data.DataManager($scope.listDataDiagram),
                        //binds the data with the nodes
                        doBinding: function (nodeModel, data, diagram) {
                            if (data.Id === 'project') {
                                nodeModel.annotations = [
                                    {
                                        content: data.ItemName,
                                        style: { color: 'white', fontSize: 15 }
                                    },
                                    {
                                        content: 'Tiến độ: ' + data.Progress,
                                        offset: {
                                            x: 0.5, y: -0.1
                                        },
                                        verticalAlignment: 'Top',
                                        horizontalAlignment: 'Center',
                                    },
                                ];
                            } else {
                                nodeModel.annotations = [
                                    {
                                        content: data.ItemName,
                                        style: { color: 'black', fontSize: 15 }
                                    },
                                    {
                                        content: 'Tiến độ: ' + data.Progress,
                                        offset: {
                                            x: 0.5, y: -0.2
                                        },
                                        verticalAlignment: 'Top',
                                        horizontalAlignment: 'Center',
                                    },
                                ];
                            };
                            nodeModel.constraints = ej.diagrams.NodeConstraints.Default & ~ej.diagrams.NodeConstraints.InheritTooltip | ej.diagrams.NodeConstraints.Tooltip;
                            nodeModel.tooltip = {
                                content: data.ItemName, relativeMode: 'Object',
                                position: 'TopCenter', showTipPointer: true
                            };
                            if (data.ItemType === 'Project') {
                                nodeModel.width = 280;
                                nodeModel.height = 280;
                                nodeModel.shape = { shape: 'Ellipse' };
                                nodeModel.style = { fill: 'black' };
                            }
                            else if (data.ItemType === 'Item') {
                                nodeModel.width = 160;
                                nodeModel.height = 130;
                                nodeModel.shape = { shape: 'Rectangle' };
                                nodeModel.style = { fill: 'orange' };
                            }
                            else {
                                nodeModel.width = 100;
                                nodeModel.height = 100;
                                nodeModel.shape = { shape: 'Ellipse' };
                                nodeModel.style = { fill: 'turquoise' };
                            }
                        }
                    },
                    //Disables all interactions except zoom/pan
                    tool: ej.diagrams.DiagramTools.ZoomPan,
                    //Configures automatic layout
                    layout: {
                        type: 'RadialTree', verticalSpacing: 30, horizontalSpacing: 20,
                        root: 'Category',
                    },
                    //Defines the default node and connector properties
                    getNodeDefaults: function (obj, diagram) {
                        return obj;
                    }, getConnectorDefaults: function (connector, diagram) {
                        connector.type = 'Straight';
                        return connector;
                    }
                });
                diagram.appendTo('#diagram');
                diagram.fitToPage();
                //create and add ZoomIn,ZoomOut and Reset options in ToolBar.
                var toolbarObj = new ej.navigations.Toolbar({
                    clicked: onItemClick,
                    items: [
                        { type: 'Button', tooltipText: 'ZoomIn', text: 'Zoom In', prefixIcon: 'e-ddb-icons e-zoomin' }, { type: 'Separator' },
                        { type: 'Button', tooltipText: 'ZoomOut', text: 'Zoom Out', prefixIcon: 'e-ddb-icons e-zoomout' }, { type: 'Separator' },
                        { type: 'Button', tooltipText: 'Reset', text: 'Reset', prefixIcon: 'e-ddb-icons e-reset' }
                    ]
                });

                toolbarObj.appendTo('#toolbar');
            }
        });
    }
    $scope.initData();
    $scope.data = [
        {
            "Id": "project",
            "ItemName": "Dự án đấu thầy xây dựng điện cao áp ",
            "ItemType": "Project",
            "Progress": "",
            "WeightNum": "",
            "ItemParent": ""
        },
        {
            "Id": "922673408",
            "ItemName": "Mua đất",
            "ItemCode": null,
            "ItemType": "Item",
            "Progress": "20%",
            "WeightNum": "",
            "ItemParent": "project"
        },
        {
            "Id": "870060069",
            "ItemName": "Thuê nhân công",
            "ItemCode": null,
            "ItemType": "Item",
            "Progress": "20%",
            "WeightNum": "",
            "ItemParent": "project"
        },
        {
            "Id": "636798000",
            "ItemName": "Thuê nhân công",
            "ItemCode": null,
            "ItemType": "Item",
            "Progress": "20%",
            "WeightNum": "",
            "ItemParent": "project"
        },
        {
            "Id": "165034013",
            "ItemName": "Xây dựng móng",
            "ItemCode": null,
            "ItemType": "Item",
            "Progress": "20%",
            "WeightNum": "",
            "ItemParent": "project"
        },
        {
            "Id": "2023838846",
            "ItemName": "Thuê nhân công công trình",
            "ItemCode": null,
            "ItemType": "",
            "Progress": "20%",
            "WeightNum": "",
            "ItemParent": "636798000"
        }
    ];

    
   
    //$scope.initData = function () {
    //    configDiagram();
    //}
    //$scope.initData();
});
app.controller('show-gantt', function ($scope, $rootScope, dataserviceProject, $uibModal, $filter) {
    $scope.listData = [];
    $scope.initLoad = function () {
        dataserviceProject.getTrueTypeFont(function (rs) {
            $scope.adventProFont = rs.data;
        });
        dataserviceProject.getProjectProgres($rootScope.ProjectCode, function (rs) {
            rs = rs.data;
            $scope.listDataGantt = rs.Object;
            loadData($scope.listDataGantt[0].DetailBoard, $scope.listDataGantt[0].ListProgress);
            configGantt();
        });
        function loadData(board, data) {
            var parent = {
                TaskID: board.ProjectID,
                TaskName: board.ProjectName,
                StartDate: moment(board.StartTime, 'DD/MM/YYYY').toDate(),
                EndDate: moment(board.EndTime, 'DD/MM/YYYY').toDate(),
                subtasks: []
            }
            for (var i = 0; i < data.length; i++) {
                var child = {
                    TaskID: data[i].ItemId,
                    TaskName: data[i].ItemTitle,
                    StartDate: moment(data[i].BeginTime, 'DD/MM/YYYY').toDate(),
                    EndDate: moment(data[i].Deadline, 'MM/DD/YYYY').toDate(),
                    Progress: data[i].Completed,
                }
                parent.subtasks.push(child);
            }
            $scope.listData.push(parent);
            console.log($scope.listData);
        }
        
        function configGantt() {
            var gantt = $("#contractGantt").position().top;
            var maxHeightGantt = $(window).height() - gantt - 150;
            $scope.ganttChart = new ej.gantt.Gantt({
                dataSource: $scope.listData,
                height: maxHeightGantt + 'px',
                taskFields: {
                    id: 'TaskID',
                    name: 'TaskName',
                    startDate: 'StartDate',
                    duration: 'Duration',
                    progress: 'Progress',
                    dependency: 'Predecessor',
                    child: 'subtasks',
                },
                allowExcelExport: true,
                allowPdfExport: true,
                //dataBound: $scope.dataBound
            });
            $scope.ganttChart.appendTo('#contractGantt');
        }
    }
    $scope.initLoad();
    function setMaxHeightGantt() {
        var gantt = $("#contractGantt").position().top;
        var maxHeightGantt = $(window).height() - gantt - 150;
        $("#contractGantt").css({
            'max-height': maxHeightGantt,
            'height': maxHeightGantt,
            'overflow': 'auto',
        });
    }
    $scope.adventProFont = "";

    $scope.excelExport = function () {
        if ($scope.ganttChart) {
            $scope.ganttChart.excelExport();
        }
    };
    $scope.pdfExport = function () {
        if ($scope.ganttChart) {
            var exportProperties = {
                ganttStyle: {
                    font: new ej.pdfexport.PdfTrueTypeFont($scope.adventProFont, 12),
                },
            };
            $scope.ganttChart.pdfExport(exportProperties);
        }
    };
    $scope.datafake = {
        "ListProgress": [
            {
                "CardID": 116814,
                "CardCode": "116814",
                "CardName": "Báo cáo công việc Tester 5.11",
                "BeginTime": "05/11/2022",
                "Deadline": "05/11/2022",
                "Completed": 0
            },
            {
                "CardID": 116819,
                "CardCode": "116819",
                "CardName": "Test thẻ việc",
                "BeginTime": "05/11/2022",
                "Deadline": "05/11/2022",
                "Completed": 0
            },
            {
                "CardID": 116823,
                "CardCode": "116823",
                "CardName": "Báo cáo công việc 7.11",
                "BeginTime": "07/11/2022",
                "Deadline": "07/11/2022",
                "Completed": 0
            },
            {
                "CardID": 116824,
                "CardCode": "116824",
                "CardName": "Test thẻ việc",
                "BeginTime": "07/11/2022",
                "Deadline": "07/11/2022",
                "Completed": 0
            },
            {
                "CardID": 116825,
                "CardCode": "116825",
                "CardName": "Công việc ngày 7/11",
                "BeginTime": "07/11/2022",
                "Deadline": "07/11/2022",
                "Completed": 0
            },
            {
                "CardID": 116826,
                "CardCode": "116826",
                "CardName": "Báo cáo tiến độ 7.11",
                "BeginTime": "07/11/2022",
                "Deadline": "07/11/2022",
                "Completed": 0
            },
            {
                "CardID": 116829,
                "CardCode": "116829",
                "CardName": "Tiến độ làm việc",
                "BeginTime": "07/11/2022",
                "Deadline": "07/11/2022",
                "Completed": 0
            },
            {
                "CardID": 116833,
                "CardCode": "116833",
                "CardName": "Check lại app smartwork",
                "BeginTime": "11/11/2022",
                "Deadline": "12/11/2022",
                "Completed": 0
            },
            {
                "CardID": 116834,
                "CardCode": "116834",
                "CardName": "Công việc ngày 11 tháng 11",
                "BeginTime": "11/11/2022",
                "Deadline": "11/11/2022",
                "Completed": 0
            },
            {
                "CardID": 116846,
                "CardCode": "116846",
                "CardName": "1",
                "BeginTime": "13/11/2022",
                "Deadline": "13/11/2022",
                "Completed": 0
            },
            {
                "CardID": 116865,
                "CardCode": "116865",
                "CardName": "Test thẻ việc",
                "BeginTime": "17/11/2022",
                "Deadline": "19/11/2022",
                "Completed": 0
            },
            {
                "CardID": 116888,
                "CardCode": "116888",
                "CardName": "test1",
                "BeginTime": "01/11/2022",
                "Deadline": "30/11/2022",
                "Completed": 0
            },
            {
                "CardID": 116915,
                "CardCode": "116915",
                "CardName": "Nhập thử thẻ việc 1",
                "BeginTime": "26/11/2022",
                "Deadline": "01/01/2023",
                "Completed": 0.06
            },
            {
                "CardID": 116919,
                "CardCode": "116919",
                "CardName": "Test 1",
                "BeginTime": "29/11/2022",
                "Deadline": "01/12/2022",
                "Completed": 0
            },
            {
                "CardID": 116924,
                "CardCode": "116924",
                "CardName": "Nhập thử thẻ việc 1",
                "BeginTime": "30/11/2022",
                "Deadline": "01/01/2023",
                "Completed": 0
            },
            {
                "CardID": 116984,
                "CardCode": "116984",
                "CardName": "Test SMARTWORK 12.12.2022",
                "BeginTime": "12/12/2022",
                "Deadline": "31/12/2022",
                "Completed": 0
            },
            {
                "CardID": 117004,
                "CardCode": "117004",
                "CardName": "Test thẻ việc",
                "BeginTime": "03/01/2023",
                "Deadline": "03/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117005,
                "CardCode": "117005",
                "CardName": "Thẻ việc 1 ngày 3/1/2023",
                "BeginTime": "03/01/2023",
                "Deadline": "03/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117007,
                "CardCode": "117007",
                "CardName": "Thẻ việc 2",
                "BeginTime": "03/01/2023",
                "Deadline": "04/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117008,
                "CardCode": "117008",
                "CardName": "Thẻ việc 33",
                "BeginTime": "03/01/2023",
                "Deadline": "03/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117010,
                "CardCode": "117010",
                "CardName": "Test thẻ việc 02",
                "BeginTime": "03/01/2023",
                "Deadline": "04/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117011,
                "CardCode": "117011",
                "CardName": "Thẻ việc 1",
                "BeginTime": "04/01/2023",
                "Deadline": "04/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117014,
                "CardCode": "117014",
                "CardName": "thẻ việc test trọng số",
                "BeginTime": "04/01/2023",
                "Deadline": "04/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117015,
                "CardCode": "117015",
                "CardName": "bug app",
                "BeginTime": "04/01/2023",
                "Deadline": "04/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117018,
                "CardCode": "117018",
                "CardName": "công thức tính nhiệt lượng",
                "BeginTime": "04/01/2023",
                "Deadline": "05/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117019,
                "CardCode": "117019",
                "CardName": "cách tính nhiệt lượng",
                "BeginTime": "04/01/2023",
                "Deadline": "05/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117021,
                "CardCode": "117021",
                "CardName": "Test thẻ việc 4/1/2023",
                "BeginTime": "04/01/2023",
                "Deadline": "12/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117022,
                "CardCode": "117022",
                "CardName": "Test thẻ việc dấu cộng",
                "BeginTime": "04/01/2023",
                "Deadline": "12/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117023,
                "CardCode": "117023",
                "CardName": "Check thẻ việc ngày 4/1/23",
                "BeginTime": "04/01/2023",
                "Deadline": "06/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117027,
                "CardCode": "117027",
                "CardName": "Test thêm mới thẻ việc",
                "BeginTime": "05/01/2023",
                "Deadline": "12/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117030,
                "CardCode": "117030",
                "CardName": "Test 1",
                "BeginTime": "05/01/2023",
                "Deadline": "05/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117031,
                "CardCode": "117031",
                "CardName": "Test 4",
                "BeginTime": "05/01/2023",
                "Deadline": "05/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117032,
                "CardCode": "117032",
                "CardName": "Test 5.2",
                "BeginTime": "05/01/2023",
                "Deadline": "05/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117033,
                "CardCode": "117033",
                "CardName": "Test thẻ việc 1",
                "BeginTime": "05/01/2023",
                "Deadline": "05/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117036,
                "CardCode": "117036",
                "CardName": "Check lỗi ",
                "BeginTime": "05/01/2023",
                "Deadline": "05/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117037,
                "CardCode": "117037",
                "CardName": "Check lại",
                "BeginTime": "05/01/2023",
                "Deadline": "05/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117045,
                "CardCode": "117045",
                "CardName": "Thẻ 1",
                "BeginTime": "06/01/2023",
                "Deadline": "06/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117049,
                "CardCode": "117049",
                "CardName": "Hằng test",
                "BeginTime": "12/01/2023",
                "Deadline": "12/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117050,
                "CardCode": "117050",
                "CardName": "Thẻ 1",
                "BeginTime": "12/01/2023",
                "Deadline": "13/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117051,
                "CardCode": "117051",
                "CardName": "Thẻ việc 1",
                "BeginTime": "12/01/2023",
                "Deadline": "12/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117052,
                "CardCode": "117052",
                "CardName": "The 1",
                "BeginTime": "12/01/2023",
                "Deadline": "12/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117053,
                "CardCode": "117053",
                "CardName": "The section 1",
                "BeginTime": "12/01/2023",
                "Deadline": "12/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117056,
                "CardCode": "117056",
                "CardName": "The section 1",
                "BeginTime": "12/01/2023",
                "Deadline": "12/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117057,
                "CardCode": "117057",
                "CardName": "The2",
                "BeginTime": "12/01/2023",
                "Deadline": "13/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117058,
                "CardCode": "117058",
                "CardName": "Test 1",
                "BeginTime": "12/01/2023",
                "Deadline": "12/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117059,
                "CardCode": "117059",
                "CardName": "Tết 2023",
                "BeginTime": "12/01/2023",
                "Deadline": "12/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117060,
                "CardCode": "117060",
                "CardName": "thẻ 2",
                "BeginTime": "12/01/2023",
                "Deadline": "12/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117061,
                "CardCode": "117061",
                "CardName": "check 1",
                "BeginTime": "12/01/2023",
                "Deadline": "12/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117064,
                "CardCode": "117064",
                "CardName": "Check the Vien 1",
                "BeginTime": "13/01/2023",
                "Deadline": "14/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117065,
                "CardCode": "117065",
                "CardName": "Test 1",
                "BeginTime": "13/01/2023",
                "Deadline": "13/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117066,
                "CardCode": "117066",
                "CardName": "Task1 Check kỹ thẻ việc",
                "BeginTime": "13/01/2023",
                "Deadline": "13/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117067,
                "CardCode": "117067",
                "CardName": "Test thẻ việc lần 2",
                "BeginTime": "13/01/2023",
                "Deadline": "14/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117068,
                "CardCode": "117068",
                "CardName": "thẻ việc 1",
                "BeginTime": "13/01/2023",
                "Deadline": "13/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117069,
                "CardCode": "117069",
                "CardName": "Thẻ 2",
                "BeginTime": "13/01/2023",
                "Deadline": "14/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117070,
                "CardCode": "117070",
                "CardName": "thẻ 1",
                "BeginTime": "13/01/2023",
                "Deadline": "13/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117074,
                "CardCode": "117074",
                "CardName": "Tiêu đề thẻ mới",
                "BeginTime": "17/01/2023",
                "Deadline": "19/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117075,
                "CardCode": "117075",
                "CardName": "Thẻ 1",
                "BeginTime": "18/01/2023",
                "Deadline": "18/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117079,
                "CardCode": "117079",
                "CardName": "test1",
                "BeginTime": "18/01/2023",
                "Deadline": "19/01/2023",
                "Completed": 0
            },
            {
                "CardID": 117086,
                "CardCode": "117086",
                "CardName": "Thẻ việc ngày 2/2",
                "BeginTime": "02/02/2023",
                "Deadline": "02/02/2023",
                "Completed": 0
            },
            {
                "CardID": 117087,
                "CardCode": "117087",
                "CardName": "Test thẻ việc 1",
                "BeginTime": "02/02/2023",
                "Deadline": "02/02/2023",
                "Completed": 0
            },
            {
                "CardID": 117088,
                "CardCode": "117088",
                "CardName": "Test thẻ việc 2",
                "BeginTime": "02/02/2023",
                "Deadline": "02/02/2023",
                "Completed": 0
            },
            {
                "CardID": 117096,
                "CardCode": "117096",
                "CardName": "thẻ 165",
                "BeginTime": "07/02/2023",
                "Deadline": "09/02/2023",
                "Completed": 0
            },
            {
                "CardID": 117099,
                "CardCode": "117099",
                "CardName": "Nhiệm vụ hôm nay",
                "BeginTime": "08/02/2023",
                "Deadline": "08/02/2023",
                "Completed": 0
            },
            {
                "CardID": 117100,
                "CardCode": "117100",
                "CardName": "Tạo tài khoản",
                "BeginTime": "08/02/2023",
                "Deadline": "09/02/2023",
                "Completed": 0
            },
            {
                "CardID": 117101,
                "CardCode": "117101",
                "CardName": "Test lại thẻ việc 1",
                "BeginTime": "08/02/2023",
                "Deadline": "08/02/2023",
                "Completed": 0
            },
            {
                "CardID": 117102,
                "CardCode": "117102",
                "CardName": "Test lại các chức năng thẻ việc ",
                "BeginTime": "08/02/2023",
                "Deadline": "08/02/2023",
                "Completed": 0
            },
            {
                "CardID": 117103,
                "CardCode": "117103",
                "CardName": "Test lần 2",
                "BeginTime": "08/02/2023",
                "Deadline": "09/02/2023",
                "Completed": 0
            },
            {
                "CardID": 117104,
                "CardCode": "117104",
                "CardName": "Hôm nay ăn gì?",
                "BeginTime": "08/02/2023",
                "Deadline": "10/02/2023",
                "Completed": 0
            },
            {
                "CardID": 117105,
                "CardCode": "117105",
                "CardName": "Test thẻ",
                "BeginTime": "08/02/2023",
                "Deadline": "06/03/2023",
                "Completed": 0
            },
            {
                "CardID": 117106,
                "CardCode": "117106",
                "CardName": "Test3",
                "BeginTime": "08/02/2023",
                "Deadline": "08/02/2023",
                "Completed": 0
            },
            {
                "CardID": 117107,
                "CardCode": "117107",
                "CardName": "Thực tập",
                "BeginTime": "08/02/2023",
                "Deadline": "13/02/2023",
                "Completed": 0
            },
            {
                "CardID": 117108,
                "CardCode": "117108",
                "CardName": "Test thẻ 4",
                "BeginTime": "08/02/2023",
                "Deadline": "08/03/2023",
                "Completed": 0
            },
            {
                "CardID": 117111,
                "CardCode": "117111",
                "CardName": "test",
                "BeginTime": "08/02/2023",
                "Deadline": "10/02/2023",
                "Completed": 0.04
            },
            {
                "CardID": 117114,
                "CardCode": "117114",
                "CardName": "Test 2",
                "BeginTime": "08/02/2023",
                "Deadline": "28/02/2023",
                "Completed": 0
            },
            {
                "CardID": 117115,
                "CardCode": "117115",
                "CardName": "Test thẻ 9",
                "BeginTime": "08/02/2023",
                "Deadline": "28/02/2023",
                "Completed": 0
            },
            {
                "CardID": 117117,
                "CardCode": "117117",
                "CardName": "HH",
                "BeginTime": "08/02/2023",
                "Deadline": "10/02/2023",
                "Completed": 0.1
            },
            {
                "CardID": 117118,
                "CardCode": "117118",
                "CardName": "Test 10",
                "BeginTime": "08/02/2023",
                "Deadline": "28/02/2023",
                "Completed": 0
            },
            {
                "CardID": 117119,
                "CardCode": "117119",
                "CardName": "Abc",
                "BeginTime": "08/02/2023",
                "Deadline": "09/02/2023",
                "Completed": 0
            },
            {
                "CardID": 117122,
                "CardCode": "117122",
                "CardName": "Hahahahaha",
                "BeginTime": "08/02/2023",
                "Deadline": "17/02/2023",
                "Completed": 0
            },
            {
                "CardID": 117123,
                "CardCode": "117123",
                "CardName": "Báo cáo cuối sáng",
                "BeginTime": "08/02/2023",
                "Deadline": "08/02/2023",
                "Completed": 0
            },
            {
                "CardID": 117125,
                "CardCode": "117125",
                "CardName": "Test thẻ",
                "BeginTime": "08/02/2023",
                "Deadline": "25/02/2023",
                "Completed": 0
            },
            {
                "CardID": 117128,
                "CardCode": "117128",
                "CardName": "Bản 1",
                "BeginTime": "08/02/2023",
                "Deadline": "12/02/2023",
                "Completed": 0
            },
            {
                "CardID": 117129,
                "CardCode": "117129",
                "CardName": "Test",
                "BeginTime": "08/02/2023",
                "Deadline": "28/02/2023",
                "Completed": 0
            },
            {
                "CardID": 117130,
                "CardCode": "117130",
                "CardName": "Test 01",
                "BeginTime": "08/02/2023",
                "Deadline": "16/02/2023",
                "Completed": 0
            },
            {
                "CardID": 117131,
                "CardCode": "117131",
                "CardName": "Test 05",
                "BeginTime": "08/02/2023",
                "Deadline": "28/02/2023",
                "Completed": 0
            },
            {
                "CardID": 117132,
                "CardCode": "117132",
                "CardName": "Test",
                "BeginTime": "08/02/2023",
                "Deadline": "17/02/2023",
                "Completed": 0
            },
            {
                "CardID": 117134,
                "CardCode": "117134",
                "CardName": "Đi về",
                "BeginTime": "08/02/2023",
                "Deadline": "09/02/2023",
                "Completed": 0
            },
            {
                "CardID": 117135,
                "CardCode": "117135",
                "CardName": "Test",
                "BeginTime": "08/02/2023",
                "Deadline": "17/02/2023",
                "Completed": 0
            },
            {
                "CardID": 117136,
                "CardCode": "117136",
                "CardName": "Hôm nay 09/02",
                "BeginTime": "09/02/2023",
                "Deadline": "09/02/2023",
                "Completed": 0
            },
            {
                "CardID": 117137,
                "CardCode": "117137",
                "CardName": "Báo cáo 2",
                "BeginTime": "09/02/2023",
                "Deadline": "11/02/2023",
                "Completed": 0
            },
            {
                "CardID": 117138,
                "CardCode": "117138",
                "CardName": "Testhn",
                "BeginTime": "09/02/2023",
                "Deadline": "28/02/2023",
                "Completed": 0
            },
            {
                "CardID": 117139,
                "CardCode": "117139",
                "CardName": "Thứ 5 09/02",
                "BeginTime": "09/02/2023",
                "Deadline": "28/02/2023",
                "Completed": 0
            },
            {
                "CardID": 117140,
                "CardCode": "117140",
                "CardName": "Test",
                "BeginTime": "09/02/2023",
                "Deadline": "11/02/2023",
                "Completed": 0
            },
            {
                "CardID": 117141,
                "CardCode": "117141",
                "CardName": "Dữ liệu 20/02",
                "BeginTime": "09/02/2023",
                "Deadline": "18/02/2023",
                "Completed": 0
            },
            {
                "CardID": 117142,
                "CardCode": "117142",
                "CardName": "Hi",
                "BeginTime": "09/02/2023",
                "Deadline": "28/02/2023",
                "Completed": 0
            },
            {
                "CardID": 117143,
                "CardCode": "117143",
                "CardName": "Hiii",
                "BeginTime": "02/02/2023",
                "Deadline": "10/02/2023",
                "Completed": 0
            },
            {
                "CardID": 117144,
                "CardCode": "117144",
                "CardName": "Check",
                "BeginTime": "09/02/2023",
                "Deadline": "17/02/2023",
                "Completed": 0
            },
            {
                "CardID": 117147,
                "CardCode": "117147",
                "CardName": "Demo App",
                "BeginTime": "11/02/2023",
                "Deadline": "28/02/2023",
                "Completed": 0
            }
        ],
        "DetailBoard": {
            "BoardID": 2594,
            "BoardName": "QA_Quý 4_2022",
            "StartTime": "01/11/2022",
            "EndTime": "30/11/2022",
            "Duration": 29,
            "Completed": 1.75
        }
    }
    $scope.dataBound = function () {
        var middleDay = moment($scope.middleDay).format("MM/DD/YYYY");
        console.log(middleDay);
        $scope.ganttChart.scrollToDate(middleDay);
    }
    $scope.middleDay = "";
    
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        return mess;
    };
    setTimeout(function () {
        setMaxHeightGantt();
    }, 50);
});