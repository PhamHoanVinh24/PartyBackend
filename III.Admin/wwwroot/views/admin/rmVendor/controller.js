var ctxfolder = "/views/admin/RMVendor";
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
       
        formData.append("Company_Code", data.Company_Code != null ? data.Company_Code:"");
        formData.append("Company_Contact", data.Company_Contact != null ? data.Company_Contact : "");
        formData.append("Company_Name", data.Company_Name != null ? data.Company_Name : "");
        formData.append("Company_Owner", data.Company_Owner != null ? data.Company_Owner : "");
        formData.append("Company_Phone", data.Company_Phone != null ? data.Company_Phone : "");
        formData.append("Company_Type", data.Company_Type != null ? data.Company_Type : "");
        formData.append("Company_Website", data.Company_Website != null ? data.Company_Website : "");
        formData.append("Description", data.Description != null ? data.Description : "");
        
        formData.append("UpdateBy", data.UpdateBy != null ? data.UpdateBy : "");
        formData.append("CreateBy", data.CreateBy != null ? data.CreateBy : "");
        formData.append("Company_Image", data.Company_Image != null && data.Company_Image.length > 0 ? data.Company_Image[0] : null);


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
            submitFormUpload('/Admin/RMVendor/insert', data, callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/RMVendor/Delete/' + data).success(callback);
        },
        update: function (data, callback) {
            submitFormUpload('/Admin/RMVendor/update', data, callback);
        },
        deleteItems: function (data, callback) {
            $http.post('/Admin/RMVendor/DeleteItems', data).success(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/RMVendor/getItem/' + data).success(callback);
        },
        insertBanking: function (data, callback) {
            $http.post('/Admin/RMVendor/InsertBanking', data).success(callback);
        },
        getItemBanking: function (data, callback) {
            $http.get('Vendor/getItemBanking/' + data).success(callback);
        },
        UpdateBanking: function (data, callback) {
            $http.post('Vendor/UpdateBanking', data).success(callback);
        },
        DeleteBanking: function (data, callback) {
            $http.post('Vendor/DeleteBanking/' + data).success(callback);
        },
        GetAllPacking: function (callback) {
            $http.post('/Remooc/GetAllPacking/').success(callback);
        },
        InsertParking: function (data, callback) {
            $http.post('/Remooc/InsertParking/', data).success(callback);
        },
        GetIdPacking: function (data, callback) {
            $http.post('/Remooc/GetIdPacking?id=' + data).success(callback);
        },

        DeleteParking: function (data, callback) {
            $http.post('Vendor/DeleteParking/' + data).success(callback);
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
            Company_Code: {
                required: true,
                maxlength: 50
            },
            Company_Name: {
                required: true,
                maxlength: 255
            },

          
        },
        messages: {
            Company_Code: {
                required: "Yêu cầu nhập mã công ty",
                maxlength: "Không vượt quá 50 ký tự."
            },
            Company_Name: {
                required: "Yêu cầu nhập tên công ty",
                maxlength: "Không vượt quá 250 ký tự."
            },

          
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
    $scope.deactive = deactive;
    $scope.active = active;
    $scope.DateNow = $filter("date")(new Date(), "dd/MM/yyyy"),

        $scope.model = {
            Key: ''
        }

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/RMVendor/jtable",
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
                d.ten = $scope.model.Ten;
                d.ma = $scope.model.Ma;
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
            $compile(angular.element(row).contents())($scope);

            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm.dtColumns = [];
    //vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
    //    .renderWith(function (data, type, full, meta) {
    //        $scope.selected[full.Id] = false;
    //        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    //    }).withOption('sWidth', '30px').withOption('sClass', 'tcenter'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('Id').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Company_Code').withTitle('Mã công ty').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Company_Name').withTitle('Tên công ty').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Company_Owner').withTitle('Chủ công ty').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Company_Contact').withTitle('Người đại diện').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Company_Phone').withTitle('Số điện thoại').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Company_Website').withTitle('Website').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }).withOption('sWidth', '120px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Company_Image').withTitle('Hình ảnh').renderWith(function (data, type) {
        var dt = '<img style="width:64px; height:64px" src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" +' class="img-responsive">';
        console.log(dt);
        return dt;
        //return '<img style="width:64px; height:64px" src="' + data + '" class="img-responsive"' + ' onerror="this.src=' + '"/images/avatar_default.png"' + '"' + '>';

    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Flag').withTitle('Trạng thái').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else {
            var x = "";
            if (data == 1){
                return '<p style="color:green"> Hoạt động</p>';
            }
            else
                return '<p style="color:red"> Khóa</p>';
        }
    }).withOption('sWidth', '120px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn("null").withTitle('Tác vụ').notSortable()
        .renderWith(function (data, type, full, meta) {
            vm.selected[full.Id] = full;
            if (full.Flag == 0){
                return '<label class="mt-checkbox"><a ng-click="edit(selected[' + full.Id + '])" style="padding-right:10px;" title="Cập nhật thông tin"><i class="fa fa-edit" style="font-size:20px"></i></a><a ng-click="active(selected[' + full.Id + '])"   title="Mở khóa"><i class="fa fa-lock" style="font-size:20px" ></i></a></label>';
            }
            else{
                return '<label class="mt-checkbox"><a ng-click="edit(selected[' + full.Id + '])" style="padding-right:10px;" title="Cập nhật thông tin"><i class="fa fa-edit" style="font-size:20px"></i></a><a ng-click="deactive(selected[' + full.Id + '])"   title="Khóa"><i class="fa fa-unlock" style="font-size:20px" ></i></a></label>';
            }
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

    $scope.reload = function () {
        reloadData(true);
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: true,
            size: '60'
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
            backdrop: true,
            size: '60',
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

    function deactive(selected) {
        $confirm({ icon: '../../images/message/lockscreen.png', text: 'Bạn có chắc chắn khóa khách hàng: ' + selected.Company_Name, title: 'Xác nhận', cancel: ' Hủy ' })
            .then(function () {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
                dataservice.delete(selected.Id, function (result) {
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
    }
    function active(selected) {
        $confirm({ icon: '../../images/message/unlock-icon.png', text: 'Bạn có chắc chắn mở khóa khách hàng: ' + selected.Company_Name, title: 'Xác nhận', cancel: ' Hủy ' })
            .then(function () {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
                dataservice.delete(selected.Id, function (result) {
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
    }

    //$scope.contextMenu = [            
    //    [function ($itemScope) {
    //        return '<i class="fa fa-edit"></i>Cập nhật thông tin';
    //    }, function ($itemScope, $event, model) {
    //        var modalInstance = $uibModal.open({
    //            animation: true,
    //            templateUrl: ctxfolder + '/edit.html',
    //            controller: 'edit',
    //            backdrop: true,
    //            size: 'lg',
    //            resolve: {
    //                para: function () {
    //                    return $itemScope.data.Id;
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
    //        return '<i class="fa fa-remove"></i> Khóa người dùng';
    //    }, function ($itemScope, $event, model) {

    //        $confirm({ text: 'Bạn có chắc chắn khóa người dùng: ' + $itemScope.data.Company_Name, title: 'Xác nhận', cancel: ' Hủy ' })
    //            .then(function () {
    //                App.blockUI({
    //                    target: "#contentMain",
    //                    boxed: true,
    //                    message: 'loading...'
    //                });
    //                dataservice.delete($itemScope.data.Id, function (result) {
    //                    if (result.Error) {
    //                        App.notifyDanger(result.Title);
    //                        //alert(result.Title)
    //                    } else {
    //                        App.notifySuccess(result.Title);
    //                        //alert(result.Title)
    //                        $scope.reload();
    //                    }
    //                    App.unblockUI("#contentMain");
    //                });
    //            });
    //    }, function ($itemScope, $event, model) {
    //        return true;
    //    }]
    //];

});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, $filter) {

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        $confirm({ icon: '../../images/message/success.png', text: 'Bạn có chắc chắn thêm mới khách hàng ?', title: 'Xác nhận', cancel: ' Hủy ' })
            .then(function () {
             
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
                        if (fsize > (1024 * 3)) {
                            App.notifyDanger("Độ lớn của file không quá 3 MB !");
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
                                        App.notifyDanger("Độ lớn file không quá (1000px x 1000px)!");
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
              
            });
    }
});
app.controller('edit', function ($scope, $rootScope, $compile, $confirm, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, dataservice, para) {
    $scope.model = {
        Id: '',
        Ex_Code: '',
        Ex_Value: '',
        Ex_Lable: '',
        Description: '',
        parking: '',
        Company_Code: '',
        Company_Name: '',
        Company_Owner: '',
        Company_Contact: '',
        Company_Phone: '',
        Company_Website: '',
        Company_Type: '',
        Description:'',

    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.listParking = [];
    $scope.addBanking = false;
    $scope.editBanking = false;
    $scope.AddBankingBtn = function () {

        $scope.addBanking = $scope.addBanking ? false : true;
        $scope.editBanking = false;
        $scope.BankingBtn = true;

    }
    $scope.initData = function () {
        dataservice.getItem(para, function (rs) {
            console.log("RS: " + para);
            if (rs.Error) {
                App.notifyDanger(rs.Title);
            } else {
               // $scope.model = rs[0];

                $scope.model.Id = rs[0].Id;
                $scope.model.Company_Code = rs[0].Company_Code != null ? rs[0].Company_Code:'';
                $scope.model.Company_Contact = rs[0].Company_Contact != null ? rs[0].Company_Contact : '';
                $scope.model.Company_Image = rs[0].Company_Image != null ? rs[0].Company_Image : '';
                $scope.model.Company_Name = rs[0].Company_Name != null ? rs[0].Company_Name : '';
                $scope.model.Company_Owner = rs[0].Company_Owner != null ? rs[0].Company_Owner : '';
                $scope.model.Company_Phone = rs[0].Company_Phone != null ? rs[0].Company_Phone : '';
                $scope.model.Company_Type = rs[0].Company_Type != null ? rs[0].Company_Type : '';
                $scope.model.Company_Website = rs[0].Company_Website != null ? rs[0].Company_Website : '';
                $scope.model.Description = rs[0].Description != null ? rs[0].Description : '';


                console.log('Data details: ' + JSON.stringify(rs))
            }
        });

        dataservice.GetAllPacking(function (rs) {
            $scope.listParking = rs;
        });
    }
    $scope.initData();
    $scope.submit = function () {
        $confirm({ icon: '../../images/message/update.png', text: 'Bạn có chắc chắn cập nhật thông tin khách hàng ?', title: 'Xác nhận', cancel: ' Hủy ' })
            .then(function () {
               
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
                                        App.notifyDanger("Chọn file không quá (1000px x 1000px)!");
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
             
            });
    }

    var vm = $scope;
    $scope.model = { obj: { Id: 0 } };
    $scope.selected = {};
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.editbanking = editbanking;
    $scope.deletebanking = deletebanking;
    $scope.deleteParking = deleteParking;
    $scope.model = {
        KeyParking: para,
    }

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptionsBanking = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/RMVendor/jtableBanking",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                if ($scope.model.KeyParking != "")
                    d.KeyParking = $scope.model.KeyParking;

                if ($scope.model.Obj_Id != undefined)
                    d.KeyParking = $scope.model.Obj_Id;
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
           // $(this.api().table().header()).css({ 'background-color': '#1a2226', 'color': '#f9fdfd', 'font-size': '8px', 'font-weight': 'bold' });
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenuBanking;
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm.dtColumnsBanking = [];
    //vm.dtColumnsBanking.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
    //    .renderWith(function (data, type, full, meta) {
    //        $scope.selected[full.Id] = false;
    //        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    //    }).withOption('sWidth', '30px').withOption('sClass', 'tcenter'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('Id').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumnsBanking.push(DTColumnBuilder.newColumn('Ex_Code').withTitle('Mã ngân hàng').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsBanking.push(DTColumnBuilder.newColumn('Ex_Value').withTitle('Tài khoản').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsBanking.push(DTColumnBuilder.newColumn('Ex_Lable').withTitle('Lable').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumnsBanking.push(DTColumnBuilder.newColumn('Description_Ex').withTitle('Mô tả').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsBanking.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('Ngày tạo').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsBanking.push(DTColumnBuilder.newColumn("null").withTitle('Tác vụ').notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = full;

            return '<p class="mt-checkbox" style ="margin-top:0px"><a ng-click="editbanking(selected[' + full.Id + '])"  style="padding-right:10px;" title="Cập nhật thông tin tài khoản banking"><i class="fa fa-edit" style="font-size:18px"></i></a><a ng-click="deletebanking(selected[' + full.Id + '])" title="Xóa tài khoản banking"><i class="fa fa-remove" style="font-size:18px"></i></a></p>';
        }).withOption('sWidth', '120px').withOption('sClass', 'tcenter'));
    vm.reloadData = reloadDataBanking;
    vm.dtInstanceBanking = {};
    function reloadDataBanking(resetPaging) {
        vm.dtInstanceBanking.reloadData(callback, resetPaging);
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

    $scope.reloadBanking = function () {
        reloadDataBanking(true);
    }
    $scope.submitBanking = function () {
        $confirm({ icon: '../../images/message/success.png', text: 'Bạn có chắc chắn thêm tài khoản banking?', title: 'Xác nhận', cancel: ' Hủy ' })
            .then(function () {
               
        dataservice.insertBanking($scope.model, function (rs) {
            console.log("rs ne:: " + JSON.stringify(rs))
            if (rs.Error) {
                App.notifyDanger(rs.Title);
            } else {
                App.notifySuccess(rs.Title);
                $scope.reloadBanking();
            }
                });
       
            });
    }

    function editbanking(selected) {
        $scope.addBanking = false;
        $scope.editBanking = true;
        $confirm({ icon: '../../images/message/update.png', text: 'Bạn có chắc chắn cập nhật tài khoản banking?', title: 'Xác nhận', cancel: ' Hủy ' })
            .then(function () {
              
                dataservice.getItemBanking(selected.Id, function (rs) {
                    console.log("RS: " + selected.Id);
                    if (rs.Error) {
                        App.notifyDanger(rs.Title);
                    } else {
                        $scope.model = rs[0];
                        console.log('Data details: ' + JSON.stringify(rs))
                    }
                });
             
            });
    }
    function deletebanking(selected) {
        $confirm({ text: 'Bạn có chắc chắn xóa: ' + selected.Ex_Code, title: 'Xác nhận', cancel: ' Hủy ' })
            .then(function () {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
                dataservice.DeleteBanking(selected.Id, function (result) {
                    if (result.Error) {
                        App.notifyDanger(result.Title);
                        //alert(result.Title)
                    } else {
                        App.notifySuccess(result.Title);
                        //alert(result.Title)
                        $scope.reloadBanking();
                    }
                    App.unblockUI("#contentMain");
                });
            });
    }
    //$scope.contextMenuBanking = [
    //    [function ($itemScope) {
    //        return '<i class="fa fa-edit"></i>Cập nhật tài khoản banking';
    //    }, function ($itemScope, $event, model) {

    //    }, function ($itemScope, $event, model) {
    //        return true;
    //    }],
    //    [function ($itemScope) {
    //        return '<i class="fa fa-remove"></i> Xóa tài khoản banking';
    //    }, function ($itemScope, $event, model) {

    //        $confirm({ text: 'Bạn có chắc chắn xóa: ' + $itemScope.data.Ex_Code, title: 'Xác nhận', cancel: ' Hủy ' })
    //            .then(function () {
    //                App.blockUI({
    //                    target: "#contentMain",
    //                    boxed: true,
    //                    message: 'loading...'
    //                });
    //                dataservice.DeleteBanking($itemScope.data.Id, function (result) {
    //                    if (result.Error) {
    //                        App.notifyDanger(result.Title);
    //                        //alert(result.Title)
    //                    } else {
    //                        App.notifySuccess(result.Title);
    //                        //alert(result.Title)
    //                        $scope.reloadBanking();
    //                    }
    //                    App.unblockUI("#contentMain");
    //                });
    //            });
    //    }, function ($itemScope, $event, model) {
    //        return true;
    //    }]
    //];
    $scope.updateBanking = function () {
        dataservice.UpdateBanking($scope.model, function (rs) {
            console.log("rs ne:: " + JSON.stringify(rs))
            if (rs.Error) {
                App.notifyDanger(rs.Title);
            } else {
                App.notifySuccess(rs.Title);
                $scope.reloadBanking();

            }
        });
    }

    $scope.model = {
        KeyParking: para,
    }

    vm.dtOptionsParking = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/RMVendor/jtableParking",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                debugger
                if ($scope.model.KeyParking != "")
                    d.KeyParking = $scope.model.KeyParking;

                if ($scope.model.Id != undefined)
                    d.KeyParking = $scope.model.Id;
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
           // $(this.api().table().header()).css({ 'background-color': '#1a2226', 'color': '#f9fdfd', 'font-size': '8px', 'font-weight': 'bold' });
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenuParking;
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    vm.dtColumnsParking = [];
    //vm.dtColumnsParking.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
    //    .renderWith(function (data, type, full, meta) {
    //        $scope.selected[full.Id] = false;
    //        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    //    }).withOption('sWidth', '30px').withOption('sClass', 'tcenter'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('Id').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumnsParking.push(DTColumnBuilder.newColumn('title').withTitle('Bãi xe').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsParking.push(DTColumnBuilder.newColumn('Description').withTitle('Mô tả').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsParking.push(DTColumnBuilder.newColumn('Gis_data').withTitle('Vị trí').renderWith(function (data, type) {
        var a = JSON.parse(data).gis_data;
        return '<textarea style = "width: 100%;" rows = "3">'+a+'</textarea> ';
        return a;

    }));
    vm.dtColumnsParking.push(DTColumnBuilder.newColumn('CreateDate').withTitle('Ngày tạo').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsParking.push(DTColumnBuilder.newColumn("null").withTitle('Tác vụ').notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = full;

            return '<p class="mt-checkbox" style ="margin-top:0px"><a ng-click="deleteParking(selected[' + full.Id + '])" title="Xóa bãi đỗ"><i class="fa fa-remove" style="font-size:18px"></i></a></p>';
        }).withOption('sWidth', '10px').withOption('sClass', 'tcenter'));
    vm.reloadData = reloadDataParking;
    vm.dtInstanceParking = {};
    function reloadDataParking(resetPaging) {
        vm.dtInstanceParking.reloadData(callback, resetPaging);
    }
    $scope.reloadParking = function () {
        reloadDataParking(true);
    }
    function callback(json) {

    }

    function deleteParking(selected) {
        $confirm({ text: 'Bạn có chắc chắn xóa: ' + selected.title, title: 'Xác nhận', cancel: ' Hủy ' })
            .then(function () {
                
                dataservice.DeleteParking(selected.Id, function (result) {
                    if (result.Error) {
                        App.notifyDanger(result.Title);
                        //alert(result.Title)
                    } else {
                        App.notifySuccess(result.Title);
                        //alert(result.Title)
                        $scope.reloadParking();
                    }
               
                });
            });
    }
    //$scope.contextMenuParking = [
    //    [function ($itemScope) {
    //        return '<i class="fa fa-remove"></i> Xóa bãi đỗ';
    //    }, function ($itemScope, $event, model) {

    //        $confirm({ text: 'Bạn có chắc chắn xóa: ' + $itemScope.data.title, title: 'Xác nhận', cancel: ' Hủy ' })
    //            .then(function () {
    //                App.blockUI({
    //                    target: "#contentMain",
    //                    boxed: true,
    //                    message: 'loading...'
    //                });
    //                dataservice.DeleteParking($itemScope.data.Id, function (result) {
    //                    if (result.Error) {
    //                        App.notifyDanger(result.Title);
    //                        //alert(result.Title)
    //                    } else {
    //                        App.notifySuccess(result.Title);
    //                        //alert(result.Title)
    //                        $scope.reloadParking();
    //                    }
    //                    App.unblockUI("#contentMain");
    //                });
    //            });
    //    }, function ($itemScope, $event, model) {
    //        return true;
    //    }]
    //];
    $scope.reloadParking = function () {
        reloadDataParking(true);
    }

    $scope.insertParking = function (id_Parking) {
        $confirm({ text: 'Bạn có chắc chắn thêm bãi xe?', title: 'Xác nhận', cancel: ' Hủy ' })
            .then(function () {
               
        dataservice.GetIdPacking(id_Parking, function (rs) {
            if (rs.Error) {
                App.notifyDanger("Không có bãi xe nào. Mời chọn lại!");
            } 
            var model = {};

            model = rs.Object;

            model.Id = 0
            model.Company_Code = $scope.model.Company_Code

            dataservice.InsertParking(model, function (rs) {
                if (rs.Error) {
                    App.notifyDanger(rs.Title);
                } else {
                    App.notifySuccess(rs.Title);

                    $scope.reloadParking();
                }
                
            });
        });
       
            });
    }
});


