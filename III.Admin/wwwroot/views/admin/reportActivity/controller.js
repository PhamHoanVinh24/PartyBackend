var ctxfolder = "/views/admin/reportActivity";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', "pascalprecht.translate", 'ngSanitize', "ngCookies"]);
app.factory('dataservice', function ($http) {
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    };
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
        getGroupDataLogger: function (callback) {
            $http.post('/Admin/ReportActivity/GetGroupDataLogger').then(callback);
        },
        getListUser: function (callback) {
            $http.post('/Admin/ReportActivity/GetListUser').then(callback);
        },
        getListCard: function (callback) {
            $http.post('/Admin/ReportActivity/GetListCard').then(callback);
        },
        reportActivity: function (data, callback) {
            $http.post('/Admin/ReportActivity/ReportActivity', data).then(callback);
        },
        exportExcel: function (data, callback) {
            $http.post('/Admin/ReportActivity/ExportExcel', data).then(callback);
        },
    };
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $filter, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;

    $rootScope.$on('$translateChangeSuccess', function () {
        $rootScope.IsTranslate = true;
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        });
        $rootScope.validationOptions = {
            rules: {
                ActionTime: {
                    required: true,
                },
            },
            messages: {
                ActionTime: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.STK_LBL_TIME),
                },
            }
        }
    });
    $rootScope.dateNow = $filter('date')(new Date(), 'dd/MM/yyyy');
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/ReportActivity/Translation');
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
app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.model = {
        Type: '',
        Group: '',
        FromDate: '',
        ToDate: '',
        UserReport: '',
        CardCode: ''
    };
    var date = new Date();
    var priorDate = new Date().setDate(date.getDate() - 30)
    $scope.model.ToDate = $filter('date')((date), 'dd/MM/yyyy')
    $scope.model.FromDate = $filter('date')((priorDate), 'dd/MM/yyyy')

    $scope.initData = function () {
        dataservice.getGroupDataLogger(function (rs) {
            rs = rs.data;
            $scope.listDataLogger = rs;
        });

        dataservice.getListUser(function (rs) {
            rs = rs.data;
            $scope.listUser = rs;
        });

        dataservice.getListCard(function (rs) {
            rs = rs.data;
            $scope.listCard = rs;
        });
    };
    $scope.initData();


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




    $scope.sum = function (isSum) {
        if (isSum === true) {
            $scope.model.Type = 'SUM';
            App.blockUI({
                target: "#contentMain",
                boxed: true,
                message: 'loading...'
            });
            dataservice.reportActivity($scope.model, function (rs) {
                rs = rs.data;
                App.unblockUI("#contentMain");

                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.listReport = rs.Object;
                }
            });
        } else {
            $scope.search();
        }
    };

    $scope.search = function () {
        $scope.model.Type = 'SEARCH';

        App.blockUI({
            target: "#contentMain",
            boxed: true,
            message: 'loading...'
        });

        dataservice.reportActivity($scope.model, function (rs) {
            rs = rs.data;

            App.unblockUI("#contentMain");

            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $scope.listReport = rs.Object;
            }
        });
    };

    $scope.export = function () {
        if ($scope.model.Type === '') {
            return App.toastrError('{{"REP_ACT_LBL_EXCEL"|translate}}');
        }

        App.blockUI({
            target: "#contentMain",
            boxed: true,
            message: 'loading...'
        });

        dataservice.exportExcel($scope.model, function (rs) {
            rs = rs.data;
            App.unblockUI("#contentMain");
            download(rs.fileName, '/' + rs.pathFile);
        });
    };

    $scope.search();

    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
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
        $('.end-date').click(function () {
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
        });
    }
    setTimeout(function () {
        loadDate();
    }, 200);
});
