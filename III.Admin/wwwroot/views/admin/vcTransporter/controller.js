var ctxfolder = "/views/admin/vcTransporter";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngCookies", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select']);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    var submitFormUpload = function (url, data, callback) {
        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            data: data
        }
        $http(req).then(callback);
    };
    return {
        //uploadFile: function (data, callback) {
        //    submitFormUpload('/Admin/vcVendor/UploadFile/', data, callback);
        //},
        uploadImage: function (data, callback) {
            submitFormUpload('/Admin/vcTransporter/UploadImage/', data, callback);
        },
        getTransportWeight: function (callback) {
            $http.post('/Admin/vcTransporter/GetTransportWeight/').then(callback);
        },
        getOwnersHeader: function (callback) {
            $http.post('/Admin/vcTransporter/GetOwnersHeader/').then(callback);
        },
        insertTransporter: function (data, callback) {
            $http.post('/Admin/vcTransporter/InsertTransporter/', data).then(callback);
        },
        updateTransporter: function (data, callback) {
            $http.post('/Admin/vcTransporter/UpdateTransporter/', data).then(callback);
        },
        deleteTransporter: function (data, callback) {
            $http.post('/Admin/vcTransporter/DeleteTransporter?Id=' + data).then(callback);
        },
        getTransporterInfo: function (data, callback) {
            $http.post('/Admin/vcTransporter/GetTransporterInfo?Id=' + data).then(callback);
        },
    };
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };

    $rootScope.partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;
    $rootScope.partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/;
    //Miêu tả có thể null, và có chứa được khoảng trắng
    $rootScope.partternDescription = /^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*$/;
    $rootScope.partternDate = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;//Pormat dd/mm/yyyy
    $rootScope.partternEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    $rootScope.partternNumber = /^[0-9]\d*(\\d+)?$/; //Chỉ cho nhập số không âm
    $rootScope.partternFloat = /^-?\d*(\.\d+)?$/; //Số thực
    $rootScope.partternNotSpace = /^[^\s].*/; //Không chứa khoảng trắng đầu dòng hoặc cuối dòng
    $rootScope.partternPhone = /^(0)+([0-9]{9,10})\b$/; //Số điện thoại 10,11 số bắt đầu bằng số 0


    $rootScope.checkData = function (data) {
        var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;
        //var partternTelephone = /[0-9]/g;
        var mess = { Status: false, Title: "" }
        if (!partternCode.test(data.CusCode)) {
            mess.Status = true;
            mess.Title = mess.Title.concat(" - ", "Mã khách hàng không chứa ký tự đặc biệt hoặc khoảng trắng!", "<br/>");
        }
        return mess;
    }
    $rootScope.validationOptions = {
        rules: {
            CusCode: {
                required: true,
                maxlength: 50
            },
            CusName: {
                required: true,
                maxlength: 255
            },
            Address: {
                required: true,
                maxlength: 500
            },
            TaxCode: {
                //required: true,
                maxlength: 100
            }
        },
        messages: {
            CusCode: {
                required: 'Nhập mã khách hàng!',
                maxlength: 'Mã khách hàng không vượt quá 50 kí tự!'
            },
            CusName: {
                required: 'Nhâp tên khách hàng!',
                maxlength: 'Tên khách hàng không vượt quá 255 kí tự!'
            },
            Address: {
                required: 'Nhập địa chỉ của khách hàng!',
                maxlength: 'Địa chỉ không được quá 500 kí tự!'
            },
            TaxCode: {
                maxlength: 'Mã số thuế không được quá 100 kí tự!'
            }

        }
    }
});

app.config(function ($routeProvider, $validatorProvider) {
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/add', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
        })
        .when('/contact-add', {
            templateUrl: ctxfolder + '/contact_add.html',
            controller: 'contact_add'
        })
        .when('/file-add', {
            templateUrl: ctxfolder + '/file_add.html',
            controller: 'file_add'
        })

    $validatorProvider.setDefaults({
        errorElement: 'span',
        errorClass: 'help-block',
        errorPlacement: function (error, element) {
            if (element.parent('.input-group').length) {
                error.insertAfter(element.parent());
            } else if (element.prop('type') === 'radio' && element.parent('.radio-inline').length) {
                error.insertAfter(element.parent().parent());
            } else if (element.prop('type') === 'checkbox' || element.prop('type') === 'radio') {
                error.appendTo(element.parent().parent());
            } else {
                error.insertAfter(element);
            }
        },
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

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.ManagerStatuss = [
        {
            Code: 'true',
            Name: 'Đã có chủ'
        },
        {
            Code: 'false',
            Name: 'Chưa có'
        }
    ]
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        CustomerCode: '',
        CustomerName: '',
        CustomerPhone: '',
        CustomerEmail: '',
        CustomerGroup: '',
        CustomerActivityStatus: '',
        Address: ''
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/vcTransporter/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.LicensePlate = $scope.model.LicensePlate;
                d.CustomType = $scope.model.CustomType;
                d.Owner = $scope.model.Owner;
                d.OwnerName = $scope.model.OwnerName;
                d.IsOwned = $scope.model.ManagerStatus;
            },
            complete: function () {
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
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LicensePlate').withTitle('Biển số xe').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CustomTypeTxt').withTitle('Loại xe').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Owner').withTitle('Mã khách hàng').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('OwnerName').withTitle('Chủ sở hữu').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('InsurranceDuration').withTitle('Thời hạn bảo hiểm').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('RegistryDuration').withTitle('Thời gian đăng ký').notSortable().renderWith(function (data, type, full) {
        if (data == "ACTIVE") {
            return '<span class="text-success"> Hoạt động</span>';
        } else if (data == "DEACTIVE") {
            return '<span class="text-danger">Không hoạt động</span>';
        } else {
            return data;
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('Thao tác').withOption('sClass', '').renderWith(function (data, type, full, meta) {
        return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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


    $scope.initLoad = function () {
        //dataservice.getCustomerGroup(function (rs) {
        //    $scope.CustomerGroup = rs;
        //})
        dataservice.getTransportWeight(function (rs) {
            $scope.TransporterTypes = rs.Object;
        })
    }
    $scope.initLoad();
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.search = function () {
        reloadData(true);
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/addTransporter.html',
            controller: 'addTransporter',
            backdrop: 'static',
            size: '70'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    };
    $scope.edit = function (id) {
        //$rootScope.CustomerId = id;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/editTransporter.html',
            controller: 'editTransporter',
            backdrop: 'static',
            size: '70',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () { });
    };
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = "Bạn có chắc chắn muốn xóa ?";
                $scope.ok = function () {
                    dataservice.deleteTransporter(id, function (rs) {
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
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
    }, 200);
});
app.controller('addTransporter', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.IsUploadImage = false;
    $scope.Groups = [
        {
            Code: 'G1',
            Name: 'Nhóm 1'
        },
        {
            Code: 'G2',
            Name: 'Nhóm 2'
        },
        {
            Code: 'G3',
            Name: 'Nhóm 3'
        }
    ];
    $scope.model = {
        LicensePlate: '',
        CustomType: ''
    }
    $scope.initLoad = function () {
        dataservice.getTransportWeight(function (rs) {
            $scope.TransporterTypes = rs.Object;
        })
        dataservice.getOwnersHeader(function (rs) {
            $scope.Owners = rs.Object;

        })
        //if ($rootScope.model1.Role == "DISTRIBUTOR") {
        //    dataservice.getBrands(function (rs) {
        //        $scope.Brands = rs.Object;
        //    })
        //    dataservice.getProducts(function (rs) {
        //        $scope.Products = rs.Object;
        //    })
        //}
        //else if ($rootScope.model1.Role == "AGENT") {
        //    dataservice.getDistributors(function (rs) {
        //        $scope.Distributors = rs.Object;
        //    });

        //}
        //else if ($rootScope.model1.Role == "SHOP") {
        //    dataservice.getDistributorsAgents(function (rs) {
        //        $scope.Distributors = rs.Object;
        //    });

        //}
    }
    $scope.initLoad();
    $scope.cancel = function () {
        $uibModalInstance.dismiss("cancel");
    };
    $scope.changleSelect = function (type) {
        if (type == "customType") {
            $scope.errorCustomType = false;
        }
    }
    $scope.uploadImage = function () {
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
                App.toastrError(caption.COM_MSG_INVALID_FORMAT);
                return;
            }
            $scope.IsUploadImage = true;
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click');
        $scope.IsUploadImage = false;
    }
    $scope.submit = function () {
        //validationSelect($scope.model);
        if (validationSelect($scope.model).Status == false) {
            var msg = $rootScope.checkData($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
            if ($scope.IsUploadImage == true) {
                var fileName = $('input[type=file]').val();
                var idxDot = fileName.lastIndexOf(".") + 1;
                var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
                //console.log('Name File: ' + extFile);
                if (extFile !== "") {
                    if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                        //App.toastrError(caption.CATEGORY_MSG_FORMAT_REQUIRED);
                        App.toastrError("Chọn sai định dạng ảnh");
                    } else {
                        var fi = document.getElementById('file');
                        var fsize = (fi.files.item(0).size) / 1024;
                        if (fsize > 1024) {
                            //App.toastrError(caption.CATEGORY_MSG_FILE_SIZE_MAXXIMUM);
                            App.toastrError("Ảnh không được > 1M");
                        } else {
                            var fileUpload = $("#file").get(0);
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
                                    if (width > 5000 || height > 5000) {
                                        //App.toastrError(caption.CATEGORY_MSG_IMG_SIZE_MAXIMUM);
                                        App.toastrError("Kích thước ảnh phải < 500 x 500");
                                    } else {
                                        var data = new FormData();
                                        file = fileUpload.files[0];
                                        data.append("FileUpload", file);
                                        dataservice.uploadImage(data, function (rs) {
                                            if (rs.Error) {
                                                App.toastrError(rs.Title);
                                                return;
                                            }
                                            else {

                                                $scope.model.Image = '/uploads/images/' + rs.Object;
                                                console.log($scope.model);
                                                dataservice.insertTransporter($scope.model, function (rs) {
                                                    if (rs.Error) {
                                                        App.toastrError(rs.Title);
                                                    } else {
                                                        App.toastrSuccess(rs.Title);
                                                        $uibModalInstance.close();
                                                    }
                                                });
                                            }
                                        })
                                    }
                                };
                            }
                        }
                    }
                } else {
                    
                    dataservice.insertTransporter($scope.model, function (rs) {
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                        }
                    });
                }
                //}
            }
            else {
                dataservice.insertTransporter($scope.model, function (rs) {
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
    function loadDate() {
        $("#RegistryDuration").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $("#InsurranceDuration").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.CustomType == "") {
            $scope.errorCustomType = true;
            mess.Status = true;
        } else {
            $scope.errorCustomType = false;

        }

        return mess;
    };
    setTimeout(function () {
        loadDate();
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('editTransporter', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter, para) {
    $scope.Groups = [
        {
            Code: 'G1',
            Name: 'Nhóm 1'
        },
        {
            Code: 'G2',
            Name: 'Nhóm 2'
        },
        {
            Code: 'G3',
            Name: 'Nhóm 3'
        }
    ];
    $scope.IsUploadImage = false;
    $scope.initLoad = function () {
        dataservice.getTransportWeight(function (rs) {
            $scope.TransporterTypes = rs.Object;
            dataservice.getTransporterInfo(para, function (rs) {
                $scope.model = rs.Object;
            })
        })
        dataservice.getOwnersHeader(function (rs) {
            $scope.Owners = rs.Object;
        })
    }
    $scope.initLoad();
    $scope.submit = function () {
        //validationSelect($scope.model);

        if (validationSelect($scope.model).Status == false) {
            var msg = $rootScope.checkData($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
            if ($scope.IsUploadImage == true) {
                var fileName = $('input[type=file]').val();
                var idxDot = fileName.lastIndexOf(".") + 1;
                var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
                //console.log('Name File: ' + extFile);
                if (extFile !== "") {
                    if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                        //App.toastrError(caption.CATEGORY_MSG_FORMAT_REQUIRED);
                        App.toastrError("Chọn sai định dạng ảnh");
                    } else {
                        var fi = document.getElementById('file');
                        var fsize = (fi.files.item(0).size) / 1024;
                        if (fsize > 1024) {
                            //App.toastrError(caption.CATEGORY_MSG_FILE_SIZE_MAXXIMUM);
                            App.toastrError("Ảnh không được > 1M");
                        } else {
                            var fileUpload = $("#file").get(0);
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
                                    if (width > 5000 || height > 5000) {
                                        //App.toastrError(caption.CATEGORY_MSG_IMG_SIZE_MAXIMUM);
                                        App.toastrError("Kích thước ảnh phải < 500 x 500");
                                    } else {
                                        var data = new FormData();
                                        file = fileUpload.files[0];
                                        data.append("FileUpload", file);
                                        dataservice.uploadImage(data, function (rs) {
                                            if (rs.Error) {
                                                App.toastrError(rs.Title);
                                                return;
                                            }
                                            else {

                                                $scope.model.Image = '/uploads/images/' + rs.Object;
                                                console.log($scope.model);
                                                dataservice.updateTransporter($scope.model, function (rs) {
                                                    if (rs.Error) {
                                                        App.toastrError(rs.Title);
                                                    } else {
                                                        App.toastrSuccess(rs.Title);
                                                        $uibModalInstance.close();
                                                    }
                                                });
                                            }
                                        })
                                    }
                                };
                            }
                        }
                    }
                } else {
                    dataservice.updateTransporter($scope.model, function (rs) {
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                        }
                    });
                }
                //}
            }
            else {
                dataservice.updateTransporter($scope.model, function (rs) {
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
        $uibModalInstance.dismiss("cancel");
    };
    $scope.uploadImage = function () {
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
                App.toastrError(caption.COM_MSG_INVALID_FORMAT);
                return;
            }
            $scope.IsUploadImage = true;
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click');
    }
    $scope.changleSelect = function (type) {
        if (type == "customType") {
            $scope.errorCustomType = false;
        }
    }
    function loadDate() {
        $("#RegistryDuration").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $("#InsurranceDuration").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
    }
    function validationSelect(data) {
        
        var mess = { Status: false, Title: "" };
        if (data.CustomType == "") {
            $scope.errorCustomType = true;
            mess.Status = true;
        } else {
            $scope.errorCustomType = false;

        }
        //if (data.LicensePlate == "") {
        //    $scope.errorLicensePlate = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorLicensePlate = false;

        //}
        return mess;
    };
    setTimeout(function () {
        loadDate();
        setModalDraggable('.modal-dialog');
    }, 200);
});
