var ctxfolder = "/views/admin/vcJnanaNewsArticle";
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
        //var formData = new FormData();

        //formData.append("id", data.id);
        //formData.append("article_code", data.article_code != null ? data.article_code : null);
        //formData.append("article_title", data.article_title != null ? data.article_title : null);
        //formData.append("article_content", data.article_content != null ? data.article_content : null);
        //formData.append("artile_order", data.artile_order != null ? data.artile_order : null);
        //formData.append("cat_code", data.cat_code != null ? data.cat_code : null);
        //formData.append("article_avarta", data.article_avarta != null && data.article_avarta.length > 0 ? data.article_avarta[0] : null);

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
    var submitFormUploadFile = function (url, data, callback) {
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
            submitFormUpload('/admin/VCJnanaNewsArticle/Insert', data, callback);
        },
        update: function (data, callback) {
            submitFormUpload('/admin/VCJnanaNewsArticle/Update', data, callback);
        },
        gettreedatacategory: function (callback) {
            $http.post('/admin/VCJnanaNewsArticle/GettreedataCategory').success(callback);
        },
        getItem: function (data, callback) {
            $http.get('/admin/VCJnanaNewsArticle/GetItem/' + data).success(callback);
        },
        deleteItems: function (data, callback) {
            $http.post('/admin/VCJnanaNewsArticle/DeleteItems', data).success(callback);
        },
        delete: function (data, callback) {
            $http.post('/admin/VCJnanaNewsArticle/Delete/' + data).success(callback);
        },
        notifyNews: function (data, callback) {
            $http.post('/admin/VCJnanaNewsArticle/SendPushNotification/' + data).success(callback);
        },


        getItemfile: function (data, callback) {
            $http.get('/admin/VCJnanaNewsArticle/GetItemFile/' + data).success(callback);
        },
        gettreedataFile: function (callback) {
            $http.post('/admin/VCJnanaNewsArticle/GettreedataFile').success(callback);
        },
        insert_file: function (data, callback) {
            submitFormUploadFile('/admin/VCJnanaNewsArticle/InsertFile', data, callback);
        },
        update_file: function (data, callback) {
            submitFormUploadFile('/admin/VCJnanaNewsArticle/UpdateFile', data, callback);
        },
        delete_file: function (data, callback) {
            $http.post('/admin/VCJnanaNewsArticle/DeleteFile/' + data).success(callback);
        },
        //deleteItems_file: function (data, callback) {
        //    $http.post('/admin/VCJnanaNewsArticle/DeleteItemsFile', data).success(callback);
        //},

        //insert_fileno: function (data, callback) {
        //    $http.post('/admin/VCJnanaNewsArticle/InsertFileno', data).success(callback);
        //},
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
            article_code: {
                required: true,
            },
            article_title: {
                required: true,
            },
            article_content: {
                required: true,
            },
        },
        messages: {
            article_code: {
                required: "Mã tin tức yêu cầu bắt buộc",
            },
            article_title: {
                required: "Tiêu đề yêu cầu bắt buộc",
            },
            article_content: {
                required: "Nội dung yêu cầu bắt buộc",
            }
        }
    }
    $rootScope.validationOptions1 = {
        rules: {
            file_code: {
                required: true,
                maxlength: 255
            },
            file_name: {
                required: true,
                maxlength: 255
            },
        },
        messages: {
            file_code: {
                required: "Yêu cầu nhập mã tệp tin.",
                maxlength: "Lỗi nhập mã tệp tin."
            },
            file_name: {
                required: "Yêu cầu nhập tên tệp tin.",
                maxlength: "Lỗi nhập tên tệp tin."
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
app.controller('index', function ($scope, $rootScope, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $filter, dataservice) {
    var vm = $scope;
    $scope.selected = {};
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        Key: '',
        Key4: '',
        FromDate: '',
        ToDate: ''
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/admin/vcJnanaNewsArticle/JTable",
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
                d.Key4 = $scope.model.Key4;
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
        .withOption('order', [0, 'desc'])
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

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('ID').withOption('sWidth', '60px').notSortable().withOption('sClass', 'sorting_disabled hidden').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('article_title').withTitle('Tiêu đề').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('article_content').withTitle('Nội dung').renderWith(function (data, type) {
        return data;
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('article_avarta').withTitle('Ảnh').renderWith(function (data, type) {
        return '<img style="width:64px; height:64px" src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + ' class="img-responsive">';
    }).withOption('sWidth', '105px'));
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
    $scope.initData = function () {
        dataservice.gettreedatacategory(function (result) {
            $scope.treeDatacategory = result;
        });
    }
    $scope.initData();
    $scope.search = function () {
        $scope.reload();
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
            size: '70',
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
                $scope.message = "Bạn có chắc chắn xóa tin tức?";
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
        article_code: '',
        article_title: '',
        article_content: '',
        cat_code: '',
        artile_order: '',
        article_avarta: ''
    }
    $scope.initData = function () {
        dataservice.gettreedatacategory(function (result) {
            $scope.treeDatacategory1 = result;
        });
    }
    $scope.initData();
    $scope.submit = function () {
        if ($scope.addform.validate()) {
            var fileName = $('input[type=file]').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            if (extFile != "") {
                if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                    App.notifyDanger("Định dạng ảnh không đúng!");
                } else {
                    var fileUpload = document.getElementById("file").files[0];
                    var formData = new FormData();
                    formData.append("article_code", $scope.model.article_code);
                    formData.append("article_title", $scope.model.article_title);
                    formData.append("article_content", $scope.model.article_content);
                    formData.append("artile_order", $scope.model.artile_order);
                    formData.append("cat_code", $scope.model.cat_code);
                    formData.append("article_avarta", fileUpload);
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
                formData.append("article_code", $scope.model.article_code);
                formData.append("article_title", $scope.model.article_title);
                formData.append("article_content", $scope.model.article_content);
                formData.append("artile_order", $scope.model.artile_order);
                formData.append("cat_code", $scope.model.cat_code);
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
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.selectImage = function () {
        var fileuploader = angular.element("#file");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                $scope.model.article_avarta = reader.result;
                $scope.$apply();
            }
            var files = fileuploader[0].files;
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click');
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para, DTOptionsBuilder, DTColumnBuilder, DTInstances) {
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.initData = function () {
        dataservice.getItem(para, function (rs) {
            if (rs.Error) {
                App.notifyDanger(rs.Title);
            } else {
                $scope.model = rs;
            }
        });
        dataservice.gettreedatacategory(function (result) {
            $scope.treeDatacategory = result;
        });
        dataservice.gettreedataFile(function (result) {
            $scope.treedataFile = result.Object;
        });
    }
    $scope.initData();
    $scope.submit = function () {
        if ($scope.editform.validate()) {
            var fileName = $('input[type=file]').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            console.log('Name File: ' + extFile);
            if (extFile != "") {
                if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                    App.notifyDanger("Chọn file có đuôi là png, jpg, jpeg, gif, bmp!");
                } else {
                    var fileUpload = document.getElementById("file").files[0];
                    var formData = new FormData();
                    formData.append("id", $scope.model.id);
                    formData.append("article_code", $scope.model.article_code);
                    formData.append("article_title", $scope.model.article_title);
                    formData.append("article_content", $scope.model.article_content);
                    formData.append("artile_order", $scope.model.artile_order);
                    formData.append("cat_code", $scope.model.cat_code);
                    formData.append("article_avarta", fileUpload);
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
                formData.append("article_code", $scope.model.article_code);
                formData.append("article_title", $scope.model.article_title);
                formData.append("article_content", $scope.model.article_content);
                formData.append("artile_order", $scope.model.artile_order);
                formData.append("cat_code", $scope.model.cat_code);
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
                $scope.model.article_avarta = reader.result;
                $scope.$apply();
            }
            var files = fileuploader[0].files;
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click');
    }
    //bảng file
    $scope.model = {
        Key1: '',
        Key9: ''
    }
    var vm = $scope;
    $scope.selected = {};
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/admin/VCJnanaNewsArticle/jTableFile",
            beforeSend: function (jqXHR, settings) {
            },
            type: 'POST',
            data: function (d) {
                d.Key1 = $scope.model.Key1;
                d.postDate = $scope.model.postDate;
            },
            complete: function () {
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
        .withOption('order', [3, 'desc'])
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('file_name').withTitle('Tên tệp tin').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('file_note').withTitle('Ghi chú').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('file_path').withTitle('Tải xuống').renderWith(function (data, type) {
        return '<a href="' + data + '" download="' + data + '" target="_blank"> ' + data.split('/').pop() + '</a>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('created_time').withTitle('Ngày đăng').renderWith(function (data, type) {
        return data;
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
    $scope.edit = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit_file.html',
            controller: 'edit_file',
            backdrop: 'static',
            size: '50',
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
                $scope.message = "Bạn có chắc chắn xóa tệp tin?";
                $scope.ok = function () {
                    dataservice.delete_file(para, function (result) {
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

    $scope.add_file = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add_file.html',
            controller: 'add_file',
            backdrop: 'static',
            size: '50'
        });

        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
            return $itemScope.data.id;
        });
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.search = function () {
        $scope.reload();
    }
    $scope.cancel1 = function () {
        $uibModalInstance.close();
    }
    $scope.editBanking = false;
    $scope.Banking = function () {
        $scope.editBanking = true;
    }
    $scope.submitFile1 = function () {
        dataservice.insert_fileno($scope.model, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                reloadData(true);
            }
        });
    }
    $scope.cancelFile = function () {
        $scope.editBanking = false;
    }

    function loadDate() {
        $("#postDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
    }
    setTimeout(function () {
        loadDate();
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('add_file', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice) {
    $scope.names1 = [
        { value: "Tiếng Việt", language: "vi-VN" },
        { value: "Tiếng Anh", language: "en-US" }
    ];
    $scope.errorFile = false;

    $scope.model = {
        file_code: '',
        file_name: '',
        file_title: '',
        file_note: '',
        file_cat_code: ''
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        if ($scope.addformFILE.validate()) {
            var fileName = $('input[type=file]').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            console.log('Name File: ' + extFile);
            if (extFile != "") {
                if (extFile != "docx" && extFile != "pdf") {
                    App.toastrError("Chọn những file có đuôi docx,pdf!");
                } else {
                    var fi = document.getElementById('file');
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 102400) {
                        App.notifyDanger("Độ lớn của file không quá 1MB!");
                    } else {
                        var fileUpload = $("#file")[0];
                        var reader = new FileReader();
                        reader.readAsDataURL(fileUpload.files[0]);
                        reader.onloadend = function (e) {
                            //Initiate the JavaScript Image object.
                            //  var file1 = new File();
                            //   var image = new Image();
                            //Set the Base64 string return from FileReader as source.
                            var file1 = e.target.result;
                            // image.src = e.target.result;
                            //    file1.onload = function () {
                            //var formData = new FormData();
                            var formData = new FormData();
                            var fileUpload = document.getElementById("file").files[0];
                            formData.append("file_code", $scope.model.file_code);
                            formData.append("file_name", $scope.model.file_name);
                            formData.append("file_title", $scope.model.file_title);
                            formData.append("file_note", $scope.model.file_note);
                            formData.append("file_cat_code", $scope.model.file_cat_code);
                            formData.append("file_path", fileUpload);

                            $scope.errorFile = false;
                            dataservice.insert_file(formData, function (rs) {
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
            } else {
                $scope.errorFile = true;
                //var formData = new FormData();
                //formData.append("file_code", $scope.model.file_code);
                //formData.append("file_name", $scope.model.file_name);
                //formData.append("file_title", $scope.model.file_title);
                //formData.append("file_note", $scope.model.file_note);
                //formData.append("file_cat_code", $scope.model.file_cat_code);
                //dataservice.insert_file(formData, function (rs) {
                //    if (rs.Error) {
                //        App.toastrError(rs.Title);
                //    } else {
                //        App.toastrSuccess(rs.Title);
                //        $uibModalInstance.close();
                //    }
                //});
            }
        }
    }
});

app.controller('edit_file', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para) {
    $scope.names1 = [
        { value: "Tiếng Việt", language: "vi-VN" },
        { value: "Tiếng Anh", language: "en-US" }
    ];
    $scope.errorFile = false;
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.cancel1 = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $uibModalInstance.close();
    $scope.initData = function () {
        dataservice.getItemfile(para, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.model = rs;
            }
        });
    }
    $scope.initData();
    $scope.loadData = function () {

    }
    $scope.loadData();
    $scope.submitfile = function () {
        if ($scope.editformFILE.validate()) {
            var fileName = $('input[type=file]').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            console.log('Name File: ' + extFile);
            if (extFile != "") {
                if (extFile != "docx" && extFile != "pdf") {
                    App.toastrError("Chọn file có đuôi là docx,pdf!");
                } else {
                    var fi = document.getElementById('file');
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 1024) {
                        App.toastrError("Độ lớn của file không quá 1 MB !");
                    } else {
                        var fileUpload = $("#file")[0];
                        var reader = new FileReader();
                        reader.readAsDataURL(fileUpload.files[0]);
                        reader.onloadend = function (e) {
                            var file1 = e.target.result;
                            var formData = new FormData();
                            var fileUpload = document.getElementById("file").files[0];
                            formData.append("id", $scope.model.id);
                            formData.append("file_code", $scope.model.file_code);
                            formData.append("file_name", $scope.model.file_name);
                            if ($scope.model.file_title != null)
                                formData.append("file_title", $scope.model.file_title);
                            if ($scope.model.file_note != null)
                                formData.append("file_note", $scope.model.file_note);
                            if ($scope.model.file_cat_code != null)
                                formData.append("file_cat_code", $scope.model.file_cat_code);
                            formData.append("file_path", fileUpload);

                            $scope.errorFile = false;
                            dataservice.update_file(formData, function (rs) {
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
            } else {
                $scope.errorFile = false;
                var formData = new FormData();
                formData.append("id", $scope.model.id);
                formData.append("file_code", $scope.model.file_code);
                formData.append("file_name", $scope.model.file_name);
                if ($scope.model.file_title != null)
                    formData.append("file_title", $scope.model.file_title);
                if ($scope.model.file_note != null)
                    formData.append("file_note", $scope.model.file_note);
                if ($scope.model.file_cat_code != null)
                    formData.append("file_cat_code", $scope.model.file_cat_code);
                dataservice.update_file(formData, function (rs) {
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
});






