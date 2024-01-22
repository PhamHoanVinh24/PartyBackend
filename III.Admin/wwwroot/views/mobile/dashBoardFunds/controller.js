var ctxfolder = "/views/mobile/dashBoardFunds/";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "ngCookies", "pascalprecht.translate"]).

    directive("filesInput", function () {
        return {
            require: "ngModel",
            link: function postLink( elem, ngModel) {
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

app.directive('customOnChangeCardjob', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChangeCardjob);
            element.on('change', onChangeHandler);
            element.on('$destroy', function () {
                element.off();
            });

        }
    };
});

app.filter("fomartDateTime", function ($filter) {
    return function (date) {
        var dateNow = $filter('date')(new Date(), 'dd/MM/yyyy');
        var createDate = $filter('date')(new Date(date), 'dd/MM/yyyy');
        if (dateNow == createDate) {
            var today = new Date();
            var created = new Date(date);
            var diffMs = (today - created);
            var diffHrs = Math.floor((diffMs % 86400000) / 3600000);
            var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
            if (diffHrs <= 0) {
                if (diffMins <= 0) {
                    return 'Vừa xong';
                } else {
                    return diffMins + ' phút trước';
                }
            } else {
                return diffHrs + ' giờ ' + diffMins + ' phút trước.';
            }
        } else {
            return $filter('date')(new Date(date), 'dd/MM/yyyy lúc h:mma');
        }
    }
});

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
    var submitFormUpload1 = function (url, data, callback) {
        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            beforeSend: function () {
                App.blockUI({
                    target: "#modal-body",
                    boxed: true,
                    message: 'loading...'
                });
            },
            complete: function () {
                App.unblockUI("#modal-body");
            },
            data: data
        }
        $http(req).then(callback);
    };
    return {
        getCountProject: function (callback) {
            $http.get('/DashBoardBuyer/GetCountProject').then(callback);
        },
        amchartCountBuy: function (callback) {
            $http.get('/DashBoardBuyer/AmchartCountBuy').then(callback);
        },
        amchartCountSale: function (callback) {
            $http.get('/DashBoardBuyer/AmchartCountSale').then(callback);
        },
        amchartWorkFlow: function (callback) {
            $http.get('/DashBoardBuyer/AmchartWorkFlow/').then(callback);
        },
        AmchartPieSale: function (data, callback) {
            $http.post('/DashBoardBuyer/AmchartPieSale/', data).then(callback);
        },
        AmchartCountCustomers: function (callback) {
            $http.post('/DashBoardBuyer/AmchartCountCustomers').then(callback);
        },
        AmchartCountSupplier: function (callback) {
            $http.post('/DashBoardBuyer/AmchartCountSupplier').then(callback);
        },
        AmchartPieCustomers: function (data, callback) {
            $http.post('/DashBoardBuyer/AmchartPieCustomers/', data).then(callback);
        },
        AmchartPieSupplier: function (data, callback) {
            $http.post('/DashBoardBuyer/AmchartPieSupplier/', data).then(callback);
        },
        AmchartCountProject: function (callback) {
            $http.post('/DashBoardBuyer/AmchartCountProject').then(callback);
        },
        AmchartPieProject: function (data, callback) {
            $http.post('/DashBoardBuyer/AmchartPieProject/', data).then(callback);
        },
        AmchartCountEmployees: function (callback) {
            $http.post('/DashBoardBuyer/AmchartCountEmployees').then(callback);
        },
        getWorkFlow: function (callback) {
            $http.post('/DashBoardBuyer/GetWorkFlow').then(callback);
        },
        getCardInBoard: function (data, callback) {
            $http.post('/DashBoardBuyer/GetCardInBoard?ObjCode=' + data).then(callback);
        },
        getSystemLog: function (data, callback) {
            $http.get('/DashBoardBuyer/GetSystemLog?type=' + data).then(callback);
        },
        getStaffKeeping: function (data, callback) {
            $http.post('/MapOnline/GetStaffKeeping/', data).then(callback);
        },
        getObjTypeJC: function (callback) {
            $http.get('/DashBoardBuyer/GetObjTypeJC').then(callback);
        },
        getObjTypeCode: function (data, callback) {
            $http.post('/Admin/CardJob/GetObjFromObjType?code=' + data).then(callback);
        },
        highchartFunds: function (callback) {
            $http.post('/DashBoardBuyer/HighchartFunds').then(callback);
        },
        highchartProds: function (callback) {
            $http.post('/DashBoardBuyer/HighchartProds').then(callback);
        },
        highchartAssets: function (data, callback) {
            $http.post('/DashBoardBuyer/highchartAssets', data).then(callback);
        },
        highchartPieAssets: function (data, callback) {
            $http.post('/DashBoardBuyer/GetAssetType', data).then(callback);
        },
        getAssetType: function (callback) {
            $http.post('/Admin/Asset/GetAssetType').then(callback);
        },
        getDepartment: function (callback) {
            $http.post('/Admin/User/GetDepartment/').then(callback);
        },
        getGroupUser: function (callback) {
            $http.post('/Admin/User/GetGroupUser/').then(callback);
        },
        getUser: function (callback) {
            $http.post('/Admin/User/GetListUser/').then(callback);
        },
        getRouteInOut: function (data, callback) {
            $http.post('/DashBoardBuyer/GetRouteInOut/', data).then(callback);
        },
        getCmsItemLastest: function (callback) {
            $http.get('/DashBoardBuyer/GetCmsItemLastest/').then(callback);
        },
        viewFileCms: function (data, data1, callback) {
            $http.post('/DashBoardBuyer/ViewFileCms?mode=' + data + '&url=' + data1).then(callback);
        },
        amchartProject: function (callback) {
            $http.get('/DashBoardBuyer/AmchartProject/').then(callback);
        },
        getCountCardWork: function (callback) {
            $http.get('/DashBoardBuyer/GetCountCardWork/').then(callback);
        },
        getActionCardWork: function (callback) {
            $http.get('/DashBoardBuyer/GetActionCardWork/').then(callback);
        },
        amchartCardWork: function (callback) {
            $http.get('/DashBoardBuyer/AmchartCardWork/').then(callback);
        },
        getCountSale: function (callback) {
            $http.get('/DashBoardBuyer/GetCountSale/').then(callback);
        },
        getCountBuyer: function (callback) {
            $http.get('/DashBoardBuyer/GetCountBuyer/').then(callback);
        },
        getActionUser: function (callback) {
            $http.get('/DashBoardBuyer/GetActionUser/').then(callback);
        },
        getBranAndDepartment: function (callback) {
            $http.get('/DashBoardBuyer/GetBranAndDepartment/').then(callback);
        },
        countAction: function (callback) {
            $http.get('/DashBoardBuyer/CountAction/').then(callback);
        },
        getCountWorkFlow: function (callback) {
            $http.get('/DashBoardBuyer/GetCountWorkFlow/').then(callback);
        },
        getCountAsset: function (callback) {
            $http.get('/DashBoardBuyer/GetCountAsset/').then(callback);
        },
        amchartAsset: function (callback) {
            $http.get('/DashBoardBuyer/AmchartAsset/').then(callback);
        },
        getGroupUser: function (callback) {
            $http.get('/DashBoardBuyer/GetGroupUser/').then(callback);
        },
        getActionUserGroup: function (callback) {
            $http.get('/DashBoardBuyer/GetActionUserGroup/').then(callback);
        },
        getCountFunds: function (callback) {
            $http.get('/DashBoardBuyer/GetCountFunds/').then(callback);
        },
        getActionFunds: function (callback) {
            $http.get('/DashBoardBuyer/GetActionFunds/').then(callback);
        },
        amchartFunds: function (callback) {
            $http.get('/DashBoardBuyer/AmchartFunds/').then(callback);
        },
        
    }
});

app.controller('Ctrl_ESEIM', function ( $rootScope,  $cookies, $translate) {
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
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^!@#$%^&*<>?\s]*$/;
            var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.AssetCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.ASSET_VALIDATE_ITEM_CODE.replace("{0}", caption.ASSET_CURD_LBL_ASSET_CODE), "<br/>");//"Mã tài sản bao gồm chữ cái và số"
            }
            if (!partternName.test(data.AssetName)) {
                mess.Status = true;
                mess.Title += caption.ASSET_VALIDATE_ASSET_NAME.replace("{0}", caption.ASSET_CURD_LBL_ASSET_NAME)//"Yêu cầu tên tài sản có ít nhất một ký tự là chữ cái hoặc số và không bao gồm ký tự đặc biệt!"
            }
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                WorkFlowCode: {
                    required: true,
                    maxlength: 100
                },
                Name: {
                    required: true,
                    maxlength: 100
                },
            },
            messages: {
                WorkFlowCode: {
                    required: caption.ACT_VALIDATE_ACTIVITY_CODE_NOT_NULL,
                    maxlength: caption.ACT_VALIDATE_ACTIVITY_CODE_SIZE
                },
                Name: {
                    required: caption.ACT_VALIDATE_ACTIVITY_NAME_NOT_NULL,
                    maxlength: caption.ACT_VALIDATE_ACTIVITY_NAME_SIZE
                },
            }
        }

        $rootScope.validationOptionsWF = {
            rules: {
                WfCode: {
                    required: true
                },
                WfName: {
                    required: true
                },
            },
            messages: {
                WfCode: {
                    required: "Mã luồng không được bỏ trống",
                },
                WfName: {
                    required: "Tên luồng không được bỏ trống",
                },
            }
        }
        $rootScope.validationOptionsCardLogger = {
            rules: {
                DtCode: {
                    required: true,
                },
                DtTitle: {
                    required: true,
                }
            },
            messages: {
                DtCode: {
                    required: "Mã thuộc tính không được bỏ trống"
                },
                DtTitle: {
                    required: "Tên thuộc tính không được bỏ trống",
                }
            }
        }
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
        .when('/map', {
            templateUrl: ctxfolder + '/google-map.html',
            controller: 'google-map'
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
        dataservice.getCountFunds(function (rs) {
            rs = rs.data;
            $scope.SumMoneyGive = rs.SumMoneyGive;
            $scope.SumMoneyPay = rs.SumMoneyPay;
            $scope.SumMoneyNeedGive = rs.SumMoneyNeedGive;
            $scope.SumMoneyNeedPay = rs.SumMoneyNeedPay;

        });
        dataservice.getActionFunds(function (rs) {
            rs = rs.data;
            $scope.lstActFun = rs;
        })
        dataservice.amchartFunds(function (rs) {
            rs = rs.data;
            monthfun = [];
            givefun = ['give'];
            payfun = ['pay'];
            for (var i = 0; i < rs.length; i++) {
                givefun.push(rs[i].give);
                payfun.push(rs[i].pay);
                monthfun.push('Tháng ' + (rs[i].Month));
            }
            require(['c3', 'jquery'], function (c3, $) {
                $(document).ready(function () {
                    var chart = c3.generate({
                        bindto: '#chart_funds', // id of chart wrapper
                        data: {
                            columns: [
                                // each columns data
                                givefun,
                                payfun,
                            ],
                            type: 'area', // default type of chart
                            colors: {
                                'give': tabler.colors["blue"],
                                'pay': tabler.colors["red"],

                            },
                            names: {
                                // name of each serie
                                'give': 'Tổng thu',
                                'pay': 'Tổng chi',
                            }
                        },
                        axis: {
                            x: {
                                type: 'category',
                                // name of each category
                                categories: monthfun
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


        })









    }
    $scope.initData();
    function formatNumber(n) {
        // format number 1000000 to 1,234,567
        return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }

    
    

        

});

