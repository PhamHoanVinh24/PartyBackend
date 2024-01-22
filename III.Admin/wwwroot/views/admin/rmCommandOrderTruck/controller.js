var ctxfolder = "/views/admin/rmCommandOrderTruck";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select']).
    directive("filesInput", function () {
        return {
            require: "ngModel",
            link: function postLink(scope, elem, attrs, ngModel) {
                elem.on("change", function (e) {
                    var files = elem[0].files;
                    ngModel.$setViewValue(files);
                });
            }
        }
    });
app.factory('dataservice', function ($http) {
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }


    var submitFormUpload2 = function (url, data, callback) {

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
        insert: function (data, callback) {
            submitFormUpload2('/Admin/RMCommandOrderTruck/Insert', data, callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/RMCommandOrderTruck/Update', data).success(callback);
        },
        InsertCommand: function (data, callback) {
            $http.post('/Admin/RMCommandOrderTruck/InsertCommand', data).success(callback);
        },
        deleteItems: function (data, callback) {
            $http.post('/Admin/RMCommandOrderTruck/DeleteItems', data).success(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/RMCommandOrderTruck/Delete/' + data).success(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/RMCommandOrderTruck/GetItem/' + data).success(callback);
        },
        getDriver: function (data, callback) {
            $http.post('/Admin/RMCommandOrderTruck/GetDriver/' + data).success(callback);
        },
        SendPushNotification: function (data, callback) {
            $http.post('/Admin/RMCommandOrderTruck/SendPushNotification/', data).success(callback);
        },
        SaveMess: function (data, callback) {
            $http.post('/Admin/RMCommandOrderTruck/SaveMessage/', data).success(callback);
        },
        rollback: function (data, callback) {
            $http.post('/Admin/RMCommandOrderTruck/rollback?id='+ data).success(callback);
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
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    $rootScope.validationOptions = {
        rules: {
            Code: {
                required: true,
                maxlength: 255
            },
            CarMaker: {
                required: true,
                maxlength: 255
            },
            TaxiType: {
                required: true,
                maxlength: 255
            },

        },
        messages: {
            Code: {
                required: "Yêu cầu nhập mã đầu kéo.",
                maxlength: "Tiêu đề không vượt quá 50 ký tự."
            },
            CarMaker: {
                required: "Yêu cầu nhập hãng xe.",
                maxlength: "Lỗi nhập giờ."
            },
            TaxiType: {
                required: "Yêu cầu nhập loại xe.",
                maxlength: "Lỗi nhập giá."
            }
        }
    }


});
app.config(function ($routeProvider, $validatorProvider, $httpProvider) {
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
        .when('/addNotification/', {
            templateUrl: ctxfolder + '/addNotification.html',
            controller: 'addNotification'
        })
        .when('/export/', {
            templateUrl: ctxfolder + '/export.html',
            controller: 'export'
        })
        .when('/Muc_Do_UuTien/', {
            templateUrl: ctxfolder + '/Muc_Do_UuTien.html',
            controller: 'Muc_Do_UuTien'
        });
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
app.controller('index', function ($scope, $rootScope, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice) {

    var vm = $scope;
    vm.selected = {};
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    vm.edit = edit;
    vm.notify = notify;
    vm.rollback = rollback;
    
    vm.exportData = exportData;
    vm.deleteItem = deleteItem;
   // $scope.toggleOne = toggleOne;
    $scope.model = {
        para: ''
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/RMCommandOrderTruck/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Ma_Theo_Doi = $scope.model.Ma_Theo_Doi;
                d.Ma_Remooc = $scope.model.Ma_Remooc;
                d.Ngay_gio_di = $scope.model.Ngay_gio_di;
                d.Ngay_gio_den = $scope.model.Ngay_gio_den;
                d.Container_Code = $scope.model.Container_Code;
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
            $compile(angular.element(row).contents())($scope);
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            //$compile(angular.element(row).find('input'))($scope);
           
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm.dtColumns = [];
    //vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
    //    .renderWith(function (data, type, full, meta) {
    //        $scope.selected[full.Id] = false;
    //        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    //    }).withOption('sWidth', '30px').withOption('sClass', 'tcenter'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Ma_Theo_Doi').withTitle('Mã theo dõi').renderWith(function (data, type) {
        return data;
    }).withOption('sWidth', '70px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Gio_Tao').withTitle('Giờ tạo').renderWith(function (data, type) {
        return data;
    }).withOption('sWidth', '70px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('So_mooc').withTitle('Mã remooc').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('So_xe').withTitle('Biển số').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('So_cont').withTitle('Số container').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Ten_tai_xe').withTitle('Tài xế').renderWith(function (data, type) {
        return data;
    })); 
    vm.dtColumns.push(DTColumnBuilder.newColumn('Ngay_Dieu_Xe').withTitle('Ngày điều').renderWith(function (data, type) {
        return data;
    })); 
    vm.dtColumns.push(DTColumnBuilder.newColumn('Muc_Do_Uu_Tien').withTitle('Độ ưu tiên').renderWith(function (data, type) {
        return data;
    })); 
    vm.dtColumns.push(DTColumnBuilder.newColumn('Noi_lay').withTitle('Nơi lấy').renderWith(function (data, type) {
        return data;
    }).withOption('sWidth', '120px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Noi_ha').withTitle('Nơi hạ').renderWith(function (data, type) {
        return data;
    }).withOption('sWidth', '120px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Khach_hang').withTitle('Khách hàng').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Tong_cong').withTitle('Tổng tiền').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Active').withTitle('Trạng thái').renderWith(function (data, type) {

      
        var x = "";
        if (data == "CREATED") {
            x = '<p  style="color:blue"> Khởi tạo </p>';
        }
        if (data == "NOTIFY") {
            x = '<p style="color:lightblue"> Đã notify </p>';
        }
        if (data == "BOOK") {
            x = '<p  style="color:orange"> Tài xế đã nhận </p>';
        }
        if (data == "CANCEL") {
            x = '<p style="color:red"> Tài xế đã hủy </p>';
        } 
        if (data == "COMPLETED") {
            x = '<p  style="color:green"> Hoàn thành </p>';
        }
        if (data == "ON_WAY") {
            x = '<p style="color:darkgreen"> Trên đường </p>';
        }
        if (data == "DESTROY") {
            x = '<p style="color:gray"> Đã thu hồi </p>';
        }
        return x;
    }));
   
    vm.dtColumns.push(DTColumnBuilder.newColumn(null).withTitle('Gửi lệnh').notSortable()
        .renderWith(function (data, type, full, meta) {
             //khách hàng yêu cầu bỏ chỉnh sửa và xóa, giữ lại notification
            vm.selected[data.Id] = data;         
            return '<a ng-click="notify(selected[' + data.Id + '])" style="padding-left:10px;" title="Notify tới tài xế"><i class="fa fa-certificate" style="font-size:15px"></i></a>'
                + '<a ng-click="rollback(selected[' + data.Id + '])" style="padding-left:10px;" title="Thu hồi lệnh này"><i class="fa fa-undo" style="font-size:15px"></i></a>'
                ;
        }).withOption('sWidth', '120px'));
   
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
    function edit(selected) {
        console.log("hello" + JSON.stringify(selected));
                var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/edit.html',
                controller: 'edit',
                backdrop: 'static',
                size: '80',
                resolve: {
                    para: function () {
                        return selected.Id;
                    }
                }
                });
                modalInstance.result.then(function (d) {
                    $scope.reload();
                }, function () {
                });
    }
    function deleteItem(selected) {
        $confirm({ text: 'Bạn có chắc chắn muốn xóa các khoản mục đã chọn?', title: 'Xác nhận', ok: 'Chắc chắn', cancel: ' Hủy ' })
            .then(function () {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
                dataservice.delete(selected.Id, function (result) {
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
    function notify(selected) {
        
        if (selected.Active == "ON_WAY" || selected.Active == "COMPLETED"){
            App.notifyDanger("Chỉ được gửi notify những lệnh điều độ mới khởi tạo, đã thu hồi hoặc đã bị tài xế từ chối");

            App.unblockUI("#contentMain");
            return;
        }
        dataservice.getDriver(selected.Id, function (result) {
            if (result.Error) {
                App.notifyDanger(result.Title);
                return;
            } else {

                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/addNotification.html',
                    controller: 'addNotification',
                    backdrop: true,
                    size: 'xl',
                    resolve: {
                       
                        para: function () {
                            return result;
                            
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    $scope.reload();
                }, function () {
                });
            }            
        });

    }
    function rollback(selected) {
        
        $confirm({ icon:'../../images/message/rollback.png', text: 'Bạn có muốn thu hồi lệnh điều độ này không?', title: 'Xác nhận', cancel: ' Hủy ' })
            .then(function () {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
                debugger
                if (selected.Active == "ON_WAY" || selected.Active == "COMPLETED" ) {
                    //App.notifySuccess("Bạn phải gửi lý do thu hồi tới tài xế!");
                    
                    //dataservice.getDriver(selected.Id, function (result) {
                    //    if (result.Error) {
                    //        App.notifyDanger(result.Title);
                    //        return;
                    //    } else {
                    //        result.Error = true;
                    //        var modalInstance = $uibModal.open({
                    //            animation: true,
                    //            templateUrl: ctxfolder + '/addNotification.html',
                    //            controller: 'addNotification',
                    //            backdrop: true,
                    //            size: 'xl',
                    //            resolve: {

                    //                para: function () {
                    //                    return result;

                    //                }
                    //            }
                    //        });
                    //        modalInstance.result.then(function (d) {
                    //            $scope.reload();
                    //        }, function () {
                    //        });
                    //    }
                    //});
                    App.notifyDanger("Không được thu hồi lệnh điều độ này");
                    
                    App.unblockUI("#contentMain");
                }
                else {
                    dataservice.rollback(selected.Id, function (result) {
                        if (result.Error) {
                            App.notifyDanger(result.Title);
                        } else {
                            App.notifySuccess(result.Title);
                            $scope.reload();
                        }
                        App.unblockUI("#contentMain");
                    });
                }
               
            });
       

    }

    $scope.reload = function () {
        reloadData(true);
    }
    function exportData() {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/export.html',
            controller: 'export',
            backdrop: true,
            size: '35'
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
    //                size: '80',
    //                resolve: {
    //                    para: function () {
    //                        return editItems[0];
    //                    }
    //                }
    //            });
    //            modalInstance.result.then(function (d) {
    //                $scope.reload();
    //            }, function () {
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
    //        $confirm({ text: 'Bạn có chắc chắn muốn xóa các khoản mục đã chọn?', title: 'Xác nhận', ok: 'Chắc chắn', cancel: ' Hủy ' })
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
    //        App.notifyDanger("Không có khoản mục nào được chọn");
    //    }
    //}
    $scope.loadData = function () {

    }
    $scope.loadData();
//    $scope.contextMenu = [
//        [function ($itemScope) {
//            return '<i class="fa fa-remove"></i> Notify tới tài xế ';
//        }, function ($itemScope, $event, model) {
//            var modalInstance = $uibModal.open({
//                animation: true,
//                templateUrl: ctxfolder + '/addNotification.html',
//                controller: 'addNotification',
//                backdrop: true,
//                size: '90',
//                resolve: {
//                    para: function () {
//                        return $itemScope.data.Id;
//;
//                    }
//                }
//            });
//            modalInstance.result.then(function (d) {
//                $scope.reload();
//            }, function () {
//            });
//        }, function ($itemScope, $event, model) {
//            return true;
//        }],
//        [function ($itemScope) {
//            return '<i class="fa fa-edit"></i> Chi tiết lệnh điều hướng';
//        }, function ($itemScope, $event, model) {
//            var modalInstance = $uibModal.open({
//                animation: true,
//                templateUrl: ctxfolder + '/edit.html',
//                controller: 'edit',
//                backdrop: true,
//                size: '80',
//                resolve: {
//                    para: function () {
//                        return $itemScope.data.Id;
//                    }
//                }
//            });
//            modalInstance.result.then(function (d) {
//                $scope.reload();
//            }, function () {
//            });
//        }, function ($itemScope, $event, model) {
//            return true;
//        }],
//        [function ($itemScope) {
//            return '<i class="fa fa-remove"></i> Xóa khoản mục';
//        }, function ($itemScope, $event, model) {

//            $confirm({ text: 'Bạn có chắc chắn xóa lệnh điều hướng: ' + $itemScope.data.Ma_Theo_Doi, title: 'Xác nhận', cancel: ' Hủy ' })
//                .then(function () {
//                    App.blockUI({
//                        target: "#contentMain",
//                        boxed: true,
//                        message: 'loading...'
//                    });
//                    dataservice.delete($itemScope.data.Ma_Theo_Doi, function (result) {
//                        if (result.Error) {
//                            App.notifyDanger(result.Title);
//                        } else {
//                            App.notifySuccess(result.Title);
//                            $scope.reload();
//                        }
//                        App.unblockUI("#contentMain");
//                    });
//                });
//        }, function ($itemScope, $event, model) {
//            return true;
//        }]
//    ];

});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.submit = function () {
        $confirm({ icon: '../../images/message/success.png', text: 'Bạn có chắc chắn thêm lệnh điều độ ?', title: 'Xác nhận', cancel: ' Hủy ' })
            .then(function () {

                if ($scope.model.FileUpload != null && $scope.model.FileUpload.length > 0) {
                    var formData = new FormData();
                    formData.append("FileUpload", $scope.model.FileUpload[0]);

                    dataservice.insert(formData, function (rs) {

                        if (rs.Error) {

                            if (rs.Title == "Đang có lệnh điều độ tới tài xế này trong khoảng 30ph trước. Mời nhập thứ tự ưu tiên.") {

                                var modalInstance = $uibModal.open({
                                    animation: true,
                                    templateUrl: ctxfolder + '/Muc_Do_UuTien.html',
                                    controller: 'Muc_Do_UuTien',
                                    backdrop: true,
                                    size: 'xl',
                                    resolve: {

                                        para: function () {
                                            return rs;

                                        }
                                    }
                                });
                                modalInstance.result.then(function (d) {
                                    $uibModalInstance.close();
                                }, function () {
                                });
                            }
                            App.notifyDanger(rs.Title);
                        } else {

                            App.notifySuccess(rs.Title);
                            $uibModalInstance.close();
                        }
                    });
                } else {
                    $scope.model.FileUpload = null;
                    App.notifyDanger("Please choose file to upload");
                }
             
            });
    }
});

app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.initData = function () {
        dataservice.getItem(para, function (rs) {
            if (rs.Error) {
                App.notifyDanger(rs.Title);
            } else {
                $scope.model = rs;
            }
        });
       
    }
    $scope.initData();


    $scope.submit = function () {
        $confirm({ icon: '../../images/message/success.png', text: 'Bạn có chắc chắn thêm tài xế ?', title: 'Xác nhận', cancel: ' Hủy ' })
            .then(function () {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
                console.log(JSON.stringify($scope.model))
                dataservice.update($scope.model, function (rs) {
                    if (rs.Error) {
                        App.notifyDanger(rs.Title);
                    } else {
                        App.notifySuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                });
            });
    }
});
app.controller('addNotification', function ($scope, $rootScope, dataservice, $uibModal, $uibModalInstance, para, $http, $confirm) {
    
    $scope.model = {};
    $scope.initData = function () {
        $scope.model.User_id = para.Object.Id;
        $scope.model.Ma_Theo_Doi = para.Title;
        if (para.Error == true) {
            $scope.name = "Gửi thông báo thu hồi tới tài xế";
        }
        else {
            $scope.name = "Gửi lệnh điều độ tới tài xế";

        }
        console.log(JSON.stringify($scope.model))
    }
    $scope.initData();

    $scope.sentChecked = function () {
       
        $confirm({ icon: '../../images/message/success.png', text: 'Bạn có chắc chắn gửi lệnh điều độ tới tài xế ?', title: 'Xác nhận', cancel: ' Hủy ' })
            .then(function () {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
                dataservice.SendPushNotification($scope.model, function (rs) {

                    if (rs.Error) {
                        App.notifyDanger(rs.Title);
                    } else {
                        App.notifySuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                });
                App.unblockUI("#contentMain");

            })
    }


    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
        console.log("cancel")
    }
});
app.controller('export', function ($scope, $rootScope, $filter, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $uibModalInstance, $location) {

    $scope.model = {
        startDate: '',
        endDate: ''
    }
    $scope.export = function () {
        $confirm({ icon: '../../images/message/export.png', text: 'Bạn có chắc chắn export excel ?', title: 'Xác nhận', cancel: ' Hủy ' })
            .then(function () {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
                location.href = "/Admin/RMCommandOrderTruck/ExportRomooc/?startTime=" + $scope.model.startDate + "&endTime=" + $scope.model.endDate;
                $uibModalInstance.dismiss('cancel');
                App.unblockUI("#contentMain");
            });
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
});
app.controller('Muc_Do_UuTien', function ($scope, $rootScope, dataservice, $uibModal, $uibModalInstance, para, $http) {
   
    $scope.model = {};
    $scope.initData = function () {
        $scope.label = [];
        var data = para.Object;
        $scope.label = data;
       
    }
    $scope.initData();

    $scope.UpdateUuTien = function (id, obj) {
        var data = para.Object;
        
       
        for (var i in data) {
            if (data[i].Id == id) {

                data[i].Muc_Do_Uu_Tien = $scope.model.Uu_Tien[obj];

            }
        }
    }

    $scope.submit = function () {
        
        dataservice.InsertCommand(para.Object, function (rs) {

            if (rs.Error) {
                App.notifyDanger(rs.Title);
            } else {
                App.notifySuccess(rs.Title);
                
                $uibModalInstance.close();
            }
        });

    }


    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
        console.log("cancel")
    }
});

