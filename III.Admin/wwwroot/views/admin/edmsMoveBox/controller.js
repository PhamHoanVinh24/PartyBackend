var ctxfolder = "/views/admin/edmsMoveBox";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngCookies", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", "pascalprecht.translate", 'datatables.colreorder', 'angular-confirm', 'ui.select']);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    var submitFormUpload = function (url, data, callback) {
        //var formData = new FormData();
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
        //getCountBoxRemove: function (callback) {
        //    $http.post('/Admin/EDMSMoveBox/GetCountBoxRemove/').success(callback);
        //},
        //getCountBoxTermite: function (callback) {
        //    $http.post('/Admin/EDMSMoveBox/GetCountBoxTermite/').success(callback);
        //},
        //getItem: function (data, callback) {
        //    $http.post('/Admin/EDMSMoveBox/GetItem/' + data).success(callback);
        //},
        check: function (data, callback) {
            $http.post('/Admin/EDMSMoveBox/Check', data, callback).success(callback);
        },
        save: function (data, callback) {
            $http.post('/Admin/EDMSMoveBox/Save', data, callback).success(callback);
        },
        getListBox: function (callback) {
            $http.post('/Admin/EDMSMoveBox/GetListBox/').success(callback);
        },
        getListRack: function (callback) {
            $http.post('/Admin/EDMSMoveBox/GetListRack/').success(callback);
        },
        //Tạo mã QR_Code
        generatorQRCode: function (data, callback) {
            $http.post('/Admin/EDMSMoveBox/GeneratorQRCode?code=' + data).success(callback);
        },
    };
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $cookies, $translate, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);

    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];

        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;
            // var partternCode = new RegExp("^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$");
            //var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            var mess = { Status: false, Title: "" }
            //if (!partternCode.test(data.Code)) {
            //    mess.Status = true;
            //    mess.Title = mess.Title.concat(" - ", "Mã không chứa ký tự đặc biệt hoặc khoảng trắng", "<br/>");
            //}
            return mess;
        }

        $rootScope.validationOptions = {
            rules: {
                Name: {
                    required: true,
                    maxlength: 255
                },
                FromDate: {
                    required: true,
                    //maxlength: 255
                },
                ToDate: {
                    required: true,
                    //maxlength: 255
                },
                Business: {
                    required: true
                },
            },
            messages: {
                Name: {
                    required: "Nhập tiêu đề!",
                    maxlength: "Tiêu đề không vượt quá 255 kí tự!"
                },
                FromDate: {
                    required: "Nhập ngày bắt đầu!",
                    //maxlength: "Tiêu đề không vượt quá 255 kí tự!"
                },
                ToDate: {
                    required: "Nhập ngày kết thúc!",
                    //maxlength: "Hành động không vượt quá 255 kí tự!"
                },
                Business: {
                    required: "Nhập nghiệp vụ!",
                },
            }
        }
    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
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

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.model = {
        BoxCode: '',
        RackCode: '',
    };
    $scope.modelView = {};
    $scope.modelRack = {};
    $scope.QR_Code_Req = '';
    $scope.QR_Code_Rack = '';
    $scope.isShowCheck = true;
    $scope.isShowSave = false;


    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSMoveBox/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {

            },
            complete: function () {
                App.unblockUI("#contentMain");
                $('[data-toggle="tooltip"]').tooltip();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
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
            //const contextScope = $scope.$new(true);
            //contextScope.data = data;
            //contextScope.contextMenu = $scope.contextMenu;
            //$compile(angular.element(row))($scope);
            //$compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);

        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().withOption('sClass', 'hidden').renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('LevelWarning').withTitle('{{"Cấp độ cảnh báo" | translate}}').withOption('sClass', 'hidden').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BoxCode').withTitle('{{"EDMSMB_COL_BOX_CODE" | translate}}').notSortable().renderWith(function (data, type) {
        var dataView = data.length > 5 ? data.substr(0, 10) + " ..." : data;
        if (data.length > 0) {
            var tooltip = '<span  href="javascript:;" data-toggle="tooltip" data-container="body" data-placement="top" data-original-title=\'' + data + '\'>' + dataView + '</span>';
            return tooltip;
        } else {
            return dataView;
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('NumBoxth').withTitle('{{"EDMSMB_COL_NUM_BOXTH" | translate}}').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StaffName').withTitle('{{"EDMSMB_COL_STAFF_NAME" | translate}}').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTimeString').withTitle('{{"EDMSMB_COL_CREATED_TIME_STRING" | translate}}').notSortable().withOption('sClass', 'tcenter dataTable-15per ').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('WHS_Name').withTitle('{{"EDMSMB_COL_WHS_NAME" | translate}}').notSortable().withOption('sClass', 'tcenter  dataTable-20per').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('RackOldName').withTitle('{{"EDMSMB_COL_RACK_OLD_NAME" | translate}}').notSortable().withOption('sClass', 'tcenter  dataTable-15per').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('RackNewName').withTitle('{{"EDMSMB_COL_RACK_NEW_NAME" | translate}}').notSortable().withOption('sClass', 'tcenter dataTable-15per').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('FromDate').withTitle('{{"Ngày bắt đầu" | translate}}').renderWith(function (data, type, full) {
    //    if (full.LevelWarning == "1" || full.LevelWarning == "2") {
    //        return '<span class="text-danger bold"> ' + data + '</span>';
    //    } else if (full.LevelWarning == "3") {
    //        return '<span class="text-danger"> ' + data + '</span>';
    //    } else if (full.LevelWarning == "4") {
    //        return '<span class="text-warning"> ' + data + '</span>';
    //    } else {
    //        return '<span class="text-info"> ' + data + '</span>';
    //    }
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"Tác vụ" | translate}}').withOption('sClass', 'tcenter').renderWith(function (data, type, full) {
    //    return '<button title="Thông tin" ng-click="detail(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-info"></i></button>' +
    //        '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue hidden"><i class="fa fa-edit"></i></button>' +
    //        '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red hidden"><i class="fa fa-trash"></i></button>';
    //}));

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


    $scope.initLoad = function () {
        dataservice.getListBox(function (result) {
            $scope.ListBox = result.Object;
        });
        dataservice.getListRack(function (result) {
            $scope.ListRack = result.Object;
        });
    }
    $scope.initLoad();
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.BoxCode == undefined || data.BoxCode == null || data.BoxCode == "") {
            $scope.errorBoxCode = true;
            mess.Status = true;
        } else {
            $scope.errorBoxCode = false;
        }
        if (data.RackCode == undefined || data.RackCode == null || data.RackCode == "") {
            $scope.errorRackCode = true;
            mess.Status = true;
        } else {
            $scope.errorRackCode = false;
        }

        return mess;
    };
    $scope.changleSelect = function (SelectType, item) {
        if (SelectType == "BoxCode" && $scope.model.BoxCode != "") {
            $scope.errorBoxCode = false;

            $scope.reShowCheck();

            $scope.modelView.NumBoxth = item.NumBoxth;
            $scope.modelView.StatusSecurity = item.StatusSecurity;
            $scope.modelView.StartTime = item.StartTime;
            $scope.modelView.OrgName = item.OrgName;
            $scope.modelView.TypeProfileName = item.TypeProfileName;
            $scope.modelView.WHS_Name = item.WHS_Name;
            $scope.modelView.FloorName = item.FloorName;
            $scope.modelView.L_Text = item.L_Text;
            $scope.modelView.RackName = item.RackName;

            //Tạo mã QR_Code
            $scope.createReqCode(item.BoxCode);
        }

        if (SelectType == "RackCode" && $scope.model.RackCode != "") {
            $scope.errorRackCode = false;

            $scope.reShowCheck();

            $scope.modelRack.WHS_Name = item.WHS_Name;
            $scope.modelRack.FloorName = item.FloorName;
            $scope.modelRack.L_Text = item.L_Text;
            $scope.modelRack.RackName = item.RackName;

            //Tạo mã QR_Code
            $scope.createRackCode(item.RackCode);
        }
    }

    $scope.createReqCode = function (boxCode) {
        dataservice.generatorQRCode(boxCode, function (result) {
            $scope.QR_Code_Req = result;
        });
    };
    $scope.createRackCode = function (rackCode) {
        dataservice.generatorQRCode(rackCode, function (result) {
            $scope.QR_Code_Rack = result;
        });
    };

    $rootScope.clearBox = function () {
        $scope.clearBox();
        $scope.initLoad();
    };
    $scope.clearBox = function () {
        $scope.QR_Code_Req = '';
        $scope.reShowCheck();
        $scope.model.BoxCode = '';
    };
    $scope.clearRack = function () {
        $scope.QR_Code_Rack = '';
        $scope.reShowCheck();
    };
    $scope.reShowCheck = function () {
        $scope.isShowCheck = true;
        $scope.isShowSave = false;
    };

    $scope.reload = function () {
        reloadData(true);
    }
    $rootScope.reload = function () {
        $scope.reload();
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.search = function () {
        reloadData(true);
    }
    //$scope.add = function () {
    //    var modalInstance = $uibModal.open({
    //        animation: true,
    //        templateUrl: ctxfolder + '/add.html',
    //        controller: 'add',
    //        backdrop: 'static',
    //        size: '60'
    //    });
    //    modalInstance.result.then(function (d) {
    //        $scope.reload();
    //    }, function () { });
    //};
    $scope.detail = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/detail.html',
            controller: 'detail',
            backdrop: 'static',
            size: '60',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () { });
    };
    $scope.check = function () {
        if ($scope.modelView.WHS_Name == $scope.modelRack.WHS_Name) {
            dataservice.check($scope.model, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess('Kiểm tra không lỗi. Có thể chuyển thùng sang vị trí mới.');
                    //$scope.reload();
                    $scope.isShowCheck = false;
                    $scope.isShowSave = true;
                }
            });
        }
        else {
            //App.toastrError('Thùng và kệ không nằm trong cùng một kho');(caption.ASSET_MSG_ADD_ASSET_FIRST);
            App.toastrError(caption.EDMSMB_MSG_EDMSMB);
        }
    };
    $scope.save = function () {
        $rootScope.modelInsert = $scope.model;
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmUpdate.html',
            windowClass: "message-center",
            controller: function ($scope, $rootScope, $uibModalInstance) {
                $scope.message = "Bạn có chắc chắn muốn đổi vị trí thùng?";
                $scope.ok = function () {
                    dataservice.save($rootScope.modelInsert, function (rs) {
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                            $scope.reload();
                            //$rootScope.clearBox();
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
            //$scope.reloadNoResetPage();
            $rootScope.clearBox();
        }, function () {
        });
    };
    function loadDate() {
        $("#FromToBoxRemove").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#DateToBoxRemove').datepicker('setStartDate', maxDate);
        });
        $("#DateToBoxRemove").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromToBoxRemove').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            var from = $scope.model.FromDate.split("/");
            var date = new Date(from[2], from[1] - 1, from[0])
            $('#DateToBoxRemove').datepicker('setStartDate', date);
            $('#FromToBoxRemove').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            var from = $scope.model.ToDate.split("/");
            var date = new Date(from[2], from[1] - 1, from[0])
            $('#FromToBoxRemove').datepicker('setEndDate', $scope.model.ToDate);
            $('#DateToBoxRemove').datepicker('setStartDate', null);
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
    }, 200);
});
