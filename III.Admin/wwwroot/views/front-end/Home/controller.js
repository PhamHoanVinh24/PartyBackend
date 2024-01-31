var ctxfolder = "/views/front-end/Home";
var app = angular.module('App_ESEIM', ["ngRoute"])

app.factory('dataservice', function ($http) {
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
    return {
    }
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, dataservice) {
    
});

app.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
});

app.controller('index', function ($scope, $rootScope, $compile, dataservice, $filter, $http) {
    var listNew = document.querySelector(".list-news");
    
        $http.get("Admin/CMSVideo/GetNews")
            .then(function (response) {
                // Xử lý dữ liệu nhận được từ server
                console.log(response.data);

                var render = "";
                response.data.forEach(ele => {
                    render += `
                <div class="item">
                    <div class="wrap">
                        <a href="${ele.LinkRef}">${ele.Title}</a>
                        <p class="post-date">${ele.created_date}</p>
                    </div>
                </div>
                `;
                });

                // Sử dụng $scope để gán dữ liệu vào biến trong scope
                $scope.listNew = render;
            })
            .catch(function (error) {
                // Xử lý lỗi nếu có
                console.error("Error:", error);
            });
})