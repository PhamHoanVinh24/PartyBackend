var ctxfolder = "/views/admin/edmsSendReceiptProfile";
var ctxfolderCommonSetting = "/views/admin/commonSetting";
var ctxfolderMessage = "/views/message-box";
var ctxfolderQrCode = "/views/admin/edmsQRCodeManager";

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
app.factory('httpResponseInterceptor', ['$q', '$rootScope', '$location', function ($q, $rootScope, $location) {
    return {
        responseError: function (rejection) {
            if (rejection.status === 401) {
                var url = "/Home/Logout";
                location.href = url;
            }
            return $q.reject(rejection);
        }
    };
}]);
app.service('myService', function () {
    var data;
    this.setData = function (d) {
        data = d;
    }
    this.getData = function () {
        return data;
    }
});
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
            beforeSend: function () {
                App.blockUI({
                    target: "#contentFile",
                    boxed: true,
                    message: 'loading...'
                });
            },
            complete: function () {
                App.unblockUI("#contentFile");
            },
            data: data
        }
        $http(req).success(callback);
    };

    return {
        //Danh sách Y/C nhập kho ở trạng thái đang chờ
        getListRequestProfile: function (callback) {
            $http.post('/Admin/EDMSWareHouseReceipt/GetListRequestProfile', callback).success(callback);
        },
        //Danh sách kho
        getListWareHouse: function (callback) {
            $http.get('/Admin/EDMSWareHouseManager/GetListWareHouse?type='+'RV', callback).success(callback);
        },
        //Danh sách chi nhánh
        loadBranch: function (callback) {
            $http.post('/Admin/User/GetBranch/').success(callback);
        },

        //Danh sách toàn bộ người dùng 
        getListUser: function (callback) {
            $http.post('/Admin/EDMSSendRequestProfile/GetListUser', callback).success(callback);
        },

        //Danh sách người dùng theo chi nhánh
        getListUserByBranchCode: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseReceipt/GetListUserByBranchCode?branchCode=' + data, callback).success(callback);
        },
        //List danh sách người dùng thuộc Kho
        getListWareHouseUser: function (callback) {
            $http.post('/Admin/EDMSSendReceiptProfile/GetListWareHouseUser/', callback).success(callback);
        },
        //List danh sách nhân viên
        getListStaffBranch: function (callback) {
            $http.post('/Admin/EDMSSendReceiptProfile/GetListStaffBranch/', callback).success(callback);
        },
        //Lấy thông tin tên Kho,Tầng,Dãy,Kệ từ code
        getNameObjectType: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseReceipt/GetNameObjectType', data).success(callback);
        },
        getListBox: function (data, data1, callback) {
            $http.get('/Admin/EDMSSendReceiptProfile/GetListBox?WHS_Code=' + data + '&BrCode=' + data1, callback).success(callback);
        },
        getBoxPosition: function (data, callback) {
            $http.get('/Admin/EDMSWareHouseManager/GetBoxPosition?boxCode=' + data, callback).success(callback);
        },
        generatorQRCode: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseReceipt/GeneratorQRCode?code=' + data).success(callback);
        },
        genBoxCode: function (boxNumber, branchCode, docType, userId, callback) {
            $http.get('/Admin/EDMSWareHouseManager/GenBoxCode?boxNumber=' + boxNumber + '&branchCode=' + branchCode + '&docType=' + docType + '&userId=' + userId, callback).success(callback);
        },
        getListDocumentType: function (callback) {
            $http.post('/Admin/EDMSWareHouseReceipt/GetListDocumentType').success(callback);
        },
        getIdMax: function (callback) {
            $http.post('/Admin/EDMSSendReceiptProfile/GetIdMax').success(callback);
        },
        getRequestInputStoreDetail: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseReceipt/GetRequestInputStoreDetail?id=' + data).success(callback);
        },
        getReceiptExportStoreDetail: function (data, callback) {
            $http.post('/Admin/EDMSSendReceiptProfile/GetReceiptExportStoreDetail?id=' + data).success(callback);
        },
        getBoxDetail: function (data, callback) {
            $http.get('/Admin/EDMSWarehouseManager/GetBoxDetail?boxCode=' + data).success(callback);
        },
        insertReceiptExportStore: function (data, callback) {
            $http.post('/Admin/EDMSSendReceiptProfile/InsertReceiptExportStore', data, callback).success(callback);
        },
        updateReceiptExportStore: function (data, callback) {
            $http.post('/Admin/EDMSSendReceiptProfile/UpdateReceiptExportStore', data, callback).success(callback);
        },
        deleteReceiptExportStore: function (data, callback) {
            $http.post('/Admin/EDMSSendReceiptProfile/DeleteReceiptExportStore?id=' + data, callback).success(callback);
        },
        insertBox: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseReceipt/InsertBox', data, callback).success(callback);
        },
        uploadFile: function (data, callback) {
            submitFormUpload('/Admin/EDMSWareHouseReceipt/UploadFile', data, callback);
        },
        removeFileRec: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseReceipt/RemoveFileReceipt?fileId=' + data, callback).success(callback);
        },
        removeFileBox: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseReceipt/RemoveFileBox?fileId=' + data, callback).success(callback);
        },
        approve: function (data, callback) {
            $http.post('/Admin/EDMSSendReceiptProfile/Approve?id=' + data, callback).success(callback);
        },
        pause: function (data, callback) {
            $http.post('/Admin/EDMSSendReceiptProfile/Pause?id=' + data, callback).success(callback);
        },
        reject: function (data, callback) {
            $http.post('/Admin/EDMSSendReceiptProfile/Reject?id=' + data, callback).success(callback);
        },
        //List trạng thái
        getListStatus: function (callback) {
            $http.post('/Admin/EDMSSendReceiptProfile/GetListStatus/', callback).success(callback);
        },

        //CommonSetting
        getDataType: function (callback) {
            $http.get('/Admin/CommonSetting/GetDataType').success(callback);
        },
        insertCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Insert/', data).success(callback);
        },
        updateCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Update/', data).success(callback);
        },
        deleteCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Delete', data).success(callback);
        },
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $translate, $cookies, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);

    $rootScope.listSercurity = [
        {
            Code: "1",
            Value: "Thấp"
        }, {
            Code: "2",
            Value: "Trung bình"
        }, {
            Code: "3",
            Value: "Cao"
        }];

    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];

        $rootScope.validationOptions = {
            rules: {
                FromDate: {
                    required: true,
                },
            },
            messages: {
                FromDate: {
                   // required: "Ngày xuất y/c bắt buộc",
                    required:(caption.EDMSSRP_VALIDETE_DATE),

                },
            }
        }
    });
    $rootScope.showListFloor = true;
    $rootScope.showListLine = true;
    $rootScope.showListRack = true;

    $rootScope.listWareHouse = [];
    $rootScope.listFloor = [];
    $rootScope.listLine = [];
    $rootScope.listRack = [];

    $rootScope.wareHouseID = null;
    $rootScope.floorID = null;
    $rootScope.lineID = null;
    $rootScope.rackID = null;

    $rootScope.wareHouseCode = 0;
    $rootScope.floorCode = 0;
    $rootScope.lineCode = 0;
    $rootScope.rackCode = 0;

    $rootScope.positionBox = 'Chưa có vị trí';
    $rootScope.cntBox = null;
    $rootScope.chooseBoxObj = {};
    $rootScope.requestType = [{
        Code: 'EXPORT_FULL',
        Name: 'Xuất kho'
    }, {
        Code: 'EXPORT_INFO',
        Name: 'Xuất thông tin',
        }];

    dataservice.getListStatus(function (rs) {
        $rootScope.status = rs.Object;
    });

    $rootScope.permission = PERMISSION;
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/Language/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/edit/', {
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit'
        })
        .when('/add/', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
        })
        .when('/pdfViewer', {
            templateUrl: ctxfolder + '/pdfViewer.html',
            controller: 'pdfViewer'
        });

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
    $httpProvider.interceptors.push('interceptors');
    $httpProvider.interceptors.push('httpResponseInterceptor');
});
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location, $filter, myService, $window) {
    var vm = $scope;
    $scope.model = {
        BrCode: '',
        DocType: '',
        WHS_User: '',
        RcStatus: '',
        FromDate: '',
        ToDate: '',
    };
    $scope.listBranch = [];
    $scope.listWareHouse = [];
    $scope.listWareHouseUser = [];
    $scope.listStaffBranch = [];

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.liFunction = [];
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSSendReceiptProfile/JTable",
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
                d.BrCode = $scope.model.BrCode;
                d.DocType = $scope.model.DocType;
                d.WHS_User = $scope.model.WHS_User;
                d.RcStatus = $scope.model.RcStatus;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [0, 'desc'])
        .withOption('stateSave', true)
        .withOption('stateSaveCallback', function (settings, data) {
            sessionStorage.setItem('DataTables_' + settings.sInstance, JSON.stringify(data));
        })
        .withOption('stateLoadCallback', function (settings) {
            if ($rootScope.savePageState) {
                return JSON.parse(sessionStorage.getItem('DataTables_' + settings.sInstance));
            } else {
                return settings.sInstance;
            }
        })
        .withOption('serverSide', true)
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiled) {
                $scope.headerCompiled = true;
                $compile(angular.element(header).contents())($scope);
            }
        })
        .withOption('initComplete', function (settings, json) {
            $rootScope.savePageState = true;
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);

            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                    $scope.selected[data.Id] = !$scope.selected[data.Id];
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.Id] = false;
                    } else {
                        $('#tblData').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.Id] = true;
                    }
                }

                vm.selectAll = false;
                $scope.$apply();
            });
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.Id;
                    $scope.edit(Id);
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Code').withTitle('Tên tệp').renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('RcTicketCode').withTitle('{{"EDWHB_LIST_COL_CODE_BILL" | translate}}').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('OrgName').withTitle('{{"EDWHB_COL_ORG_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('GivenName').withTitle('{{"EDWHB_COL_GIVEN_NAME"|translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FromDate').withTitle('{{"EDWHB_LIST_COL_DATE" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('WHS_Name').withTitle('{{"EDWHB_LIST_COL_WAREHOUSE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Reason').withTitle('{{"EDWHB_LIST_COL_REASON" | translate}}').renderWith(function (data, type, full) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('QR_Code').withTitle('{{"EDMSSRP_LIST_COL_CODE" | translate}}').renderWith(function (data, type) {
        return '<img role="button" ng-click="viewQrCode(\'' + data + '\')" src="data:image/png;base64,' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="40" width="40">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('RcStatus').withTitle('{{"EDWHB_COL_RC_STATUS" | translate}}').renderWith(function (data, type, full) {
        switch (data) {
            case "RECEIPTPROFILE_STATUS_PENDING":
                return '<span class="text-success">' + full.RcStatusName + '</span>';
                break;
            case "RECEIPTPROFILE_STATUS_WAITING":
                return '<span class="text-warning"> ' + full.RcStatusName + '</span>';
                break;
            case "RECEIPTPROFILE_STATUS_APPROVED":
                return '<span class="text-primary"> ' + full.RcStatusName + '</span>';
                break;
            case "RECEIPTPROFILE_STATUS_REJECTED":
                return '<span class="text-danger"> ' + full.RcStatusName + '</span>';
                break;
        }

        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"EDWHB_LIST_COL_NOTE" | translate}}').renderWith(function (data, type, full) {
    //    return data;
    //}));
    if ($rootScope.permission.isUserBr == false) {
        vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
            return '<button title="Duyệt" ng-click="approve(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline green"><i class="fa fa-check"></i></button>' +
                '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
                '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
        }));
    } else {
        vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
            return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
                '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
        }));
    }
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
    }
    $scope.initLoad = function () {
        dataservice.loadBranch(function (rs) {
            if (!rs.Error) {
                $scope.listBranch = rs;
            }
        });
        dataservice.getListDocumentType(function (result) {
            $scope.listDocumentType = result;
        });
        dataservice.getListUser(function (rs) {
            $scope.listWareHouseUser = rs;
        });

        //dataservice.getListWareHouse(function (rs) {
        //    $scope.listWareHouse = rs;
        //});
        //dataservice.getListStaffBranch(function (rs) {
        //    $scope.listStaffBranch = rs.Object;
        //});
    }
    $scope.initLoad();


    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '60'
        });
        modalInstance.result.then(function (d) {
            $scope.reloadData();
        }, function () {
        });
    }
    $scope.edit = function (id) {
        var model = {};
        var listdata = $('#tblData').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].id == id) {
                model = listdata[i];
                break;
            }
        }

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit',
            backdrop: 'static',
            size: '60',
            resolve: {
                para: function () {
                    return {
                        id
                        };
                        }
                        }
                        });
        modalInstance.result.then(function (d) {
            $scope.reloadData();
        }, function () { });
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deleteReceiptExportStore(id, function (rs) {
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
            $scope.reloadData();
        }, function () {
        });
    }
    $scope.approve = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmUpdate.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = "Bạn có chắc chắn muốn duyệt?";
                $scope.ok = function () {
                    dataservice.approve(id, function (rs) {
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                            $uibModalInstance.close();
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
    $scope.viewQrCode = function (code) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderQrCode + '/qrViewerBase64.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
                $scope.data = code;
                setTimeout(function () {
                    setModalDraggable('.modal-dialog');
                }, 200);
            },
            backdrop: 'static',
            size: '25',
        });
    }

    function loadDate() {
        $("#FromTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#DateTo').datepicker('setStartDate', maxDate);
        });
        $("#DateTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromTo').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            var from = $scope.model.FromDate.split("/");
            var date = new Date(from[2], from[1] - 1, from[0])
            $('#DateTo').datepicker('setStartDate', date);
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            var from = $scope.model.ToDate.split("/");
            var date = new Date(from[2], from[1] - 1, from[0])
            $('#FromTo').datepicker('setEndDate', $scope.model.ToDate);
            $('#DateTo').datepicker('setStartDate', null);
        });
    }
    setTimeout(function () {
        loadDate();
    }, 200);

    function showHideSearch() {
        $(".btnSearch").click(function () {
            $(".input-search").removeClass('hidden');
            $(".btnSearch").hide();
        });
        $(".close-input-search").click(function () {
            $(".input-search").addClass('hidden');
            $(".btnSearch").show();
        });
    }
    setTimeout(function () {
        showHideSearch();
    }, 50);
});
app.directive('customOnChange', function () {
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
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataservice, $timeout) {
    //Start Khởi tạo
    $scope.IsEnabledRequest = false;
    $scope.listRequest = [];
    $scope.listBranch = [];
    $scope.listWareHouse = [];
    $scope.listWareHouseUser = [];
    $scope.listDocumentType = [];
    $scope.listBoxTemp = [];
    $scope.listBoxIdDelete = [];
    $scope.listFileBox = [];
    $scope.listBoxCode = [];

    $scope.errorRqType=false;
    $scope.errorBrCode=false;
    $scope.errorWHSCode=false;
    $scope.errorPersonRequest=false;

    $scope.no = 1;
    $scope.branch = '';
    $scope.type = '';
    $scope.user = '';
    $scope.statusEditBox = false;

    $scope.boxNumber = '';
    $scope.branchCode = '';
    $scope.docType = '';
    $scope.userId = '';

    $scope.branchName = '';
    $scope.typeProfileName = '';
    $scope.RcTicketCodeUpdate = '';

    $scope.QR_Code_Box = '';
    $scope.QR_Code_Req = '';
    $scope.Item = '';

    $scope.BoxPosition = 'Chưa có thùng nào được chọn !';

    $scope.listDocTypes = [];
    $scope.listUsers = [];
    $scope.listDocTypeAll = [];

    $scope.obj = {
        WareHouseCode: '',
        FloorCode: '',
        LineCode: '',
        RackCode: '',
        WareHouseName: '',
        FloorName: '',
        LineName: '',
        RackName: '',
    }

    $scope.model = {
        Id: 0,
        RqId: '',
        RqType: '',
        RcTicketCode: '',
        BrCode: '',
        WHS_Code: '',
        WHS_User: '',
        PersonRequest: '',
        NumBox: '',
        DocType: '',
        FromDate: '',
        ToDate: '',
        Note: '',
        Reason: '',
        QR_Code: '',
        RcStatus: '',
        RcSupport: '',
        ListBox: [],
        ListBoxIDDelete: [],
        ListFileReceipt: [],
        ListFileReceiptRemove: [],
        Box: {
            Id: 0,
            BoxCode: '',
            TypeProfile: '',
            LstTypeProfileId: '',
            DepartCode: '',
            NumBoxth: '',
            PackingStaff: '',
            StartTime: '',
            EndTime: '',
            StorageTime: '',
            StatusSecurity: '',
            StoragePeriod: '',
            LstMemberId: '',
            ListFileBox: [],
            ListFileBoxRemove: [],
            RcCode: ''
        }
    };

    $scope.guideMsg = '* Mã QR Code được sinh theo quy tắc BX.Số thùng_BR.Mã Chi Nhánh_TYPE.Mã Loại chứng từ_USR.Mã nhân viên_Time.hhmmss';
    //End Khởi tạo
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.orderBox = function () {
        var listBox = $scope.model.ListBox;
        var listBoxNotStored = [];//Danh sách thùng chưa xếp kho
        var count = 0;
        angular.forEach(listBox, function (subscription, index) {
            if (subscription.IsStored) {
                count = count + 1;
            } else {
                listBoxNotStored.push(listBox[index]);
            }
        });

        if (listBox.length != count) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/orderBox.html',
                controller: 'orderBox',
                backdrop: 'static',
                size: '90',
                resolve: {
                    para: function () {
                        return {
                            listBoxNotStored
                            };
                            }
                            }
                            });
            modalInstance.result.then(function (d) {

            }, function () {
            });
        } else {
            App.toastrError('Các thùng đã được xếp kho !');
        }
    }

    $scope.initLoad = function () {
        dataservice.getListRequestProfile(function (result) {
            $scope.listRequest = result;
        });

        dataservice.loadBranch(function (rs) {
            if (!rs.Error) {
                $scope.listBranch = rs;
            }
        });

        dataservice.getListWareHouse(function (rs) {
            $scope.listWareHouse = rs;
        });

        dataservice.getListDocumentType(function (result) {
            $scope.listDocumentType = result;
        });

        dataservice.getIdMax(function (rs) {
            $scope.no = rs;
        });
        dataservice.getListStaffBranch(function (rs) {
            $scope.listStaffBranch = rs.Object;
        });

        dataservice.getListWareHouseUser(function (rs) {
            $scope.listWareHouseUser = rs.Object;
        });
    }
    $scope.initLoad();

    $scope.searchBox = function (boxCode) {
        if (boxCode != '') {
            dataservice.getBoxPosition(boxCode, function (rs) {
                if (!rs.Error) {
                    debugger
                    $scope.BoxPosition = rs.BoxPosition;
                    dataservice.generatorQRCode(boxCode, function (result) {
                        $scope.QR_Code_Box = result;
                    });
                }
            });
        } else {
            App.toastrError("Vui lòng chọn thùng để tìm kiếm !");
        }
    }

    $scope.createRecCode = function (no, branch, type, user) {
        var result = "";
        var date = new Date();
        var time = (date.getMonth() + 1) + '' + date.getDate() + '' + date.getFullYear();
        var today = moment().format('DDMMYYYY');
        result = "rqe." + no + "_b." + branch + "_v." + type + "_u." + user + "_t." + today;
        $scope.model.RcTicketCode = result;
        dataservice.generatorQRCode($scope.model.RcTicketCode, function (result) {
            $scope.QR_Code_Req = result;
        });
    };
    $scope.removeUser = function (index) {
        if ($scope.listUsers[index].text == $scope.model.Box.PackingStaff)
            $scope.model.Box.PackingStaff = '';

        $scope.listUsers.splice(index, 1);
        if ($scope.listUsers.length == 0)
            $scope.model.Box.PackingStaff = '';
    }
    $scope.removeDocType = function (index) {
        if ($scope.listDocTypes[index].id == $scope.model.Box.TypeProfile)
            $scope.model.Box.TypeProfile = '';

        $scope.listDocTypes.splice(index, 1);
        if ($scope.listDocTypes.length == 0)
            $scope.model.Box.TypeProfile = '';
    }
    $scope.removeItem = function (index) {
        var idDelete = $scope.listBoxTemp[index].Id;
        $scope.listBoxIdDelete.push(idDelete);
        $scope.listBoxTemp.splice(index, 1);
    }
    $scope.removeFileRec = function (index) {
        var itemRemove = $scope.model.ListFileReceipt[index];

        if (itemRemove.FileId != null) {
            $scope.model.ListFileReceiptRemove.push(itemRemove);
        }
        $scope.model.ListFileReceipt.splice(index, 1);
    }
    $scope.removeFileBox = function (index) {
        var itemRemove = $scope.listFileBox[index];

        if (itemRemove.FileId != null) {
            $scope.Item.ListFileBoxRemove.push(itemRemove);
        }
        $scope.listFileBox.splice(index, 1);
    }

    $scope.changeRequest = function (rqId) {
        if (rqId != '') {
            switch ($scope.IsEnabledRequest) {
                case true:
                    $scope.initDataChooseRequest(rqId);
                    break;
                case false:
                    App.toastrError("Vui lòng tích chọn Y/C nhập !")
                    break;
            }
        } else {
            App.toastrError("Vui lòng chọn 1 mã Y/C nhập kho !")
        }
    }

    //Khi tích chọn Y/C nhập
    $scope.checkedRequest = function (rqId) {
        if (rqId != '') {
            switch ($scope.IsEnabledRequest) {
                case true:
                    $scope.initDataChooseRequest(rqId);
                    break;
                case false:
                    $scope.clearDataUnCheckedRequest();
                    break;
            }
        } else {
            App.toastrError("Vui lòng chọn 1 mã Y/C nhập kho !")
        }
    }

    //Gán dữ liệu vào các ô theo mã Y/C
    $scope.initDataChooseRequest = function (rqId) {
        dataservice.getRequestInputStoreDetail(rqId, function (rs) {
            $scope.model = rs;
            $scope.model.RqId = rs.Id;
            $scope.model.ListFileReceipt = rs.ListFileRequest;
            $scope.listBoxTemp = rs.ListBox;

            //Gán mã Y/C Trước khi có sự thay đổi
            $scope.RcTicketCodeUpdate = $scope.model.RcTicketCode;

            var a = $scope.listBranch.filter(k => k.OrgAddonCode === $scope.model.BrCode);
            $scope.branch = change_alias(a[0].OrgName);
            $scope.branchName = a[0].OrgName;
            $scope.branchCode = $scope.model.BrCode;

            //Hiển thị QR_Code
            dataservice.generatorQRCode($scope.model.RcTicketCode, function (result) {
                $scope.QR_Code_Req = result;
            });

            //Lấy danh sách loại chứng từ hiển thị lên
            var listDocTypeID = $scope.model.DocType.split(',');
            if (listDocTypeID.length > 0) {
                $scope.listDocTypeAll = [];
                for (var i = 0; i < listDocTypeID.length; i++) {

                    var a = $scope.listDocumentType.filter(k => k.SettingID === parseInt(listDocTypeID[i]));
                    $scope.type = change_alias(a[0].ValueSet);
                    $scope.typeProfileName = a[0].ValueSet;
                    var obj = { id: a[0].SettingID, text: a[0].ValueSet };

                    var checkExits = $scope.listDocTypeAll.filter(k => k.text === a[0].ValueSet);
                    if (checkExits.length === 0) {
                        $scope.listDocTypeAll.push(obj);
                    }
                }
            }

            $scope.user = $scope.model.WHS_User;
            $rootScope.wareHouseCode = $scope.model.WHS_Code;
            //Tạo mã cho phiếu xuất kho
            //$scope.createRecCode($scope.no, $scope.branch, $scope.type, $scope.user);
        });
    }

    $scope.clearDataUnCheckedRequest = function () {
        $scope.model.RqId = '';
    }

    $scope.changeSelect = function (type, id) {
        switch (type) {
            case "RQ_TYPE":
                $scope.errorRqType = false;
                break;
            case "BRANCH":
                $scope.errorBrCode = false;
                var a = $scope.listBranch.filter(k => k.OrgAddonCode === id);
                $scope.branch = change_alias(a[0].OrgName);
                $scope.branchName = a[0].OrgName;
                $scope.branchCode = id;
                dataservice.getListUserByBranchCode(id, function (rs) {
                    $scope.listWareHouseUser = rs;
                    $scope.model.PersonRequest = '';
                });
                //Tạo mã phiếu Y/C
                $scope.createRecCode($scope.no, $scope.branch, $scope.type, $scope.user);

                dataservice.getListBox($scope.model.WHS_Code, $scope.model.BrCode, function (rs) {
                    if (!rs.Error) {
                        $scope.listBoxCode = rs;
                    }
                });
                break;
            case "WAREHOUSE_USER":
                $scope.errorPersonRequest = false;
                var a = $scope.listWareHouseUser.filter(k => k.UserName === id);
                if (a.length > 0) {
                    $scope.user = change_alias(a[0].UserName);
                    //Tạo mã phiếu Y/C
                    $scope.createRecCode($scope.no, $scope.branch, $scope.type, $scope.user);
                }
                break;
            case "WAREHOUSE_RECIPT":
                $scope.errorWHSCode = false;
                $rootScope.wareHouseCode = id;
                dataservice.getListBox($scope.model.WHS_Code, $scope.model.BrCode, function (rs) {
                    if (!rs.Error) {
                        $scope.listBoxCode = rs;
                    }
                });
                break;
            case "DOCUMENTTYPE":
                var a = $scope.listDocumentType.filter(k => k.SettingID === id);
                if (a.length > 0) {
                    $scope.type = change_alias(a[0].ValueSet);
                    $scope.typeProfileName = a[0].ValueSet;
                    var obj = { id: a[0].SettingID, text: a[0].ValueSet };
                    var checkExits = $scope.listDocTypes.filter(k => k.text === a[0].ValueSet);
                    if (checkExits.length === 0) {
                        $scope.listDocTypes.push(obj);
                    }
                    $scope.docType = id;
                    //Tạo mã phiếu Y/C
                    $scope.createRecCode($scope.no, $scope.branch, $scope.type, $scope.user);

                    //Tạo Mã cho thùng
                    dataservice.genBoxCode($scope.boxNumber, $scope.branchCode, $scope.docType, $scope.userId, function (rs) {
                        $scope.model.Box.BoxCode = rs;

                        dataservice.generatorQRCode($scope.model.Box.BoxCode, function (result) {
                            $scope.QR_Code_Box = result;
                        });
                    });
                }
                break;
            case "PACKING_STAFF":
                var a = $scope.listWareHouseUser.filter(k => k.UserName === id);
                $scope.userId = id;
                var obj = { text: a[0].UserName };
                var checkExits = $scope.listUsers.filter(k => k.text === a[0].UserName);
                if (checkExits.length === 0) {
                    $scope.listUsers.push(obj);
                }
                //Tạo Mã cho thùng
                dataservice.genBoxCode($scope.boxNumber, $scope.branchCode, $scope.docType, $scope.userId, function (rs) {
                    $scope.model.Box.BoxCode = rs;

                    dataservice.generatorQRCode($scope.model.Box.BoxCode, function (result) {
                        $scope.QR_Code_Box = result;
                    });
                });
                break;
        }
    };
    $scope.changeBoxNumber = function (boxNumber) {
        $scope.boxNumber = boxNumber;
        dataservice.genBoxCode($scope.boxNumber, $scope.branchCode, $scope.docType, $scope.userId, function (rs) {
            $scope.model.Box.BoxCode = rs;

            dataservice.generatorQRCode($scope.model.Box.BoxCode, function (result) {
                $scope.QR_Code_Box = result;
            });
        });
    };

    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.RqType == "" || data.RqType == null || data.RqType == undefined) {
            $scope.errorRqType = true;
            mess.Status = true;
        } else {
            $scope.errorRqType = false;
        }

        if (data.BrCode == "" || data.BrCode == null || data.BrCode == undefined) {
            $scope.errorBrCode = true;
            mess.Status = true;
        } else {
            $scope.errorBrCode = false;
        }
        
        if (data.WHS_Code == "" || data.WHS_Code == null || data.WHS_Code == undefined) {
            $scope.errorWHSCode = true;
            mess.Status = true;
        } else {
            $scope.errorWHSCode = false;
        }
        if (data.PersonRequest == "" || data.PersonRequest == null || data.PersonRequest == undefined) {
            $scope.errorPersonRequest = true;
            mess.Status = true;
        } else {
            $scope.errorPersonRequest = false;
        }
        return mess;
    };

    $scope.getValueStaff = function (listMemberId) {
        var arrMemberId = listMemberId.split(',');
        $scope.listUsers = [];
        for (var i = 0; i < arrMemberId.length; i++) {
            $scope.model.Box.PackingStaff = arrMemberId[i];

            var a = $scope.listWareHouseUser.filter(k => k.UserName === arrMemberId[i]);
            var obj = { text: a[0].UserName };
            var checkExits = $scope.listUsers.filter(k => k.text === a[0].UserName);
            if (checkExits.length === 0) {
                $scope.listUsers.push(obj);
            }
        }

        $scope.boxNumber = $scope.model.Box.NumBoxth;
        $scope.branchCode = $scope.model.Box.DepartCode;
        $scope.docType = $scope.model.Box.TypeProfile;
        $scope.userId = $scope.model.Box.PackingStaff;
    };
    $scope.getValueProfileType = function (typeProfile) {
        var arrTypeProfile = typeProfile.split(',');
        $scope.listDocTypes = [];
        for (var i = 0; i < arrTypeProfile.length; i++) {
            $scope.model.Box.TypeProfile = parseInt(arrTypeProfile[i]);

            var a = $scope.listDocumentType.filter(k => k.SettingID === parseInt(arrTypeProfile[i]));
            $scope.typeProfileName = a[0].ValueSet;
            var obj = { id: a[0].SettingID, text: a[0].ValueSet };
            var checkExits = $scope.listDocTypes.filter(k => k.text === a[0].ValueSet);
            if (checkExits.length === 0) {
                $scope.listDocTypes.push(obj);
            }
        }
    };

    $scope.setValueListStaff = function () {
        if ($scope.listUsers.length > 0) {
            $scope.listUserId = [];
            for (var i = 0; i < $scope.listUsers.length; i++) {
                $scope.listUserId.push($scope.listUsers[i].text);
            }
            if ($scope.listUserId.length > 0)
                $scope.model.Box.LstMemberId = $scope.listUserId.join();
        }
    }
    $scope.setValueListDocType = function () {
        if ($scope.listDocTypes.length > 0) {
            $scope.listDocTypeId = [];
            for (var i = 0; i < $scope.listDocTypes.length; i++) {
                $scope.listDocTypeId.push($scope.listDocTypes[i].id);
            }
            if ($scope.listDocTypeId.length > 0)
                $scope.model.Box.LstTypeProfileId = $scope.listDocTypeId.join();
        }
    }

    $scope.addBox = function (boxCode) {
        if (boxCode != '') {
            dataservice.getBoxDetail(boxCode, function (rs) {
                dataservice.generatorQRCode(boxCode, function (qrCode) {
                    var branchName = '';
                    var typeProfileName = '';
                    var br = $scope.listBranch.filter(k => k.OrgAddonCode === rs.DepartCode);
                    if (br.length > 0)
                        branchName = br[0].OrgName;

                    var docType = $scope.listDocumentType.filter(k => k.SettingID === parseInt(rs.TypeProfile));
                    if (docType.length > 0)
                        typeProfileName = docType[0].ValueSet;

                    var obj = {
                        BoxCode: rs.BoxCode,
                        QR_Code: qrCode,
                        TypeProfile: rs.TypeProfile,
                        TypeProfileName: typeProfileName,
                        DepartCode: rs.DepartCode,
                        BranchName: branchName,
                        NumBoxth: rs.NumBoxth,
                        PackingStaff: rs.PackingStaff,
                        StartTime: rs.StartTime,
                        EndTime: rs.EndTime,
                        StorageTime: rs.StorageTime,
                        StatusSecurity: rs.StatusSecurity,
                        StoragePeriod: rs.StoragePeriod,
                        LstMemberId: rs.LstMemberId,
                        RcCode: rs.RcTicketCode,
                        LstTypeProfileId: rs.LstTypeProfileId,
                        ListFileBox: $scope.listFileBox
                    }

                    var checkExits = $scope.listBoxTemp.filter(k => k.BoxCode === boxCode);

                    if (checkExits.length == 0) {
                        $scope.updateListDocTypeAll($scope.listBoxTemp, $scope.listDocTypes);

                        $scope.listBoxTemp.push(obj);

                        $scope.model.NumBox = $scope.listBoxTemp.length;
                        App.toastrSuccess("Thêm thùng thành công!");
                    } else {
                        App.toastrError("Mã thùng đã tồn tại!");
                    }
                });
            });
            $scope.setValueListStaff();
            $scope.setValueListDocType();
            var modelBox = $scope.model.Box;
            $scope.model.Box.DepartCode = $scope.model.BrCode;
        } else {
            App.toastrError("Chưa có thùng nào !")
        }
    }
    $scope.editItem = function (x) {
        $rootScope.chooseBoxObj = x;
        $scope.listFileBox = [];
        $scope.Item = x;
        var obj = x;
        $scope.model.Box = {
            Id: obj.Id,
            BoxCode: obj.BoxCode,
            TypeProfile: obj.TypeProfile,
            LstTypeProfileId: obj.LstTypeProfileId,
            DepartCode: obj.DepartCode,
            NumBoxth: obj.NumBoxth,
            PackingStaff: obj.PackingStaff,
            StartTime: obj.StartTime,
            EndTime: obj.EndTime,
            StorageTime: obj.StorageTime,
            StatusSecurity: obj.StatusSecurity,
            StoragePeriod: obj.StoragePeriod,
            LstMemberId: obj.LstMemberId,
            ListFileBox: obj.ListFileBox,
            ListFileBoxRemove: obj.ListFileBoxRemove,
            RcCode: obj.RcCode,
        };

        dataservice.generatorQRCode($scope.model.Box.BoxCode, function (result) {
            $scope.QR_Code_Box = result;
        });

        $scope.getValueStaff($scope.model.Box.LstMemberId);

        $scope.getValueProfileType($scope.model.Box.LstTypeProfileId);

        $scope.model.Box.DepartCode = $scope.model.BrCode;

        $scope.listFileBox = obj.ListFileBox;

        $scope.statusEditBox = true;
    }
    $scope.editBox = function () {
        var modelBox = $scope.model.Box;
        var listUsers = $scope.listUsers;
        var listDocType = $scope.listDocTypes;
        $scope.setValueListStaff();
        $scope.setValueListDocType();

        var b = $scope.listBoxTemp.indexOf($scope.Item);
        if ($scope.Item.BoxCode === $scope.model.Box.BoxCode) {//Trường hợp không thay đổi BoxCode
            $scope.listBoxTemp[b].Id = modelBox.Id;
            $scope.listBoxTemp[b].BoxCode = modelBox.BoxCode;
            $scope.listBoxTemp[b].TypeProfile = modelBox.TypeProfile;
            $scope.listBoxTemp[b].TypeProfileName = $scope.typeProfileName;
            $scope.listBoxTemp[b].DepartCode = modelBox.DepartCode;
            $scope.listBoxTemp[b].BranchName = $scope.branchName;
            $scope.listBoxTemp[b].NumBoxth = modelBox.NumBoxth;
            $scope.listBoxTemp[b].PackingStaff = modelBox.PackingStaff;
            $scope.listBoxTemp[b].StartTime = modelBox.StartTime;
            $scope.listBoxTemp[b].EndTime = modelBox.EndTime;
            $scope.listBoxTemp[b].StorageTime = modelBox.StorageTime;
            $scope.listBoxTemp[b].StatusSecurity = modelBox.StatusSecurity;
            $scope.listBoxTemp[b].StoragePeriod = modelBox.StoragePeriod;
            $scope.listBoxTemp[b].LstMemberId = modelBox.LstMemberId;
            $scope.listBoxTemp[b].LstTypeProfileId = modelBox.LstTypeProfileId;
            $scope.listBoxTemp[b].ListFileBox = modelBox.ListFileBox;
            $scope.listBoxTemp[b].ListFileBoxRemove = modelBox.ListFileBoxRemove;
            $scope.listBoxTemp[b].RcCode = $scope.model.RcTicketCode;

            //Cập nhật lại QR_Code cho mảng tạm
            dataservice.generatorQRCode($scope.model.Box.BoxCode, function (result) {
                $scope.listBoxTemp[b].QR_Code = result;
            });

            $scope.updateListDocTypeAll($scope.listBoxTemp, $scope.listDocTypes);

            App.toastrSuccess("Sửa thùng thành công!");

        } else {//Trường hợp thay đổi BoxCode
            var checkExits = $scope.listBoxTemp.filter(k => k.BoxCode === $scope.model.Box.BoxCode);

            if (checkExits.length > 0) {//Trường hợp sửa BoxCode lại trùng với 1 mã trong Danh sách
                App.toastrError("Mã thùng đã tồn tại!");
            } else {
                $scope.listBoxTemp[b].Id = modelBox.Id;
                $scope.listBoxTemp[b].BoxCode = modelBox.BoxCode;
                $scope.listBoxTemp[b].TypeProfile = modelBox.TypeProfile;
                $scope.listBoxTemp[b].TypeProfileName = $scope.typeProfileName;
                $scope.listBoxTemp[b].DepartCode = modelBox.DepartCode;
                $scope.listBoxTemp[b].BranchName = $scope.branchName;
                $scope.listBoxTemp[b].NumBoxth = modelBox.NumBoxth;
                $scope.listBoxTemp[b].PackingStaff = modelBox.PackingStaff;
                $scope.listBoxTemp[b].StartTime = modelBox.StartTime;
                $scope.listBoxTemp[b].EndTime = modelBox.EndTime;
                $scope.listBoxTemp[b].StorageTime = modelBox.StorageTime;
                $scope.listBoxTemp[b].StatusSecurity = modelBox.StatusSecurity;
                $scope.listBoxTemp[b].StoragePeriod = modelBox.StoragePeriod;
                $scope.listBoxTemp[b].LstMemberId = modelBox.LstMemberId;
                $scope.listBoxTemp[b].LstTypeProfileId = modelBox.LstTypeProfileId;
                $scope.listBoxTemp[b].ListFileBox = modelBox.ListFileBox;
                $scope.listBoxTemp[b].ListFileBoxRemove = modelBox.ListFileBoxRemove;
                $scope.listBoxTemp[b].RcCode = $scope.model.RcTicketCode;

                $scope.model.Box.DepartCode = $scope.model.BrCode;
                //Cập nhật lại QR_Code cho mảng tạm
                dataservice.generatorQRCode($scope.model.Box.BoxCode, function (result) {
                    $scope.listBoxTemp[b].QR_Code = result;
                });

                $scope.updateListDocTypeAll($scope.listBoxTemp, $scope.listDocTypes);

                App.toastrSuccess("Sửa thùng thành công!");
            }
        }
    }

    $scope.updateListDocTypeAll = function (listTemp, listDocType) {
        //TH1: Chưa thêm mới hộp nào
        if (listTemp.length == 0 && listDocType.length > 0) {
            listDocType.forEach(function (element) {
                $scope.listDocTypeAll.push(element);
            });
        }

        //TH2: Đã có danh sách hộp và chưa chỉnh sửa lại danh sách loại chứng từ
        if (listTemp.length > 0 && listDocType.length == 0) {
            $scope.listDocTypeAll = [];
            listTemp.forEach(function (element) {
                var listTypeProfileId = element.LstTypeProfileId.split(',');
                listTypeProfileId.forEach(function (e) {
                    var a = $scope.listDocumentType.filter(k => k.SettingID === parseInt(e));
                    var obj = { id: a[0].SettingID, text: a[0].ValueSet };
                    var checkExits = $scope.listDocTypeAll.filter(k => k.id === a[0].SettingID);
                    if (checkExits.length === 0) {
                        $scope.listDocTypeAll.push(obj);
                    }
                });
            });
        }

        //TH3: Đã có danh sách hộp và chỉnh sửa
        if (listTemp.length > 0 && listDocType.length > 0) {
            listDocType.forEach(function (element) {
                $scope.listDocTypeAll.push(element);
            });

            listTemp.forEach(function (element) {
                var listTypeProfileId = element.LstTypeProfileId.split(',');
                listTypeProfileId.forEach(function (e) {
                    var a = $scope.listDocumentType.filter(k => k.SettingID === parseInt(e));
                    var obj = { id: a[0].SettingID, text: a[0].ValueSet };
                    var checkExits = $scope.listDocTypeAll.filter(k => k.id === a[0].SettingID);
                    if (checkExits.length === 0) {
                        $scope.listDocTypeAll.push(obj);
                    }
                });
            });
        }
    }

    $scope.loadFileRec = function (event) {
        var files = event.target.files;
        var checkExits = $scope.model.ListFileReceipt.filter(k => k.FileName === files[0].name);
        if (checkExits.length == 0) {
            var formData = new FormData();
            formData.append("file", files[0] != undefined ? files[0] : null);

            dataservice.uploadFile(formData, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.model.ListFileReceipt.push(rs.Object);
                }
            });
        } else {
            App.toastrError("Tệp tin đã tồn tại!");
        }
    }
    $scope.loadFileBox = function (event) {
        var files = event.target.files;

        var checkExits = $scope.listFileBox.filter(k => k.FileName === files[0].name);
        if (checkExits.length == 0) {
            var formData = new FormData();
            formData.append("file", files[0] != undefined ? files[0] : null);

            dataservice.uploadFile(formData, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.listFileBox.push(rs.Object);
                }
            });
        } else {
            App.toastrError("Tệp tin đã tồn tại!");
        }

    }

    $scope.viewFile = function (url) {
        var view = false;
        var viewImage = false;
        var idxDot = url.lastIndexOf(".") + 1;
        var extFile = url.substr(idxDot, url.length).toLowerCase();
        var excel = ['xlsm', 'xlsx', 'xlsb', 'xltx', 'xltm', 'xls', 'xlt', 'xls', 'xml', 'xml', 'xlam', 'xla', 'xlw', 'xlr'];
        var document = ['txt'];
        var word = ['docx', 'doc'];
        var pdf = ['pdf'];
        var powerPoint = ['pps', 'pptx'];
        var image = ['jpg', 'png', 'PNG'];
        if (excel.indexOf(extFile) != -1) {
            view = true;
        } else if (word.indexOf(extFile) != -1) {
            view = true;
        } else if (document.indexOf(extFile) != -1) {
            view = true;
        } else if (pdf.indexOf(extFile) != -1) {
            view = true;
        } else if (powerPoint.indexOf(extFile) != -1) {
            view = true;
        } else if (image.indexOf(extFile) != -1) {
            view = true;
            viewImage = true;
        } else {
            view = false;
        }

        if (view) {
            url = url.replace(" ", "%20");
            switch (viewImage) {
                case true:
                    window.open('' + window.location.origin + '' + url + '', '_blank');
                    break;
                case false:
                    window.open('https://docs.google.com/gview?url=' + window.location.origin + '' + url + ' & embedded=true', '_blank');
                    break;
            }
        } else {
            App.toastrError("Chưa hỗ trợ file này !");
        }
    }

    $scope.submit = function () {
        debugger
        validationSelect($scope.model);
        if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
            if ($scope.listBoxTemp.length > 0) {
                if ($scope.listDocTypeAll.length > 0) {
                    $scope.listDocTypeId = [];
                    for (var i = 0; i < $scope.listDocTypeAll.length; i++) {
                        $scope.listDocTypeId.push($scope.listDocTypeAll[i].id);
                    }
                    if ($scope.listDocTypeId.length > 0)
                        $scope.model.DocType = $scope.listDocTypeId.join();
                } else {
                    $scope.model.DocType = '';
                }
                if ($scope.listBoxTemp.length > 0)
                    $scope.model.ListBox = $scope.listBoxTemp;
                if ($scope.listBoxIdDelete.length > 0)
                    debugger
                    $scope.model.ListBoxIDDelete = $scope.listBoxIdDelete;
                dataservice.insertReceiptExportStore($scope.model, function (rs) {
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                });
            } else {
                App.toastrError("Vui lòng thêm thùng tài liệu trước khi tạo phiếu xuất kho !");
            }
        }
    }

    function change_alias(alias) {
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
        return str;
    }
    function loadDate() {
        //Yêu cầu từ ngày --> đến ngày
        $("#dateFrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateTo').datepicker('setStartDate', maxDate);
            if ($('#dateFrom .form-control').valid()) {
                $('#dateFrom .form-control').removeClass('invalid').addClass('success');
            }
        });
        $("#dateTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateFrom').datepicker('setEndDate', maxDate);
            if ($('#dateTo .form-control').valid()) {
                $('#dateTo .form-control').removeClass('invalid').addClass('success');
            }
        });

        //thùng tài liệu thời gian phát sinh từ -> đến, Ngày lưu kho
        $("#dateArisesFrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateArisesTo').datepicker('setStartDate', maxDate);
        });
        $("#dateArisesTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateArisesFrom').datepicker('setEndDate', maxDate);
        });

        $("#dateStorage ").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {

        });
    }

    setTimeout(function () {
        $("#tblBoxRequest").on("click", "tr", function () {
            var id = $(this).attr('id');
            $('#tblBoxRequest .active').removeClass('active');
            $(this).addClass("active");
        });

        loadDate();
        setModalDraggable('.modal-dialog');
    }, 50);


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
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataservice, $timeout, para) {
    //Start Khởi tạo
    $scope.IsEnabledRequest = false;
    $scope.listRequest = [];
    $scope.listBranch = [];
    $scope.listWareHouse = [];
    $scope.listWareHouseUser = [];
    $scope.listDocumentType = [];
    $scope.listBoxTemp = [];
    $scope.listBoxIdDelete = [];
    $scope.listFileBox = [];
    $scope.listBoxCode = [];

    $scope.errorRqType = false;
    $scope.errorBrCode = false;
    $scope.errorWHSCode = false;
    $scope.errorPersonRequest = false;

    $scope.no = 1;
    $scope.branch = '';
    $scope.type = '';
    $scope.user = '';
    $scope.statusEditBox = false;

    $scope.boxNumber = '';
    $scope.branchCode = '';
    $scope.docType = '';
    $scope.userId = '';

    $scope.branchName = '';
    $scope.typeProfileName = '';
    $scope.RcTicketCodeUpdate = '';

    $scope.QR_Code_Box = '';
    $scope.QR_Code_Req = '';
    $scope.Item = '';

    $scope.BoxPosition = 'Chưa có thùng nào được chọn !';

    $scope.listDocTypes = [];
    $scope.listUsers = [];
    $scope.listDocTypeAll = [];

    $scope.obj = {
        WareHouseCode: '',
        FloorCode: '',
        LineCode: '',
        RackCode: '',
        WareHouseName: '',
        FloorName: '',
        LineName: '',
        RackName: '',
    }

    $scope.model = {
        Id: 0,
        RqId: '',
        RqType: '',
        RcTicketCode: '',
        BrCode: '',
        WHS_Code: '',
        WHS_User: '',
        PersonRequest: '',
        NumBox: '',
        DocType: '',
        FromDate: '',
        ToDate: '',
        Note: '',
        Reason: '',
        QR_Code: '',
        RcStatus: '',
        RcSupport: '',
        ListBox: [],
        ListBoxIDDelete: [],
        ListFileReceipt: [],
        ListFileReceiptRemove: [],
        Box: {
            Id: 0,
            BoxCode: '',
            TypeProfile: '',
            LstTypeProfileId: '',
            DepartCode: '',
            NumBoxth: '',
            PackingStaff: '',
            StartTime: '',
            EndTime: '',
            StorageTime: '',
            StatusSecurity: '',
            StoragePeriod: '',
            LstMemberId: '',
            ListFileBox: [],
            ListFileBoxRemove: [],
            RcCode: ''
        }
    };

    $scope.guideMsg = '* Mã QR Code được sinh theo quy tắc BX.Số thùng_BR.Mã Chi Nhánh_TYPE.Mã Loại chứng từ_USR.Mã nhân viên_Time.hhmmss';
    //End Khởi tạo
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.orderBox = function () {
        var listBox = $scope.model.ListBox;
        var listBoxNotStored = [];//Danh sách thùng chưa xếp kho
        var count = 0;
        angular.forEach(listBox, function (subscription, index) {
            if (subscription.IsStored) {
                count = count + 1;
            } else {
                listBoxNotStored.push(listBox[index]);
            }
        });

        if (listBox.length != count) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/orderBox.html',
                controller: 'orderBox',
                backdrop: 'static',
                size: '90',
                resolve: {
                    para: function () {
                        return {
                            listBoxNotStored
                            };
                            }
                            }
                            });
            modalInstance.result.then(function (d) {

            }, function () {
            });
                            } else {
            App.toastrError('Các thùng đã được xếp kho !');
                            }
                            }

    $scope.initLoad = function () {
        dataservice.getListRequestProfile(function (result) {
            $scope.listRequest = result;
                            });

        dataservice.loadBranch(function (rs) {
            if (!rs.Error) {
                $scope.listBranch = rs;
            }
        });

        dataservice.getListWareHouse(function (rs) {
            $scope.listWareHouse = rs;
        });

        dataservice.getListDocumentType(function (result) {
            $scope.listDocumentType = result;
        });

        dataservice.getIdMax(function (rs) {
            $scope.no = rs;
        });
        dataservice.getListStaffBranch(function (rs) {
            $scope.listStaffBranch = rs.Object;
        });

        dataservice.getListWareHouseUser(function (rs) {
            $scope.listWareHouseUser = rs.Object;
        });

        dataservice.getReceiptExportStoreDetail(para.id, function (rs) {
            debugger
            $scope.model = rs;
            $scope.listBoxTemp = rs.ListBox;
            if ($scope.model.RqId != null)
                $scope.IsEnabledRequest = true;

            //Gán mã Y/C Trước khi có sự thay đổi
            $scope.RcTicketCodeUpdate = $scope.model.RcTicketCode;

            var a = $scope.listBranch.filter(k => k.OrgAddonCode === $scope.model.BrCode);
            $scope.branch = change_alias(a[0].OrgName);
            $scope.branchName = a[0].OrgName;
            $scope.branchCode = $scope.model.BrCode;

            dataservice.getListBox($scope.model.WHS_Code, $scope.model.BrCode, function (rs) {
                if (!rs.Error) {
                    $scope.listBoxCode = rs;
                }
            });

            //Hiển thị QR_Code
            dataservice.generatorQRCode($scope.model.RcTicketCode, function (result) {
                $scope.QR_Code_Req = result;
            });

            //Lấy danh sách loại chứng từ hiển thị lên
            var listDocTypeID = $scope.model.DocType.split(',');
            debugger
            if (listDocTypeID.length > 0) {
                $scope.listDocTypeAll = [];
                for (var i = 0; i < listDocTypeID.length; i++) {

                    var a = $scope.listDocumentType.filter(k => k.SettingID === parseInt(listDocTypeID[i]));
                    if (a.length > 0) {
                        $scope.type = change_alias(a[0].ValueSet);
                        $scope.typeProfileName = a[0].ValueSet;
                        var obj = { id: a[0].SettingID, text: a[0].ValueSet };

                        var checkExits = $scope.listDocTypeAll.filter(k => k.text === a[0].ValueSet);
                        if (checkExits.length === 0) {
                            $scope.listDocTypeAll.push(obj);
                        }
                    }
                }
            }
            $scope.user = $scope.model.PersonRequest;
            $rootScope.wareHouseCode = $scope.model.WHS_Code;
            
            dataservice.getListUserByBranchCode($scope.model.BrCode, function (rs) {
                $scope.listWareHouseUser = rs;
            });

            //Tạo mã cho phiếu xuất kho
            //$scope.createRecCode($scope.no, $scope.branch, $scope.type, $scope.user);
        });
    }
    $scope.initLoad();

    $scope.searchBox = function (boxCode) {
        if (boxCode != '') {
            dataservice.getBoxPosition(boxCode, function (rs) {
                if (!rs.Error) {
                    $scope.BoxPosition = rs.BoxPosition;
                    dataservice.generatorQRCode(boxCode, function (result) {
                        $scope.QR_Code_Box = result;
                    });
                }
            });
        } else {
            App.toastrError("Vui lòng chọn thùng để tìm kiếm !");
        }
    }

    $scope.createRecCode = function (no, branch, type, user) {
        var result = "";
        var date = new Date();
        var time = (date.getMonth() + 1) + '' + date.getDate() + '' + date.getFullYear();
        var today = moment().format('DDMMYYYY');
        result = "rqe." + no + "_b." + branch + "_v." + type + "_u." + user + "_t." + today;
        $scope.model.RcTicketCode = result;
        dataservice.generatorQRCode($scope.model.RcTicketCode, function (result) {
            $scope.QR_Code_Req = result;
        });
    };
    $scope.removeUser = function (index) {
        if ($scope.listUsers[index].text == $scope.model.Box.PackingStaff)
            $scope.model.Box.PackingStaff = '';

        $scope.listUsers.splice(index, 1);
        if ($scope.listUsers.length == 0)
            $scope.model.Box.PackingStaff = '';
    }
    $scope.removeDocType = function (index) {
        if ($scope.listDocTypes[index].id == $scope.model.Box.TypeProfile)
            $scope.model.Box.TypeProfile = '';

        $scope.listDocTypes.splice(index, 1);
        if ($scope.listDocTypes.length == 0)
            $scope.model.Box.TypeProfile = '';
    }
    $scope.removeItem = function (index) {
        var idDelete = $scope.listBoxTemp[index].Id;
        $scope.listBoxIdDelete.push(idDelete);
        $scope.listBoxTemp.splice(index, 1);
    }
    $scope.removeFileRec = function (index) {
        var itemRemove = $scope.model.ListFileReceipt[index];

        if (itemRemove.FileId != null) {
            $scope.model.ListFileReceiptRemove.push(itemRemove);
        }
        $scope.model.ListFileReceipt.splice(index, 1);
    }
    $scope.removeFileBox = function (index) {
        var itemRemove = $scope.listFileBox[index];

        if (itemRemove.FileId != null) {
            $scope.Item.ListFileBoxRemove.push(itemRemove);
        }
        $scope.listFileBox.splice(index, 1);
    }

    $scope.changeRequest = function (rqId) {
        if (rqId != '') {
            switch ($scope.IsEnabledRequest) {
                case true:
                    $scope.initDataChooseRequest(rqId);
                    break;
                case false:
                    App.toastrError("Vui lòng tích chọn Y/C nhập !")
                    break;
            }
        } else {
            App.toastrError("Vui lòng chọn 1 mã Y/C nhập kho !")
        }
    }

    //Khi tích chọn Y/C nhập
    $scope.checkedRequest = function (rqId) {
        if (rqId != '') {
            switch ($scope.IsEnabledRequest) {
                case true:
                    $scope.initDataChooseRequest(rqId);
                    break;
                case false:
                    $scope.clearDataUnCheckedRequest();
                    break;
            }
        } else {
            App.toastrError("Vui lòng chọn 1 mã Y/C nhập kho !")
        }
    }

    //Gán dữ liệu vào các ô theo mã Y/C
    $scope.initDataChooseRequest = function (rqId) {
        dataservice.getRequestInputStoreDetail(rqId, function (rs) {
            $scope.model = rs;
            $scope.model.RqId = rs.Id;
            $scope.model.ListFileReceipt = rs.ListFileRequest;
            $scope.listBoxTemp = rs.ListBox;

            //Gán mã Y/C Trước khi có sự thay đổi
            $scope.RcTicketCodeUpdate = $scope.model.RcTicketCode;

            var a = $scope.listBranch.filter(k => k.OrgAddonCode === $scope.model.BrCode);
            $scope.branch = change_alias(a[0].OrgName);
            $scope.branchName = a[0].OrgName;
            $scope.branchCode = $scope.model.BrCode;


            //Hiển thị QR_Code
            dataservice.generatorQRCode($scope.model.RcTicketCode, function (result) {
                $scope.QR_Code_Req = result;
            });

            //Lấy danh sách loại chứng từ hiển thị lên
            var listDocTypeID = $scope.model.DocType.split(',');
            if (listDocTypeID.length > 0) {
                $scope.listDocTypeAll = [];
                for (var i = 0; i < listDocTypeID.length; i++) {

                    var a = $scope.listDocumentType.filter(k => k.SettingID === parseInt(listDocTypeID[i]));
                    $scope.type = change_alias(a[0].ValueSet);
                    $scope.typeProfileName = a[0].ValueSet;
                    var obj = { id: a[0].SettingID, text: a[0].ValueSet };

                    var checkExits = $scope.listDocTypeAll.filter(k => k.text === a[0].ValueSet);
                    if (checkExits.length === 0) {
                        $scope.listDocTypeAll.push(obj);
                    }
                }
            }
            $scope.user = $scope.model.WHS_User;

            //Tạo mã cho phiếu xuất kho
            //$scope.createRecCode($scope.no, $scope.branch, $scope.type, $scope.user);
        });
    }

    $scope.clearDataUnCheckedRequest = function () {
        $scope.model.RqId = '';
    }

    $scope.changeSelect = function (type, id) {
        switch (type) {
            case "RQ_TYPE":
                $scope.errorRqType = false;
                break;
            case "BRANCH":
                $scope.errorBrCode = false;
                var a = $scope.listBranch.filter(k => k.OrgAddonCode === id);
                $scope.branch = change_alias(a[0].OrgName);
                $scope.branchName = a[0].OrgName;
                $scope.branchCode = id;
                dataservice.getListUserByBranchCode(id, function (rs) {
                    $scope.listWareHouseUser = rs;
                    $scope.model.PersonRequest = '';
                });
                //Tạo mã phiếu Y/C
                $scope.createRecCode($scope.no, $scope.branch, $scope.type, $scope.user);

                dataservice.getListBox($scope.model.WHS_Code, $scope.model.BrCode, function (rs) {
                    if (!rs.Error) {
                        $scope.listBoxCode = rs;
                    }
                });
                break;
            case "WAREHOUSE_USER":
                $scope.errorWHSCode = false;
                var a = $scope.listWareHouseUser.filter(k => k.UserName === id);
                if (a.length > 0) {
                    $scope.user = change_alias(a[0].UserName);
                    //Tạo mã phiếu Y/C
                    $scope.createRecCode($scope.no, $scope.branch, $scope.type, $scope.user);
                }
                break;

            case "WAREHOUSE_RECIPT":
                $scope.errorPersonRequest = false;
                $rootScope.wareHouseCode = id;
                dataservice.getListBox($scope.model.WHS_Code, $scope.model.BrCode, function (rs) {
                    if (!rs.Error) {
                        $scope.listBoxCode = rs;
                    }
                });
                break;
            case "DOCUMENTTYPE":
                var a = $scope.listDocumentType.filter(k => k.SettingID === id);
                if (a.length > 0) {
                    $scope.type = change_alias(a[0].ValueSet);
                    $scope.typeProfileName = a[0].ValueSet;
                    var obj = { id: a[0].SettingID, text: a[0].ValueSet };
                    var checkExits = $scope.listDocTypes.filter(k => k.text === a[0].ValueSet);
                    if (checkExits.length === 0) {
                        $scope.listDocTypes.push(obj);
                    }
                    $scope.docType = id;
                    //Tạo mã phiếu Y/C
                    $scope.createRecCode($scope.no, $scope.branch, $scope.type, $scope.user);

                    //Tạo Mã cho thùng
                    dataservice.genBoxCode($scope.boxNumber, $scope.branchCode, $scope.docType, $scope.userId, function (rs) {
                        $scope.model.Box.BoxCode = rs;

                        dataservice.generatorQRCode($scope.model.Box.BoxCode, function (result) {
                            $scope.QR_Code_Box = result;
                        });
                    });
                }
                break;
            case "PACKING_STAFF":
                var a = $scope.listWareHouseUser.filter(k => k.UserName === id);
                $scope.userId = id;
                var obj = { text: a[0].UserName };
                var checkExits = $scope.listUsers.filter(k => k.text === a[0].UserName);
                if (checkExits.length === 0) {
                    $scope.listUsers.push(obj);
                }
                //Tạo Mã cho thùng
                dataservice.genBoxCode($scope.boxNumber, $scope.branchCode, $scope.docType, $scope.userId, function (rs) {
                    $scope.model.Box.BoxCode = rs;

                    dataservice.generatorQRCode($scope.model.Box.BoxCode, function (result) {
                        $scope.QR_Code_Box = result;
                    });
                });
                break;
        }
    };
    $scope.changeBoxNumber = function (boxNumber) {
        $scope.boxNumber = boxNumber;
        dataservice.genBoxCode($scope.boxNumber, $scope.branchCode, $scope.docType, $scope.userId, function (rs) {
            $scope.model.Box.BoxCode = rs;

            dataservice.generatorQRCode($scope.model.Box.BoxCode, function (result) {
                $scope.QR_Code_Box = result;
            });
        });
    };

    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.RqType == "" || data.RqType == null || data.RqType == undefined) {
            $scope.errorRqType = true;
            mess.Status = true;
        } else {
            $scope.errorRqType = false;
        }

        if (data.BrCode == "" || data.BrCode == null || data.BrCode == undefined) {
            $scope.errorBrCode = true;
            mess.Status = true;
        } else {
            $scope.errorBrCode = false;
        }

        if (data.WHS_Code == "" || data.WHS_Code == null || data.WHS_Code == undefined) {
            $scope.errorWHSCode = true;
            mess.Status = true;
        } else {
            $scope.errorWHSCode = false;
        }
        if (data.PersonRequest == "" || data.PersonRequest == null || data.PersonRequest == undefined) {
            $scope.errorPersonRequest = true;
            mess.Status = true;
        } else {
            $scope.errorPersonRequest = false;
        }
        return mess;
    };

    $scope.getValueStaff = function (listMemberId) {
        var arrMemberId = listMemberId.split(',');
        $scope.listUsers = [];
        for (var i = 0; i < arrMemberId.length; i++) {
            $scope.model.Box.PackingStaff = arrMemberId[i];

            var a = $scope.listWareHouseUser.filter(k => k.UserName === arrMemberId[i]);
            if (a.length > 0) {
                var obj = { text: a[0].UserName };
                var checkExits = $scope.listUsers.filter(k => k.text === a[0].UserName);
                if (checkExits.length === 0) {
                    $scope.listUsers.push(obj);
                }
            }
        }

        $scope.boxNumber = $scope.model.Box.NumBoxth;
        $scope.branchCode = $scope.model.Box.DepartCode;
        $scope.docType = $scope.model.Box.TypeProfile;
        $scope.userId = $scope.model.Box.PackingStaff;
    };
    $scope.getValueProfileType = function (typeProfile) {
        var arrTypeProfile = typeProfile.split(',');
        $scope.listDocTypes = [];
        for (var i = 0; i < arrTypeProfile.length; i++) {
            $scope.model.Box.TypeProfile = parseInt(arrTypeProfile[i]);

            var a = $scope.listDocumentType.filter(k => k.SettingID === parseInt(arrTypeProfile[i]));
            $scope.typeProfileName = a[0].ValueSet;
            var obj = { id: a[0].SettingID, text: a[0].ValueSet };
            var checkExits = $scope.listDocTypes.filter(k => k.text === a[0].ValueSet);
            if (checkExits.length === 0) {
                $scope.listDocTypes.push(obj);
            }
        }
    };

    $scope.setValueListStaff = function () {
        if ($scope.listUsers.length > 0) {
            $scope.listUserId = [];
            for (var i = 0; i < $scope.listUsers.length; i++) {
                $scope.listUserId.push($scope.listUsers[i].text);
            }
            if ($scope.listUserId.length > 0)
                $scope.model.Box.LstMemberId = $scope.listUserId.join();
        }
    }
    $scope.setValueListDocType = function () {
        if ($scope.listDocTypes.length > 0) {
            $scope.listDocTypeId = [];
            for (var i = 0; i < $scope.listDocTypes.length; i++) {
                $scope.listDocTypeId.push($scope.listDocTypes[i].id);
            }
            if ($scope.listDocTypeId.length > 0)
                $scope.model.Box.LstTypeProfileId = $scope.listDocTypeId.join();
        }
    }

    $scope.addBox = function (boxCode) {
        dataservice.getBoxDetail(boxCode, function (rs) {
            dataservice.generatorQRCode(boxCode, function (qrCode) {
                var branchName = '';
                var typeProfileName = '';
                var br = $scope.listBranch.filter(k => k.OrgAddonCode === rs.DepartCode);
                if (br.length > 0)
                    branchName = br[0].OrgName;

                var docType = $scope.listDocumentType.filter(k => k.SettingID === parseInt(rs.TypeProfile));
                if (docType.length > 0)
                    typeProfileName = docType[0].ValueSet;

                var obj = {
                    BoxCode: rs.BoxCode,
                    QR_Code: qrCode,
                    TypeProfile: rs.TypeProfile,
                    TypeProfileName: typeProfileName,
                    DepartCode: rs.DepartCode,
                    BranchName: branchName,
                    NumBoxth: rs.NumBoxth,
                    PackingStaff: rs.PackingStaff,
                    StartTime: rs.StartTime,
                    EndTime: rs.EndTime,
                    StorageTime: rs.StorageTime,
                    StatusSecurity: rs.StatusSecurity,
                    StoragePeriod: rs.StoragePeriod,
                    LstMemberId: rs.LstMemberId,
                    RcCode: rs.RcTicketCode,
                    LstTypeProfileId: rs.LstTypeProfileId,
                    ListFileBox: $scope.listFileBox
                }

                var checkExits = $scope.listBoxTemp.filter(k => k.BoxCode === boxCode);

                if (checkExits.length == 0) {
                    $scope.updateListDocTypeAll($scope.listBoxTemp, $scope.listDocTypes);

                    $scope.listBoxTemp.push(obj);

                    $scope.model.NumBox = $scope.listBoxTemp.length;

                    App.toastrSuccess("Thêm thùng thành công!");
                } else {
                    App.toastrError("Mã thùng đã tồn tại!");
                }
            });
        });
        $scope.setValueListStaff();
        $scope.setValueListDocType();
        var modelBox = $scope.model.Box;
        //$scope.model.Box.DepartCode = $scope.model.BrCode;
    }
    $scope.editItem = function (x) {
        $rootScope.chooseBoxObj = x;
        $scope.listFileBox = [];
        $scope.Item = x;
        var obj = x;
        $scope.model.Box = {
            Id: obj.Id,
            BoxCode: obj.BoxCode,
            TypeProfile: obj.TypeProfile,
            LstTypeProfileId: obj.LstTypeProfileId,
            DepartCode: obj.DepartCode,
            NumBoxth: obj.NumBoxth,
            PackingStaff: obj.PackingStaff,
            StartTime: obj.StartTime,
            EndTime: obj.EndTime,
            StorageTime: obj.StorageTime,
            StatusSecurity: obj.StatusSecurity,
            StoragePeriod: obj.StoragePeriod,
            LstMemberId: obj.LstMemberId,
            ListFileBox: obj.ListFileBox,
            ListFileBoxRemove: obj.ListFileBoxRemove,
            RcCode: obj.RcCode,
        };

        dataservice.generatorQRCode($scope.model.Box.BoxCode, function (result) {
            $scope.QR_Code_Box = result;
        });

        $scope.getValueStaff($scope.model.Box.LstMemberId);

        $scope.getValueProfileType($scope.model.Box.LstTypeProfileId);

        $scope.model.Box.DepartCode = $scope.model.BrCode;

        $scope.listFileBox = obj.ListFileBox;

        $scope.statusEditBox = true;
    }
    $scope.editBox = function () {
        var modelBox = $scope.model.Box;
        var listUsers = $scope.listUsers;
        var listDocType = $scope.listDocTypes;
        $scope.setValueListStaff();
        $scope.setValueListDocType();

        var b = $scope.listBoxTemp.indexOf($scope.Item);
        if ($scope.Item.BoxCode === $scope.model.Box.BoxCode) {//Trường hợp không thay đổi BoxCode
            $scope.listBoxTemp[b].Id = modelBox.Id;
            $scope.listBoxTemp[b].BoxCode = modelBox.BoxCode;
            $scope.listBoxTemp[b].TypeProfile = modelBox.TypeProfile;
            $scope.listBoxTemp[b].TypeProfileName = $scope.typeProfileName;
            $scope.listBoxTemp[b].DepartCode = modelBox.DepartCode;
            $scope.listBoxTemp[b].BranchName = $scope.branchName;
            $scope.listBoxTemp[b].NumBoxth = modelBox.NumBoxth;
            $scope.listBoxTemp[b].PackingStaff = modelBox.PackingStaff;
            $scope.listBoxTemp[b].StartTime = modelBox.StartTime;
            $scope.listBoxTemp[b].EndTime = modelBox.EndTime;
            $scope.listBoxTemp[b].StorageTime = modelBox.StorageTime;
            $scope.listBoxTemp[b].StatusSecurity = modelBox.StatusSecurity;
            $scope.listBoxTemp[b].StoragePeriod = modelBox.StoragePeriod;
            $scope.listBoxTemp[b].LstMemberId = modelBox.LstMemberId;
            $scope.listBoxTemp[b].LstTypeProfileId = modelBox.LstTypeProfileId;
            $scope.listBoxTemp[b].ListFileBox = modelBox.ListFileBox;
            $scope.listBoxTemp[b].ListFileBoxRemove = modelBox.ListFileBoxRemove;
            $scope.listBoxTemp[b].RcCode = $scope.model.RcTicketCode;

            //Cập nhật lại QR_Code cho mảng tạm
            dataservice.generatorQRCode($scope.model.Box.BoxCode, function (result) {
                $scope.listBoxTemp[b].QR_Code = result;
            });

            $scope.updateListDocTypeAll($scope.listBoxTemp, $scope.listDocTypes);

            App.toastrSuccess("Sửa thùng thành công!");

        } else {//Trường hợp thay đổi BoxCode
            var checkExits = $scope.listBoxTemp.filter(k => k.BoxCode === $scope.model.Box.BoxCode);

            if (checkExits.length > 0) {//Trường hợp sửa BoxCode lại trùng với 1 mã trong Danh sách
                App.toastrError("Mã thùng đã tồn tại!");
            } else {
                $scope.listBoxTemp[b].Id = modelBox.Id;
                $scope.listBoxTemp[b].BoxCode = modelBox.BoxCode;
                $scope.listBoxTemp[b].TypeProfile = modelBox.TypeProfile;
                $scope.listBoxTemp[b].TypeProfileName = $scope.typeProfileName;
                $scope.listBoxTemp[b].DepartCode = modelBox.DepartCode;
                $scope.listBoxTemp[b].BranchName = $scope.branchName;
                $scope.listBoxTemp[b].NumBoxth = modelBox.NumBoxth;
                $scope.listBoxTemp[b].PackingStaff = modelBox.PackingStaff;
                $scope.listBoxTemp[b].StartTime = modelBox.StartTime;
                $scope.listBoxTemp[b].EndTime = modelBox.EndTime;
                $scope.listBoxTemp[b].StorageTime = modelBox.StorageTime;
                $scope.listBoxTemp[b].StatusSecurity = modelBox.StatusSecurity;
                $scope.listBoxTemp[b].StoragePeriod = modelBox.StoragePeriod;
                $scope.listBoxTemp[b].LstMemberId = modelBox.LstMemberId;
                $scope.listBoxTemp[b].LstTypeProfileId = modelBox.LstTypeProfileId;
                $scope.listBoxTemp[b].ListFileBox = modelBox.ListFileBox;
                $scope.listBoxTemp[b].ListFileBoxRemove = modelBox.ListFileBoxRemove;
                $scope.listBoxTemp[b].RcCode = $scope.model.RcTicketCode;

                $scope.model.Box.DepartCode = $scope.model.BrCode;
                //Cập nhật lại QR_Code cho mảng tạm
                dataservice.generatorQRCode($scope.model.Box.BoxCode, function (result) {
                    $scope.listBoxTemp[b].QR_Code = result;
                });

                $scope.updateListDocTypeAll($scope.listBoxTemp, $scope.listDocTypes);

                App.toastrSuccess("Sửa thùng thành công!");
            }
        }
    }

    $scope.updateListDocTypeAll = function (listTemp, listDocType) {
        //TH1: Chưa thêm mới hộp nào
        if (listTemp.length == 0 && listDocType.length > 0) {
            listDocType.forEach(function (element) {
                $scope.listDocTypeAll.push(element);
            });
        }

        //TH2: Đã có danh sách hộp và chưa chỉnh sửa lại danh sách loại chứng từ
        if (listTemp.length > 0 && listDocType.length == 0) {
            $scope.listDocTypeAll = [];
            listTemp.forEach(function (element) {
                var listTypeProfileId = element.LstTypeProfileId.split(',');
                listTypeProfileId.forEach(function (e) {
                    var a = $scope.listDocumentType.filter(k => k.SettingID === parseInt(e));
                    var obj = { id: a[0].SettingID, text: a[0].ValueSet };
                    var checkExits = $scope.listDocTypeAll.filter(k => k.id === a[0].SettingID);
                    if (checkExits.length === 0) {
                        $scope.listDocTypeAll.push(obj);
                    }
                });
            });
        }

        //TH3: Đã có danh sách hộp và chỉnh sửa
        if (listTemp.length > 0 && listDocType.length > 0) {
            listDocType.forEach(function (element) {
                $scope.listDocTypeAll.push(element);
            });

            listTemp.forEach(function (element) {
                var listTypeProfileId = element.LstTypeProfileId.split(',');
                listTypeProfileId.forEach(function (e) {
                    var a = $scope.listDocumentType.filter(k => k.SettingID === parseInt(e));
                    var obj = { id: a[0].SettingID, text: a[0].ValueSet };
                    var checkExits = $scope.listDocTypeAll.filter(k => k.id === a[0].SettingID);
                    if (checkExits.length === 0) {
                        $scope.listDocTypeAll.push(obj);
                    }
                });
            });
        }
    }

    $scope.loadFileRec = function (event) {
        var files = event.target.files;
        var checkExits = $scope.model.ListFileReceipt.filter(k => k.FileName === files[0].name);
        if (checkExits.length == 0) {
            var formData = new FormData();
            formData.append("file", files[0] != undefined ? files[0] : null);

            dataservice.uploadFile(formData, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.model.ListFileReceipt.push(rs.Object);
                }
            });
        } else {
            App.toastrError("Tệp tin đã tồn tại!");
        }
    }
    $scope.loadFileBox = function (event) {
        var files = event.target.files;

        var checkExits = $scope.listFileBox.filter(k => k.FileName === files[0].name);
        if (checkExits.length == 0) {
            var formData = new FormData();
            formData.append("file", files[0] != undefined ? files[0] : null);

            dataservice.uploadFile(formData, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.listFileBox.push(rs.Object);
                }
            });
        } else {
            App.toastrError("Tệp tin đã tồn tại!");
        }

    }

    $scope.viewFile = function (url) {
        var view = false;
        var viewImage = false;
        var idxDot = url.lastIndexOf(".") + 1;
        var extFile = url.substr(idxDot, url.length).toLowerCase();
        var excel = ['xlsm', 'xlsx', 'xlsb', 'xltx', 'xltm', 'xls', 'xlt', 'xls', 'xml', 'xml', 'xlam', 'xla', 'xlw', 'xlr'];
        var document = ['txt'];
        var word = ['docx', 'doc'];
        var pdf = ['pdf'];
        var powerPoint = ['pps', 'pptx'];
        var image = ['jpg', 'png', 'PNG'];
        if (excel.indexOf(extFile) != -1) {
            view = true;
        } else if (word.indexOf(extFile) != -1) {
            view = true;
        } else if (document.indexOf(extFile) != -1) {
            view = true;
        } else if (pdf.indexOf(extFile) != -1) {
            view = true;
        } else if (powerPoint.indexOf(extFile) != -1) {
            view = true;
        } else if (image.indexOf(extFile) != -1) {
            view = true;
            viewImage = true;
        } else {
            view = false;
        }

        if (view) {
            url = url.replace(" ", "%20");
            switch (viewImage) {
                case true:
                    window.open('' + window.location.origin + '' + url + '', '_blank');
                    break;
                case false:
                    window.open('https://docs.google.com/gview?url=' + window.location.origin + '' + url + ' & embedded=true', '_blank');
                    break;
            }
        } else {
            App.toastrError("Chưa hỗ trợ file này !");
        }
    }

    $scope.addCommonSettingStatus = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'RECEIPTPROFILE_STATUS',
                        GroupNote: 'Trạng thái yêu cầu xuất kho hồ sơ',
                        AssetCode: 'WAREHOUSE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataservice.getListStatus(function (rs) {
                debugger
                $rootScope.status = rs.Object;
            });
        }, function () { });
    }

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.editform.validate() && validationSelect($scope.model).Status == false) {
            if ($scope.listBoxTemp.length > 0) {
                if ($scope.listDocTypeAll.length > 0) {
                    $scope.listDocTypeId = [];
                    for (var i = 0; i < $scope.listDocTypeAll.length; i++) {
                        $scope.listDocTypeId.push($scope.listDocTypeAll[i].id);
                    }
                    if ($scope.listDocTypeId.length > 0)
                        $scope.model.DocType = $scope.listDocTypeId.join();
                } else {
                    $scope.model.DocType = '';
                }
                if ($scope.listBoxTemp.length > 0)
                    $scope.model.ListBox = $scope.listBoxTemp;
                if ($scope.listBoxIdDelete.length > 0)
                    $scope.model.ListBoxIDDelete = $scope.listBoxIdDelete;
                dataservice.updateReceiptExportStore($scope.model, function (rs) {
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                });
            } else {
                App.toastrError("Vui lòng thêm thùng trước khi tạo phiếu xuất kho !");
            }
        }
    }

    function change_alias(alias) {
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
        return str;
    }
    function loadDate() {
        //Yêu cầu từ ngày --> đến ngày
        $("#dateFrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateTo').datepicker('setStartDate', maxDate);
            if ($('#dateFrom .form-control').valid()) {
                $('#dateFrom .form-control').removeClass('invalid').addClass('success');
            }
        });
        $("#dateTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateFrom').datepicker('setEndDate', maxDate);
            if ($('#dateTo .form-control').valid()) {
                $('#dateTo .form-control').removeClass('invalid').addClass('success');
            }
        });

        //thùng tài liệu thời gian phát sinh từ -> đến, Ngày lưu kho
        $("#dateArisesFrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateArisesTo').datepicker('setStartDate', maxDate);
        });
        $("#dateArisesTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateArisesFrom').datepicker('setEndDate', maxDate);
        });

        $("#dateStorage ").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {

        });
    }

    setTimeout(function () {
        $("#tblBoxRequest").on("click", "tr", function () {
            var id = $(this).attr('id');
            $('#tblBoxRequest .active').removeClass('active');
            $(this).addClass("active");
        });

        loadDate();
        setModalDraggable('.modal-dialog');
    }, 50);


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

app.controller('addWareHouse', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location, $uibModalInstance) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.tags = ["Quỹ", "Kế toán", "Tín dụng"];
    $scope.position = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
    $scope.boxs = ["Thùng 1", "Thùng 2", "Thùng 3", "Thùng 4", "Thùng 5", "Thùng 6", "Thùng 7", "Thùng 8", "Thùng 9", "Thùng 10"];
    $scope.users = ["Quỳnh", "Hoàng", "Hiệp"];

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

            },
            complete: function (data) {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(3)
        .withOption('order', [1, 'desc'])
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.FileID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.FileID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('QRCode').withTitle('{{"EDWHB_LIST_COL_QR_CODE" | translate}}').renderWith(function (data, type) {
        return '<img src="' + data + '" height="40" width="40">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"EDWHB_LIST_COL_TITLE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Map').withTitle('Bản đồ').renderWith(function (data, type, full) {
    //    return '<img src="' + data + '" height="40" width="40">';
    //}));

    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"EDWHB_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
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
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
});

app.controller('listFloor', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location) {
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

            },
            complete: function (data) {
                $rootScope.listFloor = data.responseJSON.data;
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
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.FileID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.FileID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('QRCode').withTitle('{{"EDWHB_LIST_COL_QR_CODE" | translate}}').renderWith(function (data, type) {
        return '<img src="' + data + '" height="40" width="40">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"EDWHB_LIST_COL_TITLE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Map').withTitle('{{"EDWHB_LIST_COL_MAP" | translate}}').renderWith(function (data, type, full) {
        return '<img src="' + data + '" height="40" width="40">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"EDWHB_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
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
        $rootScope.floorID = id;
        $rootScope.showListFloor = true;
        $rootScope.showListLine = true;
        $rootScope.showListRack = false;
    }
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

            },
            complete: function (data) {
                $rootScope.listLine = data.responseJSON.data;
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(3)
        .withOption('order', [1, 'desc'])
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
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.FileID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.FileID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('QRCode').withTitle('{{"EDWHB_LIST_COL_QR_CODE"|translate}}').renderWith(function (data, type) {
        return '<img src="' + data + '" height="40" width="40">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"EDWHB_LIST_COL_TITLE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Map').withTitle('{{"EDWHB_LIST_COL_MAP" | translate}}').renderWith(function (data, type, full) {
        return '<img src="' + data + '" height="40" width="40">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"EDWHB_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
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
        $rootScope.lineID = id;
        $rootScope.showListFloor = true;
        $rootScope.showListLine = true;
        $rootScope.showListRack = true;
    }
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

            },
            complete: function (data) {
                $rootScope.listRack = data.responseJSON.data;
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(3)
        .withOption('order', [1, 'desc'])
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
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.FileID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.FileID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('QRCode').withTitle('{{"EDWHB_LIST_COL_QR_CODE" | translate}}').renderWith(function (data, type) {
        return '<img src="' + data + '" height="40" width="40">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"EDWHB_LIST_COL_TITLE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Map').withTitle('{{"EDWHB_LIST_COL_MAP" | translate}}').renderWith(function (data, type, full) {
        return '<img src="' + data + '" height="40" width="40">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"EDWHB_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
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
});

app.controller('detail', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, para) {
    var vm = $scope;
    $scope.model = {
        CodeSet: '',
        ValueSet: '',
        AssetCode: para.AssetCode,
        Group: para.Group,
        GroupNote: para.GroupNote
    }
    $scope.listDataType = [];
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/CommonSetting/JTableDetail/",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.SettingGroup = para.Group;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [2, 'asc'])
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
                var self = $(this).parent();
                if ($(self).hasClass('selected')) {
                    $(self).removeClass('selected');
                    resetInput();
                } else {
                    $('#tblDataDetail').DataTable().$('tr.selected').removeClass('selected');
                    $(self).addClass('selected');
                    $scope.model.CodeSet = data.CodeSet;
                    $scope.model.ValueSet = data.ValueSet;
                    $scope.model.Type = data.Type;
                }
                $scope.$apply();
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("SettingID").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.SettingID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.SettingID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withTitle('{{"COM_SET_LIST_COL_ORDER" | translate}}').notSortable().withOption('sWidth', '30px').withOption('sClass', 'tcenter w50').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ValueSet').withTitle('{{"COM_SET_LIST_COL_VALUE_SET" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeName').withTitle('{{"COM_SET_LIST_COL_TYPE_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"COM_SET_LIST_COL_CREATE_TIME" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{"COM_SET_LIST_COL_CREATE_BY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"COM_SET_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button title="Xoá" ng-click="delete(' + full.SettingID + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    function resetInput() {
        $scope.model.CodeSet = '';
        $scope.model.ValueSet = ''
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.init = function () {
        dataservice.getDataType(function (rs) {
            $scope.listDataType = rs;
        });
    }
    $scope.init();
    $scope.add = function () {
        debugger
        if ($scope.model.ValueSet == '') {
            App.toastrError(caption.COM_SET_CURD_MSG_SETTING_NOT_BLANK);
        } else {
            dataservice.insertCommonSetting($scope.model, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                }
            })
        }
    }
    $scope.edit = function () {
        if ($scope.model.CodeSet == '') {
            App.toastrError(caption.COM_SET_CURD_MSG_DATA_NOT_BLANK)
        } else {
            dataservice.updateCommonSetting($scope.model, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                    resetInput();
                }
            })
        }
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = "Bạn có chắc chắn muốn xóa ?";
                $scope.ok = function () {
                    dataservice.deleteCommonSetting(id, function (rs) {
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
    $scope.cancel = function () {
        //$uibModalInstance.dismiss('cancel');
        $uibModalInstance.close();
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});


