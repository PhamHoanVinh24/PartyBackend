var ctxfolder = "/views/admin/vcJnanaNewsCat";
var ctxfolderMessage = "/views/message-box";
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
            submitFormUpload('/admin/VCJnanaNewsCat/Insert', data, callback);
        },
        update: function (data, callback) {
            submitFormUpload('/admin/VCJnanaNewsCat/Update', data, callback);
        },
        gettreedatacategory: function (callback) {
            $http.post('/admin/VCJnanaNewsCat/GettreedataCategory').success(callback);
        },
        getItem: function (data, callback) {
            $http.get('/admin/VCJnanaNewsCat/GetItem/' + data).success(callback);
        },
        deleteItems: function (data, callback) {
            $http.post('/admin/VCJnanaNewsCat/DeleteItems', data).success(callback);
        },
        delete: function (data, callback) {
            $http.post('/admin/VCJnanaNewsCat/Delete/' + data).success(callback);
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
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    $rootScope.validationOptions = {
        rules: {
            cat_code: {
                required: true
            },
            cat_title: {
                required: true
            }
        },
        messages: {
            cat_code: {
                required: "Mã danh mục yêu cầu bắt buộc"
            },
            cat_title: {
                required: "Tiêu đề yêu cầu bắt buộc"
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
    $rootScope.dateNow = new Date();
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
app.controller('index', function ($scope, $rootScope, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.selected = {};
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        Key: '',
        FromDate: '',
        ToDate: ''
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/admin/VCJnanaNewsCat/jtable",
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
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
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
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [1, 'desc'])
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
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("_STT").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full._STT] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full._STT + ']" ng-click="toggleOne(selected,$event)"/><span></span></label>';
    }).withOption('sWidth', '30px').withOption('sClass', ''));
    vm.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('ID').withOption('sWidth', '60px').notSortable().withOption('sClass', 'sorting_disabled hidden').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('cat_title').withTitle('Tiêu đề').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('cat_description').withTitle('Mô tả').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('cat_avarta').withTitle('Ảnh').renderWith(function (data, type) {
        return '<img style="width:64px; height:64px" src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + ' class="img-responsive">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('created_time').withTitle('Ngày tháng').renderWith(function (data, type) {
        var dateNow = $filter('date')(new Date($rootScope.dateNow), 'dd/MM/yyyy');
        if (data != '') {
            var createDate = $filter('date')(new Date(data), 'dd/MM/yyyy');
            if (dateNow == createDate) {
                var today = new Date();
                var created = new Date(data);
                var diffMs = (today - created);
                var diffHrs = Math.floor((diffMs % 86400000) / 3600000);
                var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
                return '<span class="badge badge-success">Mới </span> <span class="time">' + diffHrs + 'h ' + diffMins + 'p </span>';
            } else {
                return createDate;
            }
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('Thao tác').withOption('sClass', '').renderWith(function (data, type, full, meta) {
        return '<button title="Sửa" ng-click="edit(' + full.id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="deleteItem(' + full.id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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

    $scope.reload = function () {
        reloadData(true);
    }

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '60'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }

    $scope.edit = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit',
            backdrop: 'static',
            size: '60',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }

    $scope.deleteItem = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            resolve: {
                para: function () {
                    return id;
                }
            },
            controller: function ($scope, $uibModalInstance, para) {
                $scope.message = "Bạn có chắc chắn xóa danh mục?";
                $scope.ok = function () {
                    dataservice.delete(para, function (result) {
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $uibModalInstance.close();
                        }
                        App.unblockUI("#contentMain");
                    });
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            size: '25',
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
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

    function loadDate() {
        $("#DateFrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
            todayHighlight: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#DateTo').datepicker('setStartDate', maxDate);
        });
        $("#DateTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
            todayHighlight: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#DateFrom').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            $('#DateFrom').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
        });
    }

    setTimeout(function () {
        showHideSearch();
        loadDate();
    }, 200);
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice) {
    $scope.model = {
        cat_code: '',
        cat_title: '',
        cat_description: '',
        cat_parent_code: ''
    }
    $scope.initData = function () {
        dataservice.gettreedatacategory(function (result) {
            $scope.treeDatacategory = result.Object;
        });
    }
    $scope.initData();
    $scope.selectImage = function () {
        var fileuploader = angular.element("#file");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('imageId').src = reader.result;
            }
            var files = fileuploader[0].files;
            var idxDot = files[0].name.lastIndexOf(".") + 1;
            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
            if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                App.toastrError("Định dạng ảnh không đúng");
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click');
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        if ($scope.addform.validate()) {
            var fileName = $('input[type=file]').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            if (extFile != "") {
                if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                    App.toastrError("Format required is png, jpg, jpeg, gif, bmp!");
                } else {
                    var fileUpload = document.getElementById("file").files[0];
                    var formData = new FormData();
                    formData.append("cat_code", $scope.model.cat_code);
                    formData.append("cat_title", $scope.model.cat_title);
                    formData.append("cat_description", $scope.model.cat_description);
                    formData.append("cat_parent_code", $scope.model.cat_parent_code);
                    formData.append("cat_avarta", fileUpload);
                    dataservice.insert(formData, function (rs) {
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                        }
                    });
                }
            } else {
                var formData = new FormData();
                formData.append("cat_code", $scope.model.cat_code);
                formData.append("cat_title", $scope.model.cat_title);
                formData.append("cat_description", $scope.model.cat_description);
                formData.append("cat_parent_code", $scope.model.cat_parent_code);
                dataservice.insert(formData, function (rs) {
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                });
            }
        }
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para, DTOptionsBuilder, DTColumnBuilder, DTInstances) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.initData = function () {
        dataservice.getItem(para, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.model = rs;
            }
        });
        dataservice.gettreedatacategory(function (result) {
            $scope.treeDatacategory = result.Object;
        });
    }
    $scope.initData();
    $scope.submit = function () {
        if ($scope.editform.validate()) {
            var fileName = $('input[type=file]').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            if (extFile != "") {
                if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                    App.toastrError("Định dạng ảnh không đúng!");
                } else {
                    var fileUpload = document.getElementById("file").files[0];
                    var formData = new FormData();
                    formData.append("id", $scope.model.id);
                    formData.append("cat_code", $scope.model.cat_code);
                    formData.append("cat_title", $scope.model.cat_title);
                    formData.append("cat_description", $scope.model.cat_description);
                    formData.append("cat_parent_code", $scope.model.cat_parent_code);
                    formData.append("cat_avarta", fileUpload);
                    dataservice.update(formData, function (rs) {
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                        }
                    });
                }
            } else {
                var formData = new FormData();
                formData.append("id", $scope.model.id);
                formData.append("cat_code", $scope.model.cat_code);
                formData.append("cat_title", $scope.model.cat_title);
                formData.append("cat_description", $scope.model.cat_description);
                formData.append("cat_parent_code", $scope.model.cat_parent_code);
                dataservice.update(formData, function (rs) {
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                });
            }
        }
    }
    $scope.selectImage = function () {
        var fileuploader = angular.element("#file");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('imageId').src = reader.result;
            }
            var files = fileuploader[0].files;
            var idxDot = files[0].name.lastIndexOf(".") + 1;
            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
            if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                App.toastrError("Định dạng ảnh không đúng");
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click');
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});



