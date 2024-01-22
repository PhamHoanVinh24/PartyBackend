var ctxfolder = "/views/admin/vcChart";
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
        //Tiến độ hoàn thành công việc
        getListUser: function (callback) {
            $http.post('/Admin/VCChart/GetListUser/').success(callback);
        },
        getWorkProgress: function (data1, data2, data3, callback) {
            $http.get('/Admin/VCChart/GetWorkProgress?fromDate=' + data1 + '&toDate=' + data2 + '&userId=' + data3, {
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
            }).success(callback);
        },
        searchWorkProgress: function (data1, data2, data3, callback) {
            $http.get('/Admin/VCChart/GetWorkProgress?fromDate=' + data1 + '&toDate=' + data2 + '&userId=' + data3, {
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

        //Trữ lượng trống
        getTotalCanImpWithArea: function (data1, callback) {
            $http.get('/Admin/VCChart/GetTotalCanImpWithArea?dateSearch=' + data1).success(callback);
        },
        searchTotalCanImpWithArea: function (data1, callback) {
            $http.get('/Admin/VCChart/GetTotalCanImpWithArea?dateSearch=' + data1, {
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
        getTotalCanImpWithCustomer: function (data1, data2, callback) {
            $http.get('/Admin/VCChart/GetTotalCanImpWithCustomer?dateSearch=' + data1 + '&areaCode=' + data2, {
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
            }).success(callback);
        },
        searchTotalCanImpWithCustomer: function (data1, data2, callback) {
            $http.get('/Admin/VCChart/GetTotalCanImpWithCustomer?dateSearch=' + data1 + '&areaCode=' + data2, {
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


        //Sản lượng tiêu thụ
        getConsumpWithArea: function (data1, data2, data3, callback) {
            $http.get('/Admin/VCChart/GetConsumpWithArea?productCode=' + data1 + '&brandCode=' + data2 + '&dateSearch=' + data3).success(callback);
        },
        searchConsumpWithArea: function (data1, data2, data3, callback) {
            $http.get('/Admin/VCChart/GetConsumpWithArea?productCode=' + data1 + '&brandCode=' + data2 + '&dateSearch=' + data3, {
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
        getConsumpWithCustomer: function (data1, data2, data3, data4, callback) {
            $http.get('/Admin/VCChart/GetConsumpWithCustomer?productCode=' + data1 + '&brandCode=' + data2 + '&dateSearch=' + data3 + '&areaCode=' + data4, {
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
        searchConsumpWithCustomer: function (data1, data2, data3, data4, callback) {
            $http.get('/Admin/VCChart/GetConsumpWithCustomer?productCode=' + data1 + '&brandCode=' + data2 + '&dateSearch=' + data3 + '&areaCode=' + data4, {
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

        //Tồn kho
        getInstockWithArea: function (data1, data2, data3, callback) {
            $http.get('/Admin/VCChart/GetInstockWithArea?productCode=' + data1 + '&brandCode=' + data2 + '&dateSearch=' + data3).success(callback);
        },
        searchInstockWithArea: function (data1, data2, data3, callback) {
            $http.get('/Admin/VCChart/GetInstockWithArea?productCode=' + data1 + '&brandCode=' + data2 + '&dateSearch=' + data3, {
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
        getInstockWithCustomer: function (data1, data2, data3, data4, callback) {
            $http.get('/Admin/VCChart/GetInstockWithCustomer?productCode=' + data1 + '&brandCode=' + data2 + '&dateSearch=' + data3 + '&areaCode=' + data4, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#barInventory",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#barInventory");
                }
            }).success(callback);
        },
        searchInstockWithCustomer: function (data1, data2, data3, data4, callback) {
            $http.get('/Admin/VCChart/GetInstockWithCustomer?productCode=' + data1 + '&brandCode=' + data2 + '&dateSearch=' + data3 + '&areaCode=' + data4, {
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

        //Lượng nhập trong tháng
        getImportConsumpWithArea: function (data1, data2, data3, callback) {
            $http.get('/Admin/VCChart/GetImportConsumpWithArea?productCode=' + data1 + '&brandCode=' + data2 + '&dateSearch=' + data3).success(callback);
        },
        searchImportConsumpWithArea: function (data1, data2, data3, callback) {
            $http.get('/Admin/VCChart/GetImportConsumpWithArea?productCode=' + data1 + '&brandCode=' + data2 + '&dateSearch=' + data3, {
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
        getImportConsumpWithCustomer: function (data1, data2, data3, data4, callback) {
            $http.get('/Admin/VCChart/getImportConsumpWithCustomer?productCode=' + data1 + '&brandCode=' + data2 + '&dateSearch=' + data3 + '&areaCode=' + data4, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#barInputInMonth",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#barInputInMonth");
                }
            }).success(callback);
        },
        searchImportConsumpWithCustomer: function (data1, data2, data3, data4, callback) {
            $http.get('/Admin/VCChart/getImportConsumpWithCustomer?productCode=' + data1 + '&brandCode=' + data2 + '&dateSearch=' + data3 + '&areaCode=' + data4, {
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

        //Giá nhập
        getBuyCost: function (data1, data2, data3, callback) {
            $http.get('/Admin/VCChart/GetBuyCost?productCode=' + data1 + '&cusCode=' + data2 + '&dateSearch=' + data3, {
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
        getProportion: function (data1, data2, data3, callback) {
            $http.get('/Admin/VCChart/GetProportion?cusCode=' + data1 + '&areaCode=' + data2 + '&dateSearch=' + data3).success(callback);
        },
        searchProportion: function (data1, data2, data3, callback) {
            $http.get('/Admin/VCChart/GetProportion?cusCode=' + data1 + '&areaCode=' + data2 + '&dateSearch=' + data3, {
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
        getProportionProductGroup: function (data1, data2, data3, callback) {
            $http.get('/Admin/VCChart/GetProportionProductGroup?cusCode=' + data1 + '&areaCode=' + data2 + '&dateSearch=' + data3).success(callback);
        },
        searchProportionProductGroup: function (data1, data2, data3, callback) {
            $http.get('/Admin/VCChart/GetProportionProductGroup?cusCode=' + data1 + '&areaCode=' + data2 + '&dateSearch=' + data3, {
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
            $http.post('/Admin/VCChart/GetListCustomer/').success(callback);
        },
        getListProductCats: function (callback) {
            $http.post('/Admin/VCChart/GetListProduct/').success(callback);
        },
        getListBrand: function (callback) {
            $http.post('/Admin/VCChart/GetListBrand/').success(callback);
        },
        getListArea: function (callback) {
            $http.post('/Admin/VCChart/GetListArea/').success(callback);
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

    $rootScope.validationOptionsSearchWorkProgress = {
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
                required: caption.VCMM_MSG_FROM_DATE_REQUIRED
            },
            ToDate: {
                required: caption.VCMM_MSG_TO_DATE_REQUIRED
            },
        }
    }

    $rootScope.validationOptionsSearchToTalCanImp = {
        rules: {
            DateSearch: {
                required: true,
                maxlength: 255
            },
        },
        messages: {
            DateSearch: {
                required: caption.VCMM_MSG_TIME_REQUIRED
            },
        }
    }
    $rootScope.validationOptionsSearchDetailToTalCanImp = {
        rules: {
            DateSearch: {
                required: true,
                maxlength: 255
            },
        },
        messages: {
            DateSearch: {
                required: caption.VCMM_MSG_TIME_REQUIRED
            },
        }
    }

    $rootScope.validationOptionsSearchConsumption = {
        rules: {
            DateSearch: {
                required: true,
                maxlength: 255
            },
        },
        messages: {
            DateSearch: {
                required: caption.VCMM_MSG_TIME_REQUIRED
            },
        }
    }
    $rootScope.validationOptionsSearchDetailConsumption = {
        rules: {
            DateSearch: {
                required: true,
                maxlength: 255
            },
        },
        messages: {
            DateSearch: {
                required: caption.VCMM_MSG_TIME_REQUIRED
            },
        }
    }

    $rootScope.validationOptionsSearchInventory = {
        rules: {
            DateSearch: {
                required: true,
                maxlength: 255
            },
        },
        messages: {
            DateSearch: {
                required: caption.VCMM_MSG_TIME_REQUIRED
            },
        }
    }
    $rootScope.validationOptionsSearchDetailInventory = {
        rules: {
            DateSearch: {
                required: true,
                maxlength: 255
            },
        },
        messages: {
            DateSearch: {
                required: caption.VCMM_MSG_TIME_REQUIRED
            },
        }
    }

    $rootScope.validationOptionsSearchBuyCost = {
        rules: {
            DateSearch: {
                required: true,
                maxlength: 255
            },
        },
        messages: {
            DateSearch: {
                required: caption.VCMM_MSG_TIME_REQUIRED
            },
        }
    }

    $rootScope.validationOptionsSearchInputInMonth = {
        rules: {
            DateSearch: {
                required: true,
                maxlength: 255
            },
        },
        messages: {
            DateSearch: {
                required: caption.VCMM_MSG_TIME_REQUIRED
            },
        }
    }
    $rootScope.validationOptionsSearchDetailInputInMonth = {
        rules: {
            DateSearch: {
                required: true,
                maxlength: 255
            },
        },
        messages: {
            DateSearch: {
                required: caption.VCMM_MSG_TIME_REQUIRED
            },
        }
    }

    $rootScope.validationOptionsSearchProportion = {
        rules: {
            DateSearch: {
                required: true,
                maxlength: 255
            },
        },
        messages: {
            DateSearch: {
                required: caption.VCMM_MSG_TIME_REQUIRED
            },
        }
    }
    $rootScope.validationOptionsSearchProportionProductGroup = {
        rules: {
            DateSearch: {
                required: true,
                maxlength: 255
            },
        },
        messages: {
            DateSearch: {
                required: caption.VCMM_MSG_TIME_REQUIRED
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
    $scope.workProgress = {
        labels: ["", "", "", "", "", "", "", "", "", ""],
        data: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
        date: [],
        worked: [],
        user: ''
    }
    $scope.inventory = {
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
    $scope.consumption = {
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
    $scope.totalCanImp = {
        labels: [],
        data: [[]],
        area: [],
        areaName: [],
        month: $rootScope.monthNow,
    }
    $scope.buyCost = {
        labels: ["", "", "", "", "", "", "", "", "", ""],
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        species: '',
        store: '',
        month: ''
    }
    $scope.inputInMonth = {
        labels: [],
        data: [[]],
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
    $scope.proportion = {
        labels: [],
        data: [],
        colours: [],
        month: $rootScope.monthNow,
        area: '',
        store: ''
    }
    $scope.proportionProductGroup = {
        labels: [],
        data: [],
        month: $rootScope.monthNow,
        area: '',
        store: ''
    }


    $scope.initData = function () {
        //1. Tiến độ hoàn thành công việc      

        //2. Trữ lượng trống
        dataservice.getTotalCanImpWithArea($scope.totalCanImp.month, function (rs) {
            if (rs.Object.length != 0) {
                for (var i = 0; i < rs.Object.length; i++) {
                    $scope.totalCanImp.labels.push(rs.Object[i].AreaName);
                    //$scope.totalCanImp.labels.push('' + (i + 1) + '');
                    $scope.totalCanImp.area.push(rs.Object[i].Area);
                    $scope.totalCanImp.areaName.push(rs.Object[i].AreaName);
                    if (rs.Object[i].TotalCanImp == '' || rs.Object[i].TotalCanImp == null) {
                        $scope.totalCanImp.data[0].push(0);
                    } else {
                        $scope.totalCanImp.data[0].push(rs.Object[i].TotalCanImp);
                    }
                }
            } else {
                $scope.totalCanImp.labels = ["", "", "", "", "", "", "", "", "", ""];
                $scope.totalCanImp.data = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
            }
        });

        //3. Sản lượng tiêu thụ
        dataservice.getConsumpWithArea('', $scope.consumption.trademark.Code, $scope.consumption.month, function (rs) {
            if (rs.Object.length != 0) {
                for (var i = 0; i < rs.Object.length; i++) {
                    $scope.consumption.labels.push(rs.Object[i].AreaName);
                    //$scope.consumption.labels.push('' + (i + 1) + '');
                    $scope.consumption.area.push(rs.Object[i].Area);
                    $scope.consumption.areaName.push(rs.Object[i].AreaName);
                    if (rs.Object[i].ConsumpMonthly > 100) {
                        var obj = {
                            backgroundColor: 'rgb(49, 223, 245)',
                            pointBackgroundColor: 'rgba(78, 180, 189, 1)',
                            pointHoverBackgroundColor: 'rgba(151,187,205,1)',
                            borderColor: 'rgb(49, 223, 245)',
                            pointBorderColor: '#fff',
                            pointHoverBorderColor: 'rgba(151,187,205,1)'
                        }
                        $scope.consumption.colours.push(obj);
                    }
                    if (rs.Object[i].ConsumpMonthly == '' || rs.Object[i].ConsumpMonthly == null) {
                        $scope.consumption.data[0].push(0);
                    } else {
                        $scope.consumption.data[0].push(rs.Object[i].ConsumpMonthly);
                    }
                }
            } else {
                $scope.consumption.labels = ["", "", "", "", "", "", "", "", "", ""];
                $scope.consumption.data = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
            }
        });

        //4. Tồn kho theo vùng,
        dataservice.getInstockWithArea('', $scope.inventory.trademark.Code, $scope.inventory.month, function (rs) {
            if (rs.Object.length != 0) {
                for (var i = 0; i < rs.Object.length; i++) {
                    //$scope.inventory.labels.push('' + (i + 1) + '');
                    $scope.inventory.labels.push(rs.Object[i].AreaName);
                    $scope.inventory.areaName.push(rs.Object[i].AreaName);
                    $scope.inventory.area.push(rs.Object[i].Area);
                    if (rs.Object[i].Instock > 100) {
                        var obj = {
                            backgroundColor: 'rgb(228, 141, 141)',
                            pointBackgroundColor: 'rgba(78, 180, 189, 1)',
                            pointHoverBackgroundColor: 'rgba(151,187,205,1)',
                            borderColor: 'rgb(228, 141, 141)',
                            pointBorderColor: '#fff',
                            pointHoverBorderColor: 'rgba(151,187,205,1)'
                        }
                        $scope.inventory.colours.push(obj);
                    }
                    if (rs.Object[i].Instock == '' || rs.Object[i].Instock == null) {
                        $scope.inventory.data[0].push(0);
                    } else {
                        $scope.inventory.data[0].push(rs.Object[i].Instock);
                    }
                }
            } else {
                $scope.inventory.labels = ["", "", "", "", "", "", "", "", "", ""];
                $scope.inventory.data = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
            }
        });

        //6. Lượng nhập trong tháng
        dataservice.getImportConsumpWithArea('', $scope.inputInMonth.trademark.Code, $scope.inputInMonth.month, function (rs) {
            if (rs.Object.length != 0) {
                for (var i = 0; i < rs.Object.length; i++) {
                    $scope.inputInMonth.labels.push(rs.Object[i].AreaName);
                    $scope.inputInMonth.areaName.push(rs.Object[i].AreaName);
                    $scope.inputInMonth.area.push(rs.Object[i].Area);
                    if (rs.Object[i].ImportConsump == '' || rs.Object[i].ImportConsump == null) {
                        $scope.inputInMonth.data[0].push(0);
                    } else {
                        $scope.inputInMonth.data[0].push(rs.Object[i].ImportConsump);
                    }
                }
            } else {
                $scope.inputInMonth.labels = ["", "", "", "", "", "", "", "", "", ""];
                $scope.inputInMonth.data = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
            }
        });

        //7. Tỷ trọng
        dataservice.getProportion('', '', $scope.proportion.month, function (rs) {
            if (rs.Object.length != 0) {
                for (var i = 0; i < rs.Object.length; i++) {
                    $scope.proportion.labels.push(rs.Object[i].BrandName);
                    if (rs.Object[i].ConsumpMonthly == '' || rs.Object[i].ConsumpMonthly == null) {
                        $scope.proportion.data.push(0);
                    } else {
                        $scope.proportion.data.push(rs.Object[i].ConsumpMonthly);
                    }
                }
            } else {
                $scope.proportion.labels = ["", "", "", "", "", "", "", "", "", ""];
                $scope.proportion.data = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
            }
        });

        //8. Tỷ trọng theo thương hiệu
        dataservice.getProportionProductGroup('', '', $scope.proportionProductGroup.month, function (rs) {
            if (rs.Object.length != 0) {
                for (var i = 0; i < rs.Object.length; i++) {
                    $scope.proportionProductGroup.labels.push(rs.Object[i].ProductGroupName);
                    //$scope.proportionProductGroup.productGroupName.push(rs.Object[i].ProductGroupName);
                    //$scope.proportionProductGroup.productGroup.push(rs.Object[i].ProductGroup);
                    if (rs.Object[i].ConsumpMonthly == '' || rs.Object[i].ConsumpMonthly == null) {
                        $scope.proportionProductGroup.data.push(0);
                    } else {
                        $scope.proportionProductGroup.data.push(rs.Object[i].ConsumpMonthly);
                    }
                }
            } else {
                $scope.proportionProductGroup.labels = ["", "", "", "", "", "", "", "", "", ""];
                $scope.proportionProductGroup.data = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
            }
        });

    }
    $scope.initData();

    //1.Tìm kiếm tiến độ công việc
    $scope.searchWorkProgress = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/searchWorkProgress.html',
            controller: 'searchWorkProgress',
            backdrop: 'static',
            size: '30'
        });
        modalInstance.result.then(function (d) {
            $scope.workProgress.labels = [];
            $scope.workProgress.data = [[]];
            $scope.workProgress.date = [];
            $scope.workProgress.worked = [];
            $scope.workProgress.user = d.User;
            for (var i = 0; i < d.Work.length; i++) {
                //$scope.workProgress.labels.push('' + (i + 1) + '');
                $scope.workProgress.labels.push(d.Work[i].Date);
                $scope.workProgress.date.push(d.Work[i].Date);
                $scope.workProgress.worked.push(d.Work[i].Worked);
                $scope.workProgress.data[0].push(d.Work[i].Percent);
            }
        }, function () {
        });
    }
    $scope.optionsWorkProgress = {
        tooltips: {
            callbacks: {
                label: function (tooltipItem, data) {
                    var label = $scope.workProgress.worked[tooltipItem.index] || '';
                    var date = $scope.workProgress.date[tooltipItem.index] || '';

                    if (label) {
                        label += " vào ngày " + date;
                    } else {
                        label += "Không có kế hoạch công việc vào ngày " + date;
                    }
                    var percent = Math.round(tooltipItem.yLabel * 100) / 100 + "%";
                    return [label, 'Tỷ lệ: ' + percent];
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
                        ctx.fillText(Math.round(dataset.data[i] * 100) / 100, model.x, y_pos);
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
        maintainAspectRatio: false,
        //legend: { display: true },
        responsive: true,
    };

    //2. Trữ lượng trống
    $scope.optionsTotalCanImp = {
        tooltips: {
            callbacks: {
                label: function (tooltipItem, data) {
                    var label = $scope.totalCanImp.areaName[tooltipItem.index] || '';

                    if (label) {
                        label += ': ';
                    }
                    label += Math.round(tooltipItem.yLabel * 100) / 100 + " T";
                    return label;
                }
            },
        },
        animation: {
            //duration: 100,
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
        scales: {
            yAxes: [{
                display: true,
                ticks: {
                    beginAtZero: true // minimum will be 0, unless there is a lower value.
                    // OR //
                }
            }]
        },
        maintainAspectRatio: false,
        //legend: { display: true },
        responsive: true,
    };
    $scope.totalCanImpClick = function (points, evt) {
        if (points.length != 0) {
            debugger
            var properties = {
                Area: $scope.totalCanImp.area[points[0]._index],
                AreaName: $scope.totalCanImp.areaName[points[0]._index],
                Month: $scope.totalCanImp.month,
            }
            dataservice.getTotalCanImpWithCustomer(properties.Month, properties.Area, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.title);
                } else {
                    if (rs.Object.length != 0) {
                        var modalInstance = $uibModal.open({
                            animation: true,
                            templateUrl: ctxfolder + '/detailTotalCanImp.html',
                            controller: 'detailTotalCanImp',
                            backdrop: 'static',
                            resolve: {
                                para: function () {
                                    return {
                                        properties: properties,
                                        data: rs.Object
                                    };
                                }
                            },
                            size: '80'
                        });
                        modalInstance.result.then(function (d) {

                        }, function () {
                        });
                    } else {
                        App.toastrError("Dữ liệu trống");
                    }
                }
            });
        }
    };
    $scope.searchTotalCanImp = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/searchTotalCanImp.html',
            controller: 'searchTotalCanImp',
            backdrop: 'static',
            size: '35'
        });
        modalInstance.result.then(function (d) {
            $scope.totalCanImp.labels = [];
            $scope.totalCanImp.data = [[]];
            $scope.totalCanImp.area = [];
            $scope.totalCanImp.areaName = [];

            $scope.totalCanImp.month = d.Month;
            for (var i = 0; i < d.Data.length; i++) {
                $scope.totalCanImp.labels.push(d.Data[i].AreaName);
                $scope.totalCanImp.area.push(d.Data[i].Area);
                $scope.totalCanImp.areaName.push(d.Data[i].AreaName);
                if (d.Data[i].TotalCanImp == '' || d.Data[i].TotalCanImp == null) {
                    $scope.totalCanImp.data[0].push(0);
                } else {
                    $scope.totalCanImp.data[0].push(d.Data[i].TotalCanImp);
                }
            }
        }, function () {
        });
    }

    //3. Sản lượng tiêu thụ
    $scope.optionsConsumption = {
        tooltips: {
            callbacks: {
                label: function (tooltipItem, data) {
                    var label = $scope.consumption.areaName[tooltipItem.index] || '';

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
                    beginAtZero: true // minimum will be 0, unless there is a lower value.
                    // OR //
                }
            }]
        },
        responsive: true,
    };
    $scope.consumptionClick = function (points, evt) {
        if (points.length != 0) {
            var properties = {
                Area: $scope.consumption.area[points[0]._index],
                AreaName: $scope.consumption.areaName[points[0]._index],
                Species: $scope.consumption.species.Code,
                SpeciesName: $scope.consumption.species.Name,
                Trademark: $scope.consumption.trademark.Code,
                TrademarkName: $scope.consumption.trademark.Name,
                Month: $scope.consumption.month,
            }
            dataservice.getConsumpWithCustomer(properties.Species, properties.Trademark, properties.Month, properties.Area, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    if (rs.Object.length != 0) {
                        var modalInstance = $uibModal.open({
                            animation: true,
                            templateUrl: ctxfolder + '/detailConsumption.html',
                            controller: 'detailConsumption',
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
    $scope.searchConsumption = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/searchConsumption.html',
            controller: 'searchConsumption',
            backdrop: 'static',
            size: '35'
        });
        modalInstance.result.then(function (d) {
            $scope.consumption.labels = [];
            $scope.consumption.data = [[]];
            $scope.consumption.area = [];
            $scope.consumption.areaName = [];

            $scope.consumption.species.Code = d.Species.Code;
            $scope.consumption.species.Name = d.Species.Name;
            $scope.consumption.trademark.Code = d.Trademark.Code;
            $scope.consumption.trademark.Name = d.Trademark.Name;
            $scope.consumption.month = d.Month;
            for (var i = 0; i < d.Data.length; i++) {
                $scope.consumption.labels.push(d.Data[i].AreaName);
                $scope.consumption.area.push(d.Data[i].Area);
                $scope.consumption.areaName.push(d.Data[i].AreaName);
                if (d.Data[i].ConsumpMonthly == '' || d.Data[i].ConsumpMonthly == null) {
                    $scope.consumption.data[0].push(0);
                } else {
                    $scope.consumption.data[0].push(d.Data[i].ConsumpMonthly);
                }
            }
        }, function () {
        });
    }

    //4. Tồn kho theo vùng,
    $scope.optionsInventory = {
        tooltips: {
            callbacks: {
                label: function (tooltipItem, data) {
                    var label = $scope.inventory.areaName[tooltipItem.index] || '';

                    if (label) {
                        label += ': ';
                    }
                    label += Math.round(tooltipItem.yLabel * 100) / 100 + " T";
                    return label;
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
        //legend: {
        //    //onHover: function (e) {
        //    //    e.target.style.cursor = 'pointer';
        //    //},
        //    display: true
        //},
        maintainAspectRatio: false,
        responsive: true,
    };
    $scope.inventoryClick = function (points, evt) {
        if (points.length != 0) {
            var properties = {
                Area: $scope.inventory.area[points[0]._index],
                AreaName: $scope.inventory.areaName[points[0]._index],
                Species: $scope.inventory.species.Code,
                SpeciesName: $scope.inventory.species.Name,
                Trademark: $scope.inventory.trademark.Code,
                TrademarkName: $scope.inventory.trademark.Name,
                Month: $scope.inventory.month,
            }
            dataservice.getInstockWithCustomer(properties.Species, properties.Trademark, properties.Month, properties.Area, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    if (rs.Object.length != 0) {
                        var modalInstance = $uibModal.open({
                            animation: true,
                            templateUrl: ctxfolder + '/detailInventory.html',
                            controller: 'detailInventory',
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
                    }
                }
            });
        }
    };
    $scope.searchInventory = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/searchInventory.html',
            controller: 'searchInventory',
            backdrop: 'static',
            size: '35'
        });
        modalInstance.result.then(function (d) {
            $scope.inventory.labels = [];
            $scope.inventory.data = [[]];
            $scope.inventory.area = [];
            $scope.inventory.areaName = [];

            $scope.inventory.species.Code = d.Species.Code;
            $scope.inventory.species.Name = d.Species.Name;
            $scope.inventory.trademark.Code = d.Trademark.Code;
            $scope.inventory.trademark.Name = d.Trademark.Name;
            $scope.inventory.month = d.Month;

            for (var i = 0; i < d.Data.length; i++) {
                $scope.inventory.labels.push(d.Data[i].AreaName);
                $scope.inventory.area.push(d.Data[i].Area);
                $scope.inventory.areaName.push(d.Data[i].AreaName);
                if (d.Data[i].Instock == '' || d.Data[i].Instock == null) {
                    $scope.inventory.data[0].push(0);
                } else {
                    $scope.inventory.data[0].push(d.Data[i].Instock);
                }
            }
        }, function () {
        });
    }

    //5.Giá nhập
    $scope.optionsBuyCost = {
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
        scales: {
            yAxes: [{
                display: true,
                ticks: {
                    beginAtZero: true // minimum will be 0, unless there is a lower value.
                    // OR //
                }
            }]
        },
        maintainAspectRatio: false,
    };
    $scope.searchBuyCost = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/searchBuyCost.html',
            controller: 'searchBuyCost',
            backdrop: 'static',
            size: '30'
        });
        modalInstance.result.then(function (d) {
            $scope.buyCost.labels = [];
            $scope.buyCost.data = [];
            $scope.buyCost.date = [];
            $scope.buyCost.worked = [];
            $scope.buyCost.species = d.Species;
            $scope.buyCost.store = d.Store;
            $scope.buyCost.month = d.Month;
            for (var i = 0; i < d.Object.length; i++) {
                $scope.buyCost.labels.push(d.Object[i].BrandName);
                if (d.Object[i].BuyCost == '' || d.Object[i].BuyCost == null) {
                    $scope.buyCost.data.push(0);
                } else {
                    $scope.buyCost.data.push(d.Object[i].BuyCost);
                }
            }
        }, function () {
        });
    }

    //6.Lượng nhập trong tháng
    $scope.optionsInputInMonth = {
        tooltips: {
            callbacks: {
                label: function (tooltipItem, data) {
                    var label = $scope.inputInMonth.areaName[tooltipItem.index] || '';

                    if (label) {
                        label += ': ';
                    }
                    label += Math.round(tooltipItem.yLabel * 100) / 100 + " T";
                    return label;
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
        maintainAspectRatio: false,
        responsive: true,
    };
    $scope.inputInMonthClick = function (points, evt) {
        if (points.length != 0) {
            var properties = {
                Area: $scope.inputInMonth.area[points[0]._index],
                AreaName: $scope.inputInMonth.areaName[points[0]._index],
                Species: $scope.inputInMonth.species.Code,
                SpeciesName: $scope.inputInMonth.species.Name,
                Trademark: $scope.inputInMonth.trademark.Code,
                TrademarkName: $scope.inputInMonth.trademark.Name,
                Month: $scope.inputInMonth.month,
            }
            dataservice.getImportConsumpWithCustomer(properties.Species, properties.Trademark, properties.Month, properties.Area, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    if (rs.Object.length != 0) {
                        var modalInstance = $uibModal.open({
                            animation: true,
                            templateUrl: ctxfolder + '/detailInputInMonth.html',
                            controller: 'detailInputInMonth',
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
    $scope.searchInputInMonth = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/searchInputInMonth.html',
            controller: 'searchInputInMonth',
            backdrop: 'static',
            size: '35'
        });
        modalInstance.result.then(function (d) {
            $scope.inputInMonth.labels = [];
            $scope.inputInMonth.data = [[]];
            $scope.inputInMonth.area = [];
            $scope.inputInMonth.areaName = [];
            $scope.inputInMonth.species.Code = d.Species.Code;
            $scope.inputInMonth.species.Name = d.Species.Name;
            $scope.inputInMonth.trademark.Code = d.Trademark.Code;
            $scope.inputInMonth.trademark.Name = d.Trademark.Name;
            $scope.inputInMonth.month = d.Month;
            for (var i = 0; i < d.Data.length; i++) {
                $scope.inputInMonth.labels.push(d.Data[i].AreaName);
                $scope.inputInMonth.area.push(d.Data[i].Area);
                $scope.inputInMonth.areaName.push(d.Data[i].AreaName);
                if (d.Data[i].ImportConsump == '' || d.Data[i].ImportConsump == null) {
                    $scope.inputInMonth.data[0].push(0);
                } else {
                    $scope.inputInMonth.data[0].push(d.Data[i].ImportConsump);
                }
            }
        }, function () {
        });
    }

    //7. Tỷ trọng
    $scope.optionsProportion = {
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
    $scope.searchProportion = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/searchProportion.html',
            controller: 'searchProportion',
            backdrop: 'static',
            size: '30'
        });
        modalInstance.result.then(function (d) {
            $scope.proportion.labels = [];
            $scope.proportion.data = [];
            $scope.proportion.store = d.StoreName;
            $scope.proportion.area = d.AreaName;
            $scope.proportion.month = d.Month;
            for (var i = 0; i < d.Object.length; i++) {
                $scope.proportion.labels.push(d.Object[i].BrandName);
                if (d.Object[i].ConsumpMonthly == '' || d.Object[i].ConsumpMonthly == null) {
                    $scope.proportion.data.push(0);
                } else {
                    $scope.proportion.data.push(d.Object[i].ConsumpMonthly);
                }
            }
        }, function () {
        });
    }

    //8. Tỷ trọng theo thương hiệu
    $scope.optionsProportionProductGroup = {
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
    $scope.searchProportionProductGroup = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/searchProportionProductGroup.html',
            controller: 'searchProportionProductGroup',
            backdrop: 'static',
            size: '30'
        });
        modalInstance.result.then(function (d) {
            $scope.proportionProductGroup.labels = [];
            $scope.proportionProductGroup.data = [];
            $scope.proportionProductGroup.store = d.StoreName;
            $scope.proportionProductGroup.area = d.AreaName;
            $scope.proportionProductGroup.month = d.Month;
            for (var i = 0; i < d.Object.length; i++) {
                $scope.proportionProductGroup.labels.push(d.Object[i].ProductGroupName);
                if (d.Object[i].ConsumpMonthly == '' || d.Object[i].ConsumpMonthly == null) {
                    $scope.proportionProductGroup.data.push(0);
                } else {
                    $scope.proportionProductGroup.data.push(d.Object[i].ConsumpMonthly);
                }
            }
        }, function () {
        });
    }
});

//workProgress
app.controller('searchWorkProgress', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $timeout) {
    $scope.model = {
        FromDate: '',
        ToDate: '',
        User: '',
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.searchform.validate() && !validationSelect($scope.model).Status) {
            dataservice.searchWorkProgress($scope.model.FromDate, $scope.model.ToDate, $scope.model.User, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    var userName = $scope.listUser.find(function (element) {
                        if (element.Id == $scope.model.User) return element;
                    });
                    var obj = {
                        User: userName.GivenName,
                        Work: rs.Object
                    }
                    $uibModalInstance.close(obj);
                }
            });
        }
    }
    $scope.changleSelect = function (selectType) {
        if (selectType == "User" && $scope.model.User != "") {
            $scope.errorUser = false;
        }
    }
    $scope.initLoad = function () {
        dataservice.getListUser(function (rs) {
            $scope.listUser = rs;
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
        if (data.User == "" || data.User == null) {
            $scope.errorUser = true;
            mess.Status = true;
        } else {
            $scope.errorUser = false;
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

//totalCanImp
app.controller('searchTotalCanImp', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $timeout) {
    $scope.model = {
        DateSearch: ''
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        if ($scope.searchform.validate()) {
            dataservice.searchTotalCanImpWithArea($scope.model.DateSearch, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    if (rs.Object.length == 0) {
                        App.toastrError(caption.COM_MSG_NOT_FOUND_DATA);
                    } else {
                        var obj = {
                            Month: $scope.model.DateSearch,
                            Data: rs.Object
                        }
                        $uibModalInstance.close(obj);
                    }
                }
            });
        }
    }
    function loadDate() {
        $.fn.datepicker.defaults.language = 'vi';
        $('#datesearchtotalcanimp').datepicker({
            format: "mm/yyyy",
            autoclose: true,
            startView: "months",
            minViewMode: "months",
        });
    }
    function filllDefaultDate() {
        var dateNow = new Date();
        $('#datesearchtotalcanimp').datepicker('setEndDate', dateNow);
    }
    $timeout(function () {
        setModalDraggable('.modal-dialog');
        loadDate();
        filllDefaultDate();
    }, 100);
});
app.controller('detailTotalCanImp', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $timeout, para) {
    $scope.detaiTotalCanImp = {
        labels: [],
        data: [],
        colours: [],
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.optionsDetaiTotalCanImp = {
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
        maintainAspectRatio: true,
        responsive: true,
    };
    $scope.searchDetailTotalCanImp = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/searchDetailTotalCanImp.html',
            controller: 'searchDetailTotalCanImp',
            backdrop: 'static',
            size: '35',
            resolve: {
                area: function () {
                    return $scope.model.Area;
                }
            },
        });
        modalInstance.result.then(function (d) {
            resetDetaiTotalCanImp();
            $scope.model.Month = d.Month;
            for (var i = 0; i < d.Data.length; i++) {
                $scope.detaiTotalCanImp.labels.push(d.Data[i].CusName);
                if (d.Data[i].TotalCanImp == null || d.Data[i].TotalCanImp == '') {
                    $scope.detaiTotalCanImp.data.push(0);
                } else {
                    $scope.detaiTotalCanImp.data.push(d.Data[i].TotalCanImp);
                }
            }
        }, function () {
        });
    }
    function loadData() {
        $scope.model = para.properties;
        for (var i = 0; i < para.data.length; i++) {
            if (para.data[i].TotalCanImp != null) {
                $scope.detaiTotalCanImp.labels.push(para.data[i].CusName);
                if (para.data[i].TotalCanImp == null || para.data[i].TotalCanImp == '') {
                    $scope.detaiTotalCanImp.data.push(0);
                } else {
                    $scope.detaiTotalCanImp.data.push(para.data[i].TotalCanImp);
                }
            }
        }
    }
    function resetDetaiTotalCanImp() {
        $scope.detaiTotalCanImp.labels = [];
        $scope.detaiTotalCanImp.data = [];
    }
    $timeout(function () {
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
        loadData();
    }, 50);
});
app.controller('searchDetailTotalCanImp', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $timeout, area) {
    $scope.model = {
        DateSearch: '',
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        if ($scope.searchform.validate()) {
            dataservice.searchTotalCanImpWithCustomer($scope.model.DateSearch, area, function (rs) {
                if (rs.Object.length == 0) {
                    App.toastrError("Không tồn tại dữ liệu");
                } else {
                    var obj = {
                        Month: $scope.model.DateSearch,
                        Data: rs.Object
                    }
                    $uibModalInstance.close(obj);
                }
            });
        }
    }
    function loadDate() {
        $.fn.datepicker.defaults.language = 'vi';
        $('#datesearchtotalcanimpdetail').datepicker({
            format: "mm/yyyy",
            autoclose: true,
            startView: "months",
            minViewMode: "months",
        });

    }
    function filllDefaultDate() {
        var dateNow = new Date();
        $('#datesearchtotalcanimpdetail').datepicker('setEndDate', dateNow);
    }
    $timeout(function () {
        loadDate();
        filllDefaultDate();
        setModalDraggable('.modal-dialog');
    }, 100);

});

//detai inventory
app.controller('searchInventory', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $timeout) {
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
            dataservice.searchInstockWithArea($scope.model.Species, $scope.model.Trademark, $scope.model.DateSearch, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    if (rs.Object.length == 0) {
                        App.toastrError(caption.COM_MSG_NOT_FOUND_DATA);
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
        $('#datesearchinventory').datepicker({
            format: "mm/yyyy",
            autoclose: true,
            startView: "months",
            minViewMode: "months",
        });
    }
    function filllDefaultDate() {
        var dateNow = new Date();
        //$('#datesearchinventory').datepicker('update', new Date());
        $('#datesearchinventory').datepicker('setEndDate', dateNow);
    }
    $timeout(function () {
        setModalDraggable('.modal-dialog');
        loadDate();
        filllDefaultDate();
    }, 100);
});
app.controller('detailInventory', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $timeout, para) {
    $scope.detaiInventory = {
        labels: [],
        data: [],
        colours: [],
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.optionsDetaiInventory = {
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
    $scope.searchDetailInventory = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/searchDetailInventory.html',
            controller: 'searchDetailInventory',
            backdrop: 'static',
            size: '35',
            resolve: {
                area: function () {
                    return $scope.model.Area;
                }
            },
        });
        modalInstance.result.then(function (d) {
            resetDetaiInventory();
            $scope.model.Species = d.Species.Code;
            $scope.model.SpeciesName = d.Species.Name;
            $scope.model.Trademark = d.Trademark.Code;
            $scope.model.TrademarkName = d.Trademark.Name;
            $scope.model.Month = d.Month;
            for (var i = 0; i < d.Data.length; i++) {
                $scope.detaiInventory.labels.push(d.Data[i].CusName);
                if (d.Data[i].Instock == null || d.Data[i].Instock == '') {
                    $scope.detaiInventory.data.push(0);
                } else {
                    $scope.detaiInventory.data.push(d.Data[i].Instock);
                }
            }
        }, function () {
        });
    }
    function loadData() {
        $scope.model = para.properties;
        for (var i = 0; i < para.data.length; i++) {
            $scope.detaiInventory.labels.push(para.data[i].CusName);
            if (para.data[i].Instock == null || para.data[i].Instock == '') {
                $scope.detaiInventory.data.push(0);
            } else {
                $scope.detaiInventory.data.push(para.data[i].Instock);
            }
        }
    }
    function resetDetaiInventory() {
        $scope.detaiInventory.labels = [];
        $scope.detaiInventory.data = [];
    }
    $timeout(function () {
        setModalMaxHeight('.modal');
        loadData();
        setModalDraggable('.modal-dialog');
    }, 50);
});
app.controller('searchDetailInventory', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $timeout, area) {
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
            dataservice.searchInstockWithCustomer($scope.model.Species, $scope.model.Trademark, $scope.model.DateSearch, area, function (rs) {
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
        $('#datesearchinventorydetail').datepicker({
            format: "mm/yyyy",
            autoclose: true,
            startView: "months",
            minViewMode: "months",
        });

    }
    function filllDefaultDate() {
        var dateNow = new Date();
        $('#datesearchinventorydetail').datepicker('setEndDate', dateNow);
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

//detail consumption
app.controller('searchConsumption', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $timeout) {
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
            dataservice.searchConsumpWithArea($scope.model.Species, $scope.model.Trademark, $scope.model.DateSearch, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    if (rs.Object.length == 0) {
                        App.toastrError(caption.COM_MSG_NOT_FOUND_DATA);
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
        $('#datesearchconsump').datepicker({
            format: "mm/yyyy",
            autoclose: true,
            startView: "months",
            minViewMode: "months",
        });
    }
    function filllDefaultDate() {
        var dateNow = new Date();
        //$('#datesearchconsump').datepicker('update', new Date());
        $('#datesearchconsump').datepicker('setEndDate', dateNow);
    }
    $timeout(function () {
        setModalDraggable('.modal-dialog');
        loadDate();
        filllDefaultDate();
    }, 100);
});
app.controller('detailConsumption', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $timeout, para) {
    $scope.detailConsumption = {
        labels: [],
        data: [],
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.optionsDetailConsumption = {
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
    $scope.searchDetailConsumption = function () {
        var modalInstance = $uibModal.open({
            //animation: true,
            templateUrl: ctxfolder + '/searchDetailConsumption.html',
            controller: 'searchDetailConsumption',
            backdrop: 'static',
            size: '35',
            resolve: {
                area: function () {
                    return $scope.model.Area;
                }
            },
        });
        modalInstance.result.then(function (d) {
            resetDetailConsumption();
            $scope.model.Species = d.Species.Code;
            $scope.model.SpeciesName = d.Species.Name;
            $scope.model.Trademark = d.Trademark.Code;
            $scope.model.TrademarkName = d.Trademark.Name;
            $scope.model.Month = d.Month;
            for (var i = 0; i < d.Data.length; i++) {
                $scope.detailConsumption.labels.push(d.Data[i].CusName);
                if (d.Data[i].ConsumpMonthly == null || d.Data[i].ConsumpMonthly == '') {
                    $scope.detailConsumption.data.push(0);
                } else {
                    $scope.detailConsumption.data.push(d.Data[i].ConsumpMonthly);
                }
            }
        }, function () {
        });
    }
    function loadData() {
        $scope.model = para.properties;
        for (var i = 0; i < para.data.length; i++) {
            $scope.detailConsumption.labels.push(para.data[i].CusName);
            if (para.data[i].ConsumpMonthly == null || para.data[i].ConsumpMonthly == '') {
                $scope.detailConsumption.data.push(0);
            } else {
                $scope.detailConsumption.data.push(para.data[i].ConsumpMonthly);
            }
        }
    }
    function resetDetailConsumption() {
        $scope.detailConsumption.labels = [];
        $scope.detailConsumption.data = [];
    }
    $timeout(function () {
        setModalMaxHeight('.modal');
        loadData();
        setModalDraggable('.modal-dialog');
    }, 50);
});
app.controller('searchDetailConsumption', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $timeout, area) {
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
            dataservice.searchConsumpWithCustomer($scope.model.Species, $scope.model.Trademark, $scope.model.DateSearch, area, function (rs) {
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
        $('#datesearchconsumptiondetail').datepicker({
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
        $('#datesearchconsumptiondetail').datepicker('setEndDate', dateNow);
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

//inputPrice
app.controller('searchBuyCost', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $timeout) {
    $scope.model = {
        Species: '',
        Store: '',
        DateSearch: '',
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.searchform.validate() && !validationSelect($scope.model).Status) {
            dataservice.getBuyCost($scope.model.Species, $scope.model.Store, $scope.model.DateSearch, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    if (rs.Object.length != 0) {
                        var speciesName = $scope.listProductCats.find(function (element) {
                            if (element.ProductCode == $scope.model.Species) return true;
                        });
                        var storeName = $scope.listCustomers.find(function (element) {
                            if (element.Code == $scope.model.Store) return true;
                        });
                        var obj = {
                            Species: speciesName.ProductName,
                            Store: storeName.Name,
                            Month: $scope.model.DateSearch,
                            Object: rs.Object
                        }
                        $uibModalInstance.close(obj);
                    } else {
                        App.toastrError(caption.COM_MSG_NOT_FOUND_DATA);
                    }
                }
            });
        }
    }
    $scope.changleSelect = function (selectType) {
        if (selectType == "Species" && $scope.model.Species != "") {
            $scope.errorSpecies = false;
        }
        if (selectType == "Store" && $scope.model.Store != "") {
            $scope.errorStore = false;
        }
    }
    $scope.initLoad = function () {
        dataservice.getListProductCats(function (rs) {
            $scope.listProductCats = rs;
        });
        dataservice.getListCustomers(function (rs) {
            $scope.listCustomers = rs;
        });
    }
    $scope.initLoad();
    function loadDate() {
        $.fn.datepicker.defaults.language = 'vi';
        $('#datesearchbuycost').datepicker({
            format: "mm/yyyy",
            autoclose: true,
            startView: "months",
            minViewMode: "months",
        });
    }
    function filllDefaultDate() {
        var dateNow = new Date();
        //$('#datesearchinputinmonthdetail').datepicker('update', new Date());
        $('#datesearchbuycost').datepicker('setEndDate', dateNow);
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.Species == "" || data.Species == null) {
            $scope.errorSpecies = true;
            mess.Status = true;
        } else {
            $scope.errorSpecies = false;
        }
        if (data.Store == "" || data.Store == null) {
            $scope.errorStore = true;
            mess.Status = true;
        } else {
            $scope.errorStore = false;
        }
        return mess;
    };
    $timeout(function () {
        loadDate();
        filllDefaultDate();
        setModalDraggable('.modal-dialog');
    }, 100);
});

//detail InputInMonth
app.controller('searchInputInMonth', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $timeout) {
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
            dataservice.searchImportConsumpWithArea($scope.model.Species, $scope.model.Trademark, $scope.model.DateSearch, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    if (rs.Object.length == 0) {
                        App.toastrError(caption.COM_MSG_NOT_FOUND_DATA);
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
        if (selectType == "Trademark" && $scope.model.Trademark != "") {
            $scope.errorTrademark = false;
        }
    }
    function loadDate() {
        $.fn.datepicker.defaults.language = 'vi';
        $('#datesearchinputinmonth').datepicker({
            format: "mm/yyyy",
            autoclose: true,
            startView: "months",
            minViewMode: "months",
        });
    }
    function filllDefaultDate() {
        var dateNow = new Date();
        //$('#datesearchinputinmonth').datepicker('update', new Date());
        $('#datesearchinputinmonth').datepicker('setEndDate', dateNow);
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
        setModalDraggable('.modal-dialog');
        loadDate();
        filllDefaultDate();
    }, 100);
});
app.controller('detailInputInMonth', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $timeout, para) {
    $scope.detailInputInMonth = {
        labels: [],
        data: [],
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.optionsDetailInputInMonth = {
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
    $scope.searchDetailInputInMonth = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/searchDetailInputInMonth.html',
            controller: 'searchDetailInputInMonth',
            backdrop: 'static',
            size: '35',
            resolve: {
                area: function () {
                    return $scope.model.Area;
                }
            },
        });
        modalInstance.result.then(function (d) {
            resetDetailInputInMonth();
            $scope.model.Species = d.Species.Code;
            $scope.model.SpeciesName = d.Species.Name;
            $scope.model.Trademark = d.Trademark.Code;
            $scope.model.TrademarkName = d.Trademark.Name;
            $scope.model.Month = d.Month;

            for (var i = 0; i < d.Data.length; i++) {
                $scope.detailInputInMonth.labels.push(d.Data[i].CusName);
                if (d.Data[i].ImportConsump == null || d.Data[i].ImportConsump == '') {
                    $scope.detailInputInMonth.data.push(0);
                } else {
                    $scope.detailInputInMonth.data.push(d.Data[i].ImportConsump);
                }
            }
        }, function () {
        });
    }
    function loadData() {
        $scope.model = para.properties;
        for (var i = 0; i < para.data.length; i++) {
            $scope.detailInputInMonth.labels.push(para.data[i].CusName);
            if (para.data[i].ImportConsump == null || para.data[i].ImportConsump == '') {
                $scope.detailInputInMonth.data.push(0);
            } else {
                $scope.detailInputInMonth.data.push(para.data[i].ImportConsump);
            }
        }
    }
    function resetDetailInputInMonth() {
        $scope.detailInputInMonth.labels = [];
        $scope.detailInputInMonth.data = [];
    }
    $timeout(function () {
        setModalMaxHeight('.modal');
        loadData();
        setModalDraggable('.modal-dialog');
    }, 50);
});
app.controller('searchDetailInputInMonth', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $timeout, area) {
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
            dataservice.searchImportConsumpWithCustomer($scope.model.Species, $scope.model.Trademark, $scope.model.DateSearch, area, function (rs) {
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
        if (selectType == "Species" && $scope.model.Species != "") {
            $scope.errorSpecies = false;
        }
        if (selectType == "Trademark" && $scope.model.Trademark != "") {
            $scope.errorTrademark = false;
        }
    }
    function loadDate() {
        $.fn.datepicker.defaults.language = 'vi';
        $('#datesearchinputinmonthdetail').datepicker({
            format: "mm/yyyy",
            autoclose: true,
            startView: "months",
            minViewMode: "months",
        });
    }
    function filllDefaultDate() {
        var dateNow = new Date();
        //$('#datesearchinputinmonthdetail').datepicker('update', new Date());
        $('#datesearchinputinmonthdetail').datepicker('setEndDate', dateNow);
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

//proportion
app.controller('searchProportion', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $timeout) {
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
            dataservice.searchProportion($scope.model.Store, $scope.model.Area, $scope.model.DateSearch, function (rs) {
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
                        App.toastrError(caption.COM_MSG_NOT_FOUND_DATA);
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
        $('#datesearchproportion').datepicker({
            format: "mm/yyyy",
            autoclose: true,
            startView: "months",
            minViewMode: "months",
        });
    }
    function filllDefaultDate() {
        var dateNow = new Date();
        $('#datesearchproportion').datepicker('setEndDate', dateNow);
    }
    $timeout(function () {
        loadDate();
        filllDefaultDate();
        setModalDraggable('.modal-dialog');
    }, 100);
});

//proportionProductGroup
app.controller('searchProportionProductGroup', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $timeout) {
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
            dataservice.searchProportionProductGroup($scope.model.Store,$scope.model.Area, $scope.model.DateSearch, function (rs) {
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
                        App.toastrError(caption.COM_MSG_NOT_FOUND_DATA);
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
        $('#datesearchproportionproductgroup').datepicker({
            format: "mm/yyyy",
            autoclose: true,
            startView: "months",
            minViewMode: "months",
        });
    }
    function filllDefaultDate() {
        var dateNow = new Date();
        $('#datesearchproportionproductgroup').datepicker('setEndDate', dateNow);
    }
    $timeout(function () {
        loadDate();
        filllDefaultDate();
        setModalDraggable('.modal-dialog');
    }, 100);
});