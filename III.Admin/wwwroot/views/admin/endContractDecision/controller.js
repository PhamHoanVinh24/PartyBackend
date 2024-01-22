var ctxfolderEndContract = "/views/admin/endContractDecision";
var ctxfolderMessage = "/views/message-box";
var ctxfolderFileShare = "/views/admin/fileObjectShare";
var ctxfolderCommonSetting = "/views/admin/commonSetting";
var ctxfolderLog = "/views/log-box";
var app = angular.module('App_ESEIM_END_CONTRACT', ['App_ESEIM_DASHBOARD',"App_ESEIM", "App_ESEIM_WF_PLUGIN", "ui.bootstrap", "ngRoute", "ngCookies", "ngValidate", "datatables", "datatables.bootstrap", "pascalprecht.translate", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', 'dynamicNumber', 'ng.jsoneditor']);
app.factory('dataserviceEndContract', function ($http) {
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
        getReason: function (callback) {
            $http.post('/Admin/EndContractDecision/GetReason').then(callback);
        },
        getStatusAct: function (callback) {
            $http.post('/Admin/EndContractDecision/GetStatusAct').then(callback);
        },
        getListDepartment: function (callback) {
            $http.post('/Admin/HrEmployeeMobilization/GetListDepartment').then(callback);
        },
        getUserDepartment: function (data, callback) {
            $http.get('/Admin/EndContractDecision/GetUserDepartment?code=' + data).then(callback);
        },
        updateDetailEmployee: function (data, callback) {
            $http.post('/Admin/EndContractDecision/UpdateDetailEmployee?code=' + data).then(callback);
        },
        gettreedataunit: function (callback) {
            $http.post('/Admin/HREmployee/Gettreedataunit').then(callback);
        },
        getListPayScaleDetail: function (data, callback) {
            $http.get('/Admin/EndContractDecision/GetListPayScaleDetail?code=' + data).then(callback);
        },
        getListPayScale: function (callback) {
            $http.get('/Admin/EndContractDecision/GetListPayScale').then(callback);
        },
        getListCareer: function (callback) {
            $http.get('/Admin/EndContractDecision/GetListCareer').then(callback);
        },
        getWorkFlow: function (callback) {
            $http.post('/Admin/EndContractDecision/GetWorkFlow').then(callback);
        },
        getListPayTitle: function (callback) {
            $http.post('/Admin/EndContractDecision/GetListPayTitle').then(callback);
        },
        getItemHeader: function (data, callback) {
            $http.get('/Admin/EndContractDecision/GetItemHeader?id=' + data).then(callback);
        },
        getStepWorkFlow: function (data, callback) {
            $http.post('/Admin/EndContractDecision/GetStepWorkFlow?code=' + data).then(callback);
        },
        getDecision: function (callback) {
            $http.post('/Admin/EndContractDecision/GetDecision').then(callback);
        },
        getStatusDe: function (callback) {
            $http.post('/Admin/EndContractDecision/GetStatusDe').then(callback);
        },
        getItemHeaderWithCode: function (data, callback) {
            $http.get('/Admin/EndContractDecision/GetItemHeaderWithCode?code=' + data).then(callback);
        },
        getActionStatus: function (data, callback) {
            $http.get('/Admin/EndContractDecision/GetActionStatus?code=' + data).then(callback);
        },
        getListActivityRepeat: function (data, callback) {
            $http.get('/Admin/EndContractDecision/GetListActivityRepeat?decisionNum=' + data).then(callback);
        },
        getCount: function (data, callback) {
            $http.post('/Admin/EndContractDecision/GetCount', data).then(callback);
        },
        //Header
        insert: function (data, callback) {
            $http.post('/Admin/EndContractDecision/Insert', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/EndContractDecision/Update', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/EndContractDecision/Delete?id=' + data).then(callback);
        },
        //Detail
        insertDetail: function (data, callback) {
            $http.post('/Admin/EndContractDecision/InsertDetail', data).then(callback);
        },
        deleteDetail: function (data, callback) {
            $http.post('/Admin/EndContractDecision/DeleteDetail', data).then(callback);
        },
        //Workflow
        createWfInstance: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/CreateWfInstance', data).then(callback)
        },
        insertInstRunning: function (data, data1, callback) {
            $http.post('/Admin/WorkflowActivity/InsertInstRunning?wfInstCode=' + data + '&wfCode=' + data1).then(callback);
        },
        getActivityArranged: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/GetActivityArranged?wfCode=' + data).then(callback)
        },
        getActInstArranged: function (data, data1, callback) {
            $http.post('/Admin/WorkflowActivity/GetActInstArranged?id=' + data + '&objType=' + data1).then(callback)
        },
        checkPermissionEditActivityById: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/CheckPermissionEditActivityById?id=' + data).then(callback);
        },
        getItemActInst: function (data, callback) {
            $http.get('/Admin/WorkflowActivity/GetItemActInst?id=' + data).then(callback)
        },
        //LogData
        getJsonData: function (data, callback) {
            $http.post('/Admin/EndContractDecision/GetJsonData?decisionNum=' + data).then(callback);
        },
        //ExportExcel
        exportExcel: function (data, callback) {
            $http.post('/Admin/EndContractDecision/ExportExcel?planNumber=' + data).then(callback);
        },
        checkData: function (data, callback) {
            $http.post('/Admin/EndContractDecision/CheckData', data).then(callback);
        },
        insertFromExcel: function (data, callback) {
            $http.post('/Admin/EndContractDecision/InsertFromExcel', data).then(callback);
        },
        getEmployeeCode: function (data, data1, data2, callback) {
            $http.post('/Admin/EndContractDecision/GetEmployee?page=' + data + '&pageSize=' + data1 + '&employee=' + data2).then(callback);
        },
        // Import Excel
        getRole: function (callback) {
            $http.post('/Admin/EndContractDecision/GetRole').then(callback);
        },
        uploadFile: function (data, callback) {
            submitFormUpload('/Admin/EndContractDecision/UploadFile', data, callback)
        },
        logInfomation: function (data, callback) {
            $http.post('/Admin/EndContractDecision/LogInfomation', data).then(callback);
        },
        insertFromExcel: function (data, callback) {
            $http.post('/Admin/EndContractDecision/InsertFromExcel', data).then(callback);
        }
    };
});
app.filter('groupBy', function ($parse) {
    return _.memoize(function (items, field) {
        var getter = $parse(field);
        return _.groupBy(items, function (item) {
            return getter(item);
        });
    });
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
app.controller('Ctrl_ESEIM_END_CONTRACT', function ($scope, $rootScope, $cookies, $filter, dataserviceEndContract, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        $rootScope.IsTranslate = true;
        caption = caption[culture] ? caption[culture] : caption;
        $rootScope.validationOptionsEndContract = {
            rules: {
                DecisionNum: {
                    required: true,
                    regx: /^[a-zA-Z0-9]+[^êĂăĐđĨĩŨũƠơƯưẠ-ỹ!@#$%^&*<>?\s]*$/
                },
                Title: {
                    required: true,
                    regx: /^[^\s].*/
                },
            },
            messages: {
                DecisionNum: {
                    required: "Số quyết định không được để trống",
                    regx: 'Số quyết định không nhập ký tự đặc biệt'
                },
                Title: {
                    required: "Tên quyết định không được để trống",
                    regx: 'Không nhập khoảng trắng'
                },
            }
        }
    });
    $rootScope.ObjectCustomer = {
        CustomerId: '',
        CustommerCode: ''
    }
    $rootScope.textSearch = "";
    $rootScope.page = 1;
    $rootScope.pageSize = 10;
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/EndContractDecision/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderEndContract + '/index.html',
            controller: 'indexEndContract'
        })
        .when('/add', {
            templateUrl: ctxfolderEndContract + '/add.html',
            controller: 'add',
        })
        .when('/edit', {
            templateUrl: ctxfolderEndContract + '/edit.html',
            controller: 'edit',
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

app.controller('indexEndContract', function ($scope, $rootScope, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceEndContract, $location, $filter, myService) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.listGender = [
        {
            Code: "",
            Name: caption.COM_TXT_ALL
        },
        {
            Code: "1",
            Name: "Nam"
        },
        {
            Code: "2",
            Name: "Nữ"
        }
    ];
    $scope.CountEmployee = 0;
    $scope.model = {
        FromDate: '',
        ToDate: '',
        DecisionNum: '',
        DepartmentCode: '',
        CodeEmployee: '',
    }
    $scope.modelHeader = {
        DecisionNum: '',
        Title: '',
        WorkflowCat: '',
        Status: '',
        Noted: '',
    }
    $scope.treeDataunit = [];
    $scope.positionData = [];
    $scope.treedataHr = [];
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EndContractDecision/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.DecisionNum = $scope.model.DecisionNum;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
                d.AprovedBy = $scope.model.AprovedBy;
                d.Status = $scope.model.Status;
                d.CodeEmployee = $scope.model.CodeEmployee;
                d.DepartmentCode = $scope.model.DepartmentCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(15)
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
            $scope.CountEmployee = data.count;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).contents())($scope);

            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);


        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'dataTable-pr0 dataTable-5per hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Full').withTitle('{{"ECD_LBL_CRUD_NUM_DECISTION" | translate }} & {{"ECD_LBL_CRUD_DEC_NAME"| translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"ECD_LIST_COL_DATE_CREATED" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StatusOf').withTitle('{{"ECD_LIST_COL_STATUS" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Signer').withTitle('{{"ECD_LIST_COL_SIGNER" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SignTime').withTitle('{{"ECD_LIST_COL_DATE_SIGN" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withTitle('{{"ECD_LIST_COL_MANIPULATION" | translate}}').withOption('sClass', 'nowrap text-center dataTable-w80').renderWith(function (data, type, full) {
        return '<a ng-click="editPayDecision(' + full.Id + ')" style1= "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class1="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-edit fs20 pr20"></i></a>' +
            '<a title="Xoá" ng-click="deletePayDecision(' + full.Id + ')" style1="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45);" class1="btn btn-icon-only btn-circle btn-outline red"><i class="fas fa-trash-alt fs20 text-danger"></i></a>';
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
                $scope.selectedItems = selectedItems;
            }
        }
    }
    function toggleOne(selectedItems) {
        $scope.selectedItems = selectedItems;

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
        dataserviceEndContract.getCount($scope.model, function (rs) {
            rs = rs.data;
            $scope.CountEmployeeNotWork = rs;
        });
    }
    $scope.init = function () {
        dataserviceEndContract.getDecision(function (rs) {
            rs = rs.data;
            $scope.listDecision = rs;
        });
        dataserviceEndContract.getStatusDe(function (rs) {
            rs = rs.data;
            $scope.listStatusDecision = rs;
        });
        dataserviceEndContract.getListDepartment(function (rs) {
            rs = rs.data;
            $scope.listDepartment = rs.Object;
        });
        dataserviceEndContract.getCount($scope.model, function (rs) {
            rs = rs.data;
            $scope.CountEmployeeNotWork = rs;
        });
    };
    $scope.init();

    $scope.editPayDecision = function (id) {
        dataserviceEndContract.getItemHeader(id, function (rs) {
            rs = rs.data;
            rs.page = "edit";
            myService.setData(rs);
            $location.path('/add');
        });
        setTimeout(function () {
            $('.cancel').removeClass('dis');
            $('.save').removeClass('dis');
            $('.detail').removeClass('dis');
            $('.add').addClass('dis');
            $('.edit').addClass('dis');
            $('.wf').addClass('dis');
            $('.numdes').addClass('dis');
        }, 200);
    }
    $scope.deletePayDecision = function (id) {

        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM.replace('{0}', "");
                $scope.ok = function () {
                    dataserviceEndContract.delete(id, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();

                        }
                    })
                };

                $scope.cancel = function () {
                    $uibModalInstance.close();
                };
            },
            size: '25',
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () {
        });
    }
    $scope.modelHeader = {
        DecisionNum: '',
        Title: '',
        WorkflowCat: '',
        StatusOf: '',
        Noted: '',
        Status: [],
        page: ""
    }

    $scope.add = function () {
        $scope.init();
        $scope.lstStep = "";
        $scope.modelHeader.page = "add";

        myService.setData(data = $scope.modelHeader);

        $location.path('/add');
        setTimeout(function () {
            $('.cancel').removeClass('dis');
            $('.save').removeClass('dis');
            $('.detail').addClass('dis');
            $('.add').addClass('dis');
            $('.edit').addClass('dis');
        }, 200);
    };
    $scope.edit = function (id) {
        $rootScope.ObjectCustomer.CustomerId = id;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderEndContract + '/edit.html',
            controller: 'editCustomer',
            backdrop: 'static',
            size: '70',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () { });
    };
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM.replace('{0}', "");
                $scope.ok = function () {
                    dataserviceEndContract.delete(id, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                        }
                    });
                };

                $scope.cancel = function () {
                    $uibModalInstance.close();
                };
            },
            size: '25',
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
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
                var listdata = $('#tblDataIndex').DataTable().data();
                for (var i = 0; i < listdata.length; i++) {
                    if (listdata[i].CusID == editItems[0]) {
                        userModel = listdata[i];
                        break;
                    }
                }
                var obj = {
                    Code: userModel.Code,
                    Name: userModel.Name,
                    TabBoard: 6
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
                App.toastrError(caption.CUS_ERROR_CHOOSE_CUS)
            }
        } else {
            App.toastrError(caption.CUS_ERROR_NOT_CUS)
        }
    };
    $rootScope.reloadCustomer = function (resetPage) {
        reloadData(resetPage);
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
    $scope.initData = function () {
        $rootScope.loadMore = function ($select, $event) {
            if (!$event) {
                $rootScope.page = 1;
                $rootScope.items = [];
            } else {
                $event.stopPropagation();
                $event.preventDefault();
                $rootScope.page++;
            }
            dataserviceEndContract.getEmployeeCode($rootScope.page, $rootScope.pageSize, $rootScope.textSearch, function (rs) {
                rs = rs.data;
                $rootScope.dataEmployee = $rootScope.dataEmployee.concat(rs.Object);
            });
        }
    }
    $scope.initData();
    $rootScope.reloadEmployee = function (input) {
        $rootScope.textSearch = input;
        $rootScope.page = 1;
        $rootScope.items = [];
        $rootScope.dataEmployee = [];
        dataserviceEndContract.getEmployeeCode($rootScope.page, $rootScope.pageSize, $rootScope.textSearch, function (rs) {
            rs = rs.data;
            $rootScope.dataEmployee = $rootScope.dataEmployee.concat(rs.Object);
        });
    }
    setTimeout(function () {
        loadDate();
        //showHideSearch();
    }, 50);
});
app.controller('add', function ($scope, $route, $location, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceEndContract, $filter, myService) {
    var vm = $scope;
    //wflow
    $rootScope.modelWf = {
        WorkflowCode: "",
        ObjectType: "DECISION_END_CONTRACT",
        ObjectInst: "",
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    $scope.CountEmployee = 0;
    $scope.model = {
        DecisionNum: '',
        Unit: '',
        UserinDepart: '',
        Reason: '',
        SessionDate: '',
    }
    $scope.modelHeader = {
        DecisionNum: '',
        Title: '',
        WorkflowCat: '',
        Status: 'STATUS_ACTIVITY_DO',
        Noted: '',
        ActRepeat: '',
    }
    $scope.isShowHeader = true;
    $scope.roleedit = true;
    $scope.check = true;
    $scope.addtab = true;
    $scope.edittab = false;
    if (myService.getData() != undefined && myService.getData() != "" && myService.getData() != null) {
        var data = myService.getData();
        if (data.com != undefined && data.com != "" && data.com != null) {
            $scope.lstStatusAct = data.com;
        }
        else {
            $scope.check = true;
        }
        if (data.list != undefined && data.list != "" && data.list != null) {
            $scope.lstStep = data.list;
            setTimeout(function () {
                $('#progressbar li').css('width', 'calc(100%/' + data.list.length + ')');
                $('.' + $scope.lstStep[$scope.lstStep.length - 1].IntsCode + '').addClass('end');
                for (var i = 0; i < $scope.lstStep.length; i++) {
                    if ($scope.lstStep[i].Status == "STATUS_ACTIVITY_APPROVED") {
                        $('.' + $scope.lstStep[i].IntsCode + '').addClass('active');
                    }
                }
            }, 200);
        }
        else {
            $scope.lstStep = "";
        }
        if (data.current != undefined && data.current != "" && data.current != null) {
            setTimeout(function () {
                $('.' + data.current + '').addClass('active2');
            }, 200);
        }
        else {
            data.current = "";
        }
        if (data.editrole != undefined && data.editrole != "" && data.editrole != null && data.editrole == true) {
            $('.detail').removeClass('dis');
        }
        else {
            $scope.roleedit = false;
            $('.detail').addClass('dis');
        }
        if (data.editdetail != undefined && data.editdetail != "" && data.editdetail != null && data.editdetail == true) {
            $('.detail').removeClass('dis');
        }
        else {
            $('.detail').addClass('dis');
        }

        if (data.data != undefined && data.data != "" && data.data != null) {
            $scope.modelHeader.DecisionNum = data.data.DecisionNum;
            $scope.modelHeader.Title = data.data.Title;
            $scope.modelHeader.WorkflowCat = data.data.WorkflowCat;
            var lstStatus = JSON.parse(data.data.Status);
            if (lstStatus.length > 0) {
                $scope.modelHeader.StatusTemp = lstStatus[lstStatus.length - 1].Code;
                $scope.modelHeader.Status = lstStatus[lstStatus.length - 1].Code;
                $scope.listStatusLog = lstStatus;
            }
            $scope.modelHeader.Noted = data.data.Noted;
            $scope.check = false;

            if (data.page == "add") {
                $scope.roleedit = true;
                $scope.addtab = true;
                $scope.edittab = false;
            }
            if (data.page == "edit") {
                $scope.addtab = false;
                $scope.edittab = true;
                $('.numdes').addClass('dis');
                $('.wf').addClass('dis');
            }
            setTimeout(function () {
                var objInstCode = $scope.modelHeader.DecisionNum;
                if (objInstCode != undefined && objInstCode != null && objInstCode != '') {
                    $rootScope.loadDiagramWfInst(objInstCode, $rootScope.modelWf.ObjectType);
                }
            }, 1000);
        }
        else {
            if (data.page == "add") {
                $scope.showExcel = true;
                $scope.modelHeader.WorkflowCat = 'END_CONTRACT';
                setTimeout(function () {
                    $rootScope.loadDiagramWF($scope.modelHeader.WorkflowCat);
                }, 1000);
            }
        }
    } else {
        $location.path("/");
    }
    $scope.treeDataunit = [];
    $scope.positionData = [];
    $scope.treedataHr = [];
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EndContractDecision/JTableDetail",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.DecisionNum = $scope.modelHeader.DecisionNum;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(15)
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
            $scope.CountEmployee = data.count;
            $scope.unit = data.Position;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn('employee_code').withTitle('{{"ECD_LBL_CODE_CARD" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('fullname').withTitle('{{"ECD_LBL_CRUD_NAME" | translate}}').renderWith(function (data, type) {
        return '<p class="text-green bold" >' + data + '</p>';
        /*'<span class="">' + $scope.unit + '</span>';*/
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Reason').withTitle('{{"ECD_LIST_COL_REASON_END" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SessionDate').withTitle('{{"ECD_LBL_CRUD_DATE_DEC" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle('<i class="fas fa-trash-alt fs25" style="color:red" ng-click="removeDetail()">').notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'dataTable-pr0 dataTable-5per '));
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
                $scope.selectedItems = selectedItems;
            }
        }
    }
    function toggleOne(selectedItems) {
        $scope.selectedItems = selectedItems;
        $rootScope.selectedItems = selectedItems;
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
    $scope.init = function () {
        dataserviceEndContract.getReason(function (rs) {
            rs = rs.data;
            $scope.listReason = rs;
        });
        dataserviceEndContract.getWorkFlow(function (result) {
            result = result.data;
            $rootScope.lstWorkflow = result;
        });
        dataserviceEndContract.gettreedataunit(function (result) {
            result = result.data;
            $scope.treeDataunit = result.Object;
            var all = {
                DepartmentCode: "",
                Title: caption.COM_TXT_ALL
            }
            $scope.treeDataunit.unshift(all);
        });
        if ($scope.check == true) {
            dataserviceEndContract.getStatusAct(function (rs) {
                rs = rs.data;
                $scope.lstStatusAct = rs;
            })
        }
        dataserviceEndContract.getListPayScale(function (rs) {
            rs = rs.data;
            $scope.lstPayScale = rs;
        })
        dataserviceEndContract.getListCareer(function (rs) {
            rs = rs.data;
            $scope.lstCareer = rs;
        })
        dataserviceEndContract.getListPayTitle(function (rs) {
            rs = rs.data;
            $scope.lstPayTitle = rs;
        })
    };
    $scope.changeUnit = function (data) {
        dataserviceEndContract.getUserDepartment(data, function (rs) {
            rs = rs.data;
            $scope.lstUserinDpt = rs;
        })
    }
    $scope.ChangePayScale = function (data) {
        dataserviceEndContract.getListPayScaleDetail(data, function (rs) {
            rs = rs.data;
            $scope.lstRange = rs;
        })
    }
    $scope.init();
    $scope.addHeader = function () {
        if ($scope.modelHeader.Status != "STATUS_ACTIVITY_DO") {
            App.toastrError("Quyết định chưa được khởi tạo");
        } else {
            validationSelect($scope.modelHeader);
            if ($scope.addform.validate() && !validationSelect($scope.modelHeader).Status) {
                $scope.modelWf.ObjectInst = $scope.modelHeader.DecisionNum;
                $scope.modelWf.WorkflowCode = $scope.modelHeader.WorkflowCat;
                dataserviceEndContract.createWfInstance($scope.modelWf, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        var wfInstCode = rs.Object.WfInstCode;
                        $scope.WfInstCode = wfInstCode;
                        //dataserviceEndContract.insertInstRunning(wfInstCode, $scope.modelWf.WorkflowCode, function (rs) {

                        //})
                        dataserviceEndContract.insert($scope.modelHeader, function (rs) {
                            rs = rs.data;
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            } else {
                                $('.add').removeClass('dis');
                                $('.edit').removeClass('dis');
                                $('.detail').removeClass('dis');
                                $('.cancel').addClass('dis');
                                $('.save').addClass('dis');

                                //Create WF for decesion

                                dataserviceEndContract.getActionStatus($scope.modelHeader.DecisionNum, function (rs) {
                                    rs = rs.data;
                                    $scope.listStatusLog = JSON.parse(rs[0].Status);
                                    $scope.modelHeader.StatusTemp = $scope.listStatusLog[$scope.listStatusLog.length - 1].Code;
                                    $scope.modelHeader.Status = $scope.listStatusLog[$scope.listStatusLog.length - 1].Code;
                                })
                                dataserviceEndContract.getItemHeaderWithCode($scope.modelHeader.DecisionNum, function (rs) {
                                    data = rs.data;

                                    var objInstCode = $scope.modelHeader.DecisionNum;
                                    if (objInstCode != undefined && objInstCode != null && objInstCode != '') {
                                        $rootScope.loadDiagramWfInst(objInstCode, $rootScope.modelWf.ObjectType);
                                    }

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
                                        $scope.lstStatusAct = data.com;
                                    }
                                    else {
                                        $scope.check = true;
                                    }
                                })
                            }
                        })

                    }
                })
            }
        }
    }
    $scope.showAct = false;
    $scope.changeStatus = function () {
        if ($scope.modelHeader.Status == "REPEAT_REQUIRE_REWORK" || $scope.modelHeader.Status == "FINAL_REQUIRE_REWORK") {
            dataserviceEndContract.getListActivityRepeat($scope.modelHeader.DecisionNum, function (rs) {
                rs = rs.data;
                $scope.lstActRepeat = rs;
                $scope.showAct = true;
            })
        }
        else {
            $scope.showAct = false;
        }
    }

    $scope.editHeader = function () {
        if ($scope.roleedit == true) {
            validationSelect($scope.modelHeader);
            if ($scope.addform.validate() && !validationSelect($scope.modelHeader).Status) {
                dataserviceEndContract.update($scope.modelHeader, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        if ($scope.modelHeader.Status != "STATUS_ACTIVITY_APPROVE_END") {
                            App.toastrSuccess(rs.Title);
                            $('.add').removeClass('dis');
                            $('.edit').removeClass('dis');
                            $('.detail').removeClass('dis');
                            $('.cancel').addClass('dis');
                            $('.save').addClass('dis');
                            dataserviceEndContract.getActionStatus($scope.modelHeader.DecisionNum, function (rs) {
                                rs = rs.data;
                                $scope.listStatusLog = JSON.parse(rs[0].Status);
                                $scope.modelHeader.StatusTemp = $scope.listStatusLog[$scope.listStatusLog.length - 1].Code;
                                $scope.modelHeader.Status = $scope.listStatusLog[$scope.listStatusLog.length - 1].Code;
                            })
                            dataserviceEndContract.getItemHeaderWithCode($scope.modelHeader.DecisionNum, function (rs) {
                                data = rs.data;

                                var objInstCode = $scope.modelHeader.DecisionNum;
                                if (objInstCode != undefined && objInstCode != null && objInstCode != '') {
                                    $rootScope.loadDiagramWfInst(objInstCode, $rootScope.modelWf.ObjectType);
                                }

                                $scope.lstStep = data.list;
                                if (data.editrole != undefined && data.editrole != "" && data.editrole != null && data.editrole == true) {
                                    $('.detail').removeClass('dis');
                                }
                                else {
                                    $scope.roleedit = false;
                                    $('.detail').addClass('dis');
                                }
                                if (data.editdetail != undefined && data.editdetail != "" && data.editdetail != null && data.editdetail == true) {
                                    $('.detail').removeClass('dis');
                                }
                                else {
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
                                        }, 200);
                                    }
                                }, 200);

                                if (data.com != undefined && data.com != "" && data.com != null) {
                                    $scope.lstStatusAct = data.com;
                                }
                                else {
                                    $scope.check = true;
                                }
                            })
                        }

                        else {
                            dataserviceEndContract.updateDetailEmployee($scope.modelHeader.DecisionNum, function (rs) {
                                rs = rs.data;
                                if (rs.Error) {
                                    App.toastrError(rs.Title);
                                }
                                else {
                                    App.toastrSuccess("Cập nhật thành công - Quyết định được hoàn thành ");
                                    $('.add').removeClass('dis');
                                    $('.edit').removeClass('dis');
                                    $('.detail').removeClass('dis');
                                    $('.cancel').addClass('dis');
                                    $('.save').addClass('dis');

                                    dataserviceEndContract.getActionStatus($scope.modelHeader.DecisionNum, function (rs) {
                                        rs = rs.data;
                                        $scope.listStatusLog = JSON.parse(rs[0].Status);
                                        $scope.modelHeader.StatusTemp = $scope.listStatusLog[$scope.listStatusLog.length - 1].Code;
                                        $scope.modelHeader.Status = $scope.listStatusLog[$scope.listStatusLog.length - 1].Code;
                                    })
                                    dataserviceEndContract.getItemHeaderWithCode($scope.modelHeader.DecisionNum, function (rs) {
                                        data = rs.data;

                                        var objInstCode = $scope.modelHeader.DecisionNum;
                                        if (objInstCode != undefined && objInstCode != null && objInstCode != '') {
                                            $rootScope.loadDiagramWfInst(objInstCode, $rootScope.modelWf.ObjectType);
                                        }

                                        $scope.lstStep = data.list;
                                        if (data.editrole != undefined && data.editrole != "" && data.editrole != null && data.editrole == true) {
                                            $('.detail').removeClass('dis');
                                        }
                                        else {
                                            $scope.roleedit = false;
                                            $('.detail').addClass('dis');
                                        }
                                        if (data.editdetail != undefined && data.editdetail != "" && data.editdetail != null && data.editdetail == true) {
                                            $('.detail').removeClass('dis');
                                        }
                                        else {
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
                                                }, 200);
                                            }
                                        }, 200);

                                        if (data.com != undefined && data.com != "" && data.com != null) {
                                            $scope.lstStatusAct = data.com;
                                        }
                                        else {
                                            $scope.check = true;
                                        }
                                    })
                                }
                            })
                        }
                    }
                })
            }
        }
        else {
            App.toastrError("Bạn không có quyền sửa quyết định !");
        }
    }

    $scope.changeWorkFlowInts = function (a) {
        dataserviceEndContract.getActivityArranged(a, function (rs) {
            rs = rs.data;
            $scope.lstActArranged = rs;
        });
        //dataserviceEndContract.getStepWorkFlow(a, function (rs) {
        //    data = rs.data;
        //    $scope.lstStep = data.list;
        //    setTimeout(function () {
        //        $('#progressbar li').css('width', 'calc(100%/' + data.list.length + ')');
        //    }, 10);
        //})
    }
    //export work
    $scope.importWork = function () {
        if ($scope.modelHeader.Status != "STATUS_ACTIVITY_APPROVE_END") {
            App.toastrError("Quyết định chưa được xác nhận!");
        } else {
            if ($scope.modelHeader.DecisionNum != "" && $scope.modelHeader.DecisionNum != null && $scope.modelHeader.DecisionNum != undefined) {
                location.href = "/Admin/EndContractDecision/ExportReport?"
                    + "&code=" + $scope.modelHeader.DecisionNum;
            }
        }

    }
    //end work
    $scope.onlyedit = false;
    $scope.edit = function () {
        $scope.addtab = false;
        $scope.edittab = true;
        $('.add').addClass('dis');
        $('.edit').addClass('dis');
        $('.cancel').removeClass('dis');
        $('.save').removeClass('dis');
        $scope.onlyedit = true;
        dataserviceEndContract.getItemHeaderWithCode($scope.modelHeader.DecisionNum, function (rs) {
            data = rs.data;

            var wfInstId = data.data.WfInstId;
            if (wfInstId != undefined && wfInstId != null && wfInstId != '') {
                dataserviceEndContract.getActInstArranged(wfInstId, $scope.modelWf.ObjectType, function (rs) {
                    rs = rs.data;
                    $scope.lstActArranged = rs;
                });
            }

            $scope.lstStep = data.list;
            if (data.editrole != undefined && data.editrole != "" && data.editrole != null && data.editrole == true) {
                $('.detail').removeClass('dis');
                $scope.roleedit = true;
            }
            else {
                $scope.roleedit = false;
                $('.detail').addClass('dis');
            }
            if (data.editdetail != undefined && data.editdetail != "" && data.editdetail != null && data.editdetail == true) {
                $('.detail').removeClass('dis');
            }
            else {
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
                    }, 200);
                }
            }, 200);
        })
        $scope.reload();
    }
    $scope.add = function () {
        $scope.addtab = true;
        $scope.edittab = false;
        $scope.modelHeader = {
            DecisionNum: '',
            Title: '',
            WorkflowCat: '',
            Status: '',
            Noted: '',

        }
        $('.add').addClass('dis');
        $('.edit').addClass('dis');
        $('.detail').addClass('dis');
        $('.cancel').removeClass('dis');
        $('.save').removeClass('dis');
        $('.numdes').removeClass('dis');
        $('.wf').removeClass('dis');
        $scope.loghis = [];
        $scope.onlyedit = false;

        $scope.reload();

    }
    $scope.cancel = function () {
        $('.add').removeClass('dis');
        $('.edit').removeClass('dis');
        $('.detail').addClass('dis');
        $('.cancel').addClass('dis');
        $('.save').addClass('dis');
        $location.path('/');
    }
    $scope.addDetail = function () {
        if ($scope.model.Unit == "") {
            App.toastrError("Vui lòng chọn phòng ban");
        } else {
            validationSelectDetail($scope.model);
            if (!validationSelectDetail($scope.model).Status) {
                $scope.model.DecisionNum = $scope.modelHeader.DecisionNum;
                dataserviceEndContract.insertDetail($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $scope.reload();
                    }
                })
            }
        }

    }
    $scope.removeDetail = function () {
        if ($rootScope.selectedItems != "" && $rootScope.selectedItems != undefined && $rootScope.selectedItems != null) {
            var arr = [];
            for (var i = 0; i < $rootScope.selectedItems.length; i++) {
                if ($rootScope.selectedItems[i] == true) {
                    arr.push(i);
                }
            }
            if (arr.length > 0) {
                dataserviceEndContract.deleteDetail(arr, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $scope.reload();
                    }
                })
            }
            else {
                App.toastrError("Chưa có nhân viên được chọn !");
            }

        }
        else {
            App.toastrError("Chưa có nhân viên được chọn !");
        }
    }
    $scope.showLog = function () {
        dataserviceEndContract.getJsonData($scope.modelHeader.DecisionNum, function (rs) {
            rs = rs.data;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderLog + '/showLog.html',
                controller: 'showLog',
                backdrop: 'static',
                size: '50',
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
    //Workflow 
    $scope.editInstAct = function (id, objCode) {
        dataserviceEndContract.checkPermissionEditActivityById(id, function (rs) {
            rs = rs.data;
            if (!rs) {
                return App.toastrError(caption.COM_MSG_PERMISSION_EDIT_ACT);
            }
            dataserviceEndContract.getItemActInst(id, function (rs) {
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
                    dataserviceEndContract.getActionStatus($scope.modelHeader.DecisionNum, function (rs) {
                        rs = rs.data;
                        $scope.listStatusLog = JSON.parse(rs[0].Status);
                        $scope.modelHeader.StatusTemp = $scope.listStatusLog[$scope.listStatusLog.length - 1].Code;
                        $scope.modelHeader.Status = $scope.listStatusLog[$scope.listStatusLog.length - 1].Code;
                    })
                    $rootScope.loadDiagramWfInst($scope.modelHeader.DecisionNum, $rootScope.modelWf.ObjectType);
                }, function () {
                });
            })
        })
    }

    function validationSelect(data1) {
        var mess = { Status: false, Title: "" }
        //if (data1.DecisionNum == "") {
        //    $scope.errorDecisionNum = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorDecisionNum = false;
        //}
        //if (data1.Title == "") {
        //    $scope.errorTitle = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorTitle = false;
        //}

        if (data1.WorkflowCat == "") {
            $scope.errorWorkflowCat = true;
            mess.Status = true;
        } else {
            $scope.errorWorkflowCat = false;
        }
        if (data1.Status == "") {
            $scope.errorStatus = true;
            mess.Status = true;
        } else {
            $scope.errorStatus = false;
        }

        return mess;
    };
    function validationSelectDetail(data1) {
        var mess = { Status: false, Title: "" }
        if (data1.Unit == "") {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;
        }
        if (data1.Career == "") {
            $scope.errorCareer = true;
            mess.Status = true;
        } else {
            $scope.errorCareer = false;
        } if (data1.ChucDanh == "") {
            $scope.errorChucDanh = true;
            mess.Status = true;
        } else {
            $scope.errorChucDanh = false;
        }
        if (data1.PayScale == "") {
            $scope.errorPayScaleCode = true;
            mess.Status = true;
        } else {
            $scope.errorPayScaleCode = false;
        }
        if (data1.PayRanges == "") {
            $scope.errorPayRanges = true;
            mess.Status = true;
        } else {
            $scope.errorPayRanges = false;
        }
        return mess;
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
        $("#Decisiondate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
        });
        $('#Decisiondate').datepicker().datepicker("setDate", new Date());
    }

    $scope.importExcel = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderEndContract + '/excel.html',
            controller: 'excel',
            backdrop: 'static',
            size: '80',
            resolve: {
                para: function () {
                    return $scope.modelHeader;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    setTimeout(function () {
        loadDate();
        //showHideSearch();
    }, 50);

});
app.controller('showLog', function ($scope, $uibModalInstance, para) {
    var data = JSON.parse(para);
    $scope.mode = 0;//0: Giao diện thay đổi , 1: Code
    $scope.obj = { data: data, options: { mode: 'code' } };

    $scope.changeMode = function () {
        if ($scope.mode == 0) {
            $scope.mode = 1;
        } else {
            $scope.mode = 0;
        }
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    setTimeout(function () {
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 1);
});
app.controller('excel', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataserviceEndContract, $timeout, para) {
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

    $scope.initData = function () {
        dataserviceEndContract.gettreedataunit(function (result) {
            result = result.data;
            $scope.treeDataunit = result.Object;
        });
        dataserviceEndContract.getListDepartment(function (rs) {
            rs = rs.data;
            $scope.listDepartment = rs.Object;
        });
        dataserviceEndContract.getRole(function (rs) {
            rs = rs.data;
            $scope.listRole = rs;
        });
        dataserviceEndContract.getUserDepartment("", function (rs) {
            rs = rs.data;
            $scope.lstUserinDpt = rs;
        });
        dataserviceEndContract.getListPayScaleDetail("", function (rs) {
            rs = rs.data;
            $scope.lstRange = rs;
        });
        dataserviceEndContract.getReason(function (rs) {
            rs = rs.data;
            $scope.listReason = rs;
        });
    }
    $scope.initData();
    $scope.changeUnit = function (data) {
        dataserviceEndContract.getUserDepartment(data, function (rs) {
            rs = rs.data;
            $scope.lstUserinDpt = rs;
            if (rs != null && rs != undefined && rs != "") {
                var all = {
                    Code: "",
                    Name: caption.COM_TXT_ALL
                }
                $scope.lstUserinDpt.unshift(all)
            }
        })
    }
    $scope.changeEmployee = function (data) {
        for (var i = 0; i < $scope.lstUserinDpt.length; i++) {
            if ($scope.lstUserinDpt[i].Code == data) {
                $scope.model.NewRole = $scope.lstUserinDpt[i].OldRole;
            }
        }
    }
    $scope.checkloop = function () {
        $scope.ListEmp = [];
    }

    $scope.uploadFile = function () {
        var form = new FormData;
        var file = document.getElementById("FileItem").files[0];
        form.append("fileUpload", file);
        if (file == null || file == undefined || file == "") {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        } else {
            dataserviceEndContract.uploadFile(form, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $scope.header = rs.Object.Header;
                    $rootScope.DecisionNum = $scope.header.DecisionNumber;
                    $scope.Listdata = rs.Object.Detail;
                    $scope.count = $scope.Listdata.length;
                    $scope.showSubmit = true;
                }
            });
        }
    };
    var url = "";
    $scope.fileNameChanged = function () {
        $('.openExcel').removeClass('hidden');
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
    $scope.editDetails = function (data) {
        $scope.model.Id = data.Id;
        $scope.model.DecisionNum = data.DecisionNum;
        $scope.model.DepartmentCode = data.DepartmentCode;
        $scope.changeUnit($scope.model.DepartmentCode);
        $scope.model.EmployeeCode = data.EmployeeCode;
        $scope.model.NewRole = data.NewRole;
        $scope.model.SessionDate = data.SessionDate;
        $scope.model.Reason = data.Reason;
        $scope.changeEmployee($scope.model.EmployeeCode);
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
        dataserviceEndContract.logInfomation($scope.model, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $scope.lstModel = rs.Object;
                for (var i = 0; i < $scope.Listdata.length; i++) {
                    if ($scope.Listdata[i].Id == $scope.lstModel.Id) {
                        $scope.Listdata[i].DepartmentCode = $scope.lstModel.DepartmentCode;
                        $scope.Listdata[i].DepartmentName = $scope.lstModel.DepartmentName;
                        $scope.Listdata[i].EmployeeCode = $scope.lstModel.EmployeeCode;
                        $scope.Listdata[i].EmployeeName = $scope.lstModel.EmployeeName;
                        $scope.Listdata[i].NewDepartCode = $scope.lstModel.NewDepartCode;
                        $scope.Listdata[i].NewDepartName = $scope.lstModel.NewDepartName;
                        $scope.Listdata[i].NewRole = $scope.lstModel.NewRole;
                        $scope.Listdata[i].NewRoleName = $scope.lstModel.NewRoleName;
                        $scope.Listdata[i].SessionDate = $scope.lstModel.SessionDate;
                        $scope.Listdata[i].Reason = $scope.lstModel.Reason;

                    }
                }
            }
        });
        $scope.IsEdit = false;
        /*for (var i = 0; i < $scope.Listdata.length; i++) {
            if ($scope.lstUserinDpt[i].Id == data.Id) {
                $scope.model.OldRole = $scope.lstUserinDpt[i].OldRole;
            }
            $scope.ListEmp.push(obj);
        }*/
    }
    $scope.submit = function () {
        for (var i = 0; i < $scope.Listdata.length; i++) {
            $scope.Listdata[i].DecisionNum = $scope.header.DecisionNumber;
        }

        if ($scope.Listdata.length == 0) {
            App.toastrError("Danh sách trống, vui lòng nhập dữ liệu");
        }
        else {
            if ($scope.header.DecisionNumber === undefined || $scope.header.DecisionNumber === null || $scope.header.DecisionNumber === '') {
                return App.toastrError("Số quyết định trống");
            }

            if ($scope.header.DecisionDate === undefined || $scope.header.DecisionDate === null || $scope.header.DecisionDate === '') {
                return App.toastrError("Ngày quyết định trống");
            }

            $scope.modelHeader = para;
            $scope.modelHeader.DecisionNum = $scope.header.DecisionNumber;
            $scope.modelHeader.Title = $scope.header.DecisionNumber;
            $scope.modelHeader.sDecisionDate = $scope.header.DecisionDate;

            if ($scope.modelHeader.Status != "STATUS_ACTIVITY_DO") {
                App.toastrError("Phiếu chưa được khởi tạo");
            }
            else {
                $scope.modelWf.ObjectInst = $scope.modelHeader.DecisionNum;
                $scope.modelWf.WorkflowCode = $scope.modelHeader.WorkflowCat;
                dataserviceEndContract.createWfInstance($scope.modelWf, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        var wfInstCode = rs.Object.WfInstCode;
                        $scope.WfInstCode = wfInstCode;
                        //dataserviceEndContract.insertInstRunning(wfInstCode, $scope.modelWf.WorkflowCode, function (rs) {

                        //})
                        dataserviceEndContract.insert($scope.modelHeader, function (rs) {
                            rs = rs.data;
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            } else {
                                dataserviceEndContract.insertFromExcel({ ListEmp: $scope.Listdata }, function (rs) {
                                    rs = rs.data;
                                    if (rs.Error) {
                                        App.toastrError(rs.Title);
                                    } else {
                                        App.toastrSuccess(rs.Title);
                                        $location.path('/');
                                        $uibModalInstance.close();
                                    }
                                });
                            }
                        })
                    }
                })
            }
        }
    }
    $scope.cancelEdit = function () {
        $scope.IsEdit = false;
    }
    function loadDate() {
        $("#Decisiondate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $("#planDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
            todayBtn: true,
            todayHighlight: true
        });
    }
    setTimeout(function () {
        loadDate();
    }, 50);
});

