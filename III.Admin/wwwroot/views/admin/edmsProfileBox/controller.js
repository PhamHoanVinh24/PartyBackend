var ctxfolder = "/views/admin/edmsProfileBox";
var ctxfolderMessage = "/views/message-box";
var ctxfolderQrCode = "/views/admin/edmsQRCodeManager";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
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
        //Danh sách chi nhánh
        loadBranch: function (callback) {
            $http.post('/Admin/User/GetBranch/').success(callback);
        },
        //Danh sách kho
        getListWareHouse: function (callback) {
            $http.get('/Admin/EDMSWareHouseManager/GetListWareHouse?type=' + 'RV', callback).success(callback);
        },
        getListFloorByWareHouseCode: function (data, callback) {
            $http.get('/Admin/EDMSWareHouseManager/GetListFloorByWareHouseCode?wareHouseCode=' + data, callback).success(callback);
        },
        getListLineByFloorCode: function (data, callback) {
            $http.get('/Admin/EDMSWareHouseManager/GetListLineByFloorCode?floorCode=' + data, callback).success(callback);
        },
        getListRackByLineCode: function (data, callback) {
            $http.get('/Admin/EDMSWareHouseManager/GetListRackByLineCode?lineCode=' + data, callback).success(callback);
        },
        getListDocumentType: function (callback) {
            $http.post('/Admin/EDMSWareHouseReceipt/GetListDocumentType').success(callback);
        },
        getStorageTimeLimit: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseReceipt/GetStorageTimeLimit/' + data).success(callback);
        },
        getNumBoxth: function (data, data1, callback) {
            $http.post('/Admin/EDMSWareHouseReceipt/GetNumBoxth?brCode=' + data + '&whCode=' + data1).success(callback);
        },
        genBoxCode: function (boxNumber, branchCode, docType, userId, callback) {
            $http.get('/Admin/EDMSWareHouseManager/GenBoxCode?boxNumber=' + boxNumber + '&branchCode=' + branchCode + '&docType=' + docType + '&userId=' + userId, callback).success(callback);
        },
        generatorQRCode: function (data, callback) {
            $http.post('/Admin/EDMSSendRequestProfile/GeneratorQRCode?code=' + data).success(callback);
        },
        //Danh sách người dùng theo chi nhánh
        getListUserByBranchCode: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseReceipt/GetListUserByBranchCode?branchCode=' + data, callback).success(callback);
        },
        insertBox: function (data, callback) {
            $http.post('/Admin/EDMSProfileBox/InsertBox', data, callback).success(callback);
        },
        updateBox: function (data, callback) {
            $http.post('/Admin/EDMSProfileBox/UpdateBox', data, callback).success(callback);
        },
        uploadFile: function (data, callback) {
            submitFormUpload('/Admin/EDMSWareHouseReceipt/UploadFile', data, callback);
        },
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $filter, $location, $cookies, $translate) {
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
                StorageTime: {
                    required: true
                }
            },
            messages: {
                StorageTime: {
                    required: caption.EDWHR_CURD_VALIDATE_STORAGE_DATE,
                }
            }
        }
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
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location, $filter, $window) {
    var vm = $scope;
    $scope.model = {
        BoxCode: '',
        FromDate: '',
        ToDate: '',
        TypeProfile: '',
        BranchCode: '',
        Status: '',
        WHS_Code: '',
        Box: {
            Id: 0,
            WHS_Code: '',
        }
    }

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSProfileBox/JTable",
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
                d.BoxCode = $scope.model.BoxCode;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
                d.TypeProfile = $scope.model.TypeProfile;
                d.BranchCode = $scope.model.BranchCode;
                d.Status = $scope.model.Status;
                d.WHS_Code = $scope.model.WHS_Code;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                $('[data-toggle="tooltip"]').tooltip();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [0, 'desc'])
        //.withOption('scrollX','true')
        .withOption('serverSide', true)
        //.withOption('autoWidth', true)
        //.withOption('scrollCollapse', true)
        //.withOption('responsive', true)
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.Id;

                    var row = $(evt.target).closest('tr');
                    // data key value
                    var key = row.attr("data-id");
                    // cell values
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

                        var model = {};
                        var listdata = $('#tblData').DataTable().data();
                        for (var i = 0; i < listdata.length; i++) {
                            if (listdata[i].Id == Id) {
                                model = listdata[i];
                                break;
                            }
                        }

                        var modalInstance = $uibModal.open({
                            animation: true,
                            templateUrl: ctxfolder + '/detail.html',
                            controller: 'detail',
                            backdrop: 'static',
                            size: '80',
                            resolve: {
                                para: function () {
                                    return {
                                        model
                                    };
                                }
                            }
                        });
                        modalInstance.result.then(function (d) {

                        }, function () {
                        });
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('BoxCode').withTitle('{{"EDMSPB_COL_CODE" | translate}}').renderWith(function (data, type, full, meta) {
        var dataView = data.length > 5 ? data.substr(0, 10) + " ..." : data;
        if (data.length > 0) {
            var tooltip = '<span  href="javascript:;" data-toggle="tooltip" data-container="body" data-placement="top" data-original-title=\'' + data + '\'>' + dataView + '</span>';
            return tooltip;
        } else {
            return dataView;
        }
    }));  //.withOption('sClass', 'nowrap dataTable-pr0 dataTable-30per'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Number').withTitle('{{"EDMSPB_COL_NUMBER" | translate}}').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeProfile').withTitle('{{"EDMSPB_COL_TYPE" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));  //.withOption('sClass', 'dataTable-pr0 dataTable-30per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BranchName').withTitle('{{"EDMSPB_COL_BRANCH_NAME" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StoragePeriod').withTitle('{{"EDMSPB_COL_STORAGE_TIME" | translate}}').renderWith(function (data, type) {
        return data;
    }));  //.withOption('sClass', 'dataTable-pr0 dataTable-10per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StorageTime').withTitle('{{"EDMSPB_COL_STORAGE_DATE" | translate}}').renderWith(function (data, type) {
        return data;
    }));  //.withOption('sClass', 'dataTable-pr0 dataTable-10per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StatusSecurity').withTitle('{{"EDMSPB_COL_SECURITY" | translate}}').renderWith(function (data, type) {
        switch (data) {
            case "1":
                data = "Thấp";
                break;
            case "2":
                data = "Trung Bình";
                break;
            case "3":
                data = "Cao";
                break;
        }

        return '<span class="text-success">' + data + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('WareHouseName').withTitle('{{"EDMSPB_COL_WAREHOUSE" | translate}}').withOption("sClass", "dataTable-30per").renderWith(function (data, type) {
        return data;
    }));  //.withOption('sClass', 'dataTable-pr0 dataTable-30per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FloorName').withTitle('{{"EDMSPB_COL_FLOOR_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LineName').withTitle('{{"EDMSPB_COL_LINE_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('RackName').withTitle('{{"EDMSPB_COL_RACK_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('QR_Code').withTitle('{{"EDMSPB_COL_QR_CODE" | translate}}').renderWith(function (data, type) {
        return '<img role="button" ng-click="viewQrCode(\'' + data + '\')" src="data:image/png;base64,' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="40" width="40">';
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};

    $scope.listBranch = [];
    $scope.listDocumentType = [];
    $scope.listWareHouse = [];
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
    $scope.search = function () {
        reloadData(true);
    }

    $scope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.initLoad = function () {
        dataservice.getListWareHouse(function (rs) {
            $scope.listWareHouse = rs;
        });

        dataservice.getListDocumentType(function (result) {
            $scope.listDocumentType = result;
        });
        dataservice.loadBranch(function (rs) {
            if (!rs.Error) {
                $scope.listBranch = rs;
            }
        });
    }
    $scope.initLoad();
    $scope.viewQrCode = function (code) {
        debugger
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
        $('.end-date').click(function () {
            $('#dateFrom').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#dateTo').datepicker('setStartDate', null);
        });
    }
    setTimeout(function () {
        loadDate();
    }, 50);

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/addBox.html',
            controller: 'addBox',
            backdrop: 'static',
            size: 60
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
});
app.controller('detail', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataservice, $timeout, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $timeout(function () {
        setModalMaxHeight('.modal');
    }, 100);

    $scope.BoxPosition = '';

    $scope.model = {
        Id: 0,
        BoxCode: '',
        TypeProfile: '',
        LstTypeProfileId: '',
        DepartCode: '',
        BrCode: '',
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
        RqCode: '',
        WHS_Code: '',
        FloorCode: '',
        LineCode: '',
        RackCode: '',
    }
    debugger
    $scope.model = para.model;
    if ($scope.model.StatusSecurity != '') {
        switch ($scope.model.StatusSecurity) {
            case "1":
                $scope.model.StatusSecurity = "Thấp";
                break;
            case "2":
                $scope.model.StatusSecurity = "Trung Bình";
                break;
            case "3":
                $scope.model.StatusSecurity = "Cao";
                break;
        }
    }
    $scope.init = function () {
        $scope.BoxPosition = 'Thùng ' + $scope.model.NumBoxth + ", " + $scope.model.RackName + ", " + $scope.model.LineName + ", " + $scope.model.FloorName + ", " + $scope.model.WareHouseName;

        $scope.listWareHouse = [];
        $scope.listFloor = [];
        $scope.listLine = [];
        $scope.listRack = [];
        $scope.listBox = [];
        $scope.listBook = [];

        for (var w = 1; w < 2; w++) {
            $scope.wareHouse = {
                id: w,
                whs_code: 'WH' + w,
                qrCode: 'https://1.bp.blogspot.com/-lgnm_zSrQ6E/Tb6lJ-RF4UI/AAAAAAAAACQ/rELLdDxLxMs/s1600/qr-code.png',
                whs_name: 'Kho phần mềm quang trung',
                whs_note: '',
                whs_area_square: '300m2',
                whs_cnt_floor: 3,
                whs_addr_text: 'Phường Tân Chánh Hiệp, Quận 12, thành phố Hồ Chí Minh',
                whs_addr_gps: '',
                whs_avatar: 'https://www.qtsc.com.vn/uploads/files/2018/03/09/logo.png',
                img_whs: 'https://www.qtsc.com.vn/uploads/files/2018/03/09/logo.png',
                whs_tags: 'quang trung',
                whs_design_map: 'https://www.qtsc.com.vn/uploads/files/2018/03/09/logo.png',
                created_by: '',
                updated_by: '',
                created_time: '',
                updated_time: '',
                whs_flag: 1,
                whs_status: 'Hoạt động',
                manager_id: 2,
                listFloor: []
            }

            $scope.listWareHouse.push($scope.wareHouse);
        }

        for (var wh = 0; wh < $scope.listWareHouse.length; wh++) {
            for (var i = 1; i < 3; i++) {
                $scope.floor = {
                    id: i,
                    floor_code: 'T' + i,
                    floor_name: 'Tầng ' + i,
                    map_design: 'https://www.kientrucadong.com/diendan/wp-content/uploads/2017/03/ban-ve-biet-thu-2-tang-4.jpg',
                    image: '',
                    area_square: i * 60 + ' m2',
                    qrCode: 'https://1.bp.blogspot.com/-lgnm_zSrQ6E/Tb6lJ-RF4UI/AAAAAAAAACQ/rELLdDxLxMs/s1600/qr-code.png',
                    cnt_line: 12,
                    status: 'Hoạt động',
                    whs_code: wh,
                    manager_id: 132,
                    selected: i == 1 ? true : false,
                    note: '',
                    listLine: []
                }

                $scope.listFloor.push($scope.floor);
            }
        }

        for (var i = 0; i < $scope.listWareHouse.length; i++) {
            var a = $filter('filter')($scope.listFloor, { whs_code: $scope.listWareHouse[i].id });
            $scope.listWareHouse[i].listFloor.push(a);
        }

        for (var i = 0; i < $scope.listFloor.length; i++) {
            if (i == 0) {
                for (var j = 1; j < 40; j++) {
                    $scope.line = {
                        id: j,
                        line_code: 'D' + j,
                        l_text: 'Dãy ' + j,
                        floor_code: $scope.listFloor[i].floor_code,
                        qrCode: 'https://1.bp.blogspot.com/-lgnm_zSrQ6E/Tb6lJ-RF4UI/AAAAAAAAACQ/rELLdDxLxMs/s1600/qr-code.png',
                        l_postion: '',
                        l_size: '',
                        l_color: 'Đỏ',
                        l_status: 'Đầy',
                        cnt_rack: 2,
                        note: '',
                        listRack: []
                    }

                    $scope.listLine.push($scope.line);
                }
            }
        }

        for (var i = 0; i < $scope.listFloor.length; i++) {
            var a = $scope.listLine.filter(k => k.floor_code === $scope.listLine[i].floor_code);
            $scope.listFloor[i].listLine.push(a);
        }

        for (var i = 0; i < $scope.listLine.length; i++) {
            for (var k = 1; k < 3; k++) {
                $scope.rack = {
                    id: k,
                    qr_code: 'https://1.bp.blogspot.com/-lgnm_zSrQ6E/Tb6lJ-RF4UI/AAAAAAAAACQ/rELLdDxLxMs/s1600/qr-code.png',
                    rack_code: 'K' + k,
                    rack_name: k == 1 ? 'Kệ ' + k : 'Kệ trống',
                    r_size: '10x10x20 m2',
                    material: 'Nhựa',
                    cnt_cell: k,
                    r_status: k == 1 ? 'Full' : 'Emty',
                    r_position: '',
                    cnt_box: 32,
                    line_code: $scope.listLine[i].line_code,
                    listBox: []
                }
                $scope.listRack.push($scope.rack);
            }
        }

        for (var i = 0; i < $scope.listLine.length; i++) {
            var a = $scope.listRack.filter(k => k.line_code === $scope.listLine[i].line_code);
            $scope.listLine[i].listRack.push(a);
        }

        for (var i = 0; i < $scope.listRack.length; i++) {
            if (i == 0) {
                for (var b = 1; b < 31; b++) {
                    $scope.box = {
                        id: b,
                        box_code: 'BOX_' + b,
                        qr_code: 'https://1.bp.blogspot.com/-lgnm_zSrQ6E/Tb6lJ-RF4UI/AAAAAAAAACQ/rELLdDxLxMs/s1600/qr-code.png',
                        depart_code: '',
                        type_profile: b % 2 == 0 ? 'Hồ sơ chứng từ' : 'Thùng Trống',
                        box_size: '35x65 cm2',
                        m_cnt_brief: 20,
                        cnt_brief: 15,
                        cnt_cell: b,
                        start_time: '25/01/2019',
                        num_boxth: k * 10,
                        time_storage: '5 năm',
                        lst_member_id: '',
                        status_box: b % 2 == 0 ? 'Full' : 'Emty',
                        whs_code: 1 + k,
                        floor_code: 2 + k,
                        line_code: 2 + k,
                        rack_code: $scope.listRack[i].rack_code,
                        note: '',
                        listBook: []
                    }

                    $scope.listBox.push($scope.box);
                }
            }
        }

        for (var i = 0; i < $scope.listRack.length; i++) {
            var a = $scope.listBox.filter(k => k.rack_code === $scope.listRack[i].rack_code);
            $scope.listRack[i].listBox.push(a);
        }

        for (var b = 0; b < 32; b++) {
            $scope.book = {
                id: b,
                box_code: 'B' + b,
                qr_code: 'https://1.bp.blogspot.com/-lgnm_zSrQ6E/Tb6lJ-RF4UI/AAAAAAAAACQ/rELLdDxLxMs/s1600/qr-code.png',
                depart_code: '',
                type_profile: 'Hồ sơ chứng từ',
                box_size: '35x65 cm2',
                m_cnt_brief: 20,
                cnt_brief: 15,
                cnt_cell: b,
                start_time: '25/01/2019',
                num_boxth: k * 10,
                time_storage: '5 năm',
                lst_member_id: '',
                status_box: 'Đầy',
                whs_code: 1 + k,
                floor_code: 2 + k,
                line_code: 2 + k,
                rack_code: 4 + k,
                note: ''
            }
        }
    }

    $scope.init();

    setTimeout(function () {
        var clicked = false, clickY, clickX;
        $(".et-car-floor").click(function () {
            $(document).on({
                'mousemove': function (e) {
                    clicked && updateScrollPos(e);
                },
                'mousedown': function (e) {
                    clicked = true;
                    clickY = e.pageY;
                    clickX = e.pageX;
                },
                'mouseup': function () {
                    clicked = false;
                    $('.et-car-floor').css('cursor', 'auto');
                }
            });
        });

        var updateScrollPos = function (e) {
            $('.et-car-floor').css('cursor', 'row-resize');
            console.log("Chiều ngang:" + $('.et-car-floor').scrollTop() + (clickY - e.pageY) + "Chiều dọc:" + $('.et-car-floor').scrollTop() + (clickY - e.pageY));
            $('.et-car-floor').scrollTop($('.et-car-floor').scrollTop() + (clickY - e.pageY));
            $('.et-car-floor').scrollLeft($('.et-car-floor').scrollLeft() + (clickX - e.pageX));
        }
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('addBox', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataservice, $timeout) {
    $scope.QR_Code_Box = '';
    $scope.modelShow = {};
    $scope.model = {
        Id: 0,
        RqTicketCode: '',
        BrCode: '',
        WHS_Code: '',
        WHS_User: '',
        NumBox: '',
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
            BrCode: '',
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
            RqCode: '',
            WHS_Code: '',
            FloorCode: '',
            LineCode: '',
            RackCode: '',
        }
    };
    $scope.status = [{
        Code: '1',
        Name: 'Khởi tạo',
        Icon: 'fas fa-plus'
    }, {
        Code: '2',
        Name: 'Đang chờ',
        Icon: 'fas fa-spinner'
    }, {
        Code: '3',
        Name: 'Đã duyệt',
        Icon: 'fas fa-check'
    }, {
        Code: '4',
        Name: 'Từ chối',
        Icon: 'fas fa-minus-circle'
    }];
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
    $scope.listFloor = [];
    $scope.listLine = [];
    $scope.listRack = [];

    $scope.listDocumentType = [];
    $scope.listBoxTemp = [];
    $scope.listBoxIdDelete = [];
    $scope.listFileBox = [];

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

    $scope.listDocTypes = [];
    $scope.listUsers = [];
    $scope.listDocTypeAll = [];

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
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
    }
    $scope.initLoad();

    $scope.changeSelect = function (type, id) {
        switch (type) {
            case "BRANCH":
                var a = $scope.listBranch.filter(k => k.OrgAddonCode === id);
                $scope.branch = change_alias(a[0].OrgName);
                $scope.branchName = a[0].OrgName;
                $scope.branchCode = id;
                $scope.model.WHS_User = '';
                $scope.listUsers = [];
                dataservice.getListUserByBranchCode(id, function (rs) {
                    $scope.listWareHouseUser = rs;
                    $scope.model.Box.PackingStaff = '';
                });
                //Lấy ra số thùng tiếp theo
                if ($scope.model.Box.BrCode != undefined && $scope.model.Box.BrCode != null && $scope.model.Box.BrCode != ''
                    && $scope.model.Box.WHS_Code != undefined && $scope.model.Box.WHS_Code != null && $scope.model.Box.WHS_Code != '') {
                    dataservice.getNumBoxth($scope.model.Box.BrCode, $scope.model.Box.WHS_Code, function (rs) {
                        $scope.model.Box.NumBoxth = rs;
                    });
                }

                $scope.createBoxCode();
                break;

            case "WAREHOUSE":
                dataservice.getListFloorByWareHouseCode(id, function (rs) {
                    $scope.listFloor = rs;
                    $scope.listLine = [];
                    $scope.listRack = [];
                    $scope.model.Box.FloorCode = '';
                    $scope.model.Box.LineCode = '';
                    $scope.model.Box.RackCode = '';
                });
                //Lấy ra số thùng tiếp theo
                if ($scope.model.Box.BrCode != undefined && $scope.model.Box.BrCode != null && $scope.model.Box.BrCode != ''
                    && $scope.model.Box.WHS_Code != undefined && $scope.model.Box.WHS_Code != null && $scope.model.Box.WHS_Code != '') {
                    dataservice.getNumBoxth($scope.model.Box.BrCode, $scope.model.Box.WHS_Code, function (rs) {
                        $scope.model.Box.NumBoxth = rs;
                    });
                }

                break;
            case "FLOOR":
                dataservice.getListLineByFloorCode(id, function (rs) {
                    $scope.listLine = rs;
                    $scope.listRack = [];
                    $scope.model.Box.LineCode = '';
                    $scope.model.Box.RackCode = '';
                });
                break;
            case "LINE":
                dataservice.getListRackByLineCode(id, function (rs) {
                    $scope.listRack = rs;
                    $scope.model.Box.RackCode = '';
                });
                break;
            case "DOCUMENTTYPE":
                var a = $scope.listDocumentType.filter(k => k.SettingID === id);
                $scope.type = change_alias(a[0].ValueSet);
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
                $scope.createBoxCode();
                break;
            case "PACKING_STAFF":
                var a = $scope.listWareHouseUser.filter(k => k.UserName === id);
                $scope.userId = id;
                //var obj = { text: a[0].UserName };
                var obj = { userName: a[0].UserName, text: a[0].GivenName };
                var checkExits = $scope.listUsers.filter(k => k.userName === a[0].UserName);
                if (checkExits.length === 0) {
                    $scope.listUsers.push(obj);
                }
                $scope.createBoxCode();
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

            var a = $scope.listWareHouseUser.filter(k => k.UserName === arrMemberId[i]);
            //var obj = { text: a[0].UserName };
            var obj = { userName: a[0].UserName, text: a[0].GivenName };
            var checkExits = $scope.listUsers.filter(k => k.userName === a[0].UserName);
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
        }
    };

    $scope.setValueListStaff = function () {
        if ($scope.listUsers.length > 0) {
            $scope.listUserId = [];
            for (var i = 0; i < $scope.listUsers.length; i++) {
                $scope.listUserId.push($scope.listUsers[i].userName);
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

    $scope.changleSelect = function (SelectType) {
        if (SelectType == "FloorCode" && $scope.model.Box.FloorCode != "") {
            $scope.errorFloorCode = false;
        } else if (SelectType == "FloorCode") {
            $scope.errorFloorCode = true;
        }
        if (SelectType == "WHS_Code" && $scope.model.Box.WHS_Code != "") {
            $scope.errorWHS_Code = false;
        } else if (SelectType == "WHS_Code") {
            $scope.errorWHS_Code = true;
        }
        if (SelectType == "BrCode" && $scope.model.Box.BrCode != "") {
            $scope.errorBrCode = false;
        } else if (SelectType == "BrCode") {
            $scope.errorBrCode = true;
        }
        if (SelectType == "LineCode" && $scope.model.Box.LineCode != "") {
            $scope.errorLineCode = false;
        } else if (SelectType == "LineCode") {
            $scope.errorLineCode = true;
        }
        if (SelectType == "RackCode" && $scope.model.Box.RackCode != "") {
            $scope.errorRackCode = false;
        }
        if (SelectType == "TypeProfile" && $scope.model.Box.TypeProfile != "") {
            $scope.errorTypeProfile = false;
        } else if (SelectType == "TypeProfile") {
            $scope.errorTypeProfile = true;
        }
        if (SelectType == "PackingStaff" && $scope.model.Box.PackingStaff != "") {
            $scope.errorPackingStaff = false;
        }
    }
    $scope.createBoxCode = function () {
        //Tạo Mã cho thùng
        dataservice.genBoxCode($scope.boxNumber, $scope.branchCode, $scope.docType, $scope.userId, function (rs) {
            $scope.model.Box.BoxCode = rs;

            dataservice.generatorQRCode($scope.model.Box.BoxCode, function (result) {
                $scope.QR_Code_Box = result;
            });
        });
    }
    $scope.removeUser = function (index) {
        if ($scope.listUsers[index].userName == $scope.model.Box.PackingStaff)
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
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.Box.BrCode == "" || data.Box.BrCode == null) {
            $scope.errorBrCode = true;
            mess.Status = true;
        } else {
            $scope.errorBrCode = false;
        }
        if (data.Box.LineCode == "" || data.Box.LineCode == null) {
            $scope.errorLineCode = true;
            mess.Status = true;
        } else {
            $scope.errorLineCode = false;
        }
        if (data.Box.TypeProfile == "" || data.Box.TypeProfile == null) {
            $scope.errorTypeProfile = true;
            mess.Status = true;
        } else {
            $scope.errorTypeProfile = false;
        }
        if (data.Box.WHS_Code == "" || data.Box.WHS_Code == null) {
            $scope.errorWHS_Code = true;
            mess.Status = true;
        } else {
            $scope.errorWHS_Code = false;
        }
        if (data.Box.RackCode == "" || data.Box.RackCode == null) {
            $scope.errorRackCode = true;
            mess.Status = true;
        } else {
            $scope.errorRackCode = false;
        }
        if (data.Box.PackingStaff == "" || data.Box.PackingStaff == null) {
            $scope.errorPackingStaff = true;
            mess.Status = true;
        } else {
            $scope.errorPackingStaff = false;
        }
        if (data.Box.FloorCode == "" || data.Box.FloorCode == null) {
            $scope.errorFloorCode = true;
            mess.Status = true;
        } else {
            $scope.errorFloorCode = false;
        }
        if (data.Box.StorageTime == "" || data.Box.StorageTime == null) {
            $scope.errorStorageTime = true;
            mess.Status = true;
        } else {
            $scope.errorStorageTime = false;
        }
        return mess;
    }
    $scope.submit = function () {

        validationSelect($scope.model);
        if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {

            if ($scope.listFileBox.length > 0)
                $scope.model.Box.ListFileBox = $scope.listFileBox;

            $scope.setValueListStaff();
            $scope.setValueListDocType();

            dataservice.insertBox($scope.model.Box, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            });
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
        //Hộp tài liệu thời gian phát sinh từ -> đến, Ngày lưu kho
        $("#dateArisesFrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateArisesTo').datepicker('setStartDate', maxDate);
            if ($('#dateArisesFrom .input-date').valid()) {
                $('#dateArisesFrom .input-date').removeClass('invalid').addClass('success');
            }
        });
        $("#dateArisesTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateArisesFrom').datepicker('setEndDate', maxDate);
            if ($('#dateArisesTo .input-date').valid()) {
                $('#dateArisesTo .input-date').removeClass('invalid').addClass('success');
            }
        });

        $("#dateStorage ").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            if ($('#dateStorage .form-control').valid()) {
                $('#dateStorage .form-control').removeClass('invalid').addClass('success');
            }
        });
    }
    setTimeout(function () {
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
        loadDate();
    }, 50);
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
            App.toastrError("Vui lòng tạo QRCode trước khi in!")
        }
    }
});



