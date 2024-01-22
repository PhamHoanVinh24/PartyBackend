var ctxfolder = "/views/admin/fundReport";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ["App_ESEIM_DASHBOARD","ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'chart.js']);
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
        getItem: function (data, callback) {
            $http.post('/Admin/FundReport/SearchChart/', data).then(callback);
        },
        getGetCatCode: function (callback) {
            $http.post('/Admin/FundPlanAccEntry/GetCatCode').then(callback);
        },
        getGetCatParent: function (callback) {
            $http.post('/Admin/FundReport/GetCatParent').then(callback);
        },
        getCatChildrentExpense: function (data, callback) {
            $http.post('/Admin/FundReport/GetCatChildrentExpense?obj=' + data).then(callback);
        },
        getCatChildrentReceipte: function (data, callback) {
            $http.post('/Admin/FundReport/GetCatChildrentReceipte?obj=' + data).then(callback);
        },
        gettreedata: function (callback) {
            $http.post('/Admin/FundReport/GetTreeData1').then(callback);
        },
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $filter, $uibModal,$location, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);

    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $rootScope.listAetType = [
            {
                Code: '',
                Name: caption.FCC_ALL
            },
            {
                Code: "Receipt",
                Name: caption.FCC_REVENUE
            }, {
                Code: "Expense",
                Name: caption.FCC_EXPENDI
            }];
    });
});
app.config(function ($routeProvider, $validatorProvider, $httpProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/FundReport/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
    //.when('/add/', {
    //    templateUrl: ctxfolder + '/add.html',
    //    controller: 'add'
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
    $httpProvider.interceptors.push('interceptors');

});
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, dataservice, $timeout) {
    $scope.model = {
        FromDate: '',
        ToDate: '',
        AetType: '',
        totalReceipt: 0,
        totalExpense: 0,
        totalRevenue: 0,
        CatParent: ''
    };

    $scope.labelsReceipt = [];
    $scope.dataReceipt = [];
    $scope.labelsExpense = [];
    $scope.dataExpense = [];
    $scope.dataReceiptPlan = [];
    $scope.dataExpensePlan = [];
    $scope.labelsReceiptPlan = [];
    $scope.labelsExpensePlan = [];

    //tạo sự kiện ng change
    $scope.ChangSelect = function (x) {
        if (x != null) {
            dataservice.getCatChildrentExpense(x, function (rs) {
                rs = rs.data;
                $rootScope.listCatChildrentExpense = rs;
            })
            //dataservice.getCatChildrentReceipte(x, function (rs) {rs=rs.data;
            //    $rootScope.listCatChildrentReceipte = rs;
            //})
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



    //Phiếu thu 
    $scope.init = function () {
        dataservice.getCatChildrentReceipte('', function (rs) {
            rs = rs.data;
            $rootScope.listCatChildrentExpense = rs;
        })
        dataservice.gettreedata(function (result) {
            result = result.data;
            $scope.treeData = result;
            //var all = {
            //    Code: '',
            //    Title: 'Tất cả'
            //}
            //$scope.treeData.unshift(all)
        });

        dataservice.getCatChildrentExpense('', function (rs) {
            rs = rs.data;
            $rootScope.listCatChildrentExpense = rs;
        });

        var a = 0;
        var b = 0;
        var z = 0;
        var f = 0;
        var c;
        dataservice.getItem($scope.model, function (rs) {
            rs = rs.data;

            if (rs.Item1.length != 0) {
                for (var i = 0; i < rs.Item1.length; i++) {
                    {
                        $scope.dataReceipt.push(rs.Item1[i].Total);
                        $scope.labelsReceipt.push(rs.Item1[i].Date);
                        a = a + rs.Item1[i].Total;
                        $scope.model.totalReceipt = a;
                    }
                }
            } else {
                $scope.dataReceipt.push(0);
                $scope.dataReceipt.push(0);
                $scope.dataReceipt.push(0);
                $scope.model.totalReceipt = a;
            }
            if (rs.Item2.length != 0) {

                for (var i = 0; i < rs.Item2.length; i++) {
                    {
                        $scope.dataExpense.push(rs.Item2[i].Total);
                        $scope.labelsExpense.push(rs.Item2[i].Date);
                        b = b + rs.Item2[i].Total;
                        $scope.model.totalExpense = b;

                    }
                }
            } else {
                $scope.dataExpense.push(0);
                $scope.dataExpense.push(0);
                $scope.dataExpense.push(0);
                $scope.model.totalExpense = b;
            }
            if (rs.Item3.length != 0) {
                for (var i = 0; i < rs.Item3.length; i++) {
                    {
                        $scope.dataReceiptPlan.push(rs.Item3[i].Total);
                        $scope.labelsReceiptPlan.push(rs.Item3[i].Date);
                        z = z + rs.Item3[i].Total;
                        $scope.model.totalReceiptPlan = z;


                    }
                }
            } else {
                $scope.dataReceiptPlan.push(0);
                $scope.dataReceiptPlan.push(0);
                $scope.dataReceiptPlan.push(0);

            }
            if (rs.Item4.length != 0) {

                for (var i = 0; i < rs.Item4.length; i++) {
                    {
                        $scope.dataExpensePlan.push(rs.Item4[i].Total);
                        $scope.labelsExpensePlan.push(rs.Item4[i].Date);
                        f = f + rs.Item4[i].Total;
                        $scope.model.totalExpensePlan = f;


                    }
                }
            } else {
                $scope.dataExpensePlan.push(0);
                $scope.dataExpensePlan.push(0);
                $scope.dataExpensePlan.push(0);

            }
            $scope.model.totalRevenue = a - b;
        })
        //dataservice.getGetCatCode(function (rs) {rs=rs.data;
        //    $rootScope.listCatCode = rs;
        //})
        dataservice.getGetCatParent(function (rs) {
            rs = rs.data;
            $rootScope.listCatParent = rs;
        })


    }
    $scope.init();
    $scope.optionsReceipt = {
        tooltips: {
            callbacks: {
                label: function (tooltipItem, data) {
                    return tooltipItem.yLabel.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                }
            }
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


                        ctx.fillText(dataset.data[i].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), model.x, y_pos);
                        //}
                    }
                });
            }
        },
        //legend: {
        //    //onHover: function (e) {
        //    //    e.target.style.cursor = 'pointer';
        //    //},
        //    display: true
        //},
        maintainAspectRatio: false,
        scales: {
            yAxes: [{
                display: true,
                ticks: {
                    beginAtZero: true, // minimum will be 0, unless there is a lower value.
                    callback: function (value, index, values) {

                        if (parseInt(value) >= 1000) {
                            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        } else if (value == 0) {
                            return value;
                        }
                        else {
                            return value.toFixed(1);
                        }
                    }
                }
                //ticks: {
                //    callback: function (label, index, labels) {
                //        return label / 1000000 + 'T';
                //    }
                //},
                //scaleLabel: {
                //    display: true,
                //    labelString: '1T = 1 Triệu'
                //}
            }]
        },
        responsive: true,
    };
    $scope.optionsExpense = {
        tooltips: {
            callbacks: {
                label: function (tooltipItem, data) {
                    return tooltipItem.yLabel.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                }
            }
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
                        ctx.fillText(dataset.data[i].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), model.x, y_pos);
                        //}
                    }
                });
            }
        },
        //legend: {
        //    //onHover: function (e) {
        //    //    e.target.style.cursor = 'pointer';
        //    //},
        //    display: true
        //},
        maintainAspectRatio: false,
        scales: {
            yAxes: [{
                display: true,
                ticks: {
                    beginAtZero: true, // minimum will be 0, unless there is a lower value.
                    callback: function (value, index, values) {
                        if (parseInt(value) >= 1000) {
                            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        }
                        else if (value == 0) {
                            return value;
                        }
                        else {

                            return value.toFixed(1);
                        }
                    }
                }
                // ticks: {
                //    callback: function (label, index, labels) {
                //        return label / 1000000 + 't';
                //    }

                //},
                //scalelabel: {
                //    display: true,
                //    labelstring: '1t = 1 triệu'
                //}

            }]
        },
        responsive: true,
    };
    $('.catParent').click(function () {

        $scope.model.CatCodeReceipte = '';
        //$scope.listCatChildrentExpense = [];
        $scope.model.CatCodeExpense = '';

    });


    



    $scope.search = function () {
        $scope.labelsReceipt = [];
        $scope.dataReceipt = [];
        $scope.labelsExpense = [];
        $scope.dataExpense = [];
        $scope.dataReceiptPlan = [];
        $scope.labelsReceiptPlan = [];
        $scope.dataExpensePlan = [];
        $scope.labelsExpensePlan = [];
        var a = 0;
        var b = 0;
        var z = 0;
        var f = 0;
        dataservice.getItem($scope.model, function (rs) {
            rs = rs.data;

            if (rs.Item1.length != 0) {
                for (var i = 0; i < rs.Item1.length; i++) {
                    {
                        $scope.dataReceipt.push(rs.Item1[i].Total);
                        $scope.labelsReceipt.push(rs.Item1[i].Date);
                        a = a + rs.Item1[i].Total;
                        $scope.model.totalReceipt = a;
                    }
                }
            } else {
                $scope.dataReceipt.push(0);
                $scope.dataReceipt.push(0);
                $scope.dataReceipt.push(0);
                $scope.model.totalReceipt = a;
            }
            if (rs.Item2.length != 0) {
                for (var i = 0; i < rs.Item2.length; i++) {
                    {
                        $scope.dataExpense.push(rs.Item2[i].Total);
                        $scope.labelsExpense.push(rs.Item2[i].Date);
                        b = b + rs.Item2[i].Total;
                        $scope.model.totalExpense = b;
                    }
                }
            } else {
                $scope.dataExpense.push(0);
                $scope.dataExpense.push(0);
                $scope.dataExpense.push(0);
                $scope.model.totalExpense = b;
            }
            if (rs.Item3.length != 0) {
                for (var i = 0; i < rs.Item3.length; i++) {
                    {
                        $scope.dataReceiptPlan.push(rs.Item3[i].Total);
                        $scope.labelsReceiptPlan.push(rs.Item3[i].Date);
                        z = z + rs.Item3[i].Total;
                        $scope.model.totalReceiptPlan = z;
                    }
                }
            } else {
                $scope.dataReceiptPlan.push(0);
                $scope.dataReceiptPlan.push(0);
                $scope.dataReceiptPlan.push(0);

            }
            if (rs.Item4.length != 0) {

                for (var i = 0; i < rs.Item4.length; i++) {
                    {
                        $scope.dataExpensePlan.push(rs.Item4[i].Total);
                        $scope.labelsExpensePlan.push(rs.Item4[i].Date);
                        f = f + rs.Item4[i].Total;
                        $scope.model.totalExpensePlan = f;


                    }
                }
            } else {
                $scope.dataExpensePlan.push(0);
                $scope.dataExpensePlan.push(0);
                $scope.dataExpensePlan.push(0);

            }
            $scope.model.totalRevenue = a - b;
        })
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

        var dt = new Date();

        $("#Fromtime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#Totime').datepicker('setStartDate', maxDate);
        });
        $("#Totime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#Fromtime').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            $('#Fromtime').datepicker('setEndDate', dt);
        });
        $('.start-date').click(function () {

            $('#Totime').datepicker('setStartDate', dt);
        });
        $('#Fromtime').datepicker('setEndDate', dt);
        $('#Totime').datepicker('setEndDate', dt);
        //    showHideSearch();
    }, 200);
});
