var ctxfolder = "/views/admin/rmTracking";
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
    vm.deleteItem = deleteItem;
    // $scope.toggleOne = toggleOne;
    $scope.model = {
        para: ''
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/RMTracking/JTable",
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
            $compile(angular.element(row).contents())($scope);
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            //$compile(angular.element(row).find('input'))($scope);

            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Trip_code').withTitle('Mã chuyến').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
        return data;
    }).withOption('sWidth', '70px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Type_Trip').withTitle('Hình thức').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else {
            if (data == "Điều độ") {
                return '<p  style="color:blue;margin:0">' + data + '</p>';
            }
            else if (data == "Tự do") {
                return '<p  style="color:green;margin:0">' + data + '</p>';
            }
        }
            
            
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Ma_Theo_Doi').withTitle('Mã theo dõi').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('Tài xế').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Tractor_code').withTitle('Biển số').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Remooc_code').withTitle('Mã remooc').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('container_code').withTitle('Số container').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Imgcontain1').withTitle('Ảnh container 1').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else {
            var dt = '<img style="width:64px; height:64px" src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/romooc/no_image.png' + '"' + "'" + ' class="img-responsive">';
            return dt;

        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Imgcontain2').withTitle('Ảnh container 2').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
        {
            var dt = '<img style="width:64px; height:64px" src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/romooc/no_image.png' + '"' + "'" + ' class="img-responsive">';
            return dt;

        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Start_position_text').withTitle('Vị trí bắt đầu').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }).withOption('sWidth', '120px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Start_position_time').withTitle('Thời gian đi').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('End_position_text').withTitle('Vị trí kết thúc').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }).withOption('sWidth', '120px'));   
    vm.dtColumns.push(DTColumnBuilder.newColumn('End_position_time').withTitle('Thời gian đến').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
   
    
    
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('Trạng thái').renderWith(function (data, type) {
        var x = "";
        if (data == "CREATE") {
            x = '<p  style="color:blue"> Khởi tạo </p>';
        }
        if (data == "CANCEL") {
            x = '<p style="color:red"> Chuyến hủy</p>';
        }
        if (data == "START") {
            x = '<p  style="color:green"> Đang bắt đầu</p>';
        }
        if (data == "FINISH") {
            x = '<p style="color:darkgreen"> Kết thúc</p>';
        }
        return x;
    })); 
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('Lý do hủy').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
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
                        App.notifyInfo(result.Title);
                        $scope.reload();
                    }
                    App.unblockUI("#contentMain");
                });

            });
    }
    function notify(selected) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/addNotification.html',
            controller: 'addNotification',
            backdrop: true,
            size: '90',
            resolve: {
                para: function () {
                    return selected.Id;
                    ;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }

    $scope.reload = function () {
        reloadData(true);
    }


    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: true,
            size: '90'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
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
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
        });
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
        loadDate();
    }, 50);

});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.submit = function () {

        if ($scope.model.FileUpload != null && $scope.model.FileUpload.length > 0) {
            var formData = new FormData();
            formData.append("FileUpload", $scope.model.FileUpload[0]);

            dataservice.insert(formData, function (rs) {

                if (rs.Error) {

                    App.notifyDanger(rs.Title);
                } else {

                    App.notifyInfo(rs.Title);
                    $uibModalInstance.close();
                }
            });
        } else {
            $scope.model.FileUpload = null;
            App.notifyDanger("Please choose file to upload");
        }
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
        console.log(JSON.stringify($scope.model))
        dataservice.update($scope.model, function (rs) {
            if (rs.Error) {
                App.notifyDanger(rs.Title);
            } else {
                App.notifyInfo(rs.Title);
                $uibModalInstance.close();
            }
        });
    }
});
app.controller('addNotification', function ($scope, $rootScope, dataservice, $uibModal, $uibModalInstance, para, $http) {

    $scope.model = {};
    //var saveMapToDb = function (data) {
    //    $.ajax({
    //        type: "POST",
    //        dataType: "json",
    //        data: data,
    //        url: "http://117.6.131.222:4010/RomoocFcm/Insertq",
    //        success: function (data) {

    //            console.log("Insert parking:" + JSON.stringify(data));
    //            if (data.Error) {
    //                App.notifyDanger(data.Title);
    //            } else {
    //                //App.notifyInfo("Gửi thông báo thành công");
    //                //$uibModalInstance.close();
    //            }
    //        }
    //    });
    //}

    $scope.initData = function () {
        debugger
        dataservice.getDriver(para, function (rs) {
            if (rs.Error) {
                App.notifyDanger(rs.Title);
            } else {
                $scope.model = rs;
            }
        });

    }
    $scope.initData();

    $scope.sentChecked = function () {

        console.log(JSON.stringify($scope.model))
        dataservice.SendPushNotification($scope.model, function (rs) {
            debugger
            if (rs.Error) {
                App.notifyDanger(rs.Title);
            } else {
                App.notifyInfo(rs.Title);
                $uibModalInstance.close();
            }
        });
        dataservice.SaveMess($scope.model, function (rs) {
            if (rs.Error) {
                App.notifyDanger(rs.Title);
            } else {
                App.notifyInfo(rs.Title);
                $uibModalInstance.close();
            }
        });

    }


    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
        console.log("cancel")
    }
});


