var ctxfolder = "/views/admin/productSellPrice";
var ctxfolderMessage = "/views/message-box";
var ctxfolderQrCode = "/views/admin/edmsQRCodeManager";

var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ui.tinymce', 'dynamicNumber', 'monospaced.qrcode']);
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
        deleteItems: function (data, callback) {
            $http.post('/Admin/productSellPrice/DeleteItems', data).then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/productSellPrice/GetItem?Id=' + data).then(callback);
        },
        // product cosst
        insert: function (data, callback) {
            $http.post('/Admin/productSellPrice/Insert', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/productSellPrice/Delete?Id=' + data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/productSellPrice/Update', data).then(callback);
        },
        insertProductPriceDetail: function (data, callback) {
            $http.post('/Admin/productSellPrice/InsertProductPriceDetail', data).then(callback);
        },
        getProductInLot: function (callback) {
            $http.post('/Admin/productSellPrice/GetProductInLot').then(callback);
        },
        deleteProduct: function (data, callback) {
            $http.post('/Admin/productSellPrice/DeleteProduct?Id=' + data).then(callback);
        },
        getProductitem: function (data, callback) {
            $http.post('/Admin/productSellPrice/GetProductitem?Id=' + data).then(callback);
        },
        updateProductPriceDetail: function (data, callback) {
            $http.post('/Admin/productSellPrice/UpdateProductPriceDetail', data, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#contentMain");
                }
            }).then(callback);
        },
        updateProductPriceChange: function (data, callback) {
            $http.post('/Admin/productSellPrice/UpdateProductPriceChange', data, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#contentMain");
                }
            }).then(callback);
        },
        getListServiceCategory: function (callback) {
            $http.post('/Admin/ServiceCategoryPrice/GetListServiceCategory').then(callback);
        },
        getServiceUnit: function (callback) {
            $http.post('/Admin/ServiceCategoryPrice/GetServiceUnit').then(callback);
        },
        getServiceCondition: function (callback) {
            $http.post('/Admin/ServiceCategoryPrice/GetServiceCondition').then(callback);
        },
        getServiceResponsibleUser: function (callback) {
            $http.post('/Admin/ServiceCategoryPrice/GetServiceResponsibleUser').then(callback);
        },
        getServiceStatus: function (callback) {
            $http.post('/Admin/ServiceCategoryPrice/GetServiceStatus').then(callback);
        },
        getListCurrency: function (callback) {
            $http.post('/Admin/ServiceCategoryPrice/GetListCurrency').then(callback);
        },
        getServiceDefault: function (headerCode, serviceCatCode, callback) {
            $http.post('/Admin/ServiceCategoryPrice/GetServiceDefault?headerCode=' + headerCode + "&&serviceCatCode=" + serviceCatCode).then(callback);
        },
        getUnitByServiceCode: function (data, callback) {
            $http.post('/Admin/ServiceCategoryPrice/GetUnitByServiceCode?serviceCode=' + data).then(callback);
        },
        getListProduct: function (data, callback) {
            $http.post('/Admin/ProductSellPrice/GetListProduct?catelogue=' + data).then(callback);
        },
        loadAll: function (data, callback) {
            $http.get('/Admin/ProductSellPrice/LoadAll?headerCode=' + data, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#contentMain");
                }
            }).then(callback);
        },
        getProductCatelogue: function (callback) {
            $http.post('/Admin/ProductSellPrice/GetProductCatelogue/').then(callback);
        },
        getProductDetail: function (headerCode, productCatelogueCodeSearch, productCodeSearch, callback) {
            $http.post('/Admin/ProductSellPrice/GetProductDetail?headerCode=' + headerCode + '&&productCatelogueCodeSearch=' + productCatelogueCodeSearch + '&&productCodeSearch=' + productCodeSearch).then(callback);
        },
    }
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    $rootScope.PERMISSION_PRODUCT_SELL_PRICE = PERMISSION_PRODUCT_SELL_PRICE;
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
                mess.Title = mess.Title.concat(" - ", caption.PSP_VALIDATE_CODE_PRODUCT, "<br/>");
            }
            return mess;
        }

        $rootScope.validationOptions = {
            rules: {
                Title: {
                    required: true,
                },
                EffectiveDate: {
                    required: true,
                },
                ExpiryDate: {
                    required: true,
                },
            },
            messages: {
                Title: {
                    required: caption.PSP_VALIDATE_TITLE,
                },
                EffectiveDate: {
                    required: caption.PSP_VALIDATE_FROM_DAY,//"Nhập hiệu lực từ ngày !",
                },
                ExpiryDate: {
                    required: caption.PSP_VALIDATE_CURD_TO_DAY//"Nhập hiệu lực đến ngày !",
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
            mess.Title = mess.Title.concat(" - ", caption.PSP_VALIDATE_PHONE_NUMBER, "<br/>");
        }
        return mess;
    }
    $rootScope.checkProduct = function (data) {
        var mess = { Status: false, Title: "" };
        if (data != null && !$rootScope.partternFloat.test(data.Quantity)) {
            mess.Status = true;
            mess.Title = mess.Title.concat(caption.PSP_VALIDATE_QUANTITY_IS_NUMBER);
        }
        return mess;
    }

    $rootScope.QrDefault = "";
    $rootScope.BarDefault = "";
    $rootScope.Cost = 0;
    $rootScope.priority = 0;
    $rootScope.Type = "";
});
app.factory("interceptors", [function () {
    return {
        // if beforeSend is defined call it
        'request': function (request) {
            if (request.beforeSend)
                request.beforeSend();

            return request;
        },
        // if complete is defined call it
        'response': function (response) {
            if (response.config.complete)
                response.config.complete(response);
            return response;
        }
    };
}]);
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/ProductSellPrice/Translation');
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
    $httpProvider.interceptors.push('interceptors');
});
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, $filter) {
    $scope.model = {
        productcode: '',
        productname: '',
        unit: '',
        describe: '',
        Status:''
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
            url: "/Admin/productSellPrice/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Title = $scope.model.Title;
                d.Status = $scope.model.Status;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
                $scope.$apply();
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
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);

            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                    $scope.selected[data.Id] = !$scope.selected[data.Id];
                } else {
                    //var self = $(this).parent();
                    //if ($(self).hasClass('selected')) {
                    //    $(self).removeClass('selected');
                    //    $scope.selected[data.Id] = false;
                    //} else {
                    //    $('#tblData').DataTable().$('tr.selected').removeClass('selected');
                    //    $scope.selected.forEach(function (obj, index) {
                    //        if ($scope.selected[index])
                    //            $scope.selected[index] = false;
                    //    });
                    //    $(self).addClass('selected');
                    //    $scope.selected[data.Id] = true;
                    //}
                }

                vm.selectAll = false;
                $scope.$apply();
            });
            if ($rootScope.PERMISSION_PRODUCT_SELL_PRICE.Update) {
                $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                    } else {
                        var Id = data.Id;
                        $scope.edit(Id);
                    }
                });
            }
        });

    vm.dtColumns = [];
    var ad = 0;
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('QrCode').withTitle('{{"PSP_LIST_COL_QR_CODE" | translate}}').renderWith(function (data, type) {
        return '<qrcode role="button" ng-click="viewQrCode(\'' + data + '\')" data=' + data + ' size="35"></qrcode>'
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"PSP_LIST_COL_TITLE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EffectiveDate').withTitle('{{"PSP_LIST_COL_EFFECTIVE_DATE" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ExpiryDate').withTitle('{{"PSP_LIST_COL_EXPIRY_DATE" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"PSP_LIST_COL_CREATED_TIME" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{"PSP_LIST_COL_CREATED_BY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"PSP_LIST_COL_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'w75').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        var listButton = '';
        if ($rootScope.PERMISSION_PRODUCT_SELL_PRICE.Update) {
            listButton += '<a ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding-right: 5px" class=""><i style="--fa-primary-color: green;"  class="fa-solid fa-pen-to-square fs25"></i></a>';
        }
        if ($rootScope.PERMISSION_PRODUCT_SELL_PRICE.Delete) {
            listButton += '<a ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px"><i style="--fa-primary-color: red;" class="fa-solid fa-trash  fs25"></i></a>';
        }
        return listButton;
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
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.search = function () {
        reloadData(true);
    }
    $scope.initData = function () {
        dataservice.getServiceStatus(function (rs) {
            rs = rs.data;
            $scope.listStatus = rs;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.listStatus.unshift(all)
        });
    }
    $scope.initData();

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
        dataservice.getItem(id, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/edit.html',
                    controller: 'edit',
                    backdrop: 'static',
                    size: '70',
                    resolve: {
                        para: function () {
                            return rs.Object;
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
                    dataservice.delete(id, function (rs) {rs=rs.data;
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

    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
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
    setTimeout(function () {
        loadDate();
    }, 50);
});
app.directive('customOnChange', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChange);
            element.on('change', onChangeHandler);
            element.on('$destroy', function () {
                element.off();
            });

        }
    };
});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter, DTOptionsBuilder, $translate) {
    $scope.model = {
        Id: 0,
        HeaderCode: '',
        Title: '',
        sEffectiveDate: '',
        sExpiryDate: '',
        ResponsibleUser: '',
        Note: '',
    };
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    var vm = $scope;
    $scope.currentItemEdit = null;
    $rootScope.HeaderCode = '';
    $scope.isEdit = false;
    $scope.initData = function () {
        dataservice.getServiceStatus(function (rs) {rs=rs.data;
            $scope.listStatus = rs;
        });
        dataservice.getServiceResponsibleUser(function (rs) {rs=rs.data;
            $scope.listResponsibleUser = rs;
        });
    }
    $scope.initData();
    $scope.loadAll = function () {
        if ($scope.model.HeaderCode != '') {
            dataservice.loadAll($scope.model.HeaderCode, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $rootScope.reloadProduct();
                }
            });
        } else {
            App.toastrError("Vui lòng thêm bảng giá trước khi tải giá mặc định");
        }
    }

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
            if ($rootScope.HeaderCode == '') {
                dataservice.insert($scope.model, function (rs) {rs=rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $scope.model.HeaderCode = rs.Object.HeaderCode;
                        $scope.model.GivenName = rs.Object.GivenName;
                        $scope.model.Id = rs.Object.Id;
                        $rootScope.HeaderCode = rs.Object.HeaderCode;
                    }
                });
            } else {
                dataservice.update($scope.model, function (rs) {rs=rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                    }
                });
            }
        }
    }
    $scope.CheckEffectiveDate = function () {
        if ($scope.model.sEffectiveDate == "") {
            let dateString = '0000-01-01T00:00:00'
            let minDate = new Date(dateString);
            $('#ExpiryDate').datepicker('setStartDate', minDate);
        }
    };
    $scope.CheckExpiryDate = function () {
        if ($scope.model.sExpiryDate == "") {
            let dateString = '9999-12-31T00:00:00'
            let maxDate = new Date(dateString);
            $('#EffectiveDate').datepicker('setEndDate', maxDate);
        }

    };
    function loadDate() {
        $("#EffectiveDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ExpiryDate').datepicker('setStartDate', maxDate);
            if ($('#EffectiveDate').valid()) {
                $('#EffectiveDate').removeClass('invalid').addClass('success');
            }
        });
        $("#ExpiryDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EffectiveDate').datepicker('setEndDate', maxDate);
            if ($('#ExpiryDate').valid()) {
                $('#ExpiryDate').removeClass('invalid').addClass('success');
            }
        });
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.sEffectiveDate == "") {
            $scope.errorEffectiveDate = true;
            mess.Status = true;
        } else {
            $scope.errorEffectiveDate = false;

        }
        if (data.sExpiryDate == "") {
            $scope.errorExpiryDate = true;
            mess.Status = true;
        } else {
            $scope.errorExpiryDate = false;

        }


        return mess;
    };
    setTimeout(function () {
        loadDate();
    }, 200);
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter, DTOptionsBuilder, $translate, para) {
    $scope.model = {
        HeaderCode: '',
        Title: '',
        sEffectiveDate: '',
        sExpiryDate: '',
        ResponsibleUser: '',
        Note: '',
    };
    $scope.model = para;
    $scope.initListProduct = false;
    $rootScope.HeaderCode = para.HeaderCode;
    $scope.model.sEffectiveDate = ($scope.model.EffectiveDate != null ? $filter('date')(new Date($scope.model.EffectiveDate), 'dd/MM/yyyy') : "");
    $scope.model.sExpiryDate = ($scope.model.ExpiryDate != null ? $filter('date')(new Date($scope.model.ExpiryDate), 'dd/MM/yyyy') : "");

    if (para.ResponsibleUser != '' && para.ResponsibleUser != undefined)
        $scope.model.ResponsibleUser = parseInt(para.ResponsibleUser);

    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.currentItemEdit = null;
    $scope.initData = function () {
        dataservice.getServiceStatus(function (rs) {rs=rs.data;
            $scope.listStatus = rs;
        });
        dataservice.getServiceResponsibleUser(function (rs) {rs=rs.data;
            $scope.listResponsibleUser = rs;
        });
    }
    $scope.initData();
    $scope.loadAll = function () {
        if ($scope.model.HeaderCode != '') {
            dataservice.loadAll($scope.model.HeaderCode, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $rootScope.reloadProduct();
                }
            });
        }
    }

    $scope.submit = function () {
        if ($scope.editform.validate()) {
            dataservice.update($scope.model, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.model.HeaderCode = rs.Object.HeaderCode;
                    $rootScope.HeaderCode = rs.Object.HeaderCode;
                }
            });
        }
    }
    $scope.CheckEffectiveDate = function () {
        if ($scope.model.sEffectiveDate != "") {
            $scope.errorEffectiveDate = false;
        }
        if ($scope.model.sEffectiveDate == "") {
            let dateString = '0-01-00T00:00:00'
            let maxDate = new Date(dateString);
            $('#ExpiryDate').datepicker('setStartDate', maxDate);
        }

    };
    $scope.CheckExpiryDate = function () {
        if ($scope.model.sExpiryDate != "") {
            $scope.errorExpiryDate = false;
        }
        if ($scope.model.sExpiryDate == "") {
            let dateString = '9999-12-31T00:00:00'
            let maxDate = new Date(dateString);
            $('#EffectiveDate').datepicker('setEndDate', maxDate);
        }

    };
    function loadDate() {
        $("#EffectiveDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ExpiryDate').datepicker('setStartDate', maxDate);
        });
        $("#ExpiryDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EffectiveDate').datepicker('setEndDate', maxDate);
        });
    }
    setTimeout(function () {
        loadDate();
    }, 200);
});
app.controller('product', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
    var vm = $scope;
    $scope.selected = [];
    $scope.products = [];
    $scope.catelogeProducts = [];
    $scope.datatable = {};
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    $scope.currentItemEdit = null;
    $scope.model = {
        ProductCode: '',
        ProductCodeSearch: '',
        ProductCatelogueCodeSearch: '',
        PriceCost: 0,
        PriceCostDefault: 0,
        PriceCostCatelogue: 0,
        PriceCostAirline: 0,
        PriceCostAirline: 0,
        PriceCostSea: 0,
        PriceRetail: 0,
        PriceRetailBuild: 0,
        PriceRetailBuildAirline: 0,
        PriceRetailBuildSea: 0,
        PriceRetailNoBuild: 0,
        PriceRetailNoBuildAirline: 0,
        PriceRetailNoBuildSea: 0,

        RatePriceCostCatelogue: 1,
        RatePriceCostAirline: 1,
        RatePriceCostSea: 1,
        RatePriceRetail: 1,
        RatePriceRetailBuild: 1,
        RatePriceRetailBuildAirline: 1,
        RatePriceRetailBuildSea: 1,
        RatePriceRetailNoBuild: 1,
        RatePriceRetailNoBuildAirline: 1,
        RatePriceRetailNoBuildSea: 1,
        Tax: 0,
        ListProductProcess: []
    }
    $scope.listProductProcess = [];
    $scope.isEdit = false;
    $scope.dataJtable = {};
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/ProductSellPrice/JTableDetail",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.HeaderCode = $rootScope.HeaderCode;
                d.ProductCodeSearch = $scope.model.ProductCodeSearch;
                d.ProductCatelogueCodeSearch = $scope.model.ProductCatelogueCodeSearch;
            },
            complete: function () {
                dataservice.getProductDetail($rootScope.HeaderCode, $scope.model.ProductCatelogueCodeSearch, $scope.model.ProductCodeSearch, function (result) {result=result.data;
                    $scope.listProductProcess = result;
                });
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
            $scope.datatable[data.Id] = data;
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                    $scope.selected[data.id] = !$scope.selected[data.Id];
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.id] = false;
                    } else {
                        $('#tblData').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.id] = true;
                        if (evt.target.localName != 'i' && evt.target.localName != 'button') {
                            var Id = data.Id;
                            $scope.edit(Id);
                        }
                    }
                }

                vm.selectAll = false;
                $scope.$apply();
            });
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.Id;
                    $scope.edit(Id);
                }
            });
        });
    vm.dtColumns = [];

    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('QrCode').withTitle('QrCode').renderWith(function (data, type) {
    //    return '<img class=" image-upload h-50 w50" style="width:50px; height:50px" role="button" src="data:image/png;base64, ' + data + '" />';
    //}));

    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductCode').withTitle('{{"PSP_PRODUCT_LIST_COL_PRODUCT_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', ''));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductName').withTitle('{{"PSP_PRODUCT_LIST_COL_PRODUCT_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PriceCostDefault').withTitle('{{"PSP_PRODUCT_LIST_COL_PRICE_COST_DEFAULT" | translate}}').renderWith(function (data, type) {
        return '<span class="text-danger">' + $filter('currency')(data, '', 0) + '</span>';
    }));

    //vm.dtColumns.push(DTColumnBuilder.newColumn('PriceCostCatelogue').withTitle('{{"PSP_PRODUCT_LIST_COL_PRICE_COST_CATELOGUE" | translate}}').renderWith(function (data, type) {
    //    return '<span class="text-danger">' + $filter('currency')(data, '', 0) + '</span>';
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('PriceCostAirline').withTitle('{{"PSP_PRODUCT_LIST_COL_PRICE_COST_AIRLINE" | translate}}').renderWith(function (data, type) {
    //    return '<span class="text-danger">' + $filter('currency')(data, '', 0) + '</span>';
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('PriceCostSea').withTitle('{{"PSP_PRODUCT_LIST_COL_PRICE_COST_SEA" | translate}}').renderWith(function (data, type) {
    //    return '<span class="text-danger">' + $filter('currency')(data, '', 0) + '</span>';
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('PriceRetailBuild').withTitle('{{"PSP_PRODUCT_LIST_COL_PRICE_RETAIL_BUILD" | translate}}').renderWith(function (data, type) {
    //    return '<span class="text-danger">' + $filter('currency')(data, '', 0) + '</span>';
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('PriceRetailBuildAirline').withTitle('{{"PSP_PRODUCT_LIST_COL_PRICE_RETAIL_BUILD_AIRLINE" | translate}}').renderWith(function (data, type) {
    //    return '<span class="text-danger">' + $filter('currency')(data, '', 0) + '</span>';
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('PriceRetailBuildSea').withTitle('{{"PSP_PRODUCT_LIST_COL_PRICE_RETAIL_BUILD_SEA" | translate}}').renderWith(function (data, type) {
    //    return '<span class="text-danger">' + $filter('currency')(data, '', 0) + '</span>';
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('PriceRetailNoBuild').withTitle('{{"PSP_PRODUCT_LIST_COL_PRICE_RETAIL_NO_BUILD" | translate}}').renderWith(function (data, type) {
    //    return '<span class="text-danger">' + $filter('currency')(data, '', 0) + '</span>';
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('PriceRetailNoBuildAirline').withTitle('{{"PSP_PRODUCT_LIST_COL_PRICE_RETAIL_NO_BUILD_AIRLINE" | translate}}').renderWith(function (data, type) {
    //    return '<span class="text-danger">' + $filter('currency')(data, '', 0) + '</span>';
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('PriceRetailNoBuildSea').withTitle('{{"PSP_PRODUCT_LIST_COL_PRICE_RETAIL_NO_BUILD_SEA" | translate}}').renderWith(function (data, type) {
    //    return '<span class="text-danger">' + $filter('currency')(data, '', 0) + '</span>';
    //}));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Tax').withTitle('{{"PSP_PRODUCT_LIST_COL_TAX" | translate}}').renderWith(function (data, type) {
        if (data != null)
            data = data + " %";
        return "<span class='text-primary'>" + data + "<span/>";
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle($translate('COM_LIST_COL_ACTION')).renderWith(function (data, type, full, meta) {
        return '<a title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding-right: 5px;" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a>' +
            '<a title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash  fs25"></i></a>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        $rootScope.Cost = 0;
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
        reloadData(true);
    }
    $rootScope.reloadProduct = function () {
        reloadData(true);
        $scope.initData();
    }
    $scope.initData = function () {
        dataservice.getProductCatelogue(function (result) {result=result.data;
            $scope.catelogueProducts = result;
        });
        dataservice.getListProduct('', function (result) {result=result.data;
            $scope.products = result;
            $scope.productEdits = result;
        });
    }
    $scope.initData();

    $scope.add = function () {
        if ($scope.model.ProductCode == '' || $scope.model.ProductCode == null) {
            App.toastrError("Vui lòng chọn sản phẩm !");
            return;
        }
        if ($scope.model.PriceCost == '' || $scope.model.PriceCost == null) {
            App.toastrError("Vui lòng nhập giá sỉ !");
            return;
        }
        if ($scope.model.PriceRetail == '' || $scope.model.PriceRetail == null) {
            App.toastrError("Vui lòng nhập giá lẻ !");
            return;
        }
        if ($scope.model.Tax == '' || $scope.model.Tax == null) {
            App.toastrError("Vui lòng nhập thuế !");
            return;
        }
        $scope.model.HeaderCode = $rootScope.HeaderCode;
        dataservice.insertProductPriceDetail($scope.model, function (rs) {rs=rs.data;
            if (rs.Error == true) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.reload();
            }
        });
    }

    $scope.edit = function (id) {
        var data = $scope.datatable[id];
        $scope.currentItemEdit = data;
        $scope.isEdit = true;
        $scope.model.Id = data.Id;
        $scope.model.ProductCode = data.ProductCode;
        $scope.model.PriceCost = data.PriceCost;
        $scope.model.PriceCostDefault = data.PriceCostDefault;
        $scope.model.PriceCostCatelogue = data.PriceCostCatelogue;
        $scope.model.PriceCostAirline = data.PriceCostAirline;
        $scope.model.PriceCostSea = data.PriceCostSea;
        $scope.model.PriceRetail = data.PriceRetail;
        $scope.model.PriceRetailBuild = data.PriceRetailBuild;
        $scope.model.PriceRetailBuildAirline = data.PriceRetailBuildAirline;
        $scope.model.PriceRetailBuildSea = data.PriceRetailBuildSea;
        $scope.model.PriceRetailNoBuild = data.PriceRetailNoBuild;
        $scope.model.PriceRetailNoBuildAirline = data.PriceRetailNoBuildAirline;
        $scope.model.PriceRetailNoBuildSea = data.PriceRetailNoBuildSea;
        $scope.model.Tax = parseInt(data.Tax);
    }

    $scope.close = function () {
        $scope.isEdit = false;
    }

    $scope.save = function () {
        if ($scope.model.ProductCode == '' || $scope.model.ProductCode == null) {
            App.toastrError("Vui lòng chọn sản phẩm !");
            return;
        }
        if ($scope.model.Tax == '' || $scope.model.Tax == null)
            $scope.model.Tax = 0;
        $scope.model.HeaderCode = $rootScope.HeaderCode;

        dataservice.updateProductPriceDetail($scope.model, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.isEdit = false;
                App.toastrSuccess(rs.Title);
                $scope.reload();
            }
        });
    }

    $scope.closeChangeRate = function () {
        $scope.isEdit = false;
    }

    $scope.saveChangeRate = function () {
        //if ($scope.model.ProductCode == '' || $scope.model.ProductCode == null) {
        //    App.toastrError("Vui lòng chọn sản phẩm !");
        //    return;
        //}
        //if ($scope.model.Tax == '' || $scope.model.Tax == null) {
        //    App.toastrError("Vui lòng nhập thuế !");
        //    return;
        //}
        $scope.model.HeaderCode = $rootScope.HeaderCode;
        $scope.model.ListProductProcess = $scope.listProductProcess;
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmUpdate.html',
            windowClass: "message-center",
            resolve: {
                para: function () {
                    return $scope.model;
                }
            },
            controller: function ($scope, $uibModalInstance, para) {
                $scope.message = "Bạn có chắc chắn muốn thay đổi ?";
                $scope.ok = function () {
                    $uibModalInstance.close();
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            size: '25',
        });
        modalInstance.result.then(function (d) {
            
            App.blockUI({
                target: "#contentMain",
                boxed: true,
                message: 'loading...'
            });
            dataservice.updateProductPriceChange($scope.model, function (rs) {
                rs = rs.data;
                App.unblockUI("#contentMain");
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $scope.reload();
                }
            });
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

    $scope.changleSelect = function (type, item) {
        if (type == "ProductCategoryCode") {
            $scope.model.ProductCodeSearch = '';
            dataservice.getListProduct($scope.model.ProductCatelogueCodeSearch, function (result) {result=result.data;
                $scope.products = result;
            });
        }
    }

    $scope.clearData = function () {
        $scope.model.ProductCatelogueCodeSearch = '';
        $scope.model.ProductCodeSearch = '';
        dataservice.getListProduct('', function (result) {result=result.data;
            $scope.products = result;
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
    setTimeout(function () {
        loadDate();
    }, 200);
});

