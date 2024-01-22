var ctxfolderurl = "/views/admin/payment";
paypal.Buttons.driver("angular", window.angular);
var app = angular.module('App_ESEIM', [, "ui.bootstrap", "ngRoute", "ngCookies", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", "pascalprecht.translate", 'datatables.colreorder', 'angular-confirm', 'ui.select', "ngCookies", "pascalprecht.translate", 'dynamicNumber', "paypal-buttons"])
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
        getPrice: function (data, callback) {
            $http.post(`/Admin/Payment/GetPrice?points=${data}&currency=USD`).then(callback);
        },
        addPoints: function (data, callback) {
            $http.post('/Admin/Payment/AddPoints?points=' + data).then(callback);
        },
        createOrder: function (data, callback) {
            return $http.post('/Admin/Payment/CreateOrder', data).then(callback);
        },
        getVNPayInPut: function (data, callback) {
            $http.post('/Admin/Payment/VNPayInPut?points=' + data).then(callback);
        },
        getMomoPay: function (data, callback) {
            $http.post('/Admin/Payment/MomoPay?points=' + data).then(callback);
        },
        captureOrder: function (data, callback) {
            return $http.post('/Admin/Payment/CaptureOrder?orderID=' + data).then(callback);
        },
        saveTransactionHistory: function (data, callback) {
            $http.post('/Admin/Payment/SaveTransactionHistory', data).then(callback);
        },
        getHistoryPaymenStatus: function (callback) {
            $http.get('/Admin/Payment/GetCommonSetingByGroup?Group=HISTORY_PAYMENT_STATUS').then(callback);
        },
        getCurrencys: function (callback) {
            $http.get('/Admin/Payment/GetCommonSetingByGroup?Group=CURRENCY_TYPE').then(callback);
        },
        getPaymentTypes: function (callback) {
            $http.get('/Admin/Payment/GetCommonSetingByGroup?Group=PAYMENT_TYPE').then(callback);
        },
        ExportExcel: function (data) {
            location.href="/Admin/Payment/ExportExcel?"+
            'TransactionType='+data.TransactionType+
            '&MoneyFrom='+data.MoneyFrom+
            '&MoneyTo='+data.MoneyTo+
            '&Currency='+data.Currency+
            '&Status='+data.Status+
            '&StartTime='+data.StartTime+
            '&EndTime='+data.EndTime+
            '&Customer='+data.Customer
        },
        ExportPdf: function (data) {
            let href="/Admin/Payment/ExportPdf?"+
            'TransactionType='+data.TransactionType+
            '&MoneyFrom='+data.MoneyFrom+
            '&MoneyTo='+data.MoneyTo+
            '&Currency='+data.Currency+
            '&Status='+data.Status+
            '&StartTime='+data.StartTime+
            '&EndTime='+data.EndTime+
            '&Customer='+data.Customer;
            location.href=href
        },
    }
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $cookies, $filter, dataservice, $translate) {
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false; $rootScope.$on('$translateChangeSuccess', function () {
        $rootScope.IsTranslate = true;
        caption = caption[culture] ? caption[culture] : caption;
    });
});

app.config(function ($routeProvider, $validatorProvider, $httpProvider, $translateProvider, $locationProvider) {
    $translateProvider.useUrlLoader('/Admin/Customer/Translation');
    $locationProvider.hashPrefix('');
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderurl + '/index.html',
            controller: 'index'
        })
        .when('/history', {
            templateUrl: ctxfolderurl + '/history.html',
            controller: 'history'
        })
        .when('/cost', {
            templateUrl: ctxfolderurl + '/cost.html',
            controller: 'cost'
        })
        .when('/paymentHistory', {
            templateUrl: ctxfolderurl + '/paymentHistory.html',
            controller: 'paymentHistory'
        })
        ;
});

app.controller('index', function ($location, $scope, $rootScope, dataservice) {
    $scope.model = {
        Points: '',
        TotalAmount: ''
    }
    $scope.cartList = [{
        Type: "No Item Select",
        Price: 0,
        Rate: 1
    }];
    $scope.TotalAmount = 0;
    $scope.isCartListValid = false;
    $scope.checkCart = function () {
        for (var cart of $scope.cartList) {
            if (cart.Price == 0) {
                $scope.isCartListValid = false;
                return;
            }
        }
        $scope.isCartListValid = true;
    }
    $scope.orderCaptured = false;
    $scope.payPalOpts = {
        createOrder: function (data, actions) {
            var purchase_units = [];
            var unit = {
                amount: {
                    currency_code: "USD",
                    value: "",
                    breakdown: {
                        item_total: {
                            currency_code: "USD",
                            value: "",
                        },
                    }
                },
                items: []
            }
            unit.amount.value = Number($scope.TotalAmount).toFixed(2);
            unit.amount.breakdown.item_total.value = Number($scope.TotalAmount).toFixed(2);
            for (var cart of $scope.cartList) {
                var type = cart.Type.split(" ");
                var item = {
                    name: type[1],
                    unit_amount: {
                        currency_code: "USD",
                        value: cart.Rate.toFixed(2)
                    },
                    quantity: type[0],
                }
                unit.items.push(item);
            }
            purchase_units.push(unit);
            var modelOrder = {
                purchase_units: purchase_units
            }
            return dataservice.createOrder(modelOrder, function (rs) {
                rs = rs.data;
                if (rs.Error == false) {
                    var content = rs.Object;
                    if (!content.id) {
                        content = JSON.parse(rs.Object);
                    }
                    return content.id;
                }
                else {
                    App.toastrError(rs.Title);
                }
            });
        },

        onApprove: function (data, actions) {
            return dataservice.captureOrder(data.orderID, function (rs) {
                rs = rs.data;
                var orderData = rs;
                var errorDetail = Array.isArray(orderData.details) && orderData.details[0];

                if (errorDetail && errorDetail.issue === 'INSTRUMENT_DECLINED') {
                    return actions.restart();
                }

                if (errorDetail) {
                    var msg = 'Sorry, your transaction could not be processed.';
                    if (errorDetail.description) msg += '\n\n' + errorDetail.description;
                    if (orderData.debug_id) msg += ' (' + orderData.debug_id + ')';
                    return alert(msg);
                }
                var transactionHistory = {
                    TxnId: orderData.id,
                    PaymentType: "paypal",
                    PaymentAmount: 0.00,
                    PaymentCurrency: "USD",
                    PaymentLog: JSON.stringify(orderData),
                    PaymentStatus: orderData.status,
                    PaymentQuantity: $scope.model.Points,
                    PayerEmail: orderData.payer.email_address
                }
                var keys = Object.keys(orderData.payment_source);

                if (keys.length > 0) {
                    transactionHistory.PaymentType = keys[0];
                }
                for (var unit of orderData.purchase_units) {
                    for (var capture of unit.payments.captures) {
                        transactionHistory.PaymentAmount += capture.amount.value;
                        transactionHistory.PaymentCurrency = capture.amount.currency_code;
                    }
                }
                //alert('Transaction completed by ' + orderData.payer.name.given_name);
                $scope.orderCaptured = true;
                dataservice.saveTransactionHistory(transactionHistory, function (rs) {
                    rs = rs.data
                    if (rs.Error == false) {
                        //App.toastrSuccess(rs.Title);
                        dataservice.addPoints($scope.model.Points, function (rs) {
                            rs = rs.data;
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            }
                            else {
                                /*$uibModalInstance.close();
                                $rootScope.profile();*/
                                App.toastrSuccess(rs.Title);
                                location.href = "/Admin/Payment#history";
                            }
                        })
                    }
                    else {
                        App.toastrError(rs.Title);
                        //alert('Transaction history saved');
                    }
                })
            });
        },
    };

    $scope.calculateTotalAmount = function () {
        $scope.TotalAmount = 0;
        for (var cart of $scope.cartList) {
            $scope.TotalAmount += cart.Price;
        }
    }
    $scope.confirm = function () {
        if ($scope.model.Points != '') {
            dataservice.getPrice($scope.model.Points, function (rs) {
                rs = rs.data;
                $scope.cartList = [];
                $scope.cartList.push(rs);
                $scope.model.TotalAmount = Number($scope.model.Points).toFixed(2);
                $scope.calculateTotalAmount();
                $scope.checkCart();
            })
        }
    }
    $scope.getVNPayInPut = function () {                 // Get VNPay input
        dataservice.getVNPayInPut($scope.model.Points, function (rs) {
            console.log(rs);
            rs = rs.data;
            if (rs.Error == false) {
                var obj = rs.Object;
                var otherWindow = window.open(obj.PaymentUrl, "blank");
                location.href = "/Admin/Payment#history";
            }
            else {
                App.toastrError(rs.Title);
            }
        })
    }
    $scope.getMomoPay = function () {                 // Get MomoPay input
        dataservice.getMomoPay($scope.model.Points, function (rs) {
            console.log(rs);
            rs = rs.data;
            if (rs.Error == false) {
                var obj = JSON.parse(rs.Object);
                var otherWindow = window.open(obj.payUrl, "blank");
                location.href = "/Admin/Payment#history";
            }
            else {
                App.toastrError(rs.Title);
            }
        })
    }
    /* $scope.getZaloPay = function () {              //getZAaloPay
         return dataservice.getZaloPayInput($scope.model.Points, function (rs)
         {
             rs = rs.data;
         })
     }*/


    $scope.reset = function () {
        $scope.model.TotalAmount = '';
        $scope.model.Points = '';
    }
    $scope.remove = function (index) {
        $scope.cartList.splice(index, 1);
        if ($scope.cartList.length == 0) {
            $scope.cartList = [{
                Type: "No Item Select",
                Price: 0,
                Rate: 1
            }];
        }
        $scope.calculateTotalAmount();
        $scope.checkCart();
    }
    $scope.payWithPayPal = false;
});

app.controller('history', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $location) {
    var vm = $scope;
    // history 
    $scope.modelsearch = {
        TransactionType: '',
        StartTime: '',
        EndTime: '',
    }
    $scope.listType = [
        {
            Code: '', Name: 'Tất cả'
        },
        {
            Code: 'PAYPAL', Name: 'PayPal'
        },
        {
            Code: 'STRIPE', Name: 'Stripe'
        },
        {
            Code: 'MOMO', Name: 'Momo'
        },
        {
            Code: 'VNPAY', Name: 'VnPay'
        },
    ];

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.headerCompiled = false;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Payment/JTableHistory",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.TransactionType = $scope.modelsearch.TransactionType;
                d.StartTime = $scope.modelsearch.StartTime;
                d.EndTime = $scope.modelsearch.EndTime;
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
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
            //$(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
            //    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
            //        $scope.selected[data.CusID] = !$scope.selected[data.CusID];
            //    } else {
            //        var self = $(this).parent();
            //        if ($(self).hasClass('selected')) {
            //            $(self).removeClass('selected');
            //            $scope.selected[data.CusID] = false;
            //        } else {
            //            $('#tblDataIndex').DataTable().$('tr.selected').removeClass('selected');
            //            $scope.selected.forEach(function (obj, index) {
            //                if ($scope.selected[index])
            //                    $scope.selected[index] = false;
            //            });
            //            $(self).addClass('selected');
            //            $scope.selected[data.CusID] = true;
            //        }
            //    }

            //    vm.selectAll = false;
            //    $scope.$apply();
            //});
            //$(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
            //    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

            //    } else {
            //        var Id = data.CusID;
            //        $scope.edit(Id);
            //    }
            //});
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().withOption('sClass', 'hidden').renderWith(function (data, type, full, meta) {
        /*$scope.selected[full.id] = false;*/
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn("ID").withTitle("ID").notSortable().withOption('sClass', 'w-1').renderWith(function (data, type, full, meta) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn("TransactionLog").withTitle('Transaction Log').notSortable().withOption('sClass', 'w65')
    //    .renderWith(function (data, type) {
    //        return data;
    //    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn("Amount").withTitle('Giá tiền').notSortable().withOption('sClass', 'w65')
        .renderWith(function (data, type) {
            return data;
        }));
    vm.dtColumns.push(DTColumnBuilder.newColumn("Currency").withTitle('Đơn vị').notSortable().withOption('sClass', 'w65')
        .renderWith(function (data, type) {
            return data;
        }));
    vm.dtColumns.push(DTColumnBuilder.newColumn("Coin").withTitle('Coin').notSortable().withOption('sClass', 'w65')
        .renderWith(function (data, type) {
            return data;
        }));
    vm.dtColumns.push(DTColumnBuilder.newColumn("TransactionType").withTitle('Kiểu thanh toán').notSortable().withOption('sClass', 'w65')
        .renderWith(function (data, type) {
            return data;
        }));
    vm.dtColumns.push(DTColumnBuilder.newColumn("Type").withTitle('Hình thức thanh toán').notSortable().withOption('sClass', 'w65')
        .renderWith(function (data, type) {
            return data;
        }));
    vm.dtColumns.push(DTColumnBuilder.newColumn("CreatedTime").withTitle('Thời gian thanh toán').notSortable().withOption('sClass', 'w65')
        .renderWith(function (data, type, full, meta) {
            return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
        }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};

    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
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
    //Search
    $scope.search = function () {
        reloadData(true);
    }
    $rootScope.reload = function () {
        reloadData(true);
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }

    }

    function initDateTime() {
        $("#StartTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            dateFormat: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EndTime').datepicker('setStartDate', maxDate);
        });
        $("#EndTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#StartTime').datepicker('setEndDate', maxDate);
        });
    }

    setTimeout(function () {
        initDateTime();
    }, 200);
});

app.controller('cost', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $location) {
    var vm = $scope;
    // history 
    $scope.modelsearch = {
        ItemType: '',
        ItemCode: '',
        StartTime: '',
        EndTime: '',
    }
    $scope.listType = [
        {
            Code: '', Name: 'Tất cả'
        },
        {
            Code: 'QUIZ', Name: 'Câu hỏi'
        },
        {
            Code: 'LECTURE', Name: 'Bài giảng'
        },
        {
            Code: 'COURSE', Name: 'Khóa học'
        },
        {
            Code: 'TEST', Name: 'Đề thi'
        },
        {
            Code: 'CLASS', Name: 'Lớp học'
        },
        {
            Code: 'COURSEWARE', Name: 'Học liệu'
        },
    ];

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.headerCompiled = false;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Payment/JtableCost",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ItemType = $scope.modelsearch.ItemType;
                d.ItemCode = $scope.modelsearch.ItemCode;
                d.StartTime = $scope.modelsearch.StartTime;
                d.EndTime = $scope.modelsearch.EndTime;
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
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
            //$(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
            //    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
            //        $scope.selected[data.CusID] = !$scope.selected[data.CusID];
            //    } else {
            //        var self = $(this).parent();
            //        if ($(self).hasClass('selected')) {
            //            $(self).removeClass('selected');
            //            $scope.selected[data.CusID] = false;
            //        } else {
            //            $('#tblDataIndex').DataTable().$('tr.selected').removeClass('selected');
            //            $scope.selected.forEach(function (obj, index) {
            //                if ($scope.selected[index])
            //                    $scope.selected[index] = false;
            //            });
            //            $(self).addClass('selected');
            //            $scope.selected[data.CusID] = true;
            //        }
            //    }

            //    vm.selectAll = false;
            //    $scope.$apply();
            //});
            //$(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
            //    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

            //    } else {
            //        var Id = data.CusID;
            //        $scope.edit(Id);
            //    }
            //});
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().withOption('sClass', 'hidden').renderWith(function (data, type, full, meta) {
        /*$scope.selected[full.id] = false;*/
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn("ID").withTitle("ID").notSortable().withOption('sClass', 'w-1').renderWith(function (data, type, full, meta) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn("TransactionLog").withTitle('Transaction Log').notSortable().withOption('sClass', 'w65')
    //    .renderWith(function (data, type) {
    //        return data;
    //    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn("ItemCode").withTitle('Mã sản phẩm').notSortable().withOption('sClass', 'w65')
        .renderWith(function (data, type) {
            return data;
        }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn("Currency").withTitle('Đơn vị').notSortable().withOption('sClass', 'w65')
    //    .renderWith(function (data, type) {
    //        return data;
    //    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn("Coin").withTitle('Giá').notSortable().withOption('sClass', 'w65')
        .renderWith(function (data, type) {
            return data + ' Coin';
        }));
    vm.dtColumns.push(DTColumnBuilder.newColumn("ItemType").withTitle('Loại sản phẩm').notSortable().withOption('sClass', 'w65')
        .renderWith(function (data, type) {
            return data;
        }));
    vm.dtColumns.push(DTColumnBuilder.newColumn("CreatedBy").withTitle('Người bán').notSortable().withOption('sClass', 'w65')
        .renderWith(function (data, type) {
            return data;
        }));
    vm.dtColumns.push(DTColumnBuilder.newColumn("CreatedTime").withTitle('Thời gian bán').notSortable().withOption('sClass', 'w65')
        .renderWith(function (data, type, full, meta) {
            return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
        }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};

    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
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
    //Search
    $scope.search = function () {
        reloadData(true);
    }
    $rootScope.reload = function () {
        reloadData(true);
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }

    }

    function initDateTime() {
        $("#StartTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            dateFormat: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EndTime').datepicker('setStartDate', maxDate);
        });
        $("#EndTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#StartTime').datepicker('setEndDate', maxDate);
        });
    }

    setTimeout(function () {
        initDateTime();
    }, 200);
});

app.controller('paymentHistory', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $location) {
    var vm = $scope;
    // history 
    $scope.modelsearch = {
        TransactionType: '',
        StartTime: '',
        EndTime: '',
        MoneyFrom: '',
        MoneyTo: '',
        Currency: '',
        Status: '',
        Customer: '',
    }
    $scope.listType = [];
    $scope.listCurrency = [];
    $scope.listStatus = []
    $scope.ExportExcel = function () {
        let d={}
        d.TransactionType = $scope.modelsearch.TransactionType;
        d.StartTime = $scope.modelsearch.StartTime;
        d.EndTime = $scope.modelsearch.EndTime;
        d.Currency = $scope.modelsearch.Currency;
        d.MoneyFrom = $scope.modelsearch.MoneyFrom;
        d.MoneyTo = $scope.modelsearch.MoneyTo;
        d.Status = $scope.modelsearch.Status;
        d.Customer = $scope.modelsearch.Customer;
        dataservice.ExportExcel(d)
    }
    $scope.ExportPdf = function () {
        let d={}
        d.TransactionType = $scope.modelsearch.TransactionType;
        d.StartTime = $scope.modelsearch.StartTime;
        d.EndTime = $scope.modelsearch.EndTime;
        d.Currency = $scope.modelsearch.Currency;
        d.MoneyFrom = $scope.modelsearch.MoneyFrom;
        d.MoneyTo = $scope.modelsearch.MoneyTo;
        d.Status = $scope.modelsearch.Status;
        d.Customer = $scope.modelsearch.Customer;
        dataservice.ExportPdf(d)
    }
    $scope.init = function () {
        dataservice.getHistoryPaymenStatus(function (rs) {
            rs = rs.data
            $scope.listStatus = rs;
            console.log(rs);
        })
        dataservice.getCurrencys(function (rs) {
            rs = rs.data
            $scope.listCurrency = rs;
            console.log(rs)
        })
        dataservice.getPaymentTypes(function (rs) {
            rs = rs.data
            $scope.listType = rs;
        })
    }
    $scope.init();
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.headerCompiled = false;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Payment/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.TransactionType = $scope.modelsearch.TransactionType;
                d.StartTime = $scope.modelsearch.StartTime;
                d.EndTime = $scope.modelsearch.EndTime;
                d.Currency = $scope.modelsearch.Currency;
                d.MoneyFrom = $scope.modelsearch.MoneyFrom;
                d.MoneyTo = $scope.modelsearch.MoneyTo;
                d.Status = $scope.modelsearch.Status;
                d.Customer = $scope.modelsearch.Customer;
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
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
            //$(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
            //    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
            //        $scope.selected[data.CusID] = !$scope.selected[data.CusID];
            //    } else {
            //        var self = $(this).parent();
            //        if ($(self).hasClass('selected')) {
            //            $(self).removeClass('selected');
            //            $scope.selected[data.CusID] = false;
            //        } else {
            //            $('#tblDataIndex').DataTable().$('tr.selected').removeClass('selected');
            //            $scope.selected.forEach(function (obj, index) {
            //                if ($scope.selected[index])
            //                    $scope.selected[index] = false;
            //            });
            //            $(self).addClass('selected');
            //            $scope.selected[data.CusID] = true;
            //        }
            //    }

            //    vm.selectAll = false;
            //    $scope.$apply();
            //});
            //$(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
            //    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

            //    } else {
            //        var Id = data.CusID;
            //        $scope.edit(Id);
            //    }
            //});
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().withOption('sClass', 'hidden').renderWith(function (data, type, full, meta) {
        /*$scope.selected[full.id] = false;*/
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle("ID").notSortable().withOption('sClass', 'w-1').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn("GivenName").withTitle('Người thanh toán').notSortable().withOption('sClass', 'w65')
        .renderWith(function (data, type, full) {
            return data;
        }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn("TransactionLog").withTitle('Transaction Log').notSortable().withOption('sClass', 'w65')
    //    .renderWith(function (data, type) {
    //        return data;
    //    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn("Amount").withTitle('Giá tiền').notSortable().withOption('sClass', 'w65')
        .renderWith(function (data, type, full) {
            return $filter('currency')(data, '', 0);
        }));
    vm.dtColumns.push(DTColumnBuilder.newColumn("Currency").withTitle('Đơn vị').notSortable().withOption('sClass', 'w65')
        .renderWith(function (data, type) {
            return data;
        }));
    vm.dtColumns.push(DTColumnBuilder.newColumn("Coin").withTitle('Coin').notSortable().withOption('sClass', 'w65')
        .renderWith(function (data, type) {
            return $filter('currency')(data, '', 0);
        }));
    vm.dtColumns.push(DTColumnBuilder.newColumn("TransactionType").withTitle('Kiểu thanh toán').notSortable().withOption('sClass', 'w65')
        .renderWith(function (data, type) {
            return data;
        }));
    vm.dtColumns.push(DTColumnBuilder.newColumn("Type").withTitle('Hình thức thanh toán').notSortable().withOption('sClass', 'w65')
        .renderWith(function (data, type) {
            return data;
        }));
    vm.dtColumns.push(DTColumnBuilder.newColumn("CreatedTime").withTitle('Thời gian thanh toán').notSortable().withOption('sClass', 'w65')
        .renderWith(function (data, type, full, meta) {
            return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
        }));
        vm.dtColumns.push(DTColumnBuilder.newColumn("Status").withTitle('Trạng thái').notSortable().withOption('sClass', 'w65')
        .renderWith(function (data, type, full, meta) {
            if (data == "COMPLETED" || data == "DONE") {
                return '<p style="color: green; font-weight: bold;">' + data + '</p>';
            }
            else {
                return '<p style="color: red; font-weight: bold;">' + data + '</p>';
            }
        }));    
    vm.reloadData = reloadData;
    vm.dtInstance = {};

    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
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
    //Search
    $scope.search = function () {
        reloadData(true);
    }
    $rootScope.reload = function () {
        reloadData(true);
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }

    }

    function initDateTime() {
        $("#StartTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            dateFormat: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EndTime').datepicker('setStartDate', maxDate);
        });
        $("#EndTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#StartTime').datepicker('setEndDate', maxDate);
        });
    }

    setTimeout(function () {
        initDateTime();
    }, 200);
});
//http://localhost:6002/Admin/Payment#/paymentHistory