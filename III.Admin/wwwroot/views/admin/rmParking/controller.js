var ctxfolder = "/views/admin/rmParking";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ngSanitize', 'ui.select']).
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
        formData.append("Company_Code", data.Company_Code != null ? data.Company_Code : "");
        formData.append("Driver_Id", data.Driver_Id != null ? data.Driver_Id : "");
        formData.append("Romooc_Code", data.Romooc_Code != null ? data.Romooc_Code : "");

        formData.append("Code", data.Code != null ? data.Code : "");
        formData.append("Group", data.Group != null ? data.Group : "");
        formData.append("Origin", data.Origin != null ? data.Origin : "");
        formData.append("Generic", data.Generic != null ? data.Generic : "");
        formData.append("License_Plate", data.License_Plate != null ? data.License_Plate : "");
        formData.append("Number", data.Number != null ? data.Number : "");
        formData.append("Year_Manufacture", data.Year_Manufacture != null ? data.Year_Manufacture : "");
        formData.append("Owner_Code", data.Owner_Code != null ? data.Owner_Code : "");
        formData.append("Category", data.Category != null ? data.Category : "");
        formData.append("Weight_Itself", data.Weight_Itself != null ? data.Weight_Itself : "");
        formData.append("Design_Payload", data.Design_Payload != null ? data.Design_Payload : "");
        formData.append("Payload_Pulled", data.Payload_Pulled != null ? data.Payload_Pulled : "");
        formData.append("Payload_Total", data.Payload_Total != null ? data.Payload_Total : "");
        formData.append("Size_Registry", data.Size_Registry != null ? data.Size_Registry : "");
        formData.append("Size_Use", data.Size_Use != null ? data.Size_Use : "");
        formData.append("Registry_Duration", data.Registry_Duration != null ? data.Registry_Duration : "");
        formData.append("Insurrance_Duration", data.Insurrance_Duration != null ? data.Insurrance_Duration : "");
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
            submitFormUpload('/Admin/RMparking/Insert', data, callback);
        },
        update: function (data, callback) {
            submitFormUpload('/Admin/RMparking/Update', data, callback);
        },
        deleteItems: function (data, callback) {
            $http.post('/Admin/RMparking/DeleteItems', data).success(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/RMparking/Delete/' + data).success(callback);
        },
        GetItemDetail: function (data, callback) {
            $http.get('/Admin/RMparking/GetItemDetail/' + data).success(callback);
        },
        resort: function (data, callback) {
            $http.post('/Admin/RMparking/resort', data).success(callback);
        },
        getAll: function (callback) {
            $http.post('/Admin/RMparking/getAll/').success(callback);
        },
        gettreedataDrive: function (data, callback) {
            $http.post('/Admin/RMparking/gettreedataDrive', data).success(callback);
        },
        gettreedataRomooc: function (data, callback) {

            $http.post('/Admin/RMparking/gettreedataRomooc', data).success(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/RMparking/GetItem/' + data).success(callback);
        },
        getSumDistance: function (callback) {
            $http.post('/Admin/RMparking/GetSumDistance').success(callback);
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
            Name: {
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
            Name: {
                required: "Yêu cầu nhập tên đầu kéo.",
                maxlength: "Không được nhập quá 255 kí tự"
            },
            Note: {
                maxlength: "Không được nhập quá 1000 kí tự"
            }
        }
    }
    $rootScope.validationOptions1 = {
        rules: {

            Name: {
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
            Name: {
                required: "Yêu cầu nhập tên đầu kéo.",
                maxlength: "Không được nhập quá 255 kí tự"
            },


            Note: {

                maxlength: "Không được nhập quá 1000 kí tự"
            }

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
    $scope.tong_so_km = 0;
    var vm = $scope;
    $scope.selected = {};
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    vm.edit = edit;
    vm.deleteItem = deleteItem;
    vm.activeItem = activeItem;
    $scope.model = {
        Code: '',
        Group: '',
        Flag_Delete: ''
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/RMparking/jtable",
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
    //        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    //    }).withOption('sWidth', '30px').withOption('sClass', 'tcenter'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Flag_Delete').withTitle('Trạng thái').renderWith(function (data, type, full, meta) {
        var x = "";
        if (data == "False") {
            x = '<img src="../../images/romooc/tractor_online.gif" alt=”animated” id="image" style="width: 40px;" />';
        }
        if (data == "True") {
            x = '<img src="../../images/romooc/tractor_offline.png" alt=”animated” id="image" style="width: 40px;"/>';

        }
        return x;
    }).withOption('sWidth', '50px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('License_Plate').withTitle('Mã đầu kéo').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Group').withTitle('Nhóm').renderWith(function (data, type) {
        //if (data == 'null' || data == 'undefined')
        //    return '';
        //else
        //    return data;

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
    vm.dtColumns.push(DTColumnBuilder.newColumn('Generic').withTitle('Thương hiệu').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Origin').withTitle('Xuất xứ').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Position_text').withTitle('Vị trí hiện tại').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }).withOption('sWidth', '150px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Position_time').withTitle('Tại thời điểm').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SumDistance').withTitle('Tổng số(km)').renderWith(function (data, type) {

        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data / 1000;
    }).withOption('sWidth', '50px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Flag').withTitle('Trạng thái đầu kéo').renderWith(function (data, type, full, meta) {
        var x = "";
        if (data == 0) {
            x = '<span class="text-danger">Không kích hoạt</span>';
        }
        if (data == 1) {
            x = '<span class="text-success">Đang kích hoạt</span>';
        }
        return x;
    }).withOption('sWidth', '50px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle('Tác vụ').notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = full;
            if (full.Flag == 0) {
                console.log("1");
                return '<a ng-click="edit(selected[' + full.Id + '])" style="padding-right:5px;" title="Cập nhật thông tin"><i class="fa fa-edit" style="font-size:18px"></i></a><a ng-click="activeItem(selected[' + full.Id + '])" style="padding-right:5px"  title="Mở khóa trạng thái"><i class="fa fa-unlock" style="font-size:18px" ></i></a>';

            }
            else {
                console.log("2");
                return '<a ng-click="edit(selected[' + full.Id + '])" style="padding-right:5px;" title="Cập nhật thông tin"><i class="fa fa-edit" style="font-size:18px"></i></a><a ng-click="deleteItem(selected[' + full.Id + '])" style="padding-right:5px"  title="Khóa trạng thái"><i class="fa fa-lock" style="font-size:18px" ></i></a>';

            }
        }).withOption('sWidth', '120px').withOption('sClass', 'tcenter'));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {

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
            size: '70',
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
        $confirm({ icon: '../../images/message/lockscreen.png', text: 'Bạn có chắc chắn muốn khóa trạng thái khoản mục đã chọn?', title: 'Xác nhận', ok: 'Chắc chắn', cancel: ' Hủy ' })
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

    function activeItem(selected) {
        $confirm({ icon: '../../images/message/unlock-icon.png', text: 'Bạn có chắc chắn muốn mở khóa trạng thái khoản mục đã chọn?', title: 'Xác nhận', ok: 'Chắc chắn', cancel: ' Hủy ' })
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
    $scope.getSumDistance = function () {
        dataservice.getSumDistance(function (rs) {
            $scope.tong_so_km = parseInt(rs.Object) / 1000;
        });
    }
    $scope.getSumDistance();

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
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
            $confirm({ text: 'Bạn có chắc chắn muốn xóa các khoản mục đã chọn?', title: 'Xác nhận', ok: 'Chắc chắn', cancel: ' Hủy ' })
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
            App.notifyDanger("Không có khoản mục nào được chọn");
        }
    }

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
    $scope.names1 = [
        { value: "Nhóm 1", group_id: "NHOM_1" },
        { value: "Nhóm 2", group_id: "NHOM_2" },
        { value: "Nhóm 3", group_id: "NHOM_3" },
        { value: "Nhóm 4", group_id: "NHOM_4" },
        { value: "Nhóm 5", group_id: "NHOM_5" }
    ];
    $scope.model = {
        Code: '',
        Driver_Id: '',
        Generic: '',
        Group: '',
        Origin: '',
        Year_Manufacture: '',
        Owner_Code: '',
        Category: '',
        Weight_Itself: '',
        Design_Payload: '',
        Payload_Pulled: '',
        Payload_Total: '',
        Size_Registry: '',
        Size_Use: '',
        Registry_Duration: '',
        Insurrance_Duration: '',
        Note: '',
        Romooc_Code: ''
    };

    $scope.initData = function () {

    }
    $scope.initData();
    $scope.getGroup = function () {
        if ($scope.model.Group != null && $scope.model != "") {
            dataservice.gettreedataDrive($scope.model, function (result) {
                $scope.treeDataDrive = result.Object;
            });
            dataservice.gettreedataRomooc($scope.model, function (result) {
                $scope.treeDataRomooc = result.Object;
            });
            $scope.model.Romooc_Code = '';
        }
        else {
            App.notifyDanger("Mời chọn nhóm của đầu kéo.");
            return;
        }
    }
    $scope.checkGroup = function () {
        if ($scope.model.Group == null && $scope.model == "") {
            App.notifyDanger("Mời chọn nhóm của đầu kéo.");
            return;
        }
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        $confirm({ icon: '../../images/message/success.png', text: 'Bạn có chắc chắn thêm mới đầu kéo ?', title: 'Xác nhận', cancel: ' Hủy ' })
            .then(function () {
                if ($scope.addform.validate()) {
                    if ($scope.model.Group == "" || $scope.model.Group == null) {
                        App.notifyDanger("Vui lòng chọn nhóm");
                        return;
                    }

                    if ($scope.model.Romooc_Code == "" || $scope.model.Romooc_Code == null) {
                        App.notifyDanger("Vui lòng chọn danh sách romooc");
                        return;
                    }
                    var fileName = $('input[type=file]').val();
                    var idxDot = fileName.lastIndexOf(".") + 1;
                    var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
                    console.log('Name File: ' + extFile);
                    if (extFile != "") {
                        if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                            App.notifyDanger("Chọn file có đuôi là png, jpg, jpeg, gif, bmp!");
                        } else {
                            var fi = document.getElementById('file');
                            var fsize = (fi.files.item(0).size) / 1024;
                            if (fsize > 1024) {
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
                    } else {
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
              
            });
    }
});

app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para) {
    $scope.names1 = [
        { value: "Nhóm 1", group_id: "NHOM_1" },
        { value: "Nhóm 2", group_id: "NHOM_2" },
        { value: "Nhóm 3", group_id: "NHOM_3" },
        { value: "Nhóm 4", group_id: "NHOM_4" },
        { value: "Nhóm 5", group_id: "NHOM_5" }
    ];
    $scope.model = {
        Code: '',

        Driver_Id: '',
        Generic: '',
        Group: '',
        Origin: '',
        Year_Manufacture: '',
        Owner_Code: '',
        Category: '',
        Weight_Itself: '',
        Design_Payload: '',
        Payload_Pulled: '',
        Payload_Total: '',
        Size_Registry: '',
        Size_Use: '',
        Registry_Duration: '',
        Insurrance_Duration: '',
        Note: '',
        Romooc_Code: ''
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.initData = function () {
        $scope.orderItem = {};

        dataservice.getItem(para.Id, function (rs) {

            if (rs.Object.Image == 'null' || rs.Object.Image == 'undefined') {
                rs.Object.Image = "";
            }
            if (rs.Object.Driver_Id == 'null' || rs.Object.Driver_Id == 'undefined') {
                rs.Object.Driver_Id = "";
            }
            if (rs.Object.Name == 'null' || rs.Object.Name == 'undefined') {
                rs.Object.Name = "";
            }
            if (rs.Object.Group == 'null' || rs.Object.Group == 'undefined') {
                rs.Object.Group = "";
            }
            if (rs.Object.Origin == 'null' || rs.Object.Origin == 'undefined') {
                rs.Object.Origin = "";
            }
            if (rs.Object.Generic == 'null' || rs.Object.Generic == 'undefined') {
                rs.Object.Generic = "";
            }
            if (rs.Object.Company_Code == 'null' || rs.Object.Company_Code == 'undefined') {
                rs.Object.Company_Code = "";
            }
            if (rs.Object.Number == 'null' || rs.Object.Number == 'undefined') {
                rs.Object.Number = "";
            }
            if (rs.Object.Year_Manufacture == 'null' || rs.Object.Year_Manufacture == 'undefined') {
                rs.Object.Year_Manufacture = "";
            }
            if (rs.Object.Category == 'null' || rs.Object.Category == 'undefined') {
                rs.Object.Category = "";
            }
            if (rs.Object.Weight_Itself == 'null' || rs.Object.Weight_Itself == 'undefined') {
                rs.Object.Weight_Itself = "";
            }
            if (rs.Object.Design_Payload == 'null' || rs.Object.Design_Payload == 'undefined') {
                rs.Object.Design_Payload = "";
            }
            if (rs.Object.Payload_Pulled == 'null' || rs.Object.Payload_Pulled == 'undefined') {
                rs.Object.Payload_Pulled = "";
            }
            if (rs.Object.Payload_Total == 'null' || rs.Object.Payload_Total == 'undefined') {
                rs.Object.Payload_Total = "";
            }
            if (rs.Object.Size_Registry == 'null' || rs.Object.Size_Registry == 'undefined') {
                rs.Object.Size_Registry = "";
            }
            if (rs.Object.Size_Use == 'null' || rs.Object.Size_Use == 'undefined') {
                rs.Object.Size_Use = "";
            }
            if (rs.Object.Registry_Duration == 'null' || rs.Object.Registry_Duration == 'undefined') {
                rs.Object.Registry_Duration = "";
            }
            if (rs.Object.Insurrance_Duration == 'null' || rs.Object.Insurrance_Duration == 'undefined') {
                rs.Object.Insurrance_Duration = "";
            }
            if (rs.Object.Note == 'null' || rs.Object.Note == 'undefined') {
                rs.Object.Note = "";
            }
            if (rs.Object.Owner_Code == 'null' || rs.Object.Owner_Code == 'undefined') {
                rs.Object.Owner_Code = "";
            }
            $scope.model = rs.Object;
            if (rs.array != null && rs.array != "") {
                $scope.orderItem.items = rs.array;
            }


        });
        dataservice.gettreedataDrive(para, function (result) {
            $scope.treeDataDrive = result.Object;
        });
        dataservice.gettreedataRomooc(para, function (result) {
            $scope.treeDataRomooc = result.Object;
        });
    }
    $scope.initData();
    $scope.getGroup = function () {
        $scope.treeDataDrive = null;
        $scope.treeDataRomooc = null;
        $scope.orderItem.items = '';
        if ($scope.model.Group != null && $scope.model != "") {
            dataservice.gettreedataDrive($scope.model, function (result) {
                $scope.treeDataDrive = result.Object;
            });
            dataservice.gettreedataRomooc($scope.model, function (result) {
                $scope.treeDataRomooc = result.Object;
            });
        }
        else {
            App.notifyDanger("Mời chọn nhóm của đầu kéo.");
            return;
        }
    }


    $scope.submit = function () {
        $confirm({ icon: '../../images/message/update.png', text: 'Bạn có chắc chắn cập nhật thông tin của tài xế ?', title: 'Xác nhận', cancel: ' Hủy ' })
            .then(function () {
              
                $scope.model.Romooc_Code = JSON.stringify($scope.orderItem.items);
                console.log($scope.model);

                if ($scope.editform.validate()) {
                    if ($scope.model.Group == "" || $scope.model.Group == null) {
                        App.notifyDanger("Vui lòng chọn nhóm");
                        return;
                    }

                    if ($scope.model.Romooc_Code == "" || $scope.model.Romooc_Code == null) {
                        App.notifyDanger("Vui lòng chọn danh sách romooc");
                        return;
                    }
                    var fileName = $('input[type=file]').val();
                    var idxDot = fileName.lastIndexOf(".") + 1;
                    var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
                    console.log('Name File: ' + extFile);
                    if (extFile != "") {
                        if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                            App.notifyDanger("Chọn file có đuôi là png, jpg, jpeg, gif, bmp!");
                        } else {
                            var fi = document.getElementById('file');
                            var fsize = (fi.files.item(0).size) / 1024;
                            if (fsize > 1024) {
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
                    } else {
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

