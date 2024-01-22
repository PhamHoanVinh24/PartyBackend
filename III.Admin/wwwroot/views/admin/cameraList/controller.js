var ctxfolder = "/views/admin/cameraList";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
app.factory('dataservice', function ($http) {
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
        getDepartment: function (callback) {
            $http.post('/Admin/CameraList/GetDepartment').then(callback);
        },
        getProduct: function (data, data1, data2, callback) {

            $http.post('/Admin/CameraList/GetListProduct?page=' + data + '&pageSize=' + data1 + '&productname=' + data2).then(callback);
        },
        getDepartById: function (data, callback) {
            $http.post('/Admin/CameraList/GetDepartById?id=' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/CameraList/GetItem?id=' + data).then(callback);
        },
        insert: function (data, callback) {
            submitFormUpload('/Admin/CameraList/Insert', data, callback);
        },
        update: function (data, callback) {
            submitFormUpload('/Admin/CameraList/Update', data, callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/CameraList/Delete?id=' + data).then(callback);
        }
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
                RoomId: {
                    required: true
                },
                RoomName: {
                    required: true
                },
                CameraQuantity: {
                    required: true
                },
                CameraAvailable: {
                    required: true
                },
                Note: {
                    required: true
                },
                LoginInformation: {
                    required: true
                },
                Series: {
                    required: true
                },
                Capacity: {
                    required: true
                }
            },
            messages: {
                RoomId: {
                    required: caption.ROOMID_VALIDATE,
                },
                RoomName: {
                    required: caption.ROOMNAME_VALIDATE,
                },
                CameraQuantity: {
                    required: caption.CameraQuantity_VALIDATE,
                },
                CameraAvailable: {
                    required: caption.CameraAvailable_VALIDATE,
                },
                Note: {
                    required: caption.Note_VALIDATE,
                },
                LoginInformation: {
                    required: caption.LoginInformation_VALIDATE,
                },
                Series: {
                    required: caption.Series_VALIDATE,
                },
                Capacity: {
                    required: caption.Capacity_VALIDATE,
                }

            }
        }
        $rootScope.IsTranslate = true;
    });
    dataservice.getDepartment(function (rs) {
        rs = rs.data;
        $rootScope.Departmentdata = rs;
    });
    $rootScope.status = [{Code:1, Name: 'Có' }, {Code:2, Name: 'Không' }];
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/CameraList/Translation');
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
        }
    });

});

app.controller('index', function ($scope, $rootScope, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.model = {

        DepartmentCode: '',
        DiskStatus: '',
        RoomName: '',
        Reason: ''
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.liFunction = [];
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/CameraList/jtable",
            beforeSend: function (jqXHR, settings) {
                resetCheckbox();
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {

                d.RoomName = $scope.model.RoomName;
                d.DepartmentCode = $scope.model.DepartmentCode;
                d.DiskStatus = $scope.model.DiskStatus;
                d.Reason = $scope.model.Reason;
            },
            complete: function () {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('Code').withTitle('{{"Mã vị trí hệ thống" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('RoomName').withTitle('{{"Tên vị trí hệ thống" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Department').withTitle('{{"Đơn vị trực thuộc" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LoginInformation').withTitle('{{"Thông tin đăng nhập" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Available').withTitle('{{"Tình trạng cố lượng (có tín hiệu/tổng)" | translate}}').renderWith(function (data, type) {

        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DiskStatus').withTitle('{{"Tình trạng ổ cứng" | translate}}').renderWith(function (data, type) {

        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Capacity').notSortable().withTitle('{{"Dung lượng ổ cứng(GB)" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Series').notSortable().withTitle('{{"Số series ổ cứng" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DiskSaveable').notSortable().withTitle('{{"Ổ cứng đang có dữ liệu" | translate}}').renderWith(function (data, type) {
        if (data=="True") {
            return 'Có';
        }
        else {
            return 'Không';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SignalLossReason').withTitle('{{"Tình trạng kỹ thuật" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"Ghi chú" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
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
    function resetCheckbox() {
        $scope.selected = [];
        vm.selectAll = false;
    }

    $scope.search = function () {
        reloadData(true);
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.add = function () {
        $rootScope.Id = '';
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '60'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.edit = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit',
            backdrop: 'static',
            size: '60',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () {
        });

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

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice) {
    $scope.model = {
        DepartmentCode: '',
        DiskSaveable: ''
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.loadImage = function () {
        var fileuploader = angular.element("#File");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('imageId').src = reader.result;
            }
            var files = fileuploader[0].files;
            var idxDot = files[0].name.lastIndexOf(".") + 1;
            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
            if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                App.toastrError("caption.CMS_ITEM_MSG_IMG_FORMAT");
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click')
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            var file = document.getElementById("File").files[0]
            if (file != undefined) {
                var idxDot = file.name.lastIndexOf(".") + 1;
                var extFile = file.name.substr(idxDot, file.name.length).toLowerCase();
                if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                    App.toastrError(caption.ADM_USER_VALIDATE_ITEM_IMAGE);
                    return;
                }
                else {
                    $scope.file = file;
                }
            }
            var formData = new FormData();
            formData.append("images", $scope.file);
            formData.append("RoomId", $scope.model.RoomId);
            formData.append("RoomName", $scope.model.RoomName);
            formData.append("DepartmentCode", $scope.model.DepartmentCode);
            formData.append("CameraQuantity", $scope.model.CameraQuantity);
            formData.append("CameraAvailable", $scope.model.CameraAvailable);
            formData.append("Series", $scope.model.Series);
            formData.append("Capacity", $scope.model.Capacity);
            formData.append("DiskStatus", $scope.model.DiskStatus);
            formData.append("Note", $scope.model.Note);
            formData.append("DiskSaveable", $scope.model.DiskSaveable);
            formData.append("LoginInformation", $scope.model.LoginInformation);
            dataservice.insert(formData, function (result) {
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
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.DepartmentCode == "" || data.DepartmentCode == null) {
            $scope.errorDepartment = true;
            mess.Status = true;
        } else {
            $scope.errorDepartment = false;

        }
        if (data.DiskSaveable == "" || data.DiskSaveable == null) {
            $scope.errorStatus = true;
            mess.Status = true;
        } else {
            $scope.errorStatus = false;

        }
        return mess;
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Department" && $scope.model.DepartmentCode != "" && $scope.model.DepartmentCode != null) {
            $scope.errorDepartment = false;
        }
        if (SelectType == "Status" && $scope.model.DiskSaveable != "" && $scope.model.DiskSaveable != null) {
            $scope.errorStatus = false;
        }
    }


    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $filter, $uibModalInstance, dataservice, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.model = {
        DepartmentCode: '',
        DiskSaveable: ''
    }
    $scope.initData = function () {
        dataservice.getItem(para, function (rs) {
            rs = rs.data;
            $scope.model = rs;
            if ($scope.model.DiskSaveable) {
                $scope.model.DiskSaveable = 1;
            }
            else { $scope.model.DiskSaveable = 2;}
        });
    }
    $scope.initData();
    $scope.loadImage = function () {
        var fileuploader = angular.element("#File");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('imageId').src = reader.result;
            }
            var files = fileuploader[0].files;
            var idxDot = files[0].name.lastIndexOf(".") + 1;
            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
            if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                App.toastrError("caption.CMS_ITEM_MSG_IMG_FORMAT");
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click')
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if (!validationSelect($scope.model).Status) {
            var file = document.getElementById("File").files[0]
            if (file != undefined) {
                var idxDot = file.name.lastIndexOf(".") + 1;
                var extFile = file.name.substr(idxDot, file.name.length).toLowerCase();
                if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                    App.toastrError(caption.ADM_USER_VALIDATE_ITEM_IMAGE);
                    return;
                }
                else {
                    $scope.file = file;
                }
            }
            var formData = new FormData();
            formData.append("images", $scope.file);
            formData.append("Id", $scope.model.Id);
            formData.append("RoomId", $scope.model.RoomId);
            formData.append("RoomName", $scope.model.RoomName);
            formData.append("DepartmentCode", $scope.model.DepartmentCode);
            formData.append("CameraQuantity", $scope.model.CameraQuantity);
            formData.append("CameraAvailable", $scope.model.CameraAvailable);
            formData.append("Series", $scope.model.Series);
            formData.append("Capacity", $scope.model.Capacity);
            formData.append("DiskStatus", $scope.model.DiskStatus);
            formData.append("Note", $scope.model.Note);
            formData.append("DiskSaveable", $scope.model.DiskSaveable);
            formData.append("LoginInformation", $scope.model.LoginInformation);
            formData.append("ImageLink", $scope.model.ImageLink);
            dataservice.update(formData, function (result) {
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

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.DepartmentCode == "" || data.DepartmentCode == null) {
            $scope.errorDepartment = true;
            mess.Status = true;
        } else {
            $scope.errorDepartment = false;

        }
        if (data.DiskSaveable == "" || data.DiskSaveable == null) {
            $scope.errorStatus = true;
            mess.Status = true;
        } else {
            $scope.errorStatus = false;

        }
        return mess;
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Department" && $scope.model.DepartmentCode != "" && $scope.model.DepartmentCode != null) {
            $scope.errorDepartment = false;
        }
        if (SelectType == "Status" && $scope.model.DiskSaveable != "" && $scope.model.DiskSaveable != null) {
            $scope.errorStatus = false;
        }
    }


    setTimeout(function () {
        loadDate();
        setModalDraggable('.modal-dialog');
    }, 200);
});