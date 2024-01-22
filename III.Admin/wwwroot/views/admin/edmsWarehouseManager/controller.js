var ctxfolder = "/views/admin/edmsWarehouseManager";
var ctxfolderMessage = "/views/message-box";
var ctxfolderQrCode = "/views/admin/edmsQRCodeManager";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber', 'ngTagsInput', 'monospaced.qrcode']);
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
        getListWareHouse: function (data, callback) {
            $http.get('/Admin/EDMSWareHouseManager/GetListWareHouse?type=' + data, callback).then(callback);
        },
        getListFloor: function (callback) {
            $http.get('/Admin/EDMSWareHouseManager/GetListFloor', callback).then(callback);
        },
        getListLine: function (callback) {
            $http.get('/Admin/EDMSWareHouseManager/GetListLine', callback).then(callback);
        },

        //Chi tiết 1 kho
        getDetailWareHouse: function (data, callback) {
            $http.get('/Admin/EDMSWareHouseManager/GetDetailWareHouse?wareHouseCode=' + data).then(callback);
        },

        //Danh sách người quản lý
        getListManager: function (callback) {
            $http.get('/Admin/EDMSWareHouseManager/GetListManager', callback).then(callback);
        },
        //List danh sách nhân viên (người quản lý)
        getListStaffBranch: function (callback) {
            $http.post('/Admin/EDMSWareHouseManager/GetListStaffBranch/', callback).then(callback);
        },
        //Sinh mã tầng tự động
        genFloorCode: function (wareHouseCode, floorName, callback) {
            $http.get('/Admin/EDMSWareHouseManager/GenFloorCode?wareHouseCode=' + wareHouseCode + '&floorName=' + floorName, callback).then(callback);
        },
        genLineCode: function (floorCode, lineName, callback) {
            $http.get('/Admin/EDMSWareHouseManager/GenLineCode?floorCode=' + floorCode + '&lineName=' + lineName, callback).then(callback);
        },
        genRackCode: function (lineCode, rackName, callback) {
            $http.get('/Admin/EDMSWareHouseManager/GenRackCode?lineCode=' + lineCode + '&rackName=' + rackName, callback).then(callback);
        },

        //Sinh mã QR_CODE
        generatorQRCode: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseManager/GenQRCode?code=' + data, callback).then(callback);
        },

        //Thêm sửa xóa tầng
        insertFloor: function (data, callback) {
            submitFormUpload('/Admin/EDMSWareHouseManager/InsertFloor', data, callback);
        },
        getFloorInfo: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseManager/GetFloorInfo?floorId=' + data).then(callback);
        },
        updateFloor: function (data, callback) {
            submitFormUpload('/Admin/EDMSWareHouseManager/UpdateFloor', data, callback);
        },
        deleteFloor: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseManager/DeleteFloor?floorId=' + data).then(callback);
        },

        //Thêm sửa xóa dãy
        insertLine: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseManager/InsertLine', data, callback).then(callback);
        },
        getLineInfo: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseManager/GetLineInfo?lineId=' + data).then(callback);
        },
        updateLine: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseManager/UpdateLine', data).then(callback);
        },
        deleteLine: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseManager/DeleteLine?lineId=' + data).then(callback);
        },

        //Thêm sửa xóa kệ
        insertRack: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseManager/InsertRack', data, callback).then(callback);
        },
        getRackInfo: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseManager/GetRackInfo?rackId=' + data).then(callback);
        },
        updateRack: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseManager/UpdateRack', data).then(callback);
        },
        deleteRack: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseManager/DeleteRack?rackId=' + data).then(callback);
        },

        //Thêm sửa xóa thùng
        insertBox: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseManager/InsertBox', data, callback).then(callback);
        },
        updateBox: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseManager/UpdateBox', data).then(callback);
        },
        deleteItemBoxs: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseManager/DeleteItemBoxs', data).then(callback);
        },
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $filter, $location, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $rootScope.checkData = function (data) {
            var partternNumber = /^[1-9]\d*(\\d+)?$/;
            var mess = { Status: false, Title: "" }
            if (!partternNumber.test(data.CNT_Box)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.EDMSWM_VALIDATE_BOX_NUMBER, "<br/>");
            }
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                CNT_Line: {
                    required: true
                },
                FloorCode: {
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
                RackCode: {
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
                    required: caption.EDMSWM_VALIDATE_CNT_LINE
                },
                FloorCode: {
                    required: 'Tầng yêu cầu bắt buộc!'
                },
                FloorName: {
                    required: caption.EDMSWM_VALIDATE_FLOOR_NAME
                },
                AreaSquare: {
                    required: caption.EDMSWM_VALIDATE_AREA_SQUARE
                },
                LineCode: {
                    required: caption.EDMSWM_VALIDATE_LINE_CODE
                },
                CNT_Rack: {
                    required: caption.EDMSWM_VALIDATE_CNT_RACK
                },
                L_Text: {
                    required: caption.EDMSWM_VALIDATE_LINE_TEXT
                },
                RackCode: {
                    required: 'Mã kệ yêu cầu bắt buộc!'
                },
                RackName: {
                    required: caption.EDMSWM_VALIDATE_RACK_NAME
                },
                CNT_Box: {
                    required: caption.EDMSWM_VALIDATE_CNT_BOX
                }
            }
        }
        $rootScope.IsTranslate = true;
    });
    //$rootScope.validationOptions = {
    //    rules: {
    //        CNT_Line: {
    //            required: true
    //        },
    //        FloorName: {
    //            required: true
    //        },
    //        AreaSquare: {
    //            required: true
    //        },
    //        LineCode: {
    //            required: true
    //        },
    //        CNT_Rack: {
    //            required: true
    //        },
    //        L_Text: {
    //            required: true
    //        },
    //        RackName: {
    //            required: true
    //        },
    //        CNT_Box: {
    //            required: true
    //        }
    //    },
    //    messages: {
    //        CNT_Line: {
    //            required: caption.EDMSWM_VALIDATE_CNT_LINE
    //        },
    //        FloorName: {
    //            required: caption.EDMSWM_VALIDATE_FLOOR_NAME
    //        },
    //        AreaSquare: {
    //            required: caption.EDMSWM_VALIDATE_AREA_SQUARE
    //        },
    //        LineCode: {
    //            required: caption.EDMSWM_VALIDATE_LINE_CODE
    //        },
    //        CNT_Rack: {
    //            required: caption.EDMSWM_VALIDATE_CNT_RACK
    //        },
    //        L_Text: {
    //            required: caption.EDMSWM_VALIDATE_LINE_TEXT
    //        },
    //        RackName: {
    //            required: caption.EDMSWM_VALIDATE_RACK_NAME
    //        },
    //        CNT_Box: {
    //            required: caption.EDMSWM_VALIDATE_CNT_BOX
    //        }
    //    }
    //}

    //$rootScope.showListWarehouse = true;
    //$rootScope.showListFloor = true;
    //$rootScope.showListLine = true;
    //$rootScope.showListRack = true;

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
    $rootScope.Type = type;

    $rootScope.change_alias = function (alias) {
        var str = alias;
        str = str.toLowerCase();
        str = str.replace(/ /g, "");
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
        str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, "");
        str = str.replace(/ + /g, "");
        str = str.trim();
        return str.toUpperCase();
    }
});
app.config(function ($routeProvider, $validatorProvider, $httpProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/EDMSWareHouseManager/Translation');
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
            keyboard: true,
            backdrop: false,
            //backdrop: 'static',
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
            App.toastrError(caption.EDMSWM_VALIDATE_CHOOSE_FLOOR_EDIT);
        }
    }

    $scope.deleteFloor = function () {
        var floorId = $rootScope.floorID;
        if (floorId != null) {
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
                windowClass: "message-center",
                controller: function ($scope, $uibModalInstance) {
                    $scope.message = "Bạn có chắn chắn xóa tầng ?";
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
            App.toastrError(caption.EDMSWM_VALIDATE_CHOOSE_FLOOR_DELETE);
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
            App.toastrError(caption.EDMSWM_VALIDATE_CHOOSE_LINE_EDIT);
        }
    }

    $scope.deleteLine = function () {
        var lineId = $rootScope.lineID;
        if (lineId != null) {
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
                windowClass: "message-center",
                controller: function ($scope, $uibModalInstance) {
                    $scope.message = "Bạn có chắn chắn xóa dãy ?";
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
            App.toastrError(caption.EDMSWM_VALIDATE_CHOOSE_LINE_DELETE);
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
            App.toastrError(caption.EDMSWM_VALIDATE_CHOOSE_RACK_EDIT);
        }
    }

    $scope.deleteRack = function () {
        var rackId = $rootScope.rackID;
        if (rackId != null) {
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
                windowClass: "message-center",
                controller: function ($scope, $uibModalInstance) {
                    $scope.message = "Bạn có chắn chắn xóa kệ ?";
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
            App.toastrError(caption.EDMSWM_VALIDATE_CHOOSE_RACK_DELETE);
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
        $rootScope.wareHouseCode = model.WHS_Code;
        $rootScope.floorCode = '';
        $rootScope.lineCode = '';
        //$rootScope.showListFloor = true;
        //$rootScope.showListLine = false;
        //$rootScope.showListRack = false;
        if ($rootScope.floorReload)
            $rootScope.reloadFloor();
    }
});
app.controller('listWarehouse', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, $location) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSWarehouseManager/JTable",
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
                d.Type = $rootScope.Type;
            },
            complete: function (data) {
                $rootScope.listWareHouse = data.responseJSON.data;
                $rootScope.wareHouseCode = $rootScope.listWareHouse[0].WHS_Code;
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [1, 'desc'])
        //.withOption('scrollX', "none")
        .withOption('scrollY', "220px")
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
                //$rootScope.showListFloor = true;
            }
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);

            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
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
                                    return data.WHS_Code;
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
                    $rootScope.wareHouseCode = data.WHS_Code;

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
    vm.dtColumns.push(DTColumnBuilder.newColumn('QR_Code').withOption('sClass', 'dataTable-w80').withTitle($translate('EDMSWM_COL_QR_CODE')).renderWith(function (data, type, full) {
        //return '<img src="' + data + '" height="40" width="40">';
        return '<qrcode role="button" ng-click="viewQrCodeWarehouse(\'' + full.WHS_Code + '\')" data=' + full.WHS_Code + ' size="35"></qrcode>'

    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('WHS_Name').withTitle($translate('EDMSWM_COL_WHS_NAME')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('WHS_DesginMap').withOption('sClass', 'dataTable-w80').withTitle($translate('EDMSWM_COL_WHS_DESIGNMAP')).renderWith(function (data, type, full) {
        //return '<img src="' + data + '" height="40" width="40">';
        return '<img src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="40" width="40">';
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'dataTable-w80').withTitle($translate('EDMSWM_COL_ACTION')).renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-check"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red hidden"><i class="fa fa-trash"></i></button>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
        $rootScope.reloadFloor();
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
    $scope.viewQrCodeWarehouse = function (code) {
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
});
app.controller('listFloor', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, $location) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSWarehouseManager/JTableFloor",
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
                d.WareHouseCode = $rootScope.wareHouseCode;
            },
            complete: function (data) {
                $rootScope.listFloor = data.responseJSON.data;
                App.unblockUI("#contentMain");
                $scope.$apply();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [2, 'asc'])
        .withOption('scrollY', "220px")
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('QR_Code').withTitle($translate('EDMSWM_COL_QR_CODE')).renderWith(function (data, type) {
        //return '<img src="data:image/png;base64,' + data + '" height="40" width="40">';
        //return '<img role="button" ng-click="viewQrCodeFloor(\'' + data + '\')" src="../../../images/default/qrCode.png" height="40" width="40">';
        //return '<img src="data:image/png;base64,' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="40" width="40">';
        return '<qrcode role="button" ng-click="viewQrCodeFloor(\'' + data + '\')" data=' + data + ' size="35"></qrcode>'
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FloorName').withTitle($translate('EDMSWM_COL_WHS_NAME')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('MapDesgin').withTitle($translate('EDMSWM_COL_MAP_DESIGN')).renderWith(function (data, type, full) {
        //return '<img src="' + data + '" height="40" width="40">';
        return '<img src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="40" width="40">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle($translate('EDMSWM_COL_ACTION')).renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-check"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red hidden"><i class="fa fa-trash"></i></button>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
        $rootScope.reloadLine();
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
        $rootScope.lineCode = '';
        //$rootScope.showListFloor = true;
        //$rootScope.showListLine = true;
        //$rootScope.showListRack = false;

        if ($rootScope.lineReload)
            $rootScope.reloadLine();
    }
    $scope.viewQrCodeFloor = function (code) {
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

    $rootScope.reloadFloor = function () {
        reloadData(false);
    }

    $rootScope.floorReload = true;
});
app.controller('listLine', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location, $translate) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSWarehouseManager/JTableLine",
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
                $scope.$apply();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [2, 'asc'])
        .withOption('scrollY', "220px")
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('QR_Code').withTitle($translate('EDMSWM_COL_QR_CODE')).renderWith(function (data, type, full) {
        //return '<img src="data:image/png;base64,' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="40" width="40">';
        //return '<img src="' + qrCode + '" height="40" width="40">';
        return '<qrcode role="button" ng-click="viewQrCodeLine(\'' + data + '\')" data=' + data + ' size="35"></qrcode>'
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('L_Text').withTitle($translate('EDMSWM_COL_L_TEXT')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle($translate('EDMSWM_COL_NOTE')).renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle($translate('EDMSWM_COL_ACTION')).renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-check"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red hidden"><i class="fa fa-trash"></i></button>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
        $rootScope.reloadRack();
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
        //$rootScope.showListFloor = true;
        //$rootScope.showListLine = true;
        //$rootScope.showListRack = true;

        if ($rootScope.rackReload)
            $rootScope.reloadRack();
    }

    $rootScope.reloadLine = function () {
        reloadData(false);
    }
    $rootScope.lineReload = true;
    $scope.viewQrCodeLine = function (code) {
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
});
app.controller('listRack', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location, $translate) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSWarehouseManager/JTableRack",
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
        .withOption('scrollY', "220px")
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('QR_Code').withTitle($translate('EDMSWM_COL_QR_CODE')).renderWith(function (data, type) {
        //return '<img src="data:image/png;base64,' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="40" width="40">';
        //return '<img src="../../../images/default/qrCode.png" height="40" width="40">';
        return '<qrcode role="button" ng-click="viewQrCodeRack(\'' + data + '\')" data=' + data + ' size="35"></qrcode>'
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('RackName').withTitle($translate('EDMSWM_COL_RACK_NAME')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle($translate('EDMSWM_COL_NOTE')).renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle($translate('EDMSWM_COL_ACTION')).renderWith(function (data, type, full) {
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
    $scope.viewQrCodeRack = function (code) {
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
                App.toastrError(caption.EDMSWM_MSG_ERR_IMG_FOMAT);
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
    $scope.model = {
        FloorCode: '',
        FloorName: '',
        QR_Code: '',
        AreaSquare: '',
        MapDesgin: '',
        Note: '',
        Image: '',
        CNT_Line: '',
        Status: "1",
        WHS_Code: '',
        ManagerId: '',
        Temperature: '',
        Humidity: ''
    }
    $scope.QR_Code = '';
    $scope.mapDesgin = "";
    $scope.imageFloor = "";
    $scope.listWareHouse = [];
    $scope.listManager = [];

    $scope.init = function () {
        dataservice.getListWareHouse($rootScope.Type, function (rs) {rs=rs.data;
            $scope.listWareHouse = rs;
            $scope.model.WHS_Code = $rootScope.wareHouseCode;
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
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            var mapDesgin = document.getElementById("mapDesgin").files[0];
            if (mapDesgin != undefined) {
                var fileName = mapDesgin.name;
                var idxDot = fileName.lastIndexOf(".") + 1;
                var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
                if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                    App.toastrError(caption.EDMSWM_MSG_ERR_IMG_FOMAT);
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
                    App.toastrError(caption.EDMSWM_MSG_ERR_IMG_FOMAT);
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
                    //$uibModalInstance.close();
                    $uibModalInstance.dismiss('cancel');
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

    $scope.changeFloorCode = function () {
        if ($('#FloorCode').valid()) {
            $('#FloorCode').removeClass('invalid').addClass('success');
        }
    }
    $scope.changeFloorName = function (floorName) {
        floorName = $rootScope.change_alias(floorName);

        dataservice.genFloorCode($rootScope.wareHouseCode, floorName, function (rs) {rs=rs.data;
            $scope.model.FloorCode = rs;
            $("#FloorCode").val(rs);
            $scope.changeFloorCode();
            dataservice.generatorQRCode($scope.model.FloorCode, function (result) {result=result.data;
                $scope.QR_Code = result;
            });
        });
    };

    //Action khi chọn 1 combobox
    $scope.changleSelect = function (SelectType, item) {
        if (SelectType == "ManagerId") {
            if ($scope.model.ManagerId != undefined && $scope.model.ManagerId != null && $scope.model.ManagerId != '') {
                $scope.errorManagerId = false;
            }
        }
    }

    //Validate UiSelect
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.ManagerId == undefined || data.ManagerId == null || data.ManagerId == '') {
            $scope.errorManagerId = true;
            mess.Status = true;
        } else {
            $scope.errorManagerId = false;
        }

        return mess;
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
            var mainWindow = window.open('', '');
            mainWindow.document.write('<html><head><title></title>');
            mainWindow.document.write('<style type="text/css" media="print">@page {size: auto; margin: 0mm;}' +
                '.col-md-2{width: 16.66667%;float: left;} .textQr{font-family:verdana, arial, sans-serif;font-size:6px;word-break:break-all;}</style >');
            mainWindow.document.write('</head><body onload="window.print();window.close()">');
            mainWindow.document.write(image);
            mainWindow.document.write('</body></html>');
            mainWindow.document.close();
        } else {
            App.toastrError(caption.EDMSWM_MSG_ERR_PRINT)
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
    $scope.QR_Code = '';
    $scope.mapDesgin = "";
    $scope.imageFloor = "";
    $scope.listWareHouse = [];
    $scope.listManager = [];

    $scope.init = function () {
        var floorId = parseInt(para);
        dataservice.getFloorInfo(floorId, function (result) {result=result.data;
            $scope.model = result.Object;
            dataservice.generatorQRCode($scope.model.FloorCode, function (result) {result=result.data;
                $scope.QR_Code = result;
            });
        });

        dataservice.getListWareHouse($rootScope.Type, function (rs) {rs=rs.data;
            $scope.listWareHouse = rs;
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
        if ($scope.editform.validate()) {
            var mapDesgin = document.getElementById("mapDesgin").files[0];
            if (mapDesgin != undefined) {
                var fileName = mapDesgin.name;
                var idxDot = fileName.lastIndexOf(".") + 1;
                var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
                if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                    App.toastrError(caption.EDMSWM_MSG_ERR_IMG_FOMAT);
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
                    App.toastrError(caption.EDMSWM_MSG_ERR_IMG_FOMAT);
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
            if ($scope.model.Temperature != null)
                formData.append("Temperature", $scope.model.Temperature);
            if ($scope.model.Humidity != null)
                formData.append("Humidity", $scope.model.Humidity);
            dataservice.updateFloor(formData, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    //$uibModalInstance.close();
                    $uibModalInstance.dismiss('cancel');
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
        if (qrCode != '') {
            var image = '<img src="data:image/png;base64,' + qrCode + '" width="125" height="125" /> ';
            var mainWindow = window.open('', '');
            mainWindow.document.write('<html><head><title></title>');
            mainWindow.document.write('<style type="text/css" media="print">@page {size: auto; margin: 0mm;}' +
                '.col-md-2{width: 16.66667%;float: left;} .textQr{font-family:verdana, arial, sans-serif;font-size:6px;word-break:break-all;}</style >');
            mainWindow.document.write('</head><body onload="window.print();window.close()">');
            mainWindow.document.write(image);
            mainWindow.document.write('</body></html>');
            mainWindow.document.close();
        } else {
            App.toastrError(caption.EDMSWM_MSG_ERR_PRINT)
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
        L_Status: '1',
    }
    $scope.QR_Code = '';
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
        validationSelect($scope.model)
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            dataservice.insertLine($scope.model, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.dismiss('cancel');
                    $rootScope.reloadLine();
                }
            });
        }
    }
    $scope.changeLineCode = function () {
        if ($('#LineCode').valid()) {
            $('#LineCode').removeClass('invalid').addClass('success');
        }
    }
    $scope.changeLineName = function (lineName) {
        lineName = $rootScope.change_alias(lineName);
        dataservice.genLineCode($rootScope.floorCode, lineName, function (rs) {rs=rs.data;
            $scope.model.LineCode = rs;
            $("#LineCode").val(rs);
            $scope.changeLineCode();
            dataservice.generatorQRCode($scope.model.LineCode, function (result) {result=result.data;
                $scope.QR_Code = result;
            });
        });
    };
    $scope.print = function (qrCode) {
        if (qrCode != '') {
            var image = '<img src="data:image/png;base64,' + qrCode + '" width="125" height="125" /> ';
            var mainWindow = window.open('', '');
            mainWindow.document.write('<html><head><title></title>');
            mainWindow.document.write('<style type="text/css" media="print">@page {size: auto; margin: 0mm;}' +
                '.col-md-2{width: 16.66667%;float: left;} .textQr{font-family:verdana, arial, sans-serif;font-size:6px;word-break:break-all;}</style >');
            mainWindow.document.write('</head><body onload="window.print();window.close()">');
            mainWindow.document.write(image);
            mainWindow.document.write('</body></html>');
            mainWindow.document.close();
        } else {
            App.toastrError(caption.EDMSWM_MSG_ERR_PRINT)
        }
    }
    function validationSelect(data) {
        
        var mess = { Status: false, Title: "" }
        if (data.L_Status == undefined || data.L_Status == null || data.L_Status == "") {
            $scope.errorL_Status = true;
            mess.Status = true;
        } else {
            $scope.errorL_Status = false;
        }
        return mess;
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
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
        L_Status: '',
    }
    $scope.QR_Code = '';
    $scope.listFloor = [];

    $scope.init = function () {
        var lineId = parseInt(para);
        dataservice.getLineInfo(lineId, function (result) {result=result.data;
            $scope.model = result.Object;
            dataservice.generatorQRCode($scope.model.LineCode, function (result) {result=result.data;
                $scope.QR_Code = result;
            });
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
        validationSelect($scope.model)
        if ($scope.editform.validate() && !validationSelect($scope.model).Status) {
            dataservice.updateLine($scope.model, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.dismiss('cancel');
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
            var mainWindow = window.open('', '');
            mainWindow.document.write('<html><head><title></title>');
            mainWindow.document.write('<style type="text/css" media="print">@page {size: auto; margin: 0mm;}' +
                '.col-md-2{width: 16.66667%;float: left;} .textQr{font-family:verdana, arial, sans-serif;font-size:6px;word-break:break-all;}</style >');
            mainWindow.document.write('</head><body onload="window.print();window.close()">');
            mainWindow.document.write(image);
            mainWindow.document.write('</body></html>');
            mainWindow.document.close();
        } else {
            App.toastrError(caption.EDMSWM_MSG_ERR_PRINT)
        }
    }
    function validationSelect(data) {

        var mess = { Status: false, Title: "" }
        if (data.L_Status == undefined || data.L_Status == null || data.L_Status == '') {
            $scope.errorL_Status = true;
            mess.Status = true;
        } else {
            $scope.errorL_Status = false;
        }
        return mess;
    };

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
        R_Status: '1',
        Ordering: '',
        CNT_Cell: '',
    }
    $scope.QR_Code = '';
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
            var msg = $rootScope.checkData($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
            dataservice.insertRack($scope.model, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.dismiss('cancel');
                    $rootScope.reloadRack();
                }
            });
        }
    }

    $scope.changeRackCode = function () {
        if ($('#RackCode').valid()) {
            $('#RackCode').removeClass('invalid').addClass('success');
        }
    }
    $scope.changeRackName = function (rackName) {
        rackName = $rootScope.change_alias(rackName);
        dataservice.genRackCode($rootScope.lineCode, rackName, function (rs) {rs=rs.data;
            $scope.model.RackCode = rs;
            $("#RackCode").val(rs);
            $scope.changeRackCode();
            dataservice.generatorQRCode($scope.model.RackCode, function (result) {result=result.data;
                $scope.QR_Code = result;
            });
        });
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);

    $scope.print = function (qrCode) {
        if (qrCode != '') {
            var image = '<img src="data:image/png;base64,' + qrCode + '" width="125" height="125" /> ';
            var mainWindow = window.open('', '');
            mainWindow.document.write('<html><head><title></title>');
            mainWindow.document.write('<style type="text/css" media="print">@page {size: auto; margin: 0mm;}' +
                '.col-md-2{width: 16.66667%;float: left;} .textQr{font-family:verdana, arial, sans-serif;font-size:6px;word-break:break-all;}</style >');
            mainWindow.document.write('</head><body onload="window.print();window.close()">');
            mainWindow.document.write(image);
            mainWindow.document.write('</body></html>');
            mainWindow.document.close();
        } else {
            App.toastrError(caption.EDMSWM_MSG_ERR_PRINT)
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
    $scope.QR_Code = '';
    $scope.listLine = [];

    $scope.init = function () {
        var rackId = parseInt(para);
        dataservice.getRackInfo(rackId, function (result) {result=result.data;
            $scope.model = result.Object;
            dataservice.generatorQRCode($scope.model.RackCode, function (result) {result=result.data;
                $scope.QR_Code = result;
            });
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
            var msg = $rootScope.checkData($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
            dataservice.updateRack($scope.model, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.dismiss('cancel');
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
            var mainWindow = window.open('', '');
            mainWindow.document.write('<html><head><title></title>');
            mainWindow.document.write('<style type="text/css" media="print">@page {size: auto; margin: 0mm;}' +
                '.col-md-2{width: 16.66667%;float: left;} .textQr{font-family:verdana, arial, sans-serif;font-size:6px;word-break:break-all;}</style >');
            mainWindow.document.write('</head><body onload="window.print();window.close()">');
            mainWindow.document.write(image);
            mainWindow.document.write('</body></html>');
            mainWindow.document.close();
        } else {
            App.toastrError(caption.EDMSWM_MSG_ERR_PRINT)
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

        rackName = $rootScope.listRack.find(x => x.Id === "" + $rootScope.rackID).RackName;
        $scope.resultChoose = "Vị trí của hộp nằm trong " + warehouseName + " - " + floorName + " - " + lineName + " - " + rackName;
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

    //Sức chứa tầng, dãy, kệ
    $scope.cntLine = 0;
    $scope.cntRack = 0;
    $scope.cntBox = 0;
    $scope.cntBoxEmty = 0;//Sức chứa còn lại

    //Lấy ra số tầng dãy kệ
    $scope.qtyFloor = 0;
    $scope.qtyLine = 0;
    $scope.qtyRack = 0;

    $scope.initData = function () {
        dataservice.getDetailWareHouse(para, function (rs) {rs=rs.data;
            
            $scope.model = rs.model;
            //Sức chứa tầng, dãy, kệ
            $scope.cntLine = rs.cntLine;
            $scope.cntRack = rs.cntRack;
            $scope.cntBox = rs.cntBox;
            $scope.cntBoxEmty = rs.cntBoxEmty;

            //Lấy ra số tầng dãy kệ
            $scope.qtyFloor = rs.qtyFloor;
            $scope.qtyLine = rs.qtyLine;
            $scope.qtyRack = rs.qtyRack;
            $scope.qtyBox = rs.qtyBox;

            dataservice.generatorQRCode($scope.model.WHS_Code, function (result) {result=result.data;
                $scope.QR_Code = result;
            });
        });
    }
    $scope.initData();
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
