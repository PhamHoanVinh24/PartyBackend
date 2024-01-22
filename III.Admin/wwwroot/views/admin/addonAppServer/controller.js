var ctxfolder = "/views/admin/addonAppServer";
var ctxfolderMessage = "/views/message-box";
var ctxfolderQrCode = "/views/admin/edmsQRCodeManager";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'monospaced.qrcode']);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    };
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
        getApp: function (callback) {
            $http.post('/Admin/AddonAppServer/GetApp').then(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/AddonAppServer/GetItem?id=' + data).then(callback);
        },
        getVendor: function (callback) {
            $http.post('/Admin/AddonAppServer/GetVendor').then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/AddonAppServer/Insert/', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/AddonAppServer/Update/', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/AddonAppServer/Delete/', data).then(callback);
        },
    };
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
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, dataservice, $cookies, $translate) {
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
        });

        $rootScope.validationOptions = {
            rules: {
                ServerCode: {
                    required: true,
                    maxlength: 50,
                },
                ServerAddress: {
                    required: true,
                    maxlength: 255,
                }
            },
            messages: {
                ServerCode: {
                    required: caption.AAS_VALIDATE_NOT_CODE,
                    maxlength: caption.AAS_VALIDATE_CODE_CHARACTER
                },
                ServerAddress: {
                    required: caption.AAS_VALIDATE_NOT_ADDRESS,
                    maxlength: caption.AAS_VALIDATE_NAME_CHARACTER
                }
            }
        }
        dataservice.getApp(function (rs) {
            rs = rs.data;
            $rootScope.AppData = rs;
        });
        dataservice.getVendor(function (rs) {
            rs = rs.data;
            $rootScope.VendorData = rs;
        });
    });
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/AddonAppServer/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/edit/:id', {
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit'
        })
        .when('/add/', {
            templateUrl: ctxfolder + '/add.html',
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
});
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, myService) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        ServerCode: '',
        ServerAddress: '',
        Note: '',
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/AddonAppServer/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ServerCode = $scope.model.ServerCode;
                d.ServerAddress = $scope.model.ServerAddress;
                d.Note = $scope.model.Note;
            },
            complete: function () {
                App.unblockUI("#contentMain");
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
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ServerCode').withTitle('{{"AAS_LIST_COL_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AppName').withTitle('{{"AAS_LIST_COL_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('VendorName').withTitle('{{"AAS_LIST_COL_PARTNER" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ServerAddress').withTitle('{{"AAS_LIST_COL_ADDRESS" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"AAS_LIST_COL_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('QrCode').withTitle('{{"QR Code" | translate}}').renderWith(function (data, type, full, meta) {
    //    return '<qrcode role="button" ng-click="viewQrCode(\'' + full.ServerAddress + '\')" data=' + full.ServerAddress + ' size="60"></qrcode>';
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"AAS_LIST_COL_ACTION" | translate}}').withOption('sClass', '').renderWith(function (data, type, full, meta) {
        return '<button title="{{&quot; AAS_LIST_COL_REPAIR &quot; | translate}}" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="{{&quot; AAS_LIST_COL_DELETE &quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    }
    $scope.search = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            size: '60'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () { });
    };
    $scope.edit = function (id) {
        dataservice.getItem(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                myService.setData(rs.Object);
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/edit.html',
                    controller: 'edit',
                    backdrop: 'static',
                    size: '35'
                });
                modalInstance.result.then(function (d) {
                    $scope.reloadNoResetPage();
                }, function () { });
            }
        });
    };
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
    };
    $scope.showSearch = function() {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    };

    $scope.viewQrCode = function (code) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderQrCode + '/qrViewer.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
                $scope.qrcodeString = code;
                setTimeout(function () {
                    setModalDraggable('.modal-dialog');
                }, 200);
            },
            backdrop: 'static',
            size: '25',
        });
    }
    function showHideSearch() {
        /*$(".btnSearch").click(function () {
            $(".input-search").removeClass('hidden');
            $(".btnSearch").hide();
        });
        $(".close-input-search").click(function () {
            $(".input-search").addClass('hidden');
            $(".btnSearch").show();
        });*/
    }
    setTimeout(function () {
        showHideSearch();
    }, 200);
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $uibModalInstance, $timeout) {
    $scope.model = {
        AppVendorCode: '',
        AppCode: '',
        ServerCode: '',
        ServerAddress: '',
        Note: ''
    }
    $scope.listAppVendor = [];

    $scope.addAppVendor = function () {
        if ($scope.addForm.validate()) {
            var obj = {
                AppCode: '',
                AppVendorCode: '',
                ServerCode: $scope.model.ServerCode,
                ServerAddress: $scope.model.ServerAddress,
                Note: $scope.model.Note,
            }
            $scope.listAppVendor.push(obj);
            App.toastrSuccess(caption.COM_ADD_SUCCESS);
        }
    }

    $scope.deleteAppVendor = function (index) {
        $scope.listAppVendor.splice(index, 1);
        App.toastrSuccess(caption.COM_DELETE_SUCCESS);
    }

    $scope.submit = function () {
        if ($scope.model.AppVendorCode == '' || $scope.model.AppCode == '') {
            App.toastrError(caption.AAS_VALIDATE_APP_PARTNER);
        } else {
            for (var i = 0; i < $scope.listAppVendor.length; i++) {
                $scope.listAppVendor[i].AppCode = $scope.model.AppCode;
                $scope.listAppVendor[i].AppVendorCode = $scope.model.AppVendorCode;
            }
            dataservice.insert($scope.listAppVendor, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            })
        }
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, myService) {
    $scope.initLoad = function () {
        $scope.model = myService.getData();
    }
    $scope.initLoad();

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.changleSelect = function (SelectType) {
        if (SelectType == "AppCode" && $scope.model.AppCode != "") {
            $scope.errorAppCode = false;
        }
        if (SelectType == "AppVendorCode" && $scope.model.AppVendorCode != "") {
            $scope.errorAppVendorCode = false;
        }
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.editForm.validate() && validationSelect($scope.model).Status == false) {
            //var msg = $rootScope.checkData($scope.model);
            //if (msg.Status) {
            //    App.toastrError(msg.Title);
            //    return;
            //}
            dataservice.update($scope.model, function (result) {
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
        var mess = { Status: false, Title: "" };
        if (data.AppCode == "") {
            $scope.errorAppCode = true;
            mess.Status = true;
        } else {
            $scope.errorAppCode = false;
        }
        if (data.AppVendorCode == "") {
            $scope.errorAppVendorCode = true;
            mess.Status = true;
        } else {
            $scope.errorAppVendorCode = false;
        }
        return mess;
    };

    setTimeout(function () {
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 200);
});

