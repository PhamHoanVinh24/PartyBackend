var ctxfolder = "/views/admin/rmJnanaNewsArticle";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', "ngCookies", "pascalprecht.translate"]).
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
        debugger
        var config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };

        var formData = new FormData();

        formData.append("id", data.id);
        formData.append("article_code", data.article_code !=null ? data.article_code:null);
        formData.append("article_title", data.article_title != null ? data.article_title : null);
        formData.append("article_content", data.article_content != null ? data.article_content : null);
        formData.append("artile_order", data.artile_order != null ? data.artile_order : null);
        formData.append("cat_code", data.cat_code != null ? data.cat_code : null);
        formData.append("article_avarta", data.article_avarta != null && data.article_avarta.length > 0 ? data.article_avarta[0] : null);

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
    var submitFormUploadFile = function (url, data, callback) {
        debugger
        var config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };

        var formData = new FormData();

        formData.append("id", data.id);
        formData.append("file_code", data.file_code != null ? data.file_code : null);
        formData.append("file_name", data.file_name != null ? data.file_name : null);
        formData.append("file_title", data.file_title != null ? data.file_title : null);
        formData.append("file_note", data.file_note != null ? data.file_note : null);
        formData.append("file_cat_code", data.file_cat_code != null ? data.file_cat_code : null);
        formData.append("file_path", data.file_path != null && data.file_path.length > 0 ? data.file_path[0] : null);

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
            submitFormUpload('/Admin/RMJnanaNewsArticle/Insert', data, callback);
        },
        update: function (data, callback) {
            submitFormUpload('/Admin/RMJnanaNewsArticle/Update', data, callback);
        },

        gettreedatacategory: function (callback) {
            $http.post('/Admin/RMJnanaNewsArticle/gettreedataCategory').success(callback);
        },
         getItem: function (data, callback) {
             $http.get('/Admin/RMJnanaNewsArticle/GetItem/' + data).success(callback);
        },
        deleteItems: function (data, callback) {
            $http.post('/Admin/RMJnanaNewsArticle/DeleteItems', data).success(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/RMJnanaNewsArticle/Delete/' + data).success(callback);
        },
        notifyNews: function (data, callback) {
            $http.post('/Admin/RMJnanaNewsArticle/SendPushNotification/' + data).success(callback);
        },


        insert_file: function (data, callback) {
            submitFormUploadFile('/Admin/RMJnanaNewsArticle/InsertFile', data, callback);
        },
        update_file: function (data, callback) {
            submitFormUploadFile('/Admin/RMJnanaNewsArticle/UpdateFile', data, callback);
        },
        getItemfile: function (data, callback) {
            $http.get('/Admin/RMJnanaNewsArticle/GetItemFile/' + data).success(callback);
        },
        deleteItems_file: function (data, callback) {
            $http.post('/Admin/RMJnanaNewsArticle/DeleteItemsFile', data).success(callback);
        },
        delete_file: function (data, callback) {
            $http.post('/Admin/RMJnanaNewsArticle/DeleteFile/' + data).success(callback);
        },
        insert_fileno: function (data, callback) {
            $http.post('/Admin/RMJnanaNewsArticle/insertFileno', data).success(callback);
        },
         gettreedataFile: function (callback) {
             $http.post('/Admin/RMJnanaNewsArticle/gettreedataFile').success(callback);
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
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, dataservice, $cookies, $translate, dataservice) {
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
 
    });
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
                required: caption.RMJNA_VALIDATE_ENTER_CODE,
                maxlength: caption.RMJNA_ERR_ENTER_CODE
            },
            file_name: {
                required: caption.RMJNA_VALIDATE_ENTER_NAME,
                maxlength: caption.RMJNA_ERR_ENTER_NAME
            }
        }
    }
    $rootScope.StatusData = [{
        Value: 1,
        Name: caption.COM_WORKING
    }, {
        Value: 0,
        Name: caption.COM_STOP_WORKING
    }];

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
    $scope.initData = function () {
        dataservice.gettreedatacategory(function (result) {
            $scope.treeDatacategory = result.Object;
        });
    }
    $scope.initData();
    var vm = $scope;
    $scope.selected = {};
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.edit = edit;
    $scope.deleteItem = deleteItem;
    $scope.notify = notify;

    $scope.model = {
        Key: '',
        Key4: '',
        FromDate: '',
        ToDate: ''
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/RMJnanaNewsArticle/JTable",
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
    //vm.dtColumns.push(DTColumnBuilder.newColumn("id").withTitle(titleHtml).notSortable()
    //    .renderWith(function (data, type, full, meta) {
    //        $scope.selected[full.id] = false;
    //        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    //    }).withOption('sWidth', '30px').withOption('sClass', 'tcenter'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('No.').renderWith(function (data, type) {
    //    return data;
    //}));
   
    vm.dtColumns.push(DTColumnBuilder.newColumn('article_title').withTitle('{{"RMJNA_LIST_COL_ARTICLE_TITLE" | translate}}').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('article_content').withTitle('{{"RMJNA_LIST_COL_ARTICLE_CONTENT" | translate}}').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('created_time').withTitle('{{"RMJNA_LIST_COL_CREATED_TIME" | translate}}').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('null').notSortable().withOption('sClass', 'nowrap').withTitle('{{"RMJNA_LIST_COL_NULL" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type, full, meta) {
        vm.selected[full.id] = full;
        return '<button title="Sửa" ng-click="edit(selected[' + full.id + '])" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class=" mt-checkbox btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="deleteItem(selected[' + full.id + '])" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="mt-checkbox btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn("null").withTitle('Tác vụ').notSortable()
    //    .renderWith(function (data, type, full, meta) {
    //        $scope.selected[full.id] = full;
           
    //        return '<p class="mt-checkbox" style ="margin-top:0px"><a ng-click="notify(selected[' + full.id + '])" style="padding-right:10px;" title="Gửi notify tin tức"><i class="fa fa-certificate" style="font-size:18px"></i></a><a ng-click="edit(selected[' + full.id + '])" style="padding-right:10px;" title="Cập nhật thông tin"><i class="fa fa-edit" style="font-size:18px"></i></a><a ng-click="deleteItem(selected[' + full.id + '])"  title="Xóa khoản mục"><i class="fa fa-remove" style="font-size:18px"></i></a></p>';
    //    }).withOption('sWidth', '120px').withOption('sClass', 'tcenter'));
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
            size: 'lg'
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
        $confirm({ text: caption.COM_MSG_DELETE_CONFIRM_COM + ' ' + selected.article_title, title: caption.COM_CONFIRM, cancel: caption.COM_BTN_CANCEL })
            .then(function () {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
                dataservice.delete(selected.id, function (result) {
                    if (result.Error) {
                        App.toastrError(result.Title);
                        //alert(result.Title)
                    } else {
                        App.toastrSuccess(result.Title);
                        //alert(result.Title)
                        $scope.reload();
                    }
                    App.unblockUI("#contentMain");
                });
            });
    }
    function notify(selected) {
        $confirm({ text: caption.RMJNA_MSG_CONFIRM_NOTIFY + ' ' + selected.article_title, title: caption.COM_CONFIRM, cancel: caption.COM_BTN_CANCEL })
            .then(function () {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: caption.RMJNA_MSG_WAITING
                });
                dataservice.notifyNews(selected.id, function (result) {
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
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
            $confirm({ text: caption.COM_MSG_DELETE_CONFIRM_COM, title: caption.COM_CONFIRM, ok: caption.COM_CONFIRM_OK, cancel: caption.COM_CONFIRM_CANCEL })
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
                            App.notifyInfo(result.Title);
                            $scope.reload();
                        }
                        App.unblockUI("#contentMain");
                    });

                });
        } else {
            App.notifyDanger(caption.COM_MSG_UNSELECTED);
        }
    }

    //$scope.contextMenu = [
    //    [function ($itemScope) {
    //        return '<i class="fa fa-edit"></i> Gửi notify tin tức';
    //    }, function ($itemScope, $event, model) {
    //        $confirm({ text: 'Bạn có chắc chắn gửi notify tin tức: ' + $itemScope.data.article_title, title: 'Xác nhận', cancel: ' Hủy ' })
    //            .then(function () {
    //                App.blockUI({
    //                    target: "#contentMain",
    //                    boxed: true,
    //                    message: 'Xin chờ một chút ...'
    //                });
    //                dataservice.notifyNews($itemScope.data.id, function (result) {
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
    //    }],
    //    [function ($itemScope) {
    //        return '<i class="fa fa-edit"></i> Sửa thông tin tin tức';
    //    }, function ($itemScope, $event, model) {
    //        var modalInstance = $uibModal.open({
    //            animation: true,
    //            templateUrl: ctxfolder + '/edit.html',
    //            controller: 'edit',
    //            backdrop: true,
    //            size: '80',
    //            resolve: {
    //                para: function () {
    //                    return $itemScope.data.id;
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
    //        return '<i class="fa fa-remove"></i> Xóa khoản mục';
    //    }, function ($itemScope, $event, model) {

    //        $confirm({ text: 'Bạn có chắc chắn xóa: ' + $itemScope.data.Title, title: 'Xác nhận', cancel: ' Hủy ' })
    //            .then(function () {
    //                App.blockUI({
    //                    target: "#contentMain",
    //                    boxed: true,
    //                    message: 'loading...'
    //                });
    //                dataservice.delete($itemScope.data.id, function (result) {
    //                    if (result.Error) {
    //                        App.notifyDanger(result.Title);
    //                    } else {
    //                        App.notifyInfo(result.Title);
    //                        $scope.reload();
    //                    }
    //                    App.unblockUI("#contentMain");
    //                });
    //            });
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
    function loadDate() {
        $("#DateFrom").datepicker({
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
            $('#DateFrom').datepicker('setEndDate', maxDate);
        });
        //$('#DateFrom').datepicker('setEndDate', $rootScope.DateNow);
        //$('#DateTo').datepicker('setStartDate', $rootScope.DateBeforeSevenDay);
        //$('#DateFrom').datepicker('update', $rootScope.DateBeforeSevenDay);
        //$('#DateTo').datepicker('update', $rootScope.DateNow);
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

    $scope.initData = function () {
        dataservice.gettreedatacategory(function (result) {
            $scope.treeDatacategory1 = result.Object;
        });
    }
    $scope.initData();
    
    $scope.submit = function () {
        if ($scope.addform.validate()) {
            debugger
            var fileName = $('input[type=file]').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            console.log('Name File: ' + extFile);
            if (extFile != "") {
                if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                    App.notifyDanger(caption.COM_MSG_FORMAT_PNG_JPG_JEG_GIF_BMP);
                } else {
                    var fi = document.getElementById('file');
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 1024) {
                        App.notifyDanger(caption.COM_MSG_MAXIMUM_FILE);
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
                                    App.notifyDanger(caption.COM_MSG_MAXIMUM_FILE_SIZE);
                                } else {
                                    console.log('Click')

                                    dataservice.insert($scope.model, function (rs) {
                                        if (rs.Error) {
                                            App.notifyDanger(rs.Title);
                                        } else {
                                            App.notifyInfo(rs.Title);
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
});

app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para, DTOptionsBuilder, DTColumnBuilder, DTInstances) {
    $scope.cancel = function () {
       // $uibModalInstance.dismiss('cancel');
        $uibModalInstance.close();
    }
    $scope.initData = function () {
        dataservice.getItem(para.id, function (rs) {
            if (rs.Error) {
                App.notifyDanger(rs.Title);
            } else {
                $scope.model = rs;
            }
        });
        dataservice.gettreedatacategory(function (result) {
            $scope.treeDatacategory = result.Object;
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
                    App.notifyDanger(caption.COM_MSG_FORMAT_PNG_JPG_JEG_GIF_BMP);
                } else {
                    var fi = document.getElementById('file');
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 1024) {
                        App.notifyDanger(caption.COM_MSG_MAXIMUM_FILE);
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
                                    App.notifyDanger(caption.COM_MSG_MAXIMUM_FILE_SIZE);
                                } else {
                                    console.log('Click')

                                    dataservice.update($scope.model, function (rs) {
                                        if (rs.Error) {
                                            App.notifyDanger(rs.Title);
                                        } else {
                                            App.notifyInfo(rs.Title);
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
                        App.notifyInfo(rs.Title);
                        $uibModalInstance.close();
                    }
                });
            }
        }
    }
    //bảng file
    $scope.model = {
        Key1: '',
        Key9:''
    }

    var vm = $scope;

    $scope.selected = {};
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.edit = edit;
    $scope.deleteItem = deleteItem;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    //begin option table
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/admin/RMJnanaNewsArticle/jTableFile",
            beforeSend: function (jqXHR, settings) {
                //App.blockUI({
                //    target: "#contentMain",
                //    boxed: true,
                //    message: 'loading...'
                //});
            },
            type: 'POST',
            data: function (d) {
                d.Key1 = $scope.model.Key1;
                d.postDate = $scope.model.postDate;
              
            },
            complete: function () {
                //App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('file_name').withTitle('{{"RMJNA_LIST_COL_FILE_NAME" | translate}}').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('file_note').withTitle('{{"RMJNA_LIST_COL_FILE_NOTE" | translate}}').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('file_path').withTitle('{{"RMJNA_LIST_COL_FILE_PATH" | translate}}').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('created_time').withTitle('{{"RMJNA_LIST_COL_TIME" | translate}}').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn("null").withTitle('{{"RMJNA_LIST_COL_ACTION" | translate}}').notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.id] = full;
            
            return '<p class="mt-checkbox" style ="margin-top:0px"><a ng-click="edit(selected[' + full.id + '])" style="padding-right:10px;" title="Cập nhật thông tin"><i class="fa fa-edit" style="font-size:18px"></i></a><a ng-click="deleteItem(selected[' + full.id + '])"   title="Xóa khoản mục"><i class="fa fa-remove" style="font-size:18px"></i></a></p>';
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
    function edit(selected) {
        var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/edit_file.html',
                controller: 'edit_file',
                backdrop: true,
                size: '100',
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
        $confirm({ text: caption.COM_MSG_DELETE_CONFIRM_COM, title: caption.COM_CONFIRM, cancel: caption.COM_CONFIRM_CANCEL })
                .then(function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                    dataservice.delete_file(selected.id, function (result) {
                        if (result.Error) {
                            App.toastrError(result.Title);
                            //alert(result.Title)
                        } else {
                            App.toastrSuccess(result.Title);
                            //alert(result.Title)
                            $scope.reload();
                        }
                        App.unblockUI("#contentMain");
                    });
                });
    }

    $scope.add_file = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add_file.html',
            controller: 'add_file',
            backdrop: true,
            size: '50'
        });

        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
            return $itemScope.data.id;
        });
    }
    $scope.edit_file = function () {
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
                    templateUrl: ctxfolder + '/edit_file.html',
                    controller: 'edit_file',
                    backdrop: 'static',
                    size: '100',
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
            $confirm({ text: caption.COM_MSG_DELETE_CONFIRM_COM, title: caption.COM_CONFIRM, ok: caption.COM_CONFIRM_OK, cancel: caption.COM_CONFIRM_CANCEL })
                .then(function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });

                    dataservice.deleteItems_file(deleteItems, function (result) {
                        if (result.Error) {
                            App.notifyDanger(result.Title);
                        } else {
                            App.notifyInfo(result.Title);
                            $scope.reload();
                        }
                        App.unblockUI("#contentMain");
                    });

                });
        } else {
            App.notifyDanger(caption.COM_MSG_UNSELECTED);
        }
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
      //  $scope.addBanking = false;
    }

    $scope.submitFile1 = function () {
        console.log(JSON.stringify($scope.model))

            dataservice.insert_fileno($scope.model, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                 //   $uibModalInstance.close();
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
    }, 200);
});



app.controller('add_file', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice) {
    $scope.names1 = [
        { value: "Tiếng Việt", language: "vi-VN" },
        { value: "Tiếng Anh", language: "en-US" }
    ];

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
                App.notifyDanger(caption.COM_MSG_FORMAT_DOCX_PDF);
            } else {
                var fi = document.getElementById('file');
                var fsize = (fi.files.item(0).size) / 1024;
                if (fsize > 102400) {
                    App.notifyDanger(caption.COM_MSG_MAXIMUM_FILE);
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
                        dataservice.insert_file($scope.model, function (rs) {
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            } else {
                                App.toastrSuccess(rs.Title);
                                $uibModalInstance.close();
                            }
                        });
                    }
                    //   }
                }
            }
        } else {
            console.log('Click else')
            dataservice.insert_file($scope.model, function (rs) {
                if (rs.Error) {
                    App.notifyDanger(rs.Title);
                } else {
                    App.notifyInfo(rs.Title);
                    $uibModalInstance.close();
                }
            });
        }
          }
    }
});

app.controller('edit_file', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para) {
    $scope.names1 = [
        { value: "Tiếng Việt", language: "vi-VN" },
        { value: "Tiếng Anh", language: "en-US" }
    ];

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.cancel1 = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $uibModalInstance.close();
    $scope.initData = function () {

        dataservice.getItemfile(para, function (rs) {
            console.log("RS: " + para);
            if (rs.Error) {
                App.notifyDanger(rs.Title);
            } else {
                $scope.model = rs;
                console.log('Data details: ' + JSON.stringify(rs))
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
                App.toastrError(caption.COM_MSG_FORMAT_DOCX_PDF);
            } else {
                var fi = document.getElementById('file');
                var fsize = (fi.files.item(0).size) / 1024;
                if (fsize > 1024) {
                    App.toastrError(caption.COM_MSG_MAXIMUM_FILE);
                } else {
                    var fileUpload = $("#file")[0];
                    var reader = new FileReader();
                    reader.readAsDataURL(fileUpload.files[0]);
                    reader.onloadend = function (e) {
                        var file1 = e.target.result;
                        console.log('Click')
                        dataservice.update_file($scope.model, function (rs) {
                            console.log("rs ne:: " + JSON.stringify(rs))
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            } else {
                                App.notifyInfo(rs.Title);
                                $uibModalInstance.close();
                            }
                        });
                    }
                }
            }
        } else {
            console.log('Click else')
            dataservice.update_file($scope.model, function (rs) {
                console.log("rs ne:: " + JSON.stringify(rs))
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {

                    App.notifyInfo(rs.Title);
                    $uibModalInstance.close();
                }
            });
        }
         }
    }
});
app.controller('addNotification', function ($scope, $rootScope, dataservice, $uibModal, $uibModalInstance, $http) {

    $scope.model = {};

    //$scope.initData = function () {
    //    dataservice.getDriver(para, function (rs) {
    //        if (rs.Error) {
    //            App.notifyDanger(rs.Title);
    //        } else {
    //            $scope.model = rs;
    //        }
    //    });

    //}
    //$scope.initData();

    //$scope.sentChecked = function () {

    //    console.log(JSON.stringify($scope.model))
    //    dataservice.SendPushNotification($scope.model, function (rs) {
    //        if (rs.Error) {
    //            App.notifyDanger(rs.Title);
    //        } else {
    //            App.notifyInfo(rs.Title);
    //            $uibModalInstance.close();
    //        }
    //    });
    //    dataservice.SaveMess($scope.model, function (rs) {
    //        if (rs.Error) {
    //            App.notifyDanger(rs.Title);
    //        } else {
    //            App.notifyInfo(rs.Title);
    //            $uibModalInstance.close();
    //        }
    //    });

    //}


    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
        console.log("cancel")
    }
});






