var ctxfolder = "/views/mobile/dashBoardAsset/";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "ngCookies", "pascalprecht.translate"]).
    directive("filesInput", function () {
        return {
            require: "ngModel",
            link: function postLink(scope, elem, attrs, ngModel) {
                elem.on("change", function (e) {
                    var files = elem[0].files;
                    ngModel.$setViewValue(files);
                });
            }
        }
    });

app.directive('customOnChangeCustomer', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChangeCustomer);
            element.on('change', onChangeHandler);
            element.on('$destroy', function () {
                element.off();
            });
        }
    };
});

app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    return {
        getCountAsset: function (callback) {
            $http.get('/DashBoardAsset/GetCountAsset/').then(callback);
        },
        amchartAsset: function (callback) {
            $http.get('/DashBoardAsset/AmchartAsset/').then(callback);
        },
    }
});

app.controller('Ctrl_ESEIM', function ($rootScope, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        })
    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/WorkflowActivity/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
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
});

app.controller('index', function ($scope, dataservice) {
    $scope.initData = function () {
        dataservice.getCountAsset(function (rs) {
            rs = rs.data;
            $scope.sumAsset = rs.sumasset;
            $scope.assetActive = rs.assetActive;
            $scope.assetMainten = rs.assetMainten;
            $scope.assetDelete = rs.assetDelete;
            $scope.SumValueAsset = formatNumber(rs.SumValueAsset.toString());
            $scope.ValueAssetActive = formatNumber(rs.ValueAssetActive.toString());
            $scope.ValueAssetMainten = formatNumber(rs.ValueAssetMainten.toString());
            $scope.ValueAssetDelete = formatNumber(rs.ValueAssetDelete.toString());
        });

        dataservice.amchartAsset(function (rs) {
            rs = rs.data;

            monthas = [];
            sumas = ['sum'];
            activeas = ['active'];
            maintenas = ['mainten'];
            deleteas = ['delete'];
            for (var i = 0; i < rs.length; i++) {
                sumas.push(rs[i].sum);
                activeas.push(rs[i].active);
                maintenas.push(rs[i].mainten);
                deleteas.push(rs[i].cancel);
                monthas.push('Tháng ' + (rs[i].Month));
            }
            require(['c3', 'jquery'], function (c3, $) {
                $(document).ready(function () {
                    var chart = c3.generate({
                        bindto: '#chart_asset', // id of chart wrapper
                        data: {
                            columns: [
                                // each columns data
                                sumas,
                                activeas,
                                maintenas,
                                deleteas,
                            ],
                            type: 'area', // default type of chart
                            colors: {
                                'sum': tabler.colors["blue"],
                                'active': tabler.colors["pink"],
                                'mainten': tabler.colors["red"],
                                'delete': tabler.colors["yellow"],

                            },
                            names: {
                                // name of each serie
                                'sum': 'Tổng số tài sản',
                                'active': 'Số tài sản đang sử dụng',
                                'mainten': 'Số tài sản đang sửa chữa',
                                'delete': 'Số tài sản thanh lý',
                            }
                        },
                        axis: {
                            x: {
                                type: 'category',
                                // name of each category
                                categories: monthas
                            },
                        },
                        legend: {
                            show: true, //hide legend
                        },
                        padding: {
                            bottom: 0,
                            top: 0
                        },
                    });

                });
            });
        });
    }

    $scope.initData();

    function formatNumber(n) {
        // format number 1000000 to 1,234,567
        return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }
});

