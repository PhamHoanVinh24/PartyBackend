var ctxfolder = "/views/admin/planRecruitment";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ng.jsoneditor']);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    var submitFormUploadFile = function (url, data, callback) {
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
        getStatus: function (callback) {
            $http.post('/Admin/PlanRecruitment/GetStatus').then(callback);
        },
        getProduct: function (data, data1, data2, callback) {
            $http.post('/Admin/PlanRecruitment/GetListProduct?page=' + data + '&pageSize=' + data1 + '&productname=' + data2).then(callback);
        },
        getProductAttach: function (data, callback) {
            $http.post('/Admin/PlanRecruitment/GetListProductAttach?productCode=' + data).then(callback);
        },
        getDepartment: function (callback) {
            $http.post('/Admin/PlanRecruitment/GetDepartment').then(callback);
        },
        getSupply: function (data, data1, data2, callback) {
            $http.post('/Admin/PlanRecruitment/GetSupply?page=' + data + '&pageSize=' + data1 + '&productname=' + data2).then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/PlanRecruitment/GetItem?id=' + data).then(callback);
        },
        getItemDetail: function (data, callback) {

            $http.post('/Admin/PlanRecruitment/GetItemDetail?id=' + data).then(callback);
        },
        getDepartmentId: function (data, callback) {

            $http.post('/Admin/PlanRecruitment/GetDepartmentId?id=' + data).then(callback);
        },
        getStatusAct: function (callback) {
            $http.post('/Admin/PlanRecruitment/GetStatusAct').then(callback);
        },
        getPlanType: function (callback) {
            $http.post('/Admin/PlanRecruitment/GetPlanType').then(callback);
        },
        getActionStatus: function (data, callback) {
            $http.get('/Admin/PlanRecruitment/GetActionStatus?code=' + data).then(callback);
        },
        getWorkFlow: function (callback) {
            $http.post('/Admin/PlanRecruitment/GetWorkFlow').then(callback);
        },
        getStepWorkFlow: function (data, callback) {
            $http.post('/Admin/PayDecision/GetStepWorkFlow?code=' + data).then(callback);
        },
        getItemHeader: function (data, callback) {
            $http.post('/Admin/PlanRecruitment/GetItemHeader?id=' + data).then(callback);
        },
        getItemHeaderWithCode: function (data, callback) {
            $http.post('/Admin/PlanRecruitment/GetItemHeaderWithCode?code=' + data).then(callback);
        },
        getListRepeat: function (data, callback) {
            $http.post('/Admin/PlanRecruitment/GetListRepeat?code=' + data).then(callback);
        },

        //Header
        insert: function (data, callback) {
            $http.post('/Admin/PlanRecruitment/Insert/', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/PlanRecruitment/Update/', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/PlanRecruitment/Delete', data).then(callback);
        },

        //Detail
        insertDetail: function (data, callback) {
            $http.post('/Admin/PlanRecruitment/InsertDetail/', data).then(callback);
        },
        deleteDetail: function (data, callback) {
            $http.post('/Admin/PlanRecruitment/DeleteDetail?Id=' + data).then(callback);
        },
        updateDetailProduct: function (data, callback) {
            $http.post('/Admin/PlanRecruitment/UpdateDetailProduct?planNumber=' + data).then(callback);
        },
        approvedDetail: function (data, callback) {
            $http.post('/Admin/PlanRecruitment/ApprovedDetail/', data).then(callback);
        },

        //Workflow
        createWfInstance: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/CreateWfInstance', data).then(callback)
        },
        insertInstRunning: function (data, data1, callback) {
            $http.post('/Admin/WorkflowActivity/InsertInstRunning?wfInstCode=' + data + '&wfCode=' + data1).then(callback);
        },

        //LogData
        getJsonData: function (data, callback) {
            $http.post('/Admin/PlanRecruitment/GetJsonData?code=' + data).then(callback);
        },

        //ExportExcel
        exportExcel: function (data, callback) {
            $http.post('/Admin/PlanRecruitment/ExportExcel?planNumber=' + data).then(callback);
        },

        //Trình độ, Chuyên môn
        getListPayCertificate: function (callback) {
            $http.post('/Admin/PlanRecruitment/GetListPayCertificate').then(callback);
        },
        getListPayMajor: function (callback) {
            $http.post('/Admin/PlanRecruitment/GetListPayMajor').then(callback);
        },

        //Attribute
        getListProductAttributeMain: function (callback) {
            $http.post('/Admin/PlanRecruitment/GetListProductAttributeMain').then(callback);
        },
        getListProductAttributeChildren: function (data, callback) {
            $http.get('/Admin/PlanRecruitment/GetListProductAttributeChildren?ParentCode=' + data).then(callback);
        },
        getDetailAttributeMore: function (data, callback) {
            $http.post('/Admin/PlanRecruitment/GetDetailAttributeMore?Id=' + data).then(callback);
        },
        insertAttributeMore: function (data, callback) {
            $http.post('/Admin/PlanRecruitment/InsertAttributeMore', data).then(callback);
        },
        updateAttributeMore: function (data, callback) {
            $http.post('/Admin/PlanRecruitment/UpdateAttributeMore', data).then(callback);
        },
        deleteAttributeMore: function (data, callback) {
            $http.post('/Admin/PlanRecruitment/DeleteAttributeMore/' + data).then(callback);
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
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
            //max: 'Max some message {0}'
        });
        $rootScope.validationOptions = {
            rules: {
                PlanNumber: {
                    required: true,
                    regx: /^[^\s].*/
                },
                Title: {
                    required: true,
                    regx: /^[^\s].*/
                },
                UserCreated: {
                    required: true,
                    regx: /^[^\s].*/
                },
                PlanDate: {
                    required: true,
                    regx: /^[^\s].*/
                }
            },
            messages: {
                PlanNumber: {
                    required: caption.PR_PLAN_NUMBER_MSG_NOT_EMPTY,
                    regx: 'Không nhập khoảng trắng'
                },
                Title: {
                    required: caption.PR_PLAN_TITLE_MSG_NOT_EMPTY,
                    regx: 'Không nhập khoảng trắng'
                },
                UserCreated: {
                    required: caption.PR_CREATED_BY_MSG_NOT_EMPTY,
                    regx: 'Không nhập khoảng trắng'
                },
                PlanDate: {
                    required: caption.PR_CREATED_TIME_MSG_NOT_EMPTY,
                    regx: 'Không nhập khoảng trắng'
                }
            }
        }

        $rootScope.validationDetailOptions = {
            rules: {
                Position: {
                    required: true,
                    regx: /^[^\s].*/
                },
                Quantity: {
                    required: true,
                    regx: /^[^\s].*/
                }
            },
            messages: {
                Position: {
                    required: caption.PR_DETAIL_POSITION_MSG_NOT_EMPTY,
                    regx: 'Không nhập khoảng trắng'
                },
                Quantity: {
                    required: caption.PR_DETAIL_QUANTITY_MSG_NOT_EMPTY,
                    regx: 'Không nhập khoảng trắng'
                }
            }
        }

        $rootScope.validationAttributeOptions = {
            rules: {
                Value: {
                    required: true,
                    regx: /^[^\s].*/
                }
            },
            messages: {
                Value: {
                    required: caption.PR_DETAIL_EXTEND_VALUE_MSG_NOT_EMPTY,
                    regx: 'Không nhập khoảng trắng'
                }
            }
        };
        $rootScope.IsTranslate = true;
    });
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/PlanRecruitment/Translation');
    caption = $translateProvider.translations();

    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/add', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
        })
        .when('/edit', {
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit'
        })
        .when('/detail', {
            templateUrl: ctxfolder + '/detail.html',
            controller: 'detail'
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
        },
        highlight: function (element) {
            $(element).closest('.input-group').addClass('has-error');
        },
        unhighlight: function (element) {
            $(element).closest('.input-group').removeClass('has-error');
        },
        success: function (label) {
            label.closest('.input-group').removeClass('has-error');
        }
    });
});

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, $window, $filter, $location, myService) {
    var vm = $scope;
    $scope.model = {
        PlanNumber: '',
        PlanType: '',
        DepartmentCode: '',
        FromDate: '',
        ToDate: ''
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';

    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/PlanRecruitment/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.PlanNumber = $scope.model.PlanNumber;
                d.PlanType = $scope.model.PlanType;
                d.DepartmentCode = $scope.model.DepartmentCode;
                d.FromDate = $scope.model.Fromdate;
                d.ToDate = $scope.model.Todate;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(500, '#tblDataAssetTransfer');
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
                    var Id = data.Id;
                    $scope.edit(Id);
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PlanNumber').withTitle('{{"PR_PLAN_NUMBER_TITLE" | translate}}').renderWith(function (data, type, full, meta) {
        return '<span class="bold"> ' + data + ' - ' + full.Title + '</span>';
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('PlanType').withTitle('{{"Loại kế hoạch" | translate}}').renderWith(function (data, type, full, meta) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('DepartmentName').withTitle('{{"Phòng ban" | translate}}').renderWith(function (data, type, full, meta) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UserCreated').withTitle('{{"PR_CREATED_BY" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PlanDate').withTitle('{{"PR_CRETED_TIME" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Action').notSortable().withOption('sClass', 'nowrap dataTable-w80').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full, meta) {
        return '<span ng-click="edit(' + full.Id + ')" /*style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);"*/ class="fs25"><i class="fas fa-edit" style="margin-right: 10px;color:#337ab7"></i></span>' +
            '<span title="Xoá" ng-click="delete(' + full.Id + ')" /*style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45);"*/ class="fs25"><i class="fas fa-trash" style="color:#337ab7;--fa-primary-color: red;"></i></span>';
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
                selectedItems[Id] = selectAll;
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
    $rootScope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.search = function () {
        reloadData(true);
    }

    $scope.initData = function () {
    };

    $scope.initData();

    $scope.add = function (p) {
        $scope.model.page = "add";

        myService.setData(data = $scope.model);

        $location.path('/add');
        setTimeout(function () {
            $('.cancel').removeClass('dis');
            $('.save').removeClass('dis');
            $('.detail').addClass('dis');
            $('.add').addClass('dis');
            $('.edit').addClass('dis');
        }, 200);
    }
    $scope.edit = function (id) {
        dataservice.getItemHeader(id, function (rs) {
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
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.delete(id, function (rs) {
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
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }

    function loadDate() {
        var now = new Date();
        $("#fromdate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
            startDate: '01/01/2010',
            endDate: now,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#todate').datepicker('setStartDate', maxDate);

        });
        $("#todate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
            startDate: '#fromdate',
            endDate: now,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#fromdate').datepicker('setEndDate', maxDate);
        });
    }
    setTimeout(function () {
        loadDate();
    }, 200);
});

app.controller('add', function ($scope, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $filter, $uibModal, dataservice, $location, myService) {
    $scope.model = {
        DepartmentCode: '',
    };

    $rootScope.PlanNumber = '';
    $rootScope.isShow = '';
    $scope.isAdd = '';
    $scope.profileDetailTab = true;
    //wflow
    $scope.modelWf = {
        WorkflowCode: "",
        ObjectType: "PLAN_RECRUITMENT",
        ObjectInst: "",
    };

    $scope.isShowHeader = true;
    $rootScope.roleEdit = true;
    $scope.check = true;
    $scope.addtab = true;
    $scope.edittab = false;
    $scope.isSave = false;

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
            $('.detail').removeClass('dis');
        }
        else {
            $rootScope.roleEdit = false;
            $('.detail').addClass('dis');
        }

        if (data.data != undefined && data.data != "" && data.data != null) {
            $scope.model = data.data;
            if (data.page == "add") {
                $rootScope.roleEdit = true;
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

                $rootScope.PlanNumber = $scope.model.PlanNumber;
            }
            if ($scope.model.StatusLog != undefined && $scope.model.StatusLog != null && $scope.model.StatusLog != '') {
                var json = JSON.parse($scope.model.StatusLog);
                var arr = [];

                arr.push(json[json.length - 1]);
                $scope.loghis = arr;
            }
        }
    } else {
        $location.path("/");
    }

    $scope.initData = function () {
        dataservice.getWorkFlow(function (result) {
            result = result.data;
            $rootScope.lstWorkflow = result;
        });
        if ($scope.check == true) {
            dataservice.getStatusAct(function (rs) {
                rs = rs.data;
                $scope.lstStatusAct = rs;
            })
        }
        dataservice.getDepartment(function (rs) {
            rs = rs.data;
            $scope.lstDepartment = rs;
        });
    }
    $scope.initData();

    $scope.cancel = function () {
        $location.path("/");
    }

    $scope.add = function () {
        $scope.model = {};
        $scope.initData();
        $scope.lstStep = "";
        $scope.isSave = false;
        $('.add').addClass('dis');
        $('.edit').addClass('dis');
        $('.detail').addClass('dis');
        $('.cancel').removeClass('dis');
        $('.save').removeClass('dis');
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
        dataservice.getItemHeaderWithCode($scope.model.PlanNumber, function (rs) {
            data = rs.data;
            $scope.lstStep = data.list;
            if (data.editrole != undefined && data.editrole != "" && data.editrole != null && data.editrole == true) {
                $('.detail').removeClass('dis');
                $rootScope.roleEdit = true;
            }
            else {
                $rootScope.roleEdit = false;
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
                    }, 50);
                }
            }, 50);
        })
    }

    $scope.addHeader = function () {
        if ($scope.model.Status != "INITIAL_BEGIN") {
            App.toastrError("Kế hoạch chưa được khởi tạo");
        }
        else {
            validationSelect($scope.model);
            if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
                //Create WF for decesion
                $scope.modelWf.ObjectInst = $scope.model.PlanNumber;
                $scope.modelWf.WorkflowCode = $scope.model.WorkflowCat;
                dataservice.createWfInstance($scope.modelWf, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        var wfInstCode = rs.Object.WfInstCode;
                        $scope.WfInstCode = wfInstCode;
                        dataservice.insertInstRunning(wfInstCode, $scope.modelWf.WorkflowCode, function (rs) {

                        });

                        dataservice.insert($scope.model, function (rs) {
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

                                $scope.isSave = true;
                                $rootScope.PlanNumber = $scope.model.PlanNumber;

                                dataservice.getActionStatus($scope.model.PlanNumber, function (rs) {
                                    rs = rs.data;
                                    var json = JSON.parse(rs[0].StatusLog);

                                    var arr = [];

                                    arr.push(json[json.length - 1]);
                                    $scope.loghis = arr;
                                });

                                dataservice.getItemHeaderWithCode($scope.model.PlanNumber, function (rs) {
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
                                            }, 200);
                                        }
                                    }, 200);
                                });
                            }
                        });
                    }
                })
            }
        }
    }
    $scope.editHeader = function () {
        if ($rootScope.roleEdit == true) {
            validationSelect($scope.model);
            if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
                dataservice.update($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        if ($scope.model.Status != "FINAL_DONE") {
                            $scope.showAct = false;

                            $('.add').removeClass('dis');
                            $('.edit').removeClass('dis');
                            $('.detail').removeClass('dis');
                            $('.cancel').addClass('dis');
                            $('.save').addClass('dis');

                            $scope.isSave = true;
                            dataservice.getActionStatus($scope.model.PlanNumber, function (rs) {
                                rs = rs.data;
                                var json = JSON.parse(rs[0].StatusLog);

                                var arr = [];

                                arr.push(json[json.length - 1]);
                                $scope.loghis = arr;
                            });

                            dataservice.getItemHeaderWithCode($scope.model.PlanNumber, function (rs) {
                                data = rs.data;
                                $scope.lstStep = data.list;
                                if (data.editrole != undefined && data.editrole != "" && data.editrole != null && data.editrole == true) {
                                    $('.detail').removeClass('dis');
                                }
                                else {
                                    $rootScope.roleEdit = false;
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
                            });
                        } else {
                            dataservice.getActionStatus($scope.model.PlanNumber, function (rs) {
                                rs = rs.data;
                                var json = JSON.parse(rs[0].StatusLog);
                                var arr = [];
                                arr.push(json[json.length - 1]);
                                $scope.loghis = arr;
                            });
                        }

                        App.toastrSuccess(rs.Title);
                    }
                });
            }
        } else {
            App.toastrError("Bạn không có quyền sửa kế hoạch !");
        }
    }

    $scope.changeStatus = function () {
        if ($scope.model.Status != "" && $scope.model.Status != null)
            $scope.errorStatus = false;

        if ($scope.model.Status == "REPEAT_REQUIRE_REWORK" || $scope.model.Status == "FINAL_REQUIRE_REWORK") {
            dataservice.getListRepeat($scope.model.PlanNumber, function (rs) {
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

            dataservice.getStepWorkFlow($scope.model.WorkflowCat, function (rs) {
                data = rs.data;
                $scope.lstStep = data.list;
                setTimeout(function () {
                    $('#progressbar li').css('width', 'calc(100%/' + data.list.length + ')');
                }, 10);
            })
        }

        if (SelectType == "PlanType" && $scope.model.PlanType != "" && $scope.model.PlanType != null) {
            $scope.errorPlanType = false;
        }

        if (SelectType == "DepartmentCode" && $scope.model.DepartmentCode != "" && $scope.model.DepartmentCode != null) {
            $scope.errorDepartmentCode = false;
        }
    }

    $scope.showLog = function () {
        dataservice.getJsonData($scope.model.PlanNumber, function (rs) {
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

    $scope.exportExcel = function () {
        return App.toastrError('Chức năng đang xây dựng !');

        if ($scope.model.PlanNumber === '' || $scope.model.PlanNumber === undefined || $scope.model.PlanNumber === null) {
            App.toastrError('Vui lòng nhập số kế hoạch !');
            return;
        }

        if ($rootScope.countDetail > 0) {
            App.blockUI({
                target: "#contentMain",
                boxed: true,
                message: 'loading...'
            });

            dataservice.exportExcel($scope.model.PlanNumber, function (rs) {
                rs = rs.data;
                App.unblockUI("#contentMain");
                download(rs.fileName, '/' + rs.pathFile);
            });
        } else {
            App.toastrError('Chi tiết kế hoạch trống');
        }
    };

    function download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', text);
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.WorkflowCat == undefined || data.WorkflowCat == null || data.WorkflowCat == "") {
            $scope.errorWorkflowCat = true;
            mess.Status = true;
        } else {
            $scope.errorWorkflowCat = false;
        }

        if (data.Status == undefined || data.Status == null || data.Status == "") {
            $scope.errorStatus = true;
            mess.Status = true;
        } else {
            $scope.errorStatus = false;
        }

        return mess;
    };
    function loadDate() {
        $("#planDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
            todayBtn: true,
            todayHighlight: true
        }).on('changeDate', function () {
            if ($('#planDate').valid()) {
                $('#planDate').removeClass('invalid').addClass('success');
            }
        });
    }
    setTimeout(function () {
        loadDate();
    }, 50);
});

app.controller('detail', function ($scope, $rootScope, $filter, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModal, dataservice) {
    var vm = $scope;
    $scope.model = {};
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    $rootScope.listProduct = [];
    $rootScope.textSearch = "";
    $rootScope.page = 1;
    $rootScope.pageSize = 10;

    $scope.isEditDetail = false;

    $scope.listGender = [ { Code: '1', Name: 'Nam' }, { Code: '2', Name: 'Nữ' }]

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/PlanRecruitment/JTableDetail",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.PlanNumber = $rootScope.PlanNumber;
            },
            complete: function (e) {
                if (e.responseJSON != undefined && e.responseJSON != null && e.responseJSON != '') {
                    $rootScope.countDetail = e.responseJSON.recordsTotal;
                } else {
                    $rootScope.countDetail = 0;
                }

                App.unblockUI("#contentMain");
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
        });

    vm.dtColumns = [];

    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Position').withOption('sClass', 'text-center').withTitle('{{"PR_DETAIL_POSITION" | translate}}').renderWith(function (data, type, full, meta) {
        return '<span class="text-green bold">' + data + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withOption('sClass', 'text-center').withTitle('{{"PR_DETAIL_QUANTITY" | translate}}').renderWith(function (data, type, full, meta) {
        if (data != null)
            return '<span class="text-primary bold">' + data + ' ứng viên' + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Age').withOption('sClass', 'text-center').withTitle('{{"PR_DETAIL_AGE" | translate}}').renderWith(function (data, type, full, meta) {
        if (data != '')
            return data + ' tuổi';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Gender').withOption('sClass', 'text-center').withTitle('{{"PR_DETAIL_GENDER" | translate}}').renderWith(function (data, type, full, meta) {
        if (data == "0") {
            return 'Nam hoặc nữ';
        }
        if (data == "1") {
            return '<i class="fas fa-male"></i>';
        }
        if (data == "2") {
            return '<i class="fas fa-female" style="color: #f1204fcf;"></i>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LevelName').withTitle('{{"PR_DETAIL_LEVEL" | translate}}').renderWith(function (data, type, full, meta) {
        return '<span class="text-green bold">' + data + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SpecializeName').withOption('sClass', 'text-center').withTitle('{{"PR_DETAIL_SPECIALIZE" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Tier').withOption('sClass', 'text-center').withTitle('{{"PR_DETAIL_TIER" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('YearOfExperience').withOption('sClass', 'text-center').withTitle('{{"PR_DETAIL_YEAR_OF_EXPERIENCE" | translate}}').renderWith(function (data, type, full, meta) {
        if (data != null)
            return data + ' năm';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Local').withOption('sClass', 'text-center').withTitle('{{"PR_DETAIL_LOCAL" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Action').withOption('sClass', 'nowrap dataTable-w80').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full, meta) {
        return '<button ng-click="edit(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45);" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
                selectedItems[Id] = selectAll;
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

    $scope.initData = function () {
        dataservice.getListPayCertificate(function (rs) {
            rs = rs.data;
            $scope.listLevel = rs;
        });
        dataservice.getListPayMajor(function (rs) {
            rs = rs.data;
            $scope.listSpecialize = rs;
        });
    }

    $scope.initData();

    $scope.changeSelect = function (SelectType) {
        if (SelectType == "Gender" && $scope.model.Gender != "" && $scope.model.Gender != null) {
            $scope.errorGender = false;
        }
        else {
            $scope.errorGender = true;
        }
    }

    $scope.cancel = function () {
        $scope.isEditDetail = false;
        $scope.model = {};
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
        $scope.model.Id = data.Id;
        $scope.model.Position = data.Position;
        $scope.model.Age = data.Age;
        $scope.model.Gender = data.Gender;
        $scope.model.Level = data.Level;
        $scope.model.Specialize = data.Specialize;
        $scope.model.Tier = data.Tier;
        $scope.model.Quantity = data.Quantity != '' ? parseInt(data.Quantity) : '';
        $scope.model.YearOfExperience = data.Quantity != '' ? parseInt(data.YearOfExperience) : '';
        $scope.model.Local = data.Local;
        $scope.isEditDetail = true;
    }

    $scope.save = function () {
        $scope.model.PlanNumber = $rootScope.PlanNumber;

        if ($scope.model.PlanNumber === '' || $scope.model.PlanNumber === undefined || $scope.model.PlanNumber === null) {
            return App.toastrError(caption.PR_MSG_ADD_HEADER_BEFOR_ADD_DETAIL);
        }
   
        if ($scope.detailform.validate() && !validationSelect($scope.model).Status) {
            dataservice.insertDetail($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $scope.model = {};
                    $scope.isEditDetail = false;
                    $scope.reloadNoResetPage();
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
                    dataservice.deleteDetail(id, function (rs) {
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
        if (data.Position == "" || data.Position == undefined || data.Position == null) {
            $scope.errorPosition = true;
            mess.Status = true;
        } else {
            $scope.errorPosition = false;
        }
        if (data.Gender == "" || data.Gender == undefined || data.Gender == null) {
            $scope.errorGender = true;
            mess.Status = true;
        } else {
            $scope.errorGender = false;
        }
        if (data.Age != "" && data.Age != undefined && data.Age != null && data.Age < 0) {
            mess.Status = true;
            App.toastrError(caption.PR_MSG_ADD_AGE);
        }
        if (data.YearOfExperience != "" && data.YearOfExperience != undefined && data.YearOfExperience != null && data.YearOfExperience < 0) {
            mess.Status = true;
            App.toastrError(caption.PR_MSG_ADD_EAR_OF_EXPERIENCE);
        } 
        return mess;
    };

    function loadDate() {
        var now = new Date();
        $("#EndDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
            startDate: now,

        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#NextEndDate').datepicker('setStartDate', maxDate);

        });
        $("#NextEndDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
            startDate: '#EndDate',

        }).on('changeDate', function (selected) {
        });
    }

    setTimeout(function () {
        loadDate();
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('tabAttribute', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {};
    $scope.listProductAttributeMain = [];
    $scope.listProductAttributeChildren = [];
    $scope.listValues = [];

    $rootScope.isEditAttribute = false;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/PlanRecruitment/JTableAttributeMore",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.PlanNumber = $rootScope.PlanNumber;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(200, "#tblDataAttribute");
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('AttrCode').withTitle('{{"PR_DETAIL_EXTEND_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AttrName').withTitle('{{"PR_DETAIL_EXTEND_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AttrValue').withTitle('{{"PR_DETAIL_EXTEND_VALUE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Unit').withTitle('{{"PR_DETAIL_EXTEND_UNIT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Group').withTitle('{{"PR_DETAIL_EXTEND_GROUP" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DataType').withTitle('{{"PR_DETAIL_EXTEND_DATA_TYPE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Parent').withTitle('{{"PR_DETAIL_EXTEND_PARENT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').withOption('sClass', 'nowrap dataTable-w80').renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $rootScope.reloadAttribute = function () {
        $scope.reload();
    }

    $scope.init = function () {
        dataservice.getListProductAttributeMain(function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.listProductAttributeMain = rs.Object;
            }
        })
    };

    $scope.init();

    $rootScope.initAttr = function () {
        $scope.init();
    };

    $scope.selectAttributeMain = function (code) {
        $scope.errorAttrCode = false;
        $scope.listValues = [];
        $scope.model.ProductAttributeChildren = '';
        dataservice.getListProductAttributeChildren(code, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.listProductAttributeChildren = rs.Object;
            }
        })
    }

    $scope.selectAttributeChildren = function (item) {
        var obj = { code: item.Code, name: item.Name };
        var checkExits = $scope.listValues.filter(k => k.name === item.Name);
        if (checkExits.length === 0) {
            $scope.listValues.push(obj);
        }
    };

    $scope.removeValues = function (index) {
        if ($scope.listValues[index].code == $scope.model.ProductAttributeChildren)
            $scope.model.ProductAttributeChildren = '';

        $scope.listValues.splice(index, 1);
        if ($scope.listValues.length == 0)
            $scope.model.ProductAttributeChildren = '';
    }

    $scope.addAttributeMain = function () {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderProductAttributeMain + '/add.html',
            controller: 'addProductAttribute',
            size: '40',
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }

    $scope.add = function () {
        validationSelect($scope.model);
        if ($scope.attrform.validate() && validationSelect($scope.model).Status == false) {
            $scope.model.PlanNumber = $rootScope.PlanNumber;
            dataservice.insertAttributeMore($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $rootScope.reloadAttribute();
                    $uibModalInstance.close(rs.Object);
                }
            })
        }
    };

    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.AttrCode === "" || data.AttrCode === null || data.AttrCode === undefined) {
            $scope.errorAttrCode = true;
            mess.Status = true;
        } else {
            $scope.errorAttrCode = false;
        }
        return mess;
    };

    $scope.edit = function (id) {
        dataservice.getDetailAttributeMore(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model = rs.Object;
                $rootScope.isEditAttribute = true;
            }
        })
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.attrform.validate() && validationSelect($scope.model).Status == false) {
            $scope.model.ProductCode = $rootScope.ProductCode;
            dataservice.updateAttributeMore($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $rootScope.isEditAttribute = false;
                    $rootScope.reloadAttribute();
                    $uibModalInstance.close(rs.Object);
                }
            })
        }
    }
    $scope.cancel = function () {
        $rootScope.isEditAttribute = false;
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;//"Bạn có chắc chắn muốn xóa?";
                $scope.ok = function () {
                    dataservice.deleteAttributeMore(id, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $rootScope.reloadAttribute();
                            $rootScope.isEditAttribute = false;
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

app.controller('showLog', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataservice, $timeout, para) {
    var data = JSON.parse(para);
    //var data = para;
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
