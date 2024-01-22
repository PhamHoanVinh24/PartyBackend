var ctxfolder = "/views/admin/edmsReport";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'chart.js']);
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
app.controller('index', function ($scope, $rootScope, $compile, dataservice, $timeout) {
    //1. Biểu đồ số thùng trong kho
    $scope.labelsBarrelsInStock = ["1", "2", "3", "4", "5", "6", "7"];
    $scope.dataBarrelsInStock = [
        [10, 30, 45, 50, 60, 65, 80],
        [0, 0, 0, 0, 0, 0, 0]
    ];
    //2. Số thùng hồ sơ
    $scope.labelsBox = ["1", "2", "3", "4", "5", "6", "7"];
    $scope.dataBox = [
        [80, 60, 50, 45, 30, 20, 10],
        [0, 0, 0, 0, 0, 0, 0]
    ];
    //3. Số lượng trống có thể nhập kho tổng/sâu
    $scope.labelsWareHouseEmpty = ["1", "2", "3", "4", "5", "6", "7"];
    $scope.dataWareHouseEmpty = [
        [65, 59, 80, 81, 56, 55, 40],
        [28, 48, 40, 19, 86, 27, 90]
    ];
    
    //4. Yêu cầu gửu HSTL nhập kho
    $scope.seriesRequest = ['Thùng TC', 'Thùng rỗng'];
    $scope.labelsRequest = ["1", "2", "3", "4", "5", "6", "7"];
    $scope.dataRequest = [
        [0,450, 550],
        [0,300, 400]
    ];
    $scope.optionsRequest = { legend: { display: true } };

    //5. Chi nhánh
    $scope.labelsBranch = ["Nghệ An", "Thanh Hóa", "Thái Bình", "Hội Sở", "Sài Gòn", "Hà Nội"];
    $scope.dataBranch = [
        [10, 20, 80 ,110 , 70 ,60],
        [0,    0,  0, 0 , 0 ,0]
    ];
    //6. Hình tròn
    $scope.labelsRound = ["Nghệ An", "Thanh Hóa", "Thái Bình", "Hội Sở", "Sài Gòn", "Hà Nội"];
    $scope.dataRound = [200, 100, 300,100,200,100];
});




