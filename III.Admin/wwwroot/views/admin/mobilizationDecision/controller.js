var ctxfolderMobiDecision = "/views/admin/mobilizationDecision";
var ctxfolderMessage = "/views/message-box";
var ctxfolderFileShare = "/views/admin/fileObjectShare";
var ctxfolderCommonSetting = "/views/admin/commonSetting";
var ctxfolderLog = "/views/log-box";
var app = angular.module('App_ESEIM_MOBILI_DEC', ['App_ESEIM_DASHBOARD','App_ESEIM', 'App_ESEIM_WF_PLUGIN',"ui.bootstrap", "ngRoute", "ngCookies", "ngValidate", "datatables", "datatables.bootstrap", "pascalprecht.translate", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', 'dynamicNumber', 'ng.jsoneditor']);
app.factory('dataserviceMobiDecision', function ($http) {
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
        insert: function (data, callback) {
            $http.post('/Admin/HrEmployeeMobilization/Insert', data).then(callback);
        },
        insertPayDecisionHeader: function (data, callback) {
            $http.post('/Admin/MobilizationDecision/InsertPayDecisionHeader', data).then(callback);
        },
        deleteDetail: function (data, callback) {
            $http.post('/Admin/MobilizationDecision/DeleteDetail', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/MobilizationDecision/Delete?id=' + data).then(callback);
        },
        getListDepartment: function (callback) {
            $http.post('/Admin/MobilizationDecision/GetListDepartment').then(callback);
        },
        getUserDepartment: function (data, callback) {
            $http.get('/Admin/MobilizationDecision/GetUserDepartment?code=' + data).then(callback);
        },
        gettreedataunit: function (callback) {
            $http.post('/Admin/HREmployee/Gettreedataunit').then(callback);
        },
        getListPayScaleDetail: function (data1, data2, callback) {
            $http.get('/Admin/MobilizationDecision/GetListPayScaleDetail?newRole=' + data1 + '&code=' + data2).then(callback);
        },
        getListPayScale: function (callback) {
            $http.get('/Admin/MobilizationDecision/GetListPayScale').then(callback);
        },
        getListCareer: function (callback) {
            $http.get('/Admin/MobilizationDecision/GetListCareer').then(callback);
        },

        getItem: function (data, callback) {
            $http.post('/Admin/MobilizationDecision/GetItem?id=' + data).then(callback);
        },
        getItemHeader: function (data, callback) {
            $http.post('/Admin/MobilizationDecision/GetItemHeader?id=' + data).then(callback);
        },
        getEmployeeStyle: function (callback) {
            $http.post('/Admin/HREmployee/GetEmployeeStyle').then(callback);
        },
        getBranch: function (callback) {
            $http.post('/Admin/MobilizationDecision/GetBranch').then(callback);
        },
        getRole: function (callback) {
            $http.post('/Admin/MobilizationDecision/GetRole').then(callback);
        },
        getEmployeeCode: function (data, data1, data2, callback) {
            $http.post('/Admin/EndContractDecision/getEmployee?page=' + data + '&pageSize=' + data1 + '&employee=' + data2).then(callback);
        },

        getItem: function (data, callback) {
            $http.post('/Admin/MobilizationDecision/GetItem?id=' + data).then(callback);
        },
        getItemDetail: function (data, callback) {

            $http.post('/Admin/MobilizationDecision/GetItemDetail?id=' + data).then(callback);
        },
        getDepartmentId: function (data, callback) {

            $http.post('/Admin/MobilizationDecision/GetDepartmentId?id=' + data).then(callback);
        },
        getStatusAct: function (callback) {
            $http.post('/Admin/MobilizationDecision/GetStatusAct').then(callback);
        },
        getDecisionType: function (callback) {
            $http.post('/Admin/MobilizationDecision/GetDecisionType').then(callback);
        },
        getActionStatus: function (data, callback) {
            $http.get('/Admin/MobilizationDecision/GetActionStatus?code=' + data).then(callback);
        },
        getWorkFlow: function (callback) {
            $http.post('/Admin/MobilizationDecision/GetWorkFlow').then(callback);
        },
        getStepWorkFlow: function (data, callback) {
            $http.post('/Admin/PayDecision/GetStepWorkFlow?code=' + data).then(callback);
        },
        getItemHeader: function (data, callback) {
            $http.post('/Admin/MobilizationDecision/GetItemHeader?id=' + data).then(callback);
        },
        getItemHeaderWithCode: function (data, callback) {
            $http.post('/Admin/MobilizationDecision/GetItemHeaderWithCode?code=' + data).then(callback);
        },
        getListRepeat: function (data, callback) {
            $http.post('/Admin/MobilizationDecision/GetListRepeat?code=' + data).then(callback);
        },

        //Header
        insert: function (data, callback) {
            $http.post('/Admin/MobilizationDecision/Insert/', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/MobilizationDecision/Update/', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/MobilizationDecision/Delete', data).then(callback);
        },

        //Detail
        insertDetail: function (data, callback) {
            $http.post('/Admin/MobilizationDecision/InsertDetail/', data).then(callback);
        },
        deleteDetail: function (data, callback) {
            $http.post('/Admin/MobilizationDecision/DeleteDetail?Id=' + data).then(callback);
        },
        updateDetailProduct: function (data, data1, callback) {
            $http.post('/Admin/MobilizationDecision/UpdateDetailProduct?decisionNumber=' + data + '&status=' + data1).then(callback);
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
            $http.post('/Admin/MobilizationDecision/GetJsonData?decisionNum=' + data).then(callback);
        },

        //ExportExcel
        exportExcel: function (data, callback) {
            $http.post('/Admin/MobilizationDecision/ExportExcel?planNumber=' + data).then(callback);
        },
        uploadFile: function (data, callback) {
            submitFormUpload('/Admin/MobilizationDecision/UploadFile', data, callback)
        },
        checkData: function (data, callback) {
            $http.post('/Admin/MobilizationDecision/CheckData', data).then(callback);
        },
        insertFromExcel: function (data, callback) {
            $http.post('/Admin/MobilizationDecision/InsertFromExcel', data).then(callback);
        },
        logInfomation: function (data, callback) {
            $http.post('/Admin/MobilizationDecision/LogInfomation', data).then(callback);
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
app.controller('Ctrl_ESEIM_MOBILI_DEC', function ($scope, $rootScope, $cookies, $filter, dataserviceMobiDecision, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        $rootScope.IsTranslate = true;
        caption = caption[culture] ? caption[culture] : caption;

        $rootScope.validationOptionsMobi = {
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
    $rootScope.textSearch = "";
    $rootScope.page = 1;
    $rootScope.pageSize = 10;
    //Lưu ý không tạo các biến chung ở đây(nếu tạo thêm tiền tố )
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/MobilizationDecision/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderMobiDecision + '/index.html',
            controller: 'index'
        })
        .when('/add', {
            templateUrl: ctxfolderMobiDecision + '/add.html',
            controller: 'add'
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

app.controller('index', function ($scope, $route, $location, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceMobiDecision, $filter, myService) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.model = {
        DecisionNum: '',
        FromDate: '',
        ToDate: '',
        AprovedBy: '',
        Status: '',
    }
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/MobilizationDecision/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.AprovedBy = $scope.model.AprovedBy;
                d.Status = $scope.model.Status;
                d.ToDate = $scope.model.ToDate;
                d.FromDate = $scope.model.FromDate;
                d.DecisionNum = $scope.model.DecisionNum;
                d.CodeEmployee = $scope.model.CodeEmployee;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(15)
        .withOption('order', [2, 'desc'])
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
                    var Id = data.Id;
                    $scope.edit(Id);
                }
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle('').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DecisionNum').withTitle('{{"MDC_BTN_BN_NUMBER_NAME"  | translate}}').renderWith(function (data, type, full) {
        return data + ' - ' + full.Title;
    }).withOption('sClass', 'dataTable-pr0 dataTable-20per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"MDC_BTN_BN_CREATE_DATE" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-20per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"MDC_BTN_BN_STT" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-20per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AprovedBy').withTitle('MDC_BTN_BN_APPROVAL_ER').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'tcenter dataTable-pr0 dataTable-15per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AprovedTime').withTitle('{{"MDC_BTN_BN_APPROVAL_DATE" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-15per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withTitle('{{"MDC_BTN_BN_MANIPULATION" | translate}}').withOption('sClass', 'nowrap text-center dataTable-w80').renderWith(function (data, type, full) {
        return '<a ng-click="edit(' + full.Id + ')" style1= "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class1="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-edit fs25 pr20"></i></a>' +
            '<a title="Xoá" ng-click="delete(' + full.Id + ')" style1="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45);" class1="btn btn-icon-only btn-circle btn-outline red"><i class="fas fa-trash-alt fs25 text-danger"></i></a>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {
    }

    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $rootScope.reload = function (resetPage) {
        reloadData(resetPage);
    }
    $scope.search = function () {
        reloadData(true);
    }

    $scope.add = function () {
        $scope.model.page = "add";
        myService.setData(data = $scope.model);
        $location.path('/add');
        setTimeout(function () {
            $('.cancel').removeClass('dis');
            $('.save').removeClass('dis');
            $('.add').addClass('dis');
            $('.edit').addClass('dis');
            $rootScope.detailDisable = true;
        }, 200);
    }
    $scope.edit = function (id) {
        dataserviceMobiDecision.getItemHeader(id, function (rs) {
            rs = rs.data;
            rs.page = "edit";
            myService.setData(rs);
            $location.path('/add');
        });
        setTimeout(function () {
            $('.cancel').removeClass('dis');
            $('.save').removeClass('dis');
            $('.add').addClass('dis');
            $('.edit').addClass('dis');
            $('.wf').addClass('dis');
            $('.numdes').addClass('dis');
            $rootScope.detailDisable = false;
        }, 200);
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM.replace('{0}', "");
                $scope.ok = function () {
                    dataserviceMobiDecision.delete(id, function (rs) {
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

    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }

    $rootScope.loadMore = function ($select, $event) {
        if (!$event) {
            $rootScope.page = 1;
            $rootScope.items = [];
        } else {
            $event.stopPropagation();
            $event.preventDefault();
            $rootScope.page++;
        }
        dataserviceMobiDecision.getEmployeeCode($rootScope.page, $rootScope.pageSize, $rootScope.textSearch, function (rs) {
            rs = rs.data;
            $rootScope.dataEmployee = $rootScope.dataEmployee.concat(rs.Object);
            $rootScope.dataEmployee = removeDuplicate($rootScope.dataEmployee);
        });
    }
    $rootScope.reloadEmployee = function (input) {
        $rootScope.textSearch = input;
        $rootScope.page = 1;
        $rootScope.items = [];
        $rootScope.dataEmployee = [];
        dataserviceMobiDecision.getEmployeeCode($rootScope.page, $rootScope.pageSize, $rootScope.textSearch, function (rs) {
            rs = rs.data;
            $rootScope.dataEmployee.splice(0);
            $rootScope.dataEmployee = $rootScope.dataEmployee.concat(rs.Object);
            $rootScope.dataEmployee = removeDuplicate($rootScope.dataEmployee);
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

    function removeDuplicate(array) {
        res = [];
        len = array.length;

        while (len--) {
            var itm = array[len];
            var isDuplicate = false;
            for (i = 0; i < res.length; i++) {
                if (res[i].Code == itm.Code) {
                    isDuplicate = true;
                    break;
                }
            }
            if (!isDuplicate) {
                res.unshift(itm);
            }
        }
        return res;
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
    }, 1000);
});
app.controller('add', function ($scope, $route, $location, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceMobiDecision, $filter, myService) {
    $scope.model = {
        DecisionNum: '',
        Title: '',
        WorkflowCat: '',
        Noted: '',
        Status: 'STATUS_ACTIVITY_DO',
        ActRepeat: ''
    }
    $rootScope.modelWf = {
        WorkflowCode: "",
        ObjectType: "DECISION_MOVEMENT",
        ObjectInst: "",
    };

    $scope.isShowHeader = true;
    $scope.roleedit = true;
    $scope.check = true;
    $scope.addtab = true;
    $scope.edittab = false;
    $scope.isSave = false;
    $rootScope.detailDisable = false;

    if (myService.getData() != undefined && myService.getData() != "" && myService.getData() != null) {
        var data = myService.getData();
        if (data.com != undefined && data.com != "" && data.com != null) {
            $scope.lstStatusAct = data.com;
            $scope.check = false;
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
            $rootScope.detailDisable = false;
        }
        else {
            $scope.roleedit = false;
            $rootScope.detailDisable = true;
        }
        if (data.editdetail != undefined && data.editdetail != "" && data.editdetail != null && data.editdetail == true) {
            $rootScope.detailDisable = false;
        }
        else {
            $rootScope.detailDisable = true;
        }

        if (data.data != undefined && data.data != "" && data.data != null) {
            $scope.model = data.data;

            var lstStatus = JSON.parse(data.data.Status);
            if (lstStatus.length > 0) {
                $scope.model.StatusTemp = lstStatus[lstStatus.length - 1].Code;
                $scope.model.Status = lstStatus[lstStatus.length - 1].Code;
                $scope.listStatusLog = lstStatus;
            }

            if (data.page == "add") {
                $scope.roleedit = true;
                $scope.addtab = true;
                $scope.edittab = false;
                $scope.isSave = false;
                $('.numdes').removeClass('dis');
                $('.wf').removeClass('dis');
            }
            if (data.page == "edit") {
                $scope.addtab = false;
                $scope.edittab = true;
                $scope.isSave = true;
                $('.numdes').addClass('dis');
                $('.wf').addClass('dis');

                $rootScope.DecisionNum = $scope.model.DecisionNum;
            }
            
            setTimeout(function () {
                var objInstCode = $scope.model.DecisionNum;
                if (objInstCode != undefined && objInstCode != null && objInstCode != '') {
                    $rootScope.loadDiagramWfInst(objInstCode, $rootScope.modelWf.ObjectType);
                }
            }, 1000);
        } else {
            if (data.page == "add") {
                $rootScope.DecisionNum = '';
                $scope.showExcel = true;
                $scope.model.WorkflowCat = 'DECISION_MOVEMENT';

                setTimeout(function () {
                    $rootScope.loadDiagramWF($scope.model.WorkflowCat);
                }, 1000);
            }
        }
    } else {
        $location.path("/");
    }

    $scope.initData = function () {
        dataserviceMobiDecision.getWorkFlow(function (result) {
            result = result.data;
            $rootScope.lstWorkflow = result;
        });
        if ($scope.check == true) {
            dataserviceMobiDecision.getStatusAct(function (rs) {
                rs = rs.data;
                $scope.lstStatusAct = rs;
            })
        }
    }
    $scope.initData();

    $scope.cancel = function () {
        $location.path("/");
    }

    $scope.add = function () {
        $scope.model = {};
        $scope.isSave = false;
        $('.add').addClass('dis');
        $('.edit').addClass('dis');
        $('.cancel').removeClass('dis');
        $('.save').removeClass('dis');
        $rootScope.detailDisable = true;
    }
    $scope.edit = function () {
        $scope.addtab = false;
        $scope.edittab = true;
        $scope.onlyedit = true;
        $('.add').addClass('dis');
        $('.edit').addClass('dis');
        $('.cancel').removeClass('dis');
        $('.save').removeClass('dis');
        dataserviceMobiDecision.getItemHeaderWithCode($scope.model.DecisionNum, function (rs) {
            data = rs.data;
            $scope.lstStep = data.list;
            if (data.editrole != undefined && data.editrole != "" && data.editrole != null && data.editrole == true) {
                $rootScope.detailDisable = false;
                $scope.roleedit = true;
            }
            else {
                $scope.roleedit = false;
                $rootScope.detailDisable = true;
            }
            if (data.editdetail != undefined && data.editdetail != "" && data.editdetail != null && data.editdetail == true) {
                $rootScope.detailDisable = false;
            }
            else {
                $rootScope.detailDisable = true;
            }

            var wfInstId = data.data.WfInstId;

            if (wfInstId != undefined && wfInstId != null && wfInstId != '') {
                dataserviceMobiDecision.getActInstArranged(wfInstId, $scope.modelWf.ObjectType, function (rs) {
                    rs = rs.data;
                    $scope.lstActArranged = rs;
                });
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
                    }, 50);
                }
            }, 50);
        })
    }

    $scope.addHeader = function () {
        if ($scope.model.Status != "STATUS_ACTIVITY_DO") {
            App.toastrError("Quyết định chưa được khởi tạo");
        }
        else {
            validationSelect($scope.model);
            if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
                //Create WF for decesion
                $scope.modelWf.ObjectInst = $scope.model.DecisionNum;
                $scope.modelWf.WorkflowCode = $scope.model.WorkflowCat;
                dataserviceMobiDecision.createWfInstance($scope.modelWf, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        var wfInstCode = rs.Object.WfInstCode;
                        $scope.WfInstCode = wfInstCode;
                        //dataserviceMobiDecision.insertInstRunning(wfInstCode, $scope.modelWf.WorkflowCode, function (rs) {

                        //});

                        dataserviceMobiDecision.insert($scope.model, function (rs) {
                            rs = rs.data;
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            } else {
                                App.toastrSuccess(rs.Title);
                                $rootScope.detailDisable = false;
                                $scope.isSave = true;
                                $rootScope.DecisionNum = $scope.model.DecisionNum;
                                $scope.reloadHeader();
                            }
                        })
                    }
                })
            }
        }
    }
    $scope.editHeader = function () {
        if ($scope.roleedit == true) {
            validationSelect($scope.model);
            if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
                dataserviceMobiDecision.update($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        if ($scope.model.Status != "STATUS_ACTIVITY_APPROVE_END") {
                            if ($scope.model.Status != "STATUS_ACTIVITY_APPROVED") {
                                $scope.showAct = false;

                                App.toastrSuccess(rs.Title);
                                $rootScope.detailDisable = false;

                                $scope.isSave = true;
                                $scope.reloadHeader();
                            }
                            else if ($scope.model.Status == "STATUS_ACTIVITY_APPROVED") {
                                dataserviceMobiDecision.updateDetailProduct($scope.model.DecisionNum, $scope.model.Status, function (rs) {
                                    rs = rs.data;
                                    if (rs.Error) {
                                        App.toastrError(rs.Title);
                                    } else {
                                        App.toastrSuccess("Cập nhật thành công ");
                                        $scope.reloadHeader();
                                    }
                                });
                            }
                        } else {
                            dataserviceMobiDecision.updateDetailProduct($scope.model.DecisionNum, $scope.model.Status, function (rs) {
                                rs = rs.data;
                                if (rs.Error) {
                                    App.toastrError(rs.Title);
                                } else {
                                    App.toastrSuccess("Cập nhật thành công - Quyết định được hoàn thành ");
                                    $scope.reloadHeader();
                                }
                            });
                        }
                    }
                });
            }
        } else {
            App.toastrError("Bạn không có quyền sửa quyết định !");
        }
    }

    $scope.importExcel = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderMobiDecision + '/excel.html',
            controller: 'excel',
            backdrop: 'static',
            size: '80',
            resolve: {
                para: function () {
                    return $scope.model;
                }
            }
        });
        modalInstance.result.then(function (d) {
        }, function () {
        });
    }

    $scope.reloadHeader = function () {
        $('.add').removeClass('dis');
        $('.edit').removeClass('dis');
        $('.cancel').addClass('dis');
        $('.save').addClass('dis');

        dataserviceMobiDecision.getActionStatus($scope.model.DecisionNum, function (rs) {
            rs = rs.data;
            $scope.listStatusLog = JSON.parse(rs[0].Status);
            $scope.model.StatusTemp = $scope.listStatusLog[$scope.listStatusLog.length - 1].Code;
            $scope.model.Status = $scope.listStatusLog[$scope.listStatusLog.length - 1].Code;
        });
        dataserviceMobiDecision.getItemHeaderWithCode($scope.model.DecisionNum, function (rs) {
            data = rs.data;
            $scope.lstStep = data.list;
            if (data.editrole != undefined && data.editrole != "" && data.editrole != null && data.editrole == true) {
                $rootScope.detailDisable = false;
            }
            else {
                $scope.roleedit = false;
                $rootScope.detailDisable = true;
            }
            if (data.editdetail != undefined && data.editdetail != "" && data.editdetail != null && data.editdetail == true) {
                $rootScope.detailDisable = false;
            }
            else {
                $rootScope.detailDisable = true;
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

            var objInstCode = $scope.model.DecisionNum;
            if (objInstCode != undefined && objInstCode != null && objInstCode != '') {
                $rootScope.loadDiagramWfInst(objInstCode, $rootScope.modelWf.ObjectType);
            }

            $rootScope.reloadDetail();
        });
    }

    //Workflow 
    $scope.editInstAct = function (id, objCode) {
        dataserviceMobiDecision.checkPermissionEditActivityById(id, function (rs) {
            rs = rs.data;
            if (!rs) {
                return App.toastrError(caption.COM_MSG_PERMISSION_EDIT_ACT);
            }
            dataserviceMobiDecision.getItemActInst(id, function (rs) {
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
                    dataserviceMobiDecision.getActionStatus($scope.model.DecisionNum, function (rs) {
                        rs = rs.data;
                        $scope.listStatusLog = JSON.parse(rs[0].Status);
                        $scope.model.StatusTemp = $scope.listStatusLog[$scope.listStatusLog.length - 1].Code;
                        $scope.model.Status = $scope.listStatusLog[$scope.listStatusLog.length - 1].Code;
                    })
                    $rootScope.loadDiagramWfInst($scope.model.DecisionNum, $rootScope.modelWf.ObjectType);
                }, function () {
                });
            })
        })
    }

    $scope.changeStatus = function () {
        if ($scope.model.Status != "" && $scope.model.Status != null)
            $scope.errorStatus = false;

        if ($scope.model.Status == "END_REQUIRE_REWORK" || $scope.model.Status == "REPEAT_REQUIRE_REWORK" || $scope.model.Status == "FINAL_REQUIRE_REWORK") {
            dataserviceMobiDecision.getListRepeat($scope.model.DecisionNum, function (rs) {
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

    $scope.changeSelect = function (SelectType) {
        if (SelectType == "WorkflowCat" && $scope.model.WorkflowCat != "" && $scope.model.WorkflowCat != null) {
            $scope.errorWorkflowCat = false;

            dataserviceMobiDecision.getActivityArranged($scope.model.WorkflowCat, function (rs) {
                rs = rs.data;
                $scope.lstActArranged = rs;
            });
        }

        if (SelectType == "DecisionType" && $scope.model.DecisionType != "" && $scope.model.DecisionType != null) {
            $scope.errorDecisionType = false;
        }
    }

    $scope.showLog = function () {
        dataserviceMobiDecision.getJsonData($scope.model.DecisionNum, function (rs) {
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

    $scope.exportWord = function () {
        if ($scope.model.DecisionNum === '' || $scope.model.DecisionNum === undefined || $scope.model.DecisionNum === null) {
            App.toastrError('Vui lòng nhập số quyết định !');
            return;
        }

        if ($rootScope.countDetail > 0) {
            location.href = "/Admin/MobilizationDecision/ExportReport?"
                + "&code=" + $scope.model.DecisionNum;
        } else {
            App.toastrError('Chi tiết quyết định trống');
        }
    };

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.WorkflowCat == undefined || data.WorkflowCat == null || data.WorkflowCat == "") {
            $scope.errorWorkflowCat = true;
            mess.Status = true;
        } else {
            $scope.errorWorkflowCat = false;
        }

        //if (data.DecisionType == undefined || data.DecisionType == null || data.DecisionType == "") {
        //    $scope.errorDecisionType = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorDecisionType = false;
        //}

        if (data.Status == undefined || data.Status == null || data.Status == "") {
            $scope.errorStatus = true;
            mess.Status = true;
        } else {
            $scope.errorStatus = false;
        }

        //if (data.DepartmentCode == undefined || data.DepartmentCode == null || data.DepartmentCode == "") {
        //    $scope.errorDepartmentCode = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorDepartmentCode = false;
        //}

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
        $("#appfrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#appto').datepicker('setStartDate', maxDate);
        });
        $("#appto").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#appfrom').datepicker('setEndDate', maxDate);
        });
        $("#datedecision").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
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
    }, 50);
});
app.controller('detail', function ($scope, $route, $location, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceMobiDecision, $filter, myService) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.model = {
        DecisionNum: '',
        Unit: '',
        UserinDepart: '',
        NewDepartmentCode: '',
        NewRole: '',
        FromTime: '',
        ToTime: '',
        PayScale: '',
        PayRanges: '',
        ReasonMovement: '',
    }

    $scope.isEditDetail = false;

    $scope.treeDataunit = [];
    $scope.positionData = [];
    $scope.treedataHr = [];
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/MobilizationDecision/JTableMain",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.DecisionNum = $rootScope.DecisionNum;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(15)
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
            $scope.CountEmployee = data.count;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm.dtColumns = [];
    //vm.dtColumns.push(DTColumnBuilder.newColumn('EmployeesCode').withTitle('Mã nhân viên').renderWith(function (data, type) {
    //    return data;
    //}).withOption('sClass', 'dataTable-pr0 dataTable-5per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Fullname').withTitle('{{"MDC_BTN_BN_NAME_MID" | translate}}').renderWith(function (data, type, full) {
        return full.EmployeesCode + ' - ' + data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('OldDepartment').withTitle('{{"MDC_BTN_BN_DEPARTMENT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('OldRole').withTitle('{{"MDC_BTN_BN_POSITION" | translate}}').renderWith(function (data, type) {
        return data
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('NewDepartment').withTitle('{{"MDC_BTN_BN_DEPARTMENT_NEW" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('NewRole').withTitle('{{"MDC_BTN_BN_POSITION_NEW" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PayScaleCode').withTitle('{{"MDC_BTN_BN_PAYROLL" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PayRanges').withTitle('{{"MDC_BTN_BN_WAGE" | translate}}').renderWith(function (data, type) {
        return '<p style = "color:green">' + data + '</p>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Salary').withTitle('{{"MDC_BTN_BN_LEVEL_WAGE" | translate}}').renderWith(function (data, type) {
        return '<span class="text-danger">' + $filter('currency')(data, '', 0) + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ReasonMovement').withTitle('{{"MDC_BTN_BN_REASON_FOR_MANEUVERING" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Action').withOption('sClass', 'nowrap text-center dataTable-w80').withTitle('{{"MDC_BTN_BN_ACTION" | translate}}').renderWith(function (data, type, full, meta) {
        if (!$rootScope.detailDisable) {
            return '<a ng-click="edit(' + full.Id + ')" style1="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class1="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-edit fs25 pr20"></i></a>' +
                '<a title="Xoá" ng-click="delete(' + full.Id + ')" style1="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45);" class1="btn btn-icon-only btn-circle btn-outline red"><i class="fas fa-trash-alt fs25 text-danger"></i></a>';
        }
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};

    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {
    }
    $scope.reload = function () {
        reloadData(true);
    }

    $scope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $rootScope.reloadDetail = function () {
        reloadData(false);
    }
    $scope.search = function () {
        reloadData(true);
    }
    $scope.init = function () {
        dataserviceMobiDecision.getWorkFlow(function (result) {
            result = result.data;
            $rootScope.lstWorkflow = result;
        });
        dataserviceMobiDecision.gettreedataunit(function (result) {
            result = result.data;
            $scope.treeDataunit = result.Object;
        });
        if ($scope.model.Flag == false) {
            dataserviceMobiDecision.getStatusAct(function (rs) {
                rs = rs.data;
                $scope.lstStatusAct = rs;
            });
        }
        dataserviceMobiDecision.getListPayScale(function (rs) {
            rs = rs.data;
            $scope.lstPayScale = rs;
        });
        dataserviceMobiDecision.getListCareer(function (rs) {
            rs = rs.data;
            $scope.lstCareer = rs;
        });
        dataserviceMobiDecision.getListDepartment(function (rs) {
            rs = rs.data;
            $scope.listDepartment = rs.Object;
        });
        dataserviceMobiDecision.getRole(function (rs) {
            rs = rs.data;
            $scope.listRole = rs;
        })
    };
    $scope.init();

    $scope.ChangeUnit = function (data) {
        $scope.model.UserinDepart = '';
        dataserviceMobiDecision.getUserDepartment(data, function (rs) {
            rs = rs.data;
            $scope.lstUserinDpt = rs;
        })
    }
    $scope.ChangeEmployee = function (data) {
        for (var i = 0; i < $scope.lstUserinDpt.length; i++) {
            if ($scope.lstUserinDpt[i].Code == $scope.model.UserinDepart) {
                $scope.model.OldRole = $scope.lstUserinDpt[i].OldRole;
            }
        }
    }
    $scope.ChangePayScale = function (data1, data2) {
        dataserviceMobiDecision.getListPayScaleDetail(data1, data2, function (rs) {
            rs = rs.data;
            $scope.lstRange = rs;
        })
    }

    $scope.cancel = function () {
        $scope.model = {};
        $scope.isEditDetail = false;
    }
    $scope.save = function () {
        $scope.model.DecisionNum = $rootScope.DecisionNum;
        validationSelect($scope.model);
        if (!validationSelect($scope.model).Status) {
            dataserviceMobiDecision.insertDetail($scope.model, function (rs) {
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
    $scope.edit = function (id) {
        var data = {};
        var listdata = $('#tblDataDetail').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (parseInt(listdata[i].Id) === id) {
                data = listdata[i];
                break;
            }
        }
        $scope.model.Unit = data.OldCode;
        $scope.model.UserinDepart = data.EmployeesCode;
        $scope.model.OldPosion = data.OldPosion;
        $scope.model.NewDepartmentCode = data.NewCode;
        $scope.model.NewRole = data.NewPosion;
        $scope.model.PayScale = data.PayScaleCode;
        $scope.model.PayRanges = data.PayRanges;
        $scope.model.Salary = data.Salary;
        $scope.model.FromTime = data.FromTime;
        $scope.model.ToTime = data.ToTime;

        $scope.ChangeUnit($scope.model.Unit);

        setTimeout(function () {
            $scope.ChangeEmployee($scope.model.UserinDepart);
            $scope.ChangePayScale($scope.model.NewRole, $scope.model.PayScale);
        }, 200);

        $scope.isEditDetail = true;

    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceMobiDecision.deleteDetail(id, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
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
            $scope.reloadNoResetPage();
        }, function () {
            $scope.reloadNoResetPage();
        });
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.Unit == "" || data.Unit == undefined || data.Unit == null) {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;
        }
        if (data.NewDepartmentCode == "" || data.NewDepartmentCode == undefined || data.NewDepartmentCode == null) {
            $scope.errorNewDepartmentCode = true;
            mess.Status = true;
        } else {
            $scope.errorNewDepartmentCode = false;
        }
        if (data.NewRole == "" || data.NewRole == undefined || data.NewRole == null) {
            $scope.errorNewRole = true;
            mess.Status = true;
        } else {
            $scope.errorNewRole = false;
        }
        if (data.FromTime == "" || data.FromTime == undefined || data.FromTime == null) {
            $scope.errorFromTime = true;
            mess.Status = true;
        } else {
            $scope.errorFromTime = false;
        }
        //if (data.ToTime == "" || data.ToTime == undefined || data.ToTime == null) {
        //    $scope.errorToTime = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorToTime = false;
        //}
        if (data.PayScale == "" || data.PayScale == undefined || data.PayScale == null) {
            $scope.errorPayScale = true;
            mess.Status = true;
        } else {
            $scope.errorPayScale = false;
        }
        if (data.PayRanges == "" || data.PayRanges == undefined || data.PayRanges == null) {
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

        $("#appfrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#appto').datepicker('setStartDate', maxDate);
        });
        $("#appto").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#appfrom').datepicker('setEndDate', maxDate);
        });
        $("#datedecision").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
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
app.controller('excel', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataserviceMobiDecision, $timeout, para) {
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.IsEdit = false;
    $scope.model = {};
    $scope.modelWf = {
        WorkflowCode: "",
        ObjectType: "DECISION_MOVEMENT",
        ObjectInst: "",
    };

    $scope.initData = function () {
        dataserviceMobiDecision.gettreedataunit(function (result) {
            result = result.data;
            $scope.treeDataunit = result.Object;
        });
        dataserviceMobiDecision.getListPayScale(function (rs) {
            rs = rs.data;
            $scope.lstPayScale = rs;
        });
        dataserviceMobiDecision.getListCareer(function (rs) {
            rs = rs.data;
            $scope.lstCareer = rs;
        });
        dataserviceMobiDecision.getListDepartment(function (rs) {
            rs = rs.data;
            $scope.listDepartment = rs.Object;
        });
        dataserviceMobiDecision.getRole(function (rs) {
            rs = rs.data;
            $scope.listRole = rs;
        });
        dataserviceMobiDecision.getUserDepartment("", function (rs) {
            rs = rs.data;
            $scope.lstUserinDpt = rs;
        });
        /*dataserviceMobiDecision.getListPayScaleDetail("", function (rs) {
            rs = rs.data;
            $scope.lstRange = rs;
        })*/
    }
    $scope.initData();

    $scope.ChangeUnit = function (data) {
        $scope.model.EmployeeCode = "";
        dataserviceMobiDecision.getUserDepartment(data, function (rs) {
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
    $scope.ChangeEmployee = function (data) {
        for (var i = 0; i < $scope.lstUserinDpt.length; i++) {
            if ($scope.lstUserinDpt[i].Code == data) {
                $scope.model.OldRole = $scope.lstUserinDpt[i].OldRole;
            }
        }
    }
    $scope.ChangePayScale = function (data1, data2) {
        dataserviceMobiDecision.getListPayScaleDetail(data1, data2, function (rs) {
            rs = rs.data;
            $scope.lstRange = rs;
        });
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
            dataserviceMobiDecision.uploadFile(form, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
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
            window.open(url, '_blank');
        }
    };
    $scope.editDetails = function (data) {
        $scope.model.Id = data.Id;
        $scope.model.DecisionNum = data.DecisionNum;
        $scope.model.DepartmentCode = data.DepartmentCode;
        $scope.model.EmployeeCode = data.EmployeeCode;
        $scope.model.NewDepartmentCode = data.NewDepartmentCode;
        $scope.model.NewRole = data.NewRole;
        $scope.model.PayScaleCode = data.PayScaleCode;
        $scope.model.PayRanges = data.PayRanges;
        $scope.model.Salary = data.Salary;
        $scope.model.FromTime = data.FromTime;
        $scope.model.ToTime = data.ToTime;

        $scope.ChangeUnit($scope.model.DepartmentCode);
        $scope.ChangePayScale($scope.model.NewRole = data.NewRole, $scope.model.PayScaleCode);
        $scope.ChangeEmployee($scope.model.EmployeeCode);
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
        dataserviceMobiDecision.logInfomation($scope.model, function (rs) {
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
                        $scope.Listdata[i].NewDepartmentCode = $scope.lstModel.NewDepartmentCode;
                        $scope.Listdata[i].NewDepartName = $scope.lstModel.NewDepartName;
                        $scope.Listdata[i].NewRole = $scope.lstModel.NewRole;
                        $scope.Listdata[i].NewRoleName = $scope.lstModel.NewRoleName;
                        $scope.Listdata[i].PayScaleCode = $scope.lstModel.PayScaleCode;
                        $scope.Listdata[i].PayRanges = $scope.lstModel.PayRanges;
                        $scope.Listdata[i].Salary = $scope.lstModel.Salary;
                        $scope.Listdata[i].FromTime = $scope.lstModel.FromTime;
                        $scope.Listdata[i].ToTime = $scope.lstModel.ToTime;
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
                dataserviceMobiDecision.createWfInstance($scope.modelWf, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        var wfInstCode = rs.Object.WfInstCode;
                        $scope.WfInstCode = wfInstCode;
                        //dataserviceMobiDecision.insertInstRunning(wfInstCode, $scope.modelWf.WorkflowCode, function (rs) {

                        //})
                        dataserviceMobiDecision.insert($scope.modelHeader, function (rs) {
                            rs = rs.data;
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            } else {
                                dataserviceMobiDecision.insertFromExcel({ ListEmp: $scope.Listdata }, function (rs) {
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
        $("#appfrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#appto').datepicker('setStartDate', maxDate);
        });

        $("#appto").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#appfrom').datepicker('setEndDate', maxDate);
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