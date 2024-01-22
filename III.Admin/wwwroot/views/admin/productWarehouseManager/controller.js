var ctxfolder = "/views/admin/productWarehouseManager";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ngTagsInput']);
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
        //Danh sách kho, tầng, dãy
        getListWareHouse: function (callback) {
            $http.get('/Admin/productWarehouseManager/GetListWareHouse', callback).then(callback);
        },
        getListFloor: function (callback) {
            $http.get('/Admin/productWarehouseManager/GetListFloor', callback).then(callback);
        },
        getListLine: function (callback) {
            $http.get('/Admin/productWarehouseManager/GetListLine', callback).then(callback);
        },

        //Chi tiết 1 kho
        getWareHouseById: function (id, callback) {
            $http.get('/Admin/productWarehouseManager/getWareHouseById?id=' + id, callback).then(callback);
        },

        //Danh sách người quản lý
        getListManager: function (callback) {
            $http.get('/Admin/productWarehouseManager/GetListManager', callback).then(callback);
        },
        //List danh sách nhân viên (người quản lý)
        getListStaffBranch: function (callback) {
            $http.post('/Admin/EDMSWareHouseBill/GetListStaffBranch/', callback).then(callback);
        },
        //Sinh mã tầng tự động
        genFloorCode: function (wareHouseCode, floorName, callback) {
            $http.get('/Admin/productWarehouseManager/GenFloorCode?wareHouseCode=' + wareHouseCode + '&floorName=' + floorName, callback).then(callback);
        },
        genLineCode: function (floorCode, lineName, callback) {
            $http.get('/Admin/productWarehouseManager/GenLineCode?floorCode=' + floorCode + '&lineName=' + lineName, callback).then(callback);
        },
        genRackCode: function (lineCode, rackName, callback) {
            $http.get('/Admin/productWarehouseManager/GenRackCode?lineCode=' + lineCode + '&rackName=' + rackName, callback).then(callback);
        },

        //Sinh mã QR_CODE
        generatorQRCode: function (data, callback) {
            $http.post('/Admin/productWarehouseManager/GenQRCode?code=' + data, callback).then(callback);
        },

        //Thêm sửa xóa tầng
        insertFloor: function (data, callback) {
            submitFormUpload('/Admin/productWarehouseManager/InsertFloor', data, callback);
        },
        getFloorInfo: function (data, callback) {
            $http.post('/Admin/productWarehouseManager/GetFloorInfo?floorId=' + data).then(callback);
        },
        updateFloor: function (data, callback) {
            submitFormUpload('/Admin/productWarehouseManager/UpdateFloor', data, callback);
        },
        deleteFloor: function (data, callback) {
            $http.post('/Admin/productWarehouseManager/DeleteFloor?floorId=' + data).then(callback);
        },

        //Thêm sửa xóa dãy
        insertLine: function (data, callback) {
            $http.post('/Admin/productWarehouseManager/InsertLine', data, callback).then(callback);
        },
        getLineInfo: function (data, callback) {
            $http.post('/Admin/productWarehouseManager/GetLineInfo?lineId=' + data).then(callback);
        },
        updateLine: function (data, callback) {
            $http.post('/Admin/productWarehouseManager/UpdateLine', data).then(callback);
        },
        deleteLine: function (data, callback) {
            $http.post('/Admin/productWarehouseManager/DeleteLine?lineId=' + data).then(callback);
        },

        //Thêm sửa xóa kệ
        insertRack: function (data, callback) {
            $http.post('/Admin/productWarehouseManager/InsertRack', data, callback).then(callback);
        },
        getRackInfo: function (data, callback) {
            $http.post('/Admin/productWarehouseManager/GetRackInfo?rackId=' + data).then(callback);
        },
        updateRack: function (data, callback) {
            $http.post('/Admin/productWarehouseManager/UpdateRack', data).then(callback);
        },
        deleteRack: function (data, callback) {
            $http.post('/Admin/productWarehouseManager/DeleteRack?rackId=' + data).then(callback);
        },

        //Thêm sửa xóa thùng
        insertBox: function (data, callback) {
            $http.post('/Admin/productWarehouseManager/InsertBox', data, callback).then(callback);
        },
        updateBox: function (data, callback) {
            $http.post('/Admin/productWarehouseManager/UpdateBox', data).then(callback);
        },
        deleteItemBoxs: function (data, callback) {
            $http.post('/Admin/productWarehouseManager/DeleteItemBoxs', data).then(callback);
        },
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $filter, $location, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);

    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
    });
    $rootScope.validationOptions = {
        rules: {
            CNT_Line: {
                required: true
            },
            FloorName: {
                required: true
            },
            AreaSquare: {
                required: true
            },
            LineCode: {
                required: true
            },
            CNT_Rack: {
                required: true
            },
            L_Text: {
                required: true
            },
            RackName: {
                required: true
            },
            CNT_Box: {
                required: true
            }
        },
        messages: {
            CNT_Line: {
                required: "Số dãy yêu cầu bắt buộc!"
            },
            FloorName: {
                required: "Tên tầng yêu cầu bắt buộc!"
            },
            AreaSquare: {
                required: "Diện tích yêu cầu bắt buộc!"
            },
            LineCode: {
                required: "Mã dãy yêu cầu bắt buộc!"
            },
            CNT_Rack: {
                required: "Số kệ yêu cầu bắt buộc!"
            },
            L_Text: {
                required: "Tên dãy yêu cầu bắt buộc!"
            },
            RackName: {
                required: "Tên kệ yêu cầu bắt buộc!"
            },
            CNT_Box: {
                required: "Số thùng yêu cầu bắt buộc!"
            }
        }
    }

    $rootScope.showListFloor = false;
    $rootScope.showListLine = false;
    $rootScope.showListRack = false;

    $rootScope.listWareHouse = [];
    $rootScope.listFloor = [];
    $rootScope.listLine = [];
    $rootScope.listRack = [];

    $rootScope.wareHouseID = null;
    $rootScope.floorID = null;
    $rootScope.lineID = null;
    $rootScope.rackID = null;

    $rootScope.wareHouseCode = null;
    $rootScope.floorCode = null;
    $rootScope.lineCode = null;
    $rootScope.rackCode = null;

    $rootScope.wareHouseReload = false;
    $rootScope.floorReload = false;
    $rootScope.lineReload = false;
    $rootScope.rackReload = false;

    $rootScope.StatusFloor = [{
        Value: '1',
        Name: 'Hoạt động'
    }, {
        Value: '0',
        Name: 'Không hoạt động'
    }];

    $rootScope.StatusLine = [{
        Value: '1',
        Name: 'Hoạt động'
    }, {
        Value: '0',
        Name: 'Không hoạt động'
    }];

    $rootScope.StatusRack = [{
        Value: '1',
        Name: 'Hoạt động'
    }, {
        Value: '0',
        Name: 'Không hoạt động'
    }];
    $rootScope.wareHouseCode = "";
});
app.config(function ($routeProvider, $validatorProvider, $httpProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/Language/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/add/', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
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
    $httpProvider.interceptors.push('interceptors');
});

//Danh sách Kho, Tầng, Dãy,Kệ
app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/productWarehouseManager/JTable",
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
                d.Type = "PRODUCT";
            },
            complete: function (data) {
                //$rootScope.listWareHouse = data.responseJSON.data;
                //$rootScope.wareHouseCode = $rootScope.listWareHouse[0].WHS_Code;
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [1, 'desc'])
        .withOption('scrollY', "110px")
        .withOption('scrollCollapse', false)
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
            if (dataIndex == 0) {
                $(row).addClass('selected');
                var btn = $(row).find('td button');
                $(btn).addClass('active');
                $rootScope.showListFloor = true;
            }
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);

            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var wareHouseId = data.Id;

                    var row = $(evt.target).closest('tr');
                    // data key value
                    var key = row.attr("data-id");
                    // cell values
                    var Id = row.find('td:eq(1)').text();
                    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                        $scope.selected[data.Id] = !$scope.selected[data.Id];
                    } else {
                        var self = $(this).parent();
                        $('#tblData').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.Id] = true;

                        var modalInstance = $uibModal.open({
                            animation: true,
                            templateUrl: ctxfolder + '/detailWareHouse.html',
                            controller: 'detailWareHouse',
                            backdrop: 'static',
                            size: '35',
                            resolve: {
                                para: function () {
                                    return wareHouseId;
                                }
                            }
                        });
                        modalInstance.result.then(function (d) {
                            $scope.reloadNoResetPage();
                        }, function () {
                        });
                    }
                }
            });

            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var wareHouseId = data.Id;
                    var wareHouseCode = data.WHS_Code;
                    $rootScope.wareHouseCode = data.StoreCode;

                    var row = $(evt.target).closest('tr');
                    // data key value
                    var key = row.attr("data-id");
                    // cell values
                    var Id = row.find('td:eq(1)').text();
                    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                        $scope.selected[data.Id] = !$scope.selected[data.Id];
                    } else {
                        var self = $(this).parent();
                        $('#tblData').DataTable().$('tr.selected').removeClass('selected');
                        $('#tblData').DataTable().$('td button.active').removeClass('active');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.Id] = true;
                    }
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.FileID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.FileID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('QrCode').withTitle('QR Code').withOption('sWidth', '55px').renderWith(function (data, type) {
        //return '<img src="' + data + '" height="40" width="40">';
        return '<img src="../../../images/default/qrCode.png" height="40" width="40">';
        //return '<img src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="40" width="40">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StoreName').withTitle('{{"PWM_LIST_COL_STORE_MISS" | translate}}').withOption('sWidth', '100px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('').withTitle('{{"PWM_LIST_COL_MAP" | translate}}').renderWith(function (data, type, full) {
        //return '<img src="' + data + '" height="40" width="40">';
        return '<img src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="40" width="40">';
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('Tác vụ').renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-check"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red hidden"><i class="fa fa-trash"></i></button>';
    }));
    //Id = a.StoreId,
    //    StoreCode = a.StoreCode,
    //    StoreName = a.StoreName,
    //    Location = a.Location,
    //    Description = a.Description,
    //    UserId = a.UserId,
    //    CreatedTime = a.CreatedTime

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
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.addFloor = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/addFloor.html',
            controller: 'addFloor',
            backdrop: 'static',
            size: '50'
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }

    $scope.editFloor = function () {
        var floorId = $rootScope.floorID;
        if (floorId != null) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/editFloor.html',
                controller: 'editFloor',
                backdrop: 'static',
                size: '50',
                resolve: {
                    para: function () {
                        return $rootScope.floorID;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                $scope.reloadNoResetPage();
            }, function () {
            });
        } else {
            App.toastrError(caption.PWM_MSG_CHOOSE_LAYER_TO_EDIT);
        }
    }

    $scope.deleteFloor = function () {
        var floorId = $rootScope.floorID;
        if (floorId != null) {
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
                windowClass: "message-center",
                controller: function ($scope, $uibModalInstance) {
                    $scope.message = caption.PWM_MSG_SURE_DELETE_LAYER;
                    $scope.ok = function () {
                        dataservice.deleteFloor(floorId, function (result) {result=result.data;
                            if (result.Error) {
                                App.toastrError(result.Title);
                            } else {
                                App.toastrSuccess(result.Title);
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
                $rootScope.reloadFloor();
            }, function () {
            });
        } else {
            App.toastrError(caption.PWM_MSG_CHOOSE_LAYER_TO_DELETE);
        }
    };

    $scope.addLine = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/addLine.html',
            controller: 'addLine',
            backdrop: 'static',
            size: '50'
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }

    $scope.editLine = function () {
        var lineId = $rootScope.lineID;
        if (lineId != null) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/editLine.html',
                controller: 'editLine',
                backdrop: 'static',
                size: '50',
                resolve: {
                    para: function () {
                        return $rootScope.lineID;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                $scope.reloadNoResetPage();
            }, function () {
            });
        } else {
            App.toastrError(caption.PWM_MSG_CHOOSE_ROW_TO_EDIT);
        }
    }

    $scope.deleteLine = function () {
        var lineId = $rootScope.lineID;
        if (lineId != null) {
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
                windowClass: "message-center",
                controller: function ($scope, $uibModalInstance) {
                    $scope.message = caption.PWM_MSG_SURE_DELETE_ROW;
                    $scope.ok = function () {
                        dataservice.deleteLine(lineId, function (result) {result=result.data;
                            if (result.Error) {
                                App.toastrError(result.Title);
                            } else {
                                App.toastrSuccess(result.Title);
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
                $rootScope.reloadLine();
            }, function () {
            });
        } else {
            App.toastrError(caption.PWM_MSG_CHOOSE_ROW_TO_DELETE);
        }
    };

    $scope.addRack = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/addRack.html',
            controller: 'addRack',
            backdrop: 'static',
            size: '50'
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }

    $scope.editRack = function () {
        var rackId = $rootScope.rackID;
        if (rackId != null) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/editRack.html',
                controller: 'editRack',
                backdrop: 'static',
                size: '50',
                resolve: {
                    para: function () {
                        return $rootScope.rackID;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                $scope.reloadNoResetPage();
            }, function () {
            });
        } else {
            App.toastrError(caption.PWM_MSG_CHOOSE_SHELVES_TO_EDIT);
        }
    }

    $scope.deleteRack = function () {
        var rackId = $rootScope.rackID;
        if (rackId != null) {
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
                windowClass: "message-center",
                controller: function ($scope, $uibModalInstance) {
                    $scope.message = caption.PWM_MSG_SURE_DELETE_SHELVES;
                    $scope.ok = function () {
                        dataservice.deleteRack(rackId, function (result) {result=result.data;
                            if (result.Error) {
                                App.toastrError(result.Title);
                            } else {
                                App.toastrSuccess(result.Title);
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
                $rootScope.reloadRack();
            }, function () {
            });
        } else {
            App.toastrError(caption.PWM_MSG_CHOOSE_SHELVES_TO_DELETE);
        }
    };

    $scope.addBox = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/addBox.html',
            controller: 'addBox',
            backdrop: 'static',
            size: '65'
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }

    $scope.edit = function (id) {
        var model = {};
        var listdata = $('#tblData').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id + "") {
                model = listdata[i];
                break;
            }
        }
        $rootScope.wareHouseID = id;
        $rootScope.wareHouseCode = model.StoreCode;
        $rootScope.showListFloor = true;
        $rootScope.showListLine = false;
        $rootScope.showListRack = false;
        if ($rootScope.floorReload)
            $rootScope.reloadFloor();
    }
});
app.controller('listFloor', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location, $timeout) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/productWarehouseManager/JTableFloor",
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
                d.StoreCode = $rootScope.wareHouseCode;
            },
            complete: function (data) {
                $rootScope.listFloor = data.responseJSON.data;
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [2, 'asc'])
        .withOption('scrollY', "110px")
        .withOption('scrollCollapse', false)
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.Id;
                    var floorCode = data.FloorCode;
                    $rootScope.floorID = Id;
                    $rootScope.floorCode = floorCode;
                    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                        $scope.selected[data.Id] = !$scope.selected[data.Id];
                    } else {
                        var self = $(this).parent();
                        $('#tblDataFloor').DataTable().$('tr.selected').removeClass('selected');
                        $('#tblDataFloor').DataTable().$('tr>td.fa-check').removeClass('fa-check');
                        $(self).addClass('selected');
                    }
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('QR_Code').withTitle('QR Code').renderWith(function (data, type) {
        //return '<img src="data:image/png;base64,' + data + '" height="40" width="40">';
        return '<img src="../../../images/default/qrCode.png" height="40" width="40">';
        //return '<img src="data:image/png;base64,' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="40" width="40">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FloorName').withTitle('{{"PWM_LIST_COL_TITLE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('MapDesgin').withTitle('{{"PWM_LIST_COL_DESIGN" | translate}}').renderWith(function (data, type, full) {
        //return '<img src="' + data + '" height="40" width="40">';
        return '<img src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="40" width="40">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('Tác vụ').renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-check"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red hidden"><i class="fa fa-trash"></i></button>';
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
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.add = function () {
        alert(111);
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/addFloor.html',
            controller: 'addFloor',
            backdrop: 'static',
            size: '65'
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }
    $scope.edit = function (id) {
        var model = {};
        var listdata = $('#tblDataFloor').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id + "") {
                model = listdata[i];
                break;
            }
        }
        $rootScope.floorID = id;
        $rootScope.floorCode = model.FloorCode;
        $rootScope.showListFloor = true;
        $rootScope.showListLine = true;
        $rootScope.showListRack = false;

        if ($rootScope.lineReload)
            $rootScope.reloadLine();
    }

    $rootScope.reloadFloor = function () {
        reloadData(false);
    }

    $rootScope.floorReload = true;
});
app.controller('listLine', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/productWarehouseManager/JTableLine",
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
                d.FloorCode = $rootScope.floorCode;
            },
            complete: function (data) {
                $rootScope.listLine = data.responseJSON.data;
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [2, 'asc'])
        .withOption('scrollY', "110px")
        //.withOption('scrollCollapse', true)
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.Id;
                    var lineCode = data.LineCode;
                    $rootScope.lineID = Id;
                    $rootScope.lineCode = lineCode;
                    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                        $scope.selected[data.Id] = !$scope.selected[data.Id];
                    } else {
                        var self = $(this).parent();
                        $('#tblDataLine').DataTable().$('tr.selected').removeClass('selected');
                        $('#tblDataLine').DataTable().$('tr>td.fa-check').removeClass('fa-check');
                        $(self).addClass('selected');
                    }
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.FileID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.FileID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('QR_Code').withTitle('QR Code').renderWith(function (data, type) {
        //return '<img src="data:image/png;base64,' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="40" width="40">';
        //return '<img src="' + qrCode + '" height="40" width="40">';
        return '<img src="../../../images/default/qrCode.png" height="40" width="40">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('L_Text').withTitle('{{"PWM_LIST_COL_TITLE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"PWM_LIST_COL_DESCRIBE" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('Tác vụ').renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-check"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red hidden"><i class="fa fa-trash"></i></button>';
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
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.add = function () {
        //var modalInstance = $uibModal.open({
        //    animation: true,
        //    templateUrl: ctxfolder + '/add.html',
        //    controller: 'add',
        //    backdrop: 'static',
        //    size: '65'
        //});
        //modalInstance.result.then(function (d) {

        //}, function () {
        //});
    }
    $scope.edit = function (id) {
        var model = {};
        var listdata = $('#tblDataLine').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id + "") {
                model = listdata[i];
                break;
            }
        }

        $rootScope.lineID = id;
        $rootScope.lineCode = model.LineCode;
        $rootScope.showListFloor = true;
        $rootScope.showListLine = true;
        $rootScope.showListRack = true;

        if ($rootScope.rackReload)
            $rootScope.reloadRack();
    }

    $rootScope.reloadLine = function () {
        reloadData(false);
    }
    $rootScope.lineReload = true;
});
app.controller('listRack', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/productWarehouseManager/JTableRack",
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
                d.LineCode = $rootScope.lineCode;
            },
            complete: function (data) {
                $rootScope.listRack = data.responseJSON.data;
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [2, 'asc'])
        .withOption('scrollY', "110px")
        //.withOption('scrollCollapse', true)
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.Id;
                    var rackCode = data.RackCode;
                    $rootScope.rackID = Id;
                    $rootScope.rackCode = rackCode;
                    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                        $scope.selected[data.Id] = !$scope.selected[data.Id];
                    } else {
                        var self = $(this).parent();
                        $('#tblDataRack').DataTable().$('tr.selected').removeClass('selected');
                        $('#tblDataRack').DataTable().$('tr>td.fa-check').removeClass('fa-check');
                        $(self).addClass('selected');
                    }
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.FileID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.FileID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('QR_Code').withTitle('QR Code').renderWith(function (data, type) {
        //return '<img src="data:image/png;base64,' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="40" width="40">';
        return '<img src="../../../images/default/qrCode.png" height="40" width="40">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('RackName').withTitle('{{"PWM_LIST_COL_TITLE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"PWM_LIST_COL_DESCRIBE" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('Tác vụ').renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-check"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red hidden"><i class="fa fa-trash"></i></button>';
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
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.add = function () {
        //var modalInstance = $uibModal.open({
        //    animation: true,
        //    templateUrl: ctxfolder + '/add.html',
        //    controller: 'add',
        //    backdrop: 'static',
        //    size: '65'
        //});
        //modalInstance.result.then(function (d) {

        //}, function () {
        //});
    }

    $scope.edit = function (id) {
        $rootScope.rackID = id;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/detail.html',
            controller: 'detail',
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

    $rootScope.reloadRack = function () {
        reloadData(false);
    }

    $rootScope.rackReload = true;
});

//Hiển thị ảnh khi click double vào Kho
app.controller('viewImage', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.initLoad = function () {
        var mapDesgin = document.getElementById("mapDesgin").files[0];
        if (mapDesgin != undefined) {
            var fileName = mapDesgin.name;
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                App.toastrError(caption.PWM_MSG_INVALID_IMG_FORMAT);
                return;
            } else {
                var reader = new FileReader();

                reader.onload = function (e) {
                    $('#viewImage').attr('src', e.target.result);
                }

                reader.readAsDataURL(mapDesgin);
            }
        } else {
            if (para != '') {
                $scope.image = para;
            } else {
                $scope.image = "/images/default/no_image.png";
            }
        }
    }
    $scope.initLoad();
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

//Thêm, Sửa, Xóa Tầng
app.controller('addFloor', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataservice) {
    console.log($rootScope.wareHouseCode);

    $scope.model = {
        FloorCode: '',
        FloorName: '',
        QR_Code: '',
        AreaSquare: '',
        MapDesgin: '',
        Note: '',
        Image: '',
        CNT_Line: '',
        Status: '',
        WHS_Code: '',
        ManagerId: '',
        Temperature: '',
        Humidity: ''
    }
    $scope.mapDesgin = "";
    $scope.imageFloor = "";
    $scope.listWareHouse = [];
    $scope.listManager = [];

    $scope.init = function () {
        dataservice.getListWareHouse(function (rs) {rs=rs.data;
            $scope.listWareHouse = rs;
            $scope.model.WHS_Code = $rootScope.wareHouseCode;
            console.log($scope.listWareHouse);
            console.log($scope.model.WHS_Code);
        });

        dataservice.getListStaffBranch(function (rs) {rs=rs.data;
            $scope.listManager = rs.Object;
        });
    }
    $scope.init();

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        if ($scope.addform.validate()) {
            var mapDesgin = document.getElementById("mapDesgin").files[0];
            if (mapDesgin != undefined) {
                var fileName = mapDesgin.name;
                var idxDot = fileName.lastIndexOf(".") + 1;
                var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
                if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                    App.toastrError(caption.PWM_MSG_INVALID_IMG_FORMAT);
                    return;
                } else {
                    $scope.mapDesgin = mapDesgin;
                }
            }

            var imageFloor = document.getElementById("imageFloor").files[0];
            if (imageFloor != undefined) {
                var fileName = imageFloor.name;
                var idxDot = fileName.lastIndexOf(".") + 1;
                var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
                if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                    App.toastrError(caption.PWM_MSG_INVALID_IMG_FORMAT);
                    return;
                } else {
                    $scope.imageFloor = imageFloor;
                }
            }
            var formData = new FormData();
            formData.append("imageFloor", imageFloor != undefined ? $scope.imageFloor : null);
            formData.append("mapDesgin", mapDesgin != undefined ? $scope.mapDesgin : null);
            formData.append("FloorCode", $scope.model.FloorCode);
            formData.append("FloorName", $scope.model.FloorName);
            formData.append("QR_Code", $scope.model.QR_Code);
            formData.append("AreaSquare", $scope.model.AreaSquare);
            formData.append("MapDesgin", $scope.model.MapDesgin);
            formData.append("Note", $scope.model.Note);
            formData.append("Image", $scope.model.Image);
            formData.append("CNT_Line", $scope.model.CNT_Line);
            formData.append("Status", $scope.model.Status);
            formData.append("WHS_Code", $scope.model.WHS_Code);
            formData.append("ManagerId", $scope.model.ManagerId);
            formData.append("Temperature", $scope.model.Temperature);
            formData.append("Humidity", $scope.model.Humidity);
            dataservice.insertFloor(formData, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                    $rootScope.reloadFloor();
                }
            });
        }
    }
    $scope.uploadImageMapDesgin = function () {
        var fileuploader = angular.element("#mapDesgin");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('mapDesginId').src = reader.result;
            }
            var files = fileuploader[0].files;
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click');
    }
    $scope.uploadImageFloor = function () {
        var fileuploader = angular.element("#imageFloor");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('imageFloorId').src = reader.result;
            }
            var files = fileuploader[0].files;
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click');
    }

    $scope.changeFloorName = function (floorName) {
        
        dataservice.genFloorCode($rootScope.wareHouseCode, floorName, function (rs) {rs=rs.data;
            $scope.model.FloorCode = rs;

            dataservice.generatorQRCode($scope.model.FloorCode, function (result) {result=result.data;
                $scope.model.QR_Code = result;
            });
        });
    };

    $scope.viewImage = function () {
        var url = $scope.model.MapDesgin;
        if (url != null) {
            var image = "https://www.kientrucadong.com/diendan/wp-content/uploads/2017/04/1-MAT-BANG-TANG-1-2.jpg";
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/viewImage.html',
                controller: 'viewImage',
                backdrop: 'static',
                size: '60',
                resolve: {
                    para: function () {
                        return url;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                $scope.reloadNoResetPage();
            }, function () {
            });
        }
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);

    $scope.print = function (qrCode) {
        if (qrCode != '') {
            var image = '<img src="data:image/png;base64,' + qrCode + '" width="125" height="125" /> ';
            var hiddenFrame = $('<iframe style="width:0;height:0;border:none"></iframe>').appendTo('body')[0];
            var doc = hiddenFrame.contentWindow.document.open("text/html", "replace");
            doc.write('<style>@page{margin:0;size: auto;}' +
                '.col-md-2{width: 16.66667%;float: left;}</style >' + '<body>' + image + '</body>');
            doc.close();
            setTimeout(function () {
                hiddenFrame.contentWindow.print();
            }, 250);
        } else {
            App.toastrError(caption.PWM_MSG_CREATE_QRCODE)
        }
    }
});
app.controller('editFloor', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, para, dataservice) {
    $scope.model = {
        FloorCode: '',
        FloorName: '',
        QR_Code: '',
        AreaSquare: '',
        MapDesgin: '',
        Note: '',
        Image: '',
        CNT_Line: '',
        Status: '',
        WHS_Code: '',
        ManagerId: '',
        Temperature: '',
        Humidity: ''
    }
    $scope.mapDesgin = "";
    $scope.imageFloor = "";
    $scope.listWareHouse = [];
    $scope.listManager = [];

    $scope.init = function () {
        var floorId = parseInt(para);
        dataservice.getFloorInfo(floorId, function (result) {result=result.data;
            $scope.model = result.Object;
        });

        dataservice.getListWareHouse(function (rs) {rs=rs.data;
            $scope.listWareHouse = rs;
        });

        dataservice.getListStaffBranch(function (rs) {rs=rs.data;
            $scope.listManager = rs.Object;
        });

        //dataservice.genFloorCode($rootScope.wareHouseCode, function (rs) {rs=rs.data;
        //    $scope.model.FloorCode = rs;

        //    dataservice.generatorQRCode($scope.model.FloorCode, function (result) {result=result.data;
        //        $scope.model.QR_Code = result;
        //    });
        //});
    }
    $scope.init();

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        if ($scope.editform.validate()) {
            var mapDesgin = document.getElementById("mapDesgin").files[0];
            if (mapDesgin != undefined) {
                var fileName = mapDesgin.name;
                var idxDot = fileName.lastIndexOf(".") + 1;
                var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
                if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                    App.toastrError(caption.PWM_MSG_INVALID_IMG_FORMAT);
                    return;
                } else {
                    $scope.mapDesgin = mapDesgin;
                }
            }

            var imageFloor = document.getElementById("imageFloor").files[0];
            if (imageFloor != undefined) {
                var fileName = imageFloor.name;
                var idxDot = fileName.lastIndexOf(".") + 1;
                var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
                if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                    App.toastrError(caption.PWM_MSG_INVALID_IMG_FORMAT);
                    return;
                } else {
                    $scope.imageFloor = imageFloor;
                }
            }
            var formData = new FormData();
            formData.append("imageFloor", imageFloor != undefined ? $scope.imageFloor : null);
            formData.append("mapDesgin", mapDesgin != undefined ? $scope.mapDesgin : null);
            formData.append("FloorCode", $scope.model.FloorCode);
            formData.append("FloorName", $scope.model.FloorName);
            formData.append("QR_Code", $scope.model.QR_Code);
            formData.append("AreaSquare", $scope.model.AreaSquare);
            formData.append("MapDesgin", $scope.model.MapDesgin);
            if ($scope.model.Note != null)
                formData.append("Note", $scope.model.Note);
            formData.append("Image", $scope.model.Image);
            formData.append("CNT_Line", $scope.model.CNT_Line);
            formData.append("Status", $scope.model.Status);
            formData.append("WHS_Code", $scope.model.WHS_Code);
            formData.append("ManagerId", $scope.model.ManagerId);
            formData.append("Temperature", $scope.model.Temperature);
            formData.append("Humidity", $scope.model.Humidity);
            dataservice.updateFloor(formData, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                    $rootScope.reloadFloor();
                }
            });
        }
    }
    $scope.uploadImageMapDesgin = function () {
        var fileuploader = angular.element("#mapDesgin");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('mapDesginId').src = reader.result;
            }
            var files = fileuploader[0].files;
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click');
    }
    $scope.uploadImageFloor = function () {
        var fileuploader = angular.element("#imageFloor");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('imageFloorId').src = reader.result;
            }
            var files = fileuploader[0].files;
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click');
    }

    $scope.viewImage = function () {
        var input = $('#mapDesgin');
        var url = $scope.model.MapDesgin;



        if (url != null) {
            var image = "https://www.kientrucadong.com/diendan/wp-content/uploads/2017/04/1-MAT-BANG-TANG-1-2.jpg";
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/viewImage.html',
                controller: 'viewImage',
                backdrop: 'static',
                size: '60',
                resolve: {
                    para: function () {
                        return url;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                $scope.reloadNoResetPage();
            }, function () {
            });
        }
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);

    $scope.print = function (qrCode) {
        debugger
        if (qrCode != '') {
            var image = '<img src="data:image/png;base64,' + qrCode + '" width="125" height="125" /> ';
            var hiddenFrame = $('<iframe style="width:0;height:0;border:none"></iframe>').appendTo('body')[0];
            var doc = hiddenFrame.contentWindow.document.open("text/html", "replace");
            doc.write('<style>@page{margin:0;size: auto;}' +
                '.col-md-2{width: 16.66667%;float: left;}</style >' + '<body>' + image + '</body>');
            doc.close();
            setTimeout(function () {
                hiddenFrame.contentWindow.print();
            }, 250);
        } else {
            App.toastrError(caption.PWM_MSG_CREATE_QRCODE)
        }
    }
});

//Thêm, Sửa, Xóa Dãy
app.controller('addLine', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataservice) {
    $scope.model = {
        LineCode: '',
        L_Text: '',
        QR_Code: '',
        L_Color: '',
        L_Position: '',
        Note: '',
        L_Size: '',
        CNT_Rack: '',
        Status: '',
    }
    $scope.listManager = [];
    $scope.listFloor = [];

    $scope.init = function () {
        dataservice.getListFloor(function (rs) {rs=rs.data;
            $scope.listFloor = rs;
            $scope.model.FloorCode = $rootScope.floorCode;
        });
    }
    $scope.init();

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        if ($scope.addform.validate()) {
            dataservice.insertLine($scope.model, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                    $rootScope.reloadLine();
                }
            });
        }
    }

    $scope.changeLineName = function (lineName) {
        dataservice.genLineCode($rootScope.floorCode, lineName, function (rs) {rs=rs.data;
            $scope.model.LineCode = rs;

            dataservice.generatorQRCode($scope.model.LineCode, function (result) {result=result.data;
                $scope.model.QR_Code = result;
            });
        });
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);

    $scope.print = function (qrCode) {
        if (qrCode != '') {
            var image = '<img src="data:image/png;base64,' + qrCode + '" width="125" height="125" /> ';
            var hiddenFrame = $('<iframe style="width:0;height:0;border:none"></iframe>').appendTo('body')[0];
            var doc = hiddenFrame.contentWindow.document.open("text/html", "replace");
            doc.write('<style>@page{margin:0;size: auto;}' +
                '.col-md-2{width: 16.66667%;float: left;}</style >' + '<body>' + image + '</body>');
            doc.close();
            setTimeout(function () {
                hiddenFrame.contentWindow.print();
            }, 250);
        } else {
            App.toastrError(caption.PWM_MSG_CREATE_QRCODE)
        }
    }
});
app.controller('editLine', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataservice, para) {
    $scope.model = {
        LineCode: '',
        L_Text: '',
        QR_Code: '',
        L_Color: '',
        L_Position: '',
        Note: '',
        L_Size: '',
        CNT_Rack: '',
        Status: '',
    }
    $scope.listFloor = [];

    $scope.init = function () {
        var lineId = parseInt(para);
        dataservice.getLineInfo(lineId, function (result) {result=result.data;
            $scope.model = result.Object;
        });

        dataservice.getListFloor(function (rs) {rs=rs.data;
            $scope.listFloor = rs;
        });
    }
    $scope.init();

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        if ($scope.editform.validate()) {
            dataservice.updateLine($scope.model, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                    $rootScope.reloadLine();
                }
            });
        }
    }

    $scope.changeLineName = function (lineName) {
        dataservice.genLineCode($rootScope.floorCode, lineName, function (rs) {rs=rs.data;
            $scope.model.LineCode = rs;

            dataservice.generatorQRCode($scope.model.LineCode, function (result) {result=result.data;
                $scope.model.QR_Code = result;
            });
        });
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);

    $scope.print = function (qrCode) {
        if (qrCode != '') {
            var image = '<img src="data:image/png;base64,' + qrCode + '" width="125" height="125" /> ';
            var hiddenFrame = $('<iframe style="width:0;height:0;border:none"></iframe>').appendTo('body')[0];
            var doc = hiddenFrame.contentWindow.document.open("text/html", "replace");
            doc.write('<style>@page{margin:0;size: auto;}' +
                '.col-md-2{width: 16.66667%;float: left;}</style >' + '<body>' + image + '</body>');
            doc.close();
            setTimeout(function () {
                hiddenFrame.contentWindow.print();
            }, 250);
        } else {
            App.toastrError(caption.PWM_MSG_CREATE_QRCODE)
        }
    }
});

//Thêm, Sửa, Xóa Kệ
app.controller('addRack', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataservice) {
    $scope.model = {
        RackCode: '',
        RackName: '',
        QR_Code: '',
        Material: '',
        R_Position: '',
        Note: '',
        R_Size: '',
        CNT_Box: '',
        R_Status: '',
        Ordering: '',
        CNT_Cell: '',
    }
    $scope.listLine = [];

    $scope.init = function () {
        dataservice.getListLine(function (rs) {rs=rs.data;
            $scope.listLine = rs;
            $scope.model.LineCode = $rootScope.lineCode;
        });
    }
    $scope.init();

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        if ($scope.addform.validate()) {
            dataservice.insertRack($scope.model, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                    $rootScope.reloadRack();
                }
            });
        }
    }

    $scope.changeRackName = function (rackName) {
        dataservice.genRackCode($rootScope.lineCode, rackName, function (rs) {rs=rs.data;
            $scope.model.RackCode = rs;

            dataservice.generatorQRCode($scope.model.RackCode, function (result) {result=result.data;
                $scope.model.QR_Code = result;
            });
        });
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);

    $scope.print = function (qrCode) {
        if (qrCode != '') {
            var image = '<img src="data:image/png;base64,' + qrCode + '" width="125" height="125" /> ';
            var hiddenFrame = $('<iframe style="width:0;height:0;border:none"></iframe>').appendTo('body')[0];
            var doc = hiddenFrame.contentWindow.document.open("text/html", "replace");
            doc.write('<style>@page{margin:0;size: auto;}' +
                '.col-md-2{width: 16.66667%;float: left;}</style >' + '<body>' + image + '</body>');
            doc.close();
            setTimeout(function () {
                hiddenFrame.contentWindow.print();
            }, 250);
        } else {
            App.toastrError(caption.PWM_MSG_CREATE_QRCODE)
        }
    }
});
app.controller('editRack', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataservice, para) {
    $scope.model = {
        RackCode: '',
        RackName: '',
        QR_Code: '',
        Material: '',
        R_Position: '',
        Note: '',
        R_Size: '',
        CNT_Box: '',
        R_Status: '',
        Ordering: '',
        CNT_Cell: '',
    }
    $scope.listLine = [];

    $scope.init = function () {
        var rackId = parseInt(para);
        dataservice.getRackInfo(rackId, function (result) {result=result.data;
            $scope.model = result.Object;
        });

        dataservice.getListLine(function (rs) {rs=rs.data;
            $scope.listLine = rs;
        });
    }
    $scope.init();

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        if ($scope.editform.validate()) {
            dataservice.updateRack($scope.model, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                    $rootScope.reloadRack();
                }
            });
        }
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);

    $scope.print = function (qrCode) {
        if (qrCode != '') {
            var image = '<img src="data:image/png;base64,' + qrCode + '" width="125" height="125" /> ';
            var hiddenFrame = $('<iframe style="width:0;height:0;border:none"></iframe>').appendTo('body')[0];
            var doc = hiddenFrame.contentWindow.document.open("text/html", "replace");
            doc.write('<style>@page{margin:0;size: auto;}' +
                '.col-md-2{width: 16.66667%;float: left;}</style >' + '<body>' + image + '</body>');
            doc.close();
            setTimeout(function () {
                hiddenFrame.contentWindow.print();
            }, 250);
        } else {
            App.toastrError(caption.PWM_MSG_CREATE_QRCODE)
        }
    }
});

app.controller('addBox', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataservice, $timeout) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $timeout(function () {
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 100);
});

app.controller('detail', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $rootScope.Id = para;
    $scope.resultChoose = '';
    var warehouseName = '';
    var floorName = '';
    var lineName = '';
    var rackName = '';
    $scope.initData = function () {
        warehouseName = $rootScope.listWareHouse.find(x => x.Id === "" + $rootScope.wareHouseID).WHS_Name;
        floorName = $rootScope.listFloor.find(x => x.Id === "" + $rootScope.floorID).FloorName;
        lineName = $rootScope.listLine.find(x => x.Id === "" + $rootScope.lineID).L_Text;
        rackName = $rootScope.listRack.find(x => x.Id === "" + $rootScope.rackID).Title;

        $scope.resultChoose = caption.PWM_MSG_BOX_POSITION + warehouseName + " - " + floorName + " - " + lineName + " - " + rackName;
    }
    $scope.initData();
    $scope.initLoad = function () {
        $scope.model = para;
    }
    $scope.initLoad();
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('detailWareHouse', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para) {
    $scope.QR_Code = '';
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.initData = function () {
        dataservice.getWareHouseById(para, function (rs) {rs=rs.data;
            $scope.model = rs;
            dataservice.generatorQRCode($scope.model.StoreCode, function (result) {result=result.data;
                $scope.QR_Code = result;
            });
        });
    }
    $scope.initData();
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
