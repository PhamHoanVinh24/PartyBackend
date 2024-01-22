var ctxfolderDisciplineDecision = "/views/admin/disciplineDecision";
var ctxfolderMessage = "/views/message-box";
var ctxfolderFileShare = "/views/admin/fileObjectShare";
var ctxfolderCommonSetting = "/views/admin/commonSetting";
var ctxfolderLog = "/views/log-box";
var app = angular.module('App_ESEIM_DISCIPLINE_DECISION', ['App_ESEIM_DASHBOARD',"App_ESEIM", "App_ESEIM_WF_PLUGIN", "ui.bootstrap", "ngRoute", "ngCookies", "ngValidate", "datatables", "datatables.bootstrap", "pascalprecht.translate", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', 'dynamicNumber', 'ng.jsoneditor']);
app.factory('dataserviceDisciplineDecision', function ($http) {
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
        getStatusAct: function (callback) {
            $http.post('/Admin/DisciplineDecision/GetStatusAct').then(callback);
        },
        getListDepartment: function (callback) {
            $http.post('/Admin/HrEmployeeMobilization/GetListDepartment').then(callback);
        },
        getUserDepartment: function (data, callback) {
            $http.get('/Admin/DisciplineDecision/GetUserDepartment?code=' + data).then(callback);
        },
        gettreedataunit: function (callback) {
            $http.post('/Admin/HREmployee/Gettreedataunit').then(callback);
        },
        getStatusAct: function (callback) {
            $http.post('/Admin/DisciplineDecision/GetStatusAct').then(callback);
        },
        getListPayScaleDetail: function (data1, data2, callback) {
            $http.get('/Admin/DisciplineDecision/GetListPayScaleDetail?career=' + data1 + '&code=' + data2).then(callback);
        },
        getPaySalary: function (data1, data2, data3, callback) {
            $http.get('/Admin/DisciplineDecision/GetPaySalary?career=' + data1 + '&code=' + data2 + '&ranges=' + data3).then(callback);
        },
        getListPayScale: function (callback) {
            $http.get('/Admin/DisciplineDecision/GetListPayScale').then(callback);
        },
        getListCareer: function (callback) {
            $http.get('/Admin/DisciplineDecision/GetListCareer').then(callback);
        },
        getWorkFlow: function (callback) {
            $http.post('/Admin/DisciplineDecision/GetWorkFlow').then(callback);
        },
        getListPayTitle: function (callback) {
            $http.post('/Admin/DisciplineDecision/GetListPayTitle').then(callback);
        },
        getItemHeader: function (data, callback) {
            $http.post('/Admin/DisciplineDecision/GetItemHeader?id=' + data).then(callback);
        },
        getItemHeaderWithCode: function (data, callback) {
            $http.post('/Admin/DisciplineDecision/GetItemHeaderWithCode?code=' + data).then(callback);
        },
        getListRepeat: function (data, callback) {
            $http.post('/Admin/DisciplineDecision/GetListRepeat?code=' + data).then(callback);
        },
        getUserDetail: function (data, callback) {
            $http.get('/Admin/DisciplineDecision/GetUserDetail?code=' + data).then(callback);
        },
        getStepWorkFlow: function (data, callback) {
            $http.post('/Admin/DisciplineDecision/GetStepWorkFlow?code=' + data).then(callback);
        },
        getActionStatus: function (data, callback) {
            $http.get('/Admin/DisciplineDecision/GetActionStatus?code=' + data).then(callback);
        },
        getListActivityRepeat: function (data, callback) {
            $http.get('/Admin/DisciplineDecision/GetListActivityRepeat?decisionNum=' + data).then(callback);
        },
        getStatusDe: function (callback) {
            $http.post('/Admin/DisciplineDecision/GetStatusDe').then(callback);
        },
        getliSigner: function (callback) {
            $http.get('/Admin/DisciplineDecision/GetliSigner').then(callback);
        },
        getlistDecision: function (callback) {
            $http.get('/Admin/DisciplineDecision/GetlistDecision').then(callback);
        },
        //Header
        insert: function (data, callback) {
            $http.post('/Admin/DisciplineDecision/Insert', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/DisciplineDecision/Update', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/DisciplineDecision/Delete', data).then(callback);
        },

        //Detail
        insertDetail: function (data, callback) {
            $http.post('/Admin/DisciplineDecision/InsertDetail', data).then(callback);
        },
        deleteDetail: function (data, callback) {
            $http.post('/Admin/DisciplineDecision/DeleteDetail', data).then(callback);
        },
        updateDetailEmployee: function (data, callback) {
            $http.post('/Admin/DisciplineDecision/UpdateDetailEmployee?code=' + data).then(callback);
        },

        //Workflow
        createWfInstance: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/CreateWfInstance', data).then(callback)
        },
        insertInstRunning: function (data, data1, callback) {
            $http.post('/Admin/WorkflowActivity/InsertInstRunning?wfInstCode=' + data + '&wfCode=' + data1).then(callback);
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
            $http.post('/Admin/DisciplineDecision/GetJsonData?decisionNum=' + data).then(callback);
        },
        //excel
        //ExportExcel
        exportExcel: function (data, callback) {
            $http.post('/Admin/DisciplineDecision/ExportExcel?planNumber=' + data).then(callback);
        },
        uploadFile: function (data, callback) {
            submitFormUpload('/Admin/DisciplineDecision/UploadFile', data, callback)
        },
        checkData: function (data, callback) {
            $http.post('/Admin/DisciplineDecision/CheckData', data).then(callback);
        },
        logInfomation: function (data, callback) {
            $http.post('/Admin/DisciplineDecision/LogInfomation', data).then(callback);
        },
        insertFromExcel: function (data, callback) {
            $http.post('/Admin/DisciplineDecision/InsertFromExcel', data).then(callback);
        },
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
app.controller('Ctrl_ESEIM_DISCIPLINE_DECISION', function ($scope, $rootScope, $cookies, $filter, dataserviceDisciplineDecision, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        $rootScope.IsTranslate = true;
        caption = caption[culture] ? caption[culture] : caption;

        $rootScope.validationOptionsDiscipline = {
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
    //Lấy ra quyền admin hay user
    $rootScope.isAllData = false;
    if (isAllData != undefined && isAllData != null && isAllData != '') {
        $rootScope.isAllData = isAllData == 'True' ? true : false;
    }
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/DisciplineDecision/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderDisciplineDecision + '/index.html',
            controller: 'index'
        })
        .when('/add', {
            templateUrl: ctxfolderDisciplineDecision + '/add.html',
            controller: 'add',
        })
        .when('/edit', {
            templateUrl: ctxfolderDisciplineDecision + '/edit.html',
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

app.controller('index', function ($scope, $rootScope, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceDisciplineDecision, $location, $filter, myService) {
    var vm = $scope;

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.listGender = [
        , {
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
        FullName: '',
        Phone: '',
        Permanentresidence: '',
        EmployeeType: '',
        FromDate: '',
        ToDate: '',
        Gender: '',
        NumberOfYears: '',
        YearsOfWork: '',
        Wage: '',
        EducationalLevel: '',
        Position: '',
        Unit: '',
        BranchId: ''
    }
    $scope.modelHeader = {
        DecisionNum: '',
        Status: '',
        Signer: '',
    }
    $scope.treeDataunit = [];
    $scope.positionData = [];
    $scope.treedataHr = [];
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/DisciplineDecision/JTable",
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
                d.Status = $scope.modelHeader.Status;
                d.Signer = $scope.modelHeader.Signer;
                d.FromDate = $scope.modelHeader.FromDate;
                d.ToDate = $scope.modelHeader.ToDate;
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('Full').withTitle('{{"ECD_LBL_CRUD_NUM_DECISTION" | translate}} & {{"ECD_LBL_CRUD_DEC_NAME"| translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-20per bold'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"ECD_LIST_COL_DATE_DECISTION" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }).withOption('sClass', 'dataTable-pr0 dataTable-20per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"ECD_LIST_COL_STATUS" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-20per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Signer').withTitle('{{"ECD_LIST_COL_SIGNER" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'tcenter dataTable-pr0 dataTable-15per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SignTime').withTitle('{{"ECD_LIST_COL_DATE_SIGN" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-15per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withTitle('{{"ECD_LIST_COL_MANIPULATION" | translate }}').withOption('sClass', 'nowrap text-center dataTable-w80').renderWith(function (data, type, full) {
        if ($rootScope.isAllData) {
            return '<a ng-click="edit(' + full.Id + ')" style1= "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class1="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-edit fs25 pr20"></i></a>' +
                '<a title="Xoá" ng-click="delete(' + full.Id + ')" style1="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45);" class1="btn btn-icon-only btn-circle btn-outline red"><i class="fas fa-trash-alt fs25 text-danger"></i></a>';
        } else {
            return '<a ng-click="edit(' + full.Id + ')" style1= "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class1="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-edit fs25 pr20"></i></a>';
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

        dataserviceDisciplineDecision.getliSigner(function (rs) {
            rs = rs.data;
            $scope.LstSiger = rs;
        })
        dataserviceDisciplineDecision.getStatusDe(function (rs) {
            rs = rs.data;
            $scope.listStatusDecision = rs;
        });
        dataserviceDisciplineDecision.getlistDecision(function (rs) {
            rs = rs.data;
            $scope.listDecision = rs;
        });
    };

    $scope.init();


    $scope.edit = function (id) {
        dataserviceDisciplineDecision.getItemHeader(id, function (rs) {
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
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM.replace('{0}', "");
                $scope.ok = function () {
                    dataserviceDisciplineDecision.delete(id, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            $uibModalInstance.close();
                            App.toastrSuccess(rs.Title);
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
        Status: '',
        Noted: '',
        StatusLog: [],
        page: ""

    }

    $scope.add = function () {
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

    $rootScope.reloadCustomer = function (resetPage) {
        reloadData(resetPage);
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


    function validationDetailMove(data1) {
        var mess = { Status: false, Title: "" }
        /*   if (data.Ranges == "") {
               $scope.errorRanges = true;
               mess.Status = true;
           } else {
               $scope.errorRanges = false;
           }
           if (data.PayScaleCode == "") {
               $scope.errorPayScaleCode = true;
               mess.Status = true;
           } else {
               $scope.errorPayScaleCode = false;
           }
           if (data.unitNameLate == "") {
               $scope.errorunitNameLate = true;
               mess.Status = true;
           } else {
               $scope.errorunitNameLate = false;
           }
           if (data.positionNameLate == "") {
               $scope.errorpositionNameLate = true;
               mess.Status = true;
           } else {
               $scope.errorpositionNameLate = false;
           }*/
        // thông tin header//

        if (data1.DecideNum == "") {
            $scope.errorDecideNum = true;
            mess.Status = true;
        } else {
            $scope.errorDecideNum = false;
        }
        if (data1.DecideDate == "") {
            $scope.errorDecideDate = true;
            mess.Status = true;
        } else {
            $scope.errorDecideDate = false;
        } if (data1.FromTime == "") {
            $scope.errorFromTime = true;
            mess.Status = true;
        } else {
            $scope.errorFromTime = false;
        }
        if (data1.ToTime == "") {
            $scope.errorToTime = true;
            mess.Status = true;
        } else {
            $scope.errorToTime = false;
        }

        return mess;
    };
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    function initAutocomplete() {
        var defaultBounds = new google.maps.LatLngBounds(new google.maps.LatLng(-33.8902, 151.1759), new google.maps.LatLng(-33.8474, 151.2631));
        var options = {
            bounds: defaultBounds,
            types: ['geocode']
        };

        var autocomplete = new google.maps.places.Autocomplete(document.getElementById('Address'), options);
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
        $("#appfrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });/*.on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateto').datepicker('setStartDate', maxDate);
        });*/
        $("#appto").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });/*.on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#datefrom').datepicker('setEndDate', maxDate);
        });*/
        $("#datedecision").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });/*.on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#datefrom').datepicker('setEndDate', maxDate);
        });*/
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
app.controller('add', function ($scope, $route, $location, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceDisciplineDecision, $filter, myService) {
    var vm = $scope;
    //wflow
    $rootScope.modelWf = {
        WorkflowCode: "",
        ObjectType: "DISCIPLINE_DECISION",
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
        Career: '',
        ChucDanh: '',
        PayScale: '',
        PayRanges: '',
    }
    $scope.modelHeader = {
        DecisionNum: '',
        Title: '',
        WorkflowCat: '',
        Status: 'STATUS_ACTIVITY_DO',
        Noted: '',
        ActRepeat: '',
    }

    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    $scope.export = function () {
        return App.toastrError('Chức năng đang phát triển');
        if ($scope.modelHeader.DecisionNum != "" && $scope.modelHeader.DecisionNum != null && $scope.modelHeader.DecisionNum != undefined) {
            location.href = "/Admin/DisciplineDecision/ExportReport?"
                + "&code=" + $scope.modelHeader.DecisionNum;
        }
    }

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
                $('.numdes').removeClass('dis');
                $('.wf').removeClass('dis');
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
                $scope.modelHeader.WorkflowCat = 'DISCIPLINE_DECISION';

                setTimeout(function () {
                    $rootScope.loadDiagramWF($scope.modelHeader.WorkflowCat);
                }, 1000);
            }
        }
    }
    else {
        $location.path("/");
    }

    $scope.treeDataunit = [];
    $scope.positionData = [];
    $scope.treedataHr = [];
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/DisciplineDecision/JTableDetail",
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('EmployeeCode').withTitle('{{"ECD_LBL_CODE_CARD" | translate}}').renderWith(function (data, type) {
        return '<p class="text-green bold" >' + data + '</p>';
    }).withOption('sClass', 'dataTable-pr0'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EmployeeName').withTitle('{{"ECD_LBL_CRUD_NAME" | translate}}').renderWith(function (data, type) {
        return '<p class="text-green bold" >' + data + '</p>';
    }).withOption('sClass', 'dataTable-pr0'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DepartmentName').withTitle('{{"ECD_LBL_CRUD_DEPARTMENT" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Reason').withTitle('{{"ECD_LBL_CRUD_REASON" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Result').withTitle('{{"ECD_LBL_CRUD_DESCIPLINE" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0'));
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle("{{'ECD_LBL_CRUD_DELETE' | translate}}").notSortable().renderWith(function (data, type, full, meta) {
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
        dataserviceDisciplineDecision.getWorkFlow(function (result) {
            result = result.data;
            $rootScope.lstWorkflow = result;
        });
        dataserviceDisciplineDecision.gettreedataunit(function (result) {
            result = result.data;
            $scope.treeDataunit = result.Object;
            var all = {
                DepartmentCode: "",
                Title: caption.COM_TXT_ALL
            }
            $scope.treeDataunit.unshift(all);
        });
        if ($scope.check == true) {
            dataserviceDisciplineDecision.getStatusAct(function (rs) {
                rs = rs.data;
                $scope.lstStatusAct = rs;
            })
        }
        dataserviceDisciplineDecision.getListPayScale(function (rs) {
            rs = rs.data;
            $scope.lstPayScale = rs;
        })
        dataserviceDisciplineDecision.getListCareer(function (rs) {
            rs = rs.data;
            $scope.lstCareer = rs;
        })
        dataserviceDisciplineDecision.getListPayTitle(function (rs) {
            rs = rs.data;
            $scope.lstPayTitle = rs;
        })
    };
    $scope.init();

    $scope.changUser = function () {
        dataserviceDisciplineDecision.getUserDetail($scope.model.UserinDepart, function (rs) {
            rs = rs.data;
            $scope.model.PayScale = rs[0].PayScale;
            $scope.model.PayRanges = rs[0].PayRanges;
            $scope.model.Career = rs[0].Career;
            $scope.model.ChucDanh = rs[0].ChucDanh;
            dataserviceDisciplineDecision.getListPayScaleDetail($scope.model.Career, $scope.model.PayScale, function (rs) {
                rs = rs.data;
                $scope.lstRange = rs;
            })
            dataserviceDisciplineDecision.getPaySalary($scope.model.Career, $scope.model.PayScale, $scope.model.PayRanges, function (rs) {
                rs = rs.data;
                $scope.model.Salary = rs;
            })
        })
    }
    $scope.changePayScale = function (data1, data2) {
        dataserviceDisciplineDecision.getListPayScaleDetail(data1, data2, function (rs) {
            rs = rs.data;
            $scope.lstRange = rs;
        })
        dataserviceDisciplineDecision.getPaySalary(data1, data2, model.PayRanges, function (rs) {
            rs = rs.data;
            $scope.model.Salary = rs;
        })
    }
    $scope.changePayRanges = function (data1, data2, data3) {
        dataserviceDisciplineDecision.getPaySalary(data1, data2, data3, function (rs) {
            rs = rs.data;
            $scope.model.Salary = rs;
        })
    }
    $scope.changeStatus = function () {
        if ($scope.modelHeader.Status == "REPEAT_REQUIRE_REWORK" || $scope.modelHeader.Status == "FINAL_REQUIRE_REWORK") {
            /* dataserviceDisciplineDecision.getListActivityRepeat($scope.modelHeader.DecisionNum, function (rs) {
                 rs = rs.data;
                 $scope.lstActRepeat = rs;
                 $scope.showAct = true;
             })*/

            dataserviceDisciplineDecision.getListRepeat($scope.modelHeader.DecisionNum, function (rs) {
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

    $scope.changeSelect = function (type) {
        switch (type) {
            case 'Unit':
                $scope.errorUnit = false;
                $scope.model.UserinDepart = "";
                dataserviceDisciplineDecision.getUserDepartment($scope.model.Unit, function (rs) {
                    rs = rs.data;
                    $scope.lstUserinDpt = rs;
                })

                break;

            case 'EmployeeCode':
                $scope.errorEmployeeCode = false;
                break;
        }


    }

    $scope.showAct = false;
    $scope.onlyedit = false;
    $scope.isShowHeader = true;
    $scope.cancel = function () {
        $location.path("/");
    }
    $scope.add = function () {
        $scope.init();
        $scope.lstStep = "";
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
    $scope.edit = function () {
        $scope.addtab = false;
        $scope.edittab = true;
        $('.add').addClass('dis');
        $('.edit').addClass('dis');
        $('.cancel').removeClass('dis');
        $('.save').removeClass('dis');
        $scope.onlyedit = true;
        $scope.reload();
        dataserviceDisciplineDecision.getItemHeaderWithCode($scope.modelHeader.DecisionNum, function (rs) {
            data = rs.data;

            var objInstCode = $scope.modelHeader.DecisionNum;
            if (objInstCode != undefined && objInstCode != null && objInstCode != '') {
                $rootScope.loadDiagramWfInst(objInstCode, $rootScope.modelWf.ObjectType);
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
            //setTimeout(function () {
            //    $('#progressbar li').css('width', 'calc(100%/' + data.list.length + ')');
            //    $('.' + $scope.lstStep[$scope.lstStep.length - 1].IntsCode + '').addClass('end');
            //    for (var i = 0; i < $scope.lstStep.length; i++) {
            //        if ($scope.lstStep[i].Status == "STATUS_ACTIVITY_APPROVED") {
            //            $('.' + $scope.lstStep[i].IntsCode + '').addClass('active');
            //        }
            //    }
            //    if (data.current != undefined && data.current != "" && data.current != null) {
            //        setTimeout(function () {
            //            $('.' + data.current + '').addClass('active2');
            //        }, 50);
            //    }
            //}, 50);
        })
    }
    $scope.addHeader = function () {
        if ($scope.modelHeader.Status != "STATUS_ACTIVITY_DO") {
            App.toastrError("Quyết định chưa được khởi tạo");
        }
        else {
            validationSelect($scope.modelHeader);
            if ($scope.addform.validate() &&!validationSelect($scope.modelHeader).Status) {
                $scope.modelWf.ObjectInst = $scope.modelHeader.DecisionNum;
                $scope.modelWf.WorkflowCode = $scope.modelHeader.WorkflowCat;
                dataserviceDisciplineDecision.createWfInstance($scope.modelWf, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        var wfInstCode = rs.Object.WfInstCode;
                        $scope.WfInstCode = wfInstCode;
                        //dataserviceDisciplineDecision.insertInstRunning(wfInstCode, $scope.modelWf.WorkflowCode, function (rs) {

                        //})

                        dataserviceDisciplineDecision.insert($scope.modelHeader, function (rs) {
                            rs = rs.data;
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            } else {
                                App.toastrSuccess(rs.Title);
                                $('.add').removeClass('dis');
                                $('.edit').removeClass('dis');
                                $('.detail').removeClass('dis');
                                $('.cancel').addClass('dis');
                                $('.save').addClass('dis');
                                $scope.onlyedit = true;

                                //Create WF for decesion

                                dataserviceDisciplineDecision.getActionStatus($scope.modelHeader.DecisionNum, function (rs) {
                                    rs = rs.data;
                                    $scope.listStatusLog = JSON.parse(rs[0].Status);
                                    $scope.modelHeader.StatusTemp = $scope.listStatusLog[$scope.listStatusLog.length - 1].Code;
                                    $scope.modelHeader.Status = $scope.listStatusLog[$scope.listStatusLog.length - 1].Code;
                                })
                                dataserviceDisciplineDecision.getItemHeaderWithCode($scope.modelHeader.DecisionNum, function (rs) {
                                    data = rs.data;

                                    var objInstCode = $scope.modelHeader.DecisionNum;
                                    if (objInstCode != undefined && objInstCode != null && objInstCode != '') {
                                        $rootScope.loadDiagramWfInst(objInstCode, $rootScope.modelWf.ObjectType);
                                    }
                                })
                            }
                        })
                    }
                })
            }
        }
    }
    $scope.editHeader = function () {
        if ($scope.roleedit == true) {
            validationSelect($scope.modelHeader);
            if ($scope.addform.validate() &&!validationSelect($scope.modelHeader).Status) {
                dataserviceDisciplineDecision.update($scope.modelHeader, function (rs) {
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
                            dataserviceDisciplineDecision.getActionStatus($scope.modelHeader.DecisionNum, function (rs) {
                                rs = rs.data;
                                $scope.listStatusLog = JSON.parse(rs[0].Status);
                                $scope.modelHeader.StatusTemp = $scope.listStatusLog[$scope.listStatusLog.length - 1].Code;
                                $scope.modelHeader.Status = $scope.listStatusLog[$scope.listStatusLog.length - 1].Code;
                            })
                            dataserviceDisciplineDecision.getItemHeaderWithCode($scope.modelHeader.DecisionNum, function (rs) {
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
                                        }, 5);
                                    }
                                }, 5);

                                //if (data.com != undefined && data.com != "" && data.com != null) {
                                //    $scope.lstStatusAct = data.com;
                                //}
                                //else {
                                //    $scope.check = true;
                                //}
                            })
                            $scope.showAct = false;
                        }

                        else {
                            dataserviceDisciplineDecision.updateDetailEmployee($scope.modelHeader.DecisionNum, function (rs) {
                                rs = rs.data;
                                if (rs.Error) {
                                    App.toastrError(rs.Title);
                                }
                                else {
                                    App.toastrSuccess("Cập nhật thành công - Quyết định được hoàn thành ");
                                    $('.export').removeClass('dis');
                                    dataserviceDisciplineDecision.getActionStatus($scope.modelHeader.DecisionNum, function (rs) {
                                        rs = rs.data;
                                        $scope.listStatusLog = JSON.parse(rs[0].Status);
                                        $scope.modelHeader.StatusTemp = $scope.listStatusLog[$scope.listStatusLog.length - 1].Code;
                                        $scope.modelHeader.Status = $scope.listStatusLog[$scope.listStatusLog.length - 1].Code;
                                    })
                                    dataserviceDisciplineDecision.getItemHeaderWithCode($scope.modelHeader.DecisionNum, function (rs) {
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
                                                }, 5);
                                            }
                                        }, 5);

                                        //if (data.com != undefined && data.com != "" && data.com != null) {
                                        //    $scope.lstStatusAct = data.com;
                                        //}
                                        //else {
                                        //    $scope.check = true;
                                        //}
                                    })
                                    $scope.showAct = false;
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
    $scope.addDetail = function () {
        validationSelectDetail($scope.model);
        if (!validationSelectDetail($scope.model).Status) {
            $scope.model.DecisionNum = $scope.modelHeader.DecisionNum;
            dataserviceDisciplineDecision.insertDetail($scope.model, function (rs) {
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
    $scope.removeDetail = function () {
        if ($rootScope.selectedItems != "" && $rootScope.selectedItems != undefined && $rootScope.selectedItems != null) {
            var arr = [];
            for (var i = 0; i < $rootScope.selectedItems.length; i++) {
                if ($rootScope.selectedItems[i] == true) {
                    arr.push(i);
                }
            }
            if (arr.length > 0) {
                dataserviceDisciplineDecision.deleteDetail(arr, function (rs) {
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
        dataserviceDisciplineDecision.getJsonData($scope.modelHeader.DecisionNum, function (rs) {
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
        dataserviceDisciplineDecision.checkPermissionEditActivityById(id, function (rs) {
            rs = rs.data;
            if (!rs) {
                return App.toastrError(caption.COM_MSG_PERMISSION_EDIT_ACT);
            }
            dataserviceDisciplineDecision.getItemActInst(id, function (rs) {
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
                    dataserviceDisciplineDecision.getActionStatus($scope.modelHeader.DecisionNum, function (rs) {
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

    //End workflow
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
        if (data1.Unit == null || data1.Unit == undefined || data1.Unit == "") {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;
        }
        if (data1.EmployeeCode == null || data1.EmployeeCode == undefined || data1.EmployeeCode == "") {
            $scope.errorEmployeeCode = true;
            mess.Status = true;
        } else {
            $scope.errorEmployeeCode = false;
        } 
        return mess;
    };
    $scope.importExcel = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderDisciplineDecision + '/excel.html',
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
app.controller('excel', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataserviceDisciplineDecision, $timeout, para) {
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.IsEdit = false;
    //wflow
    $scope.modelWf = {
        WorkflowCode: "",
        ObjectType: "DISCIPLINE_DECISION",
        ObjectInst: "",
    };

    $scope.init = function () {
        dataserviceDisciplineDecision.getWorkFlow(function (result) {
            result = result.data;
            $rootScope.lstWorkflow = result;
        });
        dataserviceDisciplineDecision.gettreedataunit(function (result) {
            result = result.data;
            $scope.treeDataunit = result.Object;
            var all = {
                DepartmentCode: "",
                Title: caption.COM_TXT_ALL
            }
            $scope.treeDataunit.unshift(all);
        });
        if ($scope.check == true) {
            dataserviceDisciplineDecision.getStatusAct(function (rs) {
                rs = rs.data;
                $scope.lstStatusAct = rs;
            })
        }
        dataserviceDisciplineDecision.getListPayScale(function (rs) {
            rs = rs.data;
            $scope.lstPayScale = rs;
        })
        dataserviceDisciplineDecision.getListCareer(function (rs) {
            rs = rs.data;
            $scope.lstCareer = rs;
        })
        dataserviceDisciplineDecision.getListPayTitle(function (rs) {
            rs = rs.data;
            $scope.lstPayTitle = rs;
        })
    };
    $scope.init();

    $scope.changeUnit = function (data) {
        $scope.model.EmployeeCode = "";
        dataserviceDisciplineDecision.getUserDepartment(data, function (rs) {
            rs = rs.data;
            $scope.lstUserinDpt = rs;
        })
    }
    $scope.changUser = function (data) {
        dataserviceDisciplineDecision.getUserDetail(data, function (rs) {
            rs = rs.data;
            $scope.model.PayScaleCode = rs[0].PayScale;
            $scope.model.PayRanges = rs[0].PayRanges;
            $scope.model.CareerCode = rs[0].Career;
            $scope.model.CareerTitle = rs[0].ChucDanh;
            dataserviceDisciplineDecision.getListPayScaleDetail($scope.model.CareerCode, $scope.model.PayScaleCode, function (rs) {
                rs = rs.data;
                $scope.lstRange = rs;
            })
            dataserviceDisciplineDecision.getPaySalary($scope.model.CareerCode, $scope.model.PayScaleCode, $scope.model.PayRanges, function (rs) {
                rs = rs.data;
                $scope.model.Salary = rs;
            })
        })
    }
    $scope.changePayScale = function (data1, data2) {
        dataserviceDisciplineDecision.getListPayScaleDetail(data1, data2, function (rs) {
            rs = rs.data;
            $scope.lstRange = rs;
        })
        dataserviceDisciplineDecision.getPaySalary(data1, data2, $scope.model.PayRanges, function (rs) {
            rs = rs.data;
            $scope.model.Salary = rs;
        })
    }
    $scope.changePayRanges = function (data1, data2, data3) {
        dataserviceDisciplineDecision.getPaySalary(data1, data2, data3, function (rs) {
            rs = rs.data;
            $scope.model.Salary = rs;
        })
    }
    $scope.checkloop = function () {
        $scope.ListEmp = [];
        for (var i = 0; i < $scope.Listdata.length; i++) {
            var obj = {
                PlanNumber: $rootScope.PlanNumber,
                EmployeeCode: $scope.Listdata[i].EmployeeCode,
                EmployeeName: $scope.Listdata[i].EmployeeName,
                DepartmentCode: $scope.Listdata[i].DepartmentCode,
                sBirthdate: $scope.Listdata[i].sBirthdate,
                IdentityCard: $scope.Listdata[i].IdentityCard,
                PhoneNumber: $scope.Listdata[i].PhoneNumber,
                Gender: $scope.Listdata[i].Gender,
                ExpYears: $scope.Listdata[i].ExpYears,
            }
            $scope.ListEmp.push(obj);
        }
        dataserviceDisciplineDecision.checkData({
            ListEmp: $scope.ListEmp
        }, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $scope.showSubmit = true;
            }
        });
    }

    $scope.uploadFile = function () {
        var form = new FormData;
        var file = document.getElementById("FileItem").files[0];
        form.append("fileUpload", file);
        if (file == null || file == undefined || file == "") {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        } else {
            dataserviceDisciplineDecision.uploadFile(form, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    //$scope.showCheck = true;
                    $scope.header = rs.Object.Header;
                    $rootScope.DecideNum = $scope.header.DecisionNumber;
                    $rootScope.DecisionDate = $scope.header.DecisionDate;
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
        if (file === null || file === undefined || file === "") {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        } else {
            window.open(url, '_blank');
        }
    };
    $scope.editDetails = function (data) {
        $scope.model = {
            Id: '',
            EmployeeCode: '',
            DepartmentCode: '',
            DecideNum: '',
            CareerCode: '',
            CareerTitle: '',
            PayScaleCode: '',
            PayRanges: '',
            Salary: ''
        }
        $scope.model.Id = data.Id;
        $scope.model.DecideNum = data.DecisionNum;
        $scope.model.DepartmentCode = data.DepartmentCode;
        $scope.ChangeUnit($scope.model.DepartmentCode);
        $scope.model.EmployeeCode = data.EmployeeCode;
        $scope.model.CareerCode = data.CareerCode;
        $scope.model.CareerTitle = data.CareerTitle;
        $scope.model.PayScaleCode = data.PayScaleCode;
        $scope.ChangePayScale($scope.model.CareerCode, $scope.model.PayScaleCode);
        $scope.model.PayRanges = data.PayRanges;
        $scope.model.Salary = data.Salary;
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
    $scope.ChangeUnit = function (data) {
        dataserviceDisciplineDecision.getUserDepartment(data, function (rs) {
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
    $scope.ChangePayScale = function (data1, data2) {
        dataserviceDisciplineDecision.getListPayScaleDetail(data1, data2, function (rs) {
            rs = rs.data;
            $scope.lstRange = rs;
        });
    }
    $scope.submitEdit = function () {
        $scope.lstModel = [];
        dataserviceDisciplineDecision.logInfomation($scope.model, function (rs) {
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
                        $scope.Listdata[i].CareerCode = $scope.lstModel.CareerCode;
                        $scope.Listdata[i].CareerName = $scope.lstModel.CareerName;
                        $scope.Listdata[i].CareerTitle = $scope.lstModel.CareerTitle;
                        $scope.Listdata[i].PayScaleCode = $scope.lstModel.PayScaleCode;
                        $scope.Listdata[i].PayRanges = $scope.lstModel.PayRanges;
                        $scope.Listdata[i].Salary = $scope.lstModel.Salary;
                        $scope.Listdata[i].TitleName = $scope.lstModel.TitleName;
                    }
                }
            }
        });
        $scope.IsEdit = false;
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
            $scope.modelHeader.DecisionDate = $scope.header.DecisionDate;

            if ($scope.modelHeader.Status != "STATUS_ACTIVITY_DO") {
                App.toastrError("Phiếu chưa được khởi tạo");
            }
            else {
                $scope.modelWf.ObjectInst = $scope.modelHeader.DecisionNum;
                $scope.modelWf.WorkflowCode = $scope.modelHeader.WorkflowCat;
                dataserviceDisciplineDecision.createWfInstance($scope.modelWf, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        var wfInstCode = rs.Object.WfInstCode;
                        $scope.WfInstCode = wfInstCode;
                        //dataserviceDisciplineDecision.insertInstRunning(wfInstCode, $scope.modelWf.WorkflowCode, function (rs) {

                        //})
                        dataserviceDisciplineDecision.insert($scope.modelHeader, function (rs) {
                            rs = rs.data;
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            } else {
                                dataserviceDisciplineDecision.insertFromExcel({ ListEmp: $scope.Listdata }, function (rs) {
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

