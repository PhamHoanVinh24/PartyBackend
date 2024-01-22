var ctxfolderLuceneManager = "/views/admin/luceneManager";
var ctxfolderLuceneManagerMessage = "/views/message-box";
var ctxfolderLuceneManagerFileShare = "/views/admin/fileObjectShare";
var ctxfolderLuceneManagerCommonSetting = "/views/admin/commonSetting";

var app = angular.module('App_ESEIM_Lucene_Manager', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber']);
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
app.factory('dataserviceLuceneManager', function ($http) {
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
        start: function (callback) {
            $http.post('/Admin/LucenceManager/StartRebuildIndex').then(callback);
        },
        stop: function (callback) {
            $http.post('/Admin/LucenceManager/StopRebuildIndex').then(callback);
        },
        restart: function (callback) {
            $http.post('/Admin/LucenceManager/RestartRebuildIndex').then(callback);
        },
        getStatus: function (callback) {
            $http.post('/Admin/LucenceManager/GetStatus').then(callback);
        },
    };
});
app.controller('Ctrl_ESEIM_Lucene_Manager', function ($scope, $rootScope, $cookies, $translate, dataserviceLuceneManager, $filter) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        $rootScope.IsTranslate = true;
        captionTm = captionTm[culture];
        $.extend($.validator.messages, {
            min: captionTm.COM_VALIDATE_VALUE_MIN,
        });
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^đĐ!@#$%^&*<>?\s]*$/g;
            var partternTelephone = /[0-9]/g;
            var partternVersion = /^\d+(\.\d+)*$/g;
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.ContractCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", captionTm.COM_VALIDATE_ITEM_CODE.replace("{0}", captionTm.CONTRACT_CURD_LBL_CONTRACT_CODE), "<br/>");//"Mã hợp đồng không chứa ký tự đặc biệt hoặc khoảng trắng!"
            }
            if (!partternVersion.test(data.Version) && data.Version != null) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", "Phiên bản nhập không đúng", "<br/>");//"Phiên bản phải là chữ số!"
            }
            return mess;
        }
    });
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/LucenceManager/Translation');
    captionTm = $translateProvider.translations();

    $routeProvider
        .when('/', {
            templateUrl: ctxfolderLuceneManager + '/index.html',
            controller: 'indexLuceneManager'
        })
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
app.controller('indexLuceneManager', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceLuceneManager, $window, $filter) {
    var vm = $scope;
    $scope.isWorking = false;
    $scope.progress = '0%';
    $scope.style = { 'width': '0%' };
    $scope.status = 'Đang kiểm tra';
    $scope.getStatus = function() {
        dataserviceLuceneManager.getStatus(function (rs) {
            rs = rs.data;
            console.log(rs);
            $scope.status = rs;
        })
    }
    $scope.init = function () {
        $scope.getStatus();
    }
    $scope.init();
    $scope.start = function () {
        dataserviceLuceneManager.start(function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
                $scope.progress = '0%';
                $scope.style.width = '0%';
            } else {
                App.toastrSuccess(rs.Title);
                $scope.isWorking = true;
                $scope.progress = '99%';
                $scope.style.width = '99%';
            }
        });
    }
    $scope.stop = function () {
        dataserviceLuceneManager.stop(function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
                $scope.progress = '0%';
                $scope.style.width = '0%';
            } else {
                App.toastrSuccess(rs.Title);
                $scope.isWorking = false;
                $scope.progress = '0%';
                $scope.style.width = '0%';
            }
        });
    }
    $scope.restart = function () {
        dataserviceLuceneManager.restart(function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
                $scope.progress = '0%';
                $scope.style.width = '0%';
            } else {
                App.toastrSuccess(rs.Title);
                $scope.progress = '0%';
                $scope.style.width = '0%';
            }
        });
    }
});
