var ctxfolderRecall = "/views/admin/assetRecalled";
var ctxfolderMessage = "/views/message-box";
var ctxfolderFileShare = "/views/admin/fileObjectShare";
var ctxfolderInventory = "/views/admin/assetInventory";

var app = angular.module('App_ESEIM_RECALLED', ['App_ESEIM_DASHBOARD', 'App_ESEIM', 'App_ESEIM_WF_PLUGIN', 'App_ESEIM_SUPPLIER', 'App_ESEIM_FILE_PLUGIN', "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber', 'ngTagsInput']).
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

app.factory('dataserviceRecall', function ($http) {
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
        genTicketCode: function (callback) {
            $http.get('/Admin/AssetRecalled/GenTicketCode').then(callback);
        },
        getBranch: function (callback) {
            $http.post('/Admin/AssetRecalled/GetBranch').then(callback);
        },
        getEmp: function (callback) {
            $http.post('/Admin/AssetRecalled/GetEmp').then(callback);
        },
        getStatus: function (callback) {
            $http.post('/Admin/AssetRecalled/GetStatus').then(callback);
        },
        insertTicket: function (data, callback) {
            $http.post('/Admin/AssetRecalled/InsertTicket', data).then(callback);
        },
        getItemRecall: function (data, callback) {
            $http.post('/Admin/AssetRecalled/GetItem?id=' + data).then(callback);
        },
        updateTicketRecall: function (data, callback) {
            $http.post('/Admin/AssetRecalled/UpdateTicket', data).then(callback);
        },
        deleteTicket: function (data, callback) {
            $http.post('/Admin/AssetRecalled/DeleteTicket?id=' + data).then(callback);
        },
        getActivityStatus: function (data, callback) {
            $http.get('/Admin/AssetRecalled/GetActivityStatus?id=' + data).then(callback);
        },
        pending: function (data, callback) {
            $http.post('/Admin/AssetRecalled/Pending?id=' + data).then(callback);
        },
        approve: function (data, data1, callback) {
            $http.post('/Admin/AssetRecalled/Approve?id=' + data + '&&reason=' + data1, callback).then(callback);
        },
        reject: function (data, data1, callback) {
            $http.post('/Admin/AssetRecalled/Reject?id=' + data + '&&reason=' + data1, callback).then(callback);
        },
        getAsset: function (callback) {
            $http.post('/Admin/AssetRecalled/GetAsset').then(callback);
        },
        getStatusAsset: function (callback) {
            $http.post('/Admin/AssetRecalled/GetStatusAsset').then(callback);
        },
        insertAsset: function (data, callback) {
            $http.post('/Admin/AssetRecalled/InsertAsset', data).then(callback);
        },
        deleteAsset: function (data, callback) {
            $http.post('/Admin/AssetRecalled/DeleteAsset?id=' + data).then(callback);
        },
        insertFile: function (data, callback) {
            submitFormUpload('/Admin/AssetRecalled/UploadFile', data, callback);
        },
        getListFile: function (data, callback) {
            $http.post('/Admin/AssetRecalled/GetListFile?code=' + data).then(callback);
        },
        deleteFile: function (data, callback) {
            $http.post('/Admin/AssetRecalled/DeleteFile?id=' + data).then(callback);
        },
        genFileCode: function (callback) {
            $http.post('/Admin/AssetRecalled/GenFileCode').then(callback);
        },
        insertLogData: function (data, callback) {
            $http.post('/Admin/AssetRecalled/InsertLogData', data).then(callback);
        },
        getItemAttrSetup: function (data, callback) {
            $http.post('/Admin/AssetAllocation/GetItemAttrSetup/', data).then(callback);
        },
        getAttrDataType: function (data, callback) {
            $http.post('/Admin/AssetRecalled/GetAttrDataType?attrCode=' + data).then(callback);
        },
        getAttrUnit: function (data, callback) {
            $http.post('/Admin/AssetRecalled/GetAttrUnit?attrCode=' + data).then(callback);
        },
        insertAttrData: function (data, callback) {
            $http.post('/Admin/assetInventory/InsertAttrData', data).then(callback);
        },
        updateAttrData: function (data, callback) {
            $http.post('/Admin/assetInventory/UpdateAttrData?id=' + data).then(callback);
        },
        getListActivityAttrData: function (data, data1, data2, callback) {
            $http.post('/Admin/assetInventory/GetListActivityAttrData?objCode=' + data + '&&actCode=' + data1 + '&&objActCode=' + data2).then(callback);
        },
        getCatObjActivity: function (callback) {
            $http.post('/Admin/AssetRecalled/GetCatObjActivity').then(callback);
        },
        getAttrUnitType: function (data, callback) {
            $http.post('/Admin/AssetRecalled/GetAttrUnitType?attrCode=' + data).then(callback);
        },
        deleteAttrData: function (data, callback) {
            $http.post('/Admin/AssetRecalled/DeleteAttrData?id=' + data).then(callback);
        },
        deleteItemActivity: function (data, callback) {
            $http.post('/Admin/AssetRecalled/DeleteItemActivity?id=' + data).then(callback);
        },
        getCatActivity: function (callback) {
            $http.get('/Admin/AssetRecalled/GetCatActivity').then(callback);
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
            submitFormUpload1('/Admin/AssetRecalled/InsertAssetFile/', data, callback);
        },
        getSuggestionsAssetFile: function (data, callback) {
            $http.get('/Admin/AssetRecalled/GetSuggestionsAssetFile?assetCode=' + data).then(callback);
        },
        getTreeCategory: function (callback) {
            $http.post('/Admin/EDMSRepository/GetTreeCategory').then(callback);
        },
        getAssetFile: function (data, callback) {
            $http.post('/Admin/AssetRecalled/GetAssetFile/' + data).then(callback);
        },
        updateAssetFile: function (data, callback) {
            submitFormUpload('/Admin/AssetRecalled/UpdateAssetFile/', data, callback);
        },
        deleteAssetFile: function (data, callback) {
            $http.post('/Admin/AssetRecalled/DeleteAssetFile/' + data).then(callback);
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

        getAssetRecall: function (data, callback) {
            $http.post('/Admin/AssetRecalled/GetAssetRecall?ticketCode=' + data).then(callback);
        },

        //Workflow
        getWorkFlow: function (callback) {
            $http.post('/Admin/PayDecision/GetWorkFlow').then(callback);
        },
        getStatusAct: function (callback) {
            $http.post('/Admin/PayDecision/GetStatusAct').then(callback);
        },
        getStepWorkFlow: function (data, callback) {
            $http.post('/Admin/AssetRecalled/GetStepWorkFlow?code=' + data).then(callback);
        },
        createWfInstance: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/CreateWfInstance', data).then(callback)
        },
        insertInstRunning: function (data, data1, callback) {
            $http.post('/Admin/WorkflowActivity/InsertInstRunning?wfInstCode=' + data + '&wfCode=' + data1).then(callback);
        },
        getItemTemp: function (data, callback) {
            $http.post('/Admin/AssetRecalled/GetItemTemp?id=' + data).then(callback)
        },
        getListRepeat: function (data, callback) {
            $http.post('/Admin/AssetRecalled/GetListRepeat?code=' + data).then(callback);
        },
        getActionStatus: function (data, callback) {
            $http.get('/Admin/AssetRecalled/GetActionStatus?code=' + data).then(callback);
        },
        getLogStatus: function (data, callback) {
            $http.post('/Admin/AssetRecalled/GetLogStatus?code=' + data).then(callback);
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

app.controller('Ctrl_ESEIM_RECALLED', function ($scope, $rootScope, $compile, $uibModal, dataserviceRecall, $cookies, $translate) {
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
                TicketCode: {
                    required: true,
                    maxlength: 100
                },
                Title: {
                    required: true,
                    maxlength: 255
                },
                UserConfirm: {
                    required: true,
                    maxlength: 100
                },
                sRecalledTime: {
                    required: true,
                },
                LocationRecalled: {
                    required: true,
                }
            },
            messages: {
                TicketCode: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.ASSET_RC_LBL_VOUCHER_CODE),
                    maxlength: caption.ASSET_RC_VALIDATE_TICKETCODE,
                },
                Title: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.ASSET_RC_LBL_TITLE),
                    maxlength: caption.ASSET_RC_VALIDATE_TITLE,
                },
                UserConfirm: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.ASSET_RC_LBL_),
                    maxlength: caption.ASSET_RC_VALIDATE_USER_CONFIRM,
                },
                sRecalledTime: {
                    required: caption.ASSET_RC_VALIDATE_DATE_RECALL,
                },
                LocationRecalled: {
                    required: caption.ASSET_RC_VALIDATE_LOCATION,
                }
            }
        }
        $rootScope.validationOptionsAssetAttribute = {
            rules: {
                Quantity: {
                    required: true,
                    regx: /^([0-9])+\b$/
                },
                Price: {
                    required: true,
                    regx: /^([0-9])+\b$/
                },
            },
            messages: {
                Quantity: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.ASSET_RC_LBL_NUMB),
                    regx: caption.ASSET_RC_NOT_LESS_THAN_ZERO.replace("{0}", caption.ASSET_RC_LBL_NUMB),
                },
                Price: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.ASSET_RC_PRICE),
                    regx: caption.ASSET_RC_NOT_LESS_THAN_ZERO.replace("{0}", caption.ASSET_RC_PRICE),
                },
            }
        }
        $rootScope.validationOptionsResultAct = {
            rules: {
                //Value: {
                //    required: true
                //}
            },
            messages: {
                //Value: {
                //    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.ASSET_RC_VALUE),
                //}
            }
        }
    });

    dataserviceRecall.getStatus(function (rs) {
        rs = rs.data;
        $rootScope.listStatus = rs;
    })
    $rootScope.isAdded = false;
    dataserviceRecall.getCatActivity(function (rs) {
        rs = rs.data;
        $rootScope.listCatActivity = rs;
    });
    $rootScope.ObjectTypeFile = "ASSET_RECALL";
    $rootScope.moduleName = "ASSET"
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/AssetRecalled/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderRecall + '/index.html',
            controller: 'index'
        })
        .when('/map', {
            templateUrl: ctxfolderRecall + '/google-map.html',
            controller: 'google-map'
        })
        .when('/add', {
            templateUrl: ctxfolderRecall + '/add.html',
            controller: 'add'
        })
        .when('/edit', {
            templateUrl: ctxfolderRecall + '/edit.html',
            controller: 'editRecalled'
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

app.controller('index', function ($scope, $rootScope, $uibModal, dataserviceRecall, $location) {
    $scope.modelsearch = {
        TicketCode: '',
        Title: '',
        BranchRecalled: '',
        UserRecalled: '',
        FromDate: '',
        ToDate: '',
    }

    $scope.initLoad = function () {
        dataserviceRecall.getBranch(function (rs) {
            rs = rs.data;
            $scope.listBranch = rs;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            //$scope.listBranch.unshift(all)
        });
        dataserviceRecall.getEmp(function (rs) {
            rs = rs.data;
            $scope.listEmp = rs;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.listEmp.unshift(all)
        });
    }

    $scope.initLoad();

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



    $scope.add = function () {
        //var modalInstance = $uibModal.open({
        //    animation: true,
        //    templateUrl: ctxfolderRecall + '/add.html',
        //    controller: 'add',
        //    backdrop: true,
        //    size: '60'
        //});
        //modalInstance.result.then(function (d) {
        //    $scope.reloadTabTicket()
        //}, function () { });
        $location.path("/add");
    }

    function loadDate() {
        $("#fromDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
        });
        $("#toDate").datepicker({
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

app.controller('tabTicket', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceRecall, $filter, myService, $location) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/AssetRecalled/JTableTicket",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.TicketCode = $scope.modelsearch.TicketCode;
                d.Title = $scope.modelsearch.Title;
                d.UserRecalled = $scope.modelsearch.UserRecalled;
                d.BranchRecalled = $scope.modelsearch.BranchRecalled;
                d.FromDate = $scope.modelsearch.FromDate;
                d.ToDate = $scope.modelsearch.ToDate;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(10)
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
            // Double click record
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.ID;
                    $scope.edit(Id);
                }
            });
        });
    //end option table
    //Tạo các cột của bảng để đổ dữ liệu vào
    vm.dtColumns = [];
    //vm.dtcolumns.push(dtcolumnbuilder.newcolumn("check").withtitle(titlehtml).notsortable().renderwith(function (data, type, full, meta) {
    //    $scope.selected[full.id] = false;
    //    return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleone(selected)"/><span></span></label>';
    //}).withoption('sclass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn("ID").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.ID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TicketCode').withTitle('{{"ASSET_RC_LBL_VOUCHER_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"ASSET_RC_LBL_TITLE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BranchRecalled').withTitle('{{"ASSET_RC_TXT_BRANCH" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UserRecalled').withTitle('{{"ASSET_RC_LBL_PERSON_TH" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('RecalledTime').withTitle('{{"ASSET_RC_LBL_DATE_TH" | translate}}').renderWith(function (data, type, full) {
        return data != null && data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UserConfirm').withTitle('{{"ASSET_RC_LBL_PERSON_SUCCESS" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LocationRecalled').withTitle('{{"ASSET_RC_LBL_LOCAL" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"ASSET_RC_LBL_STATUS" | translate}}').renderWith(function (data, type, full) {
        /*var json = JSON.parse(full.Status)
        var status = "";
        if (json.length > 0) {
            status = json[json.length - 1].StatusName
        }
        return status;*/
        try {
            var json = JSON.parse(full.Status)
            var status = "";
            if (json.length > 0) {
                status = json[json.length - 1].StatusName
            }
            return status;
        } catch (e) {
            console.log(e);
            return "";
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"ASSET_RC_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<a title="Sửa" ng-click="edit(' + full.ID + ')"  class="fs25 pr10"><i class="fas fa-edit"style="--fa-primary-color: green;"></i></a>' +
            '<a title="Xoá" ng-click="delete(' + full.ID + ')" class="fs25"><i class="fas fa-trash"style="--fa-primary-color: red;"></i></a>';
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
    $rootScope.reloadTabTicket = function () {
        reloadData(true);
    }
    $scope.edit = function (id) {
        dataserviceRecall.getItemRecall(id, function (rs) {
            rs = rs.data;
            $rootScope.TicketCode = rs.Object.TicketCode;
            $rootScope.AssetCode = rs.Object.TicketCode; // de hien o ngoai  index phan edit. cua  tai san
            $rootScope.ObjCode = rs.Object.TicketCode;
            //var modalInstance = $uibModal.open({
            //    animation: true,
            //    templateUrl: ctxfolderRecall + '/edit.html',
            //    controller: 'editRecalled',
            //    backdrop: 'static',
            //    size: '60',
            //    resolve: {
            //        para: function () {
            //            return id;
            //        }
            //    }
            //});
            //modalInstance.result.then(function (d) {
            //    $scope.reloadTabTicket();
            //    $rootScope.TicketCode = "";
            //}, function () {
            //});
            myService.setData(data = id);
            $location.path('/edit');
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
                    dataserviceRecall.deleteTicket(para, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                            $rootScope.reloadTabAsset();
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
    $rootScope.searchTicket = function () {
        reloadData(true);
    }
});

app.controller('tabAsset', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceRecall, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/AssetRecalled/JTableAsset",
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
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(10)
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
    //end option table
    //Tạo các cột của bảng để đổ dữ liệu vào
    vm.dtColumns = [];
    //vm.dtcolumns.push(dtcolumnbuilder.newcolumn("check").withtitle(titlehtml).notsortable().renderwith(function (data, type, full, meta) {
    //    $scope.selected[full.id] = false;
    //    return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleone(selected)"/><span></span></label>';
    //}).withoption('sclass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn("ID").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.ID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ''));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TicketCode').withTitle('{{"ASSET_RC_LBL_VOUCHER_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"ASSET_RC_LBL_TITLE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AssetName').withTitle('{{"ASSET_RC_MSG_ASSET" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withTitle('{{"ASSET_RC_LBL_NUMB" | translate}}').renderWith(function (data, type) {
        var tax = data != "" ? $filter('currency')(data, '', 0) : '';
        return '<span class="text-primary bold">' + tax + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CostValue').withTitle('{{"ASSET_RC_TXT_VALUE" | translate}}').renderWith(function (data, type) {
        var tax = data != "" ? $filter('currency')(data, '', 0) : '';
        return '<span class="text-danger bold">' + tax + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TotalMoney').withTitle('{{"ASSET_RC_TOTALMONEY" | translate}}').renderWith(function (data, type) {
        var tax = data != "" ? $filter('currency')(data, '', 0) : '';
        return '<span class="text-danger bold">' + tax + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"ASSET_RC_LBL_STATUS" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"ASSET_RC_LBL_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"ASSET_RC_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<a title="Xoá" ng-click="delete(' + full.ID + ')"  class="fs25"><i class="fas fa-trash"style="--fa-primary-color: red;"></i></a>';
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
                    dataserviceRecall.deleteAsset(para, function (rs) {
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
            $scope.reloadTabAsset();
        }, function () {
        });
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $rootScope.reloadTabAsset = function () {
        reloadData(true);
    }
});

app.controller('assetDetail', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceRecall, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.modelAsset = {
        AssetCode: '',
        Price: '',
        Quantity: ''
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/AssetRecalled/JTableAssetDetail",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.TicketCode = $scope.TicketCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(200, "#tblDataAssetRecalled");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(3)
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
    //end option table
    //Tạo các cột của bảng để đổ dữ liệu vào
    vm.dtColumns = [];
    //vm.dtcolumns.push(dtcolumnbuilder.newcolumn("check").withtitle(titlehtml).notsortable().renderwith(function (data, type, full, meta) {
    //    $scope.selected[full.id] = false;
    //    return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleone(selected)"/><span></span></label>';
    //}).withoption('sclass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn("ID").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.ID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AssetName').withTitle('{{"ASSET_RC_MSG_ASSET" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withTitle('{{"ASSET_RC_LBL_NUMB" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('CostValue').withTitle('{{"ASSET_RC_PRICE" | translate}}').renderWith(function (data, type, full) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('TotalMoney').withTitle('{{"ASSET_RC_TOTALMONEY" | translate}}').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"ASSET_RC_LBL_STATUS" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"ASSET_RC_LBL_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"ASSET_RC_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button title="Xoá" ng-click="delete(' + full.ID + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $scope.initLoad = function () {
        dataserviceRecall.getAsset(function (rs) {
            rs = rs.data;
            $scope.modelAsset.listAsset = rs;
        });
        dataserviceRecall.getStatusAsset(function (rs) {
            rs = rs.data;
            $scope.modelAsset.listStatusAsset = rs;
        })
    }
    $scope.initLoad();
    $scope.AssetID = "";
    $scope.addAsset = function () {
        $scope.modelAsset.TicketCode = $rootScope.TicketCode;
        validationSelect($scope.modelAsset);
        if ($scope.addformAsset.validate() && !validationSelect($scope.modelAsset).Status) {
            var temp = $rootScope.checkData($scope.modelAsset);
            if (temp.Status) {
                App.toastrError(temp.Title);
                return;
            }
            dataserviceRecall.insertAsset($scope.modelAsset, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $scope.reload();
                    $scope.reloadTabAsset();
                    $scope.AssetID = result.ID;
                }
            });
        }
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
                    dataserviceRecall.deleteAsset(para, function (rs) {
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
            $rootScope.reloadTabAsset();
            $scope.reload();
        }, function () {
        });
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "AssetCode" && $scope.modelAsset.AssetCode != "") {
            $scope.errorAssetCode = false;
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 
        if (data.AssetCode == "") {
            $scope.errorAssetCode = true;
            mess.Status = true;
        } else {
            $scope.errorAssetCode = false;
        }
        return mess;
    }
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, DTColumnBuilder, DTInstances, dataserviceRecall, $filter, $location) {
    $scope.CheckCode = '';

    $rootScope.TicketCode = '';

    $scope.model = {
        BranchRecalled: '',
        UserRecalled: '',
        Status: '',
    }

    $scope.modelWf = {
        WorkflowCode: "",
        ObjectType: "ASSET_RECALL",
        ObjectInst: "",
    };

    $scope.listCatObjActivity = [];

    dataserviceRecall.getCatObjActivity(function (rs) {
        rs = rs.data;
        $scope.listCatObjActivity = rs;
        if ($scope.listCatObjActivity.length == 1) {
            $scope.model.ObjActCode = $scope.listCatObjActivity[0].Code;
        }
    })

    $scope.initLoad = function () {
        dataserviceRecall.genTicketCode(function (rs) {
            rs = rs.data;
            $scope.model.TicketCode = rs;
        });
        dataserviceRecall.getBranch(function (rs) {
            rs = rs.data;
            $scope.model.listBranch = rs;
        });
        dataserviceRecall.getEmp(function (rs) {
            rs = rs.data;
            $scope.model.listEmp = rs;
        });

        dataserviceRecall.getWorkFlow(function (result) {
            result = result.data;
            $rootScope.lstWorkflow = result;
        });
        dataserviceRecall.getStatusAct(function (rs) {
            rs = rs.data;
            $scope.lstStatus = rs;
        })
        dataserviceRecall.suggestWF($scope.modelWf.ObjectType, function (rs) {
            rs = rs.data;
            $scope.model.WorkflowCat = rs;
            setTimeout(function () {
                $rootScope.loadDiagramWF($scope.model.WorkflowCat);
            }, 400)
        })
    }

    $scope.initLoad();

    $scope.changeWorkFlowInts = function (wfCatCode) {
        dataserviceRecall.getStepWorkFlow(wfCatCode, function (rs) {
            data = rs.data;
            $scope.lstStep = data.list;
            setTimeout(function () {
                $('#progressbar li').css('width', 'calc(100%/' + data.list.length + ')');
            }, 10);
        })
    }

    $scope.chkAdd = function () {
        if ($scope.CheckCode == '') {
            App.toastrError(caption.ASSET_RC_VALIDATE_SAVE_TICKET);
        }
    }

    $scope.refresh = function () {
        $scope.model.Title = "";
        $scope.model.BranchRecalled = "";
        $scope.model.UserRecalled = "";
        $scope.model.sRecalledTime = "";
        $scope.model.LocationRecalled = "";
        $scope.model.UserConfirm = "";
        $scope.model.Description = "";
    };

    $scope.chkSubTab = function () {
        if ($rootScope.AssetCode == '') {
            App.toastrError(caption.ASSET_MSG_ADD_ASSET_FIRST);
        }
    }

    $scope.cancel = function () {
        $rootScope.TicketCode = '';
        $rootScope.isAdded = false;
        $location.path("/");
    };

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addForm.validate() && !validationSelect($scope.model).Status) {
            var temp = $rootScope.checkData($scope.model);
            if (temp.Status) {
                App.toastrError(temp.Title);
                return;
            }
            dataserviceRecall.insertTicket($scope.model, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $rootScope.isAdded = true;
                    $scope.model.Id = result.ID;
                    $rootScope.TicketCode = $scope.model.TicketCode;
                    $scope.CheckCode = $scope.model.TicketCode;
                    $rootScope.AssetCode = $scope.model.TicketCode;
                    $rootScope.ObjCode = $scope.model.TicketCode;
                    //Workflow
                    $scope.modelWf.ObjectInst = $scope.model.TicketCode;
                    $scope.modelWf.WorkflowCode = $scope.model.WorkflowCat;
                    $scope.modelWf.ObjectName = $scope.model.Title;
                    dataserviceRecall.createWfInstance($scope.modelWf, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            //App.toastrSuccess(rs.Title);
                            var wfInstCode = rs.Object.WfInstCode;
                            $scope.WfInstCode = wfInstCode;
                            $location.path("/");
                        }
                    })

                }
            });
        }
    }

    $scope.viewActivityStatus = function () {
        App.toastrError(caption.ASSET_VALIDATE_NOT_VALID)
    }

    $scope.addFile = function () {
        if ($rootScope.isAdded == true) {
            $rootScope.TicketCode = $scope.model.TicketCode;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderRecall + '/file_add.html',
                controller: 'file_add',
                backdrop: 'static',
                size: '40'
            });
            modalInstance.result.then(function (d) {
                dataserviceRecall.getListFile($scope.model.TicketCode, function (rs) {
                    rs = rs.data;
                    $scope.model.listFile = rs;
                });
            }, function () {
            });
        } else {
            App.toastrError(caption.ASSET_SAVE_DOWNLOAD_FILE);
        }
    }

    $scope.deleteFile = function (id) {
        dataserviceRecall.deleteFile(id, function (result) {
            result = result.data;
            if (result.Error) {
                App.toastrError(result.Title);
            } else {
                App.toastrSuccess(result.Title);
                dataserviceRecall.getListFile($scope.model.TicketCode, function (rs) {
                    rs = rs.data;
                    $scope.model.listFile = rs;
                });
            }
        });
    }

    $scope.changeSelect = function (SelectType) {
        if (SelectType == "BranchRecalled" && $scope.model.BranchRecalled != "") {
            $scope.errorBranchRecalled = false;
        }
        if (SelectType == "UserRecalled" && $scope.model.UserRecalled != "") {
            $scope.errorUserRecalled = false;
        }
        if (SelectType == "Status" && $scope.model.Status != "") {
            $scope.errorStatus = false;
        }
    }

    function initDateTime() {
        $("#recalledTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {

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

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 
        if (data.BranchRecalled == "") {
            $scope.errorBranchRecalled = true;
            mess.Status = true;
        } else {
            $scope.errorBranchRecalled = false;
        }

        if (data.UserRecalled == "") {
            $scope.errorUserRecalled = true;
            mess.Status = true;
        } else {
            $scope.errorUserRecalled = false;
        }

        return mess;
    };

    setTimeout(function () {
        initDateTime();
        setModalDraggable('.modal-dialog');
        setModalMaxHeight('.modal');
    }, 200);
});

app.controller('editRecalled', function ($scope, $rootScope, $uibModal, dataserviceRecall, $filter, myService, $location) {
    $scope.isDisabled = true;
    $scope.checkRoleWf = false;
    $scope.model = {
        ObjActCode: '',
        ObjCode: '',
        AttrCode: '',
        ActCode: '',
        listCatObjActivity: [],
    }

    $scope.modelWf = {
        WorkflowCode: "",
        ObjectType: "ASSET_RECALL",
        ObjectInst: "",
    };

    $scope.isDisabled = true;

    $scope.cancel = function () {
        $rootScope.TicketCode = "";
        $rootScope.AssetCode = "";
        $location.path("/");
    };

    $scope.initData = function () {
        dataserviceRecall.getItemRecall(para, function (rs) {
            rs = rs.data;
            $rootScope.TicketCode = rs.Object.TicketCode;
            $rootScope.AssetCode = rs.Object.TicketCode; // de hien o ngoai  index phan edit. cua  tai san
            $scope.model = rs.Object;

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

            dataserviceRecall.getBranch(function (rs) {
                rs = rs.data;
                $scope.model.listBranch = rs;
            });
            dataserviceRecall.getEmp(function (rs) {
                rs = rs.data;
                $scope.model.listEmp = rs;
            });
            dataserviceRecall.getListFile($rootScope.TicketCode, function (rs) {
                rs = rs.data;
                $scope.model.listFile = rs;
            });
            dataserviceRecall.getCatObjActivity(function (rs) {
                rs = rs.data;
                $scope.model.listCatObjActivity = rs;
            });
            $scope.model.ObjCode = $rootScope.TicketCode;
            dataserviceRecall.checkRoleUser($scope.model.ObjActCode, function (rs) {
                rs = rs.data;
                if (rs == true) {
                    $scope.isDisabled = false;
                    $scope.checkRoleWf = true;
                }
            })
            dataserviceRecall.getCatActivityWorkFlow($scope.model.ObjActCode, function (rs) {

                rs = rs.data;
                $rootScope.listCatActivity = rs;
            });
            dataserviceRecall.getAssetRecall($rootScope.TicketCode, function (rs) {
                rs = rs.data;
                $scope.listDataProduct = rs;
            })
            setTimeout(function () {
                $rootScope.loadDiagramWfInst($scope.model.TicketCode, $scope.modelWf.ObjectType);
            }, 800)
        });

        dataserviceRecall.getWorkFlow(function (result) {
            result = result.data;
            $rootScope.lstWorkflow = result;
        });
    }

    var para = myService.getData();
    if (para == undefined) {
        para = $location.search().id;
    }

    if (para == undefined || para <= 0) {
        location.href = "/Admin/AssetRecalled";
    }

    if (para != undefined) {
        $scope.initData();
    }
    //Edit Activity Instance
    $scope.editInstAct = function (id, objCode) {
        dataserviceRecall.checkPermissionEditActivityById(id, function (rs) {
            rs = rs.data;
            if (!rs) {
                return App.toastrError(caption.COM_MSG_PERMISSION_EDIT_ACT);
            }
            dataserviceRecall.getItemActInst(id, function (rs) {
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
                    dataserviceRecall.getLogStatus($scope.model.TicketCode, function (rs) {
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
            dataserviceRecall.getListRepeat($scope.model.TicketCode, function (rs) {
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

    $scope.refresh = function () {
        $scope.model.Title = "";
        $scope.model.BranchRecalled = "";
        $scope.model.UserRecalled = "";
        $scope.model.sRecalledTime = "";
        $scope.model.LocationRecalled = "";
        $scope.model.UserConfirm = "";
        $scope.model.Description = "";
    };

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.editform.validate() && !validationSelect($scope.model).Status) {
            var temp = $rootScope.checkData($scope.model);
            if (temp.Status) {
                App.toastrError(temp.Title);
                return;
            }
            dataserviceRecall.updateTicketRecall($scope.model, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                }
            });
        }
    }

    $scope.viewActivityStatus = function () {
        dataserviceRecall.getActivityStatus($scope.model.ID, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderRecall + '/activity.html',
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

    $scope.edit = function () {
        $scope.isDisabled = false;
    }

    $scope.addFile = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderRecall + '/file_add.html',
            controller: 'file_add',
            backdrop: 'static',
            size: '40'
        });
        modalInstance.result.then(function (d) {
            dataserviceRecall.getListFile($rootScope.TicketCode, function (rs) {
                rs = rs.data;
                $scope.model.listFile = rs;
            });
        }, function () {
        });
    }

    $scope.deleteFile = function (id) {
        dataserviceRecall.deleteFile(id, function (result) {
            result = result.data;
            if (result.Error) {
                App.toastrError(result.Title);
            } else {
                App.toastrSuccess(result.Title);
                dataserviceRecall.getListFile($rootScope.TicketCode, function (rs) {
                    rs = rs.data;
                    $scope.model.listFile = rs;
                });
            }
        });
    }

    $scope.resultActivity = function () {

        if ($scope.model.ActCode != '' && $scope.model.ActCode != undefined && $scope.model.ActCode != null) {
            $rootScope.ActCode = $scope.model.ActCode;
            $rootScope.ObjActCode = $scope.model.ObjActCode;
            $rootScope.ObjCode = $scope.model.TicketCode;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderRecall + '/resultActivity.html',
                controller: 'resultActivity',
                backdrop: 'static',
                size: '50',
            });
        } else {
            App.toastrError(caption.ASSET_MSG_SELECT_ACTIV);
        }
    }

    $scope.tableActivity = function () {
        $rootScope.ActCode = $scope.model.ActCode;
        $rootScope.ObjActCode = $scope.model.ObjActCode;
        $rootScope.ObjCode = $scope.model.TicketCode;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderRecall + '/tableActivity.html',
            controller: 'tableActivity',
            backdrop: 'static',
            size: '60'
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
        if (SelectType == "BranchRecalled" && $scope.model.BranchRecalled != "") {
            $scope.errorBranchRecalled = false;
        }
        if (SelectType == "UserRecalled" && $scope.model.UserRecalled != "") {
            $scope.errorUserRecalled = false;
        }
        if (SelectType == "Status" && $scope.model.Status != "") {
            $scope.errorStatus = false;
        }
        //if (SelectType == "ActCode" && $scope.model.ActCode != "") {
        //    $scope.errorActCode = false;
        //    dataserviceRecall.insertLogData($scope.model, function (result) {
        //        result = result.data;
        //        if (result.Error) {
        //            App.toastrError(result.Title);
        //        } else {
        //            App.toastrSuccess(result.Title);
        //        }
        //    });
        //}
        //if (SelectType == "ObjActCode" && $scope.model.ObjActCode != "") {
        //    $scope.errorObjActCode = false;
        //}
    }

    $scope.checkRole = function () {
        if ($scope.checkRoleWf == false) {
            App.toastrError(caption.COM_MSG_NO_PERMISSION);
        }
    }

    function convertDatetime(date) {
        var result = '';
        if (date != null && date != '') {
            var array = date.split('/');
            result = array[1] + '/' + array[0] + '/' + array[2];
        }
        return result;
    }

    function convertFomartdate(dateTime) {
        var result = "";
        if (dateTime != null && dateTime != "") {
            result = $filter('date')(new Date(dateTime), 'dd/MM/yyyy');
        }
        return result;
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 
        if (data.BranchRecalled == "") {
            $scope.errorBranchRecalled = true;
            mess.Status = true;
        } else {
            $scope.errorBranchRecalled = false;
        }

        if (data.UserRecalled == "") {
            $scope.errorUserRecalled = true;
            mess.Status = true;
        } else {
            $scope.errorUserRecalled = false;
        }

        return mess;
    };
    
    $scope.print = function () {
        dataserviceRecall.getAssetRecall($rootScope.TicketCode, function (rs) { //$scope.model.ObjCode
            rs = rs.data;
            $scope.listDataProduct = rs;



            var date = new Date();
            var toDay = $filter('date')(date, 'dd/MM/yyyy');
            var infoToDay = toDay.split("/");
            var infoTime = $scope.model.sRecalledTime.split("/");

            var personRecei = "";
            for (var i = 0; i < $scope.model.listEmp.length; i++) {
                if ($scope.model.UserRecalled === $scope.model.listEmp[i].Code) {
                    personRecei = $scope.model.listEmp[i].Name;
                    break;
                }
            }

            var content = '<p><strong>Đơn vị:</strong>................................. </p>' +
                '<p><strong>Phòng ban:</strong>................................</p>' +
                '<p></p>' +
                '<p style="text-align: center;"><strong>PHIẾU THU HỒI TÀI SẢN</strong></p>' +
                '<p style="text-align: center;"><em>Ngày ' + infoTime[0] + ' tháng ' + infoTime[1] + ' năm ' + infoTime[2] + '</em></p>' +
                '<p>Tiêu đề: <strong>' + $scope.model.Title + '</strong></p>' +
                '<p>Người thu hồi: <strong>' + personRecei + '</strong></p>' +
                '<p>Người xác nhận: <strong>' + $scope.model.UserConfirm + '</strong></p>' +
                '<p>Địa điểm: ' + $scope.model.LocationRecalled + '</p>' +
                '<p>Ghi chú: ' + $scope.model.Description + '</p>' +
                '<p style="text-align: right;"><em>Ngày</em><em> ' + infoToDay[0] + ' </em><em>tháng </em><em>' + infoToDay[1] + ' </em><em>năm ' + infoToDay[2] + '</em><em></em></p>';
            var footer = '<p></p><br />' +
                '<p></p><br />' + '<table>' +
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
            for (var i = 0; i < $scope.listDataProduct.length; i++) {
                detailProduct += '<tr>' +
                    '<td style="width: 26.7578px; text-align: center;">' +
                    '<p>' + idx + '</p>' +
                    '</td>' +
                    '<td style="width: 193.008px; text-align: left;">' +
                    '<p>' + $scope.listDataProduct[i].AssetName + ';</p>' +
                    '</td>' +
                    '<td style="width: 58.0078px; text-align: center;">' +
                    '<p>' + $scope.listDataProduct[i].Quantity + '</p>' +
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
        })
        setTimeout(function () {
            document.body.removeChild(frame1);
        }, 1500);
    }

    setTimeout(function () {
        $("#recalledTime").datepicker({
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
            //var maxDate = new Date(selected.date.valueOf());
            //$('#datefrom').datepicker('setEndDate', maxDate);
        });
        setModalDraggable('.modal-dialog');
        setModalMaxHeight('.modal');
    }, 100);
});

app.controller('activity', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataserviceRecall, $timeout, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.initLoad = function () {
        $scope.listActivity = para;
    };
    $scope.initLoad();
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 50);
});

app.controller('reasonReject', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataserviceRecall, $timeout, para) {
    $scope.model = {
        Reason: para,
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

app.controller('file_add_old', function ($scope, $rootScope, $compile, $uibModal, $confirm, dataserviceRecall, $uibModalInstance) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.initData = function () {
        dataserviceRecall.genFileCode(function (rs) {
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
                //App.toastrError("{{'COM_MSG_CHOSE_FILE' | translate}}");
                App.toastrError(caption.COM_MSG_CHOSE_FILE);
            } else {
                var formData = new FormData();
                formData.append("fileUpload", file);
                formData.append("FileName", $scope.model.FileName);
                formData.append("FileCode", $scope.model.FileCode);
                formData.append("TicketCode", $rootScope.TicketCode);
                dataserviceRecall.insertFile(formData, function (result) {
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

app.controller('resultActivity', function ($scope, $rootScope, $uibModalInstance, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceRecall, $filter) {
    $scope.model = {
        AttrCode: '',
        AttrDataType: '',
        AttrUnit: '',

    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.initLoad = function () {
        $scope.model.ActCode = $rootScope.ActCode;
        $scope.model.ObjCode = $rootScope.ObjCode;
        $scope.model.WorkFlowCode = $rootScope.ObjActCode;
        var obj = { WorkFlowCode: $scope.model.WorkFlowCode, ActCode: $scope.model.ActCode };
        dataserviceRecall.getItemAttrSetup(obj, function (rs) {
            rs = rs.data;
            $scope.model.listAttrData = rs;
        });
        dataserviceRecall.getListActivityAttrData($scope.model.ObjCode, $scope.model.ActCode, $scope.model.WorkFlowCode, function (rs) {
            rs = rs.data;
            $scope.model.listAttrDataSetUp = rs;
        });
    }
    $scope.initLoad();
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.resultActivity.validate() && !validationSelect($scope.model).Status) {
            var temp = $rootScope.checkData($scope.model);
            if (temp.Status) {
                App.toastrError(temp.Title);
                return;
            }
            dataserviceRecall.insertAttrData($scope.model, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    dataserviceRecall.getListActivityAttrData($scope.model.ObjCode, $scope.model.ActCode, $scope.model.WorkFlowCode, function (rs) {
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
                    dataserviceRecall.updateAttrData(id, function (rs) {
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
            dataserviceRecall.getListActivityAttrData($rootScope.ObjCode, $rootScope.ActCode, $rootScope.ObjActCode, function (rs) {
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

        //if (SelectType == "AttrDataType" && $scope.model.AttrDataType != "") {
        //    $scope.errorAttrDataType = false;
        //}

        //if (SelectType == "AttrUnit" && $scope.model.AttrUnit != "") {
        //    $scope.errorAttrUnit = false;
        //}
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 
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

        //if (data.AttrUnit == "") {
        //    $scope.errorAttrUnit = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorAttrUnit = false;
        //}
        return mess;
    };
    $scope.delete = function (id) {
        dataserviceRecall.deleteAttrData(id, function (result) {
            result = result.data;
            if (result.Error) {
                App.toastrError(result.Title);
            } else {
                App.toastrSuccess(result.Title);
                dataserviceRecall.getListActivityAttrData($scope.model.ObjCode, $scope.model.ActCode, $scope.model.WorkFlowCode, function (rs) {
                    rs = rs.data;
                    $scope.model.listAttrDataSetUp = rs;
                });
            }
        });
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 50);
});

app.controller('tableActivity', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceRecall, $filter) {
    $scope.model = {
    }
    $index = 0;
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
            url: "/Admin/AssetRecalled/JTableActivity",
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
        .withDataProp('data').withDisplayLength(15)
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('ActName').withTitle('{{"ASSET_RC_ACCTIVITY_NAME" | translate}}').renderWith(function (data, type, full) {
        return '<span>' + data + '</span></br>' + '<span class="badge-customer badge-customer-success"> ' + full.Time + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ActType').withTitle('{{"ASSET_RC_ACCTIVITY_TYPE" | translate}}').withOption('sClass', 'w150').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UserAct').withTitle('{{"ASSET_RC_USER_ACTION" | translate}}').withOption('sClass', 'w150').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Result').withTitle('{{"ASSET_RC_LBL_RESULT_ACTIVITY" | translate}}').withOption('sClass', 'w350').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"ASSET_RC_ACTION" | translate}}').withOption('sClass', 'w20').renderWith(function (data, type, full) {
        return '<button title="Xoá" ng-click="delete(' + full.ID + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
        dataserviceRecall.getItemRecall(id, function (rs) {
            rs = rs.data;

            $rootScope.TicketCode = rs.Object.TicketCode;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderRecall + '/edit.html',
                controller: 'editRecalled',
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
                    dataserviceRecall.deleteItemActivity(para, function (rs) {
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

app.controller('statusObjAct', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceRecall, $filter, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.ObjActCode = '';
    $scope.remainMinute = "";
    $scope.listStatusObj = [];
    $scope.initLoad = function () {
        var obj = para;
        dataserviceRecall.getStausObjStream(obj, function (rs) {
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

app.controller('fileAsset', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceRecall, $filter, dataserviceSupplier) {
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
            url: "/Admin/AssetRecalled/JTableFile",
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
                heightTableManual(200, "#tblDataRecalledFile");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(3)
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
            return '<button title="Sửa" ng-click="edit(\'' + full.FileName + '\',' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
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
            dataserviceRecall.insertAssetFile(data, function (result) {
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
        dataserviceRecall.getAssetFile(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                rs.Object.FileName = fileName;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderRecall + '/file_edit.html',
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
                    dataserviceRecall.deleteAssetFile(id, function (result) {
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
        //dataserviceRecall.getSuggestionsAssetFile($rootScope.AssetCode, function (rs) {
        //    rs = rs.data;
        //    var data = rs != '' ? rs : {};
        //    var modalInstance = $uibModal.open({
        //        templateUrl: ctxfolderRecall + '/file_add.html',
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
        dataserviceSupplier.getDefaultRepo($rootScope.AssetCode, 'ASSET_RECALL', function (rs) {
            rs = rs.data;
            var data = rs !== null ? rs : { CatCode: '', ObjectCode: $rootScope.AssetCode, ObjectType: 'ASSET_RECALL' };
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
            dataserviceRecall.getItemFile(id, true, function (rs) {
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
            dataserviceRecall.getItemFile(id, true, mode, function (rs) {
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
            dataserviceRecall.getItemFile(id, true, mode, function (rs) {
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
            dataserviceRecall.getItemFile(id, true, mode, function (rs) {
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
        var listdata = $('#tblDataRecalledFile').DataTable().data();
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
            dataserviceRecall.createTempFile(id, false, "", function (rs) {
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
            dataserviceRecall.createTempFile(id, false, "", function (rs) {
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
            templateUrl: ctxfolderRecall + '/viewer.html',
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
            templateUrl: ctxfolderRecall + '/tabFileHistory.html',
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

app.controller('fileAddAsset', function ($scope, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, dataserviceRecall, para) {
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
            dataserviceRecall.insertAssetFile(data, function (result) {
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
            dataserviceRecall.getTreeCategory(function (result) {
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

app.controller('fileEditAsset', function ($scope, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModal, $uibModalInstance, dataserviceRecall, para) {
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
                dataserviceRecall.updateAssetFile(data, function (result) {
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
            dataserviceRecall.getTreeCategory(function (result) {
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

app.controller('fileShareAsset', function ($scope, $rootScope, $compile, $uibModalInstance, dataserviceRecall) {
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
        dataserviceRecall.getListObjectTypeShare(function (rs) {
            rs = rs.data;
            $scope.listObjType = rs;
        });
        dataserviceRecall.getListFileWithObject($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, function (rs) {
            rs = rs.data;
            $scope.listFileObject = rs;
        });
        reloadListObjectShare($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, $scope.model.ObjectCode, $scope.model.ObjectType, $scope.model.FileCode);
    }
    $scope.init();
    $scope.changeObjType = function (ObjType) {
        dataserviceRecall.getListObjectCode($rootScope.AssetCode, ObjType, function (rs) {
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
        dataserviceRecall.deleteObjectShare(id, function (rs) {
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
            dataserviceRecall.insertFileShare($scope.model, function (rs) {
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
        dataserviceRecall.getListObjectShare(objectCodeShared, objectTypeShared, objectCode, objectType, fileCode, function (rs) {
            rs = rs.data;
            $scope.listObjectShare = rs;
        })
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('tabFileHistory', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceRecall, $filter, para) {
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
            url: "/Admin/AssetRecalled/JTableFileHistory",
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
            templateUrl: ctxfolderRecall + '/contractTabFileSearch.html',
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
            dataserviceRecall.insertContractFile(data, function (result) {
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
        dataserviceRecall.getContractFile(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                rs.Object.FileName = fileName;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderRecall + '/tabFileEdit.html',
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
                    dataserviceRecall.deleteAssetFile(id, function (result) {
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
        //dataserviceRecall.getByteFile(id, function (rs) {rs=rs.data;
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
        dataserviceRecall.getSuggestionsContractFile($rootScope.RequestCode, function (rs) {
            rs = rs.data;
            var data = rs != '' ? rs : {};
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderRecall + '/tabFileAdd.html',
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
        dataserviceRecall.getItemFile(id, true, mode);
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
