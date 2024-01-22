var ctxfolder = "/views/admin/rmVayxeTableCost";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', "ngCookies", "pascalprecht.translate"]);
  
app.factory('dataservice', function ($http) {
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        insert: function (data, callback) {
            $http.post('/Admin/RMVayxeTableCost/Insert', data).success(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/RMVayxeTableCost/update', data).success(callback);
        },
        deleteItems: function (data, callback) {
            $http.post('/Admin/RMVayxeTableCost/deleteItems', data).success(callback);
        },
        deleteService: function (data, callback) {
            $http.post('/Admin/RMVayxeTableCost/deleteService', data).success(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/RMVayxeTableCost/delete/' + data).success(callback);
        },
        deleteDetails: function (data, callback) {
            $http.post('/Admin/RMVayxeTableCost/deleteDetails/' + data).success(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/RMVayxeTableCost/getItem/' + data).success(callback);
        },
        insert_details: function (data, callback) {
            $http.post('/Admin/RMVayxeTableCost/Insert_details', data).success(callback);
        },
        gettreedata: function (callback) {
            $http.post('/Admin/RMVayxeTableCost/gettreedata').success(callback);
        },
        insert_details1: function (data, callback) {
            $http.post('/Admin/RMVayxeTableCost/Insert_Details1', data).success(callback);
        },
        getItemDetails: function (data, callback) {
            $http.get('/Admin/RMVayxeTableCost/getItemDetails/' + data).success(callback);
        },
        updateDetails: function (data, callback) {
            $http.post('/Admin/RMVayxeTableCost/updateDetails', data).success(callback);
        },
    }
});
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
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        });



    $rootScope.validationOptions = {
        rules: {
            work_time: {
                required: true,
                maxlength: 255
            },
            work_time_extra: {
                required: true,
                maxlength: 255
            },
        },
        messages: {
            work_time: {
                required: "Thêm Giờ Làm Chính",
                maxlength: "Thêm Giờ Làm Chính"
            },
            work_time_extra: {
                required: "Thêm Giờ Làm Thêm",
                maxlength: "Thêm Giờ Làm Thêm"
            },
        }
    }

    $rootScope.StatusData = [{
        Value: 1,
        Name: 'Kích Hoạt'
    }, {
        Value: 2,
        Name: 'Không kích hoạt'
        }];
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
        .when('/edit/:id', {
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit'
        })
        .when('/add/', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
        })
        .when('/index_details/:id', {
            templateUrl: ctxfolder + '/index_details.html',
            controller: 'index_details'
        })
        .when('/edit_details/:id', {
            templateUrl: ctxfolder + '/edit_details.html',
            controller: 'edit_details'
        })
        .when('/add_details1/', {
            templateUrl: ctxfolder + '/add_details1.html',
            controller: 'add_details1'
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
    $httpProvider.interceptors.push('httpResponseInterceptor');

});

app.controller('index', function ($scope, $rootScope, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.DateNow = $filter("date")(new Date(), "dd/MM/yyyy");
    var vm = $scope;

    $scope.selected = {};
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.edit = edit;
    $scope.deleteItem = deleteItem;
    $scope.model = {
        Key: ''
    }

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';


    //begin option table
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/RMVayxeTableCost/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Key = $scope.model.Key;
            },
            complete: function (data) {
                if (data.status === 401) {
                    var url = "/Home/Logout";
                    location.href = url;
                }
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(10)
        //.withOption('scrollY', '100vh')
        //.withOption('scrollCollapse', true)
        .withOption('order', [1, 'asc'])
        .withOption('serverSide', true)
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiled) {
                $scope.headerCompiled = true;
                $compile(angular.element(header).contents())($scope);
            }
        })
        .withOption('initComplete', function (settings, json) {
            //$(this.api().table().header()).css({ 'background-color': '#1a2226', 'color': '#f9fdfd', 'font-size': '8px', 'font-weight': 'bold' });
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            //$compile(angular.element(row).find('input'))($scope);
            $compile(angular.element(row).contents())($scope);

            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    //end option table 

    vm.dtColumns = [];
    //vm.dtColumns.push(DTColumnBuilder.newColumn("id").withTitle(titleHtml).notSortable()
    //    .renderWith(function (data, type, full, meta) {
    //        $scope.selected[full.id] = false;
    //        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    //    })/*.withOption('sWidth', '30px')*/.withOption('sClass', 'tcenter'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('table_code').withTitle('{{"RMVTC_LIST_COL_TABLE_CODE" | translate }}').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('table_name').withTitle('{{"RMVTC_LIST_COL_TABLE_NAME" | translate }}').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('begin_time_apply').withTitle('{{"RMVTC_LIST_COL_BEGIN_TIME_APPLY" | translate }}').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('end_time_apply').withTitle('{{"RMVTC_LIST_COL_END_TIME_APPLY" | translate }}').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('status').withTitle('{{"RMVTC_LIST_COL_STATUS" | translate }}').renderWith(function (data, type) {
        var x = "";
        if (data == 1) {
            x = '<p style="color:green">{{"RMVTC_MSG_APPROVED" | translate }}</p>'
        }
        if (data == 0) {
            x = '<p style="color:red">{{"RMVTC_MSG_NOT_YET_APPROVED" | translate }}</p>'
        }
        if (data == 2) {
            x = '<p style="color:red">{{"RMVTC_MSG_UNKNOWN" | translate }}</p>'
        }
        return x;
    }));
    
    vm.dtColumns.push(DTColumnBuilder.newColumn('appover_id').withTitle('{{"RMVTC_LIST_COL_APPOVER_ID" | translate }}').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn("null").withTitle('{{"RMVTC_LIST_COL_NULL" | translate }}').notSortable()
        .renderWith(function (data, type, full, meta) {
            vm.selected[full.id] = full;
            return '<a  ng-click="edit(selected[' + full.id + '])" style="padding-right:10px;" title="Cập nhật thông tin"><i class="fa fa-edit" style="font-size:18px"></i></a><a ng-click="deleteItem(selected[' + full.id + '])" style="padding-right:10px"  title="Xóa dịch vụ"><i class="fa fa-remove" style="font-size:18px" ></i></a>';
        }).withOption('sWidth', '120px').withOption('sClass', 'tcenter'));
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

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: true,
            size: '50'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }

    function edit(selected) {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit',
            backdrop: true,
            size: '60',
            resolve: {
                para: function () {
                    return selected.id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }

    function deleteItem(selected) {
        $confirm({ text: caption.COM_MSG_DELETE_CONFIRM_COM, title: caption.COM_CONFIRM, ok: caption.COM_CONFIRM_OK, cancel: caption.COM_CONFIRM_CANCEL })
            .then(function () {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
                dataservice.delete(selected.id, function (result) {
                    if (result.Error) {
                        App.notifyDanger(result.Title);
                    } else {
                        App.notifySuccess(result.Title);
                        $scope.reload();
                    }
                    App.unblockUI("#contentMain");
                });

            });
    }

    //$scope.edit = function () {
    //    var editItems = [];
    //    for (var id in $scope.selected) {
    //        if ($scope.selected.hasOwnProperty(id)) {
    //            if ($scope.selected[id]) {
    //                editItems.push(id);
    //            }
    //        }
    //    }
    //    if (editItems.length > 0) {
    //        if (editItems.length == 1) {
    //            var modalInstance = $uibModal.open({
    //                animation: true,
    //                templateUrl: ctxfolder + '/edit.html',
    //                controller: 'edit',
    //                backdrop: 'static',
    //                size: 'lg',
    //                resolve: {
    //                    para: function () {
    //                        return editItems[0];
    //                    }
    //                }
    //            });
    //            modalInstance.result.then(function (d) {
    //                $scope.reload();
    //            }, function () {
    //                return $itemScope.data.id;
    //            });
    //        } else {
    //            App.toastrError(caption.ONLY_SELECT.replace('{0}', caption.FUNCTION));
    //        }
    //    } else {
    //        App.toastrError(caption.ERR_NOT_CHECKED.replace('{0}', caption.FUNCTION));
    //    }
    //}

    //$scope.deleteChecked = function () {
    //    var deleteItems = [];
    //    for (var id in $scope.selected) {
    //        if ($scope.selected.hasOwnProperty(id)) {
    //            if ($scope.selected[id]) {
    //                deleteItems.push(id);
    //            }
    //        }
    //    }
    //    if (deleteItems.length > 0) {
    //        $confirm({ text: 'Bạn có chắc chắn muốn khoá các khoản mục đã chọn này ?', title: 'Xác nhận', ok: 'Chắc chắn', cancel: ' Hủy ' })
    //            .then(function () {
    //                App.blockUI({
    //                    target: "#contentMain",
    //                    boxed: true,
    //                    message: 'loading...'
    //                });

    //                dataservice.deleteItems(deleteItems, function (result) {
    //                    if (result.Error) {
    //                        App.notifyDanger(result.Title);
    //                    } else {
    //                        App.notifySuccess(result.Title);
    //                        $scope.reload();
    //                    }
    //                    App.unblockUI("#contentMain");
    //                });

    //            });
    //    } else {
    //        App.notifyDanger("Không có khoản mục nào được chọn!");
    //    }
    //}
    $scope.contextMenu = [
        [function ($itemScope) {
            return '<i class="fa fa-edit"></i> {{"RMVTC_MSG_EDIT_TABLE" | translate}}';
        }, function ($itemScope, $event, model) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/edit.html',
                controller: 'edit',
                backdrop: true,
                size: 'lg',
                resolve: {
                    para: function () {

                        return $itemScope.data.id;
                        console.log(JSON.stringify($itemScope));
                    }
                }
            });
            modalInstance.result.then(function (d) {
                $scope.reload();
            }, function () {
            });
        }, function ($itemScope, $event, model) {
            return true;
            }],
        [function ($itemScope) {
            return '<i class="fa fa-edit"></i> {{"RMVTC_TITLE_INFORMATION" | translate}}';
        }, function ($itemScope, $event, model) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/index_details.html',
                controller: 'index_details',
                backdrop: true,
                size: 'lg',
                resolve: {
                    para: function () {

                        return $itemScope.data.id;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                $scope.reload();
            }, function () {
            });
        }, function ($itemScope, $event, model) {
            return true;
        }],
        [function ($itemScope) {
            return '<i class="fa fa-remove"></i> {{"RMVTC_MSG_TABLE_KEY" | translate}}';
        }, function ($itemScope, $event, model) {

            $confirm({ text: caption.RMVTC_MSG_TABLE_KEY_CONFIRM, title: caption.COM_CONFIRM, cancel: caption.COM_CONFIRM_CANCEL })
                .then(function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                    dataservice.delete($itemScope.data.id, function (result) {
                        if (result.Error) {
                            App.notifyDanger(result.Title);
                            //alert(result.Title)
                        } else {
                            App.notifySuccess(result.Title);
                            //alert(result.Title)
                            $scope.reload();
                        }
                        App.unblockUI("#contentMain");
                    });
                });
        }, function ($itemScope, $event, model) {
            return true;
        }]
    ];
   
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.search = function () {
        $scope.reload();
    }

});


app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, $filter, DTOptionsBuilder, DTColumnBuilder, DTInstances) {
    $scope.model = {
        table_code: '',
        table_name: '',
        begin_time_apply: '',
        end_time_apply: '',
        status: '',
        appover_id: '',
        note: '',
        service_code: '',
        status_de: '',
    }

    $scope.names1 = [
        { value: caption.RMVTC_MSG_APPROVED, status1: 1 },
        { value: caption.RMVTC_MSG_NOT_YET_APPROVED, status1: 0 },
        { value: caption.RMVTC_MSG_UNKNOWN, status1: 2}
    ];
    $scope.names2 = [
        { value: caption.RMVTC_MSG_APPROVED, status2: 1 },
        { value: caption.RMVTC_MSG_NOT_YET_APPROVED, status2: 0 },
        { value: caption.RMVTC_MSG_UNKNOWN, status2: 2 }
    ];
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        //debugger
        //console.log(JSON.stringify($scope.model))
        $confirm({ icon: '../../images/message/success.png', text: caption.RMVTC_MSG_ADD_PRICE_SERVICE, title: caption.COM_CONFIRM, cancel: caption.COM_CONFIRM_CANCEL})
            .then(function () {
               
        if ($scope.addform.validate()) {
            dataservice.insert($scope.model, function (rs) {
                if (rs.Error) {
                    App.notifyDanger(rs.Title);
                } else {
                    App.notifySuccess(rs.Title);
                    $uibModalInstance.close();
                }
            });
        }
       
            });
    }
    
    ////details
    //$scope.DateNow = $filter("date")(new Date(), "dd/MM/yyyy");
    //var vm = $scope;

    //$scope.selected = [];
    //$scope.selectAll = false;
    //$scope.toggleAll = toggleAll;
    //$scope.toggleOne = toggleOne;

    //$scope.model = {
    //    Key1: ''
    //}

    //var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';


    ////begin option table
    //vm.dtOptions = DTOptionsBuilder.newOptions()
    //    .withOption('ajax', {
    //        url: "/Admin/RMVayxeTableCost/JJTable",
    //        beforeSend: function (jqXHR, settings) {
    //            App.blockUI({
    //                target: "#contentMain",
    //                boxed: true,
    //                message: 'loading...'
    //            });
    //        },
    //        type: 'POST',
    //        data: function (d) {
    //            d.Key1 = $scope.model.Key1;
    //        },
    //        complete: function () {
    //            App.unblockUI("#contentMain");
    //        }
    //    })
    //    .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
    //    .withDataProp('data').withDisplayLength(15)
    //    //.withOption('scrollY', '100vh')
    //    //.withOption('scrollCollapse', true)
    //    .withOption('order', [1, 'asc'])
    //    .withOption('serverSide', true)
    //    .withOption('headerCallback', function (header) {
    //        if (!$scope.headerCompiled) {
    //            $scope.headerCompiled = true;
    //            $compile(angular.element(header).contents())($scope);
    //        }
    //    })
    //    .withOption('initComplete', function (settings, json) {
    //        $(this.api().table().header()).css({ 'background-color': '#1a2226', 'color': '#f9fdfd', 'font-size': '8px', 'font-weight': 'bold' });
    //    })
    //    .withOption('createdRow', function (row, data, dataIndex) {
    //        const contextScope = $scope.$new(true);
    //        contextScope.data = data;
    //        contextScope.contextMenu = $scope.contextMenu;
    //        $compile(angular.element(row).find('input'))($scope);
    //        $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
    //    });
    ////end option table 

    //vm.dtColumns = [];
    //vm.dtColumns.push(DTColumnBuilder.newColumn("id").withTitle(titleHtml).notSortable()
    //    .renderWith(function (data, type, full, meta) {
    //        $scope.selected[full.id] = false;
    //        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    //    })/*.withOption('sWidth', '30px')*/.withOption('sClass', 'tcenter'));

    ////vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('STT').renderWith(function (data, type) {
    ////    return data;
    ////}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('table_name').withTitle('Tên dịch vụ').renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('status').withTitle('Trạng thái').renderWith(function (data, type) {
    //    var x = "";
    //    if (data == 1) {
    //        x = '<p style="color:green">Đã duyệt</p>'
    //    }
    //    if (data == 0) {
    //        x = '<p style="color:red">Chưa duyệt</p>'
    //    }
    //    if (data == 0) {
    //        x = '<p style="color:red">Không xác định</p>'
    //    }
    //    return x;
    //}));
    //vm.reloadData = reloadData;
    //vm.dtInstance = {};
    //function reloadData(resetPaging) {
    //    vm.dtInstance.reloadData(callback, resetPaging);
    //}
    //function callback(json) {

    //}
    //function toggleAll(selectAll, selectedItems) {
    //    for (var id in selectedItems) {
    //        if (selectedItems.hasOwnProperty(id)) {
    //            selectedItems[id] = selectAll;
    //        }
    //    }
    //}

    //function toggleOne(selectedItems) {
    //    for (var id in selectedItems) {
    //        if (selectedItems.hasOwnProperty(id)) {
    //            if (!selectedItems[id]) {
    //                vm.selectAll = false;
    //                return;
    //            }
    //        }
    //    }
    //    vm.selectAll = true;
    //}
    $scope.initData = function () {
        dataservice.gettreedata(function (result) {
            $scope.treeData = result.Object;
        });
    }
    $scope.initData();
    $scope.cancel1 = function () {
        $uibModalInstance.close();
    }
    $scope.submit1 = function () {
        if ($scope.model == -1) {
            App.notifyDanger(caption.RMVTC_VALIDATE_ADD_SERVICE);
        }
        else {
            if ($scope.addform.validate()) {
                dataservice.insert_details($scope.model, function (rs) {
                    if (rs.Error) {
                        App.notifyDanger(rs.Title);
                    } else {
                        App.notifySuccess(rs.Title);
                        //  $uibModalInstance.close();
                    }
                });
            }
        }
    }

    $scope.edit_details = function () {
        var editItems = [];
        for (var id in $scope.selected) {
            if ($scope.selected.hasOwnProperty(id)) {
                if ($scope.selected[id]) {
                    editItems.push(id);
                }
            }
        }
        if (editItems.length > 0) {
            if (editItems.length == 1) {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/edit_details.html',
                    controller: 'edit_details',
                    backdrop: 'static',
                    size: '80',
                    resolve: {
                        para: function () {
                            return editItems[0];
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    $scope.reload();
                }, function () {
                });
            } else {
                App.toastrError(caption.ONLY_SELECT.replace('{0}', caption.FUNCTION));
            }
        } else {
            App.toastrError(caption.ERR_NOT_CHECKED.replace('{0}', caption.FUNCTION));
        }
    }

    $scope.deleteChecked = function () {
        var deleteItems = [];
        for (var id in $scope.selected) {
            if ($scope.selected.hasOwnProperty(id)) {
                if ($scope.selected[id]) {
                    deleteItems.push(id);
                }
            }
        }
        if (deleteItems.length > 0) {
            $confirm({ text: caption.RMVTC_MSG_TABLE_KEY_CONFIRM_SELECT, title: caption.COM_CONFIRM, ok: caption.COM_CONFIRM_OK, cancel: caption.COM_CONFIRM_CANCEL })
                .then(function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });

                    dataservice.deleteItems(deleteItems, function (result) {
                        if (result.Error) {
                            App.notifyDanger(result.Title);
                        } else {
                            App.notifySuccess(result.Title);
                            $scope.reload();
                        }
                        App.unblockUI("#contentMain");
                    });

                });
        } else {
            App.notifyDanger(caption.COM_MSG_UNSELECTED);
        }
    }
    $scope.contextMenu = [
        [function ($itemScope) {
            return '<i class="fa fa-edit"></i> {{"RMVTC_MSG_EDIT_TABLE" | translate}}';
        }, function ($itemScope, $event, model) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/edit_details.html',
                controller: 'edit_details',
                backdrop: true,
                size: 'lg',
                resolve: {
                    para: function () {

                        return $itemScope.data.id;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                $scope.reload();
            }, function () {
            });
        }, function ($itemScope, $event, model) {
            return true;
        }],
        [function ($itemScope) {
            return '<i class="fa fa-remove"></i> {{"RMVTC_MSG_TABLE_KEY" | translate}}';
        }, function ($itemScope, $event, model) {

            $confirm({ text: caption.RMVTC_MSG_TABLE_KEY_CONFIRM, title: caption.COM_BTN_CONFIRM, cancel: caption.COM_CONFIRM_CANCEL })
                .then(function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                    dataservice.delete($itemScope.data.id, function (result) {
                        if (result.Error) {
                            App.notifyDanger(result.Title);
                            //alert(result.Title)
                        } else {
                            App.notifySuccess(result.Title);
                            //alert(result.Title)
                            $scope.reload();
                        }
                        App.unblockUI("#contentMain");
                    });
                });
        }, function ($itemScope, $event, model) {
            return true;
        }]
    ];

    $scope.reload = function () {
        reloadData(true);
    }
    $scope.search = function () {
        $scope.reload();
    }
});

app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para, $filter, DTOptionsBuilder, DTColumnBuilder, DTInstances) {
    $scope.names1 = [
        { value: caption.RMVTC_MSG_APPROVED, status1: 1 },
        { value: caption.RMVTC_MSG_NOT_YET_APPROVED, status1: 0 },
        { value: caption.RMVTC_MSG_UNKNOWN, status1: 2 }
    ];
    $scope.loadData = function () {

    }
    $scope.loadData();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.initData = function () {
        dataservice.getItem(para, function (rs) {
            console.log("RS: " + para);
            if (rs.Error) {
                App.notifyDanger(rs.Title);
            } else {
                $scope.model = rs[0];
                console.log('Data details: ' + JSON.stringify(rs))
            }
        });
    }
    $scope.initData();
    $scope.submit = function () {
        // if ($scope.editform.validate()) {
        $confirm({ icon: '../../images/message/update.png', text: caption.RMVTC_MSG_UPDATE_PRICE_CONFIRM, title: caption.COM_BTN_CONFIRM, cancel: caption.COM_CONFIRM_CANCEL })
            .then(function () {
              
        dataservice.update($scope.model, function (rs) {
            if (rs.Error) {
                App.notifyDanger(rs.Title);
            } else {
                App.notifySuccess(rs.Title);
                $uibModalInstance.close();
            }
        });
      
            });
        // }
    }
    $scope.model = {
        Key: para,
    }

    $scope.DateNow = $filter("date")(new Date(), "dd/MM/yyyy");
    var vm = $scope;

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;


    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';


    //begin option table
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/RMVayxeTableCost/JTable_details",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Key = para;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(15)
        //.withOption('scrollY', '100vh')
        //.withOption('scrollCollapse', true)
        .withOption('order', [1, 'asc'])
        .withOption('serverSide', true)
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiled) {
                $scope.headerCompiled = true;
                $compile(angular.element(header).contents())($scope);
            }
        })
        .withOption('initComplete', function (settings, json) {
           // $(this.api().table().header()).css({ 'background-color': '#1a2226', 'color': '#f9fdfd', 'font-size': '8px', 'font-weight': 'bold' });
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).find('input'))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    //end option table 

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        })/*.withOption('sWidth', '30px')*/.withOption('sClass', 'tcenter'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('service_name').withTitle('{{"RMVTC_CURD_LIST_COL_NAME_SERVICE" | translate}}').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('status').withTitle('{{"RMVTC_CURD_LIST_COL_STATUS" | translate}}').renderWith(function (data, type) {
        var x = "";
        if (data == 1) {
            x = '<p style="color:green">{{"RMVTC_MSG_APPROVED" | translate}}</p>'
        }
        if (data == 0) {
            x = '<p style="color:red">{{"RMVTC_MSG_NOT_YET_APPROVED" | translate}}</p>'
        }
        if (data == 2) {
            x = '<p style="color:red">{{"RMVTC_MSG_UNKNOWN" | translate}}</p>'
        }
        return x;
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

    $scope.add_details1 = function () {
        
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add_details1.html',
            controller: 'add_details1',
            backdrop: true,
            size: 'xl',
            resolve: {
                para: function () {
                    return para;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
            return $itemScope.data.id;
        });
    }

    $scope.edit_details = function () {
        var editItems = [];
        for (var id in $scope.selected) {
            if ($scope.selected.hasOwnProperty(id)) {
                if ($scope.selected[id]) {
                    editItems.push(id);
                }
            }
        }
        if (editItems.length > 0) {
            if (editItems.length == 1) {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/edit_details.html',
                    controller: 'edit_details',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        para: function () {
                            return editItems[0];
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    $scope.reload();
                }, function () {
                    return $itemScope.data.id;
                });
            } else {
                App.toastrError(caption.ONLY_SELECT.replace('{0}', caption.FUNCTION));
            }
        } else {
            App.toastrError(caption.ERR_NOT_CHECKED.replace('{0}', caption.FUNCTION));
        }
    }

    $scope.deleteChecked = function () {
        var deleteItems = [];
        for (var id in $scope.selected) {
            if ($scope.selected.hasOwnProperty(id)) {
                if ($scope.selected[id]) {
                    deleteItems.push(id);
                }
            }
        }
        if (deleteItems.length > 0) {
            $confirm({ text: caption.RMVTC_MSG_TABLE_KEY_CONFIRM_SELECT, title: caption.COM_CONFIRM, ok: caption.COM_CONFIRM_OK, cancel: caption.COM_CONFIRM_CANCEL })
                .then(function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });

                    dataservice.deleteItems(deleteItems, function (result) {
                        if (result.Error) {
                            App.notifyDanger(result.Title);
                        } else {
                            App.notifySuccess(result.Title);
                            $scope.reload();
                        }
                        App.unblockUI("#contentMain");
                    });

                });
        } else {
            App.notifyDanger(caption.RMVTC_MSG_TABLE_NOT_SELECTED);
        }
    }
    $scope.contextMenu = [
        [function ($itemScope) {
            return '<i class="fa fa-edit"></i> {{"RMVTC_MSG_EDIT_TABLE" | translate}}';
        }, function ($itemScope, $event, model) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/edit_details.html',
                controller: 'edit_details',
                backdrop: true,
                size: 'lg',
                resolve: {
                    para: function () {

                        return $itemScope.data.id;
                        
                        console.log(JSON.stringify($itemScope));
                    }
                }
            });
            modalInstance.result.then(function (d) {
                $scope.reload();
            }, function () {
            });
        }, function ($itemScope, $event, model) {
            return true;
        }],
        [function ($itemScope) {
            return '<i class="fa fa-remove"></i> {{"RMVTC_MSG_TABLE_KEY" | translate}}';
        }, function ($itemScope, $event, model) {

            $confirm({ text: caption.RMVTC_MSG_TABLE_KEY_CONFIRM, title: caption.COM_CONFIRM, cancel: caption.COM_CONFIRM_CANCEL })
                .then(function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                    dataservice.deleteDetails($itemScope.data.id, function (result) {
                        if (result.Error) {
                            App.notifyDanger(result.Title);
                            //alert(result.Title)
                        } else {
                            App.notifySuccess(result.Title);
                            //alert(result.Title)
                            $scope.reload();
                        }
                        App.unblockUI("#contentMain");
                    });
                });
        }, function ($itemScope, $event, model) {
            return true;
        }]
    ];

    $scope.reload = function () {
        reloadData(true);
    }
    $scope.search = function () {
        $scope.reload();
    }
    $scope.cancel1 = function () {
        $uibModalInstance.close();
    }
    $scope.delete = function () {
        
        var editItems = [];
        for (var id in $scope.selected) {
            if ($scope.selected.hasOwnProperty(id)) {
                if ($scope.selected[id]) {
                    editItems.push(id);
                }
            }
        }
        if (editItems.length > 0) {
            if (editItems.length > 0) {
                $confirm({ text: caption.COM_MSG_DELETE_CONFIRM_COM, title: caption.COM_CONFIRM, ok: caption.COM_BTN_DELETE, cancel: caption.COM_CONFIRM_CANCEL })
                    .then(function () {
                        App.blockUI({
                            target: "#contentMain",
                            boxed: true,
                            message: 'loading...'
                        });
                        dataservice.deleteService(editItems, function (rs) {
                            if (rs) {
                                if (rs.Error) {
                                    App.notifyDanger(rs.Title);
                                }
                                else {
                                    
                                    App.notifySuccess(rs.Title);
                                    $scope.reload();
                                }
                                App.unblockUI("#contentMain");
                            }
                        });

                    });
            } else {
                App.notifyDanger(caption.COM_VALIDATE_DELETE_RECORD);
            }
        } else {
            App.notifyDanger(caption.COM_VALIDATE_DELETE_RECORD);
        }
    }
});

app.controller('edit_details', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para) {
    $scope.names1 = [
        { value: caption.RMVTC_MSG_APPROVED, status1: 1 },
        { value: caption.RMVTC_MSG_NOT_YET_APPROVED, status1: 0 },
        { value: caption.RMVTC_MSG_UNKNOWN, status1: 2 }
    ];
    $scope.names2 = [
        { value: caption.RMVTC_MSG_APPROVED, status2: 1 },
        { value: caption.RMVTC_MSG_NOT_YET_APPROVED, status2: 0 },
        { value: caption.RMVTC_MSG_UNKNOWN, status2: 2 }
    ];
    $scope.initData = function () {
        dataservice.gettreedata(function (result) {
            $scope.treeData = result.Object;
        });
    }
    $scope.initData();

    $scope.loadData = function () {

    }
   
    $scope.loadData();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.initData = function () {
        dataservice.getItemDetails(para, function (rs) {
            console.log("RS: " + para);
            if (rs.Error) {
                App.notifyDanger(rs.Title);
            } else {
                $scope.model = rs[0];
                console.log('Data details: ' + JSON.stringify(rs))
            }
        });
    }
    $scope.initData();
    $scope.submit = function () {
        // if ($scope.editform.validate()) {
        dataservice.updateDetails($scope.model, function (rs) {
            if (rs.Error) {
                App.notifyDanger(rs.Title);
            } else {
                App.notifySuccess(rs.Title);
                $uibModalInstance.close();
            }
        });
        // }
    }
});

app.controller('add_details1', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, $filter, para) {
    $scope.model = {
        id:para,
        service_code: '',
        status:0
    }

    console.log(para);
    $scope.names1 = [
        { value: caption.RMVTC_MSG_APPROVED, status1: 1 },
        { value: caption.RMVTC_MSG_NOT_YET_APPROVED, status1: 0 },
        { value: caption.RMVTC_MSG_UNKNOWN, status1: 2 }
    ];
    $scope.names2 = [
        { value: caption.RMVTC_MSG_APPROVED, status2: 1 },
        { value: caption.RMVTC_MSG_NOT_YET_APPROVED, status2: 0 },
        { value: caption.RMVTC_MSG_UNKNOWN, status2: 2 }
    ];
    $scope.initData = function () {
        dataservice.gettreedata(function (result) {
            $scope.treeData = result.Object;
        });
    }
    $scope.initData();

    $scope.loadData = function () {

    }
    $scope.loadData();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.submit = function () {
        
        if ($scope.addform.validate()) {
            dataservice.insert_details1($scope.model, function (rs) {
                if (rs.Error) {
                    App.notifyDanger(rs.Title);
                } else {
                    App.notifySuccess(rs.Title);
                    $uibModalInstance.close();
                }
            });
        }
    }
});
