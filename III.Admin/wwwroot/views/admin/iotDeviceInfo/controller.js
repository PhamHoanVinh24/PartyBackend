var ctxfolder = "/views/admin/iotDeviceInfo";
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
        getDeviceGroup: function (callback) {
            $http.post('/Admin/IotDeviceInfo/GetDeviceGroup').then(callback);
        },
        getDeviceType: function (callback) {
            $http.post('/Admin/IotDeviceInfo/GetDeviceType').then(callback);
        },
        getDeviceStatus: function (callback) {
            $http.post('/Admin/IotDeviceInfo/GetDeviceStatus').then(callback);
        },

        getItem: function (data, callback) {
            $http.post('/Admin/IotDeviceInfo/GetItem?id=' + data).then(callback);
        },
        insert: function (data, callback) {
            submitFormUpload('/Admin/IotDeviceInfo/Insert', data, callback);
        },
        update: function (data, callback) {
            submitFormUpload('/Admin/IotDeviceInfo/Update', data, callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/IotDeviceInfo/Delete?id=' + data).then(callback);
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
                DeviceCode: {
                    required: true,
                    regx: /^[a-zA-Z0-9_äöüÄÖÜ]*$/
                },
                DeviceName: {
                    required: true,
                    regx: /^[^\s].*/
                },
                
            },
            messages: {
                DeviceCode: {
                    required: "Mã thiết bị không để trống",
                    regx: "Mã không chứa ký tự đặc biệt, khoảng trắng và có dấu"
                },
                DeviceName: {
                    required: "Tên thiết bị không để trống",
                    regx: "Tên thiết bị không chứa khoảng trắng đầu dòng"
                },
            }
        }
        $rootScope.IsTranslate = true;
    });
    $rootScope.status = [{ Code: 1, Name: 'Có' }, { Code: 2, Name: 'Không' }];
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/IotDeviceInfo/Translation');
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
        DeviceName: '',
        DeviceGroup: '',
        DeviceType: '',
        DeviceStatus: ''
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.liFunction = [];
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/IotDeviceInfo/jtable",
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
                d.DeviceName = $scope.model.DeviceName;
                d.DeviceGroup = $scope.model.DeviceGroup;
                d.DeviceType = $scope.model.DeviceType;
                d.DeviceStatus = $scope.model.DeviceStatus;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
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

    vm.dtColumns.push(DTColumnBuilder.newColumn('DeviceCode').withTitle('{{"IOT_DEVICE_CODE_ESTABLIST" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('DeviceName').withTitle('{{"IOT_DEVICE_NAME_ESTABLIST" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('DeviceGroup').withTitle('{{"IOT_DEVICE_GROUP_ESTABLIST" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('DeviceType').withTitle('{{"IOT_DEVICE_TYPE_ESTABLIST" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('DeviceStatus').withTitle('{{"IOT_DEVICE_STATUS" | translate}}').renderWith(function (data, type) {

        return data;
    }));
   
    vm.dtColumns.push(DTColumnBuilder.newColumn('DeviceManufacturer').notSortable().withTitle('{{"IOT_DEVICE_READY_MADE_COMPANY" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('DeviceImage').notSortable().withTitle('{{"IOT_DEVICE_IMG" | translate}}').renderWith(function (data, type) {
        return '<a href="' + data + '" target="_blank"><img class="img-circle" style="max-height: 100%; max-width: 100%; height: 50px" src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + '></a>';
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('DeviceDesc').withTitle('{{"IOT_DEVICE_DESCRIPTION" | translate}}').renderWith(function (data, type) {

        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<span ng-click="edit(' + full.Id + ')" /*style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);"*/ class="fs25 pr10"><i class="fas fa-edit" style="--fa-primary-color: green;"></i></span>' +
            '<span title="Xoá" ng-click="delete(' + full.Id + ')" /*style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45);"*/ class="fs25"><i class="fas fa-trash" style="--fa-primary-color: red;"></i></span>';
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

    $scope.initData = function () {
        dataservice.getDeviceGroup(function (rs) {
            rs = rs.data;
            $scope.lstGroupIot = rs;
        })

        dataservice.getDeviceType(function (rs) {
            rs = rs.data;
            $scope.lstTypeIot = rs;
        })

        dataservice.getDeviceStatus(function (rs) {
            rs = rs.data;
            $scope.lstStatus = rs;
        })
    }
    $scope.initData();

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
            size: '50'
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
            size: '50',
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
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice) {
    $scope.model = {
        DeviceCode: '',
        DeviceName: '',
        DeviceGroup: '',
        DeviceType: '',
        DeviceManufacturer: '',
        DeviceStatus: '',
        Desc: ''
    }

    $scope.initData = function () {
        dataservice.getDeviceGroup(function (rs) {
            rs = rs.data;
            $scope.lstGroupIot = rs;
        })

        dataservice.getDeviceType(function (rs) {
            rs = rs.data;
            $scope.lstTypeIot = rs;
        })

        dataservice.getDeviceStatus(function (rs) {
            rs = rs.data;
            $scope.lstStatus = rs;
        })
    }
    $scope.initData();

    $scope.cancel = function () {
        $uibModalInstance.close('cancel');
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
            formData.append("DeviceCode", $scope.model.DeviceCode);
            formData.append("DeviceName", $scope.model.DeviceName);
            formData.append("DeviceGroup", $scope.model.DeviceGroup);
            formData.append("DeviceType", $scope.model.DeviceType);
            formData.append("DeviceManufacturer", $scope.model.DeviceManufacturer);
            formData.append("DeviceStatus", $scope.model.DeviceStatus);
            formData.append("DeviceDesc", $scope.model.DeviceDesc);

            dataservice.insert(formData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            });
        }
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }

        if (data.DeviceStatus == "" || data.DeviceStatus == null) {
            $scope.errorDeviceStatus = true;
            mess.Status = true;
        } else {
            $scope.errorDeviceStatus = false;

        }

        if (data.DeviceType == "" || data.DeviceType == null) {
            $scope.errorDeviceType = true;
            mess.Status = true;
        } else {
            $scope.errorDeviceType = false;

        }

        if (data.DeviceGroup == "" || data.DeviceGroup == null) {
            $scope.errorDeviceGroup = true;
            mess.Status = true;
        } else {
            $scope.errorDeviceGroup = false;

        }

        return mess;
    }

    $scope.changeSelect = function (SelectType) {
        if (SelectType == "GROUP" && $scope.model.DeviceGroup != "") {
            $scope.errorDeviceGroup = false;
        }

        if (SelectType == "TYPE" && $scope.model.DeviceType != "") {
            $scope.errorDeviceType = false;
        }

        if (SelectType == "STATUS" && $scope.model.DeviceStatus != "") {
            $scope.errorDeviceStatus = false;
        }
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
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $filter, $uibModalInstance, dataservice, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.model = {
        DeviceCode: '',
        DeviceName: '',
        DeviceGroup: '',
        DeviceType: '',
        DeviceManufacturer: '',
        DeviceStatus: '',
        Desc: ''
    }

    $scope.initData = function () {
        dataservice.getItem(para, function (rs) {
            rs = rs.data;
            $scope.model = rs;
            if ($scope.model.DiskSaveable) {
                $scope.model.DiskSaveable = 1;
            }
            else { $scope.model.DiskSaveable = 2; }
        });

        dataservice.getDeviceGroup(function (rs) {
            rs = rs.data;
            $scope.lstGroupIot = rs;
        })

        dataservice.getDeviceType(function (rs) {
            rs = rs.data;
            $scope.lstTypeIot = rs;
        })

        dataservice.getDeviceStatus(function (rs) {
            rs = rs.data;
            $scope.lstStatus = rs;
        })
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
        if (!validationSelect($scope.model).Status && $scope.addform.validate()) {
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
            formData.append("DeviceCode", $scope.model.DeviceCode);
            formData.append("DeviceName", $scope.model.DeviceName);
            formData.append("DeviceGroup", $scope.model.DeviceGroup);
            formData.append("DeviceType", $scope.model.DeviceType);
            formData.append("DeviceManufacturer", $scope.model.DeviceManufacturer);
            formData.append("DeviceStatus", $scope.model.DeviceStatus);
            formData.append("DeviceDesc", $scope.model.DeviceDesc);
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

        if (data.DeviceStatus == "" || data.DeviceStatus == null) {
            $scope.errorDeviceStatus = true;
            mess.Status = true;
        } else {
            $scope.errorDeviceStatus = false;

        }

        if (data.DeviceType == "" || data.DeviceType == null) {
            $scope.errorDeviceType = true;
            mess.Status = true;
        } else {
            $scope.errorDeviceType = false;

        }

        if (data.DeviceGroup == "" || data.DeviceGroup == null) {
            $scope.errorDeviceGroup = true;
            mess.Status = true;
        } else {
            $scope.errorDeviceGroup = false;

        }

        return mess;
    }

    $scope.changeSelect = function (SelectType) {
        if (SelectType == "GROUP" && $scope.model.DeviceGroup != "") {
            $scope.errorDeviceGroup = false;
        }

        if (SelectType == "TYPE" && $scope.model.DeviceType != "") {
            $scope.errorDeviceType = false;
        }

        if (SelectType == "STATUS" && $scope.model.DeviceStatus != "") {
            $scope.errorDeviceStatus = false;
        }
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
