var ctxfolderMaintenance = "/views/admin/assetMaintenance";
var ctxfolderMessage = "/views/message-box";
var ctxfolderFileShare = "/views/admin/fileObjectShare";
var ctxfolderInventory = "/views/admin/assetInventory";

var app = angular.module('App_ESEIM_MAINTENANCE', ['App_ESEIM_DASHBOARD','App_ESEIM', 'App_ESEIM_WF_PLUGIN', 'App_ESEIM_SUPPLIER', 'App_ESEIM_FILE_PLUGIN', "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber', 'monospaced.qrcode', 'ngTagsInput']).
    directive("filesInput", function () {
        return {
            require: "ngModel",
            link: function postLink(scope, elem, attrs, ngModel) {
                elem.on("change", function (e) {
                    var files = elem[0].files;
                    ngModel.$setViewValue(files);
                });
            }
        }
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

app.directive('customOnChangeCustomer', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChangeCustomer);
            element.on('change', onChangeHandler);
            element.on('$destroy', function () {
                element.off();
            });

        }
    };
});

app.factory('dataserviceMaintenance', function ($http) {
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
    var submitFormUpload1 = function (url, data, callback) {
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
        createTempFile: function (data, data1, data2, callback) {
            $http.post('/Admin/EDMSRepository/CreateTempFile?Id=' + data + "&isSearch=" + data1 + "&content=" + data2).then(callback);
        },
        getStatus: function (callback) {
            $http.post('/Admin/AssetMaintenance/GetStatus').then(callback);
        },
        getOrganization: function (callback) {
            $http.post('/Admin/AssetMaintenance/GetOrganization').then(callback);
        },
        getUnitMaintenance: function (callback) {
            $http.post('/Admin/AssetMaintenance/GetUnitMaintenance').then(callback);
        },
        getDepartTransfer: function (callback) {
            $http.post('/Admin/AssetMaintenance/GetDepartTransfer').then(callback);
        },
        getUserTransfer: function (data, callback) {
            $http.post('/Admin/AssetMaintenance/GetUserTransfer?DepartmentCode=' + data).then(callback);
        },
        getGenReqCode: function (callback) {
            $http.post('/Admin/AssetMaintenance/GenReqCode').then(callback);
        },
        insertHeaderMaintenance: function (data, callback) {
            $http.post('/Admin/AssetMaintenance/InsertHeader/', data).then(callback);
        },
        getItemMaintenance: function (data, callback) {
            $http.post('/Admin/AssetMaintenance/GetItem?Id=' + data).then(callback);
        },
        updateHeader: function (data, callback) {
            $http.post('/Admin/AssetMaintenance/UpdateHeader/', data).then(callback);
        },
        deleteHeader: function (data, callback) {
            $http.post('/Admin/AssetMaintenance/DeleteHeader?Id=' + data).then(callback);
        },
        getActivityStatus: function (data, callback) {
            $http.post('/Admin/AssetMaintenance/GetActivityStatus?Id=' + data).then(callback);
        },
        getCurrency: function (callback) {
            $http.post('/Admin/AssetBuy/GetCurrency').then(callback);
        },
        insertDetails: function (data, callback) {
            $http.post('/Admin/AssetMaintenance/InsertDetails', data).then(callback);
        },
        getAsset: function (callback) {
            $http.post('/Admin/AssetMaintenance/GetAsset').then(callback);
        },
        getAssetCategory: function (callback) {
            $http.post('/Admin/AssetMaintenance/GetAssetCategory').then(callback);
        },
        getStatusAsset: function (callback) {
            $http.post('/Admin/AssetMaintenance/GetStatusAsset').then(callback);
        },
        getItemDetails: function (data, callback) {
            $http.post('/Admin/AssetMaintenance/GetItemDetails?Id=' + data).then(callback);
        },
        deletedAsset: function (data, callback) {
            $http.post('/Admin/AssetMaintenance/DeleteAsset?Id=' + data).then(callback);
        },
        getGenReqCategoryCode: function (callback) {
            $http.post('/Admin/AssetMaintenance/GenReqCategoryCode').then(callback);
        },
        insertAssetCategory: function (data, callback) {
            $http.post('/Admin/AssetMaintenance/InsertAssetCategory/', data).then(callback);
        },
        getTotalMoney: function (data, data1, callback) {
            $http.post('/Admin/AssetMaintenance/GetTotalMoney?str=' + data + '&&str1=' + data1, callback).then(callback);
        },
        getTotalMoneyAsset: function (data, callback) {
            $http.post('/Admin/AssetMaintenance/GetTotalMoneyAsset?str=' + data, callback).then(callback);
        },
        delAllCategory: function (data, callback) {
            $http.post('/Admin/AssetMaintenance/DelAllCategory?str=' + data, callback).then(callback);
        },
        deleteCategory: function (data, callback) {
            $http.post('/Admin/AssetMaintenance/DeleteCategory?Id=' + data).then(callback);
        },
        insertFile: function (data, callback) {
            submitFormUpload('/Admin/AssetMaintenance/UploadFile', data, callback);
        },
        getGenReqFileCode: function (callback) {
            $http.post('/Admin/AssetMaintenance/GenReqFileCode').then(callback);
        },
        getListFile: function (data, callback) {
            $http.post('/Admin/AssetMaintenance/GetListFile?code=' + data, callback).then(callback);
        },
        deleteFile: function (data, callback) {
            $http.post('/Admin/AssetMaintenance/DeleteFile?id=' + data).then(callback);
        },
        updateAsset: function (data, callback) {
            $http.post('/Admin/AssetMaintenance/UpdateAsset/', data).then(callback);
        },
        checkTicketCode: function (data, callback) {
            $http.post('/Admin/AssetMaintenance/CheckTicketCode?str=' + data).then(callback);
        },
        getObjActCode: function (callback) {
            $http.post('/Admin/AssetMaintenance/GetObjActCode').then(callback);
        },
        getCatActivity: function (callback) {
            $http.get('/Admin/AssetMaintenance/GetCatActivity').then(callback);
        },
        insertLogData: function (data, callback) {
            $http.post('/Admin/AssetMaintenance/InsertLogData', data).then(callback);
        },
        getItemAttrSetup: function (data, callback) {
            $http.post('/Admin/AssetAllocation/GetItemAttrSetup/', data).then(callback);
        },
        getListActivityAttrData: function (data, data1, data2, callback) {
            $http.post('/Admin/assetInventory/GetListActivityAttrData?objCode=' + data + '&&actCode=' + data1 + '&&objActCode=' + data2).then(callback);
        },
        insertAttrData: function (data, callback) {
            $http.post('/Admin/assetInventory/InsertAttrData', data).then(callback);
        },
        updateAttrData: function (data, callback) {
            $http.post('/Admin/assetInventory/UpdateAttrData?id=' + data).then(callback);
        },
        deleteAttrData: function (data, callback) {
            $http.post('/Admin/AssetMaintenance/DeleteAttrData?id=' + data).then(callback);
        },
        deleteItemActivity: function (data, callback) {
            $http.post('/Admin/AssetMaintenance/DeleteItemActivity?id=' + data).then(callback);
        },
        checkRoleUser: function (data, callback) {
            $http.post('/Admin/AssetAllocation/CheckRoleUser?wfCode=' + data).then(callback);
        },
        getCatActivityWorkFlow: function (data, callback) {
            $http.get('/Admin/AssetAllocation/GetCatActivityWorkFlow?wfCode=' + data).then(callback);
        },
        getStausObjStream: function (data, callback) {
            $http.post('/Admin/assetInventory/GetStausObjStream', data).then(callback);
        },
        //file
        insertAssetFile: function (data, callback) {
            submitFormUpload1('/Admin/AssetMaintenance/InsertAssetFile/', data, callback);
        },
        getSuggestionsAssetFile: function (data, callback) {
            $http.get('/Admin/AssetMaintenance/GetSuggestionsAssetFile?assetCode=' + data).then(callback);
        },
        getTreeCategory: function (callback) {
            $http.post('/Admin/EDMSRepository/GetTreeCategory').then(callback);
        },
        getAssetFile: function (data, callback) {
            $http.post('/Admin/AssetMaintenance/GetAssetFile/' + data).then(callback);
        },
        updateAssetFile: function (data, callback) {
            submitFormUpload('/Admin/AssetMaintenance/UpdateAssetFile/', data, callback);
        },
        deleteAssetFile: function (data, callback) {
            $http.post('/Admin/AssetMaintenance/DeleteAssetFile/' + data).then(callback);
        },
        getListObjectTypeShare: function (callback) {
            $http.get('/Admin/FileObjectShare/GetListObjectTypeShare/').then(callback);
        },
        getListFileWithObject: function (objectCode, objectType, callback) {
            $http.get('/Admin/FileObjectShare/GetListFileWithObject?objectCode=' + objectCode + '&objectType=' + objectType).then(callback);
        },
        getListObjectShare: function (objectCodeShared, objectTypeShared, objectCode, objectType, fileCode, callback) {
            $http.get('/Admin/FileObjectShare/GetListObjectShare?objectCodeShared=' + objectCodeShared + '&objectTypeShared=' + objectTypeShared + '&objectCode=' + objectCode + '&objectType=' + objectType + '&fileCode=' + fileCode).then(callback);
        },
        getListObjectCode: function (objectCode, objectType, callback) {
            $http.get('/Admin/FileObjectShare/GetListObjectCode?objectCode=' + objectCode + '&objectType=' + objectType).then(callback);
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

        //Workfow
        getListRepeat: function (data, callback) {
            $http.post('/Admin/AssetMaintenance/GetListRepeat?code=' + data).then(callback);
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
            $http.post('/Admin/AssetMaintenance/GetItemHeaderWithCode?code=' + data).then(callback);
        },
        getActionStatus: function (data, callback) {
            $http.get('/Admin/AssetMaintenance/GetActionStatus?code=' + data).then(callback);
        },
        getItemHeader: function (data, callback) {
            $http.post('/Admin/AssetMaintenance/GetItemHeader?id=' + data).then(callback);
        },
        getListRepeat: function (data, callback) {
            $http.post('/Admin/AssetMaintenance/GetListRepeat?code=' + data).then(callback);
        },
        getStepWorkFlow: function (data, callback) {
            $http.post('/Admin/AssetMaintenance/GetStepWorkFlow?code=' + data).then(callback);
        },
        updateStatusWF: function (data, data1, data2, data3, callback) {
            $http.post('/Admin/WorkflowActivity/UpdateStatusWF?objType=' + data + '&objCode=' + data1 + '&status=' + data2 + '&actRepeat=' + data3).then(callback);
        },

        //Print
        getAssetInTicket: function (data, callback) {
            $http.post('/Admin/AssetMaintenance/GetAssetInTicket?ticketCode=' + data).then(callback);
        },

        getLogStatus: function (data, callback) {
            $http.post('/Admin/AssetMaintenance/GetLogStatus?code=' + data).then(callback);
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
    }
});

app.controller('Ctrl_ESEIM_MAINTENANCE', function ($scope, $rootScope, $compile, dataserviceMaintenance, $filter, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);

    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture] ? caption[culture] : caption;
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
            //max: 'Max some message {0}'
        })
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^!@#$%^&*<>?\s]*$/;
            var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.AssetCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.ASSET_VALIDATE_ITEM_CODE.replace("{0}", caption.ASSET_CURD_LBL_ASSET_CODE), "<br/>");//"Mã tài sản bao gồm chữ cái và số"
            }
            if (!partternName.test(data.AssetName)) {
                mess.Status = true;
                mess.Title += caption.ASSET_VALIDATE_ASSET_NAME.replace("{0}", caption.ASSET_CURD_LBL_ASSET_NAME)//"Yêu cầu tên tài sản có ít nhất một ký tự là chữ cái hoặc số và không bao gồm ký tự đặc biệt!"
            }
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                Title: {
                    required: true,
                    maxlength: 255
                },
                UnitMaintenance: {
                    required: true,
                    maxlength: 255
                },
                LocationTransfer: {
                    required: true,
                    maxlength: 255
                },
                LocationReceived: {
                    required: true,
                    maxlength: 255
                },
                StartTime: {
                    required: true
                },
                ReceivedTime: {
                    required: true
                },
                TotalMoney: {
                    required: true
                },
            },
            messages: {
                Title: {
                    required: caption.ASMTNC_VALIDATE_TICKET_NAME,
                    maxlength: caption.ASMTNC_VALIDATE_TO_END
                },
                UnitMaintenance: {
                    required: caption.ASMTNC_VALIDATE_UNIT_IMPRO,
                    maxlength: caption.ASMTNC_VALIDATE_TO_END
                },
                LocationTransfer: {
                    required: caption.ASMTNC_VALIDATE_LOCATION_TRANSFER,
                    maxlength: caption.ASMTNC_VALIDATE_TO_END
                },
                LocationReceived: {
                    required: caption.ASMTNC_VALIDATE_LOCATION_RECEIVED,
                    maxlength: caption.ASMTNC_VALIDATE_TO_END
                },
                StartTime: {
                    required: caption.ASMTNC_VALIDATE_TIME_TRANSFER,
                },
                ReceivedTime: {
                    required: caption.ASMTNC_VALIDATE_TIME_RECEIVED,
                },
                TotalMoney: {
                    required: "Tổng tiền không được phép trống!",
                },
            }
        }
        $rootScope.validationOptionsAsset = {
            rules: {
                Quantity: {
                    required: true,
                    regx: /^([0-9])+\b$/
                },
                //Price: {
                //    required: true
                //},
            },
            messages: {
                Quantity: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.ASMTNC_VALIDATE_VALUE_NUM),
                    regx: caption.ASMTNC_VALIDATE_VALUE_NUM_SMALL_ZERO
                },
                //Price: {
                //    required: "Đơn giá trống",
                //},

            }
        }
        $rootScope.validationOptionsAssetCategory = {
            rules: {
                Quantity: {
                    required: true,
                    regx: /^([0-9])+\b$/
                },
                Price: {
                    required: true,
                    //regx: /^([0-9])+\b$/
                }
            },
            messages: {
                Quantity: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.ASMTNC_VALIDATE_VALUE_NUM),
                    regx: caption.ASMTNC_VALIDATE_VALUE_NUM_SMALL_ZERO
                },
                Price: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.ASMTNC_VALIDATE_PRICE),
                    //regx: caption.ASMTNC_VALIDATE_VALUE_PRICE_SMALL_ZERO
                }
            }
        }
        $rootScope.validationOptionsFile = {
            rules: {
                FileName: {
                    required: true
                },
            },
            messages: {
                FileName: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.ASMTNC_CURD_TAB_FILE_CURD_LBL_FILECODE),
                },
            }
        }
        $rootScope.validationOptionsResultAct = {
            rules: {
                Value: {
                    required: true
                }
            },
            messages: {
                Value: {
                    required: caption.ASMTNC_VALIDATE_VALUE_NOT_NULL
                }
            }
        }
    });
    //Phần dùng chung
    dataserviceMaintenance.getStatus(function (rs) {
        rs = rs.data;
        $rootScope.listStatus = rs;
    });
    dataserviceMaintenance.getOrganization(function (rs) {
        rs = rs.data;
        $rootScope.listOrganization = rs;
        var all = {
            Code: '',
            Name: 'Tất cả'
        }
        //$scope.listOrganization.unshift(all)
    });
    dataserviceMaintenance.getUnitMaintenance(function (rs) {
        rs = rs.data;
        $rootScope.listUnitMaintenance = rs;
        var all = {
            Code: '',
            Name: 'Tất cả'
        }
        $scope.listUnitMaintenance.unshift(all)
    });
    dataserviceMaintenance.getDepartTransfer(function (rs) {
        rs = rs.data;
        $rootScope.listDepartTransfer = rs;
    });

    dataserviceMaintenance.getAsset(function (rs) {
        rs = rs.data;
        $rootScope.listAsset = rs;
    });
    dataserviceMaintenance.getAssetCategory(function (rs) {
        rs = rs.data;
        $rootScope.listAssetCategory = rs;
    });
    dataserviceMaintenance.getStatusAsset(function (rs) {
        rs = rs.data;
        $rootScope.listStatusAsset = rs;
    });
    $rootScope.IsId = false;
    dataserviceMaintenance.getCatActivity(function (rs) {
        rs = rs.data;
        // $rootScope.listCatActivity = rs;
    });
    $rootScope.ObjectTypeFile = "ASSET_MAINTENACE";
    $rootScope.moduleName = "ASSET"
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/AssetMaintenance/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderMaintenance + '/index.html',
            controller: 'index'
        })
        .when('/add', {
            templateUrl: ctxfolderMaintenance + '/add.html',
            controller: 'add'
        })
        .when('/edit', {
            templateUrl: ctxfolderMaintenance + '/edit.html',
            controller: 'editMaintenance'
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

app.controller('index', function ($scope, $location, $uibModal) {
    $scope.modelsearch = {
        TicketCode: "",
        Title: "",
        FromDate: "",
        ToDate: "",
        Branch: "",
        UnitMaintenance: "",
        Status: "",
    };
    //$scope.add = function () {
    //    var modalInstance = $uibModal.open({
    //        animation: true,
    //        templateUrl: ctxfolderMaintenance + '/add.html',
    //        controller: 'add',
    //        backdrop: 'static',
    //        size: '60'
    //    });
    //    modalInstance.result.then(function (d) {
    //        $scope.reload();
    //    }, function () {
    //    });
    //}

    $scope.add = function () {
        $location.path('/add');
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


    function loadDate() {
        $("#StartTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
        });
        $("#ReceivedTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
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

app.controller('tableheader', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceMaintenance, $filter, $translate, myService, $location) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/AssetMaintenance/JTableHeader",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.TicketID = $scope.modelsearch.TicketID;
                d.TicketCode = $scope.modelsearch.TicketCode;
                d.Title = $scope.modelsearch.Title;
                d.FromDate = $scope.modelsearch.FromDate;
                d.ToDate = $scope.modelsearch.ToDate;
                d.Branch = $scope.modelsearch.Branch;
                d.UnitMaintenance = $scope.modelsearch.UnitMaintenance;
                d.Status = $scope.modelsearch.Status;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
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
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var id = data.TicketID;
                    $scope.edit(id);
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("TicketID").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.TicketID] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.TicketID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TicketCode').withTitle('{{"ASMTNC_TAB_HEADER_COL_TICKET_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"ASMTNC_TAB_HEADER_COL_TICKET_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Branch').withTitle('{{"ASMTNC_TAB_HEADER_COL_BRANCH" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DepartTransfer').withTitle('{{"ASMTNC_TAB_HEADER_COL_UNIT_TRANSFER" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StartTime').withTitle('{{"ASMTNC_TAB_HEADER_COL_FROM_DATE" | translate}}').renderWith(function (data, type) {
        return data != null && data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UnitMaintenance').withTitle('{{"ASMTNC_TAB_HEADER_COL_UNIT_IMPROVERMENT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ReceivedTime').withTitle('{{"ASMTNC_TAB_HEADER_COL_TO_DATE" | translate}}').renderWith(function (data, type) {
        return data != null && data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TotalMoney').withTitle('{{"ASMTNC_TAB_DETAILS_COL_SUM_MONEY" | translate}}').renderWith(function (data, type) {
        return data != "" ? '<span class="text-success">' + $filter('currency')(data, '', 0) + '</span>' : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Currency').withTitle('{{"ASMTNC_TAB_DETAILS_CURRENCY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"ASMTNC_TAB_HEADER_COL_STATUS" | translate}}').renderWith(function (data, type, full) {
        if (full.Status == "") {
            return "";
        }
        var json = JSON.parse(full.Status)
        var status = "";
        if (json.length > 0) {
            status = json[json.length - 1].Name
        }
        return status;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"ASMTNC_TAB_HEADER_COL_NOTE" | translate}}').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"ASMTNC_TAB_HEADER_COL_ACTION" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type, full, meta) {
        return '<a title="{{&quot; COM_BTN_EDIT &quot; | translate}}" ng-click="edit(' + full.TicketID + ')" class="fs25 pr10"><i class="fas fa-edit"style="--fa-primary-color: green;"></i></a>' +
            '<a title="{{&quot; COM_BTN_DELETE &quot; | translate}}" ng-click="delete(' + full.TicketID + ')"class="fs25"><i class="fas fa-trash"style="--fa-primary-color: red;"></i></a>';
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

    $rootScope.searchHeader = function () {
        reloadData(true);
    }

    $rootScope.reloadTabHeader = function () {
        reloadData(false);
    };

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderMaintenance + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '70'
        });
        modalInstance.result.then(function (d) {
            $scope.reloadData();
        }, function () {
        });
    };

    $scope.cancel = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderMaintenance + '/cancel.html',
            controller: 'cancel',
            backdrop: true,
            size: '70'
        });
        modalInstance.result.then(function (d) {
            $scope.reloadData();
        }, function () { });
    };

    //$scope.edit = function (id) {
    //    dataserviceMaintenance.getItemMaintenance(id, function (rs) {
    //        rs = rs.data;
    //        $rootScope.TicketCode = rs.Object.TicketCode;
    //        $rootScope.AssetCode = rs.Object.TicketCode; // de hien o ngoai  index phan edit. cua  tai san
    //        var modalInstance = $uibModal.open({
    //            animation: true,
    //            templateUrl: ctxfolderMaintenance + '/edit.html',
    //            controller: 'editMaintenance',
    //            backdrop: 'static',
    //            size: '60',
    //            resolve: {
    //                para: function () {
    //                    return id;
    //                }
    //            }
    //        });
    //        modalInstance.result.then(function (d) {
    //            $scope.reloadData();
    //        }, function () {
    //        });
    //    });
    //};

    $scope.edit = function (id) {
        dataserviceMaintenance.getItemMaintenance(id, function (rs) {
            rs = rs.data;
            $rootScope.TicketCode = rs.Object.TicketCode;
            $rootScope.AssetCode = rs.Object.TicketCode;
            $rootScope.ObjCode = rs.Object.TicketCode;
            myService.setData(data = id);
            $location.path('/edit');
        });
    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceMaintenance.deleteHeader(id, function (rs) {
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
            $scope.reloadData();
            $rootScope.reloadTabDetails();
        }, function () {
        });
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

app.controller('tabledetails', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceMaintenance, $filter, $translate) {
    var vm = $scope;
    $scope.model = {

    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    function formatNumber(nStr, decSeperate, groupSeperate) {
        nStr += '';
        x = nStr.split(decSeperate);
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + groupSeperate + '$2');
        }
        return "" + x1 + x2 + " VNĐ";
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/AssetMaintenance/JTableDetails",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',

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
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("AssetID").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.AssetID] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.AssetID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TicketCode').withTitle('{{"ASMTNC_TAB_DETAILS_COL_TICKET_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AssetName').withTitle('{{ "ASMTNC_TAB_DETAILS_COL_ASSET_NAME" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AssetQuantity').withTitle('{{"ASMTNC_TAB_CATEGORY_QUANTITY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TotalMoney').withTitle('{{"ASMTNC_TAB_DETAILS_COL_SUM_MONEY" | translate}}').renderWith(function (data, type) {
        var tax = data != "" ? $filter('currency')(data, '', 0) : null;
        return '<span class="text-danger bold">' + tax + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StatusAsset').withTitle('{{"ASMTNC_TAB_DETAILS_COL_STATUS" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"ASMTNC_TAB_DETAILS_COL_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"ASMTNC_TAB_DETAILS_COL_ACTION" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type, full, meta) {
        return '<a title="{{&quot; COM_BTN_DELETE &quot; | translate}}" ng-click="delete(' + full.AssetID + ')"  class="fs25"><i class="fas fa-trash"style="--fa-primary-color: red;"></i></a>';
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
        validationSelect($scope.model);
        if (validationSelect($scope.model).Status == false) {
            reloadData(true);
        }
    }
    $scope.search = function () {
        validationSelect($scope.model);
        if (validationSelect($scope.model).Status == false) {
            reloadData(true);
        }
    }
    $rootScope.reloadTabDetails = function () {
        reloadData(false);
    };
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderMaintenance + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '70'
        });
        modalInstance.result.then(function (d) {
            $scope.reloadData();
        }, function () {
        });
    };
    $scope.cancel = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderMaintenance + '/cancel.html',
            controller: 'cancel',
            backdrop: true,
            size: '70'
        });
        modalInstance.result.then(function (d) {
            $scope.reloadData();
        }, function () { });
    };
    $scope.edit = function (id) {
        dataserviceMaintenance.getItemDetails(id, function (rs) {
            rs = rs.data;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderMaintenance + '/edit.html',
                controller: 'editMaintenance',
                backdrop: 'static',
                size: '70',
                resolve: {
                    para: function () {
                        return rs.Object
                    }
                }
            });
            modalInstance.result.then(function (d) {
                $scope.reloadData();
            }, function () {
            });
        });
    };
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceMaintenance.deletedAsset(id, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            dataserviceMaintenance.delAllCategory(rs.Code, function (result) {
                                result = result.data;
                                if (!result.Error) {
                                    App.toastrSuccess(result.Title);
                                }
                            });
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
            $scope.reloadData();
        }, function () {
        });
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

app.controller('tableAsset', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceMaintenance, $filter) {
    var vm = $scope;
    $scope.modelAsset = {

    }
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/AssetMaintenance/JTableAssetDetails",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.TicketCode = $rootScope.TicketCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(200, "#tblDataAssetMaintenance");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(2)
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("AssetID").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.AssetID] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.AssetID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sWidth', '20px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AssetName').withTitle('{{"ASMTNC_TAB_ASSET_ASSET_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AssetQuantity').withTitle('{{"ASMTNC_CURD_LBL_QUANTITY" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('UnitMaintenance').withTitle('{{"ASMTNC_TAB_ASSET_UNIT_IMPROVEMENT" | translate}}').renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('UserTransfer').withTitle('{{"ASMTNC_TAB_ASSET_USER_IMPROVEMENT" | translate}}').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StatusAsset').withTitle('{{"ASMTNC_TAB_ASSET_STATUS" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"ASMTNC_TAB_ASSET_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"ASMTNC_TAB_ASSET_COL_ACTION" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type, full, meta) {
        return '<a title="{{&quot; COM_BTN_DELETE &quot; | translate}}" ng-click="delete(' + full.AssetID + ')"  class="fs25"><i class="fas fa-trash"style="--fa-primary-color: red;"></i></button>';
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
        validationSelect($scope.model);
        if (validationSelect($scope.model).Status == false) {
            reloadData(true);
        }
    }
    $scope.reloadTableAsset = function () {
        reloadData(false);
    };
    $scope.addAsset = function () {
        //lấy TicketCode 
        $scope.modelAsset.TicketCode = $rootScope.TicketCode;
        //lấy totalmoney
        validationSelect($scope.modelAsset);
        if ($scope.assetform.validate() && !validationSelect($scope.modelAsset).Status) {
            dataserviceMaintenance.insertDetails($scope.modelAsset, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $scope.reloadData();
                    $rootScope.reloadTabDetails();
                }
            });
        }
    };
    $scope.cancel = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderMaintenance + '/cancel.html',
            controller: 'cancel',
            backdrop: true,
            size: '70'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () { });
    };
    $scope.edit = function (id) {
    };
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceMaintenance.deletedAsset(id, function (rs) {

                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            dataserviceMaintenance.delAllCategory(rs.Code, function (rs) {
                                rs = rs.data;
                                if (rs.Error) {
                                    App.toastrError(rs.Title);
                                } else {

                                }
                            });
                            dataserviceMaintenance.delAllCategory(rs.Code, function (result) {
                                result = result.data;
                                if (!result.Error) {
                                    App.toastrSuccess(result.Title);
                                }
                            });
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
            $scope.reloadData();
            $rootScope.reloadTabDetails();
            $rootScope.reloadTableCategory();
        }, function () {
        });
    };
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 
        if (data.AssetCode == "" || data.AssetCode == null) {
            $scope.errorAssetCode = true;
            mess.Status = true;
        } else {
            $scope.errorAssetCode = false;
        }

        if (data.StatusAsset == "" || data.StatusAsset == null) {
            $scope.errorStatusAsset = true;
            mess.Status = true;
        } else {
            $scope.errorStatusAsset = false;
        }
        return mess;
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "AssetCode" && $scope.model.AssetCode != "") {
            $scope.errorAssetCode = false;
        }
        if (SelectType == "StatusAsset" && $scope.model.StatusAsset != "") {
            $scope.errorStatusAsset = false;
        }
    }
    function showHideSearch() {
        $(".btnSearch").click(function () {
            $(".input-search").removeClass('hidden');
            $(".btnSearch").hide();
        });
        $(".close-input-search").click(function () {
            $(".input-search").addClass('hidden');
            $(".btnSearch").show();
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
    }
    setTimeout(function () {
        showHideSearch();
        loadDate();
    }, 200);
});

app.controller('tablecategory', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceMaintenance, $filter) {
    var vm = $scope;
    $scope.modelAssetCategory = {
        TicketCode: "",
        Currency: '',
    }
    function formatMoney(nStr, decSeperate, groupSeperate) {
        nStr += '';
        x = nStr.split(decSeperate);
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + groupSeperate + '$2');
        }
        return "" + x1 + x2 + " VNĐ";
    }
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/AssetMaintenance/JTableAssetCategory",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.UserCategory = $rootScope.UserCategory;
                d.TicketCodeCategory = $rootScope.TicketCode;
                d.TicketCode = $rootScope.TicketCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(200, "#tblDataMaintenanceCate");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(2)
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("CategoryID").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.CategoryID] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.CategoryID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sWidth', '20px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CategoryName').withTitle('{{"ASMTNC_TAB_CATEGORY_CATEGORY_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('UserCategory').withTitle('{{"ASMTNC_TAB_CATEGORY_USER_IMPROVEMENT" | translate}}').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withTitle('{{"ASMTNC_TAB_CATEGORY_QUANTITY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Price').withTitle('{{"ASMTNC_TAB_CATEGORY_PRICE" | translate}}').renderWith(function (data, type) {
        return data != "" ? '<span class="text-success">' + $filter('currency')(data, '', 0) + '</span>' : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Currency').withTitle('{{"ASMTNC_CURD_LBL_MONEY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('NoteCategory').withTitle('{{"ASMTNC_TAB_CATEGORY_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"ASMTNC_TAB_CATEGORY_ACTION" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type, full, meta) {
        return '<a title="{{&quot; COM_BTN_DELETE &quot; | translate}}" ng-click="delete(' + full.AssetID + ')"  class="fs25"><i class="fas fa-trash"style="--fa-primary-color: red;"></i></button>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};

    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
        $scope.initLoad();
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

    $scope.initLoad = function () {
        dataserviceMaintenance.getGenReqCategoryCode(function (rs) {
            rs = rs.data;
            if (!rs.Error) {
                $scope.modelAssetCategory.CategoryCode = rs;
            }
        });
    }
    $scope.initLoad();
    $scope.search = function () {
        validationSelect($scope.model);
        if (validationSelect($scope.model).Status == false) {
            reloadData(true);
        }
    };
    $scope.reload = function () {
        validationSelect($scope.model);
        if (validationSelect($scope.model).Status == false) {
            reloadData(true);
        }
    }
    $rootScope.reloadTableCategory = function () {
        reloadData(false);
    };
    $scope.deleteCategory = function () {
        $scope.modelAssetCategory.CategoryName = "";
        $scope.modelAssetCategory.Quantity = "";
        $scope.modelAssetCategory.Price = "";
        $scope.modelAssetCategory.NoteCategory = "";
    };
    $scope.addAssetCategory = function () {
        $scope.modelAssetCategory.TicketCodeCategory = $rootScope.TicketCode;
        validationSelect($scope.modelAssetCategory);
        if ($scope.assetcategoryform.validate() && !validationSelect($scope.modelAssetCategory).Status) {
            //var number = Number($scope.modelAssetCategory.Price.replace(/[^0-9.-]+/g, ""));
            //$scope.modelAssetCategory.Price = number;
            //console.log("Money: " + $scope.modelAssetCategory.Price);
            dataserviceMaintenance.insertAssetCategory($scope.modelAssetCategory, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $scope.reloadData();
                    $rootScope.reloadTabDetails();
                    dataserviceMaintenance.getTotalMoneyAsset($scope.modelAssetCategory.TicketCodeCategory, function (rs) {
                        rs = rs.data;
                        if (!rs.Error) {
                            var div = document.getElementById('content');
                            div.innerHTML = formatNumber(rs.Object, '.', ',');
                            function formatNumber(nStr, decSeperate, groupSeperate) {
                                nStr += '';
                                x = nStr.split(decSeperate);
                                x1 = x[0];
                                x2 = x.length > 1 ? '.' + x[1] : '';
                                var rgx = /(\d+)(\d{3})/;
                                while (rgx.test(x1)) {
                                    x1 = x1.replace(rgx, '$1' + groupSeperate + '$2');
                                }
                                return "Tổng tiền: " + x1 + x2 + " VNĐ";
                            }
                            dataserviceMaintenance.updateAsset($scope.modelAssetCategory, function (rs) {
                                rs = rs.data;
                                if (rs.Error) {
                                    App.toastrError(rs.Title);
                                } else {
                                    $rootScope.reloadTabDetails();
                                }
                            });
                        }
                    });
                }
            });
        }
    };
    $scope.cancel = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderMaintenance + '/cancel.html',
            controller: 'cancel',
            backdrop: true,
            size: '70'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () { });
    };
    $scope.delete = function (id) {
        $scope.modelAssetCategory.TicketCodeCategory = $rootScope.TicketCodeCategory;
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceMaintenance.deleteCategory(id, function (rs) {
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
            $scope.reloadData();
            dataserviceMaintenance.getTotalMoneyAsset($scope.modelAssetCategory.TicketCodeCategory, function (rs) {
                rs = rs.data;
                if (!rs.Error) {
                    var div = document.getElementById('content');
                    div.innerHTML = formatNumber(rs.Object, '.', ',');
                    function formatNumber(nStr, decSeperate, groupSeperate) {
                        nStr += '';
                        x = nStr.split(decSeperate);
                        x1 = x[0];
                        x2 = x.length > 1 ? '.' + x[1] : '';
                        var rgx = /(\d+)(\d{3})/;
                        while (rgx.test(x1)) {
                            x1 = x1.replace(rgx, '$1' + groupSeperate + '$2');
                        }
                        return caption.ASMTNC_TAB_CATEGORY_LBL_SUM_MONEY + x1 + x2 + caption.ASMTNC_TAB_CATEGORY_LBL_UNIT_MONEY;
                    }
                    dataserviceMaintenance.updateAsset($scope.modelAssetCategory, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            $rootScope.reloadTabDetails();
                        }
                    });
                }
            });
        }, function () {
        });
    };
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 
        if (data.CategoryName == "" || data.CategoryName == null) {
            $scope.errorCategoryName = true;
            mess.Status = true;
        } else {
            $scope.errorCategoryName = false;
        }
        if (data.Currency == "") {
            $scope.errorCurrencyAsset = true;
            mess.Status = true;
        } else {
            $scope.errorCurrencyAsset = false;
        }
        return mess;
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "CategoryName" && $scope.modelAssetCategory.CategoryName != "") {
            $scope.errorCategoryName = false;
        }
        if (SelectType == "Currency" && $scope.modelAssetCategory.Currency != "") {
            $scope.errorCurrencyAsset = false;
        }
    }
    //Format Input Money 1
    $("input[data-type='currency']").on({
        keyup: function () {
            formatCurrency($(this));
        },
        blur: function () {
            formatCurrency($(this), "blur");
        }
    });
    function formatNumber(n) {
        // format number 1000000 to 1,234,567
        return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }
    function formatCurrency(input, blur) {
        // appends $ to value, validates decimal side
        // and puts cursor back in right position.

        // get input value
        var input_val = input.val();

        // don't validate empty input
        if (input_val === "") { return; }

        // original length
        var original_len = input_val.length;

        // initial caret position 
        var caret_pos = input.prop("selectionStart");

        // check for decimal
        if (input_val.indexOf(".") >= 0) {

            // get position of first decimal
            // this prevents multiple decimals from
            // being entered
            var decimal_pos = input_val.indexOf(".");

            // split number by decimal point
            var left_side = input_val.substring(0, decimal_pos);
            var right_side = input_val.substring(decimal_pos);

            // add commas to left side of number
            left_side = formatNumber(left_side);

            // validate right side
            right_side = formatNumber(right_side);

            // On blur make sure 2 numbers after decimal
            if (blur === "blur") {
                right_side += "";
            }

            // Limit decimal to only 2 digits
            right_side = right_side.substring(0, 2);

            // join number by .
            input_val = "" + left_side + "." + right_side;

        } else {
            // no decimal entered
            // add commas to number
            // remove all non-digits
            input_val = formatNumber(input_val);
            input_val = "" + input_val;

            // final formatting
            if (blur === "blur") {
                input_val += "";
            }
        }

        // send updated string to input
        input.val(input_val);

        // put caret back in the right position
        var updated_len = input_val.length;
        caret_pos = updated_len - original_len + caret_pos;
        input[0].setSelectionRange(caret_pos, caret_pos);
    }
    //End Format
    function showHideSearch() {
        $(".btnSearch").click(function () {
            $(".input-search").removeClass('hidden');
            $(".btnSearch").hide();
        });
        $(".close-input-search").click(function () {
            $(".input-search").addClass('hidden');
            $(".btnSearch").show();
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
    }
    setTimeout(function () {
        showHideSearch();
        loadDate();
    }, 200);
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, DTColumnBuilder, DTInstances, dataserviceMaintenance, $filter) {
    $scope.CheckCode = '';
    $scope.model = {
        Currency: '',
        //TicketID: ''
        //Status: $rootScope.listStatus.length > 0 ? $rootScope.listStatus[0].Code : '',
    }

    $scope.modelWf = {
        WorkflowCode: "",
        ObjectType: "ASSET_MAINTENANCE",
        ObjectInst: "",
    };

    $scope.listObjActCode = [];
    dataserviceMaintenance.getObjActCode(function (rs) {
        rs = rs.data;
        $scope.listObjActCode = rs;
        if ($scope.listObjActCode.length == 1) {
            $scope.model.ObjActCode = $scope.listObjActCode[0].Code;
        }
    })

    $scope.initLoad = function () {
        dataserviceMaintenance.getGenReqCode(function (rs) {
            rs = rs.data;
            if (!rs.Error) {
                $scope.model.TicketCode = rs;
            }
        });
        //Load table category
        $rootScope.TicketCodeCategory = $scope.model.TicketCode;
        //Load table asset
        $rootScope.TicketCode = $scope.model.TicketCode;
        dataserviceMaintenance.getCurrency(function (result) {
            result = result.data;
            $scope.ListCurrency = result;
        });
        dataserviceMaintenance.getWorkFlow(function (result) {
            result = result.data;
            $rootScope.lstWorkflow = result;
        });
        dataserviceMaintenance.getStatusAct(function (rs) {
            rs = rs.data;
            $scope.lstStatus = rs;
        })
        dataserviceMaintenance.suggestWF($scope.modelWf.ObjectType, function (rs) {
            rs = rs.data;
            $scope.model.WorkflowCat = rs;
            setTimeout(function () {
                $rootScope.loadDiagramWF($scope.model.WorkflowCat);
            }, 400)
        })
    }
    $scope.initLoad();

    //Edit Activity Instance
    $scope.editInstAct = function (id, objCode) {
        dataserviceMaintenance.checkPermissionEditActivityById(id, function (rs) {
            rs = rs.data;
            if (!rs) {
                return App.toastrError(caption.COM_MSG_PERMISSION_EDIT_ACT);
            }
            dataserviceMaintenance.getItemActInst(id, function (rs) {
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
                    dataserviceMaintenance.getLogStatus($scope.model.TicketCode, function (rs) {
                        rs = rs.data;
                        var lstStatus = JSON.parse(rs.Status);
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

    $scope.changeWorkFlowInts = function (a) {
        dataserviceMaintenance.getStepWorkFlow(a, function (rs) {
            data = rs.data;
            $scope.lstStep = data.list;
            setTimeout(function () {
                $('#progressbar li').css('width', 'calc(100%/' + data.list.length + ')');
            }, 10);
        })
    }
    $scope.changeStatus = function () {
        if ($scope.model.Status == "REPEAT_REQUIRE_REWORK" || $scope.model.Status == "FINAL_REQUIRE_REWORK") {
            dataserviceMaintenance.getListRepeat($scope.model.TicketCode, function (rs) {
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

    $scope.chkSubTab = function () {
        if ($rootScope.AssetCode == '') {
            App.toastrError(caption.ASSET_MSG_ADD_ASSET_FIRST);
        }
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
        $rootScope.IsId = false;
    };
    $scope.chkAdd = function () {
        if ($scope.CheckCode == '') {
            App.toastrError(caption.ASMTNC_MSG_SAVE_TICKET);
        }
    };
    $scope.deleteList = function () {
        $scope.model.Title = "";
        $scope.model.Branch = "";
        $scope.model.DepartTransfer = "";
        $scope.model.StartTime = "";
        $scope.model.LocationTransfer = "";
        $scope.model.UserTransfer = "";
        $scope.model.UnitMaintenance = "";
        $scope.model.ReceivedTime = "";
        $scope.model.LocationReceived = "";
        $scope.model.Note = "";
        $scope.model.TotalMoney = "";
        $scope.model.Currency = "";
    };
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            var temp = $rootScope.checkData($scope.model);
            if (temp.Status) {
                App.toastrError(temp.Title);
                return;
            }
            if ($rootScope.IsId == false) {
                dataserviceMaintenance.insertHeaderMaintenance($scope.model, function (result) {
                    result = result.data;
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        $scope.model.TicketID = result.ID;
                        $rootScope.TicketCode = $scope.model.TicketCode;
                        $rootScope.UserCategory = $scope.model.UserTransfer;
                        $rootScope.TicketCodeCategory = $scope.model.TicketCode;
                        $rootScope.ObjCode = $scope.model.TicketCode;

                        $rootScope.IsId = true;
                        $rootScope.AssetCode = $scope.model.TicketCode;
                        $scope.CheckCode = $scope.model.TicketCode;
                        App.toastrSuccess(result.Title);
                        //$rootScope.reloadTabHeader();

                        //Workflow
                        $scope.modelWf.ObjectInst = $scope.model.TicketCode;
                        $scope.modelWf.WorkflowCode = $scope.model.WorkflowCat;
                        $scope.modelWf.ObjectName = $scope.model.Title;
                        dataserviceMaintenance.createWfInstance($scope.modelWf, function (rs) {
                            rs = rs.data;
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            } else {
                                //App.toastrSuccess(rs.Title);
                                var wfInstCode = rs.Object.WfInstCode;
                                $scope.WfInstCode = wfInstCode;
                                $rootScope.loadDiagramWfInst($scope.model.TicketCode, $scope.modelWf.ObjectType);
                                dataserviceMaintenance.getLogStatus($scope.model.TicketCode, function (rs) {
                                    rs = rs.data;
                                    var lstStatus = JSON.parse(rs.Status);
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
            }
            else {
                dataserviceMaintenance.updateHeader($scope.model, function (result) {
                    result = result.data;
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                        $rootScope.reloadTabHeader();
                        //$rootScope.IsId = false;
                        $scope.cancel();
                    }
                });

            }
        }
    }
    //Upload file
    $scope.addFile = function () {
        dataserviceMaintenance.checkTicketCode($scope.model.TicketCode, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderMaintenance + '/file_add.html',
                    controller: 'file_add',
                    backdrop: 'static',
                    size: '40'
                });
                modalInstance.result.then(function (d) {
                    dataserviceMaintenance.getListFile($scope.model.TicketCode, function (rs) {
                        rs = rs.data;
                        $scope.model.listFile = rs;
                    });
                }, function () {
                });
            }
        });
    }
    $scope.deleteFile = function (id) {
        dataserviceMaintenance.deleteFile(id, function (result) {
            result = result.data;
            if (result.Error) {
                App.toastrError(result.Title);
            } else {
                App.toastrSuccess(result.Title);
                dataserviceMaintenance.getListFile($scope.model.TicketCode, function (rs) {
                    rs = rs.data;
                    $scope.model.listFile = rs;
                });
            }
        });
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Branch" && $scope.model.Branch != "") {
            $scope.errorBranch = false;
        }
        if (SelectType == "UnitMaintenance" && $scope.model.UnitMaintenance != "") {
            $scope.errorUnitMaintenance = false;
        }
        if (SelectType == "DepartTransfer" && $scope.model.DepartTransfer != "") {
            $scope.errorDepartTransfer = false;
            dataserviceMaintenance.getUserTransfer($scope.model.DepartTransfer, function (rs) {
                rs = rs.data;
                $rootScope.listUserTransfer = rs;
            });
        }
        if (SelectType == "UserTransfer" && $scope.model.Branch != "") {
            $scope.errorUserTransfer = false;
        }
        //if (SelectType == "ObjActCode" && $scope.model.ObjActCode != "") {
        //    $scope.errorObjActCode = false;
        //}
        if (SelectType == "Currency" && $scope.model.Currency != "") {
            $scope.errorCurrency = false;
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 
        if (data.Branch == "" || data.Branch == null) {
            $scope.errorBranch = true;
            mess.Status = true;
        } else {
            $scope.errorBranch = false;
        }

        if (data.DepartTransfer == "" || data.DepartTransfer == null) {
            $scope.errorDepartTransfer = true;
            mess.Status = true;
        } else {
            $scope.errorDepartTransfer = false;
        }

        if (data.UserTransfer == "" || data.UserTransfer == null) {
            $scope.errorUserTransfer = true;
            mess.Status = true;
        } else {
            $scope.errorUserTransfer = false;
        }

        if (data.UnitMaintenance == "" || data.UnitMaintenance == null) {
            $scope.errorUnitMaintenance = true;
            mess.Status = true;
        } else {
            $scope.errorUnitMaintenance = false;
        }

        //if (data.ObjActCode == "" || data.ObjActCode == null) {
        //    $scope.errorObjActCode = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorObjActCode = false;
        //}
        if (data.Currency == "") {
            $scope.errorCurrency = true;
            mess.Status = true;
        } else {
            $scope.errorCurrency = false;
        }

        return mess;
    }
    function initDateTime() {
        $("#StartTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ReceivedTime').datepicker('setStartDate', maxDate);
        });
        $("#ReceivedTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#StartTime').datepicker('setEndDate', maxDate);
        });
    }
    function convertDatetime(date) {
        var result = '';
        if (date != null && date != '') {
            var array = date.split('/');
            result = array[1] + '/' + array[0] + '/' + array[2];
        }
        return result;
    }
    setTimeout(function () {
        initDateTime();
        //initAutocomplete();
        setModalDraggable('.modal-dialog');
        setModalMaxHeight('.modal');
    }, 200);
});

app.controller('editMaintenance', function ($scope, $rootScope, $compile, $uibModal, DTColumnBuilder, DTInstances, dataserviceMaintenance, $filter, $location, myService) {
    $scope.isDisabled = true;
    $scope.checkRoleWf = false;
    $scope.model = {
        listObjActCode: [],
    }

    var para = myService.getData();
    if (para == undefined) {
        para = $location.search().id;
    }
    if (para == undefined || para <= 0) {
        location.href = "/Admin/AssetMaintenance";
    }

    $scope.modelWf = {
        WorkflowCode: "",
        ObjectType: "ASSET_MAINTENANCE",
        ObjectInst: "",
    };

    if (para != undefined) {
        $scope.initData = function () {
            dataserviceMaintenance.getWorkFlow(function (result) {
                result = result.data;
                $rootScope.lstWorkflow = result;
            });
            dataserviceMaintenance.getItemMaintenance(para, function (rs) {
                rs = rs.data;
                $rootScope.TicketCode = rs.Object.TicketCode;
                $rootScope.AssetCode = rs.Object.TicketCode; // de hien o ngoai  index phan edit. cua  tai san
                $scope.model = rs.Object;
                $scope.model.StartTime = $filter('date')(new Date($scope.model.StartTime), 'dd/MM/yyyy');
                $scope.model.ReceivedTime = $filter('date')(new Date($scope.model.ReceivedTime), 'dd/MM/yyyy');
                //$scope.model.Status = $rootScope.listStatus.length > 0 ? $rootScope.listStatus[2].Code : "";
                //get TicketCode and User to category
                $rootScope.UserCategory = $scope.model.UserTransfer;
                $rootScope.TicketCodeCategory = $scope.model.TicketCode;
                //get TotalMoney
                dataserviceMaintenance.getTotalMoneyAsset($scope.model.TicketCode, function (rs) {
                    rs = rs.data;
                    if (!rs.Error) {
                        //var div = document.getElementById('content');
                        //div.innerHTML = formatNumber(rs.Object, '.', ',');
                        function formatNumber(nStr, decSeperate, groupSeperate) {
                            nStr += '';
                            x = nStr.split(decSeperate);
                            x1 = x[0];
                            x2 = x.length > 1 ? '.' + x[1] : '';
                            var rgx = /(\d+)(\d{3})/;
                            while (rgx.test(x1)) {
                                x1 = x1.replace(rgx, '$1' + groupSeperate + '$2');
                            }
                            return caption.ASMTNC_TAB_CATEGORY_LBL_SUM_MONEY + x1 + x2 + caption.ASMTNC_TAB_CATEGORY_LBL_UNIT_MONEY;
                        }
                    }
                });
                dataserviceMaintenance.getListFile($rootScope.TicketCode, function (rs) {
                    rs = rs.data;
                    $scope.model.listFile = rs;
                });
                dataserviceMaintenance.getObjActCode(function (rs) {
                    rs = rs.data;
                    $scope.model.listObjActCode = rs;
                });
                $scope.model.ObjCode = $rootScope.TicketCode;
                dataserviceMaintenance.checkRoleUser($scope.model.ObjActCode, function (rs) {
                    rs = rs.data;
                    if (rs == true) {
                        $scope.isDisabled = false;
                        $scope.checkRoleWf = true;
                    }
                })
                dataserviceMaintenance.getCatActivityWorkFlow($scope.model.ObjActCode, function (rs) {

                    rs = rs.data;
                    $rootScope.listCatActivity = rs;
                });
                dataserviceMaintenance.getCurrency(function (result) {
                    result = result.data;
                    $scope.ListCurrency = result;
                });
                dataserviceMaintenance.getUserTransfer($scope.model.DepartTransfer, function (rs) {
                    rs = rs.data;
                    $rootScope.listUserTransfer = rs;
                });
                dataserviceMaintenance.getAssetInTicket($rootScope.TicketCode, function (rs) {
                    rs = rs.data;
                    $scope.lstProd = rs;
                })


                try {
                    var lstStatus = JSON.parse($scope.model.Status);
                    console.log(lstStatus.length);
                } catch (e) {
                    lstStatus = [];
                }
                if (lstStatus.length > 0) {
                    $scope.model.Status = lstStatus[lstStatus.length - 1].Code;
                    $scope.model.StatusDefault = lstStatus[lstStatus.length - 1].Code;
                    $scope.model.StatusTemp = lstStatus[lstStatus.length - 1].Code;
                    $scope.listStatusLog = lstStatus;
                }
                setTimeout(function () {
                    $rootScope.loadDiagramWfInst($scope.model.TicketCode, $scope.modelWf.ObjectType);
                }, 800)
            });
        }
        $scope.initData();
    }
    else {
        $location.path("/");
    }

    //Edit Activity Instance
    $scope.editInstAct = function (id, objCode) {
        dataserviceMaintenance.checkPermissionEditActivityById(id, function (rs) {
            rs = rs.data;
            if (!rs) {
                return App.toastrError(caption.COM_MSG_PERMISSION_EDIT_ACT);
            }
            dataserviceMaintenance.getItemActInst(id, function (rs) {
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
                    dataserviceMaintenance.getLogStatus($scope.model.TicketCode, function (rs) {
                        rs = rs.data;
                        var lstStatus = JSON.parse(rs.Status);
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

    $scope.changeStatus = function () {
        if ($scope.model.Status == "REPEAT_REQUIRE_REWORK" || $scope.model.Status == "FINAL_REQUIRE_REWORK") {
            dataserviceMaintenance.getListRepeat($scope.model.TicketCode, function (rs) {
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

    $scope.loadData = function () {
        dataserviceMaintenance.getItemMaintenance(para.TicketID, function (rs) {
            rs = rs.data;
            $scope.model = rs.Object;
            $scope.model.StartTime = $filter('date')(new Date($scope.model.StartTime), 'dd/MM/yyyy');
            $scope.model.ReceivedTime = $filter('date')(new Date($scope.model.ReceivedTime), 'dd/MM/yyyy');
        });
    }
    $scope.viewActivityStatus = function () {
        dataserviceMaintenance.getActivityStatus($scope.model.TicketID, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderMaintenance + '/activity.html',
                    controller: 'activity',
                    backdrop: 'static',
                    size: '40',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function (d) {

                }, function () {
                });
            }
        })
    }
    //Thay đổi trạng thái
    $scope.edit = function () {
        //$scope.isDisabled = false;
        //dataserviceMaintenance.editstatus($scope.model.TicketID, function (rs) {rs=rs.data;
        //    if (rs.Error) {
        //        App.toastrError(rs.Title);
        //    } else {
        //        App.toastrSuccess(rs.Title);
        //        $scope.loadData();
        //        $rootScope.reloadTabHeader();
        //    }
        //});
    };
    $scope.pending = function () {
        //dataserviceMaintenance.pending($scope.model.TicketID, function (rs) {rs=rs.data;
        //    if (rs.Error) {
        //        App.toastrError(rs.Title);
        //    } else {
        //        App.toastrSuccess(rs.Title);
        //        $scope.loadData();
        //        $rootScope.reloadTabHeader();
        //    }
        //});
    }
    $scope.complete = function () {
        //dataserviceMaintenance.complete($scope.model.TicketID, $scope.model.Status, function (rs) {rs=rs.data;
        //    if (rs.Error) {
        //        App.toastrError(rs.Title);
        //    } else {
        //        App.toastrSuccess(rs.Title);
        //        $scope.loadData();
        //        $rootScope.reloadTabHeader();
        //    }
        //});
    }
    $scope.reject = function () {
        //dataserviceMaintenance.reject($scope.model.TicketID, $scope.model.Status, function (rs) {rs=rs.data;
        //    if (rs.Error) {
        //        App.toastrError(rs.Title);
        //    } else {
        //        App.toastrSuccess(rs.Title);
        //        $scope.loadData();
        //        $rootScope.reloadTabHeader();
        //    }
        //});
    }

    $scope.cancel = function () {
        $uibModalInstance.close('cancel');
        $rootScope.TicketCode = "";
        $rootScope.AssetCode = "";
    };
    $scope.deleteList = function () {
        $scope.model.Title = "";
        $scope.model.Branch = "";
        $scope.model.DepartTransfer = "";
        $scope.model.StartTime = "";
        $scope.model.LocationTransfer = "";
        $scope.model.UserTransfer = "";
        $scope.model.UnitMaintenance = "";
        $scope.model.ReceivedTime = "";
        $scope.model.LocationReceived = "";
        $scope.model.Note = "";
        $scope.model.TotalMoney = "";
        $scope.model.Currency = "";
    };
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.editform.validate() && !validationSelect($scope.model).Status) {
            dataserviceMaintenance.updateHeader($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    dataservice.updateStatusWF("ASSET_MAINTENANCE", $scope.model.TicketCode, $scope.model.Status, $scope.model.ActRepeat, function (rs) {
                        if ($scope.model.Status != "FINAL_DONE") {
                            dataserviceMaintenance.getActionStatus($scope.model.TicketCode, function (rs) {
                                rs = rs.data;
                                var json = JSON.parse(rs[0].StatusLog);
                                var arr = [];
                                arr.push(json[json.length - 1]);
                                $scope.loghis = arr;
                                $scope.model.Status = $scope.loghis[0].StatusCode;
                            })
                            dataserviceMaintenance.getItemHeaderWithCode($scope.model.TicketCode, function (rs) {
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
    $scope.addFile = function () {
        $rootScope.TicketCode = $scope.model.TicketCode;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderMaintenance + '/file_add.html',
            controller: 'file_add',
            backdrop: 'static',
            size: '40'
        });
        modalInstance.result.then(function (d) {
            dataserviceMaintenance.getListFile($rootScope.TicketCode, function (rs) {
                rs = rs.data;
                $scope.model.listFile = rs;
            });
        }, function () {
        });
    }
    $scope.deleteFile = function (id) {
        dataserviceMaintenance.deleteFile(id, function (result) {
            result = result.data;
            if (result.Error) {
                App.toastrError(result.Title);
            } else {
                App.toastrSuccess(result.Title);
                dataserviceMaintenance.getListFile($rootScope.TicketCode, function (rs) {
                    rs = rs.data;
                    $scope.model.listFile = rs;
                });
            }
        });
    }
    $scope.resultActivity = function () {
        if ($scope.model.ActCode == "" || $scope.model.ActCode == null) {
            $scope.errorActCode = true;
        } else {
            $scope.errorObjActCode = false;
            //mở form
            $rootScope.ActCode = $scope.model.ActCode;
            $rootScope.ObjActCode = $scope.model.ObjActCode;
            $rootScope.ObjCode = $scope.model.TicketCode;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderMaintenance + '/resultActivity.html',
                controller: 'resultActivity',
                backdrop: 'static',
                size: '50',
            });
        }
    }
    $scope.tableActivity = function () {
        $rootScope.ActCode = $scope.model.ActCode;
        $rootScope.ObjActCode = $scope.model.ObjActCode;
        $rootScope.ObjCode = $scope.model.TicketCode;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderMaintenance + '/tableActivity.html',
            controller: 'tableActivity',
            backdrop: 'static',
            size: '70'
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }
    $scope.statusObjAct = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderInventory + '/statusObjAct.html',
            controller: 'statusObjAct',
            backdrop: 'static',
            size: '50',
            resolve: {
                para: function () {
                    var obj = { ObjActCode: $scope.model.ObjActCode, ObjCode: $scope.model.TicketCode };
                    return obj;
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Branch" && $scope.model.Branch != "") {
            $scope.errorBranch = false;
        }
        if (SelectType == "UnitMaintenance" && $scope.model.UnitMaintenance != "") {
            $scope.errorUnitMaintenance = false;
        }
        if (SelectType == "DepartTransfer" && $scope.model.DepartTransfer != "") {
            $scope.errorDepartTransfer = false;
            dataserviceMaintenance.getUserTransfer($scope.model.DepartTransfer, function (rs) {
                rs = rs.data;
                $rootScope.listUserTransfer = rs;
            });
        }
        if (SelectType == "UserTransfer" && $scope.model.Branch != "") {
            $scope.errorUserTransfer = false;
        }
        //if (SelectType == "ObjActCode" && $scope.model.ObjActCode != "") {
        //    $scope.errorObjActCode = false;
        //}
        //if (SelectType == "ActCode" && $scope.model.ActCode != "") {
        //    $scope.errorActCode = false;
        //    dataserviceMaintenance.insertLogData($scope.model, function (result) {
        //        result = result.data;
        //        if (result.Error) {
        //            App.toastrError(result.Title);
        //        } else {
        //            App.toastrSuccess(result.Title);
        //        }
        //    });
        //}
        if (SelectType == "Currency" && $scope.model.Currency != "") {
            $scope.errorCurrency = false;
        }
    }
    $scope.checkRole = function () {
        if ($scope.checkRoleWf == false) {
            App.toastrError(caption.COM_MSG_NO_PERMISSION);
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 
        if (data.Branch == "" || data.Branch == null) {
            $scope.errorBranch = true;
            mess.Status = true;
        } else {
            $scope.errorBranch = false;
        }

        if (data.DepartTransfer == "" || data.DepartTransfer == null) {
            $scope.errorDepartTransfer = true;
            mess.Status = true;
        } else {
            $scope.errorDepartTransfer = false;
        }

        if (data.UserTransfer == "" || data.UserTransfer == null) {
            $scope.errorUserTransfer = true;
            mess.Status = true;
        } else {
            $scope.errorUserTransfer = false;
        }

        if (data.UnitMaintenance == "" || data.UnitMaintenance == null) {
            $scope.errorUnitMaintenance = true;
            mess.Status = true;
        } else {
            $scope.errorUnitMaintenance = false;
        }

        if (data.Currency == "") {
            $scope.errorCurrency = true;
            mess.Status = true;
        } else {
            $scope.errorCurrency = false;
        }

        return mess;
    };
    function initDateTime() {
        $("#StartTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ReceivedTime').datepicker('setStartDate', maxDate);
        });
        $("#ReceivedTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#StartTime').datepicker('setEndDate', maxDate);
        });
    }

    $scope.print = function () {
        var date = new Date();
        var toDay = $filter('date')(date, 'dd/MM/yyyy');
        var infoToDay = toDay.split("/");

        var infoTime = $scope.model.StartTime.split("/");

        var personRecei = "";
        for (var i = 0; i < $scope.listUserTransfer.length; i++) {
            if ($scope.model.UserTransfer === $scope.listUserTransfer[i].Code) {
                personRecei = $scope.listUserTransfer[i].Name;
                break;
            }
        }
        var unit = "";
        for (var i = 0; i < $rootScope.listUnitMaintenance.length; i++) {
            if ($scope.model.UnitMaintenance === $rootScope.listUnitMaintenance[i].Code) {
                unit = $rootScope.listUnitMaintenance[i].Name;
                break;
            }
        }

        var content = '<p><strong>Đơn vị:</strong>................................. </p>' +
            '<p><strong>Phòng ban:</strong>................................</p>' +
            '<p></p>' +
            '<p style="text-align: center;"><strong>PHIẾU SỬA CHỮA VÀ BẢO DƯỠNG TÀI SẢN</strong></p>' +
            '<p style="text-align: center;"><em>Ngày ' + infoTime[0] + ' tháng ' + infoTime[1] + ' năm ' + infoTime[2] + '</em></p>' +
            '<p>Tiêu đề: <strong>' + $scope.model.Title + '</strong></p>' +
            '<p>Người sửa chữa: <strong>' + personRecei + '</strong></p>' +
            '<p>Đơn vị sửa chữa: <strong>' + unit + '</strong></p>' +
            '<p>Địa điểm chuyển: ' + $scope.model.LocationTransfer + '</p>' +
            '<p>Địa điểm nhận: ' + $scope.model.LocationReceived + '</p>' +
            '<p>Ghi chú: ' + $scope.model.Note + '</p>' +
            '<p style="text-align: right;"><em>Ngày</em><em> ' + infoToDay[0] + ' </em><em>tháng </em><em>' + infoToDay[1] + ' </em><em>năm ' + infoToDay[2] + '</em><em></em></p>';
        var footer = '<p></p><br />' +
            '<p></p><br />' +'<table>' +
            '<tbody>' +
            '<tr>' +
            '<td width="137">' +
            '<p><strong>Giám đốc</strong></p>' +
            '<p><em>(Ký, họ tên) </em></p>' +
            '</td>' +
            '<td width="159">' +
            '<p><strong>Kế toán trưởng</strong></p>' +
            '<p><em>(Ký, họ tên) </em></p>' +
            '</td>' +
            '<td width="141">' +
            '<p><strong>Người nộp tiền</strong></p>' +
            '<p><em>(Ký, họ tên) </em></p>' +
            '</td>' +
            '<td width="137">' +
            '<p><strong>Người lập phiếu</strong></p>' +
            '<p><em>(Ký, họ tên) </em></p>' +
            '</td>' +
            '<td width="113">' +
            '<p><strong>Thủ quỹ</strong></p>' +
            '<p><em>(Ký, họ tên)</em></p>' +
            '</td>' +
            '</tr>' +
            '</tbody>' +
            '</table>' +
            //'<p>Tổng tiền (viết bằng chữ):...........................................................................</p>' +
            '<p></p>';


        var detailHeaderProd = '<table style="border-collapse: collapse;height: auto; width: 100%;" border="1">' +
            '<tbody>' +
            '<tr>' +
            '<td style="width: 10%; text-align: center;">' +
            '<p>STT</p>' +
            '</td>' +
            '<td style="width: 70%; text-align: center;">' +
            '<p>Tài sản</p>' +
            '</td>' +
            '<td style="width: 20%; text-align: center;">' +
            '<p>Số lượng</p>' +
            '</td>' +
            '</tr>';

        //$scope.lstProductDetail
        var detailProduct = "";
        var idx = 1;
        var total = 0;
        for (var i = 0; i < $scope.lstProd.length; i++) {
            detailProduct += '<tr>' +
                '<td style="width: 26.7578px; text-align: center;">' +
                '<p>' + idx + '</p>' +
                '</td>' +
                '<td style="width: 193.008px; text-align: left;">' +
                '<p>' + $scope.lstProd[i].AssetName + ';</p>' +
                '</td>' +
                '<td style="width: 58.0078px; text-align: center;">' +
                '<p>' + $scope.lstProd[i].AssetQuantity + '</p>' +
                '</td>' +
                '</tr>';
            idx++;
        }

        var endDetailProd = '</tbody>' +
            '</table >';

        content += detailHeaderProd + detailProduct + endDetailProd + footer;

        var frame1 = document.createElement('iframe');
        document.body.appendChild(frame1);
        var frameDoc = frame1.contentWindow ? frame1.contentWindow : frame1.contentDocument.document ? frame1.contentDocument.document : frame1.contentDocument;

        frameDoc.document.write('<style>@page{margin: 30px;size: auto;}</style>' +
            '<body onload="window.print()">' + content + '</body>');
        frameDoc.document.close();
        setTimeout(function () {
            document.body.removeChild(frame1);
        }, 1500);
    }

    setTimeout(function () {
        initDateTime();
        //initAutocomplete();
        setModalDraggable('.modal-dialog');
        setModalMaxHeight('.modal');
    }, 200);
});

app.controller('reasonReject', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataserviceMaintenance, $timeout, para) {
    $scope.model = {
        //Reason: para,
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        $uibModalInstance.close($scope.model);
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 50);
});

app.controller('file_add', function ($scope, $rootScope, $compile, $uibModal, $confirm, dataserviceMaintenance, $uibModalInstance) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.initData = function () {
        dataserviceMaintenance.getGenReqFileCode(function (rs) {
            rs = rs.data;
            $scope.model.FileCode = rs;
        });
    }
    $scope.initData();
    $scope.model = {
    }
    $scope.submit = function () {
        if ($scope.addformfile.validate()) {
            var file = document.getElementById("File").files[0];
            if (file == null || file == undefined) {
                App.toastrError("{{'COM_MSG_CHOSE_FILE' | translate}}");
            } else {
                var formData = new FormData();
                formData.append("fileUpload", file);
                formData.append("FileName", $scope.model.FileName);
                formData.append("FileCode", $scope.model.FileCode);
                formData.append("TicketCode", $rootScope.TicketCode);
                dataserviceMaintenance.insertFile(formData, function (result) {
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
    }
});

app.controller('resultActivity', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataserviceMaintenance, $timeout) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.model = {
        AttrCode: '',
        AttrDataType: '',
        AttrUnit: '',
    }
    $scope.initLoad = function () {
        $scope.model.ActCode = $rootScope.ActCode;
        $scope.model.ObjCode = $rootScope.ObjCode;
        $scope.model.WorkFlowCode = $rootScope.ObjActCode;
        var obj = { WorkFlowCode: $scope.model.WorkFlowCode, ActCode: $scope.model.ActCode };
        dataserviceMaintenance.getItemAttrSetup(obj, function (rs) {
            rs = rs.data;
            $scope.model.listAttrData = rs;
        });
        dataserviceMaintenance.getListActivityAttrData($scope.model.ObjCode, $scope.model.ActCode, $scope.model.WorkFlowCode, function (rs) {
            rs = rs.data;
            $scope.model.listAttrDataSetUp = rs;
        });
    };
    $scope.initLoad();
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.resultActivity.validate() && !validationSelect($scope.model).Status) {
            var temp = $rootScope.checkData($scope.model);
            if (temp.Status) {
                App.toastrError(temp.Title);
                return;
            }
            dataserviceMaintenance.insertAttrData($scope.model, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    dataserviceMaintenance.getListActivityAttrData($scope.model.ObjCode, $scope.model.ActCode, $scope.model.WorkFlowCode, function (rs) {
                        rs = rs.data;
                        $scope.model.listAttrDataSetUp = rs;
                    });
                }
            });
        }
    }
    $scope.updateStatus = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.ASSET_INVENTORY_MSG_YN_CHANGE_STATUS;
                $scope.ok = function () {
                    dataserviceMaintenance.updateAttrData(id, function (rs) {
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
            dataserviceMaintenance.getListActivityAttrData($rootScope.ObjCode, $rootScope.ActCode, $rootScope.ObjActCode, function (rs) {
                rs = rs.data;
                $scope.model.listAttrDataSetUp = [];
                $scope.model.listAttrDataSetUp = rs;
            });
        }, function () {
        });
    }
    $scope.changeSelect = function (SelectType) {
        if (SelectType == "AttrCode" && $scope.model.AttrCode != "") {
            for (var i = 0; i < $scope.model.listAttrData.length; i++) {
                $scope.model.AttrUnit = $scope.model.listAttrData[i].UnitCode;
                $scope.model.AttrDataType = $scope.model.listAttrData[i].DataTypeCode;
            }
            $scope.errorAttrCode = false;
        }
    }
    $scope.delete = function (id) {
        dataserviceMaintenance.deleteAttrData(id, function (result) {
            result = result.data;
            if (result.Error) {
                App.toastrError(result.Title);
            } else {
                App.toastrSuccess(result.Title);
                dataserviceMaintenance.getListActivityAttrData($scope.model.ObjCode, $scope.model.ActCode, $scope.model.WorkFlowCode, function (rs) {
                    rs = rs.data;
                    $scope.model.listAttrDataSetUp = rs;
                });
            }
        });
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.AttrCode == "") {
            $scope.errorAttrCode = true;
            mess.Status = true;
        } else {
            $scope.errorAttrCode = false;
        }

        //if (data.AttrDataType == "") {
        //    $scope.errorAttrDataType = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorAttrDataType = false;
        //}

        if (data.AttrUnit == "") {
            $scope.errorAttrUnit = true;
            mess.Status = true;
        } else {
            $scope.errorAttrUnit = false;
        }

        return mess;
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 50);
});

app.controller('tableActivity', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceMaintenance, $filter) {
    $scope.model = {
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.model.ActCode = $rootScope.ActCode;
    $scope.model.ObjActCode = $rootScope.ObjActCode;
    $scope.model.TicketCode = $rootScope.ObjCode
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/AssetAllocation/JTableActivity",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.TicketCode = $scope.model.TicketCode;
                d.ObjActCode = $scope.model.ObjActCode;
                d.ActCode = $scope.model.ActCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(20)
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.ID;
                    $scope.edit(Id);
                }
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("ID").withTitle(titleHtml).notSortable().withOption('sClass', 'hidden').renderWith(function (data, type, full, meta) {
        $scope.selected[full.ID] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ActName').withTitle('{{"ASMTNC_TAB_COL_ACTION_NAME" | translate}}').renderWith(function (data, type, full) {
        return '<span>' + data + '</span></br>' + '<span class="badge-customer badge-customer-success"> ' + full.Time + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ActType').withTitle('{{"ASMTNC_TAB_COL_ACTION_TYPE" | translate}}').withOption('sClass', 'w150').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UserAct').withTitle('{{"ASMTNC_TAB_COL_USER_ACTION" | translate}}').withOption('sClass', 'w150').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Result').withTitle('{{"ASMTNC_TAB_COL_RESULT" | translate}}').withOption('sClass', 'w350').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"ASMTNC_TAB_ASSET_COL_ACTION" | translate}}').withOption('sClass', 'w20').renderWith(function (data, type, full) {
        return '<a title="{{&quot; COM_BTN_DELETE &quot; | translate}}" ng-click="delete(' + full.AssetID + ')"  class="fs25"><i class="fas fa-trash"style="--fa-primary-color: red;"></i></button>';
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
    $rootScope.reloadTabTicket = function () {
        reloadData(true);
    }
    $scope.edit = function (id) {
        dataserviceMaintenance.getItemMaintenance(id, function (rs) {
            rs = rs.data;

            $rootScope.TicketCode = rs.Object.TicketCode;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderMaintenance + '/edit.html',
                controller: 'editMaintenance',
                backdrop: 'static',
                size: '70',
                resolve: {
                    para: function () {
                        return rs.Object;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                $scope.reloadTabTicket();
            }, function () {
            });
        });
    }
    $scope.delete = function (id) {
        var list = [];
        list.push(id);
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            resolve: {
                para: function () {
                    return list;
                }
            },
            controller: function ($scope, $uibModalInstance, para) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceMaintenance.deleteItemActivity(para, function (rs) {
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
            size: '30',
        });
        modalInstance.result.then(function (d) {
            $scope.reloadTabTicket();
        }, function () {
        });
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        setModalMaxHeight('.modal');
    }, 200);
});

app.controller('statusObjAct', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceMaintenance, $filter, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.ObjActCode = '';
    $scope.remainMinute = "";
    $scope.listStatusObj = [];
    $scope.initLoad = function () {
        var obj = para;
        dataserviceMaintenance.getStausObjStream(obj, function (rs) {
            rs = rs.data;
            $scope.listStatusObj = [];
            var list = rs;
            for (var i = 0; i < list.length; i++) {
                if (list[i].Status == "STATUS_EDIT_ACT") {
                    list[i].LimitTimePre = $scope.timeRemaining(list[i].Time, list[i].UnitTime);
                }
                if (list[i].UnitTime == "ACTIVITY_GR_PR_WEEK" || list[i].UnitTime == "ACTIVITY_GR_PR_MOUNTH") {
                    list[i].Unit = "Ngày";
                }
                $scope.listStatusObj.push(list[i]);
            }
        });
    }
    //$scope.initLoad();
    $scope.timeRemaining = function (date, type) {
        var dateNow = new Date();
        var date22 = new Date(date);

        var dateNow_s = dateNow.getTime();
        var date22_s = date22.getTime();
        var offset = date22_s - dateNow_s;
        if (offset > 0) {
            if (type == "ACTIVITY_GR_PR_MINUTE") {
                var totalMinutes = Math.round(offset / 1000 / 60);
                return totalMinutes;
            }
            if (type == "ACTIVITY_GR_PR_HOUR") {
                var totalMinutes = Math.round(offset / 1000 / 60 / 60);
                return totalMinutes;
            }
            if (type == "ACTIVITY_GR_PR_DAY") {
                var totalMinutes = Math.round(offset / 1000 / 60 / 60 / 24);
                return totalMinutes;
            }
            if (type == "ACTIVITY_GR_PR_WEEK") {
                var totalMinutes = Math.round(offset / 1000 / 60 / 60 / 24);
                return totalMinutes;
            }
            if (type == "ACTIVITY_GR_PR_MOUNTH") {
                var totalMinutes = Math.round(offset / 1000 / 60 / 60 / 24);
                return totalMinutes;
            }
            return 0;
        } else {
            return 0;
        }
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        setModalMaxHeight('.modal');
        $scope.initLoad();
    }, 300);
});

app.controller('fileAsset', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceMaintenance, $filter, dataserviceSupplier) {
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
            url: "/Admin/AssetMaintenance/JTableFile",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.AssetCode = $rootScope.AssetCode;
                //d.FromDate = $scope.model.FromDate;
                //d.ToDate = $scope.model.ToDate;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(200, "#tblDataAssetMaintenanceFile");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(2)
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileName').withTitle('{{ "CUS_CURD_TAB_FILE_LIST_COL_TITLE" | translate }}').renderWith(function (data, type, full) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('ReposName').withTitle('{{"CUS_CURD_TAB_FILE_LIST_COL_CATEGORY_NAME" | translate}}').renderWith(function (data, type, full) {
        return '<i class="fa fa-folder-open icon-state-warning"></i>&nbsp' + data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Desc').withTitle('{{ "CUS_CURD_TAB_FILE_LIST_COL_NOTE" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{ "CUS_CURD_TAB_FILE_LIST_COL_CREATETIME" | translate }}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeFile').withTitle('Loại tệp').renderWith(function (data, type, full) {
        if (data == "SHARE") {
            return "<label class='text-primary'>Tệp được chia sẻ</label>";
        } else {
            return "Tệp gốc";
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileID').withOption('sClass', 'nowrap text-center').withTitle('{{"Sửa tệp" | translate }}').renderWith(function (data, type, full) {
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
            return '<a ng-click="tabFileHistory(' + full.FileID + ')"  title="{{&quot; Lịch sử sửa tệp &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-history pt5"></i></a>' +
                '<a ng-click="viewExcel(' + full.Id + ', 2' + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else if (word.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'Syncfusion';
            return '<a ng-click="tabFileHistory(' + full.FileID + ')"  title="{{&quot; Lịch sử sửa tệp &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-history pt5"></i></a>' +
                '<a ng-click="viewWord(' + full.Id + ', 2' + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else if (pdf.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'pdf';
            return '<a ng-click="tabFileHistory(' + full.FileID + ')"  title="{{&quot; Lịch sử sửa tệp &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-history pt5"></i></a>' +
                '<a ng-click="viewPDF(' + full.Id + ', 2' + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else if (document.indexOf(full.FileTypePhysic.toUpperCase()) !== -1 || image.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            return '<a ng-click="tabFileHistory(0)"  title="{{&quot; Lịch sử sửa tệp &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-history pt5"></i></a>' +
                '<a ng-click="view(' + full.Id + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else {
            return '<a ng-click="tabFileHistory(0)"  title="{{&quot; Lịch sử sửa tệp &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-history pt5"></i></a>' +
                '<a ng-click="getObjectFile(0)" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').withOption('sClass', 'width_90').renderWith(function (data, type, full) {
        if (full.TypeFile == "SHARE") {
            return '<a ng-click="dowload(\'' + full.FileCode + '\')" target="_blank" style="width: 25px; height: 25px; padding: 0px" title="Tải xuống - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline green " download><i class="fa fa-download pt5"></i></a>';
        } else {
            return '<a title="Sửa" ng-click="edit(\'' + full.FileName + '\',' + full.Id + ')"  class="fs25"><i class="fas fa-edit"></i></a>' +
                '<a ng-click="dowload(\'' + full.FileCode + '\')" style="width: 25px; height: 25px; padding: 0px" title="Tải xuống - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline green"><i class="fa fa-download pt5"></i></a>' +
                '<a title="Xoá" ng-click="delete(' + full.Id + ')" class="fs25"><i class="fas fa-trash"></i></a>';
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
            templateUrl: ctxfolderCustomer + '/file_search.html',
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
            data.append("AssetCode", $rootScope.AssetCode);
            data.append("IsMore", false);
            dataserviceMaintenance.insertAssetFile(data, function (result) {
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
        dataserviceMaintenance.getAssetFile(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                rs.Object.FileName = fileName;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderMaintenance + '/file_edit.html',
                    controller: 'fileEditAsset',
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
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceMaintenance.deleteAssetFile(id, function (result) {
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
        //dataservice.getByteFile(id, function (rs) {rs=rs.data;
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
        location.href = "/Admin/EDMSRepository/DownloadFile?fileCode="
            + fileCode;
    }
    $scope.extend = function (id) {
        //dataserviceMaintenance.getSuggestionsAssetFile($rootScope.AssetCode, function (rs) {
        //    rs = rs.data;
        //    var data = rs != '' ? rs : {};
        //    var modalInstance = $uibModal.open({
        //        templateUrl: ctxfolderMaintenance + '/file_add.html',
        //        controller: 'fileAddAsset',
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
        //        reloadData()
        //    }, function () { });
        //})

        dataserviceSupplier.getDefaultRepo($rootScope.AssetCode, 'ASSET_MAINTENACE', function (rs) {
            rs = rs.data;
            var data = rs !== null ? rs : { CatCode: '', ObjectCode: $rootScope.AssetCode, ObjectType: 'ASSET_MAINTENACE' };
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

    //Editor online
    $scope.getObjectFile = function (id) {
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            dataserviceMaintenance.getItemFile(id, true, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                    return null;
                }
            });
        }
    };
    $scope.viewExcel = function (id, mode) {
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            dataserviceMaintenance.getItemFile(id, true, mode, function (rs) {
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
        }
    };
    $scope.viewWord = function (id, mode) {
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            dataserviceMaintenance.getItemFile(id, true, mode, function (rs) {
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
        }
    };
    $scope.viewPDF = function (id, mode) {
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            dataserviceMaintenance.getItemFile(id, true, mode, function (rs) {
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
        }
    };
    $scope.view = function (id) {

        var isImage = false;
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        var userModel = {};
        var listdata = $('#tblDataAssetMaintenanceFile').DataTable().data();
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
            dataserviceMaintenance.createTempFile(id, false, "", function (rs) {
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
            dataserviceMaintenance.createTempFile(id, false, "", function (rs) {
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
            templateUrl: ctxfolderMaintenance + '/viewer.html',
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
    $scope.tabFileHistory = function (fileId) {
        if (fileId === 0) {
            App.toastrError(caption.COM_MSG_FILE_NOT_HISTORY);
            return null;
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderMaintenance + '/tabFileHistory.html',
            controller: 'tabFileHistory',
            backdrop: 'static',
            size: '60',
            resolve: {
                para: function () {
                    return fileId;
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () { });
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

app.controller('fileAddAsset', function ($scope, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, dataserviceMaintenance, para) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('FolderName').notSortable().withTitle('Thư mục lưu trữ').withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
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
                App.toastrError(caption.CUS_ERROR_CHOOSE_FILE);
                return;
            } else if (itemSelect.length > 1) {
                App.toastrError(caption.CUS_ERROR_CHOOSE_ONE_FILE);
                return;
            }
            var data = new FormData();
            data.append("CateRepoSettingId", itemSelect.length != 0 ? itemSelect[0] : "");
            data.append("FileUpload", $scope.file);
            data.append("FileName", $scope.file.name);
            data.append("Desc", $scope.model.Desc);
            data.append("Tags", $scope.model.Tags);
            data.append("NumberDocument", $scope.model.NumberDocument);
            data.append("AssetCode", $rootScope.AssetCode);
            data.append("IsMore", true);
            dataserviceMaintenance.insertAssetFile(data, function (result) {
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
            dataserviceMaintenance.getTreeCategory(function (result) {
                result = result.data;
                if (!result.Error) {
                    var root = {
                        id: 'root',
                        parent: "#",
                        text: "Tất cả danh mục",//"Tất cả kho dữ liệu"
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

app.controller('fileEditAsset', function ($scope, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModal, $uibModalInstance, dataserviceMaintenance, para) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('FolderName').withOption('sClass', '').withTitle('{{ "CUS_TITLE_FOLDER" | translate }}').withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
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
            App.toastrError(caption.CUS_ERROR_CHOOSE_FILE);
        } else if (itemSelect.length > 1) {
            App.toastrError(caption.CUS_ERROR_CHOOSE_ONE_FILE);
        } else {
            if ($scope.editformfile.validate()) {
                var data = new FormData();
                data.append("CateRepoSettingId", itemSelect[0]);
                data.append("FileCode", para.FileCode);
                data.append("Desc", $scope.model.Desc);
                data.append("Tags", $scope.model.Tags);
                data.append("NumberDocument", $scope.model.NumberDocument);
                data.append("AssetCode", $rootScope.AssetCode);
                dataserviceMaintenance.updateAssetFile(data, function (result) {
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
            dataserviceMaintenance.getTreeCategory(function (result) {
                result = result.data;
                if (!result.Error) {
                    var root = {
                        id: 'root',
                        parent: "#",
                        text: "Tất cả danh mục",//"Tất cả kho dữ liệu"
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

app.controller('fileShareAsset', function ($scope, $rootScope, $compile, $uibModalInstance, dataserviceMaintenance) {
    $scope.model = {
        ObjectCodeShared: $rootScope.AssetCode,
        ObjectTypeShared: 'ASSET',
        ObjectType: '',
        ObjectCode: '',
        FileCode: '',
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.init = function () {
        dataserviceMaintenance.getListObjectTypeShare(function (rs) {
            rs = rs.data;
            $scope.listObjType = rs;
        });
        dataserviceMaintenance.getListFileWithObject($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, function (rs) {
            rs = rs.data;
            $scope.listFileObject = rs;
        });
        reloadListObjectShare($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, $scope.model.ObjectCode, $scope.model.ObjectType, $scope.model.FileCode);
    }
    $scope.init();
    $scope.changeObjType = function (ObjType) {
        dataserviceMaintenance.getListObjectCode($rootScope.AssetCode, ObjType, function (rs) {
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
        dataserviceMaintenance.deleteObjectShare(id, function (rs) {
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
            dataserviceMaintenance.insertFileShare($scope.model, function (rs) {
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
            App.toastrError(caption.CUS_ERROR_CHOOSE_OBJECT)
            error = true;
            return error;
        }
        if (($scope.model.ObjectCode == "" || $scope.model.ObjectCode == undefined)) {
            App.toastrError(caption.CUS_ERROR_CHOOSE_OBJECT_CODE)
            error = true;
            return error;
        }
        if (($scope.model.FileCode == "" || $scope.model.FileCode == undefined)) {
            App.toastrError(caption.CUS_ERROR_SELECT_FILE)
            error = true;
            return error;
        }
    }
    function reloadListObjectShare(objectCodeShared, objectTypeShared, objectCode, objectType, fileCode) {
        dataserviceMaintenance.getListObjectShare(objectCodeShared, objectTypeShared, objectCode, objectType, fileCode, function (rs) {
            rs = rs.data;
            $scope.listObjectShare = rs;
        })
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('tabFileHistory', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceMaintenance, $filter, para) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        FromDate: '',
        ToDate: '',
    };
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/AssetMaintenance/JTableFileHistory",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.FileId = para;
                d.AssetCode = $rootScope.AssetCode;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
            },
            complete: function () {
                App.unblockUI("#contentMain");
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
    //end option table
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ContractFileID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileName').withOption('sClass', 'w75').withTitle('{{"CONTRACT_CURD_TAB_FILE_LIST_COL_NAME" | translate}}').renderWith(function (data, type, full) {
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

        if (full.IsFileMaster == "False") {
            data = '<span class="text-warning">' + data + '<span>';
        } else {
            data = '<span class="text-primary">' + data + '<span>';
        }

        return icon + data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ReposName').withTitle('{{"CONTRACT_CURD_TAB_FILE_LIST_COL_CATEGORY_NAME" | translate}}').renderWith(function (data, type, full) {
        return '<i class="fa fa-folder-open icon-state-warning"></i>&nbsp' + data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Desc').withTitle('{{"CONTRACT_CURD_TAB_FILE_LIST_COL_DESCRIPTION" | translate}}').notSortable().renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EditedFileTime').withTitle('{{"CONTRACT_CURD_TAB_FILE_LIST_COL_EDITED_TIME" | translate}}').renderWith(function (data, type, full) {
        return data != "" ? $filter('date')(new Date(data), 'HH:mm dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EditedFileBy').withTitle('{{"CONTRACT_CURD_TAB_FILE_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"CONTRACT_CURD_TAB_FILE_COL_ACTION" | translate}}').withOption('sClass', 'w75 nowrap text-center').renderWith(function (data, type, full) {
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
        } else if (word.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'Docman';
        } else if (pdf.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'pdf';
        }

        if (full.TypeFile == "SHARE") {
            return '<a ng-click="dowload(\'' + full.FileCode + '\')" target="_blank" style="width: 25px; height: 25px; padding: 0px" title="Tải xuống - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline green " download><i class="fa fa-download pt5"></i></a>';
        } else {
            return '<a ng-click="getObjectFile(' + full.Id + ', 1' + ')" target="_blank" href=' + typefile + ' title="{{&quot; Xem &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-eye pt5"></i></a>' +
                '<a ng-click="dowload(\'' + full.FileCode + '\')"  style="width: 25px; height: 25px; padding: 0px" title="Tải xuống - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline green"><i class="fa fa-download pt5"></i></a>' +
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
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.reload = function () {
        reloadData(true);
    }
    $rootScope.reloadFile = function () {
        $scope.reload();
    }

    $scope.search = function () {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMaintenance + '/contractTabFileSearch.html',
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
            data.append("RequestCode", $rootScope.RequestCode);
            data.append("IsMore", false);
            dataserviceMaintenance.insertContractFile(data, function (result) {
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
        dataserviceMaintenance.getContractFile(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                rs.Object.FileName = fileName;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderMaintenance + '/tabFileEdit.html',
                    controller: 'tabFileEdit',
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
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceMaintenance.deleteAssetFile(id, function (result) {
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
            controller: 'tabFileShare',
            windowClass: 'modal-center',
            backdrop: 'static',
            size: '60',
        });
        modalInstance.result.then(function (d) {
            reloadData()
        }, function () { });
    }
    $scope.viewFile = function (id) {
        //dataserviceMaintenance.getByteFile(id, function (rs) {rs=rs.data;
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
        location.href = "/Admin/EDMSRepository/DownloadFile?fileCode="
            + fileCode;
    }
    $scope.extend = function (id) {
        dataserviceMaintenance.getSuggestionsContractFile($rootScope.RequestCode, function (rs) {
            rs = rs.data;
            var data = rs != '' ? rs : {};
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMaintenance + '/tabFileAdd.html',
                controller: 'tabFileAdd',
                windowClass: 'modal-file',
                backdrop: 'static',
                size: '55',
                resolve: {
                    para: function () {
                        return data;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                reloadData()
            }, function () { });
        })
    }
    $scope.loadFile = function (event) {
        $scope.file = event.target.files[0];
    }
    $scope.getObjectFile = function (id, mode) {
        dataserviceMaintenance.getItemFile(id, true, mode);
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