var ctxfolder = "/views/admin/vcProductCategory";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
app.factory('dataservice', function ($http) {
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose"
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

        $http(req).success(callback);
    };
    return {
        insert: function (data, callback) {
            $http.post('/Admin/VCProductCategory/Insert', data, callback).success(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/VCProductCategory/Update', data).success(callback);
        },
        deleteItems: function (data, callback) {
            $http.post('/Admin/VCProductCategory/DeleteItems', data).success(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/VCProductCategory/Delete/' + data).success(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/VCProductCategory/GetItem/' + data).success(callback);
        },
        getItemDetail: function (data, callback) {
            $http.get('/Admin/VCProductCategory/GetItemDetail/' + data).success(callback);
        },
        getproductgroup: function (callback) {
            $http.post('/Admin/VCProductCategory/GetProductGroup/').success(callback);
        },
        gettreedataLevel: function (callback) {
            $http.post('/Admin/VCProductCategory/GetProductUnit/').success(callback);
        },
        uploadImage: function (data, callback) {
            submitFormUpload('/Admin/VCProductCategory/UploadImage/', data, callback);
        },
        uploadFile: function (data, callback) {
            submitFormUpload('/Admin/VCProductCategory/UploadFile/', data, callback);
        }
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, $confirm, DTColumnBuilder, DTInstances, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    $rootScope.checkData = function (data) {
        var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;
        // var partternCode = new RegExp("^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$");
        //var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
        var mess = { Status: false, Title: "" }
        if (!partternCode.test(data.ProductCode)) {
            mess.Status = true;
            mess.Title = mess.Title.concat(" - ", "Mã sản phẩm không chứa ký tự đặc biệt hoặc khoảng trắng", "<br/>");
        }
        return mess;
    }
    $rootScope.validationOptions = {
        rules: {
            ProductCode: {
                required: true,
                maxlength: 50
            },
            ProductName: {
                required: true,
                maxlength: 200
            },
            Unit: {
                required: true,
                maxlength: 100
            },
        },
        messages: {
            ProductCode: {
                required: "Nhập sản phẩm!",
                maxlength: "Mã sản phẩm không vượt quá 100 kí tự!"
            },
            ProductName: {
                required: "Nhập tên sản phẩm!",
                maxlength: "Tên sản phẩm không vượt quá 200 kí tự!"
            },
            Unit: {
                required: "Nhập đơn vị!",
                maxlength: "Đơn vị không vượt quá 200 kí tự!"
            },

        }
    }
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Language/Translation');
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
});
app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $http) {
    var vm = $scope;
    $scope.model = {
        Product_Code: '',
        Product_Name: '',
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/VCProductCategory/Jtable",
            beforeSend: function (jqXHR, settings) {
                resetCheckbox();
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProductCode = $scope.model.ProductCode;
                d.ProductName = $scope.model.ProductName;
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
            $compile(angular.element(row).contents())($scope);
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductCode').withTitle('Mã sản phẩm').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductName').withTitle('Tên sản phẩm').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductGroupName').withTitle('Phân khúc sản phẩm').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PathImg').withTitle('Ảnh').renderWith(function (data, type) {
        //return data === "" || data == null ? '<img class="img - circle" src="/images/default/no_image.png" height="65" width="65">' : '<img class="img-circle" src="' + data + '" height="65" width="65">';
        return '<img class="img-circle" src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="65" width="65">';
    }).withOption('sWidth', '50px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('Mô tả').renderWith(function (data, type) {
        return data;
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
    function resetCheckbox() {
        $scope.selected = [];
        vm.selectAll = false;
    }

    $scope.reloadNoResetPage = function () {
        reloadData(false);
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
            size: '60',

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
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = "Bạn có chắc chắn muốn xóa ?";
                $scope.ok = function () {
                    dataservice.delete(id, function (rs) {
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                            $uibModalInstance.close();
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
    }, 50);
});

app.controller('add', function ($scope, $rootScope, dataservice, $uibModal, $uibModalInstance, $http) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.model = {
        ProductCode: '',
        ProductName: '',
        Unit: '',
        ProductGroup: '',
        FileName: '',
        PathFile: '',
    };

    $scope.initData = function () {
        dataservice.gettreedataLevel(function (result) {
            $scope.treedataLevel = result;
        });
        dataservice.getproductgroup(function (result) {
            $scope.productgroup = result;
        });
    }
    $scope.initData();
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "ProductGroup" && $scope.model.ProductGroup != "") {
            $scope.errorProductGroup = false;
        }
        if (SelectType == "Unit" && $scope.model.Unit != "") {
            $scope.errorUnit = false;
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
                App.toastrError("Định dạng ảnh không hợp lệ!");
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click');
    }
    $scope.submit = function () {
        if ($scope.addform.validate()) {
            var msg = $rootScope.checkData($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
            var fileName = $('input[type=file]').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            //check ảnh
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            if (extFile !== "") {
                if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                    App.toastrError("Format required is png, jpg, jpeg, gif, bmp!");
                } else {
                    var fi = document.getElementById('file');
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 1024) {
                        App.toastrError("Kích thước tệp tối đa cho phép là 1 MB !");
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
                                    App.toastrError("Kích thước ảnh tối đa là (1000px x 1000px)!");
                                } else {
                                    // thỏa mãn ảnh
                                    //Upload hướng dẫn sử dụng file
                                    var file = document.getElementById("File").files[0];

                                    if (file == null || file == undefined) {

                                        //Insert data
                                        var data1 = new FormData();
                                        file = fileUpload.files[0];
                                        data1.append("FileUpload", file);
                                        dataservice.uploadImage(data1, function (rs) {
                                            if (rs.Error) {
                                                App.toastrError(rs.Title);
                                                return;
                                            }
                                            else {
                                                $scope.model.PathImg = '/uploads/Images/' + rs.Object;
                                                funcSubmit($scope.model);
                                            }
                                        })

                                    } else {
                                        var idxDot = file.name.lastIndexOf(".") + 1;
                                        var name = file.name.substr(0, idxDot - 1).toLowerCase();
                                        var extFile = file.name.substr(idxDot, file.name.length).toLowerCase();

                                        var formData = new FormData();
                                        formData.append("file", file);
                                        var excel = ['xlsm', 'xlsx', 'xlsb', 'xltx', 'xltm', 'xls', 'xlt', 'xls', 'xml', 'xml', 'xlam', 'xla', 'xlw', 'xlr', 'csv'];
                                        var txt = ['txt'];
                                        var word = ['docx', 'doc'];
                                        var pdf = ['pdf'];
                                        var png = ['png', 'jpg'];
                                        var powerPoint = ['pps', 'pptx'];
                                        if (excel.indexOf(extFile) !== -1) {
                                            extFile = 1;
                                        } else if (word.indexOf(extFile) !== -1) {
                                            extFile = 2;
                                        } else if (txt.indexOf(extFile) !== -1) {
                                            extFile = 3;
                                        } else if (pdf.indexOf(extFile) !== -1) {
                                            extFile = 4;
                                        } else if (powerPoint.indexOf(extFile) !== -1) {
                                            extFile = 5;
                                        } else if (png.indexOf(extFile) !== -1) {
                                            extFile = 6;
                                        } else {
                                            extFile = 0;
                                        }
                                        if (extFile == 0) {
                                            App.toastrError("Định dạng tệp tin hướng dẫn sử dụng không cho phép");
                                        } else {
                                            //Insert data
                                            var data1 = new FormData();
                                            file = fileUpload.files[0];
                                            data1.append("FileUpload", file);
                                            dataservice.uploadImage(data1, function (rs) {
                                                if (rs.Error) {
                                                    App.toastrError(rs.Title);
                                                    return;
                                                }
                                                else {
                                                    $scope.model.PathImg = '/uploads/Images/' + rs.Object;

                                                    dataservice.uploadFile(formData, function (rs) {
                                                        if (rs.Error) {
                                                            App.toastrError(rs.Title);
                                                            return;
                                                        }
                                                        else {
                                                            $scope.model.PathFile = '/uploads/Files/' + rs.Object;
                                                            funcSubmit($scope.model);
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    }

                                }
                            };
                        }
                    }
                }
            } else {
                //Upload hướng dẫn sử dụng file
                var file = document.getElementById("File").files[0];

                if (file == null || file == undefined) {
                    funcSubmit($scope.model);
                } else {
                    var idxDot = file.name.lastIndexOf(".") + 1;
                    var name = file.name.substr(0, idxDot - 1).toLowerCase();
                    var extFile = file.name.substr(idxDot, file.name.length).toLowerCase();

                    var formData = new FormData();
                    formData.append("file", file);
                    var excel = ['xlsm', 'xlsx', 'xlsb', 'xltx', 'xltm', 'xls', 'xlt', 'xls', 'xml', 'xml', 'xlam', 'xla', 'xlw', 'xlr', 'csv'];
                    var txt = ['txt'];
                    var word = ['docx', 'doc'];
                    var pdf = ['pdf'];
                    var png = ['png', 'jpg'];
                    var powerPoint = ['pps', 'pptx'];
                    if (excel.indexOf(extFile) !== -1) {
                        extFile = 1;
                    } else if (word.indexOf(extFile) !== -1) {
                        extFile = 2;
                    } else if (txt.indexOf(extFile) !== -1) {
                        extFile = 3;
                    } else if (pdf.indexOf(extFile) !== -1) {
                        extFile = 4;
                    } else if (powerPoint.indexOf(extFile) !== -1) {
                        extFile = 5;
                    } else if (png.indexOf(extFile) !== -1) {
                        extFile = 6;
                    } else {
                        extFile = 0;
                    }
                    if (extFile == 0) {
                        App.toastrError("Định dạng tệp tin hướng dẫn sử dụng không cho phép");
                    } else {
                        //Insert data
                        $scope.model.PathImg = null;

                        dataservice.uploadFile(formData, function (rs) {
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                                return;
                            }
                            else {
                                $scope.model.PathFile = '/uploads/Files/' + rs.Object;
                                $scope.model.FileName = rs.Object;
                                funcSubmit($scope.model);
                            }
                        })
                    }
                }
            }
        }
    }
    $scope.clearFile = function () {
        $scope.model.FileName = '';
        $('.inputFile').val('');
        $('input[type=file]').val('');
    }

    function funcSubmit(data) {
        dataservice.insert(data, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $uibModalInstance.close();
            }
        });
    };
});

app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para) {
    $scope.model = {
        FileName: ''
    };
    var count = 0;
    $scope.initData = function () {
        dataservice.gettreedataLevel(function (result) {
            $scope.treedataLevel = result;
        });
        dataservice.getproductgroup(function (result) {
            $scope.productgroup = result;
        });
        dataservice.getItem(para, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model = rs;
            }
        });
    }
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "ProductGroup" && $scope.model.ProductGroup != "") {
            $scope.errorProductGroup = false;
        }
        if (SelectType == "Unit" && $scope.model.Unit != "") {
            $scope.errorUnit = false;
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
                App.toastrError("Định dạng ảnh không hợp lệ!");
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click');
    }
    $scope.submit = function () {
        if ($scope.editform.validate()) {
            var msg = $rootScope.checkData($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
            var fileName = $('input[type=file]').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            //check ảnh
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            if (extFile !== "") {
                if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                    App.toastrError("Format required is png, jpg, jpeg, gif, bmp!");
                } else {
                    var fi = document.getElementById('file');
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 1024) {
                        App.toastrError("Kích thước tệp tối đa cho phép là 1 MB !");
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
                                    App.toastrError("Kích thước ảnh tối đa là (1000px x 1000px)!");
                                } else {
                                    // thỏa mãn ảnh
                                    //Upload hướng dẫn sử dụng file
                                    var file = document.getElementById("File").files[0];

                                    if (file == null || file == undefined) {

                                        //Insert data
                                        var data1 = new FormData();
                                        file = fileUpload.files[0];
                                        data1.append("FileUpload", file);
                                        dataservice.uploadImage(data1, function (rs) {
                                            if (rs.Error) {
                                                App.toastrError(rs.Title);
                                                return;
                                            }
                                            else {
                                                $scope.model.PathImg = '/uploads/Images/' + rs.Object;
                                                funcSubmit($scope.model);
                                            }
                                        })

                                    } else {
                                        var idxDot = file.name.lastIndexOf(".") + 1;
                                        var name = file.name.substr(0, idxDot - 1).toLowerCase();
                                        var extFile = file.name.substr(idxDot, file.name.length).toLowerCase();

                                        var formData = new FormData();
                                        formData.append("file", file);
                                        var excel = ['xlsm', 'xlsx', 'xlsb', 'xltx', 'xltm', 'xls', 'xlt', 'xls', 'xml', 'xml', 'xlam', 'xla', 'xlw', 'xlr', 'csv'];
                                        var txt = ['txt'];
                                        var word = ['docx', 'doc'];
                                        var pdf = ['pdf'];
                                        var png = ['png', 'jpg'];
                                        var powerPoint = ['pps', 'pptx'];
                                        if (excel.indexOf(extFile) !== -1) {
                                            extFile = 1;
                                        } else if (word.indexOf(extFile) !== -1) {
                                            extFile = 2;
                                        } else if (txt.indexOf(extFile) !== -1) {
                                            extFile = 3;
                                        } else if (pdf.indexOf(extFile) !== -1) {
                                            extFile = 4;
                                        } else if (powerPoint.indexOf(extFile) !== -1) {
                                            extFile = 5;
                                        } else if (png.indexOf(extFile) !== -1) {
                                            extFile = 6;
                                        } else {
                                            extFile = 0;
                                        }
                                        if (extFile == 0) {
                                            App.toastrError("Định dạng tệp tin hướng dẫn sử dụng không cho phép");
                                        } else {
                                            //Insert data
                                            var data1 = new FormData();
                                            file = fileUpload.files[0];
                                            data1.append("FileUpload", file);
                                            dataservice.uploadImage(data1, function (rs) {
                                                if (rs.Error) {
                                                    App.toastrError(rs.Title);
                                                    return;
                                                }
                                                else {
                                                    $scope.model.PathImg = '/uploads/Images/' + rs.Object;

                                                    dataservice.uploadFile(formData, function (rs) {
                                                        if (rs.Error) {
                                                            App.toastrError(rs.Title);
                                                            return;
                                                        }
                                                        else {
                                                            $scope.model.PathFile = '/uploads/Files/' + rs.Object;
                                                            funcSubmit($scope.model);
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    }

                                }
                            };
                        }
                    }
                }
            } else {
                //Upload hướng dẫn sử dụng file
                var file = document.getElementById("File").files[0];

                if (file == null || file == undefined) {
                    funcSubmit($scope.model);
                } else {
                    var idxDot = file.name.lastIndexOf(".") + 1;
                    var name = file.name.substr(0, idxDot - 1).toLowerCase();
                    var extFile = file.name.substr(idxDot, file.name.length).toLowerCase();

                    var formData = new FormData();
                    formData.append("file", file);
                    var excel = ['xlsm', 'xlsx', 'xlsb', 'xltx', 'xltm', 'xls', 'xlt', 'xls', 'xml', 'xml', 'xlam', 'xla', 'xlw', 'xlr', 'csv'];
                    var txt = ['txt'];
                    var word = ['docx', 'doc'];
                    var pdf = ['pdf'];
                    var png = ['png', 'jpg'];
                    var powerPoint = ['pps', 'pptx'];
                    if (excel.indexOf(extFile) !== -1) {
                        extFile = 1;
                    } else if (word.indexOf(extFile) !== -1) {
                        extFile = 2;
                    } else if (txt.indexOf(extFile) !== -1) {
                        extFile = 3;
                    } else if (pdf.indexOf(extFile) !== -1) {
                        extFile = 4;
                    } else if (powerPoint.indexOf(extFile) !== -1) {
                        extFile = 5;
                    } else if (png.indexOf(extFile) !== -1) {
                        extFile = 6;
                    } else {
                        extFile = 0;
                    }
                    if (extFile == 0) {
                        App.toastrError("Định dạng tệp tin hướng dẫn sử dụng không cho phép");
                    } else {
                        //Insert data
                        //$scope.model.PathImg = null;

                        dataservice.uploadFile(formData, function (rs) {
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                                return;
                            }
                            else {
                                $scope.model.PathFile = '/uploads/Files/' + rs.Object;
                                $scope.model.FileName = rs.Object;
                                funcSubmit($scope.model);
                            }
                        })
                    }
                }
            }
        }
    }
    $scope.clearFile = function () {
        $scope.model.FileName = '';
        $('.inputFile').val('');
        $('input[type=file]').val('');
    }

    function funcSubmit(data) {
        dataservice.update(data, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $uibModalInstance.close();
            }
        });
    };
});


