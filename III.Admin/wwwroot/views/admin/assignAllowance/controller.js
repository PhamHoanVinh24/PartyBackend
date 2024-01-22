var ctxfolder = "/views/admin/assignAllowance";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ngTagsInput', 'dynamicNumber'])
var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ngTagsInput', 'dynamicNumber'])
    .directive('customOnChange', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var onChangeHandler = scope.$eval(attrs.customOnChange);
                element.on('change', onChangeHandler);
                element.on('$destroy', function () {
                    element.off();
                });

            }
        };
    })
    .directive('fileDropzone', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var onChangeHandler = scope.$eval(attrs.customOnChange);
                element.on('change', onChangeHandler);
                element.on('$destroy', function () {
                    element.off();
                });

            }
        };
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
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    var submitFormUpload = function (url, data, callback) {
        var formData = new FormData();
        formData.append("FileUpload", data.FileUpload);
        formData.append("FileCode", data.FileCode);
        formData.append("FileName", data.FileName);
        formData.append("FileType", data.FileType);
        formData.append("CateRepoSettingId", data.CateRepoSettingId);
        formData.append("Tags", data.Tags);
        formData.append("Desc", data.Desc);
        formData.append("ReposCode", data.ReposCode);
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
            data: formData
        }
        $http(req).then(callback);
    };
    var submitFormUploadNew = function (url, data, callback) {
        var formData = new FormData();
        formData.append("CateRepoSettingId", data.CateRepoSettingId);
        formData.append("FileUpload", data.FileUpload);
        formData.append("FileName", data.FileName);
        formData.append("Desc", data.Desc);
        formData.append("Tags", data.Tags);
        formData.append("NumberDocument", data.NumberDocument);
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
            data: formData
        }
        $http(req).then(callback);
    };
    return {
        getTreeCategory: function (callback) {
            $http.post('/Admin/AssignAllowance/GetTreeCategory').then(callback);
        },
        getEmployee: function (data, data1, callback) {
            $http.get('/Admin/AssignAllowance/GetEmployee?Department=' + data + '&&Type=' + data1).then(callback);
        },
        getListAllowance: function (callback) {
            $http.post('/Admin/AssignAllowance/GetListAllowance').then(callback);
        },
        getListParam: function (callback) {
            $http.post('/Admin/AssignAllowance/GetListParam').then(callback);
        },
        setting: function (data, callback) {
            $http.post('/Admin/AssignAllowance/Setting', data).then(callback);
        },
        insertSettingParam: function (data, callback) {
            $http.post('/Admin/AssignAllowance/InsertSettingParam', data).then(callback);
        },
        updateSettingParam: function (data, callback) {
            $http.post('/Admin/AssignAllowance/UpdateSettingParam', data).then(callback);
        },
        deleteSettingParam: function (data, callback) {
            $http.post('/Admin/AssignAllowance/DeleteSettingParam/' + data).then(callback);
        },
    };
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $filter, $location, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        });
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9_äöüÄÖÜ]*$/;
            var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.ReposCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.EDMSR_VALIDATE_REPOS_CODE, "<br/>");
            }
            return mess;
        };

        $rootScope.validationOptions = {
            rules: {
                Month: {
                    required: true,
                },
                Value: {
                    required: true,
                    regx: /^[+]?\d+(\.\d+)?$/,
                    maxlength: 20
                },
            },
            messages: {
                Month: {
                    required: caption.AAC_VALIDATE_MONTH_REQUIRE,
                },
                Value: {
                    required: caption.AAC_VALIDATE_VALUE_REQUIRE,
                    regx: caption.AAC_REGX_PLS_ENTER_POSITIVE_NUMBER,
                    maxlength: 'Giá trị nhỏ hơn 20 kí tự'
                },
            }
        };

        $rootScope.listTypeEmp = [
            {
                Code: "EMPLOYEE_STYLE20200323141524",
                Value: caption.AAC_CHK_MAIN_EMPLOYEE,
                IsCheck: false
            },
            {
                Code: "EMPLOYEE_STYLE20200222160915",
                Value: caption.AAC_CHK_FULLTIME,
                IsCheck: false
            },
            {
                Code: "EMPLOYEE_STYLE20200312120123",
                Value: caption.AAC_CHK_INTERNSHIP,
                IsCheck: false
            }
        ];
    });
});
app.config(function ($routeProvider, $validatorProvider, $httpProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/AssignAllowance/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        });
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
});
app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $window) {
    $scope.listEmployee = [];
    $scope.listDepartment = [];
    $scope.listDepartmentChoose = [];
    $scope.listTypeChoose = [];
    $scope.Department = "";
    $scope.Type = "";

    $scope.settingAllowance = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/settingAllowance.html',
            controller: 'settingAllowance',
            backdrop: 'static',
            size: '50',
            resolve: {
                para: function () {
                    return $scope.listEmployee;
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    };

    $scope.setting = function (item) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/setting.html',
            controller: 'setting',
            backdrop: 'static',
            size: '50',
            resolve: {
                para: function () {
                    return item;
                }
            }
        });
        modalInstance.result.then(function (d) {

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
    $scope.clickSelectOneDepartment = function (item, index) {
        if (item.IsChecked) {
            var i = $scope.listDepartmentChoose.indexOf(item.Code);
            if (i < 0) {
                $scope.listDepartmentChoose.push(item.Code);
            }

            $scope.Department = $scope.listDepartmentChoose.join();
        } else {
            var i = $scope.listDepartmentChoose.indexOf(item.Code);
            if (i >= 0) {
                $scope.listDepartmentChoose.splice(i, 1);
            }

            $scope.Department = $scope.listDepartmentChoose.join();

            if ($scope.listDepartmentChoose.length === 0)
                $scope.Department = "";
        }

        $scope.loadEmployee();
    };

    $scope.loadEmployee = function () {
        $scope.listTypeChoose = [];
        for (var i = 0; i < $scope.listTypeEmp.length; i++) {
            if ($scope.listTypeEmp[i].IsCheck) {
                $scope.listTypeChoose.push($scope.listTypeEmp[i].Code);
            }
        }

        $scope.Department = $scope.listDepartmentChoose.join();
        $scope.Type = $scope.listTypeChoose.join();

        if ($scope.Department === "" || $scope.Department === undefined || $scope.Department === null) {
            $scope.listEmployee = [];
        } else {
            dataservice.getEmployee($scope.Department, $scope.Type, function (rs) {
                rs = rs.data;
                $scope.listEmployee = rs;
            });
        }
    };

    $scope.check = function (item) {
        item.IsCheck = !item.IsCheck;
    };

    //treeview
    $scope.treeData = [];

    var nodeBefore = "";
    $scope.readyCB = function () {
        App.blockUI({
            target: "#contentMainRepository",
            boxed: true,
            message: 'loading...'
        });
        dataservice.getTreeCategory(function (result) {
            result = result.data;
            if (!result.Error) {
                var root = {
                    id: 'root',
                    parent: "#",
                    text: "Tất cả",
                    state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
                };
                $scope.treeData.push(root);
                var index = 0;
                $scope.ListParent = result.filter(function (item) {
                    return (item.ParentCode === '#');
                });
                for (var i = 0; i < result.length; i++) {
                    if (result[i].ParentCode === '#') {
                        var stt = $scope.ListParent.length - index;
                        if (stt.toString().length === 1) {
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
                            state: { selected: false, opened: true }
                        };
                        $scope.treeData.push(data);
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
                            state: { selected: false, opened: true }
                        };
                        $scope.treeData.push(data);
                    }
                }
                App.unblockUI("#contentMainRepository");
            }
        });
    };
    $scope.selectNodeRepository = function (e, data) {
        var listSelect = [];
        var idCurrentNode = data.node.id;
        if (nodeBefore !== idCurrentNode) {
            //$("#" + nodeBefore + "_anchor").removeClass('bold');

            nodeBefore = idCurrentNode;
            $scope.recentFile = false;
            var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
            for (var i = 0; i < listNoteSelect.length; i++) {
                listSelect.push(listNoteSelect[i].id);
            }
            $scope.listDepartmentChoose = listSelect;
            $scope.loadEmployee();
        }
        else {
            $scope.recentFile = false;
            listSelect = [];
            //$("#" + idCurrentNode + "_anchor").addClass('bold');
            listSelect.push(idCurrentNode);
            $scope.listDepartmentChoose = listSelect;
            $scope.loadEmployee();
        }
    };
    $scope.deselectNodeRepository = function (e, data) {
        $scope.recentFile = false;
        var listSelect = [];
        var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
        if (listNoteSelect.length > 0) {
            for (var i = 0; i < listNoteSelect.length; i++) {
                listSelect.push(listNoteSelect[i].id);
                $scope.listDepartmentChoose = listSelect;
                $scope.loadEmployee();
            }
        } else {
            $scope.listDepartmentChoose = listSelect;
            $scope.loadEmployee();
        }
    };

    $scope.treeConfig = {
        core: {
            multiple: true,
            animation: true,
            error: function (error) {
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
        plugins: ['checkbox', 'types', 'contextmenu'],
        checkbox: {
            "three_state": true,
            "whole_node": false,
            "keep_selected_style": false,
            "cascade": "undetermined",
        }
    };
    $scope.treeEvents = {
        'ready': $scope.readyCB,
        'select_node': $scope.selectNodeRepository,
        'deselect_node': $scope.deselectNodeRepository,
    };
    $scope.ac = function () {
        return true;
    };
});

app.controller('settingAllowance', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, dataservice, para) {
    $scope.listAllowance = [];
    $scope.listAllowanceChoose = [];
    $scope.listEmployeeChoose = [];
    $scope.listData = [];

    $scope.cancel = function () {
        $uibModalInstance.close();
    };

    $scope.init = function () {
        dataservice.getListAllowance(function (rs) {
            rs = rs.data;
            $scope.listAllowance = rs;
        });

        $scope.listEmployeeChoose = para.filter(function (e) {
            return e.IsCheck;
        });
    };
    $scope.init();

    $scope.check = function (item) {
        item.IsCheck = !item.IsCheck;
    };

    $scope.submit = function () {
        $scope.listAllowanceChoose = $scope.listAllowance.filter(function (e) {
            return e.IsCheck;
        });

        if ($scope.listAllowanceChoose.length === 0) {
            App.toastrError('Chưa chọn phụ cấp nào');
            return;
        }


        for (var i = 0; i < $scope.listAllowanceChoose.length; i++) {
            for (var j = 0; j < $scope.listEmployeeChoose.length; j++) {
                var obj = {
                    EmployeeCode: $scope.listEmployeeChoose[j].Code,
                    AllowanceCode: $scope.listAllowanceChoose[i].Code
                };

                $scope.listData.push(obj);
            }
        }

        dataservice.setting($scope.listData, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $uibModalInstance.close();
            }
        });
    };
});

app.controller('setting', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, dataservice, para) {
    var vm = $scope;
    $scope.model = {
        EmployeeId: '',
        Months: '',
        ParamCode: '',
        Value: ''
    };

    $scope.IsEdit = false;

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/AssignAllowance/JTableSettingParam",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.EmployeeId = $scope.model.EmployeeId;
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.Id;
                    $scope.edit(Id);
                }
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("ID").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.ID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EmployeeName').withTitle('{{"AAC_LBL_STAFF" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Month').withTitle('{{"AAC_LBL_MONTH" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ParamName').withTitle('{{"AAC_LBL_PARAMETERS" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Value').withTitle('{{"AAC_LBL_VALUE" | translate}}').renderWith(function (data, type) {
        if ((data + '').indexOf('.') < 0) {
            return '<span class="text-danger">' + formatNumber(data) + '</span>';
        } else {
            return '<span class="text-danger">' + formatNumber(data) + '</span>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withOption('sClass', 'nowrap dataTable-w80').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<span title="Sửa" ng-click="edit(' + full.ID + ')" /*style = "width: 25px; height: 25px; padding: 0px"*/ class="fs20"><i class="fas fa-edit" style="color: #337ab7; margin-right:10px"></i></span>' +
            '<span title="Xoá" ng-click="delete(' + full.ID + ')" /*style="width: 25px; height: 25px; padding: 0px"*/ class="fs20"><i class="fas fa-trash" style="color: #337ab7"></i></span>';
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
    };

    $scope.cancel = function () {
        $uibModalInstance.close();
    };

    $scope.init = function () {
        $scope.model.EmployeeId = para.ID;
        dataservice.getListParam(function (rs) {
            rs = rs.data;
            $scope.listParam = rs;
        });
    };
    $scope.init();

    $scope.add = function () {
        validationSelect($scope.model);
        if ($scope.settingform.validate() && !validationSelect($scope.model).Status) {
            dataservice.insertSettingParam($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reload();
                }
            });
        }
    };

    $scope.edit = function (id) {
        var userModel = {};
        var listdata = $('#tblData').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].ID === (id + '')) {
                userModel = listdata[i];
                break;
            }
        }

        $scope.model = {
            ID: userModel.ID,
            EmployeeId: userModel.EmployeeId,
            Months: userModel.Month,
            ParamCode: userModel.ParamCode,
            Value: userModel.Value,
        };

        $scope.IsEdit = true;
    };

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deleteSettingParam(id, function (rs) {
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

    $scope.save = function () {
        validationSelect($scope.model);
        if ($scope.settingform.validate() && !validationSelect($scope.model).Status) {
            dataservice.updateSettingParam($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reload();
                }
            });
        }
    };

    $scope.cancelSave = function () {
        $scope.IsEdit = false;
    };

    $scope.changleSelect = function (SelectType) {
        if (SelectType === "ParamCode" && $scope.model.ParamCode !== "") {
            $scope.errorParamCode = false;
        }
    };

    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.ParamCode === "" || data.ParamCode === undefined || data.ParamCode === null) {
            $scope.errorParamCode = true;
            mess.Status = true;
        } else {
            $scope.errorParamCode = false;
        }

        return mess;
    };

    function formatNumber(n) {
        // format number 1000000 to 1,234,567
        return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }

    function loadDate() {
        $("#Month").datepicker({
            inline: false,
            autoclose: true,
            format: "mm/yyyy",
            fontAwesome: true,
            todayHighlight: true,
            viewMode: "months",
            minViewMode: "months"
        }).on('changeDate', function (selected) {
            if ($('#Month').valid()) {
                $('#Month').removeClass('invalid').addClass('success');
            }
        });
    }
    setTimeout(function () {
        loadDate();
    }, 200);
});
