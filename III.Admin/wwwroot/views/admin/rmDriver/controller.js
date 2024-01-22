var ctxfolder = "/views/admin/rmDriver";
var ctxfolderMessage = "/views/messageBox";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]).
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
app.filter('propsFilter', function () {
    return function (items, props) {
        var out = [];

        if (angular.isArray(items)) {
            var keys = Object.keys(props);

            items.forEach(function (item) {
                var itemMatches = false;

                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                        itemMatches = true;
                        break;
                    }
                }

                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    };
});
app.factory('dataservice', function ($http) {
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
        formData.append("Id_Fb", data.Id_Fb != null ? data.Id_Fb : "");
        formData.append("Company_Code", data.Company_Code != null ? data.Company_Code : "");
        formData.append("Name", data.Name != null ? data.Name : "");
        formData.append("Email", data.Email != null ? data.Email : "");
        formData.append("Phone", data.Phone != null ? data.Phone : "");
        formData.append("Password", data.Password != null ? data.Password : "");
        formData.append("Type_Admin/RMDriver", data.Type_Admin/RMDriver != null ? data.Type_Admin/RMDriver : "");
        formData.append("License_plate", data.License_plate != null ? data.License_plate : "");
        formData.append("Taxy_type", data.Taxy_type != null ? data.Taxy_type : "");
        formData.append("virual_intiary", data.virual_intiary != null ? data.virual_intiary : "");
        formData.append("Group", data.Group != null ? data.Group : "");
        formData.append("type_car_year", data.type_car_year != null ? data.type_car_year : "");
        formData.append("emei", data.emei != null ? data.emei : null || "");
        formData.append("Description", data.Description != null ? data.Description : "");
        formData.append("Brand", data.Brand != null ? data.Brand : null || "");
        debugger
        formData.append("is_Online", data.is_Online != null ? data.is_Online : null || "");
        formData.append("Profile_Picture", data.Profile_Picture != null && data.Profile_Picture.length > 0 ? data.Profile_Picture[0] : null);
        formData.append("Image_car", data.Image_car != null && data.Image_car.length > 0 ? data.Image_car[0] : null);
        formData.append("License_car_image", data.License_car_image != null && data.License_car_image.length > 0 ? data.License_car_image[0] : null);
        formData.append("Identification", data.Identification != null ? data.Identification : "");

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
            submitFormUpload('/Admin/RMDriver/InsertAdmin/RMDriver', data, callback);
        },
        getGroup: function (data, callback) {

            $http.post('/Admin/RMDriver/GetRomoocByGroup?group=' + data).success(callback);
        },
        getGroupAll: function (data, callback) {
            $http.post('/Admin/RMDriver/GetRomoocByGroupAll?group=' + data.Group + "&tractor_code=" + data.License_plate).success(callback);
        },


        insert_NV: function (data, callback) {
            $http.post('/Admin/RMDriver/InsertNV/' + data).success(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/RMDriver/GetItem/' + data).success(callback);
        },
        getAll: function (callback) {
            $http.post('/remoocX/getAll/').success(callback);
        },
        update: function (data, callback) {

            submitFormUpload('/Admin/RMDriver/Update', data, callback);
        },
        deleteItems: function (data, callback) {
            $http.post('/Admin/RMDriver/DeleteItems/' + data).success(callback);
        },
        Update_Itinerary: function (data, callback) {

            $http.post('/Admin/RMDriver/Update_Itinerary', data).success(callback);
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

    var culture = $cookies.get('_CULTURE') || 'en-US';
    $translate.use(culture);
    $rootScope.validationOptions = {
        rules: {
            Phone: {
                required: true,
                maxlength: 255
            },
            Name: {
                required: true,
                maxlength: 255
            },

            Description: {

                maxlength: 500
            }


        },
        messages: {
            Phone: {
                required: "Yêu cầu nhập số điện thoại.",
                maxlength: "Không vượt quá 10 ký tự."
            },
            Name: {
                required: "Yêu cầu nhập tên tài xế.",
                maxlength: "Không vượt quá 255 ký tự."
            },

            Description: {

                maxlength: "Không vượt quá 500 ký tự."
            }


        }
    }
    $rootScope.validationOptions1 = {
        rules: {
            Phone: {
                required: true,
                maxlength: 255
            },
            Name: {
                required: true,
                maxlength: 255
            },
            Group: {
                required: true,
                maxlength: 255
            },
            Description: {

                maxlength: 500
            }

        },
        messages: {
            Phone: {
                required: "Yêu cầu nhập số điện thoại.",
                maxlength: "Không vượt quá 10 ký tự."
            },
            Name: {
                required: "Yêu cầu nhập tên tài xế.",
                maxlength: "Không vượt quá 255 ký tự."
            },

            Description: {

                maxlength: "Không vượt quá 500 ký tự."
            }


        }
    }
    $rootScope.checkData = function (data) {
        var numbers = /^[0-9]+$/;
        if (data.Phone == "" || data.Phone == undefined || numbers.test(data.Phone)) {
            return { Status: false, Title: '' };
        } else {
            return { Status: true, Title: 'Vui lòng nhập số ở trường này' };
        }
    }
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
        .when('/add/', {
            templateUrl: ctxfolder + '/add1.html',
            controller: 'add'
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
app.controller('index', function ($scope, $rootScope, $filter, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate) {
    //$rootScope.$on('$translateChangeSuccess', function () {
    //});
    $scope.names2 = [
        { value: "Hoạt động", group_id: "1" },
        { value: "Không hoạt động", group_id: "0" }

    ];
    $scope.names1 = [
        { value: "Nhóm 1", group_id: "NHOM_1" },
        { value: "Nhóm 2", group_id: "NHOM_2" },
        { value: "Nhóm 3", group_id: "NHOM_3" },
        { value: "Nhóm 4", group_id: "NHOM_4" },
        { value: "Nhóm 5", group_id: "NHOM_5" }
    ];
    var vm = $scope;
    $scope.liAdd = [];
    $scope.model = {
        Phone: '',
        Is_online: '',
        Group: '',
    };
    $scope.init = function () {

    }
    $scope.init();

    $scope.selected = {};
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    vm.edit = edit;
    vm.additem = additem;
    vm.active = active;
    //#region
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/RMDriver/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Phone = $scope.model.Phone;
                d.Group = $scope.model.Group;
                d.Is_online = $scope.model.Is_online;
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
            $compile(angular.element(row).contents())($scope);

            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('').withOption('sClass', 'tcenter hidden').withOption('sWidth', '175px').renderWith(function (data, type, full, meta) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Is_online').withTitle('Trạng thái online').renderWith(function (data, type, full, meta) {
        var x = "";
        if (data == "1") {
            x = '<img src="../../images/romooc/driver_online.gif" alt=”animated”  style="width: 40px;" />';
        }
        if (data == "0") {
            x = '<img src="../../images/romooc/driver_ofline.png" alt=”animated” style="width: 40px;"/>';

        }
        return x;
    }).withOption('sWidth', '50px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('Name').withOption('sClass', 'tcenter').withOption('sWidth', '175px').renderWith(function (data, type, full, meta) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Phone').withTitle('Phone').withOption('sClass', 'mw70').withOption('sClass', 'tcenter').withOption('sWidth', '130px').renderWith(function (data, type, full, meta) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Email').withTitle('Email').withOption('sClass', 'tcenter').withOption('sWidth', '255px').renderWith(function (data, type, full, meta) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Group').withTitle('Nhóm').withOption('sClass', 'tcenter').withOption('sWidth', '50px').renderWith(function (data, type, full, meta) {
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
    vm.dtC
    vm.dtColumns.push(DTColumnBuilder.newColumn('Profile_Picture').withTitle('Ảnh').renderWith(function (data, type) {
        return '<img  height="65" width="65" src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/romooc/no_image.png' + '"' + "'" + ' class="img-responsive">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Active').withTitle('Trạng thái').withOption('sClass', 'tcenter').renderWith(function (data, type, full, meta) {
        var x = "";
        if (data == 1) {
            x = '<span class="text-success">Kích hoạt</span>';
        }
        if (data == 0) {
            x = '<span class="text-danger">Không kích hoạt</span>';
        }
        return x;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('null').withTitle('Tác vụ').renderWith(function (data, type, full, meta) {
        vm.selected[full.Id] = full;
        if (full.Active == 1) {
            return '<label style ="margin-top:0px"><a ng-click="edit(selected[' + full.Id + '])" style="padding-right:5px;" title="Cập nhật thông tin"><i class="fa fa-edit" style="font-size:20px"></i></a><a ng-click="additem(selected[' + full.Id + '])" style="padding-right:5px"  title="Thêm nhân viên"><i class="fa fa-plus" style="font-size:20px" ></i></a><a ng-click="active(selected[' + full.Id + '])" style="padding-right:0px;" title="Khóa tài xế này"><i class="fa fa-lock" style="font-size:20px"></i></a></label>';
        }
        else {
            return '<label style ="margin-top:0px"><a ng-click="edit(selected[' + full.Id + '])" style="padding-right:5px;" title="Cập nhật thông tin"><i class="fa fa-edit" style="font-size:20px"></i></a><a ng-click="additem(selected[' + full.Id + '])" style="padding-right:5px"  title="Thêm nhân viên"><i class="fa fa-plus" style="font-size:20px" ></i></a><a ng-click="active(selected[' + full.Id + '])" style="padding-right:0px;" title="Mở khóa"><i class="fa fa-unlock" style="font-size:20px"></i></a></label>';
        }
    }).withOption('sWidth', '100px').withOption('sClass', 'tcenter'));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }
    $scope.updateImage = function (data) {
        data.removeAttribute('src');
        data.setAttribute('src', '/images/avatar_default.png');
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
    //#endregion

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            backdrop: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            size: '70'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
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

    function additem(selected) {

        $confirm({ icon: '../../images/message/success.png', text: 'Bạn có chắc chắn thêm: ' + selected.Name, title: 'Xác nhận', cancel: ' Hủy ' })
            .then(function () {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });

                dataservice.insert_NV(selected.Id, function (result) {
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

    function active(selected) {
        icon = '';
        if (selected.Active == 1) {
            icon = '../../images/message/lockscreen.png';
        }
        else {
            icon = '../../images/message/unlock-icon.png';
        }
        $confirm({ icon: icon, text: 'Bạn có muốn thay đổi trạng thái cho tài xế này không?', title: 'Xác nhận', cancel: ' Hủy ' })
            .then(function () {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });

                dataservice.deleteItems(selected.Id, function (result) {
                    if (result.Error) {
                        App.notifyDanger(result.Title);
                    } else {
                        App.notifySuccess(result.Title);
                        $scope.reload();
                    }
                    App.unblockUI("#contentMain");
                });
            });
        //var modalInstance = $uibModal.open({
        //    templateUrl: ctxfolderMessage + '/messageConfirmAdd.html',
        //    windowClass: "message-center",
        //    controller: function ($scope, $uibModalInstance) {
        //        $scope.message = "Bạn có muốn thay đổi trạng thái cho tài xế này không ?";
        //        $scope.ok = function () {
        //            dataservice.deleteItems(selected.Id, function (rs) {
        //                if (rs.Error) {
        //                    App.notifyDanger(rs.Title);
        //                } else {
        //                    App.notifySuccess(rs.Title);
        //                    $uibModalInstance.close();
        //                }
        //            });
        //        };

        //        $scope.cancel = function () {
        //            $uibModalInstance.dismiss('cancel');
        //        };
        //    },
        //    size: '25',
        //});
        //modalInstance.result.then(function (d) {
        //    $scope.reload();
        //}, function () {
        //});


    }

    //$scope.active = function () {
    //    var activeItems = [];
    //    for (var id in $scope.selected) {
    //        if ($scope.selected.hasOwnProperty(id)) {
    //            if ($scope.selected[id]) {
    //                activeItems.push(id);
    //            }
    //        }
    //    }
    //    var activeItemsId = [];
    //    for (var i = 0; i < activeItems.length; i++) {
    //        activeItemsId.push($scope.liAdd[parseInt(activeItems[i]) - 1]);
    //    }
    //    var activeListId = [];
    //    for (var j = 0; j < activeItemsId.length; j++) {
    //        activeListId.push(activeItemsId[j].Id);
    //    }

    //    if (activeItemsId.length > 0) {
    //        $confirm({ text: "Bạn có muốn thay đổi trạng thái cho tài xế này không?", ok: "Có", cancel: "Không" })
    //            .then(function () {
    //                App.blockUI({
    //                    target: "#contentMain",
    //                    boxed: true,
    //                    message: 'loading...'
    //                });
    //                dataservice.deleteItems(activeListId, function (rs) {
    //                    if (rs.Error) {
    //                        App.notifyDanger(rs.Title);
    //                    } else {
    //                        App.notifySuccess(rs.Title);
    //                        setTimeout(function () { $scope.reload() }, 1000);
    //                    }
    //                });
    //            });
    //    } else {
    //        App.notifyDanger(caption.ERR_NOT_CHECKED.replace('{0}', caption.USER.toLowerCase()));
    //    }
    //}
    //$scope.contextMenu = [
    //    [function ($itemScope) {
    //        return "<i class='fa fa-edit'></i> Chi tiết tài xế";
    //    }, function ($itemScope, $event, model) {
    //        var modalInstance = $uibModal.open({
    //            animation: true,
    //            templateUrl: ctxfolder + '/edit.html',
    //            controller: 'edit',
    //            backdrop: true,
    //            size: 'lg',
    //            resolve: {
    //                para: function () {
    //                    console.log('Data: ' + JSON.stringify($itemScope.data))
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
    //        return '<i class="fa fa-remove"></i> Thêm vào nhân viên';
    //    }, function ($itemScope, $event, model) {

    //        $confirm({ text: 'Bạn có chắc chắn thêm: ' + $itemScope.data.Name, title: 'Xác nhận', cancel: ' Hủy ' })
    //            .then(function () {
    //                App.blockUI({
    //                    target: "#contentMain",
    //                    boxed: true,
    //                    message: 'loading...'
    //                });

    //                dataservice.insert_NV($itemScope.data.Id, function (result) {
    //                    if (result.Error) {
    //                        App.notifyDanger(result.Title);
    //                    } else {
    //                        App.notifySuccess(result.Title);
    //                        $scope.reload();
    //                    }
    //                    App.unblockUI("#contentMain");
    //                });
    //            });
    //    }, function ($itemScope, $event, model) {
    //        return true;
    //    }]
    //];
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
    $scope.names1 = [
        { value: "Nhóm 1", group_id: "NHOM_1" },
        { value: "Nhóm 2", group_id: "NHOM_2" },
        { value: "Nhóm 3", group_id: "NHOM_3" },
        { value: "Nhóm 4", group_id: "NHOM_4" },
        { value: "Nhóm 5", group_id: "NHOM_5" }
    ];
    $scope.model = {
        Name: '',
        Phone: '',
        Profile_Picture: '',
        License_car_image: '',
        Brand: '',
        Description: '',
        License_plate: '',
        Type_Driver: '',
        Identification: '',
        Image_car: '',
        Type_Seat: '',
        Taxy_type: '',
        Email: '',
        Id_Fb: '',

        TempSub: {
            IdI: [],
            IdS: [],
        },
        VIBUserInGroups: [],
        AspNetUserRoles: [],
        Organizations: 0,
        Active: true
    };
    $scope.romoocs = [];


    $scope.initData = function () {
    }
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {

        $confirm({ icon: '../../images/message/success.png', text: 'Bạn có chắc chắn thêm tài xế ?', title: 'Xác nhận', cancel: ' Hủy ' })
            .then(function () {

                if ($scope.addform.validate()) {
                    if ($scope.model.Group == "" || $scope.model.Group == null) {
                        App.notifyDanger("Vui lòng chọn nhóm");
                        return;
                    }

                    var fileName = $('input[type=file]').val();
                    //   console.log("ngafileName" + fileName);
                    var idxDot = fileName.lastIndexOf(".") + 1;
                    //  console.log("ngaidxDot" + idxDot);
                    var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
                    console.log('Name File: ' + extFile);
                    if (extFile != "") {
                        if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                            App.notifyDanger("Chọn file có đuôi là png, jpg, jpeg, gif, bmp!");
                        } else {
                            var fi = document.getElementById('file');
                            var fsize = (fi.files.item(0).size) / 1024;
                            if (fsize > 1024) {
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
                                            console.log('Click')
                                            dataservice.insert($scope.model, function (rs) {
                                                console.log("rs ne:: " + JSON.stringify(rs))
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
                    } else {
                        console.log('Click else')
                        dataservice.insert($scope.model, function (rs) {
                            console.log("rs ne:: " + JSON.stringify(rs))
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
    setTimeout(function () {

        document.getElementsByClassName('btn-secondary').innerHTML = "< span class=" + 'buttonText' + " > " + "Chọn ảnh" + "</span >";
    }, 200);
    $scope.getGroup = function () {
        $scope.romoocs = [];
        $scope.model.License_plate = '';
        dataservice.getGroup($scope.model.Group, function (rs) {
            $scope.romoocs = rs;
        });
    }
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.names1 = [
        { value: "Nhóm 1", group_id: "NHOM_1" },
        { value: "Nhóm 2", group_id: "NHOM_2" },
        { value: "Nhóm 3", group_id: "NHOM_3" },
        { value: "Nhóm 4", group_id: "NHOM_4" },
        { value: "Nhóm 5", group_id: "NHOM_5" }
    ];
    $scope.model = {
        Name: '',
        Phone: '',
        Profile_Picture: '',
        License_car_image: '',
        Brand: '',
        Description: '',
        License_plate: '',
        Type_Driver: '',
        Identification: '',
        Image_car: '',
        Type_Seat: '',
        Taxy_type: '',
        Email: '',
        Id_Fb: '',

        TempSub: {
            IdI: [],
            IdS: [],
        },
        VIBUserInGroups: [],
        AspNetUserRoles: [],
        Organizations: 0,
        Active: true
    };
    $scope.trang_thai_online = "Offline";
    $scope.isOnline = false;
    $scope.TempSub = {
        IdI: [],
        IdS: [],
    };
    $scope.TempSubTemp = {
        IdI: [],
        IdS: [],
    };
    $scope.model = {
        mPass: '',
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
        dataservice.getItem(para, function (rs) {

            if (rs.Error) {
                App.notifyDanger(rs.Title);
            } else {
                //console.log(Object.getOwnPropertyNames(rs))
                // $scope.model = rs;
                $scope.model.Id = rs.Id;
                $scope.model.Profile_Picture = rs.Profile_Picture != null ? rs.Profile_Picture : "";
                $scope.model.License_car_image = rs.License_car_image != null ? rs.License_car_image : "";
                $scope.model.Brand = rs.Brand != null ? rs.Brand : "";
                $scope.model.is_Online = rs.is_Online != null ? rs.is_Online : "";
                $scope.model.Phone = rs.Phone != null ? rs.Phone : "";
                $scope.model.Name = rs.Name != null ? rs.Name : "";
                $scope.model.Username = rs.Username != null ? rs.Username : "";
                $scope.model.Company_Code = rs.Company_Code != null ? rs.Company_Code : "";
                $scope.model.Description = rs.Description != null ? rs.Description : "";
                $scope.model.Identification = rs.Identification != null ? rs.Identification : "";

                $scope.model.Image_car = rs.Image_car != null ? rs.Image_car : "";
                $scope.model.License_plate = rs.License_plate != null ? rs.License_plate : "";
                $scope.model.Type_Driver = rs.Type_Driver != null ? rs.Type_Driver : "";
                $scope.model.Group = rs.Group != null ? rs.Group : "";
                $scope.model.Taxy_type = rs.Taxy_type != null ? rs.Taxy_type : "";
                $scope.model.Email = rs.Email != null ? rs.Email : "";
                $scope.model.Id_Fb = rs.Id_Fb != null ? rs.Id_Fb : "";
                $scope.model.emei = rs.emei != null ? rs.emei : "";
                $scope.model.Start_name = rs.Start_name != null ? rs.Start_name : "";
                $scope.model.End_name = rs.End_name != null ? rs.End_name : "";
                $scope.model.virual_intiary = rs.virual_intiary != null ? rs.virual_intiary : "";
                $scope.model.Password = rs.Password != null ? rs.Password : "";
                //if ($scope.model.is_Online == 1) {
                //    $scope.isOnline = true;
                //}
                //else
                //    $scope.isOnline = false;
                $scope.model.TempSub = {
                    IdI: [],
                    IdS: [],
                };
                $scope.getGroup();

            }
        });
    }
    $scope.initData();

    $scope.submit = function () {
        $confirm({ icon: '../../images/message/update.png', text: 'Bạn có chắc chắn cập nhật thông tin của tài xế ?', title: 'Xác nhận', cancel: ' Hủy ' })
            .then(function () {

                $scope.model.mPass = $scope.model.Password;
                if ($scope.editform.validate()) {
                    if ($scope.model.Group == "" || $scope.model.Group == null) {
                        App.notifyDanger("Vui lòng chọn nhóm");
                        return;
                    }


                    var fileName = $('input[type=file]').val();
                    //   console.log("ngafileName" + fileName);
                    var idxDot = fileName.lastIndexOf(".") + 1;
                    //  console.log("ngaidxDot" + idxDot);
                    var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
                    console.log('Name File: ' + extFile);
                    if (extFile != "") {
                        if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                            App.notifyDanger("Chọn file có đuôi png, jpg, jpeg, gif, bmp!");
                        } else {
                            var fi = document.getElementById('file');
                            var fsize = (fi.files.item(0).size) / 1024;
                            if (fsize > 1024) {
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
                                            App.notifyDanger("Độ rộng file không quá (1000px x 1000px)!");
                                        } else {
                                            console.log('Click')
                                            dataservice.update($scope.model, function (rs) {
                                                console.log("rs ne:: " + JSON.stringify(rs))
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
                    } else {
                        console.log('Click else')
                        dataservice.update($scope.model, function (rs) {
                            console.log("rs ne:: " + JSON.stringify(rs))
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

    setTimeout(function () {
        var defaultBounds = new google.maps.LatLngBounds(new google.maps.LatLng(-33.8902, 151.1759), new google.maps.LatLng(-33.8474, 151.2631));
        var options = {
            bounds: defaultBounds,
            types: ['geocode']
        };
        var autocomplete = new google.maps.places.Autocomplete(document.getElementById('startPlace'), options);

        google.maps.event.addListener(autocomplete, 'place_changed', function () {

            var place = autocomplete.getPlace();
            $scope.lat = place.geometry.location.lat();
            $scope.lng = place.geometry.location.lng();
            $scope.rs2 = $scope.lat + "," + $scope.lng;
            $scope.$apply();
            $scope.model.Start_name = place.formatted_address;
            //console.log("place" + JSON.stringify(place))
        });

    }, 200)
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
            $scope.rs3 = $scope.Endlatt + "," + $scope.Endlngt;
            $scope.$apply();
            $scope.model.End_name = place1.formatted_address;
        });
    }, 200)


    $scope.changeGroup = function () {
        $scope.romoocs = [];
        $scope.model.License_plate = '';
        dataservice.getGroup($scope.model.Group, function (rs) {
            $scope.romoocs = rs;
        });
    }
    $scope.getGroup = function () {
        dataservice.getGroupAll($scope.model, function (rs) {
            $scope.romoocs = rs;
        });
    }

    $scope.Generate = function () {
        var aaa = parseInt($scope.model.Id);
        $scope.model.virual_intiary = "";

        console.log("model" + $scope.model.virual_intiary);
        console.log("pathGG " + $("#pathGG").html());
        let coor1 = $scope.rs2;
        let coor2 = $scope.rs3;

        let arrayCoor1 = coor1.split(',');
        let arrayCoor2 = coor2.split(',');

        $scope.model.Start_Name_GPS = coor1;
        $scope.model.End_Name_GPS = coor2;

        console.log('Lat:' + $scope.model.Start_Name_GPS);
        console.log('Long:' + $scope.model.End_Name_GPS);

        pathSource = new ol.source.Vector({
            features: []
        });

        pathLayerMarker = new ol.layer.Vector({
            source: pathSource
        });
        var vectorLayer1 = new ol.layer.Vector({});

        //var pathGG = $('#pathGG').html();
        //var path = polyline.decode(pathGG);

        //pathSource.addFeature(renderLineStringFeature(path))
        //pathLayerMarker = renderLinePathLayer(path);

        //pathSource.removeLayer(pathLayerMarker);
        //pathSource.clear();
        //map.removeLayer(pathLayerMarker);
        $('#pathGG').html("");
        var getPathGoogle = function (orgin, destination) {

            $.ajax({
                type: "GET",
                dataType: "json",
                crossDomain: true,
                data: "origin=" + orgin + "&destination=" + destination + "&key=AIzaSyClyKLJi9GvGOaLmx-J-FW7-rJzZC_2HAw",
                url: "https://maps.googleapis.com/maps/api/directions/json",
                success: function (data) {
                    path = polyline.decode(data.routes[0].overview_polyline.points);
                    pathLayerMarker = renderLinePathLayer(path);

                    $scope.model.virual_intiary = JSON.stringify(path);
                    console.log("path1 " + $scope.model.virual_intiary)
                    $scope.model.Polyline = data.routes[0].overview_polyline.points;
                    console.log("polyline " + $scope.model.Polyline)
                    map.addLayer(pathLayerMarker);
                    map.removeLayer(vectorLayer1);
                    var styles3 = [

                        new ol.style.Style({
                            stroke: new ol.style.Stroke({
                                color: '#64c936',
                                width: 3
                            }),
                            fill: new ol.style.Fill({
                                color: 'rgba(100, 201, 54,1)'
                            })
                        }),
                    ];
                    var iconStyleStart = new ol.style.Style({
                        image: new ol.style.Icon(({
                            anchor: [0.5, 26],
                            anchorXUnits: 'fraction',
                            anchorYUnits: 'pixels',
                            src: 'https://i.imgur.com/pjZYQLJ.png'
                        })),
                        zIndex: 11
                    });
                    var iconStyleEnd = new ol.style.Style({
                        image: new ol.style.Icon(({
                            anchor: [0.5, 26],
                            anchorXUnits: 'fraction',
                            anchorYUnits: 'pixels',
                            src: 'https://i.imgur.com/3g07NhB.png'
                        })),
                        zIndex: 11
                    });
                    var pathLenght = path.length - 1;
                    var iconFeatureStart = new ol.Feature({
                        geometry: new ol.geom.Point(ol.proj.transform([parseFloat(path[0][1]), parseFloat(path[0][0])], 'EPSG:4326', 'EPSG:3857')),
                        type: "valve"
                    });
                    iconFeatureStart.setId(1);
                    iconFeatureStart.setStyle(iconStyleStart);
                    var iconFeatureEnd = new ol.Feature({
                        geometry: new ol.geom.Point(ol.proj.transform([parseFloat(path[pathLenght][1]), parseFloat(path[pathLenght][0])], 'EPSG:4326', 'EPSG:3857')),
                        type: "valve"
                    });


                    iconFeatureEnd.setId(2);

                    iconFeatureEnd.setStyle(iconStyleEnd);

                    var vectorIcon = new ol.source.Vector({});
                    vectorIcon.addFeature(iconFeatureStart);
                    vectorIcon.addFeature(iconFeatureEnd);

                    vectorLayer1 = new ol.layer.Vector({
                        source: vectorIcon,
                        style: styles3
                    });
                    map.addLayer(vectorLayer1);

                    pathSource.addFeature(renderLineStringFeature(path))
                    var field_location = pathSource.getFeatureById(aaa).getProperties();
                    console.log("" + field_location)
                    var field_extent = field_location.geometry.getExtent();
                    map.getView().fit(field_extent, map.getSize());
                    map.getView().setZoom(14);
                }
            });
        }
        getPathGoogle(arrayCoor1, arrayCoor2);
        setTimeout(function () {
            dataservice.Update_Itinerary($scope.model, function (rs) {

                console.log("rs ne:: " + $scope.model.virual_intiary)
                console.log("rs ne1:: " + $scope.model.Polyline)

            });
            setModalMaxHeight('.modal');
        }, 1000)
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
            url: "/remoocX/jtablehistory",
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('Tractor_Code').withTitle('Mã đầu kéo').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Start_Time').withTitle('Thời gian bắt đầu').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('End_time').withTitle('Thời gian kết thúc').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Start_Text').withTitle('Địa điểm bắt đầu').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('End_Text').withTitle('Thời gian kết thúc').renderWith(function (data, type, full, meta) {
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