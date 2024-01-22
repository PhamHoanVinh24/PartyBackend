var ctxfolder = "/views/admin/reportWarehouse";
var ctxfolderMessage = "/views/message-box";
var ctxfolderQrCode = "/views/admin/edmsQRCodeManager";

var app = angular.module('App_ESEIM', ['App_ESEIM_REPOSITORY', 'App_ESEIM_SUPPLIER', 'App_ESEIM_FILE_PLUGIN', 'App_ESEIM_DASHBOARD', "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ui.tinymce', 'monospaced.qrcode']);

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
        insert: function (data, callback) {
            $http.post('/Admin/inventory/Insert', data, callback).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/inventory/Update', data).then(callback);
        },
        deleteItems: function (data, callback) {
            $http.post('/Admin/inventory/DeleteItems', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/inventory/Delete/' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/inventory/GetItem?Id=' + data).then(callback);
        },
        getItemDetail: function (data, callback) {
            $http.get('/Admin/inventory/GetItemDetail/' + data).then(callback);
        },
        getproductgroup: function (callback) {
            $http.post('/Admin/inventory/GetProductGroup/').then(callback);
        },
        gettreedataLevel: function (callback) {
            $http.post('/Admin/inventory/GetProductUnit/').then(callback);
        },
        uploadImage: function (data, callback) {
            submitFormUpload('/Admin/inventory/UploadImage/', data, callback);
        },
        getTotal: function (data, callback) {
            $http.post('/Admin/inventory/GetTotal', data).then(callback);
        },

        getInheritances: function (data, callback) {
            $http.post('/Admin/inventory/GetInheritances?productCode=' + data).then(callback);
        },
        getProductCategoryTypes: function (callback) {
            $http.post('/Admin/inventory/GetProductCategoryTypes/').then(callback);
        },
        getProductTypes: function (callback) {
            $http.post('/Admin/inventory/GetProductTypes/').then(callback);
        },
        insertProductAttribute: function (data, callback) {
            console.log(data);
            $http.post('/Admin/inventory/InsertProductAttribute', data).then(callback);
        },
        deleteExtend: function (id, callback) {
            $http.post('/Admin/inventory/DeleteAttribute?Id=' + id).then(callback);
        },
        updateAttribute: function (data, callback) {
            $http.post('/Admin/inventory/UpdateAttribute', data).then(callback);
        },
        getAttributeItem: function (id, callback) {
            $http.post('/Admin/inventory/GetAttributeItem?id=' + id).then(callback);
        },
        jtreeRepository: function (callback) {
            $http.post('/Admin/EDMSRepository/JtreeRepository').then(callback);
        },
        insertFile: function (data, callback) {
            submitFormUpload('/Admin/inventory/InsertFile/', data, callback);
        },

        deleteFile: function (data, callback) {
            $http.post('/Admin/inventory/DeleteFile?id=' + data).then(callback);
        },
        updateFile: function (data, callback) {
            submitFormUpload('/Admin/inventory/UpdateFile/', data, callback);
        },
        getFile: function (data, callback) {
            $http.get('/Admin/inventory/GetFile?id=' + data).then(callback);
        },
        getStores: function (callback) {
            $http.post('/Admin/inventory/GetStores').then(callback);
        },
        getListProductCode: function (callback) {
            $http.post('/Admin/inventory/GetListProductCode').then(callback);
        },
        getListLotProductCode: function (callback) {
            $http.post('/Admin/Inventory/GetListLotProductCode').then(callback);
        },
        getListTicketCode: function (callback) {
            $http.post('/Admin/Inventory/GetListTicketCode').then(callback);
        },
        getListCoilByProdQrCode: function (data1, data2, data3, data4, callback) {
            $http.post('/Admin/MaterialExpStore/GetListCoilByProdQrCode?storeCode=' + data1 + '&productCode=' + data2 + '&productType=' + data3 + '&productQrCode=' + data4).then(callback);
        },
        getListLotByProdQrCode: function (data1, data2, data3, data4, callback) {
            $http.post('/Admin/MaterialExpStore/GetListLotByProdQrCode?storeCode=' + data1 + '&productCode=' + data2 + '&productType=' + data3 + '&productQrCode=' + data4).then(callback);
        },
        getListStore: function (callback) {
            $http.post('/Admin/MaterialExpStore/GetListStore').then(callback);
        },
        getStockByPosition: function (data, data1, callback) {
            $http.post('/Admin/Inventory/GetStockByPosition?mappingCode=' + data + '&unit=' + data1).then(callback);
        },
        getStockByProduct: function (data, callback) {
            $http.post('/Admin/Inventory/GetStockByProductCode?productCode=' + data).then(callback);
        },
        getStockByStore: function (data, callback) {
            $http.post('/Admin/Inventory/GetStockByStore?storeCode=' + data).then(callback);
        },
        getStockByPO: function (data, callback) {
            $http.post('/Admin/Inventory/GetStockByPO?poCode=' + data).then(callback);
        },
        getListFloorByWareHouseCode: function (data, callback) {
            $http.get('/Admin/Inventory/GetListFloorByWareHouseCode?wareHouseCode=' + data, callback).then(callback);
        },
        getListLineByFloorCode: function (data, callback) {
            $http.get('/Admin/Inventory/GetListLineByFloorCode?floorCode=' + data, callback).then(callback);
        },
        getListRackByLineCode: function (data, callback) {
            $http.get('/Admin/Inventory/GetListRackByLineCode?lineCode=' + data, callback).then(callback);
        },
        getListUserImport: function (callback) {
            $http.post('/Admin/Inventory/GetListUserImport').then(callback);
        },
        //New Mapping
        getListWareHouse: function (callback) {
            $http.get('/Admin/EDMSDiagramWarehouse/GetListMappingType?type=AREA').then(callback);
        },
        getListMapping: function (data, callback) {
            $http.get('/Admin/EDMSDiagramWarehouse/GetListMappingFilter?start=' + data).then(callback);
        },
        // Group Type
        getAllType: function (callback) {
            $http.post('/Admin/MaterialProductGroup/GetProductGroupTypes').then(callback);
        },
        // Supplier
        getListSupplier: function (callback) {
            $http.post('/Admin/ProductImport/GetListSupplier').then(callback);
        },
        // Customer
        getListCustomer: function (callback) {
            $http.post('/Admin/ProductExport/GetListCustomer').then(callback);
        },
        //Exort Excel
        exportExcel: function (data, callback) {
            $http.post('/Admin/ReportWarehouse/ExportExcel', data).then(callback);
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
            var partternCode = /^[a-zA-Z0-9._äöüÄÖÜ]*$/g;
            // var partternCode = new RegExp("^[a-zA-Z0-9_äöüÄÖÜ]*$");
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
    $rootScope.partternCode = /^[a-zA-Z0-9._äöüÄÖÜ]*$/g;
    $rootScope.partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/;
    //Miêu tả có thể null, và có chứa được khoảng trắng
    $rootScope.partternDescription = /^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*$/;
    $rootScope.partternDate = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;//Pormat dd/mm/yyyy
    $rootScope.partternEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    $rootScope.partternNumber = /^[0-9]\d*(\\d+)?$/; //Chỉ cho nhập số khong the am
    $rootScope.partternFloat = /^-?\d*(\.\d+)?$/; //Số thực
    $rootScope.partternNotSpace = /^[^\s].*/; //Không chứa khoảng trắng đầu dòng hoặc cuối dòng
    $rootScope.partternPhone = /^(0)+([0-9]{9,10})\b$/; //Số điện thoại 10,11 số bắt đầu bằng số 0
    $rootScope.checkData = function (data) {
        var partternCode = /^[a-zA-Z0-9._äöüÄÖÜ]*$/g;
        var partternTelephone = /[0-9]/g;
        var mess = { Status: false, Title: "" }
        if (!partternCode.test(data.SupCode)) {
            mess.Status = true;
            mess.Title = mess.Title.concat(" - ", caption.SUP_CURD_VALIDATE_CHARACTERS_SPACE_SUPCODE, "<br/>");
        }
        return mess;
    }
    $rootScope.checkDataMore = function (data) {
        var partternCode = /^[a-zA-Z0-9._äöüÄÖÜ]*$/g;
        var mess = { Status: false, Title: "" }
        if (!partternCode.test(data.AttributeCode)) {
            mess.Status = true;
            mess.Title = mess.Title.concat(" - ", caption.SUP_CURD_VALIDATE_CHARACTERS_SPACE_EXTCODE, "<br/>");
        }
        return mess;
    }
    $rootScope.checkDataContact = function (data) {
        var partternCode = /^[a-zA-Z0-9._äöüÄÖÜ]*$/g;
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

    dataservice.getListStore(function (rs) {
        rs = rs.data;
        $rootScope.MapStores = {};
        for (var i = 0; i < rs.length; ++i) {
            $rootScope.MapStores[rs[i].Code] = rs[i];
        }
    });
    $rootScope.ObjectTypeFile = "PROD_IN_STOCK";
    $rootScope.moduleName = "PROD_IN_STOCK";
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider, $locationProvider) {
    $locationProvider.hashPrefix('');
    $translateProvider.useUrlLoader('/Admin/Inventory/Translation');
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

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, $filter, $window) {
    $scope.model = {
        ProductCode: '',
        StoreCode: '',
        LotProductCode: '',
        ProductQrCode: '',
        FromDate: '',
        ToDate: '',
        MappingCode: '',
        SupplierCode: '',
        GroupType: 'GROUP_CODE',
        CusCode: 'OTHER',
        //FloorCode: '',
        //LineCode: '',
        //RackCode: '',
    }
    $scope.listType = [
        { Code: 'BOTTLE', Name: 'Tổng xuất nhập tồn theo chi tiết bình/vỏ' },
        { Code: 'GROUP_CODE', Name: 'Tổng xuất nhập tồn theo nhóm sp' },
        { Code: 'CUSTOMER', Name: 'Tổng xuất nhập tồn theo khách hàng' },
        { Code: 'CUS_GROUP', Name: 'Tổng xuất nhập tồn theo khách hàng và nhóm sp' },
        { Code: 'PROD_STATUS', Name: 'Tổng xuất nhập tồn theo trạng thái' },
    ];
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-change="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/ReportWarehouse/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProductCode = $scope.model.ProductCode;
                d.StoreCode = $scope.model.StoreCode;
                d.LotProductCode = $scope.model.LotProductCode;
                d.TicketCode = $scope.model.TicketCode;
                d.ProductQrCode = $scope.model.ProductQrCode;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
                d.MappingCode = $scope.model.MappingCode;
                d.CreatedBy = $scope.model.CreatedBy;
                d.GroupType = $scope.model.GroupType;
                d.SupplierCode = $scope.model.SupplierCode;
                d.CusCode = $scope.model.CusCode;
                //d.FloorCode = $scope.model.FloorCode;
                //d.LineCode = $scope.model.LineCode;
                //d.RackCode = $scope.model.RackCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
                $scope.$apply();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [4, 'desc'])
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
            if (data.IsGroup) {
                angular.element(row).addClass('bold');
            }
            //$(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
            //    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

            //    } else {
            //        //var Id = data.Id;
            //        $scope.edit(data);
            //    }
            //});
        });

    vm.dtColumns = [];
    var ad = 0;
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-change="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductCode').withTitle('{{"IN_LIST_COL_PRODUCT_CODE" | translate}}').notSortable().renderWith(function (data, type) {
        return `<span style="color: #183153; font-size: 15px">${data}</span>`;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductName').withTitle('{{"IN_LIST_COL_PRODUCT_NAME" | translate}}').notSortable().renderWith(function (data, type) {
        return `<span style="color: #183153; font-size: 15px">${data}</span>`;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Unit').withTitle('{{"IN_LIST_COL_UNIT" | translate}}').notSortable().renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('QuantityStart').withTitle('{{"Tồn đầu" | translate}}').notSortable().renderWith(function (data, type) {
        return 0;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SumImport').withTitle('{{"SL nhập" | translate}}').notSortable().renderWith(function (data, type) {
        //if (data <= 100)
        //    return '<span class="text-success">' + $filter('currency')(data, '') + '</span>';
        //else if (100 < data && data <= 500)
        //    return '<span class="text-warning"> ' + $filter('currency')(data, '') + '</span>';
        //else
        //    return '<span class="text-danger"> ' + $filter('currency')(data, '') + '</span>';
        return $filter('currency')(data, '');
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SumExport').withTitle('{{"SL xuất" | translate}}').notSortable().renderWith(function (data, type) {
        //if (data <= 100)
        //    return '<span class="text-success">' + $filter('currency')(data, '') + '</span>';
        //else if (100 < data && data <= 500)
        //    return '<span class="text-warning"> ' + $filter('currency')(data, '') + '</span>';
        //else
        //    return '<span class="text-danger"> ' + $filter('currency')(data, '') + '</span>';
        return $filter('currency')(data, '');
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withTitle('{{"Tồn cuối" | translate}}').notSortable().renderWith(function (data, type, full) {
        //if (data <= 100)
        //    return '<span class="text-success">' + $filter('currency')(data, '') + '</span>';
        //else if (100 < data && data <= 500)
        //    return '<span class="text-warning"> ' + $filter('currency')(data, '') + '</span>';
        //else
        //    return '<span class="text-danger"> ' + $filter('currency')(data, '') + '</span>';
        return $filter('currency')(data, '');
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

    $scope.changeGroupType = function () {
        switch ($scope.model.GroupType) {
            case 'FUEL':
                location.href = '/Admin/Inventory#indexFuel'
                break;

            default:
                break;
        }
    }

    // view help detail
    $scope.viewCmsDetail = function (helpId) {
        //item, bookMark
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderDashBoard + '/viewItem.html',
            controller: 'viewItemHelp',
            backdrop: 'static',
            windowClass: 'message-avoid-header',
            size: '65',
            resolve: {
                para: function () {
                    return {
                        helpId
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    };



    $scope.reload = function () {
        reloadData(true);
        $scope.getTotalValue();
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
        $scope.getTotalValue();
    };
    $scope.search = function () {
        reloadData(true);
        $scope.getTotalValue();
    }
    $scope.initData = function () {
        dataservice.getproductgroup(function (result) {
            result = result.data;
            $scope.listType = result;
            var all = {
                Code: '',
                Name: 'Tất cả'
            };
            $scope.listType.unshift(all);
        });
        dataservice.getStores(function (result) {
            result = result.data;
            $scope.stores = result;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.stores.unshift(all)
        });
        dataservice.getListProductCode(function (result) {
            result = result.data;
            $scope.listProductCode = result;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.listProductCode.unshift(all)
        });
        dataservice.getListLotProductCode(function (result) {
            result = result.data;
            $scope.listLotProductCode = result;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.listLotProductCode.unshift(all)
        });

        dataservice.getListTicketCode(function (rs) {
            rs = rs.data;
            $scope.listTicketCode = rs;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.listTicketCode.unshift(all)
        });

        dataservice.getListUserImport(function (rs) {
            rs = rs.data;
            $scope.listUserImport = rs;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.listUserImport.unshift(all)
        });

        // dataservice.getAllType(function (rs) {rs=rs.data;
        //     $scope.Types = rs;
        // });

        setTimeout(function () {
            $scope.getTotalValue();
        }, 500);
    }
    $scope.initData();

    $scope.changeSelect = function (type) {
        switch (type) {
            case 'WAREHOUSE':
                dataservice.getListMapping($scope.model.StoreCode, function (rs) {
                    rs = rs.data;
                    $scope.listMapping = rs;

                    $scope.model.MappingCode = '';
                    //$scope.model.LineCode = '';
                    //$scope.model.RackCode = '';
                });
                break;

            //case 'FLOOR':
            //    dataservice.getListLineByFloorCode($scope.model.FloorCode, function (rs) {
            //        rs = rs.data;
            //        $scope.listLine = rs;

            //        $scope.model.LineCode = '';
            //        $scope.model.RackCode = '';
            //    });
            //    break;

            //case 'LINE':
            //    dataservice.getListRackByLineCode($scope.model.LineCode, function (rs) {
            //        rs = rs.data;
            //        $scope.listRack = rs;

            //        $scope.model.RackCode = '';
            //    });
            //    break;
        }
    }

    $scope.getTotalValue = function () {
        dataservice.getTotal($scope.model, function (result) {
            result = result.data;
            if (result.Error) {
                App.toastrError(result.Title);
            } else {
                $scope.sumQuantity = result.sumQuantity;
            }
        });
    };
    $scope.viewQrCode = function (code) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderQrCode + '/qrViewer.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
                $scope.qrcodeString = code;
                setTimeout(function () {
                    setModalDraggable('.modal-dialog');
                }, 200);
            },
            backdrop: 'static',
            size: '25',
        });
    }
    //Thống kê lượng tồn cuộn/thùng theo sản phẩm
    $scope.reportInStock = function (productQrCode) {
        var size = 0;
        if ($window.innerWidth < 1200 && $window.innerWidth > 768) {
            size = 90;
        } else if ($window.innerWidth > 1200 && $window.innerWidth < 1500) {
            size = 65;
        } else {
            size = 65;
        }
        var obj = {
            ProductQrCode: productQrCode,
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/reportInStock.html',
            controller: 'reportInStock',
            backdrop: 'static',
            size: size,
            resolve: {
                para: function () {
                    return obj;
                }
            }
        });
        modalInstance.result.then(function (d) {
        }, function () {
        });

    }

    //Thống kê lượng tồn sản phẩm theo vị trí
    $scope.reportProdInStockByPosition = function (mappingCode) {

        var size = 0;
        if ($window.innerWidth < 1200 && $window.innerWidth > 768) {
            size = 90;
        } else if ($window.innerWidth > 1200 && $window.innerWidth < 1500) {
            size = 65;
        } else {
            size = 65;
        }
        var obj = {
            MappingCode: mappingCode,
            Unit: ""
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/reportLotInStock.html',
            controller: 'reportLotInStock',
            backdrop: 'static',
            size: size,
            resolve: {
                para: function () {
                    return obj;
                }
            }
        });
        modalInstance.result.then(function (d) {
        }, function () {
        });

    }//Thống kê lượng tồn sản phẩm theo sản phẩm mới
    $scope.reportProdInStockByProductCode = function (productCode) {

        var size = 0;
        if ($window.innerWidth < 1200 && $window.innerWidth > 768) {
            size = 90;
        } else if ($window.innerWidth > 1200 && $window.innerWidth < 1500) {
            size = 65;
        } else {
            size = 65;
        }
        var obj = {
            ProductCode: productCode,
            Unit: ""
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/reportLotInStock.html',
            controller: 'reportLotByProduct',
            backdrop: 'static',
            size: size,
            resolve: {
                para: function () {
                    return obj;
                }
            }
        });
        modalInstance.result.then(function (d) {
        }, function () {
        });

    }

    //Thống kê lượng tồn theo đơn hàng

    //Thống kê lượng tồn theo kho
    $scope.reportProdByStore = function (storeCode) {
        var size = 0;
        if ($window.innerWidth < 1200 && $window.innerWidth > 768) {
            size = 90;
        } else if ($window.innerWidth > 1200 && $window.innerWidth < 1500) {
            size = 65;
        } else {
            size = 65;
        }
        var obj = {
            StoreCode: storeCode,
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/reportStockByStore.html',
            controller: 'reportStockByStore',
            backdrop: 'static',
            size: size,
            resolve: {
                para: function () {
                    return obj;
                }
            }
        });
        modalInstance.result.then(function (d) {
        }, function () {
        });
    }

    //Thống kê lượng tồn theo PO
    $scope.reportProdByPO = function (poCode) {

        if (poCode == "" || poCode == null || poCode == undefined) {
            App.toastrError("Không có đơn hàng được chọn");
            return;
        }
        var size = 0;
        if ($window.innerWidth < 1200 && $window.innerWidth > 768) {
            size = 90;
        } else if ($window.innerWidth > 1200 && $window.innerWidth < 1500) {
            size = 65;
        } else {
            size = 65;
        }
        var obj = {
            PoCode: poCode,
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/reportStockByPO.html',
            controller: 'reportStockByPO',
            backdrop: 'static',
            size: size,
            resolve: {
                para: function () {
                    return obj;
                }
            }
        });
        modalInstance.result.then(function (d) {
        }, function () {
        });
    }


    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }

    setTimeout(function () {
    }, 50);

    //Export Excel
    $scope.export = function () {
        var orderBy = 'Id DESC';
        var exportType = 0;
        var orderArr = $scope.dtInstance.DataTable.order();
        var column;
        if (orderArr.length == 2) {
            column = $scope.dtInstance.DataTable.init().aoColumns[orderArr[0]];
            orderBy = column.mData + ' ' + orderArr[1];
        } else if (orderArr.length > 0) {
            var order = orderArr[0];
            column = $scope.dtInstance.DataTable.init().aoColumns[order[0]];
            orderBy = column.mData + ' ' + order[1];
        }

        var page = vm.dtInstance.DataTable.page() + 1;
        var length = vm.dtInstance.DataTable.page.len();
        location.href = "/Admin/Inventory/ExportExcel?"
            //+ "page=" + page
            //+ "&row=" + length
            + "ProductCode=" + $scope.model.ProductCode
            + "&StoreCode=" + $scope.model.StoreCode
            + "&LotProductCode=" + $scope.model.LotProductCode
            + "&ProductQrCode=" + $scope.model.ProductQrCode
        //+ "&orderBy=" + orderBy
    }


    $scope.exportExcel = function () {
        dataservice.exportExcel($scope.model, function (rs) {
            rs = rs.data;
            App.unblockUI("#contentMain");
            download(rs.fileName, '/' + rs.pathFile);
        });
    }

    function download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', text);
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    $scope.uploadFile = function (code) {
        $rootScope.ObjCode = code;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/fileStock.html',
            controller: 'uploadFileStock',
            backdrop: 'static',
            size: '60',
            resolve: {
                para: function () {
                    return null;
                }
            }
        });
        modalInstance.result.then(function (id) {

        }, function () {
        });
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
            if ($scope.model.FromDate != undefined && $scope.model.FromDate != '' && $scope.model.FromDate != null) {
                var from = $scope.model.FromDate.split("/");
                var date = new Date(from[2], from[1] - 1, from[0])
                $('#DateTo').datepicker('setStartDate', date);
            }
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            if ($scope.model.ToDate != undefined && $scope.model.ToDate != '' && $scope.model.ToDate != null) {
                var from = $scope.model.ToDate.split("/");
                var date = new Date(from[2], from[1] - 1, from[0])
                $('#FromTo').datepicker('setEndDate', $scope.model.ToDate);
            }
            $('#DateTo').datepicker('setStartDate', null);
        });
    }
    setTimeout(function () {
        loadDate();
    }, 200);
});