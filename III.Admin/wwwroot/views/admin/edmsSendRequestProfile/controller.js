var ctxfolder = "/views/admin/edmsSendRequestProfile";
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

        $http(req).success(callback);
    };
    return {
        //Danh sách kho
        getListWareHouse: function (callback) {
            $http.get('/Admin/EDMSWareHouseManager/GetListWareHouse?type=' + 'RV', callback).success(callback);
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
            $http.post('/Admin/EDMSSendRequestProfile/GetListUserByBranchCode?branchCode=' + data, callback).success(callback);
        },

        generatorQRCode: function (data, callback) {
            $http.post('/Admin/EDMSSendRequestProfile/GeneratorQRCode?code=' + data).success(callback);
        },
        genBoxCode: function (boxNumber, branchCode, docType, userId, callback) {
            $http.get('/Admin/EDMSWareHouseManager/GenBoxCode?boxNumber=' + boxNumber + '&branchCode=' + branchCode + '&docType=' + docType + '&userId=' + userId, callback).success(callback);
        },
        getListDocumentType: function (callback) {
            $http.post('/Admin/EDMSSendRequestProfile/GetListDocumentType').success(callback);
        },
        getIdMax: function (callback) {
            $http.post('/Admin/EDMSSendRequestProfile/GetIdMax').success(callback);
        },
        getRequestInputStoreDetail: function (data, callback) {
            $http.post('/Admin/EDMSSendRequestProfile/GetRequestInputStoreDetail?id=' + data).success(callback);
        },
        getBoxDetail: function (data, callback) {
            $http.post('/Admin/EDMSSendRequestProfile/GetBoxDetail?id=' + data).success(callback);
        },
        getListRequestTrackingByRqId: function (data, callback) {
            $http.post('/Admin/EDMSSendRequestProfile/GetListRequestTrackingByRqId?rqId=' + data).success(callback);
        },

        insertRequestInputStore: function (data, callback) {
            $http.post('/Admin/EDMSSendRequestProfile/InsertRequestInputStore', data, callback).success(callback);
        },
        updateRequestInputStore: function (data, callback) {
            $http.post('/Admin/EDMSSendRequestProfile/UpdateRequestInputStore', data, callback).success(callback);
        },
        deleteRequestInputStore: function (data, callback) {
            $http.post('/Admin/EDMSSendRequestProfile/DeleteRequestInputStore?id=' + data, callback).success(callback);
        },

        reasonRejectRequestInputStore: function (data, callback) {
            $http.post('/Admin/EDMSSendRequestProfile/ReasonRejectRequestInputStore', data, callback).success(callback);
        },
        insertBox: function (data, callback) {
            $http.post('/Admin/EDMSSendRequestProfile/InsertBox', data, callback).success(callback);
        },
        uploadFile: function (data, callback) {
            submitFormUpload('/Admin/EDMSSendRequestProfile/UploadFile', data, callback);
        },
        removeFileReq: function (data, callback) {
            $http.post('/Admin/EDMSSendRequestProfile/RemoveFileRequest?fileId=' + data, callback).success(callback);
        },
        removeFileBox: function (data, callback) {
            $http.post('/Admin/EDMSSendRequestProfile/RemoveFileBox?fileId=' + data, callback).success(callback);
        },
        approve: function (data, callback) {
            $http.post('/Admin/EDMSSendRequestProfile/Approve?id=' + data, callback).success(callback);
        },
        pause: function (data, callback) {
            $http.post('/Admin/EDMSSendRequestProfile/Pause?id=' + data, callback).success(callback);
        },
        reject: function (data, callback) {
            $http.post('/Admin/EDMSSendRequestProfile/Reject?id=' + data, callback).success(callback);
        },
        //Lấy ra thời gian lưu trữ quy định
        getStorageTimeLimit: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseReceipt/GetStorageTimeLimit/' + data).success(callback);
        },
        //Lấy ra thùng số
        getNumBoxth: function (data, data1, callback) {
            $http.post('/Admin/EDMSWareHouseReceipt/GetNumBoxth?brCode=' + data + '&whCode=' + data1).success(callback);
        },
        //List danh sách nhân viên
        getListStaffBranch: function (callback) {
            $http.post('/Admin/EDMSWareHouseBill/GetListStaffBranch/', callback).success(callback);
        },
        //List trạng thái
        getListStatus: function (callback) {
            $http.post('/Admin/EDMSSendRequestProfile/GetListStatus/', callback).success(callback);
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
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $filter, $location, $cookies, $translate, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);

    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
    });

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

    $rootScope.validationOptions = {
        rules: {
            NumBox: {
                required: true
            },
            FromDate: {
                required: true
            },
            ToDate: {
                required: true
            },
            ReasonReject: {
                required: true
            }
        },
        messages: {
            NumBox: {
                required: "Số hộp yêu cầu bắt buộc!"
            },
            FromDate: {
                required: "Từ ngày yêu cầu bắt buộc!"
            },
            ToDate: {
                required: "Từ ngày yêu cầu bắt buộc!"
            },
            ReasonReject: {
                required: "Lý do duyệt yêu cầu bắt buộc!"
            }
        }
    }

    $rootScope.permission = PERMISSION;

    dataservice.getListStatus(function (rs) {
        $rootScope.status = rs.Object;
    });
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
app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location, $window) {
    var vm = $scope;
    $scope.security = [{
        Code: "1",
        Name: "Cao"
    }, {
        Code: "2",
        Name: "Rất cao"
    }]
    $scope.model = {
        BrCode: '',
        DocType: '',
        WHS_User: '',
        RqStatus: '',
        FromDate: '',
        ToDate: '',
    };
    $scope.listBranch = [];
    $scope.listDocumentType = [];
    $scope.model = {
        FromTime: '',
        ToTime: ''
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSSendRequestProfile/JTable",
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
                d.RqStatus = $scope.model.RqStatus;
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('OrgName').withTitle('{{"EDMSSRP_LIST_COL_UNIT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FromDate').withTitle('{{"EDMSSRP_LIST_COL_FROMDATE" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ToDate').withTitle('{{"EDMSSRP_LIST_COL_TODATE" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('GivenName').withTitle('{{"EDMSSRP_LIST_COL_SENDER" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('QR_Code').withTitle('{{"EDMSSRP_LIST_COL_CODE" | translate}}').renderWith(function (data, type) {
        return '<img role="button" ng-click="viewQrCode(\'' + data + '\')" src="data:image/png;base64,' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="40" width="40">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('RqStatus').withTitle('{{"EDMSSRP_LIST_COL_OR_STATUS" | translate}}').renderWith(function (data, type, full) {
        switch (data) {
            case "REQUESTPROFILE_STATUS_PENDING":
                return '<span class="text-success">' + full.RqStatusName + '</span>';
                break;
            case "REQUESTPROFILE_STATUS_WAITING":
                return '<span class="text-warning"> ' + full.RqStatusName + '</span>';
                break;
            case "REQUESTPROFILE_STATUS_APPROVED":
                return '<span class="text-primary"> ' + full.RqStatusName + '</span>';
                break;
            case "REQUESTPROFILE_STATUS_REJECTED":
                return '<span class="text-danger"> ' + full.RqStatusName + '</span>';
                break;
        }

        return data;
    }).withOption('sClass', 'tcenter dataTable-10per'));
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
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.search = function () {
        reloadData(true);
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
            $scope.reload();
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
            $scope.reloadNoResetPage();
        }, function () { });
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deleteRequestInputStore(id, function (rs) {
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
        $("#Fromtime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#Totime').datepicker('setStartDate', maxDate);
        });
        $("#Totime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#Fromtime').datepicker('setEndDate', maxDate);
        });
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
    $scope.NumBoxthStart = null;
    $scope.modelDisable = {
        BrCode: false,
        WHS_Code: false,
    };
    $scope.modelShow = {};
    $scope.model = {
        Id: 0,
        RqTicketCode: '',
        BrCode: '',
        WHS_Code: '',
        WHS_User: '',
        NumBox: 0,
        DocType: '',
        FromDate: '',
        ToDate: '',
        Note: '',
        QR_Code: '',
        RqStatus: '',
        RqSupport: '',
        ListBox: [],
        ListBoxIDDelete: [],
        ListFileRequest: [],
        ListFileRequestRemove: [],
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
            StatusSecurity: '2',
            StoragePeriod: '',
            LstMemberId: '',
            ListFileBox: [],
            ListFileBoxRemove: [],
            RqCode: ''
        }
    };

    $scope.no = 1;
    $scope.statusEditBox = false;
    $scope.isEditBox = false;
    $scope.branch = '';
    $scope.type = '';
    $scope.user = '';

    $scope.boxNumber = '';
    $scope.branchCode = '';
    $scope.docType = '';
    $scope.userId = '';

    $scope.branchName = '';
    $scope.typeProfileName = '';
    $scope.RqTicketCodeUpdate = '';

    $scope.QR_Code_Box = '';
    $scope.QR_Code_Req = '';
    $scope.Item = '';

    $scope.listDocTypes = [];
    $scope.listUsers = [];
    $scope.listDocTypeAll = [];

    $scope.security = [{
        Code: "1",
        Name: "Cao"
    }, {
        Code: "2",
        Name: "Rất cao"
    }]
    $scope.listBranch = [];
    $scope.listWareHouse = [];
    $scope.listWareHouseUser = [];
    $scope.listDocumentType = [];
    $scope.listBoxTemp = [];
    $scope.listBoxIdDelete = [];
    $scope.listFileBox = [];

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.activity = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/activity.html',
            controller: 'activity',
            size: '50',
            backdrop: 'static',
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }
    $scope.initLoad = function () {
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
    }
    $scope.initLoad();

    $scope.createReqCode = function (no, branch, type, user) {
        var result = "";
        var date = new Date();
        var time = (date.getMonth() + 1) + '' + date.getDate() + '' + date.getFullYear();
        var today = moment().format('DDMMYYYY');
        result = "rqi." + no + "_b." + branch + "_v." + type + "_u." + user + "_t." + today;
        $scope.model.RqTicketCode = result;
        dataservice.generatorQRCode($scope.model.RqTicketCode, function (result) {
            $scope.QR_Code_Req = result;
        });
    };
    $scope.removeUser = function (index) {
        if ($scope.listUsers[index].Code == $scope.model.Box.PackingStaff)
            $scope.model.Box.PackingStaff = '';

        $scope.listUsers.splice(index, 1);
        if ($scope.listUsers.length == 0)
            $scope.model.Box.PackingStaff = '';
    }
    $scope.removeDocType = function (index) {
        if ($scope.listDocTypes[index].id == $scope.model.Box.TypeProfile) {
            $scope.model.Box.TypeProfile = '';
            $scope.model.Box.StoragePeriod = '';
            $scope.modelShow.StoragePeriod = '';
        }

        $scope.listDocTypes.splice(index, 1);
        if ($scope.listDocTypes.length == 0) {
            $scope.model.Box.TypeProfile = '';
            $scope.model.Box.StoragePeriod = '';
            $scope.modelShow.StoragePeriod = '';
        }
    }
    $scope.removeItem = function (index) {
        var idDelete = $scope.listBoxTemp[index].Id;
        $scope.listBoxIdDelete.push(idDelete);
        $scope.listBoxTemp.splice(index, 1);

        $scope.model.Box.NumBoxth = $scope.NumBoxthStart + $scope.listBoxTemp.length;
        $scope.model.NumBox = $scope.listBoxTemp.length;
        $scope.changeBoxNumber($scope.model.Box.NumBoxth);
        //Mở chọn chi nhánh & kho nếu xóa hết thùng
        if ($scope.listBoxTemp.length == 0) {
            $scope.modelDisable = {
                BrCode: false,
                WHS_Code: false,
            };
        }

        App.toastrSuccess("Xóa thùng thành công!");
    }
    $scope.removeFileReq = function (index) {
        var itemRemove = $scope.model.ListFileRequest[index];

        if (itemRemove.FileId != null) {
            $scope.model.ListFileRequestRemove.push(itemRemove);
        }
        $scope.model.ListFileRequest.splice(index, 1);

        App.toastrSuccess("Xóa tệp tin thành công!");
    }
    $scope.removeFileBox = function (index) {
        var itemRemove = $scope.listFileBox[index];

        if (itemRemove.FileId != null) {
            $scope.Item.ListFileBoxRemove.push(itemRemove);
        }
        $scope.listFileBox.splice(index, 1);

        App.toastrSuccess("Xóa tệp tin thành công!");
    }

    $scope.changeSelect = function (type, id) {
        switch (type) {
            case "BRANCH":
                var a = $scope.listBranch.filter(k => k.OrgAddonCode === id);
                $scope.branch = change_alias(a[0].OrgName);
                $scope.branchName = a[0].OrgName;
                $scope.branchCode = id;
                $scope.model.WHS_User = '';
                dataservice.getListUserByBranchCode(id, function (rs) {
                    $scope.listWareHouseUser = rs;
                });
                //Lấy ra số thùng tiếp theo
                if ($scope.model.BrCode != undefined && $scope.model.BrCode != null && $scope.model.BrCode != ''
                    && $scope.model.WHS_Code != undefined && $scope.model.WHS_Code != null && $scope.model.WHS_Code != '') {
                    dataservice.getNumBoxth($scope.model.BrCode, $scope.model.WHS_Code, function (rs) {
                        $scope.model.Box.NumBoxth = rs;
                        $scope.NumBoxthStart = rs;
                        $scope.changeBoxNumber($scope.model.Box.NumBoxth);
                    });
                }

                //Tạo mã phiếu Y/C
                $scope.createReqCode($scope.no, $scope.branch, $scope.type, $scope.user);
                break;
            case "WAREHOUSE_USER":
                var a = $scope.listWareHouseUser.filter(k => k.UserName === id);
                $scope.user = change_alias(a[0].UserName);
                //Tạo mã phiếu Y/C
                $scope.createReqCode($scope.no, $scope.branch, $scope.type, $scope.user);
                break;
            case "WAREHOUSE":
                //Lấy ra số thùng tiếp theo
                if ($scope.model.BrCode != undefined && $scope.model.BrCode != null && $scope.model.BrCode != ''
                    && $scope.model.WHS_Code != undefined && $scope.model.WHS_Code != null && $scope.model.WHS_Code != '') {
                    dataservice.getNumBoxth($scope.model.BrCode, $scope.model.WHS_Code, function (rs) {
                        $scope.model.Box.NumBoxth = rs;
                        $scope.NumBoxthStart = rs;
                        $scope.changeBoxNumber($scope.model.Box.NumBoxth);
                    });
                }
                break;
            case "DOCUMENTTYPE":
                var a = $scope.listDocumentType.filter(k => k.SettingID === id);
                $scope.type = change_alias(a[0].Code);
                $scope.typeProfileName = a[0].ValueSet;
                var obj = { id: a[0].SettingID, text: a[0].ValueSet };
                var checkExits = $scope.listDocTypes.filter(k => k.text === a[0].ValueSet);
                if (checkExits.length === 0) {
                    $scope.listDocTypes = [];
                    $scope.listDocTypes.push(obj);
                    //Lấy thời gian lưu trữ
                    dataservice.getStorageTimeLimit(id, function (rs) {
                        $scope.model.Box.StoragePeriod = rs;
                        if (rs == 1000) {
                            $scope.modelShow.StoragePeriod = 'Vĩnh viễn';
                        } else if (rs == 500) {
                            $scope.modelShow.StoragePeriod = 'Đến khi văn bản hết hiệu lực thi hành';
                        } else if (rs == 200) {
                            $scope.modelShow.StoragePeriod = 'Theo tuổi thọ công trình, thiết bị';
                        } else {
                            $scope.modelShow.StoragePeriod = rs;
                        }
                    });
                }
                $scope.docType = id;
                //Tạo mã phiếu Y/C
                $scope.createReqCode($scope.no, $scope.branch, $scope.type, $scope.user);

                //Tạo Mã cho thùng
                dataservice.genBoxCode($scope.boxNumber, $scope.branchCode, $scope.docType, $scope.userId, function (rs) {
                    $scope.model.Box.BoxCode = rs;

                    dataservice.generatorQRCode($scope.model.Box.BoxCode, function (result) {
                        $scope.QR_Code_Box = result;
                    });
                });
                break;
            case "PACKING_STAFF":
                var a = $scope.listStaffBranch.filter(k => k.Code === id);
                $scope.userId = id;
                //var obj = { text: a[0].UserName };
                var obj = { Code: a[0].Code, text: a[0].Name };
                var checkExits = $scope.listUsers.filter(k => k.Code === a[0].Code);
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

    $scope.getValueStaff = function (listMemberId) {
        var arrMemberId = listMemberId.split(',');
        $scope.listUsers = [];
        for (var i = 0; i < arrMemberId.length; i++) {
            $scope.model.Box.PackingStaff = arrMemberId[i];

            //var a = $scope.listWareHouseUser.filter(k => k.Code === arrMemberId[i]);
            var a = $scope.listStaffBranch.filter(k => k.Code === arrMemberId[i]);
            //var obj = { text: a[0].UserName };
            if (a.length > 0) {
                //var obj = { Code: a[0].Code, text: a[0].GivenName };
                var obj = { Code: a[0].Code, text: a[0].Name };
                var checkExits = $scope.listUsers.filter(k => k.Code === a[0].Code);
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
            if (a.length > 0) {
                $scope.typeProfileName = a[0].ValueSet;
                var obj = { id: a[0].SettingID, text: a[0].ValueSet };
                var checkExits = $scope.listDocTypes.filter(k => k.text === a[0].ValueSet);
                if (checkExits.length === 0) {
                    $scope.listDocTypes.push(obj);
                }
            }
        }
    };

    $scope.setValueListStaff = function () {
        if ($scope.listUsers.length > 0) {
            $scope.listUserId = [];
            for (var i = 0; i < $scope.listUsers.length; i++) {
                $scope.listUserId.push($scope.listUsers[i].Code);
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

    $scope.addBox = function () {
        if ($scope.model.BrCode != undefined && $scope.model.BrCode != null && $scope.model.BrCode != ''
            && $scope.model.WHS_Code != undefined && $scope.model.WHS_Code != null && $scope.model.WHS_Code != '') {
            $scope.setValueListStaff();
            $scope.setValueListDocType();
            var modelBox = $scope.model.Box;
            $scope.model.Box.DepartCode = $scope.model.BrCode;

            dataservice.generatorQRCode($scope.model.Box.BoxCode, function (result) {
                $scope.model.Box.QR_Code = result;

                var obj = {
                    BoxCode: modelBox.BoxCode,
                    QR_Code: $scope.model.Box.QR_Code,
                    TypeProfile: modelBox.TypeProfile,
                    TypeProfileName: $scope.typeProfileName,
                    DepartCode: modelBox.DepartCode,
                    BranchName: $scope.branchName,
                    NumBoxth: modelBox.NumBoxth,
                    PackingStaff: modelBox.PackingStaff,
                    StartTime: modelBox.StartTime,
                    EndTime: modelBox.EndTime,
                    StorageTime: modelBox.StorageTime,
                    StatusSecurity: modelBox.StatusSecurity,
                    StoragePeriod: modelBox.StoragePeriod,
                    LstMemberId: modelBox.LstMemberId,
                    RqCode: $scope.model.RqTicketCode,
                    LstTypeProfileId: modelBox.LstTypeProfileId,
                    ListFileBox: $scope.listFileBox
                }

                var checkExits = $scope.listBoxTemp.filter(k => k.BoxCode === $scope.model.Box.BoxCode || k.NumBoxth === $scope.model.Box.NumBoxth);

                if ($scope.model.Box.BoxCode == undefined || $scope.model.Box.BoxCode == null || $scope.model.Box.BoxCode == '') {
                    App.toastrError("Nhập các trường bắt buộc trước!");
                } else {
                    if (checkExits.length == 0) {
                        $scope.updateListDocTypeAll($scope.listBoxTemp, $scope.listDocTypes);

                        $scope.listBoxTemp.push(obj);

                        $scope.model.Box.NumBoxth = $scope.NumBoxthStart + $scope.listBoxTemp.length;
                        $scope.model.NumBox = $scope.listBoxTemp.length;
                        $scope.changeBoxNumber($scope.model.Box.NumBoxth);

                       // App.toastrSuccess("Thêm thùng thành công!");
                        App.toastrSuccess(caption.EDMSSRP_MSG_ADD_BOX_SUCCESS)
                    } else {
                        App.toastrError("Thùng đã tồn tại!");
                    }
                    $scope.modelDisable = {
                        BrCode: true,
                        WHS_Code: true,
                    };
                }
            });
        } else {
            App.toastrError("Chọn chi nhánh và kho trước!");
        }
    }
    $scope.editItem = function (x) {
        $scope.isEditBox = true;
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
            RqCode: obj.RqCode,
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
            $scope.listBoxTemp[b].RqCode = $scope.model.RqTicketCode;

            //Cập nhật lại QR_Code cho mảng tạm
            dataservice.generatorQRCode($scope.model.Box.BoxCode, function (result) {
                $scope.listBoxTemp[b].QR_Code = result;
            });

            $scope.updateListDocTypeAll($scope.listBoxTemp, $scope.listDocTypes);

            $scope.model.Box.NumBoxth = $scope.NumBoxthStart + $scope.listBoxTemp.length;
            $scope.model.NumBox = $scope.listBoxTemp.length;
            $scope.changeBoxNumber($scope.model.Box.NumBoxth);

            App.toastrSuccess("Sửa thùng thành công!");
            $scope.isEditBox = false;
        } else {//Trường hợp thay đổi BoxCode
            var checkExits = $scope.listBoxTemp.filter(k => k.BoxCode === $scope.model.Box.BoxCode || k.NumBoxth === $scope.model.Box.NumBoxth);

            if (checkExits.length > 0) {//Trường hợp sửa BoxCode lại trùng với 1 mã trong Danh sách
                App.toastrError("Thùng đã tồn tại!");
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
                $scope.listBoxTemp[b].RqCode = $scope.model.RqTicketCode;

                $scope.model.Box.DepartCode = $scope.model.BrCode;
                //Cập nhật lại QR_Code cho mảng tạm
                dataservice.generatorQRCode($scope.model.Box.BoxCode, function (result) {
                    $scope.listBoxTemp[b].QR_Code = result;
                });

                $scope.updateListDocTypeAll($scope.listBoxTemp, $scope.listDocTypes);

                $scope.model.Box.NumBoxth = $scope.NumBoxthStart + $scope.listBoxTemp.length;
                $scope.model.NumBox = $scope.listBoxTemp.length;
                $scope.changeBoxNumber($scope.model.Box.NumBoxth);

                App.toastrSuccess("Sửa thùng thành công!");
                $scope.isEditBox = false;
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

    $scope.loadFileReq = function (event) {
        var files = event.target.files;
        var checkExits = $scope.model.ListFileRequest.filter(k => k.FileName === files[0].name);
        if (checkExits.length == 0) {
            var formData = new FormData();
            formData.append("file", files[0] != undefined ? files[0] : null);

            dataservice.uploadFile(formData, function (rs) {
                var input = $("#FileReq");
                input.replaceWith(input.val('').clone(true));
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.model.ListFileRequest.push(rs.Object);
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
                var input = $("#FileBox");
                input.replaceWith(input.val('').clone(true));
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
        if ($scope.addform.validate()) {
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
                    $scope.model.RqStatus = $rootScope.status[0].Code;
                dataservice.insertRequestInputStore($scope.model, function (rs) {
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                });
            } else {
                App.toastrError(caption.EDMSSRP_MSG_ADD_DOCUMENT_BEFORE_CREATING_STOCK)
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
        });
        $("#dateTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateFrom').datepicker('setEndDate', maxDate);
        });

        //Hộp tài liệu thời gian phát sinh từ -> đến, Ngày lưu kho
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
    $scope.NumBoxthStart = null;
    $scope.modelDisable = {
        BrCode: false,
        WHS_Code: false,
    };
    $scope.modelShow = {};
    $scope.model = {
        Id: '',
        RqTicketCode: '',
        BrCode: '',
        WHS_Code: '',
        WHS_User: '',
        NumBox: 0,
        DocType: '',
        FromDate: '',
        ToDate: '',
        Note: '',
        QR_Code: '',
        RqStatus: '',
        RqSupport: '',
        ListBox: [],
        ListBoxIDDelete: [],
        ListFileRequest: [],
        ListFileRequestRemove: [],
        Box: {
            Id: '',
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
            RqCode: ''
        }
    };

    $scope.no = 1;
    $scope.statusEditBox = false;
    $scope.isEditBox = false;

    $scope.branch = '';
    $scope.type = '';
    $scope.user = '';

    $scope.boxNumber = '';
    $scope.branchCode = '';
    $scope.docType = '';
    $scope.userId = '';

    $scope.branchName = '';
    $scope.typeProfileName = '';
    $scope.RqTicketCodeUpdate = '';

    $scope.QR_Code_Box = '';
    $scope.QR_Code_Req = '';
    $scope.Item = '';

    $scope.listDocTypes = [];
    $scope.listUsers = [];
    $scope.listDocTypeAll = [];

    $scope.security = [{
        Code: "01",
        Name: "Cao"
    }, {
        Code: "02",
        Name: "Rất cao"
    }]
    $scope.listBranch = [];
    $scope.listWareHouse = [];
    $scope.listWareHouseUser = [];
    $scope.listDocumentType = [];
    $scope.listBoxTemp = [];
    $scope.listBoxIdDelete = [];
    $scope.listFileBox = [];

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.activity = function () {
        debugger
        var rqId = $scope.model.Id;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/activity.html',
            controller: 'activity',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        rqId
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }
    $scope.initLoad = function () {
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

        dataservice.getRequestInputStoreDetail(para.id, function (rs) {
            $scope.model = rs;
            $scope.listBoxTemp = rs.ListBox;

            //Ẩn hiện chọn chi nhánh & kho
            if ($scope.listBoxTemp.length == 0) {
                $scope.modelDisable = {
                    BrCode: false,
                    WHS_Code: false,
                };
            } else {
                $scope.modelDisable = {
                    BrCode: true,
                    WHS_Code: true,
                };
            }

            //Gán mã Y/C Trước khi có sự thay đổi
            $scope.RqTicketCodeUpdate = $scope.model.RqTicketCode;

            var a = $scope.listBranch.filter(k => k.OrgAddonCode === $scope.model.BrCode);
            $scope.branch = change_alias(a[0].OrgName);
            $scope.branchName = a[0].OrgName;
            $scope.branchCode = $scope.model.BrCode;

            dataservice.getListUserByBranchCode(rs.BrCode, function (rs) {
                $scope.listWareHouseUser = rs;
            });

            //Hiển thị QR_Code
            dataservice.generatorQRCode($scope.model.RqTicketCode, function (result) {
                $scope.QR_Code_Req = result;
            });

            //Lấy danh sách loại chứng từ hiển thị lên
            var listDocTypeID = $scope.model.DocType.split(',');
            if (listDocTypeID.length > 0) {
                for (var i = 0; i < listDocTypeID.length; i++) {
                    var a = $scope.listDocumentType.filter(k => k.SettingID === parseInt(listDocTypeID[i]));
                    if (a.length > 0) {
                        $scope.type = change_alias(a[0].Code);
                        $scope.typeProfileName = a[0].ValueSet;
                        var obj = { id: a[0].SettingID, text: a[0].ValueSet };

                        var checkExits = $scope.listDocTypeAll.filter(k => k.id === a[0].SettingID);
                        if (checkExits.length === 0) {
                            $scope.listDocTypeAll.push(obj);
                        }
                    }
                    else {
                        $scope.type = '';
                        $scope.typeProfileName = '';
                        $scope.listDocTypeAll = [];
                    }
                }
            }
        });
    }
    $scope.initLoad();

    $scope.createReqCode = function (no, branch, type, user) {
        var result = "";
        var date = new Date();
        var time = (date.getMonth() + 1) + '' + date.getDate() + '' + date.getFullYear();
        var today = moment().format('DDMMYYYY');
        result = "rqi." + no + "_b." + branch + "_v." + type + "_u." + user + "_t." + today;
        $scope.model.RqTicketCode = result;
        dataservice.generatorQRCode($scope.model.RqTicketCode, function (result) {
            $scope.QR_Code_Req = result;
        });
    };
    $scope.removeUser = function (index) {
        if ($scope.listUsers[index].Code == $scope.model.Box.PackingStaff)
            $scope.model.Box.PackingStaff = '';

        $scope.listUsers.splice(index, 1);
        if ($scope.listUsers.length == 0)
            $scope.model.Box.PackingStaff = '';
    }
    $scope.removeDocType = function (index) {
        if ($scope.listDocTypes[index].id == $scope.model.Box.TypeProfile) {
            $scope.model.Box.TypeProfile = '';
            $scope.model.Box.StoragePeriod = '';
            $scope.modelShow.StoragePeriod = '';
        }

        $scope.listDocTypes.splice(index, 1);
        if ($scope.listDocTypes.length == 0) {
            $scope.model.Box.TypeProfile = '';
            $scope.model.Box.StoragePeriod = '';
            $scope.modelShow.StoragePeriod = '';
        }
    }
    $scope.removeItem = function (index) {
        var idDelete = $scope.listBoxTemp[index].Id;
        $scope.listBoxIdDelete.push(idDelete);
        $scope.listBoxTemp.splice(index, 1);

        $scope.model.Box.NumBoxth = $scope.NumBoxthStart + $scope.listBoxTemp.length;
        $scope.model.NumBox = $scope.listBoxTemp.length;
        $scope.changeBoxNumber($scope.model.Box.NumBoxth);

        //Mở chọn chi nhánh & kho nếu xóa hết thùng
        if ($scope.listBoxTemp.length == 0) {
            $scope.modelDisable = {
                BrCode: false,
                WHS_Code: false,
            };
        }

        App.toastrSuccess("Xóa thùng thành công!");
    }
    $scope.removeFileReq = function (index) {
        var itemRemove = $scope.model.ListFileRequest[index];

        if (itemRemove.FileId != null) {
            $scope.model.ListFileRequestRemove.push(itemRemove);
        }
        $scope.model.ListFileRequest.splice(index, 1);

        App.toastrSuccess("Xóa tệp tin thành công!");
    }
    $scope.removeFileBox = function (index) {
        var itemRemove = $scope.listFileBox[index];

        if (itemRemove.FileId != null) {
            $scope.Item.ListFileBoxRemove.push(itemRemove);
        }
        $scope.listFileBox.splice(index, 1);

        App.toastrSuccess("Xóa tệp tin thành công!");
    }

    $scope.changeSelect = function (type, id) {
        switch (type) {
            case "BRANCH":
                var a = $scope.listBranch.filter(k => k.OrgAddonCode === id);
                if (a.length > 0) {
                    $scope.branch = change_alias(a[0].OrgName);
                    $scope.branchName = a[0].OrgName;
                    $scope.branchCode = id;
                    $scope.model.WHS_User = '';
                    dataservice.getListUserByBranchCode(id, function (rs) {
                        $scope.listWareHouseUser = rs;
                    });
                }

                if ($scope.model.Box != undefined)
                    $scope.model.Box.PackingStaff = '';

                //Lấy ra số thùng tiếp theo
                if ($scope.model.BrCode != undefined && $scope.model.BrCode != null && $scope.model.BrCode != ''
                    && $scope.model.WHS_Code != undefined && $scope.model.WHS_Code != null && $scope.model.WHS_Code != '') {
                    dataservice.getNumBoxth($scope.model.BrCode, $scope.model.WHS_Code, function (rs) {
                        if ($scope.model.Box != undefined)
                            $scope.model.Box.NumBoxth = rs;
                        $scope.NumBoxthStart = rs;
                        $scope.changeBoxNumber(rs);
                    });
                }

                //Tạo mã phiếu Y/C
                $scope.createReqCode($scope.no, $scope.branch, $scope.type, $scope.user);
                break;
            case "WAREHOUSE_USER":
                var a = $scope.listWareHouseUser.filter(k => k.UserName === id);
                $scope.user = change_alias(a[0].UserName);

                //Tạo mã phiếu Y/C
                $scope.createReqCode($scope.no, $scope.branch, $scope.type, $scope.user);
                break;
            case "WAREHOUSE":
                //Lấy ra số thùng tiếp theo
                if ($scope.model.BrCode != undefined && $scope.model.BrCode != null && $scope.model.BrCode != ''
                    && $scope.model.WHS_Code != undefined && $scope.model.WHS_Code != null && $scope.model.WHS_Code != '') {
                    dataservice.getNumBoxth($scope.model.BrCode, $scope.model.WHS_Code, function (rs) {
                        $scope.model.Box.NumBoxth = rs;
                        $scope.NumBoxthStart = rs;
                        $scope.changeBoxNumber($scope.model.Box.NumBoxth);
                    });
                }
                break;
            case "DOCUMENTTYPE":
                var a = $scope.listDocumentType.filter(k => k.SettingID === id);
                $scope.type = change_alias(a[0].Code);
                $scope.typeProfileName = a[0].ValueSet;
                var obj = { id: a[0].SettingID, text: a[0].ValueSet };
                var checkExits = $scope.listDocTypes.filter(k => k.text === a[0].ValueSet);
                if (checkExits.length === 0) {
                    $scope.listDocTypes = [];
                    $scope.listDocTypes.push(obj);
                    //Lấy thời gian lưu trữ
                    dataservice.getStorageTimeLimit(id, function (rs) {
                        $scope.model.Box.StoragePeriod = rs;
                        if (rs == 1000) {
                            $scope.modelShow.StoragePeriod = 'Vĩnh viễn';
                        } else if (rs == 500) {
                            $scope.modelShow.StoragePeriod = 'Đến khi văn bản hết hiệu lực thi hành';
                        } else if (rs == 200) {
                            $scope.modelShow.StoragePeriod = 'Theo tuổi thọ công trình, thiết bị';
                        } else {
                            $scope.modelShow.StoragePeriod = rs;
                        }
                    });
                }
                $scope.docType = id;
                //Tạo mã phiếu Y/C
                $scope.createReqCode($scope.no, $scope.branch, $scope.type, $scope.user);

                //Tạo Mã cho thùng
                dataservice.genBoxCode($scope.boxNumber, $scope.branchCode, $scope.docType, $scope.userId, function (rs) {
                    $scope.model.Box.BoxCode = rs;

                    dataservice.generatorQRCode($scope.model.Box.BoxCode, function (result) {
                        $scope.QR_Code_Box = result;
                    });
                });
                break;
            case "PACKING_STAFF":
                var a = $scope.listStaffBranch.filter(k => k.Code === id);
                $scope.userId = id;
                //var obj = { text: a[0].UserName };
                var obj = { Code: a[0].Code, text: a[0].Name };
                var checkExits = $scope.listUsers.filter(k => k.Code === a[0].Code);
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

    $scope.addBox = function () {
        if ($scope.model.BrCode != undefined && $scope.model.BrCode != null && $scope.model.BrCode != ''
            && $scope.model.WHS_Code != undefined && $scope.model.WHS_Code != null && $scope.model.WHS_Code != '') {
            $scope.setValueListStaff();
            $scope.setValueListDocType();
            var modelBox = $scope.model.Box;
            $scope.model.Box.DepartCode = $scope.model.BrCode;

            dataservice.generatorQRCode($scope.model.Box.BoxCode, function (result) {
                $scope.model.Box.QR_Code = result;

                var obj = {
                    BoxCode: modelBox.BoxCode,
                    QR_Code: $scope.model.Box.QR_Code,
                    TypeProfile: modelBox.TypeProfile,
                    TypeProfileName: $scope.typeProfileName,
                    DepartCode: modelBox.DepartCode,
                    BranchName: $scope.branchName,
                    NumBoxth: modelBox.NumBoxth,
                    PackingStaff: modelBox.PackingStaff,
                    StartTime: modelBox.StartTime,
                    EndTime: modelBox.EndTime,
                    StorageTime: modelBox.StorageTime,
                    StatusSecurity: modelBox.StatusSecurity,
                    StoragePeriod: modelBox.StoragePeriod,
                    LstMemberId: modelBox.LstMemberId,
                    RqCode: $scope.model.RqTicketCode,
                    LstTypeProfileId: modelBox.LstTypeProfileId,
                    ListFileBox: $scope.listFileBox,
                    ListFileBoxRemove: modelBox.ListFileBoxRemove
                }

                var checkExits = $scope.listBoxTemp.filter(k => k.BoxCode === $scope.model.Box.BoxCode);

                if ($scope.model.Box.BoxCode == undefined || $scope.model.Box.BoxCode == null || $scope.model.Box.BoxCode == '') {
                    App.toastrError("Nhập các trường bắt buộc trước!");
                } else {
                    if (checkExits.length == 0) {
                        $scope.updateListDocTypeAll($scope.listBoxTemp, $scope.listDocTypes);

                        $scope.listBoxTemp.push(obj);

                        $scope.model.Box.NumBoxth = $scope.NumBoxthStart + $scope.listBoxTemp.length;
                        $scope.model.NumBox = $scope.listBoxTemp.length;
                        $scope.changeBoxNumber($scope.model.Box.NumBoxth);

                        App.toastrSuccess("Thêm hộp thành công!");
                    } else {
                        App.toastrError("Mã hộp đã tồn tại!");
                    }
                    $scope.modelDisable = {
                        BrCode: true,
                        WHS_Code: true,
                    };
                }
            });
        }
        else {
            App.toastrError("Chọn chi nhánh và kho trước!");
        }
    }

    $scope.editItem = function (x) {
        $scope.isEditBox = true;
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
            RqCode: obj.RqCode,
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
            $scope.listBoxTemp[b].RqCode = $scope.model.RqTicketCode;

            //Cập nhật lại QR_Code cho mảng tạm
            dataservice.generatorQRCode($scope.model.Box.BoxCode, function (result) {
                $scope.listBoxTemp[b].QR_Code = result;
            });

            $scope.updateListDocTypeAll($scope.listBoxTemp, $scope.listDocTypes);

            $scope.model.Box.NumBoxth = $scope.NumBoxthStart + $scope.listBoxTemp.length;
            $scope.model.NumBox = $scope.listBoxTemp.length;
            $scope.changeBoxNumber($scope.model.Box.NumBoxth);

            App.toastrSuccess("Sửa hộp thành công!");
            $scope.isEditBox = false;
        } else {//Trường hợp thay đổi BoxCode
            var checkExits = $scope.listBoxTemp.filter(k => k.BoxCode === $scope.model.Box.BoxCode);

            if (checkExits.length > 0) {//Trường hợp sửa BoxCode lại trùng với 1 mã trong Danh sách
                App.toastrError("Mã hộp đã tồn tại!");
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
                $scope.listBoxTemp[b].RqCode = $scope.model.RqTicketCode;

                $scope.model.Box.DepartCode = $scope.model.BrCode;
                //Cập nhật lại QR_Code cho mảng tạm
                dataservice.generatorQRCode($scope.model.Box.BoxCode, function (result) {
                    $scope.listBoxTemp[b].QR_Code = result;
                });

                $scope.updateListDocTypeAll($scope.listBoxTemp, $scope.listDocTypes);

                $scope.model.Box.NumBoxth = $scope.NumBoxthStart + $scope.listBoxTemp.length;
                $scope.model.NumBox = $scope.listBoxTemp.length;
                $scope.changeBoxNumber($scope.model.Box.NumBoxth);

                App.toastrSuccess("Sửa hộp thành công!");
                $scope.isEditBox = false;
            }
        }
    }

    $scope.getValueStaff = function (listMemberId) {
        var arrMemberId = listMemberId.split(',');
        $scope.listUsers = [];
        for (var i = 0; i < arrMemberId.length; i++) {
            $scope.model.Box.PackingStaff = arrMemberId[i];

            //var a = $scope.listWareHouseUser.filter(k => k.Code === arrMemberId[i]);
            var a = $scope.listStaffBranch.filter(k => k.Code === arrMemberId[i]);
            //var obj = { text: a[0].UserName };
            if (a.length > 0) {
                //var obj = { Code: a[0].Code, text: a[0].GivenName };
                var obj = { Code: a[0].Code, text: a[0].Name };
                var checkExits = $scope.listUsers.filter(k => k.Code === a[0].Code);
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
            if (a.length > 0) {
                $scope.typeProfileName = a[0].ValueSet;
                var obj = { id: a[0].SettingID, text: a[0].ValueSet };
                var checkExits = $scope.listDocTypes.filter(k => k.text === a[0].ValueSet);
                if (checkExits.length === 0) {
                    $scope.listDocTypes.push(obj);
                }
            }
        }
    };

    $scope.setValueListStaff = function () {
        if ($scope.listUsers.length > 0) {
            $scope.listUserId = [];
            for (var i = 0; i < $scope.listUsers.length; i++) {
                $scope.listUserId.push($scope.listUsers[i].Code);
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

    $scope.loadFileReq = function (event) {
        var files = event.target.files;
        var checkExits = $scope.model.ListFileRequest.filter(k => k.FileName === files[0].name);
        if (checkExits.length == 0) {
            var formData = new FormData();
            formData.append("file", files[0] != undefined ? files[0] : null);

            dataservice.uploadFile(formData, function (rs) {
                var input = $("#FileReq");
                input.replaceWith(input.val('').clone(true));
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.model.ListFileRequest.push(rs.Object);
                }
            });
        } else {
            App.toastrError("Tệp tin đã tồn tại!");
        }
    }
    $scope.loadFileBox = function (event) {
        var files = event.target.files;
        var box = $scope.model.ListBox.filter(k => k.Id === $scope.model.Box.Id);
        if (box.length > 0) {
            var checkExits = $scope.listFileBox.filter(k => k.FileName === files[0].name);
            if (checkExits.length == 0) {
                var formData = new FormData();
                formData.append("file", files[0] != undefined ? files[0] : null);

                dataservice.uploadFile(formData, function (rs) {
                    var input = $("#FileBox");
                    input.replaceWith(input.val('').clone(true));
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
        } else {
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
                        Group: 'REQUESTPROFILE_STATUS',
                        GroupNote: 'Trạng thái yêu cầu nhập kho hồ sơ',
                        AssetCode: 'WAREHOUSE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataservice.getListStatus(function (rs) {
                $rootScope.status = rs.Object;
            });
        }, function () { });
    }

    $scope.submit = function () {
        if ($scope.editform.validate()) {
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
            if ($scope.model.RqStatus == "REJECTED") {
                $scope.reasonReject();
            } else {
                dataservice.updateRequestInputStore($scope.model, function (rs) {
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                });
            }
        }
    }

    $scope.reasonReject = function () {
        var model = $scope.model;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/reasonReject.html',
            controller: 'reasonReject',
            backdrop: 'static',
            size: '50',
            resolve: {
                para: function () {
                    return { model };
                }
            }
        });
        modalInstance.result.then(function (d) {
            $uibModalInstance.close();
        }, function () {
        });
    };

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
        });
        $("#dateTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateFrom').datepicker('setEndDate', maxDate);
        });

        //Hộp tài liệu thời gian phát sinh từ -> đến, Ngày lưu kho
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

app.controller('activity', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataservice, $timeout, para) {
    $scope.listRequestTracking = [];
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.initLoad = function () {
        dataservice.getListRequestTrackingByRqId(para.rqId, function (rs) {
            for (var i = 0; i < rs.Object.length; i++) {
                switch (rs.Object[i].RqStatus) {
                    case "PENDING":
                        rs.Object[i].RqStatus = "Khởi tạo";
                        rs.Object[i].TextColor = "text-success";
                        break;
                    case "WAITING":
                        rs.Object[i].RqStatus = "Đang chờ";
                        rs.Object[i].TextColor = "text-warning";
                        break;
                    case "APPROVED":
                        rs.Object[i].RqStatus = "Duyệt";
                        rs.Object[i].TextColor = "text-primary";
                        break;
                    case "REJECTED":
                        rs.Object[i].RqStatus = "Từ chối";
                        rs.Object[i].TextColor = "text-danger";
                        break;
                }
            }
            $scope.listRequestTracking = rs.Object;
        });
    };

    $scope.initLoad();
});

app.controller('reasonReject', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataservice, $timeout, para) {
    $scope.model = {
        Reason: '',
        RqId: 0,
        BrCode: '',
        RqTicketCode: ''
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.initLoad = function () {
        $scope.model.RqId = para.model.Id;
        $scope.model.BrCode = para.model.BrCode;
        $scope.model.RqTicketCode = para.model.RqTicketCode;
    };

    $scope.initLoad();

    $scope.submit = function () {
        if ($scope.reasonform.validate()) {
            $scope.model.Reason = $scope.model.ReasonReject;
            dataservice.reasonRejectRequestInputStore($scope.model, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    dataservice.updateRequestInputStore(para.model, function (rs) {
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                        }
                    });
                }
            });
        }
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


