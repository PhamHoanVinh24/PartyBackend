var ctxfolder = "/views/admin/vcChartLastMonth";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", "chart.js"]);
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
        //Sản lượng tiêu thụ
        getLastConsumpWithArea: function (data1, data2, data3, callback) {
            $http.get('/Admin/VCChartLastMonth/GetLastConsumpWithArea?productCode=' + data1 + '&brandCode=' + data2 + '&dateSearch=' + data3).success(callback);
        },
        searchLastConsumpWithArea: function (data1, data2, data3, callback) {
            $http.get('/Admin/VCChartLastMonth/GetLastConsumpWithArea?productCode=' + data1 + '&brandCode=' + data2 + '&dateSearch=' + data3, {
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
            }).success(callback);
        },
        getLastConsumpWithCustomer: function (data1, data2, data3, data4, callback) {
            $http.get('/Admin/VCChartLastMonth/GetLastConsumpWithCustomer?productCode=' + data1 + '&brandCode=' + data2 + '&dateSearch=' + data3 + '&areaCode=' + data4, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#barConsumption",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#barConsumption");
                }
            }).success(callback);
        },
        searchLastConsumpWithCustomer: function (data1, data2, data3, data4, callback) {
            $http.get('/Admin/VCChartLastMonth/GetLastConsumpWithCustomer?productCode=' + data1 + '&brandCode=' + data2 + '&dateSearch=' + data3 + '&areaCode=' + data4, {
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
            }).success(callback);
        },

        //Tỷ trọng
        getLastProportion: function (data1, data2, data3, callback) {
            $http.get('/Admin/VCChartLastMonth/GetLastProportion?areaCode=' + data1 + '&cusCode=' + data2 + '&dateSearch=' + data3).success(callback);
        },
        searchLastProportion: function (data1, data2, data3, callback) {
            $http.get('/Admin/VCChartLastMonth/GetLastProportion?areaCode=' + data1 + '&cusCode=' + data2 + '&dateSearch=' + data3, {
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
            }).success(callback);
        },

        //Tỷ trọng theo thương hiệu
        getLastProportionGroup: function (data1, data2, data3, callback) {
            $http.get('/Admin/VCChartLastMonth/GetLastProportionGroup?areaCode=' + data1 + '&cusCode=' + data2 + '&dateSearch=' + data3).success(callback);
        },
        searchLastProportionProductGroup: function (data1, data2, data3, callback) {
            $http.get('/Admin/VCChartLastMonth/GetLastProportionGroup?areaCode=' + data1 + '&cusCode=' + data2 + '&dateSearch=' + data3, {
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
            }).success(callback);
        },


        //Khách hàng,chủng loại,thương hiệu,vùng
        getListCustomers: function (callback) {
            $http.post('/Admin/VCChartLastMonth/GetListCustomer/').success(callback);
        },
        getListProductCats: function (callback) {
            $http.post('/Admin/VCChartLastMonth/GetListProduct/').success(callback);
        },
        getListBrand: function (callback) {
            $http.post('/Admin/VCChartLastMonth/GetListBrand/').success(callback);
        },
        getListArea: function (callback) {
            $http.post('/Admin/VCChartLastMonth/GetListArea/').success(callback);
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
    });

    $rootScope.monthNow = moment().format('MM/YYYY');
    $rootScope.trademark = {
        Code: "BUTSON",
        Name: "Bút Sơn"
    };

    $rootScope.validationOptionsSearchLastConsumption = {
        rules: {
            DateSearch: {
                required: true,
                maxlength: 255
            },
        },
        messages: {
            DateSearch: {
                required: "Thời gian yêu cầu bắt buộc"
            },
        }
    }
    $rootScope.validationOptionsSearchDetailLastConsumption = {
        rules: {
            DateSearch: {
                required: true,
                maxlength: 255
            },
        },
        messages: {
            DateSearch: {
                required: "Thời gian yêu cầu bắt buộc"
            },
        }
    }

    $rootScope.validationOptionsSearchLastProportion = {
        rules: {
            DateSearch: {
                required: true,
                maxlength: 255
            },
        },
        messages: {
            DateSearch: {
                required: "Thời gian yêu cầu bắt buộc"
            },
        }
    }
    $rootScope.validationOptionsSearchLastProportionProductGroup = {
        rules: {
            DateSearch: {
                required: true,
                maxlength: 255
            },
        },
        messages: {
            DateSearch: {
                required: "Thời gian yêu cầu bắt buộc"
            },
        }
    }
});
app.config(function ($routeProvider, $validatorProvider, $httpProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/Language/Translation');
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
app.controller('index', function ($scope, $rootScope, $compile, dataservice, $uibModal, $timeout) {
    //document angulerjs http://jtblin.github.io/angular-chart.js/
    //document js https://www.chartjs.org/
    $scope.lastConsumption = {
        labels: [],
        data: [[]],
        colours: [],
        area: [],
        areaName: [],
        month: $rootScope.monthNow,
        species: {
            Code: '',
            Name: '',
        },
        trademark: {
            Code: $rootScope.trademark.Code,
            Name: $rootScope.trademark.Name,
        },
    }
    $scope.lastProportion = {
        labels: [],
        data: [],
        colours: [],
        month: $rootScope.monthNow,
        area: '',
        store: ''
    }
    $scope.lastProportionProductGroup = {
        labels: [],
        data: [],
        month: $rootScope.monthNow,
        area: '',
        store: ''
    }


    $scope.initData = function () {
        //1. Sản lượng tiêu thụ
        dataservice.getLastConsumpWithArea('', $scope.lastConsumption.trademark.Code, $scope.lastConsumption.month, function (rs) {
            if (rs.Object.length != 0) {
                for (var i = 0; i < rs.Object.length; i++) {
                    $scope.lastConsumption.labels.push(rs.Object[i].AreaName);
                    //$scope.totalCanImp.labels.push('' + (i + 1) + '');
                    $scope.lastConsumption.area.push(rs.Object[i].Area);
                    $scope.lastConsumption.areaName.push(rs.Object[i].AreaName);
                    if (rs.Object[i].ConsumpMonthly == '' || rs.Object[i].ConsumpMonthly == null) {
                        $scope.lastConsumption.data[0].push(0);
                    } else {
                        $scope.lastConsumption.data[0].push(rs.Object[i].ConsumpMonthly);
                    }
                }
            } else {
                $scope.lastConsumption.labels = ["", "", "", "", "", "", "", "", "", ""];
                $scope.lastConsumption.data = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
            }
        });

        //2. Tỷ trọng
        dataservice.getLastProportion('', '', $scope.lastProportion.month, function (rs) {
            if (rs.Object.length != 0) {
                for (var i = 0; i < rs.Object.length; i++) {
                    $scope.lastProportion.labels.push(rs.Object[i].BrandName);
                    if (rs.Object[i].ConsumpMonthly == '' || rs.Object[i].ConsumpMonthly == null) {
                        $scope.lastProportion.data.push(0);
                    } else {
                        $scope.lastProportion.data.push(rs.Object[i].ConsumpMonthly);
                    }
                }
            } else {
                $scope.lastProportion.labels = ["", "", "", "", "", "", "", "", "", ""];
                $scope.lastProportion.data = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
            }
        });

        //3. Tỷ trọng theo thương hiệu
        dataservice.getLastProportionGroup('', '', $scope.lastProportionProductGroup.month, function (rs) {
            if (rs.Object.length != 0) {
                for (var i = 0; i < rs.Object.length; i++) {
                    $scope.lastProportionProductGroup.labels.push(rs.Object[i].ProductGroupName);
                    if (rs.Object[i].ConsumpMonthly == '' || rs.Object[i].ConsumpMonthly == null) {
                        $scope.lastProportionProductGroup.data.push(0);
                    } else {
                        $scope.lastProportionProductGroup.data.push(rs.Object[i].ConsumpMonthly);
                    }
                }
            } else {
                $scope.lastProportionProductGroup.labels = ["", "", "", "", "", "", "", "", "", ""];
                $scope.lastProportionProductGroup.data = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
            }
        });
    }
    $scope.initData();


    //1. Sản lượng tiêu thụ
    $scope.optionsLastConsumption = {
        tooltips: {
            callbacks: {
                label: function (tooltipItem, data) {
                    var label = $scope.lastConsumption.areaName[tooltipItem.index] || '';

                    if (label) {
                        label += ': ';
                    }
                    label += Math.round(tooltipItem.yLabel * 100) / 100 + " T";
                    return label;
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
                        ctx.fillText(dataset.data[i], model.x, y_pos);
                        //}
                    }
                });
            }
        },
        maintainAspectRatio: false,
        scales: {
            yAxes: [{
                display: true,
                ticks: {
                    beginAtZero: true // minimum will be 0, unless there is a lower value.
                    // OR //
                }
            }]
        },
        responsive: true,
    };
    $scope.lastConsumptionClick = function (points, evt) {
        if (points.length != 0) {
            var properties = {
                Area: $scope.lastConsumption.area[points[0]._index],
                AreaName: $scope.lastConsumption.areaName[points[0]._index],
                Species: $scope.lastConsumption.species.Code,
                SpeciesName: $scope.lastConsumption.species.Name,
                Trademark: $scope.lastConsumption.trademark.Code,
                TrademarkName: $scope.lastConsumption.trademark.Name,
                Month: $scope.lastConsumption.month,
            }
            dataservice.getLastConsumpWithCustomer(properties.Species, properties.Trademark, properties.Month, properties.Area, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    if (rs.Object.length != 0) {
                        var modalInstance = $uibModal.open({
                            animation: true,
                            templateUrl: ctxfolder + '/detailLastConsumption.html',
                            controller: 'detailLastConsumption',
                            backdrop: 'static',
                            resolve: {
                                para: function () {
                                    return {
                                        properties: properties,
                                        data: rs.Object,
                                    };
                                }
                            },
                            size: '80'
                        });
                        modalInstance.result.then(function (d) {

                        }, function () {
                        });
                    } else {
                        App.toastrError(caption.COM_MSG_NOT_FOUND_DATA);
                    }
                }
            });
        }
    };
    $scope.searchLastConsumption = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/searchLastConsumption.html',
            controller: 'searchLastConsumption',
            backdrop: 'static',
            size: '35'
        });
        modalInstance.result.then(function (d) {
            $scope.lastConsumption.labels = [];
            $scope.lastConsumption.data = [[]];
            $scope.lastConsumption.area = [];
            $scope.lastConsumption.areaName = [];

            $scope.lastConsumption.species.Code = d.Species.Code;
            $scope.lastConsumption.species.Name = d.Species.Name;
            $scope.lastConsumption.trademark.Code = d.Trademark.Code;
            $scope.lastConsumption.trademark.Name = d.Trademark.Name;
            $scope.lastConsumption.month = d.Month;
            for (var i = 0; i < d.Data.length; i++) {
                $scope.lastConsumption.labels.push(d.Data[i].AreaName);
                $scope.lastConsumption.area.push(d.Data[i].Area);
                $scope.lastConsumption.areaName.push(d.Data[i].AreaName);
                if (d.Data[i].ConsumpMonthly == '' || d.Data[i].ConsumpMonthly == null) {
                    $scope.lastConsumption.data[0].push(0);
                } else {
                    $scope.lastConsumption.data[0].push(d.Data[i].ConsumpMonthly);
                }
            }
        }, function () {
        });
    }

    //2. Tỷ trọng
    $scope.optionsLastProportion = {
        maintainAspectRatio: false,
        responsive: true,
        animation: {
            duration: 100,
            onComplete: function () {
                var ctx = this.chart.ctx;
                ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontFamily, 'normal', Chart.defaults.global.defaultFontFamily);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';

                this.data.datasets.forEach(function (dataset) {

                    for (var i = 0; i < dataset.data.length; i++) {
                        var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model,
                            total = dataset._meta[Object.keys(dataset._meta)[0]].total,
                            mid_radius = model.innerRadius + (model.outerRadius - model.innerRadius) / 2,
                            start_angle = model.startAngle,
                            end_angle = model.endAngle,
                            mid_angle = start_angle + (end_angle - start_angle) / 2;

                        var x = mid_radius * Math.cos(mid_angle);
                        var y = mid_radius * Math.sin(mid_angle);

                        ctx.fillStyle = '#fff';
                        if (i == 3) { // Darker text color for lighter background
                            //ctx.fillStyle = '#444';
                        }
                        var percent = String(Math.round(dataset.data[i] / total * 100)) + "%";
                        //Don't Display If Legend is hide or value is 0
                        if (dataset.data[i] != 0) {
                            //ctx.fillText(dataset.data[i], model.x + x, model.y + y);
                            // Display percent in another line, line break doesn't work for fillText
                            ctx.fillText(percent, model.x + x, model.y + y + 5);
                        }
                    }
                });
            }
        },
        legend: {
            display: true,
            position: 'right'
        },
    };
    $scope.searchLastProportion = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/searchLastProportion.html',
            controller: 'searchLastProportion',
            backdrop: 'static',
            size: '30'
        });
        modalInstance.result.then(function (d) {
            $scope.lastProportion.labels = [];
            $scope.lastProportion.data = [];
            $scope.lastProportion.store = d.StoreName;
            $scope.lastProportion.area = d.AreaName;
            $scope.lastProportion.month = d.Month;
            for (var i = 0; i < d.Object.length; i++) {
                $scope.lastProportion.labels.push(d.Object[i].BrandName);
                if (d.Object[i].ConsumpMonthly == '' || d.Object[i].ConsumpMonthly == null) {
                    $scope.lastProportion.data.push(0);
                } else {
                    $scope.lastProportion.data.push(d.Object[i].ConsumpMonthly);
                }
            }
        }, function () {
        });
    }

    //3. Tỷ trọng theo thương hiệu
    $scope.optionsLastProportionProductGroup = {
        maintainAspectRatio: false,
        responsive: true,
        animation: {
            duration: 100,
            onComplete: function () {
                var ctx = this.chart.ctx;
                ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontFamily, 'normal', Chart.defaults.global.defaultFontFamily);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';

                this.data.datasets.forEach(function (dataset) {

                    for (var i = 0; i < dataset.data.length; i++) {
                        var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model,
                            total = dataset._meta[Object.keys(dataset._meta)[0]].total,
                            mid_radius = model.innerRadius + (model.outerRadius - model.innerRadius) / 2,
                            start_angle = model.startAngle,
                            end_angle = model.endAngle,
                            mid_angle = start_angle + (end_angle - start_angle) / 2;

                        var x = mid_radius * Math.cos(mid_angle);
                        var y = mid_radius * Math.sin(mid_angle);

                        ctx.fillStyle = '#fff';
                        if (i == 3) { // Darker text color for lighter background
                            ctx.fillStyle = '#444';
                        }
                        var percent = String(Math.round(dataset.data[i] / total * 100)) + "%";
                        //Don't Display If Legend is hide or value is 0
                        if (dataset.data[i] != 0) {
                            //ctx.fillText(dataset.data[i], model.x + x, model.y + y);
                            // Display percent in another line, line break doesn't work for fillText
                            ctx.fillText(percent, model.x + x, model.y + y + 15);
                        }
                    }
                });
            }
        },
        legend: {
            display: true,
            position: 'right'
        },
    };
    $scope.searchLastProportionProductGroup = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/searchLastProportionProductGroup.html',
            controller: 'searchLastProportionProductGroup',
            backdrop: 'static',
            size: '30'
        });
        modalInstance.result.then(function (d) {
            $scope.lastProportionProductGroup.labels = [];
            $scope.lastProportionProductGroup.data = [];
            $scope.lastProportionProductGroup.store = d.StoreName;
            $scope.lastProportionProductGroup.area = d.AreaName;
            $scope.lastProportionProductGroup.month = d.Month;
            for (var i = 0; i < d.Object.length; i++) {
                $scope.lastProportionProductGroup.labels.push(d.Object[i].ProductGroupName);
                if (d.Object[i].ConsumpMonthly == '' || d.Object[i].ConsumpMonthly == null) {
                    $scope.lastProportionProductGroup.data.push(0);
                } else {
                    $scope.lastProportionProductGroup.data.push(d.Object[i].ConsumpMonthly);
                }
            }
        }, function () {
        });
    }
});

//detail consumption
app.controller('searchLastConsumption', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $timeout) {
    $scope.model = {
        Species: '',
        Trademark: '',
        DateSearch: ''
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.initData = function () {
        dataservice.getListProductCats(function (rs) {
            $scope.listProductCats = rs;
        });
        dataservice.getListBrand(function (rs) {
            $scope.listBrand = rs;
        });
    }
    $scope.initData();
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.searchform.validate() && !validationSelect($scope.model).Status) {
            dataservice.searchLastConsumpWithArea($scope.model.Species, $scope.model.Trademark, $scope.model.DateSearch, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    if (rs.Object.length == 0) {
                        App.toastrError("Không tìm thấy dữ liệu !");
                    } else {
                        var species = $scope.listProductCats.find(function (element) {
                            if (element.ProductCode == $scope.model.Species) return element;
                        });
                        var trademark = $scope.listBrand.find(function (element) {
                            if (element.Code == $scope.model.Trademark) return element;
                        });
                        var obj = {
                            Month: $scope.model.DateSearch,
                            Species: {
                                Code: species ? species.ProductCode : '',
                                Name: species ? species.ProductName : ''
                            },
                            Trademark: {
                                Code: trademark.Code,
                                Name: trademark.Name
                            },
                            Data: rs.Object
                        }
                        $uibModalInstance.close(obj);
                    }
                }
            });
        }
    }
    $scope.changleSelect = function (selectType) {
        //if (selectType == "Species" && $scope.model.Species != "") {
        //    $scope.errorSpecies = false;
        //}
        if (selectType == "Trademark" && $scope.model.Trademark != "") {
            $scope.errorTrademark = false;
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //if (data.Species == "" || data.Species == null) {
        //    $scope.errorSpecies = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorSpecies = false;
        //}
        if (data.Trademark == "" || data.Trademark == null) {
            $scope.errorTrademark = true;
            mess.Status = true;
        } else {
            $scope.errorTrademark = false;
        }
        return mess;
    };
    function loadDate() {
        $.fn.datepicker.defaults.language = 'vi';
        $('#datesearchlastconsump').datepicker({
            format: "mm/yyyy",
            autoclose: true,
            startView: "months",
            minViewMode: "months",
        });
    }
    function filllDefaultDate() {
        var dateNow = new Date();
        //$('#datesearchconsump').datepicker('update', new Date());
        $('#datesearchlastconsump').datepicker('setEndDate', dateNow);
    }
    $timeout(function () {
        setModalDraggable('.modal-dialog');
        loadDate();
        filllDefaultDate();
    }, 100);
});
app.controller('detailLastConsumption', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $timeout, para) {
    $scope.detailLastConsumption = {
        labels: [],
        data: [],
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.optionsDetailLastConsumption = {
        animation: {
            duration: 100,
            onComplete: function () {
                var ctx = this.chart.ctx;
                ctx.font = Chart.helpers.fontString(12, 'normal', Chart.defaults.global.defaultFontFamily);
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
                        ctx.fillText(dataset.data[i], model.x, y_pos);
                        //}
                    }
                });
            }
        },
        scales: {
            yAxes: [{
                display: true,
                ticks: {
                    beginAtZero: true // minimum will be 0, unless there is a lower value.
                    // OR //
                }
            }]
        },
        responsive: true,
    };
    $scope.searchDetailLastConsumption = function () {
        var modalInstance = $uibModal.open({
            //animation: true,
            templateUrl: ctxfolder + '/searchDetailLastConsumption.html',
            controller: 'searchDetailLastConsumption',
            backdrop: 'static',
            size: '35',
            resolve: {
                area: function () {
                    return $scope.model.Area;
                }
            },
        });
        modalInstance.result.then(function (d) {
            resetDetailLastConsumption();
            $scope.model.Species = d.Species.Code;
            $scope.model.SpeciesName = d.Species.Name;
            $scope.model.Trademark = d.Trademark.Code;
            $scope.model.TrademarkName = d.Trademark.Name;
            $scope.model.Month = d.Month;
            for (var i = 0; i < d.Data.length; i++) {
                $scope.detailLastConsumption.labels.push(d.Data[i].CusName);
                if (d.Data[i].ConsumpMonthly == null || d.Data[i].ConsumpMonthly == '') {
                    $scope.detailLastConsumption.data.push(0);
                } else {
                    $scope.detailLastConsumption.data.push(d.Data[i].ConsumpMonthly);
                }
            }
        }, function () {
        });
    }
    function loadData() {
        $scope.model = para.properties;
        for (var i = 0; i < para.data.length; i++) {
            $scope.detailLastConsumption.labels.push(para.data[i].CusName);
            if (para.data[i].ConsumpMonthly == null || para.data[i].ConsumpMonthly == '') {
                $scope.detailLastConsumption.data.push(0);
            } else {
                $scope.detailLastConsumption.data.push(para.data[i].ConsumpMonthly);
            }
        }
    }
    function resetDetailLastConsumption() {
        $scope.detailLastConsumption.labels = [];
        $scope.detailLastConsumption.data = [];
    }
    $timeout(function () {
        setModalMaxHeight('.modal');
        loadData();
        setModalDraggable('.modal-dialog');
    }, 50);
});
app.controller('searchDetailLastConsumption', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $timeout, area) {
    $scope.model = {
        Species: '',
        Trademark: '',
        DateSearch: '',
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.initData = function () {
        dataservice.getListProductCats(function (rs) {
            $scope.listProductCats = rs;
        });
        dataservice.getListBrand(function (rs) {
            $scope.listBrand = rs;
        });
    }
    $scope.initData();
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.searchform.validate() && !validationSelect($scope.model).Status) {
            dataservice.searchLastConsumpWithCustomer($scope.model.Species, $scope.model.Trademark, $scope.model.DateSearch, area, function (rs) {
                if (rs.Object.length == 0) {
                    App.toastrError("Không tồn tại dữ liệu");
                } else {
                    var species = $scope.listProductCats.find(function (element) {
                        if (element.ProductCode == $scope.model.Species) return element;
                    });
                    var trademark = $scope.listBrand.find(function (element) {
                        if (element.Code == $scope.model.Trademark) return element;
                    });
                    var obj = {
                        Month: $scope.model.DateSearch,
                        Species: {
                            Code: species ? species.ProductCode : '',
                            Name: species ? species.ProductName : ''
                        },
                        Trademark: {
                            Code: trademark.Code,
                            Name: trademark.Name
                        },
                        Data: rs.Object
                    }
                    $uibModalInstance.close(obj);
                }
            });
        }
    }
    $scope.changleSelect = function (selectType) {
        if (selectType == "Trademark" && $scope.model.Trademark != "") {
            $scope.errorTrademark = false;
        }
    }
    function loadDate() {
        $.fn.datepicker.defaults.language = 'vi';
        $('#datesearchlastconsumptiondetail').datepicker({
            format: "mm/yyyy",
            autoclose: true,
            startView: "months",
            minViewMode: "months",
            todayHighlight: true,
            inline: true,
            fontAwesome: true,
        });
    }
    function filllDefaultDate() {
        var dateNow = new Date();
        $('#datesearchlastconsumptiondetail').datepicker('setEndDate', dateNow);
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.Trademark == "" || data.Trademark == null) {
            $scope.errorTrademark = true;
            mess.Status = true;
        } else {
            $scope.errorTrademark = false;
        }
        return mess;
    };
    $timeout(function () {
        loadDate();
        filllDefaultDate();
        setModalDraggable('.modal-dialog');
    }, 100);
});

//lastProportion
app.controller('searchLastProportion', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $timeout) {
    $scope.model = {
        Area: '',
        Store: '',
        DateSearch: '',
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        if ($scope.searchform.validate()) {
            dataservice.searchLastProportion($scope.model.Area, $scope.model.Store, $scope.model.DateSearch, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    if (rs.Object.length != 0) {
                        var area = $scope.listAreas.find(function (element) {
                            if (element.Code == $scope.model.Area) return true;
                        });
                        var store = $scope.listCustomers.find(function (element) {
                            if (element.Code == $scope.model.Store) return true;
                        });
                        var obj = {
                            StoreName: store ? store.Name : '',
                            AreaName: area ? area.Name : '',
                            Month: $scope.model.DateSearch,
                            Object: rs.Object
                        }
                        $uibModalInstance.close(obj);
                    } else {
                        App.toastrError("Không tìm thấy dữ liệu");
                    }
                }
            });
        }
    }
    $scope.initLoad = function () {
        dataservice.getListArea(function (rs) {
            $scope.listAreas = rs.Object;
        });
        dataservice.getListCustomers(function (rs) {
            $scope.listCustomers = rs;
        });
    }
    $scope.initLoad();
    function loadDate() {
        $.fn.datepicker.defaults.language = 'vi';
        $('#datesearchlastproportion').datepicker({
            format: "mm/yyyy",
            autoclose: true,
            startView: "months",
            minViewMode: "months",
        });
    }
    function filllDefaultDate() {
        var dateNow = new Date();
        $('#datesearchlastproportion').datepicker('setEndDate', dateNow);
    }
    $timeout(function () {
        loadDate();
        filllDefaultDate();
        setModalDraggable('.modal-dialog');
    }, 100);
});

//lastProportionProductGroup
app.controller('searchLastProportionProductGroup', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $timeout) {
    $scope.model = {
        Area: '',
        Store: '',
        DateSearch: '',
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        if ($scope.searchform.validate()) {
            dataservice.searchLastProportionProductGroup($scope.model.Area,$scope.model.Store,$scope.model.DateSearch, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    if (rs.Object.length != 0) {
                        var store = $scope.listCustomers.find(function (element) {
                            if (element.Code == $scope.model.Store) return true;
                        });
                        var area = $scope.listAreas.find(function (element) {
                            if (element.Code == $scope.model.Area) return true;
                        });

                        var obj = {
                            StoreName: store ? store.Name : '',
                            AreaName: area ? area.Name : '',
                            Month: $scope.model.DateSearch,
                            Object: rs.Object
                        }
                        $uibModalInstance.close(obj);
                    } else {
                        App.toastrError("Không tìm thấy dữ liệu");
                    }
                }
            });
        }
    }
    $scope.initLoad = function () {
        dataservice.getListArea(function (rs) {
            $scope.listAreas = rs.Object;
        });
        dataservice.getListCustomers(function (rs) {
            $scope.listCustomers = rs;
        });
    }
    $scope.initLoad();
    function loadDate() {
        $.fn.datepicker.defaults.language = 'vi';
        $('#datesearchlastproportionproductgroup').datepicker({
            format: "mm/yyyy",
            autoclose: true,
            startView: "months",
            minViewMode: "months",
        });
    }
    function filllDefaultDate() {
        var dateNow = new Date();
        $('#datesearchlastproportionproductgroup').datepicker('setEndDate', dateNow);
    }
    $timeout(function () {
        loadDate();
        filllDefaultDate();
        setModalDraggable('.modal-dialog');
    }, 100);
});