var ctxfolder = "/views/front-end/userManual";
var ctxfolderMessage = "/views/message-box";
var ctxfolderFilePlugin = "/views/admin/filePlugin";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);

app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        getListCMS: function (data, callback) {
            $http.post('/UserManualFrontEnd/GetListCMS?title=' + data).then(callback);
        },
        getContentCms: function (data, callback) {
            $http.get('/UserManualFrontEnd/GetContentCms?id=' + data).then(callback);
        }
    }
});

app.factory('httpResponseInterceptor', ['$q', '$rootScope', '$location', function ($q, $rootScope, $location) {
    return {
        responseError: function (rejection) {
            if (rejection.status === 401) {
                var url = "/Home/Logout";
                location.href = url;
            }
            return $q.reject(rejection);
        }
    };
}]);

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, $confirm, DTColumnBuilder, DTInstances, $cookies, $translate, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'en-US';
    $translate.use(culture);

    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.VALIDATE_VALUE_MIN,
        });
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9_äöüÄÖÜ]*$/;
            var partternName = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9\[\]]+[^!@#$%^&*<>?]*$/; //Có chứa được khoảng trắng
            var partternDescription = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]*[^!@#$%^&*<>?]*$/; //Có thể null, và có chứa được khoảng trắng
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.FunctionCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.COM_VALIDATE_ITEM_CODE.replace('{0}', caption.ADM_FUNC_CURD_LBL_FUNC_CODE), "<br/>");
            }
            if (!partternName.test(data.Title)) {
                mess.Status = true;
                mess.Title += " - " + caption.COM_VALIDATE_ITEM_NAME.replace('{0}', caption.ADM_FUNC_CURD_LBL_FUNC_NAME) + "<br/>";
            }
            if (!partternDescription.test(data.Description)) {
                mess.Status = true;
                mess.Title += " - " + caption.COM_VALIDATE_ITEM.replace('{0}', caption.ADM_FUNC_LIST_COL_FUNC_DESCRIPTION) + "<br/>";
            }
            return mess;
        }
    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/UserManualFrontEnd/Translation');
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
    $httpProvider.interceptors.push('httpResponseInterceptor');
});

app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, $window, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $(".content-wrapper").removeClass("padding-right-60");
    $("#nav-right").addClass("hidden");
    $scope.listCms = [];
    $scope.markId = 0;

    $scope.model = {
        Title: ''
    }

    $scope.initData = function () {
        dataservice.getListCMS($scope.model.Title, function (rs) {
            rs = rs.data;
            $scope.listCms = rs;
            for (var i = 0; i < $scope.listCms.length; i++) {
                $scope.listCms[i].IsExpand = false;

                for (var j = 0; j < $scope.listCms[i].ListCmsItem.length; j++) {
                    if ($scope.listCms[i].Level == 0) {
                        $scope.listCms[i].ListCmsItem[j].IsShow = true;
                    } else {
                        $scope.listCms[i].ListCmsItem[j].IsShow = false;
                    }
                }
            }
        })
    }
    $scope.initData();

    $scope.expand = function (item) {
        item.IsExpand = !item.IsExpand;
        for (var j = 0; j < item.ListCmsItem.length; j++) {
            if (item.Level == 0) {
                item.ListCmsItem[j].IsShow = true;
            } else {
                item.ListCmsItem[j].IsShow = item.IsExpand;
            }
        }
    }

    $scope.search = function () {
        dataservice.getListCMS($scope.model.Title, function (rs) {
            rs = rs.data;
            $scope.listCms = rs;
        })
    }

    $scope.viewContent = function (id, idCat) {
        debugger
        $scope.markId = id;
        App.blockUI({
            target: "#contentMain",
            boxed: true,
            message: 'loading...'
        });
        dataservice.getContentCms(id, function (rs) {
            rs = rs.data;
            $('#viewContent').html(rs);
            App.unblockUI("#contentMain");
        })
    }

    $scope.backMobile = function () {
        $(".nav-left").addClass('nav-left-full');
        $(".nav-right").addClass('nav-right-hide');
    }
});
