var ctxfolder = "/views/admin/rmVayxeBookChecking";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', "ngCookies", "pascalprecht.translate"]).directive("filesInput", function () {
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
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }

    var submitFormUpload = function (url, data, callback) {
        var config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };
        var formData = new FormData();
        formData.append("Id", data.Id);
        formData.append("Active", data.Active);
        formData.append("FirstName", data.FirstName);
        formData.append("LastName", data.LastName);
        formData.append("Phone", data.Phone);       
        formData.append("Email", data.Email);
        formData.append("Balance_credit", data.Balance_credit);
        formData.append("isSocial", data.isSocial);
        //formData.append("Email", data.Email);
        //formData.append("Email", data.Email);
        //formData.append("Email", data.Email);
        formData.append("Profile_picture", data.Profile_picture != null && data.Profile_picture.length > 0 ? data.Profile_picture[0] : null);
        

        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            data: formData
        }

        $http(req).success(callback);
    };

    return {
        insert: function (data, callback) {
            $http.post('/Admin/RMVayxeBookChecking/Insert', data).success(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/RMVayxeBookChecking/Delete/' + data).success(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/RMVayxeBookChecking/Update', data).success(callback);
        },
        deleteItems: function (data, callback) {
            $http.post('/Admin/RMVayxeBookChecking/DeleteItems', data).success(callback);
        },
     
        getItem: function (data, callback) {
            $http.get('/Admin/RMVayxeBookChecking/getItem/' + data).success(callback);
        }, 
        gettreedata: function (callback) {
            $http.post('/Admin/RMVayxeBookChecking/gettreedata').success(callback);
        },
        //resort: function (data, callback) {
        //    $http.post('/Booking/resort', data).success(callback);
        //},
        //getTypeTaxi: function (callback) {
        //    $http.post('/Booking/getTaxiCarAll/').success(callback);
        //},
        //getUser: function (data,callback) {
        //    $http.post('/DidiCustomer/getUser/'+ data).success(callback);
        //},
        //getCountTrip: function (callback) {
        //    $http.post('/Booking/getCountTripNow/').success(callback);
        //},
        //getCountTripArea: function (data,callback) {
        //    $http.post('/Booking/getCountTripArea/').success(callback);
        //},
        //getCountTripNowRun: function (callback) {
        //    $http.post('/Booking/getCountTripNowRun/').success(callback);
        //},
        //getCountTripEnd: function (callback) {
        //    $http.post('/Booking/getCountTripEnd/').success(callback);
        //},
        //getCountTripDestroy: function (callback) {
        //    $http.post('/Booking/getCountTripDestroy/').success(callback);
        //}
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
    $translate.use(culture)
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        });
        $rootScope.checkData = function (data) {
            var parttern = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            if (data.Email == "" || data.Email == undefined || parttern.test(data.Email)) {
                return { Status: false, Title: '' };
            } else {
                return { Status: true, Title: caption.RMVBC_VALIDATE_FORMAT_MAIL };
            }
        };
   
    $rootScope.StatusData = [{
        Value: 1,
        Name: 'Hoạt động'
    }, {
        Value: 0,
        Name: 'Ngừng hoạt động'
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
        .when('/details/', {
            templateUrl: ctxfolder + '/details.html',
            controller: 'details'
        })
        //.when('/indexTripEnd/', {
        //    templateUrl: ctxfolder + '/indexTripEnd.html',
        //    controller: 'indexTripEnd'
        //})
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
app.controller('index', function ($scope, $rootScope, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice,$filter) {

    var vm = $scope;
    $scope.model = { obj: { Id: 0 } };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;  
    $scope.edit = edit;
    $scope.deleteItem = deleteItem;
    $scope.DateNow = $filter("date")(new Date(), "dd/MM/yyyy"),
    
    $scope.model = {
        Key: ''     
        }

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/RMVayxeBookChecking/jtable",
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
                d.Key2 = $scope.model.Key2;
                d.Key3 = $scope.model.Key3;
                //search theo ngay hom nay
                var DateNow = new Date();
                d.StartDate = new Date(DateNow.getFullYear(), DateNow.getMonth(), DateNow.getDate() + 0); // ngay hom nay
                d.EndDate = new Date(DateNow.getFullYear(), DateNow.getMonth(), DateNow.getDate() + 1);// ngay mai
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
        .withOption('order', [1, 'desc'])
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
            //$compile(angular.element(row).find('input'))($scope);
            $compile(angular.element(row).contents())($scope);

            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm.dtColumns = [];
    //vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
    //    .renderWith(function (data, type, full, meta) {
    //        $scope.selected[full.Id] = false;
    //        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    //    }).withOption('sWidth', '30px').withOption('sClass', 'tcenter'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('Id').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('name_book').withTitle('{{"RMVBC_LIST_COL_NAME_BOOK" | translate}}').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('book_code').withTitle('{{"RMVBC_LIST_COL_BOOK_CODE" | translate}}').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('name_car').withTitle('Tên xe').renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('license_plate').withTitle('Biển số').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('num_chk').withTitle('{{"RMVBC_LIST_COL_NUM_CHK" | translate}}').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('next_chk_time').withTitle('{{"RMVBC_LIST_COL_NEXT_CHK_TIME" | translate}}').renderWith(function (data, type) {   
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));  
    vm.dtColumns.push(DTColumnBuilder.newColumn('approver_id').withTitle('{{"RMVBC_LIST_COL_APPROVER_ID" | translate}}').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('status').withTitle('{{"RMVBC_LIST_COL_STATUS" | translate}}').renderWith(function (data, type) {
        var x = "";
        if (data == 1) {
            x = '<p style="color:red;">{{"RMVBC_MSG_UNFINISHED" | translate}} </p>';
        };
        if (data == 2) {
            x = '<p style="color:green;">{{"RMVBC_MSG_FINISH" | translate}} </p>';
        };
        return x;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('note').withTitle('{{"RMVBC_LIST_COL_NOTE" | translate}}').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn("null").withTitle('{{"COM_LIST_COL_ACTION" | translate}}').notSortable()
        .renderWith(function (data, type, full, meta) {
            vm.selected[full.Id] = full;
            return '<a  ng-click="edit(selected[' + full.Id + '])" style="padding-right:10px;" title="Cập nhật thông tin"><i class="fa fa-edit" style="font-size:18px"></i></a><a ng-click="deleteItem(selected[' + full.Id + '])" style="padding-right:10px"  title="Xóa dịch vụ"><i class="fa fa-remove" style="font-size:18px" ></i></a>';
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

    $scope.reload = function () {
        reloadData(true);
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

    function edit(selected) {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit',
            backdrop: true,
            size: '60',
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
        $confirm({ text: caption.RMVBC_MSG_DELETE_CONFIRM, title: caption.COM_CONFIRM, ok: caption.COM_CONFIRM_OK, cancel: caption.COM_CONFIRM_CANCEL })
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

    $scope.deleteChecked = function () {
        var deleteItems = [];
        for (var id in $scope.selected) {
            if ($scope.selected.hasOwnProperty(id)) {
                if ($scope.selected[id]) {
                    deleteItems.push(id);
                }
            }
        }
        console.log("12a" + JSON.stringify(deleteItems));       
        if (deleteItems.length > 0) {
            $confirm({ text: caption.RMVBC_MSG_CHANGE_DELETE, ok: caption.RMVBC_CONFIRM_OK, cancel: caption.RMVBC_CONFIRM_CANCEL })
                .then(function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                    dataservice.deleteItems(deleteItems, function (rs) {
                        if (rs.Error) {
                            App.notifyDanger(rs.Title);
                        } else {
                            App.notifySuccess(rs.Title);
                            setTimeout(function () { $scope.reload() }, 1000);
                        }
                    });
                });
        } else {
            App.notifyDanger(caption.ERR_NOT_CHECKED.replace('{0}', caption.USER.toLowerCase()));
        }
    }
    $scope.contextMenu = [
        [function ($itemScope) {
            return '<i class="fa fa-edit"></i>{{"RMVBC_MSG_UPDATE_INFORMATION" | translate}}';
        }, function ($itemScope, $event, model) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/edit.html',
                controller: 'edit',
                backdrop: true,
                size: '80',
                resolve: {
                    para: function () {
                        return $itemScope.data.Id;
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
            return '<i class="fa fa-remove"></i> {{"RMVBC_MSG_DELETE" | translate}}';
        }, function ($itemScope, $event, model) {

            $confirm({ text: caption.RMVBC_DELETE_CONFIRM + $itemScope.data.name_book, title: caption.COM_CONFIRM, cancel: caption.COM_CONFIRM_CANCEL })
                .then(function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                    dataservice.delete($itemScope.data.Id, function (result) {
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
    $scope.typeC = [
        { value: "Chưa hoàn thành", status: 1 },
        { value: "Hoàn thành", status: 2 },

    ];
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, $filter) {

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.reload = function () {
        reloadData(true);
    }   

    $scope.submit = function () {        
        $scope.submit = function () {
            $confirm({ icon: '../../images/message/success.png', text: caption.RMVBC_ADD_MAINTENANCE, title: caption.COM_CONFIRM, cancel: caption.COM_CONFIRM_CANCEL })
                .then(function () {
                 
            console.log(JSON.stringify($scope.model))
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
    }
    $scope.initData = function () {
        dataservice.gettreedata(function (result) {

            $scope.treeData = result.Object;
            console.log('Tree Data: ' + JSON.stringify($scope.treeData));
        });
    }
    $scope.initData();

});
app.controller('edit', function ($scope, $rootScope, $compile, $confirm, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $uibModalInstance, para) {

    var vm = $scope;

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    $scope.model = {
        Key: para,
    }

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    //begin option table
    vm.dtOptions1 = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/RMVayxeBookChecking/table_Services",
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

    vm.dtColumns1 = [];
    vm.dtColumns1.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        })/*.withOption('sWidth', '30px')*/.withOption('sClass', 'tcenter'));

    //vm.dtColumns1.push(DTColumnBuilder.newColumn('guarder_code').withTitle('Mã bảo vệ').renderWith(function (data, type) {
    //    return data;
    //}));

    vm.dtColumns1.push(DTColumnBuilder.newColumn('service_name').withTitle('{{"RMVBC_LIST_COL_SERVICE_NAME" | translate}}').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns1.push(DTColumnBuilder.newColumn('note').withTitle('{{"RMVBC_LIST_COL_EDIT_NOTE" | translate}}').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns1.push(DTColumnBuilder.newColumn('status').withTitle('{{"RMVBC_LIST_COL_STATUS" | translate}}').renderWith(function (data, type) {
        var x = "";
        if (data == 1) {
            x = 'Hoàn thành'
        }
        if (data == 0) {
            x = 'Chưa hoàn thành'
        }
        return x;
    }));
    vm.dtColumns1.push(DTColumnBuilder.newColumn('created_time').withTitle('{{"RMVBC_LIST_COL_CREATED_TIME" | translate}}').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));

    vm.reloadData = reloadData;
    vm.dtInstance1 = {};
    function reloadData(resetPaging) {
        vm.dtInstance1.reloadData(callback, resetPaging);
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
        $confirm({ icon: '../../images/message/update.png', text: caption.RMVBC_UPDATE_MAINTENANCE, title: caption.COM_CONFIRM, cancel: caption.COM_CONFIRM_CANCEL })
            .then(function () {
               
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
    $scope.addServices = function () {
        //var modalInstance = $uibModal.open({
        //    animation: true,
        //    templateUrl: ctxfolder + '/add.html',
        //    controller: 'add',
        //    backdrop: true,
        //    size: '80'
        //});
        //modalInstance.result.then(function (d) {
        //    $scope.reload();
        //}, function () {
        //});

    }

   
    

});

