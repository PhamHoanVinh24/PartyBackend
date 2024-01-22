var ctxfolder = "/views/admin/materialSBatch";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber'])
    .directive('customOnChange', function () {
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
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        getOrigin: function (callback) {
            $http.post('/Admin/MaterialSBatch/GetOrigin').then(callback);
        },
        getCurrency: function (callback) {
            $http.post('/Admin/MaterialSBatch/GetCurrency').then(callback);
        },
        getUnit: function (callback) {
            $http.post('/Admin/MaterialSBatch/GetUnit').then(callback);
        },
        getStore: function (callback) {
            $http.post('/Admin/MaterialSBatch/GetStore').then(callback);
        },
        getProduct: function (callback) {
            $http.post('/Admin/MaterialSBatch/GetProduct').then(callback);
        },
        getSupplier: function (callback) {
            $http.post('/Admin/MaterialSBatch/Getsupplier').then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/MaterialSBatch/GetItem', data).then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/MaterialSBatch/Insert', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/MaterialSBatch/Update', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/MaterialSBatch/Delete', data).then(callback);
        }
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, $cookies, $translate, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };

    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {

        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        });
        $rootScope.validationOptions = {
            rules: {
                Code: {
                    required: true,
                    maxlength: 100
                },
                Name: {
                    required: true,
                    maxlength: 250
                },
                Quantity: {
                    required: true,
                },
                DateReiceive: {
                    required: true,
                }
            },
            messages: {
                Code: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.MSB_CURD_LBL_MSB_CODE_BATCH),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.MSB_CURD_LBL_MSB_CODE_BATCH).replace("{1}", "100")
                },
                Name: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.MSB_CURD_LBL_MSB_NAME_BATCH),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.MSB_CURD_LBL_MSB_NAME_BATCH).replace("{1}", "250")
                },
                Quantity: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.MSB_CURD_LBL_MSB_AMOUNT),
                },
                DateReiceive: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.MSB_CURD_LBL_MSB_DATE_CREATED),
                }
            }
        }
        //$rootScope.checkData = function (data) {
        //    var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/;
        //    var partternName = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]+[^!@#$%^&*<>?]*$/; //Có chứa được khoảng trắng
        //    //var partternDescription = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]*[^Đđ!@#$%^&*<>?]*$/; //Có thể null, và có chứa được khoảng trắng
        //    var partternUrl = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]*[^!@$%^&*<>?]*$/; //Có thể null, và có chứa được khoảng trắng & dấu #
        //    var mess = { Status: false, Title: "" }
        //    if (!partternCode.test(data.ApplicationCode)) {
        //        mess.Status = true;
        //        mess.Title = mess.Title.concat(" - ", caption.VALIDATE_ITEM_CODE.replace('{0}', caption.APP_CODE), "<br/>");
        //    }
        //    if (!partternName.test(data.Title)) {
        //        mess.Status = true;
        //        mess.Title += " - " + caption.VALIDATE_ITEM_NAME.replace('{0}', caption.APP_NAME) + "<br/>";
        //    }
        //    if (!partternUrl.test(data.AppUrl)) {
        //        mess.Status = true;
        //        mess.Title += " - " + caption.VALIDATE_ITEM.replace('{0}', caption.URL_APP) + "<br/>";
        //    }
        //    return mess;
        //}
        //$rootScope.validationOptions = {
        //    rules: {
        //        Title: {
        //            required: true,
        //            maxlength: 255
        //        },
        //        ApplicationCode: {
        //            required: true,
        //            maxlength: 50
        //        },
        //        Ord: {
        //            required: true,
        //            maxlength: 5
        //        },
        //        AppUrl: {
        //            required: true,
        //            maxlength: 255
        //        }
        //    },
        //    messages: {
        //        Title: {
        //            required: caption.ERR_REQUIRED.replace('{0}', caption.APP_NAME),
        //            maxlength: caption.ERR_EXCEED_CHARACTERS.replace('{0}', caption.APP_NAME).replace('{1}', '255')
        //        },
        //        ApplicationCode: {
        //            required: caption.ERR_REQUIRED.replace("{0}", caption.APP_CODE),
        //            maxlength: caption.ERR_EXCEED_CHARACTERS.replace("{0}", caption.APP_CODE).replace("{1}", "50")
        //        },
        //        Ord: {
        //            required: caption.ERR_REQUIRED.replace("{0}", caption.ORDER),
        //            maxlength: caption.ERR_EXCEED_CHARACTERS.replace('{0}', caption.ORDER_SORT).replace('{1}', '5')
        //        },
        //        AppUrl: {
        //            required: caption.ERR_REQUIRED.replace("{0}", caption.URL_APP),
        //            maxlength: caption.ERR_EXCEED_CHARACTERS.replace("{0}", caption.URL_APP).replace("{1}", "255")
        //        }
        //    }
        //}
        //$rootScope.StatusData = [{
        //    Value: 1,
        //    Name: caption.ACTIVE
        //}, {
        //    Value: 0,
        //    Name: caption.INACTIVE
        //}];

    });
    $rootScope.checkData = function (data) {
        var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;
        var mess = { Status: false, Title: "" }
        if (!partternCode.test(data)) {
            mess.Status = true;
        }
        return mess;
    }
    
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {

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
        }).when('/function/', {
            templateUrl: ctxfolder + '/function.html',
            controller: 'function'
        });


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
    var vm = $scope;
    $scope.model = {
        ProductName: '',
        Name: '',
        FromTo: '',
        DateTo: ''
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.liFunction = [];
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/MaterialSBatch/jtable",
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
                d.ProductName = $scope.model.ProductName;
                d.Name = $scope.model.Name;
                d.FromTo = $scope.model.FromTo;
                d.DateTo = $scope.model.DateTo;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [0, 'asc'])
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ''));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('{{ "MSB_LIST_COL_BATCH_NAME" | translate }}').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductName').withTitle('{{ "MSB_LIST_COL_BATCH_NAME_PRODUCT" | translate }}').renderWith(function (data) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StoreName').withTitle('{{ "MSB_LIST_COL_BATCH_NAME_WAREHOUSE" | translate }}').renderWith(function (data) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withTitle('{{ "MSB_LIST_COL_BATCH_AMOUNT" | translate }}').renderWith(function (data) {
        return data != "" ? $filter('currency')(data, '', 0) : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Unit').withTitle('{{ "MSB_LIST_COL_BATCH_UNIT" | translate }}').renderWith(function (data) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Total').withTitle('{{ "MSB_LIST_COL_BATCH_TOTAL_VALUE" | translate }}').renderWith(function (data) {
        return data != "" ? $filter('currency')(data, '', 0) : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Currency').withTitle('{{ "MSB_LIST_COL_BATCH_CURRENCY" | translate }}').renderWith(function (data) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DateReiceive').withTitle('{{ "MSB_LIST_COL_BATCH_DATE_CREATED" | translate }}').renderWith(function (data) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{ "MSB_LIST_COL_BATCH_ACTION" | translate }}').renderWith(function (data, type, full) {
        return '<button title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45);" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $scope.search = function () {
        reloadData(true);
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };

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
    $scope.edit = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit',
            backdrop: 'static',
            size: '80',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () {
        });
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = "{{'MSB_CURD_TITLE_DELETE' | translate}}";
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
    setTimeout(function () {
        showHideSearch();
        loadDate();
    }, 200);
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $filter) {
    $scope.model = {
        Code: '',
        Name: '',
        ProductCode: '',
        StoreId: '',
        Quantity: '',
        Unit: '',
        Vat: '',
        Sale: '',
        Cost: '',
        Currency: '',
        Barcode: '',
        SupplierId: '',
        Madein: '',
        Packing: '',
        DateProduce: '',
        DateExpire: '',
        DateReiceive: '',
        Description: '',
        Total: ''
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            var msg = $rootScope.checkData($scope.model.Code);
            if (msg.Status) {
                App.toastrError(caption.MSB_CURD_VALIDATE_CHARACTERS_SPACE);
                return;
            }
            dataservice.insert($scope.model, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            });
        }
    }
    $scope.initLoad = function () {
        dataservice.getOrigin(function (rs) {rs=rs.data;
            $scope.OriginData = rs;
        });
        dataservice.getCurrency(function (rs) {rs=rs.data;
            $scope.CurrencyData = rs;
        });
        dataservice.getUnit(function (rs) {rs=rs.data;
            $scope.UnitData = rs;
        });
        dataservice.getStore(function (rs) {rs=rs.data;
            $scope.StoreData = rs;
        });
        dataservice.getProduct(function (rs) {rs=rs.data;
            $scope.ProductData = rs;
        });
        dataservice.getSupplier(function (rs) {rs=rs.data;
            $scope.SupplierData = rs;
        });
    }
    $scope.initLoad();
    $scope.changleSelect = function (selectType) {
        if (selectType == "ProductCode" && $scope.model.ProductCode != "") {
            $scope.errorProductCode = false;
        }
        if (selectType == "StoreId" && $scope.model.StoreId != "") {
            $scope.errorStoreId = false;
        }
        if (selectType == "Unit" && $scope.model.Unit != "") {
            $scope.errorUnit = false;
        }
        if (selectType == "Currency" && $scope.model.Currency != "") {
            $scope.errorCurrency = false;
        }
    }
    $scope.totalAmount = function () {
        $scope.model.Total = totalAmount($scope.model.Quantity, $scope.model.Cost, $scope.model.Sale, $scope.model.Vat);
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null tên sản phẩm 
        if (data.ProductCode == "") {
            $scope.errorProductCode = true;
            mess.Status = true;
        } else {
            $scope.errorProductCode = false;
        }
        //Check null tên kho
        if (data.StoreId == "") {
            $scope.errorStoreId = true;
            mess.Status = true;
        } else {
            $scope.errorStoreId = false;
        }

        //Check null đơn vị
        if (data.Unit == "") {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;
        }

        //Check null loại tiền
        if (data.Currency == "") {
            $scope.errorCurrency = true;
            mess.Status = true;
        } else {
            $scope.errorCurrency = false;
        }
        return mess;
    };
    function totalAmount(quantity, cost, sale, vat) {
        var total = 0;
        var totalNoVAT = 0;
        var percenDiscount = 0;
        var percenVAT = 0;
        if (quantity == '' || quantity == null)
            quantity = 0;

        if (cost == '' || cost == null)
            cost = 0;

        if (sale == '' || sale == null)
            sale = 0;

        if (vat == '' || vat == null)
            vat = 0;

        percenDiscount = (100 - sale) / (100);
        percenVAT = (100 + vat) / (100);
        totalNoVAT = parseFloat(quantity) * parseFloat(cost);

        total = (totalNoVAT) * percenDiscount * percenVAT;
        //if (quantity != '' && quantity != null && cost != '' && cost != null) {
        //    total = parseFloat(quantity) * parseFloat(cost);
        //    if (sale != '' && sale != null) {
        //        total = (parseFloat(total) * parseFloat(sale)) / (100);
        //    }
        //    if (vat != '' && vat != null) {
        //        total = (parseFloat(total) * parseFloat(vat)) / (100);
        //    }
        //}
        return total;
    }
    function initDatetime() {
        $("#DateProduce").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $("#DateExpire").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $("#DateReiceive").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        var today = new Date(new Date());
        $('#DateProduce').datepicker('setEndDate', today);
        $('#DateExpire').datepicker('setStartDate', today);
        $('#DateReiceive').datepicker('update', new Date());
        $scope.model.DateReiceive = $filter('date')(new Date(today), 'dd/MM/yyyy');
    }
    setTimeout(function () {
        initDatetime();
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('edit', function ($scope, $filter, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.initLoad = function () {
        dataservice.getOrigin(function (rs) {rs=rs.data;
            $scope.OriginData = rs;
        });
        dataservice.getCurrency(function (rs) {rs=rs.data;
            $scope.CurrencyData = rs;
        });
        dataservice.getUnit(function (rs) {rs=rs.data;
            $scope.UnitData = rs;
        });
        dataservice.getStore(function (rs) {rs=rs.data;
            $scope.StoreData = rs;
        });
        dataservice.getProduct(function (rs) {rs=rs.data;
            $scope.ProductData = rs;
        });
        dataservice.getSupplier(function (rs) {rs=rs.data;
            $scope.SupplierData = rs;
        });
        dataservice.getItem(para, function (rs) {rs=rs.data;
            $scope.model = rs;
            $scope.model.DateProduce = $scope.model.DateProduce == null ? "" : $filter('date')(new Date($scope.model.DateProduce), 'dd/MM/yyyy');
            $scope.model.DateExpire = $scope.model.DateExpire == null ? "" : $filter('date')(new Date($scope.model.DateExpire), 'dd/MM/yyyy');
            $scope.model.DateReiceive = $scope.model.DateReiceive == null ? "" : $filter('date')(new Date($scope.model.DateReiceive), 'dd/MM/yyyy');
        });
    }
    $scope.initLoad();

    $scope.changleSelect = function (SelectType) {
        if (SelectType == "ProductCode" && $scope.model.ProductCode != "") {
            $scope.errorProductCode = false;
        }
        if (SelectType == "StoreId" && $scope.model.StoreId != "") {
            $scope.errorStoreId = false;
        }
        if (SelectType == "Unit" && $scope.model.Unit != "") {
            $scope.errorUnit = false;
        }
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.editform.validate() && !validationSelect($scope.model).Status) {
            dataservice.update($scope.model, function (result) {result=result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $uibModalInstance.close();
                }
            });
        }
    }
    $scope.totalAmount = function () {
        $scope.model.Total = totalAmount($scope.model.Quantity, $scope.model.Cost, $scope.model.Sale, $scope.model.Vat);
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null tên sản phẩm 
        if (data.ProductCode == "") {
            $scope.errorProductCode = true;
            mess.Status = true;
        } else {
            $scope.errorProductCode = false;
        }
        //Check null tên kho
        if (data.StoreId == "") {
            $scope.errorStoreId = true;
            mess.Status = true;
        } else {
            $scope.errorStoreId = false;
        }

        //Check null tên kho
        if (data.Unit == "") {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;
        }
        return mess;
    };
    function totalAmount(quantity, cost, sale, vat) {
        var total = 0;
        var totalNoVAT = 0;
        var percenDiscount = 0;
        var percenVAT = 0;
        if (quantity == '' || quantity == null)
            quantity = 0;

        if (cost == '' || cost == null)
            cost = 0;

        if (sale == '' || sale == null)
            sale = 0;

        if (vat == '' || vat == null)
            vat = 0;

        percenDiscount = (100 - sale) / (100);
        percenVAT = (100 + vat) / (100);
        totalNoVAT = parseFloat(quantity) * parseFloat(cost);

        total = (totalNoVAT) * percenDiscount * percenVAT;
        //if (quantity != '' && quantity != null && cost != '' && cost != null) {
        //    total = parseFloat(quantity) * parseFloat(cost);
        //    if (sale != '' && sale != null) {
        //        total = (parseFloat(total) * parseFloat(sale)) / (100);
        //    }
        //    if (vat != '' && vat != null) {
        //        total = (parseFloat(total) * parseFloat(vat)) / (100);
        //    }
        //}
        return total;
    }
    function initDateTime() {
        $("#DateProduce").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $("#DateExpire").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $("#DateReiceive").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        //var today = new Date(new Date());
        //$('#DateProduce').datepicker('setEndDate', today);
        //$('#DateExpire').datepicker('setStartDate', today);
    }
    //function convertDatetime(date) {
    //    var array = date.split('-');
    //    var result = array[1] + '/' + array[0] + '/' + array[2];
    //    return result;
    //}
    setTimeout(function () {
        initDateTime();
        setModalDraggable('.modal-dialog');
    }, 200);
});
