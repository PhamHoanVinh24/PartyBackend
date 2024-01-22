var ctxfolder = "/views/admin/vcApproveWorkPlan";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
app.factory('dataservice', function ($http) {
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose"
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
        insertCustomer: function (data1, data2, data3, callback) {
            $http.post('/Admin/VCApproveWorkPlan/InsertCustomer/?Username=' + data1 + '&WpCode=' + data2 + '&CusCode=' + data3).success(callback);
        },
        approveWorkPlan: function (data1, data2, data3, callback) {
            $http.post('/Admin/VCApproveWorkPlan/ApproveWorkPlan/?WpCode=' + data1 + '&CurrentStatus=' + data2 + '&LeaderIdea=' + data3).success(callback);
        },
        deleteItems: function (data, callback) {
            $http.post('/Admin/VCApproveWorkPlan/DeleteItems', data).success(callback);
        },
        deleteCustomer: function (data, callback) {
            $http.post('/Admin/VCApproveWorkPlan/DeleteCustomer/' + data).success(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/VCApproveWorkPlan/GetItem/?wpCode=' + data).success(callback);
        },
        getItemDetail: function (data, callback) {
            $http.get('/Admin/VCApproveWorkPlan/GetItemDetail/' + data).success(callback);
        },
        getListCustomer: function (callback) {
            $http.post('/Admin/VCApproveWorkPlan/GetListCustomer/').success(callback);
        },
        getListCurrentStatus: function (callback) {
            $http.post('/Admin/VCApproveWorkPlan/GetListCurrentStatus/').success(callback);
        },
        getListApproveStatus: function (callback) {
            $http.post('/Admin/VCApproveWorkPlan/GetListApproveStatus/').success(callback);
        },
        getAllStaff: function (callback) {
            $http.post('/Admin/VCApproveWorkPlan/GetAllStaff/').success(callback);
        },
        getListNode: function (data, callback) {
            $http.post('/Admin/VCApproveWorkPlan/GetListNode/?username=' + data).success(callback);
        },
        //gettreedataLevel: function (callback) {
        //    $http.post('/Admin/VCApproveWorkPlan/GetProductUnit/').success(callback);
        //},
        //uploadImage: function (data, callback) {
        //    submitFormUpload('/Admin/VCApproveWorkPlan/UploadImage/', data, callback);
        //}
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, $confirm, DTColumnBuilder, DTInstances, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
    });
    //$rootScope.checkData = function (data) {
    //    var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;
    //    // var partternCode = new RegExp("^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$");
    //    //var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
    //    var mess = { Status: false, Title: "" }
    //    if (!partternCode.test(data.ProductCode)) {
    //        mess.Status = true;
    //        mess.Title = mess.Title.concat(" - ", "Mã sản phẩm không chứa ký tự đặc biệt hoặc khoảng trắng", "<br/>");
    //    }
    //    return mess;
    //}
    //$rootScope.validationOptions = {
    //    rules: {
    //        ProductCode: {
    //            required: true,
    //            maxlength: 50
    //        },
    //        ProductName: {
    //            required: true,
    //            maxlength: 200
    //        },
    //        Unit: {
    //            required: true,
    //            maxlength: 100
    //        },


    //    },
    //    messages: {
    //        ProductCode: {
    //            required: "Nhập sản phẩm!",
    //            maxlength: "Mã sản phẩm không vượt quá 100 kí tự!"
    //        },
    //        ProductName: {
    //            required: "Nhập tên sản phẩm!",
    //            maxlength: "Tên sản phẩm không vượt quá 200 kí tự!"
    //        },
    //        Unit: {
    //            required: "Nhập đơn vị!",
    //            maxlength: "Đơn vị không vượt quá 200 kí tự!"
    //        },

    //    }
    //}
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/Language/Translation');
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
app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $http, $filter) {
    var vm = $scope;
    $scope.allStaff = [];
    $scope.model = {
        UserName: '',
        Name: '',
        WpCode: '',
        CurrentStatus: '',
        FromDate: '',
        ToDate: '',
        WeekNo: null,
    };
    $scope.initLoad = function () {
        dataservice.getListCurrentStatus(function (result) {
            $scope.ListCurrentStatus = result;
        });
    }
    $scope.initLoad();

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/VCApproveWorkPlan/Jtable",
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
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
                d.WeekNo = $scope.model.WeekNo;
                d.UserName = $scope.model.UserName;
                //d.Name = $scope.model.Name;
                d.WpCode = $scope.model.WpCode;
                d.CurrentStatus = $scope.model.CurrentStatus;
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
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);

            //double click trên 1 dòng
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
                        //dataservice.productInfo(Id, function (rs) {
                        //    if (rs.Error) {
                        //        App.toastrError(rs.Title);
                        //    } else {
                        //        var modalInstance = $uibModal.open({
                        //            animation: true,
                        //            templateUrl: ctxfolder + '/detail.html',
                        //            controller: 'detail',
                        //            backdrop: 'static',
                        //            size: '80',
                        //            resolve: {
                        //                para: function () {
                        //                    return rs.Object;
                        //                }
                        //            }
                        //        });
                        //    }
                        //});


                        var modalInstance = $uibModal.open({
                            animation: true,
                            templateUrl: ctxfolder + '/detail.html',
                            controller: 'detail',
                            backdrop: 'static',
                            size: '50',
                            resolve: {
                                para: function () {
                                    return data;
                                }
                            }
                        });
                        modalInstance.result.then(function (d) {
                            $scope.reload();
                        }, function () {
                        });
                    }
                    $scope.$apply();
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withTitle('{{ "VCMM_LIST_COL_STT" | translate }}').notSortable().withOption('sWidth', '30px').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('{{ "VCMM_LIST_COL_ID" | translate }}').notSortable().withOption('sClass', 'hidden').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('{{ "VCMM_LIST_COL_NAME" | translate }}').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('WpCode').withTitle('{{ "VCMM_LIST_COL_WP_CODE" | translate }}').notSortable().renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Birthday').withTitle('Ngày sinh').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type) {
    //    if (data != null && data != '')
    //        return $filter('date')(new Date(data), 'dd/MM/yyyy');
    //    else
    //        return '';
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('WeekNo').withTitle('{{"VCMM_LIST_COL_WEEK_NO" | translate }}').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FromDate').withTitle('{{"VCMM_LIST_COL_FROM_DAY" | translate }}').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type, full) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ToDate').withTitle('{{"VCMM_LIST_COL_TO_DAY" | translate }}').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type, full) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CurrentStatus').withTitle('{{"VCMM_LIST_COL_CURRENT_STATUS" | translate }}').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type) {
        if (data == "Duyệt") {
            return '<span class="text-success"> ' + data + '</span>';
        } else if (data == "Mới tạo" || data == "Chờ duyệt") {
            return '<span class="text-warning"> ' + data + '</span>';
        } else {
            return '<span class="text-danger"> ' + data + '</span>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LeaderIdea').withTitle('{{"VCMM_LIST_COL_LEADER_IDEA" | translate }}').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type) {
        if (data == "undefined") {
            return '<span class="text-danger"> Không ý kiến</span>';
        } else {
            return data;
        }
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Percent').withTitle('% hoàn thành').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type) {
    //    if (data == "100") {
    //        return '<span class="text-success bold"> ' + data + '%</span>';
    //    } else if (data == "0") {
    //        return '<span class="text-danger bold"> ' + data + '%</span>';
    //    } else {
    //        var dataFormat = $filter('currency')(data, '', 2);
    //        return '<span class="text-warning bold"> ' + dataFormat + '%</span>';
    //    }
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('CountDone').withTitle('CountDone').notSortable().renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('CountTotal').withTitle('CountTotal').notSortable().renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('pathimg').withTitle('Ảnh').notSortable().renderWith(function (data, type) {
    //    return data === "" ? "" : '<img class="img-circle" src="' + data + '" height="65" width="65">';
    //}).withOption('sWidth', '50px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withTitle('{{"VCMM_LIST_COL_ACTION" | translate }}').withOption('sClass', 'tcenter').renderWith(function (data, type, full) {
        return '<button ng-click="approval(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-check"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red hidden"><i class="fa fa-trash"></i></button>';
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
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.reload = function () {
        reloadData(true);
    }
    $rootScope.reload = function () {
        $scope.reload();
    }

    $rootScope.rootreload = function () {
        $scope.reload();
    }

    //$scope.add = function () {
    //    var modalInstance = $uibModal.open({
    //        animation: true,
    //        templateUrl: ctxfolder + '/add.html',
    //        controller: 'add',
    //        backdrop: 'static',
    //        size: '70',

    //    });
    //    modalInstance.result.then(function (d) {
    //        $scope.reload();
    //    }, function () {
    //    });
    //}
    $scope.approval = function (id) {
        //var allowUpdate = true;
        //var listdata = $('#tblData').DataTable().data();
        //for (var i = 0; i < listdata.length; i++) {
        //    if (listdata[i].Id == id) {
        //        if (listdata[i].CurrentStatus == 'Hoàn thành' || listdata[i].CurrentStatus == 'Đang thực hiện' || listdata[i].CurrentStatus == 'Duyệt') {
        //            allowUpdate = false;
        //        }
        //        break;
        //    }
        //}
        //if (allowUpdate == false) {
        //    App.toastrError("Kế hoạch đã được duyệt không được sửa");
        //}
        //else {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/approval.html',
            controller: 'approval',
            backdrop: 'static',
            size: '60',
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
        //}
    }
    //$scope.delete = function (id) {
    //    var modalInstance = $uibModal.open({
    //        templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
    //        windowClass: "message-center",
    //        controller: function ($scope, $uibModalInstance) {
    //            $scope.message = "Bạn có chắc chắn muốn xóa ?";
    //            $scope.ok = function () {
    //                dataservice.delete(id, function (rs) {
    //                    if (rs.Error) {
    //                        App.toastrError(rs.Title);
    //                        $uibModalInstance.close();
    //                    } else {
    //                        App.toastrSuccess(rs.Title);
    //                        $uibModalInstance.close();
    //                    }
    //                });
    //            };

    //            $scope.cancel = function () {
    //                $uibModalInstance.dismiss('cancel');
    //            };
    //        },
    //        size: '25',
    //    });
    //    modalInstance.result.then(function (d) {
    //        $scope.reloadNoResetPage();
    //    }, function () {
    //    });
    //};
    function loadDate() {
        $.fn.datepicker.defaults.language = 'vi';
        $("#fromdate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
            todayHighlight: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#todate').datepicker('setStartDate', maxDate);
        });

        $("#todate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
            todayHighlight: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#fromdate').datepicker('setEndDate', maxDate);
        });

        $('.end-date').click(function () {
            $('#fromdate').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#todate').datepicker('setStartDate', null);
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

    //Export Excel
    $scope.export = function () {
        var orderBy = 'Id DESC';
        var exportType = 0;
        var orderArr = $scope.dtInstance.DataTable.order();
        var column;
        if (orderArr.length == 2) {
            column = $scope.dtInstance.DataTable.init().aoColumns[orderArr[0]];
            orderBy = column.mData + ' ' + orderArr[1];
        } else if (orderArr.length > 0) {
            var order = orderArr[0];
            column = $scope.dtInstance.DataTable.init().aoColumns[order[0]];
            orderBy = column.mData + ' ' + order[1];
        }
        //var pageInfo = $scope.dtInstance.DataTable.page.info();
        //var obj = {
        //    start: pageInfo.row,
        //    length: pageInfo.length,
        //    //QueryOrderBy: orderBy,
        //    ExportType: exportType,
        //    Month: $scope.model.CustomerMonth,
        //    Packcode: $scope.model.PackCode,
        //    Cif: $scope.model.CustomerCif
        //};

        var page = vm.dtInstance.DataTable.page() + 1;
        var length = vm.dtInstance.DataTable.page.len();
        location.href = "/Admin/VCApproveWorkPlan/ExportExcel?"
            + "page=" + page
            + "&row=" + length
            + "&userName=" + $scope.model.UserName
            + "&wpCode=" + $scope.model.WpCode
            + "&currentStatus=" + $scope.model.CurrentStatus
            + "&fromDate=" + $scope.model.FromDate
            + "&toDate=" + $scope.model.ToDate
            + "&orderBy=" + orderBy
    }
    $scope.getAllStaff = function () {
        dataservice.getAllStaff(function (rs) {
            $scope.allStaff = rs;
        });
    }
    $scope.getAllStaff();
});



app.controller('detail', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.model = {
        WpCode: para.WpCode,
    };
    $scope.model1 = {};
    $scope.initData = function () {
        dataservice.getItem(para.WpCode, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                debugger
                $scope.model1.ListData = rs;
                $scope.model.UserName = para.UserName;
                dataservice.getListNode(para.UserName, function (result) {
                    if (result.Error) {
                        App.toastrError(result.Title);
                    }
                    else {
                        $scope.ListCusCode = result.Object;
                    }
                });
            }
        });
    }
    $scope.initData();
    $rootScope.initData = function () {
        $scope.initData();
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 50);

    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.CusCode == "" || data.CusCode == null || data.CusCode == undefined) {
            $scope.errorCusCode = true;
            mess.Status = true;
        } else {
            $scope.errorCusCode = false;
        }

        return mess;
    };
    $scope.changleSelect = function (SelectType, item) {
        if (SelectType == "CusCode" && $scope.model.CusCode != "") {
            $scope.errorCusCode = false;
            $scope.model.CusCode = item.CusCode;
        }
    }

    $scope.submit = function () {
        validationSelect($scope.model);
        if (validationSelect($scope.model).Status == false) {
            dataservice.insertCustomer($scope.model.UserName, $scope.model.WpCode, $scope.model.CusCode, function (rs) {
                $rootScope.Code = $scope.model.Code;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $rootScope.initData();
                }
            });
        }
    }
    $scope.deleteCustomer = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = "Bạn có chắc chắn muốn xóa ?";
                $scope.ok = function () {
                    dataservice.deleteCustomer(id, function (rs) {
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.dismiss('cancel');
                            $rootScope.initData();
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
            $rootScope.initData();
        }, function () {
        });
    };

});

app.controller('approval', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.model = {};
    $scope.model.CurrentStatus = 'WP_APPROVED';
    $scope.listCustomer = [];

    $scope.initData = function () {
        dataservice.getItemDetail(para, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model.Id = rs.Id;
                $scope.model.username = rs.username;
                $scope.model.WpCode = rs.WpCode;
                $scope.model.WeekNo = rs.WeekNo;
                $scope.model.FromDate = rs.FromDate;
                $scope.model.ToDate = rs.ToDate;
                $scope.model.list_detail = rs.list_detail;
            }
        });
        dataservice.getListApproveStatus(function (result) {
            $scope.ListCurrentStatus = result;
        });
    }
    $scope.initData();

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 50);

    $scope.submit = function () {
        if ($scope.model.CurrentStatus == undefined || $scope.model.CurrentStatus == '' || $scope.model.CurrentStatus == null) {
            App.toastrError("Chưa chọn trạng thái bản ghi.");
        }
        else {
            dataservice.approveWorkPlan($scope.model.WpCode, $scope.model.CurrentStatus, $scope.model.LeaderIdea, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                    $uibModalInstance.close();
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            });
        }
    }
});