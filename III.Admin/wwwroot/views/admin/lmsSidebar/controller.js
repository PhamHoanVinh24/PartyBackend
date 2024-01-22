var ctxfolder = "/views/admin/contractHome";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM_LMS_LEFTSIDEBAR', ["App_ESEIM_LMS_DASHBOARD", "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ng.jsoneditor', 'dynamicNumber']);

app.directive('loadUrl', function ($http, $compile, $timeout) {
    return {
        link: function (scope, element, attrs) {
            var url = "/lib/eduComposeEngine/index.html";
            scope.$watch($parse(attrs.loadUrl), function (newval) {
                if (newval === true) {
                    $timeout(function() {
                        $http.get(url).then(function (response) {
                            var data = response.data;
                            var contents = angular.element("<div>").html(data);
                            var elementRef = document.getElementById('eduComposeEngine');
                            console.log(elementRef);
                            //var shadow = elementRef.attachShadow({ mode: 'open' });
                            //angular.element("#eduComposeEngine").empty().append(contents);
                        });
                    });
                } 
            });
        }
    }
});

app.controller('Ctrl_ESEIM_Lms_LeftSidebar', function ($scope, $rootScope, $compile, $uibModal, $cookies, $translate) {

});