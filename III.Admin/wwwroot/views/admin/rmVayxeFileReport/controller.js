var ctxfolder = "/views/admin/RMVayxeFileReport";
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
            submitFormUpload('/Admin/RMVayxeCustomer/insert', data, callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/RMVayxeCustomer/Delete/' + data).success(callback);
        },
        update: function (data, callback) {
            submitFormUpload('/Admin/RMVayxeCustomer/update', data, callback);
        },
        deleteItems: function (data, callback) {
            $http.post('/Admin/RMVayxeCustomer/DeleteItems', data).success(callback);
        },
        lockUser: function (data, callback) {
            $http.post('/DidiCustomer/lockUser/' + data).success(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/RMVayxeCustomer/getItem/' + data).success(callback);
        },  
        resort: function (data, callback) {
            $http.post('/Booking/resort', data).success(callback);
        },
        getTypeTaxi: function (callback) {
            $http.post('/Booking/getTaxiCarAll/').success(callback);
        },
        getUser: function (data,callback) {
            $http.post('/DidiCustomer/getUser/'+ data).success(callback);
        },
        getCountTrip: function (callback) {
            $http.post('/Booking/getCountTripNow/').success(callback);
        },
        getCountTripArea: function (data,callback) {
            $http.post('/Booking/getCountTripArea/').success(callback);
        },
        getCountTripNowRun: function (callback) {
            $http.post('/Booking/getCountTripNowRun/').success(callback);
        },
        getCountTripEnd: function (callback) {
            $http.post('/Booking/getCountTripEnd/').success(callback);
        },
        getCountTripDestroy: function (callback) {
            $http.post('/Booking/getCountTripDestroy/').success(callback);
        }
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    $rootScope.checkData = function (data) {
        var parttern = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        if (data.Email == "" || data.Email == undefined  || parttern.test(data.Email)) {
            return { Status: false, Title: '' };
        } else {
            return { Status: true, Title: 'Định dạng Email chưa đúng vui lòng nhập lại' };
        }
    }
    $rootScope.validationOptions = {
        rules: {
            FirstName: {
                required: true,
                maxlength: 255
            },
            LastName: {
                required: true,
                maxlength: 255
            },
            Phone: {
                required: true,
                maxlength: 50
            },
            Email: {
                required: true,
                maxlength: 255
            }
          
        },
        messages: {
            FirstName: {
                required: "Yêu cầu nhập tên.",
                maxlength: "Tên không vượt quá 255 ký tự."
            },
            LastName: {
                required: "Yêu cầu nhập tên.",
                maxlength: "Tên không vượt quá 255 ký tự."
            },
            Phone: {
                required: "Yêu cầu nhập số điện thoại.",
                maxlength: "Số điện thoại không vượt quá 50 ký tự."
            },
            Email: {
                required: "Yêu cầu nhập Email",
                maxlength: "Email không vượt quá 255 ký tự."
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
app.config(function ($routeProvider, $validatorProvider) {
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
});
app.controller('index', function ($scope, $rootScope, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice,$filter) {

    var vm = $scope;
    $scope.model = { obj: { Id: 0 } };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;  
    $scope.DateNow = $filter("date")(new Date(), "dd/MM/yyyy"),
    
    $scope.model = {
        Key: ''     
        }

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/RMVayxeCustomer/jtable",
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
                //search theo ngay hom nay
                var DateNow = new Date();
                d.StartDate = new Date(DateNow.getFullYear(), DateNow.getMonth(), DateNow.getDate() + 0); // ngay hom nay
                d.EndDate = new Date(DateNow.getFullYear(), DateNow.getMonth(), DateNow.getDate() + 1);// ngay mai
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(15)
        .withOption('order', [1, 'desc'])
        .withOption('serverSide', true)
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiled) {
                $scope.headerCompiled = true;
                $compile(angular.element(header).contents())($scope);
            }
        })
        .withOption('initComplete', function (settings, json) {
            $(this.api().table().header()).css({ 'background-color': '#1a2226', 'color': '#f9fdfd', 'font-size': '8px', 'font-weight': 'bold' });
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).find('input'))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('Id').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('Họ Tên').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Phone').withTitle('Số Điện Thoại').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Email').withTitle('Email').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Avatar').withTitle('Hình ảnh').renderWith(function (data, type) {
        return '<img src="' + data + '" class="img-responsive">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Social').withTitle('Loại Tài Khoản').renderWith(function (data, type) {
        var x = "";
        if (data == 0) {
            x = "Hệ thống"
        }
        if (data == 1) {
            x = "Facebook"
        }
        return x;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('Tình Trạng').renderWith(function (data, type) {
        var x = "";
        if (data == 1) {
            x = '<p style="color:green">Hoạt động</p>'
        }
        if (data == 0) {
            x = '<p style="color:red">Khóa</p>';
        }      
        return x;
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
            backdrop: true,
            size: '80'
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
            $confirm({ text: "Bạn có muốn thay đổi trạng thái không?",  ok: "Có", cancel: "Không" })
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
            return '<i class="fa fa-remove"></i> Khóa người dùng';
        }, function ($itemScope, $event, model) {

            $confirm({ text: 'Bạn có chắc chắn khóa người dùng: ' + $itemScope.data.Name, title: 'Xác nhận', cancel: ' Hủy ' })
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

});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, $filter) {

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {        
        if ($scope.addform.validate()) {
            var temp = $rootScope.checkData($scope.model);
            if (temp.Status) {
                App.toastrError(temp.Title);
                return;
            }
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
                    if (fsize > (1024*3)) {
                        App.toastrError("Maximum allowed file size is 3 MB !");
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
                                if (width > 700 || height > 700) {
                                    App.toastrError("Maximum allowed file size is (700px x 700px)!");
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
    }
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para) {
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

        if ($scope.editform.validate()) {
            //if ($scope.selectedTypeCar == "Didi Vip") {
            //    $scope.model.Taxy_type = 3
            //}
            //if ($scope.selectedTypeCar == "Didi Taxi") {
            //    $scope.model.Taxy_type = 1
            //}
            //if ($scope.selectedTypeCar == "Didi Car") {
            //    $scope.model.Taxy_type = 2
            //}
            //if ($scope.selectedTypeCar == "Xe máy") {
            //    $scope.model.Taxy_type = 4
            //}
            //if ($scope.selectedTypeCar == "Xe tải") {
            //    $scope.model.Taxy_type = 5
            //}

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
                                    dataservice.update($scope.model, function (rs) {
                                        console.log("rs ne:: " + JSON.stringify(rs))
                                        if (rs.Error) {
                                            App.toastrError(rs.Title);
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
                        App.toastrError(rs.Title);
                    } else {
                        App.notifySuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                });
            }
        }
    }

});

