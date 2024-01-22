var ctxfolderAcc = "/views/admin/fundAccEntry";
var ctxfolderMessage = "/views/message-box";
var ctxfolderCommonSetting = "/views/admin/commonSetting";
var app = angular.module('App_ESEIM_ACC', ['App_ESEIM_DASHBOARD', 'App_ESEIM', 'App_ESEIM_WF_PLUGIN', "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber', 'ng.jsoneditor']);

app.factory('dataserviceAcc', function ($http) {
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
        getDataType: function (callback) {
            $http.get('/Admin/CommonSetting/GetDataType').then(callback);
        },
        getCurrencyDefaultPayment: function (callback) {
            $http.post('/Admin/FundAccEntry/GetCurrencyDefaultPayment').then(callback);
        },
        insertCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Insert/', data).then(callback);
        },
        getListCurrency: function (callback) {
            $http.post('/Admin/FundAccEntry/GetListCurrency/').then(callback);
        },
        updateCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Update/', data).then(callback);
        },
        deleteCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Delete', data).then(callback);
        },
        checkPlan: function (data, callback) {
            $http.post('/Admin/FundAccEntry/CheckPlan?aetCode=' + data).then(callback);
        },
        getAetType: function (callback) {
            $http.post('/Admin/FundAccEntry/GetAetType').then(callback);
        },
        getUser: function (callback) {
            $http.post('/Admin/FundAccEntry/GetUser').then(callback);
        },
        getGetCurrency: function (callback) {
            $http.post('/Admin/ParamForWarning/GetCurrency').then(callback);
        },
        getGetCatName: function (callback) {
            $http.post('/Admin/FundAccEntry/GetCatName').then(callback);
        },
        getGetAetRelative: function (callback) {
            $http.post('/Admin/FundAccEntry/GetAetRelative').then(callback);
        },
        getGetAetRelativeType: function (callback) {
            $http.post('/Admin/FundAccEntry/GetAetRelativeType').then(callback);
        },
        getListFundFiles: function (data, callback) {                                                 // API get list
            $http.post('/Admin/FundAccEntry/GetListFundFiles?aetCode=' + data).then(callback);
        },
        uploadFile: function (data, callback) {                                                       // Upload file 
            submitFormUpload('/Admin/FundAccEntry/UploadFile', data, callback);
        },
        removeFileReq: function (data, callback) {
            $http.post('/Admin/FundAccEntry/RemoveFundFile?Id=' + data, callback).then(callback);
        },
        //removeFileReq: function (data, callback) {
        //    $http.post('/Admin/EDMSSendRequestProfile/RemoveFileRequest?fileId=' + data, callback).then(callback);
        //},
        getGetAccTrackingDetail: function (data, callback) {
            $http.get('/Admin/FundAccEntry/GetAccTrackingDetail?aetCode=' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/FundAccEntry/GetItem/', data).then(callback);
        },
        updatePlan: function (data, callback) {
            $http.post('/Admin/FundAccEntry/UpdatePlan/', data).then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/FundAccEntry/Insert/', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/FundAccEntry/Update/', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/FundAccEntry/Delete/' + data).then(callback);
        },
        getGenAETCode: function (type, catCode, callback) {
            $http.post('/admin/FundAccEntry/GenAETCode?type=' + type + "&&catCode=" + catCode).then(callback);
        },
        insertAccEntryTracking: function (aetCode, status, note, aetRelative, callback) {
            $http.post('/admin/FundAccEntry/InsertAccEntryTracking?aetCode=' + aetCode + "&&status=" + status + "&&note=" + note + "&&aetRelative=" + aetRelative).then(callback);
        },
        getListTitle: function (callback) {
            $http.post('/Admin/FundAccEntry/GetListTitle').then(callback);
        },
        gettreedata: function (data, callback) {
            $http.post('/Admin/FundCatReptExps/GetTreeData', data).then(callback);
        },
        getTotalReceipt: function (fromTime, toTime, aetType, status, isplan, CatCode, callback) {
            $http.post('/Admin/FundAccEntry/Total?fromDatePara=' + fromTime + "&&toDatePara=" + toTime + "&&aetType=" + aetType + "&&status=" + status + "&&isPlan=" + isplan + "&&CatCode=" + CatCode).then(callback);
        },
        getAddress: function (lat, lon, callback) {
            $http.get('/Admin/CardJob/GetAddress?lat=' + lat + '&lon=' + lon).then(callback);
        },
        getUpdateLog: function (data, callback) {
            $http.post('/Admin/FundAccEntry/GetUpdateLog?aetCode=' + data).then(callback);
        },
        getAetRelativeChil: function (data, callback) {
            $http.post('/Admin/FundAccEntry/GetAetRelativeChil?aetCode=' + data).then(callback);
        },
        getObjDependencyFund: function (callback) {
            $http.post('/Admin/FundAccEntry/GetObjDependencyFund').then(callback);
        },
        getObjCode: function (objDepen, callback) {
            $http.post('/Admin/CardJob/GetObjCode/?Dependency=' + objDepen).then(callback);
        },
        getRelative: function (callback) {
            $http.post('/Admin/FundAccEntry/GetRelative/').then(callback);
        },
        setObjectRelative: function (data, callback) {
            $http.post('/Admin/FundAccEntry/SetObjectRelative/', data).then(callback);
        },
        getObjectRelative: function (AetCode, callback) {
            $http.post('/Admin/FundAccEntry/GetObjectRelative/?AetCode=' + AetCode).then(callback);
        },
        getStatusObject: function (callback) {
            $http.post('/Admin/FundAccEntry/GetStatusObject').then(callback);
        },
        //Workflow
        getItemHeaderWithCode: function (data, callback) {
            $http.post('/Admin/FundAccEntry/GetItemHeaderWithCode?code=' + data).then(callback);
        },
        getActionStatus: function (data, callback) {
            $http.get('/Admin/FundAccEntry/GetActionStatus?code=' + data).then(callback);
        },
        getItemHeader: function (data, callback) {
            $http.post('/Admin/FundAccEntry/GetItemHeader?id=' + data).then(callback);
        },
        getListRepeat: function (data, callback) {
            $http.post('/Admin/FundAccEntry/GetListRepeat?code=' + data).then(callback);
        },
        getStepWorkFlow: function (data, callback) {
            $http.post('/Admin/FundAccEntry/GetStepWorkFlow?code=' + data).then(callback);
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
        getWorkflowByType: function (data, callback) {
            $http.post('/Admin/FundAccEntry/GetWorkflowByType?type=' + data).then(callback)
        },
        getItemTemp: function (data, callback) {
            $http.post('/Admin/FundAccEntry/GetItemTemp?id=' + data).then(callback)
        },


        getLogStatus: function (data, callback) {
            $http.post('/Admin/FundAccEntry/GetLogStatus?code=' + data).then(callback);
        },
        checkPermissionEditActivityById: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/CheckPermissionEditActivityById?id=' + data).then(callback);
        },
        getItemActInst: function (data, callback) {
            $http.get('/Admin/WorkflowActivity/GetItemActInst?id=' + data).then(callback)
        },
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

app.controller('Ctrl_ESEIM_ACC', function ($scope, $filter, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceAcc, $cookies, $translate) {
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
        });
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/;
            //var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.CatCode)) {
                mess.Status = true;
                mess.Title = mess.Title.CatCode(" - ", caption.FAE_VALIDATE_AET_CODE, "<br/>");
            }
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                Title: {
                    required: true,
                    regx: /^[^\s].*/,
                    maxlength: 255
                },
                Address: {
                    maxlength: 255
                },
                Note: {
                    maxlength: 255
                },
                DeadLine:
                {
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
                    required: caption.FEA_VALIDATE_TITLE,
                    regx: caption.FAE_VALIDATE_REGX_TITLE,
                    maxlength: caption.FAE_VALIDATE_MAX_LENGTH_INPUT_TEXT
                },
                Address: {
                    maxlength: caption.FAE_VALIDATE_MAX_LENGTH_INPUT_TEXT
                },
                Note: {
                    maxlength: caption.FAE_VALIDATE_MAX_LENGTH_INPUT_TEXT
                },
                DeadLine:
                {
                    required: caption.FEA_VALIDATE_DEADLINE,
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

        $rootScope.listPlan = [
            { Code: '', Name: caption.FEA_STATUS_ALL },
            {
                Code: "true",
                Name: caption.FEA_COLLECTION_AND_PLANS
            },
            {
                Code: "false",
                Name: caption.FEA_INCOME_AND_EXPENDITURE_PATTERNS
            },
        ];
        $rootScope.listManagerStatus = [
            {
                Code: "APPROVED",
                Name: caption.FEA_STATUS_APPROE
            },
            {
                Code: "REFUSE",
                Name: caption.FEA_STATUS_REFUSE
            },
        ];
        $rootScope.listsearchStatus = [
            {
                Code: '',
                Name: caption.FEA_STATUS_ALL
            },
            {
                Code: "CREATED",
                Name: caption.FEA_STATUS_CREATED
            },
            {
                Code: "CANCEL",
                Name: caption.FEA_STATUS_CANCEL
            },
            {
                Code: "PENDING",
                Name: caption.FEA_STATUS_PENDING
            },
            {
                Code: "APPROVED",
                Name: caption.FEA_STATUS_APPROE
            },
            {
                Code: "REFUSE",
                Name: caption.FEA_STATUS_REFUSE
            },
        ];
        $scope.listAetType = [
            {
                Code: '',
                Name: caption.FEA_STATUS_ALL,

            },
            {
                Code: "Receipt",
                Name: caption.FEA_REVENUE,
                Color: "#088A08"
            },
            {
                Code: "Expense",
                Name: caption.FEA_EXPENDI,
                Color: "#FE2E2E"
            }];
    });
    $rootScope.zoomMapDefault = 16;
    $rootScope.latDefault = 21.0277644;
    $rootScope.lngDefault = 105.83415979999995;
    $rootScope.addressDefault = 'Hanoi, Hoàn Kiếm, Hanoi, Vietnam';

    dataserviceAcc.getUser(function (rs) {
        rs = rs.data;
        $rootScope.listUser = rs;
    });
    dataserviceAcc.getStatusObject(function (rs) {
        rs = rs.data;
        $rootScope.listStatus = rs;
    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/FundAccEntry/Translation');
    //$translateProvider.preferredLanguage('en-US');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderAcc + '/index.html',
            controller: 'index'
        })
        .when('/add', {
            templateUrl: ctxfolderAcc + '/add.html',
            controller: 'add'
        })
        .when('/edit', {
            templateUrl: ctxfolderAcc + '/edit.html',
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

app.directive('customOnChangeFund', function () {                               // Receive File from Html
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChangeFund);
            element.on('change', onChangeHandler);
            element.on('$destroy', function () {
                element.off();
            });
        }
    };
});

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceAcc, $filter, $location, myService) {
    var vm = $scope;
    $scope.model = {
        AetCode: '',
        Title: '',
        AetType: '',
        DeadLine: '',
        AetDescription: '',
        Total: '',
        Receiptter: '',
        Payer: '',
        Status: '',
        FromTime: '',
        ToTime: '',
        IsPlan: '',
        CatCode: '',
    };

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/FundAccEntry/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                //d.AetCode = $scope.model.AetCode;
                d.AetType = $scope.model.AetType;
                d.Status = $scope.model.Status;
                d.IsPlan = $scope.model.IsPlan;
                d.FromTime = $scope.model.FromTime;
                d.ToTime = $scope.model.ToTime;
                d.CatCode = $scope.model.CatCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                //console.log('complete');
                heightTableViewportManual(300, "#tblData");
                //heightTableManual(400, "#tblData");
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
                //console.log('headerCallback');
                setTimeout(function () {
                    $scope.$apply();
                })
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
                setTimeout(function () {
                    $scope.$apply();
                })
            });
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.Id;
                    $scope.edit(Id);
                }
            });
            //console.log('createdRow');
        })
        .withOption('footerCallback', function (tfoot, data) {
            dataserviceAcc.getTotalReceipt($scope.model.FromTime, $scope.model.ToTime, $scope.model.AetType, $scope.model.Status, $scope.model.IsPlan, $scope.model.CatCode, function (rs) {
                rs = rs.data;
                //console.log(rs);
                $scope.TotalReceiptApproved = Math.round(rs.TotalReceiptApproved);
                $scope.TotalReceipt = Math.round(rs.TotalReceipt);
                $scope.TotalExpenseApproved = Math.round(rs.TotalExpenseApproved);
                $scope.TotalExpense = Math.round(rs.TotalExpense);
                $scope.TotalSurplusApproved = Math.round(rs.TotalSurplusApproved);
                //console.log('footerCallback');
                setTimeout(function () {
                    $scope.$apply();
                })
            })
        });
    vm.dtColumns = [];

    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('DeadLine').withTitle('{{"FEA_LIST_COL_DEAD_LINE" | translate}}').withOption('sClass', 'dataTable-pr0 w150').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));

    //vm.dtColumns.push(DTColumnBuilder.newColumn('CatName').withTitle('{{"FAE_LIST_COL_CAT_NAME" | translate}}').withOption('sClass', 'dataTable-pr0 w150 hidden').renderWith(function (data, type) {
    //    return data;
    //}));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"FAE_LIST_COL_TITLE" | translate}}').withOption('sClass', 'dataTable-pr0 w300').renderWith(function (data, type, full) {
        var catName = '<span class="badge-customer badge-customer-success fs9 ml5">' + full.CatName + '</span>';

        var time = "";
        //if (full.IsOutTime == 1) {
        //    time = '<span class="badge-customer badge-customer-danger fs9 ml5">' + full.TimeAlive + '</span>';
        //}
        //else {
        //    time = '<span class="badge-customer badge-customer-success fs9 ml5">' + full.TimeAlive + '</span>';
        //}

        var title = '<span class = "bold">' + data + '</span><br />' + catName + time;

        if (full.SLastLog != '' && full.SLastLog != null && full.SLastLog != undefined) {
            title += formatDetail(full);
        }
        return title;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('AetType').withTitle('{{"FAE_LIST_COL_AET_TYPE" | translate}}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
        if (data == "Receipt") {
            return caption.FEA_REVENUE;
        }
        else {
            return caption.FEA_EXPENDI;
        }

    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Total').withTitle('{{"FAE_LIST_COL_TOTAL" | translate}}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
        return '<span class="text-danger">' + $filter('currency')(data, '', 0) + '</span>';
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Currency').withTitle('{{"FAE_LIST_COL_AET_TYPE" | translate}}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
        return data;
    }));

    //vm.dtColumns.push(DTColumnBuilder.newColumn('StatusObject').withTitle('{{"FAE_LIST_COL_STATUS" | translate}}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
    //    switch (data) {
    //        case 'Duyệt':
    //            data = '<span class="bold text-green">' + data + '</span>';
    //            break;
    //        case 'Hủy bỏ':
    //        case 'Từ chối':
    //            data = '<span class="bold text-danger">' + data + '</span>';
    //            break;
    //        case 'Đang xử lý':
    //            data = '<span class="bold text-waring">' + data + '</span>';
    //            break;
    //        case 'Khởi tạo':
    //            data = '<span class="bold text-primary">' + data + '</span>';
    //            break;
    //    }
    //    return data;
    //}));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Payer').withTitle('{{"FAE_LIST_COL_PAYER" | translate}}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Receiptter').withTitle('{{"FAE_LIST_COL_RECEIPTTER" | translate}}').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'dataTable-w80').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full, meta) {
        return '<a title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ')" class="fs25 pr10"><i class="fas fa-edit"style="--fa-primary-color: green;"></i></a>' +
            '<a title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" class="fs25"><i class="fas fa-trash"style="--fa-primary-color: red;"></i></a>';
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
    }
    $scope.search = function () {
        reloadData(true);
    }
    $scope.add = function () {
        //var modalInstance = $uibModal.open({
        //    animation: true,
        //    templateUrl: ctxfolderAcc + '/add.html',
        //    controller: 'add',
        //    windowClass: "modal-funAccEntry",
        //    backdrop: 'static',
        //    size: '70'
        //});
        //modalInstance.result.then(function (d) {
        //    $scope.reload();
        //}, function () {
        //});
        $location.path('/add');
    }
    $scope.edit = function (id) {
        //var modalInstance = $uibModal.open({
        //    animation: true,
        //    templateUrl: ctxfolderAcc + '/edit.html',
        //    controller: 'edit',
        //    windowClass: "modal-funAccEntry",
        //    backdrop: 'static',
        //    size: '70',
        //    resolve: {
        //        para: function () {
        //            return id;
        //        }
        //    }
        //});
        //modalInstance.result.then(function (d) {
        //    $scope.reloadNoResetPage();
        //}, function () {
        //});
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
                    dataserviceAcc.delete(id, function (rs) {
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
    $scope.initload = function () {
        dataserviceAcc.gettreedata({ IdI: null }, function (result) {
            result = result.data;
            $scope.treeData = result;
            var all = {
                Code: '',
                Title: caption.FEA_STATUS_ALL
            }
            $scope.treeData.unshift(all)
        });
        //dataserviceAcc.getCatFund(function (rs) {rs=rs.data;
        //    $scope.listTypeFund = rs;
        //})
        //dataserviceAcc.updatePlan($scope.model, function (rs) {rs=rs.data;
        //    //if (rs.Error) {
        //    //    App.toastrError(rs.Title);
        //    //} else {
        //    //if (!rs.Error) {
        //    //    App.toastrSuccess(rs.Title);
        //    //    $uibModalInstance.close();
        //    //}
        //});
        dataserviceAcc.getStatusAct(function (rs) {
            rs = rs.data;
            $scope.listsearchStatus = rs;
            $scope.listsearchStatus.unshift({
                Code: '',
                Name: caption.FEA_STATUS_ALL
            });
            $scope.listsearchStatus.push({
                Code: "APPROVED",
                Name: caption.FEA_STATUS_FINAL_DONE
            });

        })
    }
    $scope.initload();
    function initAutocomplete() {
        var defaultBounds = new google.maps.LatLngBounds(new google.maps.LatLng(-33.8902, 151.1759), new google.maps.LatLng(-33.8474, 151.2631));
        var options = {
            bounds: defaultBounds,
            types: ['geocode']
        };
        var autocomplete = new google.maps.places.Autocomplete(document.getElementById('Address'), options);
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

    //xuất Excel
    $scope.export = function () {
        var orderBy = 'Id DESC';
        var exportType = 0;
        var orderArr = $scope.dtInstance.DataTable.order();
        var column;
        if (orderArr.length == 2) {
            column = $scope.dtInstance.DataTable.init().aoColumns[orderArr[0]];
            orderBy = column.mData + ' ' + orderArr[1];
        } else if (orderArr.length > 0) {
            var order = orderArr[0];
            column = $scope.dtInstance.DataTable.init().aoColumns[order[0]];
            orderBy = column.mData + ' ' + order[1];
        }
        //var pageInfo = $scope.dtInstance.DataTable.page.info();
        //var obj = {
        //    start: pageInfo.row,
        //    length: pageInfo.length,
        //    //QueryOrderBy: orderBy,
        //    ExportType: exportType,
        //    Month: $scope.model.CustomerMonth,
        //    Packcode: $scope.model.PackCode,
        //    Cif: $scope.model.CustomerCif
        //};

        var page = vm.dtInstance.DataTable.page() + 1;
        var length = vm.dtInstance.DataTable.page.len();
        location.href = "/Admin/FundAccEntry/ExportExcel?"
            + "page=" + page
            + "&row=" + length
            + "&fromDatePara=" + $scope.model.FromTime
            + "&toDatePara=" + $scope.model.ToTime
            + "&deadLine=" + $scope.model.DeadLine
            + "&aetType=" + $scope.model.AetType
            + "&payer=" + $scope.model.Payer
            + "&status=" + $scope.model.Status
            + "&isplan=" + $scope.model.IsPlan
            + "&orderBy=" + orderBy
    }

    //function formatFooter(totalReceipts, totalPaymentSlip, totalSurplus) {
    //    var domFooter = '<tr>';
    //    domFooter += '<th colspan="1" class=""></th>';
    //    domFooter += `<th colspan="3" class="pl10">`;
    //    domFooter += `<span> ${caption.FAE_LIST_COL_TOTAL_EXPENSE} :  </span>`;
    //    domFooter += `<span class="text-success"> ${totalReceipts} </span>`;
    //    domFooter += `</th>`;
    //}
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    setTimeout(function () {
        //Yêu cầu từ ngày đến ngày
        $("#FromTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ToTime').datepicker('setStartDate', maxDate);
        });
        $("#ToTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromTime').datepicker('setEndDate', maxDate);
        });
    }, 200);
});

app.controller('add', function ($scope, $rootScope, $uibModal, dataserviceAcc, $filter, $location) {
    $scope.model = {
        AetCode: '',
        GoogleMap: '',
        AetCode: '',
        Title: '',
        AetType: '',
        AetDescription: '',
        Currency: '',
        WorkflowCat: 'THU_CHI',
        Status: ""
    }

    $scope.modelWf = {
        WorkflowCode: "THU_CHI",
        ObjectType: "FUND_ACC_ENTRY",
        ObjectInst: "",
    };
    dataserviceAcc.getCurrencyDefaultPayment(function (rs) {
        rs = rs.data;

        $scope.model.Currency = rs;
    });
    //$scope.AetCode = [];
    $scope.listFundFile = [];
    $scope.listFundFileRemove = [];

    $scope.openMap = function () {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderAcc + '/googleMap.html',
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
            Name: caption.FEA_REVENUE,
            Color: "#088A08"
        },
        {
            Code: "Expense",
            Name: caption.FEA_EXPENDI,
            Color: "#FE2E2E"
        }];

    $scope.listAetRelativeType = [
        {
            Code: "Vay",
            Name: caption.FEA_LOANS
        },
        {
            Code: "Trả",
            Name: caption.FEA_PAY
        }];

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //if (data.StatusObject == "" || data.StatusObject == null || data.StatusObject == undefined) {
        //    $scope.errorStatusObject = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorStatusObject = false;
        //}
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

        //if (data.WorkflowCat == "" || data.WorkflowCat == null) {
        //    $scope.errorWorkflowCat = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorWorkflowCat = false;
        //}

        return mess;
    }

    $scope.initData = function () {
        dataserviceAcc.getListCurrency(function (rs) {
            rs = rs.data;

            $scope.listCurrency = rs;
        })
        dataserviceAcc.getGetAetRelative(function (rs) {
            rs = rs.data;
            $rootScope.AetRelative = rs;
        })
        dataserviceAcc.getGetCatName(function (rs) {
            rs = rs.data;
            $rootScope.listCatName = rs;
        });
        dataserviceAcc.getListTitle(function (rs) {
            rs = rs.data;
            $rootScope.listTitle = rs;
        })
        dataserviceAcc.gettreedata({ IdI: null }, function (result) {
            result = result.data;
            $scope.treeData = result;
        });
        dataserviceAcc.getObjDependencyFund(function (rs) {
            rs = rs.data;
            $scope.listObjType = rs;
        });

        dataserviceAcc.getWorkFlow(function (result) {
            result = result.data;
            $rootScope.lstWorkflow = result;
        });
        dataserviceAcc.getStatusAct(function (rs) {
            rs = rs.data;
            $scope.lstStatus = rs;
        })
    }

    $scope.initData();

    $scope.cancel = function () {
        //$uibModalInstance.dismiss('cancel');
        $location.path("/");
    }

    $scope.submit = function () {
        App.blockUI({
            target: "#contentMain",
            boxed: true,
            message: 'loading...'
        });
        var check = CKEDITOR.instances['Note'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['Note'].getData();
            $scope.model.AetDescription = data;
        }
        dataserviceAcc.getGenAETCode($scope.model.AetType, $scope.model.CatCode, function (rs) {
            rs = rs.data;
            $scope.model.ListFileAccEntry = $scope.listFundFile;
            $scope.model.ListFileAccEntryRemove = $scope.listFundFileRemove;
            $scope.model.AetCode = rs;
            validationSelect($scope.model);
            if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
                dataserviceAcc.insert($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                        App.unblockUI("#contentMain");
                    } else {
                        App.toastrSuccess(rs.Title);
                        App.unblockUI("#contentMain");
                        //Workflow
                        $scope.modelWf.ObjectInst = $scope.model.AetCode;
                        $scope.modelWf.WorkflowCode = $scope.model.WorkflowCat;
                        $scope.modelWf.ObjectName = $scope.model.Title;
                        dataserviceAcc.createWfInstance($scope.modelWf, function (rs) {
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
            else {
                App.unblockUI("#contentMain");
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
    });

    $scope.changleSelect = function (SelectType, item) {
        if (SelectType == "StatusObject" && $scope.model.StatusObject != "") {
            $scope.errorStatusObject = false;
        } else if (SelectType == "StatusObject") {
            $scope.errorStatusObject = true;
        }
        if (SelectType == "CatCode" && $scope.model.CatCode != "") {
            $scope.errorCatCode = false;
        } else if (SelectType == "CatCode") {
            $scope.errorCatCode = true;
        }
        if (SelectType == "AetType" && $scope.model.AetType != "") {
            $scope.errorAetType = false;
            // dataserviceAcc.getWorkflowByType($scope.model.AetType, function (rs) {
            //     rs = rs.data;
            //     $rootScope.lstWorkflow = rs;
            //     $scope.model.WorkflowCat = "";
            // })

        } else if (SelectType == "AetType") {
            $scope.errorAetType = true;
        }
        if (SelectType == "Currency" && $scope.model.Currency != "") {
            $scope.errorCurrency = false;
        } else if (SelectType == "Currency") {
            $scope.errorCurrency = true;
        }
        if (SelectType == "ObjType" && $scope.model.ObjType != "") {
            $scope.model.ObjCode = "";
            dataserviceAcc.getObjCode(item.Code, function (rs) {
                rs = rs.data;
                $scope.listObjCode = rs;
            });
        }
        if (SelectType == "Total" && ($scope.model.Total == null || $scope.model.Total == undefined)) {
            $scope.errorTotal = true;
        } else {
            if ($scope.model.Total > 99999999999999999) {
                $scope.errorTotal = true;
            }
            else {
                $scope.errorTotal = false;
            }
        }
    }

    $scope.IsHide = false;

    $scope.changeAetRelative = function () {
        dataserviceAcc.checkPlan($scope.model.AetRelative, function (rs) {
            rs = rs.data;
            $scope.isPlanRelative = rs.IsPlan;
            if ($scope.isPlanRelative) {
                $('#DeadLine').datepicker('setEndDate', new Date());
                $scope.model.DeadLine = "";
                $scope.model.AetType = rs.AetTye;
                dataserviceAcc.getWorkflowByType($scope.model.AetType, function (rs) {
                    rs = rs.data;
                    $rootScope.lstWorkflow = rs;
                    $scope.model.WorkflowCat = "";
                })
                $scope.IsHide = true;
                $scope.model.Currency = rs.Currency;
            }
        });
    }

    $scope.loadFileReq = function (event) {
        var files = event.target.files;
        var checkExits = $scope.listFundFile.filter(k => k.FileName === files[0].name);
        if (checkExits.length == 0) {
            var formData = new FormData();
            formData.append("file", files[0] != undefined ? files[0] : null);
            dataserviceAcc.uploadFile(formData, function (rs) {
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
            App.toastrError(cation.COM_MSG_FILE_EXISTS);
        }
    }

    $scope.removeFileReq = function (index) {
        var itemRemove = $scope.listFundFile[index];

        if (itemRemove.Id != null) {
            $scope.listFundFileRemove.push(itemRemove);
        }
        $scope.listFundFile.splice(index, 1);
    }

    $scope.changeWorkFlowInts = function (wfCatCode) {
        if ($scope.model.WorkflowCat != "") {
            $scope.errorWorkflowCat = false;
        } else {
            $scope.errorWorkflowCat = true;
        }

        dataserviceAcc.getStepWorkFlow(wfCatCode, function (rs) {
            data = rs.data;
            $scope.lstStep = data.list;
            setTimeout(function () {
                $('#progressbar li').css('width', 'calc(100%/' + data.list.length + ')');
            }, 10);
        })
    }

    $scope.changeStatus = function () {
        if ($scope.model.Status != "") {
            $scope.errorStatus = false;
        } else {
            $scope.errorStatus = true;
        }
    }

    $scope.deleteObjType = function () {
        $scope.model.ObjType = "";
        $scope.listObjCode = [];
        $scope.model.ObjCode = "";
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

app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, dataserviceAcc, myService) {
    $scope.model = {
        ListFileAccEntry: [],
    }

    $scope.listFundFile = [];

    $scope.listFundFileRemove = [];

    $scope.modelWf = {
        WorkflowCode: "THU_CHI",
        ObjectType: "FUND_ACC_ENTRY",
        ObjectInst: "",
    };

    $scope.listAetType = [
        {
            Code: "Receipt",
            Name: caption.FEA_REVENUE,
            Color: "#088A08"
        },
        {
            Code: "Expense",
            Name: caption.FEA_EXPENDI,
            Color: "#FE2E2E"
        }];

    $scope.listAetRelativeType = [
        {
            Code: "Vay",
            Name: caption.FEA_LOANS
        },
        {
            Code: "Trả",
            Name: caption.FEA_PAY
        }];

    var para = myService.getData();

    if (para == undefined) {
        para = $location.search().id;
    }
    if (para == undefined || para <= 0) {
        location.href = "/Admin/FundAccEntry";
    }
    $scope.reloadTemp = function () {
        dataserviceAcc.getItemTemp(para, function (rs) {

            rs = rs.data;
            var data = rs.Object;

            //Item header
            $scope.model = data.data;

            $scope.model.DeadLine = $filter('date')($scope.model.DeadLine, 'dd/MM/yyyy')
            dataserviceAcc.getListFundFiles($scope.model.AetCode, function (rs) {
                rs = rs.data;

                $scope.listFundFile = rs;
            });
            dataserviceAcc.getAetRelativeChil($scope.model.AetCode, function (rs) {
                rs = rs.data;
                var list = [];
                for (var i = 0; i < rs.length; i++) {
                    list.push(rs[i].Total.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
                }
                $scope.totalChild = list.join(" - ");

            });
            if ($scope.model.ObjType != "" || $scope.model.ObjType != null) {
                dataserviceAcc.getObjCode($scope.model.ObjType, function (rs) {
                    rs = rs.data;
                    $scope.listObjCode = rs;
                });
            }

            //Workflow
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
            if (data.data != undefined && data.data != "" && data.data != null) {
                $scope.model.WorkflowCat = data.data.WorkflowCat;
                $scope.check = false;
                if (data.data.Status.length != undefined) {
                    var json = JSON.parse(data.data.Status);
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
                    var json = JSON.parse(data.StatusLog);
                    var arr = [];
                    arr.push(json[json.length - 1]);
                    $scope.loghis = arr;
                    $scope.model.Status = $scope.loghis[0].StatusCode;
                }
            }

            $scope.lstStatus = data.com
        })
    }
    if (para != undefined) {
        $scope.initData = function () {
            dataserviceAcc.getListCurrency(function (rs) {
                rs = rs.data;
                $scope.listCurrency = rs;
            })
            dataserviceAcc.getGetCatName(function (rs) {
                rs = rs.data;
                $rootScope.listCatName = rs;
            });

            dataserviceAcc.getListTitle(function (rs) {
                rs = rs.data;
                $rootScope.listTitle = rs;
            });
            dataserviceAcc.gettreedata({ IdI: null }, function (result) {
                result = result.data;
                $scope.treeData = result;
            });
            dataserviceAcc.getObjDependencyFund(function (rs) {
                rs = rs.data;
                $scope.listObjType = rs;
            });

            dataserviceAcc.getWorkFlow(function (result) {
                result = result.data;
                $rootScope.lstWorkflow = result;
            });

            dataserviceAcc.getItem(para, function (rs) {
                rs = rs.data;
                $scope.model = rs[0];
                try {
                    var lstStatus = JSON.parse($scope.model.Status);
                    console.log(lstStatus.length);
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
                $scope.model.DeadLine = $filter('date')($scope.model.DeadLine, 'dd/MM/yyyy')
                dataserviceAcc.getListFundFiles($scope.model.AetCode, function (rs) {
                    rs = rs.data;
                    $scope.listFundFile = rs;
                });
                dataserviceAcc.getAetRelativeChil($scope.model.AetCode, function (rs) {
                    rs = rs.data;
                    var list = [];
                    for (var i = 0; i < rs.length; i++) {
                        list.push(rs[i].Total.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
                    }
                    $scope.totalChild = list.join(" - ");

                });
                if ($scope.model.ObjType != "" || $scope.model.ObjType != null) {
                    dataserviceAcc.getObjCode($scope.model.ObjType, function (rs) {
                        rs = rs.data;
                        $scope.listObjCode = rs;
                    });
                }

                setTimeout(function () {
                    $rootScope.loadDiagramWfInst($scope.model.AetCode, $scope.modelWf.ObjectType);
                }, 800)
            })
        }
        $scope.initData();
        $scope.reloadTemp();
    }
    else {
        $location.path("/");
    }

    $scope.disableAetRelative = false;

    $scope.IsPermission = false;

    $scope.IsPermissionManager = false;

    $scope.IsShow = true;

    //Edit Activity Instance
    $scope.editInstAct = function (id, objCode) {
        dataserviceAcc.checkPermissionEditActivityById(id, function (rs) {
            rs = rs.data;
            if (!rs) {
                return App.toastrError(caption.COM_MSG_PERMISSION_EDIT_ACT);
            }
            dataserviceAcc.getItemActInst(id, function (rs) {
                $rootScope.IsLock = rs.data.IsLock;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/add-activity-instance.html',
                    controller: 'edit-activity-instance',
                    backdrop: 'static',
                    keyboard: false,
                    size: '65',
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
                    $rootScope.loadDiagramWfInst($scope.model.AetCode, $scope.modelWf.ObjectType);
                    dataserviceAcc.getLogStatus($scope.model.AetCode, function (rs) {
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


    $scope.addObj = function () {
        if ($scope.IsPermission == false) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderAcc + '/add-object-relative.html',
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

    $scope.changeAetRelative = function () {
        dataserviceAcc.checkPlan($scope.model.AetRelative, function (rs) {
            rs = rs.data;
            $scope.isPlanRelative = rs.IsPlan;
            if ($scope.isPlanRelative) {
                $('#DeadLine').datepicker('setEndDate', new Date());
                $scope.model.DeadLine = "";
                $scope.model.AetType = rs.AetTye;
                $scope.hide = true;
                $scope.model.Currency = rs.Currency;
            }
        });
    }

    $scope.changleSelect = function (SelectType, item) {
        if (SelectType == "StatusObject" && $scope.model.StatusObject != "") {
            $scope.errorStatusObject = false;
        } else if (SelectType == "StatusObject") {
            $scope.errorStatusObject = true;
        }
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
        if (SelectType == "Currency" && $scope.model.Currency != "") {
            $scope.errorCurrency = false;
        } else if (SelectType == "Currency") {
            $scope.errorCurrency = true;
        }
        if (SelectType == "ObjType" && $scope.model.ObjType != "") {
            $scope.model.ObjCode = "";
            dataserviceAcc.getObjCode(item.Code, function (rs) {
                rs = rs.data;
                $scope.listObjCode = rs;
            });
        }
        if (SelectType == "Total" && ($scope.model.Total == null || $scope.model.Total == undefined)) {
            $scope.errorTotal = true;
        } else {
            if ($scope.model.Total > 99999999999999999) {
                $scope.errorTotal = true;
            } else {
                $scope.errorTotal = false;
            }
        }
    }

    $scope.openMap = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderAcc + '/googleMap.html',
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
            templateUrl: ctxfolderAcc + '/activity.html',
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

    $scope.viewLogStatus = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderAcc + '/view-status-log.html',
            controller: 'log-status',
            size: '30',
            resolve: {
                para: function () {
                    return $scope.model.ListStatusObjectLog;
                }
            }
        });
        modalInstance.result.then(function (d) {
        });
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //if (data.StatusObject == "" || data.StatusObject == null || data.StatusObject == undefined) {
        //    $scope.errorStatusObject = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorStatusObject = false;
        //}
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

    $scope.loadFileReq = function (event) {
        var files = event.target.files;
        var checkExits = $scope.listFundFile.filter(k => k.FileName === files[0].name);
        if (checkExits.length == 0) {
            var formData = new FormData();
            formData.append("file", files[0] != undefined ? files[0] : null);
            dataserviceAcc.uploadFile(formData, function (rs) {
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
        //$uibModalInstance.close();
        $location.path("/");
    }

    $scope.isTotal = false;

    $scope.openLog = function () {
        dataserviceAcc.getUpdateLog($scope.model.AetCode, function (rs) {
            rs = rs.data;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderAcc + '/showLog.html',
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

    $scope.updateAccTracking = function () {
        if (validationManager($scope.model.Action).Status == false) {

            dataserviceAcc.insertAccEntryTracking($scope.model.AetCode, $scope.model.Action, $scope.model.Note, $scope.model.AetRelative, function (rs) {
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
        console.log($scope.lstStep);
        var isAlreadyApproved = $scope.lstStep.findIndex(x => x.Status == "STATUS_ACTIVITY_END") != -1;
        if (window.isAllData == "False" && window.userName != $scope.model.CreatedBy) {
            return App.toastrError(caption.WFAI_MSG_NO_PERMISSION_UPDATE);
        }
        else if (isAlreadyApproved) {
            return App.toastrError(caption.WFAI_MSG_NO_PERMISSION_ALREADY_APPROVED);
        }
        var check = CKEDITOR.instances['Note'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['Note'].getData();
            $scope.model.AetDescription = data;
        }
        validationSelect($scope.model);
        if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
            $scope.model.ListFileAccEntry = $scope.listFundFile;
            $scope.model.ListFileAccEntryRemove = $scope.listFundFileRemove;

            dataserviceAcc.update($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    if ($scope.model.Status != "FINAL_DONE") {
                        dataserviceAcc.getActionStatus($scope.model.AetCode, function (rs) {
                            rs = rs.data;
                            var json = JSON.parse(rs[0].StatusLog);
                            var arr = [];
                            arr.push(json[json.length - 1]);
                            $scope.loghis = arr;
                            $scope.model.Status = $scope.loghis[0].StatusCode;
                        })
                        $scope.reloadTemp();
                        $scope.showAct = false;
                    }
                }
            });
        }
    }

    $scope.deleteObjType = function () {
        $scope.model.ObjType = "";
        $scope.listObjCode = [];
        $scope.model.ObjCode = "";
    }

    $scope.changeStatus = function () {
        if ($scope.model.Status == "REPEAT_REQUIRE_REWORK" || $scope.model.Status == "FINAL_REQUIRE_REWORK") {
            dataserviceAcc.getListRepeat($scope.model.AetCode, function (rs) {
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
    $scope.triggerUpload = function () {
        $('#btn-upload-file').click();
    }

    $scope.print = function () {
        var date = new Date();

        var toDay = $filter('date')(date, 'dd/MM/yyyy');
        var infoToDay = toDay.split("/");
        //model.DeadLine, model.Total
        var total = $scope.model.Total + '';
        var infoTime = $scope.model.DeadLine.split("/");

        var typeTicket = "";
        if ($scope.model.AetType === "Receipt") {
            typeTicket = "PHIẾU THU";
        }
        else {
            typeTicket = "PHIẾU CHI";
        }
        var content = '<p><strong>Đơn vị:</strong>................................. </p>' +
            '<p><strong>Địa chỉ:</strong>................................</p>' +
            '<p></p>' +
            '<p style="text-align: center;"><strong>' + typeTicket + '</strong></p>' +
            '<p style="text-align: center;"><em>Ngày ' + infoTime[0] + ' tháng ' + infoTime[1] + ' năm ' + infoTime[2] + '</em></p>' +
            '<p>Tiêu đề: <strong>' + $scope.model.Title + '</strong></p>' +
            '<p>Người trả: <strong>' + $scope.model.Payer + '</strong></p>' +
            '<p>Người nhận: <strong>' + $scope.model.Receiptter + '</strong></p>' +
            '<p>Địa chỉ: ' + $scope.model.Address + '</p>' +
            '<p>Số tiền: <strong>' + formatNumber(total) + '</strong> (Viết bằng chữ): <strong>' + docso(total) + '</strong></p>' +
            '<p>Kèm theo:........................................................ Chứng từ gốc:</p>' +
            '<p style="text-align: right;"><em>Ngày</em><em> ' + infoToDay[0] + ' </em><em>tháng </em><em>' + infoToDay[1] + ' </em><em>năm ' + infoToDay[2] + '</em><em></em></p>' +
            '<table>' +
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
            '<p>Đã nhận đủ số tiền (viết bằng chữ):...........................................................................</p>' +
            '<p></p>'

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
    });
});

app.controller('googleMap', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceAcc, $filter, para) {
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

            dataserviceAcc.getAddress(point.lat, point.lng, function (rs) {
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

app.controller('activity', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataserviceAcc, $timeout, para) {
    $scope.listAccEntryTracking = [];
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.initLoad = function () {
        dataserviceAcc.getGetAccTrackingDetail(para, function (rs) {
            rs = rs.data;
            for (var i = 0; i < rs.Object.length; i++) {
                rs.Object[i].Action = $rootScope.listStatus.filter(x => x.Code == rs.Object[i].Action)[0].Name;
            }
            $scope.listAccEntryTracking = rs.Object;
        });
    }

    $scope.initLoad();
});

app.controller('add-object-relative', function ($scope, $rootScope, $cookies, $cookieStore, $compile, $uibModal, $uibModalInstance, dataserviceAcc, AetCode) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    var dataSet = [];
    var listDependency = [];
    var listDeletedDependency = [];
    $scope.setting = {
        Id: -1,
        ObjType: '',
        ObjCode: '',
        Relative: '',

    };
    $scope.initData = function () {
        dataserviceAcc.getObjDependencyFund(function (rs) {
            rs = rs.data;
            $scope.listObjType = rs;
        });
        dataserviceAcc.getRelative(function (rs) {
            rs = rs.data;
            $scope.relative = rs;
        })
        dataserviceAcc.getObjectRelative(AetCode, function (rs) {
            rs = rs.data;
            angular.forEach(rs, function (value, key) {

                var obj = [];
                obj.push(value.CatObjCode);
                obj.push(value.CatObjName);
                obj.push(value.ObjCode);
                obj.push(value.ObjName);
                obj.push(value.Relative);
                obj.push(value.RelativeName);
                obj.push('<button title="Xoá" ng-click="deleteObjReletive(' + value.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i style="color:red" class="fa fa-trash"></i></button>');
                obj.push(value.Id);
                dataSet.push(obj);
            });
            setTimeout(function () {
                refrestTable();
            }, 100);
        });

    }
    $scope.objDependencyChange = function (code) {

        dataserviceAcc.getObjCode(code, function (rs) {
            rs = rs.data;
            $scope.listObjCode = rs;
        });

    };
    $scope.addDependency = function () {
        var id = $scope.setting.Id--;
        if ($scope.setting.ObjType === "" || $scope.setting.ObjCode === "" || $scope.setting.Relative === "") {
            App.toastrError(caption.FEA_CRUD_TXT_INFO);
            return;
        }

        var ObjType = $scope.listObjType.find(function (element) {
            if (element.Code == $scope.setting.ObjType) return true;
        });
        var objRelative = $scope.listObjCode.find(function (element) {
            if (element.Code == $scope.setting.ObjCode) return true;
        });
        var relative = $scope.relative.find(function (element) {
            if (element.Code == $scope.setting.Relative) return true;
        });

        for (var i = 0; i < dataSet.length; i++) {
            for (var j = 0; j < dataSet[i].length; j++) {
                if (dataSet[i][j] === $scope.setting.ObjCode) {
                    App.toastrError(caption.FEA_CRUD_TXT_CODE);
                    return;
                }
            }
        }
        var obj = [];
        obj.push(ObjType.Code);
        obj.push(ObjType.Name);
        obj.push(objRelative.Code);
        obj.push(objRelative.Name);
        obj.push(relative.Code);
        obj.push(relative.Name);
        obj.push('<button title="Xoá" ng-click="deleteObjReletive(' + id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i style="color:red" class="fa fa-trash"></i></button>');
        obj.push(id);
        dataSet.push(obj);
        refrestTable();
    };
    function refrestTable() {

        var datatable = $('#obj-data-table').DataTable({

            columns: [
                { title: '<i class="fa fa-info-circle mr5"></i>' + caption.FEA_DEPENDENT_TYPE },
                { title: '<i class="fa fa-info-circle mr5"></i>' + caption.FEA_DEPENDENT_NAME },
                { title: '<i class="fa fa-code mr5"></i>' + caption.FEA_OBJECT_CODE },
                { title: '<i class="fas fa-file-signature mr5"></i>' + caption.FEA_OBJECT_NAME },
                { title: '<i class="fa fa-thumbtack mr5"></i>' + caption.FEA_RELATIONSHIP_CODE },
                { title: '<i class="fa fa-thumbtack mr5"></i>' + caption.FEA_RELATIONSHIP },
                { title: '<i class="fa fa-location-arrow mr5"></i>' + caption.FEA_MANIPULATION }
            ],
            "createdRow": function (row, data, dataIndex) {
                $compile(angular.element(row).contents())($scope);
            },
            "searching": false,
            "lengthChange": false,
            "stripeClasses": [],
            "ordering": false,
            "bPaginate": false,
            "info": false,
            "aoColumnDefs": [{ "bVisible": false, "aTargets": [0, 2, 4] }]
        });
        datatable.clear();
        datatable.rows.add(dataSet);
        datatable.draw();
    }
    $scope.deleteObjReletive = function (id) {

        for (var i = 0; i < dataSet.length; i++) {
            if (dataSet[i][7] == id) {
                dataSet.splice(i, 1);
                refrestTable();
                if (id > 0) {
                    listDeletedDependency.push(id);
                }
                break;
            }
        }
    };
    $scope.initData();
    $scope.submit = function () {
        listObj = [];
        for (var i = 0; i < dataSet.length; i++) {
            var data = { Id: dataSet[i][7], ObjType: dataSet[i][0], ObjCode: dataSet[i][2], Relative: dataSet[i][4] };
            listObj.push(data);

        }
        dataserviceAcc.setObjectRelative({ AetCode: AetCode, ListDependency: listObj, ListDeletedDependency: listDeletedDependency }, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $uibModalInstance.close();
            }
        });
        //if (listDependency.length > 0) {

        //}
        //$scope.cancel();
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    });
    $scope.addCommonSettingRelative = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'FUND_RELATIVE',
                        GroupNote: 'Quan hệ',
                        AssetCode: 'FUND'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
        }, function () { });

    }


});

app.controller('showLog', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataserviceAcc, $timeout, para) {
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

app.controller('detail', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceAcc, $filter, para) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withTitle('{{"COM_SET_LIST_COL_ORDER" | translate}}').notSortable().withOption('sWidth', '30px').withOption('sClass', 'tcenter w50').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ValueSet').withTitle('{{"COM_SET_LIST_COL_VALUE_SET" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeName').withTitle('{{"COM_SET_LIST_COL_TYPE_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"COM_SET_LIST_COL_CREATE_TIME" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{"COM_SET_LIST_COL_CREATE_BY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"COM_SET_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
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
        dataserviceAcc.getDataType(function (rs) {
            rs = rs.data;
            $scope.listDataType = rs;
        });
    }
    $scope.init();
    $scope.add = function () {
        if ($scope.model.ValueSet == '') {
            App.toastrError(caption.COM_SET_CURD_MSG_SETTING_NOT_BLANK);
        } else if ($scope.model.ValueSet.length > 255) {
            App.toastrError("Vui lòng nhập giá trị cài đặt nhỏ hơn 255 ký tự");
        } else {
            dataserviceAcc.insertCommonSetting($scope.model, function (rs) {
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
            App.toastrError(caption.COM_SET_CURD_MSG_DATA_NOT_BLANK)
        } else if ($scope.model.ValueSet.length > 255) {
            App.toastrError("Vui lòng nhập giá trị cài đặt nhỏ hơn 255 ký tự");
        } else {
            dataserviceAcc.updateCommonSetting($scope.model, function (rs) {
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
                    dataserviceAcc.deleteCommonSetting(id, function (rs) {
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

app.controller('log-status', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, para) {
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.initData = function () {
        $scope.lstStatusLog = para;
    }
    $scope.initData();
    setTimeout(function () {
        setModalDraggable(".modal-dialog");
    }, 400);
});