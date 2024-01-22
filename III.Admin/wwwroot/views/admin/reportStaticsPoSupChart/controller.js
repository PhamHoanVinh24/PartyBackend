var ctxfolder = "/views/admin/reportStaticsPoSupChart";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", "chart.js"]);
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
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }

    return {
        //Tổng mua hàng NCC
        searchPoSupTotal: function (data1, data2, data3, callback) {
            $http.get('/Admin/ReportStaticsPoSupChart/GetPoSupTotal?fromDate=' + data1 + '&toDate=' + data2 + '&productCode=' + data3, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#modal-body",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#modal-body");
                }
            }).then(callback);
        },
        getListProduct: function (callback) {
            $http.post('/Admin/contractPo/GetListProduct').then(callback);
        },

        searchPoSupPayment: function (data1, data2, data3, callback) {
            $http.get('/Admin/ReportStaticsPoSupChart/GetPoSupPayment?fromDate=' + data1 + '&toDate=' + data2 + '&supCode=' + data3, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#modal-body",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#modal-body");
                }
            }).then(callback);
        },
        getListSupplier: function (callback) {
            $http.post('/Admin/MaterialProductHistorySale/GetListSupplier/').then(callback);
        },

        searchPoCusTotal: function (data1, data2, data3, data4, callback) {
            $http.get('/Admin/ReportStaticsPoSupChart/GetPoCusTotal?fromDate=' + data1 + '&toDate=' + data2 + '&productCode=' + data3 + '&productType=' + data4, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#modal-body",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#modal-body");
                }
            }).then(callback);
        },
        getListCustomer: function (callback) {
            $http.post('/Admin/reportStaticsPoCusPayment/GetListCustomer/').then(callback);
        },

        searchPoCusPayment: function (data1, data2, data3, callback) {
            $http.get('/Admin/ReportStaticsPoSupChart/GetPoCusPayment?fromDate=' + data1 + '&toDate=' + data2 + '&cusCode=' + data3, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#modal-body",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#modal-body");
                }
            }).then(callback);
        },
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $filter, $location, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];

        $rootScope.validationOptionsSearchPoSupTotal = {
            rules: {
                FromDate: {
                    required: true,
                    maxlength: 255
                },
                ToDate: {
                    required: true,
                    maxlength: 50
                },
            },
            messages: {
                FromDate: {
                    //required: "Từ ngày không được bỏ trống",
                    required: caption.RSPSC_MSG_FROM_DATE_REQUIRED
                    //required: caption.VCMM_MSG_FROM_DATE_REQUIRED
                },
                ToDate: {
                    //required: "Đến ngày không được bỏ trống",
                    required: caption.RSPSC_MSG_TO_DATE_REQUIRED
                    //required: caption.VCMM_MSG_TO_DATE_REQUIRED
                },
            }
        }

        $rootScope.validationOptionsSearchPoSupPayment = {
            rules: {
                FromDate: {
                    required: true,
                    maxlength: 255
                },
                ToDate: {
                    required: true,
                    maxlength: 50
                },
            },
            messages: {
                FromDate: {
                    //required: "Từ ngày không được bỏ trống",
                    required: caption.RSPSC_MSG_FROM_DATE_REQUIRED
                    //required: caption.VCMM_MSG_FROM_DATE_REQUIRED
                },
                ToDate: {
                    //required: "Đến ngày không được bỏ trống",
                    required: caption.RSPSC_MSG_TO_DATE_REQUIRED
                    //required: caption.VCMM_MSG_TO_DATE_REQUIRED
                },
            }
        }
    });
    $rootScope.monthNow = moment().format('MM/YYYY');
});
app.config(function ($routeProvider, $validatorProvider, $httpProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/ReportStaticsPoSupChart/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/add/', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
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
    $httpProvider.interceptors.push('interceptors');
});
app.controller('index', function ($scope, $rootScope, $compile, dataservice, $uibModal, $timeout, $filter) {
    //document angulerjs http://jtblin.github.io/angular-chart.js/
    //document js https://www.chartjs.org/

    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    $scope.model = {
        FromDate: '',
        ToDate: '',
        ProductCode: '',
        ProductType: '',
        CusCode: '',
        SupCode: ''
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


    //Khởi tạo biểu đồ
    $scope.poSupTotal = {
        labels: ["", "", "", "", "", "", "", "", "", ""],
        data: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
        date: [],
        total: [],
        product: '',
        dateSearch: ''
    }
    $scope.optionsPoSupPayement = {
        //tooltips: {
        //    callbacks: {
        //        label: function (tooltipItem, data) {
        //            
        //            //var label = $scope.poSupPayment.total[tooltipItem.index].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || '';
        //            //var date = $scope.poSupPayment.date[tooltipItem.index] || '';

        //            //if (label) {
        //            //    label += " vào ngày " + date;
        //            //}
        //            //return [label];
        //        }
        //    },
        //},
        animation: {
            duration: 100,
            onComplete: function () {
                var ctx = this.chart.ctx;
                ctx.font = Chart.helpers.fontString(11, 'normal', Chart.defaults.global.defaultFontFamily);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';

                this.data.datasets.forEach(function (dataset) {
                    for (var i = 0; i < dataset.data.length; i++) {
                        var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model,
                            scale_max = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._yScale.maxHeight;
                        ctx.fillStyle = '#444';
                        var y_pos = model.y - 5;
                        // Make sure data value does not get overflown and hidden
                        // when the bar's value is too close to max value of scale
                        // Note: The y value is reverse, it counts from top down
                        if ((scale_max - model.y) / scale_max >= 0.93)
                            y_pos = model.y + 20;
                        //if (dataset.data[i] != 0) {
                        //ctx.fillText((Math.round(dataset.data[i] * 100) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), model.x, y_pos);
                        //}
                    }
                });
            }
        },
        scales: {
            xAxes: [{
                stacked: true,
            }],
            yAxes: [{
                stacked: true,
                ticks: {
                    beginAtZero: true, // minimum will be 0, unless there is a lower value.
                    callback: function (value, index, values) {
                        if (parseInt(value) >= 1000) {
                            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        } else {
                            return (Math.round(value * 100) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        }
                    }
                }
            }]
        }
    }
    $scope.poSupPayment = {
        option: $scope.optionsPoSupPayement,
        type: 'StackedBar',
        labels: ["", "", "", "", "", "", "", "", "", ""],
        data: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
        series: ['Đã thanh toán', 'Chưa thanh toán'],
        colors: ['#3498db', '#F0AB05', '#A0B421', '#00A39F'],
        supName: '',
        dateSearch: ''
    }

    $scope.poCusTotal = {
        labels: ["", "", "", "", "", "", "", "", "", ""],
        data: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
        date: [],
        total: [],
        product: '',
        dateSearch: ''
    }
    $scope.optionsPoCusPayement = {
        //tooltips: {
        //    callbacks: {
        //        label: function (tooltipItem, data) {
        //            
        //            //var label = $scope.poSupPayment.total[tooltipItem.index].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || '';
        //            //var date = $scope.poSupPayment.date[tooltipItem.index] || '';

        //            //if (label) {
        //            //    label += " vào ngày " + date;
        //            //}
        //            //return [label];
        //        }
        //    },
        //},
        animation: {
            duration: 100,
            onComplete: function () {
                var ctx = this.chart.ctx;
                ctx.font = Chart.helpers.fontString(11, 'normal', Chart.defaults.global.defaultFontFamily);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';

                this.data.datasets.forEach(function (dataset) {
                    for (var i = 0; i < dataset.data.length; i++) {
                        var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model,
                            scale_max = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._yScale.maxHeight;
                        ctx.fillStyle = '#444';
                        var y_pos = model.y - 5;
                        // Make sure data value does not get overflown and hidden
                        // when the bar's value is too close to max value of scale
                        // Note: The y value is reverse, it counts from top down
                        if ((scale_max - model.y) / scale_max >= 0.93)
                            y_pos = model.y + 20;
                        //if (dataset.data[i] != 0) {
                        //ctx.fillText((Math.round(dataset.data[i] * 100) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), model.x, y_pos);
                        //}
                    }
                });
            }
        },
        scales: {
            xAxes: [{
                stacked: true,
            }],
            yAxes: [{
                stacked: true,
                ticks: {
                    beginAtZero: true, // minimum will be 0, unless there is a lower value.
                    callback: function (value, index, values) {
                        if (parseInt(value) >= 1000) {
                            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        } else {
                            return (Math.round(value * 100) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        }
                    }
                }
            }]
        }
    }
    $scope.poCusPayment = {
        option: $scope.optionsPoCusPayement,
        type: 'StackedBar',
        labels: ["", "", "", "", "", "", "", "", "", ""],
        data: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
        series: ['Đã thanh toán', 'Chưa thanh toán'],
        colors: ['#3498db', '#F0AB05', '#A0B421', '#00A39F'],
        cusName: '',
        dateSearch: ''
    }

    $scope.initData = function () {
        dataservice.getListProduct(function (result) {
            result = result.data;
            $scope.products = result;
        });
        dataservice.getListSupplier(function (result) {
            result = result.data;
            $scope.suppliers = result;
        });
        dataservice.getListCustomer(function (rs) {
            rs = rs.data;
            $scope.listCustomer = rs;
        });
    }
    $scope.initData();

    //1.Tìm kiếm tổng mua mua hàng
    $scope.searchPoSupTotal = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/searchPoSupTotal.html',
            controller: 'searchPoSupTotal',
            backdrop: 'static',
            size: '30'
        });
        modalInstance.result.then(function (d) {
            if (d.Total.length > 0) {
                $scope.poSupTotal.labels = [];
                $scope.poSupTotal.data = [[]];
                $scope.poSupTotal.date = [];
                $scope.poSupTotal.total = [];
                $scope.poSupTotal.product = d.ProductName;
                $scope.poSupTotal.dateSearch = d.DateSearch;
                for (var i = 0; i < d.Total.length; i++) {
                    $scope.poSupTotal.labels.push(d.Total[i].CreatedTime);
                    $scope.poSupTotal.date.push(d.Total[i].CreatedTime);
                    d.Total[i].Total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    $scope.poSupTotal.total.push(d.Total[i].Total);
                    $scope.poSupTotal.data[0].push(d.Total[i].Total);
                }
            } else {
                //App.toastrError("Không có kết quả nào phù hợp");
                App.toastrError(caption.RSPSC_MSG_NO_SUITABLE_RESULT);
            }
        }, function () {
        });
    }
    $scope.optionsPoSupTotal = {
        tooltips: {
            callbacks: {
                label: function (tooltipItem, data) {
                    var label = $scope.poSupTotal.total[tooltipItem.index].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || '';
                    var date = $scope.poSupTotal.date[tooltipItem.index] || '';

                    if (label) {
                        //label += " vào ngày " + date;
                    }
                    return [label];
                }
            },
        },
        animation: {
            duration: 100,
            onComplete: function () {
                var ctx = this.chart.ctx;
                ctx.font = Chart.helpers.fontString(11, 'normal', Chart.defaults.global.defaultFontFamily);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';

                this.data.datasets.forEach(function (dataset) {
                    for (var i = 0; i < dataset.data.length; i++) {
                        var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model,
                            scale_max = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._yScale.maxHeight;
                        ctx.fillStyle = '#444';
                        var y_pos = model.y - 5;
                        // Make sure data value does not get overflown and hidden
                        // when the bar's value is too close to max value of scale
                        // Note: The y value is reverse, it counts from top down
                        if ((scale_max - model.y) / scale_max >= 0.93)
                            y_pos = model.y + 20;
                        //if (dataset.data[i] != 0) {
                        ctx.fillText((Math.round(dataset.data[i] * 100) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), model.x, y_pos);
                        //}
                    }
                });
            }
        },
        scales: {
            yAxes: [{
                display: true,
                ticks: {
                    beginAtZero: true, // minimum will be 0, unless there is a lower value.
                    callback: function (value, index, values) {
                        if (parseInt(value) >= 1000) {
                            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        } else {
                            return (Math.round(value * 100) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        }
                    }
                }
            }]
        },
        maintainAspectRatio: false,
        //legend: { display: true },
        responsive: true,
    };

    //2.Tìm kiếm thanh toán 
    $scope.searchPoSupPayment = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/searchPoSupPayment.html',
            controller: 'searchPoSupPayment',
            backdrop: 'static',
            size: '30'
        });
        modalInstance.result.then(function (d) {
            if (d.Payment.length > 0) {
                $scope.poSupPayment.labels = [];
                $scope.poSupPayment.data = [[], []];
                $scope.poSupPayment.date = [];
                $scope.poSupPayment.total = [];
                $scope.poSupPayment.supName = d.SupName;
                $scope.poSupPayment.dateSearch = d.DateSearch;
                for (var i = 0; i < d.Payment.length; i++) {
                    $scope.poSupPayment.labels.push(d.Payment[i].PoSupCode);
                    $scope.poSupPayment.date.push(d.Payment[i].CreatedTime);
                    var totalPayment = (d.Payment[i].TotalPayment);
                    var totalNotPayment = (d.Payment[i].TotalAmount - d.Payment[i].TotalPayment);
                    $scope.poSupPayment.data[0].push(totalPayment);
                    $scope.poSupPayment.data[1].push(totalNotPayment);
                }
            } else {
                //App.toastrError("Không có kết quả nào phù hợp");
                App.toastrError(caption.RSPSC_MSG_NO_SUITABLE_RESULT);
            }
        }, function () {
        });
    }

    //3.Tìm kiếm doanh thu bán hàng
    $scope.searchPoCusTotal = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/searchPoCusTotal.html',
            controller: 'searchPoCusTotal',
            backdrop: 'static',
            size: '30'
        });
        modalInstance.result.then(function (d) {
            if (d.Total.length > 0) {
                $scope.poCusTotal.labels = [];
                $scope.poCusTotal.data = [[]];
                $scope.poCusTotal.date = [];
                $scope.poCusTotal.total = [];
                $scope.poCusTotal.product = d.ProductName;
                $scope.poCusTotal.dateSearch = d.DateSearch;
                for (var i = 0; i < d.Total.length; i++) {
                    var effectiveDate = $filter('date')(new Date(d.Total[i].EffectiveDate), 'dd/MM/yyyy');
                    $scope.poCusTotal.labels.push(effectiveDate);
                    $scope.poCusTotal.date.push(effectiveDate);
                    d.Total[i].RevenueAfterTaxVnd.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    $scope.poCusTotal.total.push(d.Total[i].RevenueAfterTaxVnd);
                    $scope.poCusTotal.data[0].push(d.Total[i].RevenueAfterTaxVnd);
                }
            } else {
                //App.toastrError("Không có kết quả nào phù hợp");
                App.toastrError(caption.RSPSC_MSG_NO_SUITABLE_RESULT);
            }
        }, function () {
        });
    }
    $scope.optionsPoCusTotal = {
        tooltips: {
            callbacks: {
                label: function (tooltipItem, data) {
                    var label = $scope.poCusTotal.total[tooltipItem.index].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || '';
                    var date = $scope.poCusTotal.date[tooltipItem.index] || '';

                    if (label) {
                        //label += " vào ngày " + date;
                    }
                    return [label];
                }
            },
        },
        animation: {
            duration: 100,
            onComplete: function () {
                var ctx = this.chart.ctx;
                ctx.font = Chart.helpers.fontString(11, 'normal', Chart.defaults.global.defaultFontFamily);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';

                this.data.datasets.forEach(function (dataset) {
                    for (var i = 0; i < dataset.data.length; i++) {
                        var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model,
                            scale_max = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._yScale.maxHeight;
                        ctx.fillStyle = '#444';
                        var y_pos = model.y - 5;
                        // Make sure data value does not get overflown and hidden
                        // when the bar's value is too close to max value of scale
                        // Note: The y value is reverse, it counts from top down
                        if ((scale_max - model.y) / scale_max >= 0.93)
                            y_pos = model.y + 20;
                        //if (dataset.data[i] != 0) {
                        ctx.fillText((Math.round(dataset.data[i] * 100) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), model.x, y_pos);
                        //}
                    }
                });
            }
        },
        scales: {
            yAxes: [{
                display: true,
                ticks: {
                    beginAtZero: true, // minimum will be 0, unless there is a lower value.
                    callback: function (value, index, values) {
                        if (parseInt(value) >= 1000) {
                            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        } else {
                            return (Math.round(value * 100) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        }
                    }
                }
            }]
        },
        maintainAspectRatio: false,
        //legend: { display: true },
        responsive: true,
    };

    //4.Tìm kiếm thanh toán Po Cus 
    $scope.searchPoCusPayment = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/searchPoCusPayment.html',
            controller: 'searchPoCusPayment',
            backdrop: 'static',
            size: '30'
        });
        modalInstance.result.then(function (d) {
            if (d.Payment.length > 0) {
                $scope.poCusPayment.labels = [];
                $scope.poCusPayment.data = [[], []];
                $scope.poCusPayment.date = [];
                $scope.poCusPayment.total = [];
                $scope.poCusPayment.cusName = d.CusName;
                $scope.poCusPayment.dateSearch = d.DateSearch;
                for (var i = 0; i < d.Payment.length; i++) {
                    var effectiveDate = $filter('date')(new Date(d.Payment[i].EffectiveDate), 'dd/MM/yyyy');
                    $scope.poCusPayment.labels.push(d.Payment[i].ContractCode);
                    $scope.poCusPayment.date.push(effectiveDate);
                    var totalPayment = (d.Payment[i].TotalPayment);
                    var totalNotPayment = (d.Payment[i].TotalNotPayment);
                    $scope.poCusPayment.data[0].push(totalPayment);
                    $scope.poCusPayment.data[1].push(totalNotPayment);
                }
            } else {
                //App.toastrError("Không có kết quả nào phù hợp");
                App.toastrError(caption.RSPSC_MSG_NO_SUITABLE_RESULT);
            }
        }, function () {
        });
    }

    //5. Tìm kiếm màn index
    $scope.searchAll = function () {
        if ($scope.model.FromDate == "") {
            App.toastrError("Vui lòng nhập từ ngày")
            return;
        }
        if ($scope.model.ToDate == "") {
            App.toastrError("Vui lòng nhập đến ngày")
            return;
        }

        dataservice.searchPoSupTotal($scope.model.FromDate, $scope.model.ToDate, $scope.model.ProductCode, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                if ($scope.model.ProductCode == '' || $scope.model.ProductCode == null || $scope.model.ProductCode == undefined) {
                    var obj = {
                        ProductName: '',
                        DateSearch: 'từ ngày: ' + $scope.model.FromDate + "-" + $scope.model.ToDate,
                        Total: rs
                    }
                    if (obj.Total.length > 0) {
                        $scope.poSupTotal.labels = [];
                        $scope.poSupTotal.data = [[]];
                        $scope.poSupTotal.date = [];
                        $scope.poSupTotal.total = [];
                        $scope.poSupTotal.product = obj.ProductName;
                        $scope.poSupTotal.dateSearch = obj.DateSearch;
                        for (var i = 0; i < obj.Total.length; i++) {
                            $scope.poSupTotal.labels.push(obj.Total[i].CreatedTime);
                            $scope.poSupTotal.date.push(obj.Total[i].CreatedTime);
                            obj.Total[i].Total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                            $scope.poSupTotal.total.push(obj.Total[i].Total);
                            $scope.poSupTotal.data[0].push(obj.Total[i].Total);
                        }
                    } else {
                        //App.toastrError("Không có kết quả nào phù hợp");
                        App.toastrError(caption.RSPSC_MSG_NO_SUITABLE_RESULT);
                    }
                } else {
                    var product = $scope.products.find(function (element) {
                        if (element.Code == $scope.model.ProductCode) return element;
                    });
                    var obj = {
                        ProductName: product.Name,
                        DateSearch: 'từ ngày: ' + $scope.model.FromDate + "-" + $scope.model.ToDate,
                        Total: rs
                    }
                    if (obj.Total.length > 0) {
                        $scope.poSupTotal.labels = [];
                        $scope.poSupTotal.data = [[]];
                        $scope.poSupTotal.date = [];
                        $scope.poSupTotal.total = [];
                        $scope.poSupTotal.product = obj.ProductName;
                        $scope.poSupTotal.dateSearch = obj.DateSearch;
                        for (var i = 0; i < obj.Total.length; i++) {
                            $scope.poSupTotal.labels.push(obj.Total[i].CreatedTime);
                            $scope.poSupTotal.date.push(obj.Total[i].CreatedTime);
                            obj.Total[i].Total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                            $scope.poSupTotal.total.push(obj.Total[i].Total);
                            $scope.poSupTotal.data[0].push(obj.Total[i].Total);
                        }
                    }
                    //else {
                    //    //App.toastrError("Không có kết quả nào phù hợp");
                    //    App.toastrError(caption.RSPSC_MSG_NO_SUITABLE_RESULT);
                    //}
                }
            }
        });

        dataservice.searchPoSupPayment($scope.model.FromDate, $scope.model.ToDate, $scope.model.SupCode, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                if ($scope.model.SupCode == '' || $scope.model.SupCode == null || $scope.model.SupCode == undefined) {
                    var obj = {
                        SupName: '',
                        DateSearch: 'từ ngày: ' + $scope.model.FromDate + "-" + $scope.model.ToDate,
                        Payment: rs
                    }
                    if (obj.Payment.length > 0) {
                        $scope.poSupPayment.labels = [];
                        $scope.poSupPayment.data = [[], []];
                        $scope.poSupPayment.date = [];
                        $scope.poSupPayment.total = [];
                        $scope.poSupPayment.supName = obj.SupName;
                        $scope.poSupPayment.dateSearch = obj.DateSearch;
                        for (var i = 0; i < obj.Payment.length; i++) {
                            $scope.poSupPayment.labels.push(obj.Payment[i].PoSupCode);
                            $scope.poSupPayment.date.push(obj.Payment[i].CreatedTime);
                            var totalPayment = (obj.Payment[i].TotalPayment);
                            var totalNotPayment = (obj.Payment[i].TotalAmount - obj.Payment[i].TotalPayment);
                            $scope.poSupPayment.data[0].push(totalPayment);
                            $scope.poSupPayment.data[1].push(totalNotPayment);
                        }
                    }

                } else {
                    var supplier = $scope.suppliers.find(function (element) {
                        if (element.Code == $scope.model.SupCode) return element;
                    });
                    var obj = {
                        SupName: supplier.Name,
                        DateSearch: 'từ ngày: ' + $scope.model.FromDate + "-" + $scope.model.ToDate,
                        Payment: rs
                    }
                    if (obj.Payment.length > 0) {
                        $scope.poSupPayment.labels = [];
                        $scope.poSupPayment.data = [[], []];
                        $scope.poSupPayment.date = [];
                        $scope.poSupPayment.total = [];
                        $scope.poSupPayment.supName = obj.SupName;
                        $scope.poSupPayment.dateSearch = obj.DateSearch;
                        for (var i = 0; i < obj.Payment.length; i++) {
                            $scope.poSupPayment.labels.push(obj.Payment[i].PoSupCode);
                            $scope.poSupPayment.date.push(obj.Payment[i].CreatedTime);
                            var totalPayment = (obj.Payment[i].TotalPayment);
                            var totalNotPayment = (obj.Payment[i].TotalAmount - obj.Payment[i].TotalPayment);
                            $scope.poSupPayment.data[0].push(totalPayment);
                            $scope.poSupPayment.data[1].push(totalNotPayment);
                        }
                    }
                }
            }
        });

        dataservice.searchPoCusTotal($scope.model.FromDate, $scope.model.ToDate, $scope.model.ProductCode, $scope.model.ProductType, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                if ($scope.model.ProductCode == '' || $scope.model.ProductCode == null || $scope.model.ProductCode == undefined) {
                    var obj = {
                        ProductName: '',
                        DateSearch: 'từ ngày: ' + $scope.model.FromDate + "-" + $scope.model.ToDate,
                        Total: rs
                    }
                    if (obj.Total.length > 0) {
                        $scope.poCusTotal.labels = [];
                        $scope.poCusTotal.data = [[]];
                        $scope.poCusTotal.date = [];
                        $scope.poCusTotal.total = [];
                        $scope.poCusTotal.product = obj.ProductName;
                        $scope.poCusTotal.dateSearch = obj.DateSearch;
                        for (var i = 0; i < obj.Total.length; i++) {
                            var effectiveDate = $filter('date')(new Date(obj.Total[i].EffectiveDate), 'dd/MM/yyyy');
                            $scope.poCusTotal.labels.push(effectiveDate);
                            $scope.poCusTotal.date.push(effectiveDate);
                            obj.Total[i].RevenueAfterTaxVnd.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                            $scope.poCusTotal.total.push(obj.Total[i].RevenueAfterTaxVnd);
                            $scope.poCusTotal.data[0].push(obj.Total[i].RevenueAfterTaxVnd);
                        }
                    }

                } else {
                    var product = $scope.products.find(function (element) {
                        if (element.Code == $scope.model.ProductCode) return element;
                    });
                    var obj = {
                        ProductName: product.Name,
                        DateSearch: 'từ ngày: ' + $scope.model.FromDate + "-" + $scope.model.ToDate,
                        Total: rs
                    }
                    if (obj.Total.length > 0) {
                        $scope.poCusTotal.labels = [];
                        $scope.poCusTotal.data = [[]];
                        $scope.poCusTotal.date = [];
                        $scope.poCusTotal.total = [];
                        $scope.poCusTotal.product = obj.ProductName;
                        $scope.poCusTotal.dateSearch = obj.DateSearch;
                        for (var i = 0; i < obj.Total.length; i++) {
                            var effectiveDate = $filter('date')(new Date(obj.Total[i].EffectiveDate), 'dd/MM/yyyy');
                            $scope.poCusTotal.labels.push(effectiveDate);
                            $scope.poCusTotal.date.push(effectiveDate);
                            obj.Total[i].RevenueAfterTaxVnd.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                            $scope.poCusTotal.total.push(obj.Total[i].RevenueAfterTaxVnd);
                            $scope.poCusTotal.data[0].push(obj.Total[i].RevenueAfterTaxVnd);
                        }
                    }
                }
            }
        });

        dataservice.searchPoCusPayment($scope.model.FromDate, $scope.model.ToDate, $scope.model.CusCode, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                if ($scope.model.CusCode == '' || $scope.model.CusCode == null || $scope.model.CusCode == undefined) {
                    var obj = {
                        CusName: '',
                        DateSearch: 'từ ngày: ' + $scope.model.FromDate + "-" + $scope.model.ToDate,
                        Payment: rs
                    }
                    if (obj.Payment.length > 0) {
                        $scope.poCusPayment.labels = [];
                        $scope.poCusPayment.data = [[], []];
                        $scope.poCusPayment.date = [];
                        $scope.poCusPayment.total = [];
                        $scope.poCusPayment.cusName = obj.CusName;
                        $scope.poCusPayment.dateSearch = obj.DateSearch;
                        for (var i = 0; i < obj.Payment.length; i++) {
                            var effectiveDate = $filter('date')(new Date(obj.Payment[i].EffectiveDate), 'dd/MM/yyyy');
                            $scope.poCusPayment.labels.push(obj.Payment[i].ContractCode);
                            $scope.poCusPayment.date.push(effectiveDate);
                            var totalPayment = (obj.Payment[i].TotalPayment);
                            var totalNotPayment = (obj.Payment[i].TotalNotPayment);
                            $scope.poCusPayment.data[0].push(totalPayment);
                            $scope.poCusPayment.data[1].push(totalNotPayment);
                        }
                    }
                } else {
                    var custommer = $scope.listCustomer.find(function (element) {
                        if (element.Code == $scope.model.CusCode) return element;
                    });
                    var obj = {
                        CusName: custommer.Name,
                        DateSearch: 'từ ngày: ' + $scope.model.FromDate + "-" + $scope.model.ToDate,
                        Payment: rs
                    }
                    if (obj.Payment.length > 0) {
                        $scope.poCusPayment.labels = [];
                        $scope.poCusPayment.data = [[], []];
                        $scope.poCusPayment.date = [];
                        $scope.poCusPayment.total = [];
                        $scope.poCusPayment.cusName = obj.CusName;
                        $scope.poCusPayment.dateSearch = obj.DateSearch;
                        for (var i = 0; i < obj.Payment.length; i++) {
                            var effectiveDate = $filter('date')(new Date(obj.Payment[i].EffectiveDate), 'dd/MM/yyyy');
                            $scope.poCusPayment.labels.push(obj.Payment[i].ContractCode);
                            $scope.poCusPayment.date.push(effectiveDate);
                            var totalPayment = (obj.Payment[i].TotalPayment);
                            var totalNotPayment = (obj.Payment[i].TotalNotPayment);
                            $scope.poCusPayment.data[0].push(totalPayment);
                            $scope.poCusPayment.data[1].push(totalNotPayment);
                        }
                    }
                }
            }
        });
    }

    function loadDate() {
        $.fn.datepicker.defaults.language = 'vi';
        $("#FromTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            todayHighlight: true,
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var minDate = new Date(selected.date.valueOf());
            var maxDate = addMonths(new Date(selected.date.valueOf()), 1);
            $('#DateTo').datepicker('setStartDate', minDate);
            $('#DateTo').datepicker('setEndDate', maxDate);
            //if ($('#FromTo').valid()) {
            //    $('#FromTo').removeClass('invalid').addClass('success');
            //}
        });
        $("#DateTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            todayHighlight: true,
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            var minDate = addMonths(new Date(selected.date.valueOf()), -1);
            $('#FromTo').datepicker('setEndDate', maxDate);
            $('#FromTo').datepicker('setStartDate', minDate);
            //if ($('#DateTo').valid()) {
            //    $('#DateTo').removeClass('invalid').addClass('success');
            //}
        });
        $('.end-date').click(function () {
            $('#FromTo').datepicker('setStartDate', null);
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
            $('#DateTo').datepicker('setEndDate', null);
        });
    }
    function addMonths(dt, n) {
        return new Date(dt.setMonth(dt.getMonth() + n));
    }
    $timeout(function () {
        loadDate();
    }, 100);
});

//PoSupTotal
app.controller('searchPoSupTotal', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $timeout) {
    $scope.model = {
        FromDate: '',
        ToDate: '',
        ProductCode: '',
        ProductType: '',
    }

    $scope.forms = {};

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        //validationSelect($scope.model);
        if ($scope.forms.searchform.validate()) {
            dataservice.searchPoSupTotal($scope.model.FromDate, $scope.model.ToDate, $scope.model.ProductCode, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    if ($scope.model.ProductCode == '' || $scope.model.ProductCode == null || $scope.model.ProductCode == undefined) {
                        var obj = {
                            ProductName: '',
                            DateSearch: 'từ ngày: ' + $scope.model.FromDate + "-" + $scope.model.ToDate,
                            Total: rs
                        }
                        $uibModalInstance.close(obj);
                    } else {
                        var product = $scope.products.find(function (element) {
                            if (element.Code == $scope.model.ProductCode) return element;
                        });
                        var obj = {
                            ProductName: product.Name,
                            DateSearch: 'từ ngày: ' + $scope.model.FromDate + "-" + $scope.model.ToDate,
                            Total: rs
                        }
                        $uibModalInstance.close(obj);
                    }
                }
            });
        }
    }
    $scope.changleSelect = function (selectType) {
        if (selectType == "ProductCode" && $scope.model.ProductCode != "") {
            $scope.errorProductCode = false;
        }
    }
    $scope.initLoad = function () {
        dataservice.getListProduct(function (result) {result=result.data;
            $scope.products = result;
        });
    }
    $scope.initLoad();
    function loadDate() {
        $.fn.datepicker.defaults.language = 'vi';
        $("#FromTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            todayHighlight: true,
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var minDate = new Date(selected.date.valueOf());
            var maxDate = addMonths(new Date(selected.date.valueOf()), 1);
            $('#DateTo').datepicker('setStartDate', minDate);
            $('#DateTo').datepicker('setEndDate', maxDate);
            if ($('#FromTo').valid()) {
                $('#FromTo').removeClass('invalid').addClass('success');
            }
        });
        $("#DateTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            todayHighlight: true,
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            var minDate = addMonths(new Date(selected.date.valueOf()), -2);
            $('#FromTo').datepicker('setEndDate', maxDate);
            $('#FromTo').datepicker('setStartDate', minDate);
            if ($('#DateTo').valid()) {
                $('#DateTo').removeClass('invalid').addClass('success');
            }
        });
        $('.end-date').click(function () {
            $('#FromTo').datepicker('setStartDate', null);
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
            $('#DateTo').datepicker('setEndDate', null);
        });
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.ProductCode == "" || data.ProductCode == null) {
            $scope.errorProductCode = true;
            mess.Status = true;
        } else {
            $scope.errorProductCode = false;
        }
        return mess;
    };
    function addMonths(dt, n) {
        return new Date(dt.setMonth(dt.getMonth() + n));
    }
    $timeout(function () {
        loadDate();
        setModalDraggable('.modal-dialog');
    }, 100);
});

//PoSupPayment
app.controller('searchPoSupPayment', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $timeout) {
    $scope.model = {
        FromDate: '',
        ToDate: '',
        SupCode: '',
    }

    $scope.forms = {};

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        //validationSelect($scope.model);
        if ($scope.forms.searchform.validate()) {
            dataservice.searchPoSupPayment($scope.model.FromDate, $scope.model.ToDate, $scope.model.SupCode, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    if ($scope.model.SupCode == '' || $scope.model.SupCode == null || $scope.model.SupCode == undefined) {
                        var obj = {
                            SupName: '',
                            DateSearch: 'từ ngày: ' + $scope.model.FromDate + "-" + $scope.model.ToDate,
                            Payment: rs
                        }
                    } else {
                        var supplier = $scope.suppliers.find(function (element) {
                            if (element.Code == $scope.model.SupCode) return element;
                        });
                        var obj = {
                            SupName: supplier.Name,
                            DateSearch: 'từ ngày: ' + $scope.model.FromDate + "-" + $scope.model.ToDate,
                            Payment: rs
                        }
                    }

                    $uibModalInstance.close(obj);
                }
            });
        }
    }
    $scope.changleSelect = function (selectType) {
        if (selectType == "SupCode" && $scope.model.SupCode != "") {
            $scope.errorSupCode = false;
        }
    }
    $scope.initLoad = function () {
        dataservice.getListSupplier(function (result) {result=result.data;
            $scope.suppliers = result;
        });
    }
    $scope.initLoad();
    function loadDate() {
        $.fn.datepicker.defaults.language = 'vi';
        $("#FromTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            todayHighlight: true,
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var minDate = new Date(selected.date.valueOf());
            var maxDate = addMonths(new Date(selected.date.valueOf()), 1);
            $('#DateTo').datepicker('setStartDate', minDate);
            $('#DateTo').datepicker('setEndDate', maxDate);
            if ($('#FromTo').valid()) {
                $('#FromTo').removeClass('invalid').addClass('success');
            }
        });
        $("#DateTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            todayHighlight: true,
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            var minDate = addMonths(new Date(selected.date.valueOf()), -2);
            $('#FromTo').datepicker('setEndDate', maxDate);
            $('#FromTo').datepicker('setStartDate', minDate);
            if ($('#DateTo').valid()) {
                $('#DateTo').removeClass('invalid').addClass('success');
            }
        });
        $('.end-date').click(function () {
            $('#FromTo').datepicker('setStartDate', null);
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
            $('#DateTo').datepicker('setEndDate', null);
        });
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.SupCode == "" || data.SupCode == null) {
            $scope.errorSupCode = true;
            mess.Status = true;
        } else {
            $scope.errorSupCode = false;
        }
        return mess;
    };
    function addMonths(dt, n) {
        return new Date(dt.setMonth(dt.getMonth() + n));
    }
    $timeout(function () {
        loadDate();
        setModalDraggable('.modal-dialog');
    }, 100);
});

//PoCusTotal
app.controller('searchPoCusTotal', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $timeout) {
    $scope.model = {
        FromDate: '',
        ToDate: '',
        ProductCode: '',
        ProductType: '',
    }

    $scope.forms = {};

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        //validationSelect($scope.model);
        if ($scope.forms.searchform.validate()) {
            
            dataservice.searchPoCusTotal($scope.model.FromDate, $scope.model.ToDate, $scope.model.ProductCode, $scope.model.ProductType, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    if ($scope.model.ProductCode == '' || $scope.model.ProductCode == null || $scope.model.ProductCode == undefined) {
                        var obj = {
                            ProductName: '',
                            DateSearch: 'từ ngày: ' + $scope.model.FromDate + "-" + $scope.model.ToDate,
                            Total: rs
                        }
                    } else {
                        var product = $scope.products.find(function (element) {
                            if (element.Code == $scope.model.ProductCode) return element;
                        });
                        var obj = {
                            ProductName: product.Name,
                            DateSearch: 'từ ngày: ' + $scope.model.FromDate + "-" + $scope.model.ToDate,
                            Total: rs
                        }
                    }

                    $uibModalInstance.close(obj);
                }
            });
        }
    }
    $scope.changleSelect = function (selectType, item) {
        if (selectType == "ProductCode" && $scope.model.ProductCode != "") {
            $scope.errorProductCode = false;
            $scope.model.ProductType = item.ProductType;
        }
    }
    $scope.initLoad = function () {
        dataservice.getListProduct(function (result) {result=result.data;
            $scope.products = result;
        });
    }
    $scope.initLoad();
    function loadDate() {
        $.fn.datepicker.defaults.language = 'vi';
        $("#FromTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            todayHighlight: true,
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var minDate = new Date(selected.date.valueOf());
            var maxDate = addMonths(new Date(selected.date.valueOf()), 1);
            $('#DateTo').datepicker('setStartDate', minDate);
            $('#DateTo').datepicker('setEndDate', maxDate);
            if ($('#FromTo').valid()) {
                $('#FromTo').removeClass('invalid').addClass('success');
            }
        });
        $("#DateTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            todayHighlight: true,
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            var minDate = addMonths(new Date(selected.date.valueOf()), -2);
            $('#FromTo').datepicker('setEndDate', maxDate);
            $('#FromTo').datepicker('setStartDate', minDate);
            if ($('#DateTo').valid()) {
                $('#DateTo').removeClass('invalid').addClass('success');
            }
        });
        $('.end-date').click(function () {
            $('#FromTo').datepicker('setStartDate', null);
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
            $('#DateTo').datepicker('setEndDate', null);
        });
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.ProductCode == "" || data.ProductCode == null) {
            $scope.errorProductCode = true;
            mess.Status = true;
        } else {
            $scope.errorProductCode = false;
        }
        return mess;
    };
    function addMonths(dt, n) {
        return new Date(dt.setMonth(dt.getMonth() + n));
    }
    $timeout(function () {
        loadDate();
        setModalDraggable('.modal-dialog');
    }, 100);
});

//PoCusPayment
app.controller('searchPoCusPayment', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $timeout) {
    $scope.model = {
        FromDate: '',
        ToDate: '',
        CusCode: '',
    }

    $scope.forms = {};

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        //validationSelect($scope.model);
        if ($scope.forms.searchform.validate()) {
            dataservice.searchPoCusPayment($scope.model.FromDate, $scope.model.ToDate, $scope.model.CusCode, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    if ($scope.model.CusCode == '' || $scope.model.CusCode == null || $scope.model.CusCode == undefined) {
                        var obj = {
                            CusName: '',
                            DateSearch: 'từ ngày: ' + $scope.model.FromDate + "-" + $scope.model.ToDate,
                            Payment: rs
                        }
                    } else {
                        var custommer = $scope.listCustomer.find(function (element) {
                            if (element.Code == $scope.model.CusCode) return element;
                        });
                        var obj = {
                            CusName: custommer.Name,
                            DateSearch: 'từ ngày: ' + $scope.model.FromDate + "-" + $scope.model.ToDate,
                            Payment: rs
                        }
                    }

                    $uibModalInstance.close(obj);
                }
            });
        }
    }
    $scope.changleSelect = function (selectType) {
        if (selectType == "SupCode" && $scope.model.SupCode != "") {
            $scope.errorSupCode = false;
        }
    }
    $scope.initLoad = function () {
        dataservice.getListCustomer(function (rs) {rs=rs.data;
            $scope.listCustomer = rs;
        });
    }
    $scope.initLoad();
    function loadDate() {
        $.fn.datepicker.defaults.language = 'vi';
        $("#FromTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            todayHighlight: true,
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var minDate = new Date(selected.date.valueOf());
            var maxDate = addMonths(new Date(selected.date.valueOf()), 1);
            $('#DateTo').datepicker('setStartDate', minDate);
            $('#DateTo').datepicker('setEndDate', maxDate);
            if ($('#FromTo').valid()) {
                $('#FromTo').removeClass('invalid').addClass('success');
            }
        });
        $("#DateTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            todayHighlight: true,
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            var minDate = addMonths(new Date(selected.date.valueOf()), -2);
            $('#FromTo').datepicker('setEndDate', maxDate);
            $('#FromTo').datepicker('setStartDate', minDate);
            if ($('#DateTo').valid()) {
                $('#DateTo').removeClass('invalid').addClass('success');
            }
        });
        $('.end-date').click(function () {
            $('#FromTo').datepicker('setStartDate', null);
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
            $('#DateTo').datepicker('setEndDate', null);
        });
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.SupCode == "" || data.SupCode == null) {
            $scope.errorSupCode = true;
            mess.Status = true;
        } else {
            $scope.errorSupCode = false;
        }
        return mess;
    };
    function addMonths(dt, n) {
        return new Date(dt.setMonth(dt.getMonth() + n));
    }
    $timeout(function () {
        loadDate();
        setModalDraggable('.modal-dialog');
    }, 100);
});
