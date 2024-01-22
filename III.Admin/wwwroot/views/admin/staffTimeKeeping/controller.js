var ctxfolder = "/views/admin/staffTimeKeeping";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD', "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', "pascalprecht.translate", 'ngSanitize', "ngCookies"]);

app.factory('dataservice', function ($http) {
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
        checkIn: function (data, callback) {
            $http.post('/Admin/StaffTimeKeeping/CheckIn', data).then(callback);
        },
        checkOut: function (data, callback) {
            $http.post('/Admin/StaffTimeKeeping/CheckOut', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/StaffTimeKeeping/Delete', data).then(callback);
        },
        getListUser: function (callback) {
            $http.post('/Admin/User/GetListUser').then(callback);
        },
        getListEmployee: function (callback) {
            $http.post('/Admin/WorkBookSalary/GetEmployee').then(callback);
        },
        getLastInOut: function (callback) {
            $http.post('/Admin/StaffTimeKeeping/GetLastInOut').then(callback);
        },
        getEmployeeDetailTimeSheet: function (month, departmentId, callback) {
            $http.post('/Admin/WorkBookSalary/GetEmployeeDetailTimeSheet?month=' + month + '&departmentId=' + departmentId).then(callback);
        },
        getAllPlanSchedule: function (month, departmentId, userName, callback) {
            $http.post('/Admin/StaffTimeKeeping/GetAllPlanSchedule?month=' + month + '&departmentCode=' + departmentId + '&userName=' + userName).then(callback);
        },
        getDepartment: function (callback) {
            $http.post('/Admin/HREmployee/GetDepartment').then(callback);
        },
        exportExcelTimeSheet: function (data, callback) {
            $http.post('/Admin/StaffTimeKeeping/ExportExcelTimeSheet', data).then(callback);
        },

        getAllShiftOfUser: function (userName, callback) {
            $http.post("/Admin/StaffTimeKeeping/GetAllShiftOfUser?userName=" + userName).then(callback);
        },
        uploadImageInOut: function (data, callback) {
            submitFormUpload('/Admin/StaffTimeKeeping/UploadImage/', data, callback);
        },
        checkInOutManual: function (data, callback) {
            $http.post("/Admin/StaffTimeKeeping/CheckInOutManual", data).then(callback);
        },
        updateCheckInOutManual: function (data, callback) {
            $http.post("/Admin/StaffTimeKeeping/UpdateCheckInOutManual", data).then(callback);
        },
        getCheckInOutManual: function (data, callback) {
            $http.post("/Admin/StaffTimeKeeping/GetCheckInOutManual?shiftCode=" + data).then(callback);
        },
        getItemShift: function (data, callback) {
            $http.post("/Admin/StaffTimeKeeping/GetItemShift?id=" + data).then(callback);
        },
        getBranch: function (callback) {
            $http.post('/Admin/Project/GetBranch').then(callback);
        },
        getDepartmentInBranch: function (data, callback) {
            $http.post('/Admin/CardJob/GetDepartmentInBranch?branch=' + data).then(callback);
        },
        getListUserInDepartment: function (departmentCode, data, callback) {
            $http.get('/Admin/StaffTimeKeeping/GetListUserInDepartment/?departmentCode=' + departmentCode + '&branch=' + data).then(callback);
        },
        //staffKeeping: function (fromDate, toDate, department, branch, userName, callback) {
        //    $http.post('/Admin/MapOnline/StaffKeeping?fromDate=' + fromDate + '&toDate=' + toDate + '&department=' + department + '&branch=' + branch + '&userName=' + userName).then(callback);
        //}
    };
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $filter, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;

    $rootScope.$on('$translateChangeSuccess', function () {
        $rootScope.IsTranslate = true;
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        });
        $rootScope.validationOptions = {
            rules: {
                ActionTime: {
                    required: true,
                },
            },
            messages: {
                ActionTime: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.STK_LBL_TIME),
                },
            }
        }

        $rootScope.validationOptionsShiftLog = {
            rules: {
                ChkinTime: {
                    required: true,
                },
                ChkoutTime: {
                    required: true,
                },
                ChkinLocationTxt: {
                    required: true,
                },
                ChkoutLocationTxt: {
                    required: true,
                }
            },
            messages: {
                ChkinTime: {
                    required: "Thời gian check in không được bỏ trống"
                },
                ChkoutTime: {
                    required: "Thời gian check out không được bỏ trống"
                },
                ChkinLocationTxt: {
                    required: "Địa điểm check in không được bỏ trống"
                },
                ChkoutLocationTxt: {
                    required: "Địa điểm check out không được bỏ trống"
                }
            }
        }
    });
    $rootScope.dateNow = $filter('date')(new Date(), 'dd/MM/yyyy');
    $rootScope.statusData = [{
        Code: 'NOTWORK',
        Name: caption.STK_CURD_VALIDATE_NOT_WORK
    }, {
        Code: 'GOLATE',
        Name: caption.STK_CURD_VALIDATE_LATE
    }, {
        Code: 'CHECKIN',
        Name: caption.STK_CURD_VALIDATE_ATTENDANCE
    }]
    dataservice.getListUser(function (rs) {
        rs = rs.data;
        $rootScope.listUser = rs;
        var all = {
            UserName: '',
            GivenName: 'Tất cả'
        };
        $rootScope.listUser.unshift(all);
    });
    dataservice.getListEmployee(function (rs) {
        rs = rs.data;
        $rootScope.listEmployee = rs;
    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/StaffTimeKeeping/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
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

app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.model = {
        UserId: '',
        FromDate: '',
        ToDate: '',
        Branch: ''
    }

    $scope.initData = function () {
        dataservice.getLastInOut(function (rs) {
            rs = rs.data;
            $scope.model.ShiftCode = rs.Object.ShiftCode;
            $scope.IsCheckIn = rs.Object.IsCheckIn;
        })
        dataservice.getBranch(function (rs) {
            rs = rs.data;
            $scope.lstBranch = rs;
        });
        //dataservice.staffKeeping('', '', '', '', '', function (rs) {
        //    rs = rs.data;

        //})
    }

    $scope.initData();

    $scope.branchSelect = function (code) {
        dataservice.getDepartmentInBranch(code, function (rs) {
            rs = rs.data;
            $scope.lstDepartment = rs;
        })
    };

    $scope.departmentSelect = function (code) {
        dataservice.getListUserInDepartment(code, $scope.model.Branch, function (rs) {
            rs = rs.data;
            $rootScope.listUser = rs;
        })
    }

    $scope.addTimekeeping = function () {
        //var modalInstance = $uibModal.open({
        //    animation: true,
        //    templateUrl: ctxfolder + '/addTimekeeping.html',
        //    controller: 'addTimekeeping',
        //    backdrop: 'static',
        //    size: '35'
        //});
        //modalInstance.result.then(function (d) {
        //    $rootScope.reloadTimeKeeping();
        //}, function () {
        //});

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add-check-in-out.html',
            controller: 'add-check-in-out',
            size: '50',
            resolve: {
                para: function () {
                    return -1;
                }
            }

        });
        modalInstance.result.then(function (d) {
            $rootScope.reloadTimeKeeping();
        });
    }

    $scope.export = function () {
        //var orderBy = 'Id DESC';
        //var exportType = 0;
        //var orderArr = $scope.dtInstance.DataTable.order();
        //var column;
        //if (orderArr.length == 2) {
        //    column = $scope.dtInstance.DataTable.init().aoColumns[orderArr[0]];
        //    orderBy = column.mData + ' ' + orderArr[1];
        //} else if (orderArr.length > 0) {
        //    var order = orderArr[0];
        //    column = $scope.dtInstance.DataTable.init().aoColumns[order[0]];
        //    orderBy = column.mData + ' ' + order[1];
        //}
        //var page = vm.dtInstance.DataTable.page() + 1;
        //var length = vm.dtInstance.DataTable.page.len();
        location.href = "/Admin/StaffTimeKeeping/ExportExcel?"
            + "uId=" + $scope.model.UserId
            + "&fromDate=" + $scope.model.FromDate
            + "&toDate=" + $scope.model.ToDate
    }

    $scope.checkIn = function () {
        dataservice.checkIn($scope.model, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $scope.IsCheckIn = true;
                $scope.initData();
            }
        })
    }

    $scope.checkOut = function () {
        dataservice.checkOut($scope.model, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $scope.IsCheckIn = false;
            }
        })
    }

    $scope.isSearch = false;

    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }

    }

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
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
        });
    }

    function initGeolocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(success, fail);
        }
        else {
            alert("Trình duyệt không hỗ trợ");
        }
    }

    function success(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        $.getJSON('https://nominatim.openstreetmap.org/reverse?format=json&', { lat: lat, lon: lon }, function (data) {
            $scope.model.LocationText = data.display_name;
            $scope.model.Lat = lat;
            $scope.model.Lon = lon;
            $scope.$apply();
        });
        $.getJSON('https://api.ipify.org?format=jsonp&callback=?', function (data) {
            $scope.model.Ip = data.ip;
        });
    }

    function fail() {

    }

    setTimeout(function () {
        loadDate();
        //initGeolocation();
    }, 200);
});

app.controller('addTimekeeping', function ($scope, $rootScope, dataservice, $uibModal, $uibModalInstance) {
    $scope.model = {
        UserId: '',
        Ip: '',
        Address: '',
        Lat: '',
        Lon: '',
        LocationText: '',
        Note: '',
        ShiftCode: ''
    }
    $scope.initData = function () {

    }
    $scope.checkIn = false;
    $scope.checkOut = false;
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "UserId" && $scope.model.UserId != "") {
            $scope.errorUserId = false;
        }
        if (SelectType == "Action" && $scope.model.Action != "") {
            $scope.errorAction = false;
        }
    }
    $scope.uploadImage = function () {
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
                App.toastrError(caption.STK_MSG_IMG_FORMAT);
                return;
            } else {
                $scope.model.Picture = files[0];
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click')
    }
    $scope.showCheckIn = function () {
        $("#checkIn").removeClass("hidden");
        $("#checkOut").addClass("hidden");
        $scope.checkIn = true;
        $scope.checkOut = false;
    }
    $scope.hideCheckIn = function () {
        $("#checkIn").addClass("hidden");
        $scope.checkIn = false;
    }
    $scope.showCheckOut = function () {
        $("#checkOut").removeClass("hidden");
        $("#checkIn").addClass("hidden");
        $scope.checkOut = true;
        $scope.checkIn = false;
    }
    $scope.hideCheckOut = function () {
        $("#checkOut").addClass("hidden");
        $scope.checkOut = false;
    }

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            if ($scope.checkIn == false && $scope.checkOut == false) {
                App.toastrError(caption.STK_MSG_CHECKIN_CHECKOUT);
            } else {
                if ($scope.checkIn == true) {
                    dataservice.checkIn($scope.model, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                            $rootScope.reloadTimeKeeping();
                        }
                    })
                } else {
                    dataservice.checkOut($scope.model, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                            $rootScope.reloadTimeKeeping();
                        }
                    })
                }
            }
        }
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    function loadDate() {
        $("#ActionTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ActionTo').datepicker('setStartDate', maxDate);
        });
        $("#ActionTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ActionTime').datepicker('setEndDate', maxDate);
        });
        //$('#DateTo').datepicker('update', $rootScope.DateNow);
        $('.end-date').click(function () {
            $('#ActionTime').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#ActionTo').datepicker('setStartDate', null);
        });
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "UserId" && $scope.model.UserId != "") {
            //dataservice.generateShiftCode($scope.model.UserId, function (rs) {rs=rs.data;
            //    $scope.model.ShiftCode = rs;
            //})
            $scope.errorUserId = false;
        }
    }


    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null user
        if (data.UserId == "") {
            $scope.errorUserId = true;
            mess.Status = true;
        } else {
            $scope.errorUserId = false;
        }
        return mess;
    };
    function initGeolocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(success, fail);
        }
        else {
            alert("Sorry, your browser does not support geolocation services.");
        }
    }
    function success(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        $.getJSON('https://nominatim.openstreetmap.org/reverse?format=json&', { lat: lat, lon: lon }, function (data) {
            $scope.model.LocationText = data.display_name;
            $scope.model.Lat = lat;
            $scope.model.Lon = lon;
            $scope.$apply();
        });
        $.getJSON('https://api.ipify.org?format=jsonp&callback=?', function (data) {
            $scope.model.Ip = data.ip;
        });
    }
    function fail() {

    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        loadDate();
        initGeolocation();
    }, 200);
});

app.controller('gridTimeKeeping', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    vm.dt = {};
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/StaffTimeKeeping/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.UserId = $scope.model.UserId;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate
                d.Branch = $scope.model.Branch;
                d.Department = $scope.model.Department;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(15)
        .withOption('order', [4, 'desc'])
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
            $scope.selected[full.id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ShiftCode').withOption('sClass', 'dataTable-pr20').withTitle('{{"STK_LIST_COL_SHIFT_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withOption('sClass', 'dataTable-pr20').withTitle('{{"STK_LIST_COL_CREATOR" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ChkInTime').withOption('sClass', 'dataTable-pr20').withTitle('{{"STK_LIST_COL_TIME_IN" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ChkOutTime').withOption('sClass', 'dataTable-pr20').withTitle('{{"STK_LIST_COL_TIME_OUT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ChkinLocationTxt').withOption('sClass', 'dataTable-pr20').withTitle('{{"STK_LIST_COL_LOC_IN" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ChkoutLocationTxt').withOption('sClass', 'dataTable-pr20').withTitle('{{"STK_LIST_COL_LOC_OUT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withOption('sClass', 'dataTable-pr20').withTitle('{{"STK_LIST_COL_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'dataTable-w80').withTitle('{{"STK_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="editShift(\'' + full.ShiftCode + '\')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>';
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
    $rootScope.reloadTimeKeeping = function () {
        reloadData(true);
        $rootScope.reloadWorkingTime();
    }

    $scope.editShift = function (shiftCode) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add-check-in-out.html',
            controller: 'add-check-in-out',
            size: '50',
            resolve: {
                para: function () {
                    return shiftCode;
                }
            }

        });
        modalInstance.result.then(function (d) {
            $rootScope.reloadTimeKeeping();
        });
    }

    $scope.editTimekeeping = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/editTimekeeping.html',
            controller: 'editTimekeeping',
            backdrop: 'static',
            size: '40',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }

    $scope.deleteTimekeeping = function (id) {
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
                        }
                        else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                        }
                    });
                };

                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            size: '30',
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
});

app.controller('gridWorkingTime', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    //Grid Time Working
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAllContract(selectAll, selected)"/><span></span></label>';
    vm.dtOptionsContract = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/StaffTimeKeeping/JtableTimeWorking",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.UserId = $scope.model.UserId;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
                d.Branch = $scope.model.Branch;
                d.Department = $scope.model.Department;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(500, "#tblDataTimeWorking")
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(10)
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
            //contextScope.contextMenu = $scope.contextMenu4;
            $compile(angular.element(row))($scope);
            //$compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    vm.dtColumnsContract = [];
    vm.dtColumnsContract.push(DTColumnBuilder.newColumn("ID").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        //$scope.selected[full.ID] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumnsContract.push(DTColumnBuilder.newColumn('UserName').withTitle('{{"STK_LIST_COL_ACCOUNT" | translate}}').withOption('sWidth', '10px').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsContract.push(DTColumnBuilder.newColumn('GivenName').withTitle('{{"STK_LIST_COL_STAFF" | translate}}').withOption('sWidth', '10px').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsContract.push(DTColumnBuilder.newColumn('DateWorking').withTitle('{{"STK_LIST_COL_DATE_CREATED" | translate}}').withOption('sWidth', '10px').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsContract.push(DTColumnBuilder.newColumn('TimeWorking').withTitle('{{"STK_LIST_COL_SUM_HOURS" | translate}}').withOption('sWidth', '10px').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsContract.push(DTColumnBuilder.newColumn('Detail').withTitle('{{"STK_LIST_COL_DETAILS" | translate}}').withOption('sWidth', '10px').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.reloadDataContract = reloadDataContract;
    vm.dtInstanceContract = {};
    $rootScope.reloadWorkingTime = function () {
        reloadDataContract(true);
    }
    function reloadDataContract(resetPaging) {
        vm.dtInstanceContract.reloadData(callbackContract, resetPaging);
    }
    function callbackContract(json) {

    }
});

app.controller('timeSheets', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.model = {
        Month: '',
        UserManager: '',
        UserCreated: '',
        DepartmentId: '',
        TotalWork: 22
    };
    $scope.Total = {
        P: 0,
        CT: 0,
        CTNN: 0,
        NL: 0,
        VR: 0,
        O: 0,
        CO: 0,
        KL: 0,
        VP: 0,
        VP1: 0,
        VP2: 0,
        VP3: 0,
        VP4: 0,
    };

    var currentdate = new Date();
    $scope.month = 'Tháng ' + (currentdate.getMonth() + 1);
    $scope.year = currentdate.getFullYear();

    $scope.init = function () {
        dataservice.getDepartment(function (rs) {
            rs = rs.data;
            $scope.listDepartment = rs.Object;
        });
    };

    $scope.init();

    $scope.changeDepartment = function () {
        $scope._listUser = $rootScope.listEmployee.filter(x => x.DepartmentId === $scope.model.DepartmentId);
    };

    $scope.calTimeSheet = function () {
        if ($scope.model.DepartmentId === '' || $scope.model.DepartmentId === undefined || $scope.model.DepartmentId === null) {
            App.toastrError(caption.STK_TITLE_PLS__SELECT_DEPARTMENT);
            return;
        }

        App.blockUI({
            target: "#contentMain",
            boxed: true,
            message: 'loading...'
        });

        dataservice.getEmployeeDetailTimeSheet($scope.model.Month, $scope.model.DepartmentId, function (rs) {
            rs = rs.data;
            App.unblockUI("#contentMain");
            $scope.listEmployeeDetail = rs.data;
            $scope.groupDepartment = rs.groupDepartment;
            $scope.Total.P = rs.totalP;
            $scope.Total.CT = rs.totalCT;
            $scope.Total.CTNN = rs.totalCTNN;
            $scope.Total.NL = rs.totalNL;
            $scope.Total.VR = rs.totalVR;
            $scope.Total.O = rs.totalO;
            $scope.Total.CO = rs.totalCO;
            $scope.Total.KL = rs.totalKL;
            $scope.Total.VP = rs.totalVP;
            $scope.Total.VP1 = rs.totalVP1;
            $scope.Total.VP2 = rs.totalVP2;
            $scope.Total.VP3 = rs.totalVP3;
            $scope.Total.VP4 = rs.totalVP4;
            //y.Shift != null && y.Shift.IsWorking ? 'x' : ''
            for (var i = 0; i < $scope.listEmployeeDetail.length; i++) {
                let x = $scope.listEmployeeDetail[i];
                for (var j = 0; j < x.ListData.length; j++) {
                    let y = x.ListData[j];
                    if (!y.IsCustom) {
                        y.Value = y.Shift != null && y.Shift.IsWorking ? 'x' : y.Value;
                    }
                }
            }

            if ($scope.model.Month !== null && $scope.model.Month !== undefined && $scope.model.Month !== '') {
                $scope.month = 'Tháng ' + $scope.model.Month.split('/')[0];
                $scope.year = $scope.model.Month.split('/')[1];
            } else {
                var currentdate = new Date();
                $scope.month = 'Tháng ' + (currentdate.getMonth() + 1);
                $scope.year = currentdate.getFullYear();
            }
        });
    };

    $scope.calculateFormula = function (itemDetail, itemData) {
        itemData.IsCustom = true;
        let countWorking = itemDetail.ListData.filter(x => x.Value?.trim() === 'x').length;
        let countP = itemDetail.ListData.filter(x => x.Value?.trim() === 'p').length;
        countP += itemDetail.ListData.filter(x => x.Value?.include('p') && x.Value?.include('1/2')).length;
        let countCT = itemDetail.ListData.filter(x => x.Value?.trim() === 'ct').length;
        countCT += itemDetail.ListData.filter(x => x.Value?.include('ct') && x.Value?.include('1/2')).length;
        let countCTN = itemDetail.ListData.filter(x => x.Value?.trim() === 'ctn').length;
        countCTN += itemDetail.ListData.filter(x => x.Value?.include('ctn') && x.Value?.include('1/2')).length;
        let countVR = itemDetail.ListData.filter(x => x.Value?.trim() === 'vr').length;
        countVR += itemDetail.ListData.filter(x => x.Value?.include('vr') && x.Value?.include('1/2')).length;
    }

    $scope.exportExcel = function () {
        if ($scope.model.DepartmentId === '' || $scope.model.DepartmentId === undefined || $scope.model.DepartmentId === null) {
            App.toastrError(caption.STK_TITLE_PLS__SELECT_DEPARTMENT);
            return;
        }

        if ($scope.listEmployeeDetail.length > 0) {
            if ($scope.model.UserManager === '' || $scope.model.UserManager === undefined || $scope.model.UserManager === null) {
                App.toastrError(caption.STK_TITLE_PLS__SELECT_DEPARTMENT_LEADER);
                return;
            }
            if ($scope.model.UserCreated === '' || $scope.model.UserCreated === undefined || $scope.model.UserCreated === null) {
                App.toastrError(caption.STK_TITLE_PLS_CHOOSE_CREATOR);
                return;
            }

            App.blockUI({
                target: "#contentMain",
                boxed: true,
                message: 'loading...'
            });

            var obj = {
                UserManager: $scope.model.UserManager,
                UserCreated: $scope.model.UserCreated,
                TotalWork: $scope.model.TotalWork,
                ListEmployeeDetail: $scope.listEmployeeDetail
            };

            dataservice.exportExcelTimeSheet(obj, function (rs) {
                rs = rs.data;
                App.unblockUI("#contentMain");
                download(rs.fileName, '/' + rs.pathFile);
            });
        } else {
            App.toastrError(caption.STK_TITLE_STAFF_EMPTY);
        }
    };

    function download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', text);
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
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
        });
    }

    setTimeout(function () {
        loadDate();
    }, 200);
});

app.controller('timeScheduleOvertime', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.model = {
        Month: '',
        UserName: '',
        Branch: '',
        DepartmentId: '',
    };
    $scope.Total = {
        P: 0,
        CT: 0,
        CTNN: 0,
        NL: 0,
        VR: 0,
        O: 0,
        CO: 0,
        KL: 0,
        VP: 0
    };
    $scope.listEmployeeDetail = [];

    var currentdate = new Date();
    $scope.month = 'Tháng ' + (currentdate.getMonth() + 1);
    $scope.year = currentdate.getFullYear();

    $scope.init = function () {
        //dataservice.getDepartment(function (rs) {
        //    rs = rs.data;
        //    $scope.listDepartment = rs.Object;
        //});
        dataservice.getBranch(function (rs) {
            rs = rs.data;
            $scope.lstBranch = rs;
        });
    };

    $scope.init();

    $scope.branchSelect = function (code) {
        dataservice.getDepartmentInBranch(code, function (rs) {
            rs = rs.data;
            $scope.listDepartment = rs;
        })
    };

    $scope.changeDepartment = function (code) {
        dataservice.getListUserInDepartment(code, $scope.model.Branch, function (rs) {
            rs = rs.data;
            $scope._listUser = rs;
        })
        //$scope._listUser = $rootScope.listEmployee.filter(x => x.DepartmentId === $scope.model.DepartmentId);
    };

    $scope.calTimeSheet = function () {
        if ($scope.model.DepartmentId === '' || $scope.model.DepartmentId === undefined || $scope.model.DepartmentId === null) {
            App.toastrError(caption.STK_TITLE_PLS__SELECT_DEPARTMENT);
            return;
        }
        //if ($scope.model.UserName === '' || $scope.model.UserName === undefined || $scope.model.UserName === null) {
        //    App.toastrError('Không được bỏ trống nhân sự');
        //    return;
        //}

        App.blockUI({
            target: "#contentMain",
            boxed: true,
            message: 'loading...'
        });

        dataservice.getAllPlanSchedule($scope.model.Month, $scope.model.DepartmentId, $scope.model.UserName, function (rs) {
            rs = rs.data;
            App.unblockUI("#contentMain");
            $scope.listEmployeeDetail = rs;
            console.log($scope.listEmployeeDetail);
            //$scope.groupDepartment = rs.groupDepartment;
            //$scope.Total.P = rs.totalP;
            //$scope.Total.CT = rs.totalCT;
            //$scope.Total.CTNN = rs.totalCTNN;
            //$scope.Total.NL = rs.totalNL;
            //$scope.Total.VR = rs.totalVR;
            //$scope.Total.O = rs.totalO;
            //$scope.Total.CO = rs.totalCO;
            //$scope.Total.KL = rs.totalKL;
            //$scope.Total.VP = rs.totalVP;
            ////y.Shift != null && y.Shift.IsWorking ? 'x' : ''
            //for (var i = 0; i < $scope.listEmployeeDetail.length; i++) {
            //    let x = $scope.listEmployeeDetail[i];
            //    for (var j = 0; j < x.ListData.length; j++) {
            //        let y = x.ListData[j];
            //        if (!y.IsCustom) {
            //            y.Value = y.Shift != null && y.Shift.IsWorking ? 'x' : y.Value;
            //        }
            //    }
            //}

            //if ($scope.model.Month !== null && $scope.model.Month !== undefined && $scope.model.Month !== '') {
            //    $scope.month = 'Tháng ' + $scope.model.Month.split('/')[0];
            //    $scope.year = $scope.model.Month.split('/')[1];
            //} else {
            //    var currentdate = new Date();
            //    $scope.month = 'Tháng ' + (currentdate.getMonth() + 1);
            //    $scope.year = currentdate.getFullYear();
            //}
        });
    };

    $scope.exportExcel = function () {
        if ($scope.model.DepartmentId === '' || $scope.model.DepartmentId === undefined || $scope.model.DepartmentId === null) {
            App.toastrError(caption.STK_TITLE_PLS__SELECT_DEPARTMENT);
            return;
        }

        if ($scope.listEmployeeDetail.length > 0) {
            if ($scope.model.UserManager === '' || $scope.model.UserManager === undefined || $scope.model.UserManager === null) {
                App.toastrError(caption.STK_TITLE_PLS__SELECT_DEPARTMENT_LEADER);
                return;
            }
            if ($scope.model.UserCreated === '' || $scope.model.UserCreated === undefined || $scope.model.UserCreated === null) {
                App.toastrError(caption.STK_TITLE_PLS_CHOOSE_CREATOR);
                return;
            }

            App.blockUI({
                target: "#contentMain",
                boxed: true,
                message: 'loading...'
            });

            var obj = {
                UserManager: $scope.model.UserManager,
                UserCreated: $scope.model.UserCreated,
                TotalWork: $scope.model.TotalWork,
                ListEmployeeDetail: $scope.listEmployeeDetail
            };

            dataservice.exportExcelTimeSheet(obj, function (rs) {
                rs = rs.data;
                App.unblockUI("#contentMain");
                download(rs.fileName, '/' + rs.pathFile);
            });
        } else {
            App.toastrError(caption.STK_TITLE_STAFF_EMPTY);
        }
    };

    function download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', text);
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    function loadDate() {
        $("#MonthSchedule").datepicker({
            inline: false,
            autoclose: true,
            format: "mm/yyyy",
            fontAwesome: true,
            todayHighlight: true,
            viewMode: "months",
            minViewMode: "months"
        });
    }

    setTimeout(function () {
        loadDate();
    }, 200);
});

app.controller('add-check-in-out', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, $filter, dataservice, para) {
    $scope.model = {
        ChkinTime: '',
        ChkinLocationTxt: '',
        ChkoutTime: '',
        ChkoutLocationTxt: '',
        ChkinPicRealtime: null,
        ChkoutPicRealtime: null,
        ShiftCode: '',
        Note: '',
        UserName: '',
        IsChkinRealTime: true,
        IsBussiness: false,
        BussinessLocation: ''
    }
    $scope.listShiftFormat = []

    $scope.cancel = function () {
        var data = {
            ShiftCode: $scope.model.ShiftCode,
            TimeIn: $scope.model.ChkinTime,
            TimeOut: $scope.model.ChkoutTime,
        };
        $uibModalInstance.close(data);
    }

    $scope.isAdd = false;

    $scope.initData = function () {
        $scope._listUser = $rootScope.listUser.filter(x => x.UserName != '');
        if (para !== -1) {
            dataservice.getCheckInOutManual(para, function (rs) {
                rs = rs.data;
                $scope.model = rs;
                var inTime = $filter('date')($scope.model.ChkinTime, 'HH:mm dd/MM/yyyy');
                var outTime = $filter('date')($scope.model.ChkoutTime, 'HH:mm dd/MM/yyyy')
                var obj = {
                    ShiftCode: $scope.model.ShiftCode,
                    DateIn: inTime,
                    DateOut: outTime
                }
                $scope.listShiftFormat.push(obj);
                dataservice.getAllShiftOfUser(userName, function (rs) {
                    rs = rs.data;
                    $scope.listShift = rs;
                    if ($scope.listShift.length > 0) {
                        for (var i = 0; i < $scope.listShift.length; i++) {
                            var code = $scope.listShift[i].ShiftCode
                            var dateIn = $filter('date')($scope.listShift[i].ChkinTime, 'HH:mm dd/MM/yyyy');
                            var dateOut = $filter('date')($scope.listShift[i].ChkoutTime, 'HH:mm dd/MM/yyyy')
                            var obj = {
                                ShiftCode: code,
                                DateIn: dateIn,
                                DateOut: dateOut
                            }
                            if ($scope.model.ShiftCode != code) {
                                $scope.listShiftFormat.push(obj);
                            }
                        }
                    }
                })
            })
        }
        else {
            $scope.isAdd = true;
        }
    }

    $scope.initData();

    $scope.editCheckInOut = function () {

        if ($scope.addCheckInOut.validate()) {
            var files = $('#FileChkIn').get(0);
            var fileIn = files.files[0];
            var filesOut = $('#FileChkOut').get(0);
            var fileOut = filesOut.files[0];

            var dataOut = new FormData();
            dataOut.append("FileUpload", fileOut);

            var data = new FormData();
            data.append("FileUpload", fileIn);
            if (fileIn != null && fileOut != null) {
                dataservice.uploadImageInOut(data, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                        return;
                    }
                    else {
                        $scope.model.ChkinPicRealtime = '/uploads/images/' + rs.Object;
                        dataservice.uploadImageInOut(dataOut, function (rs) {
                            rs = rs.data;
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                                return;
                            }
                            else {
                                $scope.model.ChkoutPicRealtime = '/uploads/images/' + rs.Object;
                                dataservice.updateCheckInOutManual($scope.model, function (rs) {
                                    rs = rs.data;
                                    if (rs.Error) {
                                        App.toastrError(rs.Title);
                                    } else {
                                        var data = {
                                            ShiftCode: $scope.model.ShiftCode,
                                            TimeIn: $scope.model.ChkinTime,
                                            TimeOut: $scope.model.ChkoutTime,
                                        };
                                        App.toastrSuccess(rs.Title);
                                        $uibModalInstance.close(data);
                                    }
                                })
                            }
                        });
                    }
                });
            } else if (fileIn != null && fileOut == null) {
                dataservice.uploadImageInOut(data, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                        return;
                    } else {
                        $scope.model.ChkinPicRealtime = '/uploads/images/' + rs.Object;
                        dataservice.updateCheckInOutManual($scope.model, function (rs) {
                            rs = rs.data;
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            } else {
                                App.toastrSuccess(rs.Title);
                                var data = {
                                    ShiftCode: $scope.model.ShiftCode,
                                    TimeIn: $scope.model.ChkinTime,
                                    TimeOut: $scope.model.ChkoutTime,
                                };
                                $uibModalInstance.close(data);
                            }
                        })
                    }
                });
            } else if (fileIn == null && fileOut != null) {
                dataservice.uploadImageInOut(dataOut, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                        return;
                    } else {
                        $scope.model.ChkoutPicRealtime = '/uploads/images/' + rs.Object;
                        dataservice.updateCheckInOutManual($scope.model, function (rs) {
                            rs = rs.data;
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            } else {
                                var data = {
                                    ShiftCode: $scope.model.ShiftCode,
                                    TimeIn: $scope.model.ChkinTime,
                                    TimeOut: $scope.model.ChkoutTime,
                                };
                                App.toastrSuccess(rs.Title);
                                $uibModalInstance.close(data);
                            }
                        })
                    }
                });
            } else {
                dataservice.updateCheckInOutManual($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        var data = {
                            ShiftCode: $scope.model.ShiftCode,
                            TimeIn: $scope.model.ChkinTime,
                            TimeOut: $scope.model.ChkoutTime,
                        };
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close(data);
                    }
                })
            }
        }
    };

    $scope.add = function () {
        if ($scope.isAdd == false) {
            $scope.model.ChkinTime = "";
            $scope.model.ChkinLocationTxt = "";
            $scope.model.ChkoutTime = "";
            $scope.model.ChkoutLocationTxt = "";
            $scope.model.ChkinPicRealtime = null;
            $scope.model.ChkoutPicRealtime = null;
            $scope.model.ShiftCode = "";
            $scope.model.Note = "";
            $scope.model.UserName = "";
            $scope.isAdd = true;
        } else {
            if ($scope.addCheckInOut.validate()) {
                //var temp = $rootScope.checkData($scope.model);
                //if (temp.Status) {
                //    App.toastrError(temp.Title);
                //    return;
                //}
                var files = $('#FileChkIn').get(0);
                var fileIn = files.files[0];
                var filesOut = $('#FileChkOut').get(0);
                var fileOut = filesOut.files[0];

                var dataOut = new FormData();
                dataOut.append("FileUpload", fileOut);

                var data = new FormData();
                data.append("FileUpload", fileIn);
                if (fileIn != null && fileOut != null) {
                    dataservice.uploadImageInOut(data, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                            return;
                        }
                        else {
                            $scope.model.ChkinPicRealtime = '/uploads/images/' + rs.Object;
                            dataservice.uploadImageInOut(dataOut, function (rs) {
                                rs = rs.data;
                                if (rs.Error) {
                                    App.toastrError(rs.Title);
                                    return;
                                }
                                else {
                                    $scope.model.ChkoutPicRealtime = '/uploads/images/' + rs.Object;
                                    dataservice.checkInOutManual($scope.model, function (rs) {
                                        rs = rs.data;
                                        if (rs.Error) {
                                            App.toastrError(rs.Title);
                                        } else {
                                            var data = {
                                                ShiftCode: rs.Object.ShiftCode,
                                                TimeIn: $scope.model.ChkinTime,
                                                TimeOut: $scope.model.ChkoutTime,
                                            };
                                            App.toastrSuccess(rs.Title);
                                            $uibModalInstance.close(data);
                                        }
                                    })
                                }
                            });
                        }
                    });
                } else if (fileIn != null && fileOut == null) {
                    dataservice.uploadImageInOut(data, function (rs) {
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                            return;
                        } else {
                            $scope.model.ChkinPicRealtime = '/uploads/images/' + rs.Object;
                            dataservice.checkInOutManual($scope.model, function (rs) {
                                rs = rs.data;
                                if (rs.Error) {
                                    App.toastrError(rs.Title);
                                } else {
                                    App.toastrSuccess(rs.Title);
                                    $uibModalInstance.close();
                                }
                            })
                        }
                    });
                } else if (fileIn == null && fileOut != null) {
                    dataservice.uploadImageInOut(dataOut, function (rs) {
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                            return;
                        } else {
                            $scope.model.ChkoutPicRealtime = '/uploads/images/' + rs.Object;
                            dataservice.checkInOutManual($scope.model, function (rs) {
                                rs = rs.data;
                                if (rs.Error) {
                                    App.toastrError(rs.Title);
                                } else {
                                    var data = {
                                        ShiftCode: rs.Object.ShiftCode,
                                        TimeIn: $scope.model.ChkinTime,
                                        TimeOut: $scope.model.ChkoutTime,
                                    };
                                    App.toastrSuccess(rs.Title);
                                    $uibModalInstance.close(data);
                                }
                            })
                        }
                    });
                } else {
                    dataservice.checkInOutManual($scope.model, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            var data = {
                                ShiftCode: rs.Object.ShiftCode,
                                TimeIn: $scope.model.ChkinTime,
                                TimeOut: $scope.model.ChkoutTime,
                            };
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close(data);
                        }
                    })
                }
            }
        }
    };

    $scope.changeShift = function (select) {
        if (select == "ShiftCode" && $scope.model.ShiftCode != "") {
            dataservice.getCheckInOutManual($scope.model.ShiftCode, function (rs) {
                rs = rs.data;
                $scope.model = rs;
            })
            $scope.isAdd = false;
        }
    }

    $scope.loadImageCheckIn = function () {
        var fileuploader = angular.element("#FileChkIn");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('imageIn').src = reader.result;
            }
            var files = fileuploader[0].files;
            var idxDot = files[0].name.lastIndexOf(".") + 1;
            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
            if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                App.toastrError(caption.COM_MSG_CHECK_ADD_FILEIMAGE);
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click')
    }

    $scope.loadImageCheckOut = function () {
        var fileuploader = angular.element("#FileChkOut");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('imageOut').src = reader.result;
            }
            var files = fileuploader[0].files;
            var idxDot = files[0].name.lastIndexOf(".") + 1;
            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
            if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                App.toastrError(caption.COM_MSG_CHECK_ADD_FILEIMAGE);
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click')
    }

    function loadDate() {
        $("#chkinTime").datetimepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy hh:ii:ss",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#chkoutTime').datetimepicker('setStartDate', maxDate);
        });
        $("#chkoutTime").datetimepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy hh:ii:ss",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#chkinTime').datetimepicker('setEndDate', maxDate);
        });
    }

    function validateDefaultDate(startDate, endDate) {
        setStartDate("#chkinTime", startDate);
        setStartDate("#chkoutTime", startDate);
    }

    setTimeout(function () {
        loadDate();
        setModalDraggable(".modal-dialog");
    }, 400);
});
