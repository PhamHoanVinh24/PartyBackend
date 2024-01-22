var ctxfolder = "/views/admin/assetLocation";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
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
        getListWareHouse: function (callback) {
            $http.get('/Admin/EDMSWarehouseManagerAsset/GetListWareHouse').then(callback);
        },
        getListFloorByWareHouseCode: function (data, callback) {
            $http.get('/Admin/EDMSWarehouseManagerAsset/GetListFloorByWareHouseCode?wareHouseCode=' + data).then(callback);
        },
        getListLineByFloorCode: function (data, callback) {
            $http.get('/Admin/EDMSWarehouseManagerAsset/GetListLineByFloorCode?floorCode=' + data).then(callback);
        },
        getListRackByLineCode: function (data, callback) {
            $http.get('/Admin/EDMSWarehouseManagerAsset/GetListRackByLineCode?lineCode=' + data).then(callback);
        },
        getAsset: function (callback) {
            $http.post('/Admin/AssetLocation/GetAsset').then(callback);
        },
        arrangeAsset: function (data, callback) {
            $http.post('/Admin/Asset/ArrangeAsset', data).then(callback);
        },
        getPosition: function (data, callback) {
            $http.post('/Admin/AssetLocation/GetPosition', data).then(callback);
        },
        deleteArrange: function (data, callback) {
            $http.post('/Admin/AssetLocation/DeleteArrange?id=' + data).then(callback);
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
        });
        $rootScope.validationOptions = {
            rules: {
                ZoneCode: {
                    required: true,
                    regx: /^[a-zA-Z0-9_äöüÄÖÜ]*$/
                },
                ZoneName: {
                    required: true,
                    regx: /^[^\s].*/
                },

            },
            messages: {
                ZoneCode: {
                    required: caption.ALC_VALIDATE_WHS,
                    regx: caption.ALC_VALIDATE_REGX_WHS
                },
                ZoneName: {
                    required: caption.ALC_VALIDATE_WHS_NAME,
                    regx: caption.ALC_VALIDATE_REGX_WHS_NAME
                },
            }
        }
        $rootScope.IsTranslate = true;
    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/AssetLocation/Translation');
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

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.model = {
        WHS_Code: '',
        FloorCode: '',
        LineCode: '',
        RackCode: '',
        RackPosition: '',
        AssetCode: ''
    };

    $scope.initData = function () {
        dataservice.getListWareHouse(function (rs) {
            rs = rs.data;
            $scope.lstWareHouse = rs;
        })
    }

    $scope.initData();

    $scope.changeSelect = function (type, item) {
        $scope.reload();
        if (type == "WHS") {
            dataservice.getListFloorByWareHouseCode(item.WHS_Code, function (rs) {
                rs = rs.data;
                $scope.lstFloor = rs;
                $scope.whsName = item.WHS_Name;
            })
        }
        else if (type == "FLS") {
            dataservice.getListLineByFloorCode(item.FloorCode, function (rs) {
                rs = rs.data;
                $scope.lstLine = rs;
                $scope.floorName = item.FloorName;
            })
        }
        else if (type == "LINE") {
            dataservice.getListRackByLineCode(item.LineCode, function (rs) {
                rs = rs.data;
                $scope.lstRack = rs;
                $scope.lineName = item.L_Text;
            })
        }
        else if (type == "RACK") {
            $scope.rackName = item.RackName;
        }
    }

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.liFunction = [];
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-change="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/AssetLocation/JTable",
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
                d.WHS_Code = $scope.model.WHS_Code;
                d.FloorCode = $scope.model.FloorCode;
                d.RackCode = $scope.model.RackCode;
                d.LineCode = $scope.model.LineCode;
                d.RackPosition = $scope.model.RackPosition;
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

    vm.dtColumns.push(DTColumnBuilder.newColumn("AssetID").withTitle(titleHtml).withOption('sClass', 'hidden'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Asset').withTitle('{{"ALC_LIST_COL_ASSET_CODE_NAME" | translate}}').renderWith(function (data, type, full, meta) {
        return '<span class="bold">' + data + '</span>';
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Postion').withTitle('{{"ALC_LIST_COL_POSITION" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap w30').withTitle('{{"ALC_LIST_COL_ARRANGE" | translate}}').renderWith(function (data, type, full) {
        return '<button title="Xếp kho tài sản" ng-click="orderAsset(\'' + full.AssetCode + '\')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline blue"><img src="../../../images/wareHouse/orderStore.png" height="25" width="25" /></button>';
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"ALC_LIST_COL_STATUS" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap w30').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<a title="Xoá" ng-click="delete(' + full.IdMapping + ')" class="fs25"><i style="--fa-primary-color: red;" class="fa-solid fa-trash"></i></a>';
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

    $scope.orderAsset = function (assetCode) {
        debugger
        if ($scope.model.WHS_Code === "") {
            return App.toastrError(caption.ALC_MSG_PLS_SELECT_WHS);
        }
        else if ($scope.model.FloorCode === "") {
            return App.toastrError(caption.ALC_MSG_PLS_SELECT_FLOOR);
        }
        else if ($scope.model.LineCode === "") {
            return App.toastrError(caption.ALC_MSG_PLS_SELECT_LINE);
        };
        var obj = {
            WHS: $scope.whsName,
            Floor: $scope.floorName,
            Line: $scope.lineName,
            Rack: $scope.rackName != undefined ? $scope.rackName : ""
        };

        $scope.model.AssetCode = assetCode;

        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmUpdate.html',
            windowClass: "message-center",
            resolve: {
                para: function () {
                    return obj;
                }
            },
            controller: function ($scope, $uibModalInstance, para) {
                $scope.message = caption.ALC_MSG_QUES_ARRANGE_ASSET + " " + para.WHS + ", " + para.Floor + ", " + para.Line + ", " + para.Rack + " ?";
                $scope.ok = function () {
                    $uibModalInstance.close();
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            size: '25',
        });
        modalInstance.result.then(function (d) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/orderAsset.html',
                controller: 'orderAsset',
                backdrop: 'static',
                size: '55',
                resolve: {
                    para: function () {
                        return $scope.model;
                    }
                }
            });
            modalInstance.result.then(function () {
                $scope.reload();
            }, function () { });
        }, function () {
        });
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


    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deleteArrange(id, function (rs) {
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

app.controller('orderAsset', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, $uibModalInstance, dataservice, para) {
    var vm = $scope;

    $scope.cancel = function () {
        $uibModalInstance.close();
    }

    $scope.model = {
        AssetCode: '',
        WHS_Code: '',
        FloorCode: '',
        LineCode: '',
        RackCode: ''
    };

    $scope.initData = function () {
        $scope.model = para;
        dataservice.getAsset(function (rs) {
            rs = rs.data;
            $scope.listAsset = rs;
        })
        dataservice.getPosition($scope.model, function (rs) {
            rs = rs.data;
            $scope.position = rs;
        })
    }

    $scope.initData();

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.liFunction = [];
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-change="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/AssetLocation/JTable",
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
                d.WHS_Code = para.WHS_Code
                d.FloorCode = para.FloorCode
                d.RackCode = para.RackCode
                d.LineCode = para.LineCode
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

    vm.dtColumns.push(DTColumnBuilder.newColumn("AssetID").withTitle(titleHtml).withOption('sClass', 'hidden'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Asset').withTitle('{{"ALC_LIST_COL_ASSET_CODE_NAME" | translate}}').renderWith(function (data, type, full, meta) {
        return '<span class="bold">' + data + '</span>';
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Postion').withTitle('{{"ALC_LIST_COL_POSITION" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap w30').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button title="Xoá" ng-click="delete(' + full.IdMapping + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45);" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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

    $scope.reload = function () {
        reloadData(true);
    }

    $scope.arrange = function () {
        if ($scope.model.AssetCode == "" || $scope.model.AssetCode == undefined || $scope.model.AssetCode == null) {
            return App.toastrError(caption.ALC_MSG_PLS_SELECT_ASSET);
        }

        dataservice.arrangeAsset($scope.model, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $scope.reload();
            }
        })
    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deleteArrange(id, function (rs) {
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
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
