var ctxfolder = "/views/admin/edmsSOS";
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
        getCountBoxRemove: function (callback) {
            $http.post('/Admin/EDMSSOS/GetCountBoxRemove/').success(callback);
        },
        getCountBoxTermite: function (callback) {
            $http.post('/Admin/EDMSSOS/GetCountBoxTermite/').success(callback);
        },
        getCountFloorTempHum: function (callback) {
            $http.post('/Admin/EDMSSOS/GetCountFloorTempHum/').success(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/EDMSSOS/GetItem/' + data).success(callback);
        },
        //Tạo mã QR_Code
        generatorQRCode: function (data, callback) {
            $http.post('/Admin/EDMSSOS/GeneratorQRCode?code=' + data).success(callback);
        },
    };
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $cookies, $translate, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
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
        $rootScope.IsTranslate = true;
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
    $scope.model = {};
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSSOS/JTableBoxRemove",
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
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().withOption('sClass', 'hidden').renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LevelWarning').withTitle('{{"EDMSSOS_COL_LEVEL_WARNING" | translate}}').withOption('sClass', 'hidden').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BoxCode').withTitle('{{"EDMSSOS_COL_BOX_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('NumBoxth').withTitle('{{"EDMSSOS_COL_NUMBOXTH" | translate}}').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FromDate').withTitle('{{"EDMSSOS_COL_FROMDATE" | translate}}').renderWith(function (data, type, full) {
        if (full.LevelWarning == "1" || full.LevelWarning == "2") {
            return '<span class="text-danger bold"> ' + data + '</span>';
        } else if (full.LevelWarning == "3") {
            return '<span class="text-danger"> ' + data + '</span>';
        } else if (full.LevelWarning == "4") {
            return '<span class="text-warning"> ' + data + '</span>';
        } else {
            return '<span class="text-info"> ' + data + '</span>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"EDMSSOS_COL_ACTION" | translate}}').withOption('sClass', 'tcenter').renderWith(function (data, type, full) {
        return '<button title="Thông tin" ng-click="detail(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-info"></i></button>' +
            '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue hidden"><i class="fa fa-edit"></i></button>' +
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


    $scope.initLoad = function () {
        dataservice.getCountBoxRemove(function (result) {
            $rootScope.countBoxRemove = result.Object;
        });
        dataservice.getCountBoxTermite(function (result) {
            $rootScope.countBoxTermite = result.Object;
        });
    }
    $scope.initLoad();
    $scope.reload = function () {
        reloadData(true);
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

app.controller('boxTermite', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
    var vm = $scope;
    $scope.model = {};
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSSOS/JTableBoxTermite",
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
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().withOption('sClass', 'hidden').renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LevelWarning').withTitle($translate('EDMSSOS_COL_LEVEL_WARNING')).withOption('sClass', 'hidden').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BoxCode').withTitle($translate('EDMSSOS_COL_BOX_CODE')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('NumBoxth').withTitle($translate('EDMSSOS_COL_NUMBOXTH')).withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FromDate').withTitle($translate('EDMSSOS_COL_FROMDATE')).renderWith(function (data, type, full) {
        if (full.LevelWarning == "1" || full.LevelWarning == "2") {
            return '<span class="text-danger bold"> ' + data + '</span>';
        } else if (full.LevelWarning == "3") {
            return '<span class="text-danger"> ' + data + '</span>';
        } else if (full.LevelWarning == "4") {
            return '<span class="text-warning"> ' + data + '</span>';
        } else {
            return '<span class="text-info"> ' + data + '</span>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle($translate('EDMSSOS_COL_ACTION')).withOption('sClass', 'tcenter').renderWith(function (data, type, full) {
        return '<button title="Thông tin" ng-click="detail(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-info"></i></button>' +
            '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue hidden"><i class="fa fa-edit"></i></button>' +
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


    $scope.initLoad = function () {
    }
    $scope.initLoad();
    $scope.reload = function () {
        reloadData(true);
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

app.controller('floorTempHumidity', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
    var vm = $scope;
    $scope.model = {};
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSSOS/JTableFloorTempHum",
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
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [4, 'asc'])
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().withOption('sClass', 'hidden').renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LevelWarningTemp').withTitle($translate('EDMSSOS_COL_LEVEL_WARNING_TEMP')).withOption('sClass', 'hidden').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FloorCode').withTitle($translate('EDMSSOS_COL_FLOORE_CODE')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FloorName').withTitle($translate('EDMSSOS_COL_FLOORE_NAME')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Temperature').withTitle($translate('EDMSSOS_COL_TEMPERATURE')).renderWith(function (data, type, full) {
        data = data + " °C";

        if (full.LevelWarningTemp == "3" || full.LevelWarningTemp == "4") {
            return '<span class="text-danger bold"> ' + data + '</span>';
        } else if (full.LevelWarningTemp == "2") {
            return '<span class="text-danger"> ' + data + '</span>';
        } else if (full.LevelWarningTemp == "1") {
            return '<span class="text-warning"> ' + data + '</span>';
        } else {
            return '<span class="text-info"> ' + data + '</span>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Humidity').withTitle($translate('EDMSSOS_COL_HUMIDITY')).renderWith(function (data, type, full) {
        data = data + " %";

        if (full.LevelWarningHum == "3" || full.LevelWarningHum == "4") {
            return '<span class="text-danger bold"> ' + data + '</span>';
        } else if (full.LevelWarningHum == "2") {
            return '<span class="text-danger"> ' + data + '</span>';
        } else if (full.LevelWarningHum == "1") {
            return '<span class="text-warning"> ' + data + '</span>';
        } else {
            return '<span class="text-info"> ' + data + '</span>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle($translate('EDMSSOS_COL_ACTION')).withOption('sClass', 'tcenter').renderWith(function (data, type, full) {
        return '<button title="Thông tin" ng-click="detailTemp(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-info"></i></button>' +
            '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue hidden"><i class="fa fa-edit"></i></button>' +
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

    $scope.initLoad = function () {
        dataservice.getCountFloorTempHum(function (result) {
            $rootScope.countFloorTempHum = result;
        });
    }
    $scope.initLoad();
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.search = function () {
        reloadData(true);
    }

    $scope.detailTemp = function (id) {
        var model = {};
        var listdata = $('#tblDataFloorTempHumidity').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id + "") {
                model = listdata[i];
                break;
            }
        }

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/detailTemp.html',
            controller: 'detailTemp',
            backdrop: 'static',
            size: '35',
            resolve: {
                para: function () {
                    return model;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () { });
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

app.controller('detail', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
        $rootScope.reload();
    }
    $scope.model1 = {
        ListChoose: []
    };
    $scope.model = {};
    $scope.ListBoxId = [];
    $scope.QR_Code_Req = '';
    $rootScope.Id = para;

    $scope.initData = function () {
        dataservice.getItem(para, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model = rs.Object;

                //Tạo mã QR_Code
                $scope.createReqCode($scope.model.BoxCode);
            }
        });
    }
    $scope.initData();

    $scope.createReqCode = function (boxCode) {
        dataservice.generatorQRCode(boxCode, function (result) {
            $scope.QR_Code_Req = result;
        });
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);

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
    setTimeout(function () {
        loadDate();
    }, 200);
});

app.controller('detailTemp', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
        $rootScope.reload();
    }
    $scope.model1 = {
        ListChoose: []
    };
    $scope.model = {};
    $scope.ListBoxId = [];
    $scope.QR_Code_Req = '';

    $scope.initData = function () {
        $scope.model = para;
    }
    $scope.initData();

    $scope.createReqCode = function (boxCode) {
        dataservice.generatorQRCode(boxCode, function (result) {
            $scope.QR_Code_Req = result;
        });
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);

    setTimeout(function () {
    }, 200);
});