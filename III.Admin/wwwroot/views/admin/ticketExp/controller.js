var ctxfolder = "/views/admin/ticketExp";
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

        $http(req).then(callback);
    };
    return {
        insert: function (data, callback) {
            $http.post('/Admin/TicketExp/Insert', data, callback).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/TicketExp/Update', data).then(callback);
        },
        deleteItems: function (data, callback) {
            $http.post('/Admin/TicketExp/DeleteItems', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/TicketExp/Delete/' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/TicketExp/GetItem/' + data).then(callback);
        },
        getItemDetail: function (data, callback) {
            $http.get('/Admin/TicketExp/GetItemDetail/' + data).then(callback);
        },
        getproductgroup: function (callback) {
            $http.post('/Admin/TicketExp/GetProductGroup/').then(callback);
        },
        gettreedataLevel: function (callback) {
            $http.post('/Admin/TicketExp/GetProductUnit/').then(callback);
        },
        uploadImage: function (data, callback) {
            submitFormUpload('/Admin/TicketExp/UploadImage/', data, callback);
        },
        uploadFile: function (data, callback) {
            submitFormUpload('/Admin/TicketExp/UploadFile/', data, callback);
        },

        //lot Product

        gettreedataLevel: function (callback) {
            $http.post('/Admin/ImpTicketHeader/GetProductUnit/').then(callback);
        },
        getSuppliers: function (callback) {
            $http.post('/Admin/ImpTicketHeader/GetSupplier').then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/ImpTicketHeader/Insert', data).then(callback);
        },
        //getProducts: function (callback) {
        //    $http.post('/Admin/ImpTicketHeader/GetProduct').then(callback);
        //},
        getProducts: function (callback) {
            $http.post('/Admin/lotProduct/GetProduct').then(callback);
        },
        insertProduct: function (data, callback) {
            $http.post('/Admin/ImpTicketHeader/InsertProduct', data).then(callback);
        },
        deleteProduct: function (data, callback) {
            $http.post('/Admin/ImpTicketHeader/DeleteProduct?id=' + data).then(callback);
        },
        updateProduct: function (data, callback) {
            $http.post('/Admin/ImpTicketHeader/UpdateProduct', data).then(callback);
        },
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, $confirm, DTColumnBuilder, DTInstances, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
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
        Title: '',
        CusCode: '',
        StoreCode: '',
        UserExport: '',
        FromDate: '',
        ToDate: '',
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/TicketExp/Jtable",
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
                d.Title = $scope.model.Title;
                d.CusCode = $scope.model.CusCode;
                d.StoreCode = $scope.model.StoreCode;
                d.UserExport = $scope.model.UserExport;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('TicketCode').withTitle('Mã phiếu').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('Tiêu đề').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CusName').withTitle('Khách hàng').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StoreName').withTitle('Kho hàng').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('PathImg').withTitle('Ảnh').renderWith(function (data, type) {
    //    return '<img class="img-circle" src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="65" width="65">';
    //}).withOption('sWidth', '50px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UserExportName').withTitle('Người xuất').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UserReceiptName').withTitle('Người nhận').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CostTotal').withTitle('Tổng tiền').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CostTotal').withTitle('Tổng tiền').renderWith(function (data, type) {
        return data;
    }));
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
            size: '70',

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
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = "Bạn có chắc chắn muốn xóa ?";
                $scope.ok = function () {
                    dataservice.delete(id, function (rs) {rs=rs.data;
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

    function loadDate() {
        $("#FromTo").datepicker({
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
            $('#FromTo').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            var from = $scope.model.FromDate.split("/");
            var date = new Date(from[2], from[1] - 1, from[0])
            $('#DateToBoxTermite').datepicker('setStartDate', date);
            $('#FromToBoxTermite').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            var from = $scope.model.ToDate.split("/");
            var date = new Date(from[2], from[1] - 1, from[0])
            $('#FromToBoxTermite').datepicker('setEndDate', $scope.model.ToDate);
            $('#DateToBoxTermite').datepicker('setStartDate', null);
        });
    }
    setTimeout(function () {
        loadDate();
    }, 200);

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

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
        //$uibModalInstance.close();
    }
    $scope.modelShow = {};
    
    $scope.modelShow.disableLotProduct = true;
    $rootScope.ProductCode = '';
    $scope.suppliers = [];

    $scope.model1 = {
        IsEnable: false
    };
    $scope.productCategoryTypes = [];
    $scope.productTypes = [];
    $scope.x4as = [{ Code: 'C1', Name: "Thùng" }, { Code: 'C2', Name: "Bao" }, { Code: 'C3', Name: "Gói" }, { Code: 'C4', Name: "Chai" }];
    $scope.x3as = [{ Code: 'C1', Name: "Thùng" }, { Code: 'C2', Name: "Bao" }, { Code: 'C3', Name: "Gói" }, { Code: 'C4', Name: "Chai" }];
    $scope.x2as = [{ Code: 'C1', Name: "Thùng" }, { Code: 'C2', Name: "Bao" }, { Code: 'C3', Name: "Gói" }, { Code: 'C4', Name: "Chai" }];
    $scope.x1as = [{ Code: 'C1', Name: "Thùng" }, { Code: 'C2', Name: "Bao" }, { Code: 'C3', Name: "Gói" }, { Code: 'C4', Name: "Chai" }];

    $scope.x4ass = {};
    $scope.x4ass[$scope.x4as[0].Code] = $scope.x4as[0].Name;
    $scope.x4ass[$scope.x4as[1].Code] = $scope.x4as[1].Name;
    $scope.x4ass[$scope.x4as[2].Code] = $scope.x4as[2].Name;
    $scope.x4ass[$scope.x4as[3].Code] = $scope.x4as[3].Name;


    $rootScope.LotProductCode = '';
    $scope.model = {};
    $scope.initData = function () {
        dataservice.gettreedataLevel(function (result) {result=result.data;
            $scope.treedataLevel = result;
        });
        dataservice.getSuppliers(function (result) {result=result.data;
            $scope.suppliers = result;
        });

    }
    $scope.initData();
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.Unit == "") {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;

        }
        return mess;
    };
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "ProductGroup" && $scope.model.ProductGroup != "") {
            $scope.errorProductGroup = false;
        }
        if (SelectType == "unit" && $scope.model.unit != "") {
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
                App.toastrError(caption.COM_MSG_INVALID_FORMAT);
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click');
    }
    $scope.submit = function () {
        
        validationSelect($scope.model);

        if (validationSelect($scope.model).Status == false) {
            //var msg = $rootScope.checkData($scope.model);
            //if (msg.Status) {
            //    App.toastrError(msg.Title);
            //    return;
            //}
            var fileName = $('input[type=file]').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            //console.log('Name File: ' + extFile);
            if (extFile !== "") {
                if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                    App.toastrError(caption.CATEGORY_MSG_FORMAT_REQUIRED);
                } else {
                    var fi = document.getElementById('file');
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 1024) {
                        App.toastrError(caption.CATEGORY_MSG_FILE_SIZE_MAXXIMUM);
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
                                    App.toastrError(caption.CATEGORY_MSG_IMG_SIZE_MAXIMUM);
                                } else {
                                    var data = new FormData();
                                    file = fileUpload.files[0];
                                    data.append("FileUpload", file);
                                    dataservice.uploadImage(data, function (rs) {rs=rs.data;
                                        if (rs.Error) {
                                            App.toastrError(rs.Title);
                                            return;
                                        }
                                        else {
                                            $scope.model.PathImg = '/uploads/images/' + rs.Object;

                                            dataservice.insert($scope.model, function (rs) {rs=rs.data;
                                                if (rs.Error) {
                                                    App.toastrError(rs.Title);

                                                } else {
                                                    App.toastrSuccess(rs.Title);
                                                    $scope.model = rs.Object;
                                                    $rootScope.LotProductCode = $scope.model.LotProductCode;
                                                    $rootScope.ProductCode = $scope.model.ProductCode;
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

                dataservice.insert($scope.model, function (rs) {rs=rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $scope.model = rs.Object;
                        $rootScope.LotProductCode = $scope.model.LotProductCode;
                        $rootScope.ProductCode = $scope.model.ProductCode;
                    }
                });
            }
        }
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
    $scope.tinymceOptions = {
        plugins: 'print preview searchreplace autolink directionality visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists textcolor wordcount imagetools contextmenu colorpicker textpattern help',
        toolbar: "formatselect bold italic strikethrough forecolor link  alignleft aligncenter alignright alignjustify numlist bullist outdent indent removeformat fullscreen"
    };
    function loadDate() {
        $("#FromDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            //var maxDate = new Date(selected.date.valueOf());
            //$('#ToDate').datepicker('setStartDate', maxDate);
        });
        //$("#ToDate").datepicker({
        //    inline: false,
        //    autoclose: true,
        //    format: "dd/mm/yyyy",
        //    fontAwesome: true,
        //}).on('changeDate', function (selected) {
        //    var maxDate = new Date(selected.date.valueOf());
        //    $('#FromDate').datepicker('setEndDate', maxDate);
        //});
        //$('.end-date').click(function () {
        //    $('#DateFrom').datepicker('setEndDate', null);
        //});
        //$('.start-date').click(function () {
        //    $('#DateTo').datepicker('setStartDate', null);
        //});
    }
    setTimeout(function () {
        loadDate();
    }, 200);
    $scope.model1 = {
        x1: '',
        x2: '',
        x3: '',
        x4: '',
        x1a: '',
        x2a: '',
        x3a: '',
        x4a: '',
    }
    $scope.x1 = function () {
        console.log('x1');
        
        var qc = $scope.model1.x1;
        if ($scope.x4ass[$scope.model1.x1a] != undefined)
            qc = $scope.model1.x1 + 'x' + $scope.x4ass[$scope.model1.x1a] + " ";
        if ($scope.x4ass[$scope.model1.x2a] != undefined)
            qc = qc + $scope.model1.x2 + 'x' + $scope.x4ass[$scope.model1.x2a] + " ";
        if ($scope.x4ass[$scope.model1.x3a] != undefined)
            qc = qc + $scope.model1.x3 + 'x' + $scope.x4ass[$scope.model1.x3a] + " ";
        if ($scope.x4ass[$scope.model1.x4a] != undefined)
            qc = qc + $scope.model1.x4 + 'x' + $scope.x4ass[$scope.model1.x4a];
        $scope.model.Packing = qc;
    }
    $scope.changeEnableLotProduct = function () {
        if ($('#IsEnable').is(":checked")) {
            console.log('true');
            $rootScope.IsEnableLotProduct = true;
        }
        else {
            console.log('false');
            $rootScope.IsEnableLotProduct = false;
        }
    }

});

app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para) {
    $scope.model = {
        FileName: ''
    };
    var count = 0;
    $scope.initData = function () {
        dataservice.gettreedataLevel(function (result) {result=result.data;
            $scope.treedataLevel = result;
        });
        dataservice.getproductgroup(function (result) {result=result.data;
            $scope.productgroup = result;
        });
        dataservice.getItem(para, function (rs) {rs=rs.data;
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
                                        dataservice.uploadImage(data1, function (rs) {rs=rs.data;
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
                                            dataservice.uploadImage(data1, function (rs) {rs=rs.data;
                                                if (rs.Error) {
                                                    App.toastrError(rs.Title);
                                                    return;
                                                }
                                                else {
                                                    $scope.model.PathImg = '/uploads/Images/' + rs.Object;

                                                    dataservice.uploadFile(formData, function (rs) {rs=rs.data;
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

                        dataservice.uploadFile(formData, function (rs) {rs=rs.data;
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
        dataservice.update(data, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $uibModalInstance.close();
            }
        });
    };
});

app.controller('product', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.products = [];
    $scope.datatable = {};
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    $scope.currentItemEdit = null;
    $scope.model = {
        ProductCode: '',
        Quantity: '',
    }
    $scope.isEdit = false;
    $scope.dataJtable = {};
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/LotProduct/JTableProduct",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                
                //d.LotProductCode = $rootScope.LotProductCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                $scope.$apply();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
        .withOption('order', [1, 'asc'])
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
            console.log(dataIndex);
            console.log(data);
            console.log('------------------------------------------------------------------------------');
            $scope.datatable[data.Id] = data;
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductName').withTitle('Tên sản phầm').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withTitle('Số lượng').renderWith(function (data, type) {
        var excel = ['.xlsm', '.xlsx', '.xlsb', '.xltx', '.xltm', '.xls', '.xlt', '.xls', '.xml', '.xml', '.xlam', '.xla', '.xlw', '.xlr'];
        var document = ['.txt'];
        var word = ['.docx', '.doc'];
        var pdf = ['.pdf'];
        var powerPoint = ['.pps', '.pptx'];
        var image = ['.jpg', '.png', '.PNG'];

        if (excel.indexOf(data) !== -1) {
            return '<i style="color: rgb(106,170,89);font-size: 15px;" class="fa fa-file-excel-o" aria-hidden="true"></i>';
        } else if (word.indexOf(data) !== -1) {
            return '<i style="color: rgb(13,118,206);font-size: 15px;" class="fa fa-file-word-o" aria-hidden="true"></i>';
        } else if (document.indexOf(data) !== -1) {
            return '<i style="color: rgb(0,0,0);font-size: 15px;" class="fa fa-file-text-o" aria-hidden="true"></i>';
        } else if (pdf.indexOf(data) !== -1) {
            return '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-pdf-o" aria-hidden="true"></i>';
        } else if (powerPoint.indexOf(data) !== -1) {
            return '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-powerpoint-o" aria-hidden="true"></i>';
        } else if (image.indexOf(data) !== -1) {
            return '<i style="color: rgb(42,42,42);font-size: 15px;" class="fa fa-picture-o" aria-hidden="true"></i>';
        } else {
            return data;
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductName').withTitle('Đơn vị').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductName').withTitle('Giá').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductName').withTitle('Thuế').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductName').withTitle('Chiết khấu').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('Thời gian thêm').renderWith(function (data, type) {
    //    return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy HH:mm:ss') : null;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('Hoa hồng').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('Tác vụ').renderWith(function (data, type, full, meta) {
        return '<button title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    function loadDate() {
        $("#FromTo").datepicker({
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
            $('#FromTo').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
        });
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.search = function () {
        if ($rootScope.LotProductCode != '') {
            vm.dtInstance.reloadData();
        }
    }
    $scope.add = function () {
        
        if ($rootScope.LotProductCode != '') {
            $scope.model.LotProductCode = $rootScope.LotProductCode;
            if ($scope.model.ProductCode != '' && $scope.model.Quantity != '') {
                var msg = $rootScope.checkProduct($scope.model);
                if (msg.Status == true) {
                    App.toastrWarning(msg.Title);
                    return;
                }
                dataservice.insertProduct($scope.model, function (rs) {rs=rs.data;
                    if (rs.Error == true) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $scope.reload();
                    }
                });
            }
            else {
                App.toastrWarning("Vui lòng chọn sản phẩm và số lượng");
            }
        }

    }

    $scope.edit = function (id) {
        
        var data = $scope.datatable[id];
        $scope.currentItemEdit = data;
        console.log(data);
        $scope.isEdit = true;
        $scope.model.ProductCode = data.ProductCode;
        $scope.model.Quantity = data.Quantity;
    }
    $scope.close = function () {
        $scope.isEdit = false;
        $scope.model.ProductCode = '';
        $scope.model.Quantity = '';
        $scope.currentItemEdit = null;
    }
    $scope.save = function () {
        
        if ($rootScope.LotProductCode != '') {
            $scope.model1 = $scope.currentItemEdit;
            $scope.model1.ProductCode = $scope.model.ProductCode;
            $scope.model1.Quantity = $scope.model.Quantity;

            if ($scope.model1.ProductCode != '' && $scope.model1.Quantity != '') {
                var msg = $rootScope.checkProduct($scope.model1);
                if (msg.Status == true) {
                    App.toastrWarning(msg.Title);
                    return;
                }
                dataservice.updateProduct($scope.model1, function (rs) {rs=rs.data;
                    if (rs.Error == true) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $scope.reload();
                        $scope.close();
                    }
                });

            }
            else {
                App.toastrWarning("Vui lòng chọn sản phẩm và số lượng");
            }
        }

    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = "Bạn có chắc chắn muốn xóa ?";
                $scope.ok = function () {
                    dataservice.deleteProduct(id, function (rs) {rs=rs.data;
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
            $scope.reload();
        }, function () {
        });
    }
    function loadDate() {
        $("#FromDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ToDate').datepicker('setStartDate', maxDate);
        });
        $("#ToDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromDate').datepicker('setEndDate', maxDate);
        });
        //$('.end-date').click(function () {
        //    $('#DateFrom').datepicker('setEndDate', null);
        //});
        //$('.start-date').click(function () {
        //    $('#DateTo').datepicker('setStartDate', null);
        //});
    }
    loadDate();
    setTimeout(function () {
        loadDate();
    }, 200);
    function initData() {
        dataservice.getProducts(function (result) {result=result.data;
            $scope.products = result;
        });
    }
    initData();

});
