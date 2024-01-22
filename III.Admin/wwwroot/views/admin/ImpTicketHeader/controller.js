var ctxfolder = "/views/admin/ImpTicketHeader";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ui.tinymce']);
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

        $http(req).success(callback);
    };
    return {

        update: function (data, callback) {
            $http.post('/Admin/ImpTicketHeader/Update', data).success(callback);
        },
        deleteItems: function (data, callback) {
            $http.post('/Admin/ImpTicketHeader/DeleteItems', data).success(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/ImpTicketHeader/Delete/' + data).success(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/ImpTicketHeader/GetItem?Id=' + data).success(callback);
        },
        getItemDetail: function (data, callback) {
            $http.get('/Admin/ImpTicketHeader/GetItemDetail/' + data).success(callback);
        },
        getproductgroup: function (callback) {
            $http.post('/Admin/ImpTicketHeader/GetProductGroup/').success(callback);
        },

        uploadImage: function (data, callback) {
            submitFormUpload('/Admin/ImpTicketHeader/UploadImage/', data, callback);
        },

        getInheritances: function (data, callback) {
            $http.post('/Admin/ImpTicketHeader/GetInheritances?productCode=' + data).success(callback);
        },
        getProductCategoryTypes: function (callback) {
            $http.post('/Admin/ImpTicketHeader/GetProductCategoryTypes/').success(callback);
        },
        getProductTypes: function (callback) {
            $http.post('/Admin/ImpTicketHeader/GetProductTypes/').success(callback);
        },
        insertProductAttribute: function (data, callback) {
            console.log(data);
            $http.post('/Admin/ImpTicketHeader/InsertProductAttribute', data).success(callback);
        },
        deleteExtend: function (id, callback) {
            $http.post('/Admin/ImpTicketHeader/DeleteAttribute?Id=' + id).success(callback);
        },
        updateAttribute: function (data, callback) {
            $http.post('/Admin/ImpTicketHeader/UpdateAttribute', data).success(callback);
        },
        getAttributeItem: function (id, callback) {
            $http.post('/Admin/ImpTicketHeader/GetAttributeItem?id=' + id).success(callback);
        },
        jtreeRepository: function (callback) {
            $http.post('/Admin/EDMSRepository/JtreeRepository').success(callback);
        },
        insertFile: function (data, callback) {
            submitFormUpload('/Admin/ImpTicketHeader/InsertFile/', data, callback);
        },


        updateFile: function (data, callback) {
            submitFormUpload('/Admin/ImpTicketHeader/UpdateFile/', data, callback);
        },
        getFile: function (data, callback) {
            $http.get('/Admin/ImpTicketHeader/GetFile?id=' + data).success(callback);
        },

        //lot Product

        gettreedataLevel: function (callback) {
            $http.post('/Admin/ImpTicketHeader/GetProductUnit/').success(callback);
        },
        getSuppliers: function (callback) {
            $http.post('/Admin/ImpTicketHeader/GetSupplier').success(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/ImpTicketHeader/Insert', data).success(callback);
        },
        getProducts: function (callback) {
            $http.post('/Admin/ImpTicketHeader/GetProduct').success(callback);
        },
        insertProduct: function (data, callback) {
            $http.post('/Admin/ImpTicketHeader/InsertProduct', data).success(callback);
        },
        deleteProduct: function (data, callback) {
            $http.post('/Admin/ImpTicketHeader/DeleteProduct?id=' + data).success(callback);
        },
        updateProduct: function (data, callback) {
            $http.post('/Admin/ImpTicketHeader/UpdateProduct', data).success(callback);
        },


    }
});



app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        });
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^!@#$%^&*<>?\s]*$/g;
            // var partternCode = new RegExp("^[a-zA-Z0-9]+[^!@#$%^&*<>?\s]*$");
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
        $rootScope.IsTranslate = true;
    });
    $rootScope.partternCode = /^[a-zA-Z0-9]+[^!@#$%^&*<>?\s]*$/g;
    $rootScope.partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/;
    //Miêu tả có thể null, và có chứa được khoảng trắng
    $rootScope.partternDescription = /^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^!@#$%^&*<>?]*$/;
    $rootScope.partternDate = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;//Pormat dd/mm/yyyy
    $rootScope.partternEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    $rootScope.partternNumber = /^[0-9]\d*(\\d+)?$/; //Chỉ cho nhập số khong the am
    $rootScope.partternFloat = /^-?\d*(\.\d+)?$/; //Số thực
    $rootScope.partternNotSpace = /^[^\s].*/; //Không chứa khoảng trắng đầu dòng hoặc cuối dòng
    $rootScope.partternPhone = /^(0)+([0-9]{9,10})\b$/; //Số điện thoại 10,11 số bắt đầu bằng số 0
    $rootScope.checkData = function (data) {
        var partternCode = /^[a-zA-Z0-9]+[^!@#$%^&*<>?\s]*$/g;
        var partternTelephone = /[0-9]/g;
        var mess = { Status: false, Title: "" }
        if (!partternCode.test(data.SupCode)) {
            mess.Status = true;
            mess.Title = mess.Title.concat(" - ", caption.SUP_CURD_VALIDATE_CHARACTERS_SPACE_SUPCODE, "<br/>");
        }
        return mess;
    }
    $rootScope.checkDataMore = function (data) {
        var partternCode = /^[a-zA-Z0-9]+[^!@#$%^&*<>?\s]*$/g;
        var mess = { Status: false, Title: "" }
        if (!partternCode.test(data.AttributeCode)) {
            mess.Status = true;
            mess.Title = mess.Title.concat(" - ", caption.SUP_CURD_VALIDATE_CHARACTERS_SPACE_EXTCODE, "<br/>");
        }
        return mess;
    }
    $rootScope.checkDataContact = function (data) {
        var partternCode = /^[a-zA-Z0-9]+[^!@#$%^&*<>?\s]*$/g;
        var mess = { Status: false, Title: "" }
        if (!partternCode.test(data.ext_code)) {
            mess.Status = true;
            mess.Title = mess.Title.concat(" - ", caption.SUP_CURD_VALIDATE_CHARACTERS_SPACE_EXTCODE, "<br/>");
        }
        return mess;
    }
    $rootScope.checkTelephone = function (data) {
        var partternTelephone = /[0-9]/g;
        var mess = { Status: false, Title: "" };
        if (!partternTelephone.test(data) && data != null) {
            mess.Status = true;
            mess.Title = mess.Title.concat(" - ", "Số điện thoại phải là chữ số [0-9]!", "<br/>");
        }
        return mess;
    }
    $rootScope.checkProduct = function (data) {
        debugger
        var mess = { Status: false, Title: "" };
        if (data != null && !$rootScope.partternFloat.test(data.Quantity)) {
            mess.Status = true;
            mess.Title = mess.Title.concat("Số lượng phải là số");
        }
        return mess;
    }
    $rootScope.IsEnableLotProduct =true;
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/Language/Translation');
    caption = $translateProvider.translations();

    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/add', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
        })
        .when('/edit', {
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit'
        })
        .when('/detail', {
            templateUrl: ctxfolder + '/detail.html',
            controller: 'detail'
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

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, $filter) {
    $scope.model = {
        productcode: '',
        productname: '',
        unit: '',
        describe: '',
    }
    var vm = $scope;
    $scope.selected = [];
    $scope.suppliers = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/ImpTicketHeader/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.QrCode = $scope.model.QrCode;
                d.BarCode = $scope.model.BarCode;
                d.Title = $scope.model.Title;
                d.Supplier = $scope.model.Supplier;
                d.CreatedDate = $scope.model.CreatedDate;
                d.ExpiryDate = $scope.model.ExpiryDate;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                $scope.$apply();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [1, 'desc'])
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
    var ad = 0;
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('QrCode').withTitle('QrCode').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BarCode').withTitle('Barcode').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('Tiêu đề').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SupplierName').withTitle('Nhà cung cấp').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PathImg').withTitle('{{"CATEGORY_LIST_COL_PATHIMG" | translate}}').renderWith(function (data, type) {
        return '<img class="img-circle" src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="65" width="65">';
    }).withOption('sWidth', '50px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Packing').withTitle('Quy cách').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ExpiryDate').withTitle('Ngày hết hạn').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('Ngày tạo').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy HH:mm:ss') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedByName').withTitle('Người tạo').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('material').withTitle('Chất liệu').renderWith(function (data, type) {
    //        return data;
    //    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('pattern').withTitle('Hoa văn').renderWith(function (data, type) {
    //        return data;
    //    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('size').withTitle('Kích thước').renderWith(function (data, type) {
    //        return data;
    //    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"CATEGORY_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.search = function () {
        reloadData(true);
    }
    $scope.initData = function () {
        dataservice.gettreedataLevel(function (result) {
            $scope.treedataLevel = result;
        });
        dataservice.getSuppliers(function (result) {
            $scope.suppliers = result;
        });

    }
    $scope.initData();

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: true,
            size: '70',

        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }

    $scope.edit = function (id) {
        dataservice.getItem(id, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model1 = rs;
                $rootScope.LotProductCode = $scope.model.LotProductCode;
                $rootScope.ProductCode = $scope.model.ProductCode;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/edit.html',
                    controller: 'edit',
                    backdrop: true,
                    size: '60',
                    resolve: {
                        para: function () {
                            return $scope.model1;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    $scope.reloadNoResetPage();
                }, function () {
                });
            }
        });

    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.delete(id, function (rs) {
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
        $("#CreatedDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            //var maxDate = new Date(selected.date.valueOf());
            //$('#ToDate').datepicker('setStartDate', maxDate);
        });
        $("#ExpiryDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            //var maxDate = new Date(selected.date.valueOf());
            //$('#FromDate').datepicker('setEndDate', maxDate);
        });
    }
    loadDate();
    setTimeout(function () {
        loadDate();
        showHideSearch();
    }, 50);

});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
        //$uibModalInstance.close();
    }
    $rootScope.ProductCode = '';
    $scope.suppliers = [];

    $scope.model1 = {
        IsEnable: false
    } ;
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
        dataservice.gettreedataLevel(function (result) {
            $scope.treedataLevel = result;
        });
        dataservice.getSuppliers(function (result) {
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
        debugger
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
                            debugger
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
                                    dataservice.uploadImage(data, function (rs) {
                                        if (rs.Error) {
                                            App.toastrError(rs.Title);
                                            return;
                                        }
                                        else {
                                            $scope.model.PathImg = '/uploads/images/' + rs.Object;

                                            dataservice.insert($scope.model, function (rs) {
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

                dataservice.insert($scope.model, function (rs) {
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
        toolbar: "formatselect bold italic strikethrough forecolor link  alignleft aligncenter alignright alignjustify numlist bullist outdent indent removeformat"
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
        debugger
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
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para, $filter) {

    $scope.model = para;

    $scope.model.sExpiryDate = ($scope.model.ExpiryDate != "" ? $filter('date')(new Date($scope.model.ExpiryDate), 'dd/MM/yyyy') : null);
    $scope.inheritances = [];
    $scope.productCategoryTypes = [];
    $scope.productTypes = [];
    $rootScope.LotProductCode = $scope.model.LotProductCode;
    $scope.x4as = [{ Code: 'C1', Name: "Thùng" }, { Code: 'C2', Name: "Bao" }, { Code: 'C3', Name: "Gói" }, { Code: 'C4', Name: "Chai" }];
    $scope.x3as = [{ Code: 'C1', Name: "Thùng" }, { Code: 'C2', Name: "Bao" }, { Code: 'C3', Name: "Gói" }, { Code: 'C4', Name: "Chai" }];
    $scope.x2as = [{ Code: 'C1', Name: "Thùng" }, { Code: 'C2', Name: "Bao" }, { Code: 'C3', Name: "Gói" }, { Code: 'C4', Name: "Chai" }];
    $scope.x1as = [{ Code: 'C1', Name: "Thùng" }, { Code: 'C2', Name: "Bao" }, { Code: 'C3', Name: "Gói" }, { Code: 'C4', Name: "Chai" }];

    $scope.x4ass = {};
    $scope.x4ass[$scope.x4as[0].Code] = $scope.x4as[0].Name;
    $scope.x4ass[$scope.x4as[1].Code] = $scope.x4as[1].Name;
    $scope.x4ass[$scope.x4as[2].Code] = $scope.x4as[2].Name;
    $scope.x4ass[$scope.x4as[3].Code] = $scope.x4as[3].Name;

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
        debugger
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
    $scope.initData = function () {
        dataservice.gettreedataLevel(function (result) {
            $scope.treedataLevel = result;
        });
        dataservice.getSuppliers(function (result) {
            $scope.suppliers = result;
        });

    }
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.initData1 = function () {
        dataservice.getItem(para, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model = rs;
                $rootScope.LotProductCode = $scope.model.LotProductCode;
                $rootScope.ProductCode = $scope.model.ProductCode;
            }
        });
    }
    //$scope.initData1();
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
        if ($scope.addform.validate()) {
            //console.log($scope.model);
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
                        App.toastrError(caption.CATEGORY_MSG_FILE_SIZE_MAXIMUM);
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
                                    dataservice.uploadImage(data, function (rs) {
                                        if (rs.Error) {
                                            App.toastrError(rs.Title);
                                            return;
                                        }
                                        else {
                                            $scope.model.PathImg = '/uploads/images/' + rs.Object;
                                            if ($scope.model.Cost == '')
                                                $scope.model.Cost = 0;
                                            dataservice.update($scope.model, function (rs) {
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
                if ($scope.model.Cost == '')
                    $scope.model.Cost = 0;
                dataservice.update($scope.model, function (rs) {
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
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
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
});

app.controller('more', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Category/JTableExtend",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProductCode = $rootScope.ProductCode;
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
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    //end option table
    //.Id,
    //                            a.AttributeCode,
    //                            a.AttributeName,
    //                            a.Value,
    //                            a.Note,
    //                            a.CreatedTime
    //Tạo các cột của bảng để đổ dữ liệu vào
    vm.dtColumns = [];
    //vm.dtColumns.push(DTColumnBuilder.newColumn("check").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
    //    $scope.selected[full.id] = false;
    //    return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    //}).withOption('sClass', ''));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('ID').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AttributeCode').withTitle("Mã thuộc tính").renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AttributeName').withTitle("Tên thuộc tính").renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Value').withTitle("Giá trị").renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle("Ghi chú").renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle("Ngày thêm").renderWith(function (data, type) {
        //return data;
        return $filter("date")(new Date(data), "dd/MM/yyyy");
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle($translate('COM_LIST_COL_ACTION')).renderWith(function (data, type, full, meta) {
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
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.add = function () {
        if ($rootScope.LotProductCode != '') {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/moreAdd.html',
                controller: 'moreAdd',
                backdrop: true,
                size: '40'
            });
            modalInstance.result.then(function (d) {
                $scope.reload()
            }, function () { });
        }
    }

    $scope.edit = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/moreEdit.html',
            controller: 'moreEdit',
            backdrop: true,
            size: '40',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload()
        }, function () { });
    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = "Bạn có chắc chắn muốn xóa ?";
                $scope.ok = function () {
                    dataservice.deleteExtend(id, function (rs) {
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

});
app.controller('moreAdd', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.model = {
    }
    $scope.submit = function () {
        if ($scope.addform.validate()) {
            var msg = $rootScope.checkDataMore($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
            if ($rootScope.LotProductCode == '') {
                App.toastrError("Vui lòng thêm sản phẩm trước");
            }
            $scope.model.ProductCode = $rootScope.ProductCode;
            dataservice.insertProductAttribute($scope.model, function (result) {
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $uibModalInstance.close();
                }
                App.unblockUI("#contentMain");
            });
        }
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
    var init = function () {
        dataservice.gettreedataLevel(function (result) {
            $scope.treedataLevel = result;
        });
    }
    init();
});
app.controller('moreEdit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.initData = function () {
        dataservice.getAttributeItem(para, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.model = rs.Object;
            }
        });
    }
    $scope.initData();

    $scope.submit = function () {
        if ($scope.addform.validate()) {
            dataservice.updateAttribute($scope.model, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            });
        }
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
    var init = function () {
        dataservice.gettreedataLevel(function (result) {
            $scope.treedataLevel = result;
        });
    }
    init();
});

app.controller('file', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
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
                d.LotProductCode = $rootScope.LotProductCode;
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('Thời gian thêm').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy HH:mm:ss') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('Người tạo').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle($translate('COM_LIST_COL_ACTION')).renderWith(function (data, type, full, meta) {
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
        debugger
        if ($rootScope.LotProductCode != '') {
            $scope.model.LotProductCode = $rootScope.LotProductCode;
            if ($scope.model.ProductCode != '' && $scope.model.Quantity != '') {
                var msg = $rootScope.checkProduct($scope.model);
                if (msg.Status == true) {
                    App.toastrWarning(msg.Title);
                    return;
                }
                dataservice.insertProduct($scope.model, function (rs) {
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
        debugger
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
        debugger
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
                dataservice.updateProduct($scope.model1, function (rs) {
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
                    dataservice.deleteProduct(id, function (rs) {
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
        dataservice.getProducts(function (result) {
            $scope.products = result;
        });

    }
    initData();

});
app.controller('fileAdd', function ($scope, $rootScope, $compile, $uibModalInstance, dataservice) {
    $scope.treeData = [];
    $scope.model = {
        FileName: '',
        Desc: '',
        RepoCode: '',
        SupplierId: '',
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.readyCB = function () {
        App.blockUI({
            target: "#contentMainRepository",
            boxed: true,
            message: 'loading...'
        });
        dataservice.jtreeRepository(function (result) {
            var root = {
                id: 'root',
                parent: "#",
                text: "Tất cả kho dữ liệu",
                state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
            }
            $scope.treeData.push(root);
            for (var i = 0; i < result.length; i++) {
                if (result[i].Parent == '#') {
                    var data = {
                        id: result[i].ReposID,
                        reposCode: result[i].ReposCode,
                        parent: 'root',
                        text: result[i].ReposName,
                        state: { selected: false, opened: true }
                    }
                    $scope.treeData.push(data);
                } else {
                    var data = {
                        id: result[i].ReposID,
                        reposCode: result[i].ReposCode,
                        parent: result[i].Parent,
                        text: result[i].ReposName,
                        state: { selected: false, opened: true }
                    }
                    $scope.treeData.push(data);
                }
            }
            App.unblockUI("#contentMainRepository");
        });
    }
    $scope.searchRepository = function (search) {
        if (search != '' && search != undefined) {
            $("#treeDiv").jstree("close_all");
            $('#treeDiv').jstree(true).search(search);
        }
    }
    $scope.searchTreeRepository = function (e, data) {
        if (data.res.length === 0) {
            App.toastrWarning('Không tìm thấy kho lưu trữ');
        };
    }
    $scope.selectNodeRepository = function (node, selected, event) {
        $scope.model.Category = selected.node.original.id;
    }
    $scope.treeConfig = {
        core: {
            multiple: false,
            animation: true,
            error: function (error) {
                $log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
            },
            check_callback: true,
            worker: true,

        },
        types: {
            default: {
                icon: 'fa fa-folder icon-state-warning'
            }
        },
        version: 1,
        plugins: ['checkbox', 'types', 'search', 'state'],
        checkbox: {
            "three_state": false,
            "whole_node": true,
            "keep_selected_style": true,
            "cascade": "undetermined",
        },
        types: {
            valid_children: ["selected"],
            types: {
                "selected": {
                    "select_node": false
                }
            },
            "default": {
                "icon": "fa fa-folder icon-state-warning icon-lg"
            },
            "file": {
                "icon": "fa fa-file icon-state-warning icon-lg"
            }
        },
    };
    $scope.treeEvents = {
        'ready': $scope.readyCB,
        'select_node': $scope.selectNodeRepository,
        'search': $scope.searchTreeRepository,
    }
    $scope.submit = function () {
        var file = document.getElementById("File").files[0];
        if (file == null || file == undefined) {
            App.toastrError("Vui lòng chọn tệp tin");
        } else {
            if ($scope.addformfile.validate()) {
                var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
                if (listNoteSelect.length == 0) {
                    App.toastrError("Vui lòng chọn kho dữ liệu");
                } else {
                    debugger
                    var data = new FormData();
                    data.append("FileUpload", file);
                    data.append("FileName", $scope.model.FileName);
                    data.append("Desc", $scope.model.Desc);
                    data.append("RepoCode", listNoteSelect[0].original.reposCode);
                    data.append("ProductCode", $rootScope.ProductCode);
                    dataservice.insertFile(data, function (result) {
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $uibModalInstance.close();
                        }
                    });
                }
            }
        }
    };

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('fileEdit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
    $scope.treeData = [];
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.initData = function () {
        dataservice.getFile(para, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.model = rs.Object;
            }
        });
    }
    $scope.initData();
    $scope.readyCB = function () {
        App.blockUI({
            target: "#contentMainRepository",
            boxed: true,
            message: 'loading...'
        });
        dataservice.jtreeRepository(function (result) {
            var root = {
                id: 'root',
                parent: "#",
                text: "Tất cả kho dữ liệu",
                state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
            }
            $scope.treeData.push(root);
            for (var i = 0; i < result.length; i++) {
                if (result[i].Parent == '#') {
                    var data = {
                        id: result[i].ReposID,
                        parent: 'root',
                        text: result[i].ReposName,
                        reposCode: result[i].ReposCode,
                        state: { selected: true ? result[i].ReposCode == $scope.model.RepoCode : false, opened: true }
                    }
                    $scope.treeData.push(data);
                } else {
                    var data = {
                        id: result[i].ReposID,
                        parent: result[i].Parent,
                        text: result[i].ReposName,
                        reposCode: result[i].ReposCode,
                        state: { selected: true ? result[i].ReposCode == $scope.model.RepoCode : false, opened: true }
                    }
                    $scope.treeData.push(data);
                }
            }
            App.unblockUI("#contentMainRepository");
        });
    }

    $scope.searchRepository = function () {
        $("#treeDiv").jstree("close_all");
        $('#treeDiv').jstree(true).search($scope.model.Name);
    }
    $scope.searchTreeRepository = function (e, data) {
        if (data.res.length === 0) {
            App.toastrWarning('Không tìm thấy kho lưu trữ');
        };
    }
    $scope.selectNodeRepository = function (node, selected, event) {
        $scope.model.Category = selected.node.original.id;
    }
    $scope.treeConfig = {
        core: {
            multiple: false,
            animation: true,
            error: function (error) {
                $log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
            },
            check_callback: true,
            worker: true,

        },
        types: {
            default: {
                icon: 'fa fa-folder icon-state-warning'
            }
        },
        version: 1,
        plugins: ['checkbox', 'types', 'search', 'state'],
        checkbox: {
            "three_state": false,
            "whole_node": true,
            "keep_selected_style": true,
            "cascade": "undetermined",
        },
        types: {
            valid_children: ["selected"],
            types: {
                "selected": {
                    "select_node": false
                }
            },
            "default": {
                "icon": "fa fa-folder icon-state-warning icon-lg"
            },
            "file": {
                "icon": "fa fa-file icon-state-warning icon-lg"
            }
        },
    };
    $scope.treeEvents = {
        //'ready': $scope.readyCB,
        'select_node': $scope.selectNodeRepository,
        'search': $scope.searchTreeRepository,
    }
    $scope.submit = function () {
        var files = $("#File").get(0);
        var file = files.files[0];
        var fileName = '';
        if ($scope.editformfile.validate()) {
            var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
            if (listNoteSelect.length == 0) {
                App.toastrError(caption.CUS_CURD_VALIDATE_REPOSITORY);
            } else {
                var data = new FormData();
                data.append("Id", $scope.model.Id);
                data.append("FileUpload", file);
                data.append("FileName", $scope.model.FileName);
                data.append("Desc", $scope.model.Desc);
                data.append("RepoCode", listNoteSelect[0].original.reposCode);
                dataservice.updateFile(data, function (result) {
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                        $uibModalInstance.close();
                    }
                });
            }
        }
        //var fileName = '';

        //if (file == null) {
        //    $scope.model.SupplierId = $rootScope.Object.SupplierId;
        //    dataservice.updateFile($scope.model, function (result) {
        //        if (result.Error) {
        //            App.toastrError(result.Title);
        //        } else {
        //            App.toastrSuccess(result.Title);
        //            $uibModalInstance.close();
        //        }
        //    });
        //}
        //else {
        //    data.append("FileUpload", file);
        //    dataservice.uploadFile(data, function (rs) {
        //        if (rs.Error) {
        //            App.toastrError(result.Title);
        //            return;
        //        }
        //        else {
        //            $scope.model.SupplierId = $rootScope.Object.SupplierId;
        //            $scope.model.FileName = rs.Object;
        //            //$scope.model.CustomerID = $rootScope.CustomerId;
        //            $scope.model.FileUrl = '/uploads/files/' + $scope.model.FileName;
        //            $scope.model.FilePath = '~/upload/files/' + $scope.model.FileName;
        //            dataservice.updateFile($scope.model, function (result) {
        //                if (result.Error) {
        //                    App.toastrError(result.Title);
        //                } else {
        //                    App.toastrSuccess(result.Title);
        //                    $uibModalInstance.close();
        //                }
        //            });
        //        }
        //    });
        //}
    }
    setTimeout(function () {
        $scope.readyCB();
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('product', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
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
                d.LotProductCode = $rootScope.LotProductCode;
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductName').withTitle('Giá').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductName').withTitle('Thuế').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductName').withTitle('Lưu ý').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('Thời gian thêm').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy HH:mm:ss') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('Người tạo').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle($translate('COM_LIST_COL_ACTION')).renderWith(function (data, type, full, meta) {
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
        debugger
        if ($rootScope.LotProductCode != '') {
            $scope.model.LotProductCode = $rootScope.LotProductCode;
            if ($scope.model.ProductCode != '' && $scope.model.Quantity != '') {
                var msg = $rootScope.checkProduct($scope.model);
                if (msg.Status == true) {
                    App.toastrWarning(msg.Title);
                    return;
                }
                dataservice.insertProduct($scope.model, function (rs) {
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
        debugger
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
        debugger
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
                dataservice.updateProduct($scope.model1, function (rs) {
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
                    dataservice.deleteProduct(id, function (rs) {
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
        dataservice.getProducts(function (result) {
            $scope.products = result;
        });

    }
    initData();

});



