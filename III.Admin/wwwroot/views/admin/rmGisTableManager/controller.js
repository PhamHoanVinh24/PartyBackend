var ctxfolder = "/views/admin/rmGisTableManager";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select']).directive("filesInput", function () {
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
            $http.post('/Admin/RMVayxeCatSevices/Insert', data).success(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/RMVayxeCatSevices/Delete/' + data).success(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/RMVayxeCatSevices/Update', data).success(callback);
        },
        
        getItem: function (data, callback) {
            $http.get('/Admin/RMVayxeCatSevices/getItem/' + data).success(callback);
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
    $scope.model = { CreatedDate:''};
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
            url: "/Admin/RMGisTableManager/jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.CreateDate = $scope.model.CreateDate;
                d.Ngay_gio_den = $scope.model.Ngay_gio_den;
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('Id').withOption('sClass', 'sorting_disabled').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Code').withTitle('Mã (Code)').withOption('sClass', 'sorting_disabled').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('Tên bãi').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Parent').withTitle('Parent').renderWith(function (data, type, full) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Type').withTitle('Type').renderWith(function (data, type, full) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('NodeGis').withTitle('Dữ liệu bản đồ').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
           
        return'<textarea style = "width: 100%;" rows = "3">' + data + '</textarea> ';
        //return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('Người tạo').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('Ngày tạo').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
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
            backdrop: true,
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
        $confirm({ text: 'Bạn có chắc chắn muốn xóa khoản mục đã chọn?', title: 'Xác nhận', ok: 'Chắc chắn', cancel: ' Hủy ' })
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

    $scope.reload = function () {
        reloadData(true);
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: true,
            size: '80'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.viewMap = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/google-map.html',
            controller: 'google-map',
            backdrop: true,
            size: '90',
            resolve: {
                para: function () {
                    return '';
                }
            }
        });
        modalInstance.result.then(function (d) {
            
        }, function () { });
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
    $scope.contextMenu = [
        [function ($itemScope) {
            return '<i class="fa fa-edit"></i>Cập nhật thông tin';
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
            return '<i class="fa fa-remove"></i> Xóa sổ';
        }, function ($itemScope, $event, model) {

            $confirm({ text: 'Bạn có chắc chắn xóa sổ: ' + $itemScope.data.name_book, title: 'Xác nhận', cancel: ' Hủy ' })
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
                            App.notifyInfo(result.Title);
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
            var str = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + point.lat + ',' + point.lng + '&sensor=true&key=AIzaSyAn-5Fd7KH4e78m1X7SNj5gayFcJKDoUow';
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
       
        initMap();
        setModalDraggable('.modal-dialog');
    }, 200)
});
