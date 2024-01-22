var ctxfolder = "/views/admin/settingStatusObject";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "pascalprecht.translate", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", 'dynamicNumber', 'monospaced.qrcode']).
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
        insertGroupStatus: function (data, callback) {
            $http.post('/Admin/SettingStatusObject/InsertGroupStatus', data).then(callback);
        },
        getGroupStatus: function (callback) {
            $http.get('/Admin/SettingStatusObject/GetGroupStatus').then(callback);
        },
        getStatus: function (callback) {
            $http.get('/Admin/SettingStatusObject/GetStatus').then(callback);
        },
        getStatusInGroup: function (data, callback) {
            $http.get('/Admin/SettingStatusObject/GetStatusInGroup?groupCode=' +data).then(callback);
        },
        updateStatusCode: function (data, callback) {
            $http.post('/Admin/SettingStatusObject/UpdateStatusCode', data).then(callback);
        },
        getObjTypeJC: function (callback) {
            $http.post('/Admin/SettingStatusObject/GetObjType').then(callback)
        },
        settingStatusObjectType: function (data, callback) {
            $http.post('/Admin/SettingStatusObject/SettingStatusObjectType', data).then(callback);
        },
        getSettingStatusObject: function (callback) {
            $http.get('/Admin/SettingStatusObject/GetSettingStatusObject').then(callback);
        }

    }
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);

    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture] ? caption[culture] : caption;
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        })
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^!@#$%^&*<>?\s]*$/;
            var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            var mess = { Status: false, Title: "" }
            //if (!partternName.test(data.Title)) {
            //    mess.Status = true;
            //    mess.Title += caption.ASSET_VALIDATE_ASSET_NAME.replace("{0}", caption.ASSET_CURD_LBL_ASSET_NAME)//"Yêu cầu tên tài sản có ít nhất một ký tự là chữ cái hoặc số và không bao gồm ký tự đặc biệt!"
            //}
            return mess;
        }

        $rootScope.validationOptions = {
            rules: {
                GroupCode: {
                    required: true,
                    maxlength: 255,
                    regx: /^[a-zA-Z0-9_äöüÄÖÜ]*$/
                },
                GroupName: {
                    required: true,
                    maxlength: 255,
                    regx: /^[^\s].*/
                }
            },
            messages: {
                GroupCode: {
                    required: "Mã bộ dữ liệu trạng thái không được bỏ trống",
                    maxlength: "Tối đa 255 ký tự",
                    regx: "Mã bộ dữ liệu trạng thái không chứa ký tự có dấu và ký tự đặc biệt"
                },
                GroupName: {
                    required: "Tên bộ dữ liệu trạng thái không được bỏ trống",
                    maxlength: "Tối đa 255 ký tự",
                    regx: "Tên bộ dữ liệu trạng thái không bắt đầu bằng khoảng trắng"
                }
            }
        }

        $rootScope.validationOptionsDetail = {
            rules: {
                StatusCode: {
                    required: true,
                    maxlength: 255,
                    regx: /^[a-zA-Z0-9_äöüÄÖÜ]*$/
                },
                StatusName: {
                    required: true,
                    maxlength: 255,
                    regx: /^[^\s].*/
                }
            },
            messages: {
                StatusCode: {
                    required: "Mã trạng thái không được bỏ trống",
                    maxlength: "Tối đa 255 ký tự",
                    regx: "Mã trạng thái không chứa ký tự có dấu và ký tự đặc biệt"
                },
                StatusName: {
                    required: "Tên trạng thái không được bỏ trống",
                    maxlength: "Tối đa 255 ký tự",
                    regx: "Tên trạng thái không bắt đầu bằng khoảng trắng"
                }
            }
        }
    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/SettingStatusObject/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/map', {
            templateUrl: ctxfolder + '/google-map.html',
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

app.controller('index', function ($scope, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModal, dataservice) {
    $scope.model = {
        ID: 0,
        ObjectTypeCode: "",
        StatusGroupCode: ""
    }

    $scope.initData = function () {
        dataservice.getObjTypeJC(function (rs) {
            rs = rs.data;
            $scope.lstObjectType = rs;
        })
        dataservice.getGroupStatus(function (rs) {
            rs = rs.data;
            $scope.listGroupStatus = rs;
        })
        dataservice.getSettingStatusObject(function (rs) {
            rs = rs.data;
            $scope.listSettingStatusObject = rs;
        })
    }

    $scope.initData();

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '50',
        });
        modalInstance.result.then(function (d) {
            dataservice.getGroupStatus(function (rs) {
                rs = rs.data;
                $scope.listGroupStatus = rs;
            })
        }, function () {
        });
    };

    $scope.save = function () {
        validationSelect($scope.model);
        if (!validationSelect($scope.model).Status) {
            dataservice.settingStatusObjectType($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title)
                }
                else {
                    App.toastrSuccess(rs.Title)
                    dataservice.getSettingStatusObject(function (rs) {
                        rs = rs.data;
                        $scope.listSettingStatusObject = rs;
                    })
                }
            })
        }
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        //Check null 
        if (data.ObjectTypeCode === "" || data.ObjectTypeCode === undefined || data.ObjectTypeCode === null) {
            $scope.errorObjectTypeCode = true;
            mess.Status = true;
        } else {
            $scope.errorObjectTypeCode = false;
        }

        if (data.StatusGroupCode === "" || data.StatusGroupCode === undefined || data.StatusGroupCode === null) {
            $scope.errorStatusGroupCode = true;
            mess.Status = true;
        } else {
            $scope.errorStatusGroupCode = false;
        }

        return mess;
    };

    $scope.changeSelect = function (SelectType) {
        if (SelectType == "ObjectTypeCode" && $scope.model.ObjectTypeCode != "") {
            $scope.errorObjectTypeCode = false;
        }

        if (SelectType == "StatusGroupCode" && $scope.model.StatusGroupCode != "") {
            $scope.errorStatusGroupCode = false;
        }
    }

    setTimeout(function () {

    }, 200);
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModalInstance, $uibModal, dataservice) {
    $scope.cancel = function () {
        $uibModalInstance.close();
    }

    $scope.model = {
        GroupCode: '',
        GroupName: '',
    }

    $scope.markGroup = "";

    $scope.listStatusGroup = [];

    $scope.initData = function () {
        dataservice.getGroupStatus(function (rs) {
            rs = rs.data;
            $scope.listStatusGroup = rs;
        })
        dataservice.getStatus(function (rs) {
            rs = rs.data;
            $scope.listStatus = rs;
        })
    }

    $scope.initData();

    $scope.submit = function () {
        if ($scope.addform.validate()) {
            dataservice.insertGroupStatus($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title)
                }
                else {
                    App.toastrSuccess(rs.Title);
                    reset();
                    dataservice.getGroupStatus(function (rs) {
                        rs = rs.data;
                        $scope.listStatusGroup = rs;
                    })
                }
            })
        }
    }

    $scope.getListStatusGroup = function (groupCode) {
        $scope.markGroup = groupCode;
        dataservice.getStatusInGroup(groupCode, function (rs) {
            rs = rs.data;
            $scope.listStatus = rs;
        })
    }

    $scope.selectStatus = function (item) {
        if ($scope.markGroup == "") {
            return;
        }
        debugger
        var data = {
            GroupCode: $scope.markGroup,
            Status: item
        }
        dataservice.updateStatusCode(data, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title)
            }
            else {
                App.toastrSuccess(rs.Title)
            }
        })
    }

    function reset() {
        $scope.model.GroupCode = "";
        $scope.model.GroupName = "";
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        setModalMaxHeight('.modal');
    }, 200);
});

app.controller('edit', function ($scope, $rootScope, $compile, $uibModalInstance, $uibModal, dataservice, para) {
    $scope.cancel = function () {
        $uibModalInstance.close();
    }

    $scope.model = {
        GroupCode: '',
        GroupName: '',
        GroupDesc: ''
    }
    $rootScope.isAdded = true;

    $scope.model = para;

    $scope.submit = function () {
        if ($scope.addform.validate()) {
            dataservice.updateStatusSet($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title)
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $rootScope.isAdded = true;
                    $rootScope.GroupCode = $scope.model.GroupCode;
                }
            })
        }
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        setModalMaxHeight('.modal');
    }, 200);
});

app.controller('statusDetail', function ($scope, $rootScope, $uibModal, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice) {
    $scope.model = {
        StatusCode: "",
        StatusName: "",
        StatusType: "",
        StatusGroup: ""
    }

    $scope.isEdited = false;

    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-change="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/StatusSet/JTableDetail",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.GroupCode = $rootScope.GroupCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
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
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);

            //$(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
            //    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
            //        $scope.selected[data.ID] = !$scope.selected[data.ID];
            //    } else {
            //        var self = $(this).parent();
            //        if ($(self).hasClass('selected')) {
            //            $(self).removeClass('selected');
            //            $scope.selected[data.ID] = false;
            //        } else {
            //            $('#tblData').DataTable().$('tr.selected').removeClass('selected');
            //            $scope.selected.forEach(function (obj, index) {
            //                if ($scope.selected[index])
            //                    $scope.selected[index] = false;
            //            });
            //            $(self).addClass('selected');
            //            $scope.selected[data.ID] = true;
            //        }
            //    }

            //    vm.selectAll = false;
            //    $scope.$apply();
            //});
            //$(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
            //    if (evt.target.localName === 'input' && evt.target.type === 'checkbox') {

            //    } else {
            //        var Id = data.ID;
            //        $scope.edit(Id);
            //    }
            //});
        });

    vm.dtColumns = [];

    vm.dtColumns.push(DTColumnBuilder.newColumn("ID").withTitle(titleHtml)
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.ID] = false;
            return '<label class="mt-checkbox hidden"><input type="checkbox" ng-model="selected[' + full.ID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ' hidden'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('StatusCode').withTitle('{{"Mã trạng thái" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('StatusName').withTitle('{{"Tên trạng thái" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('GroupName').withTitle('{{"Bộ trạng thái" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('StatusType').withTitle('{{"Loại trạng thái" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'w75').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button ng-click="edit(' + full.ID + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xóa" ng-click="delete(' + full.ID + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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

    $scope.initData = function () {
        dataservice.getTypeStatus(function (rs) {
            rs = rs.data;
            $scope.listTypeStatus = rs;
        })
    }

    $scope.initData();

    $scope.submit = function () {
        if (!$rootScope.isAdded) {
            return App.toastrError("Vui lòng thêm bộ trạng thái trước");
        }
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            $scope.model.StatusGroup = $rootScope.GroupCode;
            if (!$scope.isEdited) {
                dataservice.insertStatusDetail($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title)
                    }
                    else {
                        App.toastrSuccess(rs.Title)
                        $scope.reload();
                        reset();
                    }
                })
            }
            else {
                dataservice.updateStatusSetDetail($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title)
                    }
                    else {
                        App.toastrSuccess(rs.Title)
                        $scope.reload();
                        $scope.isEdited = false;
                        reset();
                    }
                })
            }
        }
    }

    $scope.delete = function (id) {
        dataservice.deleteStatusDetail(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.reload();
            }
        })
    }

    $scope.edit = function (id) {
        dataservice.getItemStatusSetDetail(id, function (rs) {
            rs = rs.data;
            $scope.model = rs;
            $scope.model.StatusGroup = $rootScope.GroupCode;
            $scope.isEdited = true;
        })
    }

    function reset() {
        $scope.model.StatusCode = "";
        $scope.model.StatusName = "";
        $scope.model.StatusType = "";
    }
    
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        //Check null 
        if (data.StatusType === "" || data.StatusType === undefined || data.StatusType === null) {
            $scope.errorStatusType = true;
            mess.Status = true;
        } else {
            $scope.errorStatusType = false;
        }

        return mess;
    };

    $scope.changeSelect = function (SelectType) {
        if (SelectType == "StatusType" && $scope.model.StatusType != "") {
            $scope.errorStatusType = false;
        }
    }
});
