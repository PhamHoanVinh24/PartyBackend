var ctxfolder = "/views/admin/rmVayxeCatSevices";
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
        formData.append("id", data.id);
        formData.append("service_code", data.service_code != null ? data.service_code: '');
        formData.append("service_name", data.service_name != null ? data.service_name : "");
        formData.append("service_group_id", data.service_group_id != null ? data.service_group_id : "");
        formData.append("service_type_id", data.service_type_id != null ? data.service_type_id : "");
        formData.append("note", data.note != null ? data.note : "");
        formData.append("status", data.status != null ? data.status : "");
        formData.append("created_time", data.created_time != null ? data.created_time : null);
        formData.append("updated_time", data.updated_time != null ? data.updated_time : null);
        formData.append("flag", data.flag != null ? data.flag:"");
        formData.append("created_by", data.created_by != null ? data.created_by : "");
        formData.append("updated_by", data.updated_by != null ? data.updated_by : "");
        formData.append("illustrator_img", data.illustrator_img != null && data.illustrator_img.length > 0 ? data.illustrator_img[0] : null);


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
            submitFormUpload('/Admin/RMVayxeCatSevices/Insert', data, callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/RMVayxeCatSevices/Delete/' + data).success(callback);
        },
        update: function (data, callback) {
            submitFormUpload('/Admin/RMVayxeCatSevices/Update', data, callback);
        },
        
        getItem: function (data, callback) {
            $http.get('/Admin/RMVayxeCatSevices/getItem/' + data).success(callback);
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
        });
    });
    $rootScope.checkData = function (data) {
        var parttern = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        if (data.Email == "" || data.Email == undefined || parttern.test(data.Email)) {
            return { Status: false, Title: '' };
        } else {
            return { Status: true, Title: caption.COM_MSG_FORMAT_EMAIL };
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
app.controller('index', function ($scope, $rootScope, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {

    var vm = $scope;
    $scope.model = { obj: { Id: 0 } };
    $scope.selected = {};
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
            url: "/Admin/RMVayxeCatSevices/jtable",
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
   // vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        //.renderWith(function (data, type, full, meta) {
        //    $scope.selected[full.Id] = false;
        //    return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        //}).withOption('sWidth', '30px').withOption('sClass', 'tcenter'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('Id').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('service_code').withTitle('{{"RMVCS_LIST_COL_SERVICE_CODE" | translate }}').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('service_name').withTitle('{{"RMVCS_LIST_COL_SERVICE_NAME" | translate }}').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('created_time').withTitle('{{"RMVCS_LIST_COL_CREATED_TIME" | translate }}').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('note').withTitle('{{"RMVCS_LIST_COL_SERVICE_NOTE" | translate }}').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn("null").withTitle('{{"RMVCS_LIST_COL_NULL" | translate }}').notSortable()
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

    function edit(selected) {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit',
            backdrop: true,
            size: '50',
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
        $confirm({ text: caption.COM_MSG_DELETE_CONFIRM_COM, title: caption.COM_CONFIRM, ok: caption.COM_CONFIRM_OK, cancel: caption.COM_CONFIRM_CANCEL })
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

    $scope.reload = function () {
        reloadData(true);
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: true,
            size: '50'
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
        console.log("12a" + JSON.stringify(deleteItems));
        if (deleteItems.length > 0) {
            $confirm({ text: caption.COM_MSG_CHANGE_YES_NO, ok: caption.COM_CONFIRM_OK, cancel: caption.COM_CONFIRM_CANCEL })
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
            return '<i class="fa fa-edit"></i>{{"RMVCS_TITLE_UPDATE_INFORMATION" | translate}}';
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
            return '<i class="fa fa-remove"></i> {{"RMVCS_TITLE_DELETE" | translate}}';
        }, function ($itemScope, $event, model) {

            $confirm({ text: caption.COM_MSG_DELETE_CONFIRM_COM + ' ' + $itemScope.data.name_book, title: caption.COM_CONFIRM, cancel: caption.COM_CONFIRM_CANCEL })
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
        { value: caption.COM_MSG_FINISH, status: 1 },
        { value: caption.COM_MSG_UNFINISH, status: 2 },

    ];
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
        { value: caption.RMVCS_CURD_CB_PLACE, group_id: "TAI_CHO" },
        { value: caption.RMVCS_CURD_CB_FREELY, group_id: "LUU_DONG" }
    ];
    $scope.names2 = [
        { value: caption.RMVCS_CURD_CB_CHECKING_DAILY, type_id: "KIEM_TRA_DINH_KY" },
        { value: caption.RMVCS_CURD_CB_REPLACEMENT_ACCESSORIES, type_id: "THAY_THE_PHU_KIEN" },
        { value: caption.RMVCS_CURD_CB_WASH, type_id: "RUA_XE_THAY_NHOT" }
    ];

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        $confirm({ icon: '../../images/message/success.png', text: caption.RMVCS_MSG_ADD_SERVICE_CONFIRM, title: caption.COM_BTN_CONFIRM, cancel: caption.COM_CONFIRM_CANCEL })
            .then(function () {
               
        if ($scope.addform.validate()) {
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

app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para, DTOptionsBuilder, DTColumnBuilder, DTInstances) {

    $scope.names1 = [
        { value: caption.RMVCS_CURD_CB_PLACE, group_id: "TAI_CHO" },
        { value: caption.RMVCS_CURD_CB_FREELY, group_id: "LUU_DONG" }
    ];
    $scope.names2 = [
        { value: caption.RMVCS_CURD_CB_CHECKING_DAILY, type_id: "KIEM_TRA_DINH_KY" },
        { value: caption.RMVCS_CURD_CB_REPLACEMENT_ACCESSORIES, type_id: "THAY_THE_PHU_KIEN" },
        { value: caption.RMVCS_CURD_CB_WASH, type_id: "RUA_XE_THAY_NHOT" }
    ];
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.initData = function () {

        dataservice.getItem(para, function (rs) {
            console.log('rs ne: ' + JSON.stringify(rs))
            if (rs.Error) {
                App.notifyDanger(rs.Title);
            } else {
                $scope.model = rs;
                //  $scope.model.TaxiType = rs.Taxy_type;
            }
        });

    }
    $scope.initData();
    $scope.submit = function () {
        $confirm({ icon: '../../images/message/update.png', text: caption.RMVCS_MSG_EDIT_SERVICE_CONFIRM, title: caption.COM_BTN_CONFIRM, cancel: caption.COM_CONFIRM_CANCEL })
            .then(function () {
              
        if ($scope.editform.validate()) {

            var fileName = $('input[type=file]').val();
            //   console.log("ngafileName" + fileName);
            var idxDot = fileName.lastIndexOf(".") + 1;
            //  console.log("ngaidxDot" + idxDot);
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




});
