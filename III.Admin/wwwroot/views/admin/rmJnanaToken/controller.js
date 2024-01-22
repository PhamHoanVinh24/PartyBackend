var ctxfolder = "/views/admin/rmJnanaToken";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', "ngCookies", "pascalprecht.translate"]);
app.factory('dataservice', function ($http) {
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        insert: function (data, callback) {           
            $http.post('/Admin/RMJnanaToken/Insert', data).success(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/RMJnanaToken/Update', data).success(callback);
        },
        getItem: function (data, callback) {   
            $http.get('/Admin/RMJnanaToken/GetItem?id='+data).success(callback);
        },
        deleteItems: function (data, callback) {
            $http.post('/Admin/RMJnanaToken/DeleteItems', data).success(callback);
        },
        deleteItemsDetail: function (data, callback) {
            $http.post('/Admin/RMJnanaToken/DeleteItemsDetail/' + data).success(callback);
        }
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
            //max: 'Max some message {0}'
        });
    });
    $rootScope.validationOptions = {
        rules: {
            Descriptionz: {
                required: true
            },
            Keyz: {
                required: true
            },
            Limitz: {
                required: true,
                number: true
            },
            Service_typez: {
                required: true
            },
        },
        messages: {
            Descriptionz: {
                required: caption.RMJT_VALIDATE_ENTER_EMAIL
            },
            Keyz: {
                required: caption.RMJT_VALIDATE_ENTER_CODE
            },
            Limitz: {
                required: caption.RMJT_VALIDATE_ENTER_LIMIT_REQUEST,
                number: caption.RMJT_VALIDATE_ENTER_LIMIT_REQUEST_NUMBER
            },
            Service_typez: {
                required: caption.RMJT_VALIDATE_ENTER_CHOOSE_TYPE_SEVER
            },
        }
    }
    $rootScope.StatusData = [{
        Value: 1,
        Name: 'Hoạt động'
    }, {
        Value: 0,
        Name: 'Ngừng hoạt động'
    }];
   
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {

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
        .when('/detail/', {
            templateUrl: ctxfolder + '/detail.html',
            controller: 'detail'
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
    $scope.model = {
        Name: ''
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" disabled ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/RMJnanaToken/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Name = $scope.model.Name;
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
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm.dtColumns = [];
    //vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
    //    .renderWith(function (data, type, full, meta) {
    //        $scope.selected[full.Id] = false;
    //            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';                      
    //    }).withOption('sWidth', '30px').withOption('sClass', 'tcenter'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Key').withTitle('{{"RMJT_LIST_COL_KEY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Description').withTitle('{{"RMJT_LIST_COL_DESCRIPTION" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Limit').withTitle('{{"RMJT_LIST_COL_LIMIT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Service_type').withTitle('{{"RMJT_LIST_COL_SERVICE_TYPE" | translate}}').renderWith(function (data, type) {      
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"RMJT_LIST_COL_STATUS" | translate}}').renderWith(function (data, type) {
        var x = "";
        if (data == 1) {
            x = '<span class="text-success">{{"RMJT_MSG_STILL" | translate}}</span>';
        }
        if (data == 0) {
            x = '<span class="text-danger">{{"RMJT_MSG_OVER" | translate}}</span>';
        }
        return x;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn("null").withTitle('{{"RMJT_LIST_COL_NULL" | translate}}').notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = full;
            return '<label class="mt-checkbox" style ="margin-top:5px"><a ng-click="edit(selected[' + full.Id + '])" style="padding-right:10px;" title="Cập nhật thông tin"><i class="fa fa-edit" style="font-size:22px"></i></a></label>';
        }).withOption('sWidth', '100px').withOption('sClass', 'tcenter'));
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
    function edit(selected) {
        console.log("hello" + JSON.stringify(selected));
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit',
            backdrop: 'static',
            size: 'xl',
            resolve: {
                para: function () {
                    return selected;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: true,
            size: 'xl'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.detail = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/detail.html',
            controller: 'detail',
            backdrop: true,
            size: '70'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
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

            $confirm({ text: caption.RMJT_DELETE_TOKEN, title: caption.COM_BTN_CONFIRM, ok: caption.COM_CONFIRM_OK, cancel: caption.COM_CONFIRM_CANCEL })
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
            App.notifyDanger(caption.RMJT_ERR_CHOOSE);
        }
    }

    //$scope.contextMenu = [
    //    [function ($itemScope) {
    //        return '<i class="fa fa-edit"></i>Chỉnh sửa token';
    //    }, function ($itemScope, $event, model) {
            
    //        var modalInstance = $uibModal.open({
    //            animation: true,
    //            templateUrl: ctxfolder + '/edit.html',
    //            controller: 'edit',
    //            backdrop: true,
    //            size: 'lg',
    //            resolve: {
    //                para: function () {
    //                    return $itemScope.data.Id;
    //                }
    //            }
    //        });
    //        modalInstance.result.then(function (d) {
    //            $scope.reload();
    //        }, function () {
    //        });
    //    }, function ($itemScope, $event, model) {
    //        return true;
    //    }]
    //];

    $scope.search = function () {
        $scope.reload();
    }
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
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice) {  
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.names2 = [
        { value: "place_api", Type: "place_api" },
        { value: "direction_api", Type: "direction_api" },
        { value: "static_map_api", Type: "static_map_api" }
    ];
    $scope.submit = function () {
        $confirm({ icon: '../../images/message/success.png', text: caption.RMJT_ADD_KEY, title: caption.COM_CONFIRM, ok: caption.COM_CONFIRM_OK, cancel: caption.COM_CONFIRM_CANCEL })
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

});
app.controller('detail', function ($scope, $rootScope, $compile, $uibModal, $confirm, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, dataservice, $filter) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    var vm = $scope;
    $scope.selected = {};
    $scope.selectAll = false;
    $scope.toggleOne = toggleOne;
    $scope.deleteItem = deleteItem;
    $scope.model = {
        MaKey: ''
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" disabled ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/RMJnanaToken/JtableDetail",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.MaKey = $scope.model.MaKey;
            },
            complete: function () {

                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(15)
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
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm.dtColumns = [];
    //vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
    //    .renderWith(function (data, type, full, meta) {
    //        $scope.selected[full.Id] = false;
    //            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    //    }).withOption('sWidth', '30px').withOption('sClass', 'tcenter'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Create_time').withTitle('{{"RMJT_LIST_COL_CREATE_TIME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Is_limit').withTitle('{{"RMJT_LIST_COL_IS_LIMIT" | translate}}').renderWith(function (data, type) {
        if (data == 0) { return "<p style=\"color:blue\" >Khả dụng</p>"}
        else { return "<p style=\"color:red\" >Đã đầy</p>"}
       
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Key').withTitle('{{"RMJT_LIST_COL_KEY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Num_request').withTitle('{{"RMJT_LIST_COL_NUM_REQUEST" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Service_type').withTitle('{{"RMJT_LIST_COL_SERVICE_TYPE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('device').withTitle('{{"RMJT_LIST_COL_DEVICE" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn("null").withTitle('{{"RMJT_LIST_COL_NULL" | translate}}').notSortable()
    .renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = full;
        return '<label class="mt-checkbox" style ="margin-top:10px"><a ng-click="deleteItem(selected[' + full.Id + '])" style="padding-right:10px;" title="Xóa lịch sử request"><i class="fa fa-remove" style="font-size:22px"></i></a></label>';
    }).withOption('sWidth', '100px').withOption('sClass', 'tcenter'));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {

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

    function deleteItem(selected) {
        $confirm({ text: caption.RMJT_MSG_DELETE + selected.Id, title: caption.COM_CONFIRM, cancel: caption.COM_CONFIRM_CANCEL })
            .then(function () {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
                dataservice.deleteItemsDetail(selected.Id, function (result) {
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
            console.log(deleteItems)
            $confirm({ text: caption.RMJT_MSG_DELETE_NOTE, title: caption.COM_CONFIRM, ok: caption.COM_CONFIRM_OK, cancel: caption.COM_CONFIRM_CANCEL })
                .then(function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                    dataservice.deleteItemsDetail(deleteItems, function (result) {
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
            App.notifyDanger(caption.RMJT_ERR_CHOOSE);
        }
    }

});

app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, dataservice, $filter, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.names2 = [
        { value: "place_api", Type: "place_api" },
        { value: "direction_api", Type: "direction_api" },
        { value: "static_map_api", Type: "static_map_api" }
    ];
    $scope.initData = function () {

        dataservice.getItem(para.Id, function (rs) {
            if (rs.Error) {
                App.notifyDanger(rs.Title);
            } else {
                console.log("Data: " + rs);
                $scope.model = rs;
                $scope.model.Service_type = rs.Service_type;
            }
        });

    }
    $scope.initData();

    $scope.submit = function () {
        $confirm({ icon: '../../images/message/update.png', text: caption.RMJT_EDIT_KEY, title: caption.COM_CONFIRM, ok: caption.COM_CONFIRM_OK, cancel: caption.COM_CONFIRM_CANCEL })
            .then(function () {

                if ($scope.addform.validate()) {
                    $scope.model.Id = para.Id;
                    dataservice.update($scope.model, function (rs) {
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

});

