var ctxfolderWorkFlow = "/views/admin/workflowactivityrole";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM_WORKFLOW', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber']).
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
app.factory('dataserviceWorkFlow', function ($http) {
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
        insertWorkFlow: function (data, callback) {
            $http.post('/Admin/WorkflowActivityRole/InsertWorkflowActRole', data).then(callback);
        },
        getItemWorkFlow: function (data, callback) {
            $http.post('/Admin/WorkflowActivityRole/GetItem?id=' + data).then(callback);
        },
        updateWorkFlow: function (data, callback) {
            $http.post('/Admin/WorkflowActivityRole/Update', data).then(callback);
        },
        deleteWorkFlow: function (data, callback) {
            $http.post('/Admin/WorkflowActivityRole/Delete?id=' + data).then(callback);
        },

        getWorkFlow: function (callback) {
            $http.post('/Admin/WorkflowActivityRole/GetWorkFlow').then(callback);
        },
        getRolesWorkFlow: function (callback) {
            $http.post('/Admin/WorkflowActivityRole/GetRoles').then(callback);
        },
        getDepartmentWorkFlow: function (callback) {
            $http.post('/Admin/WorkflowActivityRole/GetDepartment').then(callback);
        },
        getBranchWorkFlow: function (callback) {
            $http.post('/Admin/WorkflowActivityRole/GetBranch').then(callback);
        },
        getActivityWorkFlow: function (callback) {
            $http.post('/Admin/WorkflowActivityRole/GetActivity').then(callback);
        },

    }
});
app.controller('Ctrl_ESEIM_WORKFLOW', function ($scope, $rootScope, $compile, $uibModal, dataserviceWorkFlow, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
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
                ObjActCode: {
                    required: true,
                    maxlength: 100
                },
                Name: {
                    required: true,
                    maxlength: 100
                },
            },
            messages: {
                ObjActCode: {
                    required: caption.ACT_VALIDATE_ACTIVITY_CODE_NOT_NULL,
                    maxlength: caption.ACT_VALIDATE_ACTIVITY_CODE_SIZE
                },
                Name: {
                    required: caption.ACT_VALIDATE_ACTIVITY_NAME_NOT_NULL,
                    maxlength: caption.ACT_VALIDATE_ACTIVITY_NAME_SIZE
                },
            }
        }

        $rootScope.validationOptionsAct = {
            rules: {
                LimitTime: {
                    required: true,
                    maxlength: 100
                },
                UnitTime: {
                    required: true,
                    maxlength: 100
                },
                Priority: {
                    required: true,
                    maxlength: 100
                },
            },
            messages: {
                LimitTime: {
                    required: caption.ACT_VALIDATE_TIME_LIMIT,
                    maxlength: caption.ACT_VALIDATE_TIME_LIMIT_SIZE
                },
                UnitTime: {
                    required: caption.ACT_VALIDATE_UNIT,
                    maxlength: caption.ACT_VALIDATE_TIME_LIMIT_SIZE
                },
                Priority: {
                    required: caption.ACT_VALIDATE_PRIORITY_NOT_NULL,
                    maxlength: caption.ACT_VALIDATE_TIME_LIMIT_SIZE
                },
            }
        }
        $rootScope.IsAdd = false;
    });
    $rootScope.ObjActCode = '';
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/Activity/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderWorkFlow + '/index.html',
            controller: 'index'
        })
        .when('/map', {
            templateUrl: ctxfolderWorkFlow + '/google-map.html',
            controller: 'google-map'
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
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceWorkFlow, $filter) {
    $scope.model = {
        ObjActCode: '',
        Name: ''
    }
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/WorkflowActivityRole/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ObjActCode = $scope.model.ObjActCode;
                d.Name = $scope.model.Name;

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
    vm.dtColumns.push(DTColumnBuilder.newColumn('WorkFlowName').withTitle('{{"Luồng công việc" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ActName').withTitle('{{"Hoạt động" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BranchName').withTitle('{{"Chi nhánh" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DepartmentName').withTitle('{{"Phòng ban" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Role').withTitle('{{"Vai trò" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"ACT_COL_CATEGORY_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="edit(' + full.ID + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.ID + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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

    $rootScope.reloadActivity = function () {
        reloadData(false);
    }
    $scope.initLoad = function () {

    }
    $scope.initLoad();
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderWorkFlow + '/add.html',
            controller: 'add',
            backdrop: true,
            size: '55'
        });
        modalInstance.result.then(function (d) {
            $rootScope.reloadActivity();
        }, function () { });
    }

    $scope.edit = function (id) {
        dataserviceWorkFlow.getItemWorkFlow(id, function (rs) {
            rs = rs.data;
            $rootScope.ObjActCode = rs.Object.ObjActCode;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderWorkFlow + '/edit.html',
                controller: 'edit',
                backdrop: 'static',
                size: '55',
                resolve: {
                    para: function () {
                        return rs.Object;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                $rootScope.reloadActivity();
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
                    dataserviceWorkFlow.delete(para, function (rs) {
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
            $scope.reloadActivity();
        }, function () {
        });
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
    setTimeout(function () {
        loadDate();
    }, 200);
});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceWorkFlow, $filter, para) {
    $scope.model = {
        ActCode: '',
        Role: '',
        DepartCode: '',
        BranchCode: '',
        WorkFlowCode: ''
    }
    $scope.initLoad = function () {
        dataserviceWorkFlow.getWorkFlow(function (rs) {
            $scope.listWorkFlow = rs.data;
        });
        dataserviceWorkFlow.getRolesWorkFlow(function (rs) {
            $scope.listRoles = rs.data;
        });
        dataserviceWorkFlow.getDepartmentWorkFlow(function (rs) {
            $scope.listDepartment = rs.data;
        });
        dataserviceWorkFlow.getBranchWorkFlow(function (rs) {
            $scope.listBranch = rs.data;
        });
        dataserviceWorkFlow.getActivityWorkFlow(function (rs) {
            $scope.listAct = rs.data;
        });
        $scope.model.WorkFlowCode = para.WorkFlowCode;
        $scope.model.ActCode = para.ActCode;
    }
    $scope.initLoad();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.activity.validate() && !validationSelect($scope.model).Status) {
            
            dataserviceWorkFlow.insertWorkFlow($scope.model, function (result) {
                if (result.Error) {
                    App.toastrError(result.data.Title);
                } else {
                    App.toastrSuccess(result.data.Title);
                    $rootScope.reloadActivity();
                    $uibModalInstance.dismiss('cancel');
                }
            });
        }
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "WorkFlowCode" && $scope.model.WorkFlowCode != "") {
            $scope.errorWorkFlowCode = false;
        }
        if (SelectType == "ActCode" && $scope.model.ActCode != "") {
            $scope.errorActCode = false;
        }
        if (SelectType == "BranchCode" && $scope.model.BranchCode != "") {
            $scope.errorBranchCode = false;
        }
        if (SelectType == "DepartCode" && $scope.model.DepartCode != "") {
            $scope.errorDepartCode = false;
        }
        if (SelectType == "Role" && $scope.model.Role != "") {
            $scope.errorRole = false;
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
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 
        if (data.WorkFlowCode == "") {
            $scope.errorWorkFlowCode = true;
            mess.Status = true;
        } else {
            $scope.errorWorkFlowCode = false;
        }

        if (data.ActCode == "") {
            $scope.errorActCode = true;
            mess.Status = true;
        } else {
            $scope.errorActCode = false;
        }

        if (data.BranchCode == "") {
            $scope.errorBranchCode = true;
            mess.Status = true;
        } else {
            $scope.errorBranchCode = false;
        }

        if (data.DepartCode == "") {
            $scope.errorDepartCode = true;
            mess.Status = true;
        } else {
            $scope.errorDepartCode = false;
        }
        
        if (data.Role == "") {
            $scope.errorRole = true;
            mess.Status = true;
        } else {
            $scope.errorRole = false;
        }


        return mess;
    };
    setTimeout(function () {
        initDateTime();
        setModalDraggable('.modal-dialog');
        setModalMaxHeight('.modal');
    }, 200);
});