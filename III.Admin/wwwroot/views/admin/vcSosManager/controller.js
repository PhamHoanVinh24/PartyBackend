var ctxfolder = "/views/admin/vcSosManager";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute",  "ngCookies" ,"ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', "pascalprecht.translate"]).directive("filesInput", function () {
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
            $http.post('/VayxeCatSevices/Insert', data).success(callback);
        },

        deleteItemById: function (data, callback) {

            $http.post('/Admin/vcSosManager/DeleteItemById?Id=' + data).success(callback);
        },
        update: function (data, callback) {
            $http.post('/VayxeCatSevices/Update', data).success(callback);
        },

        getItem: function (data, callback) {
            $http.get('/VayxeCatSevices/getItem/' + data).success(callback);
        },
        getSosInfo: function (data, callback) {
            $http.post('/Admin/vcSosManager/GetSosInfo?Id=' + data).success(callback);
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
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture); 
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
    });
    $rootScope.checkData = function (data) {
        var parttern = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        if (data.Email == "" || data.Email == undefined || parttern.test(data.Email)) {
            return { Status: false, Title: '' };
        } else {
            return { Status: true, Title: 'Định dạng Email chưa đúng vui lòng nhập lại' };
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
        .when('/google-map/', {
            templateUrl: ctxfolder + '/google-map.html',
            controller: 'google-map'
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
    $scope.model = { CreatedDate: '' };
    var vm = $scope;
    $scope.selected = [];
    $scope.model = { obj: { Id: 0 } };

    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.edit = edit;
    //$scope.deleteItem = deleteItem;
    $scope.DateNow = $filter("date")(new Date(), "dd/MM/yyyy"),

        $scope.model = {
            Key: ''
        }

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/admin/VCSosManager/jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
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

            //$compile(angular.element(row).find('input'))($scope);
            $compile(angular.element(row).contents())($scope);


            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var row = $(evt.target).closest('tr');
                    // data key value
                    var key = row.attr("data-id");
                    // cell values
                    var Id = data.Id;
                    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                        $scope.selected[data.Id] = !$scope.selected[data.Id];
                    } else {
                        var self = $(this).parent();
                        $('#tblData').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.Id] = true;
                        dataservice.getSosInfo(Id, function (rs) {
                            if (rs.Error) {
                                App.notifyDanger(rs.Title);
                            } else {
                                if (rs.Object.imgList.length > 0) {
                                    var modalInstance = $uibModal.open({
                                        animation: true,
                                        templateUrl: ctxfolder + '/slideImage.html',
                                        controller: 'slideImage',
                                        backdrop: 'true',
                                        size: '60',
                                        resolve: {
                                            para: function () {
                                                return rs.Object;
                                            }
                                        }
                                    });
                                }
                                else {
                                    App.notifyDanger(caption.COM_NOT_IMAGE);
                                }
                            }
                        });


                    }
                    $scope.$apply();
                }
            });
        });

    vm.dtColumns = [];
     vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
    .renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Code').withTitle('{{"VCLC_SOS_LIST_COL_KEY_SOSCODE" | translate }}').withOption('sClass', 'sorting_disabled').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"VCLC_SOS_LIST_COL_TITLE" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Data').withTitle('{{"VCLC_SOS_LIST_COL_LOCATION" | translate }}').renderWith(function (data, type, full) {
        return '<a href="" ng-click=viewMap(' + data + ')>' + data + '</a>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Address').withTitle('{{"VCLC_SOS_LIST_COL_ADDRESS" | translate }}').renderWith(function (data, type, full) {
        return data;
        //if (data == 'null' || data == 'undefined')
        //    return '';
        //else

        //return '<a href="#" ng-click=viewMap(' + data + ')>' + data+'</a>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"VCLC_SOS_LIST_COL_TIME" | translate }}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy HH:mm:ss') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Priority').withTitle('{{"VCLC_SOS_LIST_COL_LEVEL" | translate }}').renderWith(function (data, type) {
        if (data == "1") {
            return '<span class="text-danger">Cao</span>';
        } else if (data == "2") {
            return '<span class="text-danger">Trung bình</span>';
        } else if (data == "3") {
            return '<span class="text-success">Thấp</span>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"VCLC_SOS_LIST_COL_MANIPULATION" | translate }}').withOption('sClass', '').renderWith(function (data, type, full, meta) {
        return '<button title="Xoá" ng-click="deleteItemById(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }));


    //vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('Chú thích').renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Created_by').withTitle('Người tạo').renderWith(function (data, type) {
    //    return '<a href="#" ng-click=viewHistory(' + data + ')>' + data+'</a>';;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Created_Time').withTitle('Thời gian').renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn("null").withTitle('Tác vụ').notSortable()
    //    .renderWith(function (data, type, full, meta) {
    //        vm.selected[full.Id] = full;
    //        return '<a  ng-click="edit(selected[' + full.Id + '])" style="padding-right:10px;" title="Cập nhật thông tin"><i class="fa fa-edit" style="font-size:18px"></i></a><a ng-click="deleteItem(selected[' + full.Id + '])" style="padding-right:10px"  title="Xóa dịch vụ"><i class="fa fa-remove" style="font-size:18px" ></i></a>';
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

    function edit(selected) {

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

    $scope.deleteItemById = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deleteItemById(id, function (rs) {

                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                            reloadData(false);
                        }
                    });
                };

                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            size: '25',
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () {
        });
    };
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '80'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.viewMap = function (data) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/google-map.html',
            controller: 'google-map',
            backdrop: 'static',
            size: '60',
            resolve: {
                para: function () {
                    return data;
                }
            }
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
            $confirm({ text: "Bạn có muốn thay đổi xóa sổ không?", ok: "Có", cancel: "Không" })
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
                            App.notifyInfo(rs.Title);
                            setTimeout(function () { $scope.reload() }, 1000);
                        }
                    });
                });
        } else {
            App.notifyDanger(caption.ERR_NOT_CHECKED.replace('{0}', caption.USER.toLowerCase()));
        }
    }

    $scope.typeC = [
        { value: "Chưa hoàn thành", status: 1 },
        { value: "Hoàn thành", status: 2 },

    ];
    //function showHideSearch() {
    //    $(".btnSearch").click(function () {
    //        $(".input-search").removeClass('hidden');
    //        $(".btnSearch").hide();
    //    });
    //    $(".close-input-search").click(function () {
    //        $(".input-search").addClass('hidden');
    //        $(".btnSearch").show();
    //    });
    //}
    function loadDate() {
        $.fn.datepicker.defaults.language = 'vi';
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
        //showHideSearch();
        loadDate();
    }, 200);
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice) {
    $scope.names1 = [
        { value: "Tại chỗ", group_id: "1" },
        { value: "Lưu động", group_id: "2" }
    ];
    $scope.names2 = [
        { value: "Kiểm tra định kỳ", type_id: "1" },
        { value: "Thay thế phụ kiện", type_id: "2" },
        { value: "Rửa xe, thay nhớt", type_id: "3" }
    ];
    $scope.names3 = [
        { value: "Có", status1: 1 },
        { value: "Không", status1: 0 }
    ];
    $scope.names = ["Taxi 4 chỗ", "Taxi 7 chỗ", "Xe khách 29 chỗ", "Xe khách 32 chỗ", "Xe khách 45 chỗ"];
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        if ($scope.addform.validate()) {
            var fileName = $('input[type=file]').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            console.log('Name File: ' + extFile);
            if (extFile != "") {
                if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                    App.toastrError("Format required is png, jpg, jpeg, gif, bmp!");
                } else {
                    var fi = document.getElementById('file');
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 1024) {
                        App.toastrError("Maximum allowed file size is 1 MB !");
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
                                    App.toastrError("Maximum allowed file size is (1000px x 1000px)!");
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
                console.log('Click else')


                dataservice.insert($scope.model, function (rs) {
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

app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para, DTOptionsBuilder, DTColumnBuilder, DTInstances) {
    $scope.names1 = [
        { value: "Tại chỗ", group_id: "1" },
        { value: "Lưu động", group_id: "2" }
    ];
    $scope.names2 = [
        { value: "Kiểm tra định kỳ", type_id: "1" },
        { value: "Thay thế phụ kiện", type_id: "2" },
        { value: "Rửa xe, thay nhớt", type_id: "3" }
    ];
    $scope.names3 = [
        { value: "Có", status1: 1 },
        { value: "Không", status1: 0 }
    ];
    $scope.names = ["Taxi 4 chỗ", "Taxi 7 chỗ", "Xe khách 29 chỗ", "Xe khách 32 chỗ", "Xe khách 45 chỗ"];
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

        if ($scope.editform.validate()) {

            var fileName = $('input[type=file]').val();
            //   console.log("ngafileName" + fileName);
            var idxDot = fileName.lastIndexOf(".") + 1;
            //  console.log("ngaidxDot" + idxDot);
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            console.log('Name File: ' + extFile);
            if (extFile != "") {
                if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                    App.toastrError("Format required is png, jpg, jpeg, gif, bmp!");
                } else {
                    var fi = document.getElementById('file');
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 1024) {
                        App.toastrError("Maximum allowed file size is 1 MB !");
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
                                    App.toastrError("Maximum allowed file size is (1000px x 1000px)!");
                                } else {
                                    console.log('Click')
                                    dataservice.update($scope.model, function (rs) {
                                        console.log("rs ne:: " + JSON.stringify(rs))
                                        if (rs.Error) {
                                            App.toastrError(rs.Title);
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
app.controller('detail', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

});
app.controller('google-map', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter, para) {
    console.log(para);
    var lat = '';
    var lng = '';
    var address = '';
    $rootScope.map = {
        Lat: '',
        Lng: '',
        Address: ''
    }
    $scope.model = {
        Lat: '',
        Lng: ''
    }
    $scope.initLoad = function () {
        debugger
        fields_vector_source = new ol.source.Vector({});
        var center = ol.proj.transform([105.808124, 20.991484], 'EPSG:4326', 'EPSG:3857');
        map = new ol.Map({
            target: $('#map')[0],

            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM({
                        url: 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'


                    })
                }),
                new ol.layer.Vector({
                    source: fields_vector_source
                })
            ],

            view: new ol.View({
                center: center,
                zoom: 15

            }),

            controls: ol.control.defaults({
                attribution: false,
                zoom: false,
            })
        });
        var pathGG = $('#pathGG').html();
        var id = $("#ID").html();
        var aaa = parseInt(id);
        if (pathGG != "" && pathGG != null) {
            pathSourceVector = new ol.source.Vector({
                features: []
            });
            pathLayerMarker = new ol.layer.Vector({
                source: pathSourceVector
            });
            var path = polyline.decode(pathGG);

            pathLayerMarker = renderLinePathLayer(path);
            map.addLayer(pathLayerMarker);

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

            var vectorLayer = new ol.layer.Vector({
                source: vectorIcon,
                style: styles3
            });

            map.addLayer(vectorLayer);
            pathSource.addFeature(renderLineStringFeature(path))
            var field_location = pathSource.getFeatureById(aaa).getProperties();
            var field_extent = field_location.geometry.getExtent();
            map.getView().fit(field_extent, map.getSize());
            map.getView().setZoom(12);
        }
    }
    $scope.initLoad();
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.submit = function () {
        $rootScope.map.Address = $("#Address").val();
        $rootScope.map.Lat = lat;
        $rootScope.map.Lng = lng;
        $rootScope.map.Address = address;
        $uibModalInstance.close();
    }

    function initMap() {
        debugger
        if (para) {
            lat = parseFloat(para.split(',')[0]);
            lng = parseFloat(para.split(',')[1]);
        }

        var centerPoint = { lat: lat == '' ? 16.05465498484808 : lat, lng: lng == '' ? 107.53517201377485 : lng };
        var maps = new google.maps.Map(
            document.getElementById('map'), { zoom: 8, center: centerPoint });
        maps.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('startPlace'));
        var marker = new google.maps.Marker({
            position: centerPoint,
            map: maps
        });
        var defaultBounds = new google.maps.LatLngBounds(new google.maps.LatLng(-33.8902, 151.1759), new google.maps.LatLng(-33.8474, 151.2631));
        var options = {
            bounds: defaultBounds,
            types: ['geocode']
        };
        var autocomplete = new google.maps.places.Autocomplete(document.getElementById('startPlace'), options);
        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            var place = autocomplete.getPlace();
            lat = place.geometry.location.lat();
            lng = place.geometry.location.lng();
            address = document.getElementById("startPlace").value;
            console.log(lat + ',' + lng);
            maps.setCenter({ lat: lat, lng: lng });
            if (marker) {
                marker.setPosition({ lat: lat, lng: lng });
            }
            else {
                marker = new google.maps.Marker({
                    position: { lat: lat, lng: lng },
                    map: maps
                });
            }
            maps.setZoom(10);
        });

        maps.addListener('click', function (event) {
            var point = { lat: event.latLng.lat(), lng: event.latLng.lng() }
            var str = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + point.lat + ',' + point.lng + '&sensor=true&key=AIzaSyDHceKL6LCQusky6nFYduGFGcg4UKyTI6o';
            lat = point.lat;
            lng = point.lng;

            $.getJSON(str, function (data) {
                address = data.results[0].formatted_address;
                document.getElementById("startPlace").value = address;
            });
            if (marker) {
                marker.setPosition(point);
            }
            else {
                marker = new google.maps.Marker({
                    position: point,
                    map: maps
                });
            }
            maps.setZoom(10);
        })
    }
  
    setTimeout(function () {
        debugger
        fields_vector_source = new ol.source.Vector({});
        var lat = para[0];
        var lng = para[1];
        var pr = [lng, lat];
        var center = ol.proj.transform([lng,lat], 'EPSG:4326', 'EPSG:3857');
        map = new ol.Map({
            target: $('#map')[0],

            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM({
                        url: 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'


                    })
                }),
                new ol.layer.Vector({
                    source: fields_vector_source
                })
            ],

            view: new ol.View({
                center: center,
                zoom: 17

            }),

            controls: ol.control.defaults({
                attribution: false,
                zoom: false,
            })
        });
        var iconStyleStart = new ol.style.Style({
            image: new ol.style.Icon(({
                anchor: [0.5, 26],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                src: 'https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2.png'
            })),
            zIndex: 11
        });
        var iconFeatureStart = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857')),
            type: "valve"
        });
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
        iconFeatureStart.setId(1);
        iconFeatureStart.setStyle(iconStyleStart);
        var vectorIcon = new ol.source.Vector({});
        vectorIcon.addFeature(iconFeatureStart);
        var vectorLayer = new ol.layer.Vector({
            source: vectorIcon,
            style: styles3
        });
        map.addLayer(vectorLayer);
    }, 100);
});
app.controller('slideImage', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter, para) {
    console.log(para);
    var fisrtImg = [];
    if (para.imgList.length > 0)
        fisrtImg.push(para.imgList[0]);
    var nextImgs = [];
    for (var i = 1; i < para.imgList.length; ++i)
        nextImgs.push(para.imgList[i]);
    $scope.model = {
        header: para.header,
        fisrtImg: fisrtImg,
        nextImgs: nextImgs
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
});

app.controller('google-map1', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter, para) {
    var lat = '';
    var lng = '';
    var address = '';
    $rootScope.map = {
        Lat: '',
        Lng: '',
        Address: ''
    }
    $scope.model = {
        Lat: '',
        Lng: ''
    }
    $scope.initLoad = function () {
        fields_vector_source = new ol.source.Vector({});
        var center = ol.proj.transform([$rootScope.lngDefault, $rootScope.latDefault], 'EPSG:4326', 'EPSG:3857');
        map = new ol.Map({
            target: $('#map')[0],

            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM({
                        url: 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'


                    })
                }),
                new ol.layer.Vector({
                    source: fields_vector_source
                })
            ],

            view: new ol.View({
                center: center,
                zoom: 15

            }),

            controls: ol.control.defaults({
                attribution: false,
                zoom: false,
            })
        });
        var pathGG = $('#pathGG').html();
        var id = $("#ID").html();
        var aaa = parseInt(id);
        if (pathGG != "" && pathGG != null) {
            pathSourceVector = new ol.source.Vector({
                features: []
            });
            pathLayerMarker = new ol.layer.Vector({
                source: pathSourceVector
            });
            var path = polyline.decode(pathGG);

            pathLayerMarker = renderLinePathLayer(path);
            map.addLayer(pathLayerMarker);

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

            var vectorLayer = new ol.layer.Vector({
                source: vectorIcon,
                style: styles3
            });

            map.addLayer(vectorLayer);


            //pathSource = new ol.source.Vector({});


            pathSource.addFeature(renderLineStringFeature(path))
            var field_location = pathSource.getFeatureById(aaa).getProperties();
            var field_extent = field_location.geometry.getExtent();
            map.getView().fit(field_extent, map.getSize());
            map.getView().setZoom(12);
        }
    }
    $scope.initLoad();
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.submit = function () {
        //$rootScope.map.Address = $("#Address").val();
        $rootScope.map.Lat = lat;
        $rootScope.map.Lng = lng;
        $rootScope.map.Address = address;
        $uibModalInstance.close();
    }
    function initMap() {
        debugger
        if (para) {
            if (para.GoogleMap) {
                //lat = parseFloat(para.GoogleMap.split(',')[0]);
                //lng = parseFloat(para.GoogleMap.split(',')[1]);
                lat = parseFloat(para[0]);
                lng = parseFloat(para[1]);
                address = para.Address;
                document.getElementById("startPlace").value = para.Address;
            }
        } else {
            lat = $rootScope.latDefault;
            lng = $rootScope.lngDefault;
            address = $rootScope.adressDefault;
            document.getElementById("startPlace").value = $rootScope.addressDefault;
        }
        var centerPoint = { lat: lat == '' ? $rootScope.latDefault : lat, lng: lng == '' ? $rootScope.lngDefault : lng };
        var maps = new google.maps.Map(
            document.getElementById('map'), { zoom: $rootScope.zoomMap, center: centerPoint });
        maps.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('startPlace'));
        var marker = new google.maps.Marker({
            position: centerPoint,
            map: maps
        });

        //maps.addListener('zoom_changed', function () {
        //    console.log('Zoom: ' + maps.getZoom());
        //});

        var defaultBounds = new google.maps.LatLngBounds(new google.maps.LatLng(-33.8902, 151.1759), new google.maps.LatLng(-33.8474, 151.2631));
        var options = {
            bounds: defaultBounds,
            types: ['geocode']
        };
        var autocomplete = new google.maps.places.Autocomplete(document.getElementById('startPlace'), options);
        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            var place = autocomplete.getPlace();
            lat = place.geometry.location.lat();
            lng = place.geometry.location.lng();
            address = document.getElementById("startPlace").value;
            console.log(lat + ',' + lng);
            maps.setCenter({ lat: lat, lng: lng });
            if (marker) {
                marker.setPosition({ lat: lat, lng: lng });
            }
            else {
                marker = new google.maps.Marker({
                    position: { lat: lat, lng: lng },
                    map: maps
                });
            }
            maps.setZoom($rootScope.zoomMap);
        });

        maps.addListener('click', function (event) {
            var point = { lat: event.latLng.lat(), lng: event.latLng.lng() }
            var str = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + point.lat + ',' + point.lng + '&sensor=true&key=AIzaSyDHceKL6LCQusky6nFYduGFGcg4UKyTI6o';
            lat = point.lat;
            lng = point.lng;

            $.getJSON(str, function (data) {
                address = data.results[0].formatted_address;
                document.getElementById("startPlace").value = address;
            });
            if (marker) {
                marker.setPosition(point);
            }
            else {
                marker = new google.maps.Marker({
                    position: point,
                    map: maps
                });
            }
            maps.setZoom($rootScope.zoomMap);
        })
    }
    setTimeout(function () {
        initMap();
    }, 200)
});

