var ctxfolder = "/views/admin/rmRemoocX";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]).directive("filesInput", function () {
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
        formData.append("Code", data.Code != null ? data.Code : "");
        formData.append("Title", data.Title != null ? data.Title : "");
        formData.append("Barcode", data.Barcode != null ? data.Barcode : "");
        formData.append("InternalCode", data.InternalCode != null ? data.InternalCode : "");
        formData.append("Extrafield", data.Extrafield != null ? data.Extrafield : "");
        formData.append("Date_of_entry", data.Date_of_entry != null ? data.Date_of_entry : "");
        formData.append("Date_of_use", data.Date_of_use != null ? data.Date_of_use : "");
        formData.append("Generic", data.Generic != null ? data.Generic : "");
        formData.append("Origin", data.Origin != null ? data.Origin : "");
        formData.append("LisencePlate", data.LisencePlate != null ? data.LisencePlate : "");
        formData.append("Group", data.Group != null ? data.Group : "");
        formData.append("Note", data.Note != null ? data.Note : "");
        formData.append("Image", data.Image != null && data.Image.length > 0 ? data.Image[0] : null);


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
            submitFormUpload('/Admin/RMRemoocX/Insert', data, callback);
        },

        update: function (data, callback) {
            submitFormUpload('/Admin/RMRemoocX/update', data, callback);
        },
        getSumDistance: function (callback) {
            $http.post('/Admin/RMRemoocX/GetSumDistance').success(callback);;
        },

        getItem: function (data, callback) {
            $http.get('/Admin/RMRemoocX/getItem/' + data).success(callback);
        },
        GetItemDetail: function (data, callback) {
            $http.get('/Admin/RMRemoocX/GetItemDetail/' + data).success(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/RMRemoocX/DeleteItem/'+ data).success(callback);
        },
        activeItems: function (data, callback) {
            $http.post('/Admin/RMRemoocX/ActiveItems', data).success(callback);
        },
        getAll: function (callback) {
            $http.post('/Admin/RMRemoocX/getAll/').success(callback);
        },
        loadDepartment: function (callback) {
            $http.post('/Admin/RMRemoocX/GetAllType/').success(callback);
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
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, $cookies, $translate, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    $rootScope.validationOptions = {
        rules: {
            Code: {
                required: true,
                maxlength: 255
            },
            Title: {
                required: true,
                maxlength: 255
            },
          
          
            Note: {
                maxlength: 1000
            }


        },
        messages: {
            Code: {
                required: "Yêu cầu nhập biển số xe.",
                maxlength: "Không được nhập quá 255 kí tự"

            },
            Title: {
                required: "Yêu cầu nhập tên remooc.",
                maxlength: "Không được nhập quá 255 kí tự"
            },
           

            Note: {
                maxlength: "Không được nhập quá 1000 kí tự"
            }
            
        }
    }
    $rootScope.validationOptions1 = {
        rules: {
           
            Title: {
                required: true,
                maxlength: 255
            },
            Note: {
               
                maxlength: 1000
            },
            Code: {
                required: true,
                maxlength: 255
            }


        },
        messages: {
            Code: {
                required: "Yêu cầu nhập biển số xe.",
                maxlength: "Không được nhập quá 255 kí tự"

            },
            Title: {
                required: "Yêu cầu nhập tên remooc.",
                maxlength: "Không được nhập quá 255 kí tự"
            },

            Note: {
                
                maxlength: "Không được nhập quá 1000 kí tự"
            }
        }
    }
    var culture = $cookies.get('_CULTURE') || 'en-US';
    $translate.use(culture);

    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];

        $rootScope.checkData = function (data) {
            var parttern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{6,}/;
            if (parttern.test(data.Password)) {
                return { Status: false, Title: '' };
            } else {
                return { Status: true, Title: caption.VALIDATE_PASSWORD };
            }
        }
        $rootScope.StatusData = [{
            Value: true,
            Name: caption.ACTIVE
        }, {
            Value: false,
            Name: caption.INACTIVE
        }];
    });
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Language/Translation');
    //$translateProvider.preferredLanguage('en-US');
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

        .when('/detail/:id', {
            templateUrl: ctxfolder + '/detail.html',
            controller: 'detail'
        })
        .when('/add/', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
        })
        .when('/extrafield/', {
            templateUrl: ctxfolder + '/extrafield.html',
            controller: 'extrafield'
        })
         .when('/export/', {
            templateUrl: ctxfolder + '/export.html',
            controller: 'export'
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
app.controller('index', function ($scope, $rootScope, $filter, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice) {
    //$rootScope.$on('$translateChangeSuccess', function () {
    //});
    $scope.tong_so_km = 0;
    var vm = $scope;
    $scope.liAdd = [];
    $scope.model = {
        Code: '',
        Group: '',
        Flag_Delete:''
    };
    $scope.init = function () {

    }
    $scope.init();
    $('#tblResourceData tbody').on('click', 'tr', function () {
        // lấy id, chuyển detail
        console.log('ok')
    });

    $scope.selected = {};
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    vm.edit = edit;
    vm.info = info;
    vm.exportData = exportData;
    vm.history = history;
    vm.deleteItem = deleteItem;
    vm.activeItem = activeItem;

    //#region
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/RMRemoocX/jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Code = $scope.model.Code;
                d.Group = $scope.model.Group;
                d.Flag_Delete = $scope.model.Flag_Delete;
                //d.GroupUser = $scope.model.GroupUser == 0 ? [] : ([$scope.model.GroupUser.Id]);
                //d.Role = $scope.model.Role == '' ? '' : ($scope.model.Role.Id);

                $scope.liAdd = [];
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
        .withOption('order', [3, 'asc'])
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
            //$compile(angular.element(row).find('input'))($scope);
            $compile(angular.element(row).contents())($scope);

            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm.dtColumns = [];
    //vm.dtColumns.push(DTColumnBuilder.newColumn("_STT").withTitle(titleHtml).notSortable()
    //    .renderWith(function (data, type, full, meta) {
    //        $scope.selected[full._STT] = false;
    //        $scope.addId(full);
    //        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full._STT + ']" ng-click="toggleOne(selected)"/><span style="height:15px; width:15px;"></span></label>';
    //    }).withOption('sWidth', '30px').withOption('sClass', 'tcenter'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Flag_Delete').withTitle('Trạng thái').renderWith(function (data, type, full, meta) {
        var x = "";
        if (data == "True") {
            x = '<img src="../../images/romooc/romooc_offline.png" alt=”animated”  style="width: 40px;" />';
        }
        if (data == "False") {
            x = '<img src="../../images/romooc/romooc_online.gif" alt=”animated” style="width: 40px;"/>';

        }
        return x;
    }).withOption('sWidth', '50px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LisencePlate').withTitle('Mã romooc').renderWith(function (data, type, full, meta) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }).withOption('sWidth', '100px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Group').withTitle('Nhóm').renderWith(function (data, type) {
        if (data == "NHOM_1")
            return "Nhóm 1";
        if (data == "NHOM_2")
            return "Nhóm 2";
        if (data == "NHOM_3")
            return "Nhóm 3";
        if (data == "NHOM_4")
            return "Nhóm 4";
        if (data == "NHOM_5")
            return "Nhóm 5";

    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Current_position_text').withTitle('Vị trí hiện tại').renderWith(function (data, type, full, meta) {
        if (data == 'null' || data == 'undefined')
            return '';
        else

            return  data ;
    }).withOption('sWidth', '250px'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('ParkingName').withTitle('Bãi xe').renderWith(function (data, type, full, meta) {
    //    if (data == 'null' || data == 'undefined')
    //        return '';
    //    else

    //        return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Position_time').withTitle('Tại thời điểm').renderWith(function (data, type, full, meta) {
        return data;
    }));


    //vm.dtColumns.push(DTColumnBuilder.newColumn('Position_gps').withTitle('GPS').renderWith(function (data, type, full, meta) {
    //    return data;
    //}).withOption('sWidth', '175px'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('Tên gọi').renderWith(function (data, type, full, meta) {
    //    return data;
    //}).withOption('sWidth', '120px'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('InternalCode').withTitle('Mã nội bộ').renderWith(function (data, type, full, meta) {
    //    return data;
    //}).withOption('sWidth', '75px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn("Image").withTitle('Hình ảnh').renderWith(function (data, type, full, meta) {
        var dt = '<img style="width:64px; height:64px" src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/romooc/no_image.png' + '"' + "'" + ' class="img-responsive">';
        console.log(dt);
        return dt;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SumDistance').withTitle('Tổng số(km)').renderWith(function (data, type) {
        return data / 1000;
    }).withOption('sWidth', '50px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Flag').withTitle('Trạng thái romooc').renderWith(function (data, type, full, meta) {
        var x = "";
        if (data == 0) {
            x = '<span class="text-danger">Không kích hoạt</span>';
        }
        if (data == 1) {
            x = '<span class="text-success">Kích hoạt</span>';
        }
        return x;
    }).withOption('sWidth', '50px'));
   
    
    vm.dtColumns.push(DTColumnBuilder.newColumn("null").withTitle('Tác vụ').notSortable()
        .renderWith(function (data, type, full, meta) {
            vm.selected[full.Id] = full;
            if (full.Flag == 0) {
                return '<a  ng-click="edit(selected['
                    + full.Id + '])" style="padding-right:3px;" title="Cập nhật thông tin"><i class="fa fa-edit" style="font-size:18px"></i></a><a ng-click="activeItem(selected['
                    + full.Id + '])"   title="Mở trạng thái" style="padding-right:3px"><i class="fa fa-unlock" style="font-size:18px" ></i></a><a ng-click="exportData(selected['
                    + full.Id + '])"   title="Tải xuống"><i class="glyphicon glyphicon-download-alt" style="font-size:18px" ></i></a>';}
            else {
                return '<a  ng-click="edit(selected['
                    + full.Id + '])" style="padding-right:3px;" title="Cập nhật thông tin"><i class="fa fa-edit" style="font-size:18px"></i></a><a ng-click="deleteItem(selected['
                    + full.Id + '])"   title="Khóa trạng thái" style="padding-right:3px"><i class="fa fa-lock" style="font-size:18px" ></i></a><a ng-click="exportData(selected['
                    + full.Id + '])"   title="Tải xuống"><i class="glyphicon glyphicon-download-alt" style="font-size:18px" ></i></a>';
            }
           
        }).withOption('sPadding', '15px 0 0;').withOption('sClass', 'nowrap'));

   // exportData
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
    $scope.names1 = [
        { value: "Nhóm 1", group_id: "NHOM_1" },
        { value: "Nhóm 2", group_id: "NHOM_2" },
        { value: "Nhóm 3", group_id: "NHOM_3" },
        { value: "Nhóm 4", group_id: "NHOM_4" },
        { value: "Nhóm 5", group_id: "NHOM_5" }
    ];
    $scope.names2 = [
        { value: "Hoạt động", group_id: "false" },
        { value: "Không hoạt động", group_id: "true" }
       
    ];

    function history(selected) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/history.html',
            controller: 'history',
            backdrop: true,
            size: '80',
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
    function deleteItem(selected) {
        $confirm({ icon:'../../images/message/lockscreen.png', text: 'Bạn có chắc chắn muốn khóa trạng thái khoản mục đã chọn?', title: 'Xác nhận', ok: 'Chắc chắn', cancel: ' Hủy ' })
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
                       // $scope.reload();
                    }
                });
                App.unblockUI("#contentMain");

            });
    }

    function activeItem(selected) {
        $confirm({ icon:'../../images/message/unlock-icon.png', text: 'Bạn có chắc chắn muốn mở khóa trạng thái khoản mục đã chọn?', title: 'Xác nhận', ok: 'Chắc chắn', cancel: ' Hủy ' })
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
    function info(selected) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/detail.html',
            controller: 'detail',
            backdrop: true,
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
    function exportData(selected) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/export.html',
            controller: 'export',
            backdrop: true,
            size: '35',
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
    $scope.addId = function (data) {
        for (var i = 0; i < $scope.liAdd.length; i++) {
            if ($scope.liAdd[i] == data.Id) {
                return;
            }
        }
        $scope.liAdd.push(data);
    }
    $scope.reload = function () {
        reloadData(true);
    }
    //#endregion

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: true,
            size: '65'
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
            size: '65',
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

    $scope.deactive = function () {
        var deactiveItems = [];
        for (var id in $scope.selected) {
            if ($scope.selected.hasOwnProperty(id)) {
                if ($scope.selected[id]) {
                    deactiveItems.push(id);
                }
            }
        }
        var deactiveItemsId = [];
        for (var i = 0; i < deactiveItems.length; i++) {
            deactiveItemsId.push($scope.liAdd[parseInt(deactiveItems[i]) - 1]);
        }
        var deactiveListId = [];
        for (var j = 0; j < deactiveItemsId.length; j++) {
            deactiveListId.push(deactiveItemsId[j].Id);
        }

        if (deactiveItemsId.length > 0) {
            $confirm({ text: "Bạn có muốn thay đổi trạng thái không?", ok: "Có", cancel: "Không" })
                .then(function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                    dataservice.deleteItems(deactiveListId, function (rs) {
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


    //$scope.contextMenu = [
    //    [function ($itemScope) {
    //        return "<i class='fa fa-edit'></i> Thông tin chi tiết Romooc";
    //    }, function ($itemScope, $event, model) {
    //        var modalInstance = $uibModal.open({
    //            animation: true,
    //            templateUrl: ctxfolder + '/detail.html',
    //            controller: 'detail',
    //            backdrop: true,
    //            size: 'lg',
    //            resolve: {
    //                para: function () {
    //                    return $itemScope.data;           
    //                }
    //            }
    //        });
    //        modalInstance.result.then(function (d) {
    //            $scope.reload();
    //        }, function () {
    //        });
    //    }, function ($itemScope, $event, model) {
    //        return true;
    //    }],
    //    [function ($itemScope) {
    //        return "<i class='fa fa-edit'></i> Cập nhật thông tin Romooc";
    //    }, function ($itemScope, $event, model) {
    //        var modalInstance = $uibModal.open({
    //            animation: true,
    //            templateUrl: ctxfolder + '/edit.html',
    //            controller: 'edit',
    //            backdrop: true,
    //            size: 'lg',
    //            resolve: {
    //                para: function () {
    //                    return $itemScope.data;

    //                }
    //            }
    //        });
    //        modalInstance.result.then(function (d) {
    //            $scope.reload();
    //        }, function () {
    //        });
    //    }, function ($itemScope, $event, model) {
    //        return true;
    //    }],
    //    [function ($itemScope) {
    //        return "<i class='fa fa-edit'></i> Lịch sử hành trình Romooc";
    //    }, function ($itemScope, $event, model) {
    //        var modalInstance = $uibModal.open({
    //            animation: true,
    //            templateUrl: ctxfolder + '/history.html',
    //            controller: 'history',
    //            backdrop: true,
    //            size: 'lg',
    //            resolve: {
    //                para: function () {
    //                    return $itemScope.data;
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

    setTimeout(function () {
        var defaultBounds1 = new google.maps.LatLngBounds(new google.maps.LatLng(-33.8902, 151.1759), new google.maps.LatLng(-33.8474, 151.2631));
        var options1 = {
            bounds: defaultBounds1,
            types: ['geocode']
        };
        var autocomplete1 = new google.maps.places.Autocomplete(document.getElementById('endPlace'), options1);

        google.maps.event.addListener(autocomplete1, 'place_changed', function () {

            var place1 = autocomplete1.getPlace();
            $scope.Endlatt = place1.geometry.location.lat();
            $scope.Endlngt = place1.geometry.location.lng();
            $scope.model.Position_gps = $scope.Endlatt + "," + $scope.Endlngt;
            $scope.$apply();
            
            $scope.model.Position_text = place1.formatted_address;
        });
        showHideSearch();
    }, 100)

    $scope.search = function () {
        reloadData(true);
    }
    $scope.getSumDistance = function () {
        dataservice.getSumDistance(function (rs) {
            // $scope.tong_so_km = 10;
            $scope.tong_so_km = rs.Object / 1000;

        });
    }
    $scope.getSumDistance();
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
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice) {
    $scope.names1 = [
        { value: "Nhóm 1", group_id: "NHOM_1" },
        { value: "Nhóm 2", group_id: "NHOM_2" },
        { value: "Nhóm 3", group_id: "NHOM_3" },
        { value: "Nhóm 4", group_id: "NHOM_4" },
        { value: "Nhóm 5", group_id: "NHOM_5" }
    ];
    $scope.model = {
        TempSub: {
            IdI: [],
            IdS: [],
        },
        VIBUserInGroups: [],
        AspNetUserRoles: [],
        Organizations: 0,
        Active: true,
        Code: '',
        Title: '',
        Barcode: '',
        Date_of_entry: '',
        Date_of_use: '',
        Generic: '',
        Origin: '',
        Extrafield:''
    };
    dataservice.loadDepartment(function (rs) {
        if (rs.Error) { }
        else {
            $scope.liDepartment = rs;
            console.log("All Type" + JSON.stringify($scope.liDepartment));
        }
    });
    $scope.initData = function () {
    }
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.submit = function () {
        $confirm({ icon: '../../images/message/success.png', text: 'Bạn có chắc chắn thêm mới romooc ?', title: 'Xác nhận', cancel: ' Hủy ' })
            .then(function () {
               
                if ($scope.addform.validate()) {
                    if ($scope.model.Group == "" || $scope.model.Group == null) {
                        App.notifyDanger("Vui lòng chọn nhóm");
                        return;
                    }
                    if ($scope.model.Code != null && $scope.model.Code != "") {
                        console.log("All Type" + JSON.stringify($scope.model));
                        var fileName = $('input[type=file]').val();
                        var idxDot = fileName.lastIndexOf(".") + 1;
                        var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
                        console.log('Name File: ' + extFile);
                        if (extFile != "") {
                            if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                                App.notifyDanger("Chọn file có đuôi png, jpg, jpeg, gif, bmp!");
                            } else {
                                var fi = document.getElementById('file');
                                var fsize = (fi.files.item(0).size) / 1024;
                                if (fsize > (1024)) {
                                    App.notifyDanger("Độ lớn của file không quá 1 MB !");
                                } else {
                                    var fileUpload = $("#file")[0];
                                    var reader = new FileReader();
                                    reader.readAsDataURL(fileUpload.files[0]);
                                    reader.onload = function (e) {
                                        //Initiate the JavaScript Image object.
                                        var image = new Image();
                                        //Set the Base64 string return from FileReader as source.
                                        image.src = e.target.result;
                                        image.onload = function () {
                                            //Determine the Height and Width.
                                            var height = this.height;
                                            var width = this.width;
                                            if (width > 1000 || height > 1000) {
                                                App.notifyDanger("Kích thước file không quá (1000px x 1000px)!");
                                            } else {
                                                console.log('Click')
                                                dataservice.insert($scope.model, function (rs) {
                                                    if (rs.Error) {
                                                        App.notifyDanger(rs.Title);
                                                    } else {
                                                        App.notifySuccess(rs.Title);
                                                        $uibModalInstance.close();
                                                    }
                                                });
                                            }
                                        };
                                    }
                                }
                            }
                        }
                        else {
                            console.log('Click else')
                            dataservice.insert($scope.model, function (rs) {
                                if (rs.Error) {
                                    App.notifyDanger(rs.Title);
                                } else {
                                    App.notifySuccess(rs.Title);
                                    $uibModalInstance.close();
                                }
                            });
                        }
                    }
                    else {
                        App.notifyDanger("Không được bỏ trống biển số xe");
                    }
                }
            

            });
       
    }
});


app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para) {
    console.log("All Type" + para.Id);
    console.log("All Type" + JSON.stringify(para));
    $scope.names1 = [
        { value: "Nhóm 1", group_id: "NHOM_1" },
        { value: "Nhóm 2", group_id: "NHOM_2" },
        { value: "Nhóm 3", group_id: "NHOM_3" },
        { value: "Nhóm 4", group_id: "NHOM_4" },
        { value: "Nhóm 5", group_id: "NHOM_5" }
    ];

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.TempSub = {
        IdI: [],
        IdS: [],
    };
    $scope.TempSubTemp = {
        IdI: [],
        IdS: [],
    };
    $scope.model = {
        TempSub: {
            IdI: [],
            IdS: [],
        },
        //  OrgId: 0,
        // VIBUserInGroups: [],
        // AspNetUserRoles: [],
        //Organizations: 0,
    };
    $scope.initData = function () {
        dataservice.loadDepartment(function (rs) {
            if (rs.Error) { }
            else {
                $scope.liDepartment = rs;
                //console.log("All Type" + JSON.stringify($scope.liDepartment));
            }
        });
        dataservice.getItem(para.Id, function (rs) {
            if (rs.Error) {
                App.notifyDanger(rs.Title);
            } else {
                console.log('url: ' + rs.Image);
                $scope.model = rs[0];
                console.log('Data details: ' + JSON.stringify(rs))
                $scope.model.TempSub = {
                    IdI: [],
                    IdS: [],
                };

            }
        });
    }
    $scope.initData();
    $scope.submit = function () {
        $confirm({ icon: '../../images/message/update.png', text: 'Bạn có chắc chắn cập nhật thông tin của đầu kéo?', title: 'Xác nhận', cancel: ' Hủy ' })
            .then(function () {
               
                if ($scope.editform.validate()) {
                    if ($scope.model.Group == "" || $scope.model.Group == null) {
                        App.notifyDanger("Vui lòng chọn nhóm");
                        return;
                    }
                    var fileName = $('input[type=file]').val();
                    var idxDot = fileName.lastIndexOf(".") + 1;
                    var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
                    console.log('Name File: ' + extFile);
                    if (extFile != "") {
                        if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                            App.notifyDanger("Chọn file có đuôi png, jpg, jpeg, gif, bmp!");
                        } else {
                            var fi = document.getElementById('file');
                            var fsize = (fi.files.item(0).size) / 1024;
                            if (fsize > (1024)) {
                                App.notifyDanger("Độ lớn file không quá 1 MB !");
                            } else {
                                var fileUpload = $("#file")[0];
                                var reader = new FileReader();
                                reader.readAsDataURL(fileUpload.files[0]);
                                reader.onload = function (e) {
                                    //Initiate the JavaScript Image object.
                                    var image = new Image();
                                    //Set the Base64 string return from FileReader as source.
                                    image.src = e.target.result;
                                    image.onload = function () {
                                        //Determine the Height and Width.
                                        var height = this.height;
                                        var width = this.width;
                                        if (width > 1000 || height > 1000) {
                                            App.notifyDanger("Kích thước file không quá (1000px x 1000px)!");
                                        } else {

                                            dataservice.update($scope.model, function (rs) {
                                                if (rs.Error) {
                                                    App.notifyDanger(rs.Title);
                                                } else {
                                                    App.notifySuccess(rs.Title);
                                                    $uibModalInstance.close();
                                                }
                                            });
                                        }
                                    };
                                }
                            }
                        }
                    }
                    else {
                        console.log('Click else')
                        dataservice.update($scope.model, function (rs) {
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
    }
});

app.controller('detail', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para) {

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.TempSub = {
        IdI: [],
        IdS: [],
    };
    $scope.TempSubTemp = {
        IdI: [],
        IdS: [],
    };
    $scope.model = {
        TempSub: {
            IdI: [],
            IdS: [],
        },
        //  OrgId: 0,
        // VIBUserInGroups: [],
        // AspNetUserRoles: [],
        //Organizations: 0,
    };

    $scope.initData = function () {

        dataservice.GetItemDetail(para.Id, function (rs) {
            if (rs.Error) {
                App.notifyDanger(rs.Title);
            } else {
                datas = JSON.parse(rs.FieldValue)
                $scope.model = rs;
                $scope.model.CreateDate = rs.CreateDate != null ? rs.CreateDate : "";
                $scope.model.Date_of_entry = rs.Date_of_entry != null ? rs.Date_of_entry : "";
                $scope.model.Date_of_use = rs.Date_of_use != null ? rs.Date_of_use : "";
                $scope.model.Origin = rs.Origin != null ? rs.Origin : "";
                $scope.model.Generic = rs.Generic != null ? rs.Generic : "";
                $scope.model.LisencePlate = rs.LisencePlate != null ? rs.LisencePlate : "";
                $scope.model.Code = rs.Code != null ? rs.Code : "";
                $scope.model.Title = rs.Title != null ? rs.Title : "";
                $scope.modelex = datas;
                console.log("All Type" + JSON.stringify(datas));
                //$scope.model.FullName = $scope.model.GivenName + " " + $scope.model.FamilyName;
                $scope.model.TempSub = {
                    IdI: [],
                    IdS: [],
                };

            }
        });
    }
    $scope.initData();

});


app.controller('extrafield', function ($scope, $rootScope, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, $uibModalInstance) {

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    var vm = $scope;
    $scope.liAdd = [];
    $scope.model = {
        Code: ''
    };
    $scope.init = function () {

    }
    $scope.init();

    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/RMRemoocX/jtableRemoocAcitve",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {


                $scope.liAdd = [];
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
        .withOption('order', [3, 'asc'])
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
            $compile(angular.element(row).find('input'))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn('Code').withTitle('Mã Remooc').withOption('sWidth', '60px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Position_text').withTitle('Vị trí').withOption('sClass', 'mw70'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Position_gps').withTitle('GPS').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Position_parking').withTitle('Vị trí đỗ').renderWith(function (data, type, full, meta) {
        return data;
    }));

    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }
});


app.controller('history', function ($scope, $rootScope, $filter, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, para, $uibModalInstance) {
    //$rootScope.$on('$translateChangeSuccess', function () {
    //});

    console.log(para.Code);

    var vm = $scope;
    $scope.liAdd = [];
    $scope.model = {
        Code: para.Code
    };
    $scope.init = function () {

    }
    $scope.init();

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    //#region
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';

    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/RMRemoocX/jtablehistory",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Code = $scope.model.Code;

                //d.GroupUser = $scope.model.GroupUser == 0 ? [] : ([$scope.model.GroupUser.Id]);
                //d.Role = $scope.model.Role == '' ? '' : ($scope.model.Role.Id);

                $scope.liAdd = [];
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
        .withOption('order', [3, 'asc'])
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
            $compile(angular.element(row).find('input'))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("_STT").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full._STT] = false;
            $scope.addId(full);
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full._STT + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withTitle('ID').withOption('sWidth', '60px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Trip_Code').withTitle('Mã chuyến đi').withOption('sClass', 'mw70'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Code').withTitle('Mã đầu kéo').renderWith(function (data, type, full, meta) {

        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Start_position_time').withTitle('Thời gian bắt đầu').renderWith(function (data, type, full, meta) {

        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('End_position_time').withTitle('Thời gian kết thúc').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Start_position_text').withTitle('Địa điểm bắt đầu').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('End_position_text').withTitle('Thời gian kết thúc').renderWith(function (data, type, full, meta) {
        return data;
    }));

    //vm.dtColumns.push(DTColumnBuilder.newColumn('Active').withTitle('{{"STATUS" | translate}}').renderWith(function (data, type) {
    //    return data == "True" ? '{{"ACTIVE" | translate}}' : '{{"INACTIVE" | translate}}';
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
    $scope.addId = function (data) {
        for (var i = 0; i < $scope.liAdd.length; i++) {
            if ($scope.liAdd[i] == data.Id) {
                return;
            }
        }
        $scope.liAdd.push(data);
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
});


app.controller('export', function ($scope, $rootScope, $filter, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, para, $uibModalInstance, $location) {
    console.log(para);
    $scope.model = {
        startDate: '',
        endDate:''
    }
    $scope.export = function () {
        $confirm({ icon: '../../images/message/export.png', text: 'Bạn có chắc chắn export excel?', title: 'Xác nhận', cancel: ' Hủy ' })
            .then(function () {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
                location.href = "/Admin/RMRemoocX/ExportRomooc/?remoocCode=" + para.LisencePlate + "&startTime=" + $scope.model.startDate + "&endTime=" + $scope.model.endDate;
                $uibModalInstance.dismiss('cancel');
                App.unblockUI("#contentMain");
            });
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
});

